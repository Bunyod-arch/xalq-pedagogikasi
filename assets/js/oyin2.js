/* =========================================================
   QO'SHIMCHA O'YIN DVIGATELI
   Uch tur: topishmoq · topish (do'ppi o'yini) · sahna (teatr)
   ========================================================= */
(function () {
  'use strict';

  var idish = document.querySelector('[data-oyin2]');
  if (!idish || !window.OYINLAR2) return;

  var N = parseInt(idish.getAttribute('data-oyin2'), 10);
  var O = window.OYINLAR2[N];
  if (!O) { idish.innerHTML = ''; return; }

  function el(t, k, m) { var e = document.createElement(t); if (k) e.className = k; if (m != null) e.textContent = m; return e; }
  function aralash(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function saqla(k, v) { if (window.Xotira) { var o = {}; o[k] = v; window.Xotira.modulYoz(N, o); } }

  /* ---------- Umumiy karkas ---------- */
  idish.innerHTML = '';
  var bosh = el('div', 'oyin-bosh');
  var nish = el('span', 'nishon'); nish.textContent = O.nishon; nish.setAttribute('aria-hidden', 'true');
  var hisob = el('span', 'oyin-hisob', '');
  bosh.appendChild(nish);
  bosh.appendChild(el('h3', null, O.nom));
  bosh.appendChild(hisob);
  bosh.appendChild(el('p', 'qoida', O.qoida));
  idish.appendChild(bosh);

  var maydon = el('div', 'oyin-maydon');
  idish.appendChild(maydon);
  var xabar = el('div', 'oyin-xabar');
  xabar.setAttribute('role', 'status');

  function natija(togri, jami, kalit) {
    var f = jami ? Math.round(togri / jami * 100) : 0;
    hisob.textContent = togri + ' / ' + jami;
    xabar.className = 'oyin-xabar korin ' + (f >= 80 ? 'yaxshi' : f >= 50 ? 'orta' : 'past');
    xabar.textContent = f >= 80 ? 'Barakalla! ' + togri + ' / ' + jami + ' (' + f + '%).'
      : f >= 50 ? 'Yaxshi urinish: ' + togri + ' / ' + jami + ' (' + f + '%).'
      : 'Natija: ' + togri + ' / ' + jami + ' (' + f + '%). Qaytadan urinib ko‘ring.';
    saqla(kalit || 'oyin2', f);
  }

  /* =========================================================
     1) TOPISHMOQ
     ========================================================= */
  function topishmoqQur() {
    var jami = O.savollar.length, togri = 0, javobBerilgan = 0;
    hisob.textContent = '0 / ' + jami;

    O.savollar.forEach(function (s, i) {
      var karta = el('div', 'topishmoq-karta');
      karta.appendChild(el('p', 'tm-matn', s.matn));
      var tanlov = el('div', 'javob-tanlov');
      aralash(s.variantlar).forEach(function (v) {
        var b = el('button', 'dona', v);
        b.type = 'button';
        b.addEventListener('click', function () {
          if (karta.dataset.tugadi) return;
          karta.dataset.tugadi = '1';
          javobBerilgan++;
          tanlov.querySelectorAll('.dona').forEach(function (x) {
            if (x.textContent === s.javob) x.classList.add('togri');
            else if (x === b) x.classList.add('xato');
            x.disabled = true;
          });
          if (v === s.javob) togri++;
          var iz = karta.querySelector('.tm-izoh');
          iz.textContent = (v === s.javob ? '✓ ' : '✗ To‘g‘ri javob: ' + s.javob + '. ') + s.izoh;
          iz.classList.add('korin', v === s.javob ? 'yaxshi' : 'past');
          hisob.textContent = togri + ' / ' + jami;
          if (javobBerilgan === jami) natija(togri, jami, 'topishmoq');
        });
        tanlov.appendChild(b);
      });
      karta.appendChild(tanlov);
      karta.appendChild(el('p', 'tm-izoh', ''));
      maydon.appendChild(karta);
    });

    var t = el('div', 'oyin-tugmalar');
    var q = el('button', 'tug tug-ramka tug-kichik', 'Qaytadan');
    q.type = 'button';
    q.addEventListener('click', function () { maydon.innerHTML = ''; xabar.className = 'oyin-xabar'; topishmoqQur(); });
    t.appendChild(q);
    idish.appendChild(t);
    idish.appendChild(xabar);
  }

  /* =========================================================
     2) TOPISH — «O'rta qo'lini top» (do'ppi o'yini)
     ========================================================= */
  function topishQur() {
    var soni = O.dopqi || 4;
    var daraja = O.boshDaraja || 1;
    var olmaJoyi = 0, holat = 'tayyor';   // tayyor | aralashmoqda | tanlash
    var eng = 0;

    var maslahat = el('p', 'topish-maslahat', 'Olma qayerdaligini ko‘rsatamiz, so‘ng do‘ppilar aralashadi.');
    maydon.appendChild(maslahat);

    var qator = el('div', 'doppi-qator');
    var doppilar = [];
    for (var i = 0; i < soni; i++) {
      (function (k) {
        var d = el('button', 'doppi');
        d.type = 'button';
        d.setAttribute('aria-label', (k + 1) + '-do‘ppi');
        d.innerHTML =
          '<span class="olma" aria-hidden="true">🍎</span>' +
          '<svg class="doppi-rasm" viewBox="0 0 90 62" aria-hidden="true">' +
          '<path d="M12 40C12 22 26 10 45 10s33 12 33 30z" fill="#16162E"/>' +
          '<rect x="6" y="38" width="78" height="15" rx="6" fill="#101024"/>' +
          '<path d="M20 45.5c0-3 1.6-5.5 3.2-5.5s3.2 2.5 3.2 5.5-1.6 5.5-3.2 5.5-3.2-2.5-3.2-5.5z" fill="#FBF7F0"/>' +
          '<path d="M38 45.5c0-3 1.6-5.5 3.2-5.5s3.2 2.5 3.2 5.5-1.6 5.5-3.2 5.5-3.2-2.5-3.2-5.5z" fill="#FBF7F0"/>' +
          '<path d="M56 45.5c0-3 1.6-5.5 3.2-5.5s3.2 2.5 3.2 5.5-1.6 5.5-3.2 5.5-3.2-2.5-3.2-5.5z" fill="#FBF7F0"/>' +
          '<path d="M40 20l5-8 5 8-5 5z" fill="#FBF7F0" opacity=".85"/>' +
          '</svg>';
        d.addEventListener('click', function () { tanlandi(k); });
        qator.appendChild(d);
        doppilar.push(d);
      })(i);
    }
    maydon.appendChild(qator);

    var boshTugma = el('button', 'tug tug-asos tug-kichik', '▶ Boshlash');
    boshTugma.type = 'button';
    boshTugma.addEventListener('click', boshla);
    var tugmalar = el('div', 'oyin-tugmalar');
    tugmalar.appendChild(boshTugma);
    idish.appendChild(tugmalar);
    idish.appendChild(xabar);
    yangilaHisob();

    function yangilaHisob() { hisob.textContent = 'Daraja ' + daraja + (eng ? ' · rekord ' + eng : ''); }

    function boshla() {
      if (holat === 'aralashmoqda') return;
      xabar.className = 'oyin-xabar';
      doppilar.forEach(function (d) { d.classList.remove('togri', 'xato', 'ochiq'); });
      olmaJoyi = Math.floor(Math.random() * soni);
      doppilar[olmaJoyi].classList.add('ochiq');
      maslahat.textContent = 'Olma shu yerda — eslab qoling!';
      holat = 'aralashmoqda';
      boshTugma.disabled = true;

      setTimeout(function () {
        doppilar[olmaJoyi].classList.remove('ochiq');
        maslahat.textContent = 'Aralashmoqda…';
        aralashtir(6 + daraja * 2, Math.max(150, 420 - daraja * 30));
      }, 1100);
    }

    function aralashtir(qolgan, tezlik) {
      if (qolgan <= 0) {
        holat = 'tanlash';
        maslahat.textContent = 'Olma qaysi do‘ppi ostida? Tanlang.';
        boshTugma.disabled = false;
        return;
      }
      var a = Math.floor(Math.random() * soni);
      var b = Math.floor(Math.random() * soni);
      while (b === a) b = Math.floor(Math.random() * soni);
      if (olmaJoyi === a) olmaJoyi = b; else if (olmaJoyi === b) olmaJoyi = a;

      var da = doppilar[a], db = doppilar[b];
      var xa = da.getBoundingClientRect().left, xb = db.getBoundingClientRect().left;
      da.style.transition = db.style.transition = 'transform ' + tezlik + 'ms cubic-bezier(.4,0,.2,1)';
      da.style.transform = 'translateX(' + (xb - xa) + 'px)';
      db.style.transform = 'translateX(' + (xa - xb) + 'px)';
      setTimeout(function () {
        da.style.transition = db.style.transition = 'none';
        da.style.transform = db.style.transform = '';
        // DOM tartibini ham almashtiramiz
        var joy = document.createElement('span');
        qator.insertBefore(joy, da);
        qator.insertBefore(da, db);
        qator.insertBefore(db, joy);
        qator.removeChild(joy);
        var ta = doppilar[a]; doppilar[a] = doppilar[b]; doppilar[b] = ta;
        aralashtir(qolgan - 1, tezlik);
      }, tezlik + 20);
    }

    function tanlandi(k) {
      if (holat !== 'tanlash') return;
      holat = 'tayyor';
      doppilar[olmaJoyi].classList.add('ochiq');
      if (k === olmaJoyi) {
        doppilar[k].classList.add('togri');
        daraja++;
        if (daraja - 1 > eng) { eng = daraja - 1; saqla('topish', eng); }
        maslahat.textContent = 'Topdingiz!';
        xabar.className = 'oyin-xabar korin yaxshi';
        xabar.textContent = 'Barakalla! Keyingi daraja — aralashtirish tezroq bo‘ladi.';
      } else {
        doppilar[k].classList.add('xato');
        maslahat.textContent = 'Bu safar topilmadi.';
        xabar.className = 'oyin-xabar korin past';
        xabar.textContent = 'Olma boshqa do‘ppi ostida edi. Yana urinib ko‘ring — diqqat mashq bilan o‘tkirlashadi.';
        daraja = Math.max(1, daraja - 1);
      }
      yangilaHisob();
    }
  }

  /* =========================================================
     3) SAHNA — qo'g'irchoq teatri
     ========================================================= */
  function sahnaQur() {
    var tanlangan = { qahramon: null, sahna: null, xulosa: null };

    function guruh(sarlavha, royxat, kalit, nishonli) {
      var b = el('div', 'sahna-guruh');
      b.appendChild(el('h4', null, sarlavha));
      var q = el('div', 'sahna-tanlov');
      royxat.forEach(function (x, i) {
        var nomi = nishonli ? x.nom : x;
        var t = el('button', 'sahna-dona');
        t.type = 'button';
        t.innerHTML = (nishonli ? '<span class="sd-nishon" aria-hidden="true">' + x.nishon + '</span>' : '') +
                      '<span class="sd-nom">' + nomi + '</span>';
        t.addEventListener('click', function () {
          q.querySelectorAll('.sahna-dona').forEach(function (y) { y.classList.remove('tanlangan'); });
          t.classList.add('tanlangan');
          tanlangan[kalit] = x;
          chiz();
        });
        q.appendChild(t);
      });
      b.appendChild(q);
      return b;
    }

    maydon.appendChild(guruh('1. Qahramonni tanlang', O.qahramonlar, 'qahramon', true));
    maydon.appendChild(guruh('2. Sahnani tanlang', O.sahnalar, 'sahna', true));
    maydon.appendChild(guruh('3. Xulosa (maqol)', O.xulosalar, 'xulosa', false));

    var natijaQuti = el('div', 'sahna-natija');
    natijaQuti.innerHTML = '<p class="sahna-bosh">Uchala qismni tanlang — spektakl matni shu yerda paydo bo‘ladi.</p>';
    maydon.appendChild(natijaQuti);

    function chiz() {
      var q = tanlangan.qahramon, s = tanlangan.sahna, x = tanlangan.xulosa;
      if (!q || !s || !x) return;
      natijaQuti.innerHTML =
        '<div class="sahna-parda">' +
          '<div class="sahna-qahramon"><span aria-hidden="true">' + q.nishon + '</span>' +
            '<span aria-hidden="true">' + s.nishon + '</span></div>' +
          '<h4>' + q.nom + ' — «' + s.nom + '»</h4>' +
          '<p><b>Sahna:</b> ' + s.matn.charAt(0).toUpperCase() + s.matn.slice(1) + '.</p>' +
          '<p><b>Qahramon:</b> ' + q.nom + ' — ' + q.tavsif + '.</p>' +
          '<p><b>Voqea:</b> ' + q.nom + ' bu yerga kelib, atrofdagilarga o‘z hunari va so‘zi bilan ta’sir qiladi. ' +
            'Kichik bir tortishuv chiqadi, ammo u sabr va donishmandlik bilan hal qilinadi.</p>' +
          '<p class="sahna-xulosa">' + x + '</p>' +
          '<p class="sahna-maslahat">Bu matnni sinfda qo‘g‘irchoq yoki drama to‘garagida sahnalashtirish mumkin. ' +
            'Har bir tanlov yangi voqea beradi — sinab ko‘ring.</p>' +
        '</div>';
      natijaQuti.classList.add('korin');
      saqla('sahna', 100);
    }
  }

  ({ topishmoq: topishmoqQur, topish: topishQur, sahna: sahnaQur }[O.tur] || function () {})();
})();
