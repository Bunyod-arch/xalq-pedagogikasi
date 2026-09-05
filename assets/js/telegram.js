/* =========================================================
   TELEGRAM WEB APP INTEGRATSIYASI
   Sayt Telegram bot ichida ochilsa — natijalar botga yuboriladi.
   Oddiy brauzerda ochilsa — sayt hech qanday o'zgarishsiz ishlaydi.

   Bu fayl mavjud kodga TEGMAYDI: u faqat window.Xotira.modulYoz
   funksiyasini o'raydi (wrap) va sahifaga bir nechta element qo'shadi.

   MUHIM: bu yerda hech qanday token yoki maxfiy ma'lumot yo'q.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 1. SDK ni aniqlash ---------- */

  function sdkOqi() {
    try {
      if (window.Telegram && window.Telegram.WebApp) return window.Telegram.WebApp;
    } catch (e) {}
    return null;
  }

  var TG = sdkOqi();

  /* Telegram ichida ekanini tekshirish.
     SDK skripti oddiy brauzerga ham yuklanishi mumkin — o'shanda
     platform 'unknown' bo'ladi va initData bo'sh qoladi. */
  function ichidami() {
    if (!TG) return false;
    try {
      if (TG.initData && String(TG.initData).length > 0) return true;
      if (TG.initDataUnsafe && TG.initDataUnsafe.user) return true;
      if (TG.platform && TG.platform !== 'unknown') return true;
    } catch (e) {}
    return false;
  }

  var ICHIDA = ichidami();

  /* ---------- 2. Kichik yordamchilar ---------- */

  function el(tag, klass, matn) {
    var e = document.createElement(tag);
    if (klass) e.className = klass;
    if (matn != null) e.textContent = matn;   // matn doim textContent orqali — xavfsiz
    return e;
  }

  /* Har qanday chaqiruvni xatosiz bajarish */
  function xavfsiz(fn) {
    try { return fn(); } catch (e) { return null; }
  }

  /* Foydalanuvchi ismi (faqat matn sifatida ishlatiladi) */
  function ismOqi() {
    var u = xavfsiz(function () { return TG && TG.initDataUnsafe ? TG.initDataUnsafe.user : null; });
    if (!u) return '';
    var ism = [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
    if (!ism && u.username) ism = '@' + u.username;
    return ism;
  }

  /* Bot manzili — faqat xavfsiz sxemalarga ruxsat */
  function botManzil() {
    var m = xavfsiz(function () { return window.BOT_MANZIL; });
    if (!m || typeof m !== 'string') return '';
    m = m.trim();
    if (!m) return '';
    if (/^https?:\/\//i.test(m) || /^tg:\/\//i.test(m)) return m;
    return '';
  }

  /* ---------- 3. Panel va eslatma ---------- */

  var holatEl = null;   // panel ichidagi holat yozuvi

  function tepaJoy() {
    return document.getElementById('asosiy') ||
           document.querySelector('main') ||
           document.body;
  }

  /* Telegram ichida: yuqoridagi salomlashuv paneli */
  function panelQur() {
    if (document.querySelector('.tg-panel')) return;
    var joy = tepaJoy();
    if (!joy) return;

    var panel = el('div', 'tg-panel');
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'Telegram ulanishi');

    var nishon = el('span', 'tg-nishon', '✈');
    nishon.setAttribute('aria-hidden', 'true');
    panel.appendChild(nishon);

    var matn = el('div', 'tg-matn');
    var ism = ismOqi();
    matn.appendChild(el('p', 'tg-salom', ism ? 'Salom, ' + ism + '!' : 'Salom!'));
    matn.appendChild(el('p', 'tg-izoh', 'Natijalaringiz o‘qituvchiga yuboriladi.'));
    panel.appendChild(matn);

    holatEl = el('span', 'tg-holat', 'Ulandi');
    holatEl.setAttribute('role', 'status');
    panel.appendChild(holatEl);

    joy.insertBefore(panel, joy.firstChild);
  }

  /* Brauzerda: test/o'yin bo'limi tepasidagi eslatma.
     Bot manzili berilmagan bo'lsa — umuman ko'rsatilmaydi. */
  function eslatmaQur() {
    var manzil = botManzil();
    if (!manzil) return;
    if (document.querySelector('.tg-eslatma')) return;

    var bolim = document.querySelector('[data-test], [data-oyin], [data-oyin2]');
    if (!bolim || !bolim.parentNode) return;

    var quti = el('div', 'tg-eslatma');

    var nishon = el('span', 'tg-nishon', '✈');
    nishon.setAttribute('aria-hidden', 'true');
    quti.appendChild(nishon);

    quti.appendChild(el('p', 'tg-eslatma-matn',
      'Natijangiz o‘qituvchiga borishi uchun saytni Telegram bot orqali oching.'));

    var havola = el('a', 'tg-havola', 'Botni ochish');
    havola.href = manzil;
    havola.target = '_blank';
    havola.rel = 'noopener noreferrer';
    quti.appendChild(havola);

    bolim.parentNode.insertBefore(quti, bolim);
  }

  /* Qisqa xabar (panel holati + pastdagi kichik yozuv) */
  var xabarTaymer = null;

  function xabarKorsat(matn, xato) {
    if (holatEl) {
      holatEl.textContent = matn;
      holatEl.classList.toggle('tg-holat-xato', !!xato);
    }
    xavfsiz(function () {
      var eski = document.querySelector('.tg-xabar');
      if (eski && eski.parentNode) eski.parentNode.removeChild(eski);

      var x = el('div', 'tg-xabar' + (xato ? ' tg-xabar-xato' : ''), matn);
      x.setAttribute('role', 'status');
      document.body.appendChild(x);

      if (xabarTaymer) clearTimeout(xabarTaymer);
      xabarTaymer = setTimeout(function () {
        if (x.parentNode) x.parentNode.removeChild(x);
      }, 4000);
    });
  }

  /* ---------- 4. Natijani o'qish ---------- */

  /* modulYoz ga uzatilgan obyektdan turni va foizni ajratib olamiz.
     test.js  -> { test: foiz }
     oyin.js  -> { oyin: foiz }
     oyin2.js -> { <kalit>: qiymat }
     cholgu.js-> { cholgu: daraja } */
  var TUR_NOMLARI = { test: 'test', oyin: 'oyin', oyin2: 'oyin', cholgu: 'cholgu' };

  function malumotOqi(malumot) {
    if (!malumot || typeof malumot !== 'object') return null;
    var kalitlar = Object.keys(malumot);
    for (var i = 0; i < kalitlar.length; i++) {
      var k = kalitlar[i];
      var q = malumot[k];
      if (typeof q === 'number' && isFinite(q)) {
        return { kalit: k, tur: TUR_NOMLARI[k] || k, qiymat: q };
      }
    }
    return null;
  }

  /* To'g'ri javoblar sonini sahifadan o'qish (test.js ga tegmasdan) */
  function hisobOqi(kalit) {
    return xavfsiz(function () {
      if (kalit === 'test') {
        var bloklar = document.querySelectorAll('[data-test] .test-savol');
        if (!bloklar.length) return null;
        var togri = 0;
        for (var i = 0; i < bloklar.length; i++) {
          var tanlangan = bloklar[i].querySelector('input:checked');
          if (tanlangan && tanlangan.value === bloklar[i].getAttribute('data-togri')) togri++;
        }
        return { togri: togri, jami: bloklar.length };
      }
      var h = document.querySelector('.oyin-hisob');
      if (h) {
        var m = /(\d+)\s*\/\s*(\d+)/.exec(h.textContent || '');
        if (m) return { togri: parseInt(m[1], 10), jami: parseInt(m[2], 10) };
      }
      return null;
    });
  }

  /* ---------- 5. Botga yuborish ---------- */

  function yubor(modul, malumot) {
    if (!ICHIDA || !TG || typeof TG.sendData !== 'function') return false;

    var oqilgan = malumotOqi(malumot);
    if (!oqilgan) return false;

    var hisob = hisobOqi(oqilgan.kalit);
    var yuk = {
      modul: Number(modul),
      foiz: oqilgan.qiymat,
      togri: hisob ? hisob.togri : null,
      jami: hisob ? hisob.jami : null,
      tur: oqilgan.tur
    };

    try {
      TG.sendData(JSON.stringify(yuk));
      xabarKorsat('✓ Natija yuborildi');
      return true;
    } catch (e) {
      xabarKorsat('Natijani yuborib bo‘lmadi', true);
      return false;
    }
  }

  /* ---------- 6. window.Xotira.modulYoz ni o'rash ---------- */

  function oradan() {
    var X = xavfsiz(function () { return window.Xotira; });
    if (!X || typeof X.modulYoz !== 'function') return false;
    if (X.modulYoz.tgOralgan) return true;

    var asl = X.modulYoz;

    function oralgan(n, malumot) {
      var natija = false;
      // Avval asl saqlash ishlasin — Telegram bo'lmasa ham sayt to'liq ishlaydi.
      try {
        natija = asl.apply((this && typeof this.oqi === 'function') ? this : X, arguments);
      } catch (e) {}
      // So'ng botga yuborishga urinamiz. Xatolik saqlashga ta'sir qilmaydi.
      try { yubor(n, malumot); } catch (e) {}
      return natija;
    }

    oralgan.tgOralgan = true;
    X.modulYoz = oralgan;
    return true;
  }

  /* app.js bu fayldan keyin yuklansa ham ishlashi uchun bir necha bor urinamiz */
  function oralishniBoshla() {
    if (oradan()) return;
    var urinish = 0;
    var taymer = setInterval(function () {
      urinish++;
      if (oradan() || urinish > 60) clearInterval(taymer);
    }, 100);
  }

  /* ---------- 7. Ishga tushirish ---------- */

  function boshla() {
    if (ICHIDA) {
      xavfsiz(function () { if (typeof TG.ready === 'function') TG.ready(); });
      xavfsiz(function () { if (typeof TG.expand === 'function') TG.expand(); });
      xavfsiz(panelQur);
      oralishniBoshla();
    } else {
      // Oddiy brauzer: sayt hech nima yo'qotmaydi, faqat kichik eslatma qo'shiladi.
      xavfsiz(eslatmaQur);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { xavfsiz(boshla); });
  } else {
    xavfsiz(boshla);
  }

  /* ---------- 8. Tashqi API ---------- */
  window.TgWebApp = {
    tg: TG,                 // SDK obyekti yoki null
    ichidami: function () { return ICHIDA; },
    yubor: yubor,           // qo'lda yuborish: TgWebApp.yubor(2, {test: 80})
    xabar: xabarKorsat      // qisqa xabar chiqarish
  };

})();
