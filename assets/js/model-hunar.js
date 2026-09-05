/* =========================================================
   O‘ZBEK XALQ HUNARMANDCHILIGI — 3D MODELLAR (Three.js)
   10-modul: «Hunarmandchilik — mehnat tarbiyasining qadimiy shakli».

   Darslikda nomlangan yetti hunarning mahsulotlari uchun to‘qqizta
   alohida 3D model: sopol xurmacha, sopol lagan, so‘zana, mis qumg‘on,
   mis lagan, kumush taqinchoq, ganch naqsh paneli, Chust pichog‘i,
   gilam.

   Barchasi faqat Three.js primitivlaridan quriladi — tashqi .glb/.obj
   fayl yoki qo‘shimcha kutubxona kerak emas:
     · LatheGeometry   — ko‘za, lagan, qumg‘on kabi charxda aylangan idishlar
     · TubeGeometry    — qumg‘onning egilgan jo‘mragi
     · Shape + Extrude — pichoq tig‘i, taqinchoq uchburchaklari
     · Torus / Sphere / Box / Cylinder — dasta, halqa, naqsh, popuk

   Har bir «...Yasa()» funksiyasi THREE.Group qaytaradi. Guruh ichidagi
   model avtomatik ravishda:
     · eng katta o‘lchami 1.0–1.4 birlik bo‘lguncha miqyoslanadi,
     · gorizontal markazi (0,0,0) ga keltiriladi,
     · eng past nuqtasi y = 0 da turadi.
   Shuning uchun qaytgan guruhni sahnaga qo‘shib, o‘z o‘rniga
   surish (group.position.set(...)) markazlashni buzmaydi.
   ========================================================= */
import * as THREE from '../vendor/three.module.min.js';

/* ---------------------------------------------------------
   RANGLAR — milliy hunarmandchilik palitrasi
   --------------------------------------------------------- */
export const RANG = {
  sopol:     0xC1502E,   // terrakota — pishgan sopol
  sopolTiq:  0xA8442A,   // to‘q terrakota (soya, kunda, dasta)
  kok:       0x1B3B6F,   // ko‘k naqsh (Rishton kulolchiligi)
  mis:       0xB87333,   // mis
  misTiq:    0x8C5522,   // to‘q mis (qadama naqsh)
  kumush:    0xC9CDD4,   // kumush
  ganch:     0xF3EDE0,   // oq ganch
  ganchSoya: 0xDED2BC,   // ganchdagi o‘yiq maydoni
  ganchOyiq: 0xBFAF92,   // chuqurcha tubi — o‘yma soyasi
  yogoch:    0x8A6A44,   // yong‘oq yog‘och (pichoq dastasi)
  polat:     0xB8BDC4,   // po‘lat tig‘
  polatTiq:  0x8E959D,   // tig‘dagi o‘yiq (dol)
  matoOq:    0xFBF7F0,   // oq mato
  matoQizil: 0xC1502E,   // qizil kashta ipi
  matoKok:   0x1B3B6F,   // ko‘k kashta ipi
  oltin:     0xD4A24C,   // zar, jez halqa
  tosh:      0xA3232C    // qizil toshcha (aqiq)
};

/* ---------------------------------------------------------
   MATERIALLAR — har chaqiruvda yangi nusxa qaytaradi,
   shunda bir model materialini o‘chirish boshqasiga ta’sir qilmaydi.
   --------------------------------------------------------- */
function sopolMat(rang, ikkiTomon) {
  return new THREE.MeshStandardMaterial({
    color: rang, roughness: 0.84, metalness: 0.04,
    side: ikkiTomon ? THREE.DoubleSide : THREE.FrontSide
  });
}
function misMat(rang, ikkiTomon) {
  return new THREE.MeshStandardMaterial({
    color: rang, roughness: 0.35, metalness: 0.75,
    side: ikkiTomon ? THREE.DoubleSide : THREE.FrontSide
  });
}
function kumushMat() {
  return new THREE.MeshStandardMaterial({ color: RANG.kumush, roughness: 0.26, metalness: 0.9 });
}
function oltinMat() {
  return new THREE.MeshStandardMaterial({ color: RANG.oltin, roughness: 0.3, metalness: 0.85 });
}
function toshMat() {
  return new THREE.MeshStandardMaterial({ color: RANG.tosh, roughness: 0.16, metalness: 0.12 });
}
function polatMat(rang) {
  return new THREE.MeshStandardMaterial({ color: rang || RANG.polat, roughness: 0.24, metalness: 0.82 });
}
function matoMat(rang) {
  return new THREE.MeshStandardMaterial({ color: rang, roughness: 0.95, metalness: 0.0 });
}
function yogochMat(rang) {
  return new THREE.MeshStandardMaterial({ color: rang || RANG.yogoch, roughness: 0.68, metalness: 0.05 });
}
function ganchMat(rang) {
  return new THREE.MeshStandardMaterial({ color: rang || RANG.ganch, roughness: 0.9, metalness: 0.0 });
}

/* ---------------------------------------------------------
   GEOMETRIK YORDAMCHILAR
   --------------------------------------------------------- */

// Charxda aylangan idish: [radius, balandlik] juftliklaridan Lathe yasaydi.
function charx(nuqtalar, segment, material) {
  var v = nuqtalar.map(function (n) { return new THREE.Vector2(n[0], n[1]); });
  var geo = new THREE.LatheGeometry(v, segment || 24);
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, material);
}

// Y o‘qi atrofidagi yotiq halqa (naqsh chizig‘i, kunda, bo‘yin bandi).
function halqa(radius, quvur, y, material, segment) {
  var m = new THREE.Mesh(new THREE.TorusGeometry(radius, quvur, 8, segment || 24), material);
  m.rotation.x = Math.PI / 2;
  m.position.y = y;
  return m;
}

// To‘g‘ri burchakli plita (mato, gilam, panel qatlamlari uchun).
function plita(en, qalin, boy, material, x, y, z) {
  var m = new THREE.Mesh(new THREE.BoxGeometry(en, qalin, boy), material);
  m.position.set(x || 0, y || 0, z || 0);
  return m;
}

// Yassi disk — kashta rozetkasi, medalyon, toshcha uyasi uchun.
function disk(radius, qalin, material, x, y, z, qirra) {
  var m = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, qalin, qirra || 20), material);
  m.position.set(x || 0, y || 0, z || 0);
  return m;
}

// Kichik yumaloq donacha (kashta tugmasi, qadama naqsh nuqtasi).
function donacha(radius, material, x, y, z) {
  var m = new THREE.Mesh(new THREE.SphereGeometry(radius, 10, 6), material);
  m.position.set(x || 0, y || 0, z || 0);
  return m;
}

// Aylana bo‘ylab teng oraliqda takrorlash — naqsh halqalari uchun.
function aylanaBoylab(guruh, soni, radius, y, yasagich) {
  for (var i = 0; i < soni; i++) {
    var burchak = (i / soni) * Math.PI * 2;
    var m = yasagich(i, burchak);
    if (!m) continue;
    m.position.set(Math.cos(burchak) * radius, y, Math.sin(burchak) * radius);
    guruh.add(m);
  }
}

// Soya sozlamalari: hamma buyum soya tashlaydi, yassilari soyani qabul ham qiladi.
function soyaBer(guruh, yassi) {
  guruh.traverse(function (n) {
    if (n.isMesh) {
      n.castShadow = true;
      if (yassi) n.receiveShadow = true;
    }
  });
}

/* Modelni yakunlash: soya, miqyos (1.0–1.4), markazlash va y = 0 ga qo‘yish.
   Ichki guruh siljitiladi, tashqi guruh esa toza qaytadi — shuning uchun
   foydalanuvchi tashqi guruhni istagan joyga qo‘ya oladi. */
function tayyorla(ich, kerakOlcham, yassi, nom) {
  soyaBer(ich, yassi);

  var tashqi = new THREE.Group();
  tashqi.name = nom || 'hunar';
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
   1. SOPOL XURMACHA — kulolchilik
   Charxda aylangan bo‘yinli ko‘za: keng qorin, torayuvchi bo‘yin,
   kichik og‘iz, ikki yonida yoysimon dastalar. Qorni va bo‘ynida
   ko‘k naqsh chiziqlari hamda donachalar qatori.
   ========================================================= */
export function xurmachaYasa() {
  var ich = new THREE.Group();
  var sirt = sopolMat(RANG.sopol, true);

  // Tashqi devor pastdan og‘izgacha ko‘tariladi, so‘ng ichkariga qaytib
  // og‘iz labini va ichki bo‘shliqni hosil qiladi.
  var tana = charx([
    [0.000, 0.000], [0.150, 0.000], [0.210, 0.020], [0.290, 0.090],
    [0.360, 0.220], [0.400, 0.380], [0.392, 0.520], [0.334, 0.660],
    [0.244, 0.780], [0.172, 0.880], [0.146, 0.980], [0.152, 1.045],
    [0.192, 1.100], [0.176, 1.132], [0.136, 1.086], [0.126, 1.000],
    [0.122, 0.940], [0.000, 0.920]
  ], 24, sirt);
  ich.add(tana);

  // Kunda (tag halqasi) — ko‘za tik tursin.
  ich.add(halqa(0.148, 0.026, 0.016, sopolMat(RANG.sopolTiq)));

  // Ko‘k naqsh chiziqlari: qorin ustida, qorin ostida va bo‘yinda.
  ich.add(halqa(0.401, 0.013, 0.380, matoMat(RANG.kok), 24));
  ich.add(halqa(0.372, 0.010, 0.560, matoMat(RANG.kok), 24));
  ich.add(halqa(0.158, 0.014, 1.020, matoMat(RANG.kok), 20));

  // Qorindagi donachalar qatori — kulolning barmoq naqshi.
  var don = matoMat(RANG.kok);
  aylanaBoylab(ich, 14, 0.396, 0.465, function () {
    return new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 6), don);
  });

  // Ikki dasta — bo‘yin bilan yelkani bog‘lovchi yoy.
  [1, -1].forEach(function (s) {
    var d = new THREE.Mesh(
      new THREE.TorusGeometry(0.200, 0.032, 8, 18, Math.PI),
      sopolMat(RANG.sopolTiq)
    );
    d.position.set(s * 0.170, 0.820, 0);
    d.rotation.z = -s * Math.PI / 2;
    ich.add(d);
  });

  return tayyorla(ich, 1.25, false, 'xurmacha');
}

/* =========================================================
   2. SOPOL LAGAN — kulolchilik
   Keng va sayoz yumaloq lagan: cheti yumshoq ko‘tarilgan, ichida
   ko‘k-oq naqsh halqalari, markazida rozetka, ostida kunda.
   ========================================================= */
export function sopolLaganYasa() {
  var ich = new THREE.Group();

  // Tashqi tag → ko‘tarilgan chet → ichkariga qaytish (idish chuqurchasi).
  var tovoq = charx([
    [0.000, 0.030], [0.140, 0.026], [0.300, 0.042], [0.440, 0.082],
    [0.550, 0.150], [0.610, 0.212], [0.628, 0.252], [0.612, 0.272],
    [0.575, 0.252], [0.545, 0.205], [0.450, 0.140], [0.310, 0.098],
    [0.160, 0.078], [0.000, 0.072]
  ], 26, sopolMat(RANG.sopol, true));
  ich.add(tovoq);

  // Kunda.
  ich.add(halqa(0.215, 0.030, 0.012, sopolMat(RANG.sopolTiq)));

  // Ichki naqsh: ko‘k va oq halqalar ketma-ketligi.
  ich.add(halqa(0.552, 0.011, 0.209, matoMat(RANG.kok), 26));
  ich.add(halqa(0.500, 0.009, 0.176, matoMat(RANG.matoOq), 26));
  ich.add(halqa(0.440, 0.010, 0.140, matoMat(RANG.kok), 24));
  ich.add(halqa(0.262, 0.009, 0.092, matoMat(RANG.kok), 22));

  // Halqalar orasidagi ko‘k nuqtalar — Rishton laganlariga xos.
  var kokMat = matoMat(RANG.kok);
  aylanaBoylab(ich, 12, 0.352, 0.115, function () {
    return new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 6), kokMat);
  });

  // Markaziy rozetka: ko‘k disk + oq yulduzcha barglari.
  ich.add(disk(0.120, 0.012, matoMat(RANG.kok), 0, 0.078, 0, 20));
  ich.add(disk(0.052, 0.012, matoMat(RANG.matoOq), 0, 0.086, 0, 16));
  var oq = matoMat(RANG.matoOq);
  aylanaBoylab(ich, 8, 0.172, 0.082, function () {
    var b = new THREE.Mesh(new THREE.SphereGeometry(0.040, 10, 6), oq);
    b.scale.set(1, 0.28, 0.55);
    return b;
  });

  return tayyorla(ich, 1.30, true, 'sopol-lagan');
}

/* =========================================================
   3. SO‘ZANA — kashtachilik
   Kvadrat mato paneli: oq zamin, qizil-ko‘k haoshiya (hoshiya),
   markazida katta rozetka gul, to‘rt burchagida kichik gullar.
   Kashta effekti yassi qatlamlarni bir-birining ustiga qo‘yish
   va biroz bo‘rtgan donachalar bilan beriladi.
   ========================================================= */
export function suzaniYasa() {
  var ich = new THREE.Group();
  var oq = matoMat(RANG.matoOq);
  var qizil = matoMat(RANG.matoQizil);
  var kok = matoMat(RANG.matoKok);

  // Zamin mato.
  ich.add(plita(1.20, 0.020, 1.20, oq, 0, 0.010, 0));

  // Tashqi qizil hoshiya — to‘rt tomondan.
  var h = 0.085, chet = 0.5575, y1 = 0.026;
  ich.add(plita(1.20, 0.012, h, qizil, 0, y1, chet));
  ich.add(plita(1.20, 0.012, h, qizil, 0, y1, -chet));
  ich.add(plita(h, 0.012, 1.20 - 2 * h, qizil, chet, y1, 0));
  ich.add(plita(h, 0.012, 1.20 - 2 * h, qizil, -chet, y1, 0));

  // Ichki ko‘k chiziq — hoshiyani zamindan ajratadi.
  var ic = 0.455, y2 = 0.028;
  ich.add(plita(0.96, 0.010, 0.022, kok, 0, y2, ic));
  ich.add(plita(0.96, 0.010, 0.022, kok, 0, y2, -ic));
  ich.add(plita(0.022, 0.010, 0.96, kok, ic, y2, 0));
  ich.add(plita(0.022, 0.010, 0.96, kok, -ic, y2, 0));

  // Hoshiyadagi oq tugmalar qatori — kashta chokining ritmi.
  for (var i = 0; i < 10; i++) {
    var t = -0.495 + i * 0.11;
    ich.add(donacha(0.022, oq, t, 0.036, chet));
    ich.add(donacha(0.022, oq, t, 0.036, -chet));
    ich.add(donacha(0.022, oq, chet, 0.036, t));
    ich.add(donacha(0.022, oq, -chet, 0.036, t));
  }

  // Markaziy rozetka — so‘zananing «oy»i.
  ich.add(disk(0.205, 0.012, qizil, 0, 0.030, 0, 24));
  ich.add(disk(0.118, 0.012, kok, 0, 0.038, 0, 20));
  ich.add(disk(0.050, 0.012, oq, 0, 0.046, 0, 16));

  // Rozetka atrofidagi ikki qator gul barglari.
  aylanaBoylab(ich, 10, 0.268, 0.038, function () {
    var b = new THREE.Mesh(new THREE.SphereGeometry(0.072, 10, 6), qizil);
    b.scale.set(1, 0.22, 0.55);
    return b;
  });
  aylanaBoylab(ich, 10, 0.360, 0.034, function () {
    var b = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 6), kok);
    b.scale.set(1, 0.24, 0.6);
    return b;
  });

  // To‘rt burchakdagi kichik gullar.
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (b) {
    var gul = new THREE.Group();
    gul.add(disk(0.078, 0.012, kok, 0, 0.030, 0, 16));
    gul.add(disk(0.032, 0.012, oq, 0, 0.038, 0, 12));
    aylanaBoylab(gul, 6, 0.108, 0.032, function () {
      var b2 = new THREE.Mesh(new THREE.SphereGeometry(0.044, 10, 6), qizil);
      b2.scale.set(1, 0.22, 0.6);
      return b2;
    });
    gul.position.set(b[0] * 0.335, 0, b[1] * 0.335);
    ich.add(gul);
  });

  return tayyorla(ich, 1.25, true, 'suzani');
}

/* =========================================================
   4. MIS QUMG‘ON — misgarlik
   Bo‘yinli mis choydish: yumaloq tana, uzun egilgan jo‘mrak
   (TubeGeometry), gumbazsimon qopqoq va yon tutqich. Tanasida
   to‘q mis rangdagi qadama naqsh halqalari.
   ========================================================= */
export function qumgonYasa() {
  var ich = new THREE.Group();

  // Tana — charxlangan mis idish (og‘zi ichkariga qayrilgan).
  var tana = charx([
    [0.000, 0.000], [0.130, 0.000], [0.180, 0.020], [0.250, 0.070],
    [0.310, 0.170], [0.335, 0.300], [0.320, 0.420], [0.270, 0.520],
    [0.200, 0.600], [0.155, 0.660], [0.145, 0.720], [0.166, 0.762],
    [0.150, 0.788], [0.128, 0.752], [0.124, 0.700], [0.000, 0.684]
  ], 24, misMat(RANG.mis, true));
  ich.add(tana);

  // Kunda va bo‘yin bandi.
  ich.add(halqa(0.132, 0.022, 0.014, misMat(RANG.misTiq)));
  ich.add(halqa(0.152, 0.016, 0.700, misMat(RANG.misTiq), 20));

  // Qorindagi qadama naqsh: ikki halqa va ular orasida donachalar.
  ich.add(halqa(0.337, 0.013, 0.300, misMat(RANG.misTiq), 24));
  ich.add(halqa(0.300, 0.011, 0.450, misMat(RANG.misTiq), 24));
  var naqshMat = misMat(RANG.misTiq);
  aylanaBoylab(ich, 12, 0.330, 0.372, function () {
    return new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 6), naqshMat);
  });

  // Qopqoq — gumbaz, bandi va tugmasi.
  var qopqoq = new THREE.Mesh(
    new THREE.SphereGeometry(0.150, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
    misMat(RANG.mis)
  );
  qopqoq.scale.set(1, 0.62, 1);
  qopqoq.position.y = 0.770;
  ich.add(qopqoq);
  ich.add(halqa(0.152, 0.014, 0.772, misMat(RANG.misTiq), 20));
  ich.add(donacha(0.046, misMat(RANG.misTiq), 0, 0.880, 0));

  // Jo‘mrak — pastdan chiqib, yuqoriga egilib ko‘tariladi.
  var yol = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.215, 0.190, 0),
    new THREE.Vector3(0.370, 0.290, 0),
    new THREE.Vector3(0.480, 0.450, 0),
    new THREE.Vector3(0.515, 0.640, 0),
    new THREE.Vector3(0.470, 0.790, 0)
  ]);
  var jomrak = new THREE.Mesh(
    new THREE.TubeGeometry(yol, 22, 0.048, 10, false),
    misMat(RANG.mis)
  );
  ich.add(jomrak);

  // Jo‘mrak og‘zi — kengaygan halqa.
  var ogiz = new THREE.Mesh(
    new THREE.CylinderGeometry(0.066, 0.050, 0.060, 14, 1, true),
    misMat(RANG.mis, true)
  );
  ogiz.position.set(0.462, 0.808, 0);
  ogiz.rotation.z = 0.34;
  ich.add(ogiz);

  // Tutqich — jo‘mrakning qarshi tomonidagi yoy dasta.
  var tutqich = new THREE.Mesh(
    new THREE.TorusGeometry(0.205, 0.030, 8, 18, Math.PI),
    misMat(RANG.misTiq)
  );
  tutqich.position.set(-0.185, 0.450, 0);
  tutqich.rotation.z = Math.PI / 2;
  ich.add(tutqich);

  return tayyorla(ich, 1.20, false, 'qumgon');
}

/* =========================================================
   5. MIS LAGAN — misgarlik
   Keng, yassi mis tovoq: cheti qayrilgan, chetida qadama (chertib
   solingan) donacha naqsh, ichida konsentrik o‘yiq halqalar va
   markazda nur sochuvchi rozetka.
   ========================================================= */
export function misLaganYasa() {
  var ich = new THREE.Group();

  var tovoq = charx([
    [0.000, 0.020], [0.180, 0.016], [0.360, 0.020], [0.500, 0.030],
    [0.580, 0.052], [0.625, 0.088], [0.645, 0.120], [0.632, 0.142],
    [0.600, 0.118], [0.575, 0.078], [0.505, 0.058], [0.360, 0.046],
    [0.180, 0.042], [0.000, 0.040]
  ], 26, misMat(RANG.mis, true));
  ich.add(tovoq);

  // Kunda.
  ich.add(halqa(0.255, 0.022, 0.008, misMat(RANG.misTiq)));

  // Chetdagi qadama naqsh — ikki qator donacha.
  var tiq = misMat(RANG.misTiq);
  aylanaBoylab(ich, 20, 0.607, 0.105, function () {
    return new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 6), tiq);
  });
  aylanaBoylab(ich, 20, 0.540, 0.066, function () {
    return new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6), tiq);
  });

  // O‘yiq halqalar.
  ich.add(halqa(0.478, 0.010, 0.056, misMat(RANG.misTiq), 26));
  ich.add(halqa(0.352, 0.009, 0.047, misMat(RANG.misTiq), 24));
  ich.add(halqa(0.220, 0.008, 0.043, misMat(RANG.misTiq), 22));

  // Markaziy rozetka — sakkiz nurli yulduz.
  ich.add(disk(0.062, 0.014, misMat(RANG.misTiq), 0, 0.046, 0, 16));
  aylanaBoylab(ich, 8, 0.118, 0.046, function (i, burchak) {
    var nur = new THREE.Mesh(new THREE.BoxGeometry(0.130, 0.010, 0.028), tiq);
    nur.rotation.y = -burchak;
    return nur;
  });

  return tayyorla(ich, 1.30, true, 'mis-lagan');
}

/* =========================================================
   6. KUMUSH TAQINCHOQ — zargarlik
   Bo‘yinga taqiladigan zeb-ziynat: kumush halqa, halqaning pastki
   yoyiga osilgan beshta bo‘lak — markazda uchburchak tumor, yonida
   yumaloq medalyonlar va tomchi shakldagi oltin donalar. Har bir
   bo‘lakda qizil toshcha (aqiq) o‘rnatilgan.
   ========================================================= */
export function taqinchoqYasa() {
  var ich = new THREE.Group();
  var kum = kumushMat();
  var olt = oltinMat();
  var qiz = toshMat();

  var R = 0.42, MY = 0.80;   // halqa radiusi va markazi balandligi

  // Bo‘yin halqasi (tik turadi — XY tekisligida).
  var bogich = new THREE.Mesh(new THREE.TorusGeometry(R, 0.024, 8, 28), kum);
  bogich.position.y = MY;
  ich.add(bogich);

  // Halqaning yuqori yoyidagi kumush donalar.
  for (var i = 0; i < 9; i++) {
    var a = Math.PI * (0.15 + 0.0875 * i);       // 0.15π … 0.85π — yuqori yoy
    ich.add(donacha(0.036, kum, Math.cos(a) * R, MY + Math.sin(a) * R, 0));
  }

  // Uchburchak tumor shaklini yasovchi yordamchi.
  function uchburchak(en, boy, material, chuqur) {
    var s = new THREE.Shape();
    s.moveTo(-en / 2, boy / 2);
    s.lineTo(en / 2, boy / 2);
    s.lineTo(0, -boy / 2);
    s.closePath();
    var geo = new THREE.ExtrudeGeometry(s, {
      depth: chuqur || 0.026, bevelEnabled: true,
      bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2, curveSegments: 4
    });
    geo.center();
    return new THREE.Mesh(geo, material);
  }

  // Pastki yoyga osilgan beshta bo‘lak.
  var burchaklar = [1.15, 1.325, 1.5, 1.675, 1.85];
  burchaklar.forEach(function (k, idx) {
    var a = Math.PI * k;
    var x = Math.cos(a) * R, y = MY + Math.sin(a) * R;

    // Ulagich halqacha.
    var ilgak = new THREE.Mesh(new THREE.TorusGeometry(0.034, 0.010, 8, 14), kum);
    ilgak.position.set(x, y - 0.038, 0);
    ich.add(ilgak);

    // Zanjircha.
    var zanjir = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.075, 8), kum);
    zanjir.position.set(x, y - 0.105, 0);
    ich.add(zanjir);

    var uch = y - 0.150;   // bo‘lakning yuqori chekkasi

    if (idx === 2) {
      // Markaziy uchburchak tumor.
      var tumor = uchburchak(0.300, 0.310, kum, 0.030);
      tumor.position.set(x, uch - 0.155, 0);
      ich.add(tumor);
      // Toshcha va oltin bezaklar.
      var t = donacha(0.052, qiz, x, uch - 0.130, 0.024);
      t.scale.set(1, 1, 0.55);
      ich.add(t);
      ich.add(donacha(0.024, olt, x - 0.075, uch - 0.070, 0.020));
      ich.add(donacha(0.024, olt, x + 0.075, uch - 0.070, 0.020));
      ich.add(donacha(0.026, olt, x, uch - 0.255, 0.018));
    } else if (idx === 1 || idx === 3) {
      // Yumaloq medalyonlar.
      var med = disk(0.095, 0.026, kum, x, uch - 0.095, 0, 20);
      med.rotation.x = Math.PI / 2;
      ich.add(med);
      var med2 = disk(0.055, 0.030, olt, x, uch - 0.095, 0, 16);
      med2.rotation.x = Math.PI / 2;
      ich.add(med2);
      var t2 = donacha(0.034, qiz, x, uch - 0.095, 0.022);
      t2.scale.set(1, 1, 0.6);
      ich.add(t2);
    } else {
      // Chekka tomchi donalar.
      var tomchi = donacha(0.062, olt, x, uch - 0.070, 0);
      tomchi.scale.set(0.85, 1.25, 0.5);
      ich.add(tomchi);
      var t3 = donacha(0.026, qiz, x, uch - 0.070, 0.030);
      t3.scale.set(1, 1, 0.5);
      ich.add(t3);
    }
  });

  return tayyorla(ich, 1.28, false, 'taqinchoq');
}

/* =========================================================
   7. GANCH NAQSH PANELI — naqqoshlik
   Kvadrat oq ganch panel. Yuzasida girih — ikki kesishgan kvadratdan
   hosil bo‘lgan sakkiz burchakli yulduz, markazda va burchaklarda
   sakkiz qirrali halqalar. Naqsh oralaridagi to‘q chuqurchalar
   o‘yma effektini beradi.
   ========================================================= */
export function ganchYasa() {
  var ich = new THREE.Group();
  var oq = ganchMat(RANG.ganch);
  var soya = ganchMat(RANG.ganchSoya);

  var Q = 1.20;          // panel tomoni
  var Z0 = 0.035;        // panel old yuzasi

  // Asos plita (tik turadi).
  var asos = new THREE.Mesh(new THREE.BoxGeometry(Q, Q, 0.070), oq);
  ich.add(asos);

  // Chuqurlashtirilgan maydon — o‘yma naqsh tubi (to‘q ganch soyasi).
  var tub = new THREE.Mesh(new THREE.BoxGeometry(0.960, 0.960, 0.014), soya);
  tub.position.set(0, 0, Z0 + 0.002);
  ich.add(tub);

  // Ko‘tarilgan hoshiya ramkasi.
  var r = 0.088, chet = (Q - r) / 2, zr = Z0 + 0.014;
  var ramka = [
    [Q, r, 0, chet], [Q, r, 0, -chet],
    [r, Q - 2 * r, chet, 0], [r, Q - 2 * r, -chet, 0]
  ];
  ramka.forEach(function (b) {
    var m = new THREE.Mesh(new THREE.BoxGeometry(b[0], b[1], 0.028), oq);
    m.position.set(b[2], b[3], zr);
    ich.add(m);
  });

  // Girih tasmalari: kvadrat yasovchi yordamchi.
  function kvadrat(tomon, en, burilish) {
    var g = new THREE.Group();
    var uzun = tomon + en;
    [[uzun, en, 0, tomon / 2], [uzun, en, 0, -tomon / 2],
     [en, tomon, tomon / 2, 0], [en, tomon, -tomon / 2, 0]].forEach(function (b) {
      var m = new THREE.Mesh(new THREE.BoxGeometry(b[0], b[1], 0.030), oq);
      m.position.set(b[2], b[3], 0);
      g.add(m);
    });
    g.rotation.z = burilish;
    g.position.z = Z0 + 0.016;
    return g;
  }

  // Ikki kesishgan kvadrat — sakkiz burchakli yulduz (girih).
  ich.add(kvadrat(0.620, 0.052, 0));
  ich.add(kvadrat(0.620, 0.052, Math.PI / 4));

  // Markaziy sakkiz qirrali halqa.
  var markaz = new THREE.Mesh(new THREE.TorusGeometry(0.170, 0.030, 8, 8), oq);
  markaz.position.z = Z0 + 0.020;
  markaz.rotation.z = Math.PI / 8;
  ich.add(markaz);

  // Burchaklardagi kichik sakkiz qirrali halqalar.
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (b) {
    var k = new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.024, 8, 8), oq);
    k.position.set(b[0] * 0.400, b[1] * 0.400, Z0 + 0.018);
    k.rotation.z = Math.PI / 8;
    ich.add(k);
  });

  // Chuqurchalar — naqsh oralaridagi o‘yiq nuqtalar.
  var oyiq = ganchMat(RANG.ganchOyiq);
  function chuqurcha(x, y, radius) {
    var c = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 0.7, 0.016, 12), oyiq);
    c.rotation.x = Math.PI / 2;
    c.position.set(x, y, Z0 + 0.008);
    return c;
  }
  for (var i = 0; i < 8; i++) {
    var a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    ich.add(chuqurcha(Math.cos(a) * 0.300, Math.sin(a) * 0.300, 0.042));
  }
  for (var j = 0; j < 8; j++) {
    var a2 = (j / 8) * Math.PI * 2;
    ich.add(chuqurcha(Math.cos(a2) * 0.470, Math.sin(a2) * 0.470, 0.030));
  }

  return tayyorla(ich, 1.30, true, 'ganch');
}

/* =========================================================
   8. CHUST PICHOG‘I — pichoqchilik
   Yotgan holatdagi pichoq: Shape + Extrude bilan yasalgan egri
   po‘lat tig‘ (uchi ko‘tarilgan), tig‘ yuzasida dol o‘yig‘i,
   jez g‘ilof halqa va yong‘och dasta. Dastada rangli halqalar
   hamda kengaygan tumshuq (poshna).
   ========================================================= */
export function pichoqYasa() {
  var ich = new THREE.Group();
  var qism = new THREE.Group();   // XY tekisligida quriladi, so‘ng yotqiziladi

  /* --- Tig‘ --- */
  var t = new THREE.Shape();
  t.moveTo(0.00, -0.050);                              // tig‘ ildizi, kesuvchi qirra
  t.lineTo(0.00, 0.060);                               // qirra (bel) boshi
  t.lineTo(0.42, 0.068);
  t.quadraticCurveTo(0.66, 0.062, 0.800, -0.012);      // uchga qarab pasayuvchi bel
  t.quadraticCurveTo(0.60, -0.078, 0.300, -0.086);     // kesuvchi qirraning qorni
  t.lineTo(0.00, -0.050);

  var tig = new THREE.Mesh(new THREE.ExtrudeGeometry(t, {
    depth: 0.024, bevelEnabled: true, bevelThickness: 0.007,
    bevelSize: 0.007, bevelSegments: 2, curveSegments: 10
  }), polatMat(RANG.polat));
  tig.position.z = -0.012;
  qism.add(tig);

  // Dol — tig‘ning ikki yuzasidagi uzun o‘yiq chiziq.
  [0.014, -0.014].forEach(function (z) {
    var dol = new THREE.Mesh(new THREE.BoxGeometry(0.520, 0.014, 0.008), polatMat(RANG.polatTiq));
    dol.position.set(0.300, 0.022, z);
    qism.add(dol);
  });

  /* --- Dasta --- */
  // Jez g‘ilof halqa (tig‘ bilan dasta orasidagi band).
  var gilof = new THREE.Mesh(new THREE.CylinderGeometry(0.090, 0.086, 0.055, 18), oltinMat());
  gilof.rotation.z = Math.PI / 2;
  gilof.scale.set(1, 1, 0.62);
  gilof.position.x = -0.030;
  qism.add(gilof);

  // Asosiy dasta — orqaga qarab kengayuvchi yassi silindr.
  var dasta = new THREE.Mesh(new THREE.CylinderGeometry(0.112, 0.084, 0.380, 18), yogochMat());
  dasta.rotation.z = Math.PI / 2;
  dasta.scale.set(1, 1, 0.62);
  dasta.position.x = -0.250;
  qism.add(dasta);

  // Dastadagi rangli halqalar — oltin, ko‘k, qizil.
  [[-0.115, RANG.oltin], [-0.215, RANG.kok], [-0.330, RANG.tosh]].forEach(function (b) {
    var band = new THREE.Mesh(new THREE.CylinderGeometry(0.108, 0.108, 0.026, 18),
      b[1] === RANG.oltin ? oltinMat() : matoMat(b[1]));
    band.rotation.z = Math.PI / 2;
    band.scale.set(1, 1, 0.66);
    band.position.x = b[0];
    qism.add(band);
  });

  // Dasta poshnasi — uchi yumaloq qopqoqcha.
  var poshna = new THREE.Mesh(new THREE.SphereGeometry(0.114, 16, 12), yogochMat(RANG.sopolTiq));
  poshna.scale.set(0.55, 1, 0.62);
  poshna.position.x = -0.442;
  qism.add(poshna);

  // Butun pichoqni yotqizamiz: qalinlik yuqoriga, tig‘ eni chuqurlikka.
  qism.rotation.x = -Math.PI / 2;
  ich.add(qism);

  return tayyorla(ich, 1.32, true, 'pichoq');
}

/* =========================================================
   9. GILAM — gilamchilik
   To‘rtburchak gilam: qizil zamin, oq va ko‘k hoshiyalar, o‘rtada
   uchta sakkiz qirrali medalyon (gul), burchaklarda romb naqshlar,
   ikki qisqa tomonida oq popuklar.
   ========================================================= */
export function gilamYasa() {
  var ich = new THREE.Group();
  var qizil = matoMat(RANG.matoQizil);
  var oq = matoMat(RANG.matoOq);
  var kok = matoMat(RANG.matoKok);

  var EN = 1.20, BOY = 0.86;    // zamin o‘lchami (popuksiz)

  // Zamin.
  ich.add(plita(EN, 0.026, BOY, qizil, 0, 0.013, 0));

  // Tashqi oq hoshiya.
  var h = 0.075, y1 = 0.029;
  ich.add(plita(EN, 0.008, h, oq, 0, y1, (BOY - h) / 2));
  ich.add(plita(EN, 0.008, h, oq, 0, y1, -(BOY - h) / 2));
  ich.add(plita(h, 0.008, BOY - 2 * h, oq, (EN - h) / 2, y1, 0));
  ich.add(plita(h, 0.008, BOY - 2 * h, oq, -(EN - h) / 2, y1, 0));

  // Ichki ko‘k hoshiya chizig‘i.
  var iz = 0.030, ix = EN / 2 - 0.100, iy = BOY / 2 - 0.100, y2 = 0.031;
  ich.add(plita(2 * ix, 0.008, iz, kok, 0, y2, iy));
  ich.add(plita(2 * ix, 0.008, iz, kok, 0, y2, -iy));
  ich.add(plita(iz, 0.008, 2 * iy, kok, ix, y2, 0));
  ich.add(plita(iz, 0.008, 2 * iy, kok, -ix, y2, 0));

  // Hoshiyadagi ko‘k tishchalar — gilam naqshining ritmi.
  for (var i = 0; i < 9; i++) {
    var x = -0.48 + i * 0.12;
    ich.add(plita(0.048, 0.008, 0.030, kok, x, 0.035, (BOY - h) / 2));
    ich.add(plita(0.048, 0.008, 0.030, kok, x, 0.035, -(BOY - h) / 2));
  }

  // Uchta medalyon — o‘rtadagisi kattaroq (gilam «guli»).
  [[-0.360, 0.150], [0, 0.205], [0.360, 0.150]].forEach(function (m) {
    var g = new THREE.Group();
    g.add(disk(m[1], 0.012, kok, 0, 0.033, 0, 8));
    g.add(disk(m[1] * 0.62, 0.012, oq, 0, 0.040, 0, 8));
    g.add(disk(m[1] * 0.28, 0.012, qizil, 0, 0.047, 0, 8));
    g.position.x = m[0];
    ich.add(g);
  });

  // Burchak romblari.
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (b) {
    var romb = plita(0.100, 0.010, 0.100, kok, b[0] * 0.470, 0.033, b[1] * 0.290);
    romb.rotation.y = Math.PI / 4;
    ich.add(romb);
  });

  // Popuklar — ikki qisqa tomondagi oq iplar.
  var pop = 0.075;
  for (var j = 0; j < 17; j++) {
    var z = -0.38 + j * 0.0475;
    ich.add(plita(pop, 0.010, 0.016, oq, (EN + pop) / 2 - 0.004, 0.006, z));
    ich.add(plita(pop, 0.010, 0.016, oq, -(EN + pop) / 2 + 0.004, 0.006, z));
  }

  return tayyorla(ich, 1.35, true, 'gilam');
}

/* =========================================================
   HUNARLAR JADVALI
   Sayt kodi shu jadvaldan foydalanib ro‘yxat quradi:
   nomi, qaysi hunarga tegishli ekani, model yasovchi funksiya va
   o‘quvchi uchun qisqa izoh.
   ========================================================= */
export const HUNARLAR = {
  xurmacha: {
    nom: 'Sopol xurmacha',
    hunar: 'Kulolchilik',
    yasa: xurmachaYasa,
    izoh: 'Kulolning charxida aylantirib yasalgan bo‘yinli ko‘za. Suv va ' +
          'ayron saqlash uchun ishlatilgan: keng qorni sovuqni uzoq tutadi, ' +
          'tor bo‘yni esa suvni chang va issiqdan asraydi.'
  },
  sopolLagan: {
    nom: 'Sopol lagan',
    hunar: 'Kulolchilik',
    yasa: sopolLaganYasa,
    izoh: 'Keng va sayoz sopol tovoq. Rishton hamda G‘ijduvon ustalari uni ' +
          'ko‘k-oq ishqorli bo‘yoq bilan bezaydi; naqsh halqalari markazdagi ' +
          'guldan chetga tomon tarqaladi.'
  },
  suzani: {
    nom: 'So‘zana',
    hunar: 'Kashtachilik',
    yasa: suzaniYasa,
    izoh: 'Oq matoga ipak ip bilan tikilgan katta kashta panel. Markazidagi ' +
          'rozetka quyoshni, chetidagi hoshiya esa oilani asrovchi to‘siqni ' +
          'anglatadi. Kelin sepining eng qadrli buyumi hisoblangan.'
  },
  qumgon: {
    nom: 'Mis qumg‘on',
    hunar: 'Misgarlik',
    yasa: qumgonYasa,
    izoh: 'Misgar bolg‘ada urib shakl bergan choydish. Uzun egri jo‘mragi ' +
          'suvni chaqqon quyish uchun, qadama naqshlari esa ustaning ' +
          'mahoratini ko‘rsatish uchun ishlangan.'
  },
  misLagan: {
    nom: 'Mis lagan',
    hunar: 'Misgarlik',
    yasa: misLaganYasa,
    izoh: 'Yassi mis tovoq. Cheti bo‘ylab chertib solingan qadama donachalar ' +
          'va konsentrik o‘yiq halqalar Buxoro misgarligiga xos bezakdir.'
  },
  taqinchoq: {
    nom: 'Kumush taqinchoq',
    hunar: 'Zargarlik',
    yasa: taqinchoqYasa,
    izoh: 'Bo‘yinga taqiladigan kumush zeb-ziynat. Markazdagi uchburchak ' +
          'tumor ko‘z tegishidan asraydi deb bilingan, qizil aqiq toshchalar ' +
          'esa unga jilo bergan.'
  },
  ganch: {
    nom: 'Ganch naqsh paneli',
    hunar: 'Naqqoshlik',
    yasa: ganchYasa,
    izoh: 'Ho‘l ganchga maxsus pichoq bilan o‘yilgan girih naqsh. Ikki ' +
          'kesishgan kvadratdan sakkiz burchakli yulduz hosil bo‘ladi — ' +
          'naqqoshlikda olamning tartibi shunday ifodalangan.'
  },
  pichoq: {
    nom: 'Chust pichog‘i',
    hunar: 'Pichoqchilik',
    yasa: pichoqYasa,
    izoh: 'Chust ustalarining «pchak»i: uchi ko‘tarilgan po‘lat tig‘, ' +
          'yuzasida dol o‘yig‘i, jez g‘ilof halqa va rangli bandlar bilan ' +
          'bezalgan dasta. Farg‘ona vodiysining ramzlaridan biri.'
  },
  gilam: {
    nom: 'Gilam',
    hunar: 'Gilamchilik',
    yasa: gilamYasa,
    izoh: 'Dastgohda tugib to‘qilgan jun gilam. Qizil zamindagi sakkiz ' +
          'qirrali medalyonlar urug‘ belgisi — «gul» deb ataladi, ikki ' +
          'chetidagi popuklar esa asos iplarining uchidir.'
  }
};

/* Barcha modellarni bir chaqiruvda yasash — namoyish galereyasi uchun qulay. */
export function barchasiniYasa() {
  var natija = {};
  Object.keys(HUNARLAR).forEach(function (kalit) {
    natija[kalit] = HUNARLAR[kalit].yasa();
  });
  return natija;
}

export default HUNARLAR;
