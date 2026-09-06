/* =========================================================
   DIDAKTIK BUYUMLAR — 3D modellar
   2-modul «Xalq pedagogikasining didaktik imkoniyatlari»
   ma’ruzasida tilga olingan obraz, buyum va timsollar:
   topishmoq javoblari (piyoz, urchuq), xalq taqvimi qushlari
   (laylak, qaldirg‘och, qarg‘a, kabutar), ta’limiy maqollar
   timsollari (ko‘rgazma lavha, o‘yilgan tosh, quruq bulut,
   ko‘zadagi chiroq, oqimga qarshi qayiq), xalq amaliy
   bilimlari (omoch, o‘roq, qatiq ko‘zasi, quyosh soati,
   dorivor giyoh) va hunar-ilm timsollari (kulol charxi,
   ganch panjara, o‘ymakor eshik, zardo‘zi chopon, suv
   tegirmoni, tarozi, alifbe lavhasi).

   Har funksiya THREE.Group qaytaradi. Miqyos: eng katta
   o‘lchami 1.0–1.5 birlik, pastki nuqtasi y = 0 da, xz
   bo‘yicha markazi (0, 0) da. Faqat Three.js primitivlari
   ishlatiladi — tashqi model yoki tekstura fayli yo‘q.
   ========================================================= */
import * as THREE from '../vendor/three.module.min.js';

/* ---------- Umumiy materiallar jadvali ---------- */
const M = {
  yogoch:    () => new THREE.MeshStandardMaterial({ color: 0x8A6A44, roughness: 0.82 }),
  yogochOch: () => new THREE.MeshStandardMaterial({ color: 0xB08E64, roughness: 0.78 }),
  yogochTuq: () => new THREE.MeshStandardMaterial({ color: 0x6E5334, roughness: 0.85 }),
  sopol:     () => new THREE.MeshStandardMaterial({ color: 0xC08050, roughness: 0.72 }),
  sopolOch:  () => new THREE.MeshStandardMaterial({ color: 0xDCA878, roughness: 0.70 }),
  loy:       () => new THREE.MeshStandardMaterial({ color: 0x9C6E4E, roughness: 0.92 }),
  tosh:      () => new THREE.MeshStandardMaterial({ color: 0x8E9299, roughness: 0.95 }),
  toshTuq:   () => new THREE.MeshStandardMaterial({ color: 0x5B6067, roughness: 0.95 }),
  ganch:     () => new THREE.MeshStandardMaterial({ color: 0xF2EEE3, roughness: 0.88 }),
  metall:    () => new THREE.MeshStandardMaterial({ color: 0x9AA2AC, roughness: 0.40, metalness: 0.75 }),
  poulat:    () => new THREE.MeshStandardMaterial({ color: 0xC7CDD4, roughness: 0.25, metalness: 0.90 }),
  mis:       () => new THREE.MeshStandardMaterial({ color: 0xB0793C, roughness: 0.35, metalness: 0.70 }),
  oltin:     () => new THREE.MeshStandardMaterial({ color: 0xD4A24C, roughness: 0.42, metalness: 0.50 }),
  oq:        () => new THREE.MeshStandardMaterial({ color: 0xF7F4EC, roughness: 0.80 }),
  qora:      () => new THREE.MeshStandardMaterial({ color: 0x232329, roughness: 0.70 }),
  kulrang:   () => new THREE.MeshStandardMaterial({ color: 0x7C818A, roughness: 0.80 }),
  yashil:    () => new THREE.MeshStandardMaterial({ color: 0x3F7A44, roughness: 0.88 }),
  suv:       () => new THREE.MeshStandardMaterial({ color: 0x2E6FA8, roughness: 0.25, metalness: 0.10 }),
  tuproq:    () => new THREE.MeshStandardMaterial({ color: 0xA97C52, roughness: 0.98 }),
  mato:      (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 }),
};

/* ---------- Yordamchi funksiyalar ---------- */

/* Meshga soya berishni yoqadi; `qabul` bo‘lsa soyani qabul ham qiladi. */
function soya(m, qabul = false) {
  m.castShadow = true;
  if (qabul) m.receiveShadow = true;
  return m;
}

/* Geometriyadan mesh yasab, guruhga berilgan nuqtaga qo‘shadi. */
function qosh(g, geo, xomashyo, x, y, z) {
  const m = new THREE.Mesh(geo, xomashyo);
  m.position.set(x || 0, y || 0, z || 0);
  g.add(soya(m));
  return m;
}

/* Ikki nuqta orasiga silindr cho‘zadi — oyoq, bo‘yin, dastak, ip uchun. */
function tayoq(g, xomashyo, a, b, r1, r2, seg) {
  const yon = new THREE.Vector3().subVectors(b, a);
  const uzun = yon.length() || 0.001;
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(r1, r2 === undefined ? r1 : r2, uzun, seg || 10),
    xomashyo
  );
  m.position.copy(a).addScaledVector(yon, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), yon.clone().normalize());
  g.add(soya(m));
  return m;
}

/* Nuqtalar bo‘ylab silliq egri quvur — bo‘yin, poya, jiyak uchun. */
function quvur(g, xomashyo, nuqtalar, radius, bolak, seg) {
  const egri = new THREE.CatmullRomCurve3(nuqtalar);
  const m = new THREE.Mesh(
    new THREE.TubeGeometry(egri, bolak || 24, radius, seg || 10, false),
    xomashyo
  );
  g.add(soya(m));
  return m;
}

/* Yassi naqsh geometriyasi: shakl + qalinlik, markazi nolda. */
function naqshGeo(shakl, qalin) {
  const geo = new THREE.ExtrudeGeometry(shakl, {
    depth: qalin, bevelEnabled: false, curveSegments: 12
  });
  geo.center();
  return geo;
}

/* Ko‘p uchli yulduz naqshi (milliy geometrik bezak). */
function yulduzShakli(tashqi, ichki, uchlar) {
  const s = new THREE.Shape();
  const n = uchlar * 2;
  for (let i = 0; i < n; i++) {
    const r = (i % 2 === 0) ? tashqi : ichki;
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y); else s.lineTo(x, y);
  }
  s.closePath();
  return s;
}

/* Bargcha shakli — giyoh va gul bargi uchun. */
function bargShakli(en, boy) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.quadraticCurveTo(en, boy * 0.42, 0, boy);
  s.quadraticCurveTo(-en, boy * 0.42, 0, 0);
  return s;
}

/* Burchaklari yumaloqlangan to‘rtburchak — lavha va panel uchun. */
function yumaloqTortburchak(en, boy, r) {
  const s = new THREE.Shape();
  const x = en / 2, y = boy / 2;
  s.moveTo(-x + r, -y);
  s.lineTo(x - r, -y);
  s.quadraticCurveTo(x, -y, x, -y + r);
  s.lineTo(x, y - r);
  s.quadraticCurveTo(x, y, x - r, y);
  s.lineTo(-x + r, y);
  s.quadraticCurveTo(-x, y, -x, y - r);
  s.lineTo(-x, -y + r);
  s.quadraticCurveTo(-x, -y, -x + r, -y);
  return s;
}

/* Qanot shakli — o‘tkir uchli, orqaga qayrilgan qush qanoti. */
function qanotShakli(uzun, en) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.quadraticCurveTo(uzun * 0.55, en * 0.85, uzun, en * 0.10);
  s.quadraticCurveTo(uzun * 0.45, -en * 0.15, 0, -en * 0.30);
  s.closePath();
  return s;
}

/* Qush oyog‘i: boldir, tovon va uch oldingi + bir orqa panja. */
function qushOyogi(g, xomashyo, x, z, boy, qalin, panja) {
  const boldir = new THREE.Mesh(
    new THREE.CylinderGeometry(qalin * 0.85, qalin, boy, 8), xomashyo);
  boldir.position.set(x, boy / 2, z);
  g.add(soya(boldir));

  const bogim = new THREE.Mesh(new THREE.SphereGeometry(qalin * 1.4, 8, 6), xomashyo);
  bogim.position.set(x, boy * 0.52, z);
  g.add(bogim);

  const tovon = new THREE.Mesh(new THREE.SphereGeometry(qalin * 1.25, 8, 6), xomashyo);
  tovon.position.set(x, qalin * 0.9, z);
  g.add(tovon);

  for (const a of [-0.55, 0, 0.55, Math.PI]) {
    const uz = (a === Math.PI) ? panja * 0.6 : panja;
    tayoq(g, xomashyo,
      new THREE.Vector3(x, qalin * 0.8, z),
      new THREE.Vector3(x + Math.sin(a) * uz, qalin * 0.35, z + Math.cos(a) * uz),
      qalin * 0.5, qalin * 0.28, 6);
  }
}

/* Modelni yakuniy holatga keltiradi: kerakli o‘lchamga keltiradi,
   xz bo‘yicha markazlaydi, pastki nuqtasini y = 0 ga qo‘yadi. */
function tayyorla(ich, olcham) {
  const g = new THREE.Group();
  g.add(ich);
  ich.updateMatrixWorld(true);
  const quti = new THREE.Box3().setFromObject(ich);
  const o = quti.getSize(new THREE.Vector3());
  const eng = Math.max(o.x, o.y, o.z);
  if (eng > 0) ich.scale.setScalar(olcham / eng);
  ich.updateMatrixWorld(true);
  quti.setFromObject(ich);
  const markaz = quti.getCenter(new THREE.Vector3());
  ich.position.set(-markaz.x, -quti.min.y, -markaz.z);
  g.traverse((n) => {
    if (n.isMesh) {
      n.castShadow = true;
      if (n.userData.yerda) n.receiveShadow = true;
    }
  });
  return g;
}

/* =========================================================
   1) PIYOZ — «Pak-pakana bo‘yi bor, yetti qavat to‘ni bor»
   Topishmoq javobi. Po‘stli piyoz boshi, ustida quriy boshlagan
   yashil poya, pastda ildizchalar, yon tomonda ko‘chgan po‘st
   qatlamlari va meridian bo‘ylab qavat chiziqlari.
   ========================================================= */
export function piyozYasa() {
  const ich = new THREE.Group();
  const post   = new THREE.MeshStandardMaterial({ color: 0xC98B4B, roughness: 0.74 });
  const postOch= new THREE.MeshStandardMaterial({ color: 0xE8C089, roughness: 0.70, side: THREE.DoubleSide });
  const qavat  = new THREE.MeshStandardMaterial({ color: 0x9E6530, roughness: 0.85 });
  const poya   = new THREE.MeshStandardMaterial({ color: 0x7E8A46, roughness: 0.92 });
  const ildiz  = new THREE.MeshStandardMaterial({ color: 0xE6DDC6, roughness: 0.95 });

  /* Piyoz boshi — aylanma profil */
  const profil = [
    new THREE.Vector2(0.000, 0.030),
    new THREE.Vector2(0.075, 0.012),
    new THREE.Vector2(0.170, 0.060),
    new THREE.Vector2(0.240, 0.155),
    new THREE.Vector2(0.268, 0.275),
    new THREE.Vector2(0.245, 0.395),
    new THREE.Vector2(0.165, 0.480),
    new THREE.Vector2(0.075, 0.530),
    new THREE.Vector2(0.032, 0.565),
    new THREE.Vector2(0.000, 0.580),
  ];
  const bosh = new THREE.Mesh(new THREE.LatheGeometry(profil, 36), post);
  bosh.userData.yerda = true;
  ich.add(soya(bosh, true));

  /* Meridian chiziqlar — «yetti qavat to‘n»ning ko‘rinib turgan choklari */
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const nuq = profil.slice(1, 9).map((p) => new THREE.Vector3(
      Math.cos(a) * p.x * 1.005, p.y, Math.sin(a) * p.x * 1.005));
    quvur(ich, qavat, nuq, 0.0055, 18, 6);
  }

  /* Ko‘chgan po‘st qatlamlari — ochilib turgan ikki varaq */
  for (let k = 0; k < 2; k++) {
    const varaqProfil = profil.slice(2, 9).map(
      (p) => new THREE.Vector2(p.x * (1.045 + k * 0.05), p.y * 1.02));
    const varaq = new THREE.Mesh(
      new THREE.LatheGeometry(varaqProfil, 18, 0.5 + k * 2.4, 1.55), postOch);
    ich.add(soya(varaq));
  }

  /* Quriy boshlagan yashil poya — uchi egilgan */
  quvur(ich, poya, [
    new THREE.Vector3(0.00, 0.560, 0.00),
    new THREE.Vector3(0.02, 0.700, 0.02),
    new THREE.Vector3(0.06, 0.830, 0.00),
    new THREE.Vector3(0.13, 0.900, -0.04),
    new THREE.Vector3(0.21, 0.905, -0.06),
  ], 0.030, 20, 8);
  quvur(ich, poya, [
    new THREE.Vector3(0.00, 0.560, 0.00),
    new THREE.Vector3(-0.03, 0.680, -0.02),
    new THREE.Vector3(-0.09, 0.780, -0.01),
    new THREE.Vector3(-0.16, 0.820, 0.03),
  ], 0.022, 16, 8);

  /* Ildizchalar — pastdagi oq tolalar */
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 + 0.3;
    const r = 0.03 + (i % 3) * 0.022;
    tayoq(ich, ildiz,
      new THREE.Vector3(Math.cos(a) * r * 0.4, 0.030, Math.sin(a) * r * 0.4),
      new THREE.Vector3(Math.cos(a) * r * 2.6, -0.055 - (i % 4) * 0.012, Math.sin(a) * r * 2.6),
      0.008, 0.0025, 5);
  }
  return tayyorla(ich, 1.25);
}

/* =========================================================
   2) URCHUQ — «Aylanaverib-aylanaverib semirdi xonim»
   Topishmoq javobi. Ingichka yog‘och o‘q, pastida dumaloq
   toshcha (urchuqbosh — og‘irlik), ustida qavat-qavat o‘ralib
   semirgan ip kalavasi va uchidagi ilmoq.
   ========================================================= */
export function urchuqYasa() {
  const ich = new THREE.Group();
  const yog = M.yogochOch();
  const toshM = M.toshTuq();
  const ipM = new THREE.MeshStandardMaterial({ color: 0xF0E3C6, roughness: 0.95 });
  const ipTuq = new THREE.MeshStandardMaterial({ color: 0xD9C6A0, roughness: 0.95 });

  /* O‘q — pastdan yuqoriga ingichkalashadi */
  const oq = qosh(ich, new THREE.CylinderGeometry(0.011, 0.017, 1.02, 10), yog, 0, 0.51, 0);
  oq.userData.yerda = true;

  /* Urchuqbosh — dumaloq tosh og‘irlik */
  const gir = qosh(ich, new THREE.SphereGeometry(0.105, 18, 12), toshM, 0, 0.145, 0);
  gir.scale.set(1, 0.46, 1);
  const girHalqa = qosh(ich, new THREE.TorusGeometry(0.106, 0.010, 6, 22), M.yogochTuq(), 0, 0.145, 0);
  girHalqa.rotation.x = -Math.PI / 2;

  /* O‘qning pastki uchi — yerga tegib aylanadigan uchi */
  const uch = qosh(ich, new THREE.ConeGeometry(0.017, 0.075, 8), M.yogochTuq(), 0, 0.038, 0);
  uch.rotation.x = Math.PI;
  uch.userData.yerda = true;

  /* Ip kalavasi — duksimon (semirgan) shakl */
  const kalavaProfil = [
    new THREE.Vector2(0.018, 0.320),
    new THREE.Vector2(0.062, 0.380),
    new THREE.Vector2(0.105, 0.470),
    new THREE.Vector2(0.126, 0.580),
    new THREE.Vector2(0.120, 0.680),
    new THREE.Vector2(0.086, 0.760),
    new THREE.Vector2(0.040, 0.812),
    new THREE.Vector2(0.016, 0.830),
  ];
  ich.add(soya(new THREE.Mesh(new THREE.LatheGeometry(kalavaProfil, 26), ipM)));

  /* O‘ralgan ip qatlamlari — kalava bo‘ylab halqalar */
  for (let i = 0; i < 16; i++) {
    const t = i / 15;
    const y = 0.345 + t * 0.465;
    /* Duksimon profilga mos radius */
    const r = 0.128 * Math.sin(Math.PI * Math.min(1, Math.max(0, (y - 0.320) / 0.510))) + 0.020;
    const h = qosh(ich, new THREE.TorusGeometry(r, 0.0085, 6, 26),
      (i % 2 ? ipTuq : ipM), 0, y, 0);
    h.rotation.x = -Math.PI / 2 + 0.06 * Math.sin(i);
  }

  /* Bo‘shab tushgan ip uchi */
  quvur(ich, ipM, [
    new THREE.Vector3(0.12, 0.62, 0.02),
    new THREE.Vector3(0.19, 0.55, 0.06),
    new THREE.Vector3(0.21, 0.45, 0.02),
    new THREE.Vector3(0.17, 0.36, -0.03),
  ], 0.007, 16, 6);

  /* Uchidagi ilmoq — ip ilinadigan halqa */
  const ilmoq = qosh(ich, new THREE.TorusGeometry(0.026, 0.006, 6, 16), yog, 0, 0.985, 0);
  ilmoq.rotation.y = Math.PI / 2;
  return tayyorla(ich, 1.30);
}

/* =========================================================
   3) LAYLAK — bahordan darak beruvchi qush (xalq taqvimi)
   Oq tana, qora qanot uchlari, uzun qizil tumshuq va uzun
   qizil oyoqlar, S shaklidagi uzun bo‘yin.
   ========================================================= */
export function laylakYasa() {
  const ich = new THREE.Group();
  const oqM = M.oq();
  const qoraM = new THREE.MeshStandardMaterial({ color: 0x1E1E24, roughness: 0.72 });
  const qizilM = new THREE.MeshStandardMaterial({ color: 0xC4402A, roughness: 0.55 });

  /* Uzun qizil oyoqlar */
  qushOyogi(ich, qizilM, -0.085, 0.030, 0.60, 0.019, 0.085);
  qushOyogi(ich, qizilM, 0.085, -0.035, 0.60, 0.019, 0.085);

  /* Tana — cho‘ziq tuxumsimon */
  const tana = qosh(ich, new THREE.SphereGeometry(0.24, 26, 18), oqM, 0, 0.720, -0.02);
  tana.scale.set(0.78, 0.74, 1.25);

  /* Ko‘krak — oldinga bo‘rtgan */
  const kokrak = qosh(ich, new THREE.SphereGeometry(0.155, 18, 14), oqM, 0, 0.735, 0.16);
  kokrak.scale.set(0.92, 0.95, 0.85);

  /* Dum — orqaga va yuqoriga cho‘zilgan */
  const dum = qosh(ich, new THREE.ConeGeometry(0.115, 0.30, 12), oqM, 0, 0.760, -0.34);
  dum.rotation.x = -Math.PI / 2 + 0.26;

  /* Qanotlar va ularning qora uch patlari */
  for (const yon of [-1, 1]) {
    const qanot = qosh(ich, new THREE.SphereGeometry(0.20, 18, 14), oqM, yon * 0.170, 0.740, -0.03);
    qanot.scale.set(0.30, 0.62, 1.05);
    for (let i = 0; i < 4; i++) {
      const pat = qosh(ich, new THREE.SphereGeometry(0.055, 10, 8), qoraM,
        yon * (0.158 - i * 0.020), 0.700 - i * 0.014, -0.205 - i * 0.022);
      pat.scale.set(0.45, 0.85, 2.30);
    }
  }

  /* S shaklidagi uzun bo‘yin */
  quvur(ich, oqM, [
    new THREE.Vector3(0.00, 0.850, 0.140),
    new THREE.Vector3(0.00, 0.990, 0.235),
    new THREE.Vector3(0.00, 1.130, 0.205),
    new THREE.Vector3(0.00, 1.245, 0.130),
  ], 0.047, 22, 10);

  /* Bosh */
  const bosh = qosh(ich, new THREE.SphereGeometry(0.078, 18, 14), oqM, 0, 1.285, 0.150);
  bosh.scale.set(0.95, 0.92, 1.15);

  /* Ko‘zlar */
  for (const yon of [-1, 1]) {
    qosh(ich, new THREE.SphereGeometry(0.014, 8, 6), qoraM, yon * 0.045, 1.305, 0.205);
  }

  /* Uzun qizil tumshuq */
  tayoq(ich, qizilM,
    new THREE.Vector3(0, 1.280, 0.195),
    new THREE.Vector3(0, 1.222, 0.535), 0.032, 0.007, 10);
  return tayyorla(ich, 1.42);
}

/* =========================================================
   4) QALDIRG‘OCH — yozdan darak beruvchi qush
   Ko‘kimtir-qora usti, oq qorni, qizg‘ish tomog‘i, ayri
   (vilkasimon) dumi va o‘tkir, orqaga qayrilgan qanotlari.
   ========================================================= */
export function qaldirgochYasa() {
  const ich = new THREE.Group();
  const ust = new THREE.MeshStandardMaterial({ color: 0x243055, roughness: 0.55, metalness: 0.20 });
  const qorin = new THREE.MeshStandardMaterial({ color: 0xF4EFE2, roughness: 0.85 });
  const tomoq = new THREE.MeshStandardMaterial({ color: 0xA8452C, roughness: 0.80 });
  const tumshuqM = new THREE.MeshStandardMaterial({ color: 0x2A2A30, roughness: 0.60 });

  /* Tana — cho‘ziq, uchishga moslashgan */
  const tana = qosh(ich, new THREE.SphereGeometry(0.135, 22, 16), ust, 0, 0.560, -0.02);
  tana.scale.set(0.80, 0.80, 1.65);

  /* Oq qorin — tananing pastki yarmi */
  const qor = qosh(ich, new THREE.SphereGeometry(0.128, 20, 14), qorin, 0, 0.532, -0.01);
  qor.scale.set(0.78, 0.66, 1.55);

  /* Bosh */
  const bosh = qosh(ich, new THREE.SphereGeometry(0.088, 18, 14), ust, 0, 0.600, 0.185);
  bosh.scale.set(0.95, 0.92, 1.00);

  /* Qizg‘ish tomoq va peshona dog‘i */
  const tom = qosh(ich, new THREE.SphereGeometry(0.062, 14, 10), tomoq, 0, 0.548, 0.212);
  tom.scale.set(0.90, 0.72, 0.80);
  qosh(ich, new THREE.SphereGeometry(0.030, 10, 8), tomoq, 0, 0.638, 0.250);

  /* Kichik uchburchak tumshuq */
  const tumshuq = qosh(ich, new THREE.ConeGeometry(0.028, 0.075, 8), tumshuqM, 0, 0.596, 0.290);
  tumshuq.rotation.x = Math.PI / 2;

  /* Ko‘zlar */
  for (const yon of [-1, 1]) {
    qosh(ich, new THREE.SphereGeometry(0.014, 8, 6), tumshuqM, yon * 0.056, 0.628, 0.230);
  }

  /* O‘tkir, orqaga qayrilgan qanotlar */
  const qanotGeo = new THREE.ExtrudeGeometry(qanotShakli(0.46, 0.20), {
    depth: 0.012, bevelEnabled: false, curveSegments: 12
  });
  for (const yon of [-1, 1]) {
    const guruh = new THREE.Group();
    guruh.position.set(yon * 0.085, 0.585, 0.02);
    guruh.rotation.set(0, 0.62, 0.30);
    if (yon < 0) guruh.scale.x = -1;
    const q = new THREE.Mesh(qanotGeo, ust);
    q.rotation.x = -Math.PI / 2;
    guruh.add(soya(q));
    ich.add(guruh);
  }

  /* Ayri (vilkasimon) dum — ikki uzun pat */
  for (const yon of [-1, 1]) {
    tayoq(ich, ust,
      new THREE.Vector3(0, 0.545, -0.18),
      new THREE.Vector3(yon * 0.145, 0.395, -0.56), 0.030, 0.008, 6);
  }
  /* Dum orasidagi kalta patlar */
  const orta = qosh(ich, new THREE.ConeGeometry(0.055, 0.20, 8), ust, 0, 0.520, -0.28);
  orta.rotation.x = -Math.PI / 2 + 0.30;
  orta.scale.set(1, 1, 0.35);

  /* Ikki kichik oyoq — tana ostida yig‘ilgan */
  for (const yon of [-1, 1]) {
    tayoq(ich, tumshuqM,
      new THREE.Vector3(yon * 0.045, 0.475, 0.03),
      new THREE.Vector3(yon * 0.055, 0.415, -0.02), 0.011, 0.008, 6);
    tayoq(ich, tumshuqM,
      new THREE.Vector3(yon * 0.055, 0.415, -0.02),
      new THREE.Vector3(yon * 0.058, 0.400, 0.05), 0.008, 0.004, 5);
  }
  return tayyorla(ich, 1.30);
}

/* =========================================================
   5) QARG‘A — qor va sovuqdan darak beruvchi qush
   Qora tana, kulrang bo‘yin («ola qarg‘a»), kuchli tumshuq,
   panjali baquvvat oyoqlar.
   ========================================================= */
export function qargaYasa() {
  const ich = new THREE.Group();
  const qoraM = new THREE.MeshStandardMaterial({ color: 0x1C1C22, roughness: 0.68, metalness: 0.15 });
  const kulM = new THREE.MeshStandardMaterial({ color: 0x8A8D93, roughness: 0.85 });
  const oyoqM = new THREE.MeshStandardMaterial({ color: 0x2E2E34, roughness: 0.65 });

  /* Baquvvat panjali oyoqlar */
  qushOyogi(ich, oyoqM, -0.095, 0.020, 0.30, 0.024, 0.100);
  qushOyogi(ich, oyoqM, 0.095, -0.025, 0.30, 0.024, 0.100);

  /* Tana */
  const tana = qosh(ich, new THREE.SphereGeometry(0.24, 24, 18), qoraM, 0, 0.520, -0.02);
  tana.scale.set(0.86, 0.86, 1.18);

  /* Kulrang bo‘yin va yelka — ola qarg‘aning belgisi */
  const boyin = qosh(ich, new THREE.SphereGeometry(0.165, 18, 14), kulM, 0, 0.700, 0.070);
  boyin.scale.set(0.92, 0.86, 1.00);
  const yelka = qosh(ich, new THREE.SphereGeometry(0.185, 18, 14), kulM, 0, 0.615, -0.02);
  yelka.scale.set(0.94, 0.62, 0.90);

  /* Bosh */
  const bosh = qosh(ich, new THREE.SphereGeometry(0.115, 18, 14), qoraM, 0, 0.815, 0.155);
  bosh.scale.set(0.95, 0.92, 1.05);

  /* Kuchli tumshuq — ustki va ostki qismi */
  const tumUst = qosh(ich, new THREE.ConeGeometry(0.052, 0.215, 8), qoraM, 0, 0.828, 0.330);
  tumUst.rotation.x = Math.PI / 2 - 0.10;
  const tumOst = qosh(ich, new THREE.ConeGeometry(0.036, 0.175, 8), qoraM, 0, 0.795, 0.315);
  tumOst.rotation.x = Math.PI / 2 + 0.05;
  /* Tumshuq ustidagi tuk */
  qosh(ich, new THREE.SphereGeometry(0.030, 8, 6), qoraM, 0, 0.858, 0.230);

  /* Ko‘zlar */
  for (const yon of [-1, 1]) {
    qosh(ich, new THREE.SphereGeometry(0.020, 8, 6), kulM, yon * 0.075, 0.850, 0.215);
    qosh(ich, new THREE.SphereGeometry(0.011, 8, 6), qoraM, yon * 0.082, 0.852, 0.232);
  }

  /* Yig‘ilgan qanotlar */
  for (const yon of [-1, 1]) {
    const qanot = qosh(ich, new THREE.SphereGeometry(0.215, 16, 12), qoraM, yon * 0.165, 0.535, -0.05);
    qanot.scale.set(0.30, 0.60, 1.05);
    for (let i = 0; i < 3; i++) {
      const pat = qosh(ich, new THREE.SphereGeometry(0.050, 8, 6), qoraM,
        yon * (0.150 - i * 0.022), 0.470 - i * 0.014, -0.215 - i * 0.030);
      pat.scale.set(0.42, 0.60, 2.10);
    }
  }

  /* Yelpig‘ichsimon kalta dum */
  const dum = qosh(ich, new THREE.ConeGeometry(0.145, 0.34, 10), qoraM, 0, 0.520, -0.34);
  dum.rotation.x = -Math.PI / 2 + 0.14;
  dum.scale.set(1, 1, 0.30);
  return tayyorla(ich, 1.24);
}

/* =========================================================
   6) KABUTAR — yovvoyi kabutar (ko‘k kaptar)
   Kulrang-ko‘kish tana, tovlanuvchi bo‘yin, kichik boshcha,
   yelpig‘ichsimon ochiq dum va pushti oyoqlar.
   ========================================================= */
export function kabutarYasa() {
  const ich = new THREE.Group();
  const tanaM = new THREE.MeshStandardMaterial({ color: 0x8891A6, roughness: 0.78 });
  const tovM = new THREE.MeshStandardMaterial({ color: 0x4E7A6E, roughness: 0.42, metalness: 0.35 });
  const qanotM = new THREE.MeshStandardMaterial({ color: 0x767F94, roughness: 0.80 });
  const chiziqM = new THREE.MeshStandardMaterial({ color: 0x3A4054, roughness: 0.80 });
  const oyoqM = new THREE.MeshStandardMaterial({ color: 0xC77A6E, roughness: 0.70 });
  const tumshuqM = new THREE.MeshStandardMaterial({ color: 0x3A3A42, roughness: 0.60 });

  /* Kalta pushti oyoqlar */
  qushOyogi(ich, oyoqM, -0.080, 0.015, 0.145, 0.017, 0.075);
  qushOyogi(ich, oyoqM, 0.080, -0.020, 0.145, 0.017, 0.075);

  /* Tana */
  const tana = qosh(ich, new THREE.SphereGeometry(0.215, 24, 18), tanaM, 0, 0.400, -0.01);
  tana.scale.set(0.90, 0.88, 1.16);

  /* Bo‘rtgan ko‘krak */
  const kokrak = qosh(ich, new THREE.SphereGeometry(0.150, 18, 14), tanaM, 0, 0.410, 0.150);
  kokrak.scale.set(0.95, 1.00, 0.85);

  /* Tovlanuvchi bo‘yin */
  const boyin = qosh(ich, new THREE.SphereGeometry(0.105, 16, 12), tovM, 0, 0.545, 0.135);
  boyin.scale.set(0.95, 1.00, 0.95);

  /* Kichik boshcha */
  const bosh = qosh(ich, new THREE.SphereGeometry(0.085, 18, 14), tanaM, 0, 0.630, 0.185);
  bosh.scale.set(0.95, 0.95, 1.00);

  /* Tumshuq va uning ustidagi oq mumsimon parda */
  const tumshuq = qosh(ich, new THREE.ConeGeometry(0.023, 0.085, 8), tumshuqM, 0, 0.620, 0.282);
  tumshuq.rotation.x = Math.PI / 2 + 0.12;
  qosh(ich, new THREE.SphereGeometry(0.026, 10, 8), M.oq(), 0, 0.645, 0.248);

  /* Ko‘zlar */
  for (const yon of [-1, 1]) {
    qosh(ich, new THREE.SphereGeometry(0.014, 8, 6), new THREE.MeshStandardMaterial({
      color: 0xC1502E, roughness: 0.4 }), yon * 0.058, 0.648, 0.228);
  }

  /* Yig‘ilgan qanotlar va ulardagi ikki to‘q chiziq */
  for (const yon of [-1, 1]) {
    const qanot = qosh(ich, new THREE.SphereGeometry(0.200, 16, 12), qanotM, yon * 0.150, 0.415, -0.03);
    qanot.scale.set(0.32, 0.66, 1.05);
    for (let i = 0; i < 2; i++) {
      const ch = qosh(ich, new THREE.BoxGeometry(0.020, 0.075, 0.115), chiziqM,
        yon * 0.148, 0.395, -0.055 - i * 0.075);
    }
  }

  /* Yelpig‘ichsimon ochiq dum */
  for (let i = 0; i < 7; i++) {
    const a = (i - 3) * 0.145;
    const pat = tayoq(ich, tanaM,
      new THREE.Vector3(0, 0.400, -0.17),
      new THREE.Vector3(Math.sin(a) * 0.36, 0.400 + Math.abs(a) * 0.045 + 0.02, -0.17 - Math.cos(a) * 0.36),
      0.030, 0.022, 4);
    pat.scale.set(1, 1, 0.34);
  }
  /* Dum uchidagi to‘q hoshiya */
  const hoshiya = qosh(ich, new THREE.TorusGeometry(0.36, 0.014, 5, 18, 0.95), chiziqM, 0, 0.428, -0.17);
  hoshiya.rotation.set(Math.PI / 2, 0, 0);
  hoshiya.rotation.z = Math.PI + 0.48;
  return tayyorla(ich, 1.18);
}

/* =========================================================
   7) KO‘RGAZMA LAVHA — «O‘n marta eshitgandan bir bor ko‘rgan
   yaxshi» (ko‘rsatmalilik tamoyili). Yog‘och uch oyoqli
   mol‘bert va unga qo‘yilgan milliy geometrik naqshli taxta.
   ========================================================= */
export function korgazmaLavhaYasa() {
  const ich = new THREE.Group();
  const yog = M.yogoch(), yogT = M.yogochTuq(), yogO = M.yogochOch();
  const kokM = new THREE.MeshStandardMaterial({ color: 0x1B3B6F, roughness: 0.55 });
  const oltinM = M.oltin();

  /* Uch oyoq — old ikkitasi va orqadagi tayanch */
  tayoq(ich, yogT, new THREE.Vector3(-0.240, 0.00, 0.160),
    new THREE.Vector3(-0.055, 1.02, 0.030), 0.026, 0.020, 8).userData.yerda = true;
  tayoq(ich, yogT, new THREE.Vector3(0.240, 0.00, 0.160),
    new THREE.Vector3(0.055, 1.02, 0.030), 0.026, 0.020, 8).userData.yerda = true;
  tayoq(ich, yogT, new THREE.Vector3(0.000, 0.00, -0.340),
    new THREE.Vector3(0.000, 0.96, -0.055), 0.026, 0.020, 8).userData.yerda = true;

  /* Oyoqlarni bog‘lovchi ko‘ndalang bandlar */
  const band = qosh(ich, new THREE.BoxGeometry(0.42, 0.026, 0.026), yog, 0, 0.240, 0.122);
  for (const yon of [-1, 1]) {
    tayoq(ich, yog, new THREE.Vector3(yon * 0.185, 0.240, 0.120),
      new THREE.Vector3(0, 0.245, -0.255), 0.013, 0.013, 6);
  }

  /* Taxta qo‘yiladigan tokcha */
  qosh(ich, new THREE.BoxGeometry(0.40, 0.034, 0.090), yog, 0, 0.420, 0.104);
  qosh(ich, new THREE.BoxGeometry(0.40, 0.048, 0.020), yog, 0, 0.440, 0.148);

  /* Uchala oyoq tutashgan cho‘qqi bog‘lami */
  const boglam = qosh(ich, new THREE.SphereGeometry(0.048, 12, 10), yogT, 0, 1.010, -0.010);

  /* Ko‘rgazma taxtasi — bir oz orqaga suyangan */
  const taxta = new THREE.Group();
  taxta.position.set(0, 0.715, 0.088);
  taxta.rotation.x = -0.13;
  ich.add(taxta);

  const yuza = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.56, 0.030), yogO);
  taxta.add(soya(yuza, true));

  /* Taxtaning oltin ramkasi */
  for (const [w, h, x, y] of [[0.74, 0.036, 0, 0.262], [0.74, 0.036, 0, -0.262],
                               [0.036, 0.56, -0.352, 0], [0.036, 0.56, 0.352, 0]]) {
    const r = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.036), oltinM);
    r.position.set(x, y, 0.004);
    taxta.add(soya(r));
  }

  /* Markaziy sakkiz burchakli yulduz naqshi */
  const yulduz = new THREE.Mesh(naqshGeo(yulduzShakli(0.185, 0.082, 8), 0.014), kokM);
  yulduz.position.set(0, 0, 0.021);
  taxta.add(soya(yulduz));
  const ichYulduz = new THREE.Mesh(naqshGeo(yulduzShakli(0.090, 0.040, 8), 0.016), oltinM);
  ichYulduz.position.set(0, 0, 0.026);
  taxta.add(soya(ichYulduz));

  /* Yon tomonlardagi kichik yulduzchalar */
  for (const yon of [-1, 1]) {
    for (const y of [-0.150, 0.150]) {
      const kichik = new THREE.Mesh(naqshGeo(yulduzShakli(0.052, 0.024, 6), 0.012), kokM);
      kichik.position.set(yon * 0.262, y, 0.020);
      taxta.add(soya(kichik));
    }
  }

  /* Yuqori va quyi zanjira (siniq chiziq) bezagi */
  for (let i = 0; i < 9; i++) {
    for (const y of [-0.212, 0.212]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.056, 0.016, 0.012), kokM);
      b.position.set(-0.32 + i * 0.08, y, 0.020);
      b.rotation.z = (i % 2 ? 1 : -1) * 0.7;
      taxta.add(soya(b));
    }
  }
  return tayyorla(ich, 1.35);
}

/* =========================================================
   8) O‘YILGAN TOSH — «Yoshlikda o‘rgangan ilm toshga o‘yilgan
   naqsh kabidir» (bilim mustahkamligi). Kulrang tosh lavha,
   yuzasida chuqur o‘yilgan geometrik-islimiy naqsh.
   ========================================================= */
export function oyilganToshYasa() {
  const ich = new THREE.Group();
  const toshM = M.tosh();
  const chuqur = new THREE.MeshStandardMaterial({ color: 0x4A4E55, roughness: 0.98 });
  const soyaRang = new THREE.MeshStandardMaterial({ color: 0x6B7078, roughness: 0.96 });

  /* Tagkursi — tosh poydevor */
  const kursi = qosh(ich, new THREE.BoxGeometry(0.78, 0.090, 0.340), M.toshTuq(), 0, 0.045, 0);
  kursi.userData.yerda = true;
  qosh(ich, new THREE.BoxGeometry(0.68, 0.040, 0.280), toshM, 0, 0.110, 0);

  /* Tik tosh lavha */
  const lavha = qosh(ich, new THREE.BoxGeometry(0.600, 0.800, 0.150), toshM, 0, 0.530, 0);
  lavha.rotation.z = 0.015;
  lavha.userData.yerda = true;

  /* Lavhaning yumaloqlangan cho‘qqisi */
  const choqqi = qosh(ich, new THREE.CylinderGeometry(0.300, 0.300, 0.150, 20, 1, false, 0, Math.PI), toshM, 0, 0.930, 0);
  choqqi.rotation.x = Math.PI / 2;
  choqqi.rotation.y = Math.PI / 2;

  /* Yuzada o‘yilgan chuqur ramka */
  for (const [w, h, x, y] of [[0.460, 0.030, 0, 0.845], [0.460, 0.030, 0, 0.185],
                               [0.030, 0.690, -0.215, 0.515], [0.030, 0.690, 0.215, 0.515]]) {
    qosh(ich, new THREE.BoxGeometry(w, h, 0.030), chuqur, x, y, 0.062);
  }

  /* Markazdagi o‘yilgan sakkiz uchli yulduz — chuqurroq botgan */
  const yulduz = qosh(ich, naqshGeo(yulduzShakli(0.165, 0.072, 8), 0.030), chuqur, 0, 0.560, 0.058);
  const ichHalqa = qosh(ich, new THREE.TorusGeometry(0.062, 0.014, 6, 20), soyaRang, 0, 0.560, 0.064);

  /* Islimiy jingalaklar — yulduz atrofidagi o‘yiq egri chiziqlar */
  for (const yon of [-1, 1]) {
    for (const y of [0.330, 0.790]) {
      const jing = qosh(ich, new THREE.TorusGeometry(0.070, 0.013, 6, 18, Math.PI * 1.25),
        chuqur, yon * 0.110, y, 0.060);
      jing.rotation.z = yon > 0 ? 0.4 : Math.PI - 0.4;
    }
  }

  /* Kichik o‘yiq chuqurchalar — iskana izlari */
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const ch = qosh(ich, new THREE.CylinderGeometry(0.020, 0.014, 0.036, 8), chuqur,
      Math.cos(a) * 0.150, 0.560 + Math.sin(a) * 0.245, 0.058);
    ch.rotation.x = Math.PI / 2;
  }

  /* Toshning notekis chetlari — sinig‘lar */
  for (const [x, y, s] of [[-0.300, 0.760, 0.055], [0.300, 0.300, 0.045], [-0.295, 0.250, 0.038]]) {
    const sin = qosh(ich, new THREE.SphereGeometry(s, 7, 5), soyaRang, x, y, 0.02);
    sin.scale.set(0.6, 1, 1.6);
  }
  return tayyorla(ich, 1.25);
}

/* =========================================================
   9) QURUQ BULUT — «Amalda qo‘llanmaydigan bilim — yomg‘irsiz
   bulutga o‘xshaydi». Oq-kulrang bulut, ostida esa yorilib
   ketgan quruq yer disqi. Tomchi yo‘q — bulut quruq.
   ========================================================= */
export function bulutYasa() {
  const ich = new THREE.Group();
  const oqBulut = new THREE.MeshStandardMaterial({ color: 0xF3F2EF, roughness: 1.0 });
  const kulBulut = new THREE.MeshStandardMaterial({ color: 0xA3A8B0, roughness: 1.0 });
  const yer = M.tuproq();
  const yoriq = new THREE.MeshStandardMaterial({ color: 0x6B4A2E, roughness: 1.0 });

  /* Yorilgan quruq yer — nozik disk */
  const disk = qosh(ich, new THREE.CylinderGeometry(0.500, 0.480, 0.050, 32), yer, 0, 0.025, 0);
  disk.userData.yerda = true;

  /* Yerdagi yoriqlar — markazdan tarqagan chiziqlar */
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const uz = 0.28 + (i % 3) * 0.09;
    const y1 = qosh(ich, new THREE.BoxGeometry(0.016, 0.014, uz), yoriq,
      Math.cos(a) * (uz / 2 + 0.05), 0.049, Math.sin(a) * (uz / 2 + 0.05));
    y1.rotation.y = -a;
    /* Yoriqdan ajralgan kalta shoxcha */
    const a2 = a + 0.9;
    const y2 = qosh(ich, new THREE.BoxGeometry(0.012, 0.012, 0.13), yoriq,
      Math.cos(a) * (uz + 0.03) + Math.cos(a2) * 0.06, 0.049,
      Math.sin(a) * (uz + 0.03) + Math.sin(a2) * 0.06);
    y2.rotation.y = -a2;
  }

  /* Yerning qurib qatqaloq bo‘lgan bo‘laklari */
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.5;
    const b = qosh(ich, new THREE.CylinderGeometry(0.085, 0.080, 0.016, 6), yer,
      Math.cos(a) * 0.27, 0.056, Math.sin(a) * 0.27);
    b.rotation.y = a;
  }

  /* Bulut — bir nechta shardan yig‘ilgan */
  const parcha = [
    [-0.300, 0.820, 0.020, 0.170], [-0.120, 0.900, -0.050, 0.220],
    [0.080, 0.930, 0.050, 0.235], [0.280, 0.850, -0.020, 0.190],
    [0.430, 0.800, 0.040, 0.140], [-0.020, 0.780, 0.150, 0.155],
    [0.160, 0.765, -0.150, 0.150], [-0.400, 0.775, -0.060, 0.115],
  ];
  for (const [x, y, z, r] of parcha) {
    const p = qosh(ich, new THREE.SphereGeometry(r, 18, 14), oqBulut, x, y, z);
    p.scale.set(1, 0.86, 1);
  }

  /* Bulutning kulrang, quruq osti qismi */
  for (const [x, y, z, r] of [[-0.200, 0.715, 0.010, 0.135], [0.020, 0.700, 0.020, 0.155],
                               [0.240, 0.720, -0.020, 0.125], [0.400, 0.735, 0.020, 0.090]]) {
    const p = qosh(ich, new THREE.SphereGeometry(r, 14, 10), kulBulut, x, y, z);
    p.scale.set(1, 0.60, 1);
  }
  return tayyorla(ich, 1.30);
}

/* =========================================================
   10) KO‘ZADAGI CHIROQ — «Bilimini o‘rgatmagan kishi ko‘zaga
   solib qo‘yilgan yorug‘likka o‘xshaydi». Sopol ko‘za, ichida
   yonayotgan chiroq, og‘zi qopqoq bilan yopilgan, nur faqat
   yon devordagi yoriqdan sizib chiqadi.
   ========================================================= */
export function kozaChiroqYasa() {
  const ich = new THREE.Group();
  const sopolM = new THREE.MeshStandardMaterial({
    color: 0xC08050, roughness: 0.75, side: THREE.DoubleSide });
  const naqshM = new THREE.MeshStandardMaterial({ color: 0x7A4A2C, roughness: 0.85 });
  const olovM = new THREE.MeshStandardMaterial({
    color: 0xFFE9A8, emissive: 0xFFB627, emissiveIntensity: 1.6, roughness: 0.4 });
  const nurM = new THREE.MeshStandardMaterial({
    color: 0xFFD97A, emissive: 0xFFC24A, emissiveIntensity: 1.1,
    transparent: true, opacity: 0.34, depthWrite: false, roughness: 1.0 });

  /* Ko‘za tanasi — old tomonida tor yoriq qoldirilgan */
  const profil = [
    new THREE.Vector2(0.150, 0.000),
    new THREE.Vector2(0.175, 0.035),
    new THREE.Vector2(0.225, 0.130),
    new THREE.Vector2(0.247, 0.265),
    new THREE.Vector2(0.215, 0.385),
    new THREE.Vector2(0.168, 0.450),
    new THREE.Vector2(0.158, 0.495),
  ];
  const tana = new THREE.Mesh(
    new THREE.LatheGeometry(profil, 30, 0.17, Math.PI * 2 - 0.34), sopolM);
  tana.userData.yerda = true;
  ich.add(soya(tana, true));

  /* Ko‘za tubi */
  const tub = qosh(ich, new THREE.CylinderGeometry(0.150, 0.140, 0.030, 24), sopolM, 0, 0.015, 0);
  tub.userData.yerda = true;

  /* Ichkaridagi yonayotgan chiroq — piltali sopol chirog‘ */
  qosh(ich, new THREE.CylinderGeometry(0.075, 0.060, 0.045, 16), naqshM, 0, 0.055, 0);
  const alanga = qosh(ich, new THREE.SphereGeometry(0.070, 16, 12), olovM, 0, 0.150, 0);
  alanga.scale.set(0.85, 1.35, 0.85);
  const alangaUch = qosh(ich, new THREE.ConeGeometry(0.040, 0.110, 10), olovM, 0, 0.250, 0);

  /* Yoriqdan sizib chiqayotgan nur */
  const nur = qosh(ich, new THREE.BoxGeometry(0.060, 0.240, 0.230), nurM, 0, 0.230, 0.330);
  nur.castShadow = false;
  const nurTor = qosh(ich, new THREE.BoxGeometry(0.030, 0.300, 0.060), nurM, 0, 0.230, 0.235);
  nurTor.castShadow = false;

  /* Og‘iz halqasi va yopiq qopqoq */
  const halqa = qosh(ich, new THREE.TorusGeometry(0.160, 0.016, 8, 26), M.sopol(), 0, 0.495, 0);
  halqa.rotation.x = -Math.PI / 2;
  const qopqoq = qosh(ich, new THREE.SphereGeometry(0.168, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    M.sopol(), 0, 0.500, 0);
  qopqoq.scale.y = 0.48;
  qosh(ich, new THREE.SphereGeometry(0.042, 12, 10), naqshM, 0, 0.590, 0);

  /* Ko‘za yonidagi naqsh halqalari */
  for (const y of [0.120, 0.330]) {
    const n = qosh(ich, new THREE.TorusGeometry(y < 0.2 ? 0.222 : 0.234, 0.009, 6, 26), naqshM, 0, y, 0);
    n.rotation.x = -Math.PI / 2;
  }
  return tayyorla(ich, 1.15);
}

/* =========================================================
   11) QAYIQ — «O‘qish — oqimga qarshi suzishga o‘xshaydi:
   to‘xtading — orqaga ketasan». Yog‘och qayiq, ichida ikkita
   eshkak, orqasida to‘lqin izi.
   ========================================================= */
export function qayiqYasa() {
  const ich = new THREE.Group();
  const yogM = new THREE.MeshStandardMaterial({
    color: 0x9A7448, roughness: 0.86, side: THREE.DoubleSide });
  const yogT = M.yogochTuq();
  const yogO = M.yogochOch();
  const suvM = new THREE.MeshStandardMaterial({
    color: 0x3E7FB4, roughness: 0.3, transparent: true, opacity: 0.75 });

  const ENI = 0.560, CHUQ = 0.520, UZUN = 1.250;

  /* Qayiq gavdasi — uchlari o‘tkirlashtirilgan yarim ellipsoid */
  const geo = new THREE.SphereGeometry(0.5, 34, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  const poz = geo.attributes.position;
  for (let i = 0; i < poz.count; i++) {
    let x = poz.getX(i); const y = poz.getY(i), z = poz.getZ(i);
    const t = Math.min(1, Math.abs(z) / 0.5);
    x *= 1 - 0.55 * t * t;                 /* bosh va orqa o‘tkirlashadi */
    poz.setXYZ(i, x, y + 0.22 * t * t * t, z);   /* burun va quyruq ko‘tarilgan */
  }
  poz.needsUpdate = true;
  geo.computeVertexNormals();
  const gavda = new THREE.Mesh(geo, yogM);
  gavda.scale.set(ENI, CHUQ, UZUN);
  gavda.position.y = CHUQ * 0.5;
  gavda.userData.yerda = true;
  ich.add(soya(gavda, true));

  /* Berilgan balandlikdagi bort chizig‘i nuqtalari */
  function bortNuqtalari(yLokal, r, n) {
    const p = [];
    for (let i = 0; i < n; i++) {
      const th = (i / n) * Math.PI * 2;
      let x = r * Math.cos(th); const z = r * Math.sin(th);
      const t = Math.min(1, Math.abs(z) / 0.5);
      x *= 1 - 0.55 * t * t;
      p.push(new THREE.Vector3(x * ENI, (yLokal + 0.22 * t * t * t) * CHUQ + CHUQ * 0.5, z * UZUN));
    }
    return p;
  }

  /* Bort (gunvale) halqasi va yon taxta choklari */
  for (const [yL, r, rad, mm] of [[0, 0.500, 0.024, yogT], [-0.150, 0.477, 0.011, yogT],
                                   [-0.320, 0.384, 0.010, yogT]]) {
    const egri = new THREE.CatmullRomCurve3(bortNuqtalari(yL, r, 40), true);
    ich.add(soya(new THREE.Mesh(new THREE.TubeGeometry(egri, 60, rad, 8, true), mm)));
  }

  /* Ichki tag taxtasi */
  const tag = qosh(ich, new THREE.CircleGeometry(0.36, 24), yogO, 0, 0.085, 0);
  tag.rotation.x = -Math.PI / 2;
  tag.scale.set(0.62, 1.55, 1);
  tag.material.side = THREE.DoubleSide;

  /* Ikkita ko‘ndalang o‘rindiq */
  for (const z of [-0.230, 0.230]) {
    qosh(ich, new THREE.BoxGeometry(0.44, 0.030, 0.110), yogO, 0, 0.300, z);
  }

  /* Burun va quyruqdagi tik yog‘ochlar */
  for (const zn of [-1, 1]) {
    const post = qosh(ich, new THREE.BoxGeometry(0.045, 0.170, 0.075), yogT, 0, 0.400, zn * 0.590);
    post.rotation.x = zn * 0.25;
  }

  /* Eshkaklar — eshkak dastasi va yassi kurak */
  function eshkak(ax, az, bx, bz) {
    const a = new THREE.Vector3(ax, 0.340, az);
    const b = new THREE.Vector3(bx, 0.090, bz);
    tayoq(ich, yogO, a, b, 0.021, 0.017, 8);
    const yon = new THREE.Vector3().subVectors(b, a).normalize();
    const kurak = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.250, 0.020), yogT);
    kurak.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), yon);
    kurak.position.copy(b).addScaledVector(yon, 0.115);
    ich.add(soya(kurak));
    /* Dasta uchidagi tutqich */
    const tut = new THREE.Mesh(new THREE.CylinderGeometry(0.030, 0.030, 0.070, 10), yogT);
    tut.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), yon);
    tut.position.copy(a).addScaledVector(yon, -0.030);
    ich.add(soya(tut));
    /* Bortdagi eshkak tayanchi */
    qosh(ich, new THREE.CylinderGeometry(0.022, 0.022, 0.055, 8), yogT, ax * 0.62, 0.400, az * 0.9);
  }
  eshkak(-0.150, 0.130, -0.560, -0.320);
  eshkak(0.150, 0.130, 0.560, -0.320);

  /* Orqada qolgan to‘lqin izi */
  for (let i = 0; i < 3; i++) {
    const yoy = new THREE.Group();
    yoy.position.set(0, 0.010, -0.560);
    yoy.rotation.x = -Math.PI / 2;
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(0.180 + i * 0.100, 0.014, 6, 30, Math.PI * 0.72), suvM);
    m.rotation.z = Math.PI / 2 - Math.PI * 0.36;
    yoy.add(m);
    ich.add(yoy);
  }
  return tayyorla(ich, 1.45);
}

/* =========================================================
   12) OMOCH — xalq taqvimi: «Hamal — ekinlarga kirar amal».
   Qadimiy yog‘och omoch: egilgan dasta, tirgak, metall tishli
   uchi va bo‘yinturuq bog‘lanadigan uzun xoda.
   ========================================================= */
export function omochYasa() {
  const ich = new THREE.Group();
  const yog = M.yogoch(), yogT = M.yogochTuq(), yogO = M.yogochOch();
  const met = M.metall(), pol = M.poulat();
  const arqonM = new THREE.MeshStandardMaterial({ color: 0xC9A87A, roughness: 0.95 });

  /* Omoch tanasi — pastdan uchga, yuqoridan dastaga boradi */
  const tana = tayoq(ich, yog,
    new THREE.Vector3(0, 0.060, 0.360), new THREE.Vector3(0, 0.520, -0.200), 0.048, 0.040, 10);
  tana.userData.yerda = true;

  /* Metall tishli uch (omoch tishi) — yerga botadigan qismi */
  tayoq(ich, met, new THREE.Vector3(0, 0.120, 0.290),
    new THREE.Vector3(0, 0.030, 0.540), 0.072, 0.020, 8).userData.yerda = true;
  const tig = qosh(ich, new THREE.ConeGeometry(0.055, 0.150, 4), pol, 0, 0.020, 0.585);
  tig.rotation.set(Math.PI / 2 + 0.30, Math.PI / 4, 0);
  tig.userData.yerda = true;
  /* Tishni tanaga bog‘lovchi temir halqa */
  const bogHalqa = qosh(ich, new THREE.TorusGeometry(0.062, 0.014, 8, 18), met, 0, 0.135, 0.285);
  bogHalqa.rotation.set(1.05, 0, 0);

  /* Egilgan dasta */
  quvur(ich, yogO, [
    new THREE.Vector3(0, 0.330, 0.020),
    new THREE.Vector3(0, 0.550, -0.120),
    new THREE.Vector3(0, 0.780, -0.300),
    new THREE.Vector3(0, 0.930, -0.420),
  ], 0.032, 22, 10);

  /* Dasta uchidagi ko‘ndalang tutqich */
  const tutqich = qosh(ich, new THREE.CylinderGeometry(0.028, 0.028, 0.280, 10), yogT, 0, 0.945, -0.435);
  tutqich.rotation.z = Math.PI / 2;
  for (const yon of [-1, 1]) {
    qosh(ich, new THREE.SphereGeometry(0.034, 10, 8), yogT, yon * 0.140, 0.945, -0.435);
  }

  /* Bo‘yinturuq bog‘lanadigan uzun xoda */
  const xoda = tayoq(ich, yog,
    new THREE.Vector3(0, 0.140, 0.260), new THREE.Vector3(0, 0.600, 1.060), 0.038, 0.030, 10);

  /* Xodani tanaga tiraydigan tirgak */
  tayoq(ich, yogT, new THREE.Vector3(0, 0.230, 0.145),
    new THREE.Vector3(0, 0.430, 0.560), 0.024, 0.022, 8);
  /* Tirgakni mahkamlovchi yog‘och qoziqlar */
  for (const [y, z] of [[0.320, 0.400], [0.190, 0.205]]) {
    const q = qosh(ich, new THREE.CylinderGeometry(0.014, 0.010, 0.120, 6), yogT, 0, y, z);
    q.rotation.z = Math.PI / 2;
  }

  /* Xoda uchidagi bo‘yinturuq arqoni */
  const ilmoq = qosh(ich, new THREE.TorusGeometry(0.060, 0.014, 7, 20), arqonM, 0, 0.612, 1.030);
  ilmoq.rotation.set(0.52, 0, 0);
  quvur(ich, arqonM, [
    new THREE.Vector3(-0.055, 0.600, 1.030),
    new THREE.Vector3(-0.090, 0.520, 1.010),
    new THREE.Vector3(-0.070, 0.440, 1.045),
  ], 0.012, 12, 6);
  return tayyorla(ich, 1.45);
}

/* =========================================================
   13) O‘ROQ — «Asad — ekiningni yasat», hosil yig‘im-terimi.
   Egri metall tig‘, tig‘ning tishlari va yog‘och dasta.
   ========================================================= */
export function oroqYasa() {
  const ich = new THREE.Group();
  const met = M.metall(), pol = M.poulat();
  const yog = M.yogoch(), yogT = M.yogochTuq();

  /* Egri tig‘ — yassilangan halqa bo‘lagi */
  const markaz = new THREE.Vector3(-0.180, 0.310, 0);
  const tig = qosh(ich, new THREE.TorusGeometry(0.340, 0.030, 10, 44, Math.PI * 1.12), met,
    markaz.x, markaz.y, markaz.z);
  tig.scale.z = 0.30;

  /* Tig‘ning charxlangan ichki qirrasi */
  const qirra = qosh(ich, new THREE.TorusGeometry(0.308, 0.012, 8, 44, Math.PI * 1.12), pol,
    markaz.x, markaz.y, markaz.z);
  qirra.scale.z = 0.34;

  /* Qirradagi mayda tishlar — o‘roq tishi */
  for (let i = 0; i < 22; i++) {
    const a = 0.10 + (i / 22) * Math.PI * 1.02;
    const tish = qosh(ich, new THREE.ConeGeometry(0.011, 0.030, 4), pol,
      markaz.x + Math.cos(a) * 0.296, markaz.y + Math.sin(a) * 0.296, 0);
    tish.rotation.z = a + Math.PI / 2;
    tish.scale.z = 0.4;
  }

  /* Tig‘ uchidagi o‘tkir burun */
  const burun = qosh(ich, new THREE.ConeGeometry(0.030, 0.090, 6), pol,
    markaz.x + Math.cos(Math.PI * 1.12) * 0.340, markaz.y + Math.sin(Math.PI * 1.12) * 0.340, 0);
  burun.rotation.z = Math.PI * 1.12 + Math.PI / 2;
  burun.scale.z = 0.35;

  /* Yog‘och dasta */
  tayoq(ich, yog, new THREE.Vector3(0.152, 0.318, 0),
    new THREE.Vector3(0.205, 0.012, 0), 0.042, 0.050, 12).userData.yerda = true;

  /* Dastani tig‘ga biriktiruvchi temir g‘ilof */
  const gilof = qosh(ich, new THREE.CylinderGeometry(0.048, 0.044, 0.075, 12), met, 0.158, 0.290, 0);
  gilof.rotation.z = -0.17;

  /* Dastadagi ushlash halqalari */
  for (const [y, x] of [[0.210, 0.177], [0.110, 0.194]]) {
    const h = qosh(ich, new THREE.TorusGeometry(0.047, 0.010, 6, 18), yogT, x, y, 0);
    h.rotation.set(Math.PI / 2, 0, -0.17);
  }
  return tayyorla(ich, 1.20);
}

/* =========================================================
   14) QATIQ KO‘ZASI — kimyoviy bilimlar: sutdan qatiq, qaymoq
   va sariyog‘ olish. Keng og‘izli sopol ko‘za, ichida oq qatiq
   yuzasi, unga tiralgan yog‘och kapgir.
   ========================================================= */
export function qatiqKozaYasa() {
  const ich = new THREE.Group();
  const sopolM = M.sopol(), sopolO = M.sopolOch();
  const naqshM = new THREE.MeshStandardMaterial({ color: 0x6E4326, roughness: 0.85 });
  const qatiqM = new THREE.MeshStandardMaterial({ color: 0xFAF8F1, roughness: 0.62 });
  const yogO = M.yogochOch(), yogT = M.yogochTuq();

  /* Keng og‘izli ko‘za */
  const profil = [
    new THREE.Vector2(0.000, 0.000),
    new THREE.Vector2(0.155, 0.000),
    new THREE.Vector2(0.185, 0.045),
    new THREE.Vector2(0.258, 0.145),
    new THREE.Vector2(0.300, 0.262),
    new THREE.Vector2(0.316, 0.365),
    new THREE.Vector2(0.326, 0.445),
    new THREE.Vector2(0.302, 0.478),
  ];
  const koza = new THREE.Mesh(new THREE.LatheGeometry(profil, 30), sopolM);
  koza.userData.yerda = true;
  ich.add(soya(koza, true));

  /* Og‘iz halqasi (jiyagi) */
  const ogiz = qosh(ich, new THREE.TorusGeometry(0.318, 0.020, 8, 28), sopolO, 0, 0.472, 0);
  ogiz.rotation.x = -Math.PI / 2;

  /* Ichidagi qatiq yuzasi — bir oz gumbazsimon */
  const yuza = qosh(ich, new THREE.SphereGeometry(0.295, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    qatiqM, 0, 0.400, 0);
  yuza.scale.y = 0.16;
  qosh(ich, new THREE.CylinderGeometry(0.298, 0.290, 0.040, 26), qatiqM, 0, 0.385, 0);

  /* Qatiq yuzasidagi qaymoq pufakchalari */
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.4;
    const r = 0.09 + (i % 3) * 0.06;
    const p = qosh(ich, new THREE.SphereGeometry(0.030 - (i % 3) * 0.006, 10, 8), qatiqM,
      Math.cos(a) * r, 0.418, Math.sin(a) * r);
    p.scale.y = 0.45;
  }

  /* Ko‘zadagi naqsh belbog‘lari */
  for (const [y, r] of [[0.150, 0.262], [0.300, 0.310]]) {
    const n = qosh(ich, new THREE.TorusGeometry(r, 0.010, 6, 28), naqshM, 0, y, 0);
    n.rotation.x = -Math.PI / 2;
  }
  /* Belbog‘lar orasidagi to‘lqinsimon naqsh */
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const t = qosh(ich, new THREE.SphereGeometry(0.026, 8, 6), naqshM,
      Math.cos(a) * 0.300, 0.225, Math.sin(a) * 0.300);
    t.scale.set(0.35, 1.5, 0.35);
  }

  /* Yog‘och kapgir (cho‘mich) — ko‘zaga tiralgan */
  const dastaA = new THREE.Vector3(0.135, 0.400, 0.115);
  const dastaB = new THREE.Vector3(0.560, 0.760, 0.185);
  tayoq(ich, yogO, dastaA, dastaB, 0.022, 0.019, 10);
  const kosa = qosh(ich, new THREE.SphereGeometry(0.095, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    yogT, 0.115, 0.395, 0.105);
  kosa.rotation.x = Math.PI - 0.5;
  kosa.scale.set(1, 0.75, 1);
  /* Dasta uchidagi ilgak */
  const ilgak = qosh(ich, new THREE.TorusGeometry(0.032, 0.010, 6, 16, Math.PI * 1.4), yogT,
    0.585, 0.790, 0.190);
  ilgak.rotation.set(0, 0.4, 0.7);
  return tayyorla(ich, 1.20);
}

/* =========================================================
   15) QUYOSH SOATI — astronomiya: quyosh va yulduzlarga qarab
   vaqtni aniqlash. Dumaloq tosh ciferblat, markazida soya
   tashlovchi uchburchak til (gnomon), atrofida bo‘linishlar.
   ========================================================= */
export function quyoshSoatiYasa() {
  const ich = new THREE.Group();
  const toshM = M.tosh(), toshT = M.toshTuq();
  const chiziqM = new THREE.MeshStandardMaterial({ color: 0x4C5057, roughness: 0.95 });

  /* Tosh oyoq (poydevor) */
  const oyoq = qosh(ich, new THREE.CylinderGeometry(0.240, 0.285, 0.090, 20), toshT, 0, 0.045, 0);
  oyoq.userData.yerda = true;

  /* Dumaloq ciferblat */
  const blat = qosh(ich, new THREE.CylinderGeometry(0.500, 0.495, 0.075, 40), toshM, 0, 0.128, 0);
  blat.userData.yerda = true;
  const jiyak = qosh(ich, new THREE.TorusGeometry(0.500, 0.022, 8, 40), toshT, 0, 0.160, 0);
  jiyak.rotation.x = -Math.PI / 2;

  /* Soat bo‘linish chiziqlari */
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const uzun = (i % 3 === 0) ? 0.280 : 0.180;
    const ch = qosh(ich, new THREE.BoxGeometry(0.018, 0.014, uzun), chiziqM,
      Math.cos(a) * (0.460 - uzun / 2), 0.166, Math.sin(a) * (0.460 - uzun / 2));
    ch.rotation.y = -a;
    /* Chekkadagi bo‘linish toshchalari */
    const t = qosh(ich, new THREE.CylinderGeometry(0.030, 0.026, 0.040, 6), toshT,
      Math.cos(a) * 0.455, 0.183, Math.sin(a) * 0.455);
  }

  /* Markaziy halqa */
  const halqa = qosh(ich, new THREE.TorusGeometry(0.085, 0.014, 6, 24), chiziqM, 0, 0.168, 0);
  halqa.rotation.x = -Math.PI / 2;

  /* Gnomon — soya tashlovchi uchburchak til */
  const s = new THREE.Shape();
  s.moveTo(-0.300, 0.000);
  s.lineTo(0.265, 0.000);
  s.lineTo(-0.300, 0.420);
  s.closePath();
  const gnGeo = new THREE.ExtrudeGeometry(s, { depth: 0.040, bevelEnabled: false });
  gnGeo.translate(0, 0, -0.020);
  const gnomon = new THREE.Mesh(gnGeo, toshT);
  gnomon.rotation.y = Math.PI / 2;
  gnomon.position.set(0, 0.164, 0);
  ich.add(soya(gnomon));

  /* Gnomon tagligi */
  qosh(ich, new THREE.BoxGeometry(0.075, 0.030, 0.600), toshM, 0, 0.170, 0.020);
  return tayyorla(ich, 1.25);
}

/* =========================================================
   16) DORIVOR GIYOH — tibbiyot bilimlari: dorivor o‘simliklarni
   tanish, terish va quritish. Ip bilan bog‘langan quruq giyohlar
   bog‘lami: poyalar, bargchalar va ikkita kichik gul.
   ========================================================= */
export function dorivorGiyohYasa() {
  const ich = new THREE.Group();
  const poyaM = new THREE.MeshStandardMaterial({ color: 0x86924F, roughness: 0.95 });
  const poyaQ = new THREE.MeshStandardMaterial({ color: 0x9C8B4F, roughness: 0.95 });
  const bargM = new THREE.MeshStandardMaterial({
    color: 0x77864A, roughness: 0.94, side: THREE.DoubleSide });
  const gulM = new THREE.MeshStandardMaterial({ color: 0xB07AB0, roughness: 0.85 });
  const gulYurak = new THREE.MeshStandardMaterial({ color: 0xE0C24C, roughness: 0.8 });
  const ipM = new THREE.MeshStandardMaterial({ color: 0xD8C79E, roughness: 0.98 });

  const bargGeo = naqshGeo(bargShakli(0.030, 0.105), 0.005);
  const POYA = 9;
  const uchlar = [];

  /* Poyalar — pastda yig‘ilgan, tepada yoyilgan */
  for (let i = 0; i < POYA; i++) {
    const a = (i / POYA) * Math.PI * 2;
    const r0 = 0.045 + (i % 2) * 0.012;
    const r1 = 0.185 + (i % 3) * 0.055;
    const boy = 0.800 + (i % 4) * 0.048;
    const uch = new THREE.Vector3(Math.cos(a) * r1, boy, Math.sin(a) * r1 * 0.8);
    uchlar.push(uch);
    quvur(ich, (i % 3 === 0) ? poyaQ : poyaM, [
      new THREE.Vector3(Math.cos(a) * r0 * 1.4, 0.000, Math.sin(a) * r0 * 1.1),
      new THREE.Vector3(Math.cos(a) * r0 * 0.5, 0.180, Math.sin(a) * r0 * 0.4),
      new THREE.Vector3(Math.cos(a) * r0 * 0.4, 0.320, Math.sin(a) * r0 * 0.3),
      new THREE.Vector3(Math.cos(a) * r1 * 0.55, 0.560, Math.sin(a) * r1 * 0.45),
      uch,
    ], 0.011, 22, 6);

    /* Har poyada ikkita bargcha */
    for (let k = 0; k < 2; k++) {
      const t = 0.52 + k * 0.24;
      const p = new THREE.Vector3(
        Math.cos(a) * r1 * (0.35 + t * 0.6), 0.360 + t * 0.480, Math.sin(a) * r1 * (0.30 + t * 0.5));
      const bg = new THREE.Group();
      bg.position.copy(p);
      bg.rotation.set(0.25, -a + (k ? 1.1 : -1.1), (k ? 1 : -1) * 0.85);
      const b = new THREE.Mesh(bargGeo, bargM);
      b.position.set(0, 0.052, 0);
      bg.add(soya(b));
      ich.add(bg);
    }
  }

  /* Ikkita kichik gul — ikki poyaning uchida */
  for (const idx of [0, 4]) {
    const p = uchlar[idx];
    qosh(ich, new THREE.SphereGeometry(0.028, 12, 10), gulYurak, p.x, p.y + 0.030, p.z);
    for (let k = 0; k < 5; k++) {
      const b = (k / 5) * Math.PI * 2;
      const gul = qosh(ich, new THREE.SphereGeometry(0.030, 10, 8), gulM,
        p.x + Math.cos(b) * 0.042, p.y + 0.028, p.z + Math.sin(b) * 0.042);
      gul.scale.set(1, 0.42, 1);
      gul.rotation.y = b;
    }
  }

  /* Bog‘lam ipi — o‘ralgan halqalar va osilgan uchlari */
  for (let i = 0; i < 3; i++) {
    const h = qosh(ich, new THREE.TorusGeometry(0.062 + i * 0.004, 0.011, 6, 22), ipM,
      0, 0.270 + i * 0.030, 0);
    h.rotation.set(-Math.PI / 2 + 0.10 * (i - 1), 0, 0);
  }
  quvur(ich, ipM, [
    new THREE.Vector3(0.060, 0.300, 0.030),
    new THREE.Vector3(0.115, 0.240, 0.055),
    new THREE.Vector3(0.100, 0.170, 0.030),
  ], 0.008, 12, 6);
  quvur(ich, ipM, [
    new THREE.Vector3(-0.055, 0.290, -0.035),
    new THREE.Vector3(-0.105, 0.215, -0.060),
    new THREE.Vector3(-0.080, 0.150, -0.030),
  ], 0.008, 12, 6);
  return tayyorla(ich, 1.25);
}

/* =========================================================
   17) KULOL CHARXI — hunarmandchilik: kulolchilik usullari.
   Aylanadigan past yog‘och charx, markazida shakllanayotgan
   loy ko‘za, yonida suv kosasi.
   ========================================================= */
export function kulolCharxiYasa() {
  const ich = new THREE.Group();
  const yog = M.yogoch(), yogT = M.yogochTuq(), yogO = M.yogochOch();
  const loyM = new THREE.MeshStandardMaterial({
    color: 0x9C6E4E, roughness: 0.95, side: THREE.DoubleSide });
  const loyHol = new THREE.MeshStandardMaterial({ color: 0x8A5F42, roughness: 0.98 });

  /* Yerdagi taglik va o‘q */
  const taglik = qosh(ich, new THREE.CylinderGeometry(0.170, 0.190, 0.035, 16), yogT, 0, 0.018, 0);
  taglik.userData.yerda = true;
  qosh(ich, new THREE.CylinderGeometry(0.046, 0.050, 0.110, 12), yogT, 0, 0.090, 0);

  /* Charx — past yog‘och disk */
  const charx = qosh(ich, new THREE.CylinderGeometry(0.460, 0.445, 0.055, 36), yog, 0, 0.172, 0);
  const jiyak = qosh(ich, new THREE.TorusGeometry(0.460, 0.020, 8, 36), yogT, 0, 0.172, 0);
  jiyak.rotation.x = -Math.PI / 2;

  /* Charxdagi taxta choklari */
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI;
    const ch = qosh(ich, new THREE.BoxGeometry(0.012, 0.008, 0.880), yogT, 0, 0.201, 0);
    ch.rotation.y = a;
  }

  /* Charx markazidagi loy uyumi */
  const uyum = qosh(ich, new THREE.CylinderGeometry(0.240, 0.265, 0.055, 24), loyHol, 0, 0.227, 0);

  /* Shakllanayotgan loy ko‘za — og‘zi ochiq */
  const profil = [
    new THREE.Vector2(0.000, 0.250),
    new THREE.Vector2(0.215, 0.250),
    new THREE.Vector2(0.228, 0.305),
    new THREE.Vector2(0.212, 0.390),
    new THREE.Vector2(0.180, 0.470),
    new THREE.Vector2(0.166, 0.530),
    new THREE.Vector2(0.172, 0.568),
  ];
  const koza = new THREE.Mesh(new THREE.LatheGeometry(profil, 28), loyM);
  ich.add(soya(koza));

  /* Kulol barmog‘i qoldirgan aylana izlar */
  for (let i = 0; i < 5; i++) {
    const y = 0.300 + i * 0.058;
    const r = 0.228 - i * 0.014;
    const iz = qosh(ich, new THREE.TorusGeometry(r, 0.006, 5, 26), loyHol, 0, y, 0);
    iz.rotation.x = -Math.PI / 2;
  }
  /* Ko‘za og‘zidagi notekis jiyak */
  const ogiz = qosh(ich, new THREE.TorusGeometry(0.170, 0.010, 6, 24), loyHol, 0, 0.566, 0);
  ogiz.rotation.set(-Math.PI / 2, 0.06, 0);

  /* Yonidagi suv kosasi */
  const kosaProfil = [
    new THREE.Vector2(0.000, 0.000),
    new THREE.Vector2(0.090, 0.000),
    new THREE.Vector2(0.130, 0.035),
    new THREE.Vector2(0.155, 0.095),
    new THREE.Vector2(0.150, 0.110),
    new THREE.Vector2(0.126, 0.052),
    new THREE.Vector2(0.000, 0.020),
  ];
  const kosa = new THREE.Mesh(new THREE.LatheGeometry(kosaProfil, 22), M.sopol());
  kosa.position.set(0.640, 0, 0.180);
  kosa.userData.yerda = true;
  ich.add(soya(kosa, true));
  const suv = qosh(ich, new THREE.CylinderGeometry(0.132, 0.120, 0.012, 20), M.suv(), 0.640, 0.078, 0.180);

  /* Kosa yonidagi ho‘l latta */
  const latta = qosh(ich, new THREE.BoxGeometry(0.130, 0.022, 0.090), M.mato(0xB9AE97), 0.480, 0.011, 0.330);
  latta.rotation.set(0.05, 0.5, 0.03);
  latta.userData.yerda = true;
  return tayyorla(ich, 1.30);
}

/* =========================================================
   18) GANCH PANJARA — ganch o‘ymakorligi. Oq ganch panel:
   ramka ichida torlar kesishuvidan hosil bo‘lgan yulduzsimon
   geometrik panjara, qalinligi bilan.
   ========================================================= */
export function ganchPanjaraYasa() {
  const ich = new THREE.Group();
  const ganchM = M.ganch();
  const ganchS = new THREE.MeshStandardMaterial({ color: 0xE2DCCC, roughness: 0.9 });

  const YM = 0.545;                 /* panjara markazining balandligi */
  const S = 0.700;                  /* ichki maydon tomoni */
  const K = S * Math.SQRT1_2;       /* diagonal yarim uzunligi */

  /* Tagkursi */
  const kursi = qosh(ich, new THREE.BoxGeometry(0.950, 0.090, 0.200), ganchS, 0, 0.045, 0);
  kursi.userData.yerda = true;

  /* Ramka */
  for (const [w, h, x, y] of [[0.850, 0.075, 0, 0.128], [0.850, 0.075, 0, 0.963],
                               [0.075, 0.910, -0.388, 0.545], [0.075, 0.910, 0.388, 0.545]]) {
    qosh(ich, new THREE.BoxGeometry(w, h, 0.100), ganchM, x, y, 0);
  }
  /* Ramkadagi nozik hoshiya */
  for (const [w, h, x, y] of [[0.850, 0.014, 0, 0.166], [0.850, 0.014, 0, 0.925],
                               [0.014, 0.760, -0.350, 0.545], [0.014, 0.760, 0.350, 0.545]]) {
    qosh(ich, new THREE.BoxGeometry(w, h, 0.108), ganchS, x, y, 0);
  }

  /* Panjara tori qo‘shuvchi yordamchi */
  function tor(uzun, x, y, burchak) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(uzun, 0.030, 0.058), ganchM);
    b.position.set(x, y, 0);
    b.rotation.z = burchak;
    ich.add(soya(b));
  }

  /* Tik va ko‘ndalang torlar */
  for (const t of [-0.175, 0, 0.175]) {
    tor(S, 0, YM + t, 0);
    tor(S, t, YM, Math.PI / 2);
  }

  /* Ikki yo‘nalishdagi diagonal torlar — kesishuvidan yulduz hosil bo‘ladi */
  for (const t of [-0.330, -0.165, 0, 0.165, 0.330]) {
    const uzun = 2 * (K - Math.abs(t));
    if (uzun < 0.05) continue;
    const d = t * Math.SQRT1_2;
    tor(uzun, -d, YM + d, Math.PI / 4);
    tor(uzun, d, YM + d, -Math.PI / 4);
  }

  /* Kesishuvlardagi kichik yulduz rozetkalar */
  for (const [x, y, r] of [[0, YM, 0.062], [-0.175, YM + 0.175, 0.040], [0.175, YM + 0.175, 0.040],
                            [-0.175, YM - 0.175, 0.040], [0.175, YM - 0.175, 0.040]]) {
    const roz = qosh(ich, naqshGeo(yulduzShakli(r, r * 0.45, 8), 0.070), ganchS, x, y, 0);
  }

  /* Ramka burchaklaridagi bezak tugmalar */
  for (const x of [-0.388, 0.388]) {
    for (const y of [0.128, 0.963]) {
      const t = qosh(ich, new THREE.CylinderGeometry(0.042, 0.042, 0.112, 10), ganchS, x, y, 0);
      t.rotation.x = Math.PI / 2;
    }
  }
  return tayyorla(ich, 1.30);
}

/* =========================================================
   19) O‘YMAKOR ESHIK — yog‘och o‘ymakorligi hunari.
   Ikki tavaqali o‘yma eshik: yon ustunchalar, tepa xoda,
   tavaqalardagi naqsh chuqurchalari va mis halqa tutqichlar.
   ========================================================= */
export function oymakorEshikYasa() {
  const ich = new THREE.Group();
  const yog = M.yogoch(), yogT = M.yogochTuq(), yogO = M.yogochOch();
  const misM = M.mis();

  /* Bo‘sag‘a */
  const bosaga = qosh(ich, new THREE.BoxGeometry(1.000, 0.060, 0.230), yogT, 0, 0.030, 0);
  bosaga.userData.yerda = true;

  /* Yon ustunchalar — yo‘nilgan halqalari bilan */
  for (const yon of [-1, 1]) {
    const ustun = qosh(ich, new THREE.CylinderGeometry(0.055, 0.058, 0.940, 14), yog, yon * 0.420, 0.530, 0);
    for (const y of [0.150, 0.530, 0.910]) {
      const h = qosh(ich, new THREE.TorusGeometry(0.060, 0.016, 8, 18), yogT, yon * 0.420, y, 0);
      h.rotation.x = -Math.PI / 2;
    }
    /* Ustun boshi (kapitel) */
    qosh(ich, new THREE.CylinderGeometry(0.078, 0.062, 0.070, 14), yogT, yon * 0.420, 1.035, 0);
  }

  /* Tepa xoda va uning ustidagi o‘yma hoshiya */
  qosh(ich, new THREE.BoxGeometry(1.020, 0.100, 0.170), yog, 0, 1.100, 0);
  const hoshiya = qosh(ich, new THREE.BoxGeometry(1.060, 0.050, 0.200), yogT, 0, 1.170, 0);
  for (let i = 0; i < 11; i++) {
    const t = qosh(ich, new THREE.BoxGeometry(0.050, 0.036, 0.036), yogO, -0.450 + i * 0.090, 1.130, 0.098);
    t.rotation.z = (i % 2 ? 1 : -1) * 0.75;
  }

  /* Ikki tavaqa */
  for (const yon of [-1, 1]) {
    const tavaqa = qosh(ich, new THREE.BoxGeometry(0.380, 0.880, 0.055), yog, yon * 0.195, 0.500, 0);
    tavaqa.userData.yerda = true;

    /* Tavaqadagi ikkita botiq naqsh maydoni */
    for (const y of [0.290, 0.720]) {
      qosh(ich, new THREE.BoxGeometry(0.300, 0.330, 0.014), yogT, yon * 0.195, y, 0.029);
      const roz = qosh(ich, naqshGeo(yulduzShakli(0.105, 0.048, 8), 0.020), yogO, yon * 0.195, y, 0.038);
      const halqa = qosh(ich, new THREE.TorusGeometry(0.125, 0.010, 6, 22), yogO, yon * 0.195, y, 0.032);
    }

    /* Maydonlar orasidagi o‘yma belbog‘ */
    qosh(ich, new THREE.BoxGeometry(0.340, 0.045, 0.016), yogT, yon * 0.195, 0.505, 0.030);
    for (let i = 0; i < 4; i++) {
      const b = qosh(ich, new THREE.SphereGeometry(0.022, 8, 6), yogO,
        yon * 0.195 + (-0.12 + i * 0.08), 0.505, 0.036);
      b.scale.set(1, 1, 0.5);
    }

    /* Tavaqa chetidagi nozik hoshiya */
    for (const [w, h, dx, dy] of [[0.360, 0.014, 0, 0.415], [0.360, 0.014, 0, -0.415],
                                   [0.014, 0.840, -0.178, 0], [0.014, 0.840, 0.178, 0]]) {
      qosh(ich, new THREE.BoxGeometry(w, h, 0.062), yogT, yon * 0.195 + dx, 0.500 + dy, 0);
    }

    /* Mis halqa tutqich */
    const tayanch = qosh(ich, new THREE.CylinderGeometry(0.030, 0.034, 0.045, 10), misM,
      yon * 0.085, 0.560, 0.050);
    tayanch.rotation.x = Math.PI / 2;
    const halqa = qosh(ich, new THREE.TorusGeometry(0.058, 0.013, 8, 22), misM, yon * 0.085, 0.500, 0.066);
    halqa.rotation.x = 0.35;
  }

  /* Tavaqalar orasidagi qoq (o‘rta ustun) */
  qosh(ich, new THREE.BoxGeometry(0.030, 0.880, 0.070), yogT, 0, 0.500, 0);
  return tayyorla(ich, 1.35);
}

/* =========================================================
   20) ZARDO‘ZI CHOPON — zardo‘zlik hunari. Baxmal chopon:
   yelka va yeng shakli, oldi ochiq, jiyaklari zar iplar bilan
   tikilgan, yuzasida oltin gul naqshlari.
   ========================================================= */
export function zardoziChoponYasa() {
  const ich = new THREE.Group();
  const baxmal = new THREE.MeshStandardMaterial({
    color: 0x2A2258, roughness: 0.92, side: THREE.DoubleSide });
  const baxmalIch = new THREE.MeshStandardMaterial({ color: 0x7A2B2B, roughness: 0.95 });
  const zar = M.oltin();

  const OCHIQ = 0.34;                       /* oldingi ochiq burchagi (yarim) */
  const profil = [
    [0.268, 0.000], [0.264, 0.070], [0.252, 0.220], [0.234, 0.400],
    [0.214, 0.560], [0.192, 0.700], [0.168, 0.800], [0.152, 0.860],
  ];

  /* Balandlikka mos radius */
  function radius(y) {
    for (let i = 1; i < profil.length; i++) {
      if (y <= profil[i][1]) {
        const t = (y - profil[i - 1][1]) / (profil[i][1] - profil[i - 1][1] || 1);
        return profil[i - 1][0] + (profil[i][0] - profil[i - 1][0]) * t;
      }
    }
    return profil[profil.length - 1][0];
  }

  /* Chopon gavdasi — oldi ochiq aylanma yuza */
  const nuqtalar = profil.map((p) => new THREE.Vector2(p[0], p[1]));
  const gavda = new THREE.Mesh(
    new THREE.LatheGeometry(nuqtalar, 32, OCHIQ, Math.PI * 2 - OCHIQ * 2), baxmal);
  gavda.userData.yerda = true;
  ich.add(soya(gavda, true));

  /* Chopon etagi — ichki astar ko‘rinib turadi */
  const astar = new THREE.Mesh(
    new THREE.LatheGeometry(nuqtalar.map((p) => new THREE.Vector2(p.x * 0.96, p.y)), 26,
      OCHIQ + 0.05, Math.PI * 2 - (OCHIQ + 0.05) * 2), baxmalIch);
  ich.add(soya(astar));

  /* Berilgan burchak-balandlikdagi jiyak egrisi */
  function jiyakNuq(th0, th1, y0, y1, n, kkoef) {
    const p = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const th = th0 + (th1 - th0) * t;
      const y = y0 + (y1 - y0) * t;
      const r = radius(y) * (kkoef || 1.03);
      p.push(new THREE.Vector3(Math.sin(th) * r, y, Math.cos(th) * r));
    }
    return p;
  }

  /* Etak jiyagi — zar ip */
  quvur(ich, zar, jiyakNuq(OCHIQ, Math.PI * 2 - OCHIQ, 0.018, 0.018, 40), 0.014, 44, 8);
  /* Oldingi ikki chetidagi zar jiyak */
  quvur(ich, zar, jiyakNuq(OCHIQ, OCHIQ, 0.010, 0.845, 18), 0.014, 22, 8);
  quvur(ich, zar, jiyakNuq(-OCHIQ, -OCHIQ, 0.010, 0.845, 18), 0.014, 22, 8);
  /* Bo‘yin jiyagi */
  quvur(ich, zar, jiyakNuq(OCHIQ + 0.02, Math.PI * 2 - OCHIQ - 0.02, 0.845, 0.845, 30), 0.013, 34, 8);

  /* Yoqa — bo‘yin atrofidagi baxmal halqa */
  const yoqa = new THREE.Mesh(
    new THREE.LatheGeometry([
      new THREE.Vector2(0.150, 0.855), new THREE.Vector2(0.178, 0.905),
      new THREE.Vector2(0.170, 0.935),
    ], 26, OCHIQ + 0.06, Math.PI * 2 - (OCHIQ + 0.06) * 2), baxmal);
  ich.add(soya(yoqa));

  /* Yenglar */
  for (const yon of [-1, 1]) {
    const a = new THREE.Vector3(yon * 0.180, 0.790, 0.010);
    const b = new THREE.Vector3(yon * 0.360, 0.600, 0.040);
    const c = new THREE.Vector3(yon * 0.505, 0.365, 0.060);
    qosh(ich, new THREE.SphereGeometry(0.115, 16, 12), baxmal, a.x, a.y, a.z);
    tayoq(ich, baxmal, a, b, 0.108, 0.092, 14);
    qosh(ich, new THREE.SphereGeometry(0.093, 14, 10), baxmal, b.x, b.y, b.z);
    tayoq(ich, baxmal, b, c, 0.092, 0.074, 14);

    /* Yeng og‘zidagi zar halqa */
    const yon2 = new THREE.Vector3().subVectors(c, b).normalize();
    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.076, 0.014, 8, 22), zar);
    cuff.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), yon2);
    cuff.position.copy(c);
    ich.add(soya(cuff));
    /* Yengdagi zar gul */
    const gulY = new THREE.Mesh(naqshGeo(yulduzShakli(0.048, 0.021, 6), 0.010), zar);
    gulY.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(yon * 0.55, 0.35, 0.76).normalize());
    gulY.position.set(yon * 0.415, 0.505, 0.105);
    ich.add(soya(gulY));
  }

  /* Gavdadagi oltin gul naqshlari */
  const gulGeo = naqshGeo(yulduzShakli(0.052, 0.023, 6), 0.010);
  const yurakGeo = new THREE.SphereGeometry(0.018, 10, 8);
  const joylar = [
    [0.95, 0.170], [0.95, 0.480], [0.95, 0.700],
    [-0.95, 0.170], [-0.95, 0.480], [-0.95, 0.700],
    [Math.PI, 0.250], [Math.PI, 0.560], [Math.PI - 0.85, 0.380], [Math.PI + 0.85, 0.380],
    [1.9, 0.300], [-1.9, 0.300],
  ];
  for (const [th, y] of joylar) {
    const r = radius(y);
    const norm = new THREE.Vector3(Math.sin(th), 0.08, Math.cos(th)).normalize();
    const gul = new THREE.Mesh(gulGeo, zar);
    gul.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), norm);
    gul.position.set(Math.sin(th) * r * 1.035, y, Math.cos(th) * r * 1.035);
    ich.add(soya(gul));
    const yurak = new THREE.Mesh(yurakGeo, zar);
    yurak.position.set(Math.sin(th) * r * 1.06, y, Math.cos(th) * r * 1.06);
    ich.add(soya(yurak));
  }
  return tayyorla(ich, 1.30);
}

/* =========================================================
   21) SUV TEGIRMONI — fizika bilimlari: suv va shamol kuchidan
   foydalanish. Kurakchali yog‘och g‘ildirak, o‘qi, tayanch
   ustunlari va pastdagi suv oqimi.
   ========================================================= */
export function suvTegirmoniYasa() {
  const ich = new THREE.Group();
  const yog = M.yogoch(), yogT = M.yogochTuq(), yogO = M.yogochOch();
  const met = M.metall();
  const suvM = new THREE.MeshStandardMaterial({
    color: 0x3E7FB4, roughness: 0.28, transparent: true, opacity: 0.82 });
  const kopik = new THREE.MeshStandardMaterial({ color: 0xE8F1F7, roughness: 0.6 });

  const YM = 0.520;                 /* g‘ildirak o‘qining balandligi */

  /* Suv oqimi */
  const suv = qosh(ich, new THREE.BoxGeometry(0.980, 0.030, 0.560), suvM, 0, 0.015, 0);
  suv.userData.yerda = true;
  for (let i = 0; i < 4; i++) {
    qosh(ich, new THREE.BoxGeometry(0.880, 0.012, 0.020), kopik, 0, 0.032, -0.210 + i * 0.140);
  }
  /* Kurak urgan joydagi ko‘pik */
  for (let i = 0; i < 6; i++) {
    const p = qosh(ich, new THREE.SphereGeometry(0.030 + (i % 3) * 0.012, 10, 8), kopik,
      -0.060 + (i % 3) * 0.070, 0.045 + (i % 2) * 0.035, -0.180 + i * 0.070);
    p.scale.y = 0.7;
  }

  /* Ikki yon halqa (obod) */
  for (const z of [-0.170, 0.170]) {
    qosh(ich, new THREE.TorusGeometry(0.400, 0.032, 10, 40), yog, 0, YM, z);
  }

  /* G‘ildirak markazidagi kundakor va o‘q */
  const kundakor = qosh(ich, new THREE.CylinderGeometry(0.080, 0.080, 0.400, 14), yogT, 0, YM, 0);
  kundakor.rotation.x = Math.PI / 2;
  const oq = qosh(ich, new THREE.CylinderGeometry(0.034, 0.034, 0.760, 12), met, 0, YM, 0);
  oq.rotation.x = Math.PI / 2;

  /* Parraklar (spitsalar) */
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI;
    for (const z of [-0.170, 0.170]) {
      const sp = qosh(ich, new THREE.BoxGeometry(0.030, 0.800, 0.028), yogO, 0, YM, z);
      sp.rotation.z = a;
    }
  }

  /* Kurakchalar — suvni ilib oladigan taxtachalar */
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const kur = qosh(ich, new THREE.BoxGeometry(0.024, 0.180, 0.380), yogO,
      Math.cos(a) * 0.395, YM + Math.sin(a) * 0.395, 0);
    kur.rotation.z = a - Math.PI / 2;
    /* Kurakchani halqaga bog‘lovchi mixlar */
    const mix = qosh(ich, new THREE.CylinderGeometry(0.012, 0.012, 0.400, 6), met,
      Math.cos(a) * 0.400, YM + Math.sin(a) * 0.400, 0);
    mix.rotation.x = Math.PI / 2;
  }

  /* Tayanch ustunlari va yostiqlari */
  for (const z of [-0.330, 0.330]) {
    const ust = qosh(ich, new THREE.BoxGeometry(0.085, YM, 0.100), yogT, 0, YM / 2, z);
    ust.userData.yerda = true;
    qosh(ich, new THREE.BoxGeometry(0.150, 0.100, 0.150), yog, 0, YM, z);
    /* Qiya tirgaklar */
    for (const yon of [-1, 1]) {
      tayoq(ich, yogT, new THREE.Vector3(yon * 0.300, 0.020, z),
        new THREE.Vector3(yon * 0.045, YM - 0.090, z), 0.026, 0.022, 8).userData.yerda = true;
    }
  }
  return tayyorla(ich, 1.30);
}

/* =========================================================
   22) TAROZI — matematik bilimlar: masofa, hosil va uy
   o‘lchamini o‘lchash. Ikki pallali qadimiy tarozi: tik ustun,
   ko‘ndalang richag, zanjirchalar, mis pallalar va tosh gir.
   ========================================================= */
export function taroziYasa() {
  const ich = new THREE.Group();
  const yog = M.yogoch(), yogT = M.yogochTuq();
  const misM = M.mis(), met = M.metall();
  const toshM = M.toshTuq();

  /* Poydevor */
  const kursi = qosh(ich, new THREE.BoxGeometry(0.360, 0.055, 0.280), yogT, 0, 0.028, 0);
  kursi.userData.yerda = true;
  qosh(ich, new THREE.BoxGeometry(0.270, 0.045, 0.210), yog, 0, 0.077, 0);

  /* Tik ustun va uning halqalari */
  qosh(ich, new THREE.CylinderGeometry(0.032, 0.040, 0.800, 14), yog, 0, 0.500, 0);
  for (const y of [0.180, 0.480, 0.800]) {
    const h = qosh(ich, new THREE.TorusGeometry(0.038, 0.012, 8, 18), yogT, 0, y, 0);
    h.rotation.x = -Math.PI / 2;
  }
  /* Ustun cho‘qqisidagi ilgak */
  const ilgak = qosh(ich, new THREE.TorusGeometry(0.038, 0.010, 8, 20, Math.PI * 1.4), met, 0, 0.905, 0);
  ilgak.rotation.y = Math.PI / 2;

  /* Ko‘ndalang richag — bir tomoni og‘irroq, shuning uchun qiya */
  const BURCH = -0.105;
  const UZ = 0.430;
  const richag = qosh(ich, new THREE.CylinderGeometry(0.020, 0.020, UZ * 2, 12), yogT, 0, 0.900, 0);
  richag.rotation.z = Math.PI / 2 + BURCH;

  const uch = [];
  for (const yon of [-1, 1]) {
    const x = yon * UZ * Math.cos(BURCH);
    const y = 0.900 + yon * UZ * Math.sin(BURCH);
    uch.push(new THREE.Vector3(x, y, 0));
    /* Richag uchidagi halqa */
    const h = qosh(ich, new THREE.TorusGeometry(0.026, 0.008, 6, 16), met, x, y, 0);
    h.rotation.y = Math.PI / 2;
  }

  /* Pallalar va ularni ushlab turgan zanjirchalar */
  const pallaProfil = [
    new THREE.Vector2(0.000, 0.000),
    new THREE.Vector2(0.090, 0.006),
    new THREE.Vector2(0.145, 0.028),
    new THREE.Vector2(0.170, 0.052),
    new THREE.Vector2(0.168, 0.060),
    new THREE.Vector2(0.140, 0.038),
    new THREE.Vector2(0.000, 0.012),
  ];
  for (let k = 0; k < 2; k++) {
    const u = uch[k];
    const pallaY = u.y - 0.250;
    const palla = new THREE.Mesh(new THREE.LatheGeometry(pallaProfil, 26), misM);
    palla.position.set(u.x, pallaY, 0);
    ich.add(soya(palla));

    /* Uch dona ip (zanjircha) */
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      tayoq(ich, met, u,
        new THREE.Vector3(u.x + Math.cos(a) * 0.150, pallaY + 0.045, Math.sin(a) * 0.150),
        0.005, 0.005, 5);
    }
  }

  /* Bir pallada tosh gir, ikkinchisida o‘lchanayotgan don */
  const girU = uch[1], girY = uch[1].y - 0.250;
  const gir = qosh(ich, new THREE.SphereGeometry(0.080, 14, 12), toshM, girU.x, girY + 0.085, 0);
  gir.scale.set(1, 0.85, 1);
  const girTut = qosh(ich, new THREE.TorusGeometry(0.028, 0.008, 6, 16), met, girU.x, girY + 0.150, 0);
  girTut.rotation.y = Math.PI / 2;

  const donU = uch[0], donY = uch[0].y - 0.250;
  const don = qosh(ich, new THREE.SphereGeometry(0.120, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xC9A24C, roughness: 0.95 }), donU.x, donY + 0.030, 0);
  don.scale.y = 0.42;
  return tayyorla(ich, 1.30);
}

/* =========================================================
   23) ALIFBE LAVHASI — «Tilni bilish — dilni bilishga yo‘l
   ochadi». Qo‘lda ushlanadigan yog‘och lavha: dastasi bor,
   yuzasida yozuv satrlari o‘yilgan, yonida qamish qalam.
   ========================================================= */
export function alifbeLavhaYasa() {
  const ich = new THREE.Group();
  const yog = M.yogochOch(), yogT = M.yogochTuq();
  const oyiq = new THREE.MeshStandardMaterial({ color: 0x5B4128, roughness: 0.95 });
  const qamish = new THREE.MeshStandardMaterial({ color: 0xD8BE86, roughness: 0.8 });
  const siyoh = new THREE.MeshStandardMaterial({ color: 0x1E1A16, roughness: 0.6 });

  /* Lavha yuzasi — burchaklari yumaloqlangan taxtacha */
  const geo = new THREE.ExtrudeGeometry(yumaloqTortburchak(0.560, 0.700, 0.070), {
    depth: 0.045, bevelEnabled: false, curveSegments: 10
  });
  const lavha = new THREE.Mesh(geo, yog);
  lavha.rotation.x = -Math.PI / 2;
  lavha.userData.yerda = true;
  ich.add(soya(lavha, true));

  /* Lavha chetidagi o‘yiq hoshiya */
  for (const [w, d, x, z] of [[0.480, 0.014, 0, -0.290], [0.480, 0.014, 0, 0.290],
                               [0.014, 0.600, -0.240, 0], [0.014, 0.600, 0.240, 0]]) {
    qosh(ich, new THREE.BoxGeometry(w, 0.012, d), oyiq, x, 0.044, z);
  }

  /* Yozuv satrlari — yuzaga o‘yilgan chiziqlar */
  for (let i = 0; i < 6; i++) {
    qosh(ich, new THREE.BoxGeometry(0.420, 0.010, 0.014), oyiq, 0, 0.045, -0.215 + i * 0.086);
  }
  /* Satrlar orasidagi nozik yordamchi chiziqlar */
  for (let i = 0; i < 5; i++) {
    const n = qosh(ich, new THREE.BoxGeometry(0.420, 0.006, 0.006), yogT, 0, 0.046, -0.172 + i * 0.086);
  }

  /* Lavha dastasi */
  tayoq(ich, yog, new THREE.Vector3(0, 0.022, 0.330), new THREE.Vector3(0, 0.022, 0.585), 0.052, 0.040, 12);
  const uchHalqa = qosh(ich, new THREE.TorusGeometry(0.038, 0.011, 8, 20), yogT, 0, 0.022, 0.610);
  uchHalqa.rotation.x = -Math.PI / 2;
  /* Dasta bo‘g‘imi */
  const bogim = qosh(ich, new THREE.TorusGeometry(0.056, 0.013, 8, 18), yogT, 0, 0.022, 0.360);
  bogim.rotation.x = -Math.PI / 2;

  /* Qamish qalam — lavha yonida yotibdi */
  tayoq(ich, qamish, new THREE.Vector3(0.410, 0.014, -0.290), new THREE.Vector3(0.392, 0.014, 0.230), 0.015, 0.013, 10);
  /* Qamishning bo‘g‘im halqalari */
  for (const t of [0.30, 0.62]) {
    const h = qosh(ich, new THREE.TorusGeometry(0.017, 0.004, 6, 14), yogT,
      0.410 - 0.018 * t, 0.014, -0.290 + 0.520 * t);
    h.rotation.x = Math.PI / 2;
  }
  /* Qalamning kesilgan uchi va siyohli tumshug‘i */
  const uchQ = qosh(ich, new THREE.ConeGeometry(0.015, 0.075, 8), qamish, 0.412, 0.014, -0.325);
  uchQ.rotation.x = Math.PI / 2;
  qosh(ich, new THREE.ConeGeometry(0.008, 0.030, 6), siyoh, 0.412, 0.014, -0.368).rotation.x = Math.PI / 2;
  return tayyorla(ich, 1.22);
}

/* =========================================================
   Ro‘yxat — 2-modul sahnalari shu jadvaldan foydalanadi
   ========================================================= */
export const DIDAKTIK = {
  piyoz: {
    nom: 'Piyoz', yasa: piyozYasa,
    izoh: '«Pak-pakana bo‘yi bor, yetti qavat to‘ni bor» topishmog‘ining javobi — topishmoq bolani kuzatish va qiyoslashga o‘rgatadi.'
  },
  urchuq: {
    nom: 'Urchuq', yasa: urchuqYasa,
    izoh: '«Aylanaverib-aylanaverib semirdi xonim» topishmog‘ining javobi — mehnat quroli topishmoq orqali tanishtiriladi.'
  },
  laylak: {
    nom: 'Laylak', yasa: laylakYasa,
    izoh: 'Laylakning kelishi bahordan darak beradi — xalq taqvimi tabiat kuzatuvi asosida quriladi.'
  },
  qaldirgoch: {
    nom: 'Qaldirg‘och', yasa: qaldirgochYasa,
    izoh: 'Qaldirg‘och yozning yaqinlashganini bildiradi — bolalar undan fasl o‘zgarishini o‘rganadi.'
  },
  qarga: {
    nom: 'Qarg‘a', yasa: qargaYasa,
    izoh: 'Qarg‘aning qishloqqa yaqinlashishi qor va sovuqdan darak beradi.'
  },
  kabutar: {
    nom: 'Kabutar', yasa: kabutarYasa,
    izoh: 'Yovvoyi kabutarning xatti-harakati ob-havo o‘zgarishini oldindan bildiradi.'
  },
  korgazmaLavha: {
    nom: 'Ko‘rgazma lavha', yasa: korgazmaLavhaYasa,
    izoh: '«O‘n marta eshitgandan bir bor ko‘rgan yaxshi» — ko‘rsatmalilik tamoyilining xalq ifodasi.'
  },
  oyilganTosh: {
    nom: 'O‘yilgan tosh', yasa: oyilganToshYasa,
    izoh: '«Yoshlikda o‘rgangan ilm toshga o‘yilgan naqsh kabidir» — bilimning mustahkamlik tamoyili.'
  },
  bulut: {
    nom: 'Yomg‘irsiz bulut', yasa: bulutYasa,
    izoh: '«Amalda qo‘llanmaydigan bilim — yomg‘irsiz bulutga o‘xshaydi» — nazariyani amaliyot bilan bog‘lash.'
  },
  kozaChiroq: {
    nom: 'Ko‘zadagi chiroq', yasa: kozaChiroqYasa,
    izoh: '«Bilimini o‘rgatmagan kishi ko‘zaga solib qo‘yilgan yorug‘likka o‘xshaydi» — bilimni ulashish burchi.'
  },
  qayiq: {
    nom: 'Qayiq', yasa: qayiqYasa,
    izoh: '«O‘qish — oqimga qarshi suzishga o‘xshaydi»: to‘xtagan zahoti orqaga ketiladi — muntazamlik tamoyili.'
  },
  omoch: {
    nom: 'Omoch', yasa: omochYasa,
    izoh: '«Hamal — ekinlarga kirar amal»: xalq taqvimi dehqonchilik bilimini yil fasllariga bog‘lab o‘rgatadi.'
  },
  oroq: {
    nom: 'O‘roq', yasa: oroqYasa,
    izoh: '«Asad — ekiningni yasat»: hosil yig‘im-terimi bolaga mehnat va o‘lchov bilimini beradi.'
  },
  qatiqKoza: {
    nom: 'Qatiq ko‘zasi', yasa: qatiqKozaYasa,
    izoh: 'Sutdan qatiq, qaymoq va sariyog‘ olish — xalqning amaliy kimyoviy bilimlari namunasi.'
  },
  quyoshSoati: {
    nom: 'Quyosh soati', yasa: quyoshSoatiYasa,
    izoh: 'Quyosh va yulduzlarga qarab vaqtni aniqlash — xalq astronomiyasining didaktik vositasi.'
  },
  dorivorGiyoh: {
    nom: 'Dorivor giyoh', yasa: dorivorGiyohYasa,
    izoh: 'Dorivor o‘simliklarni tanish, terish va quritish — xalq tabobati bilimlari avloddan avlodga o‘tadi.'
  },
  kulolCharxi: {
    nom: 'Kulol charxi', yasa: kulolCharxiYasa,
    izoh: 'Kulolchilik usullari ustoz-shogird an’anasi orqali amaliy mashq bilan o‘rgatiladi.'
  },
  ganchPanjara: {
    nom: 'Ganch panjara', yasa: ganchPanjaraYasa,
    izoh: 'Ganch o‘ymakorligi bolada geometrik tasavvur, aniqlik va sabr-toqatni shakllantiradi.'
  },
  oymakorEshik: {
    nom: 'O‘ymakor eshik', yasa: oymakorEshikYasa,
    izoh: 'Yog‘och o‘ymakorligi — naqsh mantiqini va qo‘l mahoratini birga o‘rgatadigan hunar.'
  },
  zardoziChopon: {
    nom: 'Zardo‘zi chopon', yasa: zardoziChoponYasa,
    izoh: 'Zardo‘zlik hunari qizlarga did, chidam va nozik ish madaniyatini o‘rgatgan.'
  },
  suvTegirmoni: {
    nom: 'Suv tegirmoni', yasa: suvTegirmoniYasa,
    izoh: 'Suv va shamol kuchidan foydalanish — xalqning amaliy fizika bilimlari timsoli.'
  },
  tarozi: {
    nom: 'Tarozi', yasa: taroziYasa,
    izoh: 'Masofa, hosil va uy o‘lchamini o‘lchash — xalq matematik bilimlarining kundalik qo‘llanishi.'
  },
  alifbeLavha: {
    nom: 'Alifbe lavhasi', yasa: alifbeLavhaYasa,
    izoh: '«Tilni bilish — dilni bilishga yo‘l ochadi»: ona tilini o‘rgatishda ishlatilgan yozuv lavhasi.'
  },
};
