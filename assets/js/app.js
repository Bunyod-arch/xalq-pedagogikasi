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
  var kirEl = document.querySelectorAll('.kir');
  if (kirEl.length && 'IntersectionObserver' in window) {
    var ko = new IntersectionObserver(function (yozuvlar) {
      yozuvlar.forEach(function (y) {
        if (y.isIntersecting) { y.target.classList.add('korin'); ko.unobserve(y.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    kirEl.forEach(function (el) { ko.observe(el); });
  } else {
    kirEl.forEach(function (el) { el.classList.add('korin'); });
  }

  /* ---------- Modullar ro'yxatini chizish ---------- */
  var idish = document.getElementById('modul-royxati');
  if (idish && window.MODULLAR) {
    var html = window.MODULLAR.map(function (m) {
      var holat = Xotira.modul(m.n);
      var bajarildi = holat.test != null;
      var qism = bajarildi
        ? '<span>Test: ' + holat.test + '%</span>'
        : '<span>' + m.test + ' savol</span>';
      return '' +
        '<a class="karta mod-karta kir' + (bajarildi ? ' bajarildi' : '') + '" ' +
        'href="modul-' + m.n + '.html" style="--rang:' + m.a + '">' +
          '<span class="raqam">' + m.n + '-modul</span>' +
          '<span class="sarl">' + m.nom + '</span>' +
          '<span class="tavsif">' + m.qisqa + '</span>' +
          '<span class="oyoq">' +
            '<span>🎮 ' + m.oyin + '</span>' + qism +
            '<span class="oq-belgi" aria-hidden="true">→</span>' +
          '</span>' +
        '</a>';
    }).join('');
    idish.innerHTML = html;

    // Yangi qo'shilgan .kir elementlarni ham kuzatish
    if ('IntersectionObserver' in window) {
      var ko2 = new IntersectionObserver(function (yozuvlar) {
        yozuvlar.forEach(function (y) {
          if (y.isIntersecting) { y.target.classList.add('korin'); ko2.unobserve(y.target); }
        });
      }, { threshold: 0.08 });
      idish.querySelectorAll('.kir').forEach(function (el) { ko2.observe(el); });
    } else {
      idish.querySelectorAll('.kir').forEach(function (el) { el.classList.add('korin'); });
    }
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
