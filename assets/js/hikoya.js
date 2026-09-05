/* =========================================================
   Skroll-hikoya boshqaruvi — bosh sahifa
   Qaysi matn bloki ekran markazida bo'lsa, o'sha bosqich yoqiladi.
   ========================================================= */
(function () {
  'use strict';

  var hikoya = document.getElementById('hikoya');
  if (!hikoya) return;

  var qadamlar = Array.prototype.slice.call(hikoya.querySelectorAll('.hikoya-qadam'));
  if (!qadamlar.length) return;

  // IntersectionObserver bo'lmasa — hamma matn ko'rinib tursin
  if (!('IntersectionObserver' in window)) {
    qadamlar.forEach(function (q) { q.classList.add('korin'); });
    hikoya.setAttribute('data-bosqich', '3');
    return;
  }

  var oxirgi = '1';

  var kuzatuvchi = new IntersectionObserver(function (yozuvlar) {
    yozuvlar.forEach(function (y) {
      if (y.isIntersecting) {
        y.target.classList.add('korin');
        var b = y.target.getAttribute('data-bosqich');
        if (b && b !== oxirgi) {
          oxirgi = b;
          hikoya.setAttribute('data-bosqich', b);
        }
      }
    });
  }, {
    // Ekranning o'rta qismiga kirganda ishga tushadi
    rootMargin: '-45% 0px -45% 0px',
    threshold: 0
  });

  qadamlar.forEach(function (q) { kuzatuvchi.observe(q); });

  // Birinchi blokni darhol ko'rsatish (skroll qilinmagan bo'lsa ham)
  qadamlar[0].classList.add('korin');

  // "Pastga suring" ishorasi — bir marta skroll qilinsa yo'qoladi
  var yashirildi = false;
  window.addEventListener('scroll', function () {
    if (!yashirildi && window.scrollY > 60) {
      yashirildi = true;
      hikoya.classList.add('boshlandi');
    }
  }, { passive: true });

})();
