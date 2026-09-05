/* =========================================================
   JONLI FON BOSHQARUVI
   Sahifa skroll foizini (0…1) --sp o'zgaruvchisiga yozadi.
   Fon qatlamlari CSS'da shu qiymatdan hisoblanadi.

   GSAP bo'lsa — scrub bilan yumshatiladi, bo'lmasa rAF zaxirasi.
   ========================================================= */
(function () {
  'use strict';

  var fon = document.querySelector('.jonli-fon');
  if (!fon) return;

  var ildiz = document.documentElement;
  var kamHarakat = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var oxirgi = -1;
  function yoz(v) {
    v = v < 0 ? 0 : v > 1 ? 1 : v;
    if (Math.abs(v - oxirgi) < 0.001) return;
    oxirgi = v;
    ildiz.style.setProperty('--sp', v.toFixed(4));
  }

  function xom() {
    var h = document.documentElement;
    var yol = h.scrollHeight - h.clientHeight;
    return yol > 0 ? h.scrollTop / yol : 0;
  }

  if (kamHarakat) { yoz(0); return; }

  /* ---------- GSAP mavjud bo'lsa ---------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    var v = { p: 0 };
    gsap.to(v, {
      p: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.7,
        invalidateOnRefresh: true
      },
      onUpdate: function () { yoz(v.p); }
    });
    return;
  }

  /* ---------- Zaxira: requestAnimationFrame ---------- */
  var joriy = xom(), nishon = joriy, ishlayapti = false;

  function qadam() {
    joriy += (nishon - joriy) * 0.12;
    yoz(joriy);
    if (Math.abs(nishon - joriy) > 0.0008) {
      requestAnimationFrame(qadam);
    } else {
      yoz(nishon);
      ishlayapti = false;
    }
  }
  function yangila() {
    nishon = xom();
    if (!ishlayapti) { ishlayapti = true; requestAnimationFrame(qadam); }
  }

  window.addEventListener('scroll', yangila, { passive: true });
  window.addEventListener('resize', yangila, { passive: true });
  window.addEventListener('load', yangila);
  yoz(xom());
})();
