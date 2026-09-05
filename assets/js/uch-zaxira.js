/* =========================================================
   3D muvaffaqiyatli yuklansa — matnli zaxira variantni yashiradi.
   3D ishlamasa (WebGL yo'q) zaxira ko'rinib qoladi.
   ========================================================= */
(function () {
  'use strict';
  function tekshir() {
    document.querySelectorAll('[data-zaxira]').forEach(function (blok) {
      var canvas = blok.querySelector('canvas');
      if (!canvas || !canvas.width) return;          // 3D chizilmagan
      var z = document.getElementById(blok.dataset.zaxira);
      if (z) z.style.display = 'none';
    });
  }
  // 3D modullar kechroq yuklanadi — bir necha marta tekshiramiz
  window.addEventListener('load', function () {
    tekshir();
    setTimeout(tekshir, 600);
    setTimeout(tekshir, 1800);
    setTimeout(tekshir, 4000);
  });
})();
