/* =========================================================================
   O‘ZBEK MILLIY CHOLG‘ULARI — 3D MODELLAR (Three.js primitivlari asosida)
   «Xalq pedagogikasi» darsligining 12-moduli uchun.

   Bu faylda tashqi model fayllari (.glb/.obj) ISHLATILMAGAN — har bir cholg‘u
   faqat Three.js geometriyalaridan quriladi: LatheGeometry (aylanish jismi —
   noksimon tanalar, kosalar), ExtrudeGeometry (yassi dek va trapetsiya quti),
   TorusGeometry (gardish, pardalar, halqachalar), Cylinder, Box, Sphere, Cone.

   Eksport qilinadigan funksiyalar:
     dutorYasa()  rubobYasa()  dombraYasa()  doiraYasa()  changYasa()  nayYasa()
   Har biri THREE.Group qaytaradi.

   MIQYOS SHARTI: har bir model o‘lchamli qilib qaytariladi —
     · eng uzun o‘lchami taxminan 1.0–1.4 birlik,
     · markazi X va Z bo‘yicha (0, ?, 0) da,
     · eng past nuqtasi y = 0 da.
   Buning uchun barcha qismlar ichki guruhga yig‘iladi, so‘ng `moslash()`
   ichki guruhni miqyoslab va siljitib, uni bo‘sh tashqi guruhga joylaydi.
   Shu sabab foydalanuvchi tashqi guruhda `model.scale.setScalar(k)` ni
   bemalol qo‘llay oladi — ichki moslash buzilmaydi.
   ========================================================================= */

import * as THREE from '../vendor/three.module.min.js';

/* ---------------------------- Ranglar palitrasi --------------------------- */
const RANG = {
  yogochTuq:   0x6E5334, // eng to‘q yog‘och — qovurg‘a choklari, xarrak
  yogochAsos:  0x8A6A44, // asosiy yog‘och — tana, gardish
  yogochOrta:  0xB08E64, // o‘rta ton — dasta, bo‘yin
  yogochOchiq: 0xC8A97E, // ochiq yog‘och — dek (qopqoq taxta)
  charmOchiq:  0xEADFC8, // tortilgan charm — doira va rubob membranasi
  charmTuq:    0xD8C49E, // charm soyasi, bog‘ichlar
  metallSariq: 0xC9B37E, // jez halqachalar, mixchalar
  metallTuq:   0x9A8A6A, // to‘q metall — o‘qchalar
  tor:         0xF3E6CE, // torlar
  ichKoya:     0x2A2118  // teshiklar va naycha ichi (qorong‘i)
};

/* ------------------------------ Materiallar ------------------------------- */
function mat(rang, gadir, metall, qoshimcha) {
  return new THREE.MeshStandardMaterial(
    Object.assign({ color: rang, roughness: gadir, metalness: metall }, qoshimcha || {})
  );
}
// Har bir cholg‘u uchun yangi materiallar to‘plami (modellar bir-biriga bog‘liq emas)
function materiallar() {
  return {
    yogochTuq:   mat(RANG.yogochTuq,   0.68, 0.04),
    yogoch:      mat(RANG.yogochAsos,  0.62, 0.04),
    yogochOrta:  mat(RANG.yogochOrta,  0.58, 0.04),
    dek:         mat(RANG.yogochOchiq, 0.52, 0.03),
    qovurga:     mat(RANG.yogochTuq,   0.55, 0.05, { side: THREE.DoubleSide }),
    qobiq:       mat(RANG.yogochAsos,  0.62, 0.04, { side: THREE.DoubleSide, flatShading: true }),
    charm:       mat(RANG.charmOchiq,  0.85, 0.00, { side: THREE.FrontSide, shadowSide: THREE.BackSide }),
    charmTuq:    mat(RANG.charmTuq,    0.88, 0.00),
    metall:      mat(RANG.metallSariq, 0.30, 0.85),
    metallTuq:   mat(RANG.metallTuq,   0.38, 0.75),
    tor:         mat(RANG.tor,         0.35, 0.55),
    koya:        mat(RANG.ichKoya,     0.95, 0.02, { side: THREE.DoubleSide })
  };
}

/* --------------------------- Yordamchi vositalar -------------------------- */

// Ikki nuqta orasiga ingichka silindr (tor, o‘qcha, tayanch) tortadi.
function torTort(a, b, qalinlik, material, bolak) {
  const yonalish = new THREE.Vector3().subVectors(b, a);
  const uzunlik = yonalish.length() || 0.001;
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(qalinlik, qalinlik, uzunlik, bolak || 6, 1),
    material
  );
  mesh.position.copy(a).addScaledVector(yonalish, 0.5);
  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    yonalish.clone().normalize()
  );
  return mesh;
}

// Aylanish profilidan (Vector2 ro‘yxati) yassi «nok» konturini yasaydi —
// dutor/do‘mbra dekining chetki chizig‘i shu konturdan olinadi.
function nokShakl(profil) {
  const shakl = new THREE.Shape();
  shakl.moveTo(0, profil[0].y);
  for (let i = 1; i < profil.length; i++) shakl.lineTo(profil[i].x, profil[i].y);
  for (let i = profil.length - 1; i >= 1; i--) shakl.lineTo(-profil[i].x, profil[i].y);
  shakl.closePath();
  return shakl;
}

// Tana orqasidagi yog‘och qovurg‘a choklari: profilning ustidan o‘tuvchi
// juda tor Lathe bo‘laklari — bir necha taxta yopishtirilgandek ko‘rinadi.
function qovurgaChoklari(profil, soni, material, kengayish) {
  const guruh = new THREE.Group();
  const tashqi = profil.map(p => new THREE.Vector2(p.x * (kengayish || 1.02), p.y));
  for (let i = 0; i <= soni; i++) {
    const burchak = Math.PI / 2 + (i / soni) * Math.PI;
    // 2 segment yetarli: yoy uzunligi bor-yo‘g‘i 0.032 rad — bu tor chok chizig‘i
    guruh.add(new THREE.Mesh(
      new THREE.LatheGeometry(tashqi, 2, burchak - 0.016, 0.032),
      material
    ));
  }
  return guruh;
}

// Dasta atrofidagi ip pardalar (Torus halqalar).
function pardalar(soni, past, baland, rPast, rBaland, material, z) {
  const guruh = new THREE.Group();
  for (let i = 0; i < soni; i++) {
    const t = i / (soni - 1);
    const y = past + (baland - past) * t;
    const r = rPast + (rBaland - rPast) * t;
    const halqa = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.0038, 8, 14),
      material
    );
    halqa.rotation.x = Math.PI / 2;
    halqa.position.set(0, y, z || 0);
    guruh.add(halqa);
  }
  return guruh;
}

// Quloq (burama) — o‘qcha va uning tashqi tugmasi.
function quloqYasa(uzunlik, material, materialTugma, chapga) {
  const guruh = new THREE.Group();
  const oq = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, uzunlik, 8),
    material
  );
  oq.rotation.z = Math.PI / 2;
  guruh.add(oq);
  const yon = chapga ? -1 : 1;
  const tugma = new THREE.Mesh(
    new THREE.ConeGeometry(0.021, 0.055, 8),
    materialTugma
  );
  tugma.rotation.z = yon * Math.PI / 2;
  tugma.position.x = yon * (uzunlik / 2 + 0.026);
  guruh.add(tugma);
  return guruh;
}

// Barcha meshlarga soya tashlashni yoqadi.
function soyaBer(guruh) {
  guruh.traverse(function (n) {
    if (n.isMesh) n.castShadow = true;
  });
}

/* Ichki guruhni 1 birlik atrofida miqyoslab, X/Z bo‘yicha markazlab,
   pastki nuqtasini y = 0 ga qo‘yadi va bo‘sh tashqi guruhda qaytaradi. */
function moslash(ichki, olcham) {
  soyaBer(ichki);
  const tashqi = new THREE.Group();
  tashqi.add(ichki);

  const quti = new THREE.Box3().setFromObject(ichki);
  const hajm = quti.getSize(new THREE.Vector3());
  const eng = Math.max(hajm.x, hajm.y, hajm.z) || 1;
  ichki.scale.setScalar(olcham / eng);
  ichki.updateMatrixWorld(true);

  const quti2 = new THREE.Box3().setFromObject(ichki);
  const markaz = quti2.getCenter(new THREE.Vector3());
  ichki.position.set(-markaz.x, -quti2.min.y, -markaz.z);
  tashqi.updateMatrixWorld(true);
  return tashqi;
}

/* =========================================================================
   1. DUTOR
   Qismlari:
     · noksimon tana orqasi — yarim LatheGeometry (aylanish profili, z < 0);
     · 9 ta qovurg‘a choki — profil ustidagi tor Lathe bo‘laklari;
     · old dek — profil konturidan ExtrudeGeometry bilan yasalgan yassi taxta;
     · dekda 3 ta rezonans teshigi va yog‘och xarrak;
     · uzun ingichka dasta (konussimon silindr) + 9 ta ip parda (Torus);
     · orqaga egilgan bosh, unda IKKITA quloq (burama);
     · IKKITA tor — xarrakdan bosh uchigacha tortilgan.
   ========================================================================= */
export function dutorYasa() {
  const m = materiallar();
  const ichki = new THREE.Group();

  // --- tana profili (y: 0 dumidan 0.445 bo‘yin ildizigacha) ---
  const profil = [
    new THREE.Vector2(0.004, 0.000),
    new THREE.Vector2(0.052, 0.014),
    new THREE.Vector2(0.098, 0.044),
    new THREE.Vector2(0.132, 0.090),
    new THREE.Vector2(0.153, 0.146),
    new THREE.Vector2(0.158, 0.206),
    new THREE.Vector2(0.150, 0.266),
    new THREE.Vector2(0.128, 0.324),
    new THREE.Vector2(0.098, 0.376),
    new THREE.Vector2(0.068, 0.416),
    new THREE.Vector2(0.046, 0.445)
  ];

  // orqa qobiq: faqat z <= 0 yarmi (phiStart = PI/2, phiLength = PI)
  const orqa = new THREE.Mesh(
    new THREE.LatheGeometry(profil, 14, Math.PI / 2, Math.PI),
    m.qobiq
  );
  ichki.add(orqa);
  ichki.add(qovurgaChoklari(profil, 9, m.qovurga, 1.018));

  // old dek — yassi taxta
  const dek = new THREE.Mesh(
    new THREE.ExtrudeGeometry(nokShakl(profil), { depth: 0.014, bevelEnabled: false, curveSegments: 4 }),
    m.dek
  );
  dek.position.z = -0.007;
  dek.receiveShadow = true;
  ichki.add(dek);

  // rezonans teshiklari
  [[0, 0.318], [-0.052, 0.286], [0.052, 0.286]].forEach(function (p) {
    const teshik = new THREE.Mesh(
      new THREE.CylinderGeometry(0.013, 0.013, 0.016, 10),
      m.koya
    );
    teshik.rotation.x = Math.PI / 2;
    teshik.position.set(p[0], p[1], 0.004);
    ichki.add(teshik);
  });

  // xarrak (torlarni ko‘taruvchi taxtacha)
  const xarrak = new THREE.Mesh(new THREE.BoxGeometry(0.072, 0.014, 0.022), m.yogochTuq);
  xarrak.position.set(0, 0.140, 0.014);
  ichki.add(xarrak);

  // --- dasta ---
  const dasta = new THREE.Mesh(
    new THREE.CylinderGeometry(0.021, 0.031, 0.700, 12),
    m.yogochOrta
  );
  dasta.position.set(0, 0.790, 0.004);
  ichki.add(dasta);
  ichki.add(pardalar(9, 0.500, 1.020, 0.031, 0.023, m.charmTuq, 0.004));

  // --- bosh: orqaga 0.26 rad egilgan ---
  const boshOrin = new THREE.Vector3(0, 1.125, 0.004);
  const boshBurchak = new THREE.Euler(-0.26, 0, 0);
  const bosh = new THREE.Group();
  bosh.position.copy(boshOrin);
  bosh.rotation.copy(boshBurchak);

  const kalla = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.023, 0.165, 10), m.yogochTuq);
  kalla.position.y = 0.082;
  bosh.add(kalla);
  const uchi = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 8), m.yogochTuq);
  uchi.position.y = 0.164;
  bosh.add(uchi);

  const quloq1 = quloqYasa(0.062, m.yogochTuq, m.yogochOrta, false);
  quloq1.position.set(0, 0.058, 0);
  bosh.add(quloq1);
  const quloq2 = quloqYasa(0.062, m.yogochTuq, m.yogochOrta, true);
  quloq2.position.set(0, 0.118, 0);
  bosh.add(quloq2);
  ichki.add(bosh);

  // --- ikki tor ---
  [-0.010, 0.010].forEach(function (x) {
    const uch = new THREE.Vector3(x, 0.132, 0.012).applyEuler(boshBurchak).add(boshOrin);
    ichki.add(torTort(new THREE.Vector3(x, 0.150, 0.024), uch, 0.0026, m.tor, 8));
  });

  return moslash(ichki, 1.30);
}

/* =========================================================================
   3. DO‘MBRA (baxshilar cholg‘usi)
   Dutorga o‘xshaydi, lekin: tanasi KENGROQ va YASSIROQ (orqa qobiq z bo‘yicha
   siqilgan), dastasi KALTAROQ va yo‘g‘onroq, boshi deyarli tik.
   Qismlari:
     · yassilangan noksimon orqa qobiq (yarim Lathe, scale.z = 0.58);
     · 11 ta qovurg‘a choki;
     · keng yassi dek (Extrude) + bitta katta rezonans teshigi + xarrak;
     · kalta dasta + 7 ta ip parda;
     · kichik bosh, ikkita quloq va IKKI tor.
   ========================================================================= */
export function dombraYasa() {
  const m = materiallar();
  const ichki = new THREE.Group();

  const profil = [
    new THREE.Vector2(0.004, 0.000),
    new THREE.Vector2(0.070, 0.016),
    new THREE.Vector2(0.126, 0.052),
    new THREE.Vector2(0.170, 0.104),
    new THREE.Vector2(0.194, 0.168),
    new THREE.Vector2(0.200, 0.238),
    new THREE.Vector2(0.190, 0.308),
    new THREE.Vector2(0.160, 0.374),
    new THREE.Vector2(0.118, 0.430),
    new THREE.Vector2(0.078, 0.474),
    new THREE.Vector2(0.052, 0.505)
  ];

  const orqa = new THREE.Mesh(
    new THREE.LatheGeometry(profil, 16, Math.PI / 2, Math.PI),
    m.qobiq
  );
  orqa.scale.z = 0.58; // do‘mbra tanasi dutornikidan yassiroq
  ichki.add(orqa);
  const choklar = qovurgaChoklari(profil, 11, m.qovurga, 1.016);
  choklar.scale.z = 0.58;
  ichki.add(choklar);

  const dek = new THREE.Mesh(
    new THREE.ExtrudeGeometry(nokShakl(profil), { depth: 0.014, bevelEnabled: false, curveSegments: 4 }),
    m.dek
  );
  dek.position.z = -0.007;
  dek.receiveShadow = true;
  ichki.add(dek);

  const teshik = new THREE.Mesh(new THREE.CylinderGeometry(0.030, 0.030, 0.018, 14), m.koya);
  teshik.rotation.x = Math.PI / 2;
  teshik.position.set(0, 0.330, 0.004);
  ichki.add(teshik);

  const xarrak = new THREE.Mesh(new THREE.BoxGeometry(0.086, 0.016, 0.024), m.yogochTuq);
  xarrak.position.set(0, 0.150, 0.015);
  ichki.add(xarrak);

  // kalta va yo‘g‘onroq dasta
  const dasta = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.038, 0.470, 12), m.yogochOrta);
  dasta.position.set(0, 0.735, 0.004);
  ichki.add(dasta);
  ichki.add(pardalar(7, 0.560, 0.930, 0.038, 0.028, m.charmTuq, 0.004));

  const boshOrin = new THREE.Vector3(0, 0.968, 0.004);
  const boshBurchak = new THREE.Euler(-0.14, 0, 0);
  const bosh = new THREE.Group();
  bosh.position.copy(boshOrin);
  bosh.rotation.copy(boshBurchak);

  const kalla = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.150, 0.040), m.yogochTuq);
  kalla.position.y = 0.075;
  bosh.add(kalla);
  const tepa = new THREE.Mesh(new THREE.ConeGeometry(0.030, 0.052, 8), m.yogochTuq);
  tepa.position.y = 0.174;
  bosh.add(tepa);

  const q1 = quloqYasa(0.058, m.yogochTuq, m.yogochOrta, false);
  q1.position.set(0, 0.052, 0);
  bosh.add(q1);
  const q2 = quloqYasa(0.058, m.yogochTuq, m.yogochOrta, true);
  q2.position.set(0, 0.112, 0);
  bosh.add(q2);
  ichki.add(bosh);

  [-0.012, 0.012].forEach(function (x) {
    const uch = new THREE.Vector3(x, 0.126, 0.024).applyEuler(boshBurchak).add(boshOrin);
    ichki.add(torTort(new THREE.Vector3(x, 0.160, 0.027), uch, 0.0030, m.tor, 8));
  });

  return moslash(ichki, 1.22);
}

/* =========================================================================
   2. RUBOB
   Qismlari:
     · kichik yumaloq KOSA tana — Lathe profili X o‘qi atrofida ag‘darilgan,
       tanasining o‘qi Z bo‘ylab yotadi;
     · tananing OLD tomoni CHARM bilan qoplangan — sayoz sfera qopqog‘i
       (SphereGeometry ning kichik thetaLength bo‘lagi);
     · tananing ikki yonida rubobga xos EGRI SHOXLAR (Torus yoylari);
     · kalta dasta + old tomonida yassi grif taxtasi + 5 ta parda halqasi;
     · bo‘yin uchida kuchli (0.72 rad) ORQAGA EGILGAN bosh, 3 ta quloq;
     · 3 ta asosiy tor (xarrakdan boshgacha) + dastaning yon tomonida
       4 ta qo‘shimcha rezonans tori va ularning kichik o‘qchalari.
   ========================================================================= */
export function rubobYasa() {
  const m = materiallar();
  const ichki = new THREE.Group();
  const tanaY = 0.225;

  // --- kosa tana ---
  const kosaProfil = [
    new THREE.Vector2(0.004, 0.000),
    new THREE.Vector2(0.085, 0.014),
    new THREE.Vector2(0.142, 0.044),
    new THREE.Vector2(0.180, 0.084),
    new THREE.Vector2(0.202, 0.128),
    new THREE.Vector2(0.210, 0.175)
  ];
  const kosa = new THREE.Mesh(new THREE.LatheGeometry(kosaProfil, 18), m.qobiq);
  kosa.rotation.x = Math.PI / 2;          // o‘q +Y dan +Z ga buriladi
  kosa.position.set(0, tanaY, -0.156);    // og‘zi z ≈ 0.02 da
  ichki.add(kosa);

  // --- charm membrana (sayoz sfera qopqog‘i) ---
  const charm = new THREE.Mesh(
    new THREE.SphereGeometry(0.62, 20, 8, 0, Math.PI * 2, 0, 0.345),
    m.charm
  );
  charm.rotation.x = Math.PI / 2;
  charm.position.set(0, tanaY, -0.565);
  charm.receiveShadow = true;
  ichki.add(charm);

  // charm chetini bekituvchi halqa
  const gardish = new THREE.Mesh(new THREE.TorusGeometry(0.208, 0.013, 8, 20), m.yogochTuq);
  gardish.position.set(0, tanaY, 0.018);
  ichki.add(gardish);

  // --- ikki yon shox ---
  function shoxYasa() {
    const g = new THREE.Group();
    const yoy = new THREE.Mesh(
      new THREE.TorusGeometry(0.072, 0.019, 8, 12, Math.PI * 0.95),
      m.yogochTuq
    );
    yoy.rotation.z = 0.30;
    g.add(yoy);
    return g;
  }
  const shoxO = shoxYasa();
  shoxO.position.set(0.128, tanaY + 0.088, 0.004);
  ichki.add(shoxO);
  const shoxC = shoxYasa();
  shoxC.position.set(-0.128, tanaY + 0.088, 0.004);
  shoxC.rotation.y = Math.PI; // to‘g‘ri aylantirish orqali ko‘zgu aks
  ichki.add(shoxC);

  // --- kalta dasta ---
  const dasta = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.032, 0.520, 12), m.yogochOrta);
  dasta.position.set(0, 0.610, 0.010);
  ichki.add(dasta);
  const grif = new THREE.Mesh(new THREE.BoxGeometry(0.056, 0.500, 0.014), m.yogochTuq);
  grif.position.set(0, 0.615, 0.032);
  ichki.add(grif);
  ichki.add(pardalar(6, 0.450, 0.800, 0.031, 0.026, m.charmTuq, 0.010));

  // --- egilgan bosh ---
  const boshOrin = new THREE.Vector3(0, 0.868, 0.012);
  const boshBurchak = new THREE.Euler(-0.72, 0, 0);
  const bosh = new THREE.Group();
  bosh.position.copy(boshOrin);
  bosh.rotation.copy(boshBurchak);

  const kalla = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.185, 0.040), m.yogochTuq);
  kalla.position.y = 0.093;
  bosh.add(kalla);
  const jingalak = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.011, 8, 14), m.yogochTuq);
  jingalak.rotation.y = Math.PI / 2;
  jingalak.position.y = 0.205;
  bosh.add(jingalak);

  const qA = quloqYasa(0.052, m.yogochTuq, m.yogochOrta, false);
  qA.position.set(0, 0.052, 0);
  bosh.add(qA);
  const qB = quloqYasa(0.052, m.yogochTuq, m.yogochOrta, true);
  qB.position.set(0, 0.104, 0);
  bosh.add(qB);
  const qC = quloqYasa(0.052, m.yogochTuq, m.yogochOrta, false);
  qC.position.set(0, 0.156, 0);
  bosh.add(qC);
  ichki.add(bosh);

  // --- xarrak charm ustida ---
  const xarrak = new THREE.Mesh(new THREE.BoxGeometry(0.070, 0.016, 0.020), m.yogochTuq);
  xarrak.position.set(0, 0.128, 0.056);
  ichki.add(xarrak);

  // --- 3 ta asosiy tor ---
  [-0.014, 0, 0.014].forEach(function (x, i) {
    const uch = new THREE.Vector3(x, 0.050 + i * 0.052, 0.024).applyEuler(boshBurchak).add(boshOrin);
    ichki.add(torTort(new THREE.Vector3(x, 0.140, 0.064), uch, 0.0026, m.tor, 8));
  });

  // --- 4 ta rezonans tori va ularning o‘qchalari (dastaning chap yonida) ---
  for (let i = 0; i < 4; i++) {
    const y = 0.470 + i * 0.070;
    const oq = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.052, 8), m.yogochTuq);
    oq.rotation.z = Math.PI / 2;
    oq.position.set(-0.038, y, 0.010);
    ichki.add(oq);
    ichki.add(torTort(
      new THREE.Vector3(-0.056, y, 0.010),
      new THREE.Vector3(-0.040, 0.150, 0.052),
      0.0018, m.tor, 5
    ));
  }

  return moslash(ichki, 1.16);
}

/* =========================================================================
   4. DOIRA
   Qismlari:
     · keng yog‘och GARDISH (obruch) — ochiq silindr + ikki chetida
       TorusGeometry halqalari (yog‘och lentaning yumaloq qirralari);
     · old tomonga tortilgan CHARM — sayoz sfera qopqog‘i (tarang ko‘rinishi);
     · charm chetidagi mixchalar (kichik sferalar);
     · gardishning ICHKI tomonida 12 juft METALL HALQACHA — har biri
       Torus, o‘qi urinma yo‘nalishda, kichik metall o‘qchaga ilingan.
   Model tik holatda: yuzasi +Z ga qaragan, diametri ~1.15 birlik.
   ========================================================================= */
export function doiraYasa() {
  const m = materiallar();
  const ichki = new THREE.Group();
  const R = 0.500;      // gardish o‘rtacha radiusi
  const EN = 0.096;     // gardish eni (qalinligi, Z bo‘yicha)

  // gardish tanasi
  const obruch = new THREE.Mesh(
    new THREE.CylinderGeometry(R, R, EN, 24, 1, true),
    mat(RANG.yogochAsos, 0.62, 0.04, { side: THREE.DoubleSide, flatShading: true })
  );
  obruch.rotation.x = Math.PI / 2;
  ichki.add(obruch);

  // gardishning ikki qirrasi — Torus halqalar
  [-EN / 2, EN / 2].forEach(function (z) {
    const qirra = new THREE.Mesh(new THREE.TorusGeometry(R, 0.014, 8, 24), m.yogochTuq);
    qirra.position.z = z;
    ichki.add(qirra);
  });

  // tortilgan charm — old tomonda ozgina bo‘rtgan sayoz sfera qopqog‘i.
  // Katta sfera radiusi (KR) olinganda qopqoq deyarli tekis chiqadi —
  // aynan tarang tortilgan charmdek ko‘rinadi.
  const KR = 5.0;
  const KT = Math.asin((R - 0.012) / KR);
  const charm = new THREE.Mesh(
    new THREE.SphereGeometry(KR, 24, 8, 0, Math.PI * 2, 0, KT),
    m.charm
  );
  charm.rotation.x = Math.PI / 2;                        // qopqoq o‘qi +Z ga
  charm.position.z = EN / 2 - 0.006 - KR * Math.cos(KT); // cheti gardish qirrasida
  charm.receiveShadow = true;
  ichki.add(charm);

  // charm ustidagi bezak halqasi — aynan charm sirtiga o‘tirg‘iziladi
  const bezakR = 0.415;
  const bezak = new THREE.Mesh(new THREE.TorusGeometry(bezakR, 0.006, 8, 24), m.charmTuq);
  bezak.position.z = charm.position.z + Math.sqrt(KR * KR - bezakR * bezakR) + 0.004;
  ichki.add(bezak);

  // charmni mahkamlovchi mixchalar
  for (let i = 0; i < 20; i++) {
    const b = (i / 20) * Math.PI * 2;
    const mix = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), m.metall);
    mix.position.set(Math.cos(b) * (R - 0.018), Math.sin(b) * (R - 0.018), EN / 2 + 0.004);
    ichki.add(mix);
  }

  // ichki metall halqachalar — jaranglaydigan qism
  for (let i = 0; i < 12; i++) {
    const b = (i / 12) * Math.PI * 2 + 0.13;
    const urinma = new THREE.Vector3(-Math.sin(b), Math.cos(b), 0);
    const oq = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.052, 8), m.metallTuq);
    oq.position.set(Math.cos(b) * (R - 0.020), Math.sin(b) * (R - 0.020), -0.004);
    oq.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), urinma);
    ichki.add(oq);

    for (let j = 0; j < 2; j++) {
      const halqa = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.0065, 8, 12), m.metall);
      halqa.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), urinma);
      halqa.position.set(
        Math.cos(b) * (R - 0.052) + urinma.x * (j ? 0.016 : -0.016),
        Math.sin(b) * (R - 0.052) + urinma.y * (j ? 0.016 : -0.016),
        -0.004
      );
      ichki.add(halqa);
    }
  }

  return moslash(ichki, 1.15);
}

/* =========================================================================
   5. CHANG
   Qismlari:
     · TRAPETSIYA shaklidagi yassi yog‘och quti — THREE.Shape ga to‘rtta
       burchak va ikkita dumaloq TESHIK (rozetka) berilib, ExtrudeGeometry
       bilan qalinlik olinadi, so‘ng gorizontal holatga buriladi;
     · teshiklar atrofida bezak halqalari (Torus);
     · quti ustida IKKITA uzun XARRAK (torlarni ko‘taruvchi taxta);
     · 18 TA PARALLEL TOR — har biri alohida ingichka silindr; trapetsiya
       tufayli torlarning uzunligi bosqichma-bosqich qisqarib boradi;
     · to‘rtta yog‘och oyoqcha;
     · yonida IKKITA ingichka urish CHO‘PI (uchida yassi «qoshiq»).
   ========================================================================= */
export function changYasa() {
  const m = materiallar();
  const ichki = new THREE.Group();
  const QAL = 0.085;                    // quti qalinligi
  const yarimUzunlik = function (z) {   // z kesimidagi torning yarim uzunligi
    const frac = (-z + 0.25) / 0.5;
    return 0.48 - 0.23 * frac;
  };

  // --- trapetsiya quti ---
  const shakl = new THREE.Shape();
  shakl.moveTo(-0.48, -0.25);
  shakl.lineTo(0.48, -0.25);
  shakl.lineTo(0.25, 0.25);
  shakl.lineTo(-0.25, 0.25);
  shakl.closePath();
  [-0.30, 0.30].forEach(function (hx) {
    const teshik = new THREE.Path();
    teshik.absarc(hx, 0.0, 0.042, 0, Math.PI * 2, true);
    shakl.holes.push(teshik);
  });

  const quti = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shakl, { depth: QAL, bevelEnabled: false, curveSegments: 10 }),
    m.dek
  );
  quti.rotation.x = -Math.PI / 2;  // shakl gorizontal yotadi, qalinlik +Y ga
  quti.receiveShadow = true;
  ichki.add(quti);

  // teshiklar atrofidagi bezak halqalari
  [-0.30, 0.30].forEach(function (x) {
    const halqa = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.008, 8, 18), m.yogochTuq);
    halqa.rotation.x = Math.PI / 2;
    halqa.position.set(x, QAL + 0.002, 0.0);
    ichki.add(halqa);
  });

  // --- ikkita xarrak ---
  [-0.20, 0.20].forEach(function (x) {
    const xarrak = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.030, 0.460), m.yogochTuq);
    xarrak.position.set(x, QAL + 0.015, 0);
    ichki.add(xarrak);
  });

  // --- 18 ta parallel tor ---
  const TOR_SONI = 18;
  for (let i = 0; i < TOR_SONI; i++) {
    const z = 0.215 - (i / (TOR_SONI - 1)) * 0.430;
    const yarim = yarimUzunlik(z) - 0.032;
    ichki.add(torTort(
      new THREE.Vector3(-yarim, QAL + 0.033, z),
      new THREE.Vector3(yarim, QAL + 0.033, z),
      0.0032, m.tor, 5
    ));
    // torning ikki uchidagi metall qadama
    [-yarim, yarim].forEach(function (x) {
      const qadama = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.024, 8), m.metall);
      qadama.position.set(x, QAL + 0.022, z);
      ichki.add(qadama);
    });
  }

  // --- oyoqchalar ---
  [[0.40, 0.20], [-0.40, 0.20], [0.22, -0.20], [-0.22, -0.20]].forEach(function (p) {
    const oyoq = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.030, 0.060, 8), m.yogochTuq);
    oyoq.position.set(p[0], -0.030, p[1]);
    ichki.add(oyoq);
  });

  // --- ikkita urish cho‘pi ---
  [0.325, 0.392].forEach(function (z, i) {
    const chop = new THREE.Group();
    const tayoq = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0075, 0.290, 8), m.yogochOrta);
    tayoq.rotation.z = Math.PI / 2;
    chop.add(tayoq);
    const qoshiq = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.010, 0.026), m.yogochTuq);
    qoshiq.position.set(-0.165, 0.001, 0);
    chop.add(qoshiq);
    chop.position.set(-0.06 + i * 0.03, 0.010, z);
    chop.rotation.y = (i ? 1 : -1) * 0.07;
    ichki.add(chop);
  });

  return moslash(ichki, 1.26);
}

/* =========================================================================
   6. NAY
   Qismlari:
     · qamish naycha — ochiq uchli, biroz konussimon uzun silindr
       (X o‘qi bo‘ylab yotadi), materiali ikki tomonlama;
     · naycha ICHI — qorong‘i ichki silindr (BackSide effekti uchun);
     · qamishning 3 ta BO‘G‘IMI — Torus halqalar;
     · yon tomonda 6 TA barmoq TESHIGI (ustida) va 1 ta bosh barmoq teshigi
       (ostida) — kichik qorong‘i silindrchalar;
     · chap uchida PUFLASH joyi — cho‘ziq oval teshik;
     · ikki uchida bezak ip chulg‘amlari (ingichka Torus halqalar).
   ========================================================================= */
export function nayYasa() {
  const m = materiallar();
  const ichki = new THREE.Group();
  const UZ = 1.120;   // naycha uzunligi
  const R1 = 0.030;   // chap uch radiusi
  const R2 = 0.035;   // o‘ng uch radiusi

  const qamish = mat(RANG.yogochOchiq, 0.55, 0.03, { side: THREE.DoubleSide, flatShading: true });

  const naycha = new THREE.Mesh(
    new THREE.CylinderGeometry(R2, R1, UZ, 16, 1, true),
    qamish
  );
  naycha.rotation.z = -Math.PI / 2;   // o‘qi X bo‘ylab
  ichki.add(naycha);

  const ichiKoya = new THREE.Mesh(
    new THREE.CylinderGeometry(R2 - 0.008, R1 - 0.008, UZ - 0.004, 14, 1, true),
    m.koya
  );
  ichiKoya.rotation.z = -Math.PI / 2;
  ichki.add(ichiKoya);

  // qamish bo‘g‘imlari
  [-0.330, 0.020, 0.360].forEach(function (x) {
    const bogim = new THREE.Mesh(new THREE.TorusGeometry(0.034, 0.0095, 8, 16), m.yogochOrta);
    bogim.rotation.y = Math.PI / 2;
    bogim.position.x = x;
    ichki.add(bogim);
  });

  // ikki uchdagi ip chulg‘amlar
  [-0.505, 0.505].forEach(function (x) {
    const ip = new THREE.Mesh(new THREE.TorusGeometry(0.034, 0.006, 8, 16), m.charmTuq);
    ip.rotation.y = Math.PI / 2;
    ip.position.x = x;
    ichki.add(ip);
  });

  // 6 ta barmoq teshigi (ustida)
  for (let i = 0; i < 6; i++) {
    const x = 0.075 + i * 0.072;
    const teshik = new THREE.Mesh(new THREE.CylinderGeometry(0.0105, 0.0105, 0.016, 10), m.koya);
    teshik.position.set(x, 0.031, 0);
    ichki.add(teshik);
  }
  // bosh barmoq teshigi (ostida)
  const past = new THREE.Mesh(new THREE.CylinderGeometry(0.0105, 0.0105, 0.016, 10), m.koya);
  past.position.set(0.038, -0.031, 0);
  ichki.add(past);

  // puflash joyi — cho‘ziq oval
  const puflash = new THREE.Mesh(new THREE.CylinderGeometry(0.0135, 0.0135, 0.018, 12), m.koya);
  puflash.scale.z = 0.65;
  puflash.position.set(-0.430, 0.030, 0);
  ichki.add(puflash);
  const jiyak = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.005, 8, 12), m.yogochTuq);
  jiyak.rotation.x = Math.PI / 2;
  jiyak.scale.y = 0.65;
  jiyak.position.set(-0.430, 0.029, 0);
  ichki.add(jiyak);

  return moslash(ichki, 1.24);
}

/* =========================================================================
   RO‘YXAT — sahifada tanlash/ko‘rsatish uchun umumiy jadval.
   ========================================================================= */
export const CHOLGULAR = {
  dutor:  { nom: 'Dutor',    yasa: dutorYasa,
            izoh: 'Ikki torli, uzun dastali va noksimon yog‘och tanali eng keng tarqalgan milliy cholg‘u.' },
  rubob:  { nom: 'Rubob',    yasa: rubobYasa,
            izoh: 'Old tomoni charm bilan qoplangan yumaloq tanali, kalta dastali va egilgan boshli jarangdor cholg‘u.' },
  dombra: { nom: 'Do‘mbra',  yasa: dombraYasa,
            izoh: 'Baxshilar doston aytganda jo‘r bo‘ladigan, kengroq va yassiroq tanali ikki torli cholg‘u.' },
  doira:  { nom: 'Doira',    yasa: doiraYasa,
            izoh: 'Keng yog‘och gardishga charm tortilgan, ichki tomonida metall halqachalari bor zarbli cholg‘u.' },
  chang:  { nom: 'Chang',    yasa: changYasa,
            izoh: 'Trapetsiya shaklidagi yassi quti ustidagi ko‘p torlar ikkita ingichka cho‘p bilan uriladi.' },
  nay:    { nom: 'Nay',      yasa: nayYasa,
            izoh: 'Qamishdan yasalgan, yon tomonida yetti teshigi bo‘lgan uzun ingichka puflama cholg‘u.' }
};
