/* Glossariy va adabiyotlar sahifasidagi jonli qidiruv */
(function () {
  'use strict';
  var maydon = document.getElementById('qidiruv');
  var royxat = document.getElementById('royxat');
  var soni  = document.getElementById('qidiruv-soni');
  var boshYoq = document.getElementById('bosh-yoq');
  if (!maydon || !royxat) return;

  var qatorlar = Array.prototype.slice.call(royxat.children);
  var jami = qatorlar.length;
  var birlik = soni ? soni.textContent.replace(/^\d+\s*/, '') : '';

  function filtr() {
    var s = maydon.value.trim().toLowerCase();
    var korindi = 0;
    qatorlar.forEach(function (li) {
      var mos = !s || (li.dataset.qidiruv || li.textContent.toLowerCase()).indexOf(s) !== -1;
      li.hidden = !mos;
      if (mos) korindi++;
    });
    if (soni) soni.textContent = korindi + ' ' + birlik;
    if (boshYoq) boshYoq.hidden = korindi !== 0;
  }
  maydon.addEventListener('input', filtr);
})();
