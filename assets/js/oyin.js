/* =========================================================
   INTERAKTIV O'YIN DVIGATELI
   5 tur: saralash, klaster, maqol, juftlash, haYoq
   Kompyuterda sudrab (drag & drop), telefonda bosib ishlaydi.
   ========================================================= */
(function () {
  'use strict';

  var idish = document.querySelector('[data-oyin]');
  if (!idish || !window.OYINLAR) return;

  var N = parseInt(idish.getAttribute('data-oyin'), 10);
  var O = window.OYINLAR[N];
  if (!O) { idish.innerHTML = '<p class="oyin-yuklanmoqda">O‘yin topilmadi.</p>'; return; }

  /* ---------- yordamchilar ---------- */
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
  function saqla(foiz) {
    if (window.Xotira) window.Xotira.modulYoz(N, { oyin: foiz });
  }

  /* ---------- umumiy karkas ---------- */
  idish.innerHTML = '';
  var bosh = el('div', 'oyin-bosh');
  var nishon = el('span', 'nishon'); nishon.textContent = O.nishon || '🎮';
  nishon.setAttribute('aria-hidden', 'true');
  var h3 = el('h3', null, O.nom);
  var hisob = el('span', 'oyin-hisob', '0 / 0');
  var qoida = el('p', 'qoida', O.qoida);
  bosh.appendChild(nishon); bosh.appendChild(h3); bosh.appendChild(hisob); bosh.appendChild(qoida);
  idish.appendChild(bosh);

  var maydon = el('div', 'oyin-maydon');
  idish.appendChild(maydon);

  var xabar = el('div', 'oyin-xabar');
  xabar.setAttribute('role', 'status');
  var tugmalar = el('div', 'oyin-tugmalar');
  var tTekshir = el('button', 'tug tug-asos tug-kichik oyin-tekshir', 'Tekshirish');
  var tQayta = el('button', 'tug tug-ramka tug-kichik oyin-qayta', 'Qaytadan');
  tugmalar.appendChild(tTekshir); tugmalar.appendChild(tQayta);
  idish.appendChild(tugmalar);
  idish.appendChild(xabar);

  function natija(togri, jami) {
    var foiz = jami ? Math.round(togri / jami * 100) : 0;
    hisob.textContent = togri + ' / ' + jami;
    xabar.className = 'oyin-xabar korin ' + (foiz >= 80 ? 'yaxshi' : foiz >= 50 ? 'orta' : 'past');
    xabar.textContent = foiz >= 80
      ? 'Barakalla! ' + jami + ' tadan ' + togri + ' tasi to‘g‘ri (' + foiz + '%).'
      : foiz >= 50
        ? 'Yaxshi urinish: ' + togri + ' / ' + jami + ' (' + foiz + '%). Yana bir bor ko‘rib chiqing.'
        : 'Natija: ' + togri + ' / ' + jami + ' (' + foiz + '%). Ma’ruza matnini qayta o‘qib chiqing.';
    saqla(foiz);
  }

  /* =========================================================
     1) SARALASH — kartochkalarni savatlarga
     ========================================================= */
  function saralashQur() {
    var savatlar = O.savatlar;
    var bank = el('div', 'dona-bank');
    var tanlangan = null;

    var setka = el('div', O.jadval ? 't-jadval' : 'saralash');
    if (!O.jadval && savatlar.length > 2) setka.style.gridTemplateColumns = '';

    var savatEl = savatlar.map(function (s, i) {
      var quti, ichi;
      if (O.jadval) {
        quti = el('div', 't-ustun ' + (s.turi || ''));
        quti.appendChild(el('h4', null, s.nom));
        ichi = el('div', 'savat');
      } else {
        quti = el('div', 'savat');
        quti.appendChild(el('h4', null, s.nom));
        ichi = el('div', 'ichi');
      }
      var maqsad = O.jadval ? ichi : quti;
      var joy = O.jadval ? ichi : ichi;
      quti.appendChild(ichi);

      maqsad.addEventListener('dragover', function (e) { e.preventDefault(); maqsad.classList.add('ustida'); });
      maqsad.addEventListener('dragleave', function () { maqsad.classList.remove('ustida'); });
      maqsad.addEventListener('drop', function (e) {
        e.preventDefault(); maqsad.classList.remove('ustida');
        var id = e.dataTransfer.getData('text/plain');
        var d = document.getElementById(id);
        if (d) { joy.appendChild(d); d.dataset.savat = i; }
      });
      // Telefonda: avval kartochka, keyin savat bosiladi
      maqsad.addEventListener('click', function () {
        if (tanlangan) {
          joy.appendChild(tanlangan);
          tanlangan.dataset.savat = i;
          tanlangan.classList.remove('tanlangan');
          tanlangan = null;
        }
      });
      setka.appendChild(quti);
      return { quti: quti, joy: joy };
    });

    aralash(O.donalar).forEach(function (d, k) {
      var c = el('div', 'dona', d.matn);
      c.id = 'd' + N + '-' + k;
      c.draggable = true;
      c.tabIndex = 0;
      c.dataset.togri = d.s;
      c.addEventListener('dragstart', function (e) {
        e.dataTransfer.setData('text/plain', c.id);
        e.dataTransfer.effectAllowed = 'move';
      });
      c.addEventListener('click', function (e) {
        e.stopPropagation();
        if (tanlangan === c) { c.classList.remove('tanlangan'); tanlangan = null; return; }
        if (tanlangan) tanlangan.classList.remove('tanlangan');
        tanlangan = c; c.classList.add('tanlangan');
      });
      c.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); c.click(); }
      });
      bank.appendChild(c);
    });

    var bankQuti = el('div', 'bank-quti');
    bankQuti.appendChild(el('h4', null, 'Kartochkalar'));
    bankQuti.appendChild(bank);
    bankQuti.addEventListener('dragover', function (e) { e.preventDefault(); });
    bankQuti.addEventListener('drop', function (e) {
      e.preventDefault();
      var d = document.getElementById(e.dataTransfer.getData('text/plain'));
      if (d) { bank.appendChild(d); delete d.dataset.savat; }
    });
    bankQuti.addEventListener('click', function () {
      if (tanlangan) { bank.appendChild(tanlangan); delete tanlangan.dataset.savat;
        tanlangan.classList.remove('tanlangan'); tanlangan = null; }
    });

    maydon.appendChild(bankQuti);
    maydon.appendChild(setka);

    tTekshir.onclick = function () {
      var togri = 0, jami = O.donalar.length;
      maydon.querySelectorAll('.dona').forEach(function (c) {
        c.classList.remove('togri', 'xato');
        if (c.dataset.savat === undefined) return;
        if (c.dataset.savat === c.dataset.togri) { c.classList.add('togri'); togri++; }
        else c.classList.add('xato');
      });
      natija(togri, jami);
    };
    tQayta.onclick = function () {
      maydon.querySelectorAll('.dona').forEach(function (c) {
        c.classList.remove('togri', 'xato', 'tanlangan');
        delete c.dataset.savat;
        bank.appendChild(c);
      });
      tanlangan = null;
      xabar.className = 'oyin-xabar';
      hisob.textContent = '0 / ' + O.donalar.length;
    };
    hisob.textContent = '0 / ' + O.donalar.length;
  }

  /* =========================================================
     2) KLASTER — markaz + uyalar
     ========================================================= */
  function klasterQur() {
    var tanlangan = null;
    var jami = O.togri.length;

    var kl = el('div', 'klaster');
    var markaz = el('div', 'klaster-markaz', O.markaz);
    kl.appendChild(markaz);

    var tarmoq = el('div', 'klaster-tarmoq');
    var uyalar = [];
    for (var i = 0; i < jami; i++) {
      (function () {
        var u = el('div', 'klaster-uya', 'bo‘sh uya');
        u.addEventListener('dragover', function (e) { e.preventDefault(); u.classList.add('ustida'); });
        u.addEventListener('dragleave', function () { u.classList.remove('ustida'); });
        u.addEventListener('drop', function (e) {
          e.preventDefault(); u.classList.remove('ustida');
          joyla(document.getElementById(e.dataTransfer.getData('text/plain')), u);
        });
        u.addEventListener('click', function () {
          if (tanlangan) joyla(tanlangan, u);
          else if (u.dataset.dona) { qaytar(u); }
        });
        tarmoq.appendChild(u);
        uyalar.push(u);
      })();
    }
    kl.appendChild(tarmoq);

    var bank = el('div', 'dona-bank');
    var bankQuti = el('div', 'bank-quti');
    bankQuti.appendChild(el('h4', null, 'So‘zlar'));
    bankQuti.appendChild(bank);

    function joyla(d, u) {
      if (!d) return;
      if (u.dataset.dona) qaytar(u);          // uya band bo'lsa avval bo'shatamiz
      u.textContent = d.textContent;
      u.dataset.dona = d.id;
      u.dataset.togri = d.dataset.togri;
      u.classList.add('toldi');
      d.classList.add('ketdi');
      d.classList.remove('tanlangan');
      tanlangan = null;
    }
    function qaytar(u) {
      var d = document.getElementById(u.dataset.dona);
      if (d) d.classList.remove('ketdi', 'togri', 'xato');
      u.textContent = 'bo‘sh uya';
      u.className = 'klaster-uya';
      delete u.dataset.dona; delete u.dataset.togri;
    }

    var hamma = O.togri.map(function (s) { return { s: s, t: '1' }; })
      .concat(O.qoshimcha.map(function (s) { return { s: s, t: '0' }; }));
    aralash(hamma).forEach(function (x, k) {
      var c = el('div', 'dona', x.s);
      c.id = 'k' + N + '-' + k;
      c.draggable = true; c.tabIndex = 0;
      c.dataset.togri = x.t;
      c.addEventListener('dragstart', function (e) { e.dataTransfer.setData('text/plain', c.id); });
      c.addEventListener('click', function () {
        if (c.classList.contains('ketdi')) return;
        if (tanlangan === c) { c.classList.remove('tanlangan'); tanlangan = null; return; }
        if (tanlangan) tanlangan.classList.remove('tanlangan');
        tanlangan = c; c.classList.add('tanlangan');
      });
      c.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); c.click(); }
      });
      bank.appendChild(c);
    });

    maydon.appendChild(bankQuti);
    maydon.appendChild(kl);

    tTekshir.onclick = function () {
      var togri = 0;
      uyalar.forEach(function (u) {
        u.classList.remove('togri', 'xato');
        if (!u.dataset.dona) return;
        if (u.dataset.togri === '1') { u.classList.add('togri'); togri++; }
        else u.classList.add('xato');
      });
      natija(togri, jami);
    };
    tQayta.onclick = function () {
      uyalar.forEach(qaytar);
      maydon.querySelectorAll('.dona').forEach(function (c) {
        c.classList.remove('ketdi', 'tanlangan', 'togri', 'xato');
      });
      tanlangan = null;
      xabar.className = 'oyin-xabar';
      hisob.textContent = '0 / ' + jami;
    };
    hisob.textContent = '0 / ' + jami;
  }

  /* =========================================================
     3) MAQOL — davomini topish
     ========================================================= */
  function maqolQur() {
    var jami = O.savollar.length;
    O.savollar.forEach(function (s, i) {
      var q = el('div', 'maqol-savol');
      q.dataset.javob = s.javob;
      var p = el('p');
      p.appendChild(el('span', 'bosh', s.bosh + ' '));
      var joy = el('span', 'joy', '…');
      p.appendChild(joy);
      q.appendChild(p);

      var tanlov = el('div', 'javob-tanlov');
      aralash(s.variantlar).forEach(function (v) {
        var b = el('button', 'dona', v);
        b.type = 'button';
        b.addEventListener('click', function () {
          tanlov.querySelectorAll('.dona').forEach(function (x) { x.classList.remove('tanlangan'); });
          b.classList.add('tanlangan');
          joy.textContent = v;
          joy.classList.add('toldi');
          q.dataset.tanlangan = v;
        });
        tanlov.appendChild(b);
      });
      q.appendChild(tanlov);
      maydon.appendChild(q);
    });

    tTekshir.onclick = function () {
      var togri = 0;
      maydon.querySelectorAll('.maqol-savol').forEach(function (q) {
        var joy = q.querySelector('.joy');
        joy.classList.remove('xato-joy');
        q.querySelectorAll('.dona').forEach(function (b) {
          b.classList.remove('togri', 'xato');
          if (b.textContent === q.dataset.javob) b.classList.add('togri');
          else if (b.classList.contains('tanlangan')) b.classList.add('xato');
        });
        if (q.dataset.tanlangan === q.dataset.javob) togri++;
      });
      natija(togri, jami);
    };
    tQayta.onclick = function () {
      maydon.querySelectorAll('.maqol-savol').forEach(function (q) {
        delete q.dataset.tanlangan;
        var joy = q.querySelector('.joy');
        joy.textContent = '…'; joy.classList.remove('toldi');
        q.querySelectorAll('.dona').forEach(function (b) {
          b.classList.remove('togri', 'xato', 'tanlangan');
        });
      });
      xabar.className = 'oyin-xabar';
      hisob.textContent = '0 / ' + jami;
    };
    hisob.textContent = '0 / ' + jami;
  }

  /* =========================================================
     4) JUFTLASH — chap va o'ng ustun
     ========================================================= */
  function juftlashQur() {
    var jami = O.juftlar.length;
    var tanlanganChap = null;
    var juft = {};   // chapIndex -> ongIndex

    var setka = el('div', 'juftlash');
    var chapUst = el('div', 'juft-ustun');
    var ongUst = el('div', 'juft-ustun');
    chapUst.appendChild(el('h4', null, 'Tushuncha'));
    ongUst.appendChild(el('h4', null, 'Ta’rif'));

    var ongTartib = aralash(O.juftlar.map(function (p, i) { return i; }));

    O.juftlar.forEach(function (p, i) {
      var c = el('button', 'juft-dona chap', p[0]);
      c.type = 'button'; c.dataset.i = i;
      c.addEventListener('click', function () {
        if (c.disabled) return;
        chapUst.querySelectorAll('.juft-dona').forEach(function (x) { x.classList.remove('tanlangan'); });
        c.classList.add('tanlangan');
        tanlanganChap = c;
      });
      chapUst.appendChild(c);
    });

    ongTartib.forEach(function (i) {
      var c = el('button', 'juft-dona ong', O.juftlar[i][1]);
      c.type = 'button'; c.dataset.i = i;
      c.addEventListener('click', function () {
        if (!tanlanganChap || c.disabled) return;
        var ci = tanlanganChap.dataset.i;
        // avvalgi bog'lanishlarni tozalash
        Object.keys(juft).forEach(function (k) { if (juft[k] === c.dataset.i) delete juft[k]; });
        juft[ci] = c.dataset.i;
        tanlanganChap.classList.remove('tanlangan');
        tanlanganChap.classList.add('bogli');
        tanlanganChap.dataset.juft = c.dataset.i;
        c.classList.add('bogli');
        // bog'langan juftni raqamlash
        var no = Object.keys(juft).length;
        tanlanganChap.dataset.belgi = no; c.dataset.belgi = no;
        tanlanganChap = null;
        yangilaHisob();
      });
      ongUst.appendChild(c);
    });

    function yangilaHisob() { hisob.textContent = Object.keys(juft).length + ' / ' + jami; }

    setka.appendChild(chapUst); setka.appendChild(ongUst);
    maydon.appendChild(setka);
    yangilaHisob();

    tTekshir.onclick = function () {
      var togri = 0;
      chapUst.querySelectorAll('.juft-dona').forEach(function (c) {
        c.classList.remove('togri', 'xato');
        var j = juft[c.dataset.i];
        if (j === undefined) return;
        if (j === c.dataset.i) { c.classList.add('togri'); togri++; }
        else c.classList.add('xato');
      });
      ongUst.querySelectorAll('.juft-dona').forEach(function (c) {
        c.classList.remove('togri', 'xato');
        var bogliChap = Object.keys(juft).filter(function (k) { return juft[k] === c.dataset.i; })[0];
        if (bogliChap === undefined) return;
        if (bogliChap === c.dataset.i) c.classList.add('togri');
        else c.classList.add('xato');
      });
      natija(togri, jami);
    };
    tQayta.onclick = function () {
      juft = {}; tanlanganChap = null;
      maydon.querySelectorAll('.juft-dona').forEach(function (c) {
        c.classList.remove('togri', 'xato', 'bogli', 'tanlangan');
        delete c.dataset.juft; delete c.dataset.belgi;
      });
      xabar.className = 'oyin-xabar';
      yangilaHisob();
    };
  }

  /* =========================================================
     5) HA / YO'Q
     ========================================================= */
  function haYoqQur() {
    var jami = O.gaplar.length;
    O.gaplar.forEach(function (g, i) {
      var q = el('div', 'hayoq-savol');
      q.dataset.togri = g.togri ? '1' : '0';
      q.appendChild(el('p', 'hayoq-matn', (i + 1) + '. ' + g.matn));
      var tanlov = el('div', 'hayoq-tanlov');
      [['Ha', '1'], ['Yo‘q', '0']].forEach(function (v) {
        var b = el('button', 'tug tug-ramka tug-kichik hayoq-tug', v[0]);
        b.type = 'button'; b.dataset.qiymat = v[1];
        b.addEventListener('click', function () {
          tanlov.querySelectorAll('button').forEach(function (x) { x.classList.remove('tanlangan'); });
          b.classList.add('tanlangan');
          q.dataset.tanlangan = v[1];
        });
        tanlov.appendChild(b);
      });
      q.appendChild(tanlov);
      var iz = el('p', 'hayoq-izoh', g.izoh);
      q.appendChild(iz);
      maydon.appendChild(q);
    });

    tTekshir.onclick = function () {
      var togri = 0;
      maydon.querySelectorAll('.hayoq-savol').forEach(function (q) {
        q.classList.remove('togri', 'xato');
        q.querySelector('.hayoq-izoh').classList.add('korin');
        if (q.dataset.tanlangan === undefined) return;
        if (q.dataset.tanlangan === q.dataset.togri) { q.classList.add('togri'); togri++; }
        else q.classList.add('xato');
      });
      natija(togri, jami);
    };
    tQayta.onclick = function () {
      maydon.querySelectorAll('.hayoq-savol').forEach(function (q) {
        q.classList.remove('togri', 'xato');
        delete q.dataset.tanlangan;
        q.querySelector('.hayoq-izoh').classList.remove('korin');
        q.querySelectorAll('button').forEach(function (b) { b.classList.remove('tanlangan'); });
      });
      xabar.className = 'oyin-xabar';
      hisob.textContent = '0 / ' + jami;
    };
    hisob.textContent = '0 / ' + jami;
  }

  /* ---------- ishga tushirish ---------- */
  ({ saralash: saralashQur, klaster: klasterQur, maqol: maqolQur,
     juftlash: juftlashQur, haYoq: haYoqQur }[O.tur] || function () {
    maydon.innerHTML = '<p>Noma’lum o‘yin turi.</p>';
  })();

})();
