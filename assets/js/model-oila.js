/* =========================================================
   OILA — 3D MODELLAR KUTUBXONASI
   3-modul: «Xalq pedagogikasida oila va oilaviy tarbiyaning
   aks etishi».

   Darslik matnida nomlangan har bir sima uchun alohida, tanib
   olsa bo‘ladigan model: bobo, buvi, ota, ona, o‘g‘il, qiz va
   beshikdagi chaqaloq. Ularga qo‘shimcha hovli buyumlari:
   supa, tandir, shajara daraxti va shox uyasi.

   Model shartnomasi (reyestrdagilar uchun):
     · har bir `xYasa()` funksiyasi THREE.Group qaytaradi,
     · eng katta o‘lchami 1.0–1.5 birlik,
     · pastki nuqtasi y = 0, xz bo‘yicha markazlashgan.

   Sahna quruvchilari (shajaraYasa, uyaYasa) bu o‘lcham
   shartiga bo‘ysunmaydi — ular butun sahna uchun mo‘ljallangan
   va shu sababli reyestrga kiritilmagan.
   ========================================================= */
import * as THREE from '../vendor/three.module.min.js';
import { beshikYasa } from './model-maishiy.js';

/* =========================================================
   0. UMUMIY MATERIALLAR VA YORDAMCHILAR
   ========================================================= */
const R = {
  teri:      0xE3B189,   // yuz-qo‘l rangi
  teriTuq:   0xC9946C,
  oqSoch:    0xF2EEE4,   // bobo-buvining oq sochi
  qoraSoch:  0x2B2118,
  doppi:     0x16162E,
  doppiOq:   0xFBF7F0,
  indigo:    0x1B3B6F,
  indigo2:   0x2C5FA8,
  terrakota: 0xC1502E,
  yashil:    0x2F6B45,
  oltin:     0xD4A24C,
  krem:      0xFBF7F0,
  etik:      0x3A2A1C,
  yogoch:    0x8A6A44,
  yogochTuq: 0x6E5334,
  gisht:     0xA9714B,
  barg:      0x2F6B45,
  bargOch:   0x4E8C55,
};

const mat = (c, r = 0.8, m = 0) =>
  new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });

function soya(o, qabul = false) {
  o.castShadow = true;
  if (qabul) o.receiveShadow = true;
  return o;
}

/* ---------- Xon-atlas to‘qimasi (ayollar ko‘ylagi uchun) ----------
   Tik, to‘lqinli rangli yo‘llar — atlas matosining o‘ziga xos
   belgisi. CanvasTexture bir marta yasalib, keshlanadi.          */
let _atlas = null;
function atlasToqima() {
  if (_atlas) return _atlas;
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const k = c.getContext('2d');
  k.fillStyle = '#FBF7F0';
  k.fillRect(0, 0, 256, 64);
  const yollar = ['#C1502E', '#D4A24C', '#1B3B6F', '#2F6B45', '#FBF7F0',
                  '#D4A24C', '#C1502E', '#1B3B6F'];
  for (let i = 0; i < yollar.length; i++) {
    k.fillStyle = yollar[i];
    const x = i * (256 / yollar.length);
    const w = 256 / yollar.length;
    // to‘lqinli chekka — atlas bo‘yog‘i chetga yoyilib ketadi
    k.beginPath();
    k.moveTo(x, 0);
    for (let y = 0; y <= 64; y += 4) {
      k.lineTo(x + Math.sin(y * 0.28 + i) * 3.2, y);
    }
    for (let y = 64; y >= 0; y -= 4) {
      k.lineTo(x + w + Math.sin(y * 0.28 + i + 1.4) * 3.2, y);
    }
    k.closePath();
    k.fill();
  }
  _atlas = new THREE.CanvasTexture(c);
  _atlas.colorSpace = THREE.SRGBColorSpace;
  _atlas.wrapS = _atlas.wrapT = THREE.RepeatWrapping;
  _atlas.repeat.set(3, 1);
  return _atlas;
}

/* ---------- Do‘ppi — bodom naqshli milliy bosh kiyim ---------- */
function doppiQismi(rBosh) {
  const g = new THREE.Group();
  const qora = mat(R.doppi, 0.62);
  const oq = mat(R.doppiOq, 0.5);

  const gumbaz = new THREE.Mesh(
    new THREE.SphereGeometry(rBosh * 1.05, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), qora);
  gumbaz.scale.y = 0.72;
  g.add(soya(gumbaz));

  const chekka = new THREE.Mesh(
    new THREE.CylinderGeometry(rBosh * 1.10, rBosh * 1.13, rBosh * 0.34, 18), qora);
  chekka.position.y = rBosh * 0.17;
  g.add(soya(chekka));

  // Chekkadagi oq bodom naqshlari
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const b = new THREE.Mesh(new THREE.SphereGeometry(rBosh * 0.085, 8, 6), oq);
    b.scale.set(0.6, 1.7, 0.6);
    b.position.set(Math.cos(a) * rBosh * 1.11, rBosh * 0.18, Math.sin(a) * rBosh * 1.11);
    g.add(b);
  }
  return g;
}

/* ---------- Ro‘mol — ayollar bosh kiyimi ---------- */
function romolQismi(rBosh, rang) {
  const g = new THREE.Group();
  const m = mat(rang, 0.95);

  // Tepa qism — boshning ustini yopadi
  const tepa = new THREE.Mesh(
    new THREE.SphereGeometry(rBosh * 1.07, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.40), m);
  g.add(soya(tepa));

  // Yon va orqa qism — yuz ochiq qoladi
  const ORALIQ = 0.52;                       // old tomondagi ochiq burchak
  const yon = new THREE.Mesh(
    new THREE.SphereGeometry(rBosh * 1.08, 20, 12,
      Math.PI * 0.5 + ORALIQ, Math.PI * 2 - ORALIQ * 2, 0, Math.PI * 0.72), m);
  yon.material.side = THREE.DoubleSide;
  g.add(soya(yon));

  // Orqaga tushgan uchi — yelkaga yoyilgan mato
  const uchi = new THREE.Mesh(
    new THREE.SphereGeometry(rBosh * 1.15, 18, 12, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.35), m);
  uchi.material.side = THREE.DoubleSide;
  uchi.scale.set(1.05, 1.9, 0.85);
  uchi.position.set(0, -rBosh * 0.30, -rBosh * 0.30);
  g.add(soya(uchi));

  // Peshonadagi jiyak — old chekkasini bezaydi
  const jiyak = new THREE.Mesh(
    new THREE.TorusGeometry(rBosh * 1.05, 0.055 * rBosh, 6, 22,
      Math.PI * 2 - ORALIQ * 2), mat(R.oltin, 0.5, 0.3));
  jiyak.rotation.set(-Math.PI / 2, 0, -(Math.PI * 0.5 + ORALIQ));
  jiyak.position.y = rBosh * 0.10;
  g.add(jiyak);
  return g;
}

/* ---------- Yuz — ko‘z, qosh, burun, og‘iz ---------- */
function yuzQismi(rBosh) {
  const g = new THREE.Group();
  const qora = mat(0x241A12, 0.42);
  const oq = mat(0xFDFBF7, 0.32);
  // Bosh sferasi z bo‘yicha 0.93 ga siqilgan — yuz qismlari shundan
  // oldinroqqa qo‘yiladi, aks holda bosh ichida ko‘rinmay qoladi.
  const OLD = 0.93;

  for (const x of [-1, 1]) {
    const koz = new THREE.Mesh(new THREE.SphereGeometry(rBosh * 0.155, 12, 10), oq);
    koz.scale.set(1, 0.80, 0.55);
    koz.position.set(x * rBosh * 0.35, rBosh * 0.07, rBosh * (OLD - 0.05));
    g.add(koz);

    const qorachiq = new THREE.Mesh(new THREE.SphereGeometry(rBosh * 0.078, 10, 8), qora);
    qorachiq.position.set(x * rBosh * 0.35, rBosh * 0.07, rBosh * (OLD + 0.04));
    g.add(qorachiq);

    const qosh = new THREE.Mesh(
      new THREE.BoxGeometry(rBosh * 0.32, rBosh * 0.055, rBosh * 0.08), qora);
    qosh.position.set(x * rBosh * 0.35, rBosh * 0.33, rBosh * (OLD - 0.02));
    qosh.rotation.z = -x * 0.14;
    g.add(qosh);
  }

  const burun = new THREE.Mesh(
    new THREE.ConeGeometry(rBosh * 0.10, rBosh * 0.24, 8), mat(R.teriTuq, 0.7));
  burun.rotation.x = Math.PI / 2;
  burun.position.set(0, -rBosh * 0.05, rBosh * (OLD + 0.02));
  g.add(burun);

  const ogiz = new THREE.Mesh(
    new THREE.TorusGeometry(rBosh * 0.15, rBosh * 0.032, 6, 16, Math.PI), mat(0x8C3A2B, 0.6));
  ogiz.rotation.set(0, 0, Math.PI);
  ogiz.position.set(0, -rBosh * 0.30, rBosh * (OLD - 0.03));
  g.add(ogiz);
  return g;
}

/* =========================================================
   1. ODAM — barcha oila a’zolari uchun umumiy quruvchi
   Parametrlar orqali bobo, buvi, ota, ona, o‘g‘il va qiz
   bir-biridan aniq farq qiladigan qilib yasaladi.
   ========================================================= */
function odamYasa(c) {
  const g = new THREE.Group();
  const H = c.boy;                 // umumiy bo‘y
  const s = H / 1.40;              // 1.40 bo‘yga nisbatan miqyos
  const rBosh = 0.118 * s;
  const teri = mat(c.teri || R.teri, 0.72);

  /* ---------- Oyoq va poyabzal ---------- */
  if (c.kiyim === 'chopon') {
    for (const x of [-1, 1]) {
      const shim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.056 * s, 0.048 * s, 0.42 * s, 10), mat(c.shim || R.indigo, 0.9));
      shim.position.set(x * 0.075 * s, 0.26 * s, 0);
      g.add(soya(shim));

      const etik = new THREE.Mesh(new THREE.BoxGeometry(0.11 * s, 0.10 * s, 0.20 * s), mat(R.etik, 0.7));
      etik.position.set(x * 0.075 * s, 0.05 * s, 0.03 * s);
      g.add(soya(etik, true));
    }
  } else {
    // Ko‘ylak ostidan ko‘rinib turgan mahsi-kavush
    for (const x of [-1, 1]) {
      const kavush = new THREE.Mesh(new THREE.SphereGeometry(0.062 * s, 10, 8), mat(R.etik, 0.6));
      kavush.scale.set(0.85, 0.62, 1.5);
      kavush.position.set(x * 0.065 * s, 0.038 * s, 0.075 * s);
      g.add(soya(kavush, true));
    }
  }

  /* ---------- Gavda ---------- */
  let yelkaY, yelkaX;
  if (c.kiyim === 'chopon') {
    /* CHOPON — tizzagacha tushadigan to‘n */
    const profil = [
      new THREE.Vector2(0.001, 0.44 * s),
      new THREE.Vector2(0.235 * s, 0.45 * s),
      new THREE.Vector2(0.225 * s, 0.60 * s),
      new THREE.Vector2(0.205 * s, 0.80 * s),
      new THREE.Vector2(0.225 * s, 0.98 * s),
      new THREE.Vector2(0.198 * s, 1.09 * s),
      new THREE.Vector2(0.001, 1.11 * s),
    ];
    const ton = new THREE.Mesh(new THREE.LatheGeometry(profil, 22), mat(c.kiyimRang, 0.88));
    g.add(soya(ton, true));

    // Choponning old yoqasi — ikki tomonlama jiyak
    for (const x of [-1, 1]) {
      const yoqa = new THREE.Mesh(
        new THREE.BoxGeometry(0.055 * s, 0.62 * s, 0.03 * s), mat(c.jiyak || R.oltin, 0.55, 0.25));
      yoqa.position.set(x * 0.055 * s, 0.76 * s, 0.204 * s);
      yoqa.rotation.z = x * 0.06;
      g.add(yoqa);
    }
    // Chopon etagidagi jiyak halqasi
    const etakJiyak = new THREE.Mesh(
      new THREE.TorusGeometry(0.234 * s, 0.014 * s, 6, 26), mat(c.jiyak || R.oltin, 0.55, 0.25));
    etakJiyak.rotation.x = -Math.PI / 2;
    etakJiyak.position.y = 0.452 * s;
    g.add(etakJiyak);

    // Belbog‘ — belga bog‘langan ro‘mol
    const belbog = new THREE.Mesh(
      new THREE.TorusGeometry(0.214 * s, 0.028 * s, 8, 26), mat(c.belbog || R.terrakota, 0.9));
    belbog.rotation.x = -Math.PI / 2;
    belbog.position.y = 0.80 * s;
    belbog.scale.set(1, 1, 0.88);
    g.add(soya(belbog));
    const tugun = new THREE.Mesh(new THREE.SphereGeometry(0.042 * s, 10, 8), mat(c.belbog || R.terrakota, 0.9));
    tugun.scale.set(1.2, 1, 0.8);
    tugun.position.set(0.03 * s, 0.785 * s, 0.20 * s);
    g.add(soya(tugun));

    yelkaY = 1.06 * s; yelkaX = 0.205 * s;
  } else {
    /* KO‘YLAK — uzun, etagi kengaygan atlas ko‘ylak */
    const profil = [
      new THREE.Vector2(0.001, 0.02 * s),
      new THREE.Vector2(0.30 * s, 0.05 * s),
      new THREE.Vector2(0.265 * s, 0.30 * s),
      new THREE.Vector2(0.205 * s, 0.62 * s),
      new THREE.Vector2(0.175 * s, 0.82 * s),
      new THREE.Vector2(0.205 * s, 0.98 * s),
      new THREE.Vector2(0.185 * s, 1.09 * s),
      new THREE.Vector2(0.001, 1.11 * s),
    ];
    const koylakMat = c.atlas
      ? new THREE.MeshStandardMaterial({ map: atlasToqima(), roughness: 0.85 })
      : mat(c.kiyimRang, 0.92);
    const koylak = new THREE.Mesh(new THREE.LatheGeometry(profil, 24), koylakMat);
    g.add(soya(koylak, true));

    // Bel jiyagi
    const bel = new THREE.Mesh(
      new THREE.TorusGeometry(0.182 * s, 0.022 * s, 8, 26), mat(c.jiyak || R.oltin, 0.6, 0.2));
    bel.rotation.x = -Math.PI / 2;
    bel.position.y = 0.80 * s;
    g.add(bel);

    // Ko‘krakdagi kashta yo‘li
    const kashta = new THREE.Mesh(
      new THREE.BoxGeometry(0.05 * s, 0.30 * s, 0.02 * s), mat(R.oltin, 0.5, 0.3));
    kashta.position.set(0, 0.92 * s, 0.19 * s);
    g.add(kashta);

    // Etakdagi jiyak
    const etak = new THREE.Mesh(
      new THREE.TorusGeometry(0.298 * s, 0.018 * s, 6, 30), mat(c.jiyak || R.oltin, 0.55, 0.25));
    etak.rotation.x = -Math.PI / 2;
    etak.position.y = 0.055 * s;
    g.add(etak);

    if (c.nimcha) {
      // Buvining ustidan kiygan nimchasi
      const nim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.212 * s, 0.222 * s, 0.34 * s, 22, 1, true),
        mat(c.nimcha, 0.9));
      nim.position.y = 0.90 * s;
      nim.material.side = THREE.DoubleSide;
      g.add(soya(nim));
      // Nimcha etagidagi jiyak
      const nimJ = new THREE.Mesh(
        new THREE.TorusGeometry(0.222 * s, 0.014 * s, 6, 26), mat(R.oltin, 0.5, 0.3));
      nimJ.rotation.x = -Math.PI / 2;
      nimJ.position.y = 0.73 * s;
      g.add(nimJ);
    }
    yelkaY = 1.06 * s; yelkaX = 0.19 * s;
  }

  /* ---------- Qo‘llar ---------- */
  for (const x of [-1, 1]) {
    const yeng = c.kiyim === 'chopon' ? mat(c.kiyimRang, 0.88) : (c.atlas
      ? new THREE.MeshStandardMaterial({ map: atlasToqima(), roughness: 0.85 })
      : mat(c.kiyimRang, 0.92));

    const qol = new THREE.Mesh(new THREE.CylinderGeometry(0.052 * s, 0.044 * s, 0.44 * s, 10), yeng);
    qol.position.set(x * (yelkaX + 0.045 * s), yelkaY - 0.22 * s, 0);
    qol.rotation.z = x * 0.16;
    g.add(soya(qol));

    // Kaft
    const kaft = new THREE.Mesh(new THREE.SphereGeometry(0.052 * s, 10, 8), teri);
    kaft.scale.set(0.85, 1, 0.7);
    kaft.position.set(x * (yelkaX + 0.115 * s), yelkaY - 0.45 * s, 0.01 * s);
    g.add(soya(kaft));

    // Yelka yumaloqligi
    const yelka = new THREE.Mesh(new THREE.SphereGeometry(0.062 * s, 10, 8), yeng);
    yelka.position.set(x * yelkaX, yelkaY, 0);
    g.add(yelka);
  }

  /* ---------- Bo‘yin va bosh ---------- */
  const boyin = new THREE.Mesh(new THREE.CylinderGeometry(0.048 * s, 0.055 * s, 0.07 * s, 10), teri);
  boyin.position.y = 1.14 * s;
  g.add(boyin);

  const boshY = 1.14 * s + rBosh * 0.92;
  const bosh = new THREE.Mesh(new THREE.SphereGeometry(rBosh, 20, 16), teri);
  bosh.scale.set(0.93, 1.06, 0.93);
  bosh.position.y = boshY;
  g.add(soya(bosh));

  const yuz = yuzQismi(rBosh);
  yuz.position.y = boshY;
  g.add(yuz);

  // Quloqlar
  for (const x of [-1, 1]) {
    const q = new THREE.Mesh(new THREE.SphereGeometry(rBosh * 0.22, 8, 6), teri);
    q.scale.set(0.45, 1, 0.8);
    q.position.set(x * rBosh * 0.92, boshY - rBosh * 0.02, 0);
    g.add(q);
  }

  /* ---------- Soch ---------- */
  if (c.soch === 'orim') {
    // Qizlarning ikki o‘rim sochi
    const sochM = mat(R.qoraSoch, 0.75);
    const tepa = new THREE.Mesh(
      new THREE.SphereGeometry(rBosh * 1.04, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.52), sochM);
    tepa.position.y = boshY;
    g.add(soya(tepa));
    for (const x of [-1, 1]) {
      const orim = new THREE.Mesh(
        new THREE.CylinderGeometry(rBosh * 0.24, rBosh * 0.13, rBosh * 3.1, 8), sochM);
      orim.position.set(x * rBosh * 0.82, boshY - rBosh * 1.5, -rBosh * 0.45);
      orim.rotation.z = x * 0.13;
      g.add(soya(orim));
      // O‘rim uchidagi lenta
      const lenta = new THREE.Mesh(
        new THREE.TorusGeometry(rBosh * 0.17, rBosh * 0.06, 6, 12), mat(R.terrakota, 0.9));
      lenta.position.set(x * rBosh * 0.94, boshY - rBosh * 2.9, -rBosh * 0.45);
      lenta.rotation.y = Math.PI / 2;
      g.add(lenta);
    }
  } else if (c.soch) {
    const sochM = mat(c.soch === 'oq' ? R.oqSoch : R.qoraSoch, 0.8);
    const tepa = new THREE.Mesh(
      new THREE.SphereGeometry(rBosh * 1.03, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), sochM);
    tepa.position.y = boshY;
    g.add(soya(tepa));
  }

  /* ---------- Soqol va mo‘ylov ---------- */
  if (c.soqol) {
    const sM = mat(c.soqol === 'oq' ? R.oqSoch : R.qoraSoch, 0.85);
    const uzun = c.soqol === 'oq' ? 1.5 : 0.85;

    const soqol = new THREE.Mesh(
      new THREE.ConeGeometry(rBosh * 0.78, rBosh * uzun, 12), sM);
    soqol.position.set(0, boshY - rBosh * (0.50 + uzun * 0.42), rBosh * 0.30);
    soqol.rotation.x = Math.PI + 0.14;
    soqol.scale.z = 0.68;
    g.add(soya(soqol));

    // Yonoq soqoli
    for (const x of [-1, 1]) {
      const yon = new THREE.Mesh(new THREE.SphereGeometry(rBosh * 0.30, 8, 6), sM);
      yon.scale.set(0.42, 1.25, 0.75);
      yon.position.set(x * rBosh * 0.74, boshY - rBosh * 0.36, rBosh * 0.36);
      g.add(yon);
    }
    // Mo‘ylov
    const moylov = new THREE.Mesh(new THREE.SphereGeometry(rBosh * 0.26, 10, 6), sM);
    moylov.scale.set(1.35, 0.38, 0.55);
    moylov.position.set(0, boshY - rBosh * 0.18, rBosh * 0.82);
    g.add(moylov);
  }

  /* ---------- Bosh kiyim ---------- */
  if (c.bosh === 'doppi') {
    const d = doppiQismi(rBosh);
    d.position.y = boshY + rBosh * 0.62;
    g.add(d);
  } else if (c.bosh === 'romol') {
    const ro = romolQismi(rBosh, c.romolRang || R.krem);
    ro.position.y = boshY + rBosh * 0.02;
    g.add(ro);
  }

  /* ---------- Hassa (bobo uchun) ---------- */
  if (c.hassa) {
    const tayoq = new THREE.Mesh(
      new THREE.CylinderGeometry(0.019 * s, 0.024 * s, 0.86 * s, 8), mat(R.yogochTuq, 0.9));
    tayoq.position.set(0.34 * s, 0.43 * s, 0.05 * s);
    tayoq.rotation.z = -0.05;
    g.add(soya(tayoq, true));
    const boshi = new THREE.Mesh(new THREE.SphereGeometry(0.036 * s, 10, 8), mat(R.yogoch, 0.75));
    boshi.position.set(0.35 * s, 0.87 * s, 0.05 * s);
    g.add(soya(boshi));
  }

  /* ---------- Qo‘lidagi buyum ---------- */
  if (c.kitob) {
    const k = new THREE.Mesh(new THREE.BoxGeometry(0.20 * s, 0.05 * s, 0.26 * s),
      mat(R.terrakota, 0.6));
    k.position.set(-0.24 * s, 0.66 * s, 0.14 * s);
    k.rotation.set(0.35, 0.2, 0.1);
    g.add(soya(k));
    const varaq = new THREE.Mesh(new THREE.BoxGeometry(0.185 * s, 0.035 * s, 0.245 * s),
      mat(R.krem, 0.9));
    varaq.position.set(-0.24 * s, 0.665 * s, 0.145 * s);
    varaq.rotation.set(0.35, 0.2, 0.1);
    g.add(varaq);
  }
  return g;
}

/* =========================================================
   2. OILA A’ZOLARI
   ========================================================= */

/* BOBO — oq soqolli, chopon-belbog‘li, hassa tayangan keksa */
export function boboYasa() {
  return odamYasa({
    boy: 1.40, kiyim: 'chopon', kiyimRang: 0x3E6B57, jiyak: R.oltin,
    belbog: 0xB8873F, shim: 0x4A4238,
    bosh: 'doppi', soch: 'oq', soqol: 'oq', hassa: true
  });
}

/* BUVI — oq sochli, oq ro‘molli, nimchali buvi */
export function buviYasa() {
  return odamYasa({
    boy: 1.30, kiyim: 'koylak', kiyimRang: 0x6B7F94, jiyak: R.oltin,
    nimcha: 0x4A5B72, bosh: 'romol', romolRang: 0xF4F0E6, soch: 'oq'
  });
}

/* OTA — qora soqolli, ko‘k chopon kiygan xonadon boshlig‘i */
export function otaYasa() {
  return odamYasa({
    boy: 1.42, kiyim: 'chopon', kiyimRang: R.indigo, jiyak: R.oltin,
    belbog: R.terrakota, shim: 0x24303F,
    bosh: 'doppi', soch: 'qora', soqol: 'qora'
  });
}

/* ONA — xon-atlas ko‘ylakli, ro‘molli ona */
export function onaYasa() {
  return odamYasa({
    boy: 1.34, kiyim: 'koylak', atlas: true, jiyak: R.oltin,
    bosh: 'romol', romolRang: 0xC1502E, soch: 'qora'
  });
}

/* O‘G‘IL (aka) — do‘ppili, qo‘lida kitobli o‘smir */
export function ogilYasa() {
  return odamYasa({
    boy: 1.06, kiyim: 'chopon', kiyimRang: 0x2C5FA8, jiyak: R.krem,
    belbog: R.oltin, shim: 0x2B3A4A,
    bosh: 'doppi', soch: 'qora', kitob: true
  });
}

/* QIZ (opa) — ikki o‘rim sochli, atlas ko‘ylakli qiz */
export function qizYasa() {
  return odamYasa({
    boy: 1.00, kiyim: 'koylak', atlas: true, jiyak: R.krem, soch: 'orim'
  });
}

/* CHAQALOQ — beshikda o‘ralgan go‘dak (alla aytiladigan) */
export function chaqaloqYasa() {
  const g = new THREE.Group();

  // Beshik — maishiy kutubxonadan
  const beshik = beshikYasa();
  g.add(beshik);

  // Beshikdagi ko‘rpachani ochib, go‘dakning yuzi ko‘rinadi
  const yuz = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 12), mat(R.teri, 0.7));
  yuz.scale.set(0.95, 1.05, 0.95);
  yuz.position.set(-0.30, 0.50, 0.02);
  g.add(soya(yuz));

  // Ko‘zlari yumuq — uxlayapti
  for (const z of [-0.035, 0.035]) {
    const koz = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.006, 6, 10, Math.PI), mat(0x2B2118, 0.5));
    koz.position.set(-0.375, 0.515, z);
    koz.rotation.set(0, Math.PI / 2, Math.PI);
    g.add(koz);
  }

  // Boshidagi kichik qalpoqcha
  const qalpoq = new THREE.Mesh(
    new THREE.SphereGeometry(0.088, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), mat(0xE8CFA0, 0.85));
  qalpoq.position.set(-0.30, 0.505, 0.02);
  g.add(soya(qalpoq));

  // O‘ragan yo‘rgak
  const yorgak = new THREE.Mesh(new THREE.CapsuleGeometry(0.10, 0.30, 6, 12), mat(0xFBF7F0, 0.95));
  yorgak.rotation.z = Math.PI / 2;
  yorgak.position.set(0.02, 0.46, 0.02);
  g.add(soya(yorgak));

  // Yo‘rgak ustidagi bog‘ich
  for (const x of [-0.08, 0.10]) {
    const b = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.014, 6, 14), mat(R.terrakota, 0.9));
    b.rotation.y = Math.PI / 2;
    b.position.set(x, 0.46, 0.02);
    g.add(b);
  }
  return g;
}

/* =========================================================
   3. HOVLI BUYUMLARI
   ========================================================= */

/* SUPA — hovli o‘rtasidagi ko‘tarma so‘ri (ustiga dasturxon yoziladi) */
export function supaYasa() {
  const g = new THREE.Group();
  const yog = mat(R.yogoch, 0.85);
  const gisht = mat(R.gisht, 0.95);

  const poydevor = new THREE.Mesh(new THREE.BoxGeometry(1.30, 0.22, 1.00), gisht);
  poydevor.position.y = 0.11;
  g.add(soya(poydevor, true));

  // G‘isht qatorlari
  for (let i = 0; i < 6; i++) {
    const q = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.06, 1.005), mat(0x94603F, 0.95));
    q.position.set(-0.53 + i * 0.212, 0.06 + (i % 2) * 0.09, 0);
    g.add(q);
  }

  const taxta = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.07, 1.08), yog);
  taxta.position.y = 0.255;
  g.add(soya(taxta, true));

  // Taxta oralig‘i
  for (let i = 0; i < 5; i++) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.005, 0.012), mat(R.yogochTuq, 0.9));
    c.position.set(0, 0.292, -0.44 + i * 0.22);
    g.add(c);
  }

  // Chekkasidagi ko‘rpacha
  const korpa = new THREE.Mesh(new THREE.BoxGeometry(1.30, 0.06, 0.30), mat(R.terrakota, 0.95));
  korpa.position.set(0, 0.32, -0.34);
  g.add(soya(korpa));
  return g;
}

/* TANDIR — non yopiladigan loy tandir */
export function tandirYasa() {
  const g = new THREE.Group();

  const profil = [
    new THREE.Vector2(0.001, 0.00),
    new THREE.Vector2(0.46, 0.00),
    new THREE.Vector2(0.48, 0.14),
    new THREE.Vector2(0.44, 0.46),
    new THREE.Vector2(0.34, 0.78),
    new THREE.Vector2(0.26, 0.94),
    new THREE.Vector2(0.245, 0.98),
    new THREE.Vector2(0.30, 0.92),
    new THREE.Vector2(0.40, 0.60),
  ];
  const tandir = new THREE.Mesh(new THREE.LatheGeometry(profil, 24), mat(0xB07C55, 0.98));
  g.add(soya(tandir, true));

  // Og‘iz halqasi
  const ogiz = new THREE.Mesh(new THREE.TorusGeometry(0.255, 0.03, 8, 22), mat(0x8A5A34, 0.95));
  ogiz.rotation.x = -Math.PI / 2;
  ogiz.position.y = 0.98;
  g.add(soya(ogiz));

  // Ichidagi cho‘g‘
  const chog = new THREE.Mesh(new THREE.CircleGeometry(0.235, 18),
    new THREE.MeshStandardMaterial({ color: 0xC1502E, emissive: 0x7A2F18, roughness: 0.8 }));
  chog.rotation.x = -Math.PI / 2;
  chog.position.y = 0.88;
  g.add(chog);

  // Yon devoriga yopishtirilgan nonlar
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    const non = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.035, 14),
      mat(0xD9A860, 0.9));
    non.position.set(Math.cos(a) * 0.40, 0.40, Math.sin(a) * 0.40);
    non.rotation.z = Math.PI / 2;
    non.rotation.y = -a;
    g.add(soya(non));
  }

  // Poydevor g‘ishtlari
  const poy = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.55, 0.10, 20), mat(R.gisht, 0.98));
  poy.position.y = 0.05;
  g.add(soya(poy, true));
  return g;
}

/* =========================================================
   4. SAHNA QURUVCHILARI
   (o‘lcham shartnomasidan tashqarida — butun sahna uchun)
   ========================================================= */

/* SHOX UYASI — shajara shoxidagi bo‘sh o‘rin.
   Yumaloq yog‘och taglik, oltin halqa va o‘yma panjara.       */
export function uyaYasa() {
  const g = new THREE.Group();

  const taglik = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.36, 0.09, 20),
    mat(R.yogoch, 0.85));
  taglik.position.y = 0.045;
  g.add(soya(taglik, true));

  const halqa = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.032, 8, 26),
    mat(R.oltin, 0.42, 0.45));
  halqa.rotation.x = -Math.PI / 2;
  halqa.position.y = 0.095;
  g.add(halqa);
  g.userData.halqa = halqa;

  // Orqa panjara — o‘yma naqsh
  for (let i = 0; i < 5; i++) {
    const a = Math.PI * (0.18 + i * 0.16);
    const ust = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.16, 6),
      mat(R.yogochTuq, 0.85));
    ust.position.set(Math.cos(a) * 0.39, 0.17, -Math.abs(Math.sin(a)) * 0.39);
    g.add(ust);
  }
  return g;
}

/* SHAJARA DARAXTI — berilgan uya nuqtalariga shox yuboradi.
   `joylar` — [{x, y}, …] ko‘rinishidagi ro‘yxat.               */
export function shajaraYasa(joylar) {
  const g = new THREE.Group();
  const yogM = mat(0x6B4526, 0.92);
  const bargM = mat(R.barg, 0.86);
  const bargM2 = mat(R.bargOch, 0.86);

  /* Tana — pastdan yuqoriga ingichkalashuvchi egri ustun */
  const tanaYol = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.06, 0.9, 0.04),
    new THREE.Vector3(-0.04, 2.0, 0),
    new THREE.Vector3(0.02, 3.2, 0.02),
    new THREE.Vector3(0, 5.00, 0),
  ]);
  const tana = new THREE.Mesh(new THREE.TubeGeometry(tanaYol, 20, 0.28, 12, false), yogM);
  g.add(soya(tana, true));

  // Tana ostidagi ildiz do‘ngliklari
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const ildiz = new THREE.Mesh(new THREE.SphereGeometry(0.20, 8, 6), yogM);
    ildiz.scale.set(1, 0.45, 1.9);
    ildiz.position.set(Math.cos(a) * 0.34, 0.06, Math.sin(a) * 0.34);
    ildiz.rotation.y = -a;
    g.add(soya(ildiz, true));
  }

  // Po‘stloq chiziqlari
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 3.0, 5),
      mat(0x53341B, 0.95));
    p.position.set(Math.cos(a) * 0.27, 1.65, Math.sin(a) * 0.27);
    p.rotation.z = Math.sin(a) * 0.05;
    g.add(p);
  }

  /* Shoxlar — har bir uya nuqtasiga */
  (joylar || []).forEach(function (j) {
    const tomon = j.x < 0 ? -1 : 1;
    const yol = new THREE.CatmullRomCurve3([
      new THREE.Vector3(tomon * 0.13, Math.max(0.65, j.y - 1.15), 0),
      new THREE.Vector3(tomon * (Math.abs(j.x) * 0.42), j.y - 0.85, 0.05),
      new THREE.Vector3(tomon * (Math.abs(j.x) * 0.82), j.y - 0.24, 0.02),
      new THREE.Vector3(j.x, j.y - 0.04, 0),
    ]);
    const shox = new THREE.Mesh(new THREE.TubeGeometry(yol, 16, 0.10, 8, false), yogM);
    g.add(soya(shox, true));
  });

  /* Barg to‘plamlari — shoxlar orasida va tepada */
  const bargJoy = [
    [0.00, 5.60, -0.60, 1.28],
    [-2.60, 5.20, -1.15, 1.02], [2.60, 5.25, -1.15, 1.02],
    [-4.20, 4.35, -1.40, 0.92], [4.20, 4.40, -1.40, 0.92],
    [-5.30, 3.15, -1.60, 0.84], [5.30, 3.20, -1.60, 0.84],
    [0.00, 4.90, -2.35, 0.92],
    [-2.00, 3.05, -2.40, 0.74], [2.00, 3.10, -2.40, 0.74],
    [-3.60, 2.20, -2.45, 0.68], [3.60, 2.25, -2.45, 0.68],
  ];



  bargJoy.forEach(function (b, i) {
    const shar = new THREE.Mesh(new THREE.SphereGeometry(b[3], 12, 9), i % 2 ? bargM : bargM2);
    shar.scale.set(1.25, 0.82, 1.0);
    shar.position.set(b[0], b[1], b[2]);
    g.add(soya(shar));
  });
  return g;
}

/* =========================================================
   5. REYESTR
   ========================================================= */
export const OILA = {
  bobo:     { nom: 'Bobo',    modul: 3, yasa: boboYasa,
              izoh: 'Oq soqolli bobo — oilaning eng keksa avlodi, ertak va o‘git egasi.' },
  buvi:     { nom: 'Buvi',    modul: 3, yasa: buviYasa,
              izoh: 'Buvi — nevaralarga alla, ertak va urf-odat o‘rgatuvchi murabbiy.' },
  ota:      { nom: 'Ota',     modul: 3, yasa: otaYasa,
              izoh: '«Otaning gapi ikki qilinmagan» — ota oilaning tayanchi va ibrat manbai.' },
  ona:      { nom: 'Ona',     modul: 3, yasa: onaYasa,
              izoh: 'Xon-atlas ko‘ylakli ona — bolaning birinchi ustozi va sirdoshi.' },
  ogil:     { nom: 'O‘g‘il',  modul: 3, yasa: ogilYasa,
              izoh: 'O‘g‘il bolaga otaning ustozligi va mehnat namunasi asosiy o‘rin tutgan.' },
  qiz:      { nom: 'Qiz',     modul: 3, yasa: qizYasa,
              izoh: 'Qiz bolaga onaning rahnamoligi — uy-ro‘zg‘or va odob sabog‘i.' },
  chaqaloq: { nom: 'Chaqaloq', modul: 3, yasa: chaqaloqYasa,
              izoh: 'Beshikdagi go‘dak — tarbiya alla bilan, beshikdan boshlanadi.' },
  supa:     { nom: 'Supa',    modul: 3, yasa: supaYasa,
              izoh: 'Hovli supasi — oila davra qurib dasturxon yozadigan joy.' },
  tandir:   { nom: 'Tandir',  modul: 3, yasa: tandirYasa,
              izoh: 'Tandir — non yopiladigan o‘choq, oila rizqining ramzi.' },
};
