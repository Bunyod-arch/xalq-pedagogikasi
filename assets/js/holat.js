/* =========================================================
   SAYT HOLATI — muzlatish qulfi (ikki manba)

   1) holat.json          — repozitoriydagi fayl (qattiq qulf,
                            GitHub Actions o'zgartiradi, 1-2 daqiqa)
   2) bot /holat manzili  — Cloudflare Worker (bir zumda ishlaydi,
                            hech qanday qo'shimcha token talab qilmaydi)

   Ikkalasidan biri "faol": false desa — sayt ustiga qulf oynasi
   chiqadi. Ikkalasi ham o'qilmasa yoki xato bo'lsa, sayt NORMAL
   ishlaydi (xavfsiz sukut holati — tarmoq uzilishi darslikni
   yopib qo'ymasligi kerak).
   ========================================================= */
(function () {
  'use strict';
  if (!window.fetch) return;

  var BOT = 'https://xalq-pedagogikasi-bot.bunyodjorabekov54.workers.dev/holat';
  var qulflandi = false;

  function oq(manzil) {
    return fetch(manzil, { cache: 'no-store' })
      .then(function (j) { return j.ok ? j.json() : null; })
      .catch(function () { return null; });
  }

  Promise.all([
    oq('holat.json?v=' + Date.now()),
    oq(BOT + '?v=' + Date.now())
  ]).then(function (javoblar) {
    for (var i = 0; i < javoblar.length; i++) {
      var h = javoblar[i];
      if (h && h.faol === false) { qulfla(h); return; }
    }
  });

  function qulfla(h) {
    if (qulflandi) return;
    qulflandi = true;
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
