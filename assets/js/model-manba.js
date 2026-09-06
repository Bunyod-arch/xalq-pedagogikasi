/* =========================================================
   XALQ PEDAGOGIKASI MANBALARI — 3D modellar
   1-modul: «Xalq pedagogikasi fanining maqsad va vazifalari,
   mazmuni». Ma’ruzada o‘zbek xalq pedagogikasining manbalari
   uch turga bo‘lingan:

     1) Mutafakkirlar meros qilib qoldirgan nasriy va nazmiy
        asarlar, odobnoma va pandnomalar;
     2) Xalq og‘zaki ijodi va folklor namunalari, qadriyatlar,
        urf-odatlar va marosimlar;
     3) «Qur’oni karim», hadislar va islomiy ta’limot namunalari.

   Shu uch turdagi manbalarning har biri uchun alohida,
   tanib olsa bo‘ladigan 3D model yasaladi.

   SHARTNOMA: har funksiya THREE.Group qaytaradi; eng katta
   o‘lchami 1.0–1.5 birlik, pastki nuqtasi y = 0, xz bo‘yicha
   markazlashgan. Fayl oxirida MANBALAR reyestri eksport qilinadi.
   ========================================================= */
import * as THREE from '../vendor/three.module.min.js';

/* ---------------------------------------------------------
   Umumiy materiallar
   --------------------------------------------------------- */
const M = {
  yogoch:    () => new THREE.MeshStandardMaterial({ color: 0x8A6A44, roughness: 0.82 }),
  yogochOch: () => new THREE.MeshStandardMaterial({ color: 0xB08E64, roughness: 0.78 }),
  yogochTuq: () => new THREE.MeshStandardMaterial({ color: 0x5E4527, roughness: 0.86 }),
  charm:     (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.68 }),
  qogoz:     () => new THREE.MeshStandardMaterial({ color: 0xF6EFDF, roughness: 0.94 }),
  qogozTuq:  () => new THREE.MeshStandardMaterial({ color: 0xE3D5B6, roughness: 0.95 }),
  oltin:     () => new THREE.MeshStandardMaterial({ color: 0xD4A24C, roughness: 0.34, metalness: 0.62 }),
  oltinOch:  () => new THREE.MeshStandardMaterial({ color: 0xEFCB7E, roughness: 0.3, metalness: 0.55 }),
  mis:       () => new THREE.MeshStandardMaterial({ color: 0xA9713C, roughness: 0.38, metalness: 0.7 }),
  kumush:    () => new THREE.MeshStandardMaterial({ color: 0xC8CDD4, roughness: 0.22, metalness: 0.85 }),
  mato:      (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 }),
  baxmal:    (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.99 }),
  sopol:     () => new THREE.MeshStandardMaterial({ color: 0xE7DCC6, roughness: 0.6 }),
  kok:       () => new THREE.MeshStandardMaterial({ color: 0x1B3B6F, roughness: 0.45 }),
  kokOch:    () => new THREE.MeshStandardMaterial({ color: 0x2E6FA8, roughness: 0.42 }),
  feruza:    () => new THREE.MeshStandardMaterial({ color: 0x2E9BA6, roughness: 0.35 }),
  yashil:    () => new THREE.MeshStandardMaterial({ color: 0x2F6B45, roughness: 0.7 }),
  qizil:     () => new THREE.MeshStandardMaterial({ color: 0xB3382C, roughness: 0.6 }),
  tosh:      () => new THREE.MeshStandardMaterial({ color: 0xC7BCA5, roughness: 0.9 }),
  qora:      () => new THREE.MeshStandardMaterial({ color: 0x232028, roughness: 0.7 }),
  oyna:      () => new THREE.MeshStandardMaterial({ color: 0xD9E6EF, roughness: 0.06, metalness: 0.95 }),
};

/* ---------------------------------------------------------
   Yordamchilar
   --------------------------------------------------------- */
function soya(m, qabul = false) {
  m.castShadow = true;
  if (qabul) m.receiveShadow = true;
  return m;
}

/* Modelni shartnomaga keltiradi: o‘lchamni `maqsad` ga
   moslaydi, xz bo‘yicha markazlaydi, pastini y = 0 ga qo‘yadi. */
function tugat(ichki, maqsad = 1.25) {
  const quti = new THREE.Box3().setFromObject(ichki);
  const olcham = new THREE.Vector3();
  quti.getSize(olcham);
  const eng = Math.max(olcham.x, olcham.y, olcham.z) || 1;
  const k = maqsad / eng;
  ichki.scale.setScalar(k);
  ichki.position.set(
    -((quti.min.x + quti.max.x) / 2) * k,
    -quti.min.y * k,
    -((quti.min.z + quti.max.z) / 2) * k
  );
  const tashqi = new THREE.Group();
  tashqi.add(ichki);
  return tashqi;
}

/* Bir dona kitob: muqova + varaqlar + tikuv (jild qirrasi) */
function kitobDona(en, qalin, bo, rang, oltinJiyak = true) {
  const g = new THREE.Group();
  const muqovaMat = M.charm(rang);

  // Pastki va ustki muqova
  for (const y of [0.008, qalin - 0.008]) {
    const q = new THREE.Mesh(new THREE.BoxGeometry(en, 0.016, bo), muqovaMat);
    q.position.y = y;
    g.add(soya(q, true));
  }
  // Varaqlar
  const varaq = new THREE.Mesh(
    new THREE.BoxGeometry(en - 0.028, Math.max(qalin - 0.032, 0.01), bo - 0.024),
    M.qogoz()
  );
  varaq.position.y = qalin / 2;
  varaq.position.x = 0.008;
  g.add(soya(varaq));

  // Jild qirrasi (tikuv tomoni) — yumaloq
  const qirra = new THREE.Mesh(
    new THREE.CylinderGeometry(qalin / 2, qalin / 2, bo, 10, 1, false, 0, Math.PI),
    muqovaMat
  );
  qirra.rotation.x = Math.PI / 2;
  qirra.rotation.y = Math.PI / 2;
  qirra.position.set(-en / 2, qalin / 2, 0);
  g.add(soya(qirra));

  if (oltinJiyak) {
    // Muqova yuzasidagi oltin ramka
    const ramka = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.006, 6, 4, Math.PI * 2),
      M.oltin()
    );
    ramka.rotation.x = -Math.PI / 2;
    ramka.rotation.z = Math.PI / 4;
    ramka.scale.set(en * 0.40, bo * 0.40, 1);
    ramka.position.y = qalin + 0.002;
    g.add(ramka);

    // Markaziy medalyon
    const medal = new THREE.Mesh(new THREE.CylinderGeometry(bo * 0.13, bo * 0.13, 0.008, 8), M.oltin());
    medal.position.y = qalin + 0.004;
    g.add(medal);
  }
  return g;
}

/* Sakkiz burchakli yulduz naqsh (islimiy) — yassi bezak */
function yulduzNaqsh(radius, qalinlik, material) {
  const g = new THREE.Group();
  for (let i = 0; i < 2; i++) {
    const kv = new THREE.Mesh(
      new THREE.BoxGeometry(radius * 2, qalinlik, radius * 2),
      material
    );
    kv.rotation.y = (i * Math.PI) / 4;
    g.add(kv);
  }
  return g;
}

/* =========================================================
   1-TUR. MUTAFAKKIRLAR MEROSI — asarlar, odobnoma, pandnomalar
   ========================================================= */

/* 1) «XAMSA» — Alisher Navoiyning besh dostoni.
   Beshta kitob taxlanган, har biri o‘z rangida, ustida
   oltin medalyon va zarhal jiyak.                            */
export function xamsaYasa() {
  const g = new THREE.Group();
  const ranglar = [0x1B3B6F, 0x2F6B45, 0x7A2530, 0x4A2C6B, 0x0F5C63];
  let y = 0;
  for (let i = 0; i < 5; i++) {
    const en = 0.86 - i * 0.035;
    const bo = 0.62 - i * 0.026;
    const qalin = 0.085;
    const k = kitobDona(en, qalin, bo, ranglar[i], true);
    k.position.y = y;
    k.rotation.y = (i % 2 ? 1 : -1) * (0.05 + i * 0.018);
    g.add(k);
    y += qalin + 0.006;
  }
  // Eng ustidagi oltin qalpoqcha bezak — «beshlik» ramzi
  const toj = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const nur = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.09, 6), M.oltinOch());
    nur.position.set(Math.cos(a) * 0.10, 0.05, Math.sin(a) * 0.10);
    nur.rotation.z = -Math.cos(a) * 0.3;
    nur.rotation.x = Math.sin(a) * 0.3;
    toj.add(soya(nur));
  }
  const gavhar = new THREE.Mesh(new THREE.OctahedronGeometry(0.045), M.feruza());
  gavhar.position.y = 0.055;
  toj.add(soya(gavhar));
  toj.position.y = y + 0.01;
  g.add(toj);

  return tugat(g, 1.3);
}

/* 2) «DEVONU LUG‘OTIT TURK» — Mahmud Qoshg‘ariy asari.
   Charm muqovali kitob va uning ustida asarga mashhur bo‘lgan
   dumaloq dunyo xaritasi disk shaklida.                       */
export function devonYasa() {
  const g = new THREE.Group();

  const kitob = kitobDona(0.92, 0.14, 0.66, 0x6B4326, false);
  g.add(kitob);

  // Muqovadagi bosma naqsh — ramka
  const ramka = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.006, 0.54), M.charm(0x53331C));
  ramka.position.y = 0.144;
  g.add(ramka);

  // Dumaloq dunyo xaritasi
  const xarita = new THREE.Group();
  const disk = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.30, 0.018, 40), M.qogozTuq());
  xarita.add(soya(disk, true));

  // Xarita chekkasi — dengiz halqasi
  const dengiz = new THREE.Mesh(new THREE.TorusGeometry(0.295, 0.022, 8, 44), M.kokOch());
  dengiz.rotation.x = -Math.PI / 2;
  dengiz.position.y = 0.012;
  xarita.add(dengiz);

  // Ichki halqalar — iqlim chegaralari
  [0.22, 0.14].forEach((r, i) => {
    const h = new THREE.Mesh(new THREE.TorusGeometry(r, 0.006, 6, 36), M.charm(0x8C5A2F));
    h.rotation.x = -Math.PI / 2;
    h.position.y = 0.011 + i * 0.001;
    xarita.add(h);
  });

  // Yer bo‘laklari — yashil dog‘lar
  const yerJoy = [
    [0.10, 0.05, 0.09], [-0.12, 0.09, 0.07], [0.04, -0.16, 0.08],
    [-0.06, -0.07, 0.06], [0.18, -0.06, 0.05], [-0.19, -0.10, 0.045],
  ];
  yerJoy.forEach(([x, z, r]) => {
    const y = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.012, 12), M.yashil());
    y.position.set(x, 0.012, z);
    y.scale.z = 0.8;
    xarita.add(y);
  });

  // Shaharlar — kichik oltin nuqtalar
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.3;
    const r = 0.07 + (i % 3) * 0.06;
    const nuqta = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6), M.oltin());
    nuqta.position.set(Math.cos(a) * r, 0.020, Math.sin(a) * r);
    xarita.add(nuqta);
  }
  // Markaz — Bolasog‘un (asarda dunyo markazi)
  const markaz = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.026, 10), M.qizil());
  markaz.position.y = 0.022;
  xarita.add(soya(markaz));

  xarita.position.set(0.03, 0.152, 0);
  xarita.rotation.y = 0.25;
  g.add(xarita);

  return tugat(g, 1.3);
}

/* 3) «TADBIRI MANOZIL» — Abu Ali ibn Sinoning asari.
   Ochilgan qo‘lyozma, yonida qamish qalam va siyohdon.       */
export function tadbiriManozilYasa() {
  const g = new THREE.Group();

  // Yog‘och lavha — kitob ostidagi taxta
  const lavha = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.035, 0.62), M.yogoch());
  lavha.position.y = 0.017;
  g.add(soya(lavha, true));

  // Ochilgan kitob: ikki varaq bir oz qiyshaygan
  const kitob = new THREE.Group();
  for (const yon of [-1, 1]) {
    const varaqlar = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.05, 0.52), M.qogoz());
    varaqlar.position.set(yon * 0.215, 0.06, 0);
    varaqlar.rotation.z = -yon * 0.10;
    kitob.add(soya(varaqlar, true));

    // Muqova varaqlar ostida
    const muq = new THREE.Mesh(new THREE.BoxGeometry(0.43, 0.018, 0.56), M.charm(0x5B3B7A));
    muq.position.set(yon * 0.222, 0.032, 0);
    muq.rotation.z = -yon * 0.10;
    kitob.add(soya(muq));

    // Yozuv satrlari — nozik chiziqlar
    for (let i = 0; i < 7; i++) {
      const satr = new THREE.Mesh(
        new THREE.BoxGeometry(0.28 - (i % 3) * 0.03, 0.003, 0.012),
        M.qora()
      );
      satr.position.set(yon * 0.215, 0.088 + yon * 0.021 * 0.0, -0.20 + i * 0.062);
      satr.position.y = 0.086 + (yon * 0.10) * (yon * 0.215) * 0.0;
      satr.position.x = yon * 0.215 - yon * 0.004;
      satr.rotation.z = -yon * 0.10;
      kitob.add(satr);
    }
    // Sarlavha — zarhal chiziq
    const sar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.004, 0.018), M.oltin());
    sar.position.set(yon * 0.215, 0.089, -0.245);
    sar.rotation.z = -yon * 0.10;
    kitob.add(sar);
  }
  // Tikuv joyi
  const tikuv = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.54, 10, 1, false, 0, Math.PI), M.charm(0x452C5C));
  tikuv.rotation.x = Math.PI / 2;
  tikuv.rotation.y = Math.PI / 2;
  tikuv.position.y = 0.052;
  kitob.add(soya(tikuv));
  g.add(kitob);

  // Siyohdon — kichik sopol idish, mis qopqoqli
  const siyohdon = new THREE.Group();
  const idish = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.10, 16), M.sopol());
  idish.position.y = 0.05;
  siyohdon.add(soya(idish, true));
  const bogʻiz = new THREE.Mesh(new THREE.TorusGeometry(0.072, 0.014, 8, 20), M.mis());
  bogʻiz.rotation.x = -Math.PI / 2;
  bogʻiz.position.y = 0.10;
  siyohdon.add(bogʻiz);
  const siyoh = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.01, 14), M.qora());
  siyoh.position.y = 0.098;
  siyohdon.add(siyoh);
  siyohdon.position.set(0.44, 0.035, 0.20);
  g.add(siyohdon);

  // Qamish qalam
  const qalam = new THREE.Group();
  const tana = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.017, 0.42, 8), M.yogochOch());
  qalam.add(soya(tana));
  const uch = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.06, 8), M.charm(0x3B2A18));
  uch.position.y = -0.24;
  uch.rotation.x = Math.PI;
  qalam.add(uch);
  // Qamish bo‘g‘imlari
  for (const y of [-0.09, 0.07]) {
    const b = new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.005, 6, 14), M.yogochTuq());
    b.rotation.x = -Math.PI / 2;
    b.position.y = y;
    qalam.add(b);
  }
  qalam.rotation.set(0.0, 0.0, Math.PI / 2 - 0.25);
  qalam.position.set(-0.34, 0.055, 0.24);
  g.add(qalam);

  return tugat(g, 1.35);
}

/* 4) «TURKIY GULISTON YOXUD AXLOQ» — Abdulla Avloniy.
   Yashil muqovali odobnoma, ustida atirgul («guliston»).      */
export function turkiyGulistonYasa() {
  const g = new THREE.Group();

  const kitob = kitobDona(0.84, 0.12, 0.60, 0x27603F, false);
  g.add(kitob);

  // Muqovadagi zarhal ramka va burchak naqshlari
  const ramka = new THREE.Mesh(new THREE.TorusGeometry(1, 0.007, 6, 4), M.oltin());
  ramka.rotation.x = -Math.PI / 2;
  ramka.rotation.z = Math.PI / 4;
  ramka.scale.set(0.34, 0.24, 1);
  ramka.position.y = 0.124;
  g.add(ramka);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const burchak = yulduzNaqsh(0.036, 0.006, M.oltin());
    burchak.position.set(sx * 0.30, 0.126, sz * 0.20);
    burchak.scale.set(1, 1, 0.6);
    g.add(burchak);
  }

  // Atirgul — «guliston» ramzi
  const gul = new THREE.Group();
  const yurak = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), M.qizil());
  gul.add(soya(yurak));
  /* Gulbarglar — uch qavat, tashqariga tomon ochilib boradi */
  for (let qavat = 0; qavat < 3; qavat++) {
    const soni = 5 + qavat;
    const r = 0.055 + qavat * 0.058;
    const uzun = 0.075 + qavat * 0.022;
    const ochilish = 0.55 + qavat * 0.48;   // tashqi qavat ko‘proq ochiladi
    const rang = qavat === 0 ? 0xD4453A : qavat === 1 ? 0xBC3129 : 0x9E241D;
    for (let i = 0; i < soni; i++) {
      const a = (i / soni) * Math.PI * 2 + qavat * 0.62;
      const barg = new THREE.Group();
      const yuza = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 9), M.charm(rang));
      yuza.scale.set(uzun / 0.06, 0.20, 0.62);   // yassi, cho‘zilgan gulbarg
      yuza.position.x = uzun * 0.55;
      barg.add(soya(yuza));
      barg.position.set(Math.cos(a) * r, 0.03 - qavat * 0.028, Math.sin(a) * r);
      barg.rotation.y = -a;
      barg.rotation.z = ochilish - Math.PI / 2 + 0.6;  // qavat ochilgan sari yassiroq
      gul.add(barg);
    }
  }
  // Yashil kosacha va poya
  const kosa = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.07, 10), M.yashil());
  kosa.position.y = -0.055;
  kosa.rotation.x = Math.PI;
  gul.add(soya(kosa));
  const poya = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.016, 0.16, 7), M.yashil());
  poya.position.y = -0.13;
  gul.add(soya(poya));
  for (const yon of [-1, 1]) {
    const barg = new THREE.Mesh(new THREE.SphereGeometry(0.062, 10, 8), M.yashil());
    barg.scale.set(1.5, 0.16, 0.6);
    barg.position.set(yon * 0.08, -0.145, 0);
    barg.rotation.z = yon * 0.55;
    gul.add(soya(barg));
  }
  gul.position.set(0.0, 0.30, 0.02);
  gul.rotation.z = 0.16;
  g.add(gul);

  return tugat(g, 1.25);
}

/* =========================================================
   2-TUR. XALQ OG‘ZAKI IJODI, QADRIYAT VA URF-ODATLAR
   ========================================================= */

/* 5) DO‘MBIRA — baxshi-dostonchining cholg‘usi.
   «Alpomish», «Go‘ro‘g‘li» dostonlari shu bilan aytilgan.     */
export function dombiraYasa() {
  const g = new THREE.Group();

  // Kosa — nokka o‘xshash tana
  const kosa = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 18), M.yogoch());
  kosa.scale.set(1, 0.95, 0.76);
  kosa.position.set(0, 0.24, 0);
  g.add(soya(kosa, true));

  // Qopqoq — yassi old taxta
  const qopqoq = new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.235, 0.014, 28), M.yogochOch());
  qopqoq.rotation.x = Math.PI / 2;
  qopqoq.scale.set(1, 1, 0.98);
  qopqoq.position.set(0, 0.24, 0.178);
  g.add(soya(qopqoq));

  // Rezonator teshigi
  const teshik = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.008, 8, 22), M.yogochTuq());
  teshik.position.set(0, 0.30, 0.186);
  g.add(teshik);
  const ichi = new THREE.Mesh(new THREE.CircleGeometry(0.045, 20), M.qora());
  ichi.position.set(0, 0.30, 0.182);
  g.add(ichi);

  // Dastasi (grif)
  const dasta = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.66, 0.045), M.yogochTuq());
  dasta.position.set(0, 0.68, 0.15);
  g.add(soya(dasta));

  // Pardalar — dastadagi ip bog‘ichlar
  for (let i = 0; i < 9; i++) {
    const p = new THREE.Mesh(new THREE.TorusGeometry(0.034, 0.005, 6, 16), M.mato(0xE8DCC0));
    p.rotation.y = Math.PI / 2;
    p.scale.set(1, 1, 0.75);
    p.position.set(0, 0.42 + i * 0.062, 0.15);
    g.add(p);
  }

  // Bosh — quloqlar bilan
  const bosh = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.16, 0.05), M.yogochTuq());
  bosh.position.set(0, 1.05, 0.145);
  bosh.rotation.x = -0.22;
  g.add(soya(bosh));
  for (const yon of [-1, 1]) {
    const quloq = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.10, 8), M.yogoch());
    quloq.rotation.z = Math.PI / 2;
    quloq.position.set(yon * 0.055, 1.06, 0.145);
    g.add(soya(quloq));
    const boshcha = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), M.yogochOch());
    boshcha.scale.set(0.7, 1.3, 1);
    boshcha.position.set(yon * 0.10, 1.06, 0.145);
    g.add(soya(boshcha));
  }

  // Ikki tor
  for (const yon of [-1, 1]) {
    const tor = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.98, 5), M.mato(0xF2E7CF));
    tor.position.set(yon * 0.014, 0.60, 0.191);
    tor.rotation.x = -0.012;
    g.add(tor);
  }
  // Xarrak
  const xarrak = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.022, 0.012), M.yogochTuq());
  xarrak.position.set(0, 0.185, 0.188);
  g.add(soya(xarrak));

  return tugat(g, 1.45);
}

/* 6) «UCHAR GILAM» — ma’ruzada nomlangan xalq orzusi.
   To‘lqinlanib uchayotgan naqshli gilam, chetlarida popuk.    */
export function ucharGilamYasa() {
  const g = new THREE.Group();

  const en = 1.0, bo = 0.72, boM = 30, boN = 22;
  const geo = new THREE.PlaneGeometry(en, bo, boM, boN);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    p.setZ(i, Math.sin(x * 5.2) * 0.055 + Math.cos(y * 4.4) * 0.035 + x * 0.06);
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();

  const gilam = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    color: 0x8C2F28, roughness: 0.96, side: THREE.DoubleSide,
  }));
  gilam.rotation.x = -Math.PI / 2;
  gilam.position.y = 0.30;
  g.add(soya(gilam, true));

  // Gilam ustidagi naqsh: markazda katta guli, chetida jiyak
  function ustga(x, z) {
    // Yuzaning shu nuqtadagi balandligi
    return 0.30 + Math.sin(x * 5.2) * 0.055 + Math.cos(z * 4.4) * 0.035 + x * 0.06;
  }
  // Markaziy guli — sakkiz burchakli yulduz
  const guli = yulduzNaqsh(0.115, 0.012, M.mato(0x1B3B6F));
  guli.scale.set(1, 1, 0.75);
  guli.position.set(0, ustga(0, 0) + 0.012, 0);
  g.add(guli);
  const gulOrta = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.014, 8), M.oltin());
  gulOrta.position.set(0, ustga(0, 0) + 0.018, 0);
  g.add(gulOrta);

  // Yon guldonlar
  for (const sx of [-0.31, 0.31]) for (const sz of [-0.21, 0.21]) {
    const kichik = yulduzNaqsh(0.055, 0.010, M.mato(0xD4A24C));
    kichik.scale.set(1, 1, 0.75);
    kichik.position.set(sx, ustga(sx, sz) + 0.010, sz);
    g.add(kichik);
  }
  // Chekka jiyak — ikki chiziq
  for (const chet of [0.30, 0.335]) {
    for (let i = 0; i <= boM; i++) {
      const x = -en / 2 + (i / boM) * en;
      for (const yon of [-1, 1]) {
        const z = yon * chet;
        if (Math.abs(z) > bo / 2) continue;
        const d = new THREE.Mesh(new THREE.BoxGeometry(en / boM, 0.008, 0.014), M.mato(0xE6D3A8));
        d.position.set(x, ustga(x, z) + 0.008, z);
        g.add(d);
      }
    }
  }
  // Popuklar — ikki qisqa chetda
  for (const yon of [-1, 1]) {
    for (let i = 0; i < 11; i++) {
      const z = -0.30 + (i / 10) * 0.60;
      const x = yon * (en / 2);
      const popuk = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.004, 0.075, 5), M.mato(0xE6D3A8));
      popuk.position.set(x + yon * 0.03, ustga(x, z) - 0.035, z);
      popuk.rotation.z = yon * 0.25;
      g.add(popuk);
    }
  }

  // Uchayotganini ko‘rsatuvchi yengil bulut izi (pastda)
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const iz = new THREE.Mesh(
      new THREE.SphereGeometry(0.07 + (i % 2) * 0.03, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xF3EDE0, roughness: 1, transparent: true, opacity: 0.32 })
    );
    iz.scale.set(1.5, 0.28, 1.0);
    iz.position.set(Math.cos(a) * 0.22, 0.045, Math.sin(a) * 0.15);
    g.add(iz);
  }

  return tugat(g, 1.4);
}

/* 7) «SEHRLI DASTURXON» — ma’ruzadagi orzu timsoli.
   Yozilgan dasturxon, ustida non, uzum va piyola.             */
export function sehrliDasturxonYasa() {
  const g = new THREE.Group();

  // Dasturxon — to‘lqinli mato
  const geo = new THREE.PlaneGeometry(1.05, 0.85, 16, 14);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    p.setZ(i, Math.sin(p.getX(i) * 4.5) * 0.014 + Math.cos(p.getY(i) * 5) * 0.014);
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  const mato = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    color: 0xFAF3E4, roughness: 0.97, side: THREE.DoubleSide,
  }));
  mato.rotation.x = -Math.PI / 2;
  mato.position.y = 0.012;
  g.add(soya(mato, true));

  // Dasturxon jiyagi — qizil-yashil chiziqlar
  [[0.48, 0xB3382C], [0.455, 0x2F6B45]].forEach(([r, rang]) => {
    for (const yon of [-1, 1]) {
      const ch = new THREE.Mesh(new THREE.BoxGeometry(r * 2, 0.006, 0.014), M.mato(rang));
      ch.position.set(0, 0.02, yon * 0.385);
      g.add(ch);
      const ch2 = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.006, 0.77), M.mato(rang));
      ch2.position.set(yon * r, 0.02, 0);
      g.add(ch2);
    }
  });

  // Non — chekkasi ko‘tarilgan, o‘rtasi chekichli
  const non = new THREE.Group();
  const gardish = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.055, 12, 30), M.charm(0xD9A860));
  gardish.rotation.x = -Math.PI / 2;
  gardish.position.y = 0.05;
  non.add(soya(gardish, true));
  const orta = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.16, 0.05, 28), M.charm(0xC08C44));
  orta.position.y = 0.028;
  non.add(soya(orta));
  // Chekich naqshi — kunjut nuqtalari
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const r = i % 2 ? 0.05 : 0.085;
    const nuq = new THREE.Mesh(new THREE.SphereGeometry(0.009, 6, 5), M.charm(0xF0DDB4));
    nuq.position.set(Math.cos(a) * r, 0.052, Math.sin(a) * r);
    non.add(nuq);
  }
  non.position.set(-0.22, 0.02, -0.05);
  g.add(non);

  // Uzum boshi
  const uzum = new THREE.Group();
  const joy = [
    [0, 0.20, 0], [0.045, 0.155, 0.02], [-0.045, 0.155, -0.02], [0.02, 0.155, -0.045],
    [0, 0.11, 0.045], [0.055, 0.10, -0.02], [-0.05, 0.105, 0.03], [0.005, 0.10, -0.04],
    [0.03, 0.06, 0.03], [-0.03, 0.06, -0.03], [0, 0.055, 0], [0.01, 0.02, 0.005],
  ];
  joy.forEach(([x, y, z], i) => {
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8),
      M.charm(i % 3 === 0 ? 0x5C3A6E : 0x6F4A82));
    d.position.set(x, y, z);
    uzum.add(soya(d));
  });
  const uzumPoya = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.009, 0.09, 6), M.yashil());
  uzumPoya.position.set(0, 0.25, 0);
  uzum.add(uzumPoya);
  const uzumBarg = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), M.yashil());
  uzumBarg.scale.set(1.2, 0.12, 1.0);
  uzumBarg.position.set(0.06, 0.275, 0.02);
  uzumBarg.rotation.z = 0.4;
  uzum.add(soya(uzumBarg));
  uzum.position.set(0.24, 0.02, 0.12);
  g.add(uzum);

  // Piyola
  const piyola = new THREE.Group();
  const nuqtalar = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    nuqtalar.push(new THREE.Vector2(0.018 + Math.pow(t, 0.55) * 0.086, t * 0.115));
  }
  const kosa = new THREE.Mesh(new THREE.LatheGeometry(nuqtalar, 22), M.sopol());
  piyola.add(soya(kosa, true));
  const jiyak = new THREE.Mesh(new THREE.TorusGeometry(0.103, 0.006, 6, 22), M.kok());
  jiyak.rotation.x = -Math.PI / 2;
  jiyak.position.y = 0.115;
  piyola.add(jiyak);
  const choy = new THREE.Mesh(new THREE.CylinderGeometry(0.092, 0.092, 0.006, 20), M.charm(0x8C5A22));
  choy.position.y = 0.098;
  piyola.add(choy);
  // Piyoladagi ko‘k naqsh — paxta guli nuqtalari
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const n = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), M.kok());
    n.scale.set(1, 1.4, 0.5);
    n.position.set(Math.cos(a) * 0.088, 0.06, Math.sin(a) * 0.088);
    piyola.add(n);
  }
  piyola.position.set(0.05, 0.02, -0.24);
  g.add(piyola);

  return tugat(g, 1.35);
}

/* 8) «OYNAI JAHON» — dunyoni ko‘rsatuvchi sehrli oyna.
   Mis ramkali, dastali qo‘l oynasi; ramkada islimiy naqsh.    */
export function oynaiJahonYasa() {
  const g = new THREE.Group();
  const tik = new THREE.Group();      // oyna tik turadi

  // Ramka
  const ramka = new THREE.Mesh(new THREE.TorusGeometry(0.30, 0.045, 14, 44), M.mis());
  tik.add(soya(ramka, true));

  // Oyna yuzasi
  const yuza = new THREE.Mesh(new THREE.CircleGeometry(0.295, 40), M.oyna());
  yuza.position.z = 0.012;
  tik.add(yuza);
  const orqa = new THREE.Mesh(new THREE.CircleGeometry(0.30, 40), M.mis());
  orqa.position.z = -0.02;
  orqa.rotation.y = Math.PI;
  tik.add(soya(orqa));

  // Ramkadagi naqsh — atrofga terilgan mayda gullar
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const gul = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 6), M.oltin());
    gul.scale.set(1, 1, 0.55);
    gul.position.set(Math.cos(a) * 0.30, Math.sin(a) * 0.30, 0.035);
    tik.add(gul);
  }
  // To‘rtta feruza ko‘z
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const koz = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), M.feruza());
    koz.scale.set(1, 1, 0.6);
    koz.position.set(Math.cos(a) * 0.30, Math.sin(a) * 0.30, 0.045);
    tik.add(soya(koz));
  }

  // Oyna ichida ko‘ringan «jahon» — mayda uzoq shakl
  const jahon = new THREE.Mesh(new THREE.SphereGeometry(0.11, 18, 14),
    new THREE.MeshStandardMaterial({ color: 0x3E7FB0, roughness: 0.4, transparent: true, opacity: 0.75 }));
  jahon.position.z = 0.028;
  tik.add(jahon);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.5;
    const quruq = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0x4C8A56, roughness: 0.6, transparent: true, opacity: 0.85 }));
    quruq.scale.set(1.2, 0.8, 0.35);
    quruq.position.set(Math.cos(a) * 0.045, Math.sin(a) * 0.04, 0.09);
    tik.add(quruq);
  }

  // Dasta
  const dasta = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.34, 12), M.mis());
  dasta.position.y = -0.50;
  tik.add(soya(dasta, true));
  for (const y of [-0.40, -0.56]) {
    const bilaguzuk = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.012, 8, 18), M.oltin());
    bilaguzuk.rotation.x = Math.PI / 2;
    bilaguzuk.position.y = y;
    tik.add(bilaguzuk);
  }
  const tugma = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), M.oltin());
  tugma.position.y = -0.68;
  tik.add(soya(tugma));

  tik.position.y = 0.72;
  tik.rotation.x = -0.16;
  g.add(tik);

  return tugat(g, 1.4);
}

/* 9) XUMO QUSHI — «Avesto» va xalq afsonalaridagi baxt-tole
   qushi. Oltin-feruza patli, keng yoyilgan dumli qush.        */
export function xumoQushYasa() {
  const g = new THREE.Group();

  const patMat = M.oltin();
  const patMat2 = M.feruza();

  // Tana
  const tana = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 16), patMat);
  tana.scale.set(1.25, 1, 0.9);
  tana.position.set(0, 0.52, 0);
  g.add(soya(tana, true));

  // Ko‘krak
  const kokrak = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), M.oltinOch());
  kokrak.scale.set(1, 1.1, 0.85);
  kokrak.position.set(0.14, 0.50, 0);
  g.add(soya(kokrak));

  // Bo‘yin
  const boyin = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.10, 0.30, 12), patMat);
  boyin.position.set(0.24, 0.72, 0);
  boyin.rotation.z = -0.42;
  g.add(soya(boyin));

  // Bosh
  const bosh = new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 12), patMat);
  bosh.position.set(0.36, 0.87, 0);
  g.add(soya(bosh));

  // Tumshuq
  const tumshuq = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.13, 8), M.charm(0xC8752A));
  tumshuq.position.set(0.47, 0.865, 0);
  tumshuq.rotation.z = -Math.PI / 2;
  g.add(soya(tumshuq));

  // Ko‘zlar
  for (const yon of [-1, 1]) {
    const koz = new THREE.Mesh(new THREE.SphereGeometry(0.017, 8, 6), M.qora());
    koz.position.set(0.40, 0.90, yon * 0.055);
    g.add(koz);
  }

  // Toj — boshdagi uch patcha
  for (let i = 0; i < 3; i++) {
    const pat = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.15, 6), patMat2);
    pat.position.set(0.32 - i * 0.035, 0.97 + i * 0.012, 0);
    pat.rotation.z = -0.5 + i * 0.28;
    g.add(soya(pat));
  }

  // Qanotlar — yoyilgan
  for (const yon of [-1, 1]) {
    const qanot = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const uzun = 0.34 - i * 0.032;
      const pat = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), i % 2 ? patMat2 : patMat);
      pat.scale.set(uzun / 0.055 * 0.5, 0.16, 1.0);
      pat.position.set(-0.02 - i * 0.04, 0.60 + i * 0.05, yon * (0.16 + i * 0.028));
      pat.rotation.y = yon * (0.25 + i * 0.06);
      pat.rotation.z = 0.22 + i * 0.05;
      qanot.add(soya(pat));
    }
    g.add(qanot);
  }

  /* Dum — yelpig‘ich: har pat alohida guruh bo‘lib, orqaga
     (-x) cho‘ziladi va yon tomonga yoyiladi. Uchida «ko‘z» naqsh. */
  for (let i = 0; i < 9; i++) {
    const t = i / 8 - 0.5;                 // -0.5 … +0.5
    const pat = new THREE.Group();

    const uzunlik = 0.60 - Math.abs(t) * 0.14;
    const tig = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), i % 2 ? patMat : patMat2);
    tig.scale.set(uzunlik / 0.12, 0.22, 1.45);
    tig.position.x = uzunlik / 2;
    pat.add(soya(tig));

    // Pat o‘zagi
    const ozak = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, uzunlik, 6), M.oltinOch());
    ozak.rotation.z = Math.PI / 2;
    ozak.position.x = uzunlik / 2;
    pat.add(ozak);

    // Uchidagi «ko‘z» naqsh
    const koz = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), M.kok());
    koz.scale.set(0.5, 0.2, 1.5);
    koz.position.x = uzunlik - 0.03;
    pat.add(soya(koz));
    const kozIch = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 8), M.feruza());
    kozIch.scale.set(0.5, 0.3, 1.5);
    kozIch.position.set(uzunlik - 0.03, 0.012, 0);
    pat.add(kozIch);

    pat.position.set(-0.26, 0.50 + Math.abs(t) * 0.05, 0);
    pat.rotation.y = Math.PI + t * 1.05;    // orqaga qarab yoyiladi
    pat.rotation.z = -0.10 - Math.abs(t) * 0.12;
    g.add(pat);
  }

  // Oyoqlar
  for (const yon of [-1, 1]) {
    const oyoq = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 0.30, 8), M.charm(0xC8752A));
    oyoq.position.set(0.04, 0.19, yon * 0.09);
    g.add(soya(oyoq));
    for (let j = 0; j < 3; j++) {
      const barmoq = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.008, 0.11, 6), M.charm(0xC8752A));
      barmoq.position.set(0.09 + j * 0.005, 0.028, yon * 0.09 + (j - 1) * 0.045);
      barmoq.rotation.z = Math.PI / 2 - 0.2;
      barmoq.rotation.y = (j - 1) * 0.5;
      g.add(soya(barmoq));
    }
  }

  return tugat(g, 1.45);
}

/* =========================================================
   3-TUR. ISLOMIY TA’LIMOT MANBALARI
   ========================================================= */

/* 10) QUR’ONI KARIM LAVHDA — o‘yma yog‘och lavh (rahl) ustida
   turgan muqaddas kitob.                                      */
export function quronYasa() {
  const g = new THREE.Group();

  /* Lavh (rahl) — yon tomondan qaraganda X hosil qiluvchi
     to‘rtta o‘yma taxta. Yuqoridagi V ichiga kitob qo‘yiladi. */
  const lavh = new THREE.Group();
  const BURCH = 0.44, UZUN = 0.80, MARKAZ = 0.33;

  function taxtaYasa() {
    const t = new THREE.Group();
    const asos = new THREE.Mesh(new THREE.BoxGeometry(0.055, UZUN, 0.05), M.yogochTuq());
    t.add(soya(asos, true));
    // O‘yma teshikchalar — taxta bo‘ylab
    for (let i = 0; i < 4; i++) {
      const teshik = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.06, 8), M.qora());
      teshik.rotation.x = Math.PI / 2;
      teshik.position.y = -0.24 + i * 0.16;
      t.add(teshik);
    }
    // Uchidagi yumaloq bezak
    for (const y of [-UZUN / 2, UZUN / 2]) {
      const bosh = new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 8), M.yogoch());
      bosh.scale.set(0.75, 1, 0.75);
      bosh.position.y = y;
      t.add(soya(bosh));
    }
    return t;
  }

  for (const x of [-0.21, 0.21]) {
    for (const yon of [-1, 1]) {
      const t = taxtaYasa();
      t.position.set(x, MARKAZ, 0);
      t.rotation.x = yon * BURCH;
      lavh.add(t);
    }
  }
  // Kesishma o‘qi — mis mix
  const oq = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.52, 10), M.mis());
  oq.rotation.z = Math.PI / 2;
  oq.position.y = MARKAZ;
  lavh.add(soya(oq));
  g.add(lavh);

  // Kitob — yopiq, tilla naqshli, lavh ustida yotibdi
  const kitob = new THREE.Group();
  const past = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.02, 0.44), M.charm(0x1F4A34));
  kitob.add(soya(past, true));
  const varaq = new THREE.Mesh(new THREE.BoxGeometry(0.60, 0.075, 0.42), M.qogoz());
  varaq.position.y = 0.048;
  kitob.add(soya(varaq));
  // Varaq qirralari zarhal
  const zar = new THREE.Mesh(new THREE.BoxGeometry(0.605, 0.079, 0.425), M.oltin());
  zar.position.y = 0.048;
  zar.scale.set(1.002, 0.99, 1.002);
  kitob.add(zar);
  const varaq2 = new THREE.Mesh(new THREE.BoxGeometry(0.596, 0.072, 0.416), M.qogoz());
  varaq2.position.y = 0.048;
  kitob.add(varaq2);

  const ust = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.022, 0.44), M.charm(0x1F4A34));
  ust.position.y = 0.096;
  kitob.add(soya(ust));
  // Muqovadagi zarhal ramka va markaziy medalyon
  const ramka = new THREE.Mesh(new THREE.TorusGeometry(1, 0.006, 6, 4), M.oltin());
  ramka.rotation.x = -Math.PI / 2;
  ramka.rotation.z = Math.PI / 4;
  ramka.scale.set(0.245, 0.175, 1);
  ramka.position.y = 0.109;
  kitob.add(ramka);
  const medal = yulduzNaqsh(0.075, 0.008, M.oltin());
  medal.scale.set(1, 1, 0.62);
  medal.position.y = 0.112;
  kitob.add(medal);
  const oʻrta = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.012, 8), M.feruza());
  oʻrta.position.y = 0.115;
  kitob.add(soya(oʻrta));
  // Jild tikuvi
  const tikuv = new THREE.Mesh(
    new THREE.CylinderGeometry(0.058, 0.058, 0.44, 10, 1, false, 0, Math.PI), M.charm(0x173A28));
  tikuv.rotation.x = Math.PI / 2;
  tikuv.rotation.y = Math.PI / 2;
  tikuv.position.set(-0.31, 0.055, 0);
  kitob.add(soya(tikuv));

  kitob.position.set(0, 0.695, 0.01);
  kitob.rotation.x = -0.40;
  g.add(kitob);

  return tugat(g, 1.35);
}

/* 11) HADIS TO‘PLAMI — Imom al-Buxoriyning «As-sahih» kabi
   to‘plamlari: taxlangan kitoblar, ipak xatcho‘p bilan.       */
export function hadisYasa() {
  const g = new THREE.Group();

  const ranglar = [0x1F4A34, 0x2A5B3F, 0x53331C, 0x1B3B6F];
  let y = 0;
  for (let i = 0; i < 4; i++) {
    const en = 0.80 - i * 0.03;
    const bo = 0.56 - i * 0.022;
    const qalin = 0.10;
    const k = kitobDona(en, qalin, bo, ranglar[i], i === 3);
    k.position.y = y;
    k.rotation.y = (i - 1.5) * 0.045;
    g.add(k);
    y += qalin + 0.008;
  }

  // Ipak xatcho‘p — ustki kitobdan chiqib turadi
  const lenta = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.006, 0.30), M.mato(0xB3382C));
  lenta.position.set(0.10, y - 0.06, 0.30);
  lenta.rotation.x = 0.15;
  g.add(soya(lenta));
  const lentaUch = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.06, 4), M.mato(0xB3382C));
  lentaUch.position.set(0.10, y - 0.08, 0.46);
  lentaUch.rotation.x = Math.PI / 2 + 0.2;
  g.add(soya(lentaUch));

  // Yon tomondan varaq qirralari — zarhal chiziqlar
  for (let i = 0; i < 4; i++) {
    const qir = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.05, 0.50 - i * 0.02), M.oltin());
    qir.position.set(0.40 - i * 0.015, 0.05 + i * 0.108, 0);
    g.add(qir);
  }

  return tugat(g, 1.15);
}

/* 12) TASBEH — zikr va sabr tarbiyasi bilan bog‘liq buyum.
   Doiraga terilgan donalar, imoma va popuk.                   */
export function tasbehYasa() {
  const g = new THREE.Group();

  const R = 0.38;
  const donaMat = M.charm(0x3E2A1C);
  const donaMat2 = M.charm(0x6B4A2E);

  // Halqa bo‘ylab donalar
  const soni = 33;
  for (let i = 0; i < soni; i++) {
    const a = (i / soni) * Math.PI * 2 - Math.PI / 2;
    if (a > -Math.PI / 2 - 0.4 && a < -Math.PI / 2 + 0.4 && i !== 0) { /* joy qoldiramiz */ }
    const dona = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 10),
      (i % 11 === 0) ? M.feruza() : (i % 2 ? donaMat : donaMat2));
    dona.scale.set(1, 0.85, 1);
    // Halqa biroz oval — stol ustida yotgan tasbeh
    dona.position.set(Math.cos(a) * R, 0.036, Math.sin(a) * R * 0.72);
    g.add(soya(dona, true));
  }
  // Ip — donalar orasidan o‘tgan
  const ip = new THREE.Mesh(new THREE.TorusGeometry(R, 0.006, 6, 60), M.charm(0x2A1D12));
  ip.rotation.x = -Math.PI / 2;
  ip.scale.set(1, 0.72, 1);
  ip.position.y = 0.036;
  g.add(ip);

  // Imoma — uzun bosh dona
  const imoma = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.16, 12), M.charm(0x2A1D12));
  imoma.rotation.z = Math.PI / 2;
  imoma.position.set(0, 0.045, -R * 0.72 - 0.06);
  g.add(soya(imoma, true));
  for (const yon of [-1, 1]) {
    const uch = new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 10), M.oltin());
    uch.position.set(yon * 0.085, 0.045, -R * 0.72 - 0.06);
    g.add(soya(uch));
  }

  // Popuk
  const popukBosh = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 8), M.mato(0x1B3B6F));
  popukBosh.position.set(0, 0.045, -R * 0.72 - 0.14);
  g.add(soya(popukBosh));
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const ipcha = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.003, 0.17, 5), M.mato(0x1B3B6F));
    ipcha.rotation.x = Math.PI / 2;
    ipcha.position.set(Math.cos(a) * 0.016, 0.030 + Math.sin(a) * 0.014, -R * 0.72 - 0.24);
    g.add(ipcha);
  }

  return tugat(g, 1.1);
}

/* 13) MASJID — gumbaz va minora. Islomiy ta’limot manbalarining
   o‘qitilgan makoni (madrasa-masjid me’morligi).              */
export function minoraYasa() {
  const g = new THREE.Group();

  // Poydevor
  const poy = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.07, 0.62), M.tosh());
  poy.position.y = 0.035;
  g.add(soya(poy, true));

  /* --- Masjid binosi --- */
  const bino = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.40, 0.50), M.charm(0xD8C9A8));
  bino.position.set(-0.09, 0.27, 0);
  g.add(soya(bino, true));

  // Peshtoq — kirish ravog‘i
  const peshtoq = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.44, 0.06), M.charm(0xE3D6BA));
  peshtoq.position.set(-0.09, 0.29, 0.26);
  g.add(soya(peshtoq));
  const ravoqTesh = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.07, 16, 1, false, 0, Math.PI), M.qora());
  ravoqTesh.rotation.x = Math.PI / 2;
  ravoqTesh.rotation.z = Math.PI;
  ravoqTesh.position.set(-0.09, 0.30, 0.27);
  g.add(ravoqTesh);
  const eshik = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.20, 0.03), M.yogochTuq());
  eshik.position.set(-0.09, 0.20, 0.275);
  g.add(soya(eshik));
  // Peshtoq ustidagi feruza jiyak
  const jiyak = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.035, 0.02), M.feruza());
  jiyak.position.set(-0.09, 0.495, 0.275);
  g.add(jiyak);

  // Gumbaz baraban (silindr)
  const baraban = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.20, 0.13, 20), M.charm(0xD8C9A8));
  baraban.position.set(-0.09, 0.535, 0);
  g.add(soya(baraban));
  // Barabandagi feruza kamar
  const kamar = new THREE.Mesh(new THREE.TorusGeometry(0.198, 0.017, 8, 26), M.feruza());
  kamar.rotation.x = -Math.PI / 2;
  kamar.position.set(-0.09, 0.545, 0);
  g.add(kamar);

  // Gumbaz — qovurg‘ali feruza kubba
  const gumbaz = new THREE.Mesh(new THREE.SphereGeometry(0.195, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), M.feruza());
  gumbaz.scale.y = 1.15;
  gumbaz.position.set(-0.09, 0.60, 0);
  g.add(soya(gumbaz));
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const qovurga = new THREE.Mesh(new THREE.TorusGeometry(0.196, 0.008, 6, 14, Math.PI / 2), M.kok());
    qovurga.rotation.set(0, a, 0);
    qovurga.scale.y = 1.15;
    qovurga.position.set(-0.09, 0.60, 0);
    g.add(qovurga);
  }
  // Gumbaz cho‘qqisi
  const choqqi = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.09, 10), M.oltin());
  choqqi.position.set(-0.09, 0.85, 0);
  g.add(soya(choqqi));

  /* --- Minora --- */
  const minoraTana = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.082, 0.78, 18), M.charm(0xD8C9A8));
  minoraTana.position.set(0.32, 0.46, 0);
  g.add(soya(minoraTana, true));
  // Minoradagi g‘ishtli kamarlar
  for (let i = 0; i < 4; i++) {
    const k = new THREE.Mesh(new THREE.TorusGeometry(0.072 + (3 - i) * 0.004, 0.011, 8, 20), M.feruza());
    k.rotation.x = -Math.PI / 2;
    k.position.set(0.32, 0.22 + i * 0.17, 0);
    g.add(k);
  }
  // Sharafa (balkon)
  const sharafa = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.09, 0.045, 18), M.charm(0xE3D6BA));
  sharafa.position.set(0.32, 0.865, 0);
  g.add(soya(sharafa));
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const panjara = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.05, 0.014), M.charm(0xE3D6BA));
    panjara.position.set(0.32 + Math.cos(a) * 0.10, 0.905, Math.sin(a) * 0.10);
    panjara.rotation.y = a;
    g.add(panjara);
  }
  // Minora qalpog‘i
  const qalpoq = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.062, 0.10, 14), M.charm(0xD8C9A8));
  qalpoq.position.set(0.32, 0.985, 0);
  g.add(soya(qalpoq));
  const kubba = new THREE.Mesh(new THREE.SphereGeometry(0.062, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), M.feruza());
  kubba.position.set(0.32, 1.035, 0);
  g.add(soya(kubba));
  const uchOltin = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.07, 8), M.oltin());
  uchOltin.position.set(0.32, 1.13, 0);
  g.add(soya(uchOltin));

  return tugat(g, 1.4);
}

/* =========================================================
   REYESTR — o‘yin va galereyalar shu jadvaldan foydalanadi.
   `tur` maydoni manba turini bildiradi:
     1 — mutafakkirlar merosi
     2 — xalq og‘zaki ijodi va urf-odatlar
     3 — islomiy ta’limot manbalari
   ========================================================= */
export const MANBALAR = {
  xamsa: {
    nom: '«Xamsa» — Alisher Navoiy', tur: 1, yasa: xamsaYasa,
    izoh: 'Besh dostondan iborat asar — mutafakkir merosining eng yorqin namunasi.',
  },
  devon: {
    nom: '«Devonu lug‘otit turk»', tur: 1, yasa: devonYasa,
    izoh: 'Mahmud Qoshg‘ariy XI asrda folklor namunalarini yozib qoldirgan asar.',
  },
  tadbiriManozil: {
    nom: '«Tadbiri manozil» — Ibn Sino', tur: 1, yasa: tadbiriManozilYasa,
    izoh: 'Oilada tarbiya va maktabda o‘qitish haqidagi bob shu asarda keltirilgan.',
  },
  turkiyGuliston: {
    nom: '«Turkiy guliston yoxud axloq»', tur: 1, yasa: turkiyGulistonYasa,
    izoh: 'Abdulla Avloniyning odobnomasi — axloq tarbiyasining darsligi.',
  },

  dombira: {
    nom: 'Baxshi do‘mbirasi', tur: 2, yasa: dombiraYasa,
    izoh: '«Alpomish», «Go‘ro‘g‘li» dostonlari shu cholg‘u jo‘rligida aytilgan.',
  },
  ucharGilam: {
    nom: '«Uchar gilam»', tur: 2, yasa: ucharGilamYasa,
    izoh: 'Xalq ertaklaridagi orzu timsoli — mehnatni yengillashtirish istagi.',
  },
  sehrliDasturxon: {
    nom: '«Sehrli dasturxon»', tur: 2, yasa: sehrliDasturxonYasa,
    izoh: 'Ertaklardagi to‘kinlik ramzi; dasturxon odobi ham shu bilan o‘rgatilgan.',
  },
  oynaiJahon: {
    nom: '«Oynai jahon»', tur: 2, yasa: oynaiJahonYasa,
    izoh: 'Uzoqni ko‘rish orzusi — xalq og‘zaki ijodidagi mashhur sehrli buyum.',
  },
  xumoQush: {
    nom: 'Xumo qushi', tur: 2, yasa: xumoQushYasa,
    izoh: 'Miflardagi baxt va tole qushi — yaxshilik tantanasining timsoli.',
  },

  quron: {
    nom: 'Qur’oni karim va lavh', tur: 3, yasa: quronYasa,
    izoh: 'Xalq pedagogikasining uchinchi manbai — muqaddas kitob ta’limoti.',
  },
  hadis: {
    nom: 'Hadislar to‘plami', tur: 3, yasa: hadisYasa,
    izoh: 'Imom al-Buxoriyning «As-sahih» to‘plami — odob-axloq manbai.',
  },
  tasbeh: {
    nom: 'Tasbeh', tur: 3, yasa: tasbehYasa,
    izoh: 'Zikr va sabr odobini o‘rgatuvchi buyum.',
  },
  minora: {
    nom: 'Masjid va minora', tur: 3, yasa: minoraYasa,
    izoh: 'Islomiy ta’lim asrlar davomida shu maskanlarda berilgan.',
  },
};

/* Manba turlarining nomlari — o‘yin sandiqlariga yoziladi */
export const MANBA_TURLARI = [
  { id: 1, nom: 'Mutafakkirlar merosi', qisqa: 'Asarlar, odobnoma va pandnomalar', rang: 0x1B3B6F },
  { id: 2, nom: 'Xalq og‘zaki ijodi', qisqa: 'Folklor, qadriyat va urf-odatlar', rang: 0xB3382C },
  { id: 3, nom: 'Islomiy ta’limot', qisqa: 'Qur’on, hadis va islomiy manbalar', rang: 0x2F6B45 },
];
