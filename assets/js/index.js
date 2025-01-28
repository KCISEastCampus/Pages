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
