// Helper function to add keyboard support to clickable elements
function addKeyboardSupport(element, handler) {
  element.setAttribute('tabindex', '0');
  element.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') {
      ev.preventDefault();
      handler();
    }
  });
}

// Helper functions for localStorage with error handling
function getLocalStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

function setLocalStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    // Silently fail if localStorage is unavailable
  }
}

function bind_onclick_btn() {
  let buttons = Array.from(document.querySelectorAll('buttonlink'));
  buttons.forEach(function (button) {
    let href = button.getAttribute('href');
    // Add role and tabindex for accessibility
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');
    
    const clickHandler = function () {
      if (href == null) return;
      
    button.addEventListener('click', function () {
      if (href === null) return;
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
  if (button === null) return;
  if (title === null) return;
  let path = window.location.pathname;
  if (current_language === 'en') {
    button.innerHTML = "中文";
    button.setAttribute('href', path.replace(/\/en(.*?)$/g, "$1"));
    title.href = "/en/";
  }
  else if (current_language === 'zh_CN') {
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
    cards.forEach(card => card.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('in-view'), entry.target.dataset.delay || (index * 100));
        observerInstance.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  cards.forEach((card, i) => {
    card.dataset.delay = i * 120;
    observer.observe(card);
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
    setLocalStorage('kcisec_ui', state);
  };

  // Initialize from storage or default to new
  const pref = getLocalStorage('kcisec_ui');
  applyState(pref === 'old' ? 'old' : 'new');

  const toggleHandler = function () {
    const cur = btn.dataset.state === 'old' ? 'old' : 'new';
    const next = cur === 'old' ? 'new' : 'old';
    applyState(next);
  };

  btn.addEventListener('click', toggleHandler);
  addKeyboardSupport(btn, toggleHandler);
}

function initHeroAutoHide() {
  const hero = document.querySelector('.hero-section');
  const toggle = document.getElementById('hero-toggle');
  if (!hero || !toggle) return;

  // Constants for hero collapse behavior
  const COLLAPSE_KEY = 'kcisec_hero';
  const VIEWPORT_HEIGHT_THRESHOLD = 700;
  const SCROLL_DOWN_THRESHOLD = 80;
  const SCROLL_UP_THRESHOLD = -40;
  const SCROLL_POSITION_MIN = 100;
  
  const viewportCollapse = () => (window.innerHeight || document.documentElement.clientHeight) < VIEWPORT_HEIGHT_THRESHOLD;

  const applyCollapsed = (collapsed) => {
    if (collapsed) {
      hero.classList.add('collapsed');
      toggle.setAttribute('aria-expanded', 'false');
    } else {
      hero.classList.remove('collapsed');
      toggle.setAttribute('aria-expanded', 'true');
    }
    setLocalStorage(COLLAPSE_KEY, collapsed ? '1' : '0');
  };

  // Init from stored user preference, else viewport heuristic
  let stored = getLocalStorage(COLLAPSE_KEY);
  // userSetPreference indicates whether the user explicitly set collapse/expand before
  let userSetPreference = (stored !== null);
  if (stored === '1') applyCollapsed(true);
  else if (stored === '0') applyCollapsed(false);
  else applyCollapsed(viewportCollapse());

  // Toggle by button
  const toggleClickHandler = function () {
    const cur = hero.classList.contains('collapsed');
    applyCollapsed(!cur);
    // mark that user explicitly set preference so auto-behaviour won't override
    userSetPreference = true;
  };
  
  toggle.addEventListener('click', toggleClickHandler);
  addKeyboardSupport(toggle, toggleClickHandler);

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
        // If user scrolled down more than threshold and page scrolled past minimum, collapse
        if (delta > SCROLL_DOWN_THRESHOLD && current > SCROLL_POSITION_MIN) {
          applyCollapsed(true);
        } else if (delta < SCROLL_UP_THRESHOLD) {
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

// Initialize all page functionality
function initializePage(language, options) {
  options = options || {};
  load_switch_language_btn(language);
  load_ui_toggle_btn(language);
  bind_onclick_btn();
  
  if (options.includeHeroAnimation && typeof initHeroCardsAnimation === 'function') {
    initHeroCardsAnimation();
  }
  
  if (typeof initHeroAutoHide === 'function') {
    initHeroAutoHide();
  }
}

