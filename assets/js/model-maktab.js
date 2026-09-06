/* =========================================================================
   USTOZ-SHOGIRD MAKTABI VA USTAXONASI — 3D MODELLAR
   «Xalq pedagogikasi» darsligining 13-moduli uchun.

   13-modulda nomlangan detallar:
     · ustoz (maktabdor domla)      · shogird
     · lavh (kitob qo‘yiladigan)    · siyohdon
     · qamish qalam                 · xattotlik taxtasi
     · bolg‘a va sandon (hunar o‘rgatish)
     · ko‘rpacha, raxt (javon)

   Tashqi model fayllari ISHLATILMAGAN — hammasi Three.js geometriyalaridan.

   SHARTNOMA (model-cholgu.js, model-maishiy.js bilan bir xil):
     · har bir `xYasa()` THREE.Group qaytaradi,
     · eng katta o‘lchami 1.0–1.5 birlik,
     · pastki nuqtasi y = 0, X va Z bo‘yicha markazlashgan,
     · fayl oxirida `{ nom, yasa, izoh }` reyestri eksport qilinadi.
   ========================================================================= */

import * as THREE from '../vendor/three.module.min.js';

/* ------------------------------ Ranglar ---------------------------------- */
const R = {
  yogochTuq:   0x6E5334,
  yogochAsos:  0x8A6A44,
  yogochOrta:  0xB08E64,
  yogochOchiq: 0xC8A97E,
  qogoz:       0xFBF7F0,
  qogozEski:   0xEFE2C6,
  teri:        0xE0B48C,
  soqolOq:     0xEDE7DC,
  soqolTuq:    0x4A3A30,
  siyoh:       0x1B1630,
  koya:        0x2A2118,
  metallTuq:   0x4A4E55,
  metallOq:    0xA9B0B8,
  mis:         0xC08A3E,
  oltin:       0xD4A24C,
  kok:         0x1B3B6F,
  yashil:      0x2F6B45,
  terrakota:   0xC1502E,
  qizil:       0x8C3A2B,
  oq:          0xFBF7F0,
  qamish:      0xD9BE86
};

function mat(rang, gadir, metall, qosh) {
  return new THREE.MeshStandardMaterial(
    Object.assign({ color: rang, roughness: gadir === undefined ? 0.72 : gadir,
                    metalness: metall || 0 }, qosh || {})
  );
}

function soyaBer(g) {
  g.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

function moslash(ichki, olcham) {
  soyaBer(ichki);
  const tashqi = new THREE.Group();
  tashqi.add(ichki);
  const q = new THREE.Box3().setFromObject(ichki);
  const o = q.getSize(new THREE.Vector3());
  const eng = Math.max(o.x, o.y, o.z) || 1;
  ichki.scale.setScalar((olcham || 1.3) / eng);
  const q2 = new THREE.Box3().setFromObject(ichki);
  const m = q2.getCenter(new THREE.Vector3());
  ichki.position.x -= m.x;
  ichki.position.z -= m.z;
  ichki.position.y -= q2.min.y;
  return tashqi;
}

/* =========================================================================
   1) LAVH — kitob qo‘yiladigan buklama yog‘och kursi (rahle)
   Ikki juft yog‘och panjara kesishib, X shaklida ochiladi; ustida
   o‘yma naqshli tayanch va kitobni ushlab turuvchi tirgak bor.
   ========================================================================= */
export function lavhYasa() {
  const ichki = new THREE.Group();
  const mYog = mat(R.yogochAsos, 0.7);
  const mTuq = mat(R.yogochTuq, 0.75);
  const mOl  = mat(R.oltin, 0.45, 0.4);

  // Kesishgan ikki yon ramka
  for (const yon of [-1, 1]) {
    for (const qiya of [-1, 1]) {
      const tayoq = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.95, 0.048), mYog);
      tayoq.position.set(yon * 0.30, 0.40, 0);
      tayoq.rotation.x = qiya * 0.62;
      ichki.add(tayoq);
    }
    // Kesishuv o‘qi
    const oq = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.10, 10), mOl);
    oq.rotation.z = Math.PI / 2;
    oq.position.set(yon * 0.30, 0.40, 0);
    ichki.add(oq);
  }

  // Ikki yon ramkani bog‘lovchi ko‘ndalang panjaralar
  for (const p of [[0.075, -0.30], [0.075, 0.30], [0.735, -0.30], [0.735, 0.30]]) {
    const kond = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.036, 0.036), mTuq);
    kond.position.set(0, p[0], p[1]);
    ichki.add(kond);
  }

  // Kitob yotadigan qiya tayanch taxtalari
  for (let i = 0; i < 2; i++) {
    const taxta = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.026, 0.30), mYog);
    taxta.position.set(0, 0.735 + i * 0.005, (i ? 0.155 : -0.155));
    taxta.rotation.x = (i ? 1 : -1) * 0.30;
    ichki.add(taxta);
  }
  // Kitobni ushlab turuvchi past tirgak
  const tirgak = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.05, 0.028), mTuq);
  tirgak.position.set(0, 0.70, 0.28);
  ichki.add(tirgak);

  // O‘yma naqsh — yon ramkalarning tepasida
  for (const yon of [-1, 1]) {
    for (const z of [-0.30, 0.30]) {
      const naqsh = new THREE.Mesh(new THREE.OctahedronGeometry(0.05), mOl);
      naqsh.scale.set(0.7, 1, 0.35);
      naqsh.position.set(yon * 0.30 + (z > 0 ? 0.0 : 0.0), 0.82, z * 0.92);
      ichki.add(naqsh);
    }
  }

  return moslash(ichki, 1.25);
}

/* =========================================================================
   2) SIYOHDON — sopol siyoh idishi, qopqoqli, yonida qalam yotqichi
   ========================================================================= */
export function siyohdonYasa() {
  const ichki = new THREE.Group();
  const mSopol = mat(0x3E5C6B, 0.5);
  const mNaqsh = mat(R.oq, 0.55);
  const mMis   = mat(R.mis, 0.4, 0.7);

  // Tana — qorincha shaklida (Lathe)
  const profil = [
    [0.00, 0.00], [0.26, 0.02], [0.32, 0.10], [0.34, 0.22],
    [0.30, 0.34], [0.22, 0.42], [0.20, 0.48], [0.23, 0.51], [0.00, 0.51]
  ].map(function (p) { return new THREE.Vector2(p[0], p[1]); });
  const tana = new THREE.Mesh(new THREE.LatheGeometry(profil, 26), mSopol);
  ichki.add(tana);

  // Og‘iz jiyagi
  const jiyak = new THREE.Mesh(new THREE.TorusGeometry(0.215, 0.022, 10, 24), mMis);
  jiyak.rotation.x = Math.PI / 2;
  jiyak.position.y = 0.50;
  ichki.add(jiyak);

  // Ichidagi siyoh
  const siyoh = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.02, 22), mat(R.siyoh, 0.25));
  siyoh.position.y = 0.47;
  ichki.add(siyoh);

  // Qopqoq — yonida ochiq turadi
  const qopqoq = new THREE.Mesh(new THREE.SphereGeometry(0.20, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), mSopol);
  qopqoq.scale.y = 0.5;
  qopqoq.rotation.z = Math.PI;
  qopqoq.position.set(0.44, 0.06, 0.10);
  ichki.add(qopqoq);
  const tugma = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), mMis);
  tugma.position.set(0.44, 0.015, 0.10);
  ichki.add(tugma);

  // Ko‘k sopol ustidagi oq naqsh halqalari
  for (const y of [0.14, 0.26, 0.36]) {
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.335 - Math.abs(y - 0.24) * 0.55, 0.009, 8, 26), mNaqsh);
    h.rotation.x = Math.PI / 2;
    h.position.y = y;
    ichki.add(h);
  }

  return moslash(ichki, 1.05);
}

/* =========================================================================
   3) QAMISH QALAM — xattotlik qalami (uchi qiya kesilgan)
   ========================================================================= */
export function qamishQalamYasa() {
  const ichki = new THREE.Group();
  const mQamish = mat(R.qamish, 0.62);
  const mTuq    = mat(0xA07B45, 0.7);

  const tana = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.046, 1.12, 14), mQamish);
  tana.rotation.z = Math.PI / 2;
  tana.position.y = 0.05;
  ichki.add(tana);

  // Qamish bo‘g‘imlari
  for (const x of [-0.30, 0.12, 0.44]) {
    const b = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.010, 8, 16), mTuq);
    b.rotation.y = Math.PI / 2;
    b.position.set(x, 0.05, 0);
    ichki.add(b);
  }

  // Qiya kesilgan yozuv uchi
  const uch = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.034, 0.22, 12), mat(0xC9A868, 0.6));
  uch.rotation.z = Math.PI / 2;
  uch.position.set(-0.66, 0.05, 0);
  ichki.add(uch);
  // Uchidagi siyoh izi
  const siyohIz = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.09, 10), mat(R.siyoh, 0.4));
  siyohIz.rotation.z = Math.PI / 2;
  siyohIz.position.set(-0.76, 0.05, 0);
  ichki.add(siyohIz);
  // Uchdagi yoriq
  const yoriq = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.004, 0.032), mat(R.koya, 0.7));
  yoriq.position.set(-0.68, 0.05, 0);
  ichki.add(yoriq);

  return moslash(ichki, 1.20);
}

/* =========================================================================
   4) XATTOTLIK TAXTASI — mashq uchun yog‘och taxta (dastali)
   Ustida qamish qalam bilan yozilgan uch qator xat izi bor.
   ========================================================================= */
export function xattotlikTaxtasiYasa() {
  const ichki = new THREE.Group();
  const mTaxta = mat(0xD9C39A, 0.78);
  const mRamka = mat(R.yogochTuq, 0.75);
  const mSiyoh = mat(R.siyoh, 0.55);

  const taxta = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.045, 1.15), mTaxta);
  taxta.position.y = 0.06;
  ichki.add(taxta);

  // Ramka
  for (const p of [[0, 0.58, 0.90, 0.05], [0, -0.58, 0.90, 0.05]]) {
    const r = new THREE.Mesh(new THREE.BoxGeometry(p[2], 0.055, p[3]), mRamka);
    r.position.set(p[0], 0.075, p[1]);
    ichki.add(r);
  }
  for (const x of [-0.44, 0.44]) {
    const r = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.055, 1.19), mRamka);
    r.position.set(x, 0.075, 0);
    ichki.add(r);
  }

  // Yozuv qatorlari — o‘ngdan chapga qiya harflar
  for (let q = 0; q < 4; q++) {
    const z = -0.36 + q * 0.24;
    for (let i = 0; i < 6; i++) {
      const harf = new THREE.Mesh(
        new THREE.BoxGeometry(0.035 + Math.random() * 0.05, 0.006, 0.055 + Math.random() * 0.03),
        mSiyoh);
      harf.position.set(0.30 - i * 0.12, 0.088, z + (Math.random() - 0.5) * 0.03);
      harf.rotation.y = (Math.random() - 0.5) * 0.5;
      ichki.add(harf);
    }
    // Qator chizig‘i
    const chiziq = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.004, 0.006), mat(0xB9A882, 0.9));
    chiziq.position.set(0, 0.085, z + 0.075);
    ichki.add(chiziq);
  }

  // Dastasi — osib qo‘yish uchun teshikli chiqma
  const dasta = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.16), mRamka);
  dasta.position.set(0, 0.075, -0.66);
  ichki.add(dasta);
  const halqa = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 8, 18), mat(R.mis, 0.4, 0.7));
  halqa.rotation.x = Math.PI / 2;
  halqa.position.set(0, 0.10, -0.70);
  ichki.add(halqa);

  return moslash(ichki, 1.30);
}

/* =========================================================================
   5) BOLG‘A — temirchi hunarini o‘rgatish quroli
   ========================================================================= */
export function bolgaYasa() {
  const ichki = new THREE.Group();
  const mTemir = mat(R.metallTuq, 0.42, 0.72);
  const mYogoch = mat(R.yogochOrta, 0.8);

  const dasta = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.052, 0.98, 12), mYogoch);
  dasta.position.y = 0.49;
  ichki.add(dasta);
  // Dastadagi charm o‘ram
  for (let i = 0; i < 5; i++) {
    const o = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.010, 8, 16), mat(0x6B4A2E, 0.9));
    o.rotation.x = Math.PI / 2;
    o.position.y = 0.10 + i * 0.045;
    ichki.add(o);
  }

  // Bosh — to‘rtburchak temir
  const bosh = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.16, 0.16), mTemir);
  bosh.position.y = 1.00;
  ichki.add(bosh);
  // Urish yuzi
  const yuz = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.06, 14), mat(0x6E747C, 0.35, 0.8));
  yuz.rotation.z = Math.PI / 2;
  yuz.position.set(0.25, 1.00, 0);
  ichki.add(yuz);
  // Ikkinchi uchi — pona
  const pona = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.20, 4), mTemir);
  pona.rotation.z = Math.PI / 2;
  pona.rotation.y = Math.PI / 4;
  pona.position.set(-0.30, 1.00, 0);
  ichki.add(pona);
  // Dasta o‘tadigan halqa
  const halqa = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.018, 8, 18), mat(0x5A6068, 0.4, 0.75));
  halqa.rotation.x = Math.PI / 2;
  halqa.position.y = 1.09;
  ichki.add(halqa);

  return moslash(ichki, 1.25);
}

/* =========================================================================
   6) SANDON — temirchining zil sandoni (hunar o‘rgatiladigan joy)
   ========================================================================= */
export function sandonYasa() {
  const ichki = new THREE.Group();
  const mTemir = mat(0x4A4E55, 0.45, 0.7);
  const mKunda = mat(R.yogochTuq, 0.85);

  // Yog‘och kunda
  const kunda = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.40, 0.60, 14), mKunda);
  kunda.position.y = 0.30;
  ichki.add(kunda);
  for (let i = 0; i < 3; i++) {
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.355 - i * 0.005, 0.018, 8, 20), mat(0x5A4326, 0.85));
    h.rotation.x = Math.PI / 2;
    h.position.y = 0.14 + i * 0.19;
    ichki.add(h);
  }

  // Sandon tanasi
  const asos = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.10, 0.30), mTemir);
  asos.position.y = 0.65;
  ichki.add(asos);
  const bel = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.22), mTemir);
  bel.position.y = 0.78;
  ichki.add(bel);
  const yuza = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.14, 0.26), mTemir);
  yuza.position.y = 0.93;
  ichki.add(yuza);
  // Uchli shox (konus)
  const shox = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.34, 14), mTemir);
  shox.rotation.z = -Math.PI / 2;
  shox.position.set(0.52, 0.93, 0);
  ichki.add(shox);
  // Chorburchak teshik
  const teshik = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 0.07), mat(R.koya, 0.9));
  teshik.position.set(-0.24, 1.00, 0);
  ichki.add(teshik);

  return moslash(ichki, 1.30);
}

/* =========================================================================
   7) USTOZ (MAKTABDOR DOMLA) — chordana qurib o‘tirgan, oq soqolli,
   sallali, qo‘lida ochiq kitob.
   ========================================================================= */
export function ustozYasa() {
  const ichki = new THREE.Group();
  const mChopon = mat(0x2E4A7A, 0.9);
  const mJiyak  = mat(R.oltin, 0.75);
  const mTeri   = mat(R.teri, 0.75);
  const mSalla  = mat(R.oq, 0.92);
  const mSoqol  = mat(R.soqolOq, 0.95);

  /* --- Chordana qurgan oyoqlar --- */
  for (const yon of [-1, 1]) {
    const son = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.10, 0.46, 12), mChopon);
    son.rotation.z = Math.PI / 2;
    son.rotation.y = yon * 0.55;
    son.position.set(yon * 0.20, 0.11, 0.10);
    ichki.add(son);

    const boldir = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.085, 0.42, 12), mChopon);
    boldir.rotation.z = Math.PI / 2;
    boldir.rotation.y = -yon * 0.9;
    boldir.position.set(yon * 0.10, 0.10, 0.30);
    ichki.add(boldir);
  }
  // Oyoq kiyimi ko‘rinmaydi — chordana

  /* --- Tana (chopon) --- */
  const profil = [
    [0.00, 0.16], [0.36, 0.16], [0.335, 0.30], [0.30, 0.44],
    [0.275, 0.58], [0.265, 0.70], [0.255, 0.78], [0.00, 0.80]
  ].map(function (p) { return new THREE.Vector2(p[0], p[1]); });
  const tana = new THREE.Mesh(new THREE.LatheGeometry(profil, 24), mChopon);
  ichki.add(tana);

  // Chopon yoqasi
  for (const yon of [-1, 1]) {
    const yoqa = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.52, 0.04), mJiyak);
    yoqa.position.set(yon * 0.07, 0.48, 0.265);
    yoqa.rotation.z = yon * 0.07;
    ichki.add(yoqa);
  }
  // Belbog‘
  const belbog = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.045, 10, 26), mat(R.qizil, 0.9));
  belbog.rotation.x = Math.PI / 2;
  belbog.scale.z = 0.85;
  belbog.position.y = 0.30;
  ichki.add(belbog);

  /* --- Yelka va qo‘llar (oldinga, kitob ushlagan) --- */
  const yelka = new THREE.Mesh(new THREE.SphereGeometry(0.26, 18, 12), mChopon);
  yelka.scale.set(1, 0.5, 0.8);
  yelka.position.y = 0.76;
  ichki.add(yelka);

  for (const yon of [-1, 1]) {
    const qol = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.058, 0.34, 10), mChopon);
    qol.position.set(yon * 0.245, 0.62, 0.05);
    qol.rotation.z = yon * 0.30;
    qol.rotation.x = -0.35;
    ichki.add(qol);

    const bilak = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.30, 10), mChopon);
    bilak.position.set(yon * 0.235, 0.50, 0.27);
    bilak.rotation.x = -1.15;
    ichki.add(bilak);

    const kaft = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), mTeri);
    kaft.scale.set(1, 0.75, 1.2);
    kaft.position.set(yon * 0.225, 0.475, 0.40);
    ichki.add(kaft);
  }

  /* --- Qo‘lidagi ochiq kitob --- */
  const kitob = new THREE.Group();
  for (const yon of [-1, 1]) {
    const muqova = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.018, 0.27), mat(R.qizil, 0.6));
    muqova.position.set(yon * 0.108, 0, 0);
    muqova.rotation.z = yon * 0.16;
    kitob.add(muqova);
    const varaq = new THREE.Mesh(new THREE.BoxGeometry(0.195, 0.02, 0.25), mat(R.qogozEski, 0.9));
    varaq.position.set(yon * 0.105, 0.019, 0);
    varaq.rotation.z = yon * 0.16;
    kitob.add(varaq);
    for (let i = 0; i < 5; i++) {
      const q = new THREE.Mesh(new THREE.BoxGeometry(0.135, 0.004, 0.012), mat(0x5B4A34, 0.9));
      q.position.set(yon * 0.105, 0.031, -0.085 + i * 0.043);
      q.rotation.z = yon * 0.16;
      kitob.add(q);
    }
  }
  kitob.position.set(0, 0.50, 0.44);
  kitob.rotation.x = -0.55;
  ichki.add(kitob);

  /* --- Bo‘yin, bosh --- */
  const boyin = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.09, 12), mTeri);
  boyin.position.y = 0.84;
  ichki.add(boyin);

  const kalla = new THREE.Mesh(new THREE.SphereGeometry(0.155, 20, 16), mTeri);
  kalla.scale.set(0.92, 1.06, 0.95);
  kalla.position.y = 1.00;
  ichki.add(kalla);

  for (const x of [-0.058, 0.058]) {
    const oq = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), mat(R.oq, 0.4));
    oq.scale.set(1, 0.72, 0.5);
    oq.position.set(x, 1.02, 0.128);
    ichki.add(oq);
    const qora = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), mat(R.koya, 0.4));
    qora.position.set(x, 1.018, 0.145);
    ichki.add(qora);
    const qosh = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.012, 0.016), mat(0xCFC7BC, 0.9));
    qosh.position.set(x, 1.062, 0.132);
    qosh.rotation.z = x > 0 ? -0.14 : 0.14;
    ichki.add(qosh);
  }
  const burun = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.07, 8), mTeri);
  burun.rotation.x = Math.PI / 2;
  burun.position.set(0, 0.995, 0.15);
  ichki.add(burun);

  // Uzun oq soqol
  const soqol = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 14), mSoqol);
  soqol.scale.set(0.88, 1.55, 0.7);
  soqol.position.set(0, 0.845, 0.055);
  ichki.add(soqol);
  const moylov = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), mSoqol);
  moylov.scale.set(1.6, 0.5, 0.7);
  moylov.position.set(0, 0.955, 0.128);
  ichki.add(moylov);

  // Salla
  for (let i = 0; i < 5; i++) {
    const halqa = new THREE.Mesh(new THREE.TorusGeometry(0.155 - i * 0.011, 0.042, 10, 24), mSalla);
    halqa.rotation.x = Math.PI / 2;
    halqa.rotation.z = i * 0.4;
    halqa.position.y = 1.09 + i * 0.055;
    ichki.add(halqa);
  }
  const sallaUch = new THREE.Mesh(new THREE.SphereGeometry(0.10, 14, 10), mSalla);
  sallaUch.scale.y = 0.55;
  sallaUch.position.y = 1.335;
  ichki.add(sallaUch);
  // Salla uchi osilgan quyruq
  const quyruq = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.30, 0.02), mSalla);
  quyruq.position.set(0.16, 1.10, -0.09);
  quyruq.rotation.z = 0.15;
  ichki.add(quyruq);

  return moslash(ichki, 1.45);
}

/* =========================================================================
   8) SHOGIRD — tiz cho‘kib o‘tirgan o‘quvchi bola, do‘ppili
   ========================================================================= */
export function shogirdYasa() {
  const ichki = new THREE.Group();
  const mKoylak = mat(0xE8DCC0, 0.9);
  const mNimcha = mat(R.yashil, 0.9);
  const mIshton = mat(0x6A5A46, 0.9);
  const mTeri   = mat(R.teri, 0.75);

  /* --- Tiz cho‘kkan oyoqlar --- */
  for (const yon of [-1, 1]) {
    const boldir = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.11, 0.36), mIshton);
    boldir.position.set(yon * 0.10, 0.055, -0.10);
    ichki.add(boldir);
    const tizza = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 10), mIshton);
    tizza.position.set(yon * 0.10, 0.085, 0.10);
    ichki.add(tizza);
    const oyoq = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.07, 0.18), mat(R.yogochTuq, 0.8));
    oyoq.position.set(yon * 0.10, 0.035, -0.28);
    ichki.add(oyoq);
  }

  /* --- Tana --- */
  const tana = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.19, 0.40, 18), mKoylak);
  tana.position.set(0, 0.32, 0.02);
  ichki.add(tana);

  // Ustidan kiyilgan nimcha (jilet)
  const nimcha = new THREE.Mesh(new THREE.CylinderGeometry(0.168, 0.20, 0.34, 18, 1, true), mNimcha);
  nimcha.material.side = THREE.DoubleSide;
  nimcha.position.set(0, 0.34, 0.02);
  ichki.add(nimcha);
  const nJiyak = new THREE.Mesh(new THREE.TorusGeometry(0.20, 0.014, 8, 22), mat(R.oltin, 0.7));
  nJiyak.rotation.x = Math.PI / 2;
  nJiyak.position.set(0, 0.17, 0.02);
  ichki.add(nJiyak);

  /* --- Yelka va qo‘llar (tizzada) --- */
  const yelka = new THREE.Mesh(new THREE.SphereGeometry(0.165, 16, 12), mKoylak);
  yelka.scale.set(1, 0.5, 0.85);
  yelka.position.set(0, 0.51, 0.02);
  ichki.add(yelka);

  for (const yon of [-1, 1]) {
    const qol = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.042, 0.28, 10), mKoylak);
    qol.position.set(yon * 0.155, 0.40, 0.06);
    qol.rotation.z = yon * 0.20;
    qol.rotation.x = -0.30;
    ichki.add(qol);
    const bilak = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.036, 0.24, 10), mTeri);
    bilak.position.set(yon * 0.145, 0.28, 0.14);
    bilak.rotation.x = -1.0;
    ichki.add(bilak);
    const kaft = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 8), mTeri);
    kaft.scale.set(1, 0.7, 1.15);
    kaft.position.set(yon * 0.14, 0.20, 0.21);
    ichki.add(kaft);
  }

  /* --- Bosh --- */
  const boyin = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.055, 0.07, 12), mTeri);
  boyin.position.set(0, 0.56, 0.02);
  ichki.add(boyin);

  const kalla = new THREE.Mesh(new THREE.SphereGeometry(0.125, 20, 16), mTeri);
  kalla.scale.set(0.94, 1.04, 0.96);
  kalla.position.set(0, 0.68, 0.02);
  ichki.add(kalla);

  for (const x of [-0.045, 0.045]) {
    const oq = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 8), mat(R.oq, 0.4));
    oq.scale.set(1, 0.78, 0.5);
    oq.position.set(x, 0.695, 0.125);
    ichki.add(oq);
    const qora = new THREE.Mesh(new THREE.SphereGeometry(0.013, 8, 8), mat(R.koya, 0.4));
    qora.position.set(x, 0.693, 0.14);
    ichki.add(qora);
    const qosh = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.01, 0.014), mat(R.soqolTuq, 0.9));
    qosh.position.set(x, 0.73, 0.128);
    ichki.add(qosh);
  }
  const burun = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.055, 8), mTeri);
  burun.rotation.x = Math.PI / 2;
  burun.position.set(0, 0.672, 0.14);
  ichki.add(burun);
  const ogiz = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.008, 8, 14, Math.PI), mat(0x8A4038, 0.85));
  ogiz.rotation.z = Math.PI;
  ogiz.position.set(0, 0.635, 0.125);
  ichki.add(ogiz);

  // Do‘ppi
  const gumbaz = new THREE.Mesh(
    new THREE.SphereGeometry(0.128, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x16162E, 0.62));
  gumbaz.scale.y = 0.6;
  gumbaz.position.set(0, 0.755, 0.02);
  ichki.add(gumbaz);
  const chekka = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.138, 0.05, 20), mat(0x101024, 0.7));
  chekka.position.set(0, 0.762, 0.02);
  ichki.add(chekka);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const bodom = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), mat(R.oq, 0.5));
    bodom.scale.set(0.6, 1.6, 0.6);
    bodom.position.set(Math.cos(a) * 0.137, 0.762, 0.02 + Math.sin(a) * 0.137);
    ichki.add(bodom);
  }

  return moslash(ichki, 1.25);
}

/* =========================================================================
   9) KO‘RPACHA — ustoz o‘tiradigan qavilgan ko‘rpacha
   ========================================================================= */
export function korpachaYasa() {
  const ichki = new THREE.Group();
  const mUst = mat(R.qizil, 0.95);
  const mJiyak = mat(R.oltin, 0.8);

  const asos = new THREE.Mesh(new THREE.BoxGeometry(1.30, 0.10, 0.90), mUst);
  asos.position.y = 0.05;
  ichki.add(asos);

  // Qavilgan romblar
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 3; j++) {
      const r = new THREE.Mesh(new THREE.OctahedronGeometry(0.075), mJiyak);
      r.scale.set(1, 0.16, 1);
      r.position.set(-0.48 + i * 0.32, 0.101, -0.28 + j * 0.28);
      ichki.add(r);
    }
  }
  // Chekka jiyak
  for (const p of [[0, 0.45, 1.30, 0.04], [0, -0.45, 1.30, 0.04]]) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(p[2], 0.105, p[3]), mJiyak);
    c.position.set(p[0], 0.051, p[1]);
    ichki.add(c);
  }
  for (const x of [-0.65, 0.65]) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.105, 0.90), mJiyak);
    c.position.set(x, 0.051, 0);
    ichki.add(c);
  }

  return moslash(ichki, 1.40);
}

/* =========================================================================
   RO‘YXAT
   ========================================================================= */
export const MAKTAB = {
  lavh:      { nom: 'Lavh',                yasa: lavhYasa,
               izoh: 'Kitob qo‘yiladigan buklama yog‘och kursi — kitobni yerga qo‘ymaslik odobi.' },
  siyohdon:  { nom: 'Siyohdon',            yasa: siyohdonYasa,
               izoh: 'Qamish qalam botiriladigan sopol siyoh idishi.' },
  qamish:    { nom: 'Qamish qalam',        yasa: qamishQalamYasa,
               izoh: 'Uchi qiya kesilgan qamish qalam — xattotlikning asosiy quroli.' },
  taxta:     { nom: 'Xattotlik taxtasi',   yasa: xattotlikTaxtasiYasa,
               izoh: 'Harf mashqi yozilib, yuvib tashlanadigan yog‘och taxta.' },
  bolga:     { nom: 'Bolg‘a',              yasa: bolgaYasa,
               izoh: 'Temirchilik hunari o‘rgatiladigan asosiy asbob.' },
  sandon:    { nom: 'Sandon',              yasa: sandonYasa,
               izoh: 'Ustaxonadagi zil temir sandon — hunar shu yerda o‘rganiladi.' },
  ustoz:     { nom: 'Ustoz (maktabdor)',   yasa: ustozYasa,
               izoh: '«Ustoz otangdan ulug‘» — bilim beruvchi, o‘git aytuvchi domla.' },
  shogird:   { nom: 'Shogird',             yasa: shogirdYasa,
               izoh: 'Ustoz oldida tiz cho‘kib dars olayotgan o‘quvchi.' },
  korpacha:  { nom: 'Ko‘rpacha',           yasa: korpachaYasa,
               izoh: 'Maktab hujrasida ustoz va shogird o‘tiradigan qavilgan ko‘rpacha.' }
};
