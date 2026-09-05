/* =========================================================
   MILLIY CHOLG‘ULAR — chalinadigan interaktiv blok
   Tovush Web Audio API bilan sintez qilinadi (audio fayl kerak emas):
     · torli cholg‘ular — Karplus-Strong tor modeli
     · doira            — shovqin portlashi + past chastota
     · nay              — sinus + nafas shovqini + vibrato
   Ikki rejim: erkin chalish va «Ohangni takrorlang» o‘yini.
   ========================================================= */
(function () {
  'use strict';

  var idish = document.getElementById('cholgu');
  if (!idish) return;

  /* ---------------- Cholg‘ular ta’rifi ---------------- */
  // sust — tovush qancha uzoq yangraydi; yorqin — tembr yorqinligi
  var CHOLGULAR = {
    dutor:   { nom:'Dutor',    nishon:'🪕', tur:'tor',   sust:0.9965, yorqin:0.28, kuch:0.55,
               izoh:'Ikki torli, yumshoq va mayin ovozli — eng keng tarqalgan milliy cholg‘u.' },
    rubob:   { nom:'Rubob',    nishon:'🎻', tur:'tor',   sust:0.9945, yorqin:0.72, kuch:0.5,
               izoh:'Yorqin, jarangdor ovozli torli cholg‘u; ansambllarda yetakchi.' },
    dombira: { nom:'Do‘mbira', nishon:'🪗', tur:'tor',   sust:0.9955, yorqin:0.18, kuch:0.62,
               izoh:'Baxshilar doston aytganda jo‘r bo‘ladigan ikki torli cholg‘u.' },
    chang:   { nom:'Chang',    nishon:'🎼', tur:'tor',   sust:0.9985, yorqin:0.88, kuch:0.42,
               izoh:'Taxta ustidagi ko‘p torlar cho‘p bilan uriladi — qo‘ng‘iroqsimon ovoz.' },
    nay:     { nom:'Nay',      nishon:'🎶', tur:'puflama', kuch:0.34,
               izoh:'Qamishdan yasalgan puflama cholg‘u; cho‘ponlar sadosi.' },
    doira:   { nom:'Doira',    nishon:'🥁', tur:'zarb',  kuch:0.8,
               izoh:'Charm tortilgan doira — «dum», «bak», «tak» zarblari bilan usul beradi.' }
  };

  // Sharqona (Hijoz) tovushqator — milliy ohangga yaqin
  var PARDALAR = [
    { nom:'Do',  hz:146.83 }, { nom:'Re♭', hz:155.56 }, { nom:'Mi',  hz:185.00 },
    { nom:'Fa',  hz:196.00 }, { nom:'Sol', hz:220.00 }, { nom:'Lya♭',hz:233.08 },
    { nom:'Si',  hz:277.18 }, { nom:'Do′', hz:293.66 }
  ];
  var DOIRA = [
    { nom:'Dum', hz:92,  uzun:0.42, tur:'past' },
    { nom:'Bak', hz:210, uzun:0.20, tur:'orta' },
    { nom:'Tak', hz:430, uzun:0.13, tur:'baland' },
    { nom:'Ka',  hz:640, uzun:0.09, tur:'baland' }
  ];
  var TUGMALAR = ['a','s','d','f','g','h','j','k'];

  /* ---------------- Audio ---------------- */
  var AC = null;
  function audio() {
    if (!AC) {
      var K = window.AudioContext || window.webkitAudioContext;
      if (!K) return null;
      AC = new K();
    }
    if (AC.state === 'suspended') AC.resume();
    return AC;
  }

  // Karplus-Strong: shovqin bilan to'ldirilgan halqa kechiktirgich
  function torBuferi(ac, hz, sust, yorqin, uzun) {
    var sr = ac.sampleRate;
    var N = Math.max(2, Math.round(sr / hz));
    var uzunlik = Math.floor(sr * uzun);
    var bufer = ac.createBuffer(1, uzunlik, sr);
    var chiq = bufer.getChannelData(0);

    var halqa = new Float32Array(N);
    var oldingi = 0;
    for (var i = 0; i < N; i++) {
      var shovqin = Math.random() * 2 - 1;
      // yorqinlik: past chastotali filtr bilan boshlang'ich tembrni sozlaymiz
      oldingi = oldingi + (shovqin - oldingi) * (0.18 + yorqin * 0.8);
      halqa[i] = oldingi;
    }

    var j = 0;
    for (var k = 0; k < uzunlik; k++) {
      var joriy = halqa[j];
      var keyingi = halqa[(j + 1) % N];
      halqa[j] = (joriy + keyingi) * 0.5 * sust;
      chiq[k] = joriy;
      j = (j + 1) % N;
    }
    // yumshoq boshlanish va tugash — chirsillash bo'lmasin
    var kir = Math.min(160, uzunlik);
    for (var a = 0; a < kir; a++) chiq[a] *= a / kir;
    var chiqish = Math.min(2000, uzunlik);
    for (var c = 0; c < chiqish; c++) {
      chiq[uzunlik - 1 - c] *= c / chiqish;
    }
    return bufer;
  }

  function torChal(ac, ch, hz) {
    var uzun = ch.sust > 0.997 ? 3.2 : ch.sust > 0.996 ? 2.6 : 2.0;
    var manba = ac.createBufferSource();
    manba.buffer = torBuferi(ac, hz, ch.sust, ch.yorqin, uzun);
    var filtr = ac.createBiquadFilter();
    filtr.type = 'lowpass';
    filtr.frequency.value = 900 + ch.yorqin * 5200;
    var kuch = ac.createGain();
    kuch.gain.value = ch.kuch;
    manba.connect(filtr); filtr.connect(kuch); kuch.connect(ac.destination);
    manba.start();
    manba.stop(ac.currentTime + uzun);
  }

  function nayChal(ac, ch, hz) {
    var t = ac.currentTime, uzun = 1.5;
    var osts = ac.createOscillator(); osts.type = 'sine'; osts.frequency.value = hz * 2;
    var qosh = ac.createOscillator(); qosh.type = 'triangle'; qosh.frequency.value = hz * 4;
    var qoshG = ac.createGain(); qoshG.gain.value = 0.10;

    // vibrato
    var lfo = ac.createOscillator(); lfo.frequency.value = 5.2;
    var lfoG = ac.createGain(); lfoG.gain.value = hz * 0.018;
    lfo.connect(lfoG); lfoG.connect(osts.frequency);

    // nafas shovqini
    var uz = Math.floor(ac.sampleRate * uzun);
    var nb = ac.createBuffer(1, uz, ac.sampleRate);
    var nd = nb.getChannelData(0);
    for (var i = 0; i < uz; i++) nd[i] = (Math.random() * 2 - 1) * 0.05;
    var nafas = ac.createBufferSource(); nafas.buffer = nb;
    var nf = ac.createBiquadFilter(); nf.type = 'bandpass';
    nf.frequency.value = hz * 3; nf.Q.value = 1.1;
    var nafasG = ac.createGain(); nafasG.gain.value = 0.5;

    var g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(ch.kuch, t + 0.09);
    g.gain.setValueAtTime(ch.kuch, t + uzun - 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t + uzun);

    osts.connect(g); qosh.connect(qoshG); qoshG.connect(g);
    nafas.connect(nf); nf.connect(nafasG); nafasG.connect(g);
    g.connect(ac.destination);

    osts.start(t); qosh.start(t); lfo.start(t); nafas.start(t);
    osts.stop(t + uzun); qosh.stop(t + uzun); lfo.stop(t + uzun); nafas.stop(t + uzun);
  }

  function doiraChal(ac, ch, zarb) {
    var t = ac.currentTime, uzun = zarb.uzun;
    // charm shovqini
    var uz = Math.floor(ac.sampleRate * uzun);
    var nb = ac.createBuffer(1, uz, ac.sampleRate);
    var nd = nb.getChannelData(0);
    for (var i = 0; i < uz; i++) nd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / uz, 2.2);
    var shovqin = ac.createBufferSource(); nb && (shovqin.buffer = nb);
    var sf = ac.createBiquadFilter();
    sf.type = zarb.tur === 'past' ? 'lowpass' : 'bandpass';
    sf.frequency.value = zarb.tur === 'past' ? 260 : zarb.hz * 2.4;
    sf.Q.value = 1.4;
    var sg = ac.createGain();
    sg.gain.value = zarb.tur === 'past' ? 0.55 : 0.85;

    // asosiy ton (membrana)
    var o = ac.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(zarb.hz * 1.6, t);
    o.frequency.exponentialRampToValueAtTime(zarb.hz, t + uzun * 0.7);
    var og = ac.createGain();
    og.gain.setValueAtTime(ch.kuch * (zarb.tur === 'past' ? 1 : 0.45), t);
    og.gain.exponentialRampToValueAtTime(0.0001, t + uzun);

    shovqin.connect(sf); sf.connect(sg); sg.connect(ac.destination);
    o.connect(og); og.connect(ac.destination);
    shovqin.start(t); o.start(t); o.stop(t + uzun);
  }

  /* ---------------- Holat ---------------- */
  var joriyKalit = 'dutor';
  var rejim = 'erkin';          // 'erkin' | 'oyin'
  var ohang = [], qadam = 0, daraja = 1, oynalmoqda = false, kutmoqda = false;

  function chal(i) {
    var ac = audio();
    var ch = CHOLGULAR[joriyKalit];
    if (ac) {
      if (ch.tur === 'zarb') doiraChal(ac, ch, DOIRA[i]);
      else if (ch.tur === 'puflama') nayChal(ac, ch, PARDALAR[i].hz);
      else torChal(ac, ch, PARDALAR[i].hz);
    }
    urgu(i);
  }

  function urgu(i) {
    var p = idish.querySelectorAll('.parda')[i];
    if (!p) return;
    p.classList.remove('chalindi'); void p.offsetWidth; p.classList.add('chalindi');
    var tor = idish.querySelectorAll('.tor-chizigi')[i % 6];
    if (tor) { tor.classList.remove('tebranmoqda'); void tor.offsetWidth; tor.classList.add('tebranmoqda'); }
  }

  /* ---------------- Chizish ---------------- */
  function el(t, k, m) { var e = document.createElement(t); if (k) e.className = k; if (m != null) e.textContent = m; return e; }

  function qur() {
    idish.innerHTML = '';

    var bosh = el('div', 'oyin-bosh');
    var n = el('span', 'nishon', '🎵'); n.setAttribute('aria-hidden', 'true');
    bosh.appendChild(n);
    bosh.appendChild(el('h3', null, 'Milliy cholg‘ularni chalib ko‘ring'));
    var qoida = el('p', 'qoida',
      'Cholg‘uni tanlang va pardalarni bosing — istagancha, istalgan ohangda chaling. ' +
      'Klaviaturada A S D F G H J K tugmalari ham ishlaydi.');
    bosh.appendChild(qoida);
    idish.appendChild(bosh);

    // Cholg‘u tanlash
    var tanlov = el('div', 'cholgu-tanlov');
    Object.keys(CHOLGULAR).forEach(function (k) {
      var c = CHOLGULAR[k];
      var t = el('button', 'cholgu-tugma' + (k === joriyKalit ? ' faol' : ''));
      t.type = 'button'; t.dataset.kalit = k;
      t.innerHTML = '<span class="ct-nishon" aria-hidden="true">' + c.nishon + '</span>' +
                    '<span class="ct-nom">' + c.nom + '</span>';
      t.addEventListener('click', function () {
        joriyKalit = k;
        qur();
        audio();
      });
      tanlov.appendChild(t);
    });
    idish.appendChild(tanlov);

    var ch = CHOLGULAR[joriyKalit];
    idish.appendChild(el('p', 'cholgu-izoh', ch.izoh));

    // Cholg‘u tasviri (tebranuvchi torlar / doira)
    var sahna = el('div', 'cholgu-sahna');
    if (ch.tur === 'zarb') {
      sahna.innerHTML =
        '<svg viewBox="0 0 260 130" class="cholgu-rasm" aria-hidden="true">' +
        '<ellipse cx="130" cy="66" rx="96" ry="52" fill="#C8A97E"/>' +
        '<ellipse cx="130" cy="62" rx="88" ry="46" fill="#EADFC8"/>' +
        '<ellipse cx="130" cy="62" rx="88" ry="46" fill="none" stroke="#B08E64" stroke-width="3"/>' +
        '<circle cx="130" cy="62" r="7" fill="#C1502E" opacity=".5"/>' +
        '<g stroke="#B08E64" stroke-width="2">' +
        '<line class="tor-chizigi" x1="60" y1="34" x2="60" y2="90"/>' +
        '<line class="tor-chizigi" x1="105" y1="24" x2="105" y2="100"/>' +
        '<line class="tor-chizigi" x1="155" y1="24" x2="155" y2="100"/>' +
        '<line class="tor-chizigi" x1="200" y1="34" x2="200" y2="90"/>' +
        '</g></svg>';
    } else if (ch.tur === 'puflama') {
      sahna.innerHTML =
        '<svg viewBox="0 0 260 130" class="cholgu-rasm" aria-hidden="true">' +
        '<rect x="18" y="56" width="224" height="18" rx="9" fill="#C8A97E"/>' +
        '<rect x="18" y="56" width="224" height="7" rx="3.5" fill="#DCC49B"/>' +
        '<g fill="#8A6A44">' +
        '<circle class="tor-chizigi" cx="70" cy="65" r="5"/>' +
        '<circle class="tor-chizigi" cx="100" cy="65" r="5"/>' +
        '<circle class="tor-chizigi" cx="130" cy="65" r="5"/>' +
        '<circle class="tor-chizigi" cx="160" cy="65" r="5"/>' +
        '<circle class="tor-chizigi" cx="190" cy="65" r="5"/>' +
        '<circle class="tor-chizigi" cx="220" cy="65" r="5"/>' +
        '</g></svg>';
    } else {
      sahna.innerHTML =
        '<svg viewBox="0 0 260 130" class="cholgu-rasm" aria-hidden="true">' +
        '<path d="M196 40c26 0 40 12 40 25s-14 25-40 25c-30 0-44-10-60-14H36a8 8 0 0 1 0-16h100c16-4 30-20 60-20z" fill="#C8A97E"/>' +
        '<ellipse cx="196" cy="65" rx="30" ry="24" fill="#B08E64"/>' +
        '<circle cx="196" cy="65" r="9" fill="#6E5334"/>' +
        '<rect x="20" y="52" width="22" height="26" rx="5" fill="#8A6A44"/>' +
        '<g stroke="#F3E6CE" stroke-width="1.7">' +
        '<line class="tor-chizigi" x1="30" y1="59" x2="220" y2="60"/>' +
        '<line class="tor-chizigi" x1="30" y1="65" x2="220" y2="65"/>' +
        '<line class="tor-chizigi" x1="30" y1="71" x2="220" y2="70"/>' +
        '</g></svg>';
    }
    idish.appendChild(sahna);

    // Pardalar
    var royxat = ch.tur === 'zarb' ? DOIRA : PARDALAR;
    var pan = el('div', 'parda-panel' + (ch.tur === 'zarb' ? ' zarb' : ''));
    royxat.forEach(function (x, i) {
      var b = el('button', 'parda');
      b.type = 'button'; b.dataset.i = i;
      b.innerHTML = '<span class="p-nom">' + x.nom + '</span>' +
                    (ch.tur === 'zarb' ? '' : '<span class="p-tugma">' + TUGMALAR[i].toUpperCase() + '</span>');
      b.addEventListener('pointerdown', function (e) { e.preventDefault(); bosildi(i); });
      pan.appendChild(b);
    });
    idish.appendChild(pan);

    // Rejim
    var rej = el('div', 'cholgu-rejim');
    [['erkin', '🎼 Erkin chalish'], ['oyin', '🎯 Ohangni takrorlang']].forEach(function (r) {
      var b = el('button', 'tug tug-kichik ' + (rejim === r[0] ? 'tug-quyuq' : 'tug-ramka'), r[1]);
      b.type = 'button';
      b.addEventListener('click', function () { rejim = r[0]; qadam = 0; ohang = []; daraja = 1; qur(); });
      rej.appendChild(b);
    });
    idish.appendChild(rej);

    if (rejim === 'oyin') {
      var o = el('div', 'cholgu-oyin');
      o.innerHTML =
        '<p class="oyin-qoida">Cholg‘u ohangni chaladi — siz uni aynan takrorlang. ' +
        'Har darajada bitta nota qo‘shiladi.</p>' +
        '<div class="oyin-holat"><span class="daraja">Daraja: <b id="ch-daraja">' + daraja + '</b></span>' +
        '<span id="ch-xabar" class="ch-xabar">Boshlash uchun tugmani bosing</span></div>';
      var t = el('button', 'tug tug-asos tug-kichik', '▶ Ohangni eshitish');
      t.type = 'button';
      t.addEventListener('click', boshla);
      o.appendChild(t);
      idish.appendChild(o);
    }
  }

  /* ---------------- O‘yin mantiqi ---------------- */
  function xabar(m, sinf) {
    var e = document.getElementById('ch-xabar');
    if (e) { e.textContent = m; e.className = 'ch-xabar ' + (sinf || ''); }
  }

  function boshla() {
    audio();
    var uzunlik = CHOLGULAR[joriyKalit].tur === 'zarb' ? DOIRA.length : PARDALAR.length;
    ohang = [];
    for (var i = 0; i < daraja + 2; i++) ohang.push(Math.floor(Math.random() * uzunlik));
    qadam = 0;
    ijroEt();
  }

  function ijroEt() {
    oynalmoqda = true; kutmoqda = false;
    xabar('Diqqat bilan tinglang…', '');
    ohang.forEach(function (nota, i) {
      setTimeout(function () {
        chal(nota);
        if (i === ohang.length - 1) {
          setTimeout(function () {
            oynalmoqda = false; kutmoqda = true;
            xabar('Endi siz takrorlang (' + ohang.length + ' ta nota)', '');
          }, 620);
        }
      }, i * 620);
    });
  }

  function bosildi(i) {
    if (oynalmoqda) return;
    chal(i);
    if (rejim !== 'oyin' || !kutmoqda) return;

    if (i === ohang[qadam]) {
      qadam++;
      if (qadam >= ohang.length) {
        kutmoqda = false;
        daraja++;
        var d = document.getElementById('ch-daraja');
        if (d) d.textContent = daraja;
        xabar('Barakalla! Keyingi daraja tayyor.', 'yaxshi');
        if (window.Xotira) window.Xotira.modulYoz(12, { cholgu: daraja });
      }
    } else {
      kutmoqda = false;
      xabar('Xato nota. «Ohangni eshitish» ni bosib qaytadan urinib ko‘ring.', 'past');
      qadam = 0;
    }
  }

  /* ---------------- Klaviatura ---------------- */
  document.addEventListener('keydown', function (e) {
    if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
    var nishon = e.target;
    if (nishon && (nishon.tagName === 'INPUT' || nishon.tagName === 'TEXTAREA')) return;
    var r = idish.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;   // blok ko'rinmasa — ishlamasin
    var i = TUGMALAR.indexOf(e.key.toLowerCase());
    var chek = CHOLGULAR[joriyKalit].tur === 'zarb' ? DOIRA.length : PARDALAR.length;
    if (i >= 0 && i < chek) { e.preventDefault(); bosildi(i); }
  });

  qur();
})();
