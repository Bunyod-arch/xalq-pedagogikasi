/* =========================================================
   TEST DVIGATELI
   Variantlar har safar aralashtiriladi, natija avtomatik chiqadi.
   ========================================================= */
(function () {
  'use strict';

  var idish = document.querySelector('[data-test]');
  if (!idish || !window.TESTLAR) return;

  var N = parseInt(idish.getAttribute('data-test'), 10);
  var SAVOLLAR = window.TESTLAR[N];
  if (!SAVOLLAR || !SAVOLLAR.length) {
    idish.innerHTML = '<p class="test-yuklanmoqda">Test topilmadi.</p>';
    return;
  }

  function el(tag, klass, matn) {
    var e = document.createElement(tag);
    if (klass) e.className = klass;
    if (matn != null) e.textContent = matn;
    return e;
  }
  function aralash(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  var jami = SAVOLLAR.length;
  var maydon, natijaQuti;

  function qur() {
    idish.innerHTML = '';

    var sarl = el('h2', 'quti-sarl');
    var nishon = el('span', 'nishon', '📝');
    nishon.setAttribute('aria-hidden', 'true');
    sarl.appendChild(nishon);
    sarl.appendChild(document.createTextNode('Nazorat testi'));
    idish.appendChild(sarl);

    var izoh = el('p', 'quti-izoh',
      jami + ' ta savol. Javoblarni belgilab, «Natijani ko‘rish» tugmasini bosing.');
    idish.appendChild(izoh);

    maydon = el('div', 'test-maydon');
    idish.appendChild(maydon);

    SAVOLLAR.forEach(function (q, i) {
      var blok = el('div', 'test-savol');
      blok.dataset.togri = q.v[q.t];      // to'g'ri javob MATNI bo'yicha solishtiramiz

      var matn = el('p', 'matn');
      var n = el('span', 'n', String(i + 1));
      n.setAttribute('aria-hidden', 'true');
      matn.appendChild(n);
      matn.appendChild(document.createTextNode(q.s));
      blok.appendChild(matn);

      var guruh = el('div', 'test-variantlar');
      guruh.setAttribute('role', 'radiogroup');
      guruh.setAttribute('aria-label', (i + 1) + '-savol variantlari');

      aralash(q.v).forEach(function (v, k) {
        var yorliq = el('label', 'variant');
        var inp = document.createElement('input');
        inp.type = 'radio';
        inp.name = 'm' + N + 'q' + i;
        inp.value = v;
        inp.addEventListener('change', function () {
          guruh.querySelectorAll('.variant').forEach(function (x) { x.classList.remove('tanlangan'); });
          yorliq.classList.add('tanlangan');
        });
        yorliq.appendChild(inp);
        yorliq.appendChild(el('span', 'variant-matn', v));
        yorliq.appendChild(el('span', 'belgi', ''));
        guruh.appendChild(yorliq);
      });
      blok.appendChild(guruh);

      var iz = el('p', 'test-izoh', q.i || '');
      blok.appendChild(iz);

      maydon.appendChild(blok);
    });

    var tugmalar = el('div', 'oyin-tugmalar');
    var tKor = el('button', 'tug tug-asos tug-kichik test-korish', 'Natijani ko‘rish');
    var tQayta = el('button', 'tug tug-ramka tug-kichik test-qayta', 'Testni qaytadan yechish');
    tugmalar.appendChild(tKor); tugmalar.appendChild(tQayta);
    idish.appendChild(tugmalar);

    natijaQuti = el('div', 'test-natija');
    natijaQuti.setAttribute('role', 'status');
    idish.appendChild(natijaQuti);

    tKor.addEventListener('click', tekshir);
    tQayta.addEventListener('click', qur);
  }

  function tekshir() {
    var togri = 0, belgilanmagan = 0;

    maydon.querySelectorAll('.test-savol').forEach(function (blok) {
      var javob = blok.querySelector('input:checked');
      if (!javob) belgilanmagan++;

      blok.querySelectorAll('.variant').forEach(function (y) {
        y.classList.remove('togri', 'xato');
        var inp = y.querySelector('input');
        var belgi = y.querySelector('.belgi');
        belgi.textContent = '';

        if (inp.value === blok.dataset.togri) {
          y.classList.add('togri');
          belgi.textContent = '✓';
        } else if (inp.checked) {
          y.classList.add('xato');
          belgi.textContent = '✕';
        }
        inp.disabled = true;
      });

      if (javob && javob.value === blok.dataset.togri) togri++;
      blok.querySelector('.test-izoh').classList.add('korin');
    });

    var foiz = Math.round(togri / jami * 100);
    var baho = foiz >= 86 ? 'A’lo' : foiz >= 71 ? 'Yaxshi' : foiz >= 56 ? 'Qoniqarli' : 'Qayta o‘qish tavsiya etiladi';

    natijaQuti.innerHTML = '';
    var halqa = el('div', 'halqa');
    var chap = el('div');
    chap.appendChild(el('div', 'foiz', foiz + '%'));
    chap.appendChild(el('div', 'baho', togri + ' / ' + jami + ' to‘g‘ri · ' + baho));
    halqa.appendChild(chap);
    if (belgilanmagan) {
      halqa.appendChild(el('div', 'baho', belgilanmagan + ' ta savol belgilanmagan qoldi.'));
    }
    natijaQuti.appendChild(halqa);
    natijaQuti.classList.add('korin');
    natijaQuti.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    if (window.Xotira) window.Xotira.modulYoz(N, { test: foiz });
  }

  qur();
})();
