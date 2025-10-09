function bind_onclick_btn() {
  let buttons = Array.from(document.querySelectorAll('buttonlink'));
  buttons.forEach(function (button) {
    let href = button.getAttribute('href');
    // Add role and tabindex for accessibility
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');
    
    const clickHandler = function () {
      if (href == null) return;
      window.open(href);
    };
    
    button.addEventListener('click', clickHandler);
    
    // Add keyboard support
    button.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') {
        ev.preventDefault();
        clickHandler();
      }
    });
  });
}
function load_switch_language_btn(current_language) {
  let button = document.getElementById('switch-language-button');
  let title = document.querySelector('nav a');
  if (button == null) return;
  if (title == null) return;
  let path = window.location.pathname;
  if (current_language == 'en') {
    button.innerHTML = "中文";
    button.setAttribute('href', path.replace(/\/en(.*?)$/g, "$1"));
    title.href = "/en/";
  }
  else if (current_language == 'zh_CN') {
    button.innerHTML = "English";
    button.setAttribute('href', '/en' + path);
    title.href = "/";
  }
}

function toggle_hamburger_menu() {
  const nav_links = document.getElementById('nav-links');
  const hamburger = document.querySelector('.hamburger');
  const isExpanded = nav_links.classList.contains('active');
  nav_links.classList.toggle('active');
  hamburger.classList.toggle('active');
  hamburger.setAttribute('aria-expanded', !isExpanded);
}

function initHeroCardsAnimation() {
  const cards = document.querySelectorAll('.hero-card');
  if (!('IntersectionObserver' in window) || cards.length === 0) {
    // Fallback: show all
    cards.forEach(c => c.classList.add('in-view'));
    return;
  }

  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('in-view'), entry.target.dataset.delay || (idx * 100));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  cards.forEach((c, i) => {
    c.dataset.delay = i * 120;
    io.observe(c);
  });
}

function load_ui_toggle_btn(current_language) {
  const btn = document.getElementById('ui-toggle-button');
  if (!btn) return;
  // Client-side toggle: toggle body.legacy class and persist preference
  const applyState = (state) => {
    if (state === 'old') {
      document.body.classList.add('legacy');
      // show label for switching back to new UI
      btn.innerText = btn.dataset.labelNew || ((current_language === 'en') ? 'New UI' : '新版界面');
      btn.dataset.state = 'old';
      btn.setAttribute('aria-pressed', 'true');
    } else {
      document.body.classList.remove('legacy');
      // show label for opening old UI
      btn.innerText = btn.dataset.labelOld || ((current_language === 'en') ? 'Old UI' : '旧界面');
      btn.dataset.state = 'new';
      btn.setAttribute('aria-pressed', 'false');
    }
    try { localStorage.setItem('kcisec_ui', state); } catch (e) {}
  };

  // Initialize from storage or default to new
  const pref = (function(){ try { return localStorage.getItem('kcisec_ui'); } catch(e){ return null; } })();
  applyState(pref === 'old' ? 'old' : 'new');

  // Ensure button is focusable and supports keyboard activation
  btn.setAttribute('tabindex', '0');

  const toggleHandler = function () {
    const cur = btn.dataset.state === 'old' ? 'old' : 'new';
    const next = cur === 'old' ? 'new' : 'old';
    applyState(next);
  };

  btn.addEventListener('click', toggleHandler);
  btn.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') {
      ev.preventDefault();
      toggleHandler();
    }
  });
}

function initHeroAutoHide() {
  const hero = document.querySelector('.hero-section');
  const toggle = document.getElementById('hero-toggle');
  if (!hero || !toggle) return;

  const COLLAPSE_KEY = 'kcisec_hero';
  const viewportCollapse = () => (window.innerHeight || document.documentElement.clientHeight) < 700;

  const applyCollapsed = (collapsed) => {
    if (collapsed) {
      hero.classList.add('collapsed');
      toggle.setAttribute('aria-expanded', 'false');
    } else {
      hero.classList.remove('collapsed');
      toggle.setAttribute('aria-expanded', 'true');
    }
    try { localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0'); } catch(e){}
  };

  // Init from stored user preference, else viewport heuristic
  let stored = null;
  try { stored = localStorage.getItem(COLLAPSE_KEY); } catch(e) { stored = null; }
  // userSetPreference indicates whether the user explicitly set collapse/expand before
  let userSetPreference = (stored !== null);
  if (stored === '1') applyCollapsed(true);
  else if (stored === '0') applyCollapsed(false);
  else applyCollapsed(viewportCollapse());

  // Toggle by button
  toggle.addEventListener('click', function () {
    const cur = hero.classList.contains('collapsed');
    applyCollapsed(!cur);
    // mark that user explicitly set preference so auto-behaviour won't override
    userSetPreference = true;
  });
  toggle.setAttribute('tabindex', '0');
  toggle.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') {
      ev.preventDefault();
      toggle.click();
    }
  });

  // Scroll behaviour: collapse on scroll down, expand on scroll up
  let lastScroll = window.scrollY || window.pageYOffset;
  let ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      const current = window.scrollY || window.pageYOffset;
      const delta = current - lastScroll;
      // Only auto-change on scroll if user hasn't set an explicit preference
      if (!userSetPreference) {
        // If user scrolled down more than 80px and page scrolled past 100px, collapse
        if (delta > 80 && current > 100) {
          applyCollapsed(true);
        } else if (delta < -40) {
          applyCollapsed(false);
        }
      }
      lastScroll = current;
      ticking = false;
    });
  }, { passive: true });

  // Re-evaluate on resize
  window.addEventListener('resize', function () {
    if (!userSetPreference) { // only auto-change if user hasn't expressed preference
      applyCollapsed(viewportCollapse());
    }
  });
}

/* idadwind 2025-02-11 */
