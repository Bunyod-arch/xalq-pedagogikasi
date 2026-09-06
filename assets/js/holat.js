/* =========================================================
   SAYT HOLATI — muzlatish qulfi (ikki manba, doimiy nazorat)

   Manbalar:
     1) holat.json          — repozitoriydagi fayl (qattiq qulf)
     2) bot /holat manzili  — Cloudflare Worker (bir zumda ishlaydi)

   Ikkalasidan biri "faol": false desa — qulf oynasi chiqadi.
   Ikkalasi ham o'qilmasa sayt NORMAL ishlaydi (xavfsiz sukut).

   Qulf FAQAT sahifa ochilganda emas, quyidagi hollarda ham
   qayta tekshiriladi — Telegram Mini App oynani keshdan
   tiklaganda ham qulf ishlashi uchun:
     • oyna ko'rinadigan bo'lganda (visibilitychange)
     • orqaga/oldinga o'tishda keshdan tiklanganda (pageshow)
     • oyna fokusga qaytganda (focus)
     • har 60 soniyada, sahifa ochiq turganda
   Sayt qayta ochilsa qulf o'zi yo'qoladi — qayta yuklash shart emas.
   ========================================================= */
(function () {
  'use strict';
  if (!window.fetch) return;

  var BOT = 'https://xalq-pedagogikasi-bot.bunyodjorabekov54.workers.dev/holat';
  var oyna = null;         // qulf elementi
  var tekshirilmoqda = false;
  var oxirgi = 0;

  function oq(manzil) {
    return fetch(manzil + (manzil.indexOf('?') < 0 ? '?' : '&') + 'v=' + Date.now(),
                 { cache: 'no-store' })
      .then(function (j) { return j.ok ? j.json() : null; })
      .catch(function () { return null; });
  }

  function tekshir(majburiy) {
    var hozir = Date.now();
    if (tekshirilmoqda) return;
    if (!majburiy && hozir - oxirgi < 8000) return;   // ortiqcha so'rov bo'lmasin
    tekshirilmoqda = true;
    oxirgi = hozir;

    Promise.all([oq('holat.json'), oq(BOT)]).then(function (javoblar) {
      tekshirilmoqda = false;
      var yopiq = null;
      for (var i = 0; i < javoblar.length; i++) {
        if (javoblar[i] && javoblar[i].faol === false) { yopiq = javoblar[i]; break; }
      }
      // Ikkala manba ham javob bermasa holatni o'zgartirmaymiz.
      var javobBor = javoblar[0] || javoblar[1];
      if (yopiq) qulfla(yopiq);
      else if (javobBor) ochib_yubor();
    }, function () { tekshirilmoqda = false; });
  }

  function qulfla(h) {
    if (oyna) return;
    oyna = document.createElement('div');
    oyna.className = 'muzlatilgan';
    oyna.setAttribute('role', 'alertdialog');
    oyna.setAttribute('aria-live', 'assertive');
    oyna.innerHTML =
      '<div class="muz-quti">' +
        '<div class="muz-nishon" aria-hidden="true">❋</div>' +
        '<h1>' + xavfsiz(h.sarlavha || 'Sayt vaqtincha to‘xtatilgan') + '</h1>' +
        '<p>' + xavfsiz(h.xabar || 'Iltimos, keyinroq urinib ko‘ring.') + '</p>' +
        (h.aloqa ? '<p class="muz-aloqa">' + xavfsiz(h.aloqa) + '</p>' : '') +
        '<p class="muz-past">Xalq pedagogikasi — elektron darslik</p>' +
      '</div>';
    document.body.appendChild(oyna);
    document.documentElement.classList.add('muzlatilgan-holat');

    // Telegram Mini App ichida bo'lsak, asosiy tugmani ham o'chiramiz.
    try {
      var W = window.Telegram && window.Telegram.WebApp;
      if (W && W.MainButton && W.MainButton.hide) W.MainButton.hide();
    } catch (e) { /* e'tiborsiz */ }
  }

  function ochib_yubor() {
    if (!oyna) return;
    if (oyna.parentNode) oyna.parentNode.removeChild(oyna);
    oyna = null;
    document.documentElement.classList.remove('muzlatilgan-holat');
  }

  function xavfsiz(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  tekshir(true);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) tekshir(true);
  });
  window.addEventListener('pageshow', function (h) { if (h.persisted) tekshir(true); });
  window.addEventListener('focus', function () { tekshir(false); });
  setInterval(function () { if (!document.hidden) tekshir(false); }, 60000);
})();
