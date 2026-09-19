(function () {
  function initAlplHeader() {
    const menuButton = document.querySelector('[data-alpl-menu]');
    const nav = document.getElementById('alpl-site-nav');
    const header = document.querySelector('.alpl-site-header');
    if (!menuButton || !nav || !header) return;

    const setMenuOpen = function (open) {
      nav.classList.toggle('is-open', open);
      menuButton.classList.toggle('is-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
    };

    document.body.classList.add('has-alpl-menu');
    menuButton.addEventListener('click', function () {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      setMenuOpen(open);
      if (open) nav.querySelector('a').focus();
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setMenuOpen(false);
        const target = document.getElementById(link.hash.slice(1));
        if (target) target.focus({ preventScroll: true });
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
        setMenuOpen(false);
        menuButton.focus();
        event.preventDefault();
      }
    });

    document.addEventListener('click', function (event) {
      if (!header.contains(event.target)) setMenuOpen(false);
    });
    header.addEventListener('focusout', function (event) {
      if (event.relatedTarget && !header.contains(event.relatedTarget)) setMenuOpen(false);
    });

    const mobile = window.matchMedia('(max-width: 680px)');
    const resetMenu = function () { setMenuOpen(false); };
    if (mobile.addEventListener) mobile.addEventListener('change', resetMenu);
    else if (mobile.addListener) mobile.addListener(resetMenu);
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
      const label = light ? '切换深色主题' : '切换浅色主题';
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
      const themeColor = document.querySelector('meta[name="theme-color"]');
      if (themeColor) themeColor.setAttribute('content', light ? '#f1f5ef' : '#090d12');
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
