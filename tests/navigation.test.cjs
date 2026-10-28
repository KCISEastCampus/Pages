const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const read = (file) => readFileSync(path.join(__dirname, '..', file), 'utf8');

test('404 back link falls back to its home URL without history and uses back when available', () => {
  const template = read('_layouts/404.html');
  assert.match(template, /href="\/" class="error-btn" id="error-back"/);
  const script = template.match(/<script id="error-navigation">([\s\S]*?)<\/script>/)[1];
  for (const [length, referrer, shouldGoBack] of [
    [1, '', false],
    [2, '', false],
    [2, 'https://other.example/', false],
    [2, 'https://campus.example/old/', true],
  ]) {
    let click;
    let prevented = false;
    let wentBack = false;
    vm.runInNewContext(script, {
      document: { referrer, getElementById: () => ({ addEventListener(type, callback) { click = callback; } }) },
      window: { location: { origin: 'https://campus.example' }, history: { length, back() { wentBack = true; } } },
      URL,
    });
    click({ preventDefault() { prevented = true; } });
    assert.equal(prevented, shouldGoBack);
    assert.equal(wentBack, shouldGoBack);
  }
});
function element(attrs = {}) {
  const classes = new Set();
  const listeners = {};
  return {
    attrs, listeners, dataset: {},
    classList: {
      toggle(name, on) { on ? classes.add(name) : classes.delete(name); },
      add: (name) => classes.add(name), remove: (name) => classes.delete(name),
      contains: (name) => classes.has(name),
    },
    setAttribute(name, value) { attrs[name] = value; },
    getAttribute(name) { return attrs[name] ?? null; },
    addEventListener(name, fn) { listeners[name] = fn; },
    focus() { this.focused = true; },
  };
}

test('mobile navigation closes on Escape, outside click and breakpoint change', () => {
  const menu = element({ 'aria-expanded': 'false' });
  const links = element();
  const document = element();
  const viewport = element();
  menu.closest = () => ({ contains: (target) => target === menu || target === links });
  document.querySelector = () => menu;
  document.getElementById = () => links;
  const context = vm.createContext({ document, window: { matchMedia: () => viewport } });
  vm.runInContext(read('assets/js/main.js'), context);
  context.initNavigation();

  menu.listeners.click();
  assert.equal(menu.getAttribute('aria-expanded'), 'true');
  document.listeners.click({ target: links });
  assert.equal(links.classList.contains('active'), true);
  document.listeners.keydown({ key: 'Escape' });
  assert.equal(menu.getAttribute('aria-expanded'), 'false');
  assert.equal(links.classList.contains('active'), false);
  assert.equal(menu.focused, true);

  menu.listeners.click();
  document.listeners.click({ target: {} });
  assert.equal(menu.getAttribute('aria-expanded'), 'false');
  menu.listeners.click();
  viewport.listeners.change();
  assert.equal(links.classList.contains('active'), false);
  menu.listeners.click();
  links.listeners.click({ target: { closest: () => ({}) } });
  assert.equal(menu.getAttribute('aria-expanded'), 'false');
});

test('chess tabs expose one selected panel and support arrow wrapping, Home and End', () => {
  const names = ['overview', 'schedule', 'rankings', 'rules'];
  const tabs = names.map((name) => element({ 'data-tab': name }));
  const panels = names.map((name) => ({ ...element(), id: `panel-${name}` }));
  const root = { querySelectorAll: (selector) => selector === '.chess-tab' ? tabs : panels };
  const document = { readyState: 'loading', addEventListener() {} };
  const window = {};
  const source = read('assets/js/chess.js').replace(/\}\)\(\);\s*$/, 'window.testTabs = initTabs; })();');
  vm.runInNewContext(source, { window, document });
  window.testTabs(root);
  const selected = (index) => {
    tabs.forEach((tab, i) => {
      assert.equal(tab.getAttribute('aria-selected'), String(i === index));
      assert.equal(tab.tabIndex, i === index ? 0 : -1);
      assert.equal(panels[i].hidden, i !== index);
    });
  };
  const press = (index, key) => {
    let prevented = false;
    tabs[index].listeners.keydown({ key, preventDefault() { prevented = true; } });
    assert.equal(prevented, true);
  };
  tabs[1].listeners.click();
  selected(1);
  for (const modifier of ['ctrlKey', 'altKey', 'metaKey', 'shiftKey']) {
    tabs[1].listeners.keydown({ key: 'Home', [modifier]: true, preventDefault() { assert.fail('Browser shortcut was intercepted'); } });
    selected(1);
  }
  press(1, 'End'); selected(3); assert.equal(tabs[3].focused, true);
  press(3, 'ArrowRight'); selected(0);
  press(0, 'ArrowLeft'); selected(3);
  press(3, 'Home'); selected(0);
});

test('portal theme names the next action in both languages and tolerates unavailable storage', () => {
  for (const language of ['zh', 'en']) {
    for (const blocked of [false, true]) {
      const html = element({ 'data-bs-theme': 'dark' });
      const button = element(), icon = element(), label = element();
      button.dataset = language === 'zh'
        ? { darkLabel: '深色', lightLabel: '浅色', darkAction: '切换为深色模式', lightAction: '切换为浅色模式' }
        : { darkLabel: 'Dark', lightLabel: 'Light', darkAction: 'Switch to dark mode', lightAction: 'Switch to light mode' };
      button.querySelector = (selector) => selector === 'i' ? icon : label;
      const document = { ...element(), documentElement: html, getElementById: () => button };
      let saved;
      const localStorage = { setItem(key, value) {
        assert.equal(key, 'site-theme');
        if (blocked) throw new Error('Storage denied');
        saved = value;
      } };
      const context = vm.createContext({ document, localStorage });
      vm.runInContext(read('assets/js/main.js'), context);
      context.init_theme_toggle_btn();
      assert.equal(label.textContent, button.dataset.lightLabel);
      assert.equal(button.getAttribute('aria-label'), button.dataset.lightAction);
      assert.equal(icon.classList.contains('fa-sun'), true);
      button.listeners.click();
      assert.equal(html.getAttribute('data-bs-theme'), 'light');
      assert.equal(label.textContent, button.dataset.darkLabel);
      assert.equal(button.getAttribute('aria-label'), button.dataset.darkAction);
      assert.equal(button.getAttribute('title'), button.dataset.darkAction);
      assert.equal(icon.classList.contains('fa-moon'), true);
      assert.equal(saved, blocked ? undefined : 'light');
    }
  }
});

test('chess theme uses the same next-action labels and saves the selected theme', () => {
  const html = element({ 'data-bs-theme': 'light' });
  const button = element();
  const document = { readyState: 'loading', addEventListener() {}, documentElement: html };
  const window = {};
  let saved;
  const source = read('assets/js/chess.js').replace(/\}\)\(\);\s*$/, 'window.testTheme = initThemeSync; })();');
  vm.runInNewContext(source, {
    window, document,
    localStorage: { setItem(key, value) { assert.equal(key, 'site-theme'); saved = value; } },
    MutationObserver: class { observe() {} },
  });
  window.testTheme({ querySelector: () => button });
  assert.equal(button.getAttribute('aria-label'), '切换为深色模式');
  button.listeners.click();
  assert.equal(html.getAttribute('data-bs-theme'), 'dark');
  assert.equal(button.textContent, '☀️ 浅色');
  assert.equal(button.getAttribute('aria-label'), '切换为浅色模式');
  assert.equal(saved, 'dark');
});

test('back-to-top uses the page language and rechecks reduced motion on click', () => {
  let reduced = true;
  let scrolled;
  const button = element();
  const document = {
    ...element(), documentElement: { lang: 'en', scrollHeight: 2000 },
    createElement: () => button, body: { appendChild() {} },
  };
  const window = {
    innerHeight: 800, scrollY: 400, addEventListener() {},
    matchMedia: () => ({ matches: reduced }), scrollTo(options) { scrolled = options; },
  };
  const context = vm.createContext({ document, window });
  vm.runInContext(read('assets/js/main.js'), context);
  context.initScrollToTop();
  assert.equal(button.getAttribute('aria-label'), 'Back to top');
  assert.equal(button.classList.contains('visible'), true);
  button.listeners.click(); assert.equal(scrolled.behavior, 'instant');
  reduced = false;
  button.listeners.click(); assert.equal(scrolled.behavior, 'smooth');
});
