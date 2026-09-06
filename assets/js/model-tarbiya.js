/* =========================================================
   TARBIYA VOSITALARI — 3D modellar (4-modul)
   «Xalq pedagogikasida yoshlarni tarbiyalashning metod, usul
   va vositalari» mavzusi uchun: aqliy, axloqiy, jismoniy va
   mehnat tarbiyasining moddiy timsollari.

   Bu fayl model-maishiy.js dagi shartnomaga amal qiladi:
   har bir `xYasa()` funksiyasi THREE.Group qaytaradi, eng katta
   o‘lchami 1.0–1.5 birlik, pastki nuqtasi y = 0, xz bo‘yicha
   markazlashgan.

   Istisno — `niholYasa(pogona)`: u 0..12 pog‘onaga qarab o‘sadi,
   shuning uchun uning o‘lchami ataylab o‘zgaruvchan (ildizi y = 0,
   tanasi (0,0) da). Bargli mesh’lar `userData.barg = true` bilan
   belgilanadi — o‘yin xato javobda ulardan bittasini to‘kadi.
   ========================================================= */
import * as THREE from '../vendor/three.module.min.js';

/* model-maishiy.js dagi tayyor modellarni qayta ishlatamiz */
import {
  kitobYasa, nonYasa, dasturxonYasa, choynakYasa, ketmonYasa, oroqYasa
} from './model-maishiy.js';

export { kitobYasa, nonYasa, dasturxonYasa, choynakYasa, ketmonYasa, oroqYasa };

/* =========================================================
   0. UMUMIY MATERIALLAR VA YORDAMCHILAR
   ========================================================= */
const M = {
  yogoch:    () => new THREE.MeshStandardMaterial({ color: 0x8A6A44, roughness: 0.84 }),
  yogochOch: () => new THREE.MeshStandardMaterial({ color: 0xB08E64, roughness: 0.80 }),
  yogochTuq: () => new THREE.MeshStandardMaterial({ color: 0x6E5334, roughness: 0.88 }),
  qamish:    () => new THREE.MeshStandardMaterial({ color: 0xC9A05A, roughness: 0.88 }),
  sopol:     () => new THREE.MeshStandardMaterial({ color: 0xE3D6BC, roughness: 0.62 }),
  sopolKok:  () => new THREE.MeshStandardMaterial({ color: 0x1B3B6F, roughness: 0.45 }),
  metall:    () => new THREE.MeshStandardMaterial({ color: 0x9AA2AC, roughness: 0.38, metalness: 0.78 }),
  metallOch: () => new THREE.MeshStandardMaterial({ color: 0xD5DAE0, roughness: 0.2, metalness: 0.9 }),
  oltin:     () => new THREE.MeshStandardMaterial({ color: 0xD4A24C, roughness: 0.45, metalness: 0.4 }),
  siyoh:     () => new THREE.MeshStandardMaterial({ color: 0x161320, roughness: 0.28, metalness: 0.1 }),
  mato:      (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 }),
  tosh:      () => new THREE.MeshStandardMaterial({ color: 0xE8DCC4, roughness: 0.9 }),
  ip:        (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.96 }),
};

function soya(m, qabul = false) {
  m.castShadow = true;
  if (qabul) m.receiveShadow = true;
  return m;
}

/* Guruhni shartnomaga moslash: eng katta o‘lchami `nishon` bo‘ladi,
   pastki nuqtasi y = 0 ga tushadi, xz bo‘yicha markazlashadi.
   Bolalar ichki guruhga ko‘chiriladi — shuning uchun tashqi Group
   toza qoladi va o‘yin uni bemalol aylantira oladi. */
function moslashtir(g, nishon) {
  const ich = new THREE.Group();
  while (g.children.length) ich.add(g.children[0]);
  g.add(ich);

  let quti = new THREE.Box3().setFromObject(ich);
  const olcham = new THREE.Vector3();
  quti.getSize(olcham);
  const eng = Math.max(olcham.x, olcham.y, olcham.z) || 1;
  if (nishon) ich.scale.setScalar(nishon / eng);

  quti = new THREE.Box3().setFromObject(ich);
  const orta = new THREE.Vector3();
  quti.getCenter(orta);
  ich.position.set(-orta.x, -quti.min.y, -orta.z);
  return g;
}

/* Faqat joylashuvni to‘g‘rilash (o‘lchamga tegmasdan) */
function joyla(g) { return moslashtir(g, 0); }

/* =========================================================
   1) DAVOT VA QAMISH QALAM — aqliy tarbiya
   Sopol siyohdon (davot), yonida qamish qalam (qalamqut),
   ostida yog‘och taglik va sepilgan qum.
   ========================================================= */
export function davotQalamYasa() {
  const g = new THREE.Group();
  const sopol = M.sopol(), kok = M.sopolKok(), yog = M.yogoch(), yogT = M.yogochTuq();

  /* Yog‘och taglik — chetlari ko‘tarilgan lavhacha */
  const taglik = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.045, 0.46), yog);
  taglik.position.y = 0.022;
  g.add(soya(taglik, true));
  for (const z of [-0.225, 0.225]) {
    const jiyak = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.05, 0.032), yogT);
    jiyak.position.set(0, 0.062, z);
    g.add(soya(jiyak));
  }
  for (const x of [-0.525, 0.525]) {
    const jiyak = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.05, 0.46), yogT);
    jiyak.position.set(x, 0.062, 0);
    g.add(soya(jiyak));
  }

  /* Davot (siyohdon) — LatheGeometry bilan sopol idish */
  const profil = [
    new THREE.Vector2(0.000, 0.000),
    new THREE.Vector2(0.130, 0.000),
    new THREE.Vector2(0.155, 0.030),
    new THREE.Vector2(0.185, 0.110),
    new THREE.Vector2(0.170, 0.200),
    new THREE.Vector2(0.120, 0.250),
    new THREE.Vector2(0.108, 0.270),
    new THREE.Vector2(0.098, 0.255),
    new THREE.Vector2(0.148, 0.205),
    new THREE.Vector2(0.160, 0.120),
    new THREE.Vector2(0.135, 0.040),
    new THREE.Vector2(0.000, 0.040),
  ];
  const davot = new THREE.Mesh(new THREE.LatheGeometry(profil, 26), sopol);
  davot.position.set(-0.30, 0.045, 0);
  g.add(soya(davot, true));

  /* Og‘iz halqasi va ko‘k naqsh */
  const halqa = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.011, 8, 24), kok);
  halqa.rotation.x = -Math.PI / 2;
  halqa.position.set(-0.30, 0.315, 0);
  g.add(halqa);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const n = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), kok);
    n.scale.set(1, 1.5, 0.45);
    n.position.set(-0.30 + Math.cos(a) * 0.176, 0.155, Math.sin(a) * 0.176);
    g.add(n);
  }

  /* Ichidagi siyoh */
  const siyoh = new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.098, 0.012, 20), M.siyoh());
  siyoh.position.set(-0.30, 0.295, 0);
  g.add(siyoh);

  /* Qamish qalam — davot chetiga suyalgan */
  function qalam(bosh, oxir, yugon) {
    const q = new THREE.Group();
    const uz = bosh.distanceTo(oxir);
    const tana = new THREE.Mesh(
      new THREE.CylinderGeometry(yugon * 0.82, yugon, uz, 8), M.qamish());
    q.add(soya(tana));
    /* Qamishning bo‘g‘imlari */
    for (let i = 1; i <= 2; i++) {
      const b = new THREE.Mesh(new THREE.TorusGeometry(yugon * 1.05, yugon * 0.28, 6, 12), M.yogochTuq());
      b.rotation.x = Math.PI / 2;
      b.position.y = -uz / 2 + (uz / 3) * i;
      q.add(b);
    }
    /* Qiyalab kesilgan uchi va siyoh yorig‘i */
    const uch = new THREE.Mesh(new THREE.ConeGeometry(yugon * 0.85, 0.12, 8), M.qamish());
    uch.position.y = -uz / 2 - 0.05;
    uch.rotation.x = Math.PI;
    uch.scale.z = 0.55;
    q.add(soya(uch));
    const nib = new THREE.Mesh(new THREE.ConeGeometry(yugon * 0.36, 0.05, 6), M.siyoh());
    nib.position.y = -uz / 2 - 0.10;
    nib.rotation.x = Math.PI;
    q.add(nib);

    /* Guruhni bosh–oxir chizig‘iga joylash */
    const orta = bosh.clone().add(oxir).multiplyScalar(0.5);
    q.position.copy(orta);
    const yon = oxir.clone().sub(bosh).normalize();
    q.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), yon);
    return q;
  }

  g.add(qalam(new THREE.Vector3(-0.16, 0.10, 0.10), new THREE.Vector3(0.62, 0.36, -0.02), 0.026));
  g.add(qalam(new THREE.Vector3(0.06, 0.09, -0.14), new THREE.Vector3(0.60, 0.11, 0.12), 0.022));

  /* Qurigan siyoh tomchilari */
  for (let i = 0; i < 4; i++) {
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6), M.siyoh());
    d.scale.y = 0.3;
    d.position.set(-0.06 + i * 0.09, 0.05, 0.13 - (i % 2) * 0.22);
    g.add(d);
  }

  return moslashtir(g, 1.22);
}

/* =========================================================
   2) RAHLE (LAVH) — kitob qo‘yiladigan X shaklidagi
   o‘yma yog‘och taglik. Aqliy tarbiya timsoli.
   ========================================================= */
export function rahleYasa() {
  const g = new THREE.Group();
  const yog = M.yogoch(), yogT = M.yogochTuq(), yogO = M.yogochOch();

  const OYOQ = 0.90;          // oyoq uzunligi
  const QIYA = 0.40;          // qiyalik burchagi (radian)
  const MARKAZ_Y = 0.415;

  /* To‘rtta oyoq — old va orqa juftlik X bo‘lib kesishadi */
  const oyoqGeo = new THREE.BoxGeometry(0.072, OYOQ, 0.048);
  for (const z of [-0.20, 0.20]) {
    for (const yon of [-1, 1]) {
      const o = new THREE.Mesh(oyoqGeo, yon > 0 ? yog : yogT);
      o.position.set(0, MARKAZ_Y, z);
      o.rotation.z = yon * QIYA;
      g.add(soya(o, true));
    }
  }

  /* O‘q — X ning kesishgan joyidagi mix (rahle shu yerdan buklanadi) */
  const oq = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.50, 10), yogO);
  oq.rotation.x = Math.PI / 2;
  oq.position.y = MARKAZ_Y;
  g.add(soya(oq));
  for (const z of [-0.25, 0.25]) {
    const tugma = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 8), M.oltin());
    tugma.position.set(0, MARKAZ_Y, z);
    g.add(soya(tugma));
  }

  /* Yuqori tayanch taxtachalari — kitob shu yerga qo‘yiladi */
  const ustki = 0.5 * OYOQ * Math.cos(QIYA);      // oyoq uchining balandligi
  for (const yon of [-1, 1]) {
    const x = yon * 0.5 * OYOQ * Math.sin(QIYA);
    const tayanch = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.05, 0.50), yogO);
    tayanch.position.set(x, MARKAZ_Y + ustki + 0.01, 0);
    tayanch.rotation.z = yon * QIYA * 0.5;
    g.add(soya(tayanch, true));
    /* Kitob sirg‘alib ketmasligi uchun kichik to‘siq */
    const tosiq = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.50), yogT);
    tosiq.position.set(x + yon * 0.055, MARKAZ_Y + ustki + 0.055, 0);
    g.add(soya(tosiq));
  }

  /* Pastdagi bog‘lovchi ko‘ndalang */
  const kondalang = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.055, 0.44), yog);
  kondalang.position.set(0, 0.10, 0);
  g.add(soya(kondalang, true));

  /* O‘yma bezak — oyoqlarda halqalar va romb (girih) donalari */
  const rombGeo = new THREE.OctahedronGeometry(0.038, 0);
  for (const z of [-0.20, 0.20]) {
    for (const yon of [-1, 1]) {
      for (let i = -1; i <= 1; i += 2) {
        const uz = i * OYOQ * 0.30;
        const px = -Math.sin(yon * QIYA) * uz;
        const py = MARKAZ_Y + Math.cos(yon * QIYA) * uz;
        const romb = new THREE.Mesh(rombGeo, yogO);
        romb.position.set(px, py, z + (z > 0 ? 0.03 : -0.03));
        romb.scale.set(1, 1.5, 0.45);
        romb.rotation.z = yon * QIYA;
        g.add(soya(romb));
      }
      /* O‘yilgan halqa */
      const halqa = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.011, 6, 14), yogT);
      halqa.position.set(0, MARKAZ_Y, z + (z > 0 ? 0.035 : -0.035));
      g.add(halqa);
    }
  }

  /* Oyoq uchlaridagi o‘yma barmoqlar */
  for (const z of [-0.20, 0.20]) {
    for (const yon of [-1, 1]) {
      const x = -Math.sin(yon * QIYA) * (-OYOQ / 2);
      const uch = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), yogO);
      uch.scale.set(1, 0.6, 1);
      uch.position.set(x, 0.02, z);
      g.add(soya(uch, true));
    }
  }

  return moslashtir(g, 1.10);
}

/* =========================================================
   3) KURASH BELBOG‘I — jismoniy tarbiya
   O‘ralgan, naqshli belbog‘, uchida tugun va ikkita uchi.
   Naqsh CanvasTexture orqali beriladi (takrorlanuvchi girih).
   ========================================================= */
function belbogToqima() {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const k = c.getContext('2d');
  k.fillStyle = '#B8442A';
  k.fillRect(0, 0, 64, 64);
  /* Chetdagi oltin yo‘l-yo‘l */
  k.fillStyle = '#D9AE55';
  k.fillRect(0, 0, 64, 7);
  k.fillRect(0, 57, 64, 7);
  /* O‘rtadagi romb naqsh */
  k.strokeStyle = '#EBD09A';
  k.lineWidth = 3;
  for (let i = 0; i < 2; i++) {
    const cx = 16 + i * 32;
    k.beginPath();
    k.moveTo(cx, 18); k.lineTo(cx + 13, 32);
    k.lineTo(cx, 46); k.lineTo(cx - 13, 32);
    k.closePath(); k.stroke();
  }
  k.fillStyle = '#F2E2BC';
  for (let i = 0; i < 2; i++) {
    k.beginPath();
    k.arc(16 + i * 32, 32, 3.4, 0, Math.PI * 2);
    k.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(16, 1);
  return t;
}

export function kurashBelbogYasa() {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ map: belbogToqima(), roughness: 0.94 });
  const tugunMat = new THREE.MeshStandardMaterial({ color: 0xA33B22, roughness: 0.94 });

  /* Asosiy o‘ram — spiral yo‘l bo‘ylab yassilangan quvur */
  const N = 170;
  const nuq = [];
  for (let i = 0; i <= N; i++) {
    const s = i / N;
    const a = -0.35 + s * Math.PI * 2 * 1.75;
    const R = 0.455 - 0.135 * s;
    const y = 0.10 + 0.30 * s;
    nuq.push(new THREE.Vector3(Math.cos(a) * R, y, Math.sin(a) * R));
  }
  const egri = new THREE.CatmullRomCurve3(nuq);
  const geo = new THREE.TubeGeometry(egri, N, 0.088, 12, false);
  geo.scale(1, 0.45, 1);                 // belbog‘ yassi bo‘ladi
  const oram = new THREE.Mesh(geo, mat);
  g.add(soya(oram, true));

  /* Tugun — o‘ramning old tomonida bog‘langan */
  const tugun = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.052, 10, 20), tugunMat);
  tugun.position.set(0.30, 0.15, 0.36);
  tugun.rotation.set(0.5, 0.6, 0.35);
  tugun.scale.set(1, 1, 0.72);
  g.add(soya(tugun, true));
  const bogich = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.30, 0.055), M.oltin());
  bogich.position.set(0.30, 0.15, 0.36);
  bogich.rotation.set(0.3, 0.6, 0.9);
  g.add(soya(bogich));

  /* Ikkita bo‘sh uch — tugundan chiqib yerga tushadi */
  function uch(bosh, orta, oxir) {
    const e = new THREE.CatmullRomCurve3([bosh, orta, oxir]);
    const ug = new THREE.TubeGeometry(e, 22, 0.078, 10, false);
    ug.scale(1, 0.42, 1);
    const m = new THREE.Mesh(ug, mat);
    g.add(soya(m, true));
  }
  uch(new THREE.Vector3(0.30, 0.14, 0.36),
      new THREE.Vector3(0.50, 0.13, 0.50),
      new THREE.Vector3(0.63, 0.04, 0.30));
  uch(new THREE.Vector3(0.30, 0.14, 0.36),
      new THREE.Vector3(0.36, 0.11, 0.58),
      new THREE.Vector3(0.16, 0.04, 0.66));

  return moslashtir(g, 1.22);
}

/* =========================================================
   4) KAMON VA O‘Q — jismoniy tarbiya (merganlik)
   Egik yog‘och kamon, tortilgan ip, patli o‘q.
   ========================================================= */
export function kamonYasa() {
  const g = new THREE.Group();
  const yog = M.yogochTuq();
  const shox = new THREE.MeshStandardMaterial({ color: 0x7A4C28, roughness: 0.7 });
  const ipMat = new THREE.MeshStandardMaterial({ color: 0xE8DFC8, roughness: 0.9 });

  /* Kamon gavdasi — ikki qayrilmali (rekurv) shakl */
  const yoyNuq = [
    new THREE.Vector3(-0.06, 0.02, 0),
    new THREE.Vector3(0.06, 0.14, 0),
    new THREE.Vector3(0.20, 0.38, 0),
    new THREE.Vector3(0.255, 0.60, 0),
    new THREE.Vector3(0.255, 0.78, 0),
    new THREE.Vector3(0.20, 1.00, 0),
    new THREE.Vector3(0.06, 1.24, 0),
    new THREE.Vector3(-0.06, 1.36, 0),
  ];
  const yoyEgri = new THREE.CatmullRomCurve3(yoyNuq);
  const yoy = new THREE.Mesh(new THREE.TubeGeometry(yoyEgri, 44, 0.036, 10, false), shox);
  g.add(soya(yoy, true));

  /* Gavdaning ustidagi shox qoplamasi (ingichka yo‘l) */
  const qoplama = new THREE.Mesh(new THREE.TubeGeometry(yoyEgri, 44, 0.014, 8, false), M.oltin());
  qoplama.position.z = 0.032;
  g.add(qoplama);

  /* Dastasi — teri bilan o‘ralgan */
  const dasta = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.24, 12), M.yogoch());
  dasta.position.set(0.255, 0.69, 0);
  g.add(soya(dasta, true));
  for (let i = 0; i < 5; i++) {
    const oram = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.011, 6, 14), M.yogochTuq());
    oram.rotation.x = Math.PI / 2;
    oram.position.set(0.255, 0.60 + i * 0.045, 0);
    g.add(oram);
  }

  /* Tortilgan ip — ikki uchdan o‘qning qo‘yilgan joyiga */
  const tortish = new THREE.Vector3(-0.13, 0.69, 0);
  for (const uchi of [yoyNuq[0], yoyNuq[yoyNuq.length - 1]]) {
    const uz = uchi.distanceTo(tortish);
    const ip = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, uz, 6), ipMat);
    const orta = uchi.clone().add(tortish).multiplyScalar(0.5);
    ip.position.copy(orta);
    ip.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0), tortish.clone().sub(uchi).normalize());
    g.add(ip);
  }
  const ipTugun = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.07, 8), ipMat);
  ipTugun.position.copy(tortish);
  g.add(ipTugun);

  /* O‘q — poya, temir uchi va uchta pat */
  const poya = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.019, 0.98, 8), M.qamish());
  poya.position.set(0.30, 0.69, 0);
  poya.rotation.z = -Math.PI / 2;
  g.add(soya(poya));

  const temir = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.15, 8), M.metallOch());
  temir.position.set(0.86, 0.69, 0);
  temir.rotation.z = -Math.PI / 2;
  g.add(soya(temir));
  const bogin = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.05, 8), M.metall());
  bogin.position.set(0.77, 0.69, 0);
  bogin.rotation.z = -Math.PI / 2;
  g.add(bogin);

  const patMat = new THREE.MeshStandardMaterial({
    color: 0xE7DCC2, roughness: 0.92, side: THREE.DoubleSide
  });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const pat = new THREE.Mesh(new THREE.PlaneGeometry(0.20, 0.10), patMat);
    pat.position.set(-0.09, 0.69 + Math.sin(a) * 0.038, Math.cos(a) * 0.038);
    pat.rotation.x = a;
    g.add(pat);
  }
  /* Patlarning bog‘ich ipi */
  for (const x of [-0.19, 0.02]) {
    const b = new THREE.Mesh(new THREE.TorusGeometry(0.021, 0.006, 6, 12), M.mato(0xC1502E));
    b.rotation.y = Math.PI / 2;
    b.position.set(x, 0.69, 0);
    g.add(b);
  }
  /* O‘qning ipga tayangan kertigi */
  const kertik = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.016, 0.05, 8), M.yogochTuq());
  kertik.position.set(-0.20, 0.69, 0);
  kertik.rotation.z = -Math.PI / 2;
  g.add(kertik);

  return moslashtir(g, 1.42);
}

/* =========================================================
   5) ARQON — uch tolasi eshilgan qalin arqon, halqa qilib
   o‘ralgan (jismoniy tarbiya: arqon tortish, chavandozlik).
   Har bir tola alohida spiral bo‘ylab eshiladi.
   ========================================================= */
export function arqonYasa() {
  const g = new THREE.Group();
  const tolaMat = [
    M.ip(0xCBA771), M.ip(0xB18E58), M.ip(0xDCC094)
  ];

  const BURAM = 2.15;       // necha marta o‘ralgan
  const ESHISH = 6;         // tolalarning eshilish zichligi
  const CHET = 0.044;       // tola markazdan chetlashishi
  const TOLA_R = 0.040;
  const QADAM = 260;

  function markaz(s) {
    return {
      a: s * Math.PI * 2 * BURAM,
      R: 0.480 - 0.075 * s,
      y: 0.062 + 0.095 * s
    };
  }

  for (let j = 0; j < 3; j++) {
    const nuq = [];
    for (let i = 0; i <= QADAM; i++) {
      const s = i / QADAM;
      const m = markaz(s);
      const faza = m.a * ESHISH + (j * Math.PI * 2) / 3;
      const rad = new THREE.Vector3(Math.cos(m.a), 0, Math.sin(m.a));
      const p = new THREE.Vector3(rad.x * m.R, m.y, rad.z * m.R);
      p.addScaledVector(rad, Math.cos(faza) * CHET);
      p.y += Math.sin(faza) * CHET;
      nuq.push(p);
    }
    const egri = new THREE.CatmullRomCurve3(nuq);
    const tola = new THREE.Mesh(
      new THREE.TubeGeometry(egri, QADAM, TOLA_R, 7, false), tolaMat[j]);
    g.add(soya(tola, true));
  }

  /* Bog‘ich — o‘ramni ushlab turuvchi ikkita chandiq */
  const bogMat = M.ip(0x8A5A34);
  for (const a0 of [Math.PI * 0.35, Math.PI * 1.35]) {
    const m = markaz(0.5);
    const chandiq = new THREE.Mesh(
      new THREE.TorusGeometry(0.145, 0.024, 8, 20), bogMat);
    chandiq.position.set(Math.cos(a0) * m.R, 0.115, Math.sin(a0) * m.R);
    chandiq.rotation.y = -a0;
    g.add(soya(chandiq));
  }

  /* Bo‘sh uchi — o‘ramdan chiqib yerga yotadi, uchi tolalarga ajragan */
  const oxir = markaz(1);
  const bosh = new THREE.Vector3(Math.cos(oxir.a) * oxir.R, oxir.y, Math.sin(oxir.a) * oxir.R);
  const yonalish = new THREE.Vector3(-Math.sin(oxir.a), 0, Math.cos(oxir.a));
  const uchEgri = new THREE.CatmullRomCurve3([
    bosh,
    bosh.clone().addScaledVector(yonalish, 0.17).setY(0.10),
    bosh.clone().addScaledVector(yonalish, 0.30).setY(0.055)
  ]);
  const uchArqon = new THREE.Mesh(
    new THREE.TubeGeometry(uchEgri, 18, 0.082, 10, false), tolaMat[0]);
  g.add(soya(uchArqon, true));

  const soch = uchEgri.getPoint(1);
  for (let i = 0; i < 4; i++) {
    const tola = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.13, 6), tolaMat[i % 3]);
    tola.position.copy(soch)
      .addScaledVector(yonalish, 0.06)
      .add(new THREE.Vector3((i - 1.5) * 0.026, -0.012, (i % 2 - 0.5) * 0.04));
    tola.rotation.z = Math.PI / 2 - 0.25 + i * 0.14;
    tola.rotation.y = (i - 1.5) * 0.2;
    g.add(soya(tola));
  }

  return moslashtir(g, 1.25);
}

/* =========================================================
   6) MEVA SAVATI — mehnat tarbiyasi
   To‘qilgan qamish savat, ichida meva va paxta.
   ========================================================= */
export function savatYasa() {
  const g = new THREE.Group();
  const qamish = M.qamish();
  const qamishTuq = new THREE.MeshStandardMaterial({ color: 0xA9793C, roughness: 0.92 });

  const PAST_R = 0.20, TEPA_R = 0.46, BALAND = 0.44;

  /* Savat devori — ochiq lathe (ikki tomondan ko‘rinadi) */
  const profil = [
    new THREE.Vector2(PAST_R, 0.00),
    new THREE.Vector2(PAST_R + 0.05, 0.05),
    new THREE.Vector2(0.34, 0.20),
    new THREE.Vector2(TEPA_R, BALAND),
  ];
  const devorMat = new THREE.MeshStandardMaterial({
    color: 0xBE8E4E, roughness: 0.94, side: THREE.DoubleSide
  });
  const devor = new THREE.Mesh(new THREE.LatheGeometry(profil, 30), devorMat);
  g.add(soya(devor, true));

  /* Tubi */
  const tub = new THREE.Mesh(new THREE.CircleGeometry(PAST_R + 0.01, 24), qamishTuq);
  tub.rotation.x = -Math.PI / 2;
  tub.position.y = 0.012;
  g.add(soya(tub, true));

  /* Tik qovurg‘alar — to‘qishning asosi */
  const QOVURGA = 18;
  for (let i = 0; i < QOVURGA; i++) {
    const a = (i / QOVURGA) * Math.PI * 2;
    const yon = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
    const egri = new THREE.CatmullRomCurve3([
      yon.clone().multiplyScalar(PAST_R + 0.01).setY(0.01),
      yon.clone().multiplyScalar(0.345).setY(0.21),
      yon.clone().multiplyScalar(TEPA_R + 0.005).setY(BALAND + 0.015)
    ]);
    const q = new THREE.Mesh(
      new THREE.TubeGeometry(egri, 10, 0.017, 6, false),
      i % 2 ? qamish : qamishTuq);
    g.add(soya(q));
  }

  /* Ko‘ndalang to‘qim halqalari */
  for (let i = 0; i < 5; i++) {
    const s = (i + 0.5) / 5;
    const r = PAST_R + (TEPA_R - PAST_R) * Math.pow(s, 0.78);
    const h = new THREE.Mesh(
      new THREE.TorusGeometry(r + 0.008, 0.019, 6, 30),
      i % 2 ? qamishTuq : qamish);
    h.rotation.x = -Math.PI / 2;
    h.position.y = BALAND * s;
    g.add(soya(h));
  }

  /* Og‘iz jiyagi — eshilgan chetlama */
  const jiyak = new THREE.Mesh(new THREE.TorusGeometry(TEPA_R + 0.012, 0.03, 8, 34), qamishTuq);
  jiyak.rotation.x = -Math.PI / 2;
  jiyak.position.y = BALAND + 0.01;
  g.add(soya(jiyak));

  /* Dastasi — yoysimon */
  const dastaEgri = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-TEPA_R + 0.02, BALAND, 0),
    new THREE.Vector3(-0.27, BALAND + 0.30, 0),
    new THREE.Vector3(0, BALAND + 0.40, 0),
    new THREE.Vector3(0.27, BALAND + 0.30, 0),
    new THREE.Vector3(TEPA_R - 0.02, BALAND, 0),
  ]);
  const dasta = new THREE.Mesh(
    new THREE.TubeGeometry(dastaEgri, 26, 0.026, 8, false), qamishTuq);
  g.add(soya(dasta, true));
  for (let i = 1; i <= 4; i++) {
    const p = dastaEgri.getPoint(i / 5);
    const oram = new THREE.Mesh(new THREE.TorusGeometry(0.033, 0.009, 6, 12), qamish);
    oram.position.copy(p);
    oram.rotation.y = Math.PI / 2;
    g.add(oram);
  }

  /* Ichidagi hosil — olma, behi, uzum va paxta */
  const olmaMat = new THREE.MeshStandardMaterial({ color: 0xC0392B, roughness: 0.45 });
  const behiMat = new THREE.MeshStandardMaterial({ color: 0xD9B23C, roughness: 0.55 });
  const uzumMat = new THREE.MeshStandardMaterial({ color: 0x5B3A6E, roughness: 0.5 });
  const paxtaMat = new THREE.MeshStandardMaterial({ color: 0xFAF6EC, roughness: 0.98 });
  const bandMat = new THREE.MeshStandardMaterial({ color: 0x4E6B33, roughness: 0.9 });

  const mevaGeo = new THREE.SphereGeometry(0.115, 14, 11);
  const joylar = [
    [-0.17, 0.42, 0.07, olmaMat, 1.0],
    [0.10, 0.44, -0.13, olmaMat, 0.92],
    [0.16, 0.40, 0.14, behiMat, 1.05],
    [-0.05, 0.50, -0.02, olmaMat, 0.85],
  ];
  joylar.forEach(function (j) {
    const m = new THREE.Mesh(mevaGeo, j[3]);
    m.position.set(j[0], j[1], j[2]);
    m.scale.setScalar(j[4]);
    m.scale.y *= 0.92;
    g.add(soya(m, true));
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.06, 5), bandMat);
    band.position.set(j[0], j[1] + 0.10 * j[4], j[2]);
    band.rotation.z = 0.3;
    g.add(band);
  });

  /* Uzum boshi */
  const uzumGeo = new THREE.SphereGeometry(0.042, 8, 7);
  for (let i = 0; i < 9; i++) {
    const a = i * 1.9;
    const u = new THREE.Mesh(uzumGeo, uzumMat);
    u.position.set(
      0.27 + Math.cos(a) * 0.055,
      0.44 - (i % 3) * 0.045,
      -0.02 + Math.sin(a) * 0.055
    );
    g.add(soya(u));
  }

  /* Paxta chanoqlari */
  for (let i = 0; i < 3; i++) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), paxtaMat);
    p.position.set(-0.28 + i * 0.06, 0.47 + (i % 2) * 0.04, 0.20 - i * 0.09);
    p.scale.set(1, 0.85, 1);
    g.add(soya(p));
  }

  return moslashtir(g, 1.14);
}

/* =========================================================
   7) URCHUQ — yigiruv urchug‘i (ip yigirish, mehnat tarbiyasi)
   ========================================================= */
export function urchuqYasa() {
  const g = new THREE.Group();
  const yog = M.yogochOch();

  /* Mil — ikki uchi ingichka tayoq */
  const milProfil = [
    new THREE.Vector2(0.000, 0.00),
    new THREE.Vector2(0.008, 0.01),
    new THREE.Vector2(0.016, 0.10),
    new THREE.Vector2(0.021, 0.40),
    new THREE.Vector2(0.019, 0.72),
    new THREE.Vector2(0.012, 0.92),
    new THREE.Vector2(0.006, 1.00),
    new THREE.Vector2(0.000, 1.02),
  ];
  const mil = new THREE.Mesh(new THREE.LatheGeometry(milProfil, 12), yog);
  g.add(soya(mil, true));

  /* Yurgich (charxpalak) — pastdagi og‘irlik disk */
  const diskProfil = [
    new THREE.Vector2(0.020, 0.00),
    new THREE.Vector2(0.150, 0.015),
    new THREE.Vector2(0.190, 0.055),
    new THREE.Vector2(0.150, 0.095),
    new THREE.Vector2(0.020, 0.110),
  ];
  const disk = new THREE.Mesh(new THREE.LatheGeometry(diskProfil, 22), M.yogochTuq());
  disk.position.y = 0.16;
  g.add(soya(disk, true));
  const naqsh = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.010, 6, 26), M.oltin());
  naqsh.rotation.x = -Math.PI / 2;
  naqsh.position.y = 0.215;
  g.add(naqsh);

  /* O‘ralgan ip — yurgich ustida yig‘ilgan pilla */
  const ipProfil = [
    new THREE.Vector2(0.022, 0.00),
    new THREE.Vector2(0.075, 0.05),
    new THREE.Vector2(0.098, 0.17),
    new THREE.Vector2(0.086, 0.30),
    new THREE.Vector2(0.040, 0.40),
    new THREE.Vector2(0.022, 0.42),
  ];
  const pilla = new THREE.Mesh(new THREE.LatheGeometry(ipProfil, 20), M.ip(0xE9E0CB));
  pilla.position.y = 0.30;
  g.add(soya(pilla, true));
  /* Ip qatlamlari */
  for (let i = 0; i < 7; i++) {
    const y = 0.34 + i * 0.045;
    const r = 0.096 - Math.abs(i - 3) * 0.012;
    const h = new THREE.Mesh(new THREE.TorusGeometry(r, 0.007, 5, 20), M.ip(0xD8CDB2));
    h.rotation.x = -Math.PI / 2;
    h.position.y = y;
    g.add(h);
  }

  /* Chiqib turgan ip uchi va ilmoq */
  const ipEgri = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.02, 0.72, 0),
    new THREE.Vector3(0.12, 0.90, 0.05),
    new THREE.Vector3(0.05, 1.00, -0.02),
  ]);
  const ipUchi = new THREE.Mesh(
    new THREE.TubeGeometry(ipEgri, 14, 0.007, 5, false), M.ip(0xE9E0CB));
  g.add(ipUchi);
  const ilmoq = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.006, 6, 12), M.metall());
  ilmoq.position.set(0, 1.00, 0);
  ilmoq.rotation.x = Math.PI / 2;
  g.add(ilmoq);

  return moslashtir(g, 1.10);
}

/* =========================================================
   8) RAVOQ — ikki o‘yma ustun va peshtoq ravog‘i.
   Tarbiya supasining me’moriy karkasi. `rang` — supaning
   o‘z rangi (masalan indigo, terrakota, yashil, oltin).
   ========================================================= */
export function ravoqYasa(rang) {
  const g = new THREE.Group();
  const asos = (rang == null) ? 0x8A5A34 : rang;
  const naqshMat = new THREE.MeshStandardMaterial({ color: asos, roughness: 0.55, metalness: 0.08 });
  const chuqurMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(asos).multiplyScalar(0.6), roughness: 0.7
  });
  const toshMat = M.tosh();
  const yogMat = M.yogoch();
  const yogTMat = M.yogochTuq();

  const YARIM = 0.475;
  const YOY_TAG = 0.90;

  for (const yon of [-1, 1]) {
    const x = yon * YARIM;

    /* Poydevor */
    const poy = new THREE.Mesh(new THREE.BoxGeometry(0.225, 0.065, 0.225), toshMat);
    poy.position.set(x, 0.033, 0);
    g.add(soya(poy, true));
    const poyUst = new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.110, 0.055, 12), chuqurMat);
    poyUst.position.set(x, 0.093, 0);
    g.add(soya(poyUst, true));

    /* O‘yma ustun — bo‘g‘imli lathe profil */
    const profil = [
      new THREE.Vector2(0.000, 0.000),
      new THREE.Vector2(0.086, 0.000),
      new THREE.Vector2(0.082, 0.045),
      new THREE.Vector2(0.066, 0.085),
      new THREE.Vector2(0.072, 0.150),
      new THREE.Vector2(0.062, 0.300),
      new THREE.Vector2(0.070, 0.345),
      new THREE.Vector2(0.058, 0.400),
      new THREE.Vector2(0.064, 0.520),
      new THREE.Vector2(0.054, 0.585),
      new THREE.Vector2(0.070, 0.625),
      new THREE.Vector2(0.060, 0.665),
      new THREE.Vector2(0.000, 0.665),
    ];
    const ustun = new THREE.Mesh(new THREE.LatheGeometry(profil, 14), yogMat);
    ustun.position.set(x, 0.120, 0);
    g.add(soya(ustun, true));

    /* Ustundagi o‘yma halqalar */
    for (const h of [0.30, 0.55]) {
      const halqa = new THREE.Mesh(new THREE.TorusGeometry(0.076, 0.012, 6, 16), yogTMat);
      halqa.rotation.x = -Math.PI / 2;
      halqa.position.set(x, 0.120 + h, 0);
      g.add(halqa);
    }

    /* Sarustun (kapitel) — ikki qavatli muqarnas */
    const k1 = new THREE.Mesh(new THREE.BoxGeometry(0.165, 0.045, 0.165), yogTMat);
    k1.position.set(x, 0.808, 0);
    g.add(soya(k1, true));
    const k2 = new THREE.Mesh(new THREE.BoxGeometry(0.205, 0.045, 0.205), naqshMat);
    k2.position.set(x, 0.855, 0);
    g.add(soya(k2, true));
  }

  /* Ustunlarni bog‘lovchi to‘sin */
  const tosin = new THREE.Mesh(new THREE.BoxGeometry(1.155, 0.055, 0.20), yogMat);
  tosin.position.set(0, 0.905, 0);
  g.add(soya(tosin, true));

  /* Ravoq — o‘tkir uchli peshtoq yoyi (ExtrudeGeometry) */
  const TASH = 0.575, ICH = 0.385, APEKS_T = 1.46, APEKS_I = 1.27;
  const sh = new THREE.Shape();
  sh.moveTo(-TASH, YOY_TAG);
  sh.quadraticCurveTo(-TASH + 0.03, APEKS_T - 0.30, 0, APEKS_T);
  sh.quadraticCurveTo(TASH - 0.03, APEKS_T - 0.30, TASH, YOY_TAG);
  sh.lineTo(ICH, YOY_TAG);
  sh.quadraticCurveTo(ICH - 0.02, APEKS_I - 0.26, 0, APEKS_I);
  sh.quadraticCurveTo(-ICH + 0.02, APEKS_I - 0.26, -ICH, YOY_TAG);
  sh.closePath();

  const yoyGeo = new THREE.ExtrudeGeometry(sh, {
    depth: 0.17, bevelEnabled: true, bevelThickness: 0.012,
    bevelSize: 0.012, bevelSegments: 1, curveSegments: 20
  });
  yoyGeo.translate(0, 0, -0.085);
  const yoy = new THREE.Mesh(yoyGeo, naqshMat);
  g.add(soya(yoy, true));

  /* Ravoq ichidagi ingichka jiyak */
  const jiyakSh = new THREE.Shape();
  jiyakSh.moveTo(-ICH, YOY_TAG);
  jiyakSh.quadraticCurveTo(-ICH + 0.02, APEKS_I - 0.26, 0, APEKS_I);
  jiyakSh.quadraticCurveTo(ICH - 0.02, APEKS_I - 0.26, ICH, YOY_TAG);
  jiyakSh.lineTo(ICH - 0.035, YOY_TAG);
  jiyakSh.quadraticCurveTo(ICH - 0.05, APEKS_I - 0.25, 0, APEKS_I - 0.035);
  jiyakSh.quadraticCurveTo(-ICH + 0.05, APEKS_I - 0.25, -ICH + 0.035, YOY_TAG);
  jiyakSh.closePath();
  const jiyakGeo = new THREE.ExtrudeGeometry(jiyakSh, {
    depth: 0.03, bevelEnabled: false, curveSegments: 18
  });
  jiyakGeo.translate(0, 0, 0.088);
  const jiyak = new THREE.Mesh(jiyakGeo, M.oltin());
  g.add(jiyak);

  /* Yelkalardagi girih donalari */
  const rombGeo = new THREE.OctahedronGeometry(0.055, 0);
  for (const yon of [-1, 1]) {
    const romb = new THREE.Mesh(rombGeo, M.oltin());
    romb.position.set(yon * 0.44, 1.045, 0.095);
    romb.scale.set(1, 1.25, 0.4);
    g.add(soya(romb));
  }

  /* Cho‘qqidagi osma bezak */
  const choqqi = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.13, 8), M.oltin());
  choqqi.position.set(0, APEKS_T + 0.06, 0);
  g.add(soya(choqqi));
  const soqqa = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), chuqurMat);
  soqqa.position.set(0, APEKS_T + 0.145, 0);
  g.add(soya(soqqa));

  return g;
}

/* =========================================================
   9) NIHOL — bola timsoli. 0..12 pog‘onaga qarab o‘sadi:
   kichik nihol → shoxlangan → bargli → gulli → mevali daraxt.
   Har chaqirilganda yangi Group qaytaradi.
   Barglar `userData.barg = true` bilan belgilanadi.
   ========================================================= */
export function niholYasa(pogona) {
  const p = Math.max(0, Math.min(12, Math.round(pogona || 0)));
  const t = p / 12;
  const g = new THREE.Group();

  const yoshPoya = new THREE.MeshStandardMaterial({ color: 0x6E9B45, roughness: 0.88 });
  const tanaMat = new THREE.MeshStandardMaterial({ color: 0x6B4A2C, roughness: 0.93 });
  const poyaMat = p <= 2 ? yoshPoya : tanaMat;
  const bargMat = new THREE.MeshStandardMaterial({
    color: 0x2F6B45, roughness: 0.82, side: THREE.DoubleSide
  });
  const bargOch = new THREE.MeshStandardMaterial({
    color: 0x549A4E, roughness: 0.82, side: THREE.DoubleSide
  });
  const gulMat = new THREE.MeshStandardMaterial({ color: 0xF7DDE6, roughness: 0.7 });
  const gulOrta = new THREE.MeshStandardMaterial({ color: 0xE3B54A, roughness: 0.6 });
  const mevaMat = new THREE.MeshStandardMaterial({ color: 0xC0392B, roughness: 0.45 });
  const bandMat = new THREE.MeshStandardMaterial({ color: 0x4E6B33, roughness: 0.9 });

  const H = 0.28 + 1.02 * t;          // tana balandligi
  const r = 0.020 + 0.052 * t;        // tana yo‘g‘onligi

  /* --- Tana: pastda kengaygan, tepaga qarab ingichkalashgan --- */
  const tanaProfil = [
    new THREE.Vector2(r * 2.30, 0.000),
    new THREE.Vector2(r * 1.55, H * 0.05),
    new THREE.Vector2(r * 1.14, H * 0.20),
    new THREE.Vector2(r * 1.00, H * 0.48),
    new THREE.Vector2(r * 0.82, H * 0.74),
    new THREE.Vector2(r * 0.54, H * 0.92),
    new THREE.Vector2(0.000, H),
  ];
  const tana = new THREE.Mesh(new THREE.LatheGeometry(tanaProfil, 12), poyaMat);
  g.add(soya(tana, true));

  /* Po‘stloq chiziqlari — kattaroq daraxtda ko‘rinadi */
  if (p >= 6) {
    const postGeo = new THREE.BoxGeometry(0.006, H * 0.55, 0.010);
    for (let i = 0; i < 5; i++) {
      const a = i * 1.257 + 0.4;
      const s = new THREE.Mesh(postGeo, tanaMat);
      s.position.set(Math.cos(a) * r * 0.98, H * 0.38, Math.sin(a) * r * 0.98);
      s.rotation.y = -a;
      s.scale.y = 0.7 + (i % 3) * 0.15;
      g.add(s);
    }
  }

  /* --- Barg yasovchi yordamchi --- */
  const bargGeo = new THREE.SphereGeometry(0.5, 8, 6);
  function bargQoy(joy, yonalish, olcham, mat) {
    const yon = yonalish.clone();
    if (yon.lengthSq() < 1e-6) yon.set(1, 0, 0);
    yon.normalize();
    const b = new THREE.Mesh(bargGeo, mat);
    b.scale.set(olcham * 0.40, olcham * 0.09, olcham * 0.80);
    b.position.copy(joy).addScaledVector(yon, olcham * 0.36);
    b.rotation.order = 'YXZ';
    b.rotation.y = Math.atan2(yon.x, yon.z);
    b.rotation.x = -0.26 - Math.random() * 0.28;
    b.castShadow = true;
    b.userData.barg = true;
    g.add(b);
    return b;
  }

  /* --- Shoxlar --- */
  const shoxSoni = p < 3 ? 0 : Math.min(7, p - 2);
  const uchlar = [];
  for (let i = 0; i < shoxSoni; i++) {
    const a = i * 2.3999 + 0.6;
    const yon = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
    const nis = 0.42 + 0.13 * (i % 4) + (i >= 4 ? 0.10 : 0);
    const h0 = H * Math.min(0.92, nis);
    const uz = (0.20 + 0.34 * t) * (0.85 + (i % 3) * 0.12);
    const p0 = new THREE.Vector3(0, h0, 0);
    const p1 = new THREE.Vector3(yon.x * uz * 0.45, h0 + uz * 0.30, yon.z * uz * 0.45);
    const p2 = new THREE.Vector3(yon.x * uz, h0 + uz * 0.62, yon.z * uz);
    const shox = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3([p0, p1, p2]), 10, r * 0.42, 6, false),
      poyaMat);
    g.add(soya(shox));
    uchlar.push({ uch: p2, yon: yon });

    /* Ikkilamchi novdalar — yirik daraxtda */
    if (p >= 8) {
      const kichik = new THREE.Vector3(
        yon.x * uz * 1.32 + 0.05, h0 + uz * 0.95, yon.z * uz * 1.32 - 0.04);
      const novda = new THREE.Mesh(
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3([p2, p2.clone().lerp(kichik, 0.5), kichik]),
          8, r * 0.24, 5, false),
        poyaMat);
      g.add(soya(novda));
      uchlar.push({ uch: kichik, yon: yon });
    }
  }

  /* --- Tepadagi barglar (nihol ham shu bilan boshlanadi) --- */
  const tepaBarg = p < 3 ? 2 + p : 3;
  for (let i = 0; i < tepaBarg; i++) {
    const a = (i / Math.max(2, tepaBarg)) * Math.PI * 2 + 0.4;
    bargQoy(
      new THREE.Vector3(0, H - 0.015, 0),
      new THREE.Vector3(Math.cos(a), 0, Math.sin(a)),
      0.17 + 0.11 * t,
      i % 2 ? bargMat : bargOch
    );
  }

  /* --- Shox barglari --- */
  if (p >= 5) {
    uchlar.forEach(function (s, i) {
      const soni = Math.min(5, p - 3);
      for (let j = 0; j < soni; j++) {
        const a = j * 1.71 + i * 0.8;
        const joy = s.uch.clone();
        joy.x += (Math.random() - 0.5) * 0.10;
        joy.z += (Math.random() - 0.5) * 0.10;
        joy.y += (Math.random() - 0.5) * 0.09;
        const yon = new THREE.Vector3(Math.cos(a) * 0.92, 0.22, Math.sin(a) * 0.92);
        bargQoy(joy, yon, 0.19 + 0.10 * t, j % 2 ? bargMat : bargOch);
      }
    });
  }

  /* --- Shox-shabba (yirik daraxtning to‘q soyasi) --- */
  if (p >= 9) {
    const shabbaGeo = new THREE.SphereGeometry(0.5, 10, 8);
    for (let i = 0; i < 5; i++) {
      const a = i * 1.257 + 0.3;
      const rr = 0.24 + 0.11 * (i % 2);
      const b = new THREE.Mesh(shabbaGeo, i % 2 ? bargMat : bargOch);
      b.position.set(Math.cos(a) * rr, H * 0.88 + 0.06 + (i % 3) * 0.05, Math.sin(a) * rr);
      b.scale.set(0.46, 0.33, 0.46);
      g.add(soya(b));
    }
  }

  /* --- Gullar --- */
  if (p >= 8) {
    const soni = Math.min(9, (p - 7) * 3);
    const barmoqGeo = new THREE.SphereGeometry(0.5, 7, 5);
    for (let i = 0; i < soni; i++) {
      const s = uchlar.length ? uchlar[i % uchlar.length] : null;
      const joy = s ? s.uch.clone() : new THREE.Vector3(0, H, 0);
      joy.x += (Math.random() - 0.5) * 0.24;
      joy.z += (Math.random() - 0.5) * 0.24;
      joy.y += 0.04 + Math.random() * 0.10;

      const gul = new THREE.Group();
      for (let j = 0; j < 5; j++) {
        const a = (j / 5) * Math.PI * 2;
        const bargcha = new THREE.Mesh(barmoqGeo, gulMat);
        bargcha.scale.set(0.055, 0.020, 0.055);
        bargcha.position.set(Math.cos(a) * 0.045, 0, Math.sin(a) * 0.045);
        gul.add(bargcha);
      }
      const orta = new THREE.Mesh(barmoqGeo, gulOrta);
      orta.scale.setScalar(0.034);
      gul.add(orta);
      gul.position.copy(joy);
      gul.rotation.set(Math.random() * 0.5 - 0.25, Math.random() * 3, Math.random() * 0.5 - 0.25);
      g.add(gul);
    }
  }

  /* --- Mevalar --- */
  if (p >= 10) {
    const soni = (p - 9) * 3;
    const mevaGeo = new THREE.SphereGeometry(0.058, 10, 8);
    const bandGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.055, 5);
    for (let i = 0; i < soni; i++) {
      const s = uchlar.length ? uchlar[i % uchlar.length] : null;
      const joy = s ? s.uch.clone() : new THREE.Vector3(0, H * 0.9, 0);
      joy.x += (Math.random() - 0.5) * 0.28;
      joy.z += (Math.random() - 0.5) * 0.28;

      const m = new THREE.Mesh(mevaGeo, mevaMat);
      m.position.copy(joy);
      m.position.y -= 0.075;
      m.scale.set(1, 0.94, 1);
      g.add(soya(m));

      const band = new THREE.Mesh(bandGeo, bandMat);
      band.position.copy(joy);
      band.position.y -= 0.022;
      band.rotation.z = 0.2;
      g.add(band);
    }
  }

  return g;                       // ildizi (0,0,0) da — tepalikka shundayligicha qo‘yiladi
}

/* =========================================================
   RO‘YXAT — sahnalar va o‘yin shu jadvaldan foydalanadi
   ========================================================= */
export const TARBIYA = {
  kitob: {
    nom: 'Kitob',
    yasa: () => kitobYasa(true),
    izoh: 'Aqliy tarbiya manbai: «Ilmsiz bir yashar, ilmli ming yashar».'
  },
  davot: {
    nom: 'Davot va qamish qalam',
    yasa: davotQalamYasa,
    izoh: 'Maktabdorlikda xat-savod shu davot va qamish qalam bilan o‘rgatilgan.'
  },
  rahle: {
    nom: 'Rahle (lavh)',
    yasa: rahleYasa,
    izoh: 'Kitob qo‘yiladigan o‘yma taglik — bilimga hurmat belgisi.'
  },
  non: {
    nom: 'Non',
    yasa: nonYasa,
    izoh: 'Axloqiy tarbiya: nonni e’zozlash bolalikdan o‘rgatilgan.'
  },
  dasturxon: {
    nom: 'Dasturxon',
    yasa: dasturxonYasa,
    izoh: 'Dasturxon atrofidagi odob — muomala madaniyatining o‘lchovi.'
  },
  choynak: {
    nom: 'Choynak',
    yasa: choynakYasa,
    izoh: 'Mehmonga choy uzatish — mehmondo‘stlik va hurmat namunasi.'
  },
  belbog: {
    nom: 'Kurash belbog‘i',
    yasa: kurashBelbogYasa,
    izoh: 'Milliy kurash jismoniy chiniqish va mardlik maktabi bo‘lgan.'
  },
  kamon: {
    nom: 'Kamon va o‘q',
    yasa: kamonYasa,
    izoh: 'Merganlik mashqi chaqqonlik, diqqat va bardoshni tarbiyalagan.'
  },
  arqon: {
    nom: 'Arqon',
    yasa: arqonYasa,
    izoh: 'Arqon tortish o‘yini kuch, jamoaviylik va irodani sinagan.'
  },
  ketmon: {
    nom: 'Ketmon',
    yasa: ketmonYasa,
    izoh: 'Mehnat quroli: «Mehnat bilan el ko‘karar».'
  },
  oroq: {
    nom: 'O‘roq',
    yasa: oroqYasa,
    izoh: 'Hosil yig‘im-terimi bolani mehnatsevarlikka o‘rgatgan.'
  },
  savat: {
    nom: 'Meva savati',
    yasa: savatYasa,
    izoh: 'Mehnatning mevasi — «Barvaqt qilingan harakat, hosilga berar barakat».'
  },
  urchuq: {
    nom: 'Urchuq',
    yasa: urchuqYasa,
    izoh: 'Ip yigirish — qizlarni sabr va hunarga o‘rgatgan uy mehnati.'
  },
  ravoq: {
    nom: 'Tarbiya supasi ravog‘i',
    yasa: () => ravoqYasa(0x8A5A34),
    izoh: 'O‘yma ustunli ravoq — tarbiya supasining me’moriy timsoli.'
  },
  nihol: {
    nom: 'Nihol',
    yasa: () => niholYasa(6),
    izoh: 'Bola timsoli: parvarish qilinsa, to‘g‘ri o‘sib mevali daraxt bo‘ladi.'
  },
};
