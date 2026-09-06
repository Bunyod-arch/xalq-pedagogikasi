/* =========================================================
   O‘ZBEK HUNARMANDCHILIGI — USTAXONA MODELLARI (Three.js)
   10-modulning o‘yin qismi uchun: «Hunar bozori» sahnasi.

   Fayl ikki bo‘limdan iborat:
     A) HUNARMAND MAHSULOTLARI — o‘quvchi yig‘adigan olti buyum:
        kumush bilaguzuk, aqiq ko‘zli uzuk, kashtali peshgir,
        ganch panjara, naqshin ustun, to‘qima xurjun.
        Har biri tayyorla() orqali 1.2 birlikka keltiriladi.
     B) USTAXONA JOYLARI — sahnada turadigan yetti usta o‘rni:
        kulol charxi, zargar stoli, kashta doirasi, misgar sandoni,
        ganch stoli, naqqosh stoli, gilam dastgohi.
        Bular MIQYOSLANMAYDI — o‘yin dunyosi o‘lchamida (eni 2.2–2.6,
        balandligi 1.2–1.8 birlik) qoladi, faqat markazlanadi.

   Barchasi faqat Three.js primitivlaridan quriladi — tashqi .glb/.obj
   fayl, CDN yoki qo‘shimcha kutubxona kerak emas:
     · LatheGeometry   — charxda aylangan idishlar (tog‘ora, kosa, ko‘za)
     · Shape + Extrude — o‘yma pichoq tig‘i, romb medalyon
     · TubeGeometry    — egilgan sim va tasmalar
     · Torus / Cone / Sphere / Box / Cylinder — halqa, donacha, naqsh

   Bu fayl model-hunar.js dan MUSTAQIL: yordamchi funksiyalar shu yerda
   qaytadan yozilgan, hech narsa import qilinmaydi.
   ========================================================= */
import * as THREE from '../vendor/three.module.min.js';

/* ---------------------------------------------------------
   RANGLAR — milliy hunarmandchilik palitrasi (kengaytirilgan)
   --------------------------------------------------------- */
export const RANG = {
  sopol:     0xC1502E,   // terrakota — pishgan sopol
  sopolTiq:  0xA8442A,   // to‘q terrakota (soya, kunda, dasta)
  loy:       0x9A7B5C,   // xom loy bo‘lagi
  kok:       0x1B3B6F,   // ko‘k naqsh (Rishton kulolchiligi)
  kokOch:    0x3E6FB0,   // ochroq ko‘k — naqsh ichi
  mis:       0xB87333,   // mis
  misTiq:    0x8C5522,   // to‘q mis (qadama naqsh)
  kumush:    0xC9CDD4,   // kumush
  kumushTiq: 0x9AA0A8,   // kumush soyasi, sim
  ganch:     0xF3EDE0,   // oq ganch
  ganchSoya: 0xDED2BC,   // ganchdagi o‘yiq maydoni
  ganchOyiq: 0xBFAF92,   // chuqurcha tubi — o‘yma soyasi
  yogoch:    0x8A6A44,   // yong‘oq yog‘och
  yogochTiq: 0x6B4E2E,   // to‘q yog‘och — ramka, oyoq
  yogochOch: 0xA98456,   // ochroq yog‘och — taxta, dastgoh
  polat:     0xB8BDC4,   // po‘lat tig‘, sandon
  polatTiq:  0x7C838C,   // to‘q po‘lat — o‘yiq, kunda temiri
  matoOq:    0xFBF7F0,   // oq mato
  matoQizil: 0xC1502E,   // qizil kashta ipi
  matoKok:   0x1B3B6F,   // ko‘k kashta ipi
  gilamQiz:  0x8C3A2B,   // gilam zamini — to‘q qizil
  oltin:     0xD4A24C,   // zar, oltin varaq
  tosh:      0xA3232C,   // qizil aqiq toshcha
  feruza:    0x2FA3A0,   // ko‘k feruza toshi
  yashil:    0x2E7D4F,   // yashil bo‘yoq
  chog:      0xE2521B,   // o‘chog‘dagi cho‘g‘
  alanga:    0xF2B33D,   // spirtovka alangasi
  qora:      0x2A2622,   // mo‘yqalam tuki, temir
  jun:       0xD8C7A6    // tabiiy jun kalava
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
function kumushMat(rang) {
  return new THREE.MeshStandardMaterial({
    color: rang || RANG.kumush, roughness: 0.24, metalness: 0.92
  });
}
function oltinMat() {
  return new THREE.MeshStandardMaterial({ color: RANG.oltin, roughness: 0.3, metalness: 0.85 });
}
function toshMat(rang) {
  return new THREE.MeshStandardMaterial({
    color: rang || RANG.tosh, roughness: 0.14, metalness: 0.14
  });
}
function polatMat(rang) {
  return new THREE.MeshStandardMaterial({
    color: rang || RANG.polat, roughness: 0.26, metalness: 0.8
  });
}
function matoMat(rang) {
  return new THREE.MeshStandardMaterial({ color: rang, roughness: 0.95, metalness: 0.0 });
}
function yogochMat(rang) {
  return new THREE.MeshStandardMaterial({
    color: rang || RANG.yogoch, roughness: 0.72, metalness: 0.04
  });
}
function ganchMat(rang) {
  return new THREE.MeshStandardMaterial({ color: rang || RANG.ganch, roughness: 0.9, metalness: 0.0 });
}
// Nur sochuvchi material — cho‘g‘, alanga va bo‘yoq jilosi uchun.
function nurMat(rang, kuch) {
  return new THREE.MeshStandardMaterial({
    color: rang, emissive: rang, emissiveIntensity: kuch === undefined ? 0.6 : kuch,
    roughness: 0.6, metalness: 0.0
  });
}

/* ---------------------------------------------------------
   GEOMETRIK YORDAMCHILAR
   (model-hunar.js dagilarning mustaqil nusxasi + bir nechta yangisi)
   --------------------------------------------------------- */

// Charxda aylangan idish: [radius, balandlik] juftliklaridan Lathe yasaydi.
function charx(nuqtalar, segment, material) {
  var v = nuqtalar.map(function (n) { return new THREE.Vector2(n[0], n[1]); });
  var geo = new THREE.LatheGeometry(v, segment || 22);
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, material);
}

// Y o‘qi atrofidagi yotiq halqa (naqsh chizig‘i, band, kunda).
function halqa(radius, quvur, y, material, segment) {
  var m = new THREE.Mesh(new THREE.TorusGeometry(radius, quvur, 8, segment || 22), material);
  m.rotation.x = Math.PI / 2;
  m.position.y = y;
  return m;
}

// Berilgan nuqtaga qo‘yilgan yotiq halqa (o‘qi Y bo‘ylab).
// Diqqat: halqa() dan keyin .translateZ() ishlatib bo‘lmaydi — halqa allaqachon
// burilgan bo‘lgani uchun uning lokal Z o‘qi dunyoning -Y siga qaraydi.
function halqaXZ(radius, quvur, material, x, y, z, segment) {
  var m = new THREE.Mesh(new THREE.TorusGeometry(radius, quvur, 8, segment || 22), material);
  m.rotation.x = Math.PI / 2;
  m.position.set(x || 0, y || 0, z || 0);
  return m;
}

// O‘qi X bo‘ylab yo‘nalgan halqa — yotiq val yoki dasta atrofidagi band.
function halqaX(radius, quvur, material, x, y, z, segment) {
  var m = new THREE.Mesh(new THREE.TorusGeometry(radius, quvur, 8, segment || 22), material);
  m.rotation.y = Math.PI / 2;
  m.position.set(x || 0, y || 0, z || 0);
  return m;
}

// To‘g‘ri burchakli plita (taxta, mato, panel qatlamlari uchun).
function plita(en, qalin, boy, material, x, y, z) {
  var m = new THREE.Mesh(new THREE.BoxGeometry(en, qalin, boy), material);
  m.position.set(x || 0, y || 0, z || 0);
  return m;
}

// Yassi disk — g‘ildirak, medalyon, kosa tubi uchun.
function disk(radius, qalin, material, x, y, z, qirra) {
  var m = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, qalin, qirra || 20), material);
  m.position.set(x || 0, y || 0, z || 0);
  return m;
}

// Kichik yumaloq donacha (granulyatsiya, kashta tugmasi, cho‘g‘).
function donacha(radius, material, x, y, z) {
  var m = new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 8), material);
  m.position.set(x || 0, y || 0, z || 0);
  return m;
}

// Ixtiyoriy yo‘nalishdagi tayoq: silindr, uzunligi Y o‘qi bo‘yicha.
function tayoq(radius, uzun, material, x, y, z, qirra) {
  var m = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, uzun, qirra || 12), material);
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

/* Modelni yakunlash: soya, miqyos, markazlash va y = 0 ga qo‘yish.
   A qismidagi mahsulotlar uchun. */
function tayyorla(ich, kerakOlcham, yassi, nom) {
  soyaBer(ich, yassi);

  var tashqi = new THREE.Group();
  tashqi.name = nom || 'ustaxona-buyum';
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

/* Ustaxona joylarini yakunlash: MIQYOSSIZ. Faqat soya beriladi,
   xz bo‘yicha markazlanadi va eng past nuqta y = 0 ga tushiriladi.
   Qo‘llanilgan siljish userData.siljish da saqlanadi — shu tufayli
   qurilish koordinatasidagi nuqtani nuqta() bilan guruh koordinatasiga
   o‘tkazish mumkin. */
function markazlaVaTur(ich, nom) {
  soyaBer(ich, true);

  var tashqi = new THREE.Group();
  tashqi.name = nom || 'ustaxona-joy';
  tashqi.add(ich);

  ich.updateMatrixWorld(true);
  var quti = new THREE.Box3().setFromObject(ich);
  var markaz = new THREE.Vector3();
  quti.getCenter(markaz);
  ich.position.set(-markaz.x, -quti.min.y, -markaz.z);

  tashqi.userData.siljish = ich.position.clone();
  return tashqi;
}

/* Qurilish koordinatasidagi (x, y, z) nuqtani markazlangan tashqi
   guruhning lokal koordinatasiga o‘tkazadi. */
function nuqta(tashqi, x, y, z) {
  var s = tashqi.userData.siljish || new THREE.Vector3();
  return new THREE.Vector3(x + s.x, y + s.y, z + s.z);
}

/* Stol yasovchi umumiy yordamchi: to‘rt oyoqli yog‘och stol.
   Qaytaradi: guruh; ustki yuza balandligi = balandlik. */
function stolYasa(en, boy, balandlik, qalin, material, oyoqMat) {
  var g = new THREE.Group();
  var q = qalin || 0.08;
  g.add(plita(en, q, boy, material, 0, balandlik - q / 2, 0));

  var ox = en / 2 - 0.11, oz = boy / 2 - 0.11, om = oyoqMat || material;
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (b) {
    var oyoq = plita(0.09, balandlik - q, 0.09, om,
      b[0] * ox, (balandlik - q) / 2, b[1] * oz);
    g.add(oyoq);
  });

  // Oyoqlarni bog‘lovchi ko‘ndalang taxtalar — dastgoh mustahkam ko‘rinsin.
  g.add(plita(en - 0.14, 0.05, 0.05, om, 0, 0.22, oz));
  g.add(plita(en - 0.14, 0.05, 0.05, om, 0, 0.22, -oz));
  g.add(plita(0.05, 0.05, boy - 0.14, om, ox, 0.22, 0));
  g.add(plita(0.05, 0.05, boy - 0.14, om, -ox, 0.22, 0));
  return g;
}

/* Popuk dastasi — gilam va xurjun chetlaridagi jun iplar. */
function popukQatori(guruh, soni, material, x0, dx, y, z, uzun) {
  for (var i = 0; i < soni; i++) {
    var p = tayoq(0.014, uzun, material, x0 + i * dx, y - uzun / 2, z, 6);
    guruh.add(p);
  }
}

/* Romb medalyon — gilam va xurjun naqshi uchun yassi plita. */
function romb(olcham, qalin, material, x, y, z) {
  var m = plita(olcham, qalin, olcham, material, x, y, z);
  m.rotation.y = Math.PI / 4;
  return m;
}


/* =========================================================
   =============  A QISM: HUNARMAND MAHSULOTLARI  ===========
   ========================================================= */

/* =========================================================
   A1. KUMUSH BILAGUZUK — zargarlik
   Ochiq halqali bilaguzuk (bilakka kiyilishi uchun bir joyi uzilgan).
   Halqa yuzasida chertma naqsh donachalari ikki qator bo‘lib yuguradi,
   ikki uchida kattaroq boshchalar, o‘rtasida esa ko‘k feruza tosh
   kumush uyaga o‘rnatilgan. Bilaguzuk yotiq emas — ko‘rgazma
   taglikdagidek biroz qiya qo‘yilgan.
   ========================================================= */
export function bilaguzukYasa() {
  var ich = new THREE.Group();
  var qism = new THREE.Group();          // XY tekisligida quriladi, so‘ng qiya buriladi
  var kum = kumushMat();
  var tiq = kumushMat(RANG.kumushTiq);

  var R = 0.52;                          // halqa radiusi
  var YOY = Math.PI * 1.75;              // ochiq yoy — qolgan 0.25π bo‘sh

  // Asosiy tanasi — ochiq halqa.
  var tana = new THREE.Mesh(new THREE.TorusGeometry(R, 0.062, 12, 44, YOY), kum);
  qism.add(tana);

  // Ichki yupqa astar halqa — bilaguzuk qalinroq va yasama ko‘rinsin.
  var astar = new THREE.Mesh(new THREE.TorusGeometry(R - 0.030, 0.034, 8, 40, YOY), tiq);
  qism.add(astar);

  // Ikki uchidagi kattaroq boshchalar (yoy boshi va oxiri).
  [0, YOY].forEach(function (a) {
    var bosh = donacha(0.096, kum, Math.cos(a) * R, Math.sin(a) * R, 0);
    bosh.scale.set(1, 1, 0.82);
    qism.add(bosh);
    // Boshcha yuzasidagi kichik oltin nuqta.
    qism.add(donacha(0.030, oltinMat(), Math.cos(a) * (R + 0.052), Math.sin(a) * (R + 0.052), 0));
  });

  // Chertma naqsh donachalari — tashqi yuza bo‘ylab ikki qator.
  var don = tiq;
  for (var i = 0; i < 17; i++) {
    var a2 = 0.10 + (i / 16) * (YOY - 0.20);
    // Toshning uyasi turadigan o‘rta qismni bo‘sh qoldiramiz.
    if (a2 > Math.PI * 0.72 && a2 < Math.PI * 1.03) continue;
    var d1 = donacha(0.026, don, Math.cos(a2) * (R + 0.052), Math.sin(a2) * (R + 0.052), 0.030);
    var d2 = donacha(0.026, don, Math.cos(a2) * (R + 0.052), Math.sin(a2) * (R + 0.052), -0.030);
    qism.add(d1);
    qism.add(d2);
  }

  // Naqshni ikkiga bo‘luvchi ingichka o‘yiq chiziq (yoy bo‘ylab).
  var chiziq = new THREE.Mesh(new THREE.TorusGeometry(R + 0.056, 0.010, 6, 40, YOY), tiq);
  qism.add(chiziq);

  // Markaziy feruza tosh uyasi — halqadan tashqariga qaragan silindr.
  var aT = Math.PI * 0.875;              // yoyning o‘rtasi
  var uya = new THREE.Mesh(new THREE.CylinderGeometry(0.150, 0.185, 0.085, 18), kum);
  uya.position.set(Math.cos(aT) * (R + 0.062), Math.sin(aT) * (R + 0.062), 0);
  uya.rotation.z = aT - Math.PI / 2;
  qism.add(uya);

  // Uyaning tishli hoshiyasi — mayda donachalar aylanasi.
  for (var j = 0; j < 10; j++) {
    var b = (j / 10) * Math.PI * 2;
    var yon = new THREE.Vector3(-Math.sin(aT), Math.cos(aT), 0);   // uyaning yuzasidagi o‘q
    var px = Math.cos(aT) * (R + 0.078) + yon.x * Math.cos(b) * 0.163;
    var py = Math.sin(aT) * (R + 0.078) + yon.y * Math.cos(b) * 0.163;
    var pz = Math.sin(b) * 0.163;
    qism.add(donacha(0.024, tiq, px, py, pz));
  }

  // Feruza tosh — gumbaz shaklida uyaga o‘tirgan.
  var tosh = new THREE.Mesh(new THREE.SphereGeometry(0.140, 16, 10), toshMat(RANG.feruza));
  tosh.scale.set(1, 1, 0.62);
  tosh.position.set(Math.cos(aT) * (R + 0.115), Math.sin(aT) * (R + 0.115), 0);
  tosh.rotation.z = aT - Math.PI / 2;
  qism.add(tosh);

  // Butun bilaguzukni qiya qo‘yamiz: yotiq emas, ko‘zga chiroyli tushadi.
  qism.rotation.x = -Math.PI / 2 + 0.55;
  qism.rotation.z = 0.18;
  ich.add(qism);

  return tayyorla(ich, 1.2, false, 'bilaguzuk');
}

/* =========================================================
   A2. AQIQ KO‘ZLI UZUK — zargarlik
   Tik turgan kumush uzuk: yumaloq halqa, yelkalarida granulyatsiya
   (mayda kumush donachalar) naqshi, tepasida to‘rt panjali uya va
   unga qadalgan qizil aqiq tosh.
   ========================================================= */
export function uzukYasa() {
  var ich = new THREE.Group();
  var kum = kumushMat();
  var tiq = kumushMat(RANG.kumushTiq);
  var aqiq = toshMat(RANG.tosh);

  var R = 0.42;                          // halqa radiusi

  // Uzuk halqasi — XY tekisligida, ya’ni tik turadi.
  ich.add(new THREE.Mesh(new THREE.TorusGeometry(R, 0.072, 14, 34), kum));

  // Ichki yupqa halqa — barmoqqa tegadigan silliq yuza.
  ich.add(new THREE.Mesh(new THREE.TorusGeometry(R - 0.034, 0.040, 10, 30), tiq));

  // Yelkalar — halqadan uyaga tomon kengayadigan ikki qism.
  [1, -1].forEach(function (s) {
    var yelka = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), kum);
    yelka.scale.set(1, 0.85, 0.62);
    yelka.position.set(s * 0.245, R * 0.86, 0);
    ich.add(yelka);
  });

  // Granulyatsiya: halqaning ikki yonida mayda donachalar qatori.
  for (var i = 0; i < 13; i++) {
    var a = Math.PI * (1.10 + (i / 12) * 0.80);      // pastki yoy bo‘ylab
    var rr = R + 0.062;
    ich.add(donacha(0.024, tiq, Math.cos(a) * rr, Math.sin(a) * rr, 0.034));
    ich.add(donacha(0.024, tiq, Math.cos(a) * rr, Math.sin(a) * rr, -0.034));
  }
  // Yelkalardagi uchburchak granul guruhlari.
  [1, -1].forEach(function (s) {
    ich.add(donacha(0.030, tiq, s * 0.215, R * 0.80 + 0.070, 0.040));
    ich.add(donacha(0.030, tiq, s * 0.275, R * 0.80 + 0.018, 0.040));
    ich.add(donacha(0.030, tiq, s * 0.215, R * 0.80 + 0.070, -0.040));
    ich.add(donacha(0.030, tiq, s * 0.275, R * 0.80 + 0.018, -0.040));
  });

  // Tosh uyasi — halqa tepasidagi kengaygan kosacha.
  var UY = R + 0.100;
  var uya = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.135, 0.110, 18), kum);
  uya.position.set(0, UY, 0);
  ich.add(uya);
  // Uya ostidagi burma halqa.
  var burma = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.024, 8, 20), tiq);
  burma.rotation.x = Math.PI / 2;
  burma.position.y = UY - 0.055;
  ich.add(burma);

  // To‘rt panja — toshni ushlab turadigan tirgaklar.
  for (var j = 0; j < 4; j++) {
    var b = Math.PI / 4 + (j / 4) * Math.PI * 2;
    var panja = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.036, 0.190, 8), kum);
    panja.position.set(Math.cos(b) * 0.150, UY + 0.075, Math.sin(b) * 0.150);
    panja.rotation.z = -Math.cos(b) * 0.30;
    panja.rotation.x = Math.sin(b) * 0.30;
    ich.add(panja);
    // Panja uchidagi tirnoqcha.
    ich.add(donacha(0.030, kum, Math.cos(b) * 0.128, UY + 0.168, Math.sin(b) * 0.128));
  }

  // Aqiq tosh — sakkiz yoqli, biroz bosilgan.
  var tosh = new THREE.Mesh(new THREE.OctahedronGeometry(0.185, 0), aqiq);
  tosh.scale.set(1, 0.72, 1);
  tosh.rotation.y = Math.PI / 4;
  tosh.position.set(0, UY + 0.098, 0);
  ich.add(tosh);

  // Tosh atrofidagi oltin uzuk-hoshiya.
  var hoshiya = new THREE.Mesh(new THREE.TorusGeometry(0.150, 0.016, 6, 20), oltinMat());
  hoshiya.rotation.x = Math.PI / 2;
  hoshiya.position.y = UY + 0.052;
  ich.add(hoshiya);

  return tayyorla(ich, 1.2, false, 'uzuk');
}

/* =========================================================
   A3. KASHTALI PESHGIR — kashtachilik
   Uzun va tor kashta paneli: oq mato zamin, uzunasiga ikki chetida
   qizil va ko‘k hoshiya chiziqlari, o‘rtasida navbatma-navbat qizil
   va ko‘k «bodom» (paisley) naqshlar qatori. Bir chetida jun popuklar.
   ========================================================= */
export function peshgirYasa() {
  var ich = new THREE.Group();
  var oq = matoMat(RANG.matoOq);
  var qizil = matoMat(RANG.matoQizil);
  var kok = matoMat(RANG.matoKok);

  var EN = 1.90, BOY = 0.44;             // mato o‘lchami

  // Oq mato zamin.
  ich.add(plita(EN, 0.020, BOY, oq, 0, 0.010, 0));

  // Uzunasiga ketgan hoshiya chiziqlari: qizil tashqarida, ko‘k ichkarida.
  [1, -1].forEach(function (s) {
    ich.add(plita(EN, 0.010, 0.052, qizil, 0, 0.025, s * (BOY / 2 - 0.032)));
    ich.add(plita(EN, 0.010, 0.024, kok, 0, 0.026, s * (BOY / 2 - 0.082)));
  });

  // Hoshiya ustidagi mayda tugmalar — kashta chokining ritmi.
  for (var i = 0; i < 24; i++) {
    var tx = -0.90 + i * 0.0783;
    ich.add(donacha(0.016, kok, tx, 0.032, BOY / 2 - 0.032));
    ich.add(donacha(0.016, kok, tx, 0.032, -(BOY / 2 - 0.032)));
  }

  // Bir «bodom» naqsh: yassilangan tana + qayrilgan uchi + ichki ko‘zcha.
  function bodom(mat, ichMat) {
    var g = new THREE.Group();
    var tana = new THREE.Mesh(new THREE.SphereGeometry(0.105, 14, 10), mat);
    tana.scale.set(1.05, 0.28, 0.72);
    g.add(tana);

    var uch = new THREE.Mesh(new THREE.ConeGeometry(0.062, 0.180, 10), mat);
    uch.scale.set(0.36, 1, 1);            // lokal X — burilgandan keyin qalinlik
    uch.rotation.z = -Math.PI / 2;
    uch.position.set(0.150, -0.004, 0);
    g.add(uch);

    // Bodom ichidagi kichik gul — qarama-qarshi rang.
    var koz = new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 8), ichMat);
    koz.scale.set(1, 0.42, 0.9);
    koz.position.set(-0.014, 0.024, 0);
    g.add(koz);
    g.add(donacha(0.020, ichMat, 0.072, 0.028, 0));
    return g;
  }

  // O‘rtadagi bodomlar qatori — navbatma-navbat qizil va ko‘k,
  // uchlari navbat bilan qarama-qarshi tomonga qaraydi.
  for (var b = 0; b < 7; b++) {
    var juft = (b % 2 === 0);
    var g = bodom(juft ? qizil : kok, juft ? kok : qizil);
    g.position.set(-0.78 + b * 0.26, 0.030, 0);
    g.rotation.y = juft ? 0.22 : Math.PI - 0.22;
    ich.add(g);
  }

  // Bodomlar orasidagi kichik ko‘k novdalar.
  for (var n = 0; n < 6; n++) {
    var nx = -0.65 + n * 0.26;
    var novda = plita(0.030, 0.008, 0.120, kok, nx, 0.028, 0);
    novda.rotation.y = 0.5;
    ich.add(novda);
  }

  // Bir chetdagi popuklar — asos iplarining uchlari.
  var pop = matoMat(RANG.matoQizil);
  for (var p = 0; p < 11; p++) {
    var pz = -0.17 + p * 0.034;
    var ip = plita(0.150, 0.012, 0.016, pop, -(EN / 2) - 0.072, 0.008, pz);
    ich.add(ip);
    ich.add(donacha(0.020, pop, -(EN / 2) - 0.148, 0.010, pz));
  }

  return tayyorla(ich, 1.2, true, 'peshgir');
}

/* =========================================================
   A4. GANCH PANJARA — ganchkorlik
   O‘yma gips deraza to‘ri: oq ganch ramka, ichida girih to‘ri.
   Gorizontal, vertikal va ikki yo‘nalishdagi diagonal tayoqchalar
   kesishib sakkiz burchakli yulduzlar hosil qiladi; kesishmalarda
   sakkiz qirrali past yulduzchalar o‘tiradi.
   ========================================================= */
export function panjaraYasa() {
  var ich = new THREE.Group();
  var oq = ganchMat(RANG.ganch);
  var soya = ganchMat(RANG.ganchSoya);
  var oyiq = ganchMat(RANG.ganchOyiq);

  var YARIM = 0.75;                      // ramkaning tashqi yarim o‘lchami
  var RE = 0.15;                         // ramka eni
  var ICH = YARIM - RE;                  // ichki maydonning yarim o‘lchami (0.60)

  // Ramkaning to‘rt plitasi.
  var chet = YARIM - RE / 2;
  ich.add(plita(2 * YARIM, 0.100, RE, oq, 0, 0.050, chet));
  ich.add(plita(2 * YARIM, 0.100, RE, oq, 0, 0.050, -chet));
  ich.add(plita(RE, 0.100, 2 * ICH, oq, chet, 0.050, 0));
  ich.add(plita(RE, 0.100, 2 * ICH, oq, -chet, 0.050, 0));

  // Ramka ichidagi o‘yiq hoshiya chizig‘i.
  ich.add(plita(2 * ICH + 0.05, 0.020, 0.030, oyiq, 0, 0.101, ICH + 0.025));
  ich.add(plita(2 * ICH + 0.05, 0.020, 0.030, oyiq, 0, 0.101, -(ICH + 0.025)));
  ich.add(plita(0.030, 0.020, 2 * ICH + 0.05, oyiq, ICH + 0.025, 0.101, 0));
  ich.add(plita(0.030, 0.020, 2 * ICH + 0.05, oyiq, -(ICH + 0.025), 0.101, 0));

  // To‘r ortidagi soya qatlami — o‘yiq chuqurligini ko‘rsatadi.
  ich.add(plita(2 * ICH, 0.016, 2 * ICH, soya, 0, 0.012, 0));

  var TQ = 0.048;                        // tayoqcha qalinligi
  var TY = 0.056;                        // tayoqcha balandligi

  // Gorizontal (x bo‘ylab) va vertikal (z bo‘ylab) tayoqchalar — 5 tadan.
  for (var i = 0; i < 5; i++) {
    var t = -ICH + i * (2 * ICH / 4);
    ich.add(plita(2 * ICH, TY, TQ, oq, 0, 0.050, t));
    ich.add(plita(TQ, TY, 2 * ICH, oq, t, 0.050, 0));
  }

  // Diagonal tayoqchalar — ikki yo‘nalishda, kvadrat ichiga sig‘adigan uzunlikda.
  [Math.PI / 4, -Math.PI / 4].forEach(function (burilish) {
    var yon = new THREE.Vector3(Math.sin(burilish), 0, Math.cos(burilish));
    for (var d = -2; d <= 2; d++) {
      var siljish = d * 0.30;
      var uzun = 2 * Math.SQRT2 * ICH - 2 * Math.abs(siljish);
      if (uzun < 0.14) continue;
      var bar = plita(uzun, TY - 0.010, TQ - 0.006, oq,
        yon.x * siljish, 0.046, yon.z * siljish);
      bar.rotation.y = burilish;
      ich.add(bar);
    }
  });

  // Kesishmalardagi sakkiz qirrali yulduzchalar (juda past konuslar).
  for (var a = 0; a < 5; a++) {
    for (var b = 0; b < 5; b++) {
      var x = -ICH + a * (2 * ICH / 4);
      var z = -ICH + b * (2 * ICH / 4);
      var kesim = ((a + b) % 2 === 0) ? 0.082 : 0.058;
      var yul = new THREE.Mesh(new THREE.ConeGeometry(kesim, 0.046, 8), oq);
      yul.position.set(x, 0.086, z);
      yul.rotation.y = Math.PI / 8;
      ich.add(yul);
    }
  }

  // Ramka burchaklaridagi kichik rozetkalar.
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (k) {
    var r = new THREE.Mesh(new THREE.ConeGeometry(0.060, 0.040, 8), oq);
    r.position.set(k[0] * chet, 0.104, k[1] * chet);
    r.rotation.y = Math.PI / 8;
    ich.add(r);
  });

  return tayyorla(ich, 1.2, true, 'panjara');
}

/* =========================================================
   A5. NAQSHIN USTUN — naqqoshlik
   Masjid va ayvonlarda uchraydigan o‘yma yog‘och ustun: tosh poydevor,
   novchali (yo‘l-yo‘l o‘yiqli) uzun tana, ko‘k-oltin naqsh halqalari va
   uch qavatli muqarnas sarlavha. Ustun tik turadi, balandligi eng katta
   o‘lchamdir.
   ========================================================= */
export function ustunYasa() {
  var ich = new THREE.Group();
  var yog = yogochMat(RANG.yogoch);
  var yogT = yogochMat(RANG.yogochTiq);
  var yogO = yogochMat(RANG.yogochOch);
  var kokM = matoMat(RANG.kok);
  var oltM = oltinMat();

  /* --- Tosh poydevor --- */
  var poy = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.46, 0.30, 16), ganchMat(RANG.ganchOyiq));
  poy.position.y = 0.15;
  ich.add(poy);
  ich.add(halqa(0.305, 0.036, 0.302, ganchMat(RANG.ganchSoya), 18));

  // Poydevor ustidagi yog‘och tovon.
  var tovon = new THREE.Mesh(new THREE.CylinderGeometry(0.255, 0.290, 0.140, 16), yogT);
  tovon.position.y = 0.400;
  ich.add(tovon);

  /* --- Ustun tanasi --- */
  var TAG = 0.470, BOY = 1.72;           // tananing boshlanishi va uzunligi
  var tana = new THREE.Mesh(new THREE.CylinderGeometry(0.190, 0.225, BOY, 20), yog);
  tana.position.y = TAG + BOY / 2;
  ich.add(tana);

  // Vertikal yassi tirqishlar — o‘yma novchalar (12 ta).
  for (var i = 0; i < 12; i++) {
    var a = (i / 12) * Math.PI * 2;
    var nov = plita(0.036, BOY - 0.30, 0.055, yogT,
      Math.cos(a) * 0.204, TAG + BOY / 2, Math.sin(a) * 0.204);
    nov.rotation.y = -a;
    ich.add(nov);
  }

  // Tana bo‘ylab yupqa halqalar — spiral novchani bo‘luvchi bandlar.
  [0.10, 0.32, 0.54, 0.76, 0.92].forEach(function (t, k) {
    var y = TAG + BOY * t;
    var r = 0.225 - (0.035 * t);
    ich.add(halqa(r + 0.014, 0.020, y, k % 2 === 0 ? yogT : yogO, 20));
  });

  // Tanadagi ko‘k va oltin bo‘yalgan naqsh halqalari (sarlavha ostida).
  var SB = TAG + BOY;                    // tananing tepasi
  ich.add(halqa(0.206, 0.030, SB - 0.20, kokM, 20));
  ich.add(halqa(0.212, 0.020, SB - 0.13, oltM, 20));
  ich.add(halqa(0.206, 0.030, SB - 0.06, kokM, 20));

  // Ko‘k halqa ustidagi oltin nuqtalar — islimiy naqsh ritmi.
  var oltDon = oltM;
  aylanaBoylab(ich, 12, 0.212, SB - 0.20, function () {
    return new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), oltDon);
  });

  /* --- Muqarnas sarlavha: uch qavat kengayuvchi --- */
  var qavatlar = [
    { y: SB + 0.075, r1: 0.215, r2: 0.290, h: 0.150, soni: 8,  kr: 0.070, mat: yogO },
    { y: SB + 0.230, r1: 0.290, r2: 0.375, h: 0.160, soni: 10, kr: 0.078, mat: yog },
    { y: SB + 0.395, r1: 0.375, r2: 0.470, h: 0.170, soni: 12, kr: 0.084, mat: yogO }
  ];
  qavatlar.forEach(function (q, k) {
    var gavda = new THREE.Mesh(new THREE.CylinderGeometry(q.r2, q.r1, q.h, 20), q.mat);
    gavda.position.y = q.y;
    ich.add(gavda);

    // Har qavat aylanasi bo‘ylab kichik muqarnas kosachalari.
    var m = (k === 1) ? kokM : yogT;
    aylanaBoylab(ich, q.soni, (q.r1 + q.r2) / 2 + 0.036, q.y, function () {
      var kos = new THREE.Mesh(new THREE.ConeGeometry(q.kr, q.h * 0.86, 8), m);
      kos.rotation.x = Math.PI;          // uchi pastga — muqarnas «tomchisi»
      return kos;
    });
    // Qavat orasidagi bo‘g‘iz halqasi.
    ich.add(halqa(q.r2 + 0.010, 0.018, q.y + q.h / 2, k === 1 ? oltM : yogT, 20));
  });

  // Sarlavha tepasidagi to‘rtburchak abaka (bosh taxta) va uning naqshi.
  var TY = SB + 0.500;
  ich.add(plita(1.00, 0.090, 1.00, yog, 0, TY + 0.045, 0));
  ich.add(plita(0.86, 0.030, 0.86, kokM, 0, TY + 0.104, 0));
  ich.add(plita(0.60, 0.030, 0.60, oltM, 0, TY + 0.112, 0));
  // Abaka burchaklaridagi kichik yulduzchalar.
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (b) {
    var y = new THREE.Mesh(new THREE.ConeGeometry(0.078, 0.055, 8), oltM);
    y.position.set(b[0] * 0.360, TY + 0.118, b[1] * 0.360);
    y.rotation.y = Math.PI / 8;
    ich.add(y);
  });

  return tayyorla(ich, 1.2, false, 'ustun');
}

/* =========================================================
   A6. TO‘QIMA XURJUN — gilamdo‘zlik
   Ot yoki eshak egariga tashlanadigan qo‘sh qop. Ikki bir xil qop
   to‘qima tasma bilan bog‘langan; har qopning yuzida qizil zaminda
   oq va ko‘k romb medalyonlar qatori, pastki chetida jun popuklar.
   ========================================================= */
export function xurjunYasa() {
  var ich = new THREE.Group();
  var qizil = matoMat(RANG.gilamQiz);
  var oq = matoMat(RANG.matoOq);
  var kok = matoMat(RANG.matoKok);
  var jun = matoMat(RANG.jun);

  var QX = 0.52;                         // qoplar orasidagi masofa (markazdan)

  // Bitta qop: yumaloqlangan gavda + og‘iz qopqog‘i + naqsh + popuk.
  function qop(belgi) {
    var g = new THREE.Group();

    // Gavda — bosilgan sfera (to‘ldirilgan qop shakli).
    var gavda = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), qizil);
    gavda.scale.set(1.0, 1.12, 0.52);
    gavda.position.y = 0.470;
    g.add(gavda);

    // Qopning tekis tubi — yerga tayanadigan yostiq.
    var tub = new THREE.Mesh(new THREE.SphereGeometry(0.36, 14, 8), qizil);
    tub.scale.set(1.05, 0.30, 0.56);
    tub.position.y = 0.115;
    g.add(tub);

    // Og‘iz qopqog‘i — ochroq to‘qima.
    var qopqoq = new THREE.Mesh(new THREE.SphereGeometry(0.40, 16, 8, 0, Math.PI * 2, 0, 0.9), jun);
    qopqoq.scale.set(1.02, 0.55, 0.56);
    qopqoq.position.y = 0.760;
    g.add(qopqoq);
    g.add(plita(0.62, 0.040, 0.30, kok, 0, 0.795, 0));

    // Old va orqa yuzadagi romb medalyonlar qatori.
    [1, -1].forEach(function (s) {
      var z = s * 0.230;
      [-0.20, 0, 0.20].forEach(function (dx, k) {
        var katta = (k === 1);
        g.add(romb(katta ? 0.24 : 0.18, 0.020, katta ? oq : kok, dx, 0.470, z));
        g.add(romb(katta ? 0.13 : 0.09, 0.020, katta ? kok : oq, dx, 0.470, z + s * 0.012));
      });
      // Medalyonlar ostidagi oq to‘qima chizig‘i.
      g.add(plita(0.62, 0.016, 0.030, oq, 0, 0.215, z));
      g.add(plita(0.62, 0.016, 0.030, oq, 0, 0.700, z));
    });

    // Pastki chetdagi jun popuklar.
    popukQatori(g, 7, jun, -0.27, 0.09, 0.075, 0.12, 0.15);
    popukQatori(g, 7, jun, -0.27, 0.09, 0.075, -0.12, 0.15);

    g.name = 'xurjun-qop-' + belgi;
    return g;
  }

  var chap = qop('chap');
  chap.position.x = -QX;
  ich.add(chap);

  var ong = qop('ong');
  ong.position.x = QX;
  ich.add(ong);

  // Ikki qopni bog‘lovchi to‘qima tasma.
  ich.add(plita(2 * QX - 0.26, 0.075, 0.34, qizil, 0, 0.830, 0));
  // Tasmadagi to‘qima chiziqlari.
  [0.12, -0.12].forEach(function (z) {
    ich.add(plita(2 * QX - 0.26, 0.030, 0.045, oq, 0, 0.872, z));
  });
  for (var i = 0; i < 5; i++) {
    ich.add(romb(0.10, 0.024, kok, -0.16 + i * 0.08, 0.876, 0));
  }

  // Tasmaning ikki uchidagi tikuv bandlari.
  [1, -1].forEach(function (s) {
    ich.add(plita(0.070, 0.110, 0.36, jun, s * (QX - 0.14), 0.828, 0));
  });

  return tayyorla(ich, 1.2, false, 'xurjun');
}


/* =========================================================
   =============  B QISM: USTAXONA JOYLARI  =================
   Har biri o‘yin dunyosi o‘lchamida qoladi (miqyoslanmaydi).
   userData.qoyish — mahsulot qo‘yiladigan nuqta,
   userData.rang   — hunarga xos rang (yorug‘lik/belgi uchun).
   ========================================================= */

/* =========================================================
   B1. KULOLCHILIK CHARXI
   Yog‘och ramka ichida tik o‘q; pastda oyoq bilan aylantiriladigan
   katta g‘ildirak, tepada charx boshi. Yonda loy bo‘lagi, suv kosasi
   va tayyor idishlar turgan taxta.
   userData.aylanuvchi — o‘q, g‘ildirak va bosh shu guruhda: Y o‘qi
   atrofida aylantirilsa charx harakatga keladi.
   ========================================================= */
export function kulolCharxiYasa() {
  var ich = new THREE.Group();
  var yog = yogochMat(RANG.yogoch);
  var yogT = yogochMat(RANG.yogochTiq);
  var yogO = yogochMat(RANG.yogochOch);

  var OX = -0.42;                        // charx o‘qining x o‘rni
  var POST = 1.16;                       // ramka ustunlarining balandligi

  /* --- Ramka --- */
  // Yerdagi asos taxtalari.
  ich.add(plita(1.10, 0.09, 0.94, yogT, OX, 0.045, 0));
  // To‘rtta vertikal ustun.
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (b) {
    ich.add(plita(0.10, POST, 0.10, yog, OX + b[0] * 0.44, POST / 2, b[1] * 0.36));
  });
  // Tepadagi ko‘ndalang taxtalar (o‘q shu yerdan o‘tadi).
  ich.add(plita(1.02, 0.09, 0.13, yog, OX, POST - 0.045, 0.36));
  ich.add(plita(1.02, 0.09, 0.13, yog, OX, POST - 0.045, -0.36));
  ich.add(plita(0.13, 0.09, 0.82, yog, OX + 0.44, POST - 0.045, 0));
  ich.add(plita(0.13, 0.09, 0.82, yog, OX - 0.44, POST - 0.045, 0));
  // O‘qning yostiq podshipnigi.
  var yostiq = plita(0.30, 0.10, 0.30, yogT, OX, POST - 0.045, 0);
  ich.add(yostiq);
  // Oyoq tayanchi — kulol shu taxtaga oyoq qo‘yadi.
  ich.add(plita(0.62, 0.06, 0.16, yogO, OX + 0.10, 0.34, 0.42));

  /* --- Aylanuvchi qism: o‘q + katta g‘ildirak + charx boshi --- */
  var aylanuvchi = new THREE.Group();
  aylanuvchi.name = 'charx-aylanuvchi';
  aylanuvchi.position.set(OX, 0, 0);

  // Tik o‘q.
  aylanuvchi.add(tayoq(0.055, 1.22, yogT, 0, 0.61, 0, 14));

  // Katta g‘ildirak (mayaklik) — pastda, oyoq bilan tepiladi.
  aylanuvchi.add(disk(0.46, 0.085, yog, 0, 0.24, 0, 24));
  aylanuvchi.add(halqa(0.455, 0.045, 0.24, yogT, 24));
  aylanuvchi.add(disk(0.13, 0.11, yogT, 0, 0.24, 0, 14));
  // Spitsalar — g‘ildirakning oltita tirgagi.
  for (var s = 0; s < 6; s++) {
    var a = (s / 6) * Math.PI;
    var sp = plita(0.86, 0.045, 0.070, yogO, 0, 0.24, 0);
    sp.rotation.y = a;
    aylanuvchi.add(sp);
  }
  // G‘ildirak ustidagi og‘irlik toshlari — charx uzoq aylanishi uchun.
  aylanaBoylab(aylanuvchi, 4, 0.34, 0.30, function () {
    return new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8), ganchMat(RANG.ganchOyiq));
  });

  // Charx boshi — loy shu doiraga qo‘yiladi.
  var BOSH = 1.22;
  aylanuvchi.add(disk(0.27, 0.070, yogO, 0, BOSH - 0.035, 0, 22));
  aylanuvchi.add(halqa(0.265, 0.026, BOSH - 0.070, yogT, 22));
  aylanuvchi.add(disk(0.115, 0.050, yogT, 0, BOSH - 0.090, 0, 16));
  // Charx boshidagi markaziy belgi halqasi.
  aylanuvchi.add(halqa(0.140, 0.012, BOSH + 0.002, yogT, 18));

  ich.add(aylanuvchi);

  /* --- Yonidagi ish taxtasi va idishlar --- */
  var TX = 0.95, TB = 0.80;              // taxtaning x o‘rni va balandligi
  var taxta = stolYasa(0.90, 0.76, TB, 0.07, yogO, yogT);
  taxta.position.x = TX;
  ich.add(taxta);

  // Tayyor sopol idishlar — taxtaning orqa qatorida.
  var sop = sopolMat(RANG.sopol, true);
  var koza = charx([
    [0.000, 0.000], [0.090, 0.000], [0.130, 0.020], [0.165, 0.080],
    [0.175, 0.150], [0.150, 0.215], [0.100, 0.255], [0.088, 0.290],
    [0.104, 0.310], [0.078, 0.318], [0.070, 0.262], [0.000, 0.252]
  ], 18, sop);
  koza.position.set(TX - 0.24, TB, -0.20);
  ich.add(koza);
  ich.add(halqaXZ(0.090, 0.016, sopolMat(RANG.sopolTiq), TX - 0.24, TB + 0.012, -0.20, 16));

  var kosa = charx([
    [0.000, 0.000], [0.070, 0.000], [0.130, 0.030], [0.170, 0.090],
    [0.182, 0.140], [0.168, 0.150], [0.150, 0.100], [0.110, 0.052],
    [0.060, 0.032], [0.000, 0.028]
  ], 18, sop);
  kosa.position.set(TX + 0.20, TB, -0.19);
  ich.add(kosa);

  var xum = charx([
    [0.000, 0.000], [0.085, 0.000], [0.145, 0.055], [0.170, 0.140],
    [0.150, 0.215], [0.105, 0.250], [0.118, 0.268], [0.092, 0.272],
    [0.086, 0.238], [0.000, 0.230]
  ], 18, sopolMat(RANG.sopolTiq, true));
  xum.position.set(TX - 0.02, TB, -0.24);
  ich.add(xum);

  // Loy bo‘lagi — taxtaning old chetida, yopilgan latta bilan.
  var loy = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10), sopolMat(RANG.loy));
  loy.scale.set(1, 0.82, 0.92);
  loy.position.set(TX - 0.26, TB + 0.13, 0.20);
  ich.add(loy);
  ich.add(donacha(0.075, sopolMat(RANG.loy), TX - 0.10, TB + 0.075, 0.26));

  // Suv kosasi — kulol qo‘lini ho‘llaydigan idish.
  var suvKosa = charx([
    [0.000, 0.000], [0.080, 0.000], [0.150, 0.035], [0.185, 0.105],
    [0.192, 0.150], [0.176, 0.152], [0.166, 0.105], [0.132, 0.052],
    [0.070, 0.028], [0.000, 0.024]
  ], 18, sopolMat(RANG.sopolTiq, true));
  suvKosa.position.set(TX + 0.24, TB, 0.19);
  ich.add(suvKosa);
  ich.add(disk(0.155, 0.012, matoMat(RANG.kokOch), TX + 0.24, TB + 0.105, 0.19, 18));

  // Charx yonidagi loy tayyorlash taxtachasi.
  ich.add(plita(0.44, 0.045, 0.34, yogO, OX - 0.06, 0.42, -0.44));

  var tashqi = markazlaVaTur(ich, 'kulol-charxi');
  tashqi.userData.aylanuvchi = aylanuvchi;
  tashqi.userData.charxBoshi = nuqta(tashqi, OX, BOSH, 0);
  tashqi.userData.qoyish = nuqta(tashqi, TX + 0.02, TB + 0.04, 0.06);
  tashqi.userData.rang = 0xC1502E;
  tashqi.userData.hunar = 'Kulolchilik';
  return tashqi;
}

/* =========================================================
   B2. ZARGARLIK STOLI
   Past yog‘och stol: ustida kichik po‘lat sandon, bolg‘a, qisqichlar,
   kumush sim g‘altagi, toshchalar solingan kosacha va spirtovka.
   Orqasida asboblar osilgan taxta rack.
   ========================================================= */
export function zargarStoliYasa() {
  var ich = new THREE.Group();
  var yog = yogochMat(RANG.yogoch);
  var yogT = yogochMat(RANG.yogochTiq);
  var pol = polatMat(RANG.polat);
  var polT = polatMat(RANG.polatTiq);
  var kum = kumushMat();

  var EN = 2.20, BOY = 0.90, BAL = 0.78;
  var U = BAL + 0.005;                   // stol ustki yuzasi

  var stol = stolYasa(EN, BOY, BAL, 0.09, yog, yogT);
  ich.add(stol);
  // Stol yuzasidagi ish tagligi — charm parcha.
  ich.add(plita(0.80, 0.014, 0.52, matoMat(RANG.yogochTiq), 0.15, U + 0.007, 0.06));

  /* --- Orqadagi asbob taxtasi --- */
  ich.add(plita(EN - 0.20, 0.66, 0.05, yogT, 0, U + 0.33, -BOY / 2 + 0.05));
  ich.add(plita(EN - 0.20, 0.06, 0.16, yog, 0, U + 0.60, -BOY / 2 + 0.12));
  // Taxtaga osilgan uch dona jimjimador asbob.
  for (var t = 0; t < 5; t++) {
    var tx = -0.72 + t * 0.30;
    ich.add(tayoq(0.016, 0.34, polT, tx, U + 0.30, -BOY / 2 + 0.10, 8));
    ich.add(donacha(0.034, polT, tx, U + 0.12, -BOY / 2 + 0.10));
  }

  /* --- Kichik po‘lat sandon --- */
  var SX = -0.66;
  ich.add(plita(0.42, 0.10, 0.36, yogT, SX, U + 0.05, 0.02));      // kunda taxtasi
  var sandonPoy = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 0.14, 4), pol);
  sandonPoy.rotation.y = Math.PI / 4;
  sandonPoy.position.set(SX, U + 0.17, 0.02);
  ich.add(sandonPoy);
  ich.add(plita(0.34, 0.09, 0.20, pol, SX, U + 0.285, 0.02));       // sandon yuzasi
  // Sandonning shoxli uchi.
  var shox = new THREE.Mesh(new THREE.ConeGeometry(0.070, 0.22, 12), pol);
  shox.rotation.z = -Math.PI / 2;
  shox.position.set(SX + 0.27, U + 0.285, 0.02);
  ich.add(shox);

  /* --- Kichkina bolg‘a --- */
  var bolgaDasta = tayoq(0.024, 0.40, yog, -0.14, U + 0.035, 0.26, 10);
  bolgaDasta.rotation.z = Math.PI / 2;
  bolgaDasta.rotation.y = 0.28;
  ich.add(bolgaDasta);
  var bolgaBosh = tayoq(0.052, 0.17, polT, 0.05, U + 0.055, 0.32, 12);
  bolgaBosh.rotation.z = Math.PI / 2;
  bolgaBosh.rotation.y = 0.28;
  ich.add(bolgaBosh);
  ich.add(disk(0.056, 0.030, pol, 0.14, U + 0.055, 0.335, 12).rotateZ(Math.PI / 2));

  /* --- Qisqichlar (ikki dona, ochiq holatda) --- */
  [[-0.34, 0.34, 0.35], [-0.30, -0.30, -0.30]].forEach(function (q) {
    var g = new THREE.Group();
    [1, -1].forEach(function (s) {
      var band = plita(0.30, 0.016, 0.026, pol, 0, 0, s * 0.030);
      band.rotation.y = s * 0.16;
      g.add(band);
    });
    g.add(donacha(0.026, polT, -0.14, 0, 0));
    g.position.set(q[0], U + 0.014, q[2]);
    g.rotation.y = q[1];
    ich.add(g);
  });

  /* --- Kumush sim g‘altagi --- */
  var GX = 0.52;
  var galtak = tayoq(0.085, 0.16, yogT, GX, U + 0.09, -0.16, 14);
  galtak.rotation.z = Math.PI / 2;
  ich.add(galtak);
  [0.09, -0.09].forEach(function (dx) {
    var flans = disk(0.135, 0.020, yog, GX + dx, U + 0.09, -0.16, 16);
    flans.rotation.z = Math.PI / 2;
    ich.add(flans);
  });
  // O‘ralgan kumush sim — g‘altak ustidagi halqalar.
  for (var w = 0; w < 5; w++) {
    var sim = new THREE.Mesh(new THREE.TorusGeometry(0.100, 0.010, 6, 18), kum);
    sim.rotation.y = Math.PI / 2;
    sim.position.set(GX - 0.06 + w * 0.03, U + 0.09, -0.16);
    ich.add(sim);
  }
  // Stolga tushgan sim uchi.
  var uch = tayoq(0.008, 0.30, kum, GX - 0.16, U + 0.010, -0.02, 6);
  uch.rotation.z = Math.PI / 2;
  uch.rotation.y = 0.7;
  ich.add(uch);

  /* --- Mayda toshchalar solingan kosacha --- */
  var KX = 0.90;
  var kosa = charx([
    [0.000, 0.000], [0.060, 0.000], [0.115, 0.026], [0.145, 0.072],
    [0.152, 0.100], [0.138, 0.102], [0.128, 0.070], [0.098, 0.040],
    [0.052, 0.022], [0.000, 0.020]
  ], 18, sopolMat(RANG.ganchOyiq, true));
  kosa.position.set(KX, U, 0.20);
  ich.add(kosa);
  [[0.00, 0.00, RANG.tosh], [0.055, 0.03, RANG.feruza], [-0.05, -0.04, RANG.tosh],
   [0.02, -0.06, RANG.oltin], [-0.03, 0.055, RANG.feruza]].forEach(function (d) {
    ich.add(donacha(0.030, toshMat(d[2]), KX + d[0], U + 0.050, 0.20 + d[1]));
  });

  /* --- Spirtovka (kichik chiroq) --- */
  var PX = 0.86;
  ich.add(tayoq(0.090, 0.16, misMat(RANG.mis), PX, U + 0.08, -0.24, 14));
  ich.add(halqaXZ(0.092, 0.014, misMat(RANG.misTiq), PX, U + 0.160, -0.24, 14));
  ich.add(tayoq(0.026, 0.09, misMat(RANG.misTiq), PX, U + 0.205, -0.24, 10));
  var alanga = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.150, 10), nurMat(RANG.alanga, 0.9));
  alanga.position.set(PX, U + 0.325, -0.24);
  ich.add(alanga);
  var ichAlanga = new THREE.Mesh(new THREE.ConeGeometry(0.020, 0.075, 8), nurMat(RANG.kokOch, 1.0));
  ichAlanga.position.set(PX, U + 0.290, -0.24);
  ich.add(ichAlanga);

  // Stol ostidagi kul yig‘gich tortmasi.
  ich.add(plita(0.62, 0.10, 0.44, yogT, 0.15, 0.44, 0.04));

  var tashqi = markazlaVaTur(ich, 'zargar-stoli');
  tashqi.userData.qoyish = nuqta(tashqi, 0.18, U + 0.03, 0.10);
  tashqi.userData.rang = 0xC9CDD4;
  tashqi.userData.hunar = 'Zargarlik';
  return tashqi;
}

/* =========================================================
   B3. KASHTA DOIRASI
   Uch oyoqli yog‘och tagkursi ustida katta yumaloq kashta doirasi:
   ikki halqa orasiga oq mato tortilgan, matoda yarim tugallangan
   qizil-ko‘k naqsh. Yonida ip g‘altaklari va igna yostiqchasi.
   ========================================================= */
export function kashtaDoirasiYasa() {
  var ich = new THREE.Group();
  var yog = yogochMat(RANG.yogoch);
  var yogT = yogochMat(RANG.yogochTiq);
  var oq = matoMat(RANG.matoOq);
  var qizil = matoMat(RANG.matoQizil);
  var kok = matoMat(RANG.matoKok);

  var DX = -0.28;                        // doiraning x o‘rni
  var HUB = 0.52;                        // uch oyoq tutashadigan balandlik

  /* --- Uch oyoqli tagkursi --- */
  for (var i = 0; i < 3; i++) {
    var a = (i / 3) * Math.PI * 2 + Math.PI / 6;
    var oyoq = tayoq(0.050, 0.62, yog, DX + Math.cos(a) * 0.24, HUB / 2 + 0.02, Math.sin(a) * 0.24, 10);
    oyoq.rotation.z = -Math.cos(a) * 0.32;
    oyoq.rotation.x = Math.sin(a) * 0.32;
    ich.add(oyoq);
    // Oyoq tagidagi tayanch.
    ich.add(donacha(0.055, yogT, DX + Math.cos(a) * 0.40, 0.045, Math.sin(a) * 0.40));
  }
  // Oyoqlarni bog‘lovchi halqa.
  ich.add(halqaXZ(0.270, 0.024, yogT, DX, 0.20, 0, 16));
  // Tepadagi tutash tugun.
  ich.add(donacha(0.105, yogT, DX, HUB, 0));
  // Tugundan doiraga ko‘tariluvchi ustun.
  ich.add(tayoq(0.048, 0.24, yog, DX, HUB + 0.11, 0, 12));
  // Doirani ushlab turadigan qisqich.
  ich.add(plita(0.16, 0.10, 0.14, yogT, DX, HUB + 0.24, 0));

  /* --- Kashta doirasi (tik turadi, XY tekisligida) --- */
  var R = 0.42, MY = HUB + 0.24 + R - 0.06;

  // Oq mato disk — ikki halqa orasidagi tortilgan mato.
  var mato = disk(R - 0.012, 0.020, oq, DX, MY, 0, 30);
  mato.rotation.x = Math.PI / 2;
  ich.add(mato);

  // Ichki va tashqi halqalar.
  var ichHalqa = new THREE.Mesh(new THREE.TorusGeometry(R - 0.030, 0.038, 10, 32), yog);
  ichHalqa.position.set(DX, MY, -0.026);
  ich.add(ichHalqa);
  var tashHalqa = new THREE.Mesh(new THREE.TorusGeometry(R, 0.046, 10, 32), yogT);
  tashHalqa.position.set(DX, MY, 0.026);
  ich.add(tashHalqa);
  // Halqani qisadigan vint.
  ich.add(tayoq(0.030, 0.12, polatMat(RANG.polatTiq), DX, MY + R + 0.045, 0, 10));
  ich.add(donacha(0.040, polatMat(RANG.polat), DX, MY + R + 0.105, 0));

  /* --- Matodagi yarim tugallangan naqsh --- */
  // Markaziy rozetka (tugallangan qismi).
  var roz = disk(0.140, 0.014, qizil, DX, MY, 0.024, 20);
  roz.rotation.x = Math.PI / 2;
  ich.add(roz);
  var roz2 = disk(0.070, 0.014, kok, DX, MY, 0.030, 16);
  roz2.rotation.x = Math.PI / 2;
  ich.add(roz2);

  // Rozetka atrofidagi barglar — faqat yarmi tikilgan.
  for (var b = 0; b < 10; b++) {
    var ab = (b / 10) * Math.PI * 2;
    if (ab > Math.PI * 1.05) continue;   // qolgani hali tikilmagan
    var barg = new THREE.Mesh(new THREE.SphereGeometry(0.062, 12, 8), b % 2 ? kok : qizil);
    barg.scale.set(1, 1, 0.22);
    barg.position.set(DX + Math.cos(ab) * 0.235, MY + Math.sin(ab) * 0.235, 0.026);
    ich.add(barg);
  }
  // Chet hoshiya — boshlangan tikuv chizig‘i.
  var hosh = new THREE.Mesh(new THREE.TorusGeometry(0.310, 0.016, 6, 26, Math.PI * 1.15), qizil);
  hosh.position.set(DX, MY, 0.026);
  ich.add(hosh);
  // Tikilayotgan ip va igna — matodan chiqib turadi.
  var ip = tayoq(0.007, 0.26, kok, DX + 0.30, MY - 0.24, 0.09, 6);
  ip.rotation.x = 0.9;
  ip.rotation.z = 0.4;
  ich.add(ip);
  var igna = tayoq(0.008, 0.11, polatMat(RANG.polat), DX + 0.34, MY - 0.36, 0.16, 6);
  igna.rotation.z = 0.5;
  ich.add(igna);

  /* --- Yonidagi past stolcha: ip g‘altaklari va igna yostiqchasi --- */
  var TX = 1.18, TB = 0.56;
  var stolcha = stolYasa(0.62, 0.56, TB, 0.06, yog, yogT);
  stolcha.position.x = TX;
  ich.add(stolcha);

  var iplar = [RANG.matoQizil, RANG.matoKok, RANG.oltin, RANG.yashil, RANG.matoOq];
  iplar.forEach(function (r, k) {
    var gx = TX - 0.20 + (k % 3) * 0.20;
    var gz = -0.13 + Math.floor(k / 3) * 0.24;
    ich.add(tayoq(0.048, 0.13, matoMat(r), gx, TB + 0.065, gz, 12));
    ich.add(disk(0.062, 0.014, yogT, gx, TB + 0.007, gz, 12));
    ich.add(disk(0.062, 0.014, yogT, gx, TB + 0.130, gz, 12));
  });

  // Igna yostiqchasi va undagi ignalar.
  var yost = new THREE.Mesh(new THREE.SphereGeometry(0.095, 14, 10), matoMat(RANG.gilamQiz));
  yost.scale.set(1, 0.72, 1);
  yost.position.set(TX + 0.18, TB + 0.06, 0.16);
  ich.add(yost);
  for (var g = 0; g < 4; g++) {
    var ag = (g / 4) * Math.PI * 2;
    var ign = tayoq(0.006, 0.10, polatMat(RANG.polat),
      TX + 0.18 + Math.cos(ag) * 0.045, TB + 0.13, 0.16 + Math.sin(ag) * 0.045, 6);
    ign.rotation.z = -Math.cos(ag) * 0.5;
    ign.rotation.x = Math.sin(ag) * 0.5;
    ich.add(ign);
  }

  // Stolcha ostidagi savatcha — matolar to‘plami.
  ich.add(plita(0.40, 0.16, 0.34, matoMat(RANG.jun), TX, 0.14, 0.02));
  ich.add(plita(0.36, 0.06, 0.30, matoMat(RANG.matoKok), TX, 0.24, 0.02));

  var tashqi = markazlaVaTur(ich, 'kashta-doirasi');
  tashqi.userData.qoyish = nuqta(tashqi, TX, TB + 0.04, 0.05);
  tashqi.userData.rang = 0x1B3B6F;
  tashqi.userData.hunar = 'Kashtachilik';
  return tashqi;
}

/* =========================================================
   B4. MISGAR SANDONI
   Yer kundasi (yog‘och to‘nka) ustida katta po‘lat sandon: kesik
   piramida gavda va shoxli uchi. Yonida uzun dastali bolg‘a, bukilgan
   mis varaq, ko‘mir o‘chog‘i va qisqich.
   ========================================================= */
export function misgarSandoniYasa() {
  var ich = new THREE.Group();
  var yog = yogochMat(RANG.yogoch);
  var yogT = yogochMat(RANG.yogochTiq);
  var yogO = yogochMat(RANG.yogochOch);
  var pol = polatMat(RANG.polat);
  var polT = polatMat(RANG.polatTiq);

  /* --- Kunda (to‘nka) --- */
  var KX = -0.62, KUN = 0.74;
  var kunda = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, KUN, 18), yogT);
  kunda.position.set(KX, KUN / 2, 0);
  ich.add(kunda);
  // Po‘st halqalari — yog‘och to‘nkaning yillik chiziqlari.
  [0.16, 0.36, 0.58].forEach(function (t) {
    ich.add(halqaXZ(0.335, 0.020, yog, KX, t, 0, 18));
  });
  // Kundani tutib turuvchi temir bandaj.
  ich.add(halqaXZ(0.345, 0.028, polT, KX, KUN - 0.08, 0, 18));

  /* --- Sandon --- */
  var SY = KUN;                          // sandon poydevorining balandligi
  var poy = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.26, 0.16, 4), polT);
  poy.rotation.y = Math.PI / 4;
  poy.position.set(KX, SY + 0.08, 0);
  ich.add(poy);
  // Bel qismi.
  ich.add(plita(0.28, 0.14, 0.20, polT, KX, SY + 0.23, 0));
  // Sandon yuzasi (yuza).
  ich.add(plita(0.70, 0.14, 0.28, pol, KX + 0.02, SY + 0.37, 0));
  // Shoxli uch — mis idish og‘zini shakllantirish uchun.
  var shox = new THREE.Mesh(new THREE.ConeGeometry(0.115, 0.42, 14), pol);
  shox.rotation.z = -Math.PI / 2;
  shox.position.set(KX + 0.56, SY + 0.37, 0);
  ich.add(shox);
  // Qarama-qarshi tomondagi to‘rtburchak dum.
  var dum = plita(0.24, 0.11, 0.11, pol, KX - 0.44, SY + 0.37, 0);
  ich.add(dum);
  // Sandon yuzasidagi teshik (hardi).
  ich.add(plita(0.070, 0.030, 0.070, polT, KX + 0.20, SY + 0.445, 0));

  /* --- Uzun dastali bolg‘a — sandonga suyalgan --- */
  var dasta = tayoq(0.033, 0.86, yog, KX + 0.16, 0.46, 0.40, 10);
  dasta.rotation.x = -0.42;
  dasta.rotation.z = -0.22;
  ich.add(dasta);
  var bosh = tayoq(0.078, 0.26, polT, KX + 0.30, 0.86, 0.24, 12);
  bosh.rotation.z = Math.PI / 2 - 0.22;
  bosh.rotation.y = 0.3;
  ich.add(bosh);
  ich.add(donacha(0.082, pol, KX + 0.42, 0.885, 0.20));

  /* --- Bukilgan mis varaq --- */
  var varaq = new THREE.Mesh(
    new THREE.SphereGeometry(0.46, 22, 8, 0, Math.PI * 2, 0, 0.62),
    misMat(RANG.mis, true)
  );
  varaq.scale.set(1, 0.34, 1);
  varaq.rotation.x = Math.PI;
  varaq.position.set(0.22, 0.72, -0.30);
  ich.add(varaq);
  // Varaqdagi bolg‘a izlari — chertma nuqtalar.
  var izMat = misMat(RANG.misTiq);
  for (var v = 0; v < 12; v++) {
    var av = (v / 12) * Math.PI * 2;
    ich.add(donacha(0.030, izMat, 0.22 + Math.cos(av) * 0.24, 0.735, -0.30 + Math.sin(av) * 0.24));
  }
  ich.add(donacha(0.038, izMat, 0.22, 0.745, -0.30));

  /* --- Varaq turadigan past taxta (mahsulot shu yerga qo‘yiladi) --- */
  var PX = 0.22, PB = 0.62;
  var plank = stolYasa(0.72, 0.66, PB, 0.07, yogO, yogT);
  plank.position.set(PX, 0, -0.02);
  ich.add(plank);

  /* --- Ko‘mir o‘chog‘i --- */
  var OX = 0.90;
  var ochoq = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.38, 0.34, 20), polT);
  ochoq.position.set(OX, 0.17, 0.34);
  ich.add(ochoq);
  ich.add(halqaXZ(0.445, 0.036, polatMat(RANG.qora), OX, 0.32, 0.34, 20));
  // O‘choq ichidagi kul va cho‘g‘lar.
  ich.add(disk(0.395, 0.030, polatMat(RANG.qora), OX, 0.335, 0.34, 20));
  for (var c = 0; c < 11; c++) {
    var ac = (c / 11) * Math.PI * 2;
    var rc = 0.10 + (c % 3) * 0.11;
    var chog = donacha(0.050 + (c % 2) * 0.014, nurMat(RANG.chog, 0.85),
      OX + Math.cos(ac) * rc, 0.360, 0.34 + Math.sin(ac) * rc);
    chog.scale.y = 0.7;
    ich.add(chog);
  }
  ich.add(donacha(0.060, nurMat(RANG.alanga, 1.0), OX, 0.375, 0.34));
  // O‘choqning uch oyog‘i.
  for (var o = 0; o < 3; o++) {
    var ao = (o / 3) * Math.PI * 2;
    ich.add(tayoq(0.030, 0.20, polatMat(RANG.qora),
      OX + Math.cos(ao) * 0.30, 0.10, 0.34 + Math.sin(ao) * 0.30, 8));
  }

  /* --- Asboblar tikkasi: qisqich osilgan yog‘och qoziq --- */
  var QX = -1.06;
  ich.add(tayoq(0.055, 1.34, yog, QX, 0.67, -0.10, 10));
  ich.add(plita(0.34, 0.06, 0.06, yogT, QX + 0.14, 1.28, -0.10));
  // Qisqich — ikki uzun band bir vint bilan tutashgan.
  [1, -1].forEach(function (s) {
    var band = plita(0.058, 0.62, 0.030, polT, QX + 0.24, 0.92, -0.10 + s * 0.035);
    band.rotation.z = s * 0.055;
    ich.add(band);
  });
  ich.add(donacha(0.040, pol, QX + 0.24, 1.20, -0.10));
  // Ikkinchi qisqich — yerda, o‘choq yonida.
  [1, -1].forEach(function (s) {
    var band2 = plita(0.60, 0.028, 0.048, polT, OX - 0.52, 0.030, 0.02 + s * 0.040);
    band2.rotation.y = s * 0.09;
    ich.add(band2);
  });
  ich.add(donacha(0.038, pol, OX - 0.26, 0.034, 0.02));

  var tashqi = markazlaVaTur(ich, 'misgar-sandoni');
  tashqi.userData.qoyish = nuqta(tashqi, PX, PB + 0.04, -0.02);
  tashqi.userData.rang = 0xB87333;
  tashqi.userData.hunar = 'Misgarlik';
  return tashqi;
}

/* =========================================================
   B5. GANCH STOLI
   Ganchkorning ishchi stoli: qiya suyalgan yangi ganch plitasi
   (bir qismida o‘yma naqsh boshlangan), turli o‘yma pichoqlar,
   ganch xamiri solingan tog‘ora va ganch changi uyumchasi.
   ========================================================= */
export function ganchStoliYasa() {
  var ich = new THREE.Group();
  var yog = yogochMat(RANG.yogoch);
  var yogT = yogochMat(RANG.yogochTiq);
  var oq = ganchMat(RANG.ganch);
  var soya = ganchMat(RANG.ganchSoya);
  var oyiq = ganchMat(RANG.ganchOyiq);
  var pol = polatMat(RANG.polat);
  var yogO = yogochMat(RANG.yogochOch);

  var EN = 2.20, BOY = 0.96, BAL = 0.76;
  var U = BAL + 0.005;

  var stol = stolYasa(EN, BOY, BAL, 0.09, yog, yogT);
  ich.add(stol);
  // Stol yuzasiga sepilgan ganch changi qatlami.
  ich.add(plita(EN - 0.16, 0.010, BOY - 0.14, soya, 0, U + 0.006, 0));

  /* --- Qiya suyalgan ganch plitasi --- */
  var GX = -0.58;
  // Tayanch — plitani ushlab turuvchi yog‘och tirgak.
  ich.add(plita(0.92, 0.06, 0.12, yogT, GX, U + 0.03, -0.34));
  var tirgak = plita(0.06, 0.50, 0.10, yogT, GX + 0.42, U + 0.24, -0.30);
  tirgak.rotation.x = 0.22;
  ich.add(tirgak);
  var tirgak2 = plita(0.06, 0.50, 0.10, yogT, GX - 0.42, U + 0.24, -0.30);
  tirgak2.rotation.x = 0.22;
  ich.add(tirgak2);

  // Ganch plitasi — qiya, o‘yma uchun tayyor.
  var plitaG = new THREE.Group();
  plitaG.add(plita(0.94, 0.070, 0.76, oq, 0, 0, 0));
  plitaG.add(plita(0.86, 0.020, 0.68, soya, 0, 0.044, 0));   // chuqurlashtirilgan maydon

  // Plitada boshlangan o‘yma naqsh chizig‘i: girihning yarmi.
  var chiz = oyiq;
  plitaG.add(plita(0.62, 0.024, 0.045, chiz, -0.06, 0.058, 0.16));
  plitaG.add(plita(0.62, 0.024, 0.045, chiz, -0.06, 0.058, -0.02));
  plitaG.add(plita(0.045, 0.024, 0.24, chiz, -0.34, 0.058, 0.07));
  plitaG.add(plita(0.045, 0.024, 0.24, chiz, 0.22, 0.058, 0.07));
  [Math.PI / 4, -Math.PI / 4].forEach(function (b) {
    var d = plita(0.34, 0.022, 0.042, chiz, -0.06, 0.058, 0.07);
    d.rotation.y = b;
    plitaG.add(d);
  });
  // Naqsh markazidagi sakkiz qirrali yulduzcha.
  var yul = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.045, 8), oq);
  yul.position.set(-0.06, 0.080, 0.07);
  yul.rotation.y = Math.PI / 8;
  plitaG.add(yul);
  // Hali o‘yilmagan qism — chizib qo‘yilgan ingichka belgi chiziqlari.
  for (var m = 0; m < 4; m++) {
    plitaG.add(plita(0.30, 0.012, 0.012, oyiq, 0.28, 0.052, -0.26 + m * 0.075));
  }

  plitaG.position.set(GX, U + 0.20, -0.02);
  plitaG.rotation.x = -0.42;
  ich.add(plitaG);

  /* --- O‘yma pichoqlar (to‘rt xil) --- */
  var pichoqlar = [
    { x: 0.16, z: 0.28, tig: [0.26, 0.020, 0.030], burch: 0.20 },
    { x: 0.20, z: 0.16, tig: [0.22, 0.018, 0.055], burch: -0.10 },
    { x: 0.24, z: 0.04, tig: [0.30, 0.016, 0.022], burch: 0.34 },
    { x: 0.18, z: -0.10, tig: [0.20, 0.024, 0.042], burch: -0.26 }
  ];
  pichoqlar.forEach(function (p) {
    var g = new THREE.Group();
    // Yupqa po‘lat tig‘.
    g.add(plita(p.tig[0], p.tig[1], p.tig[2], pol, p.tig[0] / 2, 0.014, 0));
    // Tig‘ uchi — qiyalatilgan.
    var uchi = new THREE.Mesh(new THREE.ConeGeometry(p.tig[2] * 0.7, 0.075, 6), pol);
    uchi.rotation.z = -Math.PI / 2;
    uchi.position.set(p.tig[0] + 0.036, 0.014, 0);
    g.add(uchi);
    // Yog‘och dasta.
    var d = tayoq(0.031, 0.24, yog, -0.12, 0.022, 0, 10);
    d.rotation.z = Math.PI / 2;
    g.add(d);
    g.add(donacha(0.036, yogT, -0.244, 0.022, 0));
    // Dasta bilan tig‘ orasidagi jez band.
    var band = tayoq(0.036, 0.030, oltinMat(), 0.006, 0.018, 0, 10);
    band.rotation.z = Math.PI / 2;
    g.add(band);

    g.position.set(p.x, U, p.z);
    g.rotation.y = p.burch;
    ich.add(g);
  });

  /* --- Ganch xamiri solingan tog‘ora --- */
  var TX = 0.88;
  var togora = charx([
    [0.000, 0.000], [0.120, 0.000], [0.220, 0.040], [0.290, 0.130],
    [0.310, 0.200], [0.290, 0.206], [0.272, 0.140], [0.206, 0.062],
    [0.108, 0.030], [0.000, 0.026]
  ], 20, sopolMat(RANG.sopolTiq, true));
  togora.position.set(TX, U, -0.18);
  ich.add(togora);
  // Ichidagi ho‘l ganch xamiri.
  var xamir = new THREE.Mesh(new THREE.SphereGeometry(0.245, 16, 10), oq);
  xamir.scale.set(1, 0.42, 1);
  xamir.position.set(TX, U + 0.115, -0.18);
  ich.add(xamir);
  // Xamirni aralashtiradigan yog‘och kurakcha.
  var kurak = plita(0.075, 0.020, 0.30, yogO, TX + 0.16, U + 0.20, -0.10);
  kurak.rotation.x = 0.55;
  ich.add(kurak);
  ich.add(tayoq(0.020, 0.34, yogO, TX + 0.16, U + 0.34, -0.24, 8));

  /* --- Ganch changi uyumchasi --- */
  var uyum = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.16, 18), oq);
  uyum.position.set(0.72, U + 0.080, 0.28);
  ich.add(uyum);
  ich.add(disk(0.28, 0.014, soya, 0.72, U + 0.010, 0.28, 20));
  // Chang ichidagi elak.
  var elak = disk(0.14, 0.05, yogT, 0.44, U + 0.028, 0.34, 14);
  elak.rotation.z = 0.4;
  ich.add(elak);

  // Stol ostidagi tayyor ganch plitalari to‘plami.
  ich.add(plita(0.70, 0.05, 0.42, oq, -0.55, 0.34, 0.02));
  ich.add(plita(0.70, 0.05, 0.42, soya, -0.55, 0.40, 0.02));
  ich.add(plita(0.70, 0.05, 0.42, oq, -0.55, 0.46, 0.02));

  var tashqi = markazlaVaTur(ich, 'ganch-stoli');
  tashqi.userData.qoyish = nuqta(tashqi, 0.20, U + 0.04, 0.30);
  tashqi.userData.rang = 0xBFAF92;
  tashqi.userData.hunar = 'Ganchkorlik';
  return tashqi;
}

/* =========================================================
   B6. NAQQOSH STOLI
   Past yog‘och stol, ustida mol‘bert kabi qiya taxta: unda ko‘k-oltin
   islimiy naqsh chizilayotgan panel. Oldida olti xil rangdagi bo‘yoq
   kosachasi, mo‘yqalamlar turgan idish va oltin varaq to‘plami.
   ========================================================= */
export function naqqoshStoliYasa() {
  var ich = new THREE.Group();
  var yog = yogochMat(RANG.yogoch);
  var yogT = yogochMat(RANG.yogochTiq);
  var yogO = yogochMat(RANG.yogochOch);
  var kokM = matoMat(RANG.kok);
  var kokO = matoMat(RANG.kokOch);
  var oltM = oltinMat();

  var EN = 2.20, BOY = 0.92, BAL = 0.62;
  var U = BAL + 0.005;

  var stol = stolYasa(EN, BOY, BAL, 0.08, yog, yogT);
  ich.add(stol);

  /* --- Qiya taxta (mol‘bert) va undagi panel --- */
  var MX = -0.48;
  // Taxtaning pastki to‘sig‘i — panel sirg‘alib tushmasin.
  ich.add(plita(1.06, 0.055, 0.070, yogT, MX, U + 0.030, 0.32));
  // Orqa tirgaklar.
  [1, -1].forEach(function (s) {
    var t = plita(0.055, 0.72, 0.070, yogT, MX + s * 0.46, U + 0.34, -0.14);
    t.rotation.x = 0.30;
    ich.add(t);
  });

  var panelG = new THREE.Group();
  // Yog‘och panel asosi.
  panelG.add(plita(1.02, 0.055, 0.74, yogO, 0, 0, 0));
  // Panel ustidagi ko‘k zamin — naqsh shu yerga chiziladi.
  panelG.add(plita(0.90, 0.020, 0.62, kokM, 0, 0.038, 0));
  // Oltin hoshiya ramkasi.
  [0.29, -0.29].forEach(function (z) {
    panelG.add(plita(0.90, 0.016, 0.036, oltM, 0, 0.050, z));
  });
  [0.43, -0.43].forEach(function (x) {
    panelG.add(plita(0.036, 0.016, 0.62, oltM, x, 0.050, 0));
  });

  // Islimiy naqsh: markaziy medalyon va undan tarqalgan novdalar.
  panelG.add(disk(0.135, 0.016, oltM, 0, 0.052, 0, 20));
  panelG.add(disk(0.070, 0.016, kokO, 0, 0.060, 0, 16));
  aylanaBoylab(panelG, 8, 0.135, 0.052, function (i) {
    var barg = new THREE.Mesh(new THREE.SphereGeometry(0.060, 12, 8), i % 2 ? oltM : kokO);
    barg.scale.set(1, 0.20, 0.55);
    return barg;
  });
  // Ikki tomonga ketgan islimiy novdalar — burchakli yoy tasmalari.
  [1, -1].forEach(function (s) {
    for (var n = 0; n < 3; n++) {
      var yoy = new THREE.Mesh(
        new THREE.TorusGeometry(0.115 + n * 0.030, 0.014, 6, 14, Math.PI * 0.9), oltM);
      yoy.rotation.x = Math.PI / 2;
      yoy.rotation.z = s * (0.5 + n * 0.7);
      yoy.position.set(s * (0.20 + n * 0.085), 0.054, (n % 2 ? 0.10 : -0.10) * s);
      panelG.add(yoy);
      panelG.add(donacha(0.030, kokO, s * (0.29 + n * 0.085), 0.058, (n % 2 ? 0.17 : -0.17) * s));
    }
  });
  // Burchaklardagi kichik gullar.
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (b) {
    panelG.add(disk(0.055, 0.014, oltM, b[0] * 0.345, 0.052, b[1] * 0.215, 12));
    panelG.add(disk(0.026, 0.014, kokO, b[0] * 0.345, 0.060, b[1] * 0.215, 10));
  });

  panelG.position.set(MX, U + 0.20, 0.02);
  panelG.rotation.x = -0.34;
  ich.add(panelG);

  /* --- Bo‘yoq kosachalari (olti xil rang) --- */
  var boyoqlar = [
    { r: RANG.matoQizil, x: 0.28, z: 0.30 },
    { r: RANG.kok,       x: 0.46, z: 0.30 },
    { r: RANG.oltin,     x: 0.64, z: 0.30 },
    { r: RANG.matoOq,    x: 0.28, z: 0.10 },
    { r: RANG.yashil,    x: 0.46, z: 0.10 },
    { r: RANG.qora,      x: 0.64, z: 0.10 }
  ];
  boyoqlar.forEach(function (b) {
    var kos = charx([
      [0.000, 0.000], [0.055, 0.000], [0.098, 0.022], [0.118, 0.062],
      [0.122, 0.086], [0.108, 0.088], [0.100, 0.062], [0.080, 0.034],
      [0.046, 0.018], [0.000, 0.016]
    ], 16, sopolMat(RANG.ganchOyiq, true));
    kos.position.set(b.x, U, b.z);
    ich.add(kos);
    // Kosachadagi bo‘yoq yuzasi.
    ich.add(disk(0.098, 0.012, matoMat(b.r), b.x, U + 0.058, b.z, 16));
  });

  /* --- Mo‘yqalamlar turgan idish --- */
  var QX = 0.92;
  ich.add(tayoq(0.095, 0.22, yogT, QX, U + 0.11, 0.24, 14));
  ich.add(halqaXZ(0.098, 0.016, oltM, QX, U + 0.215, 0.24, 14));
  for (var q = 0; q < 3; q++) {
    var aq = (q / 3) * Math.PI * 2;
    var dx = Math.cos(aq) * 0.042, dz = Math.sin(aq) * 0.042;
    var sop = tayoq(0.014, 0.40, yogO, QX + dx * 2.4, U + 0.36, 0.24 + dz * 2.4, 8);
    sop.rotation.z = -dx * 3.0;
    sop.rotation.x = dz * 3.0;
    ich.add(sop);
    // Mo‘yqalam tuki — qora, ingichka uchi bilan.
    var tuk = new THREE.Mesh(new THREE.ConeGeometry(0.020, 0.090, 8), matoMat(RANG.qora));
    tuk.position.set(QX + dx * 4.0, U + 0.585, 0.24 + dz * 4.0);
    tuk.rotation.z = -dx * 3.0;
    tuk.rotation.x = dz * 3.0;
    ich.add(tuk);
    // Metall band.
    var band = tayoq(0.017, 0.045, kumushMat(), QX + dx * 3.6, U + 0.540, 0.24 + dz * 3.6, 8);
    band.rotation.z = -dx * 3.0;
    band.rotation.x = dz * 3.0;
    ich.add(band);
  }

  /* --- Oltin varaq to‘plami --- */
  var VX = 0.92;
  ich.add(plita(0.34, 0.020, 0.26, yogT, VX, U + 0.010, -0.16));
  for (var v = 0; v < 5; v++) {
    ich.add(plita(0.30 - v * 0.012, 0.008, 0.22 - v * 0.010, oltM, VX, U + 0.026 + v * 0.010, -0.16));
  }
  // Varaqni ko‘taradigan yupqa qoshiq.
  var qoshiq = plita(0.030, 0.010, 0.20, kumushMat(), VX - 0.22, U + 0.014, -0.12);
  qoshiq.rotation.y = 0.3;
  ich.add(qoshiq);

  // Bo‘yoq ezadigan tosh va dastacha.
  ich.add(disk(0.155, 0.040, ganchMat(RANG.ganchSoya), 0.10, U + 0.020, -0.24, 18));
  ich.add(donacha(0.070, ganchMat(RANG.ganchOyiq), 0.10, U + 0.070, -0.24));

  var tashqi = markazlaVaTur(ich, 'naqqosh-stoli');
  tashqi.userData.qoyish = nuqta(tashqi, 0.50, U + 0.04, -0.06);
  tashqi.userData.rang = 0xD4A24C;
  tashqi.userData.hunar = 'Naqqoshlik';
  return tashqi;
}

/* =========================================================
   B7. GILAM DASTGOHI
   Ikki vertikal yog‘och ustun, tepa va past ko‘ndalang vallar, ular
   orasida tik tortilgan asos iplari. Pastdan taxminan 40% gacha qizil
   gilam to‘qib bo‘lingan; yonida jun kalavalar va yog‘och shona.
   ========================================================= */
export function gilamDastgohiYasa() {
  var ich = new THREE.Group();
  var yog = yogochMat(RANG.yogoch);
  var yogT = yogochMat(RANG.yogochTiq);
  var yogO = yogochMat(RANG.yogochOch);
  var qizil = matoMat(RANG.gilamQiz);
  var oq = matoMat(RANG.matoOq);
  var kok = matoMat(RANG.matoKok);
  var jun = matoMat(RANG.jun);

  var UX = 1.02;                         // ustunlar orasidagi yarim masofa
  var BAL = 1.62;                        // ustun balandligi
  var PASTVAL = 0.30, TEPAVAL = 1.42;    // vallarning balandliklari

  /* --- Ikki vertikal ustun va oyoq tayanchlari --- */
  [1, -1].forEach(function (s) {
    ich.add(plita(0.15, BAL, 0.15, yog, s * UX, BAL / 2, 0));
    // Yerdagi keng tayanch.
    ich.add(plita(0.34, 0.10, 0.72, yogT, s * UX, 0.05, 0));
    // Qiya tirgak — dastgoh chayqalmasin.
    var tirgak = plita(0.09, 0.86, 0.09, yogT, s * (UX - 0.02), 0.48, 0.28);
    tirgak.rotation.x = -0.34;
    ich.add(tirgak);
    // Ustun tepasidagi bezakli boshcha.
    ich.add(donacha(0.105, yogT, s * UX, BAL + 0.05, 0));
    // Valni tutuvchi teshik bandlari.
    ich.add(halqaX(0.135, 0.032, yogT, s * UX, TEPAVAL, 0, 12));
    ich.add(halqaX(0.135, 0.032, yogT, s * UX, PASTVAL, 0, 12));
  });

  /* --- Tepa va past vallar (aylanuvchi o‘qlar) --- */
  [TEPAVAL, PASTVAL].forEach(function (y) {
    var val = tayoq(0.095, 2 * UX + 0.34, yogO, 0, y, 0, 16);
    val.rotation.z = Math.PI / 2;
    ich.add(val);
    // Valning ikki uchidagi burash dastalari.
    [1, -1].forEach(function (s) {
      var kol = tayoq(0.030, 0.22, yogT, s * (UX + 0.20), y, 0.13, 8);
      kol.rotation.x = Math.PI / 2;
      ich.add(kol);
      ich.add(donacha(0.048, yogT, s * (UX + 0.20), y, 0.24));
    });
  });

  /* --- Tik tortilgan asos iplari --- */
  var IP_SONI = 27;
  var ipMat = matoMat(RANG.jun);
  for (var i = 0; i < IP_SONI; i++) {
    var x = -0.86 + i * (1.72 / (IP_SONI - 1));
    ich.add(tayoq(0.009, TEPAVAL - PASTVAL - 0.04, ipMat, x, (TEPAVAL + PASTVAL) / 2, 0, 6));
  }

  /* --- To‘qilgan gilam qismi (pastdan ~40%) --- */
  var TOQ = (TEPAVAL - PASTVAL) * 0.42;  // to‘qilgan balandlik
  var GY = PASTVAL + TOQ / 2 + 0.02;     // to‘qilgan qismning markazi
  ich.add(plita(1.80, TOQ, 0.060, qizil, 0, GY, 0));
  // Gilam chetidagi oq hoshiya chiziqlari.
  [1, -1].forEach(function (s) {
    ich.add(plita(1.80, 0.045, 0.020, oq, 0, GY + s * (TOQ / 2 - 0.045), 0.036));
    ich.add(plita(0.045, TOQ, 0.020, oq, s * 0.855, GY, 0.036));
  });
  // Romb medalyonlar qatori — gilamning «guli».
  for (var r = 0; r < 5; r++) {
    var rx = -0.62 + r * 0.31;
    var rz = 0.040;
    var romb1 = plita(0.19, 0.19, 0.018, (r % 2) ? kok : oq, rx, GY + 0.055, rz);
    romb1.rotation.z = Math.PI / 4;
    ich.add(romb1);
    var romb2 = plita(0.10, 0.10, 0.020, (r % 2) ? oq : kok, rx, GY + 0.055, rz + 0.010);
    romb2.rotation.z = Math.PI / 4;
    ich.add(romb2);
  }
  // Pastki qatordagi kichik tishcha naqsh.
  for (var d = 0; d < 9; d++) {
    ich.add(plita(0.060, 0.055, 0.018, kok, -0.70 + d * 0.175, GY - TOQ / 2 + 0.075, 0.038));
  }
  // Endigina to‘qilayotgan qator — hali tugallanmagan uchi.
  ich.add(plita(1.10, 0.045, 0.050, matoMat(RANG.matoQizil), -0.34, GY + TOQ / 2 + 0.030, 0.010));

  /* --- Old tomondagi past taxta (mahsulot shu yerga qo‘yiladi) --- */
  ich.add(plita(1.00, 0.055, 0.42, yogO, 0, 0.28, 0.50));
  [1, -1].forEach(function (s) {
    ich.add(plita(0.08, 0.28, 0.08, yogT, s * 0.42, 0.14, 0.50));
  });

  /* --- Jun kalavalar (yerda, o‘ng tomonda) --- */
  var kalavaRang = [RANG.gilamQiz, RANG.matoKok, RANG.jun, RANG.matoOq];
  kalavaRang.forEach(function (kr, k) {
    var kx = 0.52 + (k % 2) * 0.30;
    var kz = 0.62 + Math.floor(k / 2) * 0.24;
    var kal = new THREE.Mesh(new THREE.SphereGeometry(0.135, 14, 10), matoMat(kr));
    kal.scale.set(1, 0.86, 1);
    kal.position.set(kx, 0.115, kz);
    ich.add(kal);
    // Kalavaga o‘ralgan ip halqalari.
    var h1 = new THREE.Mesh(new THREE.TorusGeometry(0.128, 0.016, 6, 16), matoMat(kr));
    h1.rotation.x = 0.4;
    h1.position.set(kx, 0.115, kz);
    ich.add(h1);
  });
  // Kalavalarni saqlaydigan savat.
  ich.add(halqaXZ(0.44, 0.045, yogT, 0.66, 0.055, 0.72, 18));

  /* --- Yog‘och shona (tishli taroq) --- */
  var SX = -0.66, SZ = 0.66;
  var shonaG = new THREE.Group();
  shonaG.add(plita(0.44, 0.060, 0.10, yogO, 0, 0.06, 0));
  shonaG.add(tayoq(0.028, 0.24, yogT, 0, 0.06, -0.16, 10).rotateX(Math.PI / 2));
  for (var t = 0; t < 9; t++) {
    shonaG.add(plita(0.026, 0.026, 0.20, yogT, -0.18 + t * 0.045, 0.052, 0.14));
  }
  shonaG.position.set(SX, 0, SZ);
  shonaG.rotation.y = 0.4;
  ich.add(shonaG);

  // Yerda yotgan qaychi va tugun kesish pichog‘i.
  var pich = plita(0.24, 0.014, 0.040, polatMat(RANG.polat), SX + 0.40, 0.012, SZ + 0.16);
  pich.rotation.y = -0.5;
  ich.add(pich);
  var pichDasta = tayoq(0.026, 0.16, yogT, SX + 0.56, 0.020, SZ + 0.24, 8);
  pichDasta.rotation.z = Math.PI / 2;
  pichDasta.rotation.y = -0.5;
  ich.add(pichDasta);

  var tashqi = markazlaVaTur(ich, 'gilam-dastgohi');
  tashqi.userData.qoyish = nuqta(tashqi, 0, 0.32, 0.50);
  tashqi.userData.rang = 0x8C3A2B;
  tashqi.userData.hunar = 'Gilamdo‘zlik';
  return tashqi;
}


/* =========================================================
   =============  C QISM: REYESTRLAR  =======================
   O‘yin kodi shu ikki jadvaldan foydalanadi: qaysi buyum qaysi
   ustaga tegishli, uni kim yasaydi va o‘quvchiga nima deb tushuntiriladi.
   ========================================================= */

export const USTAXONA_BUYUMLARI = {
  bilaguzuk: {
    nom: 'Kumush bilaguzuk',
    hunar: 'Zargarlik',
    usta: 'zargar',
    yasa: bilaguzukYasa,
    izoh: 'Zargar kumush simni qizdirib egadi va ochiq halqa shakliga keltiradi. ' +
          'Yuzasidagi mayda donachalar bittalab qadaladi — bu ish sabr va nozik ' +
          'barmoq mahoratini talab qiladi. O‘rtasidagi ko‘k feruza tosh omad ' +
          'keltiradi deb bilingan.'
  },
  uzuk: {
    nom: 'Aqiq ko‘zli uzuk',
    hunar: 'Zargarlik',
    usta: 'zargar',
    yasa: uzukYasa,
    izoh: 'Uzukning halqasi bir bo‘lak kumushdan yasaladi, tepasidagi uyaga esa ' +
          'to‘rt panja bilan qizil aqiq tosh qadaladi. Yelkalaridagi granulyatsiya ' +
          'naqshi — mayda kumush donachalarni bir-biriga kavsharlash — zargarlikning ' +
          'eng qadimiy usullaridan biridir.'
  },
  peshgir: {
    nom: 'Kashtali peshgir',
    hunar: 'Kashtachilik',
    usta: 'kashtachi',
    yasa: peshgirYasa,
    izoh: 'Peshgir — devorga osiladigan uzun va tor kashta paneli. Oq matoga ipak ' +
          'ip bilan «bodom» naqshi qator tikiladi: bodom hayot va barakat ramzi. ' +
          'Qizlar peshgir tikish orqali chidam va did tarbiyasini olgan.'
  },
  panjara: {
    nom: 'Ganch panjara',
    hunar: 'Ganchkorlik',
    usta: 'ganchkor',
    yasa: panjaraYasa,
    izoh: 'Panjara — ganchdan o‘yilgan deraza to‘ri. U yorug‘likni ichkariga o‘tkazadi, ' +
          'lekin jazirama quyoshni va changni to‘sadi. To‘rdagi chiziqlar kesishib ' +
          'sakkiz burchakli yulduz — girih hosil qiladi; bu naqsh olamning tartibini bildiradi.'
  },
  ustun: {
    nom: 'Naqshin ustun',
    hunar: 'Naqqoshlik',
    usta: 'naqqosh',
    yasa: ustunYasa,
    izoh: 'Ayvon va masjidlarni ko‘taruvchi o‘yma yog‘och ustun. Tanasidagi novchalar ' +
          'va tepasidagi uch qavatli muqarnas sarlavha usta pichog‘i bilan qo‘lda o‘yiladi. ' +
          'Bir ustunni bezash bir necha oy davom etadi — shuning uchun u sabr mevasi deyiladi.'
  },
  xurjun: {
    nom: 'To‘qima xurjun',
    hunar: 'Gilamdo‘zlik',
    usta: 'gilamdoz',
    yasa: xurjunYasa,
    izoh: 'Xurjun — dastgohda to‘qilgan qo‘sh qop; egar ustiga tashlab yuk tashiladi. ' +
          'Qizil zamindagi oq va ko‘k romblar urug‘ belgisi bo‘lib, har oilaning o‘z ' +
          'naqshi bo‘lgan. Xurjun to‘qish bola uchun hisob va tartib mashqi ham hisoblangan.'
  }
};

export const USTALAR = {
  kulol: {
    nom: 'Kulol',
    hunar: 'Kulolchilik',
    yasa: kulolCharxiYasa,
    rang: 0xC1502E,
    izoh: 'Kulol oyog‘i bilan katta g‘ildirakni aylantiradi, qo‘li bilan esa charx ' +
          'boshidagi loyni shakllantiradi. Bir xil harakatni minglab marta takrorlash ' +
          'orqali qo‘l o‘lchovni o‘zi biladigan bo‘lib qoladi.'
  },
  zargar: {
    nom: 'Zargar',
    hunar: 'Zargarlik',
    yasa: zargarStoliYasa,
    rang: 0xC9CDD4,
    izoh: 'Zargar kichik sandonda kumushni yupqalab uradi, spirtovka alangasida ' +
          'kavsharlaydi va toshni uyaga qadaydi. Ishning hammasi bir necha millimetr ' +
          'ichida bajariladi — shuning uchun zargarlik diqqat tarbiyasi deyiladi.'
  },
  kashtachi: {
    nom: 'Kashtachi',
    hunar: 'Kashtachilik',
    yasa: kashtaDoirasiYasa,
    rang: 0x1B3B6F,
    izoh: 'Kashtachi matoni yumaloq doiraga taranglab tortadi va naqshni ipdan ' +
          'chok-chok qilib tikadi. Bitta so‘zana yoki peshgir ustida oila ayollari ' +
          'birgalikda ishlagan — bu hamkorlik va halol mehnat maktabi bo‘lgan.'
  },
  misgar: {
    nom: 'Misgar',
    hunar: 'Misgarlik',
    yasa: misgarSandoniYasa,
    rang: 0xB87333,
    izoh: 'Misgar mis varaqni o‘choqda qizdirib yumshatadi, so‘ng sandonda bolg‘a ' +
          'bilan urib idish shakliga keltiradi. Har zarba o‘z o‘rnida bo‘lishi kerak: ' +
          'shoshgan usta metallni yoradi.'
  },
  ganchkor: {
    nom: 'Ganchkor',
    hunar: 'Ganchkorlik',
    yasa: ganchStoliYasa,
    rang: 0xBFAF92,
    izoh: 'Ganchkor ho‘l ganch qotmasidan avval naqshni o‘yib ulgurishi kerak. ' +
          'U avval chizadi, keyin turli pichoqlar bilan qatlam-qatlam chuqurlashtiradi. ' +
          'Xato tuzatib bo‘lmaydi — shuning uchun ganchkorlik oldindan o‘ylashga o‘rgatadi.'
  },
  naqqosh: {
    nom: 'Naqqosh',
    hunar: 'Naqqoshlik',
    yasa: naqqoshStoliYasa,
    rang: 0xD4A24C,
    izoh: 'Naqqosh yog‘och yoki ganch yuzasiga ko‘k va oltin bo‘yoqlar bilan islimiy ' +
          'naqsh chizadi. Bo‘yoqni o‘zi tabiiy toshlardan ezib tayyorlaydi. ' +
          'Naqsh doim markazdan boshlanib chetga tarqaladi — tartib shundan boshlanadi.'
  },
  gilamdoz: {
    nom: 'Gilamdo‘z',
    hunar: 'Gilamdo‘zlik',
    yasa: gilamDastgohiYasa,
    rang: 0x8C3A2B,
    izoh: 'Gilamdo‘z dastgohga tik tortilgan asos iplariga jun ipni tugib boradi va ' +
          'har qatordan keyin shona bilan urib zichlaydi. Bir kvadrat metr gilamda ' +
          'yuz mingdan ortiq tugun bo‘ladi — bu mehnatning eng sabrli turlaridan biri.'
  }
};

/* Barcha mahsulotlarni bir chaqiruvda yasash — namoyish galereyasi uchun. */
export function barchaBuyumlarniYasa() {
  var natija = {};
  Object.keys(USTAXONA_BUYUMLARI).forEach(function (kalit) {
    natija[kalit] = USTAXONA_BUYUMLARI[kalit].yasa();
  });
  return natija;
}

/* Barcha ustaxona joylarini bir chaqiruvda yasash — sahnani qurish uchun. */
export function barchaUstaxonalarniYasa() {
  var natija = {};
  Object.keys(USTALAR).forEach(function (kalit) {
    natija[kalit] = USTALAR[kalit].yasa();
  });
  return natija;
}

export default USTAXONA_BUYUMLARI;
