function bind_onclick_btn() {
  let buttons = Array.from(document.querySelectorAll('buttonlink'));
  buttons.forEach(function (button) {
    let href = button.getAttribute('href');
    button.addEventListener('click', function () {
      if (href == null) return;
      window.open(href);
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
  nav_links.classList.toggle('active');
  hamburger.classList.toggle('active');
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
      theme_icon.classList.remove('fa-sun');
      theme_icon.classList.add('fa-moon');
      theme_label.textContent = '暗黑';
    } else {
      theme_icon.classList.remove('fa-moon');
      theme_icon.classList.add('fa-sun');
      theme_label.textContent = '日间';
    }
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

/* idadwind 2025-02-11 */

document.addEventListener('DOMContentLoaded', function () {
  init_theme_toggle_btn();
});
