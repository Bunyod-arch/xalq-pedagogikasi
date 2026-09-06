/* =========================================================================
   MILLIY TEATR VA QO‘SHIQCHILIK — 3D MODELLAR
   «Xalq pedagogikasi» darsligining 12-moduli uchun.

   12-modulda nomlangan, ammo `model-cholgu.js` da bo‘lmagan detallar shu
   yerda modellashtiriladi:
     · g‘ijjak (kamoncha bilan)   · xonanda — qo‘shiq aytuvchi
     · qo‘g‘irchoq                 · qo‘g‘irchoq teatri (chodir-parda)
     · masxaraboz                  · qiziqchi
     · karnay, surnay              · beshik allasi uchun nog‘ora

   Tashqi model fayllari (.glb/.obj) ISHLATILMAGAN — hammasi Three.js
   geometriyalaridan quriladi.

   SHARTNOMA (model-cholgu.js va model-maishiy.js bilan bir xil):
     · har bir `xYasa()` THREE.Group qaytaradi,
     · eng katta o‘lchami 1.0–1.5 birlik,
     · pastki nuqtasi y = 0,
     · X va Z bo‘yicha markazlashgan,
     · fayl oxirida `{ nom, yasa, izoh }` reyestri eksport qilinadi.
   ========================================================================= */

import * as THREE from '../vendor/three.module.min.js';

/* ------------------------------ Ranglar ---------------------------------- */
const R = {
  yogochTuq:   0x6E5334,
  yogochAsos:  0x8A6A44,
  yogochOrta:  0xB08E64,
  yogochOchiq: 0xC8A97E,
  charm:       0xEADFC8,
  charmTuq:    0xD8C49E,
  teri:        0xE0B48C,   // yuz-qo‘l terisi
  soqol:       0x4A3A30,
  koya:        0x2A2118,
  tor:         0xF3E6CE,
  metallSariq: 0xC9B37E,
  metallOq:    0xA9B0B8,
  kok:         0x1B3B6F,
  kokOchiq:    0x2E5A9C,
  terrakota:   0xC1502E,
  qizil:       0xA8332A,
  yashil:      0x2F6B45,
  siyoh:       0x2B2436,
  oq:          0xFBF7F0,
  sariq:       0xD4A24C,
  binafsha:    0x46357A
};

function mat(rang, gadir, metall, qosh) {
  return new THREE.MeshStandardMaterial(
    Object.assign({ color: rang, roughness: gadir === undefined ? 0.7 : gadir,
                    metalness: metall || 0 }, qosh || {})
  );
}

/* -------- Soya: guruhdagi barcha meshlarga soya tashlashni yoqadi -------- */
function soyaBer(guruh) {
  guruh.traverse(function (o) {
    if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
  });
  return guruh;
}

/* -------- Miqyoslash: ichki guruhni shartnomaga moslab qaytaradi --------- */
function moslash(ichki, olcham) {
  soyaBer(ichki);
  const tashqi = new THREE.Group();
  tashqi.add(ichki);

  const quti = new THREE.Box3().setFromObject(ichki);
  const o = quti.getSize(new THREE.Vector3());
  const eng = Math.max(o.x, o.y, o.z) || 1;
  const k = (olcham || 1.3) / eng;
  ichki.scale.setScalar(k);

  const q2 = new THREE.Box3().setFromObject(ichki);
  const markaz = q2.getCenter(new THREE.Vector3());
  ichki.position.x -= markaz.x;
  ichki.position.z -= markaz.z;
  ichki.position.y -= q2.min.y;
  return tashqi;
}

/* =========================================================================
   UMUMIY ODAM FIGURASI
   Xonanda, masxaraboz va qiziqchi — bir xil tanadan, turli kiyim va
   bosh kiyimi bilan yasaladi. Bo‘yi taxminan 1.45 birlik.
   cfg = { chopon, jiyak, ishton, bosh, soqol, qol: 'quloqda'|'yon'|'ochiq' }
   ========================================================================= */
function tanaYasa(cfg) {
  const g = new THREE.Group();

  const mChopon = mat(cfg.chopon, 0.88);
  const mJiyak  = mat(cfg.jiyak, 0.82);
  const mIshton = mat(cfg.ishton, 0.9);
  const mTeri   = mat(R.teri, 0.75);
  const mEtik   = mat(R.yogochTuq, 0.8);

  /* ---- Etiklar va ishton ---- */
  for (const x of [-0.085, 0.085]) {
    const oyoq = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.048, 0.40, 12), mIshton);
    oyoq.position.set(x, 0.26, 0);
    g.add(oyoq);

    const etik = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.066, 0.12, 12), mEtik);
    etik.position.set(x, 0.06, 0);
    g.add(etik);

    const uch = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.055, 0.17), mEtik);
    uch.position.set(x, 0.028, 0.06);
    g.add(uch);
  }

  /* ---- Chopon (uzun to‘n) — pastga kengaygan ---- */
  const profil = [];
  // (radius, y) — belidan pastga kengayadi
  const nuqtalar = [
    [0.00, 0.40], [0.24, 0.40], [0.235, 0.52], [0.215, 0.66],
    [0.195, 0.78], [0.185, 0.90], [0.183, 1.00], [0.175, 1.06], [0.00, 1.08]
  ];
  for (const n of nuqtalar) profil.push(new THREE.Vector2(n[0], n[1]));
  const chopon = new THREE.Mesh(
    new THREE.LatheGeometry(profil, 24),
    mChopon
  );
  g.add(chopon);

  // Chopon oldidagi ochiq yoqa — ikki tomonlama jiyak
  for (const yon of [-1, 1]) {
    const yoqa = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.62, 0.03), mJiyak);
    yoqa.position.set(yon * 0.055, 0.72, 0.185);
    yoqa.rotation.z = yon * 0.06;
    g.add(yoqa);
  }
  // Etak jiyagi
  const etak = new THREE.Mesh(new THREE.TorusGeometry(0.238, 0.016, 8, 28), mJiyak);
  etak.rotation.x = Math.PI / 2;
  etak.position.y = 0.405;
  g.add(etak);

  // Belbog‘ — o‘ralgan ro‘mol
  const belbog = new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.038, 10, 26), mJiyak);
  belbog.rotation.x = Math.PI / 2;
  belbog.scale.z = 0.8;
  belbog.position.y = 0.70;
  g.add(belbog);
  const tugun = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), mJiyak);
  tugun.scale.set(1, 0.8, 0.8);
  tugun.position.set(0.0, 0.69, 0.20);
  g.add(tugun);

  /* ---- Yelka ---- */
  const yelka = new THREE.Mesh(new THREE.SphereGeometry(0.185, 18, 12), mChopon);
  yelka.scale.set(1, 0.52, 0.78);
  yelka.position.y = 1.03;
  g.add(yelka);

  /* ---- Qo‘llar ---- */
  const qolTuri = cfg.qol || 'yon';
  const chapQol = new THREE.Group();
  const ongQol  = new THREE.Group();

  function qolQur(guruh, yon) {
    const yuqori = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.042, 0.32, 10), mChopon);
    yuqori.position.y = -0.16;
    guruh.add(yuqori);

    const tirsak = new THREE.Group();
    tirsak.position.y = -0.32;
    const past = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.036, 0.30, 10), mChopon);
    past.position.y = -0.15;
    tirsak.add(past);

    const kaft = new THREE.Mesh(new THREE.SphereGeometry(0.052, 10, 8), mTeri);
    kaft.scale.set(1, 1.15, 0.72);
    kaft.position.y = -0.325;
    tirsak.add(kaft);

    guruh.add(tirsak);
    guruh.userData.tirsak = tirsak;
    guruh.userData.kaft = kaft;
    guruh.position.set(yon * 0.185, 1.05, 0);
    return guruh;
  }
  qolQur(chapQol, -1);
  qolQur(ongQol, 1);

  if (qolTuri === 'quloqda') {
    // Klassik ashula pozasi: o‘ng qo‘l quloq yonida
    ongQol.rotation.z = -1.55;
    ongQol.userData.tirsak.rotation.z = -1.75;
    chapQol.rotation.z = 0.28;
    chapQol.rotation.x = -0.35;
  } else if (qolTuri === 'ochiq') {
    chapQol.rotation.z = 0.85;
    ongQol.rotation.z = -0.85;
    chapQol.userData.tirsak.rotation.z = 0.5;
    ongQol.userData.tirsak.rotation.z = -0.5;
  } else {
    chapQol.rotation.z = 0.18;
    ongQol.rotation.z = -0.18;
  }
  g.add(chapQol); g.add(ongQol);
  g.userData.chapQol = chapQol;
  g.userData.ongQol = ongQol;

  /* ---- Bo‘yin va bosh ---- */
  const boyin = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.06, 0.09, 12), mTeri);
  boyin.position.y = 1.12;
  g.add(boyin);

  const bosh = new THREE.Group();
  bosh.position.y = 1.17;

  const kalla = new THREE.Mesh(new THREE.SphereGeometry(0.115, 20, 16), mTeri);
  kalla.scale.set(0.92, 1.08, 0.95);
  kalla.position.y = 0.105;
  bosh.add(kalla);

  // Ko‘zlar
  for (const x of [-0.042, 0.042]) {
    const oq = new THREE.Mesh(new THREE.SphereGeometry(0.021, 10, 8), mat(R.oq, 0.4));
    oq.scale.set(1, 0.78, 0.5);
    oq.position.set(x, 0.118, 0.095);
    bosh.add(oq);
    const qora = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 8), mat(R.koya, 0.4));
    qora.position.set(x, 0.116, 0.107);
    bosh.add(qora);
    // Qosh
    const qosh = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.009, 0.012), mat(R.soqol, 0.85));
    qosh.position.set(x, 0.148, 0.098);
    qosh.rotation.z = x > 0 ? -0.12 : 0.12;
    bosh.add(qosh);
  }
  // Burun
  const burun = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.055, 8), mTeri);
  burun.rotation.x = Math.PI / 2;
  burun.position.set(0, 0.098, 0.112);
  bosh.add(burun);
  // Og‘iz — qo‘shiq aytayotgan bo‘lsa ochiq
  if (cfg.ogizOchiq) {
    const ogiz = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 10), mat(0x6B2A24, 0.8));
    ogiz.scale.set(0.85, 1.1, 0.55);
    ogiz.position.set(0, 0.052, 0.095);
    bosh.add(ogiz);
  } else {
    const ogiz = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.008, 0.012), mat(0x8A4038, 0.85));
    ogiz.position.set(0, 0.055, 0.104);
    bosh.add(ogiz);
  }

  // Soqol
  if (cfg.soqol) {
    const soq = new THREE.Mesh(new THREE.SphereGeometry(0.095, 14, 12), mat(cfg.soqolRang || R.soqol, 0.95));
    soq.scale.set(0.85, 1.05, 0.62);
    soq.position.set(0, 0.015, 0.038);
    bosh.add(soq);
    const mo = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), mat(cfg.soqolRang || R.soqol, 0.95));
    mo.scale.set(1.5, 0.5, 0.6);
    mo.position.set(0, 0.075, 0.095);
    bosh.add(mo);
  }

  /* ---- Bosh kiyim ---- */
  const bk = cfg.bosh || 'doppi';
  if (bk === 'doppi') {
    const mQora = mat(R.siyoh, 0.62);
    const gumbaz = new THREE.Mesh(
      new THREE.SphereGeometry(0.118, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), mQora);
    gumbaz.scale.y = 0.62;
    gumbaz.position.y = 0.185;
    bosh.add(gumbaz);
    const chekka = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.128, 0.05, 20), mat(0x101024, 0.7));
    chekka.position.y = 0.19;
    bosh.add(chekka);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const bodom = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 6), mat(R.oq, 0.5));
      bodom.scale.set(0.6, 1.7, 0.6);
      bodom.position.set(Math.cos(a) * 0.127, 0.19, Math.sin(a) * 0.127);
      bosh.add(bodom);
    }
  } else if (bk === 'salla') {
    const mSalla = mat(cfg.sallaRang || R.oq, 0.9);
    for (let i = 0; i < 5; i++) {
      const halqa = new THREE.Mesh(new THREE.TorusGeometry(0.115 - i * 0.008, 0.032, 10, 24), mSalla);
      halqa.rotation.x = Math.PI / 2;
      halqa.rotation.z = i * 0.35;
      halqa.position.y = 0.175 + i * 0.045;
      bosh.add(halqa);
    }
    const uch = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 10), mSalla);
    uch.scale.y = 0.6;
    uch.position.y = 0.375;
    bosh.add(uch);
  } else if (bk === 'qalpoq') {
    // Masxarabozning uchli, rangli qalpog‘i — qo‘ng‘iroqchali
    const mQ = mat(cfg.qalpoqRang || R.terrakota, 0.85);
    const kon = new THREE.Mesh(new THREE.ConeGeometry(0.135, 0.40, 16), mQ);
    kon.position.y = 0.36;
    bosh.add(kon);
    // Rangli chiziqlar
    for (let i = 0; i < 3; i++) {
      const h = new THREE.Mesh(new THREE.TorusGeometry(0.115 - i * 0.033, 0.012, 8, 20),
        mat(i % 2 ? R.sariq : R.yashil, 0.8));
      h.rotation.x = Math.PI / 2;
      h.position.y = 0.235 + i * 0.10;
      bosh.add(h);
    }
    const jiyak2 = new THREE.Mesh(new THREE.TorusGeometry(0.132, 0.026, 10, 24), mat(R.sariq, 0.6, 0.3));
    jiyak2.rotation.x = Math.PI / 2;
    jiyak2.position.y = 0.185;
    bosh.add(jiyak2);
    // Uchidagi qo‘ng‘iroqcha
    const qong = new THREE.Mesh(new THREE.SphereGeometry(0.038, 12, 10), mat(R.metallSariq, 0.35, 0.8));
    qong.position.y = 0.585;
    bosh.add(qong);
    const til = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), mat(R.metallOq, 0.4, 0.7));
    til.position.y = 0.55;
    bosh.add(til);
  }

  g.add(bosh);
  g.userData.bosh = bosh;
  return g;
}

/* =========================================================================
   1) G‘IJJAK — kamon bilan chalinadigan torli cholg‘u
   Qismlari: yumaloq kosa (qovoq yoki yog‘och), old tomondagi charm parda,
   uzun yog‘och dasta, boshdagi 3 quloq, xarrak, 3 tor,
   pastdagi temir tayanch oyoq (tizzaga tiraladi) va alohida kamoncha.
   ========================================================================= */
export function gijjakYasa() {
  const ichki = new THREE.Group();
  const mYogoch = mat(R.yogochAsos, 0.62);
  const mTuq    = mat(R.yogochTuq, 0.68);
  const mOrta   = mat(R.yogochOrta, 0.58);
  const mCharm  = mat(R.charm, 0.86);
  const mTor    = mat(R.tor, 0.35, 0.55);
  const mMetall = mat(R.metallOq, 0.35, 0.8);

  /* --- Kosa: yarim shar (orqasi yopiq, oldi charm bilan tortilgan) --- */
  const kosa = new THREE.Mesh(
    new THREE.SphereGeometry(0.30, 26, 20, 0, Math.PI * 2, 0, Math.PI * 0.62),
    mYogoch
  );
  kosa.rotation.x = -Math.PI / 2;   // ochiq tomoni oldga
  kosa.position.set(0, 0.42, -0.03);
  ichki.add(kosa);

  // Kosaning qovurg‘a choklari
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const chok = new THREE.Mesh(new THREE.TorusGeometry(0.30, 0.006, 6, 22, Math.PI * 0.62), mTuq);
    chok.position.set(0, 0.42, -0.03);
    chok.rotation.set(-Math.PI / 2, 0, 0);
    chok.rotateY(a);
    chok.rotateX(Math.PI / 2);
    ichki.add(chok);
  }

  // Old tomondagi charm parda
  const parda = new THREE.Mesh(new THREE.CircleGeometry(0.288, 30), mCharm);
  parda.position.set(0, 0.42, 0.145);
  ichki.add(parda);
  const pardaJiyak = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.016, 10, 30), mTuq);
  pardaJiyak.position.set(0, 0.42, 0.145);
  ichki.add(pardaJiyak);

  /* --- Dasta --- */
  const dasta = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.035, 0.72, 14), mOrta);
  dasta.position.set(0, 1.02, 0.02);
  ichki.add(dasta);

  // Dastaning kosaga kirish joyidagi bo‘g‘im
  const bogim = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 14), mTuq);
  bogim.position.set(0, 0.68, 0.02);
  ichki.add(bogim);

  /* --- Bosh va quloqlar --- */
  const boshQism = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.24, 0.075), mTuq);
  boshQism.position.set(0, 1.44, 0.02);
  ichki.add(boshQism);
  const boshUchi = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), mTuq);
  boshUchi.position.set(0, 1.57, 0.02);
  ichki.add(boshUchi);

  const quloqOrni = [[-1, 1.50], [1, 1.44], [-1, 1.38]];
  for (const q of quloqOrni) {
    const oq = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.014, 0.13, 8), mTuq);
    oq.rotation.z = Math.PI / 2;
    oq.position.set(q[0] * 0.06, q[1], 0.02);
    ichki.add(oq);
    const tugma = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), mYogoch);
    tugma.scale.set(0.7, 1, 1);
    tugma.position.set(q[0] * 0.125, q[1], 0.02);
    ichki.add(tugma);
  }

  /* --- Xarrak va torlar --- */
  const xarrak = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.05, 0.012), mTuq);
  xarrak.position.set(0, 0.36, 0.152);
  ichki.add(xarrak);

  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 0.022;
    const tor = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 1.06, 6), mTor);
    tor.position.set(x, 0.905, 0.075);
    tor.rotation.x = -0.045;
    ichki.add(tor);
  }

  /* --- Temir tayanch oyoq --- */
  const oyoq = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.012, 0.30, 10), mMetall);
  oyoq.position.set(0, 0.15, -0.03);
  ichki.add(oyoq);
  const taban = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.062, 0.03, 14), mTuq);
  taban.position.set(0, 0.015, -0.03);
  ichki.add(taban);

  /* --- Kamoncha (yonida turadi) --- */
  const kamon = new THREE.Group();
  const tayoq = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.011, 8, 26, 0.62), mTuq);
  kamon.add(tayoq);
  const qil = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.022, 0.68), mat(R.oq, 0.9));
  qil.position.set(0.985, 0.335, 0);
  qil.rotation.x = Math.PI / 2;
  qil.rotation.z = 0.31;
  // qil torusning ikki uchini tutashtiradi — to‘g‘ri chiziq
  kamon.add(qil);
  const tutqich = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, 0.10, 10), mYogoch);
  tutqich.position.set(1.147, 0.02, 0);
  kamon.add(tutqich);

  kamon.scale.setScalar(0.62);
  kamon.rotation.z = -0.32;
  kamon.position.set(0.34, 0.30, -0.05);
  ichki.add(kamon);

  return moslash(ichki, 1.45);
}

/* =========================================================================
   2) XONANDA — qo‘shiq aytuvchi (alla, yor-yor, lapar)
   Qo‘li quloqda — o‘zbek ashulachiligining klassik pozasi.
   ========================================================================= */
export function xonandaYasa() {
  const ichki = tanaYasa({
    chopon: R.kok, jiyak: R.sariq, ishton: R.oq,
    bosh: 'doppi', soqol: false, ogizOchiq: true, qol: 'quloqda'
  });

  // Chopon ustidagi milliy chiziqlar (o‘zbek beqasam matosi)
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const chiziq = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.60, 0.012),
      mat(i % 2 ? R.kokOchiq : R.sariq, 0.85));
    chiziq.position.set(Math.cos(a) * 0.207, 0.72, Math.sin(a) * 0.207);
    chiziq.rotation.y = -a;
    ichki.add(chiziq);
  }
  return moslash(ichki, 1.45);
}

/* =========================================================================
   3) MASXARABOZ — xalq tomoshalarining kulgi ustasi
   Rang-barang chopon, uchli qalpoq (qo‘ng‘iroqli), qo‘lida hassa-tayoq.
   ========================================================================= */
export function masxarabozYasa() {
  const ichki = tanaYasa({
    chopon: R.qizil, jiyak: R.sariq, ishton: R.yashil,
    bosh: 'qalpoq', qalpoqRang: R.terrakota, soqol: false, qol: 'ochiq'
  });

  // Yamoq-yamoq rangli chopon — masxarabozning belgisi
  const yamoqRang = [R.sariq, R.yashil, R.kokOchiq, R.binafsha];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const y = 0.50 + (i % 4) * 0.14;
    const yamoq = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.014),
      mat(yamoqRang[i % 4], 0.9));
    yamoq.position.set(Math.cos(a) * 0.212, y, Math.sin(a) * 0.212);
    yamoq.rotation.y = -a;
    yamoq.rotation.z = (i % 2 ? 0.3 : -0.3);
    ichki.add(yamoq);
  }

  // Belida osilgan qo‘ng‘iroqchalar
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const ip = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.08, 6), mat(R.yogochTuq, 0.9));
    ip.position.set(Math.cos(a) * 0.21, 0.65, Math.sin(a) * 0.21);
    ichki.add(ip);
    const q = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), mat(R.metallSariq, 0.35, 0.8));
    q.position.set(Math.cos(a) * 0.21, 0.60, Math.sin(a) * 0.21);
    ichki.add(q);
  }

  // Qo‘lidagi hassa — uchida ip-popuk
  const hassa = new THREE.Group();
  const tayoq = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.021, 0.95, 10), mat(R.yogochTuq, 0.8));
  hassa.add(tayoq);
  const bosh = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), mat(R.sariq, 0.5, 0.35));
  bosh.position.y = 0.50;
  hassa.add(bosh);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const popuk = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.003, 0.14, 6), mat(R.terrakota, 0.9));
    popuk.position.set(Math.cos(a) * 0.025, 0.42, Math.sin(a) * 0.025);
    popuk.rotation.z = Math.cos(a) * 0.25;
    popuk.rotation.x = -Math.sin(a) * 0.25;
    hassa.add(popuk);
  }
  hassa.rotation.z = -0.30;
  hassa.position.set(0.36, 0.55, 0.06);
  ichki.add(hassa);

  return moslash(ichki, 1.5);
}

/* =========================================================================
   4) QIZIQCHI — askiya va qiziqchilik san’ati ustasi
   Qo‘lida tomosha niqobi (kulgili yuz), boshida salla.
   ========================================================================= */
export function qiziqchiYasa() {
  const ichki = tanaYasa({
    chopon: R.yashil, jiyak: R.terrakota, ishton: R.charmTuq,
    bosh: 'salla', sallaRang: R.oq, soqol: true, soqolRang: 0x3A2E26, qol: 'yon'
  });

  // Chopon gulli naqshi
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    for (let j = 0; j < 3; j++) {
      const gul = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), mat(R.sariq, 0.85));
      gul.scale.set(1, 1.4, 0.35);
      gul.position.set(Math.cos(a) * 0.213, 0.50 + j * 0.17, Math.sin(a) * 0.213);
      gul.rotation.y = -a;
      ichki.add(gul);
    }
  }

  // Qo‘lidagi kulgili niqob — tutqichli
  const niqob = new THREE.Group();
  const yuz = new THREE.Mesh(new THREE.SphereGeometry(0.135, 18, 14), mat(0xF0D9B5, 0.8));
  yuz.scale.set(0.95, 1.12, 0.42);
  niqob.add(yuz);
  // Niqob ko‘zlari — teshik
  for (const x of [-0.05, 0.05]) {
    const koz = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), mat(R.koya, 0.9));
    koz.scale.set(1, 0.75, 0.4);
    koz.position.set(x, 0.035, 0.052);
    niqob.add(koz);
  }
  // Katta kulgi og‘zi
  const kulgi = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.014, 8, 18, Math.PI), mat(0x8A2A22, 0.8));
  kulgi.rotation.z = Math.PI;
  kulgi.position.set(0, -0.02, 0.05);
  niqob.add(kulgi);
  // Qizil yonoqlar
  for (const x of [-0.085, 0.085]) {
    const yonoq = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), mat(R.terrakota, 0.85));
    yonoq.scale.set(1, 0.8, 0.3);
    yonoq.position.set(x, -0.005, 0.045);
    niqob.add(yonoq);
  }
  // Qora mo‘ylov
  const moylov = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.016, 0.012), mat(R.soqol, 0.9));
  moylov.position.set(0, 0.005, 0.055);
  niqob.add(moylov);
  // Tutqich
  const tut = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.016, 0.30, 10), mat(R.yogochTuq, 0.8));
  tut.position.y = -0.27;
  niqob.add(tut);

  niqob.position.set(0.30, 0.98, 0.14);
  niqob.rotation.z = -0.22;
  ichki.add(niqob);

  return moslash(ichki, 1.5);
}

/* =========================================================================
   5) QO‘G‘IRCHOQ — qo‘lqop-qo‘g‘irchoq (chodir ustidan ko‘rsatiladi)
   Yog‘och bosh, bo‘yalgan yuz, kichkina doppi, gulli ko‘ylak, yog‘och
   qo‘llar va boshqaruv iplari.
   ========================================================================= */
export function qogirchoqYasa() {
  const ichki = new THREE.Group();
  const mYogoch = mat(0xE8C9A0, 0.75);
  const mKoylak = mat(R.terrakota, 0.9);
  const mNaqsh  = mat(R.sariq, 0.85);
  const mIp     = mat(R.charmTuq, 0.95);

  /* --- Etak (qo‘lga kiyiladi — pastdan ochiq konus) --- */
  const etak = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.34, 0.62, 22, 1, true), mKoylak);
  etak.material.side = THREE.DoubleSide;
  etak.position.y = 0.31;
  ichki.add(etak);

  // Etak jiyagi
  const jiyak = new THREE.Mesh(new THREE.TorusGeometry(0.335, 0.02, 8, 26), mNaqsh);
  jiyak.rotation.x = Math.PI / 2;
  jiyak.position.y = 0.015;
  ichki.add(jiyak);

  // Ko‘ylakdagi gullar
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    for (let j = 0; j < 2; j++) {
      const r = 0.245 + j * 0.045;
      const gul = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), mNaqsh);
      gul.scale.set(1, 1, 0.3);
      gul.position.set(Math.cos(a) * r, 0.20 + j * 0.24, Math.sin(a) * r);
      gul.rotation.y = -a;
      ichki.add(gul);
    }
  }

  /* --- Yelka va qo‘llar --- */
  const yelka = new THREE.Mesh(new THREE.SphereGeometry(0.20, 18, 12), mKoylak);
  yelka.scale.set(1, 0.5, 0.85);
  yelka.position.y = 0.62;
  ichki.add(yelka);

  for (const yon of [-1, 1]) {
    const qol = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.032, 0.34, 10), mKoylak);
    qol.position.set(yon * 0.235, 0.52, 0);
    qol.rotation.z = yon * 0.55;
    ichki.add(qol);
    const kaft = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), mYogoch);
    kaft.position.set(yon * 0.325, 0.36, 0);
    ichki.add(kaft);
  }

  /* --- Bosh --- */
  const bosh = new THREE.Mesh(new THREE.SphereGeometry(0.21, 22, 18), mYogoch);
  bosh.scale.set(0.94, 1.05, 0.96);
  bosh.position.y = 0.85;
  ichki.add(bosh);

  // Ko‘zlar — bo‘yalgan
  for (const x of [-0.075, 0.075]) {
    const oq = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 10), mat(R.oq, 0.4));
    oq.scale.set(1, 0.85, 0.4);
    oq.position.set(x, 0.885, 0.175);
    ichki.add(oq);
    const qora = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 8), mat(R.koya, 0.4));
    qora.position.set(x, 0.882, 0.198);
    ichki.add(qora);
    const qosh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.014, 0.014), mat(R.soqol, 0.9));
    qosh.position.set(x, 0.945, 0.185);
    qosh.rotation.z = x > 0 ? -0.2 : 0.2;
    ichki.add(qosh);
  }
  // Burun
  const burun = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.08, 8), mYogoch);
  burun.rotation.x = Math.PI / 2;
  burun.position.set(0, 0.845, 0.205);
  ichki.add(burun);
  // Kulgan og‘iz
  const ogiz = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.014, 8, 18, Math.PI), mat(0x8A2A22, 0.8));
  ogiz.rotation.z = Math.PI;
  ogiz.position.set(0, 0.795, 0.185);
  ichki.add(ogiz);
  // Yonoq qizilligi
  for (const x of [-0.125, 0.125]) {
    const yonoq = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), mat(R.terrakota, 0.85));
    yonoq.scale.set(1, 0.8, 0.25);
    yonoq.position.set(x, 0.805, 0.15);
    ichki.add(yonoq);
  }

  // Kichkina do‘ppi
  const gumbaz = new THREE.Mesh(
    new THREE.SphereGeometry(0.195, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(R.siyoh, 0.62));
  gumbaz.scale.y = 0.55;
  gumbaz.position.y = 0.985;
  ichki.add(gumbaz);
  const chekka = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.208, 0.055, 20), mat(0x101024, 0.7));
  chekka.position.y = 0.99;
  ichki.add(chekka);

  /* --- Boshqaruv iplari va yog‘och xoch --- */
  for (const p of [[-0.32, 0.40], [0.32, 0.40], [0, 1.06]]) {
    const ip = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 1.34 - p[1] * 0.55, 6), mIp);
    ip.position.set(p[0], p[1] + (1.34 - p[1] * 0.55) / 2 + 0.02, 0);
    ip.rotation.z = -p[0] * 0.16;
    ichki.add(ip);
  }
  const xoch1 = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.028, 0.028), mat(R.yogochTuq, 0.8));
  xoch1.position.y = 1.60;
  ichki.add(xoch1);
  const xoch2 = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.028, 0.36), mat(R.yogochTuq, 0.8));
  xoch2.position.y = 1.60;
  ichki.add(xoch2);

  return moslash(ichki, 1.45);
}

/* =========================================================================
   6) QO‘G‘IRCHOQ TEATRI — «chodir jamol» sahnasi
   To‘rt ustunli yog‘och ramka, tepasida jiyakli peshtoq, ikki tomondan
   yig‘ilgan qizil parda, o‘rtada tomosha darchasi, ustunlarda naqsh.
   ========================================================================= */
export function teatrChodiriYasa() {
  const ichki = new THREE.Group();
  const mYogoch = mat(R.yogochAsos, 0.75);
  const mTuq    = mat(R.yogochTuq, 0.8);
  const mParda  = mat(R.qizil, 0.94);
  const mPeshtoq= mat(R.binafsha, 0.9);
  const mOltin  = mat(R.sariq, 0.45, 0.4);

  const KENG = 1.10, BALAND = 1.30, CHUQ = 0.42;

  /* --- To‘rt ustun --- */
  for (const x of [-KENG / 2, KENG / 2]) {
    for (const z of [-CHUQ / 2, CHUQ / 2]) {
      const ustun = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.05, BALAND, 12), mTuq);
      ustun.position.set(x, BALAND / 2, z);
      ichki.add(ustun);
      // Ustun boshidagi burma
      const burma = new THREE.Mesh(new THREE.SphereGeometry(0.062, 12, 10), mOltin);
      burma.position.set(x, BALAND + 0.03, z);
      ichki.add(burma);
      // Ustun oyog‘i
      const oyoq = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.05, 12), mTuq);
      oyoq.position.set(x, 0.025, z);
      ichki.add(oyoq);
    }
  }

  /* --- Yon devorlar (mato) --- */
  for (const x of [-KENG / 2, KENG / 2]) {
    const yon = new THREE.Mesh(new THREE.BoxGeometry(0.02, BALAND * 0.78, CHUQ * 0.9),
      mat(R.kok, 0.94));
    yon.position.set(x, BALAND * 0.39, 0);
    ichki.add(yon);
  }
  // Orqa devor
  const orqa = new THREE.Mesh(new THREE.BoxGeometry(KENG, BALAND * 0.78, 0.02), mat(R.kok, 0.94));
  orqa.position.set(0, BALAND * 0.39, -CHUQ / 2);
  ichki.add(orqa);

  /* --- Old tomondagi past to‘siq (qo‘g‘irchoqboz shu ortida turadi) --- */
  const tosiq = new THREE.Mesh(new THREE.BoxGeometry(KENG, 0.52, 0.03), mat(R.terrakota, 0.9));
  tosiq.position.set(0, 0.26, CHUQ / 2);
  ichki.add(tosiq);
  // To‘siqdagi naqsh — oltin romblar
  for (let i = 0; i < 7; i++) {
    const romb = new THREE.Mesh(new THREE.OctahedronGeometry(0.045), mOltin);
    romb.scale.set(0.7, 1, 0.25);
    romb.position.set(-0.45 + i * 0.15, 0.27, CHUQ / 2 + 0.02);
    ichki.add(romb);
  }

  /* --- Peshtoq (tepa lavha) --- */
  const peshtoq = new THREE.Mesh(new THREE.BoxGeometry(KENG + 0.16, 0.20, CHUQ + 0.10), mPeshtoq);
  peshtoq.position.set(0, BALAND + 0.11, 0);
  ichki.add(peshtoq);
  // Peshtoq jiyagi
  const pJiyak = new THREE.Mesh(new THREE.BoxGeometry(KENG + 0.20, 0.035, CHUQ + 0.14), mOltin);
  pJiyak.position.set(0, BALAND + 0.215, 0);
  ichki.add(pJiyak);
  // Peshtoq tepasidagi uchburchak taroq
  for (let i = 0; i < 9; i++) {
    const uch = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.11, 4), mOltin);
    uch.position.set(-0.52 + i * 0.13, BALAND + 0.29, CHUQ / 2 + 0.03);
    ichki.add(uch);
  }
  // Peshtoq oldidagi popuklar
  for (let i = 0; i < 13; i++) {
    const p = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.09, 6), mat(R.sariq, 0.9));
    p.rotation.x = Math.PI;
    p.position.set(-0.54 + i * 0.09, BALAND - 0.02, CHUQ / 2 + 0.055);
    ichki.add(p);
  }

  /* --- Ikki tomondan yig‘ilgan parda --- */
  for (const yon of [-1, 1]) {
    const parda = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const burma = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055 - i * 0.006, 0.075 - i * 0.006, 0.72, 10), mParda);
      burma.position.set(i * 0.052, 0.36, 0);
      burma.rotation.z = -i * 0.03;
      parda.add(burma);
    }
    // Pardani ushlab turgan bog‘ich
    const bogich = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.018, 8, 20), mOltin);
    bogich.rotation.y = Math.PI / 2;
    bogich.position.set(0.075, 0.42, 0);
    parda.add(bogich);

    parda.position.set(yon * (KENG / 2 - 0.09), 0.55, CHUQ / 2 + 0.02);
    parda.scale.x = -yon;
    ichki.add(parda);
  }

  return moslash(ichki, 1.5);
}

/* =========================================================================
   7) KARNAY — to‘y va sayllarda chalinadigan uzun mis puflama
   ========================================================================= */
export function karnayYasa() {
  const ichki = new THREE.Group();
  const mMis = mat(0xC08A3E, 0.35, 0.75);
  const mMisTuq = mat(0x8E6228, 0.45, 0.7);

  // Uzun naycha — asta kengayadi
  const profil = [];
  for (let i = 0; i <= 22; i++) {
    const t = i / 22;
    const r = 0.022 + Math.pow(t, 3.4) * 0.22;
    profil.push(new THREE.Vector2(r, t * 1.42));
  }
  // Qo‘ng‘iroq og‘zi
  profil.push(new THREE.Vector2(0.26, 1.46));
  profil.push(new THREE.Vector2(0.255, 1.48));

  const nay = new THREE.Mesh(new THREE.LatheGeometry(profil, 26), mMis);
  nay.material.side = THREE.DoubleSide;
  ichki.add(nay);

  // Bo‘g‘im halqalari (karnay uch bo‘lakdan yig‘iladi)
  for (const y of [0.48, 0.95]) {
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.032 + y * 0.03, 0.018, 10, 22), mMisTuq);
    h.rotation.x = Math.PI / 2;
    h.position.y = y;
    ichki.add(h);
  }
  // Og‘iz jiyagi
  const ogiz = new THREE.Mesh(new THREE.TorusGeometry(0.258, 0.02, 10, 30), mMisTuq);
  ogiz.rotation.x = Math.PI / 2;
  ogiz.position.y = 1.47;
  ichki.add(ogiz);
  // Puflash og‘izchasi
  const mushtuk = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.024, 0.06, 12), mMisTuq);
  mushtuk.position.y = -0.02;
  ichki.add(mushtuk);

  ichki.rotation.z = -0.30;   // ko‘tarib chalinadi
  return moslash(ichki, 1.5);
}

/* =========================================================================
   8) SURNAY — o‘tkir ovozli yog‘och puflama cholg‘u
   ========================================================================= */
export function surnayYasa() {
  const ichki = new THREE.Group();
  const mYogoch = mat(R.yogochTuq, 0.6);
  const mMis    = mat(0xC08A3E, 0.35, 0.7);
  const mKoya   = mat(R.koya, 0.9, 0, { side: THREE.DoubleSide });

  const profil = [];
  for (let i = 0; i <= 18; i++) {
    const t = i / 18;
    profil.push(new THREE.Vector2(0.026 + Math.pow(t, 3) * 0.10, t * 0.92));
  }
  profil.push(new THREE.Vector2(0.155, 0.99));
  profil.push(new THREE.Vector2(0.15, 1.01));
  const tana = new THREE.Mesh(new THREE.LatheGeometry(profil, 22), mYogoch);
  tana.material.side = THREE.DoubleSide;
  ichki.add(tana);

  // Qo‘ng‘iroq jiyagi — mis
  const jiyak = new THREE.Mesh(new THREE.TorusGeometry(0.152, 0.014, 10, 26), mMis);
  jiyak.rotation.x = Math.PI / 2;
  jiyak.position.y = 1.00;
  ichki.add(jiyak);

  // 7 ta barmoq teshigi
  for (let i = 0; i < 7; i++) {
    const y = 0.30 + i * 0.075;
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.02, 10), mKoya);
    t.rotation.x = Math.PI / 2;
    t.position.set(0, y, 0.03 + i * 0.004);
    ichki.add(t);
  }
  // Bo‘g‘im halqalari
  for (const y of [0.18, 0.62]) {
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.034 + y * 0.02, 0.009, 8, 20), mMis);
    h.rotation.x = Math.PI / 2;
    h.position.y = y;
    ichki.add(h);
  }
  // Mushtuk va qamish til
  const mushtuk = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.024, 0.09, 10), mMis);
  mushtuk.position.y = -0.045;
  ichki.add(mushtuk);
  const til = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.010, 0.05, 8), mat(R.charmTuq, 0.85));
  til.position.y = -0.11;
  ichki.add(til);
  // Kaft tayanchi (disk)
  const disk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.008, 16), mMis);
  disk.position.y = -0.005;
  ichki.add(disk);

  return moslash(ichki, 1.25);
}

/* =========================================================================
   9) NOG‘ORA — juft sopol zarbli cholg‘u (karnay-surnay bilan birga)
   ========================================================================= */
export function nogoraYasa() {
  const ichki = new THREE.Group();
  const mSopol = mat(0x9C5A3C, 0.85);
  const mCharm = mat(R.charm, 0.86);
  const mBog   = mat(R.charmTuq, 0.9);
  const mTayoq = mat(R.yogochOrta, 0.75);

  function bittaNogora(r, h, x) {
    const kosa = new THREE.Mesh(
      new THREE.SphereGeometry(r, 22, 16, 0, Math.PI * 2, Math.PI * 0.32, Math.PI * 0.68),
      mSopol
    );
    kosa.position.set(x, h, 0);
    ichki.add(kosa);

    const parda = new THREE.Mesh(new THREE.CircleGeometry(r * 0.945, 26), mCharm);
    parda.rotation.x = -Math.PI / 2;
    parda.position.set(x, h + r * 0.47, 0);
    ichki.add(parda);

    const gardish = new THREE.Mesh(new THREE.TorusGeometry(r * 0.95, r * 0.05, 10, 28), mBog);
    gardish.rotation.x = Math.PI / 2;
    gardish.position.set(x, h + r * 0.47, 0);
    ichki.add(gardish);

    // Charm bog‘ichlar — gardishdan pastga
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const ip = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.03, r * 0.03, r * 0.72, 6), mBog);
      ip.position.set(x + Math.cos(a) * r * 0.88, h + r * 0.12, Math.sin(a) * r * 0.88);
      ip.rotation.z = Math.cos(a) * 0.22;
      ip.rotation.x = -Math.sin(a) * 0.22;
      ichki.add(ip);
    }
  }

  bittaNogora(0.34, 0.30, -0.30);
  bittaNogora(0.26, 0.23, 0.32);

  // Ikki zarb cho‘pi
  for (let i = 0; i < 2; i++) {
    const chop = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.019, 0.62, 8), mTayoq);
    chop.rotation.z = 0.42 - i * 0.18;
    chop.rotation.x = -0.25;
    chop.position.set(-0.05 + i * 0.16, 0.78, 0.22);
    ichki.add(chop);
  }

  return moslash(ichki, 1.35);
}

/* =========================================================================
   RO‘YXAT
   ========================================================================= */
export const TEATR = {
  gijjak:      { nom: 'G‘ijjak',            yasa: gijjakYasa,
                 izoh: 'Yumaloq kosali, kamon bilan chalinadigan torli cholg‘u; ovozi inson qo‘shig‘iga yaqin.' },
  xonanda:     { nom: 'Xonanda',            yasa: xonandaYasa,
                 izoh: 'Alla, yor-yor va laparlarni ijro etuvchi qo‘shiqchi — qo‘l quloqda, klassik ashula pozasi.' },
  masxaraboz:  { nom: 'Masxaraboz',         yasa: masxarabozYasa,
                 izoh: 'Yamoq chopon va uchli qalpoqdagi kulgi ustasi; xalq tomoshalarining bosh qahramoni.' },
  qiziqchi:    { nom: 'Qiziqchi',           yasa: qiziqchiYasa,
                 izoh: 'Askiya va hazil-mutoyiba ustasi; qo‘lidagi kulgili niqob bilan tomosha ko‘rsatadi.' },
  qogirchoq:   { nom: 'Qo‘g‘irchoq',        yasa: qogirchoqYasa,
                 izoh: 'Yog‘och boshli, bo‘yalgan yuzli qo‘lqop-qo‘g‘irchoq; iplar orqali boshqariladi.' },
  teatrChodir: { nom: 'Qo‘g‘irchoq teatri', yasa: teatrChodiriYasa,
                 izoh: '«Chodir jamol» — ustunli ramka, qizil parda va peshtoqdan iborat sayyor sahna.' },
  karnay:      { nom: 'Karnay',             yasa: karnayYasa,
                 izoh: 'Uzun mis puflama cholg‘u; to‘y va sayl boshlanishini butun mahallaga eshittiradi.' },
  surnay:      { nom: 'Surnay',             yasa: surnayYasa,
                 izoh: 'O‘tkir, jarangdor ovozli yog‘och puflama cholg‘u; karnay bilan juft chalinadi.' },
  nogora:      { nom: 'Nog‘ora',            yasa: nogoraYasa,
                 izoh: 'Juft sopol kosaga charm tortilgan zarbli cholg‘u; sayl usulini boshqaradi.' }
};
