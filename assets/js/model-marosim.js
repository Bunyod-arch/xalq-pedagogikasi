/* =========================================================
   MAROSIM BUYUMLARI — 3D modellar (7-modul)
   «Xalq pedagogikasida milliy urf-odatlar, an’analar, udumlar,
   marosimlarning tarbiya vositasi sifatidagi o‘rni»

   Darslik matnida nomlangan marosimlar: beshik to‘yi, sunnat to‘yi,
   nikoh to‘yi, Navro‘z (sumalak sayli) va hosil bayrami. Har bir
   marosimga tegishli buyumning alohida, tanib olsa bo‘ladigan
   3D modeli shu faylda yasaladi. Matn yorlig‘i qo‘yilgan quti yo‘q —
   har bir buyum o‘z shakli bilan tanilishi kerak.

   SHARTNOMA (model-maishiy.js va model-hunar.js bilan bir xil):
     · har funksiya THREE.Group qaytaradi;
     · eng katta o‘lchami 1.0–1.5 birlik;
     · pastki nuqtasi y = 0 da turadi;
     · xz bo‘yicha markazi (0,0) da bo‘ladi;
     · fayl oxirida { nom, yasa, izoh } reyestri eksport qilinadi.

   Mavjud modellar qayta ishlatiladi: beshik, dasturxon, non, choynak,
   piyola, qozon, o‘roq (model-maishiy.js), do‘ppi, ro‘mol
   (model-oyin.js), so‘zana, sopol lagan (model-hunar.js).
   ========================================================= */
import * as THREE from '../vendor/three.module.min.js';

import {
  beshikYasa, dasturxonYasa, nonYasa, choynakYasa,
  piyolaYasa, qozonYasa, oroqYasa
} from './model-maishiy.js';
import { doppiYasa, romolYasa } from './model-oyin.js';
import { suzaniYasa, sopolLaganYasa } from './model-hunar.js';

/* ---------------------------------------------------------
   RANGLAR — marosim palitrasi
   --------------------------------------------------------- */
export const RANG = {
  matoOq:    0xFBF7F0,   // oq mato, dasturxon
  qizil:     0xC1502E,   // terrakota-qizil — to‘y matosi
  qizilTiq:  0x8C3A2B,   // to‘q qizil — soya, hoshiya
  kok:       0x1B3B6F,   // ko‘k — bekasam yo‘li, kashta
  kokOch:    0x3C6FA8,   // ochroq ko‘k
  yashil:    0x2F6B45,   // barg, ko‘kat, ko‘k somsa
  yashilOch: 0x5E9C55,   // yosh nihol
  oltin:     0xD4A24C,   // zar, jiyak, misgar buyum
  yogoch:    0x8A6A44,   // yong‘oq yog‘och
  yogochTiq: 0x5E4526,   // to‘q yog‘och
  yogochOch: 0xB08E64,   // ochiq yog‘och, qamish
  sopol:     0xEDE6D6,   // sopol idish
  sopolTiq:  0xC9B79A,   // sopol soyasi
  mis:       0xB87333,   // mis patnis
  kumush:    0xC9CDD4,   // kumush, ko‘zgu
  non:       0xD9A860,   // pishgan non
  sumalak:   0x5A3418,   // sumalak — to‘q jigarrang
  bugdoy:    0xD8C07A,   // quruq bug‘doy poyasi
  tuproq:    0x6B4B2E,   // tuproq
  siyoh:     0x241A12    // qora
};

/* ---------------------------------------------------------
   MATERIALLAR — har chaqiruvda yangi nusxa
   --------------------------------------------------------- */
function mato(rang, ikkiTomon) {
  return new THREE.MeshStandardMaterial({
    color: rang, roughness: 0.95, metalness: 0.0,
    side: ikkiTomon ? THREE.DoubleSide : THREE.FrontSide
  });
}
function yogoch(rang) {
  return new THREE.MeshStandardMaterial({ color: rang || RANG.yogoch, roughness: 0.72, metalness: 0.04 });
}
function sopol(rang, ikkiTomon) {
  return new THREE.MeshStandardMaterial({
    color: rang || RANG.sopol, roughness: 0.62, metalness: 0.03,
    side: ikkiTomon ? THREE.DoubleSide : THREE.FrontSide
  });
}
function metall(rang, gadir) {
  return new THREE.MeshStandardMaterial({
    color: rang || RANG.mis, roughness: gadir == null ? 0.34 : gadir, metalness: 0.82
  });
}
function ko(rang, gadir) {   // umumiy — meva, ko‘kat, shirinlik
  return new THREE.MeshStandardMaterial({
    color: rang, roughness: gadir == null ? 0.55 : gadir, metalness: 0.02
  });
}
function tutun() {
  return new THREE.MeshStandardMaterial({
    color: 0xE8E2D6, roughness: 1, metalness: 0,
    transparent: true, opacity: 0.42, depthWrite: false
  });
}

/* ---------------------------------------------------------
   GEOMETRIK YORDAMCHILAR
   --------------------------------------------------------- */
// Charxda aylangan idish: [radius, balandlik] juftliklaridan.
function charx(nuqtalar, segment, material) {
  var v = nuqtalar.map(function (n) { return new THREE.Vector2(n[0], n[1]); });
  var geo = new THREE.LatheGeometry(v, segment || 26);
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, material);
}
// Y o‘qi atrofidagi yotiq halqa.
function halqa(radius, quvur, y, material, segment) {
  var m = new THREE.Mesh(new THREE.TorusGeometry(radius, quvur, 8, segment || 26), material);
  m.rotation.x = Math.PI / 2;
  m.position.y = y;
  return m;
}
// To‘g‘ri burchakli plita.
function plita(en, qalin, boy, material, x, y, z) {
  var m = new THREE.Mesh(new THREE.BoxGeometry(en, qalin, boy), material);
  m.position.set(x || 0, y || 0, z || 0);
  return m;
}
// Yassi disk.
function disk(radius, qalin, material, x, y, z, qirra) {
  var m = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, qalin, qirra || 22), material);
  m.position.set(x || 0, y || 0, z || 0);
  return m;
}
// Kichik donacha.
function donacha(radius, material, x, y, z) {
  var m = new THREE.Mesh(new THREE.SphereGeometry(radius, 10, 7), material);
  m.position.set(x || 0, y || 0, z || 0);
  return m;
}
// Tayoq — poya, band, quvur.
function tayoq(radius, uzun, material, qirra) {
  return new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, uzun, qirra || 10), material);
}
// Aylana bo‘ylab teng oraliqda takrorlash.
function aylanaBoylab(guruh, soni, radius, y, yasagich) {
  for (var i = 0; i < soni; i++) {
    var burchak = (i / soni) * Math.PI * 2;
    var m = yasagich(i, burchak);
    if (!m) continue;
    m.position.set(Math.cos(burchak) * radius, y, Math.sin(burchak) * radius);
    guruh.add(m);
  }
}
// Takrorlanuvchi tasodif — model har safar bir xil chiqsin.
function tasodif(urugʻ) {
  var s = urugʻ || 1;
  return function () {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}
function soyaBer(guruh, yassi) {
  guruh.traverse(function (n) {
    if (n.isMesh) {
      n.castShadow = true;
      if (yassi) n.receiveShadow = true;
    }
  });
}
/* Modelni yakunlash: soya, miqyos, markazlash va y = 0 ga qo‘yish. */
function tayyorla(ich, kerakOlcham, yassi, nom) {
  soyaBer(ich, yassi);
  var tashqi = new THREE.Group();
  tashqi.name = nom || 'marosim';
  tashqi.add(ich);

  ich.updateMatrixWorld(true);
  var quti = new THREE.Box3().setFromObject(ich);
  var olcham = new THREE.Vector3();
  quti.getSize(olcham);
  var eng = Math.max(olcham.x, olcham.y, olcham.z) || 1;
  ich.scale.setScalar(kerakOlcham / eng);

  ich.updateMatrixWorld(true);
  quti.setFromObject(ich);
  var markaz = new THREE.Vector3();
  quti.getCenter(markaz);
  ich.position.set(-markaz.x, -quti.min.y, -markaz.z);
  return tashqi;
}

/* =========================================================
   ————————————— BESHIK TO‘YI —————————————
   ========================================================= */

/* 1. QIYIQ — belbog‘. Beshik to‘yida chaqaloqqa keltirilgan
   sovg‘alar qiyiqqa tugiladi. Buklab o‘ralgan kashtali mato,
   o‘rtasida tugun va ikki uchida popuk. */
export function qiyiqYasa() {
  var g = new THREE.Group();
  var asos = mato(RANG.qizil), hosh = mato(RANG.oltin), kashta = mato(RANG.kok);

  // O‘ralgan mato — yotiq halqa, biroz yassilangan.
  var oram = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.105, 12, 40), asos);
  oram.rotation.x = Math.PI / 2;
  oram.scale.y = 0.62;
  oram.position.y = 0.12;
  g.add(oram);

  // O‘ram ustidagi oltin jiyak chiziqlari.
  [0.075, -0.075].forEach(function (d) {
    var j = new THREE.Mesh(new THREE.TorusGeometry(0.445, 0.016, 8, 44), hosh);
    j.rotation.x = Math.PI / 2;
    j.position.y = 0.12 + d * 0.55;
    g.add(j);
  });

  // Kashta donachalari — o‘ram bo‘ylab.
  aylanaBoylab(g, 16, 0.455, 0.155, function () {
    var d = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 6), kashta);
    d.scale.set(1, 0.5, 1);
    return d;
  });

  // Tugun — old tomonda.
  var tugun = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 10), asos);
  tugun.scale.set(1.15, 0.85, 0.9);
  tugun.position.set(0, 0.17, 0.42);
  g.add(tugun);
  var tugunHalqa = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.028, 8, 20), hosh);
  tugunHalqa.position.set(0, 0.17, 0.42);
  g.add(tugunHalqa);

  // Ikki osilgan uch va popuklar.
  [-1, 1].forEach(function (yon) {
    var uch = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.30, 0.035), asos);
    uch.position.set(yon * 0.085, 0.03, 0.50);
    uch.rotation.x = 0.22;
    uch.rotation.z = yon * 0.16;
    g.add(uch);
    var popuk = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.12, 8), hosh);
    popuk.position.set(yon * 0.11, -0.10, 0.545);
    popuk.rotation.x = Math.PI;
    g.add(popuk);
  });

  return tayyorla(g, 1.20, false, 'qiyiq');
}

/* 2. KO‘RPACHA — beshikka solinadigan taxlangan ko‘rpacha.
   Uch qavat buklangan mato, ustida bekasam yo‘l-yo‘l naqshi
   va chetlarida qo‘l chok izlari. */
export function korpachaYasa() {
  var g = new THREE.Group();
  var ranglar = [RANG.kok, RANG.qizil, RANG.oltin];

  var y = 0;
  for (var q = 0; q < 3; q++) {
    var h = 0.115;
    var en = 0.92 - q * 0.04, boy = 0.66 - q * 0.03;
    var qavat = plita(en, h, boy, mato(ranglar[q]), (q % 2 ? 0.018 : -0.018), y + h / 2, (q === 1 ? 0.015 : -0.01));
    qavat.rotation.y = (q - 1) * 0.035;
    g.add(qavat);

    // Yo‘l-yo‘l bekasam chiziqlari — faqat ustki yuzada ko‘rinadi.
    for (var s = 0; s < 5; s++) {
      var chiz = plita(en * 0.94, 0.006, 0.038, mato(s % 2 ? RANG.matoOq : RANG.oltin),
        qavat.position.x, y + h + 0.003, qavat.position.z - boy * 0.34 + s * (boy * 0.17));
      chiz.rotation.y = qavat.rotation.y;
      g.add(chiz);
    }
    y += h;
  }

  // Chetdagi chok — oq ip izlari.
  for (var i = 0; i < 9; i++) {
    var ip = plita(0.028, 0.008, 0.012, mato(RANG.matoOq),
      -0.40 + i * 0.10, 0.348, 0.325);
    g.add(ip);
  }
  return tayyorla(g, 1.10, true, 'korpacha');
}

/* 3. ISIRIQ TUTATGICH — beshik to‘yi va boshqa marosimlarda
   uy tutatiladi. Sopol kosachada cho‘g‘, ustida isiriq o‘ti va
   yuqoriga ko‘tarilayotgan tutun. */
export function isiriqYasa() {
  var g = new THREE.Group();

  // Sopol kosacha — charxda aylangan.
  var kosa = charx([
    [0.00, 0.00], [0.20, 0.00], [0.22, 0.03], [0.26, 0.14],
    [0.30, 0.26], [0.30, 0.30], [0.275, 0.295], [0.235, 0.15],
    [0.19, 0.035], [0.00, 0.03]
  ], 28, sopol(RANG.sopol, true));
  g.add(kosa);
  g.add(halqa(0.285, 0.018, 0.235, sopol(RANG.kok)));

  // Cho‘g‘ — qizarib turgan ko‘mir.
  var chog = new THREE.Mesh(new THREE.SphereGeometry(0.235, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x3A241A, roughness: 0.95, emissive: 0x772A10, emissiveIntensity: 0.55 }));
  chog.scale.y = 0.34;
  chog.position.y = 0.245;
  g.add(chog);

  var t = tasodif(7);
  for (var i = 0; i < 9; i++) {
    var k = donacha(0.028 + t() * 0.02,
      new THREE.MeshStandardMaterial({ color: 0x2B1A12, roughness: 0.9, emissive: 0x8C3410, emissiveIntensity: 0.4 }),
      (t() - 0.5) * 0.34, 0.28, (t() - 0.5) * 0.34);
    g.add(k);
  }

  // Isiriq o‘tining quruq shoxchalari.
  for (var s = 0; s < 12; s++) {
    var a = (s / 12) * Math.PI * 2;
    var shox = tayoq(0.009, 0.20 + t() * 0.10, ko(0x6E7A4A, 0.9), 5);
    shox.position.set(Math.cos(a) * 0.10, 0.36, Math.sin(a) * 0.10);
    shox.rotation.z = Math.cos(a) * 0.55;
    shox.rotation.x = -Math.sin(a) * 0.55;
    g.add(shox);
    var urug = donacha(0.022, ko(0x8B9455, 0.85),
      Math.cos(a) * 0.20, 0.46 + t() * 0.06, Math.sin(a) * 0.20);
    g.add(urug);
  }

  // Ko‘tarilayotgan tutun — yuqoriga ingichkalashuvchi bulutchalar.
  var tm = tutun();
  for (var b = 0; b < 6; b++) {
    var p = b / 5;
    var bulut = new THREE.Mesh(new THREE.SphereGeometry(0.12 - p * 0.045, 10, 8), tm);
    bulut.scale.set(1 + p * 0.5, 0.72, 1 + p * 0.5);
    bulut.position.set(Math.sin(b * 1.35) * 0.10, 0.56 + b * 0.155, Math.cos(b * 1.1) * 0.08);
    bulut.castShadow = false;
    g.add(bulut);
  }
  return tayyorla(g, 1.40, true, 'isiriq');
}

/* 4. SHIRINLIK LAGANI — to‘y dasturxonining ajralmas qismi:
   parvarda, navvot va holva bir laganda. */
export function shirinlikYasa() {
  var g = new THREE.Group();

  // Sirlangan lagan.
  var lagan = charx([
    [0.00, 0.00], [0.30, 0.005], [0.46, 0.045], [0.52, 0.115],
    [0.545, 0.155], [0.525, 0.155], [0.495, 0.115], [0.435, 0.062],
    [0.28, 0.028], [0.00, 0.022]
  ], 30, sopol(RANG.matoOq, true));
  g.add(lagan);
  g.add(halqa(0.525, 0.012, 0.150, sopol(RANG.kok)));
  aylanaBoylab(g, 14, 0.44, 0.052, function () {
    var d = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 6), sopol(RANG.kok));
    d.scale.set(1, 0.3, 0.6);
    return d;
  });

  var t = tasodif(21);

  // Parvarda — oq yumaloq shirinliklar.
  for (var i = 0; i < 11; i++) {
    var a = (i / 11) * Math.PI * 2;
    var r = 0.16 + t() * 0.16;
    var p = donacha(0.055, ko(0xFFF6E8, 0.42), Math.cos(a) * r, 0.075, Math.sin(a) * r);
    p.scale.y = 0.8;
    g.add(p);
  }
  // Navvot — shaffofroq sariq kristallar.
  var navvotMat = new THREE.MeshStandardMaterial({ color: 0xE7B85C, roughness: 0.22, metalness: 0.05 });
  for (var k = 0; k < 7; k++) {
    var n = new THREE.Mesh(new THREE.DodecahedronGeometry(0.058, 0), navvotMat);
    n.position.set((t() - 0.5) * 0.42, 0.085, (t() - 0.5) * 0.42);
    n.rotation.set(t() * 3, t() * 3, t() * 3);
    g.add(n);
  }
  // Holva — o‘rtadagi qumoq.
  var holva = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), ko(0xC08A4E, 0.85));
  holva.scale.y = 0.62;
  holva.position.y = 0.05;
  g.add(holva);
  for (var h = 0; h < 6; h++) {
    g.add(donacha(0.026, ko(0x7A4B22, 0.8), (t() - 0.5) * 0.2, 0.135, (t() - 0.5) * 0.2));
  }
  return tayyorla(g, 1.30, true, 'shirinlik');
}

/* =========================================================
   ————————————— SUNNAT TO‘YI —————————————
   ========================================================= */

/* 5. TO‘N (CHOPON) — sunnat to‘yida bolaga kiydiriladigan
   bekasam to‘n: yo‘l-yo‘l tana, ikki yeng, ochiq old, yoqa
   jiyagi va belbog‘. */
export function tonYasa() {
  var g = new THREE.Group();
  var asosRang = RANG.kok, yolRang = RANG.oltin;

  // Tana — pastga kengayuvchi.
  var tana = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.42, 0.86, 18, 1, true), mato(asosRang, true));
  tana.scale.z = 0.58;
  tana.position.y = 0.50;
  g.add(tana);

  // Yelka.
  var yelka = new THREE.Mesh(new THREE.SphereGeometry(0.30, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), mato(asosRang));
  yelka.scale.set(1, 0.42, 0.58);
  yelka.position.y = 0.93;
  g.add(yelka);

  // Bekasam yo‘llari — tik chiziqlar.
  for (var i = 0; i < 12; i++) {
    var a = (i / 12) * Math.PI * 2;
    var yol = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.86, 0.012), mato(i % 2 ? yolRang : RANG.qizil));
    yol.position.set(Math.cos(a) * 0.355, 0.50, Math.sin(a) * 0.205);
    yol.rotation.y = -a;
    g.add(yol);
  }

  // Yenglar.
  [-1, 1].forEach(function (yon) {
    var yeng = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.135, 0.62, 12), mato(asosRang));
    yeng.position.set(yon * 0.38, 0.66, 0);
    yeng.rotation.z = yon * 0.42;
    g.add(yeng);
    var manjet = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.07, 12), mato(yolRang));
    manjet.position.set(yon * 0.505, 0.40, 0);
    manjet.rotation.z = yon * 0.42;
    g.add(manjet);
  });

  // Ochiq old — ikki yoqa jiyagi.
  [-1, 1].forEach(function (yon) {
    var yoqa = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.90, 0.02), mato(RANG.qizil));
    yoqa.position.set(yon * 0.085, 0.51, 0.225);
    yoqa.rotation.z = yon * 0.045;
    g.add(yoqa);
  });
  // Bo‘yin jiyagi.
  var bojiyak = new THREE.Mesh(new THREE.TorusGeometry(0.185, 0.028, 8, 22, Math.PI * 1.5), mato(RANG.qizil));
  bojiyak.rotation.x = -Math.PI / 2;
  bojiyak.rotation.z = Math.PI * 0.25;
  bojiyak.position.y = 0.99;
  bojiyak.scale.z = 0.62;
  g.add(bojiyak);

  // Belbog‘.
  var bel = new THREE.Mesh(new THREE.CylinderGeometry(0.375, 0.375, 0.11, 18), mato(RANG.qizilTiq));
  bel.scale.z = 0.60;
  bel.position.y = 0.34;
  g.add(bel);
  g.add(halqa(0.378, 0.012, 0.395, mato(yolRang)));
  g.add(halqa(0.378, 0.012, 0.285, mato(yolRang)));

  return tayyorla(g, 1.35, false, 'ton');
}

/* 6. KARNAY — to‘y boshlanishini elga bildiruvchi uzun mis karnay:
   tor og‘iz, uch bo‘g‘in va keng qo‘ng‘iroq. */
export function karnayYasa() {
  var g = new THREE.Group();
  var quvurG = new THREE.Group();
  var mis = metall(RANG.mis, 0.3), misT = metall(0x8C5522, 0.45);

  var uzunlik = 1.55;
  // Asosiy quvur — og‘izdan qo‘ng‘iroqqa qarab sekin kengayadi.
  var quvur = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.026, uzunlik, 16), mis);
  quvur.position.y = uzunlik / 2;
  quvurG.add(quvur);

  // Bo‘g‘in halqalari — karnay bo‘laklarga bo‘linadi.
  [0.30, 0.62, 0.95, 1.24].forEach(function (y, i) {
    var b = new THREE.Mesh(new THREE.CylinderGeometry(0.062 + i * 0.004, 0.062 + i * 0.004, 0.055, 16), misT);
    b.position.y = y;
    quvurG.add(b);
  });

  // Qo‘ng‘iroq — kengayuvchi og‘iz.
  var qongiroq = charx([
    [0.048, 0.00], [0.062, 0.10], [0.095, 0.20], [0.155, 0.28],
    [0.235, 0.34], [0.245, 0.355], [0.225, 0.355], [0.145, 0.30],
    [0.085, 0.22], [0.052, 0.11], [0.040, 0.00]
  ], 24, metall(RANG.mis, 0.28));
  qongiroq.position.y = uzunlik;
  quvurG.add(qongiroq);
  var lab = new THREE.Mesh(new THREE.TorusGeometry(0.238, 0.016, 8, 26), metall(RANG.oltin, 0.3));
  lab.rotation.x = Math.PI / 2;
  lab.position.y = uzunlik + 0.355;
  quvurG.add(lab);

  // Puflash og‘izchasi.
  var ogiz = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.028, 0.07, 14), metall(RANG.oltin, 0.3));
  ogiz.position.y = 0.02;
  quvurG.add(ogiz);

  // Karnay puflanayotgandek yuqoriga qiya turadi.
  quvurG.rotation.z = -0.62;
  g.add(quvurG);

  // Qo‘yiladigan yog‘och tayanch.
  var tayanch = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.085, 0.12, 12), yogoch(RANG.yogochTiq));
  tayanch.position.set(0.02, 0.06, 0);
  g.add(tayanch);

  return tayyorla(g, 1.45, false, 'karnay');
}

/* 7. SURNAY — karnay bilan juft chalinadigan yog‘och nayi:
   teshikli tana, kengayuvchi qo‘ng‘iroq va metall til. */
export function surnayYasa() {
  var g = new THREE.Group();
  var yog = yogoch(0x6E4A28);

  // Tana — pastga kengayuvchi konus.
  var tana = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.105, 0.98, 18), yog);
  tana.position.y = 0.62;
  g.add(tana);

  // Qo‘ng‘iroq.
  var qong = charx([
    [0.105, 0.00], [0.135, 0.05], [0.185, 0.11], [0.225, 0.155],
    [0.235, 0.17], [0.215, 0.17], [0.175, 0.125], [0.128, 0.06], [0.098, 0.00]
  ], 22, yogoch(0x5E3E20));
  qong.position.y = 0.13;
  g.add(qong);

  // Barmoq teshiklari — old tomonda 7 ta, orqada 1 ta.
  for (var i = 0; i < 7; i++) {
    var t = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.03, 10), ko(RANG.siyoh, 0.9));
    t.rotation.x = Math.PI / 2;
    t.position.set(0, 0.42 + i * 0.095, 0.082 - i * 0.004);
    g.add(t);
  }
  var orqa = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.03, 10), ko(RANG.siyoh, 0.9));
  orqa.rotation.x = Math.PI / 2;
  orqa.position.set(0, 0.50, -0.085);
  g.add(orqa);

  // Halqalar.
  [0.30, 1.03].forEach(function (y) {
    g.add(halqa(0.072, 0.014, y, metall(RANG.oltin, 0.3)));
  });

  // Metall til (qamish tutqichi).
  var bogiz = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.036, 0.12, 12), metall(RANG.kumush, 0.28));
  bogiz.position.y = 1.16;
  g.add(bogiz);
  var til = new THREE.Mesh(new THREE.ConeGeometry(0.020, 0.09, 10), ko(RANG.yogochOch, 0.7));
  til.position.y = 1.26;
  g.add(til);
  var disklet = disk(0.075, 0.012, metall(RANG.kumush, 0.3), 0, 1.10, 0, 18);
  g.add(disklet);

  return tayyorla(g, 1.40, false, 'surnay');
}

/* =========================================================
   ————————————— NIKOH TO‘YI —————————————
   ========================================================= */

/* 8. KELIN SANDIG‘I — nikoh to‘yida kelin sepi solinadigan
   naqshli yog‘och sandiq: gumbazsimon qopqoq, mis burchak
   qoplamalari, qulf va bo‘yalgan panellar. */
export function sandiqYasa() {
  var g = new THREE.Group();
  var yog = yogoch(0x7A5230), yogT = yogoch(0x4E3319);
  var mis = metall(RANG.mis, 0.35), oltin = metall(RANG.oltin, 0.3);

  var en = 0.98, boy = 0.60, bal = 0.46;

  // Tana.
  g.add(plita(en, bal, boy, yog, 0, bal / 2 + 0.06, 0));

  // Oyoqlar.
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (b) {
    g.add(plita(0.11, 0.12, 0.11, yogT, b[0] * (en / 2 - 0.08), 0.06, b[1] * (boy / 2 - 0.08)));
  });

  // Bo‘yalgan panellar — old va orqa yuzada uchtadan.
  [-1, 1].forEach(function (yon) {
    for (var i = -1; i <= 1; i++) {
      var p = plita(0.24, 0.22, 0.012, mato(RANG.qizil), i * 0.30, 0.30, yon * (boy / 2 + 0.004));
      g.add(p);
      var ich = plita(0.13, 0.115, 0.012, mato(RANG.oltin), i * 0.30, 0.30, yon * (boy / 2 + 0.010));
      g.add(ich);
      var nuq = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), mato(RANG.kok));
      nuq.scale.set(1, 1, 0.35);
      nuq.position.set(i * 0.30, 0.30, yon * (boy / 2 + 0.014));
      g.add(nuq);
    }
  });

  // Mis burchak qoplamalari.
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (b) {
    g.add(plita(0.05, bal + 0.02, 0.05, mis, b[0] * (en / 2 - 0.02), bal / 2 + 0.06, b[1] * (boy / 2 - 0.02)));
  });
  // Yon halqali dastalar.
  [-1, 1].forEach(function (yon) {
    var d = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.014, 8, 18), mis);
    d.rotation.y = Math.PI / 2;
    d.position.set(yon * (en / 2 + 0.005), 0.30, 0);
    g.add(d);
  });

  // Gumbazsimon qopqoq.
  var qopqoq = new THREE.Mesh(
    new THREE.CylinderGeometry(boy / 2, boy / 2, en, 18, 1, false, 0, Math.PI),
    yog
  );
  qopqoq.rotation.z = Math.PI / 2;
  qopqoq.scale.y = 0.60;
  qopqoq.position.y = bal + 0.06;
  g.add(qopqoq);

  // Qopqoqdagi mis tasmalar.
  [-0.30, 0, 0.30].forEach(function (x) {
    var tasma = new THREE.Mesh(new THREE.TorusGeometry(boy / 2 + 0.005, 0.014, 8, 18, Math.PI), mis);
    tasma.rotation.y = Math.PI / 2;
    tasma.scale.y = 0.60;
    tasma.position.set(x, bal + 0.06, 0);
    g.add(tasma);
  });

  // Qulf — old tomonda.
  g.add(plita(0.15, 0.16, 0.02, oltin, 0, bal + 0.02, boy / 2 + 0.008));
  var qulfHalqa = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.013, 8, 16), oltin);
  qulfHalqa.position.set(0, bal - 0.03, boy / 2 + 0.030);
  g.add(qulfHalqa);
  g.add(donacha(0.024, oltin, 0, bal + 0.07, boy / 2 + 0.026));

  return tayyorla(g, 1.35, true, 'sandiq');
}

/* 9. KELIN KO‘ZGUSI — «yuz ochdi» udumida ishlatiladigan
   o‘ymakor ramkali oyna, tik tayanchda turadi. */
export function oynaYasa() {
  var g = new THREE.Group();
  var yog = yogoch(0x6E4A28), oltin = metall(RANG.oltin, 0.28);
  var shisha = new THREE.MeshStandardMaterial({ color: 0xE4EEF4, roughness: 0.06, metalness: 0.95 });

  // Ramka — ovalsimon halqa.
  var ramka = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.055, 12, 40), yog);
  ramka.scale.set(0.82, 1.12, 0.45);
  ramka.position.y = 0.78;
  g.add(ramka);
  var jiyak = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.018, 8, 40), oltin);
  jiyak.scale.set(0.82, 1.12, 0.45);
  jiyak.position.set(0, 0.78, 0.024);
  g.add(jiyak);

  // Oyna yuzasi.
  var yuza = new THREE.Mesh(new THREE.CircleGeometry(0.335, 36), shisha);
  yuza.scale.set(0.82, 1.12, 1);
  yuza.position.set(0, 0.78, 0.012);
  g.add(yuza);

  // Ramka tepasidagi o‘ymakor toj.
  var toj = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), yog);
  toj.scale.set(1.5, 0.85, 0.5);
  toj.position.y = 1.19;
  g.add(toj);
  aylanaBoylab(g, 5, 0.15, 1.235, function (i) {
    var b = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.075, 6), oltin);
    b.scale.z = 0.5;
    return b;
  });

  // Tayanch — ustun va poydevor.
  var ustun = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.062, 0.36, 12), yog);
  ustun.position.y = 0.20;
  g.add(ustun);
  g.add(halqa(0.075, 0.016, 0.36, oltin));
  var poya = charx([
    [0.00, 0.00], [0.28, 0.00], [0.30, 0.03], [0.26, 0.075],
    [0.13, 0.095], [0.00, 0.095]
  ], 22, yog);
  g.add(poya);
  aylanaBoylab(g, 8, 0.235, 0.055, function () {
    var d = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 6), oltin);
    return d;
  });

  return tayyorla(g, 1.40, true, 'oyna');
}

/* 10. SARPO — nikoh to‘yida quda tomonga uzatiladigan sovg‘a
   kiyimlar: mis patnisda taxlangan uch qavat mato, ustidan
   qizil tasma bilan chorxoch bog‘langan. */
export function sarpoYasa() {
  var g = new THREE.Group();
  var mis = metall(RANG.mis, 0.34);

  // Mis patnis.
  var patnis = charx([
    [0.00, 0.00], [0.42, 0.00], [0.56, 0.02], [0.60, 0.075],
    [0.615, 0.10], [0.595, 0.10], [0.565, 0.06], [0.50, 0.032],
    [0.36, 0.022], [0.00, 0.018]
  ], 30, mis);
  g.add(patnis);
  g.add(halqa(0.595, 0.012, 0.095, metall(RANG.oltin, 0.28)));
  aylanaBoylab(g, 18, 0.50, 0.03, function () {
    var d = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 6), metall(0x8C5522, 0.4));
    d.scale.set(1, 0.35, 0.6);
    return d;
  });

  // Uch qavat taxlangan mato.
  var qatlam = [
    { rang: RANG.kok, en: 0.72, boy: 0.44, h: 0.09 },
    { rang: RANG.qizil, en: 0.66, boy: 0.40, h: 0.085 },
    { rang: RANG.oltin, en: 0.60, boy: 0.36, h: 0.08 }
  ];
  var y = 0.03;
  qatlam.forEach(function (q, i) {
    var m = plita(q.en, q.h, q.boy, mato(q.rang), 0, y + q.h / 2, 0);
    m.rotation.y = (i - 1) * 0.05;
    g.add(m);
    // Buklangan chetlar.
    var chet = plita(q.en * 0.98, 0.014, 0.03, mato(RANG.matoOq), 0, y + q.h - 0.006, q.boy / 2 - 0.02);
    chet.rotation.y = m.rotation.y;
    g.add(chet);
    y += q.h;
  });

  // Chorxoch bog‘langan tasma.
  var tasmaMat = mato(RANG.qizilTiq);
  var t1 = plita(0.68, 0.018, 0.055, tasmaMat, 0, y + 0.005, 0);
  g.add(t1);
  var t2 = plita(0.055, 0.018, 0.42, tasmaMat, 0, y + 0.012, 0);
  g.add(t2);
  // Tugun va ikki uch.
  var tugun = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 9), tasmaMat);
  tugun.scale.y = 0.7;
  tugun.position.y = y + 0.045;
  g.add(tugun);
  [-1, 1].forEach(function (yon) {
    var uch = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 8), tasmaMat);
    uch.position.set(yon * 0.09, y + 0.075, yon * 0.05);
    uch.rotation.z = yon * 0.7;
    g.add(uch);
  });

  return tayyorla(g, 1.30, true, 'sarpo');
}

/* =========================================================
   ————————————— NAVRO‘Z —————————————
   ========================================================= */

/* 11. SUMALAK — Navro‘zda jamoa bo‘lib pishiriladigan taom.
   Kosada to‘q sumalak, ustida an’anaviy toshchalar va
   yong‘oqlar, yonida yog‘och kapgir. */
export function sumalakYasa() {
  var g = new THREE.Group();

  // Sopol kosa.
  var kosa = charx([
    [0.00, 0.00], [0.16, 0.00], [0.19, 0.035], [0.30, 0.13],
    [0.40, 0.26], [0.425, 0.34], [0.405, 0.34], [0.375, 0.26],
    [0.275, 0.135], [0.165, 0.045], [0.00, 0.038]
  ], 30, sopol(RANG.matoOq, true));
  g.add(kosa);
  g.add(halqa(0.415, 0.014, 0.315, sopol(RANG.kok)));
  aylanaBoylab(g, 12, 0.36, 0.22, function () {
    var d = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), sopol(RANG.kok));
    d.scale.set(1, 0.8, 0.35);
    return d;
  });

  // Sumalak yuzasi — quyuq, biroz to‘lqinli.
  var yuza = new THREE.Mesh(new THREE.CircleGeometry(0.375, 32), ko(RANG.sumalak, 0.45));
  yuza.rotation.x = -Math.PI / 2;
  yuza.position.y = 0.295;
  g.add(yuza);
  var t = tasodif(33);
  for (var i = 0; i < 14; i++) {
    var a = t() * Math.PI * 2, r = t() * 0.33;
    var q = donacha(0.035 + t() * 0.03, ko(0x6B4322, 0.5), Math.cos(a) * r, 0.30, Math.sin(a) * r);
    q.scale.y = 0.3;
    g.add(q);
  }

  // An’anaviy toshchalar va yong‘oqlar — sumalak tubiga solinadi.
  for (var k = 0; k < 5; k++) {
    var a2 = (k / 5) * Math.PI * 2 + 0.4;
    var tosh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.055, 0), ko(0x8E8477, 0.75));
    tosh.position.set(Math.cos(a2) * 0.20, 0.325, Math.sin(a2) * 0.20);
    tosh.rotation.set(t() * 3, t() * 3, t() * 3);
    g.add(tosh);
  }
  var yongoq = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 9), ko(0xA9793F, 0.8));
  yongoq.scale.set(1, 0.85, 0.9);
  yongoq.position.set(0.06, 0.33, -0.05);
  g.add(yongoq);

  // Yog‘och kapgir — kosaga suyalgan.
  var dasta = tayoq(0.026, 0.72, yogoch(RANG.yogochOch), 10);
  dasta.position.set(0.30, 0.50, -0.20);
  dasta.rotation.z = -0.55;
  dasta.rotation.x = 0.30;
  g.add(dasta);
  var kosacha = new THREE.Mesh(new THREE.SphereGeometry(0.10, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), yogoch(RANG.yogochOch));
  kosacha.scale.y = 0.5;
  kosacha.rotation.x = Math.PI + 0.3;
  kosacha.position.set(0.13, 0.24, -0.31);
  g.add(kosacha);

  return tayyorla(g, 1.30, true, 'sumalak');
}

/* 12. KO‘K SOMSA — Navro‘z dasturxonining bahorgi taomi.
   Laganda beshta uchburchak somsa, ustida ko‘katning ko‘kimtir
   rangi va kunjut sepilgan qorayib pishgan qirralari. */
export function kokSomsaYasa() {
  var g = new THREE.Group();

  var lagan = charx([
    [0.00, 0.00], [0.34, 0.005], [0.50, 0.04], [0.555, 0.10],
    [0.575, 0.135], [0.555, 0.135], [0.525, 0.10], [0.47, 0.058],
    [0.31, 0.028], [0.00, 0.022]
  ], 30, sopol(RANG.matoOq, true));
  g.add(lagan);
  g.add(halqa(0.555, 0.012, 0.128, sopol(RANG.yashil)));

  var t = tasodif(11);
  var xamir = ko(0xD8B678, 0.75);
  var pishgan = ko(0xB07F3E, 0.7);
  var kokat = ko(0x4C7E3A, 0.6);

  for (var i = 0; i < 5; i++) {
    var a = (i / 5) * Math.PI * 2 + 0.3;
    var somsa = new THREE.Group();

    // Uchburchak tana — uch qirrali past prizma.
    var tana = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.215, 0.115, 3), xamir);
    tana.position.y = 0.06;
    somsa.add(tana);

    // Ustki qatlam — pishgan qobiq.
    var qobiq = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.20, 0.03, 3), pishgan);
    qobiq.position.y = 0.128;
    somsa.add(qobiq);

    // Ichidan ko‘rinib turgan ko‘kat — qirradagi tirqish.
    var tirqish = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.035), kokat);
    tirqish.position.set(0, 0.135, 0.02);
    somsa.add(tirqish);

    // Kunjut donalari.
    for (var k = 0; k < 7; k++) {
      somsa.add(donacha(0.011, ko(0xF3E7CC, 0.6),
        (t() - 0.5) * 0.26, 0.148, (t() - 0.5) * 0.26));
    }

    somsa.position.set(Math.cos(a) * 0.26, 0.028, Math.sin(a) * 0.26);
    somsa.rotation.y = a + t();
    g.add(somsa);
  }

  // O‘rtadagi bittasi — biroz ko‘tarilgan.
  var orta = new THREE.Group();
  var t2 = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.205, 0.11, 3), xamir);
  t2.position.y = 0.055;
  orta.add(t2);
  var q2 = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.19, 0.03, 3), pishgan);
  q2.position.y = 0.12;
  orta.add(q2);
  orta.position.y = 0.13;
  orta.rotation.y = 0.9;
  g.add(orta);

  return tayyorla(g, 1.30, true, 'kokSomsa');
}

/* 13. BUG‘DOY NIHOLI — Navro‘zda undirilgan sabza. Sopol
   tovoqda tuproq, undan ko‘tarilgan yosh yashil poyalar. */
export function bugdoyNiholYasa() {
  var g = new THREE.Group();

  // Sopol tovoq.
  var tovoq = charx([
    [0.00, 0.00], [0.34, 0.00], [0.36, 0.03], [0.40, 0.14],
    [0.42, 0.22], [0.40, 0.22], [0.375, 0.14], [0.335, 0.04], [0.00, 0.032]
  ], 28, sopol(RANG.sopolTiq, true));
  g.add(tovoq);
  g.add(halqa(0.41, 0.014, 0.205, sopol(RANG.kok)));

  // Tuproq.
  var tuproq = new THREE.Mesh(new THREE.CylinderGeometry(0.375, 0.34, 0.16, 26), ko(RANG.tuproq, 0.98));
  tuproq.position.y = 0.115;
  g.add(tuproq);

  // Nihollar — ingichka yashil poyalar.
  var t = tasodif(5);
  for (var i = 0; i < 90; i++) {
    var a = t() * Math.PI * 2;
    var r = Math.sqrt(t()) * 0.345;
    var uz = 0.34 + t() * 0.30;
    var rang = t() > 0.5 ? RANG.yashil : RANG.yashilOch;
    var poya = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.010, uz, 4), ko(rang, 0.72));
    poya.position.set(Math.cos(a) * r, 0.195 + uz / 2, Math.sin(a) * r);
    poya.rotation.z = (t() - 0.5) * 0.55;
    poya.rotation.x = (t() - 0.5) * 0.55;
    g.add(poya);
  }
  // Yuqoridagi yumshoq yashil massa — ko‘kat qalinligi.
  var qalin = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), ko(0x4F8B44, 0.85));
  qalin.scale.y = 0.42;
  qalin.position.y = 0.30;
  g.add(qalin);

  return tayyorla(g, 1.20, true, 'bugdoyNihol');
}

/* 14. LOLA — Navro‘z va bahor ramzi. Yashil poya, ikki uzun
   barg va olti qizil gulbargdan iborat kosacha. */
export function lolaYasa() {
  var g = new THREE.Group();
  var yash = ko(RANG.yashil, 0.75), qiz = ko(0xC42E28, 0.5), qizT = ko(0x8E1F1B, 0.55);

  // Tuproq to‘nkasi.
  var tuproq = new THREE.Mesh(new THREE.SphereGeometry(0.20, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), ko(RANG.tuproq, 0.98));
  tuproq.scale.y = 0.34;
  g.add(tuproq);

  // Poya.
  var poya = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.028, 0.92, 8), yash);
  poya.position.y = 0.52;
  poya.rotation.z = 0.05;
  g.add(poya);

  // Ikki uzun barg.
  [-1, 1].forEach(function (yon) {
    var barg = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 8), yash);
    barg.scale.set(0.20, 2.0, 0.70);
    barg.position.set(yon * 0.11, 0.40, yon * 0.03);
    barg.rotation.z = yon * 0.30;
    barg.rotation.x = yon * 0.12;
    g.add(barg);
  });

  // Gul kosachasi.
  var kosa = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), qizT);
  kosa.scale.y = 0.9;
  kosa.position.y = 1.06;
  g.add(kosa);

  // Olti gulbarg.
  aylanaBoylab(g, 6, 0.11, 1.16, function (i, a) {
    var b = new THREE.Mesh(new THREE.SphereGeometry(0.115, 12, 9), qiz);
    b.scale.set(0.42, 1.5, 0.72);
    b.rotation.z = Math.cos(a) * -0.42;
    b.rotation.x = Math.sin(a) * 0.42;
    return b;
  });
  // Ichki ikki barg — gul yopiqroq ko‘rinsin.
  aylanaBoylab(g, 3, 0.05, 1.20, function (i, a) {
    var b = new THREE.Mesh(new THREE.SphereGeometry(0.10, 10, 8), qizT);
    b.scale.set(0.4, 1.5, 0.7);
    b.rotation.z = Math.cos(a) * -0.22;
    b.rotation.x = Math.sin(a) * 0.22;
    return b;
  });
  // Qora chang‘i markazi.
  g.add(donacha(0.035, ko(0x2B1A12, 0.8), 0, 1.22, 0));

  return tayyorla(g, 1.40, true, 'lola');
}

/* =========================================================
   ————————————— HOSIL BAYRAMI —————————————
   ========================================================= */

/* 15. HOSIL SAVATI — to‘qilgan qamish savat, ichi mevaga to‘la,
   ustida yoysimon dasta. */
export function savatYasa() {
  var g = new THREE.Group();
  var qamish = ko(0xB58C50, 0.9), qamishT = ko(0x8E6A34, 0.9);

  // Savat devori — to‘qish qatorlari (halqalar) va tik qovurg‘alar.
  var pastR = 0.36, ustR = 0.52, bal = 0.50;
  for (var q = 0; q < 9; q++) {
    var p = q / 8;
    var r = pastR + (ustR - pastR) * p;
    var h = new THREE.Mesh(new THREE.TorusGeometry(r, 0.026, 7, 30), q % 2 ? qamish : qamishT);
    h.rotation.x = Math.PI / 2;
    h.position.y = 0.03 + p * bal;
    g.add(h);
  }
  // Tik qovurg‘alar.
  aylanaBoylab(g, 16, (pastR + ustR) / 2, 0.28, function (i, a) {
    var k = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, bal + 0.10, 6), qamishT);
    k.rotation.z = -Math.cos(a) * 0.17;
    k.rotation.x = Math.sin(a) * 0.17;
    return k;
  });
  // Tub.
  g.add(disk(0.36, 0.035, qamishT, 0, 0.03, 0, 26));
  // Og‘iz jiyagi.
  var jiyak = new THREE.Mesh(new THREE.TorusGeometry(ustR + 0.012, 0.035, 8, 32), qamish);
  jiyak.rotation.x = Math.PI / 2;
  jiyak.position.y = bal + 0.04;
  g.add(jiyak);

  // Yoysimon dasta.
  var dasta = new THREE.Mesh(new THREE.TorusGeometry(0.50, 0.028, 8, 26, Math.PI), qamishT);
  dasta.position.y = bal + 0.04;
  dasta.rotation.y = Math.PI / 2;
  g.add(dasta);

  // Ichidagi hosil — olma, uzum donalari, anor.
  var t = tasodif(13);
  var mevaRang = [0xC1502E, 0xD8A32E, 0x7A3B7E, 0x2F6B45, 0xB8342A, 0xE2B33C];
  for (var i = 0; i < 16; i++) {
    var a2 = t() * Math.PI * 2, r2 = Math.sqrt(t()) * 0.40;
    var m = donacha(0.085 + t() * 0.05, ko(mevaRang[i % mevaRang.length], 0.45),
      Math.cos(a2) * r2, bal - 0.02 + t() * 0.14, Math.sin(a2) * r2);
    m.scale.y = 0.9;
    g.add(m);
  }
  // Bir-ikki yashil barg.
  for (var b = 0; b < 4; b++) {
    var barg = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 7), ko(RANG.yashil, 0.8));
    barg.scale.set(1.3, 0.18, 0.7);
    barg.position.set((t() - 0.5) * 0.7, bal + 0.05, (t() - 0.5) * 0.7);
    barg.rotation.y = t() * 3;
    g.add(barg);
  }
  return tayyorla(g, 1.35, true, 'savat');
}

/* 16. QOVUN — hosil bayramining bosh mevasi: cho‘ziq sarg‘ish
   tana, to‘q yashil tik yo‘llar va quruq band. */
export function qovunYasa() {
  var g = new THREE.Group();
  var poRang = ko(0xE0C96A, 0.62), yolRang = ko(0x4E7A34, 0.7);

  var tana = new THREE.Mesh(new THREE.SphereGeometry(0.42, 26, 18), poRang);
  tana.scale.set(1.45, 0.90, 0.90);
  tana.rotation.z = 0.08;
  tana.position.y = 0.38;
  g.add(tana);

  // Tik yo‘llar — meridian bo‘ylab.
  for (var i = 0; i < 10; i++) {
    var a = (i / 10) * Math.PI * 2;
    var yol = new THREE.Mesh(new THREE.TorusGeometry(0.415, 0.020, 6, 26, Math.PI), yolRang);
    yol.rotation.y = a;
    yol.rotation.x = Math.PI / 2;
    yol.scale.set(1.46, 0.92, 1);
    yol.position.y = 0.38;
    g.add(yol);
  }
  // To‘r naqsh — qovun po‘stidagi oqish tomirlar.
  var t = tasodif(29);
  for (var k = 0; k < 26; k++) {
    var a2 = t() * Math.PI * 2, b2 = (t() - 0.5) * 1.5;
    var tomir = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), ko(0xF2E4B0, 0.75));
    tomir.scale.set(1.4, 0.16, 0.30);
    tomir.position.set(Math.cos(a2) * 0.58 * Math.cos(b2), 0.38 + Math.sin(b2) * 0.36, Math.sin(a2) * 0.36 * Math.cos(b2));
    tomir.rotation.y = -a2;
    tomir.rotation.z = t() * 1.2;
    g.add(tomir);
  }

  // Band va quruq gulkosa.
  var band = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.16, 8), ko(0x8E7A46, 0.9));
  band.position.set(-0.55, 0.46, 0);
  band.rotation.z = 1.15;
  g.add(band);
  var barg = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), ko(RANG.yashil, 0.8));
  barg.scale.set(1.2, 0.16, 0.85);
  barg.position.set(-0.60, 0.16, 0.16);
  barg.rotation.y = 0.6;
  g.add(barg);

  return tayyorla(g, 1.45, true, 'qovun');
}

/* 17. UZUM BOSHI — hosil bayramida uzilgan uzum: konussimon
   joylashgan donalar, band va tok bargi. */
export function uzumYasa() {
  var g = new THREE.Group();
  var don = ko(0x6E3B7A, 0.30), donOch = ko(0x8A55A0, 0.30);

  // Band.
  var band = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.030, 0.26, 8), ko(0x6E5334, 0.9));
  band.position.y = 1.20;
  g.add(band);
  var shox = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.014, 6, 16, Math.PI * 1.5), ko(0x6E5334, 0.9));
  shox.position.set(0.10, 1.33, 0);
  shox.rotation.y = 0.8;
  g.add(shox);

  // Donalar — yuqoridan pastga kengayib boruvchi konus ichida.
  var t = tasodif(41);
  var qatlamlar = [
    { y: 1.02, r: 0.20, n: 9 }, { y: 0.88, r: 0.245, n: 11 },
    { y: 0.73, r: 0.255, n: 12 }, { y: 0.58, r: 0.235, n: 11 },
    { y: 0.44, r: 0.20, n: 9 }, { y: 0.30, r: 0.155, n: 7 },
    { y: 0.17, r: 0.10, n: 5 }, { y: 0.07, r: 0.045, n: 3 }
  ];
  qatlamlar.forEach(function (q, qi) {
    for (var i = 0; i < q.n; i++) {
      var a = (i / q.n) * Math.PI * 2 + qi * 0.5;
      var d = donacha(0.085, (i + qi) % 3 ? don : donOch,
        Math.cos(a) * q.r, q.y, Math.sin(a) * q.r);
      d.scale.y = 1.1;
      g.add(d);
    }
    // Markazdagi to‘ldiruvchi donalar.
    if (q.r > 0.12) g.add(donacha(0.085, don, (t() - 0.5) * 0.08, q.y + 0.03, (t() - 0.5) * 0.08));
  });

  // Tok bargi.
  var barg = new THREE.Group();
  var asos = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 9), ko(0x3F7A3A, 0.82));
  asos.scale.set(1, 0.10, 0.95);
  barg.add(asos);
  aylanaBoylab(barg, 5, 0.19, 0.005, function () {
    var b = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 7), ko(0x3F7A3A, 0.82));
    b.scale.set(1, 0.10, 0.85);
    return b;
  });
  barg.position.set(-0.30, 1.16, 0.08);
  barg.rotation.z = 0.35;
  g.add(barg);

  return tayyorla(g, 1.40, false, 'uzum');
}

/* 18. ANOR — bahavo bog‘larning mevasi. Yumaloq qizil tana,
   tepasida beshburchak toj va yonida ochilgan bo‘lagi. */
export function anorYasa() {
  var g = new THREE.Group();
  var poRang = ko(0xB8342A, 0.42), poTiq = ko(0x8E2019, 0.5);

  // Butun anor.
  var tana = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 18), poRang);
  tana.scale.set(1, 0.96, 1);
  tana.position.set(-0.14, 0.40, 0);
  g.add(tana);

  // Toj — beshburchak gulkosa.
  var toj = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.10, 0.10, 10), poTiq);
  toj.position.set(-0.14, 0.83, 0);
  g.add(toj);
  // Toj barglari — anor markazi x = -0.14 da bo‘lgani uchun
  // aylanani alohida guruhga yig‘ib, so‘ng siljitamiz.
  var tojBarg = new THREE.Group();
  aylanaBoylab(tojBarg, 5, 0.085, 0, function (i, a) {
    var b = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.13, 5), poTiq);
    b.rotation.z = -Math.cos(a) * 0.55;
    b.rotation.x = Math.sin(a) * 0.55;
    return b;
  });
  tojBarg.position.set(-0.14, 0.90, 0);
  g.add(tojBarg);
  // Po‘stdagi yengil soyalar.
  var t = tasodif(53);
  for (var i = 0; i < 8; i++) {
    var a2 = t() * Math.PI * 2, b2 = (t() - 0.5) * 1.6;
    var soya = new THREE.Mesh(new THREE.SphereGeometry(0.10, 8, 6), poTiq);
    soya.scale.set(0.30, 1.2, 0.20);
    soya.position.set(-0.14 + Math.cos(a2) * 0.40 * Math.cos(b2), 0.40 + Math.sin(b2) * 0.40, Math.sin(a2) * 0.40 * Math.cos(b2));
    g.add(soya);
  }

  // Ochilgan yarim bo‘lak — donalari ko‘rinib turadi.
  var bolak = new THREE.Group();
  var qobiq = new THREE.Mesh(new THREE.SphereGeometry(0.30, 20, 14, 0, Math.PI), poRang);
  qobiq.rotation.y = -Math.PI / 2;
  bolak.add(qobiq);
  var ich = new THREE.Mesh(new THREE.CircleGeometry(0.295, 24), ko(0xEDD9BE, 0.85));
  ich.rotation.y = Math.PI;
  ich.position.z = -0.004;
  bolak.add(ich);
  // Donalar — yarim doiraga zich terilgan.
  for (var q = 0; q < 5; q++) {
    var r = 0.055 + q * 0.055;
    var soni = 4 + q * 3;
    for (var k = 0; k < soni; k++) {
      var ang = -Math.PI / 2 + (k / (soni - 1)) * Math.PI;
      var dona = donacha(0.030, ko(0xC9202B, 0.28),
        Math.cos(ang) * r, Math.sin(ang) * r, -0.012);
      dona.scale.z = 0.6;
      bolak.add(dona);
    }
  }
  bolak.position.set(0.50, 0.30, 0.02);
  bolak.rotation.y = -0.35;
  bolak.rotation.z = 0.12;
  g.add(bolak);

  return tayyorla(g, 1.35, true, 'anor');
}

/* 19. BUG‘DOY BOG‘LAMI — hosil bayramining ramzi: arqon bilan
   bog‘langan bug‘doy poyalari dastasi, boshoqlari donaga to‘la. */
export function bugdoyBoglamYasa() {
  var g = new THREE.Group();
  var poya = ko(RANG.bugdoy, 0.9), boshoq = ko(0xE0C87C, 0.85), qil = ko(0xEBD9A2, 0.9);

  var t = tasodif(17);
  for (var i = 0; i < 24; i++) {
    var a = (i / 24) * Math.PI * 2 + t() * 0.2;
    var r = 0.06 + (i % 4) * 0.035;
    var qiya = 0.10 + (i % 4) * 0.055;
    var uzun = 0.86 + t() * 0.12;

    var p = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.014, uzun, 5), poya);
    p.position.set(Math.cos(a) * r * 0.5, uzun / 2, Math.sin(a) * r * 0.5);
    p.rotation.z = -Math.cos(a) * qiya;
    p.rotation.x = Math.sin(a) * qiya;
    g.add(p);

    // Boshoq — cho‘ziq, donachalar bilan.
    var b = new THREE.Group();
    var ozak = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.026, 0.24, 6), boshoq);
    b.add(ozak);
    for (var k = 0; k < 8; k++) {
      var yon = k % 2 ? 1 : -1;
      var d = donacha(0.028, boshoq, yon * 0.025, -0.10 + k * 0.028, 0);
      d.scale.set(1, 0.85, 0.9);
      b.add(d);
      // Qiltiq.
      var qq = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.16, 4), qil);
      qq.position.set(yon * 0.035, 0.02 + k * 0.028, 0);
      qq.rotation.z = -yon * 0.30;
      b.add(qq);
    }
    b.position.set(Math.cos(a) * (r * 0.5 + Math.sin(qiya) * uzun), uzun + 0.10, Math.sin(a) * (r * 0.5 + Math.sin(qiya) * uzun) * 1);
    b.position.x = p.position.x + Math.cos(a) * qiya * uzun * 0.9;
    b.position.z = p.position.z + Math.sin(a) * qiya * uzun * 0.9;
    b.rotation.z = p.rotation.z;
    b.rotation.x = p.rotation.x;
    g.add(b);
  }

  // Bog‘lam arqoni.
  var arqon = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.028, 8, 24), ko(0x9C7A46, 0.95));
  arqon.rotation.x = Math.PI / 2;
  arqon.position.y = 0.40;
  g.add(arqon);
  var arqon2 = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.020, 8, 24), ko(0x7E5F34, 0.95));
  arqon2.rotation.x = Math.PI / 2;
  arqon2.position.y = 0.34;
  g.add(arqon2);
  // Arqon uchi.
  var uch = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.012, 0.22, 6), ko(0x9C7A46, 0.95));
  uch.position.set(0.16, 0.30, 0.06);
  uch.rotation.z = 0.6;
  g.add(uch);

  return tayyorla(g, 1.45, false, 'bugdoyBoglam');
}

/* =========================================================
   REYESTR — marosim → buyum. O‘yin va galereya shu jadvaldan
   foydalanadi. `marosim` maydoni buyum qaysi marosimga tegishli
   ekanini ko‘rsatadi.
   ========================================================= */
export const MAROSIM = {
  /* — Beshik to‘yi — */
  beshik: {
    nom: 'Beshik', marosim: 'beshik', modul: 7, yasa: beshikYasa,
    izoh: 'Beshik to‘yi — chaqaloq beshikka belanadigan ilk marosim. Beshik bolaning birinchi tarbiya maskani.'
  },
  qiyiq: {
    nom: 'Qiyiq', marosim: 'beshik', modul: 7, yasa: qiyiqYasa,
    izoh: 'Beshik to‘yiga keltirilgan sovg‘alar qiyiqqa tugib topshiriladi — hurmat va ehtiyotkorlik belgisi.'
  },
  korpacha: {
    nom: 'Ko‘rpacha', marosim: 'beshik', modul: 7, yasa: korpachaYasa,
    izoh: 'Beshikka solinadigan ko‘rpachani buvi yoki xolasi taxlab keltiradi — mehr va g‘amxo‘rlik udumi.'
  },
  isiriq: {
    nom: 'Isiriq', marosim: 'beshik', modul: 7, yasa: isiriqYasa,
    izoh: 'Marosim boshida uy isiriq bilan tutatiladi — poklik va ezgu niyat udumi.'
  },
  shirinlik: {
    nom: 'Shirinlik', marosim: 'beshik', modul: 7, yasa: shirinlikYasa,
    izoh: 'Parvarda, navvot va holva — quvonchni el bilan bo‘lishish an’anasi.'
  },

  /* — Sunnat to‘yi — */
  ton: {
    nom: 'To‘n', marosim: 'sunnat', modul: 7, yasa: tonYasa,
    izoh: 'Sunnat to‘yida bolaga to‘n kiydiriladi — u endi katta bo‘ldi, degan ramziy ma’no.'
  },
  doppi: {
    nom: 'Do‘ppi', marosim: 'sunnat', modul: 7, yasa: doppiYasa,
    izoh: 'To‘nga do‘ppi hamroh bo‘ladi. Do‘ppi kiyish — o‘zbek erkagining an’anaviy ko‘rinishi.'
  },
  karnay: {
    nom: 'Karnay', marosim: 'sunnat', modul: 7, yasa: karnayYasa,
    izoh: 'Karnay ovozi to‘y boshlanganini butun mahallaga bildiradi — jamoaviylik belgisi.'
  },
  surnay: {
    nom: 'Surnay', marosim: 'sunnat', modul: 7, yasa: surnayYasa,
    izoh: 'Karnay-surnay birga chalinadi. To‘y sadosi bolaga umrbod esda qoladigan xotira beradi.'
  },
  non: {
    nom: 'Non', marosim: 'sunnat', modul: 7, yasa: nonYasa,
    izoh: 'Non — har bir marosim dasturxonining boshi. Nonni hurmatlash bolalikdan o‘rgatiladi.'
  },

  /* — Nikoh to‘yi — */
  sandiq: {
    nom: 'Kelin sandig‘i', marosim: 'nikoh', modul: 7, yasa: sandiqYasa,
    izoh: 'Kelin sepi solinadigan naqshli sandiq — oila qurishga tayyorgarlik va mehnat samarasi.'
  },
  oyna: {
    nom: 'Kelin ko‘zgusi', marosim: 'nikoh', modul: 7, yasa: oynaYasa,
    izoh: '«Yuz ochdi» udumida ishlatiladigan ko‘zgu — yangi hayotga ochiq yuz bilan qadam qo‘yish ramzi.'
  },
  sarpo: {
    nom: 'Sarpo', marosim: 'nikoh', modul: 7, yasa: sarpoYasa,
    izoh: 'Quda tomonga uzatiladigan sovg‘a kiyimlar — ikki oila o‘rtasidagi hurmat ko‘prigi.'
  },
  suzani: {
    nom: 'So‘zana', marosim: 'nikoh', modul: 7, yasa: suzaniYasa,
    izoh: 'Kelin o‘z qo‘li bilan kashta tikkan so‘zana — mehnatsevarlik va did tarbiyasining natijasi.'
  },
  romol: {
    nom: 'Ro‘mol', marosim: 'nikoh', modul: 7, yasa: romolYasa,
    izoh: 'Kelin salom marosimida ro‘mol tutiladi — kattalarga ta’zim va hurmat udumi.'
  },

  /* — Navro‘z — */
  qozon: {
    nom: 'Sumalak qozoni', marosim: 'navroz', modul: 7, yasa: qozonYasa,
    izoh: 'Navro‘zda mahalla bo‘lib sumalak qaynatiladi — hamjihatlik va o‘zaro yordam maktabi.'
  },
  sumalak: {
    nom: 'Sumalak', marosim: 'navroz', modul: 7, yasa: sumalakYasa,
    izoh: 'Tun bo‘yi navbat bilan qaynatilgan sumalak ertasiga hammaga teng ulashiladi.'
  },
  kokSomsa: {
    nom: 'Ko‘k somsa', marosim: 'navroz', modul: 7, yasa: kokSomsaYasa,
    izoh: 'Bahorgi ko‘katdan tayyorlangan somsa — Navro‘z dasturxonining mavsumiy taomi.'
  },
  bugdoyNihol: {
    nom: 'Bug‘doy niholi', marosim: 'navroz', modul: 7, yasa: bugdoyNiholYasa,
    izoh: 'Undirilgan sabza — yangilanish va tabiat uyg‘onishining ramzi.'
  },
  lola: {
    nom: 'Lola', marosim: 'navroz', modul: 7, yasa: lolaYasa,
    izoh: 'Lola sayli — bahor kelishini nishonlash udumi; go‘zallikni qadrlashga o‘rgatadi.'
  },

  /* — Hosil bayrami — */
  savat: {
    nom: 'Hosil savati', marosim: 'hosil', modul: 7, yasa: savatYasa,
    izoh: 'Yig‘ilgan hosil savatga terib qo‘yiladi — mehnat mevasini asrash tarbiyasi.'
  },
  qovun: {
    nom: 'Qovun', marosim: 'hosil', modul: 7, yasa: qovunYasa,
    izoh: 'Qovun — dehqon mehnatining shirin natijasi; hosil bayramida to‘rga qo‘yiladi.'
  },
  uzum: {
    nom: 'Uzum', marosim: 'hosil', modul: 7, yasa: uzumYasa,
    izoh: 'Tok parvarishi sabr talab qiladi — bola bog‘bonlik orqali mas’uliyatni o‘rganadi.'
  },
  anor: {
    nom: 'Anor', marosim: 'hosil', modul: 7, yasa: anorYasa,
    izoh: 'Anor donalari — birlik va jamoaning bir tan-bir jon ekani haqidagi xalq timsoli.'
  },
  oroq: {
    nom: 'O‘roq', marosim: 'hosil', modul: 7, yasa: oroqYasa,
    izoh: 'Hosil yig‘imi quroli. Bola kichikligidan mehnatga jalb etilib, qadr-qimmat o‘rganadi.'
  },
  bugdoyBoglam: {
    nom: 'Bug‘doy bog‘lami', marosim: 'hosil', modul: 7, yasa: bugdoyBoglamYasa,
    izoh: 'Bog‘langan boshoqlar — bir yillik mehnatning yakuni va rizq-ro‘zning ramzi.'
  },

  /* — Umumiy dasturxon buyumlari — */
  dasturxon: {
    nom: 'Dasturxon', marosim: 'umumiy', modul: 7, yasa: dasturxonYasa,
    izoh: 'Har bir marosim dasturxon atrofida boshlanadi — muomala odobi shu yerda o‘rgatiladi.'
  },
  choynak: {
    nom: 'Choynak', marosim: 'umumiy', modul: 7, yasa: choynakYasa,
    izoh: 'Mehmonga choy uzatish — mehmondo‘stlik an’anasining ajralmas qismi.'
  },
  piyola: {
    nom: 'Piyola', marosim: 'umumiy', modul: 7, yasa: piyolaYasa,
    izoh: 'Piyolani ikki qo‘llab uzatish — kattaga hurmat belgisi.'
  },
  sopolLagan: {
    nom: 'Sopol lagan', marosim: 'umumiy', modul: 7, yasa: sopolLaganYasa,
    izoh: 'Marosim taomi laganda ko‘tarib kelinadi; idish-tovoq ham udumning bir qismi.'
  }
};

/* Marosimlar ro‘yxati — o‘yin bosqichlari shu tartibda boradi. */
export const MAROSIMLAR = [
  {
    kalit: 'beshik', nom: 'Beshik to‘yi',
    izoh: 'Chaqaloq ilk bor beshikka belanadi. Beshik to‘yiga mos buyumlarni tanlang.',
    buyumlar: ['beshik', 'qiyiq', 'korpacha', 'isiriq', 'shirinlik']
  },
  {
    kalit: 'sunnat', nom: 'Sunnat to‘yi',
    izoh: 'Bolaga to‘n kiydirilib, el-yurt chaqiriladi. Sunnat to‘yiga mos buyumlarni tanlang.',
    buyumlar: ['ton', 'doppi', 'karnay', 'surnay', 'non']
  },
  {
    kalit: 'nikoh', nom: 'Nikoh to‘yi',
    izoh: 'Ikki oila quda bo‘ladi. Nikoh to‘yiga mos buyumlarni tanlang.',
    buyumlar: ['sandiq', 'oyna', 'sarpo', 'suzani', 'romol']
  },
  {
    kalit: 'navroz', nom: 'Navro‘z — sumalak sayli',
    izoh: 'Bahor kirdi, mahalla sumalak qaynatadi. Navro‘z dasturxoniga mos buyumlarni tanlang.',
    buyumlar: ['qozon', 'sumalak', 'kokSomsa', 'bugdoyNihol', 'lola']
  },
  {
    kalit: 'hosil', nom: 'Hosil bayrami',
    izoh: 'Yil mehnati yakunlandi. Hosil bayramiga mos buyumlarni tanlang.',
    buyumlar: ['savat', 'qovun', 'uzum', 'anor', 'oroq', 'bugdoyBoglam']
  }
];

/* Barcha modellarni bir marta yasab ko‘rish — sinov uchun. */
export function barchasiniYasa() {
  return Object.keys(MAROSIM).map(function (k) {
    return { kalit: k, guruh: MAROSIM[k].yasa() };
  });
}
