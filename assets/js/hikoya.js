/* =========================================================
   SKROLL-HIKOYA BOSHQARUVI
   Skroll foizi (0…1) --p o'zgaruvchisiga yoziladi; barcha
   qatlamlarni CSS shu qiymatdan hisoblaydi.

   GSAP ScrollTrigger mavjud bo'lsa — "scrub" bilan yumshatiladi
   (kinematik, silliq). Bo'lmasa — requestAnimationFrame zaxirasi.
   ========================================================= */
(function () {
  'use strict';

  var hikoya = document.getElementById('hikoya');
  if (!hikoya) return;

  var qadamlar = Array.prototype.slice.call(hikoya.querySelectorAll('.hikoya-qadam'));
  var nuqtalar = Array.prototype.slice.call(hikoya.querySelectorAll('.bosqich-nuqta'));

  var kamHarakat = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Foizni yozish ---------- */
  var oxirgiP = -1;
  function pYoz(p) {
    p = p < 0 ? 0 : p > 1 ? 1 : p;
    if (Math.abs(p - oxirgiP) < 0.0008) return;   // ortiqcha yozuvni tejaymiz
    oxirgiP = p;
    hikoya.style.setProperty('--p', p.toFixed(4));

    // Bosqich ko'rsatkichi (5 ta nuqta)
    var b = p >= 0.85 ? 4 : p >= 0.60 ? 3 : p >= 0.35 ? 2 : p >= 0.15 ? 1 : 0;
    for (var i = 0; i < nuqtalar.length; i++) {
      nuqtalar[i].classList.toggle('faol', i === b);
    }
    faolQadam(b);
  }

  /* ---------- Faqat bitta qadam faol bo'ladi (telefon uchun) ---------- */
  function sahnaKorinmoqda() {
    var r = hikoya.getBoundingClientRect();
    return r.top <= 2 && r.bottom >= window.innerHeight * 0.8;
  }
  function faolQadam(b) {
    var kor = sahnaKorinmoqda();
    for (var i = 0; i < qadamlar.length; i++) {
      qadamlar[i].classList.toggle('faol', kor && i === b);
    }
  }
  // Hikoyadan chiqilganda kartochka ekranda qolib ketmasin
  window.addEventListener('scroll', function () {
    if (!sahnaKorinmoqda()) {
      for (var i = 0; i < qadamlar.length; i++) qadamlar[i].classList.remove('faol');
    }
  }, { passive: true });

  /* ---------- Xom foizni hisoblash ---------- */
  function xomP() {
    var r = hikoya.getBoundingClientRect();
    var yol = hikoya.offsetHeight - window.innerHeight;   // yopishib turgan masofa
    if (yol <= 0) return 0;
    return (-r.top) / yol;
  }

  /* ---------- Matn bloklarining ko'rinishi ---------- */
  if ('IntersectionObserver' in window) {
    var ko = new IntersectionObserver(function (yozuvlar) {
      yozuvlar.forEach(function (y) {
        if (y.isIntersecting) y.target.classList.add('korin');
      });
    }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });
    qadamlar.forEach(function (q) { ko.observe(q); });
    if (qadamlar[0]) qadamlar[0].classList.add('korin');
    // Zaxira: har holda hammasi ko'rinsin
    setTimeout(function () {
      qadamlar.forEach(function (q) { q.classList.add('korin'); });
    }, 6000);
  } else {
    qadamlar.forEach(function (q) { q.classList.add('korin'); });
  }

  /* ---------- «Pastga suring» ishorasi ---------- */
  var yashirildi = false;
  window.addEventListener('scroll', function () {
    if (!yashirildi && window.scrollY > 60) {
      yashirildi = true;
      hikoya.classList.add('boshlandi');
    }
  }, { passive: true });

  /* =========================================================
     1-YO'L: GSAP ScrollTrigger (silliq "scrub")
     ========================================================= */
  var gsapBor = window.gsap && window.ScrollTrigger;

  if (gsapBor && !kamHarakat) {
    gsap.registerPlugin(ScrollTrigger);

    var vositachi = { p: 0 };
    gsap.to(vositachi, {
      p: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: hikoya,
        start: 'top top',
        end: function () { return '+=' + (hikoya.offsetHeight - window.innerHeight); },
        scrub: 0.55,               // kinematik yumshoqlik
        invalidateOnRefresh: true
      },
      onUpdate: function () { pYoz(vositachi.p); }
    });

    // Sahifa balandligi o'zgarsa (rasm/iframe yuklansa) qayta hisoblansin
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    return;
  }

  /* =========================================================
     2-YO'L: ZAXIRA — requestAnimationFrame bilan yumshatish
     ========================================================= */
  var joriy = xomP(), nishon = joriy, ishlayapti = false;

  function qadam() {
    // lerp — silliq yaqinlashish
    joriy += (nishon - joriy) * (kamHarakat ? 1 : 0.12);
    pYoz(joriy);
    if (Math.abs(nishon - joriy) > 0.0005) {
      requestAnimationFrame(qadam);
    } else {
      pYoz(nishon);
      ishlayapti = false;
    }
  }

  function yangila() {
    nishon = xomP();
    if (!ishlayapti) { ishlayapti = true; requestAnimationFrame(qadam); }
  }

  window.addEventListener('scroll', yangila, { passive: true });
  window.addEventListener('resize', yangila, { passive: true });
  window.addEventListener('load', yangila);
  yangila();
  pYoz(xomP());
})();
