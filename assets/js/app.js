/* =========================================================
   Umumiy skript — barcha sahifalarda ishlaydi
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Saqlash (localStorage, xavfsiz) ---------- */
  var KALIT = 'xp2025';
  var Xotira = {
    oqi: function () {
      try { return JSON.parse(localStorage.getItem(KALIT)) || {}; }
      catch (e) { return {}; }
    },
    yoz: function (obj) {
      try { localStorage.setItem(KALIT, JSON.stringify(obj)); return true; }
      catch (e) { return false; }
    },
    modul: function (n) { return this.oqi()['m' + n] || {}; },
    modulYoz: function (n, malumot) {
      var d = this.oqi();
      d['m' + n] = Object.assign({}, d['m' + n] || {}, malumot);
      return this.yoz(d);
    }
  };
  window.Xotira = Xotira;

  /* ---------- Mobil menyu ---------- */
  var burger = document.getElementById('burger');
  var menyu = document.getElementById('bosh-menyu');
  if (burger && menyu) {
    burger.addEventListener('click', function () {
      var ochiq = menyu.classList.toggle('ochiq');
      burger.setAttribute('aria-expanded', ochiq ? 'true' : 'false');
      burger.setAttribute('aria-label', ochiq ? 'Menyuni yopish' : 'Menyuni ochish');
    });
    // Havola bosilganda menyu yopilsin
    menyu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        menyu.classList.remove('ochiq');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
    // Escape bilan yopish
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menyu.classList.contains('ochiq')) {
        menyu.classList.remove('ochiq');
        burger.setAttribute('aria-expanded', 'false');
        burger.focus();
      }
    });
  }

  /* ---------- O'qish progressi (panel ostidagi chiziq) ---------- */
  var panel = document.getElementById('panel');
  if (panel && !panel.querySelector('.progress-chiziq')) {
    var chiziq = document.createElement('div');
    chiziq.className = 'progress-chiziq';
    panel.appendChild(chiziq);
  }
  var progressChiziq = panel ? panel.querySelector('.progress-chiziq') : null;

  /* ---------- Yuqoriga tugmasi ---------- */
  var yuqoriga = document.getElementById('yuqoriga');
  if (yuqoriga) {
    yuqoriga.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Bosh sahifada hikoya tugamaguncha «yuqoriga» tugmasi chiqmasin —
  // aks holda u matn kartochkasining burchagini to'sib qo'yadi.
  var hikoyaBloki = document.getElementById('hikoya');

  function skrollda() {
    var h = document.documentElement;
    var balandlik = h.scrollHeight - h.clientHeight;
    var foiz = balandlik > 0 ? (h.scrollTop / balandlik) * 100 : 0;
    if (progressChiziq) progressChiziq.style.width = foiz + '%';
    if (yuqoriga) {
      var chegara = hikoyaBloki
        ? hikoyaBloki.offsetTop + hikoyaBloki.offsetHeight - window.innerHeight * 0.5
        : 600;
      yuqoriga.classList.toggle('korin', h.scrollTop > chegara);
    }
  }
  window.addEventListener('scroll', skrollda, { passive: true });
  skrollda();

  /* ---------- Skrollda paydo bo'lish ---------- */
  /* MUHIM: threshold 0 bo'lishi shart. Ma'ruza matni 25 000 px dan baland
     bo'lgani uchun uning ko'rinadigan ulushi hech qachon 12 % ga yetmaydi —
     eski qiymatda matn butunlay ochilmay qolgan edi. */
  var kirEl = document.querySelectorAll('.kir');

  function hammasiniOch() {
    kirEl.forEach(function (el) { el.classList.add('korin'); });
  }

  if (kirEl.length && 'IntersectionObserver' in window) {
    var ko = new IntersectionObserver(function (yozuvlar) {
      yozuvlar.forEach(function (y) {
        if (y.isIntersecting) { y.target.classList.add('korin'); ko.unobserve(y.target); }
      });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
    kirEl.forEach(function (el) { ko.observe(el); });

    // Zaxira: nima bo'lganda ham matn yashirin qolmasin
    setTimeout(hammasiniOch, 2500);
  } else {
    hammasiniOch();
  }

  /* ---------- Modullar ro'yxati ---------- */
  /* Kartochkalar HTML ichida tayyor turadi (JS o'chiq bo'lsa ham ko'rinadi).
     Bu yerda faqat saqlangan test natijasi qo'shiladi. */
  var idish = document.getElementById('modul-royxati');
  if (idish) {
    idish.querySelectorAll('.mod-karta[data-modul]').forEach(function (k) {
      var n = k.getAttribute('data-modul');
      var holat = Xotira.modul(n);
      if (holat.test == null) return;
      k.classList.add('bajarildi');
      var t = k.querySelector('.oyoq a[href*="#test"]');
      if (t) t.innerHTML = '<span aria-hidden="true">📝</span> Test: ' + holat.test + '%';
    });
    if (window.Tartibla) window.Tartibla(idish);
  }

  /* ---------- Modul sahifasidagi yon menyu (faol bo'lim) ---------- */
  var yonHavolalar = document.querySelectorAll('.yon-royxat a[href^="#"]');
  if (yonHavolalar.length && 'IntersectionObserver' in window) {
    var xarita = {};
    var nishonlar = [];
    yonHavolalar.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var el = document.getElementById(id);
      if (el) { xarita[id] = a; nishonlar.push(el); }
    });
    if (nishonlar.length) {
      var faolKuzat = new IntersectionObserver(function (yozuvlar) {
        yozuvlar.forEach(function (y) {
          if (y.isIntersecting) {
            yonHavolalar.forEach(function (a) { a.classList.remove('faol'); });
            var a = xarita[y.target.id];
            if (a) a.classList.add('faol');
          }
        });
      }, { rootMargin: '-88px 0px -65% 0px', threshold: 0 });
      nishonlar.forEach(function (el) { faolKuzat.observe(el); });
    }
  }

})();
