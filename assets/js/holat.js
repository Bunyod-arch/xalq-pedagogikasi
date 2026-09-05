/* =========================================================
   SAYT HOLATI — muzlatish qulfi
   holat.json faylini o'qiydi. "faol": false bo'lsa, sayt ustiga
   yopiq oyna chiqadi. Fayl o'qilmasa yoki xato bo'lsa — sayt
   normal ishlaydi (xavfsiz sukut holati).
   ========================================================= */
(function () {
  'use strict';
  if (!window.fetch) return;

  var manzil = 'holat.json?v=' + Date.now();   // keshni chetlab o'tish

  fetch(manzil, { cache: 'no-store' })
    .then(function (j) { return j.ok ? j.json() : null; })
    .then(function (h) {
      if (!h || h.faol !== false) return;      // faol bo'lsa — hech narsa qilmaymiz
      qulfla(h);
    })
    .catch(function () { /* xato bo'lsa sayt ochiq qoladi */ });

  function qulfla(h) {
    var o = document.createElement('div');
    o.className = 'muzlatilgan';
    o.setAttribute('role', 'alertdialog');
    o.setAttribute('aria-live', 'assertive');
    o.innerHTML =
      '<div class="muz-quti">' +
        '<div class="muz-nishon" aria-hidden="true">❋</div>' +
        '<h1>' + xavfsiz(h.sarlavha || 'Sayt vaqtincha to‘xtatilgan') + '</h1>' +
        '<p>' + xavfsiz(h.xabar || 'Iltimos, keyinroq urinib ko‘ring.') + '</p>' +
        (h.aloqa ? '<p class="muz-aloqa">' + xavfsiz(h.aloqa) + '</p>' : '') +
        '<p class="muz-past">Xalq pedagogikasi — elektron darslik</p>' +
      '</div>';
    document.body.appendChild(o);
    document.documentElement.classList.add('muzlatilgan-holat');
  }

  function xavfsiz(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
})();
