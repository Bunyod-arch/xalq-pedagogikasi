/* =========================================================
   MILLIY O‘YIN BUYUMLARI — 3D MODELLAR (Three.js)
   Darslikning 8-modulida nomlangan xalq o‘yinlarida ishlatiladigan
   buyumlarning uslublangan (stilizatsiya qilingan) 3D modellari.

   Barcha modellar faqat Three.js primitivlaridan quriladi:
   Cylinder, Sphere, Box, Cone, Lathe, Torus, Tube va Shape+Extrude.
   Tashqi model fayli yoki qo‘shimcha kutubxona ishlatilmaydi.

   Har bir yasash funksiyasi THREE.Group qaytaradi:
     · markazi (0,0,0) da, pastki nuqtasi y = 0 da turadi;
     · eng katta o‘lchami 1.0–1.5 birlik (terak — 2.5 birlikkacha);
     · soya beradi (castShadow), yerga tegib turgan qismlar soya qabul qiladi.
   ========================================================= */
import * as THREE from '../vendor/three.module.min.js';

/* ---------------- Ranglar jadvali ----------------
   Milliy buyumlarning tabiiy ranglari — yog‘och, jun, chim, mato. */
const RANG = {
  yogochToq:    0x8A6A44,   // to‘q yog‘och — dastak, garda
  yogochOch:    0xB08E64,   // och yog‘och — tig‘, tayoq
  jun:          0xF3E6CE,   // jun to‘p ipi
  chim:         0x2F6B45,   // ko‘k o‘t — chim
  chimToq:      0x4E5B29,   // qurigan o‘t — chim
  arqon:        0xC9A87A,   // kanop arqon
  otTana:       0x8C5A3C,   // ot tanasi — jiyron
  otYol:        0x5A3E23,   // ot yoli va dumi
  qoyJun:       0xF5F0E4,   // qo‘y juni
  qoyQora:      0x2B2724,   // qo‘yning boshi va oyoqlari
  doppi:        0x16162E,   // do‘ppi matosi — to‘q ko‘k-qora
  doppiOq:      0xFBF7F0,   // do‘ppidagi oq naqsh
  olma:         0xC1502E,   // qizil olma
  olmaYon:      0xD6743F,   // olmaning yorug‘ yonbagri
  barg:         0x2F6B45,   // yashil barg
  band:         0x6B4E2E,   // olma bandi
  matoQizil:    0xC1502E,   // ro‘mol matosi
  matoKok:      0x1B3B6F,   // ro‘mol naqshi
  oqTerakTana:  0xC9C4B4,   // oq terak — och kulrang tana
  oqTerakBarg:  0xC9D6C0,   // oq terak — kumushrang barg
  kokTerakTana: 0x7A5A3C,   // ko‘k terak — jigarrang tana
  kokTerakBarg: 0x2F6B45    // ko‘k terak — to‘q yashil barg
};

/* ---------------- Yordamchi funksiyalar ---------------- */

/* Standart material yasaydi: rang, gadir-budurlik va metall darajasi. */
function mat(rang, gadir, metall) {
  return new THREE.MeshStandardMaterial({
    color: rang,
    roughness: gadir === undefined ? 0.85 : gadir,
    metalness: metall || 0,
    flatShading: false
  });
}

/* Geometriyadan mesh yasab, guruhga berilgan nuqtaga qo‘shadi. */
function qosh(guruh, geo, xomashyo, x, y, z) {
  var m = new THREE.Mesh(geo, xomashyo);
  m.position.set(x || 0, y || 0, z || 0);
  guruh.add(m);
  return m;
}

/* Ikki nuqta orasiga silindr («tayoq») cho‘zadi — oyoq, bo‘yin, dastak uchun. */
function tayoq(guruh, xomashyo, a, b, r1, r2, seg) {
  var yon = new THREE.Vector3().subVectors(b, a);
  var uzun = yon.length() || 0.001;
  var m = new THREE.Mesh(
    new THREE.CylinderGeometry(r1, r2 === undefined ? r1 : r2, uzun, seg || 10),
    xomashyo
  );
  m.position.copy(a).addScaledVector(yon, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), yon.clone().normalize());
  guruh.add(m);
  return m;
}

/* Meshning old tomonini (+z) berilgan yo‘nalishga buradi. */
function yonaltir(m, x, y, z) {
  m.lookAt(m.position.x + x, m.position.y + y, m.position.z + z);
  return m;
}

/* Takrorlanadigan (bir xil natijali) tasodifiy sonlar generatori. */
function tasodifiy(urug) {
  var s = urug >>> 0;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* Silliq «shovqin» — chim to‘pning notekis sirti uchun (–1 … +1). */
function shovqin(x, y, z) {
  return Math.sin(x * 7.3 + 1.7) * Math.cos(y * 6.1 + 0.4) * Math.sin(z * 5.7 + 2.3);
}

/* Bodom (qalampir) naqshi shakli — do‘ppi bezagi va barg uchun. */
function bodomShakli(en, boy) {
  var s = new THREE.Shape();
  s.moveTo(0, 0);
  s.quadraticCurveTo(en, boy * 0.45, 0, boy);
  s.quadraticCurveTo(-en, boy * 0.45, 0, 0);
  return s;
}

/* Uchburchak shakli — do‘ppi gumbazidagi bezaklar uchun. */
function uchburchakShakli(en, boy) {
  var s = new THREE.Shape();
  s.moveTo(-en / 2, 0);
  s.lineTo(en / 2, 0);
  s.lineTo(0, boy);
  s.closePath();
  return s;
}

/* Yassi naqsh geometriyasi: shakl + ozgina qalinlik, markazi nolda. */
function yassiNaqsh(shakl, qalin, boy) {
  var geo = new THREE.ExtrudeGeometry(shakl, {
    depth: qalin, bevelEnabled: false, curveSegments: 8
  });
  geo.translate(0, -boy / 2, -qalin / 2);
  return geo;
}

/* Egri chiziq atrofida spiral bo‘lib o‘ralgan tolalar egriliklarini qaytaradi —
   arqonning eshilgan ko‘rinishi shundan hosil bo‘ladi. */
function eshilganTolalar(egri, tolaSoni, aylanish, ozanR, bolak) {
  var ramka = egri.computeFrenetFrames(bolak, false);
  var natija = [];
  for (var t = 0; t < tolaSoni; t++) {
    var nuqtalar = [];
    for (var i = 0; i <= bolak; i++) {
      var u = i / bolak;
      var p = egri.getPointAt(u);
      var burchak = u * aylanish * Math.PI * 2 + (t / tolaSoni) * Math.PI * 2;
      var n = ramka.normals[i], b = ramka.binormals[i];
      var c = Math.cos(burchak), s = Math.sin(burchak);
      nuqtalar.push(new THREE.Vector3(
        p.x + (n.x * c + b.x * s) * ozanR,
        p.y + (n.y * c + b.y * s) * ozanR,
        p.z + (n.z * c + b.z * s) * ozanR
      ));
    }
    natija.push(new THREE.CatmullRomCurve3(nuqtalar));
  }
  return natija;
}

/* Modelni yakuniy holatga keltiradi: kerakli miqyosga keltirib, markazlaydi
   (x, z bo‘yicha markaz, y bo‘yicha pastki nuqta nolda) va soyalarni yoqadi. */
function tayyorla(ich, olcham) {
  var g = new THREE.Group();
  g.add(ich);
  ich.updateMatrixWorld(true);
  var quti = new THREE.Box3().setFromObject(ich);
  var o = quti.getSize(new THREE.Vector3());
  var eng = Math.max(o.x, o.y, o.z);
  if (eng > 0) ich.scale.setScalar(olcham / eng);
  ich.updateMatrixWorld(true);
  quti.setFromObject(ich);
  var markaz = quti.getCenter(new THREE.Vector3());
  ich.position.set(-markaz.x, -quti.min.y, -markaz.z);
  g.traverse(function (n) {
    if (n.isMesh) {
      n.castShadow = true;
      if (n.userData.yerda) n.receiveShadow = true;
    }
  });
  return g;
}

/* =========================================================
   1. TERAK — «Oq terakmi, ko‘k terak?» o‘yini
   Baland, ingichka terak: taram-taram tanasi va cho‘zinchoq bargli,
   duksimon (mil shaklidagi) tor toji. `oq = true` bo‘lsa oq terak
   (och kulrang tana, kumushrang barg), aks holda ko‘k terak
   (jigarrang tana, to‘q yashil barg) yasaladi.
   ========================================================= */
export function terakYasa(oq) {
  var oqmi = oq !== false;
  var ich = new THREE.Group();
  var tanaMat = mat(oqmi ? RANG.oqTerakTana : RANG.kokTerakTana, 0.95);
  var dogMat  = mat(oqmi ? 0x6E6A60 : 0x4A3524, 0.95);
  var bargMat = mat(oqmi ? RANG.oqTerakBarg : RANG.kokTerakBarg, 0.88);
  var bargOch = mat(oqmi ? 0xE6EBE0 : 0x3F8A57, 0.88);

  /* Tana: pastdan yuqoriga ingichkalashadi */
  var tana = qosh(ich, new THREE.CylinderGeometry(0.046, 0.090, 2.05, 12), tanaMat, 0, 1.025, 0);
  tana.userData.yerda = true;

  /* Ildiz bo‘yni — tananing yerga tutashgan kengaygan qismi */
  var ildiz = qosh(ich, new THREE.ConeGeometry(0.165, 0.24, 12), tanaMat, 0, 0.12, 0);
  ildiz.userData.yerda = true;

  /* Po‘stloqdagi dog‘lar — terakning tanish belgisi */
  var td = tasodifiy(1701);
  for (var d = 0; d < 7; d++) {
    var dy = 0.10 + td() * 0.32;
    var da = td() * Math.PI * 2;
    var r  = 0.088 - (dy / 2.05) * 0.043;
    var dog = qosh(ich, new THREE.SphereGeometry(0.030, 8, 6), dogMat,
      Math.cos(da) * r, dy, Math.sin(da) * r);
    dog.scale.set(1, 0.55, 0.35);
    yonaltir(dog, Math.cos(da), 0, Math.sin(da));
  }

  /* Toj: duksimon (lathe) asos — terak toji tor va baland */
  var qirra = [
    new THREE.Vector2(0.000, 0.00),
    new THREE.Vector2(0.075, 0.09),
    new THREE.Vector2(0.140, 0.28),
    new THREE.Vector2(0.183, 0.55),
    new THREE.Vector2(0.202, 0.85),
    new THREE.Vector2(0.205, 1.12),
    new THREE.Vector2(0.190, 1.38),
    new THREE.Vector2(0.155, 1.62),
    new THREE.Vector2(0.100, 1.82),
    new THREE.Vector2(0.000, 1.98)
  ];
  var toj = qosh(ich, new THREE.LatheGeometry(qirra, 14), bargMat, 0, 0.42, 0);
  toj.scale.set(0.86, 1, 0.86);

  /* Toj radiusi — balandlik bo‘yicha (0…1) taxminiy qiymat */
  function tojR(t) {
    var i = Math.min(qirra.length - 2, Math.floor(t * (qirra.length - 1)));
    return qirra[i].x;
  }

  /* Barg to‘plamlari — silueti tabiiy notekis bo‘lishi uchun */
  var tb = tasodifiy(90210);
  for (var k = 0; k < 24; k++) {
    var t = 0.05 + (k / 24) * 0.90;
    var a = k * 2.399963 + tb() * 0.6;
    var rr = tojR(t) * (0.68 + tb() * 0.22);
    var top = qosh(ich, new THREE.SphereGeometry(0.056 + tb() * 0.026, 8, 6),
      (k % 3 === 0) ? bargOch : bargMat,
      Math.cos(a) * rr, 0.42 + t * 1.98, Math.sin(a) * rr);
    top.scale.set(0.85, 1.55, 0.85);
  }

  /* Alohida cho‘zinchoq barglar — terak bargi uzun va uchli */
  var tl = tasodifiy(4242);
  for (var j = 0; j < 34; j++) {
    var tj = 0.06 + tl() * 0.88;
    var aj = j * 2.399963 + tl() * 0.5;
    var rj = tojR(tj) * (0.86 + tl() * 0.18);
    var barg = qosh(ich, new THREE.SphereGeometry(0.048, 8, 6),
      (j % 2 === 0) ? bargMat : bargOch,
      Math.cos(aj) * rj, 0.42 + tj * 1.98, Math.sin(aj) * rj);
    barg.scale.set(0.30, 1.05, 0.15);
    barg.rotation.z = (tl() - 0.5) * 0.7;
    barg.rotation.y = aj;
  }

  /* Ichki shoxchalar — toj tanadan o‘sib chiqqanini ko‘rsatadi */
  for (var s = 0; s < 5; s++) {
    var as = (s / 5) * Math.PI * 2 + 0.4;
    tayoq(ich, tanaMat,
      new THREE.Vector3(0, 0.55 + s * 0.27, 0),
      new THREE.Vector3(Math.cos(as) * 0.15, 0.80 + s * 0.30, Math.sin(as) * 0.15),
      0.013, 0.024, 8);
  }

  return tayyorla(ich, 2.5);
}

/* =========================================================
   2. JUN TO‘P — «Jun to‘p» o‘yini
   Qo‘lda jundan o‘ralgan to‘p: yumshoq gumbaz sirtida bir necha
   qavat bo‘lib o‘ralgan ip chiziqlari va bitta bo‘sh ip uchi.
   ========================================================= */
export function junTopYasa() {
  var ich = new THREE.Group();
  var junMat = mat(RANG.jun, 0.95);
  var ipMat  = mat(0xE2CDA6, 0.9);
  var ipToq  = mat(0xCBB187, 0.9);

  /* O‘zak — qo‘lda o‘ralgani uchun mutlaqo dumaloq emas */
  var ozak = qosh(ich, new THREE.SphereGeometry(0.50, 20, 14), junMat, 0, 0.50, 0);
  ozak.scale.set(1.0, 0.96, 1.02);
  ozak.userData.yerda = true;

  /* O‘ralgan ip chiziqlari — turli yo‘nalishdagi halqalar */
  var ti = tasodifiy(7331);
  for (var i = 0; i < 11; i++) {
    var halqa = qosh(ich, new THREE.TorusGeometry(0.492, 0.0135, 8, 22),
      (i % 3 === 0) ? ipToq : ipMat, 0, 0.50, 0);
    halqa.rotation.set(ti() * Math.PI, ti() * Math.PI, ti() * Math.PI);
    halqa.scale.set(1, 1, 0.995 + ti() * 0.02);
  }

  /* Ipning bo‘sh uchi — to‘p yonidan osilib turadi */
  var uch = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.46, 0.62, 0.14),
    new THREE.Vector3(0.60, 0.52, 0.20),
    new THREE.Vector3(0.66, 0.34, 0.10),
    new THREE.Vector3(0.58, 0.18, 0.02),
    new THREE.Vector3(0.44, 0.09, 0.06)
  ]);
  var ipUchi = qosh(ich, new THREE.TubeGeometry(uch, 22, 0.0125, 8, false), ipMat);
  ipUchi.userData.yerda = true;
  qosh(ich, new THREE.SphereGeometry(0.022, 8, 6), ipToq, 0.44, 0.09, 0.06);

  return tayyorla(ich, 1.15);
}

/* =========================================================
   3. CHIM TO‘P — «Chim to‘p» o‘yini
   Chim (o‘t-o‘lan ildizi bilan) o‘rab yasalgan to‘p: sirti notekis,
   ustidan mayda o‘t tutamlari o‘sib chiqqan.
   ========================================================= */
export function chimTopYasa() {
  var ich = new THREE.Group();
  var chimMat = mat(RANG.chim, 0.98);
  var otMat   = mat(RANG.chimToq, 0.95);
  var otOch   = mat(0x6E8A3A, 0.95);

  /* Notekis sirt: shar cho‘qqilari «shovqin» bo‘yicha siljitiladi */
  var geo = new THREE.IcosahedronGeometry(0.47, 5);
  var poz = geo.attributes.position;
  var v = new THREE.Vector3();
  for (var i = 0; i < poz.count; i++) {
    v.fromBufferAttribute(poz, i);
    var uz = v.length() || 1;
    var k = 1 + 0.085 * shovqin(v.x, v.y, v.z) + 0.03 * shovqin(v.z * 2.1, v.x * 1.9, v.y * 2.3);
    v.multiplyScalar(k * 0.48 / uz);
    poz.setXYZ(i, v.x, v.y, v.z);
  }
  poz.needsUpdate = true;
  geo.computeVertexNormals();
  var ozak = qosh(ich, geo, chimMat, 0, 0.50, 0);
  ozak.userData.yerda = true;

  /* Ustidagi o‘t tutamlari — sirtdan tashqariga qarab o‘sadi */
  var t = tasodifiy(31337);
  var tutamGeo = new THREE.ConeGeometry(0.0125, 0.068, 8);
  tutamGeo.translate(0, 0.034, 0);
  tutamGeo.rotateX(Math.PI / 2);              // o‘qi +z ga qaratildi
  for (var j = 0; j < 150; j++) {
    var u = (j + 0.5) / 150;
    var fi = Math.acos(1 - 2 * u);
    var teta = j * 2.399963;                   // oltin burchak — tekis tarqalish
    var nx = Math.sin(fi) * Math.cos(teta);
    var ny = Math.cos(fi);
    var nz = Math.sin(fi) * Math.sin(teta);
    var r = 0.442 + t() * 0.022;
    var tutam = qosh(ich, tutamGeo, (j % 3 === 0) ? otOch : otMat,
      nx * r, 0.50 + ny * r, nz * r);
    yonaltir(tutam, nx, ny, nz);
    tutam.rotateX((t() - 0.5) * 1.5);
    tutam.rotateY((t() - 0.5) * 1.5);
    if (ny < -0.4) tutam.userData.yerda = true;
  }

  return tayyorla(ich, 1.15);
}

/* =========================================================
   4. YOG‘OCH QILICH — «Qilich jangi» o‘yini
   Bolalar uchun butunlay yog‘ochdan yasalgan qilich: uchi uchli tig‘,
   ko‘ndalang dastak (garda), ip o‘ralgan tutqich va tugma (qabza).
   ========================================================= */
export function qilichYasa() {
  var ich = new THREE.Group();
  var tigMat  = mat(RANG.yogochOch, 0.72);
  var dastMat = mat(RANG.yogochToq, 0.8);
  var ipMat   = mat(RANG.arqon, 0.95);

  /* Tig‘: yassi, uchi uchburchak bo‘lib ingichkalashadi */
  var shakl = new THREE.Shape();
  shakl.moveTo(-0.038, 0);
  shakl.lineTo(0.038, 0);
  shakl.lineTo(0.038, 0.58);
  shakl.lineTo(0.022, 0.69);
  shakl.lineTo(0.000, 0.74);
  shakl.lineTo(-0.022, 0.69);
  shakl.lineTo(-0.038, 0.58);
  shakl.closePath();
  var tigGeo = new THREE.ExtrudeGeometry(shakl, {
    depth: 0.030, bevelEnabled: true, bevelThickness: 0.006,
    bevelSize: 0.006, bevelSegments: 1, curveSegments: 8
  });
  tigGeo.translate(0, 0, -0.015);
  qosh(ich, tigGeo, tigMat, 0, 0.03, 0);

  /* Tig‘ o‘rtasidagi qirra — yog‘och qilichning tanish belgisi */
  var qirra = qosh(ich, new THREE.BoxGeometry(0.016, 0.60, 0.044), dastMat, 0, 0.33, 0);
  qirra.rotation.z = 0;

  /* Dastak (garda): ko‘ndalang yog‘och, uchlari yumaloq */
  qosh(ich, new THREE.BoxGeometry(0.23, 0.046, 0.072), dastMat, 0, 0.012, 0);
  for (var s = -1; s <= 1; s += 2) {
    var uchi = qosh(ich, new THREE.CylinderGeometry(0.023, 0.023, 0.072, 10), dastMat,
      s * 0.115, 0.012, 0);
    uchi.rotation.x = Math.PI / 2;
  }

  /* Tutqich va unga o‘ralgan ip */
  tayoq(ich, dastMat,
    new THREE.Vector3(0, -0.22, 0), new THREE.Vector3(0, -0.005, 0), 0.034, 0.029, 12);
  for (var i = 0; i < 4; i++) {
    var halqa = qosh(ich, new THREE.TorusGeometry(0.0335, 0.0075, 8, 14), ipMat,
      0, -0.045 - i * 0.048, 0);
    halqa.rotation.x = Math.PI / 2;
  }

  /* Qabza — tutqich tagidagi tugma */
  var qabza = qosh(ich, new THREE.SphereGeometry(0.045, 12, 10), dastMat, 0, -0.245, 0);
  qabza.scale.set(1, 0.8, 1);
  qabza.userData.yerda = true;

  return tayyorla(ich, 1.3);
}

/* =========================================================
   5. CHAVGON TAYOG‘I — «Chavgon» o‘yini
   Uzun yog‘och tayoq; pastki uchi xokkey tayog‘idek egilgan va
   biroz yo‘g‘onlashgan, yuqori uchida charm-ip o‘ram (tutqich).
   ========================================================= */
export function chavgonYasa() {
  var ich = new THREE.Group();
  var yogochMat = mat(RANG.yogochOch, 0.8);
  var toqMat    = mat(RANG.yogochToq, 0.8);
  var ipMat     = mat(RANG.arqon, 0.95);

  /* Tayoq o‘qi: tepadan pastga tushib, uchida oldinga egiladi */
  var yol = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.000, 1.30, 0),
    new THREE.Vector3(0.018, 1.00, 0),
    new THREE.Vector3(0.045, 0.70, 0),
    new THREE.Vector3(0.085, 0.42, 0),
    new THREE.Vector3(0.135, 0.21, 0),
    new THREE.Vector3(0.215, 0.085, 0),
    new THREE.Vector3(0.320, 0.045, 0),
    new THREE.Vector3(0.420, 0.070, 0),
    new THREE.Vector3(0.480, 0.140, 0)
  ]);
  var tayogi = qosh(ich, new THREE.TubeGeometry(yol, 40, 0.031, 10, false), yogochMat);
  tayogi.userData.yerda = true;

  /* Egik uchining yo‘g‘onlashgan qismi — to‘pga uriladigan joy */
  for (var k = 0; k < 4; k++) {
    var t = 0.80 + k * 0.055;
    var p = yol.getPoint(t);
    var yon = qosh(ich, new THREE.SphereGeometry(0.043 - k * 0.002, 12, 10), yogochMat,
      p.x, p.y, p.z);
    yon.scale.set(1, 1, 0.72);
    yon.userData.yerda = true;
  }
  var uchTugma = qosh(ich, new THREE.SphereGeometry(0.036, 12, 10), toqMat, 0.480, 0.140, 0);
  uchTugma.scale.set(1, 1, 0.72);

  /* Tutqich o‘rami — tepa qismda ip halqalari */
  for (var i = 0; i < 6; i++) {
    var halqa = qosh(ich, new THREE.TorusGeometry(0.0355, 0.0095, 8, 14), ipMat,
      0.004 + i * 0.0025, 1.255 - i * 0.052, 0);
    halqa.rotation.x = Math.PI / 2;
    halqa.rotation.y = 0.06;
  }
  qosh(ich, new THREE.SphereGeometry(0.036, 12, 10), toqMat, 0, 1.302, 0);

  return tayyorla(ich, 1.45);
}

/* =========================================================
   6. ARQON — «Tortishmachoq» o‘yini
   Uch tolasi spiral bo‘lib eshilgan qalin arqon; yerda biroz egilgan
   holatda yotadi, ikki uchida tuguni bor.
   ========================================================= */
export function arqonYasa() {
  var ich = new THREE.Group();
  var arqonMat = mat(RANG.arqon, 0.98);
  var toqMat   = mat(0xAE8A5E, 0.98);

  /* Arqon o‘qi — yumshoq «S» shaklida yotadi */
  var yol = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.62, 0.055, 0.11),
    new THREE.Vector3(-0.31, 0.050, -0.10),
    new THREE.Vector3(0.00, 0.055, 0.01),
    new THREE.Vector3(0.31, 0.050, 0.13),
    new THREE.Vector3(0.62, 0.055, -0.03)
  ]);

  /* O‘zak — tolalar orasidan ko‘rinmasligi uchun ozgina ingichka */
  qosh(ich, new THREE.TubeGeometry(yol, 60, 0.030, 8, false), toqMat);

  /* Eshilgan uchta tola */
  var tolalar = eshilganTolalar(yol, 3, 9, 0.029, 60);
  for (var i = 0; i < tolalar.length; i++) {
    var tola = qosh(ich, new THREE.TubeGeometry(tolalar[i], 60, 0.026, 8, false),
      (i === 1) ? toqMat : arqonMat);
    tola.userData.yerda = true;
  }

  /* Ikki uchidagi tugunlar */
  var uchlar = [0, 1];
  for (var u = 0; u < uchlar.length; u++) {
    var t = uchlar[u];
    var p = yol.getPointAt(t);
    var yon = yol.getTangentAt(t);
    var tugun = qosh(ich, new THREE.TorusGeometry(0.040, 0.026, 8, 14), arqonMat,
      p.x, p.y, p.z);
    tugun.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), yon);
    tugun.userData.yerda = true;
    var shar = qosh(ich, new THREE.SphereGeometry(0.044, 12, 10), toqMat,
      p.x + yon.x * (t === 0 ? -0.03 : 0.03),
      p.y, p.z + yon.z * (t === 0 ? -0.03 : 0.03));
    shar.scale.set(1, 0.85, 1);
    shar.userData.yerda = true;
  }

  return tayyorla(ich, 1.35);
}

/* =========================================================
   7. OT — «Otliqlar poygasi» va «Tuya poyga» o‘yinlari
   Uslublangan, ammo aniq tanib olinadigan ot figurasi: cho‘ziq tana,
   ko‘tarilgan bo‘yin, uzun bosh va tumshuq, quloqlar, to‘rtta bo‘g‘imli
   oyoq (tuyoqlari bilan), bo‘yindagi yol va osilgan dum. Yuzi +x tomonga.
   ========================================================= */
export function otYasa() {
  var ich = new THREE.Group();
  var tanaMat  = mat(RANG.otTana, 0.9);
  var toqMat   = mat(0x744528, 0.9);
  var yolMat   = mat(RANG.otYol, 0.92);
  var tuyoqMat = mat(0x3A2E24, 0.7);
  var kozMat   = mat(0x14100C, 0.4);

  /* Tana: uch qismdan — o‘rta gavda, sag‘ri va ko‘krak */
  var gavda = qosh(ich, new THREE.SphereGeometry(1, 16, 12), tanaMat, 0, 0.42, 0);
  gavda.scale.set(0.30, 0.185, 0.165);
  var sagri = qosh(ich, new THREE.SphereGeometry(1, 16, 12), tanaMat, -0.19, 0.445, 0);
  sagri.scale.set(0.16, 0.175, 0.155);
  var kokrak = qosh(ich, new THREE.SphereGeometry(1, 16, 12), tanaMat, 0.20, 0.405, 0);
  kokrak.scale.set(0.145, 0.165, 0.150);

  /* Bo‘yin — oldinga va yuqoriga qarab ko‘tarilgan */
  tayoq(ich, tanaMat,
    new THREE.Vector3(0.235, 0.495, 0), new THREE.Vector3(0.415, 0.735, 0),
    0.105, 0.072, 12);

  /* Bosh: kalla suyagi + uzun tumshuq — otning eng tanish qismi */
  var bosh = qosh(ich, new THREE.SphereGeometry(1, 14, 10), tanaMat, 0.435, 0.775, 0);
  bosh.scale.set(0.078, 0.082, 0.070);
  var tumshuq = tayoq(ich, tanaMat,
    new THREE.Vector3(0.455, 0.760, 0), new THREE.Vector3(0.565, 0.655, 0),
    0.043, 0.058, 10);
  tumshuq.scale.set(1, 1, 0.88);
  var lab = qosh(ich, new THREE.SphereGeometry(0.046, 10, 8), toqMat, 0.572, 0.648, 0);
  lab.scale.set(1, 0.9, 0.85);
  for (var n = -1; n <= 1; n += 2) {
    qosh(ich, new THREE.SphereGeometry(0.010, 8, 6), kozMat, 0.583, 0.663, n * 0.021);
    qosh(ich, new THREE.SphereGeometry(0.014, 8, 6), kozMat, 0.470, 0.795, n * 0.062);
  }

  /* Quloqlar — kichkina, uchli va tik */
  for (var q = -1; q <= 1; q += 2) {
    var quloq = qosh(ich, new THREE.ConeGeometry(0.024, 0.072, 8), tanaMat,
      0.412, 0.862, q * 0.042);
    quloq.rotation.z = -0.18;
    quloq.rotation.x = q * 0.22;
  }

  /* Yol — bo‘yin qirrasi bo‘ylab yotqizilgan yassi tutamlar */
  for (var y = 0; y < 9; y++) {
    var t = y / 8;
    var yx = 0.245 + t * 0.185;
    var yy = 0.585 + t * 0.290;
    var tutam = qosh(ich, new THREE.BoxGeometry(0.055, 0.10 - t * 0.03, 0.028), yolMat,
      yx, yy, 0);
    tutam.rotation.z = -0.62;
  }
  var kokil = qosh(ich, new THREE.BoxGeometry(0.045, 0.075, 0.026), yolMat, 0.462, 0.845, 0);
  kokil.rotation.z = -1.0;

  /* Dum — orqadan pastga osilib turadi */
  var dumYoli = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.325, 0.505, 0),
    new THREE.Vector3(-0.395, 0.400, 0),
    new THREE.Vector3(-0.425, 0.265, 0),
    new THREE.Vector3(-0.408, 0.135, 0),
    new THREE.Vector3(-0.375, 0.055, 0)
  ]);
  var dum = qosh(ich, new THREE.TubeGeometry(dumYoli, 20, 0.048, 8, false), yolMat);
  dum.userData.yerda = true;
  qosh(ich, new THREE.SphereGeometry(0.052, 10, 8), yolMat, -0.330, 0.505, 0);
  var td = tasodifiy(555);
  for (var s = 0; s < 3; s++) {
    var tola = qosh(ich, new THREE.SphereGeometry(0.030, 8, 6), yolMat,
      -0.40 - td() * 0.03, 0.20 + td() * 0.20, (td() - 0.5) * 0.06);
    tola.scale.set(0.6, 2.6, 0.6);
  }

  /* To‘rtta oyoq: yelka/son — tizza — to‘piq — tuyoq */
  var oyoqlar = [
    { x: 0.205, z: 0.105, tx: 0.215, ax: 0.212 },   // o‘ng old
    { x: 0.205, z: -0.105, tx: 0.215, ax: 0.212 },  // chap old
    { x: -0.200, z: 0.100, tx: -0.262, ax: -0.235 },// o‘ng orqa
    { x: -0.200, z: -0.100, tx: -0.262, ax: -0.235 }// chap orqa
  ];
  for (var o = 0; o < oyoqlar.length; o++) {
    var a = oyoqlar[o];
    var yelka = qosh(ich, new THREE.SphereGeometry(1, 12, 10), toqMat, a.x, 0.395, a.z * 0.92);
    yelka.scale.set(0.085, 0.105, 0.062);
    tayoq(ich, tanaMat,
      new THREE.Vector3(a.x, 0.400, a.z), new THREE.Vector3(a.tx, 0.215, a.z * 1.03),
      0.058, 0.038, 10);
    tayoq(ich, tanaMat,
      new THREE.Vector3(a.tx, 0.215, a.z * 1.03), new THREE.Vector3(a.ax, 0.052, a.z * 1.03),
      0.034, 0.028, 10);
    var tuyoq = qosh(ich, new THREE.CylinderGeometry(0.042, 0.046, 0.052, 10), tuyoqMat,
      a.ax, 0.026, a.z * 1.03);
    tuyoq.userData.yerda = true;
  }

  return tayyorla(ich, 1.45);
}

/* =========================================================
   8. QO‘Y — «Podachi» o‘yini
   Oq junli qo‘y: junli to‘plamlardan yasalgan yumaloq tana,
   qora bosh, qora ingichka oyoqlar va kichik jun dumi.
   ========================================================= */
export function qoyYasa() {
  var ich = new THREE.Group();
  var junMat  = mat(RANG.qoyJun, 0.97);
  var junSoya = mat(0xE3DCCB, 0.97);
  var qoraMat = mat(RANG.qoyQora, 0.85);
  var kozMat  = mat(0xF7F3E8, 0.5);

  /* Jun tana: o‘zak ellipsoid + atrofidagi jun to‘plamlari */
  var ozak = qosh(ich, new THREE.SphereGeometry(1, 16, 12), junMat, 0, 0.375, 0);
  ozak.scale.set(0.265, 0.205, 0.190);
  var tj = tasodifiy(2468);
  for (var i = 0; i < 16; i++) {
    var u = (i + 0.5) / 16;
    var fi = Math.acos(1 - 2 * u);
    var teta = i * 2.399963;
    var nx = Math.sin(fi) * Math.cos(teta);
    var ny = Math.cos(fi) * 0.9;
    var nz = Math.sin(fi) * Math.sin(teta);
    var puf = qosh(ich, new THREE.SphereGeometry(0.085 + tj() * 0.035, 10, 8),
      (i % 4 === 0) ? junSoya : junMat,
      nx * 0.225, 0.375 + ny * 0.170, nz * 0.160);
    if (ny < -0.5) puf.userData.yerda = true;
  }

  /* Bo‘yin va bosh — qora, uzunchoq tumshuqli */
  tayoq(ich, qoraMat,
    new THREE.Vector3(0.215, 0.415, 0), new THREE.Vector3(0.305, 0.462, 0), 0.058, 0.052, 10);
  var bosh = qosh(ich, new THREE.SphereGeometry(1, 14, 10), qoraMat, 0.335, 0.468, 0);
  bosh.scale.set(0.080, 0.078, 0.070);
  var tumshuq = tayoq(ich, qoraMat,
    new THREE.Vector3(0.360, 0.462, 0), new THREE.Vector3(0.432, 0.428, 0), 0.045, 0.036, 10);
  tumshuq.scale.set(1, 1, 0.9);
  qosh(ich, new THREE.SphereGeometry(0.030, 10, 8), qoraMat, 0.437, 0.425, 0);

  /* Peshonadagi jun tutami va ko‘zlar */
  var kokil = qosh(ich, new THREE.SphereGeometry(0.062, 10, 8), junMat, 0.315, 0.512, 0);
  kokil.scale.set(1, 0.8, 0.95);
  for (var k = -1; k <= 1; k += 2) {
    qosh(ich, new THREE.SphereGeometry(0.011, 8, 6), kozMat, 0.383, 0.476, k * 0.046);
    /* Quloqlar — yon tomonga osilgan yassi barg shaklida */
    var quloq = qosh(ich, new THREE.SphereGeometry(0.045, 10, 8), qoraMat,
      0.312, 0.478, k * 0.088);
    quloq.scale.set(0.55, 0.45, 1.35);
    quloq.rotation.x = k * 0.35;
    quloq.rotation.z = -0.25;
  }

  /* To‘rtta ingichka qora oyoq va tuyoqchalar */
  var joy = [[0.145, 0.095], [0.145, -0.095], [-0.150, 0.090], [-0.150, -0.090]];
  for (var o = 0; o < joy.length; o++) {
    var x = joy[o][0], z = joy[o][1];
    tayoq(ich, qoraMat,
      new THREE.Vector3(x, 0.255, z), new THREE.Vector3(x + (x > 0 ? 0.012 : -0.012), 0.038, z),
      0.030, 0.023, 8);
    var tuyoq = qosh(ich, new THREE.CylinderGeometry(0.026, 0.029, 0.038, 8), qoraMat,
      x + (x > 0 ? 0.012 : -0.012), 0.019, z);
    tuyoq.userData.yerda = true;
  }

  /* Dum — kichik jun to‘plami */
  var dum = qosh(ich, new THREE.SphereGeometry(0.062, 10, 8), junMat, -0.272, 0.372, 0);
  dum.scale.set(0.8, 1.1, 0.9);

  return tayyorla(ich, 1.25);
}

/* =========================================================
   9. DO‘PPI — «O‘rta qo‘limni top» o‘yini
   Milliy do‘ppi: to‘q ko‘k-qora gumbaz, tik jiyak (chekka), jiyak
   bo‘ylab o‘n olti oq bodom naqshi va gumbazda to‘rtta uchburchak bezak.
   ========================================================= */
export function doppiYasa() {
  var ich = new THREE.Group();
  var matoMat = mat(RANG.doppi, 0.92);
  var jiyakMat = new THREE.MeshStandardMaterial({
    color: RANG.doppi, roughness: 0.92, metalness: 0, side: THREE.DoubleSide
  });
  var oqMat = mat(RANG.doppiOq, 0.8);

  /* Jiyak — do‘ppining tik chekkasi (ikki tomoni ham ko‘rinadi) */
  var jiyak = qosh(ich, new THREE.CylinderGeometry(0.400, 0.404, 0.135, 24, 1, true),
    jiyakMat, 0, 0.0675, 0);
  jiyak.userData.yerda = true;

  /* Jiyakning pastki qirrasi va ichki tubi */
  var qirra = qosh(ich, new THREE.TorusGeometry(0.401, 0.010, 8, 24), matoMat, 0, 0.004, 0);
  qirra.rotation.x = Math.PI / 2;
  qirra.userData.yerda = true;
  var tub = qosh(ich, new THREE.CircleGeometry(0.400, 24), matoMat, 0, 0.020, 0);
  tub.rotation.x = Math.PI / 2;
  tub.userData.yerda = true;

  /* Gumbaz — jiyak ustidagi yassiroq qubba */
  var profil = [
    new THREE.Vector2(0.400, 0.000),
    new THREE.Vector2(0.397, 0.030),
    new THREE.Vector2(0.383, 0.090),
    new THREE.Vector2(0.352, 0.160),
    new THREE.Vector2(0.298, 0.228),
    new THREE.Vector2(0.213, 0.278),
    new THREE.Vector2(0.110, 0.303),
    new THREE.Vector2(0.000, 0.310)
  ];
  qosh(ich, new THREE.LatheGeometry(profil, 24), matoMat, 0, 0.135, 0);

  /* Jiyak bo‘ylab o‘n olti oq bodom naqshi */
  var bodomGeo = yassiNaqsh(bodomShakli(0.026, 0.088), 0.007, 0.088);
  for (var i = 0; i < 16; i++) {
    var a = (i / 16) * Math.PI * 2;
    var nx = Math.cos(a), nz = Math.sin(a);
    var bodom = qosh(ich, bodomGeo, oqMat, nx * 0.408, 0.066, nz * 0.408);
    yonaltir(bodom, nx, 0, nz);
  }

  /* Jiyak ustidagi ingichka oq chiziq — naqshni ajratib turadi */
  var chiziq = qosh(ich, new THREE.TorusGeometry(0.402, 0.0055, 8, 24), oqMat, 0, 0.128, 0);
  chiziq.rotation.x = Math.PI / 2;

  /* Gumbaz radiusi berilgan balandlikda — bezaklarni sirtga yopishtirish uchun */
  function gumbazR(y) {
    var t = y - 0.135;
    for (var i = 0; i < profil.length - 1; i++) {
      var a = profil[i], b = profil[i + 1];
      if (t >= a.y && t <= b.y) {
        return a.x + (b.x - a.x) * (t - a.y) / Math.max(1e-6, b.y - a.y);
      }
    }
    return 0;
  }

  /* Gumbaz sirti bo‘ylab egilgan uchburchak yamoq geometriyasi */
  function egikUchburchak(y0, boy, yarimEn, ustlik) {
    var N = 6, Mq = 6, poz = [], ind = [], i, j;
    for (i = 0; i <= N; i++) {
      var v = i / N;
      var y = y0 + v * boy;
      var r = gumbazR(y) + ustlik;
      var en = yarimEn * (1 - v);
      for (j = 0; j <= Mq; j++) {
        var a = (j / Mq - 0.5) * 2 * (en / Math.max(r, 0.01));
        poz.push(Math.cos(a) * r, y, Math.sin(a) * r);
      }
    }
    for (i = 0; i < N; i++) {
      for (j = 0; j < Mq; j++) {
        var A = i * (Mq + 1) + j, B = A + 1, C = A + Mq + 1, D = C + 1;
        ind.push(A, C, B, B, C, D);
      }
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(poz, 3));
    g.setIndex(ind);
    g.computeVertexNormals();
    return g;
  }

  /* Gumbazdagi to‘rtta uchburchak bezak (qalampir naqsh) */
  var bezakMat = new THREE.MeshStandardMaterial({
    color: RANG.doppiOq, roughness: 0.8, metalness: 0, side: THREE.DoubleSide
  });
  var uchGeo = egikUchburchak(0.185, 0.135, 0.062, 0.004);
  for (var u = 0; u < 4; u++) {
    var bezak = qosh(ich, uchGeo, bezakMat, 0, 0, 0);
    bezak.rotation.y = (u / 4) * Math.PI * 2 + Math.PI / 4;
  }

  /* Gumbaz cho‘qqisidagi kichik tugma */
  var choqqi = qosh(ich, new THREE.SphereGeometry(0.028, 10, 8), oqMat, 0, 0.443, 0);
  choqqi.scale.set(1, 0.6, 1);

  return tayyorla(ich, 1.15);
}

/* =========================================================
   10. OLMA — «Olma menda» o‘yini
   Qizil olma: yuqori va pastki chuqurchali tanasi, egik bandi va
   bitta yashil bargi (tomiri bilan).
   ========================================================= */
export function olmaYasa() {
  var ich = new THREE.Group();
  var olmaMat = mat(RANG.olma, 0.45);
  var yonMat  = mat(RANG.olmaYon, 0.45);
  var bandMat = mat(RANG.band, 0.9);
  var bargMat = mat(RANG.barg, 0.7);

  /* Tana — olma siluetini beruvchi aylanma profil */
  var profil = [
    new THREE.Vector2(0.000, 0.055),
    new THREE.Vector2(0.085, 0.012),
    new THREE.Vector2(0.190, 0.000),
    new THREE.Vector2(0.310, 0.055),
    new THREE.Vector2(0.395, 0.165),
    new THREE.Vector2(0.425, 0.300),
    new THREE.Vector2(0.405, 0.435),
    new THREE.Vector2(0.330, 0.545),
    new THREE.Vector2(0.215, 0.610),
    new THREE.Vector2(0.115, 0.605),
    new THREE.Vector2(0.048, 0.565),
    new THREE.Vector2(0.000, 0.570)
  ];
  var tana = qosh(ich, new THREE.LatheGeometry(profil, 22), olmaMat, 0, 0, 0);
  tana.userData.yerda = true;

  /* Yorug‘ yonbag‘ir — olmaning quyoshda pishgan tomoni */
  var yonbagir = qosh(ich, new THREE.SphereGeometry(0.30, 14, 12), yonMat, 0.17, 0.315, 0.14);
  yonbagir.scale.set(0.62, 0.72, 0.62);

  /* Band — biroz egilgan ingichka novda */
  var bandYoli = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.00, 0.560, 0),
    new THREE.Vector3(0.015, 0.650, 0.01),
    new THREE.Vector3(0.045, 0.735, 0.02),
    new THREE.Vector3(0.085, 0.790, 0.01)
  ]);
  qosh(ich, new THREE.TubeGeometry(bandYoli, 14, 0.019, 8, false), bandMat);

  /* Barg — bandning yonida, tomiri bilan */
  var bargGeo = yassiNaqsh(bodomShakli(0.105, 0.270), 0.011, 0.270);
  var barg = qosh(ich, bargGeo, bargMat, -0.115, 0.735, 0.045);
  barg.rotation.set(-1.15, 0.35, -0.55);
  var tomir = qosh(ich, new THREE.BoxGeometry(0.010, 0.230, 0.014), bandMat,
    -0.115, 0.738, 0.045);
  tomir.rotation.copy(barg.rotation);
  tayoq(ich, bandMat,
    new THREE.Vector3(0.030, 0.700, 0.012), new THREE.Vector3(-0.075, 0.700, 0.035),
    0.011, 0.009, 8);

  return tayyorla(ich, 1.05);
}

/* =========================================================
   11. KO‘ZBOG‘ICH RO‘MOL — «Bekinmachoq» va ko‘z bog‘lash o‘yinlari
   Uzunasiga buklangan mato ro‘mol: yerda yumshoq to‘lqin bo‘lib yotadi,
   o‘rtasida tuguni, ikki uchida uchburchak burchagi va usti bo‘ylab
   milliy romb naqshlari bor.
   ========================================================= */
export function romolYasa() {
  var ich = new THREE.Group();
  var matoMat = mat(RANG.matoQizil, 0.95);
  var toqMat  = mat(0x9C3B22, 0.95);
  var kokMat  = mat(RANG.matoKok, 0.9);
  var oqMat   = mat(0xF2E6D2, 0.9);

  /* Buklangan mato o‘qi — yumshoq to‘lqin */
  var yol = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.470, 0.080, 0.215),
    new THREE.Vector3(-0.245, 0.076, -0.095),
    new THREE.Vector3(0.000, 0.082, 0.030),
    new THREE.Vector3(0.245, 0.076, 0.190),
    new THREE.Vector3(0.470, 0.080, -0.085)
  ]);

  /* Mato yassi — shuning uchun quvur balandligi siqiladi */
  var lenta = qosh(ich, new THREE.TubeGeometry(yol, 56, 0.082, 12, false), matoMat);
  lenta.scale.set(1, 0.52, 1);
  lenta.userData.yerda = true;

  /* Buklama qirralari — matoning ikki chekkasi bo‘ylab ingichka jiyak */
  var tolalar = eshilganTolalar(yol, 2, 0, 0.078, 56);
  for (var i = 0; i < tolalar.length; i++) {
    var jiyak = qosh(ich, new THREE.TubeGeometry(tolalar[i], 56, 0.014, 8, false), toqMat);
    jiyak.scale.set(1, 0.52, 1);
    jiyak.userData.yerda = true;
  }

  /* Usti bo‘ylab milliy romb naqshlari */
  var romb = new THREE.Shape();
  romb.moveTo(0, -0.058);
  romb.lineTo(0.042, 0);
  romb.lineTo(0, 0.058);
  romb.lineTo(-0.042, 0);
  romb.closePath();
  var rombGeo = yassiNaqsh(romb, 0.008, 0);
  var yuqori = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 1, 0));
  for (var k = 1; k < 12; k++) {
    var t = k / 12;
    var p = yol.getPointAt(t);
    var yon = yol.getTangentAt(t);
    var naqsh = qosh(ich, rombGeo, (k % 2 === 0) ? kokMat : oqMat, p.x, p.y + 0.046, p.z);
    var burchak = Math.atan2(yon.x, yon.z);
    naqsh.quaternion.copy(
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), burchak)
    ).multiply(yuqori);
  }

  /* O‘rtadagi tugun — ro‘mol bog‘langan joyi */
  var op = yol.getPointAt(0.5);
  var oy = yol.getTangentAt(0.5);
  var tugun = qosh(ich, new THREE.TorusGeometry(0.078, 0.036, 8, 16), matoMat,
    op.x, op.y + 0.006, op.z);
  tugun.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), oy);
  tugun.scale.set(1, 0.80, 1);
  var tugunShar = qosh(ich, new THREE.SphereGeometry(0.062, 12, 10), toqMat,
    op.x, op.y + 0.014, op.z);
  tugunShar.scale.set(1, 0.72, 1);

  /* Ikki uchidagi ochilib qolgan uchburchak burchaklar */
  var uchGeo = yassiNaqsh(uchburchakShakli(0.215, 0.250), 0.012, 0.250);
  var uchlar = [
    { p: yol.getPointAt(0), y: yol.getTangentAt(0), s: -1 },
    { p: yol.getPointAt(1), y: yol.getTangentAt(1), s: 1 }
  ];
  for (var u = 0; u < uchlar.length; u++) {
    var e = uchlar[u];
    var burchakU = Math.atan2(-e.y.x * e.s, -e.y.z * e.s);
    var burchakMesh = qosh(ich, uchGeo, matoMat,
      e.p.x + e.y.x * e.s * 0.150, 0.014, e.p.z + e.y.z * e.s * 0.150);
    burchakMesh.quaternion.copy(
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), burchakU)
    ).multiply(yuqori);
    burchakMesh.userData.yerda = true;
    var chetNaqsh = qosh(ich, rombGeo, oqMat,
      e.p.x + e.y.x * e.s * 0.115, 0.032, e.p.z + e.y.z * e.s * 0.115);
    chetNaqsh.quaternion.copy(burchakMesh.quaternion);
  }

  return tayyorla(ich, 1.25);
}

/* =========================================================
   BUYUMLAR RO‘YXATI
   Har bir yozuvda: buyum nomi, u ishlatiladigan o‘yin nomi,
   modelni yasovchi funksiya va bir jumlalik izoh.
   ========================================================= */
export const OYIN_BUYUMLARI = {
  terak: {
    nom: 'Oq terak',
    oyin: '«Oq terakmi, ko‘k terak?»',
    yasa: function () { return terakYasa(true); },
    izoh: 'Och kulrang tanali, kumushrang bargli baland terak — o‘yinda ikki saf bolalar bir-biridan shu daraxt nomini so‘raydi.'
  },
  kokTerak: {
    nom: 'Ko‘k terak',
    oyin: '«Oq terakmi, ko‘k terak?»',
    yasa: function () { return terakYasa(false); },
    izoh: 'Jigarrang tanali, to‘q yashil bargli terak — o‘yinda qarshi safning ramzi bo‘lib xizmat qiladi.'
  },
  junTop: {
    nom: 'Jun to‘p',
    oyin: '«Jun to‘p»',
    yasa: junTopYasa,
    izoh: 'Qo‘y junidan qavat-qavat o‘ralib yasalgan yengil to‘p — bolalar uni tepib va otib o‘ynaydi.'
  },
  chimTop: {
    nom: 'Chim to‘p',
    oyin: '«Chim to‘p»',
    yasa: chimTopYasa,
    izoh: 'Ildizi bilan olingan chimdan yumaloqlab yasalgan to‘p — dala va yaylovda tayyorlanadigan eng oddiy o‘yin buyumi.'
  },
  qilich: {
    nom: 'Yog‘och qilich',
    oyin: '«Qilich jangi»',
    yasa: qilichYasa,
    izoh: 'Yassi tig‘i, gardasi va o‘ram tutqichi bo‘lgan yog‘och qilich — bolalarni chaqqonlik va mardlikka o‘rgatadi.'
  },
  chavgon: {
    nom: 'Chavgon tayog‘i',
    oyin: '«Chavgon»',
    yasa: chavgonYasa,
    izoh: 'Uchi egilgan uzun yog‘och tayoq — otliq yoki piyoda o‘yinchilar u bilan to‘pni darvozaga haydaydi.'
  },
  arqon: {
    nom: 'Arqon',
    oyin: '«Tortishmachoq»',
    yasa: arqonYasa,
    izoh: 'Uch tolasi eshilgan qalin arqon — ikki guruh bolalar kuch sinashib bir-birini tortadi.'
  },
  ot: {
    nom: 'Ot',
    oyin: '«Otliqlar poygasi», «Tuya poyga»',
    yasa: otYasa,
    izoh: 'Poyga oti — bolalarda jasorat, chaqqonlik va hayvonga mehr tuyg‘usini tarbiyalaydigan o‘yinlarning asosiy sherigi.'
  },
  qoy: {
    nom: 'Qo‘y',
    oyin: '«Podachi»',
    yasa: qoyYasa,
    izoh: 'Oq junli qo‘y — «Podachi» o‘yinida podani bo‘riga oldirmay saqlash mashqi shu jonivor timsolida o‘tadi.'
  },
  doppi: {
    nom: 'Do‘ppi',
    oyin: '«O‘rta qo‘limni top»',
    yasa: doppiYasa,
    izoh: 'Bodom naqshli milliy do‘ppi — o‘yinda buyum uning ostiga yashiriladi va o‘yinchi qaysi biri ekanini topadi.'
  },
  olma: {
    nom: 'Olma',
    oyin: '«Olma menda»',
    yasa: olmaYasa,
    izoh: 'Bandi va bargi bilan uzilgan qizil olma — suvda o‘ynaladigan bu o‘yinda bolalar uni bir-biridan yashiradi.'
  },
  romol: {
    nom: 'Ko‘zbog‘ich ro‘mol',
    oyin: '«Bekinmachoq», ko‘z bog‘lash',
    yasa: romolYasa,
    izoh: 'Naqshli, uzunasiga buklangan mato ro‘mol — quvlovchining ko‘zini bog‘lash uchun ishlatiladi.'
  }
};
