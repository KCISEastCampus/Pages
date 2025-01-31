function bind_onclick_btn() {
  let buttons = Array.from(document.getElementsByClassName('button-link'));
  buttons.forEach(function (button) {
    let href = button.getAttribute('href');
    button.addEventListener('click', function () {
      if (href == null) return;
      window.location.href = href;
    });
  });
}
function load_switch_language_btn(current_language) {
  let button = document.getElementById('switch-language-button');
  let path = window.location.pathname;
  if (current_language == 'en') {
    button.innerHTML = "中文";
    button.setAttribute('href', path.replace(/\/en(.*?)$/g, "$1"));
  }
  else if (current_language == 'zh_CN') {
    button.innerHTML = "English";
    button.setAttribute('href', '/en' + path);
  }
}
