function initNavigation() {
  const hamburger = document.querySelector('.hamburger');
  const links = document.getElementById('nav-links');
  if (!hamburger || !links) return;
  const nav = hamburger.closest('nav');
  const setExpanded = (expanded) => {
    hamburger.setAttribute('aria-expanded', String(expanded));
    links.classList.toggle('active', expanded);
  };
  hamburger.addEventListener('click', () => {
    setExpanded(hamburger.getAttribute('aria-expanded') !== 'true');
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && hamburger.getAttribute('aria-expanded') === 'true') {
      setExpanded(false);
      hamburger.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target)) setExpanded(false);
  });
  links.addEventListener('click', (event) => {
    if (event.target.closest('a')) setExpanded(false);
  });
  window.matchMedia('(max-width: 768px)').addEventListener('change', () => setExpanded(false));
}

function load_ui_toggle_btn(current_language) {
  // DEPRECATED: UI toggle feature has been removed
  const btn = document.getElementById('ui-toggle-button');
  if (!btn) return;
}

function init_theme_toggle_btn() {
  const html_element = document.documentElement;
  const theme_button = document.getElementById('theme-toggle-button');
  if (!theme_button) return;

  const theme_icon = theme_button.querySelector('i');
  const theme_label = theme_button.querySelector('.theme-toggle-label');

  function get_preferred_theme() {
    try {
      const saved_theme = localStorage.getItem('site-theme');
      if (saved_theme === 'dark' || saved_theme === 'light') {
        return saved_theme;
      }
    } catch (error) {
      // ignore storage errors
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function is_dark_theme() {
    return html_element.getAttribute('data-bs-theme') === 'dark';
  }

  function update_theme_button_status() {
    if (!theme_icon || !theme_label) return;
    if (is_dark_theme()) {
      theme_icon.classList.remove('fa-moon');
      theme_icon.classList.add('fa-sun');
      theme_label.textContent = theme_button.dataset.lightLabel;
    } else {
      theme_icon.classList.remove('fa-sun');
      theme_icon.classList.add('fa-moon');
      theme_label.textContent = theme_button.dataset.darkLabel;
    }
    const action = is_dark_theme() ? theme_button.dataset.lightAction : theme_button.dataset.darkAction;
    theme_button.setAttribute('aria-label', action);
    theme_button.setAttribute('title', action);
  }

  function apply_theme(theme) {
    html_element.setAttribute('data-bs-theme', theme);
    try {
      localStorage.setItem('site-theme', theme);
    } catch (error) {
      // ignore storage errors
    }
    update_theme_button_status();
  }

  if (!html_element.getAttribute('data-bs-theme')) {
    html_element.setAttribute('data-bs-theme', get_preferred_theme());
  }
  update_theme_button_status();

  theme_button.addEventListener('click', function () {
    apply_theme(is_dark_theme() ? 'light' : 'dark');
  });
}

/* Hero initialization functions - deprecated but kept for compatibility */
function initHeroCardsAnimation() {
  // No longer needed with simplified hero
}

function initHeroAutoHide() {
  // No longer needed with simplified hero
}

/* ========================================
   Scroll-to-Top Button
   ======================================== */
function initScrollToTop() {
  const btn = document.createElement('button');
  btn.className = 'scroll-top-btn';
  const label = document.documentElement.lang.startsWith('en') ? 'Back to top' : '回到顶部';
  btn.setAttribute('aria-label', label);
  btn.setAttribute('title', label);
  btn.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';
  document.body.appendChild(btn);

  // 页面内容不足一屏时（无滚动空间）不显示“回到顶部”
  const canScroll = () => document.documentElement.scrollHeight > window.innerHeight + 10;

  let ticking = false;
  const update = () => {
    btn.classList.toggle('visible', canScroll() && window.scrollY > 320);
    ticking = false;
  };
  const scheduleUpdate = () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  };
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });
  update();

  btn.addEventListener('click', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'instant' : 'smooth' });
  });
}

/* idadwind 2025-02-11 */

document.addEventListener('DOMContentLoaded', function () {
  init_theme_toggle_btn();
  initNavigation();
  initScrollToTop();
});
