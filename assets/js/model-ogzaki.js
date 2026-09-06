/* =========================================================
   XALQ OG‘ZAKI IJODI — 3D modellar (5-modul)
   «Xalq pedagogikasi va o‘zbek xalq og‘zaki ijodi» moduli uchun:
   topishmoq javoblari (anor, tuxum, igna, sham, tarvuz, kalit),
   maqollarda tilga olingan buyumlar (qovun, qulf) hamda
   ertaklarda uchraydigan narsalar (yong‘oq, sehrli oyna).

   Har funksiya THREE.Group qaytaradi. Miqyos: eng katta o‘lchami
   1.0–1.5 birlik, pastki nuqtasi y=0, markazi (0,0,0).
   ========================================================= */
import * as THREE from '../vendor/three.module.min.js';

/* ---------- Umumiy materiallar ---------- */
const M = {
  yogoch:   () => new THREE.MeshStandardMaterial({ color: 0x8A6A44, roughness: 0.82 }),
  yogochOch:() => new THREE.MeshStandardMaterial({ color: 0xB08E64, roughness: 0.78 }),
  yogochTuq:() => new THREE.MeshStandardMaterial({ color: 0x6E5334, roughness: 0.85 }),
  qumtosh:  () => new THREE.MeshStandardMaterial({ color: 0xC9A87A, roughness: 0.80 }),
  sopol:    () => new THREE.MeshStandardMaterial({ color: 0xEDE6D6, roughness: 0.58 }),
  oq:       () => new THREE.MeshStandardMaterial({ color: 0xFBF7F0, roughness: 0.80 }),
  qizil:    () => new THREE.MeshStandardMaterial({ color: 0xC1502E, roughness: 0.52 }),
  kok:      () => new THREE.MeshStandardMaterial({ color: 0x1B3B6F, roughness: 0.45 }),
  yashil:   () => new THREE.MeshStandardMaterial({ color: 0x2F6B45, roughness: 0.70 }),
  oltin:    () => new THREE.MeshStandardMaterial({ color: 0xD4A24C, roughness: 0.45, metalness: 0.40 }),
  metall:   () => new THREE.MeshStandardMaterial({ color: 0x9AA2AC, roughness: 0.35, metalness: 0.80 }),
  kumush:   () => new THREE.MeshStandardMaterial({ color: 0xD8DEE6, roughness: 0.10, metalness: 0.95 }),
  mis:      () => new THREE.MeshStandardMaterial({ color: 0xB0703A, roughness: 0.42, metalness: 0.55 }),
  qora:     () => new THREE.MeshStandardMaterial({ color: 0x2B2118, roughness: 0.60 }),
};

function soya(m, qabul = false) {
  m.castShadow = true;
  if (qabul) m.receiveShadow = true;
  return m;
}

/* Guruhni miqyos shartnomasiga moslaydi: X va Z bo‘yicha aniq
   markazlashtiradi hamda eng past nuqtani y = 0 ga tushiradi. */
function markazlashtir(g) {
  const quti = new THREE.Box3().setFromObject(g);
  const markaz = new THREE.Vector3();
  quti.getCenter(markaz);
  for (const bola of g.children) {
    bola.position.x -= markaz.x;
    bola.position.z -= markaz.z;
    bola.position.y -= quti.min.y;
  }
  return g;
}

/* =========================================================
   1) ANOR — topishmoq javobi
   «Bir uyda ming qiz» — po‘sti ochilgan, ichida qizil donalari
   ko‘rinib turgan anor. Tepasida beshbarmoq toj (kalix), bandi.
   ========================================================= */
export function anorYasa() {
  const g = new THREE.Group();

  const poust = new THREE.MeshStandardMaterial({
    color: 0xC1502E, roughness: 0.50, side: THREE.DoubleSide
  });
  const poustTuq = new THREE.MeshStandardMaterial({ color: 0x9E3A22, roughness: 0.55 });
  const ichPardasi = new THREE.MeshStandardMaterial({
    color: 0xFBF7F0, roughness: 0.88, side: THREE.DoubleSide
  });
  const donaMat = new THREE.MeshStandardMaterial({ color: 0xA82036, roughness: 0.30 });

  const R = 0.48;          // anor radiusi
  const MARKAZ = R * 0.95; // pastki nuqta y=0 bo‘lishi uchun

  // Tana — bir tomoni ochilgan sfera (bo‘lak kesilgan)
  const tana = new THREE.Mesh(
    new THREE.SphereGeometry(R, 36, 24, 0.9, Math.PI * 2 - 1.8), poust);
  tana.scale.set(1, 0.95, 1);
  tana.position.y = MARKAZ;
  g.add(soya(tana, true));

  // Ochilgan joydagi oq ich pardasi
  const parda = new THREE.Mesh(
    new THREE.SphereGeometry(R - 0.045, 32, 22, 0.9, Math.PI * 2 - 1.8), ichPardasi);
  parda.scale.set(1, 0.95, 1);
  parda.position.y = MARKAZ;
  g.add(parda);

  // Ichidagi qip-qizil donalar (ming qiz)
  for (let i = 0; i < 18; i++) {
    const qator = Math.floor(i / 3);
    const ustun = i % 3;
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), donaMat);
    const z = (ustun - 1) * 0.105 + (qator % 2 ? 0.03 : -0.03);
    const y = 0.20 + qator * 0.098;
    const x = -0.15 - Math.abs(z) * 0.40;
    d.position.set(x, y, z);
    d.scale.set(1, 0.92, 1);
    g.add(soya(d));
  }

  // Po‘st chetidagi qalinlik (kesim qirrasi)
  for (const yon of [-1, 1]) {
    const qirra = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.72, 0.035), poustTuq);
    qirra.position.set(-0.10, MARKAZ, yon * 0.20);
    qirra.rotation.y = yon * 0.75;
    g.add(soya(qirra));
  }

  // Tepadagi toj asosi
  const tojBaza = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.115, 0.10, 14), poustTuq);
  tojBaza.position.y = MARKAZ * 2 - 0.02;
  g.add(soya(tojBaza));

  // Beshbarmoq toj (kalix) — tashqariga qayrilgan
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const barmoq = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.17, 6), poustTuq);
    barmoq.position.set(Math.cos(a) * 0.062, MARKAZ * 2 + 0.08, Math.sin(a) * 0.062);
    barmoq.rotation.set(Math.sin(a) * 0.42, 0, -Math.cos(a) * 0.42);
    g.add(soya(barmoq));
  }

  // Bandi
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, 0.17, 8), M.yogochTuq());
  band.position.set(0.03, MARKAZ * 2 + 0.10, -0.02);
  band.rotation.z = -0.18;
  g.add(soya(band));

  // Banddagi ikki bargcha
  for (const yon of [-1, 1]) {
    const barg = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8), M.yashil());
    barg.scale.set(1, 0.16, 0.45);
    barg.position.set(0.02 + yon * 0.075, MARKAZ * 2 + 0.16, yon * 0.045);
    barg.rotation.set(0, yon * 0.5, yon * 0.35);
    g.add(soya(barg));
  }
  return markazlashtir(g);
}

/* =========================================================
   2) TUXUM — topishmoq javobi
   «Oq uyning eshigi yo‘q» — somon uyachadagi tovuq tuxumi,
   ostida sopol likobcha, qobig‘ida mayda dog‘lar.
   ========================================================= */
export function tuxumYasa() {
  const g = new THREE.Group();

  // Sopol likobcha — Lathe profili
  const likobProfil = [
    new THREE.Vector2(0.00, 0.000),
    new THREE.Vector2(0.20, 0.005),
    new THREE.Vector2(0.38, 0.035),
    new THREE.Vector2(0.50, 0.090),
    new THREE.Vector2(0.55, 0.135),
    new THREE.Vector2(0.535, 0.140),
    new THREE.Vector2(0.46, 0.095),
    new THREE.Vector2(0.30, 0.050),
    new THREE.Vector2(0.00, 0.040),
  ];
  const likob = new THREE.Mesh(new THREE.LatheGeometry(likobProfil, 28), M.sopol());
  g.add(soya(likob, true));

  // Likobcha chetidagi ko‘k jiyak
  const jiyak = new THREE.Mesh(new THREE.TorusGeometry(0.545, 0.010, 6, 30), M.kok());
  jiyak.rotation.x = -Math.PI / 2;
  jiyak.position.y = 0.138;
  g.add(jiyak);

  // Somon uyacha — halqa bo‘ylab yotqizilgan somon parchalari
  const somon = new THREE.MeshStandardMaterial({ color: 0xC9A87A, roughness: 0.92 });
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.30, 6), somon);
    s.position.set(Math.cos(a) * 0.335, 0.075 + (i % 3) * 0.018, Math.sin(a) * 0.335);
    s.rotation.set(Math.PI / 2, 0, 0);
    s.rotation.y = -a + (i % 2 ? 0.35 : -0.35);
    g.add(soya(s));
  }
  // Uyachani ushlab turgan ikki halqa
  for (const [r, y] of [[0.34, 0.055], [0.30, 0.115]]) {
    const h = new THREE.Mesh(new THREE.TorusGeometry(r, 0.024, 7, 26), somon);
    h.rotation.x = -Math.PI / 2;
    h.position.y = y;
    g.add(soya(h));
  }

  // Tuxum — Lathe bilan chizilgan haqiqiy tuxum profili
  const nuqtalar = [];
  for (let i = 0; i <= 26; i++) {
    const t = i / 26;                              // 0 — past, 1 — tepa
    const r = 0.30 * Math.sin(Math.PI * t) * (1 - 0.30 * (t - 0.5));
    nuqtalar.push(new THREE.Vector2(Math.max(r, 0.0008), t * 0.72));
  }
  const tuxum = new THREE.Mesh(new THREE.LatheGeometry(nuqtalar, 30),
    new THREE.MeshStandardMaterial({ color: 0xFBF7F0, roughness: 0.68 }));
  tuxum.position.y = 0.115;
  tuxum.rotation.z = 0.14;                          // uyachada sal qiyshaygan
  g.add(soya(tuxum, true));

  // Qobiqdagi yengil dog‘lar
  const dog = new THREE.MeshStandardMaterial({ color: 0xD9C39B, roughness: 0.85 });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 * 1.7;
    const t = 0.28 + (i % 4) * 0.14;
    const r = 0.30 * Math.sin(Math.PI * t) * (1 - 0.30 * (t - 0.5));
    const d = new THREE.Mesh(new THREE.CylinderGeometry(0.030, 0.030, 0.006, 8), dog);
    d.position.set(Math.cos(a) * r, 0.115 + t * 0.72, Math.sin(a) * r);
    d.rotation.set(Math.PI / 2, 0, -a);
    g.add(d);
  }
  return markazlashtir(g);
}

/* =========================================================
   3) IGNA VA IP — topishmoq javobi
   «Bir oyoqli, bir ko‘zli» — ko‘zidan qizil ip o‘tkazilgan
   igna, yonida ip g‘altagi.
   ========================================================= */
export function ignaYasa() {
  const g = new THREE.Group();

  const met = M.metall();
  const yaltiroq = new THREE.MeshStandardMaterial({ color: 0xD5DAE0, roughness: 0.18, metalness: 0.92 });
  const ipMat = new THREE.MeshStandardMaterial({ color: 0xC1502E, roughness: 0.88 });

  const Y = 0.048;   // igna o‘qi balandligi

  // Igna tanasi
  const tana = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.020, 0.68, 12), met);
  tana.rotation.z = -Math.PI / 2;
  tana.position.set(0.16, Y, 0);
  g.add(soya(tana));

  // O‘tkir uchi
  const uch = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.14, 12), yaltiroq);
  uch.rotation.z = -Math.PI / 2;
  uch.position.set(0.57, Y, 0);
  g.add(soya(uch));

  // Ignaning ko‘zi — teshikli halqa
  const koz = new THREE.Mesh(new THREE.TorusGeometry(0.030, 0.012, 8, 20), met);
  koz.position.set(-0.21, Y, 0);
  g.add(soya(koz));
  // Ko‘z atrofidagi yassilangan qism
  const yassi = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.052, 0.024), met);
  yassi.position.set(-0.16, Y, 0);
  g.add(soya(yassi));

  // Ko‘zdan o‘tgan qizil ip — egri chiziq
  const ipYol = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.13, Y, 0.02),
    new THREE.Vector3(-0.21, Y, 0.00),
    new THREE.Vector3(-0.27, 0.10, -0.04),
    new THREE.Vector3(-0.33, 0.19, 0.03),
    new THREE.Vector3(-0.42, 0.23, 0.06),
    new THREE.Vector3(-0.50, 0.24, 0.00),
  ]);
  const ip = new THREE.Mesh(new THREE.TubeGeometry(ipYol, 30, 0.011, 7, false), ipMat);
  g.add(soya(ip));

  // Ko‘zning ikkinchi tomonidan osilgan ip uchi
  const ipUchi = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.21, Y, -0.01),
    new THREE.Vector3(-0.25, 0.03, -0.10),
    new THREE.Vector3(-0.20, 0.012, -0.19),
    new THREE.Vector3(-0.10, 0.010, -0.22),
  ]);
  const ip2 = new THREE.Mesh(new THREE.TubeGeometry(ipUchi, 24, 0.010, 7, false), ipMat);
  g.add(soya(ip2));

  // Ip g‘altagi — yog‘och o‘zak
  const ozak = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.30, 16), M.yogochOch());
  ozak.position.set(-0.50, 0.15, 0);
  g.add(soya(ozak, true));

  // G‘altakning ikki yonbardog‘i
  for (const y of [0.012, 0.288]) {
    const yon = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.024, 20), M.yogoch());
    yon.position.set(-0.50, y, 0);
    g.add(soya(yon, true));
  }

  // G‘altakka o‘ralgan ip halqalari
  for (let i = 0; i < 8; i++) {
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.078, 0.014, 7, 24), ipMat);
    h.rotation.x = Math.PI / 2;
    h.position.set(-0.50, 0.045 + i * 0.030, 0);
    g.add(soya(h));
  }
  return markazlashtir(g);
}

/* =========================================================
   4) SHAM — topishmoq javobi
   «O‘zi eriydi, o‘zgaga yorug‘lik beradi» — sopol-mis shamdon,
   ustida yonayotgan sham, oqib tushgan mum tomchilari.
   ========================================================= */
export function shamYasa() {
  const g = new THREE.Group();
  const mis = M.mis();
  const mum = new THREE.MeshStandardMaterial({ color: 0xFBF7F0, roughness: 0.62 });
  const mumTomchi = new THREE.MeshStandardMaterial({ color: 0xEDE6D6, roughness: 0.55 });

  // Shamdon likobchasi — Lathe
  const profil = [
    new THREE.Vector2(0.00, 0.000),
    new THREE.Vector2(0.22, 0.008),
    new THREE.Vector2(0.32, 0.045),
    new THREE.Vector2(0.35, 0.090),
    new THREE.Vector2(0.335, 0.096),
    new THREE.Vector2(0.26, 0.055),
    new THREE.Vector2(0.14, 0.038),
    new THREE.Vector2(0.115, 0.075),
    new THREE.Vector2(0.10, 0.150),
    new THREE.Vector2(0.00, 0.150),
  ];
  const likob = new THREE.Mesh(new THREE.LatheGeometry(profil, 26), mis);
  g.add(soya(likob, true));

  // Shamdon dastagi — yon tomondagi halqa
  const dastak = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.020, 8, 20, Math.PI * 1.25), mis);
  dastak.position.set(0.36, 0.10, 0);
  dastak.rotation.set(Math.PI / 2, 0, -0.5);
  g.add(soya(dastak));

  // Sham — sal konussimon
  const sham = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.086, 0.66, 20), mum);
  sham.position.y = 0.150 + 0.33;
  g.add(soya(sham, true));

  // Shamning tepa yuzasi — o‘yilgan kosacha
  const kosa = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.070, 0.02, 20), mumTomchi);
  kosa.position.y = 0.150 + 0.66;
  g.add(kosa);

  // Oqib tushgan mum tomchilari
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.4;
    const uz = 0.09 + (i % 3) * 0.055;
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.019, uz, 8), mumTomchi);
    t.position.set(Math.cos(a) * 0.076, 0.150 + 0.66 - uz / 2 - 0.02, Math.sin(a) * 0.076);
    g.add(soya(t));
    // Tomchining dumaloq uchi
    const tUch = new THREE.Mesh(new THREE.SphereGeometry(0.019, 8, 6), mumTomchi);
    tUch.position.set(Math.cos(a) * 0.076, 0.150 + 0.66 - uz - 0.02, Math.sin(a) * 0.076);
    g.add(soya(tUch));
  }
  // Likobchaga tomgan mum ko‘lmagi
  const kolmak = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 8), mumTomchi);
  kolmak.scale.set(1, 0.16, 1);
  kolmak.position.y = 0.156;
  g.add(soya(kolmak, true));

  // Pilik
  const pilik = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.010, 0.07, 6), M.qora());
  pilik.position.y = 0.150 + 0.695;
  g.add(soya(pilik));

  // Olov — ikki qatlam
  const tashqi = new THREE.Mesh(new THREE.ConeGeometry(0.052, 0.20, 12),
    new THREE.MeshStandardMaterial({ color: 0xC1502E, emissive: 0xA13A16, roughness: 0.55, transparent: true, opacity: 0.85 }));
  tashqi.position.y = 0.150 + 0.83;
  g.add(tashqi);
  const ichki = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.12, 10),
    new THREE.MeshStandardMaterial({ color: 0xD4A24C, emissive: 0xC79A34, roughness: 0.4 }));
  ichki.position.y = 0.150 + 0.79;
  g.add(ichki);
  return markazlashtir(g);
}

/* =========================================================
   5) TARVUZ — topishmoq javobi
   «Tashi yashil, ichi qizil» — chiziqli yaxlit tarvuz va
   yonida kesilgan bir tilim (urug‘lari bilan).
   ========================================================= */
export function tarvuzYasa() {
  const g = new THREE.Group();

  const post = new THREE.MeshStandardMaterial({ color: 0x2F6B45, roughness: 0.55 });
  const postTuq = new THREE.MeshStandardMaterial({ color: 0x1E4A2F, roughness: 0.6 });
  const etOq = new THREE.MeshStandardMaterial({ color: 0xEDE6D6, roughness: 0.75, side: THREE.DoubleSide });
  const etQizil = new THREE.MeshStandardMaterial({ color: 0xC1502E, roughness: 0.60 });

  const XT = -0.26;    // yaxlit tarvuz markazi
  const R = 0.38;

  // Yaxlit tarvuz
  const tarvuz = new THREE.Mesh(new THREE.SphereGeometry(R, 32, 22), post);
  tarvuz.scale.set(1, 0.95, 1);
  tarvuz.position.set(XT, R * 0.95, 0);
  g.add(soya(tarvuz, true));

  // To‘q yashil vertikal chiziqlar (meridianlar)
  for (let i = 0; i < 9; i++) {
    const chiziq = new THREE.Mesh(
      new THREE.TorusGeometry(R * 0.955, 0.026, 6, 40, Math.PI), postTuq);
    chiziq.scale.set(1, 0.95, 1);
    chiziq.rotation.y = (i / 9) * Math.PI * 2;
    chiziq.position.set(XT, R * 0.95, 0);
    g.add(soya(chiziq));
  }

  // Tepadagi kindik va jingalak band
  const kindik = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.035, 10), postTuq);
  kindik.position.set(XT, R * 1.90 - 0.01, 0);
  g.add(soya(kindik));

  const spiral = [];
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    const a = t * Math.PI * 4.2;
    const rr = 0.02 + t * 0.085;
    spiral.push(new THREE.Vector3(XT + Math.cos(a) * rr, R * 1.90 + 0.02 + t * 0.16, Math.sin(a) * rr));
  }
  const band = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(spiral), 40, 0.011, 6, false), postTuq);
  g.add(soya(band));

  /* --- Kesilgan tilim (yarim disk, kesim yuzasi yuqoriga) --- */
  const XS = 0.44, QAL = 0.10;

  const et = new THREE.Mesh(
    new THREE.CylinderGeometry(0.255, 0.255, QAL, 26, 1, false, 0, Math.PI), etQizil);
  et.position.set(XS, QAL / 2, 0);
  g.add(soya(et, true));

  const oqPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.275, 0.275, QAL, 26, 1, true, 0, Math.PI), etOq);
  oqPost.position.set(XS, QAL / 2, 0);
  g.add(soya(oqPost));

  const yashilPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.295, 0.295, QAL * 1.02, 26, 1, true, 0, Math.PI), post);
  yashilPost.position.set(XS, QAL / 2, 0);
  g.add(soya(yashilPost));

  // Tilimning tekis kesim qirrasi (yassi tomoni)
  const qirra = new THREE.Mesh(new THREE.BoxGeometry(0.59, QAL, 0.014), etOq);
  qirra.position.set(XS, QAL / 2, -0.004);
  g.add(qirra);

  // Tilim ustidagi qora urug‘lar
  const urugMat = new THREE.MeshStandardMaterial({ color: 0x2B2118, roughness: 0.45 });
  for (let i = 0; i < 9; i++) {
    const a = 0.30 + (i % 5) * 0.60;
    const rr = i < 5 ? 0.20 : 0.115;
    const u = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 6), urugMat);
    u.scale.set(1, 0.30, 0.62);
    u.position.set(XS + Math.cos(a) * rr, QAL + 0.006, Math.sin(a) * rr);
    u.rotation.y = -a;
    g.add(soya(u));
  }
  return markazlashtir(g);
}

/* =========================================================
   6) QOVUN — «Qovunning yaxshisini quzg‘un yeydi» maqoli
   To‘r naqshli cho‘zinchoq o‘zbek qovuni, bandi va bargi.
   ========================================================= */
export function qovunYasa() {
  const g = new THREE.Group();

  const sariq = new THREE.MeshStandardMaterial({ color: 0xD4A24C, roughness: 0.62 });
  const tor = new THREE.MeshStandardMaterial({ color: 0xC9A87A, roughness: 0.90 });

  const CY = 0.35;          // markaz balandligi
  const RY = 0.34;          // vertikal radius
  const UZ = 1.62;          // uzunasiga cho‘zish

  const tana = new THREE.Mesh(new THREE.SphereGeometry(RY, 36, 24), sariq);
  tana.scale.set(UZ, 1, 0.98);
  tana.position.y = CY;
  g.add(soya(tana, true));

  const YARIM = RY * UZ;    // yarim uzunlik

  // Ko‘ndalang to‘r halqalari
  for (let i = 1; i <= 7; i++) {
    const t = -1 + (i / 8) * 2;
    const x = t * YARIM;
    const rr = RY * Math.sqrt(Math.max(0, 1 - t * t)) + 0.008;
    const h = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.013, 6, 28), tor);
    h.rotation.y = Math.PI / 2;
    h.position.set(x, CY, 0);
    g.add(soya(h));
  }

  // Uzunasiga ketgan burama to‘r chiziqlari
  for (let i = 0; i < 8; i++) {
    const a0 = (i / 8) * Math.PI * 2;
    const pts = [];
    for (let j = 0; j <= 16; j++) {
      const t = -0.985 + (j / 16) * 1.97;
      const rr = RY * Math.sqrt(Math.max(0, 1 - t * t)) + 0.008;
      const b = a0 + t * 0.55;
      pts.push(new THREE.Vector3(t * YARIM, CY + Math.sin(b) * rr, Math.cos(b) * rr * 0.98));
    }
    const ch = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.012, 6, false), tor);
    g.add(soya(ch));
  }

  // Bandi
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.030, 0.20, 8), M.yashil());
  band.position.set(YARIM + 0.05, CY + 0.09, 0);
  band.rotation.z = -1.05;
  g.add(soya(band));

  // Bargi
  const barg = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 10), M.yashil());
  barg.scale.set(1, 0.10, 0.68);
  barg.position.set(YARIM + 0.16, CY + 0.14, 0.06);
  barg.rotation.set(0, 0.35, -0.30);
  g.add(soya(barg));

  // Barg tomiri
  const tomir = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.26, 6),
    new THREE.MeshStandardMaterial({ color: 0x24523A, roughness: 0.8 }));
  tomir.position.copy(barg.position);
  tomir.position.y += 0.012;
  tomir.rotation.set(0, 0.35, Math.PI / 2 - 0.30);
  g.add(tomir);
  return markazlashtir(g);
}

/* =========================================================
   7) KALIT — topishmoq javobi
   «Kalitsiz qulf ochilmas» — qadimiy temir kalit, yonida
   kichik osma qulf.
   ========================================================= */
export function kalitYasa() {
  const g = new THREE.Group();
  const met = M.metall();
  const temir = new THREE.MeshStandardMaterial({ color: 0x7C848E, roughness: 0.5, metalness: 0.75 });

  const Y = 0.038;   // kalit yotgan balandlik

  // Yumaloq halqali boshi
  const halqa = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.036, 10, 26), temir);
  halqa.rotation.x = -Math.PI / 2;
  halqa.position.set(-0.44, Y, 0);
  g.add(soya(halqa, true));

  // Boshdagi naqsh — to‘rt yaproq
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const y = new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 8), M.oltin());
    y.scale.set(1, 0.5, 1);
    y.position.set(-0.44 + Math.cos(a) * 0.125, Y + 0.026, Math.sin(a) * 0.125);
    g.add(soya(y));
  }

  // Uzun sopi
  const sop = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.56, 12), temir);
  sop.rotation.z = -Math.PI / 2;
  sop.position.set(-0.03, Y, 0);
  g.add(soya(sop, true));

  // Sop ustidagi ikki bilaguzuk
  for (const x of [-0.27, 0.10]) {
    const b = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.013, 8, 18), met);
    b.rotation.y = Math.PI / 2;
    b.position.set(x, Y, 0);
    g.add(soya(b));
  }

  // Uchidagi tishlar
  const tishBaza = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.055, 0.045), temir);
  tishBaza.position.set(0.20, Y, 0);
  g.add(soya(tishBaza));
  for (const [x, h] of [[0.135, 0.11], [0.205, 0.16], [0.272, 0.09]]) {
    const tish = new THREE.Mesh(new THREE.BoxGeometry(0.048, h, 0.042), temir);
    tish.position.set(x, Y + h / 2 + 0.018, 0);
    g.add(soya(tish));
  }
  // Uchidagi yopqich
  const yopqich = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.045, 10), met);
  yopqich.rotation.z = Math.PI / 2;
  yopqich.position.set(0.315, Y, 0);
  g.add(soya(yopqich));

  /* --- Yonidagi kichik osma qulf --- */
  const QX = 0.58;
  const tana = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.095), temir);
  tana.position.set(QX, 0.13, 0);
  g.add(soya(tana, true));
  const yumaloq = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.095, 20), temir);
  yumaloq.rotation.x = Math.PI / 2;
  yumaloq.position.set(QX, 0.25, 0);
  g.add(soya(yumaloq));

  const ilgak = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.020, 8, 20, Math.PI), met);
  ilgak.position.set(QX, 0.32, 0);
  g.add(soya(ilgak));
  for (const x of [-0.075, 0.075]) {
    const oyoq = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.020, 0.10, 8), met);
    oyoq.position.set(QX + x, 0.28, 0);
    g.add(soya(oyoq));
  }

  // Kalit teshigi
  const teshik = new THREE.Mesh(new THREE.CylinderGeometry(0.030, 0.030, 0.03, 12), M.qora());
  teshik.rotation.x = Math.PI / 2;
  teshik.position.set(QX, 0.16, 0.055);
  g.add(teshik);
  const oyiq = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.06, 0.03), M.qora());
  oyiq.position.set(QX, 0.115, 0.055);
  g.add(oyiq);
  return markazlashtir(g);
}

/* =========================================================
   8) QULF — «Kalitsiz qulf ochilmas» maqoli
   Yoysimon ilgakli katta osma qulf: temir tana, kalit teshigi,
   mixchalar va naqshli qopqoq.
   ========================================================= */
export function qulfYasa() {
  const g = new THREE.Group();
  const temir = new THREE.MeshStandardMaterial({ color: 0x7C848E, roughness: 0.45, metalness: 0.78 });
  const met = M.metall();

  // Tana — to‘g‘ri qism va yumaloq tepa
  const tana = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.50, 0.22), temir);
  tana.position.y = 0.25;
  g.add(soya(tana, true));

  const yumaloq = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.22, 28), temir);
  yumaloq.rotation.x = Math.PI / 2;
  yumaloq.position.y = 0.50;
  g.add(soya(yumaloq));

  // Pastki tayanch taxtachasi
  const tayanch = new THREE.Mesh(new THREE.BoxGeometry(0.60, 0.06, 0.25), met);
  tayanch.position.y = 0.03;
  g.add(soya(tayanch, true));

  // Old va orqa qopqoqlar (bir oz bo‘rtgan)
  for (const z of [-0.118, 0.118]) {
    const qop = new THREE.Mesh(new THREE.CylinderGeometry(0.255, 0.255, 0.018, 28), met);
    qop.rotation.x = Math.PI / 2;
    qop.position.set(0, 0.50, z);
    g.add(soya(qop));
  }

  // Yoysimon ilgak
  const ilgak = new THREE.Mesh(new THREE.TorusGeometry(0.185, 0.048, 10, 26, Math.PI), met);
  ilgak.position.y = 0.84;
  g.add(soya(ilgak));
  for (const [x, h] of [[-0.185, 0.20], [0.185, 0.20]]) {
    const oyoq = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, h, 12), met);
    oyoq.position.set(x, 0.84 - h / 2, 0);
    g.add(soya(oyoq));
  }

  // Kalit teshigi — halqa, dumaloq va pastki o‘yiq
  const teshikHalqa = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.016, 8, 24), M.oltin());
  teshikHalqa.position.set(0, 0.40, 0.128);
  g.add(soya(teshikHalqa));
  const teshik = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.05, 16), M.qora());
  teshik.rotation.x = Math.PI / 2;
  teshik.position.set(0, 0.40, 0.115);
  g.add(teshik);
  const oyiq = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.13, 0.05), M.qora());
  oyiq.position.set(0, 0.315, 0.115);
  g.add(oyiq);

  // Mixchalar
  for (const [x, y] of [[-0.20, 0.14], [0.20, 0.14], [-0.20, 0.62], [0.20, 0.62], [0, 0.68]]) {
    const mix = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.035, 10), M.oltin());
    mix.rotation.x = Math.PI / 2;
    mix.position.set(x, y, 0.125);
    g.add(soya(mix));
  }

  // Tanadagi naqsh chizig‘i
  const naqsh = new THREE.Mesh(new THREE.TorusGeometry(0.215, 0.010, 6, 30), M.oltin());
  naqsh.position.set(0, 0.44, 0.126);
  g.add(naqsh);
  return markazlashtir(g);
}

/* =========================================================
   9) YONG‘OQ — ertaklarda («Yong‘oq po‘chog‘idagi saroy»)
   G‘adir-budur yaxlit yong‘oq va yonida chaqilgan yarmi,
   ichida burma mag‘iz.
   ========================================================= */
export function yongoqYasa() {
  const g = new THREE.Group();

  const pochoq = new THREE.MeshStandardMaterial({ color: 0x8A6A44, roughness: 0.95 });
  const pochoqIch = new THREE.MeshStandardMaterial({
    color: 0x6E5334, roughness: 0.95, side: THREE.DoubleSide
  });
  const magiz = new THREE.MeshStandardMaterial({ color: 0xC9A87A, roughness: 0.88 });

  // G‘adir-budur yuzani hosil qiluvchi yordamchi
  function budur(r, seg = 28, kuch = 0.055) {
    const geo = new THREE.SphereGeometry(r, seg, Math.round(seg * 0.7));
    const p = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const k = 1
        + kuch * Math.sin(v.x * 26) * Math.cos(v.y * 21)
        + kuch * 0.7 * Math.sin(v.z * 30 + 1.3)
        + kuch * 0.5 * Math.cos(v.y * 34);
      v.multiplyScalar(k);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    p.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }

  const XY = -0.32, R = 0.30;

  // Yaxlit yong‘oq — ikki yarim po‘choq
  for (const z of [-1, 1]) {
    const yarim = new THREE.Mesh(
      budur(R), pochoq);
    yarim.scale.set(0.95, 0.92, 0.50);
    yarim.position.set(XY, R * 0.92, z * 0.077);
    g.add(soya(yarim, true));
  }
  // Ikki po‘choq orasidagi chok chizig‘i
  const chok = new THREE.Mesh(new THREE.TorusGeometry(0.285, 0.020, 8, 30), M.yogochTuq());
  chok.scale.set(0.96, 0.93, 1);
  chok.position.set(XY, R * 0.92, 0);
  g.add(soya(chok));
  // Chok ustidagi qirra
  const qirra = new THREE.Mesh(new THREE.TorusGeometry(0.292, 0.008, 6, 30), M.yogoch());
  qirra.scale.set(0.96, 0.93, 1);
  qirra.position.set(XY, R * 0.92, 0);
  g.add(qirra);
  // Uchidagi o‘tkir burun
  const burun = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.10, 8), M.yogochTuq());
  burun.position.set(XY, R * 1.84 + 0.02, 0);
  g.add(soya(burun));

  /* --- Chaqilgan yarim po‘choq va mag‘iz --- */
  const XC = 0.36;

  const yarimPochoq = new THREE.Mesh(
    new THREE.SphereGeometry(0.30, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2), pochoqIch);
  yarimPochoq.scale.set(0.95, 0.92, 0.95);
  yarimPochoq.rotation.x = Math.PI;      // kosa kabi ochiq turadi
  yarimPochoq.position.set(XC, 0.276, 0);
  g.add(soya(yarimPochoq, true));

  // Po‘choqning tashqi qatlami
  const tashqi = new THREE.Mesh(budur(0.305, 24, 0.05), pochoq);
  tashqi.scale.set(0.95, 0.92, 0.95);
  tashqi.rotation.x = Math.PI;
  tashqi.position.set(XC, 0.276, 0);
  g.add(soya(tashqi, true));

  // Po‘choq og‘zidagi halqa
  const ogiz = new THREE.Mesh(new THREE.TorusGeometry(0.283, 0.016, 8, 28), M.yogoch());
  ogiz.rotation.x = -Math.PI / 2;
  ogiz.position.set(XC, 0.276, 0);
  g.add(soya(ogiz));

  // Ichidagi burma mag‘iz — to‘rt bo‘lak
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.115, 14, 10), magiz);
    b.scale.set(1, 0.72, 1);
    b.position.set(XC + Math.cos(a) * 0.115, 0.31, Math.sin(a) * 0.115);
    g.add(soya(b));
  }
  // Mag‘izning burmalari
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const burma = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.020, 7, 16), magiz);
    burma.rotation.set(Math.PI / 2, 0, a);
    burma.position.set(XC + Math.cos(a) * 0.115, 0.36, Math.sin(a) * 0.115);
    g.add(soya(burma));
  }
  // Mag‘iz o‘rtasidagi parda
  const parda = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.10, 0.012),
    new THREE.MeshStandardMaterial({ color: 0xB08E64, roughness: 0.9 }));
  parda.position.set(XC, 0.34, 0);
  g.add(parda);
  return markazlashtir(g);
}

/* =========================================================
   10) OYNA — ertaklardagi sehrli ko‘zgu
   Naqshli dastali dumaloq qo‘l ko‘zgusi: yog‘och ramka,
   silliq kumush yuza, chetida mayda donacha bezaklar.
   ========================================================= */
export function oynaYasa() {
  const g = new THREE.Group();

  const yog = M.yogochTuq();
  const yogO = M.yogochOch();

  const XM = -0.24;   // ko‘zgu markazi

  // Orqa taglik
  const tag = new THREE.Mesh(new THREE.CylinderGeometry(0.345, 0.345, 0.055, 40), yog);
  tag.position.set(XM, 0.0275, 0);
  g.add(soya(tag, true));

  // Ramka halqasi
  const ramka = new THREE.Mesh(new THREE.TorusGeometry(0.322, 0.048, 12, 44), yogO);
  ramka.rotation.x = -Math.PI / 2;
  ramka.position.set(XM, 0.055, 0);
  g.add(soya(ramka, true));

  // Ramkadagi ingichka oltin jiyak
  const jiyak = new THREE.Mesh(new THREE.TorusGeometry(0.288, 0.011, 8, 44), M.oltin());
  jiyak.rotation.x = -Math.PI / 2;
  jiyak.position.set(XM, 0.082, 0);
  g.add(jiyak);

  // Kumush ko‘zgu yuzasi
  const yuza = new THREE.Mesh(new THREE.CylinderGeometry(0.285, 0.285, 0.022, 44), M.kumush());
  yuza.position.set(XM, 0.078, 0);
  g.add(soya(yuza, true));

  // Chetdagi mayda donacha bezaklar
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 8), M.oltin());
    d.scale.set(1, 0.62, 1);
    d.position.set(XM + Math.cos(a) * 0.322, 0.098, Math.sin(a) * 0.322);
    g.add(soya(d));
  }

  // Ramkadagi to‘rt yirik naqsh nuqtasi
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const n = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 9), M.kok());
    n.scale.set(1, 0.45, 1);
    n.position.set(XM + Math.cos(a) * 0.322, 0.104, Math.sin(a) * 0.322);
    g.add(soya(n));
  }

  // Dasta — ramkaga ulanish bo‘g‘ini
  const bogin = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.055, 0.14, 14), yog);
  bogin.rotation.z = -Math.PI / 2;
  bogin.position.set(XM + 0.36, 0.048, 0);
  g.add(soya(bogin, true));

  // Dastaning o‘zi
  const dasta = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.056, 0.50, 16), yogO);
  dasta.rotation.z = -Math.PI / 2;
  dasta.position.set(XM + 0.60, 0.048, 0);
  g.add(soya(dasta, true));

  // Dastadagi bezak halqalari
  for (const dx of [0.42, 0.60, 0.78]) {
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.056, 0.012, 8, 20), M.oltin());
    h.rotation.y = Math.PI / 2;
    h.position.set(XM + dx, 0.048, 0);
    g.add(soya(h));
  }

  // Dasta uchidagi tugmacha
  const tugma = new THREE.Mesh(new THREE.SphereGeometry(0.068, 14, 10), yog);
  tugma.scale.set(0.85, 1, 1);
  tugma.position.set(XM + 0.87, 0.052, 0);
  g.add(soya(tugma, true));
  const uchTugma = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), M.oltin());
  uchTugma.position.set(XM + 0.925, 0.052, 0);
  g.add(soya(uchTugma));
  return markazlashtir(g);
}

/* =========================================================
   Ro‘yxat — sahnalar shu jadvaldan foydalanadi
   ========================================================= */
export const OGZAKI = {
  anor:    { nom: 'Anor',        janr: 'Topishmoq', yasa: anorYasa,
             izoh: '«Bir uyda ming qiz» topishmog‘ining javobi. Anor donalari xalq og‘zaki ijodida ahillik va ko‘p farzandlilik ramzi.' },
  tuxum:   { nom: 'Tuxum',       janr: 'Topishmoq', yasa: tuxumYasa,
             izoh: '«Oq uyning eshigi yo‘q» topishmog‘i tuxumni ta’riflaydi. Bolaning kuzatuvchanligini o‘stiradigan eng qadimiy topishmoqlardan.' },
  igna:    { nom: 'Igna va ip',  janr: 'Topishmoq', yasa: ignaYasa,
             izoh: '«Bir oyoqli, bir ko‘zli» — igna haqidagi topishmoq. Qizlarni hunarga, mehnatga o‘rgatishda ishlatilgan.' },
  sham:    { nom: 'Sham',        janr: 'Topishmoq', yasa: shamYasa,
             izoh: '«O‘zi eriydi, o‘zgaga yorug‘lik beradi» — sham topishmog‘i fidoyilik va ustoz mehnatining timsoli.' },
  tarvuz:  { nom: 'Tarvuz',      janr: 'Topishmoq', yasa: tarvuzYasa,
             izoh: '«Tashi yashil, ichi qizil» topishmog‘ining javobi. Bolalarga tashqi ko‘rinishga qarab hukm chiqarmaslik uqtiriladi.' },
  qovun:   { nom: 'Qovun',       janr: 'Maqol',     yasa: qovunYasa,
             izoh: '«Qovunning yaxshisini quzg‘un yeydi» maqolida tilga olinadi. Qovun o‘zbek dasturxonining va mehmondo‘stlikning ramzi.' },
  kalit:   { nom: 'Kalit',       janr: 'Topishmoq', yasa: kalitYasa,
             izoh: '«Kichkina bo‘yi bor, katta uyni ochar» topishmog‘i kalitni tasvirlaydi; bilim ham hayot eshigining kaliti sanaladi.' },
  qulf:    { nom: 'Qulf',        janr: 'Maqol',     yasa: qulfYasa,
             izoh: '«Kalitsiz qulf ochilmas» maqolida har muammoning o‘z yechimi borligi uqtiriladi.' },
  yongoq:  { nom: 'Yong‘oq',     janr: 'Ertak',     yasa: yongoqYasa,
             izoh: 'Ertaklarda yong‘oq po‘chog‘idan saroy chiqadi — kichik narsada katta mo‘jiza yashiringanini bildiradi.' },
  oyna:    { nom: 'Sehrli oyna', janr: 'Ertak',     yasa: oynaYasa,
             izoh: 'Xalq ertaklarida sehrli ko‘zgu haqiqatni ko‘rsatadi; inson o‘zini o‘zi baholashiga ishora qiladi.' },
};
