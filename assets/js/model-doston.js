/* =========================================================
   DOSTONCHILIK — 3D modellar (6-modul)
   «Xalq pedagogikasi va xalq og‘zaki ijodida dostonlar».
   Sahna qismlari: baxshi, o‘tov, gulxan, tinglovchilar.
   «Alpomish» tafsilotlari: Barchinning to‘rt sharti (kamon,
   nayza, tanga, belbog‘) hamda jang jabduqlari (qalqon,
   dubulg‘a), «Ravshan» uzugi va otliq qamchini.

   Har funksiya THREE.Group qaytaradi. Miqyos: eng katta
   o‘lchami 1.0–1.5 birlik, pastki nuqtasi y=0, X va Z
   bo‘yicha markazlashgan. Kattalashtirishni o‘yin kodi
   o‘zi bajaradi.
   ========================================================= */
import * as THREE from '../vendor/three.module.min.js';

/* ---------- Umumiy materiallar ---------- */
const M = {
  yogoch:   () => new THREE.MeshStandardMaterial({ color: 0x8A6A44, roughness: 0.82 }),
  yogochOch:() => new THREE.MeshStandardMaterial({ color: 0xB08E64, roughness: 0.78 }),
  yogochTuq:() => new THREE.MeshStandardMaterial({ color: 0x6E5334, roughness: 0.85 }),
  mato:     (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 }),
  kigiz:    () => new THREE.MeshStandardMaterial({ color: 0xEDE6D6, roughness: 0.98 }),
  oq:       () => new THREE.MeshStandardMaterial({ color: 0xFBF7F0, roughness: 0.9 }),
  kok:      () => new THREE.MeshStandardMaterial({ color: 0x1B3B6F, roughness: 0.45 }),
  metall:   () => new THREE.MeshStandardMaterial({ color: 0x9AA2AC, roughness: 0.35, metalness: 0.8 }),
  polat:    () => new THREE.MeshStandardMaterial({ color: 0xC7CDD4, roughness: 0.2,  metalness: 0.92 }),
  choyan:   () => new THREE.MeshStandardMaterial({ color: 0x3A3A3E, roughness: 0.7,  metalness: 0.3 }),
  oltin:    () => new THREE.MeshStandardMaterial({ color: 0xD4A24C, roughness: 0.32, metalness: 0.72 }),
  jez:      () => new THREE.MeshStandardMaterial({ color: 0xC08A3E, roughness: 0.4,  metalness: 0.6 }),
  teri:     () => new THREE.MeshStandardMaterial({ color: 0xC9A87A, roughness: 0.85 }),
  charm:    () => new THREE.MeshStandardMaterial({ color: 0x6E5334, roughness: 0.7 }),
  jun:      () => new THREE.MeshStandardMaterial({ color: 0xB08E64, roughness: 1.0 }),
  junTuq:   () => new THREE.MeshStandardMaterial({ color: 0x5B4636, roughness: 1.0 }),
  arqon:    () => new THREE.MeshStandardMaterial({ color: 0xC9A87A, roughness: 1.0 }),
  soqol:    () => new THREE.MeshStandardMaterial({ color: 0x4A4A4E, roughness: 0.98 }),
  qora:     () => new THREE.MeshStandardMaterial({ color: 0x3A3A3E, roughness: 0.6 }),
  tosh:     () => new THREE.MeshStandardMaterial({ color: 0x8B8D8F, roughness: 0.96 }),
  toshTuq:  () => new THREE.MeshStandardMaterial({ color: 0x6B6D70, roughness: 0.96 }),
  firuza:   () => new THREE.MeshStandardMaterial({ color: 0x2E86A0, roughness: 0.18, metalness: 0.35 }),
};

function soya(m, qabul = false) {
  m.castShadow = true;
  if (qabul) m.receiveShadow = true;
  return m;
}

/* Ikki nuqta orasiga silindr tortadi — tayoq, uuq, arqon uchun */
const _Y = new THREE.Vector3(0, 1, 0);
const _Z = new THREE.Vector3(0, 0, 1);
function chiziq(a, b, r, mat, seg = 8) {
  const yon = new THREE.Vector3().subVectors(b, a);
  const uz = yon.length() || 0.001;
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, uz, seg), mat);
  m.position.copy(a).addScaledVector(yon, 0.5);
  m.quaternion.setFromUnitVectors(_Y, yon.clone().normalize());
  return m;
}

/* Egri chiziqning t nuqtasiga halqa o‘rnatadi — o‘ram naqshi uchun */
function egriHalqa(egri, t, R, r, mat) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(R, r, 6, 14), mat);
  m.position.copy(egri.getPointAt(t));
  m.quaternion.setFromUnitVectors(_Z, egri.getTangentAt(t).normalize());
  return m;
}

/* =========================================================
   1) BAXSHI — chordana qurib, do‘mbira chalayotgan baxshi
   Qismlari: qo‘y terisi telpak, soqolli yuz, gulli chopon,
   belbog‘, chordana oyoqlar, oldinga cho‘zilgan ikki qo‘l.
   Jonlantirish uchun: userData.bosh, ongQol, chapQol.
   ========================================================= */
export function baxshiYasa() {
  const g = new THREE.Group();
  const chopon = M.mato(0x1B3B6F);
  const choponTuq = M.mato(0x142C52);
  const naqsh = M.mato(0xD4A24C);
  const teri = M.teri();
  const jun = M.junTuq(), junT = M.jun();   // telpak to‘q, jingalaklari ochroq
  const soqolM = new THREE.MeshStandardMaterial({ color: 0xD8D3CB, roughness: 0.98 });

  /* --- Chordana oyoqlar: sonlar ko‘ndalang, boldirlar kesishgan --- */
  for (const yon of [-1, 1]) {
    const son = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.24, 6, 12), chopon);
    son.rotation.z = Math.PI / 2;
    son.position.set(yon * 0.15, 0.09, 0.04);
    g.add(soya(son, true));

    const tizza = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 10), chopon);
    tizza.position.set(yon * 0.30, 0.095, 0.03);
    g.add(soya(tizza));

    // Boldir — chordana holatda ichkariga qayrilgan
    const boldir = new THREE.Mesh(new THREE.CapsuleGeometry(0.066, 0.22, 6, 12), choponTuq);
    boldir.rotation.set(0, yon * 0.62, Math.PI / 2);
    boldir.position.set(yon * 0.115, 0.072, 0.20);
    g.add(soya(boldir, true));

    // Etik uchi — qarama-qarshi tomonda chiqib turadi
    const etik = new THREE.Mesh(new THREE.SphereGeometry(0.072, 10, 8), M.charm());
    etik.scale.set(1, 0.78, 1.3);
    etik.position.set(-yon * 0.05, 0.068, 0.275);
    g.add(soya(etik, true));
  }

  /* --- Tana: gulli chopon --- */
  const tana = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.32, 0.46, 18, 1), chopon);
  tana.position.y = 0.38;
  g.add(soya(tana, true));

  const yelka = new THREE.Mesh(new THREE.SphereGeometry(0.235, 16, 12), chopon);
  yelka.scale.set(1, 0.55, 0.78);
  yelka.position.y = 0.60;
  g.add(soya(yelka));

  // Choponning oldida ochiq ikki etak va oltin jiyagi
  for (const yon of [-1, 1]) {
    const etak = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.44, 0.028), choponTuq);
    etak.position.set(yon * 0.105, 0.38, 0.252);
    etak.rotation.set(0.05, yon * 0.14, -yon * 0.05);
    g.add(soya(etak));

    const jiyak = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.44, 0.014), naqsh);
    jiyak.position.set(yon * 0.172, 0.38, 0.268);
    jiyak.rotation.copy(etak.rotation);
    g.add(jiyak);
  }

  // Chopon guli — yon bo‘ylab oltin naqsh donalari
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const gul = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 6), naqsh);
    gul.position.set(Math.cos(a) * 0.29, 0.28 + (i % 2) * 0.15, Math.sin(a) * 0.29);
    gul.lookAt(0, gul.position.y, 0);
    gul.scale.set(1, 1.2, 0.35);
    g.add(gul);
  }

  /* --- Belbog‘ --- */
  const belbog = new THREE.Mesh(new THREE.TorusGeometry(0.272, 0.045, 8, 26), M.mato(0xC1502E));
  belbog.rotation.x = -Math.PI / 2;
  belbog.position.y = 0.30;
  g.add(soya(belbog));
  const tugun = new THREE.Mesh(new THREE.SphereGeometry(0.062, 10, 8), M.mato(0xC1502E));
  tugun.position.set(0, 0.295, 0.275);
  g.add(soya(tugun));

  /* --- Bo‘yin --- */
  const boyin = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.072, 0.10, 10), teri);
  boyin.position.y = 0.665;
  g.add(soya(boyin));

  /* --- BOSH (jonlantiriladi) --- */
  const bosh = new THREE.Group();
  bosh.position.set(0, 0.80, 0);
  g.add(bosh);
  g.userData.bosh = bosh;

  const kalla = new THREE.Mesh(new THREE.SphereGeometry(0.115, 18, 14), teri);
  kalla.scale.set(1, 1.12, 1.02);
  bosh.add(soya(kalla));

  const burun = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.062, 8), teri);
  burun.rotation.x = Math.PI / 2;
  burun.position.set(0, 0.005, 0.112);
  bosh.add(burun);

  for (const yon of [-1, 1]) {
    const koz = new THREE.Mesh(new THREE.SphereGeometry(0.017, 8, 6), M.qora());
    koz.position.set(yon * 0.046, 0.042, 0.100);
    bosh.add(koz);

    const qosh = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.012, 0.012), soqolM);
    qosh.position.set(yon * 0.048, 0.072, 0.100);
    qosh.rotation.z = -yon * 0.16;
    bosh.add(qosh);

    const quloq = new THREE.Mesh(new THREE.SphereGeometry(0.030, 8, 6), teri);
    quloq.scale.set(0.38, 1, 0.8);
    quloq.position.set(yon * 0.114, 0.0, 0);
    bosh.add(quloq);
  }

  // Oq soqol — yuz atrofidagi sferalar to‘plami
  for (let i = 0; i < 9; i++) {
    const a = -0.95 + (i / 8) * 1.9;
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.045 + (i % 3) * 0.008, 10, 8), soqolM);
    s.position.set(Math.sin(a) * 0.088, -0.078 - Math.cos(a) * 0.028, 0.070 + Math.cos(a) * 0.022);
    bosh.add(s);
  }
  const soqolUch = new THREE.Mesh(new THREE.ConeGeometry(0.062, 0.17, 10), soqolM);
  soqolUch.rotation.x = Math.PI;
  soqolUch.position.set(0, -0.175, 0.052);
  bosh.add(soya(soqolUch));

  const moylov = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), soqolM);
  moylov.scale.set(1.5, 0.38, 0.5);
  moylov.position.set(0, -0.028, 0.098);
  bosh.add(moylov);

  // Qo‘y terisi telpak
  const telpak = new THREE.Mesh(new THREE.CylinderGeometry(0.146, 0.136, 0.17, 18), jun);
  telpak.position.y = 0.155;
  bosh.add(soya(telpak));
  const telpakUst = new THREE.Mesh(
    new THREE.SphereGeometry(0.146, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), jun);
  telpakUst.scale.y = 0.62;
  telpakUst.position.y = 0.238;
  bosh.add(soya(telpakUst));

  const telpakJiyak = new THREE.Mesh(new THREE.TorusGeometry(0.150, 0.026, 8, 22), M.charm());
  telpakJiyak.rotation.x = -Math.PI / 2;
  telpakJiyak.position.y = 0.082;
  bosh.add(soya(telpakJiyak));

  // Jingalak jun donalari — telpakning tuki
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 * 3;
    const h = 0.112 + (i % 4) * 0.045;
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.036, 8, 6), i % 2 ? jun : junT);
    d.position.set(Math.cos(a) * 0.143, h, Math.sin(a) * 0.143);
    bosh.add(d);
  }

  /* --- QO‘LLAR (jonlantiriladi) — do‘mbira ushlagandek oldinga --- */
  function qolYasa(yon) {
    const q = new THREE.Group();
    q.position.set(yon * 0.235, 0.585, 0.02);

    const yuqori = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.16, 6, 12), chopon);
    yuqori.rotation.set(0.5, 0, yon * 0.42);
    yuqori.position.set(yon * 0.052, -0.098, 0.048);
    q.add(soya(yuqori));

    const tirsak = new THREE.Mesh(new THREE.SphereGeometry(0.058, 10, 8), chopon);
    tirsak.position.set(yon * 0.100, -0.195, 0.105);
    q.add(soya(tirsak));

    const past = new THREE.Mesh(new THREE.CapsuleGeometry(0.047, 0.18, 6, 12), chopon);
    past.rotation.set(1.24, 0, yon * 0.16);
    past.position.set(yon * 0.096, -0.232, 0.235);
    q.add(soya(past));

    const yeng = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.016, 6, 14), naqsh);
    yeng.rotation.set(1.24 + Math.PI / 2, 0, yon * 0.16);
    yeng.position.set(yon * 0.094, -0.256, 0.325);
    q.add(yeng);

    const panja = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), teri);
    panja.scale.set(1, 0.8, 1.2);
    panja.position.set(yon * 0.092, -0.262, 0.372);
    q.add(soya(panja));

    for (let i = 0; i < 3; i++) {
      const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.014, 0.042, 4, 8), teri);
      b.rotation.x = Math.PI / 2;
      b.position.set(yon * 0.092 + (i - 1) * 0.028, -0.288, 0.408);
      q.add(b);
    }
    return q;
  }

  const ongQol = qolYasa(1);
  const chapQol = qolYasa(-1);
  g.add(ongQol);
  g.add(chapQol);
  g.userData.ongQol = ongQol;
  g.userData.chapQol = chapQol;
  return g;
}

/* =========================================================
   2) O‘TOV (yurta) — baxshi aytadigan to‘y-marosim maskani
   Qismlari: kerega (tik kigiz devor + to‘rsimon tayoqchalar),
   yassilangan gumbaz, uuq qovurg‘alari, changaraq (tuynuk),
   naqshli yog‘och eshik, bog‘ich arqonlar va popuklar.
   ========================================================= */
export function otovYasa() {
  const g = new THREE.Group();
  const kigiz = M.kigiz();
  kigiz.side = THREE.DoubleSide;
  const yog = M.yogochTuq(), yogO = M.yogochOch();

  const R = 0.62, devorH = 0.40, gumbazH = 0.42;

  /* --- Kerega: tik kigiz devor --- */
  const devor = new THREE.Mesh(
    new THREE.CylinderGeometry(R, R * 1.02, devorH, 32, 1, true), kigiz);
  devor.position.y = devorH / 2;
  g.add(soya(devor, true));

  /* --- Kerega to‘ri: qiya kesishgan yog‘och tayoqchalar --- */
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    for (const yon of [-1, 1]) {
      const a2 = a + yon * 0.44;
      g.add(soya(chiziq(
        new THREE.Vector3(Math.cos(a) * R * 1.015, 0.025, Math.sin(a) * R * 1.015),
        new THREE.Vector3(Math.cos(a2) * R * 1.015, devorH - 0.02, Math.sin(a2) * R * 1.015),
        0.011, yog, 6)));
    }
  }

  /* --- Gumbaz: biroz yassilangan yarim sfera --- */
  const gumbaz = new THREE.Mesh(
    new THREE.SphereGeometry(R, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.02), kigiz);
  gumbaz.scale.y = gumbazH / R;
  gumbaz.position.y = devorH;
  g.add(soya(gumbaz, true));

  /* --- Uuq: gumbaz qovurg‘alari (egri quvurlar) --- */
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const nq = [];
    for (let j = 0; j <= 5; j++) {
      const phi = Math.PI / 2 - (j / 5) * (Math.PI / 2 - 0.245);
      const rr = R * 1.02 * Math.sin(phi);
      nq.push(new THREE.Vector3(
        Math.cos(a) * rr, devorH + gumbazH * 1.02 * Math.cos(phi), Math.sin(a) * rr));
    }
    const uuq = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(nq), 14, 0.013, 6, false), yog);
    g.add(soya(uuq));
  }

  /* --- Changaraq: tuynuk halqasi va ichidagi krest tayoqchalar --- */
  const tuynukY = devorH + gumbazH * 1.03;
  const changaraq = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.026, 8, 26), yogO);
  changaraq.rotation.x = -Math.PI / 2;
  changaraq.position.y = tuynukY;
  g.add(soya(changaraq));

  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI;
    g.add(soya(chiziq(
      new THREE.Vector3(Math.cos(a) * 0.155, tuynukY, Math.sin(a) * 0.155),
      new THREE.Vector3(-Math.cos(a) * 0.155, tuynukY, -Math.sin(a) * 0.155),
      0.011, yogO, 6)));
  }

  /* --- Eshik: naqshli yog‘och tabaqa va romi --- */
  const eW = 0.30, eH = 0.34;
  for (const x of [-eW / 2, eW / 2]) {
    const ustun = new THREE.Mesh(new THREE.BoxGeometry(0.036, eH, 0.05), yogO);
    ustun.position.set(x, eH / 2, R * 0.99);
    g.add(soya(ustun, true));
  }
  const boshoq = new THREE.Mesh(new THREE.BoxGeometry(eW + 0.08, 0.042, 0.05), yogO);
  boshoq.position.set(0, eH + 0.021, R * 0.99);
  g.add(soya(boshoq));

  const tabaqa = new THREE.Mesh(new THREE.BoxGeometry(eW - 0.03, eH - 0.03, 0.022), yog);
  tabaqa.position.set(0, eH / 2, R * 1.005);
  g.add(soya(tabaqa));

  for (let i = 0; i < 3; i++) {
    const n = new THREE.Mesh(new THREE.TorusGeometry(0.034, 0.008, 6, 14), M.oltin());
    n.position.set(0, 0.075 + i * 0.095, R * 1.020);
    g.add(n);
  }
  const tutqich = new THREE.Mesh(new THREE.SphereGeometry(0.023, 10, 8), M.metall());
  tutqich.position.set(eW / 2 - 0.055, eH / 2, R * 1.025);
  g.add(soya(tutqich));

  /* --- Bog‘ich arqonlar --- */
  for (const [y, r] of [[0.12, R * 1.035], [0.27, R * 1.035], [devorH + 0.05, R * 0.99]]) {
    const arqon = new THREE.Mesh(new THREE.TorusGeometry(r, 0.014, 6, 40), M.arqon());
    arqon.rotation.x = -Math.PI / 2;
    arqon.position.y = y;
    g.add(arqon);
  }

  /* --- Osma popuklar --- */
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.35;
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.022, 0.09, 6), M.mato(0xC1502E));
    p.position.set(Math.cos(a) * R * 1.035, 0.075, Math.sin(a) * R * 1.035);
    g.add(soya(p));
  }
  return g;
}

/* =========================================================
   3) GULXAN — baxshi va tinglovchilar o‘tirgan olov
   Qismlari: aylana toshlar, kul to‘shak, kesishgan o‘tinlar,
   uch qatlamli olov (lipillaydi) va uchqunlar.
   Jonlantirish uchun: userData.olov — olov konuslari massivi.
   ========================================================= */
export function gulxanYasa() {
  const g = new THREE.Group();
  const t1 = M.tosh(), t2 = M.toshTuq();
  const yog = M.yogochTuq(), yogO = M.yogoch();
  const kuygan = new THREE.MeshStandardMaterial({ color: 0x2B2622, roughness: 0.98 });

  /* --- Kul to‘shalgan tag --- */
  const kul = new THREE.Mesh(new THREE.CylinderGeometry(0.40, 0.44, 0.035, 26),
    new THREE.MeshStandardMaterial({ color: 0x59524B, roughness: 1.0 }));
  kul.position.y = 0.018;
  kul.receiveShadow = true;
  g.add(kul);

  /* --- Aylana bo‘ylab terilgan g‘adir-budur toshlar --- */
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const t = new THREE.Mesh(new THREE.SphereGeometry(0.10, 8, 6), i % 2 ? t1 : t2);
    t.scale.set(1 + (i % 3) * 0.13, 0.68, 0.86);
    t.rotation.set((i % 3) * 0.05, a, ((i + 1) % 3) * 0.05);
    t.position.set(Math.cos(a) * 0.45, 0.090, Math.sin(a) * 0.45);
    g.add(soya(t, true));
  }

  /* --- Kesishgan o‘tinlar, uchi kuygan --- */
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.25;
    const past = new THREE.Vector3(Math.cos(a) * 0.40, 0.05, Math.sin(a) * 0.40);
    const yuqori = new THREE.Vector3(Math.cos(a + 2.4) * 0.105, 0.46, Math.sin(a + 2.4) * 0.105);
    g.add(soya(chiziq(past, yuqori, 0.032, i % 2 ? yog : yogO, 8), true));

    const uch = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 6), kuygan);
    uch.position.copy(yuqori);
    g.add(uch);
  }
  // Yerda yotgan ikki yo‘g‘on o‘tin
  for (const [z, a] of [[-0.18, 0.4], [0.20, -0.6]]) {
    const o = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.036, 0.62, 8), yog);
    o.rotation.set(0, a, Math.PI / 2);
    o.position.set(0, 0.055, z);
    g.add(soya(o, true));
  }

  /* --- Cho‘g‘ donalari --- */
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 1.1;
    const ch = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0x7A2F18, emissive: 0xC1502E,
        emissiveIntensity: 0.7, roughness: 0.9 }));
    ch.scale.y = 0.6;
    ch.position.set(Math.cos(a) * 0.18, 0.045, Math.sin(a) * 0.18);
    g.add(ch);
  }

  /* --- Uch qatlamli olov (o‘yin kodi lipillatadi) --- */
  const olovlar = [];
  const qatlamlar = [
    { r: 0.225, h: 0.50, y: 0.07, c: 0xC1502E, e: 0x8E2A10, o: 0.80 },
    { r: 0.150, h: 0.38, y: 0.11, c: 0xD4A24C, e: 0xB06A16, o: 0.88 },
    { r: 0.078, h: 0.25, y: 0.14, c: 0xFBF7F0, e: 0xE0B24A, o: 1.0 },
  ];
  for (const q of qatlamlar) {
    const olov = new THREE.Mesh(new THREE.ConeGeometry(q.r, q.h, 12, 3),
      new THREE.MeshStandardMaterial({
        color: q.c, emissive: q.e, emissiveIntensity: 0.95, roughness: 0.6,
        transparent: true, opacity: q.o,
      }));
    olov.position.y = q.y + q.h / 2;
    g.add(olov);
    olovlar.push(olov);
  }
  g.userData.olov = olovlar;

  /* --- Uchqunlar --- */
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 * 1.7;
    const uch = new THREE.Mesh(new THREE.SphereGeometry(0.016 + (i % 3) * 0.005, 6, 5),
      new THREE.MeshStandardMaterial({ color: 0xD4A24C, emissive: 0xD4A24C,
        emissiveIntensity: 1.0, roughness: 0.5 }));
    uch.position.set(Math.cos(a) * (0.06 + i * 0.018), 0.60 + i * 0.035, Math.sin(a) * (0.06 + i * 0.018));
    g.add(uch);
  }
  return g;
}

/* =========================================================
   4) TINGLOVCHI — gulxan atrofida chordana o‘tirgan odam
   rangIndeks (0..4) chopon rangini va bosh kiyimini
   o‘zgartiradi: juft indeksda do‘ppi, toqda ro‘mol.
   Jonlantirish uchun: userData.bosh.
   ========================================================= */
export function tinglovchiYasa(rangIndeks = 0) {
  const g = new THREE.Group();
  const i = (((rangIndeks | 0) % 5) + 5) % 5;
  const ranglar = [0xC1502E, 0x2F6B45, 0x1B3B6F, 0xD4A24C, 0x6E5334];
  const tuqRanglar = [0x9C3E22, 0x245236, 0x142C52, 0xB0842F, 0x54402A];
  const chopon = M.mato(ranglar[i]);
  const choponTuq = M.mato(tuqRanglar[i]);
  const naqsh = M.mato(i === 3 ? 0x6E5334 : 0xD4A24C);
  const teri = M.teri();
  const romolli = i % 2 === 1;

  /* --- Chordana oyoqlar --- */
  for (const yon of [-1, 1]) {
    const son = new THREE.Mesh(new THREE.CapsuleGeometry(0.078, 0.22, 6, 12), chopon);
    son.rotation.z = Math.PI / 2;
    son.position.set(yon * 0.14, 0.085, 0.04);
    g.add(soya(son, true));

    const tizza = new THREE.Mesh(new THREE.SphereGeometry(0.088, 12, 10), chopon);
    tizza.position.set(yon * 0.28, 0.09, 0.03);
    g.add(soya(tizza));

    const boldir = new THREE.Mesh(new THREE.CapsuleGeometry(0.060, 0.20, 6, 12), choponTuq);
    boldir.rotation.set(0, yon * 0.62, Math.PI / 2);
    boldir.position.set(yon * 0.105, 0.066, 0.185);
    g.add(soya(boldir, true));

    const etik = new THREE.Mesh(new THREE.SphereGeometry(0.066, 10, 8), M.charm());
    etik.scale.set(1, 0.78, 1.28);
    etik.position.set(-yon * 0.045, 0.062, 0.25);
    g.add(soya(etik, true));
  }

  /* --- Tana va yelkaga tashlangan chopon --- */
  const tana = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.29, 0.44, 16, 1), chopon);
  tana.position.y = 0.40;
  g.add(soya(tana, true));

  const yelka = new THREE.Mesh(new THREE.SphereGeometry(0.215, 16, 12), choponTuq);
  yelka.scale.set(1, 0.52, 0.76);
  yelka.position.y = 0.615;
  g.add(soya(yelka));

  // Yelkadan pastga tushgan chopon yoqasi
  for (const yon of [-1, 1]) {
    const yoqa = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.38, 0.02), naqsh);
    yoqa.position.set(yon * 0.075, 0.44, 0.235);
    yoqa.rotation.set(0.05, yon * 0.22, -yon * 0.06);
    g.add(yoqa);
  }
  const kamar = new THREE.Mesh(new THREE.TorusGeometry(0.248, 0.032, 8, 24), naqsh);
  kamar.rotation.x = -Math.PI / 2;
  kamar.position.y = 0.32;
  g.add(soya(kamar));

  /* --- Bo‘yin --- */
  const boyin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.065, 0.09, 10), teri);
  boyin.position.y = 0.675;
  g.add(soya(boyin));

  /* --- BOSH (jonlantiriladi) --- */
  const bosh = new THREE.Group();
  bosh.position.set(0, 0.805, 0);
  g.add(bosh);
  g.userData.bosh = bosh;

  const kalla = new THREE.Mesh(new THREE.SphereGeometry(0.108, 16, 12), teri);
  kalla.scale.set(1, 1.10, 1.02);
  bosh.add(soya(kalla));

  const burun = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.05, 8), teri);
  burun.rotation.x = Math.PI / 2;
  burun.position.set(0, 0.0, 0.105);
  bosh.add(burun);

  for (const yon of [-1, 1]) {
    const koz = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6), M.qora());
    koz.position.set(yon * 0.043, 0.038, 0.094);
    bosh.add(koz);
    const quloq = new THREE.Mesh(new THREE.SphereGeometry(0.027, 8, 6), teri);
    quloq.scale.set(0.38, 1, 0.8);
    quloq.position.set(yon * 0.107, 0.0, 0);
    bosh.add(quloq);
  }
  const ogiz = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), M.mato(0x9C4A38));
  ogiz.scale.set(1, 0.3, 0.4);
  ogiz.position.set(0, -0.05, 0.095);
  bosh.add(ogiz);

  if (romolli) {
    /* Ro‘mol — boshni o‘rab, orqasiga tushgan */
    const romolMat = M.mato(i === 1 ? 0xEDE6D6 : 0xC1502E);
    const qalpoq = new THREE.Mesh(
      new THREE.SphereGeometry(0.124, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.62), romolMat);
    qalpoq.position.y = 0.012;
    bosh.add(soya(qalpoq));

    const orqa = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.20, 0.03), romolMat);
    orqa.position.set(0, -0.06, -0.10);
    orqa.rotation.x = -0.16;
    bosh.add(soya(orqa));

    const tugun = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), romolMat);
    tugun.position.set(0, 0.02, -0.115);
    bosh.add(tugun);

    for (let k = 0; k < 5; k++) {
      const n = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 5), naqsh);
      n.position.set(-0.09 + k * 0.045, 0.088, 0.055);
      bosh.add(n);
    }

    // O‘ram halqasi va tepadagi tugun — ro‘mol boshga o‘ralganini ko‘rsatadi
    const oram = new THREE.Mesh(new THREE.TorusGeometry(0.126, 0.042, 10, 24), romolMat);
    oram.rotation.x = -Math.PI / 2;
    oram.position.y = 0.062;
    bosh.add(soya(oram));

    const oram2 = new THREE.Mesh(new THREE.TorusGeometry(0.118, 0.034, 10, 24), naqsh);
    oram2.rotation.set(-Math.PI / 2, 0, 0.12);
    oram2.position.y = 0.108;
    bosh.add(soya(oram2));

    const ustTugun = new THREE.Mesh(new THREE.SphereGeometry(0.074, 12, 10), romolMat);
    ustTugun.scale.set(1.30, 0.82, 1.05);
    ustTugun.position.set(0, 0.150, -0.010);
    bosh.add(soya(ustTugun));

    const tugunUchi = new THREE.Mesh(new THREE.ConeGeometry(0.030, 0.085, 8), romolMat);
    tugunUchi.rotation.set(0, 0, -0.5);
    tugunUchi.position.set(0.065, 0.165, 0);
    bosh.add(soya(tugunUchi));
  } else {
    /* Do‘ppi — qora asos, oq qalampir naqsh */
    const doppiMat = M.mato(0x1B3B6F);
    const doppi = new THREE.Mesh(new THREE.CylinderGeometry(0.122, 0.128, 0.075, 4), doppiMat);
    doppi.rotation.y = Math.PI / 4;
    doppi.position.y = 0.115;
    bosh.add(soya(doppi));

    const gumbaz = new THREE.Mesh(
      new THREE.SphereGeometry(0.122, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), doppiMat);
    gumbaz.scale.y = 0.5;
    gumbaz.position.y = 0.152;
    bosh.add(soya(gumbaz));

    // To‘rt qalampir naqshi
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
      const q = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.055, 6), M.oq());
      q.position.set(Math.cos(a) * 0.10, 0.125, Math.sin(a) * 0.10);
      q.rotation.set(0.35, -a, 0);
      bosh.add(q);
    }
    // Chetidagi oq jiyak
    const jiyak = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.008, 6, 20), M.oq());
    jiyak.rotation.x = -Math.PI / 2;
    jiyak.position.y = 0.082;
    bosh.add(jiyak);
  }

  /* --- Tizzadagi qo‘llar --- */
  for (const yon of [-1, 1]) {
    const yuqori = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.15, 6, 12), chopon);
    yuqori.rotation.set(0.18, 0, yon * 0.55);
    yuqori.position.set(yon * 0.225, 0.50, 0.02);
    g.add(soya(yuqori));

    const tirsak = new THREE.Mesh(new THREE.SphereGeometry(0.053, 10, 8), chopon);
    tirsak.position.set(yon * 0.30, 0.375, 0.05);
    g.add(soya(tirsak));

    const past = new THREE.Mesh(new THREE.CapsuleGeometry(0.044, 0.16, 6, 12), chopon);
    past.rotation.set(1.05, 0, yon * 0.20);
    past.position.set(yon * 0.30, 0.265, 0.115);
    g.add(soya(past));

    const panja = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), teri);
    panja.scale.set(1, 0.75, 1.15);
    panja.position.set(yon * 0.29, 0.175, 0.06);
    g.add(soya(panja));
  }
  return g;
}

/* =========================================================
   5) KAMON — yoy va o‘q («Alpomish»da Barchinning sharti:
   Alpomish bobosi Alpinbiyning yoyini tortadi)
   Qismlari: qo‘sh egilgan yog‘och gavda, ikki uchida shox
   uchliklar, tortilgan ip, dasta o‘rami, hamda o‘q — temir
   nayzasimon uchi, yog‘och sopi, uch parli patlar.
   ========================================================= */
export function kamonYasa() {
  const g = new THREE.Group();
  const ic = new THREE.Group();
  ic.position.set(0.31, 0.050, 0); // X bo‘yicha markaz, y=0 ga ko‘tarish
  g.add(ic);

  const yog = M.yogochTuq(), shox = M.yogochOch();
  const ip = new THREE.MeshStandardMaterial({ color: 0xEDE6D6, roughness: 0.9 });

  /* --- Yoyning egri gavdasi --- */
  const nuqtalar = [
    new THREE.Vector3(0.100, 0.030, 0),
    new THREE.Vector3(0.020, 0.145, 0),
    new THREE.Vector3(-0.055, 0.345, 0),
    new THREE.Vector3(-0.085, 0.600, 0),
    new THREE.Vector3(-0.055, 0.855, 0),
    new THREE.Vector3(0.020, 1.055, 0),
    new THREE.Vector3(0.100, 1.170, 0),
  ];
  const egri = new THREE.CatmullRomCurve3(nuqtalar);
  const gavda = new THREE.Mesh(new THREE.TubeGeometry(egri, 60, 0.028, 10, false), yog);
  ic.add(soya(gavda, true));

  /* --- Ikki uchdagi shox uchliklar va ip halqalari --- */
  for (const [uchNuq, yon] of [[nuqtalar[0], -1], [nuqtalar[6], 1]]) {
    const uch = new THREE.Mesh(new THREE.ConeGeometry(0.030, 0.075, 8), shox);
    uch.position.set(uchNuq.x + 0.012, uchNuq.y + yon * 0.028, 0);
    uch.rotation.z = yon > 0 ? -0.5 : Math.PI + 0.5;
    ic.add(soya(uch));

    const halqa = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.006, 6, 14), ip);
    halqa.position.set(uchNuq.x + 0.005, uchNuq.y, 0);
    halqa.rotation.y = Math.PI / 2;
    ic.add(halqa);
  }

  /* --- Tortilgan ip --- */
  const tor = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 1.145, 6), ip);
  tor.position.set(0.100, 0.600, 0);
  ic.add(soya(tor));

  /* --- Dasta: charm o‘ram va pay bog‘ichlar --- */
  const dasta = new THREE.Mesh(new THREE.CylinderGeometry(0.040, 0.040, 0.16, 10), M.charm());
  dasta.position.set(-0.085, 0.600, 0);
  ic.add(soya(dasta));
  for (let i = 0; i < 3; i++) {
    const o = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.010, 6, 14), M.mato(0xC1502E));
    o.rotation.x = -Math.PI / 2;
    o.position.set(-0.085, 0.545 + i * 0.055, 0);
    ic.add(o);
  }
  for (const y of [0.30, 0.90]) {
    const pay = new THREE.Mesh(new THREE.TorusGeometry(0.033, 0.008, 6, 14), ip);
    pay.rotation.x = -Math.PI / 2;
    pay.position.set(-0.048, y, 0);
    ic.add(pay);
  }

  /* --- O‘q: sop, temir uch, pat va kertik --- */
  const sop = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.72, 8), M.yogochOch());
  sop.rotation.z = Math.PI / 2;
  sop.position.set(-0.255, 0.600, 0);
  ic.add(soya(sop));

  const uchlik = new THREE.Mesh(new THREE.ConeGeometry(0.036, 0.135, 4), M.polat());
  uchlik.rotation.z = Math.PI / 2;
  uchlik.rotation.y = Math.PI / 4;
  uchlik.position.set(-0.682, 0.600, 0);
  ic.add(soya(uchlik));

  const uya = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.016, 0.05, 8), M.metall());
  uya.rotation.z = Math.PI / 2;
  uya.position.set(-0.600, 0.600, 0);
  ic.add(soya(uya));

  const kertik = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.045, 8), M.qora());
  kertik.rotation.z = Math.PI / 2;
  kertik.position.set(0.098, 0.600, 0);
  ic.add(soya(kertik));

  // Uch parli patlar
  for (let i = 0; i < 3; i++) {
    const pat = new THREE.Group();
    pat.position.set(0.030, 0.600, 0);
    pat.rotation.x = (i / 3) * Math.PI * 2;
    const parcha = new THREE.Mesh(new THREE.BoxGeometry(0.135, 0.052, 0.006),
      M.mato(i === 0 ? 0xFBF7F0 : 0xC1502E));
    parcha.position.y = 0.038;
    pat.add(soya(parcha));
    const bogich = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.02, 0.004), M.mato(0xD4A24C));
    bogich.position.set(0.062, 0.020, 0);
    pat.add(bogich);
    ic.add(pat);
  }
  return g;
}

/* =========================================================
   6) NAYZA — jangovar nayza (Alpomish va Qorajonning quroli)
   Qismlari: uzun yog‘och sop, romb shaklidagi temir tig‘,
   jez halqalar, rangli popuk va sopning temir tovoni.
   ========================================================= */
export function nayzaYasa() {
  const g = new THREE.Group();

  /* --- Sop --- */
  const sop = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.030, 0.88, 12), M.yogoch());
  sop.position.y = 0.46;
  g.add(soya(sop, true));

  // Sop tovoni (yerga tiraladigan temir uchlik)
  const tovon = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.09, 8), M.metall());
  tovon.rotation.x = Math.PI;
  tovon.position.y = 0.045;
  g.add(soya(tovon, true));

  // Charm qo‘l o‘rami
  for (let i = 0; i < 5; i++) {
    const o = new THREE.Mesh(new THREE.TorusGeometry(0.031, 0.010, 6, 14), M.charm());
    o.rotation.x = -Math.PI / 2;
    o.position.y = 0.34 + i * 0.045;
    g.add(o);
  }

  /* --- Jez halqalar (sop bilan tig‘ orasida) --- */
  for (const [y, r] of [[0.865, 0.036], [0.900, 0.034], [0.930, 0.031]]) {
    const h = new THREE.Mesh(new THREE.TorusGeometry(r, 0.011, 8, 18), M.jez());
    h.rotation.x = -Math.PI / 2;
    h.position.y = y;
    g.add(soya(h));
  }
  const boyinlik = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.034, 0.10, 10), M.jez());
  boyinlik.position.y = 0.905;
  g.add(soya(boyinlik));

  /* --- Rangli popuk --- */
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.005, 0.15, 6),
      M.mato(i % 2 ? 0xC1502E : 0x2F6B45));
    p.position.set(Math.cos(a) * 0.038, 0.795, Math.sin(a) * 0.038);
    p.rotation.set(Math.cos(a) * 0.18, 0, -Math.sin(a) * 0.18);
    g.add(soya(p));
  }
  const popukBogi = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.014, 8, 16), M.mato(0xD4A24C));
  popukBogi.rotation.x = -Math.PI / 2;
  popukBogi.position.y = 0.862;
  g.add(soya(popukBogi));

  /* --- Romb shaklidagi temir tig‘ --- */
  const tig = new THREE.Mesh(new THREE.OctahedronGeometry(0.078, 0), M.polat());
  tig.scale.set(1, 2.6, 0.34);
  tig.rotation.y = Math.PI / 4;
  tig.position.y = 1.16;
  g.add(soya(tig, true));

  // Tig‘ning o‘rta qirrasi
  const qirra = new THREE.Mesh(new THREE.BoxGeometry(0.020, 0.36, 0.020), M.metall());
  qirra.rotation.y = Math.PI / 4;
  qirra.position.y = 1.16;
  g.add(qirra);

  // Tig‘ning ninacha uchi
  const nina = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.075, 6), M.polat());
  nina.position.y = 1.39;
  g.add(soya(nina));
  return g;
}

/* =========================================================
   7) QALQON — «kark qubba qalqon» (Alpomish jabdug‘i)
   Qismlari: qavariq dumaloq gavda, markaziy qubba, halqa
   naqshlar, chekkadagi mixchalar, orqa taxta va tutqich.
   ========================================================= */
export function qalqonYasa() {
  const g = new THREE.Group();
  const q = new THREE.Group();
  const R = 0.60, chuq = 0.34;     // chuq — qavariqlik chuqurligi
  q.position.set(0, R + 0.035, -0.172);  // pastki nuqta y=0, Z bo‘yicha markaz
  g.add(q);

  const chuqurlik = (r) => chuq * Math.sqrt(Math.max(0, 1 - (r * r) / (R * R)));

  /* --- Qavariq gavda --- */
  const gavda = new THREE.Mesh(
    new THREE.SphereGeometry(R, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), M.charm());
  gavda.scale.set(1, chuq / R, 1);
  gavda.rotation.x = Math.PI / 2;
  q.add(soya(gavda, true));

  /* --- Orqa yog‘och taxta --- */
  const taxta = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.99, R * 0.99, 0.03, 40), M.yogochTuq());
  taxta.rotation.x = Math.PI / 2;
  taxta.position.z = -0.02;
  q.add(soya(taxta, true));

  /* --- Chekka gardish --- */
  const gardish = new THREE.Mesh(new THREE.TorusGeometry(R, 0.035, 10, 44), M.metall());
  q.add(soya(gardish));

  /* --- Markaziy qubba --- */
  const qubba = new THREE.Mesh(
    new THREE.SphereGeometry(0.155, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.polat());
  qubba.scale.set(1, 0.72, 1);
  qubba.rotation.x = Math.PI / 2;
  qubba.position.z = chuq - 0.02;
  q.add(soya(qubba));

  const qubbaGardish = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.018, 8, 24), M.oltin());
  qubbaGardish.position.z = chuq - 0.015;
  q.add(soya(qubbaGardish));

  const uchNuqta = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.075, 8), M.polat());
  uchNuqta.rotation.x = Math.PI / 2;
  uchNuqta.position.z = chuq + 0.075;
  q.add(soya(uchNuqta));

  /* --- Halqasimon naqsh chiziqlari --- */
  for (const r of [0.245, 0.355, 0.470]) {
    const h = new THREE.Mesh(new THREE.TorusGeometry(r, 0.013, 8, 40), M.oltin());
    h.position.z = chuqurlik(r) - 0.005;
    q.add(h);
  }

  /* --- Naqsh oralig‘idagi jez donachalar --- */
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const r = 0.305;
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 6), M.jez());
    d.position.set(Math.cos(a) * r, Math.sin(a) * r, chuqurlik(r) + 0.005);
    q.add(d);
  }

  /* --- Chekkadagi mixchalar --- */
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const r = 0.545;
    const mix = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 8), M.metall());
    mix.position.set(Math.cos(a) * r, Math.sin(a) * r, chuqurlik(r) + 0.012);
    q.add(soya(mix));
  }

  /* --- Orqa tutqich tasmasi --- */
  for (const y of [-0.16, 0.16]) {
    const tasma = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.055, 0.022), M.charm());
    tasma.position.set(0, y, -0.06);
    q.add(soya(tasma));
  }
  const tutqich = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.30, 10), M.yogoch());
  tutqich.position.set(0, 0, -0.085);
  q.add(soya(tutqich));
  for (const y of [-0.14, 0.14]) {
    const mixcha = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.05, 8), M.metall());
    mixcha.rotation.x = Math.PI / 2;
    mixcha.position.set(0, y, -0.055);
    q.add(mixcha);
  }
  return g;
}

/* =========================================================
   8) DUBULG‘A — jangchi bosh kiyimi (Alpomish jabdug‘i)
   Qismlari: konussimon temir qalpoq, uchidagi ninacha, jez
   gardish, yon yuz plastinkalari, burun himoyasi va orqa
   zanjir to‘r.
   ========================================================= */
export function dubulgaYasa() {
  const g = new THREE.Group();
  const asosY = 0.12;

  /* --- Qalpoq: ogival profil --- */
  const profil = [
    new THREE.Vector2(0.340, 0.00),
    new THREE.Vector2(0.352, 0.10),
    new THREE.Vector2(0.335, 0.24),
    new THREE.Vector2(0.285, 0.40),
    new THREE.Vector2(0.205, 0.56),
    new THREE.Vector2(0.110, 0.70),
    new THREE.Vector2(0.038, 0.785),
    new THREE.Vector2(0.000, 0.800),
  ];
  const qalpoq = new THREE.Mesh(new THREE.LatheGeometry(profil, 28), M.metall());
  qalpoq.position.y = asosY;
  g.add(soya(qalpoq, true));

  /* --- Qalpoqdagi tik qovurg‘alar --- */
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const nq = [];
    for (let j = 0; j < profil.length; j++) {
      const p = profil[j];
      nq.push(new THREE.Vector3(Math.cos(a) * p.x * 1.02, asosY + p.y, Math.sin(a) * p.x * 1.02));
    }
    const qov = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(nq), 16, 0.010, 6, false), M.jez());
    g.add(soya(qov));
  }

  /* --- Gardish halqasi --- */
  const gardish = new THREE.Mesh(new THREE.TorusGeometry(0.350, 0.036, 10, 32), M.jez());
  gardish.rotation.x = -Math.PI / 2;
  gardish.position.y = asosY + 0.035;
  g.add(soya(gardish, true));

  /* --- Bezak halqalari --- */
  for (const [y, r] of [[0.34, 0.305], [0.54, 0.215]]) {
    const h = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 26), M.oltin());
    h.rotation.x = -Math.PI / 2;
    h.position.y = asosY + y;
    g.add(h);
  }

  /* --- Uchidagi ninacha --- */
  const ninaSop = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.028, 0.17, 10), M.polat());
  ninaSop.position.y = asosY + 0.865;
  g.add(soya(ninaSop));
  const ninaUch = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.10, 8), M.polat());
  ninaUch.position.y = asosY + 1.00;
  g.add(soya(ninaUch));
  const ninaHalqa = new THREE.Mesh(new THREE.TorusGeometry(0.030, 0.010, 6, 14), M.oltin());
  ninaHalqa.rotation.x = -Math.PI / 2;
  ninaHalqa.position.y = asosY + 0.795;
  g.add(ninaHalqa);

  /* --- Yon yuz plastinkalari --- */
  for (const yon of [-1, 1]) {
    const plastin = new THREE.Mesh(new THREE.BoxGeometry(0.030, 0.19, 0.20), M.metall());
    plastin.position.set(yon * 0.335, 0.115, 0.02);
    plastin.rotation.z = yon * 0.10;
    g.add(soya(plastin, true));

    const bezak = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.010, 6, 16), M.oltin());
    bezak.position.set(yon * 0.352, 0.125, 0.02);
    bezak.rotation.y = Math.PI / 2;
    g.add(bezak);
  }

  /* --- Burun himoyasi --- */
  const burunlik = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.24, 0.024), M.metall());
  burunlik.position.set(0, 0.140, 0.335);
  burunlik.rotation.x = -0.10;
  g.add(soya(burunlik, true));
  const burunUch = new THREE.Mesh(new THREE.ConeGeometry(0.036, 0.06, 6), M.metall());
  burunUch.rotation.x = Math.PI;
  burunUch.position.set(0, 0.036, 0.330);
  g.add(soya(burunUch));

  /* --- Orqa zanjir to‘r --- */
  for (let qator = 0; qator < 4; qator++) {
    const y = 0.100 - qator * 0.025;
    for (let i = 0; i < 7; i++) {
      const a = Math.PI + 0.35 + (i / 6) * (Math.PI * 2 - 0.70 - Math.PI);
      const r = 0.348 + (qator % 2) * 0.006;
      const halqa = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), M.metall());
      halqa.scale.set(1, 0.85, 0.5);
      halqa.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
      halqa.lookAt(0, y, 0);
      g.add(halqa);
    }
  }
  return g;
}

/* =========================================================
   9) BELBOG‘ — kurash belbog‘i (Barchinning uchinchi sharti:
   kurash tushish; belbog‘ tutish milliy kurash asosidir)
   Qismlari: o‘ralgan uzun mato, ustidan eshilgan ip, naqsh
   halqalari va ikki uchidagi popuk-shokilalar.
   ========================================================= */
export function belbogYasa() {
  const g = new THREE.Group();
  const ic = new THREE.Group();
  ic.position.x = -0.085;          // X bo‘yicha markazlashtirish
  g.add(ic);

  const mato = M.mato(0x2F6B45);
  const matoTuq = M.mato(0x245236);
  const naqsh = M.mato(0xD4A24C);
  const popukMat = M.mato(0xC1502E);
  const buram = 2.6;               // o‘ram burilishlari soni

  /* --- O‘ramning asosiy spiral chizig‘i --- */
  const nq = [];
  for (let j = 0; j <= 64; j++) {
    const t = j / 64;
    const a = t * buram * Math.PI * 2;
    const r = 0.44 - t * 0.08;
    nq.push(new THREE.Vector3(Math.cos(a) * r, 0.058 + t * 0.085, Math.sin(a) * r));
  }
  const egri = new THREE.CatmullRomCurve3(nq);
  const oram = new THREE.Mesh(new THREE.TubeGeometry(egri, 140, 0.055, 12, false), mato);
  ic.add(soya(oram, true));

  /* --- Ustidan eshilgan ingichka ip (buramaning burama yo‘li) --- */
  const nq2 = [];
  for (let j = 0; j <= 110; j++) {
    const t = j / 110;
    const a = t * buram * Math.PI * 2;
    const f = t * 26 * Math.PI;
    const r = (0.44 - t * 0.08) + Math.cos(f) * 0.052;
    nq2.push(new THREE.Vector3(
      Math.cos(a) * r, 0.080 + t * 0.085 + Math.sin(f) * 0.050, Math.sin(a) * r));
  }
  const eshilgan = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(nq2), 200, 0.020, 8, false), matoTuq);
  ic.add(soya(eshilgan));

  /* --- Naqsh halqalari --- */
  for (let k = 0; k < 10; k++) {
    const t = 0.05 + k * 0.10;
    ic.add(egriHalqa(egri, t, 0.058, 0.010, k % 2 ? naqsh : popukMat));
  }

  /* --- Ikki uchdagi popuk-shokilalar --- */
  const uchlar = [
    { p: new THREE.Vector3(0.440, 0.058, 0.000), y: new THREE.Vector3(0.600, 0.050, 0.020) },
    { p: new THREE.Vector3(-0.291, 0.143, -0.212), y: new THREE.Vector3(-0.440, 0.060, -0.330) },
  ];
  for (const u of uchlar) {
    ic.add(soya(chiziq(u.p, u.y, 0.048, mato, 10), true));

    const tugun = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), naqsh);
    tugun.position.copy(u.y);
    ic.add(soya(tugun));

    // Yo‘nalishni davom ettirib, shokila ipchalarini yoyamiz
    const yon = new THREE.Vector3().subVectors(u.y, u.p).normalize();
    for (let k = 0; k < 6; k++) {
      const burch = (k - 2.5) * 0.16;
      const dx = yon.x * Math.cos(burch) - yon.z * Math.sin(burch);
      const dz = yon.x * Math.sin(burch) + yon.z * Math.cos(burch);
      const boshi = u.y.clone();
      const oxiri = new THREE.Vector3(
        boshi.x + dx * 0.135, Math.max(0.022, boshi.y - 0.020), boshi.z + dz * 0.135);
      ic.add(soya(chiziq(boshi, oxiri, 0.011, k % 2 ? popukMat : naqsh, 6)));

      const dona = new THREE.Mesh(new THREE.SphereGeometry(0.017, 8, 6), popukMat);
      dona.position.copy(oxiri);
      ic.add(dona);
    }
  }
  return g;
}

/* =========================================================
   10) TANGA — «ming qadamdan tangani urish» sharti
   Qismlari: yerga qadalgan qarag‘ay ustun, tepasidagi
   ko‘ndalang tayoq, ip va unga osilgan naqshli oltin tanga.
   ========================================================= */
export function tangaYasa() {
  const g = new THREE.Group();
  const ic = new THREE.Group();
  ic.position.x = -0.125;          // X bo‘yicha markazlashtirish
  g.add(ic);

  const yog = M.yogoch(), yogT = M.yogochTuq();
  const oltin = M.oltin();

  /* --- Qarag‘ay ustun --- */
  const ustun = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.046, 1.24, 12), yog);
  ustun.position.y = 0.62;
  ic.add(soya(ustun, true));

  const qalpoq = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.075, 10), yogT);
  qalpoq.position.y = 1.275;
  ic.add(soya(qalpoq));

  // Yog‘och tola halqalari
  for (const y of [0.28, 0.62, 0.96]) {
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.041, 0.008, 6, 16), yogT);
    h.rotation.x = -Math.PI / 2;
    h.position.y = y;
    ic.add(h);
  }

  /* --- Ustun tagidagi toshlar --- */
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const t = new THREE.Mesh(new THREE.SphereGeometry(0.072, 8, 6), i % 2 ? M.tosh() : M.toshTuq());
    t.scale.set(1.1, 0.62, 0.9);
    t.rotation.set((i % 2) * 0.06, a, ((i + 1) % 2) * 0.06);
    t.position.set(Math.cos(a) * 0.11, 0.058, Math.sin(a) * 0.11);
    ic.add(soya(t, true));
  }

  /* --- Ko‘ndalang tayoq va osma ip --- */
  const tayoq = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.020, 0.30, 10), yogT);
  tayoq.rotation.z = Math.PI / 2;
  tayoq.position.set(0.13, 1.19, 0);
  ic.add(soya(tayoq));

  const bogich = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.008, 6, 14), M.charm());
  bogich.rotation.y = Math.PI / 2;
  bogich.position.set(0.24, 1.185, 0);
  ic.add(bogich);

  const ip = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.17, 6), M.arqon());
  ip.position.set(0.24, 1.10, 0);
  ic.add(soya(ip));

  /* --- Oltin tanga --- */
  const tanga = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.022, 40), oltin);
  tanga.rotation.x = Math.PI / 2;
  tanga.position.set(0.24, 0.845, 0);
  ic.add(soya(tanga, true));

  // Tanganing gardishi
  const gardish = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.014, 8, 40), M.jez());
  gardish.position.set(0.24, 0.845, 0);
  ic.add(soya(gardish));

  // Yuzidagi naqsh halqalari va markaz
  for (const r of [0.075, 0.118]) {
    for (const z of [0.014, -0.014]) {
      const h = new THREE.Mesh(new THREE.TorusGeometry(r, 0.007, 6, 28), M.jez());
      h.position.set(0.24, 0.845, z);
      ic.add(h);
    }
  }
  for (const z of [0.018, -0.018]) {
    const markaz = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.008, 16), M.jez());
    markaz.rotation.x = Math.PI / 2;
    markaz.position.set(0.24, 0.845, z);
    ic.add(markaz);
  }

  // Chekkadagi tishchalar
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const tish = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6), oltin);
    tish.position.set(0.24 + Math.cos(a) * 0.152, 0.845 + Math.sin(a) * 0.152, 0);
    ic.add(tish);
  }

  // Osilish teshigi bo‘g‘imi
  const bogim = new THREE.Mesh(new THREE.TorusGeometry(0.020, 0.007, 6, 14), M.jez());
  bogim.position.set(0.24, 1.012, 0);
  ic.add(bogim);
  return g;
}

/* =========================================================
   11) UZUK — «Ravshan» dostonidagi uzuk (tanish-bilish
   belgisi, sadoqat ramzi)
   Qismlari: oltin halqa, ko‘tarilgan uya, ko‘k-firuza
   ko‘p qirrali tosh, mayda donacha bezaklar va yostiqcha.
   ========================================================= */
export function uzukYasa() {
  const g = new THREE.Group();
  const oltin = M.oltin();

  /* --- Yostiqcha --- */
  const yostiq = new THREE.Mesh(new THREE.SphereGeometry(0.50, 24, 16), M.mato(0xC1502E));
  yostiq.scale.set(1, 0.28, 0.80);
  yostiq.position.y = 0.14;
  g.add(soya(yostiq, true));

  const jiyak = new THREE.Mesh(new THREE.TorusGeometry(0.50, 0.016, 8, 40), M.mato(0xD4A24C));
  jiyak.rotation.x = -Math.PI / 2;
  jiyak.scale.set(1, 0.80, 1);
  jiyak.position.y = 0.14;
  g.add(jiyak);

  for (const x of [-0.46, 0.46]) {
    for (const z of [-0.35, 0.35]) {
      const popuk = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), M.mato(0xD4A24C));
      popuk.scale.y = 0.8;
      popuk.position.set(x, 0.055, z);
      g.add(soya(popuk));
    }
  }

  /* --- Oltin halqa --- */
  const halqa = new THREE.Mesh(new THREE.TorusGeometry(0.240, 0.050, 14, 40), oltin);
  halqa.rotation.y = 0.32;
  halqa.position.y = 0.500;
  g.add(soya(halqa, true));

  // Halqadagi o‘yma chiziqlar
  for (const yon of [-1, 1]) {
    const chiz = new THREE.Mesh(new THREE.TorusGeometry(0.240, 0.011, 6, 40), M.jez());
    chiz.rotation.y = 0.32;
    chiz.position.set(Math.sin(0.32) * yon * -0.035, 0.500, Math.cos(0.32) * yon * 0.035);
    g.add(chiz);
  }

  /* --- Ko‘tarilgan uya --- */
  const uya = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.058, 0.075, 12), oltin);
  uya.position.y = 0.786;
  g.add(soya(uya));

  const uyaGardish = new THREE.Mesh(new THREE.TorusGeometry(0.082, 0.014, 8, 20), oltin);
  uyaGardish.rotation.x = -Math.PI / 2;
  uyaGardish.position.y = 0.820;
  g.add(soya(uyaGardish));

  /* --- Ko‘k-firuza ko‘p qirrali tosh --- */
  const tosh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.095, 0), M.firuza());
  tosh.rotation.set(0.4, 0.6, 0.2);
  tosh.position.y = 0.885;
  g.add(soya(tosh));

  // Toshni ushlab turuvchi to‘rt tirnoq
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const tirnoq = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.075, 6), oltin);
    tirnoq.position.set(Math.cos(a) * 0.072, 0.858, Math.sin(a) * 0.072);
    tirnoq.rotation.set(-Math.sin(a) * 0.35, 0, Math.cos(a) * 0.35);
    g.add(tirnoq);
  }

  /* --- Uya atrofidagi mayda donacha bezaklar --- */
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const dona = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), M.jez());
    dona.position.set(Math.cos(a) * 0.088, 0.800, Math.sin(a) * 0.088);
    g.add(dona);
  }
  return g;
}

/* =========================================================
   12) QAMCHIN — otliq qamchisi (dostonlarda chavandozlik
   va yo‘lga otlanish belgisi)
   Qismlari: naqshli yog‘och dasta, charm o‘ram halqalari,
   eshilgan charm tasma va dasta oxiridagi osma halqa.
   ========================================================= */
export function qamchinYasa() {
  const g = new THREE.Group();
  const yog = M.yogoch(), yogT = M.yogochTuq();
  const charm = M.charm();
  const charmOch = new THREE.MeshStandardMaterial({ color: 0x8A6A44, roughness: 0.72 });

  /* --- Yog‘och dasta --- */
  const dasta = new THREE.Mesh(new THREE.CylinderGeometry(0.030, 0.036, 0.46, 12), yog);
  dasta.rotation.z = Math.PI / 2;
  dasta.position.set(-0.415, 0.036, 0);
  g.add(soya(dasta, true));

  // Dastadagi o‘yma naqsh halqalari
  for (let i = 0; i < 6; i++) {
    const x = -0.60 + i * 0.062;
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.034, 0.009, 6, 16), yogT);
    h.rotation.y = Math.PI / 2;
    h.position.set(x, 0.036, 0);
    g.add(h);
  }
  // Charm o‘ram (qo‘l tutadigan joy)
  for (let i = 0; i < 4; i++) {
    const o = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.013, 8, 18), charm);
    o.rotation.y = Math.PI / 2;
    o.position.set(-0.36 + i * 0.045, 0.036, 0);
    g.add(soya(o));
  }
  // Dasta boshidagi jez uchlik
  const uchlik = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.030, 0.05, 12), M.jez());
  uchlik.rotation.z = Math.PI / 2;
  uchlik.position.set(-0.625, 0.036, 0);
  g.add(soya(uchlik));

  // Dasta oxiridagi osma halqa va charm tasmasi
  const osma = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.009, 8, 20), M.metall());
  osma.rotation.y = Math.PI / 2;
  osma.position.set(-0.655, 0.052, 0);
  g.add(soya(osma));
  const tasmacha = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.010, 0.028), charm);
  tasmacha.position.set(-0.615, 0.062, 0);
  g.add(tasmacha);

  /* --- Eshilgan charm tasma (uchi tomon ingichkalashadi) --- */
  const bolaklar = [
    { p: [[-0.180, 0.038, 0.000], [-0.020, 0.072, 0.060], [0.100, 0.070, 0.100]], r: 0.023 },
    { p: [[0.100, 0.070, 0.100], [0.240, 0.055, 0.020], [0.360, 0.048, -0.080]], r: 0.017 },
    { p: [[0.360, 0.048, -0.080], [0.500, 0.038, -0.020], [0.615, 0.030, 0.030]], r: 0.011 },
  ];
  const barchaNuqta = [];
  for (const b of bolaklar) {
    const nuqta = b.p.map((v) => new THREE.Vector3(v[0], v[1], v[2]));
    for (const n of nuqta) barchaNuqta.push(n);
    const tasma = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(nuqta), 24, b.r, 8, false), charm);
    g.add(soya(tasma, true));
  }

  /* --- Eshik (o‘rim) izlari — tasma bo‘ylab halqalar --- */
  const tolaEgri = new THREE.CatmullRomCurve3(barchaNuqta);
  for (let k = 0; k < 9; k++) {
    const t = 0.06 + k * 0.10;
    const r = 0.026 - k * 0.0018;
    g.add(egriHalqa(tolaEgri, t, r, 0.006, k % 2 ? charmOch : yogT));
  }

  /* --- Tasmaning uchi --- */
  const uch = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.075, 8), charmOch);
  uch.position.set(0.648, 0.028, 0.040);
  uch.rotation.set(0, 0, -1.35);
  g.add(soya(uch));
  return g;
}

/* =========================================================
   Ro‘yxat — 6-modul sahnalari shu jadvaldan foydalanadi
   ========================================================= */
export const DOSTON = {
  baxshi:     { nom: 'Baxshi',           yasa: baxshiYasa,
                izoh: 'Dostonni yoddan aytuvchi xalq san’atkori — baxshi el xotirasini avloddan avlodga yetkazgan. Uning aytimi tarbiyaning jonli darsi bo‘lgan.' },
  otov:       { nom: 'O‘tov',            yasa: otovYasa,
                izoh: 'To‘y va yig‘inlar o‘tov atrofida o‘tgan; doston aytish kechalari ham shu maskanda boshlangan.' },
  gulxan:     { nom: 'Gulxan',           yasa: gulxanYasa,
                izoh: 'Gulxan atrofida uzun qish kechalari doston tinglangan — bu jamoaviy tarbiya davrasi hisoblanadi.' },
  tinglovchi: { nom: 'Tinglovchi',       yasa: () => tinglovchiYasa(0),
                izoh: 'Baxshi davrasidagi tinglovchi — doston orqali botirlik, sadoqat va vatanparvarlikni o‘rgangan.' },
  kamon:      { nom: 'Kamon va o‘q',     yasa: kamonYasa,
                izoh: '«Alpomish»da Barchinning sharti — Alpinbiyning og‘ir yoyini tortish; kamon kuch va chidam ramzi.' },
  nayza:      { nom: 'Nayza',            yasa: nayzaYasa,
                izoh: 'Dostonlardagi jang lavhalarining asosiy quroli; mardlik va himoyachilik timsoli.' },
  qalqon:     { nom: 'Qalqon',           yasa: qalqonYasa,
                izoh: '«Kark qubba qalqon» — Alpomish jabdug‘i; ona-yurtni to‘sib himoya qilish ramzi.' },
  dubulga:    { nom: 'Dubulg‘a',         yasa: dubulgaYasa,
                izoh: 'Jangchining bosh kiyimi; dostonlarda botirning safarga tayyorligini bildiradi.' },
  belbog:     { nom: 'Kurash belbog‘i',  yasa: belbogYasa,
                izoh: 'Barchin shartlaridan biri — kurash tushish; belbog‘ tutish milliy kurash odobining asosi.' },
  tanga:      { nom: 'Tanga (nishon)',   yasa: tangaYasa,
                izoh: '«Ming qadamdan tangani urish» sharti — mergonlik, sabr va aniq maqsad tarbiyasi.' },
  uzuk:       { nom: 'Uzuk',             yasa: uzukYasa,
                izoh: '«Ravshan» dostonidagi uzuk — tanish-bilish belgisi va sadoqat ramzi sifatida keladi.' },
  qamchin:    { nom: 'Qamchin',          yasa: qamchinYasa,
                izoh: 'Otliq qamchisi — chavandozlik, yo‘lga otlanish va shijoatning dostonlardagi belgisi.' },
};
