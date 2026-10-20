const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const read = (file) => readFileSync(path.join(__dirname, '..', file), 'utf8');
function element(attrs = {}) {
  const classes = new Set();
  const listeners = {};
  return {
    attrs, listeners, dataset: {},
    classList: { toggle(name, on) { on ? classes.add(name) : classes.delete(name); }, contains: (name) => classes.has(name) },
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
  press(1, 'End'); selected(3); assert.equal(tabs[3].focused, true);
  press(3, 'ArrowRight'); selected(0);
  press(0, 'ArrowLeft'); selected(3);
  press(3, 'Home'); selected(0);
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
