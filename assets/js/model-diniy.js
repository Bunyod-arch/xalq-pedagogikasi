/* =========================================================
   ILM DARGOHI BUYUMLARI — 3D modellar (9-modul)
   «Xalq pedagogikasida diniy ta’limotlar»

   MAVZUGA HURMAT BILAN YONDASHUV
   Bu faylda muqaddas matn tasvirlanmaydi, yozuv o‘qilmaydi va
   hech qanday ilohiy timsol yasalmaydi. Faqat MODDIY BUYUMLAR
   va ME’MORCHILIK unsurlari modellashtiriladi: lavh, qamish
   qalam, siyohdon, qalamdon, xattotlik varag‘i (naqsh mashqi),
   kitob, minora, gumbaz, peshtoq, koshin, sham va shu kabilar.
   Xattotlik varag‘idagi chiziqlar — o‘qiladigan matn emas, balki
   xattot mashq qiladigan mavhum islimiy naqsh unsurlari.

   MAZMUN: darslik matnida «Iqra’ — o‘qi!» amri, «qalam vositasi
   bilan ta’lim berdi» oyati, Imom al-Buxoriyning «Al-Jome’
   as-sahih»i va «al-kutub as-sitta» (olti kitob), madrasa va
   mudarris, ustozga hurmat hamda adab masalalari tilga olinadi.
   Har bir buyum shu mazmunning moddiy izohi bo‘lib xizmat qiladi.

   SHARTNOMA (model-maishiy.js, model-hunar.js bilan bir xil):
     · har funksiya THREE.Group qaytaradi;
     · eng katta o‘lchami 1.0–1.5 birlik;
     · pastki nuqtasi y = 0 da turadi;
     · xz bo‘yicha markazi (0,0) da bo‘ladi.
   ========================================================= */
import * as THREE from '../vendor/three.module.min.js';

import { kitobYasa, qalamYasa } from './model-maishiy.js';
import { qumgonYasa, gilamYasa, ganchYasa } from './model-hunar.js';

/* ---------------------------------------------------------
   RANGLAR — madrasa va xattotlik palitrasi
   --------------------------------------------------------- */
export const RANG = {
  gisht:      0xC49A6C,   // pishiq g‘isht
  gishtTiq:   0xA57A4E,   // g‘isht chokidagi soya
  gishtOch:   0xD8B489,   // quyoshda oqargan g‘isht
  koshinKok:  0x1B6FA8,   // koshin ko‘ki (Samarqand feruzasi)
  feruza:     0x2E9BB8,   // feruza gumbaz
  feruzaTiq:  0x1C6E85,   // gumbaz qovurg‘asi soyasi
  lojuvard:   0x1B3B6F,   // lojuvard — to‘q ko‘k
  oq:         0xFBF7F0,   // oq koshin, qog‘oz
  oltin:      0xD4A24C,   // zar, jiyak
  yogoch:     0x8A6A44,   // yong‘oq yog‘och (lavh, qalamdon)
  yogochTiq:  0x5E4526,   // to‘q yog‘och
  yogochOch:  0xC2A173,   // qamish, ochiq yog‘och
  charm:      0x7A3B2E,   // kitob muqovasi charmi
  charmKok:   0x24406B,   // ko‘k charm muqova
  charmYash:  0x2F5B3E,   // yashil charm muqova
  siyoh:      0x241A12,   // siyoh
  mis:        0xB87333,   // mis, jez
  kumush:     0xC9CDD4,   // kumush
  sham:       0xF1E4C4,   // sham mumi
  olov:       0xFFB347,   // alanga
  mato:       0xC1502E,   // joynamoz matosi
  matoKok:    0x24406B
};

/* ---------------------------------------------------------
   MATERIALLAR
   --------------------------------------------------------- */
function gishtMat(rang) {
  return new THREE.MeshStandardMaterial({ color: rang || RANG.gisht, roughness: 0.92, metalness: 0.02 });
}
function koshinMat(rang) {
  return new THREE.MeshStandardMaterial({ color: rang || RANG.koshinKok, roughness: 0.22, metalness: 0.08 });
}
function yogochMat(rang) {
  return new THREE.MeshStandardMaterial({ color: rang || RANG.yogoch, roughness: 0.70, metalness: 0.04 });
}
function qogozMat(ikkiTomon) {
  return new THREE.MeshStandardMaterial({
    color: 0xF6EEDC, roughness: 0.94, metalness: 0.0,
    side: ikkiTomon ? THREE.DoubleSide : THREE.FrontSide
  });
}
function charmMat(rang) {
  return new THREE.MeshStandardMaterial({ color: rang || RANG.charm, roughness: 0.66, metalness: 0.05 });
}
function metallMat(rang, gadir) {
  return new THREE.MeshStandardMaterial({
    color: rang || RANG.mis, roughness: gadir == null ? 0.32 : gadir, metalness: 0.85
  });
}
function matoMat(rang, ikkiTomon) {
  return new THREE.MeshStandardMaterial({
    color: rang, roughness: 0.95, metalness: 0.0,
    side: ikkiTomon ? THREE.DoubleSide : THREE.FrontSide
  });
}
function oddiy(rang, gadir) {
  return new THREE.MeshStandardMaterial({ color: rang, roughness: gadir == null ? 0.6 : gadir, metalness: 0.03 });
}

/* ---------------------------------------------------------
   GEOMETRIK YORDAMCHILAR
   --------------------------------------------------------- */
function charx(nuqtalar, segment, material) {
  var v = nuqtalar.map(function (n) { return new THREE.Vector2(n[0], n[1]); });
  var geo = new THREE.LatheGeometry(v, segment || 26);
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, material);
}
function halqa(radius, quvur, y, material, segment) {
  var m = new THREE.Mesh(new THREE.TorusGeometry(radius, quvur, 8, segment || 26), material);
  m.rotation.x = Math.PI / 2;
  m.position.y = y;
  return m;
}
function plita(en, qalin, boy, material, x, y, z) {
  var m = new THREE.Mesh(new THREE.BoxGeometry(en, qalin, boy), material);
  m.position.set(x || 0, y || 0, z || 0);
  return m;
}
function disk(radius, qalin, material, x, y, z, qirra) {
  var m = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, qalin, qirra || 22), material);
  m.position.set(x || 0, y || 0, z || 0);
  return m;
}
function donacha(radius, material, x, y, z) {
  var m = new THREE.Mesh(new THREE.SphereGeometry(radius, 10, 7), material);
  m.position.set(x || 0, y || 0, z || 0);
  return m;
}
function aylanaBoylab(guruh, soni, radius, y, yasagich) {
  for (var i = 0; i < soni; i++) {
    var burchak = (i / soni) * Math.PI * 2;
    var m = yasagich(i, burchak);
    if (!m) continue;
    m.position.set(Math.cos(burchak) * radius, y, Math.sin(burchak) * radius);
    guruh.add(m);
  }
}
function tasodif(urugʻ) {
  var s = urugʻ || 1;
  return function () {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

/* G‘isht qatorlari — devor va poydevor yuzasini jonlantiradi.
   Har qator yarim g‘ishtga surilib, haqiqiy terim naqshi chiqadi. */
function gishtQatorlari(guruh, en, bal, z, qalin, material2) {
  var gEn = 0.16, gBal = 0.075, oraliq = 0.012;
  var qator = Math.max(1, Math.floor(bal / (gBal + oraliq)));
  for (var r = 0; r < qator; r++) {
    var y = gBal / 2 + r * (gBal + oraliq);
    if (y > bal - gBal / 2) break;
    var surilma = (r % 2) * (gEn / 2);
    var soni = Math.floor(en / (gEn + oraliq));
    for (var c = 0; c <= soni; c++) {
      var x = -en / 2 + gEn / 2 + surilma + c * (gEn + oraliq);
      if (x > en / 2 - gEn / 2 + 0.02) continue;
      guruh.add(plita(gEn, gBal, qalin, material2, x, y, z));
    }
  }
}

/* SIVRI YOY — ikki markazli o‘tkir kamar (Sharq me’morchiligi).
   yarimEn — yoy tagining yarim kengligi. Kichik g‘isht bo‘laklaridan
   yig‘iladi, shuning uchun kamar chetlari ham g‘ishtin ko‘rinadi. */
function sivriYoy(yarimEn, qalin, material, bolakSoni, qalinlik) {
  var g = new THREE.Group();
  var R = yarimEn * 1.7;
  var d = R - yarimEn;
  var tMax = Math.acos(Math.min(1, d / R));
  var n = bolakSoni || 16;
  var q = qalinlik || 0.10;

  [1, -1].forEach(function (yon) {
    for (var i = 0; i < n; i++) {
      var t = (i + 0.5) / n * tMax;
      var x = (-d + R * Math.cos(t)) * yon;
      var y = R * Math.sin(t);
      var uzun = (tMax / n) * R * 1.18;
      var b = plita(q, uzun, qalin, material, x, y, 0);
      // Har bo‘lak yoy urinmasi bo‘ylab buriladi — g‘isht terimi yoy chizadi.
      b.rotation.z = yon * t;
      g.add(b);
    }
  });
  return g;
}

function soyaBer(guruh, yassi) {
  guruh.traverse(function (n) {
    if (n.isMesh) {
      n.castShadow = true;
      if (yassi) n.receiveShadow = true;
    }
  });
}
function tayyorla(ich, kerakOlcham, yassi, nom) {
  soyaBer(ich, yassi);
  var tashqi = new THREE.Group();
  tashqi.name = nom || 'diniy';
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
   ————————— MADRASA ME’MORCHILIGI —————————
   ========================================================= */

/* 1. POYDEVOR — madrasa qad rostlaydigan g‘ishtin supa.
   Pastki keng qavat, ustida torroq qavat va tarashlangan
   marmar labi. Bunyodkorlik shu yerdan boshlanadi. */
export function poydevorYasa() {
  var g = new THREE.Group();
  var g1 = gishtMat(RANG.gisht), g2 = gishtMat(RANG.gishtTiq), g3 = gishtMat(RANG.gishtOch);

  // Ikki pog‘ona.
  g.add(plita(1.50, 0.16, 1.05, g2, 0, 0.08, 0));
  g.add(plita(1.34, 0.15, 0.92, g1, 0, 0.235, 0));

  // Yon yuzalardagi g‘isht terimi.
  [1, -1].forEach(function (yon) {
    var old = new THREE.Group();
    gishtQatorlari(old, 1.30, 0.145, 0, 0.02, g3);
    old.position.set(0, 0.163, yon * 0.462);
    old.rotation.y = yon > 0 ? 0 : Math.PI;
    g.add(old);
  });

  // Ustki marmar lab.
  g.add(plita(1.42, 0.045, 0.99, oddiy(0xEDE6D6, 0.5), 0, 0.333, 0));
  // Lab bo‘ylab koshin chizig‘i.
  for (var i = 0; i < 13; i++) {
    var x = -0.63 + i * 0.105;
    g.add(plita(0.075, 0.022, 0.02, koshinMat(i % 2 ? RANG.koshinKok : RANG.oq), x, 0.345, 0.503));
    g.add(plita(0.075, 0.022, 0.02, koshinMat(i % 2 ? RANG.oq : RANG.koshinKok), x, 0.345, -0.503));
  }
  // Burchak toshlari.
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (b) {
    g.add(plita(0.13, 0.36, 0.13, g2, b[0] * 0.665, 0.18, b[1] * 0.45));
  });

  return tayyorla(g, 1.50, true, 'poydevor');
}

/* 2. G‘ISHT DEVOR — madrasa hovlisini o‘rab turuvchi devor:
   g‘isht terimi, ichida sivri kamarli tokcha va tepasida
   koshin friz. */
export function devorYasa() {
  var g = new THREE.Group();
  var g1 = gishtMat(RANG.gisht), g2 = gishtMat(RANG.gishtTiq), g3 = gishtMat(RANG.gishtOch);

  var en = 1.40, bal = 0.92, qalin = 0.22;

  // Devor tanasi.
  g.add(plita(en, bal, qalin, g1, 0, bal / 2, 0));

  // Old yuzadagi g‘isht terimi.
  var terim = new THREE.Group();
  gishtQatorlari(terim, en - 0.04, bal - 0.08, 0, 0.022, g3);
  terim.position.set(0, 0.02, qalin / 2 + 0.004);
  g.add(terim);

  // Ikkita sivri kamarli tokcha.
  [-0.40, 0.40].forEach(function (x) {
    var tokcha = new THREE.Group();
    // Chuqurcha zamini.
    tokcha.add(plita(0.30, 0.42, 0.04, g2, 0, 0.21, 0));
    // Kamar.
    var yoy = sivriYoy(0.155, 0.05, g2, 12, 0.055);
    yoy.position.y = 0.42;
    tokcha.add(yoy);
    // Kamar ichidagi lojuvard fon.
    tokcha.add(plita(0.24, 0.20, 0.02, koshinMat(RANG.lojuvard), 0, 0.46, -0.01));
    tokcha.position.set(x, 0, qalin / 2 + 0.012);
    g.add(tokcha);
  });

  // Ustki koshin friz.
  for (var i = 0; i < 16; i++) {
    var x2 = -en / 2 + 0.05 + i * 0.09;
    g.add(plita(0.07, 0.09, 0.026, koshinMat(i % 2 ? RANG.koshinKok : RANG.oq), x2, bal - 0.10, qalin / 2 + 0.008));
  }
  // Devor toji — tishli parapet.
  g.add(plita(en + 0.06, 0.05, qalin + 0.05, g2, 0, bal + 0.025, 0));
  for (var k = 0; k < 9; k++) {
    g.add(plita(0.09, 0.09, qalin, g1, -en / 2 + 0.08 + k * 0.16, bal + 0.095, 0));
  }
  return tayyorla(g, 1.45, true, 'devor');
}

/* 3. PESHTOQ — madrasaning bosh darvozasi: ikki qalin ustun,
   o‘tkir kamarli ravoq, ravoq atrofidagi to‘g‘ri burchakli
   ramka va koshin naqshli yelkalar. Ilm dargohining yuzi. */
export function peshtoqYasa() {
  var g = new THREE.Group();
  var g1 = gishtMat(RANG.gisht), g2 = gishtMat(RANG.gishtTiq);
  var kok = koshinMat(RANG.koshinKok), oq = koshinMat(RANG.oq);
  var loj = koshinMat(RANG.lojuvard), zar = metallMat(RANG.oltin, 0.35);

  var en = 1.24, bal = 1.60, qalin = 0.30;

  // Yon ustunlar (pillapoyalar).
  [-1, 1].forEach(function (yon) {
    g.add(plita(0.30, bal, qalin, g1, yon * (en / 2 - 0.15), bal / 2, 0));
    // Ustunlardagi koshin tasmasi.
    for (var i = 0; i < 9; i++) {
      g.add(plita(0.20, 0.055, 0.02, i % 2 ? kok : oq,
        yon * (en / 2 - 0.15), 0.22 + i * 0.15, qalin / 2 + 0.006));
    }
  });

  // Yuqori bog‘lam — ravoq ustidagi to‘siq.
  g.add(plita(en, 0.30, qalin, g1, 0, bal - 0.15, 0));

  // Ichki ravoq bo‘shlig‘i fon devori (chuqurlik hissi).
  g.add(plita(0.64, bal - 0.30, 0.05, g2, 0, (bal - 0.30) / 2, -qalin / 2 + 0.03));

  // O‘tkir kamar — g‘ishtin bo‘laklardan.
  var kamar = sivriYoy(0.32, qalin - 0.04, g2, 18, 0.085);
  kamar.position.y = 0.86;
  g.add(kamar);
  // Kamar chetidagi zar jiyak.
  var jiyak = sivriYoy(0.355, 0.03, zar, 18, 0.045);
  jiyak.position.set(0, 0.86, qalin / 2 - 0.01);
  g.add(jiyak);

  // Ramka — ravoqni o‘rab turuvchi to‘g‘ri burchakli hoshiya.
  var ramkaMat = koshinMat(RANG.oq);
  [-1, 1].forEach(function (yon) {
    g.add(plita(0.055, bal - 0.06, 0.02, ramkaMat, yon * 0.455, (bal - 0.06) / 2, qalin / 2 + 0.008));
  });
  g.add(plita(0.965, 0.055, 0.02, ramkaMat, 0, bal - 0.055, qalin / 2 + 0.008));
  // Hoshiya ichidagi ko‘k geometrik naqsh.
  for (var k = 0; k < 11; k++) {
    var y = 0.10 + k * 0.135;
    if (y > bal - 0.14) break;
    [-1, 1].forEach(function (yon) {
      var yulduz = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.016, 8), loj);
      yulduz.rotation.x = Math.PI / 2;
      yulduz.position.set(yon * 0.455, y, qalin / 2 + 0.020);
      g.add(yulduz);
    });
  }

  // Yelkalar (spandrel) — kamar bilan ramka orasidagi koshin uchburchak.
  [-1, 1].forEach(function (yon) {
    var yelka = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.02, 6), loj);
    yelka.rotation.x = Math.PI / 2;
    yelka.position.set(yon * 0.36, bal - 0.30, qalin / 2 + 0.014);
    g.add(yelka);
    var ich = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.02, 6), zar);
    ich.rotation.x = Math.PI / 2;
    ich.position.set(yon * 0.36, bal - 0.30, qalin / 2 + 0.024);
    g.add(ich);
  });

  // Darvoza — yog‘och tavaqalar.
  var eshik = plita(0.56, 0.72, 0.045, yogochMat(RANG.yogochTiq), 0, 0.36, -qalin / 2 + 0.09);
  g.add(eshik);
  g.add(plita(0.02, 0.72, 0.05, yogochMat(0x3E2C16), 0, 0.36, -qalin / 2 + 0.115));
  for (var m = 0; m < 4; m++) {
    [-1, 1].forEach(function (yon) {
      g.add(donacha(0.020, metallMat(RANG.mis, 0.4), yon * 0.14, 0.14 + m * 0.18, -qalin / 2 + 0.115));
    });
  }

  // Tepadagi tishli parapet.
  for (var p = 0; p < 8; p++) {
    g.add(plita(0.10, 0.08, qalin, g2, -en / 2 + 0.09 + p * 0.15, bal + 0.04, 0));
  }
  return tayyorla(g, 1.50, true, 'peshtoq');
}

/* 4. GUMBAZ — madrasa xonaqohining feruza gumbazi: silindrsiman
   baraban, unda kamarli darchalar, tepasida qovurg‘ali gumbaz
   va oltin alam. */
export function gumbazYasa() {
  var g = new THREE.Group();
  var g1 = gishtMat(RANG.gisht);

  // Sakkiz qirrali asos.
  var asos = new THREE.Mesh(new THREE.CylinderGeometry(0.60, 0.64, 0.22, 8), g1);
  asos.position.y = 0.11;
  g.add(asos);

  // Baraban.
  var baraban = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.50, 0.44, 26), gishtMat(RANG.gishtOch));
  baraban.position.y = 0.44;
  g.add(baraban);
  // Barabandagi kamarli darchalar.
  aylanaBoylab(g, 10, 0.475, 0.46, function (i, a) {
    var d = new THREE.Group();
    d.add(plita(0.10, 0.20, 0.03, koshinMat(RANG.lojuvard), 0, 0, 0));
    var yoy = sivriYoy(0.052, 0.03, koshinMat(RANG.lojuvard), 6, 0.03);
    yoy.position.y = 0.10;
    d.add(yoy);
    d.rotation.y = -a + Math.PI / 2;
    return d;
  });
  // Baraban ustidagi zar tasma.
  g.add(halqa(0.492, 0.022, 0.645, metallMat(RANG.oltin, 0.35), 30));
  g.add(halqa(0.492, 0.022, 0.245, metallMat(RANG.oltin, 0.35), 30));

  // Gumbaz — biroz cho‘ziq feruza yarim shar.
  var gumbaz = new THREE.Mesh(
    new THREE.SphereGeometry(0.50, 30, 18, 0, Math.PI * 2, 0, Math.PI / 2),
    koshinMat(RANG.feruza)
  );
  gumbaz.scale.y = 1.16;
  gumbaz.position.y = 0.66;
  g.add(gumbaz);

  // Qovurg‘alar — gumbaz sirtidagi tik chiziqlar.
  for (var i = 0; i < 20; i++) {
    var a = (i / 20) * Math.PI * 2;
    var qov = new THREE.Mesh(new THREE.TorusGeometry(0.505, 0.014, 6, 20, Math.PI / 2), koshinMat(RANG.feruzaTiq));
    qov.rotation.y = a;
    qov.scale.y = 1.16;
    qov.position.y = 0.66;
    g.add(qov);
  }
  // Gumbaz etagidagi oq koshin halqa.
  g.add(halqa(0.505, 0.026, 0.685, koshinMat(RANG.oq), 30));

  // Alam — oltin cho‘qqi.
  var boyin = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.08, 12), metallMat(RANG.oltin, 0.3));
  boyin.position.y = 1.26;
  g.add(boyin);
  var shar = donacha(0.065, metallMat(RANG.oltin, 0.28), 0, 1.34, 0);
  g.add(shar);
  var uch = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.16, 10), metallMat(RANG.oltin, 0.28));
  uch.position.y = 1.46;
  g.add(uch);

  return tayyorla(g, 1.45, true, 'gumbaz');
}

/* 5. MINORA — azon aytiladigan va shahar uzra yo‘l ko‘rsatuvchi
   minora: keng poydevor, torayuvchi g‘ishtin tana, naqsh
   kamarlari, muqarnasli sharafa (aylanma ayvon) va kichik
   gumbazli fonus. */
export function minoraYasa() {
  var g = new THREE.Group();
  var g1 = gishtMat(RANG.gisht), g2 = gishtMat(RANG.gishtTiq), g3 = gishtMat(RANG.gishtOch);

  // Poydevor. (Group.add() guruhning o‘zini qaytaradi — shuning uchun
  // mesh alohida o‘zgaruvchiga olinadi, aks holda butun guruh suriladi.)
  var tag = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.34, 0.14, 16), g2);
  tag.position.y = 0.07;
  g.add(tag);
  var kunda = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.30, 0.16, 16), g1);
  kunda.position.y = 0.22;
  g.add(kunda);

  // Tana — yuqoriga torayadi.
  var tana = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.265, 1.52, 22), g1);
  tana.position.y = 1.06;
  g.add(tana);

  // Naqsh kamarlari — tana bo‘ylab besh tasma.
  [0.46, 0.80, 1.14, 1.46, 1.72].forEach(function (y, i) {
    var r = 0.265 - (y / 1.82) * 0.11;
    g.add(halqa(r + 0.014, 0.024, y, koshinMat(i % 2 ? RANG.koshinKok : RANG.oq), 24));
    // Tasmalar orasidagi g‘ishtin naqsh — chekma donachalar.
    aylanaBoylab(g, 14, r + 0.012, y + 0.14, function () {
      var d = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.045, 0.02), g3);
      return d;
    });
  });

  // Sharafa — muqarnasli aylanma ayvon.
  var muqarnas = new THREE.Group();
  for (var q = 0; q < 3; q++) {
    var r2 = 0.20 + q * 0.045;
    aylanaBoylab(muqarnas, 16, r2, q * 0.05, function () {
      var m = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), g3);
      m.rotation.x = Math.PI;
      return m;
    });
  }
  muqarnas.position.y = 1.86;
  g.add(muqarnas);
  // Ayvon polи va panjarasi.
  g.add(disk(0.30, 0.05, g2, 0, 2.02, 0, 20));
  aylanaBoylab(g, 16, 0.285, 2.12, function () {
    return new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.16, 6), g1);
  });
  g.add(halqa(0.285, 0.020, 2.20, koshinMat(RANG.koshinKok), 22));

  // Fonus — kichik ustunli chodir.
  var fonus = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.155, 0.30, 12), g1);
  fonus.position.y = 2.37;
  g.add(fonus);
  aylanaBoylab(g, 6, 0.145, 2.37, function () {
    var t = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.03), g3);
    return t;
  });

  // Kichik feruza gumbaz va alam.
  var kichik = new THREE.Mesh(
    new THREE.SphereGeometry(0.165, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    koshinMat(RANG.feruza)
  );
  kichik.scale.y = 1.05;
  kichik.position.y = 2.52;
  g.add(kichik);
  g.add(halqa(0.168, 0.018, 2.53, koshinMat(RANG.oq), 20));
  var alam = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.16, 8), metallMat(RANG.oltin, 0.3));
  alam.position.y = 2.78;
  g.add(alam);
  g.add(donacha(0.038, metallMat(RANG.oltin, 0.28), 0, 2.69, 0));

  return tayyorla(g, 1.50, true, 'minora');
}

/* 6. KOSHIN PANELI — madrasa devorini bezaydigan sirlangan
   sopol naqsh: sakkiz burchakli yulduz, girih to‘ri va
   chekkadagi islimiy hoshiya. */
export function koshinYasa() {
  var g = new THREE.Group();
  var oq = koshinMat(RANG.oq), kok = koshinMat(RANG.koshinKok);
  var loj = koshinMat(RANG.lojuvard), zar = metallMat(RANG.oltin, 0.36);
  var feruza = koshinMat(RANG.feruza);

  var en = 1.00, boy = 1.28, q = 0.07;

  // Zamin plita.
  g.add(plita(en, q, boy, gishtMat(RANG.gishtTiq), 0, q / 2, 0));
  g.add(plita(en - 0.05, 0.02, boy - 0.05, loj, 0, q + 0.005, 0));

  // Chekka hoshiya.
  var h = 0.075;
  [[0, boy / 2 - h / 2 - 0.025, en - 0.05, h], [0, -(boy / 2 - h / 2 - 0.025), en - 0.05, h]].forEach(function (a) {
    g.add(plita(a[2], 0.022, a[3], feruza, a[0], q + 0.016, a[1]));
  });
  [[en / 2 - h / 2 - 0.025, 0], [-(en / 2 - h / 2 - 0.025), 0]].forEach(function (a) {
    g.add(plita(h, 0.022, boy - 0.05 - 2 * h, feruza, a[0], q + 0.016, a[1]));
  });
  // Hoshiyadagi oq donalar.
  for (var i = 0; i < 12; i++) {
    var t2 = -0.55 + i * 0.10;
    g.add(plita(0.035, 0.024, 0.035, oq, t2, q + 0.028, boy / 2 - 0.062));
    g.add(plita(0.035, 0.024, 0.035, oq, t2, q + 0.028, -(boy / 2 - 0.062)));
  }

  // Markaziy sakkiz burchakli yulduz.
  var yulduz = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.026, 8), zar);
  yulduz.position.y = q + 0.020;
  g.add(yulduz);
  var yulduz2 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.026, 8), zar);
  yulduz2.rotation.y = Math.PI / 8;
  yulduz2.position.y = q + 0.020;
  g.add(yulduz2);
  var ich = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.175, 0.03, 8), kok);
  ich.position.y = q + 0.032;
  g.add(ich);
  var markaz = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.032, 8), oq);
  markaz.rotation.y = Math.PI / 8;
  markaz.position.y = q + 0.042;
  g.add(markaz);
  g.add(disk(0.035, 0.034, zar, 0, q + 0.05, 0, 12));

  // Girih to‘ri — panelning ikki uchidagi kichik ko‘pburchak rozetkalar.
  // aylanaBoylab qaytgan mesh pozitsiyasini o‘zi belgilaydi, shuning uchun
  // har bir rozetka alohida guruhga yig‘ilib, keyin o‘z o‘rniga suriladi.
  [0.42, -0.42].forEach(function (z) {
    var uch = new THREE.Group();
    aylanaBoylab(uch, 6, 0.20, 0, function (i, a) {
      var k = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.024, 6), i % 2 ? kok : feruza);
      k.rotation.y = a;
      return k;
    });
    uch.add(disk(0.055, 0.026, oq, 0, 0.002, 0, 6));
    uch.position.set(0, q + 0.020, z);
    g.add(uch);
  });

  return tayyorla(g, 1.40, true, 'koshin');
}

/* =========================================================
   ————————— HUJRA VA ILM ANJOMLARI —————————
   ========================================================= */

/* 7. LAVH — kitob qo‘yg‘ich (rahle). Ikki taxta X shaklida
   kesishadi, o‘rtada bo‘g‘in mixi bor, ustida ochiq kitob
   turadi. Kitobni yerga qo‘ymaslik — adab talabi. */
export function lavhYasa() {
  var g = new THREE.Group();
  var yog = yogochMat(RANG.yogoch), yogT = yogochMat(RANG.yogochTiq);

  // Ikki juft taxta — X shaklida.
  [[-1, 0.30], [1, -0.30]].forEach(function (p) {
    [-0.26, 0.26].forEach(function (z) {
      var taxta = plita(0.075, 0.86, 0.032, p[0] > 0 ? yog : yogT, 0, 0.43, z);
      taxta.rotation.x = 0;
      taxta.rotation.z = p[1];
      taxta.position.x = 0;
      g.add(taxta);
    });
  });
  // O‘rtadagi bo‘g‘in mixi.
  var mix = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.60, 10), metallMat(RANG.mis, 0.4));
  mix.rotation.x = Math.PI / 2;
  mix.position.y = 0.44;
  g.add(mix);
  [-1, 1].forEach(function (yon) {
    g.add(donacha(0.036, metallMat(RANG.oltin, 0.32), 0, 0.44, yon * 0.30));
  });

  // Yon o‘ymakor panjaralar.
  [-0.26, 0.26].forEach(function (z) {
    for (var i = 0; i < 3; i++) {
      var d = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.010, 6, 14), yogT);
      d.position.set((i - 1) * 0.10, 0.44 + (i === 1 ? 0.14 : 0.05), z);
      g.add(d);
    }
  });

  // Ustidagi ochiq kitob — ikki qanot.
  var muqova = charmMat(RANG.charmKok);
  [-1, 1].forEach(function (yon) {
    var qanot = plita(0.40, 0.024, 0.52, muqova, yon * 0.215, 0.90, 0);
    qanot.rotation.z = -yon * 0.26;
    qanot.position.y = 0.885 + 0.05;
    g.add(qanot);
    var varaq = plita(0.37, 0.030, 0.48, qogozMat(), yon * 0.212, 0.955, 0);
    varaq.rotation.z = -yon * 0.26;
    g.add(varaq);
    // Sahifadagi hoshiya — matn emas, faqat zar ramka.
    var ramka = plita(0.30, 0.006, 0.40, metallMat(RANG.oltin, 0.4), yon * 0.212, 0.973, 0);
    ramka.rotation.z = -yon * 0.26;
    g.add(ramka);
    var ich = plita(0.27, 0.006, 0.36, qogozMat(), yon * 0.212, 0.977, 0);
    ich.rotation.z = -yon * 0.26;
    g.add(ich);
  });
  // Kitob umurtqasi.
  var umurtqa = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.52, 10), muqova);
  umurtqa.rotation.x = Math.PI / 2;
  umurtqa.position.y = 0.925;
  g.add(umurtqa);

  return tayyorla(g, 1.35, true, 'lavh');
}

/* 8. AL-KUTUB AS-SITTA — «olti kitob». Darslikda sanalgan olti
   ishonchli hadis to‘plami: Imom al-Buxoriy, Imom Muslim,
   at-Termiziy, Abu Dovud, an-Nasoiy va Ibn Mojja asarlari.
   Har biri alohida rangdagi charm muqovada, zar bosma bilan. */
export function oltiKitobYasa() {
  var g = new THREE.Group();
  var ranglar = [RANG.charm, RANG.charmKok, RANG.charmYash, 0x6B3A6E, 0x8C5A22, 0x3E3A55];
  var zar = metallMat(RANG.oltin, 0.4);

  var y = 0;
  for (var i = 0; i < 6; i++) {
    var en = 0.86 - i * 0.035;
    var boy = 0.62 - i * 0.024;
    var qalin = 0.10 - i * 0.006;

    // Varaqlar to‘plami.
    var varaq = plita(en - 0.035, qalin - 0.022, boy - 0.03, qogozMat(), 0, y + qalin / 2, 0);
    varaq.rotation.y = (i % 2 ? 1 : -1) * 0.035;
    g.add(varaq);

    // Charm muqova — ust va ost.
    var m = charmMat(ranglar[i]);
    var ust = plita(en, 0.016, boy, m, 0, y + qalin - 0.008, 0);
    ust.rotation.y = varaq.rotation.y;
    g.add(ust);
    var ost = plita(en, 0.016, boy, m, 0, y + 0.008, 0);
    ost.rotation.y = varaq.rotation.y;
    g.add(ost);
    // Umurtqa.
    var um = plita(0.032, qalin, boy, m, -en / 2 + 0.016, y + qalin / 2, 0);
    um.rotation.y = varaq.rotation.y;
    g.add(um);

    // Zar bosma — muqovadagi medalyon va hoshiya (yozuv emas, naqsh).
    var med = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.008, 8), zar);
    med.rotation.y = Math.PI / 8;
    med.position.set(0, y + qalin, 0);
    g.add(med);
    var med2 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.010, 8), charmMat(ranglar[i]));
    med2.position.set(0, y + qalin + 0.004, 0);
    g.add(med2);
    // Hoshiya chiziqlari.
    [1, -1].forEach(function (yon) {
      var hz = plita(en - 0.09, 0.008, 0.012, zar, 0, y + qalin, yon * (boy / 2 - 0.045));
      hz.rotation.y = varaq.rotation.y;
      g.add(hz);
    });
    // Umurtqadagi bo‘g‘in halqalari.
    for (var k = 0; k < 3; k++) {
      g.add(plita(0.036, 0.006, 0.10, zar, -en / 2 + 0.016, y + qalin / 2, -0.18 + k * 0.18));
    }
    y += qalin + 0.006;
  }

  // Eng ustida yotgan zar qistirma (varaq belgisi).
  var lenta = plita(0.03, 0.006, 0.30, metallMat(RANG.oltin, 0.45), 0.12, y - 0.01, 0.26);
  g.add(lenta);

  return tayyorla(g, 1.30, true, 'oltiKitob');
}

/* 9. SIYOHDON — xattotning siyoh idishi: sopol tana, qopqoq,
   ustida kichik tugma va yon tomonida qalam tayanchi.
   «Qalam vositasi bilan ta’lim berdi» — ilm quroli. */
export function siyohdonYasa() {
  var g = new THREE.Group();
  var sirli = new THREE.MeshStandardMaterial({ color: 0x1E5E7A, roughness: 0.22, metalness: 0.12 });
  var oq = new THREE.MeshStandardMaterial({ color: RANG.oq, roughness: 0.3, metalness: 0.05 });

  // Tana — charxda aylangan bo‘yinli idish.
  var tana = charx([
    [0.00, 0.00], [0.26, 0.00], [0.30, 0.05], [0.34, 0.16],
    [0.32, 0.30], [0.26, 0.40], [0.24, 0.46], [0.245, 0.50],
    [0.225, 0.50], [0.22, 0.45], [0.235, 0.39], [0.295, 0.29],
    [0.315, 0.16], [0.275, 0.055], [0.00, 0.045]
  ], 28, sirli);
  g.add(tana);

  // Oq naqsh halqalari va donalari.
  g.add(halqa(0.325, 0.016, 0.22, oq, 26));
  aylanaBoylab(g, 12, 0.33, 0.13, function () {
    var d = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 6), oq);
    d.scale.set(0.8, 1, 0.35);
    return d;
  });

  // Qopqoq.
  var qopqoq = charx([
    [0.00, 0.00], [0.20, 0.00], [0.255, 0.02], [0.255, 0.055],
    [0.20, 0.06], [0.14, 0.10], [0.06, 0.135], [0.00, 0.14]
  ], 24, sirli);
  qopqoq.position.y = 0.50;
  g.add(qopqoq);
  g.add(halqa(0.252, 0.014, 0.535, metallMat(RANG.oltin, 0.32), 24));
  g.add(donacha(0.045, metallMat(RANG.oltin, 0.3), 0, 0.66, 0));

  // Yon tomondagi qalam tayanchi (mahbara qulog‘i).
  [-1, 1].forEach(function (yon) {
    var quloq = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.016, 8, 16), metallMat(RANG.mis, 0.38));
    quloq.rotation.y = Math.PI / 2;
    quloq.position.set(yon * 0.335, 0.30, 0);
    g.add(quloq);
  });

  // Ichidagi siyoh yuzasi.
  var siyoh = disk(0.20, 0.02, new THREE.MeshStandardMaterial({ color: RANG.siyoh, roughness: 0.18, metalness: 0.2 }), 0, 0.44, 0, 20);
  g.add(siyoh);

  return tayyorla(g, 1.15, true, 'siyohdon');
}

/* 10. QAMISH QALAM — xattot qalami. Qamish poyasi bo‘g‘inlari
   bilan, uchi qiya kesilgan va o‘rtasidan yorilgan; uchida
   siyoh izi. Yonida qalamtarosh pichoqchasi. */
export function qamishQalamYasa() {
  var g = new THREE.Group();
  var qamish = new THREE.MeshStandardMaterial({ color: RANG.yogochOch, roughness: 0.55, metalness: 0.04 });
  var qamishT = new THREE.MeshStandardMaterial({ color: 0x9A7A46, roughness: 0.6, metalness: 0.04 });

  var qalamG = new THREE.Group();

  // Poya.
  var poya = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.052, 1.30, 14), qamish);
  poya.position.y = 0.65;
  qalamG.add(poya);

  // Qamish bo‘g‘inlari.
  [0.30, 0.66, 1.02].forEach(function (y) {
    var b = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.035, 14), qamishT);
    b.position.y = y;
    qalamG.add(b);
  });

  // Qiya kesilgan uch.
  var uch = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.026, 0.20, 14), qamish);
  uch.position.y = 0.10;
  qalamG.add(uch);
  var qiya = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.14, 0.09), qamishT);
  qiya.rotation.z = 0.62;
  qiya.position.set(0.028, 0.045, 0);
  qalamG.add(qiya);
  // Uchdagi yoriq (shaqq).
  var yoriq = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.13, 0.05), qamishT);
  yoriq.position.y = 0.06;
  qalamG.add(yoriq);
  // Siyoh izi.
  var siyoh = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.07, 10),
    new THREE.MeshStandardMaterial({ color: RANG.siyoh, roughness: 0.3, metalness: 0.15 }));
  siyoh.rotation.x = Math.PI;
  siyoh.position.y = 0.035;
  qalamG.add(siyoh);

  // Qalam yotiq holatda — dasturxon ustida turgandek.
  qalamG.rotation.z = Math.PI / 2 - 0.12;
  qalamG.position.set(-0.55, 0.06, 0);
  g.add(qalamG);

  // Qalamtarosh — kichik yog‘och dastali pichoqcha.
  var dasta = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.055), yogochMat(RANG.yogochTiq));
  dasta.position.set(-0.10, 0.028, 0.26);
  dasta.rotation.y = 0.22;
  g.add(dasta);
  var tig = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.012, 0.045), metallMat(RANG.kumush, 0.24));
  tig.position.set(0.16, 0.028, 0.32);
  tig.rotation.y = 0.22;
  g.add(tig);

  // Qamish qirindilari — qalam yo‘nilgani belgisi.
  var t = tasodif(9);
  for (var i = 0; i < 5; i++) {
    var qir = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.008, 6, 12, Math.PI * 1.4), qamishT);
    qir.rotation.set(t() * 3, t() * 3, t() * 3);
    qir.position.set(0.30 + t() * 0.3, 0.012, -0.20 - t() * 0.2);
    g.add(qir);
  }

  return tayyorla(g, 1.35, true, 'qamishQalam');
}

/* 11. QALAMDON — qamish qalamlar va siyohdon saqlanadigan
   lakli qutича: sirg‘aluvchi qopqoq, bo‘yalgan islimiy naqsh,
   ichida ikki qalam. */
export function qalamdonYasa() {
  var g = new THREE.Group();
  var lak = new THREE.MeshStandardMaterial({ color: 0x3A2418, roughness: 0.28, metalness: 0.1 });
  var zar = metallMat(RANG.oltin, 0.4);

  var en = 1.10, boy = 0.24, bal = 0.20;

  // Tana — yumaloqlangan uchli quti.
  g.add(plita(en, bal, boy, lak, 0, bal / 2, 0));
  [-1, 1].forEach(function (yon) {
    var uch = new THREE.Mesh(new THREE.CylinderGeometry(boy / 2, boy / 2, bal, 18, 1, false, 0, Math.PI), lak);
    uch.rotation.x = -Math.PI / 2;
    uch.rotation.y = yon > 0 ? 0 : Math.PI;
    uch.position.set(yon * en / 2, bal / 2, 0);
    g.add(uch);
  });

  // Ustidagi zar hoshiya va naqsh medalyonlari.
  g.add(plita(en - 0.06, 0.008, boy - 0.05, zar, 0, bal + 0.002, 0));
  g.add(plita(en - 0.10, 0.010, boy - 0.09, lak, 0, bal + 0.006, 0));
  for (var i = 0; i < 5; i++) {
    var x = -0.40 + i * 0.20;
    var med = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.012, 8), zar);
    med.rotation.y = Math.PI / 8;
    med.position.set(x, bal + 0.010, 0);
    g.add(med);
    g.add(donacha(0.018, koshinMat(RANG.lojuvard), x, bal + 0.016, 0));
  }

  // Ochilgan qopqoq bo‘lagi — ichi ko‘rinsin.
  var qopqoq = plita(0.34, 0.022, boy + 0.03, lak, 0.36, bal + 0.028, 0);
  qopqoq.rotation.z = -0.08;
  g.add(qopqoq);
  g.add(plita(0.26, 0.010, boy - 0.06, zar, 0.36, bal + 0.042, 0));

  // Ichidagi ikki qamish qalam.
  [-0.02, 0.055].forEach(function (dz, i) {
    var q = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.034, 0.62, 10),
      new THREE.MeshStandardMaterial({ color: RANG.yogochOch, roughness: 0.55 }));
    q.rotation.z = Math.PI / 2;
    q.position.set(-0.22 + i * 0.03, bal - 0.03, dz);
    g.add(q);
    var uchi = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.09, 8),
      new THREE.MeshStandardMaterial({ color: RANG.siyoh, roughness: 0.4 }));
    uchi.rotation.z = -Math.PI / 2;
    uchi.position.set(-0.56 + i * 0.03, bal - 0.03, dz);
    g.add(uchi);
  });

  // Oyoqchalar.
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (b) {
    g.add(donacha(0.028, metallMat(RANG.mis, 0.4), b[0] * (en / 2 - 0.08), 0.012, b[1] * (boy / 2 - 0.05)));
  });

  return tayyorla(g, 1.35, true, 'qalamdon');
}

/* 12. XATTOTLIK VARAG‘I — mashq taxtasi ustidagi qog‘oz.
   DIQQAT: bu yerda o‘qiladigan matn yo‘q. Faqat xattot mashq
   qiladigan MAVHUM chiziq mashqlari, zar hoshiya va islimiy
   naqsh unsuri tasvirlangan — xattotlik san’atining shakli. */
export function xattotVaraqYasa() {
  var g = new THREE.Group();
  var taxta = yogochMat(RANG.yogochTiq);
  var zar = metallMat(RANG.oltin, 0.42);
  var loj = koshinMat(RANG.lojuvard);
  var chiziq = new THREE.MeshStandardMaterial({ color: 0x2E2116, roughness: 0.5, metalness: 0.05 });

  // Mashq taxtasi.
  g.add(plita(1.06, 0.05, 0.80, taxta, 0, 0.025, 0));
  [-1, 1].forEach(function (yon) {
    g.add(plita(1.10, 0.035, 0.05, yogochMat(RANG.yogoch), 0, 0.045, yon * 0.395));
  });

  // Qog‘oz varaq — biroz qiya qo‘yilgan.
  var varaqG = new THREE.Group();
  varaqG.add(plita(0.86, 0.012, 0.62, qogozMat(), 0, 0, 0));
  // Zar hoshiya.
  varaqG.add(plita(0.78, 0.006, 0.54, zar, 0, 0.008, 0));
  varaqG.add(plita(0.74, 0.006, 0.50, qogozMat(), 0, 0.012, 0));
  varaqG.add(plita(0.70, 0.005, 0.46, loj, 0, 0.015, 0));
  varaqG.add(plita(0.68, 0.005, 0.44, qogozMat(), 0, 0.018, 0));

  // MAVHUM MASHQ CHIZIQLARI — harf emas, faqat qalam yurishi:
  // to‘rt qator uzun to‘lqin va ular ostidagi nuqta ritmi.
  for (var q = 0; q < 4; q++) {
    var z = -0.15 + q * 0.10;
    var bolak = 14;
    for (var i = 0; i < bolak; i++) {
      var p = i / (bolak - 1);
      var x = -0.28 + p * 0.56;
      var egri = Math.sin(p * Math.PI * 2 + q * 0.9) * 0.022;
      var qal = 0.010 + 0.008 * Math.abs(Math.cos(p * Math.PI * 2 + q * 0.9));
      var s = plita(0.048, qal, 0.014, chiziq, x, 0.022 + qal / 2, z + egri);
      s.rotation.y = Math.cos(p * Math.PI * 2 + q * 0.9) * 0.5;
      varaqG.add(s);
    }
    // Nuqta ritmi.
    for (var k = 0; k < 5; k++) {
      varaqG.add(donacha(0.010, chiziq, -0.24 + k * 0.12, 0.026, z + 0.045));
    }
  }
  // Yuqoridagi islimiy unsur — spiral bargcha (mavhum naqsh).
  for (var s2 = 0; s2 < 10; s2++) {
    var t2 = s2 / 9;
    var r = 0.02 + t2 * 0.10;
    var a = t2 * Math.PI * 2.2;
    var b = donacha(0.016 - t2 * 0.008, zar, Math.cos(a) * r, 0.026, -0.24 + Math.sin(a) * r * 0.7);
    varaqG.add(b);
  }

  varaqG.position.set(0.02, 0.055, -0.01);
  varaqG.rotation.y = -0.05;
  g.add(varaqG);

  // Taxta chetidagi qamish qalam.
  var qalam = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.032, 0.54, 10),
    new THREE.MeshStandardMaterial({ color: RANG.yogochOch, roughness: 0.55 }));
  qalam.rotation.z = Math.PI / 2;
  qalam.rotation.y = 0.35;
  qalam.position.set(0.06, 0.10, 0.33);
  g.add(qalam);
  var uch = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.08, 8),
    new THREE.MeshStandardMaterial({ color: RANG.siyoh, roughness: 0.4 }));
  uch.rotation.z = -Math.PI / 2;
  uch.rotation.y = 0.35;
  uch.position.set(-0.23, 0.10, 0.42);
  g.add(uch);

  return tayyorla(g, 1.35, true, 'xattotVaraq');
}

/* 13. SHAMCHIROQ — hadisda ilmli inson «kishilarga yorug‘lik
   berib, o‘zini kuydiradigan shamchiroq»ga o‘xshatiladi.
   Jez oyoqli shamdon, mum sham va alanga. */
export function shamchiroqYasa() {
  var g = new THREE.Group();
  var jez = metallMat(RANG.mis, 0.3);

  // Oyoq — charxda aylangan shamdon.
  var oyoq = charx([
    [0.00, 0.00], [0.30, 0.00], [0.32, 0.03], [0.26, 0.08],
    [0.14, 0.12], [0.09, 0.20], [0.07, 0.34], [0.10, 0.44],
    [0.16, 0.50], [0.13, 0.55], [0.075, 0.58], [0.075, 0.68],
    [0.11, 0.72], [0.135, 0.78], [0.00, 0.79]
  ], 26, jez);
  g.add(oyoq);
  g.add(halqa(0.175, 0.020, 0.50, metallMat(RANG.oltin, 0.3), 22));

  // Mum tomchilari tushadigan tovoqcha.
  var tovoq = charx([
    [0.075, 0.00], [0.20, 0.01], [0.235, 0.045], [0.22, 0.05],
    [0.185, 0.03], [0.075, 0.022]
  ], 22, jez);
  tovoq.position.y = 0.79;
  g.add(tovoq);

  // Sham.
  var sham = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.082, 0.62, 16),
    new THREE.MeshStandardMaterial({ color: RANG.sham, roughness: 0.55, metalness: 0.0 }));
  sham.position.y = 1.14;
  g.add(sham);
  // Oqib qotgan mum.
  var t = tasodif(19);
  for (var i = 0; i < 7; i++) {
    var a = (i / 7) * Math.PI * 2;
    var tomchi = new THREE.Mesh(new THREE.CapsuleGeometry(0.020, 0.10 + t() * 0.10, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0xF7EEDA, roughness: 0.5 }));
    tomchi.position.set(Math.cos(a) * 0.078, 1.30 - t() * 0.14, Math.sin(a) * 0.078);
    g.add(tomchi);
  }

  // Pilik va alanga.
  var pilik = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.06, 6), oddiy(0x2B2118, 0.9));
  pilik.position.y = 1.47;
  g.add(pilik);
  var alanga = new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 12),
    new THREE.MeshStandardMaterial({
      color: RANG.olov, roughness: 0.9, metalness: 0,
      emissive: 0xFF9A2E, emissiveIntensity: 1.5, transparent: true, opacity: 0.92
    }));
  alanga.scale.set(0.72, 1.9, 0.72);
  alanga.position.y = 1.55;
  alanga.castShadow = false;
  g.add(alanga);
  var ich = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0xFFF0C0, emissive: 0xFFE08A, emissiveIntensity: 2.2, roughness: 1 }));
  ich.scale.set(0.8, 1.8, 0.8);
  ich.position.y = 1.53;
  ich.castShadow = false;
  g.add(ich);

  return tayyorla(g, 1.45, true, 'shamchiroq');
}

/* 14. QANDIL — madrasa ayvoniga osiladigan o‘yma jez chiroq:
   ko‘pburchak tana, teshikli devorlari, uch zanjir va ilgak. */
export function qandilYasa() {
  var g = new THREE.Group();
  var jez = metallMat(RANG.mis, 0.3), jezT = metallMat(0x8C5522, 0.4);

  // Tana — sakkiz qirrali fonus.
  var tana = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.24, 0.44, 8), jez);
  tana.position.y = 0.34;
  g.add(tana);
  // Yon panellardagi teshiklar — nur naqsh bo‘lib to‘kiladi.
  for (var i = 0; i < 8; i++) {
    var a = (i / 8) * Math.PI * 2;
    for (var k = 0; k < 3; k++) {
      var tesh = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.05, 8), jezT);
      tesh.rotation.x = Math.PI / 2;
      tesh.rotation.z = a;
      tesh.position.set(Math.cos(a) * 0.27, 0.22 + k * 0.11, Math.sin(a) * 0.27);
      tesh.lookAt(0, 0.22 + k * 0.11, 0);
      g.add(tesh);
    }
  }
  // Pastki va ustki halqalar.
  g.add(halqa(0.255, 0.022, 0.12, jezT, 20));
  g.add(halqa(0.315, 0.022, 0.56, jezT, 20));

  // Pastdagi bujma uch.
  var uch = charx([
    [0.24, 0.00], [0.18, -0.06], [0.10, -0.12], [0.05, -0.20], [0.00, -0.24]
  ], 16, jez);
  uch.position.y = 0.12;
  g.add(uch);
  g.add(donacha(0.045, metallMat(RANG.oltin, 0.3), 0, -0.14, 0));

  // Ustidagi gumbazcha.
  var gum = new THREE.Mesh(new THREE.SphereGeometry(0.30, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), jez);
  gum.scale.y = 0.5;
  gum.position.y = 0.56;
  g.add(gum);

  // Uch zanjir va ilgak.
  aylanaBoylab(g, 3, 0.22, 0.86, function () {
    var z = new THREE.Group();
    for (var m = 0; m < 6; m++) {
      var bo = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.008, 6, 12), jezT);
      bo.rotation.x = m % 2 ? Math.PI / 2 : 0;
      bo.position.y = m * 0.048 - 0.14;
      z.add(bo);
    }
    return z;
  });
  var halqaUst = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.014, 8, 18), jez);
  halqaUst.position.y = 1.12;
  g.add(halqaUst);

  // Ichidagi yorug‘lik.
  var nur = new THREE.Mesh(new THREE.SphereGeometry(0.10, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0xFFD98A, emissive: 0xFFB347, emissiveIntensity: 1.8, roughness: 1 }));
  nur.position.y = 0.32;
  nur.castShadow = false;
  g.add(nur);

  return tayyorla(g, 1.35, false, 'qandil');
}

/* 15. TASBEH — yog‘och donalardan tizilgan tasbeh: uch qism,
   ikkita ajratkich dona, imom (boshcha) va popuk. */
export function tasbehYasa() {
  var g = new THREE.Group();
  var don = new THREE.MeshStandardMaterial({ color: 0x6B3A22, roughness: 0.32, metalness: 0.06 });
  var donOch = new THREE.MeshStandardMaterial({ color: 0x9A6238, roughness: 0.32, metalness: 0.06 });
  var ip = oddiy(0x3E2C16, 0.9);

  // Tasbeh yotiq halqa shaklida qo‘yilgan.
  var soni = 33;
  var R = 0.44;
  for (var i = 0; i < soni; i++) {
    var a = (i / soni) * Math.PI * 2;
    var ajrat = (i === 11 || i === 22);
    var d = new THREE.Mesh(
      new THREE.SphereGeometry(ajrat ? 0.055 : 0.044, 12, 9),
      ajrat ? donOch : don
    );
    d.scale.y = 0.86;
    d.position.set(Math.cos(a) * R, 0.042, Math.sin(a) * R);
    g.add(d);
  }
  // Donalarni bog‘lab turgan ip.
  var ipHalqa = new THREE.Mesh(new THREE.TorusGeometry(R, 0.007, 6, 48), ip);
  ipHalqa.rotation.x = Math.PI / 2;
  ipHalqa.position.y = 0.042;
  g.add(ipHalqa);

  // Imom — uzun boshcha dona.
  var imom = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.038, 0.20, 12), donOch);
  imom.rotation.x = Math.PI / 2;
  imom.position.set(0, 0.045, R + 0.12);
  g.add(imom);
  g.add(donacha(0.048, don, 0, 0.045, R + 0.01));

  // Popuk.
  for (var k = 0; k < 9; k++) {
    var t = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.004, 0.22, 5), ip);
    t.rotation.x = 1.35 + (k % 3) * 0.06;
    t.position.set((k - 4) * 0.012, 0.024, R + 0.32);
    g.add(t);
  }
  var bog = new THREE.Mesh(new THREE.CylinderGeometry(0.030, 0.030, 0.05, 10), donOch);
  bog.rotation.x = Math.PI / 2;
  bog.position.set(0, 0.045, R + 0.22);
  g.add(bog);

  return tayyorla(g, 1.20, true, 'tasbeh');
}

/* 16. JOYNAMOZ — to‘shalgan namoz gilamchasi: mehrob (sivri
   kamar) naqshi, ikki ustuncha, chekka hoshiya va popuklar.
   Bu buyum — tartib va poklik odatining moddiy timsoli. */
export function joynamozYasa() {
  var g = new THREE.Group();
  var asos = matoMat(RANG.matoKok), qizil = matoMat(RANG.mato);
  var oq = matoMat(RANG.oq), zar = metallMat(RANG.oltin, 0.5);

  var en = 0.84, boy = 1.30;

  // Zamin mato — biroz to‘lqinli.
  var mato = new THREE.Mesh(new THREE.PlaneGeometry(en, boy, 10, 14), asos);
  var p = mato.geometry.attributes.position;
  for (var i = 0; i < p.count; i++) {
    p.setZ(i, Math.sin(p.getX(i) * 6) * 0.008 + Math.cos(p.getY(i) * 4) * 0.010);
  }
  p.needsUpdate = true;
  mato.geometry.computeVertexNormals();
  mato.rotation.x = -Math.PI / 2;
  mato.position.y = 0.012;
  g.add(mato);
  g.add(plita(en, 0.012, boy, asos, 0, 0.006, 0));

  // Chekka hoshiya.
  var h = 0.075;
  g.add(plita(en, 0.006, h, qizil, 0, 0.019, boy / 2 - h / 2));
  g.add(plita(en, 0.006, h, qizil, 0, 0.019, -(boy / 2 - h / 2)));
  g.add(plita(h, 0.006, boy - 2 * h, qizil, en / 2 - h / 2, 0.019, 0));
  g.add(plita(h, 0.006, boy - 2 * h, qizil, -(en / 2 - h / 2), 0.019, 0));
  for (var k = 0; k < 9; k++) {
    var x = -0.34 + k * 0.085;
    g.add(plita(0.03, 0.008, 0.03, oq, x, 0.023, boy / 2 - h / 2));
    g.add(plita(0.03, 0.008, 0.03, oq, x, 0.023, -(boy / 2 - h / 2)));
  }

  // Mehrob — sivri kamar naqshi (yotiq yotgani uchun xz tekisligida).
  var mehrob = new THREE.Group();
  var yarim = 0.235;
  var R = yarim * 1.7, d = R - yarim, tMax = Math.acos(d / R);
  [1, -1].forEach(function (yon) {
    for (var j = 0; j < 14; j++) {
      var t = (j + 0.5) / 14 * tMax;
      var x2 = (-d + R * Math.cos(t)) * yon;
      var y2 = R * Math.sin(t);
      var b = plita(0.05, 0.008, (tMax / 14) * R * 1.2, oq, x2, 0, y2);
      b.rotation.y = -yon * t;
      mehrob.add(b);
    }
  });
  // Kamar ustunlari.
  [-1, 1].forEach(function (yon) {
    mehrob.add(plita(0.05, 0.008, 0.42, oq, yon * yarim, 0, -0.21));
  });
  // Mehrob ichidagi qizil maydon.
  mehrob.add(plita(0.40, 0.006, 0.60, qizil, 0, -0.003, 0.02));
  // Osilgan qandil naqshi — mehrob markazida.
  mehrob.add(plita(0.012, 0.008, 0.18, zar, 0, 0.004, 0.24));
  var qand = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.045, 0.008, 8), zar);
  qand.position.set(0, 0.005, 0.10);
  mehrob.add(qand);
  mehrob.position.set(0, 0.024, -0.10);
  g.add(mehrob);

  // Popuklar — ikki qisqa chetda.
  [1, -1].forEach(function (yon) {
    for (var m = 0; m < 11; m++) {
      var pop = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.005, 0.09, 5), qizil);
      pop.rotation.x = Math.PI / 2;
      pop.position.set(-0.36 + m * 0.072, 0.012, yon * (boy / 2 + 0.045));
      g.add(pop);
    }
  });

  return tayyorla(g, 1.40, true, 'joynamoz');
}

/* 17. SALLA — mudarris (ustoz) sallasi. Yog‘och tayanchga
   o‘ralgan oq mato qatlamlari; ilm ahlining an’anaviy belgisi. */
export function sallaYasa() {
  var g = new THREE.Group();
  var oqMato = matoMat(0xF3EDE0), soya = matoMat(0xDCD3C0);

  // Yog‘och tayanch.
  var poya = charx([
    [0.00, 0.00], [0.28, 0.00], [0.30, 0.025], [0.22, 0.06],
    [0.09, 0.10], [0.07, 0.28], [0.11, 0.36], [0.00, 0.38]
  ], 22, yogochMat(RANG.yogochTiq));
  g.add(poya);

  // Salla o‘ramlari — yumaloq halqalar.
  var qatlam = [
    { r: 0.30, q: 0.085, y: 0.44 }, { r: 0.345, q: 0.095, y: 0.545 },
    { r: 0.355, q: 0.095, y: 0.655 }, { r: 0.325, q: 0.088, y: 0.755 },
    { r: 0.265, q: 0.078, y: 0.845 }, { r: 0.185, q: 0.065, y: 0.915 }
  ];
  qatlam.forEach(function (q, i) {
    var o = new THREE.Mesh(new THREE.TorusGeometry(q.r, q.q, 10, 30), i % 2 ? oqMato : soya);
    o.rotation.x = Math.PI / 2;
    o.rotation.z = i * 0.35;
    o.position.y = q.y;
    o.scale.y = 0.9;
    g.add(o);
  });
  // Uchidagi tugun.
  var tugun = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), oqMato);
  tugun.scale.set(1, 0.72, 1);
  tugun.position.y = 0.96;
  g.add(tugun);
  // Osilib turgan uch.
  var uch = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.36, 0.03), oqMato);
  uch.position.set(0.32, 0.60, 0.14);
  uch.rotation.z = 0.22;
  g.add(uch);

  return tayyorla(g, 1.25, true, 'salla');
}

/* =========================================================
   REYESTR
   ========================================================= */
export const DINIY = {
  /* — Me’morchilik — */
  poydevor: {
    nom: 'Poydevor', tur: 'bino', modul: 9, yasa: poydevorYasa,
    izoh: 'Har bir bino — va har bir ilm — mustahkam poydevordan boshlanadi.'
  },
  devor: {
    nom: 'G‘isht devor', tur: 'bino', modul: 9, yasa: devorYasa,
    izoh: 'Madrasa hovlisini o‘rab turuvchi g‘ishtin devor: tokchalar va koshin friz bilan.'
  },
  peshtoq: {
    nom: 'Peshtoq', tur: 'bino', modul: 9, yasa: peshtoqYasa,
    izoh: 'Madrasaning bosh darvozasi. Peshtoq ostidan o‘tgan kishi tolibi ilm sanalgan.'
  },
  gumbaz: {
    nom: 'Feruza gumbaz', tur: 'bino', modul: 9, yasa: gumbazYasa,
    izoh: 'Darsxona ustidagi qovurg‘ali gumbaz — Sharq me’morchiligining yuksak namunasi.'
  },
  minora: {
    nom: 'Minora', tur: 'bino', modul: 9, yasa: minoraYasa,
    izoh: 'Muqarnasli sharafasi bor minora shahar uzra yo‘l ko‘rsatib turgan.'
  },
  koshin: {
    nom: 'Koshin paneli', tur: 'bino', modul: 9, yasa: koshinYasa,
    izoh: 'Girih naqshli sirlangan koshin — geometriya va hisob ilmi bilan chizilgan.'
  },

  /* — Ilm anjomlari — */
  lavh: {
    nom: 'Lavh', tur: 'ilm', modul: 9, yasa: lavhYasa,
    izoh: 'Kitob qo‘yg‘ich. Kitobni yerga qo‘ymaslik, lavhga qo‘yish — adab talabi.'
  },
  oltiKitob: {
    nom: 'Al-kutub as-sitta', tur: 'ilm', modul: 9, yasa: oltiKitobYasa,
    izoh: 'Olti ishonchli to‘plam: al-Buxoriy, Muslim, at-Termiziy, Abu Dovud, an-Nasoiy, Ibn Mojja.'
  },
  siyohdon: {
    nom: 'Siyohdon', tur: 'ilm', modul: 9, yasa: siyohdonYasa,
    izoh: '«Qalam vositasi bilan ta’lim berdi» — siyohdon xattot va tolibi ilmning doimiy hamrohi.'
  },
  qamishQalam: {
    nom: 'Qamish qalam', tur: 'ilm', modul: 9, yasa: qamishQalamYasa,
    izoh: 'Uchi qiya kesilgan qamish qalam bilan xat mashq qilingan; qalam — ilm quroli.'
  },
  qalamdon: {
    nom: 'Qalamdon', tur: 'ilm', modul: 9, yasa: qalamdonYasa,
    izoh: 'Qalam va siyohdon saqlanadigan lakli quti. Anjomni asrash — mehnatni qadrlash.'
  },
  xattotVaraq: {
    nom: 'Xattotlik varag‘i', tur: 'ilm', modul: 9, yasa: xattotVaraqYasa,
    izoh: 'Xattot mashq varag‘i: sabr bilan takrorlangan chiziq mashqlari va zar hoshiya.'
  },
  shamchiroq: {
    nom: 'Shamchiroq', tur: 'ilm', modul: 9, yasa: shamchiroqYasa,
    izoh: 'Hadisda olim «yorug‘lik berib, o‘zini kuydiradigan shamchiroq»ga o‘xshatiladi.'
  },
  qandil: {
    nom: 'Qandil', tur: 'ilm', modul: 9, yasa: qandilYasa,
    izoh: 'Ayvonga osilgan o‘yma jez chiroq; teshiklaridan nur naqsh bo‘lib to‘kiladi.'
  },
  tasbeh: {
    nom: 'Tasbeh', tur: 'ilm', modul: 9, yasa: tasbehYasa,
    izoh: 'Yog‘och donalardan tizilgan tasbeh — sabr va diqqatni jamlash odatining belgisi.'
  },
  joynamoz: {
    nom: 'Joynamoz', tur: 'ilm', modul: 9, yasa: joynamozYasa,
    izoh: 'Mehrob naqshli gilamcha — tartib va poklik odatining moddiy timsoli.'
  },
  salla: {
    nom: 'Mudarris sallasi', tur: 'ilm', modul: 9, yasa: sallaYasa,
    izoh: 'Madrasada saboq bergan ustoz-mudarrisning an’anaviy belgisi. Ustozga hurmat — adab asosi.'
  },
  kitob: {
    nom: 'Ochiq kitob', tur: 'ilm', modul: 9, yasa: function () { return kitobYasa(true); },
    izoh: '«Iqra’ — o‘qi!» amri bilan ilm yo‘li boshlangan; kitob — bilimning asosiy manbai.'
  },
  qalam: {
    nom: 'Qalam', tur: 'ilm', modul: 9, yasa: qalamYasa,
    izoh: 'Ustoz bergan bilim qalam bilan qog‘ozga muhrlanadi.'
  },
  qumgon: {
    nom: 'Qumg‘on', tur: 'ilm', modul: 9, yasa: qumgonYasa,
    izoh: 'Hujra oldidagi mis qumg‘on — tahorat va tozalik odatining buyumi.'
  },
  gilam: {
    nom: 'Gilam', tur: 'ilm', modul: 9, yasa: gilamYasa,
    izoh: 'Darsxona poliga to‘shalgan gilam; talabalar halqa bo‘lib o‘tirib saboq olgan.'
  },
  ganch: {
    nom: 'Ganch o‘yma', tur: 'bino', modul: 9, yasa: ganchYasa,
    izoh: 'Hujra devoridagi ganchkori naqsh — hunar va nafosat tarbiyasining namunasi.'
  }
};

/* Barcha modellarni sinovdan o‘tkazish. */
export function barchasiniYasa() {
  return Object.keys(DINIY).map(function (k) {
    return { kalit: k, guruh: DINIY[k].yasa() };
  });
}
