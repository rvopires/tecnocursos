/* Gera o box-shadow das estrelas do CTA cósmico */
(function () {
  function randomPosition() {
    return Math.floor(Math.random() * 2000) + 'px ' + Math.floor(Math.random() * 2000) + 'px #FFF';
  }
  function makeShadows(n) {
    var s = randomPosition();
    for (var i = 2; i <= n; i++) s += ', ' + randomPosition();
    return s;
  }
  document.querySelectorAll('[data-cosmic-stars]').forEach(function (el) {
    if (el.getAttribute('data-cosmic-ready')) return;
    el.setAttribute('data-cosmic-ready', '1');
    var kind = el.getAttribute('data-cosmic-stars');
    var count = kind === 'large' ? 80 : kind === 'medium' ? 160 : 500;
    el.style.boxShadow = makeShadows(count);
  });
})();
