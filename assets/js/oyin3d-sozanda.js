/* =========================================================================
   «SOZANDALAR DAVRASI» — HAQIQIY 3D O‘YIN (Three.js + Web Audio)
   12-modul: Milliy musiqa, qo‘shiqchilik va milliy teatrlar.

   Sahnada darslikda nomlangan har bir detalning ALOHIDA 3D modeli bor:
     cholg‘ular — dutor, rubob, do‘mbra, g‘ijjak, chang, nay, surnay,
                  karnay, doira, nog‘ora;
     teatr      — qo‘g‘irchoq teatri (chodir), qo‘g‘irchoq, masxaraboz,
                  qiziqchi, xonanda (qo‘shiqchi).
   Modellar: assets/js/model-cholgu.js va assets/js/model-teatr.js.

   Ovoz Web Audio API bilan sintez qilinadi (audio fayl kerak emas) —
   assets/js/cholgu.js dagi usullar asosida:
     · torli    — Karplus-Strong halqa kechiktirgich
     · kamonli  — arra to‘lqin + rezonans filtr + vibrato
     · puflama  — sinus + nafas shovqini
     · qamish   — arra to‘lqin + tor polosali filtr (surnay, karnay)
     · zarbli   — shovqin portlashi + pasayuvchi membrana toni

   Uch rejim:
     1. Erkin chalish   — istalgan cholg‘uni bosib, istalgan pardada chaling
     2. Ohangni takrorlash — sozandalar ohangni chaladi, siz qaytarasiz
     3. Ovozidan top    — cholg‘u ko‘rinmay chalinadi, siz topasiz
   ========================================================================= */

import * as THREE from '../vendor/three.module.min.js';

(function () {
  'use strict';

  const idish = document.getElementById('oyin3d-sozanda');
  if (!idish) return;

  /* ====================================================================
     0. WebGL bormi?
     ==================================================================== */
  function webglBor() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }
  if (!webglBor()) {
    idish.innerHTML = '<p class="uch-xato">Brauzeringiz 3D grafikani qo‘llab-quvvatlamaydi. ' +
      'Quyidagi «Milliy cholg‘ular» blokida cholg‘ularni baribir chalib ko‘rishingiz mumkin.</p>';
    return;
  }

  const kamHarakat = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ====================================================================
     1. OCHISH TUGMASI — o‘yin faqat bosilgandan keyin quriladi
     ==================================================================== */
  idish.innerHTML =
    '<div class="sz-ochish" style="text-align:center;padding:30px 18px;border-radius:14px;' +
      'background:linear-gradient(160deg,#F3E6CE,#E4D2B0);border:1px solid rgba(26,22,20,.12)">' +
      '<p style="margin:0 0 6px;font-size:34px" aria-hidden="true">🎶 🪕 🥁 🎭</p>' +
      '<p style="margin:0 0 16px;font-size:15px;color:#4A4038;max-width:46ch;' +
        'margin-inline:auto;line-height:1.6">' +
        'Sahnada o‘nta milliy cholg‘u, qo‘g‘irchoq teatri, masxaraboz, qiziqchi va ' +
        'xonanda sizni kutmoqda. Cholg‘uni bosing — u haqiqiy ovoz bilan sadolanadi.' +
      '</p>' +
      '<button type="button" class="tug tug-asos" id="sz-ochish-tug">▶ Sozandalar davrasini ochish</button>' +
    '</div>';

  const ochishTug = idish.querySelector('#sz-ochish-tug');
  ochishTug.addEventListener('click', function () {
    ochishTug.disabled = true;
    ochishTug.textContent = 'Sahna yuklanmoqda…';
    qur().catch(function (x) {
      idish.innerHTML = '<p class="uch-xato">Sahnani yuklab bo‘lmadi. ' +
        'Sahifani yangilab, qaytadan urinib ko‘ring.</p>';
      if (window.console) console.error(x);
    });
  }, { once: true });

  /* ====================================================================
     2. OVOZ — Web Audio sintezi
     ==================================================================== */
  // Sharqona (Hijoz) tovushqator — milliy ohangga yaqin
  const PARDALAR = [146.83, 155.56, 185.00, 196.00, 220.00, 233.08, 277.18, 293.66];
  const PARDA_NOM = ['Do', 'Re♭', 'Mi', 'Fa', 'Sol', 'Lya♭', 'Si', 'Do′'];

  let AC = null;
  function audio() {
    if (!AC) {
      const K = window.AudioContext || window.webkitAudioContext;
      if (!K) return null;
      try { AC = new K(); } catch (e) { return null; }
    }
    if (AC.state === 'suspended') { try { AC.resume(); } catch (e) {} }
    return AC;
  }

  /* ---- Karplus-Strong torli cholg‘u ---- */
  function torBuferi(ac, hz, sust, yorqin, uzun) {
    const sr = ac.sampleRate;
    const N = Math.max(2, Math.round(sr / hz));
    const uzunlik = Math.floor(sr * uzun);
    const bufer = ac.createBuffer(1, uzunlik, sr);
    const chiq = bufer.getChannelData(0);

    const halqa = new Float32Array(N);
    let oldingi = 0;
    for (let i = 0; i < N; i++) {
      const shovqin = Math.random() * 2 - 1;
      oldingi = oldingi + (shovqin - oldingi) * (0.18 + yorqin * 0.8);
      halqa[i] = oldingi;
    }
    let j = 0;
    for (let k = 0; k < uzunlik; k++) {
      const joriy = halqa[j];
      const keyingi = halqa[(j + 1) % N];
      halqa[j] = (joriy + keyingi) * 0.5 * sust;
      chiq[k] = joriy;
      j = (j + 1) % N;
    }
    const kir = Math.min(160, uzunlik);
    for (let a = 0; a < kir; a++) chiq[a] *= a / kir;
    const chiqish = Math.min(2000, uzunlik);
    for (let c = 0; c < chiqish; c++) chiq[uzunlik - 1 - c] *= c / chiqish;
    return bufer;
  }

  function torChal(ac, ch, hz) {
    const uzun = ch.sust > 0.997 ? 3.0 : ch.sust > 0.996 ? 2.5 : 1.9;
    const manba = ac.createBufferSource();
    manba.buffer = torBuferi(ac, hz, ch.sust, ch.yorqin, uzun);
    const filtr = ac.createBiquadFilter();
    filtr.type = 'lowpass';
    filtr.frequency.value = 900 + ch.yorqin * 5200;
    const kuch = ac.createGain();
    kuch.gain.value = ch.kuch;
    manba.connect(filtr); filtr.connect(kuch); kuch.connect(ac.destination);
    manba.start();
    manba.stop(ac.currentTime + uzun);
    return uzun;
  }

  /* ---- Kamonli (g‘ijjak) — arra to‘lqin, sekin kirish, vibrato ---- */
  function kamonChal(ac, ch, hz) {
    const t = ac.currentTime, uzun = 1.7;
    const o1 = ac.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = hz;
    const o2 = ac.createOscillator(); o2.type = 'sawtooth';
    o2.frequency.value = hz * 1.004;                 // ikki tor — ozgina rasstroy

    const lfo = ac.createOscillator(); lfo.frequency.value = 5.6;
    const lfoG = ac.createGain(); lfoG.gain.value = hz * 0.014;
    lfo.connect(lfoG); lfoG.connect(o1.frequency); lfoG.connect(o2.frequency);

    const f = ac.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = hz * 3.4; f.Q.value = 1.6;
    const f2 = ac.createBiquadFilter();
    f2.type = 'lowpass'; f2.frequency.value = 2600;

    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(ch.kuch, t + 0.16);   // kamon sekin kiradi
    g.gain.setValueAtTime(ch.kuch, t + uzun - 0.45);
    g.gain.exponentialRampToValueAtTime(0.0001, t + uzun);

    o1.connect(f); o2.connect(f); f.connect(f2); f2.connect(g); g.connect(ac.destination);
    o1.start(t); o2.start(t); lfo.start(t);
    o1.stop(t + uzun); o2.stop(t + uzun); lfo.stop(t + uzun);
    return uzun;
  }

  /* ---- Puflama (nay) — sinus + nafas shovqini ---- */
  function nayChal(ac, ch, hz) {
    const t = ac.currentTime, uzun = 1.5;
    const osts = ac.createOscillator(); osts.type = 'sine'; osts.frequency.value = hz * 2;
    const qosh = ac.createOscillator(); qosh.type = 'triangle'; qosh.frequency.value = hz * 4;
    const qoshG = ac.createGain(); qoshG.gain.value = 0.10;

    const lfo = ac.createOscillator(); lfo.frequency.value = 5.2;
    const lfoG = ac.createGain(); lfoG.gain.value = hz * 0.018;
    lfo.connect(lfoG); lfoG.connect(osts.frequency);

    const uz = Math.floor(ac.sampleRate * uzun);
    const nb = ac.createBuffer(1, uz, ac.sampleRate);
    const nd = nb.getChannelData(0);
    for (let i = 0; i < uz; i++) nd[i] = (Math.random() * 2 - 1) * 0.05;
    const nafas = ac.createBufferSource(); nafas.buffer = nb;
    const nf = ac.createBiquadFilter(); nf.type = 'bandpass';
    nf.frequency.value = hz * 3; nf.Q.value = 1.1;
    const nafasG = ac.createGain(); nafasG.gain.value = 0.5;

    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(ch.kuch, t + 0.09);
    g.gain.setValueAtTime(ch.kuch, t + uzun - 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t + uzun);

    osts.connect(g); qosh.connect(qoshG); qoshG.connect(g);
    nafas.connect(nf); nf.connect(nafasG); nafasG.connect(g);
    g.connect(ac.destination);

    osts.start(t); qosh.start(t); lfo.start(t); nafas.start(t);
    osts.stop(t + uzun); qosh.stop(t + uzun); lfo.stop(t + uzun); nafas.stop(t + uzun);
    return uzun;
  }

  /* ---- Qamish tilli / mis (surnay, karnay) — o‘tkir, jarangdor ---- */
  function qamishChal(ac, ch, hz) {
    const t = ac.currentTime, uzun = ch.uzun || 1.6;
    const f0 = hz * (ch.oktava || 1);

    const o1 = ac.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = f0;
    const o2 = ac.createOscillator(); o2.type = 'square';
    o2.frequency.value = f0; const o2g = ac.createGain(); o2g.gain.value = 0.35;

    const lfo = ac.createOscillator(); lfo.frequency.value = 6.2;
    const lfoG = ac.createGain(); lfoG.gain.value = f0 * 0.01;
    lfo.connect(lfoG); lfoG.connect(o1.frequency);

    const f = ac.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = f0 * (ch.rezonans || 3.2);
    f.Q.value = ch.q || 2.4;
    const f2 = ac.createBiquadFilter();
    f2.type = 'lowpass'; f2.frequency.value = ch.tiniq || 3400;

    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(ch.kuch, t + (ch.kirish || 0.07));
    g.gain.setValueAtTime(ch.kuch, t + uzun - 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t + uzun);

    o1.connect(f); o2.connect(o2g); o2g.connect(f);
    f.connect(f2); f2.connect(g); g.connect(ac.destination);
    o1.start(t); o2.start(t); lfo.start(t);
    o1.stop(t + uzun); o2.stop(t + uzun); lfo.stop(t + uzun);
    return uzun;
  }

  /* ---- Zarbli (doira, nog‘ora) ---- */
  function zarbChal(ac, ch, hz) {
    const t = ac.currentTime;
    const uzun = ch.uzun || 0.34;
    const asos = ch.past || 96;

    const uz = Math.floor(ac.sampleRate * uzun);
    const nb = ac.createBuffer(1, uz, ac.sampleRate);
    const nd = nb.getChannelData(0);
    for (let i = 0; i < uz; i++) nd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / uz, 2.2);
    const shovqin = ac.createBufferSource(); shovqin.buffer = nb;
    const sf = ac.createBiquadFilter();
    sf.type = ch.yorqinZarb ? 'bandpass' : 'lowpass';
    sf.frequency.value = ch.yorqinZarb ? 900 : 320;
    sf.Q.value = 1.4;
    const sg = ac.createGain(); sg.gain.value = ch.shovqin === undefined ? 0.55 : ch.shovqin;

    const o = ac.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(asos * 1.7, t);
    o.frequency.exponentialRampToValueAtTime(asos, t + uzun * 0.7);
    const og = ac.createGain();
    og.gain.setValueAtTime(ch.kuch, t);
    og.gain.exponentialRampToValueAtTime(0.0001, t + uzun);

    shovqin.connect(sf); sf.connect(sg); sg.connect(ac.destination);
    o.connect(og); og.connect(ac.destination);
    shovqin.start(t); o.start(t); o.stop(t + uzun);
    return uzun;
  }

  /* ====================================================================
     3. CHOLG‘ULAR JADVALI — model + ovoz + izoh
     ==================================================================== */
  const CHOLGULAR = [
    { kalit: 'dutor',  nom: 'Dutor',    kutubxona: 'cholgu', model: 'dutor',
      tur: 'tor', sust: 0.9965, yorqin: 0.28, kuch: 0.55, olcham: 1.55, burchak: -0.22,
      izoh: 'Ikki torli, mayin va yumshoq ovozli — eng keng tarqalgan milliy cholg‘u.' },
    { kalit: 'rubob',  nom: 'Rubob',    kutubxona: 'cholgu', model: 'rubob',
      tur: 'tor', sust: 0.9945, yorqin: 0.72, kuch: 0.50, olcham: 1.55, burchak: -0.22,
      izoh: 'Old tomoni charm bilan qoplangan, jarangdor ovozli torli cholg‘u.' },
    { kalit: 'dombra', nom: 'Do‘mbra',  kutubxona: 'cholgu', model: 'dombra',
      tur: 'tor', sust: 0.9955, yorqin: 0.18, kuch: 0.62, olcham: 1.55, burchak: -0.22,
      izoh: 'Baxshilar doston aytganda jo‘r bo‘ladigan ikki torli cholg‘u.' },
    { kalit: 'gijjak', nom: 'G‘ijjak',  kutubxona: 'teatr',  model: 'gijjak',
      tur: 'kamon', kuch: 0.30, olcham: 1.45, burchak: -0.10,
      izoh: 'Kamon bilan chalinadi; ovozi inson qo‘shig‘iga eng yaqin cholg‘u.' },
    { kalit: 'chang',  nom: 'Chang',    kutubxona: 'cholgu', model: 'chang',
      tur: 'tor', sust: 0.9985, yorqin: 0.88, kuch: 0.42, olcham: 1.15, burchak: 0,
      izoh: 'Trapetsiya qutidagi ko‘p torlar ikki ingichka cho‘p bilan uriladi.' },
    { kalit: 'nay',    nom: 'Nay',      kutubxona: 'cholgu', model: 'nay',
      tur: 'puflama', kuch: 0.34, olcham: 1.35, burchak: 0.12,
      izoh: 'Qamishdan yasalgan puflama cholg‘u — cho‘ponlar sadosi.' },
    { kalit: 'surnay', nom: 'Surnay',   kutubxona: 'teatr',  model: 'surnay',
      tur: 'qamish', kuch: 0.20, oktava: 2, rezonans: 3.6, q: 3.0, tiniq: 4200, uzun: 1.5,
      olcham: 1.25, burchak: -0.12,
      izoh: 'O‘tkir, jarangdor ovozli yog‘och puflama; sayl va to‘y cholg‘usi.' },
    { kalit: 'karnay', nom: 'Karnay',   kutubxona: 'teatr',  model: 'karnay',
      tur: 'qamish', kuch: 0.24, oktava: 0.5, rezonans: 2.0, q: 1.4, tiniq: 1500,
      uzun: 2.1, kirish: 0.22, olcham: 1.35, burchak: -0.20,
      izoh: 'Uzun mis puflama — to‘y boshlanganini butun mahallaga eshittiradi.' },
    { kalit: 'doira',  nom: 'Doira',    kutubxona: 'cholgu', model: 'doira',
      tur: 'zarb', kuch: 0.80, past: 100, uzun: 0.40, shovqin: 0.55, olcham: 1.15, burchak: 0,
      izoh: 'Gardishga charm tortilgan zarbli cholg‘u — «dum», «bak», «tak» usullari.' },
    { kalit: 'nogora', nom: 'Nog‘ora',  kutubxona: 'teatr',  model: 'nogora',
      tur: 'zarb', kuch: 0.85, past: 78, uzun: 0.52, shovqin: 0.42, olcham: 1.10, burchak: 0,
      izoh: 'Juft sopol kosaga charm tortilgan zarbli cholg‘u; sayl usulini beradi.' }
  ];

  const SHAXSLAR = [
    { kalit: 'xonanda',    kutubxona: 'teatr', model: 'xonanda',
      nom: 'Xonanda', olcham: 2.35,
      izoh: 'Alla, yor-yor va laparlarni ijro etuvchi qo‘shiqchi — qo‘li quloqda.' },
    { kalit: 'masxaraboz', kutubxona: 'teatr', model: 'masxaraboz',
      nom: 'Masxaraboz', olcham: 2.35,
      izoh: 'Yamoq chopon va qo‘ng‘iroqli qalpoqdagi kulgi ustasi.' },
    { kalit: 'qiziqchi',   kutubxona: 'teatr', model: 'qiziqchi',
      nom: 'Qiziqchi', olcham: 2.35,
      izoh: 'Askiya va hazil ustasi; qo‘lida kulgili niqob bilan tomosha ko‘rsatadi.' }
  ];

  function chalOvoz(ch, notaIndex) {
    const ac = audio();
    if (!ac) return 0.6;
    const hz = PARDALAR[Math.max(0, Math.min(PARDALAR.length - 1, notaIndex || 0))];
    try {
      if (ch.tur === 'tor')      return torChal(ac, ch, hz);
      if (ch.tur === 'kamon')    return kamonChal(ac, ch, hz);
      if (ch.tur === 'puflama')  return nayChal(ac, ch, hz);
      if (ch.tur === 'qamish')   return qamishChal(ac, ch, hz);
      if (ch.tur === 'zarb')     return zarbChal(ac, ch, hz);
    } catch (e) {}
    return 0.6;
  }

  /* ====================================================================
     4. SAHNANI QURISH
     ==================================================================== */
  async function qur() {

    /* -------- Model kutubxonalarini yuklaymiz -------- */
    const [chLib, teatrLib] = await Promise.all([
      import('./model-cholgu.js'),
      import('./model-teatr.js')
    ]);
    const KUTUB = { cholgu: chLib.CHOLGULAR, teatr: teatrLib.TEATR };

    /* -------- Interfeys -------- */
    idish.innerHTML =
      '<div class="uch-sahna">' +
        '<canvas class="uch-canvas"></canvas>' +
        '<div class="uch-ust">' +
          '<span>Rejim <b id="sz-rejim">Erkin chalish</b></span>' +
          '<span>Ochko <b id="sz-ochko">0</b></span>' +
          '<span>Daraja <b id="sz-daraja">1</b></span>' +
        '</div>' +
        '<p class="uch-maslahat" id="sz-maslahat">Cholg‘uni bosing — u sadolanadi.</p>' +
      '</div>' +
      '<div class="oyin-tugmalar">' +
        '<button type="button" class="tug tug-asos tug-kichik" id="sz-erkin">🎵 Erkin chalish</button>' +
        '<button type="button" class="tug tug-ramka tug-kichik" id="sz-ohang">🎼 Ohangni takrorlash</button>' +
        '<button type="button" class="tug tug-ramka tug-kichik" id="sz-top">👂 Ovozidan top</button>' +
        '<button type="button" class="tug tug-ramka tug-kichik" id="sz-qayta">🔁 Qaytadan eshitish</button>' +
      '</div>' +
      '<p id="sz-izoh" style="margin:14px 0 0;padding:12px 16px;border-radius:12px;' +
        'background:#F7EFE1;border:1px solid rgba(26,22,20,.10);font-size:14.5px;' +
        'line-height:1.6;color:#4A4038;min-height:2.6em">' +
        'Sahnadagi istalgan cholg‘uni bosing. Pastdagi rangli pardalarni bossangiz, ' +
        'tanlangan cholg‘u shu pardada yangraydi — ohangni o‘zingiz to‘qishingiz mumkin.' +
      '</p>';

    const canvas    = idish.querySelector('.uch-canvas');
    const maslahatE = idish.querySelector('#sz-maslahat');
    const rejimE    = idish.querySelector('#sz-rejim');
    const ochkoE    = idish.querySelector('#sz-ochko');
    const darajaE   = idish.querySelector('#sz-daraja');
    const izohE     = idish.querySelector('#sz-izoh');

    function xabar(m) { maslahatE.textContent = m; }
    function izoh(m) { izohE.textContent = m; }

    /* ================= Sahna ================= */
    const sahna = new THREE.Scene();
    sahna.background = new THREE.Color(0xF1E3C6);
    sahna.fog = new THREE.Fog(0xF1E3C6, 20, 42);

    const kamera = new THREE.PerspectiveCamera(44, 16 / 10, 0.1, 120);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    /* ---- Yorug‘lik ---- */
    sahna.add(new THREE.HemisphereLight(0xFFF4DE, 0xC9A87A, 1.05));
    const quyosh = new THREE.DirectionalLight(0xFFF0D0, 1.45);
    quyosh.position.set(6, 13, 9);
    quyosh.castShadow = true;
    quyosh.shadow.mapSize.set(1536, 1536);
    quyosh.shadow.camera.left = -12; quyosh.shadow.camera.right = 12;
    quyosh.shadow.camera.top = 12;   quyosh.shadow.camera.bottom = -12;
    quyosh.shadow.camera.far = 40;
    quyosh.shadow.bias = -0.0008;
    sahna.add(quyosh);
    const yon = new THREE.DirectionalLight(0x8C3A2B, 0.30);
    yon.position.set(-7, 4, -6);
    sahna.add(yon);
    // Sahna oldidagi iliq nur — chiroq
    const chiroq = new THREE.PointLight(0xFFD9A0, 0.55, 22);
    chiroq.position.set(0, 5.2, 5.5);
    sahna.add(chiroq);

    /* ---- Yer va gilam ---- */
    const yer = new THREE.Mesh(
      new THREE.CylinderGeometry(11, 11, 0.5, 56),
      new THREE.MeshStandardMaterial({ color: 0xC9A87A, roughness: 0.9 })
    );
    yer.position.y = -0.25;
    yer.receiveShadow = true;
    sahna.add(yer);

    const gilam = new THREE.Mesh(
      new THREE.CylinderGeometry(8.4, 8.4, 0.06, 56),
      new THREE.MeshStandardMaterial({ color: 0x8C3A2B, roughness: 0.96 })
    );
    gilam.position.y = 0.02;
    gilam.receiveShadow = true;
    sahna.add(gilam);

    [7.5, 6.6, 5.7].forEach(function (r, i) {
      const halqa = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.04, 8, 84),
        new THREE.MeshStandardMaterial({ color: i === 1 ? 0xD4A24C : 0xE3C98F,
                                         roughness: 0.5, metalness: 0.3 })
      );
      halqa.rotation.x = -Math.PI / 2;
      halqa.position.y = 0.055 + i * 0.002;
      sahna.add(halqa);
    });
    // Gilamdagi bodom naqshlar
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const bodom = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 10, 8),
        new THREE.MeshStandardMaterial({ color: 0xE3C98F, roughness: 0.85 })
      );
      bodom.scale.set(0.55, 0.08, 1.5);
      bodom.position.set(Math.cos(a) * 7.05, 0.06, Math.sin(a) * 7.05);
      bodom.rotation.y = -a;
      sahna.add(bodom);
    }

    /* ---- Modelni sahnaga moslash ---- */
    function modelOl(kutubxona, kalit, olcham) {
      const ro = KUTUB[kutubxona];
      const yozuv = ro && ro[kalit];
      if (!yozuv) return null;
      const m = yozuv.yasa();
      // Modellar 1.0–1.5 birlikda keladi — kerakli o‘lchamga keltiramiz
      const q = new THREE.Box3().setFromObject(m);
      const o = q.getSize(new THREE.Vector3());
      const eng = Math.max(o.x, o.y, o.z) || 1;
      m.scale.setScalar(olcham / eng);
      m.traverse(function (x) { if (x.isMesh) { x.castShadow = true; x.receiveShadow = true; } });
      return m;
    }

    /* ================= Qo‘g‘irchoq teatri (orqa fon) ================= */
    const chodir = modelOl('teatr', 'teatrChodir', 3.9);
    if (chodir) { chodir.position.set(0, 0, -8.2); sahna.add(chodir); }

    // Chodir peshtoqi ustidagi qo‘g‘irchoq — musiqa chalinganda o‘ynaydi
    const qogirchoq = modelOl('teatr', 'qogirchoq', 1.9);
    if (qogirchoq) {
      qogirchoq.position.set(0, 1.28, -7.80);
      sahna.add(qogirchoq);
    }

    /* ================= Odam figuralari ================= */
    const shaxsOrni = [
      [-3.6, -6.1,  0.34],   // xonanda — chodir chap yonida
      [-5.6, -4.6,  0.58],   // masxaraboz — chap qanot
      [ 5.6, -4.6, -0.58]    // qiziqchi — o‘ng qanot
    ];
    const shaxslar = [];
    SHAXSLAR.forEach(function (s, i) {
      const m = modelOl(s.kutubxona, s.model, s.olcham);
      if (!m) return;
      const o = shaxsOrni[i];
      m.position.set(o[0], 0.06, o[1]);
      m.rotation.y = o[2];
      m.userData.tur = 'shaxs';
      m.userData.malumot = s;
      m.userData.asosY = 0.06;
      m.userData.faza = i * 1.7;
      sahna.add(m);
      shaxslar.push(m);
    });

    /* ================= Cholg‘ular — yarim doira bo‘ylab ================= */
    const MARKAZ_Z = -3.0;
    const RADIUS_X = 6.3;      // yoy kengligi
    const RADIUS_Z = 2.6;      // yoy chuqurligi (yassi ellips)
    const N = CHOLGULAR.length;
    const cholgular = [];

    // Yoydagi o‘rin: baland (torli) va past (zarbli, puflama) cholg‘ular
    // navbatma-navbat tursin — sahna muvozanatli ko‘rinadi.
    //            dutor rubob dombra gijjak chang nay surnay karnay doira nogora
    const YOY_ORNI = [ 1,    3,    7,     6,     4,    5,   2,     9,     0,    8 ];

    CHOLGULAR.forEach(function (ch, i) {
      const t = N === 1 ? 0.5 : YOY_ORNI[i] / (N - 1);
      const a = (-1 + 2 * t) * 1.35;
      const x = Math.sin(a) * RADIUS_X;
      const z = MARKAZ_Z + Math.cos(a) * RADIUS_Z;

      const guruh = new THREE.Group();
      guruh.position.set(x, 0, z);
      guruh.rotation.y = -a * 0.55;                  // hammasi tomoshabinga qaragan

      /* --- Yog‘och kursicha (cholg‘u tayanchi) --- */
      const kursi = new THREE.Mesh(
        new THREE.CylinderGeometry(0.70, 0.80, 0.28, 18),
        new THREE.MeshStandardMaterial({ color: 0x6E5334, roughness: 0.8 })
      );
      kursi.position.y = 0.14;
      kursi.castShadow = true; kursi.receiveShadow = true;
      guruh.add(kursi);
      const kursiJiyak = new THREE.Mesh(
        new THREE.TorusGeometry(0.71, 0.035, 8, 24),
        new THREE.MeshStandardMaterial({ color: 0xD4A24C, roughness: 0.5, metalness: 0.35 })
      );
      kursiJiyak.rotation.x = Math.PI / 2;
      kursiJiyak.position.y = 0.28;
      guruh.add(kursiJiyak);

      /* --- Yorishuvchi halqa (bosilganda va tanlanganda) --- */
      const halqaMat = new THREE.MeshStandardMaterial({
        color: 0xD4A24C, emissive: 0xC1502E, emissiveIntensity: 0,
        roughness: 0.4, metalness: 0.4, transparent: true, opacity: 0.9
      });
      const halqa = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.065, 10, 34), halqaMat);
      halqa.rotation.x = -Math.PI / 2;
      halqa.position.y = 0.075;
      halqa.visible = false;
      guruh.add(halqa);

      /* --- Cholg‘u modeli --- */
      const model = modelOl(ch.kutubxona, ch.model, ch.olcham * 1.62);
      const tashuvchi = new THREE.Group();       // animatsiya uchun oraliq guruh
      tashuvchi.position.y = 0.28;
      if (model) {
        model.rotation.z = ch.burchak || 0;
        tashuvchi.add(model);
      }
      guruh.add(tashuvchi);

      guruh.userData = {
        tur: 'cholgu', malumot: ch, index: i,
        tashuvchi: tashuvchi, halqa: halqa, halqaMat: halqaMat,
        tebranish: 0, asosBurchak: ch.burchak || 0
      };
      sahna.add(guruh);
      cholgular.push(guruh);
    });

    /* ================= Pardalar (tovushqator) — old tomonda ================= */
    const pardalar = [];
    const PARDA_RANG = [0x2F4B8C, 0x39609E, 0x4478A6, 0x4E9199,
                        0x8A9E5A, 0xC9A24C, 0xC1702E, 0xA8332A];
    for (let i = 0; i < PARDALAR.length; i++) {
      const g = new THREE.Group();
      const kengl = 1.00;
      const x = (i - (PARDALAR.length - 1) / 2) * (kengl + 0.12);
      const baland = 0.16 + i * 0.022;

      const plita = new THREE.Mesh(
        new THREE.BoxGeometry(kengl, baland, 0.86),
        new THREE.MeshStandardMaterial({ color: PARDA_RANG[i], roughness: 0.55,
                                         emissive: PARDA_RANG[i], emissiveIntensity: 0.04 })
      );
      plita.position.y = baland / 2;
      plita.castShadow = true; plita.receiveShadow = true;
      g.add(plita);

      // Ustidagi oltin chiziq — parda belgisi
      const chiziq = new THREE.Mesh(
        new THREE.BoxGeometry(kengl * 0.62, 0.02, 0.06),
        new THREE.MeshStandardMaterial({ color: 0xF3E6CE, roughness: 0.4, metalness: 0.3 })
      );
      chiziq.position.y = baland + 0.011;
      g.add(chiziq);

      g.position.set(x, 0.06, 3.3);
      g.userData = { tur: 'parda', index: i, plita: plita, asosY: 0.06, urgu: 0 };
      sahna.add(g);
      pardalar.push(g);
    }

    /* ================= Sado halqalari (chalinganda tarqaladi) ================= */
    const sadolar = [];
    function sadoChiqar(pos, rang) {
      if (kamHarakat) return;
      const m = new THREE.Mesh(
        new THREE.TorusGeometry(0.5, 0.045, 8, 28),
        new THREE.MeshBasicMaterial({ color: rang || 0xD4A24C, transparent: true, opacity: 0.75 })
      );
      m.rotation.x = -Math.PI / 2;
      m.position.copy(pos);
      m.userData.t = 0;
      sahna.add(m);
      sadolar.push(m);
    }

    /* ================= Kamera ================= */
    let burchakY = 0, burchakX = 0.365, masofa = 11.9;
    const nishon = new THREE.Vector3(0, 1.15, -0.5);
    function kameraniJoyla() {
      burchakX = Math.max(0.16, Math.min(0.86, burchakX));
      burchakY = Math.max(-0.75, Math.min(0.75, burchakY));
      masofa = Math.max(9.5, Math.min(19, masofa));
      kamera.position.set(
        nishon.x + Math.sin(burchakY) * Math.cos(burchakX) * masofa,
        nishon.y + Math.sin(burchakX) * masofa,
        nishon.z + Math.cos(burchakY) * Math.cos(burchakX) * masofa
      );
      kamera.lookAt(nishon);
    }
    kameraniJoyla();

    /* ================= O‘yin holati ================= */
    let rejim = 'erkin';            // erkin | ohang | top
    let tanlangan = 0;              // erkin rejimda tanlangan cholg‘u indeksi
    let ochko = 0, daraja = 1, rekord = 0;
    let ohang = [];                 // {cholgu, nota}
    let qadam = 0;
    let namoyish = false;           // sahna o‘zi chalayotgan payt — bosish qulflanadi
    let topKalit = -1;
    const navbat = [];              // kechiktirilgan vazifalar

    try {
      const saqlangan = window.Xotira && window.Xotira.modul(12);
      if (saqlangan && saqlangan.sozanda3d) rekord = saqlangan.sozanda3d;
    } catch (e) {}

    function ochkoQosh(n) {
      ochko = Math.max(0, ochko + n);
      ochkoE.textContent = ochko;
      if (ochko > rekord) {
        rekord = ochko;
        try {
          if (window.Xotira && window.Xotira.modulYoz) {
            window.Xotira.modulYoz(12, { sozanda3d: rekord });
          }
        } catch (e) {}
      }
    }

    function kechik(sekund, ish) { navbat.push({ qoldi: sekund, ish: ish }); }
    function navbatniTozala() { navbat.length = 0; }

    /* ---- Cholg‘uni ijro etish (ovoz + animatsiya) ---- */
    function ijro(index, nota, ovozBilan, korinishBilan) {
      const G = cholgular[index];
      if (!G) return 0.6;
      const ch = G.userData.malumot;
      const uzun = ovozBilan === false ? 0.6 : chalOvoz(ch, nota);

      if (korinishBilan !== false) {
        G.userData.tebranish = 1;
        G.userData.halqa.visible = true;
        G.userData.halqaMat.emissiveIntensity = 1.1;
        const p = new THREE.Vector3();
        G.getWorldPosition(p);
        p.y = 0.09;
        sadoChiqar(p, 0xD4A24C);
      }
      raqs = Math.max(raqs, 1.0);
      return uzun;
    }

    let raqs = 0;   // figuralar raqsga tushgan vaqt

    /* ---- Tanlangan cholg‘uni belgilash ---- */
    function tanla(index) {
      tanlangan = index;
      cholgular.forEach(function (G, i) {
        G.userData.halqa.visible = (i === index);
        if (i === index) G.userData.halqaMat.emissiveIntensity = 0.45;
      });
      const ch = CHOLGULAR[index];
      izoh(ch.nom + ' — ' + ch.izoh + ' Endi pastdagi rangli pardalarni bosib, ' +
           'shu cholg‘uda ohang chalib ko‘ring.');
    }

    /* ================= REJIM: erkin chalish ================= */
    function erkinRejim() {
      navbatniTozala();
      rejim = 'erkin';
      namoyish = false;
      rejimE.textContent = 'Erkin chalish';
      xabar('Cholg‘uni tanlang, pardalarni bosib chaling.');
      izoh('Erkin chalish. Cholg‘uni bosing — u sadolanadi va tanlanadi. ' +
           'Pastdagi sakkiz rangli parda — tovushqator: chapdan o‘ngga ovoz ' +
           'ingichkalashadi. Ular bilan istagancha ohang to‘qishingiz mumkin.');
      tanla(tanlangan);
    }

    /* ================= REJIM: ohangni takrorlash ================= */
    function ohangYangi() {
      ohang = [];
      const uzunlik = 2 + daraja;
      for (let i = 0; i < uzunlik; i++) {
        ohang.push({
          cholgu: Math.floor(Math.random() * cholgular.length),
          nota: Math.floor(Math.random() * PARDALAR.length)
        });
      }
      qadam = 0;
      ohangNamoyish();
    }

    function ohangNamoyish() {
      navbatniTozala();
      namoyish = true;
      qadam = 0;
      xabar('Diqqat — sozandalar chalmoqda…');
      let vaqt = 0.5;
      ohang.forEach(function (n, i) {
        kechik(vaqt, function () {
          ijro(n.cholgu, n.nota, true, true);
          pardaUrgu(n.nota);
        });
        vaqt += 0.92;
      });
      kechik(vaqt, function () {
        namoyish = false;
        cholgular.forEach(function (G) { G.userData.halqa.visible = false; });
        xabar('Endi siz takrorlang — ' + ohang.length + ' ta cholg‘u.');
      });
    }

    function ohangRejim() {
      rejim = 'ohang';
      rejimE.textContent = 'Ohangni takrorlash';
      izoh('Sozandalar ohangni chaladi — qaysi cholg‘u qaysi navbatda sadolanganini ' +
           'eslab qoling va o‘sha tartibda bosing. Har to‘g‘ri ohang uchun ochko ' +
           'qo‘shiladi, daraja oshgani sari ohang uzayadi.');
      ohangYangi();
    }

    function ohangBosildi(index) {
      if (namoyish) return;
      if (!ohang.length) { ohangYangi(); return; }
      ijro(index, ohang[qadam] ? ohang[qadam].nota : 4, true, true);

      if (ohang[qadam] && ohang[qadam].cholgu === index) {
        qadam++;
        if (qadam >= ohang.length) {
          ochkoQosh(ohang.length * 2);
          daraja++;
          darajaE.textContent = daraja;
          xabar('Barakalla! Ohang to‘g‘ri takrorlandi.');
          izoh('To‘g‘ri! Ohang uzayadi — keyingi darajada ' +
               (2 + daraja) + ' ta cholg‘u bo‘ladi.');
          namoyish = true;
          kechik(1.5, ohangYangi);
        } else {
          xabar('To‘g‘ri — davom eting (' + qadam + '/' + ohang.length + ').');
        }
      } else {
        const kerak = ohang[qadam] ? CHOLGULAR[ohang[qadam].cholgu].nom : '';
        daraja = Math.max(1, daraja - 1);
        darajaE.textContent = daraja;
        ochkoQosh(-1);
        xabar('Bu safar bo‘lmadi — kerak edi: ' + kerak);
        izoh('Xato. ' + qadam + '-o‘rinda «' + kerak + '» sadolangan edi. ' +
             'Ohang qaytadan chalinadi — diqqat bilan tinglang.');
        namoyish = true;
        kechik(1.6, ohangNamoyish);
      }
    }

    /* ================= REJIM: ovozidan topish ================= */
    function topYangi() {
      navbatniTozala();
      topKalit = Math.floor(Math.random() * cholgular.length);
      namoyish = true;
      xabar('Tinglang…');
      kechik(0.45, function () {
        ijro(topKalit, 4 + (Math.random() < 0.5 ? 0 : 2), true, false);   // ko‘rinishsiz
        namoyish = false;
        xabar('Qaysi cholg‘u sadolandi? Uni bosing.');
      });
    }

    function topRejim() {
      rejim = 'top';
      rejimE.textContent = 'Ovozidan top';
      cholgular.forEach(function (G) { G.userData.halqa.visible = false; });
      izoh('Cholg‘u ko‘rsatilmasdan sadolanadi. Ovoziga qarab qaysi cholg‘u ' +
           'ekanini toping va o‘sha cholg‘uni bosing. «🔁 Qaytadan eshitish» ' +
           'tugmasi ovozni yana chaladi.');
      topYangi();
    }

    function topBosildi(index) {
      if (namoyish) return;
      const togri = (index === topKalit);
      ijro(index, 4, true, true);
      if (togri) {
        ochkoQosh(3);
        xabar('To‘g‘ri! Bu — ' + CHOLGULAR[index].nom + '.');
        izoh(CHOLGULAR[index].nom + ' — ' + CHOLGULAR[index].izoh);
      } else {
        ochkoQosh(-1);
        xabar('Yo‘q — bu ' + CHOLGULAR[topKalit].nom + ' edi.');
        izoh('Sadolangan cholg‘u: ' + CHOLGULAR[topKalit].nom + ' — ' +
             CHOLGULAR[topKalit].izoh + ' Siz bosgani: ' + CHOLGULAR[index].nom + '.');
        namoyish = true;
        kechik(0.9, function () {
          ijro(topKalit, 4, true, true);
          namoyish = false;
        });
      }
      namoyish = true;
      kechik(togri ? 1.5 : 2.6, topYangi);
    }

    /* ================= Parda bosilishi ================= */
    function pardaUrgu(i) {
      const P = pardalar[i];
      if (P) P.userData.urgu = 1;
    }

    function pardaBosildi(i) {
      pardaUrgu(i);
      if (rejim === 'erkin') {
        ijro(tanlangan, i, true, true);
        xabar(CHOLGULAR[tanlangan].nom + ' · ' + PARDA_NOM[i] + ' pardasi');
      } else {
        // Boshqa rejimlarda ham tinglash uchun chalishga ruxsat
        ijro(tanlangan, i, true, true);
      }
    }

    /* ================= Cholg‘u bosilishi ================= */
    function cholguBosildi(index) {
      if (rejim === 'ohang') { ohangBosildi(index); return; }
      if (rejim === 'top')   { topBosildi(index);   return; }
      tanla(index);
      ijro(index, 4, true, true);
      xabar(CHOLGULAR[index].nom + ' sadolandi.');
    }

    /* ================= Shaxs bosilishi ================= */
    function shaxsBosildi(m) {
      const s = m.userData.malumot;
      xabar(s.nom);
      izoh(s.nom + ' — ' + s.izoh);
      m.userData.sakrash = 1;
      raqs = Math.max(raqs, 1.4);
    }

    /* ================= Bosish (raycasting) ================= */
    const nur = new THREE.Raycaster();
    const nuqta = new THREE.Vector2();
    let sudralmoqda = false, sudraldi = false, oxX = 0, oxY = 0;

    function ildizTop(obj) {
      let o = obj;
      while (o) {
        if (o.userData && o.userData.tur) return o;
        o = o.parent;
      }
      return null;
    }

    canvas.addEventListener('pointerdown', function (e) {
      sudralmoqda = true; sudraldi = false;
      oxX = e.clientX; oxY = e.clientY;
      try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
      audio();   // birinchi teginishda audio kontekstini ochamiz
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!sudralmoqda) return;
      const dx = e.clientX - oxX, dy = e.clientY - oxY;
      if (Math.abs(dx) + Math.abs(dy) > 6) sudraldi = true;
      burchakY -= dx * 0.005;
      burchakX += dy * 0.004;
      oxX = e.clientX; oxY = e.clientY;
      kameraniJoyla();
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) {
      canvas.addEventListener(t, function (e) {
        if (t === 'pointerup' && sudralmoqda && !sudraldi) bosildi(e);
        sudralmoqda = false;
      });
    });
    canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      masofa += e.deltaY * 0.006;
      kameraniJoyla();
    }, { passive: false });

    function bosildi(e) {
      const r = canvas.getBoundingClientRect();
      nuqta.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      nuqta.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      nur.setFromCamera(nuqta, kamera);

      const nishonlar = cholgular.concat(pardalar).concat(shaxslar);
      const kesishuv = nur.intersectObjects(nishonlar, true);
      if (!kesishuv.length) return;
      const ildiz = ildizTop(kesishuv[0].object);
      if (!ildiz) return;

      if (ildiz.userData.tur === 'cholgu') cholguBosildi(ildiz.userData.index);
      else if (ildiz.userData.tur === 'parda') pardaBosildi(ildiz.userData.index);
      else if (ildiz.userData.tur === 'shaxs') shaxsBosildi(ildiz);
    }

    /* ---- Klaviatura: 1–8 pardalar, ← → cholg‘u tanlash ---- */
    idish.setAttribute('tabindex', '0');
    idish.addEventListener('keydown', function (e) {
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 8) { pardaBosildi(n - 1); e.preventDefault(); return; }
      if (e.key === 'ArrowRight') { tanla((tanlangan + 1) % cholgular.length); e.preventDefault(); }
      if (e.key === 'ArrowLeft')  { tanla((tanlangan - 1 + cholgular.length) % cholgular.length); e.preventDefault(); }
      if (e.key === ' ' || e.key === 'Enter') { cholguBosildi(tanlangan); e.preventDefault(); }
    });

    /* ================= Tugmalar ================= */
    const tugErkin = idish.querySelector('#sz-erkin');
    const tugOhang = idish.querySelector('#sz-ohang');
    const tugTop   = idish.querySelector('#sz-top');
    const tugQayta = idish.querySelector('#sz-qayta');

    function tugmalarniYangila(faol) {
      [[tugErkin, 'erkin'], [tugOhang, 'ohang'], [tugTop, 'top']].forEach(function (p) {
        p[0].classList.toggle('tug-asos', p[1] === faol);
        p[0].classList.toggle('tug-ramka', p[1] !== faol);
      });
    }

    tugErkin.addEventListener('click', function () { audio(); tugmalarniYangila('erkin'); erkinRejim(); });
    tugOhang.addEventListener('click', function () { audio(); tugmalarniYangila('ohang'); daraja = 1; darajaE.textContent = '1'; ohangRejim(); });
    tugTop.addEventListener('click',   function () { audio(); tugmalarniYangila('top');   topRejim(); });
    tugQayta.addEventListener('click', function () {
      audio();
      if (rejim === 'ohang') ohangNamoyish();
      else if (rejim === 'top') {
        namoyish = true;
        xabar('Tinglang…');
        kechik(0.2, function () {
          ijro(topKalit, 4, true, false);
          namoyish = false;
          xabar('Qaysi cholg‘u sadolandi? Uni bosing.');
        });
      } else {
        // Erkin rejimda — kichik namunaviy ohang chalinadi
        namoyish = true;
        const namuna = [[0, 4], [0, 5], [8, 0], [1, 6], [1, 4], [8, 0], [5, 7], [9, 0]];
        let v = 0.1;
        namuna.forEach(function (n) {
          kechik(v, function () { ijro(n[0], n[1], true, true); pardaUrgu(n[1]); });
          v += 0.55;
        });
        kechik(v, function () { namoyish = false; xabar('Endi o‘zingiz chalib ko‘ring.'); });
      }
    });

    /* ================= O‘lcham va render halqasi ================= */
    function olcham() {
      const w = idish.clientWidth || 640;
      const h = Math.min(Math.round(w * 0.62), 560);
      renderer.setSize(w, h, false);
      kamera.aspect = w / h;
      kamera.updateProjectionMatrix();
    }
    olcham();
    if (window.ResizeObserver) new ResizeObserver(olcham).observe(idish);
    else window.addEventListener('resize', olcham);

    let ishlayapti = false, oxirgi = 0, umumiy = 0;

    function halqa(vaqt) {
      if (!ishlayapti) return;
      const dt = Math.min((vaqt - oxirgi) / 1000, 0.05);
      oxirgi = vaqt;
      umumiy += dt;

      /* --- Kechiktirilgan vazifalar --- */
      for (let i = 0; i < navbat.length; i++) navbat[i].qoldi -= dt;
      while (navbat.length && navbat[0].qoldi <= 0) {
        const v = navbat.shift();
        try { v.ish(); } catch (e) {}
      }

      /* --- Cholg‘u tebranishi --- */
      cholgular.forEach(function (G) {
        const u = G.userData;
        if (u.tebranish > 0) {
          u.tebranish = Math.max(0, u.tebranish - dt * 1.5);
          const p = u.tebranish;
          const q = Math.sin(umumiy * 34) * p * 0.055;
          u.tashuvchi.position.y = 0.28 + p * 0.26;
          u.tashuvchi.rotation.z = q;
          u.tashuvchi.rotation.y = Math.sin(umumiy * 22) * p * 0.05;
          if (u.halqaMat.emissiveIntensity > 0.45) {
            u.halqaMat.emissiveIntensity = 0.45 + p * 0.8;
          }
          if (p === 0 && !(rejim === 'erkin' && u.index === tanlangan)) {
            u.halqa.visible = false;
          }
        } else {
          u.tashuvchi.position.y += (0.28 - u.tashuvchi.position.y) * Math.min(1, dt * 8);
          u.tashuvchi.rotation.z += (0 - u.tashuvchi.rotation.z) * Math.min(1, dt * 8);
          u.tashuvchi.rotation.y += (0 - u.tashuvchi.rotation.y) * Math.min(1, dt * 8);
        }
      });

      /* --- Pardalar bosilganda cho‘kadi --- */
      pardalar.forEach(function (P) {
        const u = P.userData;
        if (u.urgu > 0) u.urgu = Math.max(0, u.urgu - dt * 3.2);
        P.position.y = u.asosY - u.urgu * 0.09;
        P.userData.plita.material.emissiveIntensity = 0.04 + u.urgu * 0.9;
      });

      /* --- Sado halqalari --- */
      for (let i = sadolar.length - 1; i >= 0; i--) {
        const s = sadolar[i];
        s.userData.t += dt;
        const p = s.userData.t / 1.15;
        s.scale.setScalar(1 + p * 3.2);
        s.material.opacity = Math.max(0, 0.75 * (1 - p));
        if (p >= 1) {
          sahna.remove(s);
          s.geometry.dispose(); s.material.dispose();
          sadolar.splice(i, 1);
        }
      }

      /* --- Figuralar raqsi va qo‘g‘irchoq --- */
      if (raqs > 0) raqs = Math.max(0, raqs - dt * 0.7);
      shaxslar.forEach(function (m, i) {
        const u = m.userData;
        if (u.sakrash > 0) u.sakrash = Math.max(0, u.sakrash - dt * 1.6);
        const kuch = Math.max(raqs, u.sakrash || 0);
        if (kamHarakat) { m.position.y = u.asosY; return; }
        m.position.y = u.asosY + Math.abs(Math.sin(umumiy * 4.2 + u.faza)) * 0.20 * kuch;
        m.rotation.z = Math.sin(umumiy * 4.2 + u.faza) * 0.06 * kuch;
      });
      if (qogirchoq && !kamHarakat) {
        qogirchoq.position.y = 1.28 + Math.abs(Math.sin(umumiy * 5.0)) * 0.22 * Math.max(raqs, 0.18);
        qogirchoq.rotation.y = Math.sin(umumiy * 2.1) * 0.32;
        qogirchoq.rotation.z = Math.sin(umumiy * 5.0) * 0.10 * Math.max(raqs, 0.15);
      }

      renderer.render(sahna, kamera);
      requestAnimationFrame(halqa);
    }

    function yoq() {
      if (ishlayapti) return;
      ishlayapti = true; oxirgi = performance.now();
      requestAnimationFrame(halqa);
    }
    function ochir() { ishlayapti = false; }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (y) {
        y[0].isIntersecting ? yoq() : ochir();
      }, { threshold: 0.02 }).observe(idish);
    } else { yoq(); }
    yoq();

    window.addEventListener('pagehide', function () {
      ochir();
      try { renderer.dispose(); } catch (e) {}
      try { if (AC) AC.close(); } catch (e) {}
    });

    /* ---- Boshlang‘ich holat ---- */
    tugmalarniYangila('erkin');
    erkinRejim();
    idish.focus({ preventScroll: true });
  }
})();
