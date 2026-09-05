/* =========================================================
   MAISHIY VA MAROSIM BUYUMLARI — 3D modellar
   Darslikda nomlangan buyumlar: beshik (5-modul, alla),
   dasturxon, non, choynak-piyola (11-modul, muomala odobi),
   mehnat qurollari — ketmon, o‘roq (4-modul), sumalak qozoni
   (7-modul, Navro‘z), kitob-daftar-qalam (1, 13-modullar).

   Har funksiya THREE.Group qaytaradi. Miqyos: eng katta o‘lchami
   1.0–1.5 birlik, pastki nuqtasi y=0, markazi (0,0,0).
   ========================================================= */
import * as THREE from '../vendor/three.module.min.js';

/* ---------- Umumiy materiallar ---------- */
const M = {
  yogoch:   () => new THREE.MeshStandardMaterial({ color: 0x8A6A44, roughness: 0.82 }),
  yogochOch:() => new THREE.MeshStandardMaterial({ color: 0xB08E64, roughness: 0.78 }),
  yogochTuq:() => new THREE.MeshStandardMaterial({ color: 0x6E5334, roughness: 0.85 }),
  mato:     (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 }),
  sopol:    () => new THREE.MeshStandardMaterial({ color: 0xEDE6D6, roughness: 0.55 }),
  kok:      () => new THREE.MeshStandardMaterial({ color: 0x1B3B6F, roughness: 0.45 }),
  metall:   () => new THREE.MeshStandardMaterial({ color: 0x9AA2AC, roughness: 0.4, metalness: 0.75 }),
  choyan:   () => new THREE.MeshStandardMaterial({ color: 0x3A3A3E, roughness: 0.7, metalness: 0.3 }),
  non:      () => new THREE.MeshStandardMaterial({ color: 0xD9A860, roughness: 0.9 }),
  oltin:    () => new THREE.MeshStandardMaterial({ color: 0xD4A24C, roughness: 0.45, metalness: 0.4 }),
  qogoz:    () => new THREE.MeshStandardMaterial({ color: 0xFBF7F0, roughness: 0.9 }),
};

function soya(m, qabul = false) {
  m.castShadow = true;
  if (qabul) m.receiveShadow = true;
  return m;
}

/* =========================================================
   1) BESHIK — o‘zbek beshigi (alla aytiladigan)
   Qismlari: ikkita yoysimon oyoq, uzunasiga ikki yon taxta,
   yotoq taxtasi, tepasidagi yoy (ustiga ko‘rpacha yopiladi),
   yopilgan mato va bog‘ich.
   ========================================================= */
export function beshikYasa() {
  const g = new THREE.Group();
  const yog = M.yogoch(), yogO = M.yogochOch(), yogT = M.yogochTuq();

  // Yoysimon oyoqlar (old va orqa)
  for (const z of [-0.34, 0.34]) {
    const yoy = new THREE.Mesh(
      new THREE.TorusGeometry(0.30, 0.045, 8, 24, Math.PI),
      yogT
    );
    yoy.rotation.z = Math.PI;      // yoy pastga qaragan (tebranadi)
    yoy.position.set(0, 0.30, z);
    g.add(soya(yoy, true));
  }

  // Uzunasiga ikki yon taxta
  for (const z of [-0.34, 0.34]) {
    const yon = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.09, 0.05), yog);
    yon.position.set(0, 0.34, z);
    g.add(soya(yon));
  }

  // Yotoq taxtasi
  const yotoq = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.045, 0.62), yogO);
  yotoq.position.y = 0.37;
  g.add(soya(yotoq, true));

  // Bosh va oyoq tomondagi tik taxtachalar
  for (const [x, h] of [[-0.40, 0.30], [0.40, 0.22]]) {
    const tik = new THREE.Mesh(new THREE.BoxGeometry(0.05, h, 0.64), yog);
    tik.position.set(x, 0.37 + h / 2, 0);
    g.add(soya(tik));
  }

  // Tepadagi yoy — ustiga ko‘rpa tashlanadi
  const ustYoy = new THREE.Mesh(
    new THREE.TorusGeometry(0.33, 0.032, 8, 24, Math.PI),
    yog
  );
  ustYoy.position.set(0, 0.60, 0);
  ustYoy.rotation.y = Math.PI / 2;
  g.add(soya(ustYoy));

  // Yopilgan ko‘rpacha (milliy mato)
  const korpa = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    M.mato(0xC1502E)
  );
  korpa.scale.set(1, 0.62, 0.92);
  korpa.position.y = 0.60;
  g.add(soya(korpa));

  // Ko‘rpachadagi oltin jiyak
  const jiyak = new THREE.Mesh(new THREE.TorusGeometry(0.345, 0.014, 6, 28), M.oltin());
  jiyak.rotation.x = -Math.PI / 2;
  jiyak.position.y = 0.605;
  g.add(jiyak);

  // Bog‘ich (bolani bog‘lash tasmasi)
  for (const x of [-0.16, 0.16]) {
    const tasma = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.012, 0.66), M.mato(0xD4A24C));
    tasma.position.set(x, 0.40, 0);
    g.add(tasma);
  }
  return g;
}

/* =========================================================
   2) DASTURXON — yozilgan dasturxon, ustida non va choy
   ========================================================= */
export function dasturxonYasa() {
  const g = new THREE.Group();

  // Mato — yumshoq to‘lqinli yuza
  const mato = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.0, 12, 10), M.mato(0xFBF7F0));
  const p = mato.geometry.attributes.position;
  for (let i = 0; i < p.count; i++) {
    p.setZ(i, Math.sin(p.getX(i) * 4) * 0.012 + Math.cos(p.getY(i) * 5) * 0.012);
  }
  p.needsUpdate = true;
  mato.geometry.computeVertexNormals();
  mato.rotation.x = -Math.PI / 2;
  mato.position.y = 0.01;
  mato.receiveShadow = true;
  g.add(mato);

  // Chetidagi naqsh jiyagi
  for (const [w, h, x, z] of [[1.3, 0.05, 0, -0.5], [1.3, 0.05, 0, 0.5]]) {
    const j = new THREE.Mesh(new THREE.PlaneGeometry(w, h), M.mato(0xC1502E));
    j.rotation.x = -Math.PI / 2;
    j.position.set(x, 0.014, z);
    g.add(j);
  }
  for (const x of [-0.65, 0.65]) {
    const j = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 1.0), M.mato(0xC1502E));
    j.rotation.x = -Math.PI / 2;
    j.position.set(x, 0.014, 0);
    g.add(j);
  }
  return g;
}

/* =========================================================
   3) NON — o‘zbek noni (markazi bosilgan, chekkasi ko‘tarilgan)
   ========================================================= */
export function nonYasa() {
  const g = new THREE.Group();
  const mat = M.non();

  // Profil: chetdan markazga — chekka baland, o‘rta chuqur
  const nuqtalar = [
    new THREE.Vector2(0.00, 0.055),
    new THREE.Vector2(0.14, 0.050),
    new THREE.Vector2(0.26, 0.048),
    new THREE.Vector2(0.36, 0.085),
    new THREE.Vector2(0.44, 0.105),
    new THREE.Vector2(0.48, 0.075),
    new THREE.Vector2(0.49, 0.000),
  ];
  const non = new THREE.Mesh(new THREE.LatheGeometry(nuqtalar, 28), mat);
  g.add(soya(non, true));

  // Markazdagi chizma naqsh (chekich izi)
  const naqsh = new THREE.Mesh(
    new THREE.TorusGeometry(0.16, 0.008, 6, 24),
    new THREE.MeshStandardMaterial({ color: 0xB8873F, roughness: 0.9 })
  );
  naqsh.rotation.x = -Math.PI / 2;
  naqsh.position.y = 0.056;
  g.add(naqsh);

  // Kunjut donalari
  for (let i = 0; i < 14; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 0.05 + Math.random() * 0.16;
    const d = new THREE.Mesh(
      new THREE.SphereGeometry(0.012, 6, 5),
      new THREE.MeshStandardMaterial({ color: 0xEFE0C0, roughness: 0.8 })
    );
    d.position.set(Math.cos(a) * r, 0.058, Math.sin(a) * r);
    g.add(d);
  }
  return g;
}

/* =========================================================
   4) CHOYNAK — milliy naqshli choynak
   ========================================================= */
export function choynakYasa() {
  const g = new THREE.Group();
  const oq = M.sopol(), kok = M.kok();

  // Tana — LatheGeometry
  const profil = [
    new THREE.Vector2(0.00, 0.00),
    new THREE.Vector2(0.20, 0.02),
    new THREE.Vector2(0.28, 0.12),
    new THREE.Vector2(0.30, 0.26),
    new THREE.Vector2(0.24, 0.38),
    new THREE.Vector2(0.13, 0.45),
    new THREE.Vector2(0.11, 0.50),
  ];
  const tana = new THREE.Mesh(new THREE.LatheGeometry(profil, 24), oq);
  g.add(soya(tana, true));

  // Qopqoq
  const qopqoq = new THREE.Mesh(
    new THREE.SphereGeometry(0.115, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), oq);
  qopqoq.scale.y = 0.6;
  qopqoq.position.y = 0.50;
  g.add(soya(qopqoq));
  const tugma = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), kok);
  tugma.position.y = 0.575;
  g.add(soya(tugma));

  // Jo‘mrak — egri quvur
  const yol = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.24, 0.16, 0),
    new THREE.Vector3(0.38, 0.24, 0),
    new THREE.Vector3(0.46, 0.38, 0),
    new THREE.Vector3(0.48, 0.46, 0),
  ]);
  const jomrak = new THREE.Mesh(new THREE.TubeGeometry(yol, 16, 0.035, 10, false), oq);
  g.add(soya(jomrak));

  // Dastak
  const dastakYol = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.26, 0.16, 0),
    new THREE.Vector3(-0.44, 0.26, 0),
    new THREE.Vector3(-0.40, 0.42, 0),
    new THREE.Vector3(-0.22, 0.44, 0),
  ]);
  const dastak = new THREE.Mesh(new THREE.TubeGeometry(dastakYol, 16, 0.028, 10, false), oq);
  g.add(soya(dastak));

  // Ko‘k naqsh halqalari
  for (const y of [0.14, 0.30]) {
    const r = y < 0.2 ? 0.286 : 0.297;
    const h = new THREE.Mesh(new THREE.TorusGeometry(r, 0.009, 6, 28), kok);
    h.rotation.x = -Math.PI / 2;
    h.position.y = y;
    g.add(h);
  }
  // Paxta guli naqshi (nuqtalar)
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const gul = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), kok);
    gul.scale.set(1, 0.5, 1);
    gul.position.set(Math.cos(a) * 0.295, 0.22, Math.sin(a) * 0.295);
    g.add(gul);
  }
  return g;
}

/* =========================================================
   5) PIYOLA — choy piyolasi
   ========================================================= */
export function piyolaYasa() {
  const g = new THREE.Group();
  const oq = M.sopol(), kok = M.kok();

  const profil = [
    new THREE.Vector2(0.00, 0.00),
    new THREE.Vector2(0.08, 0.00),
    new THREE.Vector2(0.10, 0.03),
    new THREE.Vector2(0.17, 0.13),
    new THREE.Vector2(0.21, 0.24),
    new THREE.Vector2(0.205, 0.245),
    new THREE.Vector2(0.165, 0.135),
    new THREE.Vector2(0.09, 0.045),
    new THREE.Vector2(0.00, 0.035),
  ];
  const p = new THREE.Mesh(new THREE.LatheGeometry(profil, 24), oq);
  g.add(soya(p, true));

  // Chetidagi ko‘k halqa
  const h = new THREE.Mesh(new THREE.TorusGeometry(0.208, 0.007, 6, 28), kok);
  h.rotation.x = -Math.PI / 2;
  h.position.y = 0.24;
  g.add(h);

  // Yon naqsh
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const n = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), kok);
    n.scale.set(1, 1.6, 0.4);
    n.position.set(Math.cos(a) * 0.19, 0.15, Math.sin(a) * 0.19);
    g.add(n);
  }
  return g;
}

/* =========================================================
   6) KETMON — mehnat quroli (4-modul)
   ========================================================= */
export function ketmonYasa() {
  const g = new THREE.Group();

  // Dastasi
  const dasta = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.032, 1.15, 10), M.yogoch());
  dasta.position.set(0, 0.62, 0);
  dasta.rotation.z = 0.22;
  g.add(soya(dasta));

  // Temir tig‘ — kengayuvchi
  const tig = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.26, 0.035), M.metall());
  tig.position.set(-0.14, 0.11, 0);
  tig.rotation.z = 0.34;
  g.add(soya(tig, true));

  // Tig‘ning pastki qirrasi (o‘tkir)
  const qirra = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.05, 0.02),
    new THREE.MeshStandardMaterial({ color: 0xC7CDD4, roughness: 0.25, metalness: 0.85 }));
  qirra.position.set(-0.18, 0.02, 0);
  qirra.rotation.z = 0.34;
  g.add(soya(qirra));

  // Dasta bilan tig‘ni bog‘lovchi halqa
  const halqa = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.014, 8, 16), M.metall());
  halqa.position.set(-0.06, 0.24, 0);
  halqa.rotation.y = Math.PI / 2;
  halqa.rotation.z = 0.28;
  g.add(halqa);
  return g;
}

/* =========================================================
   7) O‘ROQ — hosil yig‘ish quroli (4-modul)
   ========================================================= */
export function oroqYasa() {
  const g = new THREE.Group();

  // Egri tig‘ — yarim yoy
  const tig = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.022, 8, 26, Math.PI * 1.05),
    M.metall()
  );
  tig.position.set(0.06, 0.34, 0);
  tig.rotation.set(Math.PI / 2, 0, -0.35);
  g.add(soya(tig));

  // Tig‘ning o‘tkir qirrasi
  const qirra = new THREE.Mesh(
    new THREE.TorusGeometry(0.355, 0.006, 6, 26, Math.PI * 1.05),
    new THREE.MeshStandardMaterial({ color: 0xD5DAE0, roughness: 0.2, metalness: 0.9 })
  );
  qirra.position.copy(tig.position);
  qirra.rotation.copy(tig.rotation);
  g.add(qirra);

  // Yog‘och dasta
  const dasta = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.038, 0.30, 10), M.yogochTuq());
  dasta.position.set(-0.20, 0.15, 0);
  dasta.rotation.z = 0.18;
  g.add(soya(dasta, true));
  return g;
}

/* =========================================================
   8) SUMALAK QOZONI — Navro‘z marosimi (7-modul)
   ========================================================= */
export function qozonYasa() {
  const g = new THREE.Group();
  const ch = M.choyan();

  // Qozon — yarim shar
  const qozon = new THREE.Mesh(
    new THREE.SphereGeometry(0.46, 24, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), ch);
  qozon.scale.y = 0.78;
  qozon.position.y = 0.40;
  g.add(soya(qozon, true));

  // Og‘iz halqasi
  const ogiz = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.03, 8, 28), ch);
  ogiz.rotation.x = -Math.PI / 2;
  ogiz.position.y = 0.40;
  g.add(soya(ogiz));

  // Ikki quloq (dastak)
  for (const x of [-0.48, 0.48]) {
    const q = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.018, 8, 16, Math.PI), ch);
    q.position.set(x, 0.36, 0);
    q.rotation.set(0, Math.PI / 2, x > 0 ? -Math.PI / 2 : Math.PI / 2);
    g.add(soya(q));
  }

  // O‘choq — g‘isht halqasi
  const ochoq = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.34, 20),
    new THREE.MeshStandardMaterial({ color: 0x8C6A52, roughness: 0.95 }));
  ochoq.position.y = 0.17;
  g.add(soya(ochoq, true));

  // Olov
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const olov = new THREE.Mesh(
      new THREE.ConeGeometry(0.05, 0.16, 6),
      new THREE.MeshStandardMaterial({
        color: i % 2 ? 0xD4A24C : 0xC1502E,
        emissive: i % 2 ? 0x8A5F1E : 0x7A2F18, roughness: 0.6
      }));
    olov.position.set(Math.cos(a) * 0.22, 0.30, Math.sin(a) * 0.22);
    g.add(olov);
  }

  // Sumalak (qozon ichida)
  const osh = new THREE.Mesh(new THREE.CylinderGeometry(0.40, 0.40, 0.04, 24),
    new THREE.MeshStandardMaterial({ color: 0x6B4A2A, roughness: 0.7 }));
  osh.position.y = 0.40;
  g.add(osh);
  return g;
}

/* =========================================================
   9) KITOB — ochiq darslik (1, 13-modullar)
   ========================================================= */
export function kitobYasa(ochiq = true) {
  const g = new THREE.Group();
  const muqova = new THREE.MeshStandardMaterial({ color: 0xC1502E, roughness: 0.6 });
  const varaq = M.qogoz();

  if (!ochiq) {
    const k = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.10, 0.84), muqova);
    k.position.y = 0.05;
    g.add(soya(k, true));
    const v = new THREE.Mesh(new THREE.BoxGeometry(0.585, 0.075, 0.80), varaq);
    v.position.set(0.012, 0.05, 0);
    g.add(v);
    const jiyak = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.58), M.oltin());
    jiyak.position.set(-0.29, 0.05, 0);
    g.add(jiyak);
    return g;
  }

  // Ochiq kitob — ikki varaq qiya
  for (const yon of [-1, 1]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.022, 0.80), muqova);
    m.position.set(yon * 0.295, 0.055, 0);
    m.rotation.z = yon * 0.09;
    g.add(soya(m, true));

    const v = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.026, 0.76), varaq);
    v.position.set(yon * 0.29, 0.075, 0);
    v.rotation.z = yon * 0.09;
    g.add(v);

    // Matn chiziqlari
    for (let i = 0; i < 6; i++) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.004, 0.018),
        new THREE.MeshStandardMaterial({ color: 0xC4B8A4, roughness: 0.9 }));
      s.position.set(yon * 0.29, 0.09, -0.26 + i * 0.095);
      s.rotation.z = yon * 0.09;
      g.add(s);
    }
  }
  // O‘rta bog‘lam
  const orta = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.80, 10), muqova);
  orta.rotation.x = Math.PI / 2;
  orta.position.y = 0.055;
  g.add(soya(orta));
  return g;
}

/* =========================================================
   10) DAFTAR VA QALAM
   ========================================================= */
export function daftarYasa() {
  const g = new THREE.Group();
  const d = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.045, 0.76), M.qogoz());
  d.position.y = 0.023;
  g.add(soya(d, true));
  const muqova = new THREE.Mesh(new THREE.BoxGeometry(0.575, 0.012, 0.775),
    new THREE.MeshStandardMaterial({ color: 0x1B3B6F, roughness: 0.6 }));
  muqova.position.y = 0.052;
  g.add(soya(muqova));
  // Prujina
  for (let i = 0; i < 8; i++) {
    const s = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.005, 6, 12), M.metall());
    s.rotation.y = Math.PI / 2;
    s.position.set(-0.285, 0.038, -0.32 + i * 0.09);
    g.add(s);
  }
  return g;
}

export function qalamYasa() {
  const g = new THREE.Group();
  const tana = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.78, 6),
    new THREE.MeshStandardMaterial({ color: 0xD4A24C, roughness: 0.55 }));
  tana.position.y = 0.42;
  g.add(soya(tana));
  const uch = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.10, 6),
    new THREE.MeshStandardMaterial({ color: 0xE8CFA0, roughness: 0.7 }));
  uch.position.y = 0.05;
  uch.rotation.x = Math.PI;
  g.add(soya(uch));
  const grafit = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.03, 6),
    new THREE.MeshStandardMaterial({ color: 0x2B2118, roughness: 0.6 }));
  grafit.position.y = 0.015;
  grafit.rotation.x = Math.PI;
  g.add(grafit);
  const rezina = new THREE.Mesh(new THREE.CylinderGeometry(0.027, 0.027, 0.06, 8),
    new THREE.MeshStandardMaterial({ color: 0xC1502E, roughness: 0.8 }));
  rezina.position.y = 0.84;
  g.add(soya(rezina));
  return g;
}

/* =========================================================
   Ro‘yxat — sahnalar shu jadvaldan foydalanadi
   ========================================================= */
export const MAISHIY = {
  beshik:     { nom: 'Beshik',          modul: 5,  yasa: beshikYasa,
                izoh: 'Ona alla aytadigan joy — bolaning birinchi tarbiya maskani.' },
  dasturxon:  { nom: 'Dasturxon',       modul: 11, yasa: dasturxonYasa,
                izoh: 'Dasturxon atrofidagi tartib — muomala odobining ko‘rsatkichi.' },
  non:        { nom: 'Non',             modul: 11, yasa: nonYasa,
                izoh: 'Non xalqimizda muqaddas sanaladi, uni hurmatlash o‘rgatiladi.' },
  choynak:    { nom: 'Choynak',         modul: 11, yasa: choynakYasa,
                izoh: 'Mehmonga choy uzatish — mehmondo‘stlik an’anasining bir qismi.' },
  piyola:     { nom: 'Piyola',          modul: 11, yasa: piyolaYasa,
                izoh: 'Piyolani ikki qo‘llab uzatish hurmat belgisi hisoblanadi.' },
  ketmon:     { nom: 'Ketmon',          modul: 4,  yasa: ketmonYasa,
                izoh: 'Mehnat quroli — bola kichikligidan mehnatga jalb etilgan.' },
  oroq:       { nom: 'O‘roq',           modul: 4,  yasa: oroqYasa,
                izoh: 'Hosil yig‘im-terimida ishlatilgan qadimiy mehnat quroli.' },
  qozon:      { nom: 'Sumalak qozoni',  modul: 7,  yasa: qozonYasa,
                izoh: 'Navro‘zda jamoa bo‘lib sumalak pishirish — hamjihatlik marosimi.' },
  kitob:      { nom: 'Kitob',           modul: 1,  yasa: () => kitobYasa(true),
                izoh: '«Ilmsiz bir yashar, ilmli ming yashar» — bilim manbai.' },
  daftar:     { nom: 'Daftar',          modul: 13, yasa: daftarYasa,
                izoh: 'Shogirdning kundalik mehnati va izlanishi belgisi.' },
  qalam:      { nom: 'Qalam',           modul: 13, yasa: qalamYasa,
                izoh: 'Ustoz bergan bilim qalam bilan qog‘ozga muhrlanadi.' },
};
