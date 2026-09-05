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

  /* ---------- Sarlavha panelidagi parallaks ---------- */
  var bosh = document.querySelector('.jonli-bosh');
  if (bosh && !kamHarakat) {
    var naqshlar = bosh.querySelector('.bosh-naqshlar');
    var emblema  = bosh.querySelector('.bosh-emblema');
    var qobiq    = bosh.querySelector('.qobiq');
    var ishla = false;
    window.addEventListener('scroll', function () {
      if (ishla) return;
      ishla = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        var b = bosh.offsetHeight || 1;
        var n = Math.min(y / b, 1.4);
        if (naqshlar) naqshlar.style.transform = 'translate3d(0,' + (n * 70) + 'px,0)';
        if (emblema)  emblema.style.transform  = 'translate3d(0,' + (n * -46) + 'px,0) scale(' + (1 - n * 0.12) + ')';
        if (qobiq)    qobiq.style.transform    = 'translate3d(0,' + (n * 34) + 'px,0)';
        ishla = false;
      });
    }, { passive: true });
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
