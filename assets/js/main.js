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

/* idadwind 2025-02-11 */
