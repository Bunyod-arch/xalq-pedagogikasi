/* =========================================================
   ANIMATSIYA VA IKONKALAR
   - bo'lim nishonlari bosilganda ishlaydi
   - kartochkalar ketma-ket chiqadi
   - raqamlar sanaladi
   - tugmalarda bosish to'lqini
   ========================================================= */
(function () {
  'use strict';

  var kamHarakat = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Ketma-ket chiqish tartibi ---------- */
  function tartibla(ildiz) {
    (ildiz || document).querySelectorAll(
      '.tur-panjara, .muqova-tur, .stat-tur, .qoshimcha-tur, .mod-nav'
    ).forEach(function (guruh) {
      Array.prototype.forEach.call(guruh.children, function (el, i) {
        el.style.setProperty('--kechik', Math.min(i, 9));
      });
    });
  }
  tartibla();
  window.Tartibla = tartibla;   // app.js ro'yxatni chizgach chaqiradi

  /* ---------- 2. Bo'limga o'tish va chaqnash ---------- */
  function bolimgaOt(id, tarixgaYoz, chaqnasin) {
    if (chaqnasin === undefined) chaqnasin = true;
    var nishon = document.getElementById(id);
    if (!nishon) return false;
    var panel = document.querySelector('.panel');
    var ust = (panel ? panel.offsetHeight : 0) + 14;
    var y = nishon.getBoundingClientRect().top + window.scrollY - ust;
    // Uzoq masofada silliq skroll bir necha soniya davom etadi — bunday holda
    // darhol sakraymiz, faqat qisqa masofada silliq harakat qoldiriladi.
    var uzoq = Math.abs(y - window.scrollY) > window.innerHeight * 3;
    window.scrollTo({ top: y, behavior: (kamHarakat || uzoq) ? 'instant' : 'smooth' });

    if (chaqnasin) {
      nishon.classList.remove('chaqnadi');
      void nishon.offsetWidth;          // animatsiyani qayta ishga tushirish
      nishon.classList.add('chaqnadi');
      setTimeout(function () { nishon.classList.remove('chaqnadi'); }, 2400);
    }

    if (tarixgaYoz && history.replaceState) history.replaceState(null, '', '#' + id);
    return true;
  }
  window.BolimgaOt = bolimgaOt;

  // Sahifa ichidagi barcha "#..." havolalar (nishonlar, yon menyu, meta chiplar)
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (!id) return;
    if (bolimgaOt(id, true)) e.preventDefault();
  });

  // Boshqa sahifadan "#oyin" bilan kelinganda ham to'g'ri joyga tushsin.
  // Video ramkalari yuklangach tartib siljishi mumkin — shuning uchun bir necha bor.
  if (location.hash.length > 1) {
    var nishonId = location.hash.slice(1);
    function joyla(chaqnasin) { bolimgaOt(nishonId, false, chaqnasin); }
    document.addEventListener('DOMContentLoaded', function () { joyla(true); });
    window.addEventListener('load', function () {
      joyla(false);
      setTimeout(function () { joyla(false); }, 350);
    });
  }

  /* ---------- 3. Tugmada bosish to'lqini ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.tug');
    if (!t || kamHarakat) return;
    t.classList.remove('bosildi');
    void t.offsetWidth;
    t.classList.add('bosildi');
    setTimeout(function () { t.classList.remove('bosildi'); }, 650);
  });

  /* ---------- 4. Raqamlar sanaladi ---------- */
  function sana(el) {
    var oxir = parseInt((el.textContent || '').replace(/\D/g, ''), 10);
    if (!oxir || kamHarakat) return;
    var boshlangan = null, davomiylik = 1100;
    function qadam(t) {
      if (!boshlangan) boshlangan = t;
      var p = Math.min((t - boshlangan) / davomiylik, 1);
      var yumshoq = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(oxir * yumshoq);
      if (p < 1) requestAnimationFrame(qadam);
      else el.textContent = oxir;
    }
    el.textContent = '0';
    requestAnimationFrame(qadam);
  }

  var sonlar = document.querySelectorAll('.stat .son');
  if (sonlar.length && 'IntersectionObserver' in window) {
    var sanoq = new IntersectionObserver(function (yozuvlar) {
      yozuvlar.forEach(function (y) {
        if (y.isIntersecting) { sana(y.target); sanoq.unobserve(y.target); }
      });
    }, { threshold: 0.5 });
    sonlar.forEach(function (el) { sanoq.observe(el); });
  }

  /* ---------- 5. O'yin hisobi o'zgarganda urg'u ---------- */
  var hisob = document.querySelector('.oyin-hisob');
  if (hisob && 'MutationObserver' in window && !kamHarakat) {
    new MutationObserver(function () {
      hisob.classList.remove('ozgardi');
      void hisob.offsetWidth;
      hisob.classList.add('ozgardi');
    }).observe(hisob, { childList: true, characterData: true, subtree: true });
  }

  /* ---------- 6. Sahifalar orasida yumshoq o'tish ---------- */
  if (!kamHarakat) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href$=".html"]');
      if (!a) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      var u = a.getAttribute('href');
      if (!u || /^(https?:)?\/\//.test(u)) return;
      e.preventDefault();
      document.body.classList.add('chiqmoqda');
      setTimeout(function () { location.href = u; }, 200);
    });
    // Orqaga qaytilganda sahifa oq qolib ketmasin
    window.addEventListener('pageshow', function () {
      document.body.classList.remove('chiqmoqda');
    });
  }

})();
