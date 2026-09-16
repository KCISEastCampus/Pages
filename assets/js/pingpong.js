(function () {
  function initAlplHeader() {
    const menuButton = document.querySelector('[data-alpl-menu]');
    const nav = document.getElementById('alpl-site-nav');
    if (!menuButton || !nav) return;

    menuButton.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('is-open');
      menuButton.classList.toggle('is-open', isOpen);
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? '关闭导航菜单' : '打开导航菜单');
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        menuButton.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', '打开导航菜单');
      });
    });
  }

  function initAlplTheme() {
    const button = document.querySelector('[data-alpl-theme-toggle]');
    const html = document.documentElement;
    if (!button) return;

    const update = function () {
      const light = html.getAttribute('data-alpl-theme') === 'light';
      const icon = button.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-sun', !light);
        icon.classList.toggle('fa-moon', light);
      }
      button.setAttribute('aria-label', light ? '切换深色主题' : '切换浅色主题');
    };

    button.addEventListener('click', function () {
      const light = html.getAttribute('data-alpl-theme') === 'light';
      html.setAttribute('data-alpl-theme', light ? 'dark' : 'light');
      try { localStorage.setItem('alpl-theme', light ? 'dark' : 'light'); } catch (error) { /* ignore */ }
      update();
    });

    try {
      const saved = localStorage.getItem('alpl-theme');
      if (saved === 'light' || saved === 'dark') html.setAttribute('data-alpl-theme', saved);
    } catch (error) { /* ignore */ }
    update();
  }

  function initAlplDetails() {
    const details = document.querySelectorAll('.alpl-rule-list details');
    if (!details.length) return;

    details.forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (!item.open) return;
        details.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initAlplHeader();
    initAlplTheme();
    initAlplDetails();
  });
})();
