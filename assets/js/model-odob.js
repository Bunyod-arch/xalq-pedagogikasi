/* =========================================================
   MEHMONDO‘STLIK VA MUOMALA ODOBI — 3D MODELLAR (Three.js)
   11-modul: «Muomala odobi, mehmondo‘stlik va dasturxon tartibi».

   Fayl ikki qismdan iborat:
     A) ODAM FIGURASI — uslublashtirilgan o‘zbek figurasi (katta,
        ayol, bola, qiz) va unga poza beruvchi `pozaBer()`. Figuraning
        bo‘g‘imlari alohida THREE.Group pivotlar sifatida ochib
        berilgan, shuning uchun salomlashish, ikki qo‘llab uzatish,
        ta’zim qilish kabi holatlar bir chaqiruvda beriladi.
     B) MEHMONDORCHILIK BUYUMLARI — ko‘rpacha, xontaxta, kavush,
        mevali tovoq, shirinliklar, palov lageni, samovar, oftoba,
        kashtali sochiq, kosa, o‘yma eshik, guldon.

   Barchasi faqat Three.js primitivlaridan quriladi — tashqi .glb/.obj
   fayl, CDN yoki qo‘shimcha kutubxona kerak emas:
     · LatheGeometry   — charxda aylangan idishlar (lagan, kosa, ko‘za)
     · TubeGeometry    — oftoba va choynakning egilgan jo‘mragi
     · Capsule/Sphere  — qo‘l-oyoq bo‘g‘imlari, bosh, mevalar
     · Torus / Box / Cylinder / Cone / Octahedron — bezak va detallar

   Buyum yasovchi har bir «...Yasa()» funksiyasi THREE.Group qaytaradi.
   Guruh ichidagi model avtomatik ravishda:
     · eng katta o‘lchami 1.0–1.5 birlik bo‘lguncha miqyoslanadi,
     · gorizontal markazi (0,0,0) ga keltiriladi,
     · eng past nuqtasi y = 0 da turadi.
   Odam figurasi ham xuddi shunday: min.y = 0, xz markazlashgan,
   balandligi `sozlama.boy` ga teng va yuzi +Z tomonga qaragan.
   ========================================================= */
import * as THREE from '../vendor/three.module.min.js';

/* ---------------------------------------------------------
   RANGLAR — dasturxon va mehmonxona palitrasi
   --------------------------------------------------------- */
export const RANG = {
  teri:      0xE3B48C,   // yuz va qo‘l terisi
  teriTuq:   0xC08F63,   // soya tushgan teri (quloq, barmoq)
  soch:      0x2B2118,   // qora soch va o‘rim
  soqol:     0xEDEAE3,   // oqargan soqol — oqsoqol belgisi
  lab:       0x9C5445,   // og‘iz chizig‘i
  koz:       0x1E1A16,   // ko‘z qorachig‘i
  chopon:    0x1B3B6F,   // ko‘k chopon (asosiy)
  yoqa:      0xD4A24C,   // chopon yoqasi va jiyagi — zarhal hoshiya
  belbog:    0xC1502E,   // belbog‘ (qiyiqcha)
  koylak:    0xFBF7F0,   // oq ich ko‘ylak
  romol:     0xC1502E,   // ayollar ro‘moli
  charm:     0x5A3A22,   // kavush charmi
  charmOch:  0x8A5A34,   // kavush tagligi
  yogoch:    0x8A6A44,   // xontaxta, eshik yog‘ochi
  yogochTuq: 0x6E5334,   // o‘yiq va soya
  yogochOch: 0xB08E64,   // yorug‘ yog‘och yuzasi
  chinni:    0xF2EDE2,   // oq chinni
  kok:       0x1B3B6F,   // ko‘k chinni naqsh (Rishton)
  jez:       0xC08A3E,   // jez / mis (samovar, oftoba)
  jezTuq:    0x8E6224,   // jezdagi o‘yiq naqsh
  qizil:     0xC1502E,   // qizil kashta va olma
  yashil:    0x4E7A3A,   // uzum va barg
  sariq:     0xE0B33A,   // navvot, sabzi, o‘rik
  oltin:     0xD4A24C,   // zar jiyak
  matoOq:    0xFBF7F0,   // oq mato
  guruch:    0xE8D8A8,   // palov guruchi
  gosht:     0x8A4B2A    // qazi va go‘sht bo‘lagi
};

/* ---------------------------------------------------------
   MATERIALLAR — har chaqiruvda yangi nusxa qaytaradi, shunda
   bir modelning materialini o‘chirish boshqasiga ta’sir qilmaydi.
   --------------------------------------------------------- */
const M = {
  teri:     (c) => new THREE.MeshStandardMaterial({ color: c || RANG.teri, roughness: 0.86, metalness: 0.0 }),
  soch:     (c) => new THREE.MeshStandardMaterial({ color: c || RANG.soch, roughness: 0.72, metalness: 0.0 }),
  mato:     (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95, metalness: 0.0 }),
  matoIkki: (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95, side: THREE.DoubleSide }),
  charm:    (c) => new THREE.MeshStandardMaterial({ color: c || RANG.charm, roughness: 0.62, metalness: 0.05 }),
  yogoch:   (c) => new THREE.MeshStandardMaterial({ color: c || RANG.yogoch, roughness: 0.80, metalness: 0.03 }),
  chinni:   (c, ikki) => new THREE.MeshStandardMaterial({
              color: c || RANG.chinni, roughness: 0.34, metalness: 0.05,
              side: ikki ? THREE.DoubleSide : THREE.FrontSide }),
  jez:      (c, ikki) => new THREE.MeshStandardMaterial({
              color: c || RANG.jez, roughness: 0.32, metalness: 0.82,
              side: ikki ? THREE.DoubleSide : THREE.FrontSide }),
  ovqat:    (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.66, metalness: 0.0 }),
  jilo:     (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.24, metalness: 0.12 })
};

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

// Y o‘qi atrofidagi yotiq halqa (naqsh chizig‘i, kunda, jiyak).
function halqa(radius, quvur, y, material, segment) {
  var m = new THREE.Mesh(new THREE.TorusGeometry(radius, quvur, 8, segment || 24), material);
  m.rotation.x = Math.PI / 2;
  m.position.y = y;
  return m;
}

// To‘g‘ri burchakli plita (mato qatlami, panel, taxta).
function plita(en, qalin, boy, material, x, y, z) {
  var m = new THREE.Mesh(new THREE.BoxGeometry(en, qalin, boy), material);
  m.position.set(x || 0, y || 0, z || 0);
  return m;
}

// Yassi disk — shorva yuzasi, medalyon, kunda uchun.
function disk(radius, qalin, material, x, y, z, qirra) {
  var m = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, qalin, qirra || 20), material);
  m.position.set(x || 0, y || 0, z || 0);
  return m;
}

// Kichik yumaloq donacha (kashta tugmasi, meva, naqsh nuqtasi).
function donacha(radius, material, x, y, z, seg) {
  var m = new THREE.Mesh(new THREE.SphereGeometry(radius, seg || 12, (seg || 12) / 2), material);
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

// Kapsula — qo‘l va oyoq bo‘g‘inlari uchun (uchlari yumaloq silindr).
// `uzun` — silindr qismining uzunligi; to‘liq balandlik = uzun + 2*radius.
function kapsula(radius, uzun, material) {
  var geo;
  if (typeof THREE.CapsuleGeometry === 'function') {
    geo = new THREE.CapsuleGeometry(radius, uzun, 4, 12);
  } else {
    geo = new THREE.CylinderGeometry(radius, radius, uzun + radius * 2, 12);
  }
  return new THREE.Mesh(geo, material);
}

// Soya sozlamalari: hamma buyum soya tashlaydi, yassilari qabul ham qiladi.
function soyaBer(guruh, yassi) {
  guruh.traverse(function (n) {
    if (n.isMesh) {
      n.castShadow = true;
      if (yassi) n.receiveShadow = true;
    }
  });
}

/* Modelni yakunlash: soya, miqyos (1.0–1.5), markazlash va y = 0 ga qo‘yish.
   Ichki guruh siljitiladi, tashqi guruh esa toza qaytadi — shuning uchun
   foydalanuvchi tashqi guruhni istagan joyga qo‘ya oladi.
   (Yordamchi model-hunar.js dan nusxa olingan — fayllar mustaqil bo‘lsin.) */
function tayyorla(ich, kerakOlcham, yassi, nom) {
  soyaBer(ich, yassi);

  var tashqi = new THREE.Group();
  tashqi.name = nom || 'odob';
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
   ============  A QISM: ODAM FIGURASI  ====================
   =========================================================

   `odamYasa({ tur, chopon, boy })` uslublashtirilgan, ammo tanib
   olsa bo‘ladigan o‘zbek figurasini quradi:

     tur = 'katta' — chopon, belbog‘, do‘ppi (yoki salla), oq soqol
     tur = 'ayol'  — uzun ko‘ylak, ro‘mol, ikki o‘rim soch
     tur = 'bola'  — kalta ko‘ylak, do‘ppi, soqolsiz
     tur = 'qiz'   — uzun ko‘ylak, ro‘mol, ikki o‘rim soch (kichik)

   Qo‘shimcha sozlamalar:
     chopon — chopon/ko‘ylak rangi (0x…), boy — figuraning balandligi,
     bosh   — 'doppi' (birlamchi) yoki 'salla'.

   Figura +Z tomonga qaraydi; oyoq ostidagi tekislik y = 0.
   Bo‘g‘imlar `guruh.userData.qism` orqali ochib berilgan — poza
   berish uchun faqat shu pivotlarning burilishi o‘zgartiriladi.
   ========================================================= */
export function odamYasa(sozlama) {
  var s = sozlama || {};
  var tur = s.tur || 'katta';
  var standartBoy = { katta: 1.60, ayol: 1.55, bola: 1.05, qiz: 1.00 };
  var boy = s.boy || standartBoy[tur] || 1.60;
  var b = boy;                                   // qisqartma — barcha o‘lchov shunga nisbatan
  var ayolmi = (tur === 'ayol' || tur === 'qiz');
  var kichikmi = (tur === 'bola' || tur === 'qiz');

  var ustRang = (s.chopon !== undefined && s.chopon !== null) ? s.chopon
              : (tur === 'katta' ? RANG.chopon
              : tur === 'ayol' ? 0x7E2B4A
              : tur === 'bola' ? 0x2E6B4F : 0x9C2F55);

  /* --- Materiallar (bir figura ichida umumiy) --- */
  var teriMat   = M.teri();
  var teriTuqMat= M.teri(RANG.teriTuq);
  var ustMat    = M.matoIkki(ustRang);
  var yoqaMat   = M.mato(RANG.yoqa);
  var belMat    = M.mato(RANG.belbog);
  var koylakMat = M.mato(RANG.koylak);
  var sochMat   = M.soch();
  var soqolMat  = M.soch(RANG.soqol);
  var kozMat    = M.jilo(RANG.koz);
  var labMat    = M.mato(RANG.lab);
  var charmMat  = M.charm();
  var romolMat  = M.mato(tur === 'qiz' ? 0xE0B33A : RANG.romol);
  var shimMat   = M.mato(ayolmi ? 0x4A3A55 : 0x3E4756);

  /* --- Asosiy nisbatlar (b ulushida) --- */
  var yBel   = 0.480;      // bel (son pivotlari va tana pivoti)
  var yYelka = 0.300;      // bel’dan yelkagacha
  var yBoyin = 0.325;      // bel’dan bo‘yin pivotigacha
  var xYelka = 0.115;      // yelka bo‘g‘imining yon siljishi
  var xSon   = 0.072;      // son bo‘g‘imining yon siljishi
  var bosR   = 0.070 * (kichikmi ? 1.14 : 1.0);   // bosh radiusi

  var poya = new THREE.Group();   // ichki tayanch — miqyos va poza balandligi shunga beriladi
  poya.name = 'poya';

  /* ---------------------------------------------------------
     KAVUSH (poyabzal) — oyoq uchida, uchi biroz ko‘tarilgan
     --------------------------------------------------------- */
  function kavushBolagi() {
    var k = new THREE.Group();
    // taglik
    k.add(plita(0.075 * b, 0.016 * b, 0.185 * b, M.charm(RANG.charmOch), 0, 0.008 * b, 0.022 * b));
    // ust qismi — yassilangan sfera
    var ust = donacha(0.055 * b, charmMat, 0, 0.030 * b, 0.005 * b, 12);
    ust.scale.set(0.68, 0.62, 1.55);
    k.add(ust);
    // ko‘tarilgan uch (kavushning burni)
    var burun = new THREE.Mesh(new THREE.ConeGeometry(0.034 * b, 0.070 * b, 10), charmMat);
    burun.position.set(0, 0.038 * b, 0.100 * b);
    burun.rotation.x = Math.PI * 0.42;
    k.add(burun);
    // tikuv chizig‘i
    k.add(plita(0.010 * b, 0.008 * b, 0.130 * b, M.charm(RANG.charmOch), 0, 0.056 * b, 0.020 * b));
    return k;
  }

  /* ---------------------------------------------------------
     OYOQLAR — son pivoti (bel balandligida), tizza, boldir, kavush
     --------------------------------------------------------- */
  function oyoqYasa(tomon) {
    var son = new THREE.Group();
    son.name = (tomon > 0 ? 'ong' : 'chap') + 'Son';
    son.position.set(tomon * xSon * b, yBel * b, 0);

    var soniy = kapsula(0.058 * b, 0.150 * b, shimMat);
    soniy.position.y = -0.133 * b;
    son.add(soniy);

    var tizza = donacha(0.052 * b, shimMat, 0, -0.245 * b, 0, 12);
    son.add(tizza);

    var boldir = kapsula(0.046 * b, 0.140 * b, shimMat);
    boldir.position.y = -0.355 * b;
    son.add(boldir);

    var kavush = kavushBolagi();
    kavush.position.y = -0.478 * b;
    son.add(kavush);

    return son;
  }

  var ongSon = oyoqYasa(1);
  var chapSon = oyoqYasa(-1);
  poya.add(ongSon, chapSon);

  /* ---------------------------------------------------------
     TANA — bel pivoti. Bu guruh rotation.x bilan oldinga egiladi
     (salomlashish va ta’zim shu pivot orqali beriladi).
     --------------------------------------------------------- */
  var tana = new THREE.Group();
  tana.name = 'tana';
  tana.position.set(0, yBel * b, 0);
  poya.add(tana);

  // Gavda — yuqoriga torayuvchi charxlangan shakl (ich ko‘ylak rangida)
  var bel = ayolmi ? 0.098 : 0.112;
  var gavda = charx([
    [0.000, 0.000], [bel + 0.005, 0.000], [bel + 0.018, 0.060],
    [bel + 0.026, 0.150], [bel + 0.018, 0.240], [bel - 0.010, 0.296],
    [0.055, 0.320], [0.000, 0.325]
  ].map(function (n) { return [n[0] * b, n[1] * b]; }), 20, koylakMat);
  tana.add(gavda);

  if (ayolmi) {
    /* --- AYOL/QIZ: kengayuvchi uzun ko‘ylak --- */
    var koylak = new THREE.Mesh(
      new THREE.CylinderGeometry(0.132 * b, 0.276 * b, 0.700 * b, 22, 1, true), ustMat);
    koylak.position.y = -0.040 * b;   // etak to‘piq sathida — egilganda polga tegmasin
    tana.add(koylak);

    // Etak jiyagi va ko‘krak kashtasi
    tana.add(halqa(0.274 * b, 0.016 * b, -0.382 * b, yoqaMat, 24));
    tana.add(halqa(0.152 * b, 0.014 * b, 0.235 * b, yoqaMat, 20));
    tana.add(plita(0.045 * b, 0.012 * b, 0.010 * b, yoqaMat, 0, 0.180 * b, 0.140 * b));
    for (var ik = 0; ik < 4; ik++) {
      tana.add(donacha(0.014 * b, yoqaMat, 0, (0.120 - ik * 0.038) * b, 0.132 * b, 8));
    }
    // Yengi kengroq bo‘lsin uchun yelka ustidagi mato
    for (var iy = 0; iy < 2; iy++) {
      var yelkaMato = donacha(0.075 * b, ustMat, (iy ? 1 : -1) * 0.100 * b, 0.272 * b, 0, 12);
      yelkaMato.scale.set(1, 0.62, 0.85);
      tana.add(yelkaMato);
    }
  } else if (tur === 'bola') {
    /* --- BOLA: kalta ko‘ylak va ingichka belbog‘ --- */
    var kalta = new THREE.Mesh(
      new THREE.CylinderGeometry(0.140 * b, 0.180 * b, 0.400 * b, 20, 1, true), ustMat);
    kalta.position.y = 0.100 * b;
    tana.add(kalta);
    tana.add(halqa(0.179 * b, 0.014 * b, -0.096 * b, yoqaMat, 22));
    tana.add(halqa(0.146 * b, 0.020 * b, 0.020 * b, belMat, 20));
    // yoqa tirqishi
    tana.add(plita(0.030 * b, 0.014 * b, 0.026 * b, yoqaMat, 0, 0.250 * b, 0.140 * b));
    tana.add(plita(0.020 * b, 0.130 * b, 0.020 * b, yoqaMat, 0, 0.200 * b, 0.140 * b));
  } else {
    /* --- KATTA: ochiq yoqali uzun chopon --- */
    // Orqa va yon qismlar — old tomonida tirqish qoldirilgan konus qobiq
    var tirqish = 0.36;
    var chopon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.152 * b, 0.268 * b, 0.640 * b, 22, 1, true,
        tirqish, Math.PI * 2 - tirqish * 2), ustMat);
    chopon.position.y = -0.020 * b;
    tana.add(chopon);

    // Ikkita old etak plitasi — chopon qanotlari
    [1, -1].forEach(function (t) {
      var etak = plita(0.175 * b, 0.620 * b, 0.024 * b, ustMat,
        t * 0.062 * b, -0.020 * b, 0.152 * b);
      etak.rotation.y = -t * 0.20;
      etak.rotation.z = t * 0.02;
      tana.add(etak);
      // Yoqa hoshiyasi — kontrast zarhal jiyak
      var jiyak = plita(0.042 * b, 0.640 * b, 0.026 * b, yoqaMat,
        t * 0.024 * b, -0.018 * b, 0.170 * b);
      jiyak.rotation.y = -t * 0.20;
      tana.add(jiyak);
    });

    // Bo‘yin atrofidagi yoqa halqasi (old tomoni ochiq)
    var yoqa = new THREE.Mesh(
      new THREE.TorusGeometry(0.118 * b, 0.024 * b, 8, 20, Math.PI * 1.25), yoqaMat);
    yoqa.rotation.x = Math.PI / 2;
    yoqa.rotation.z = Math.PI * 0.375;
    yoqa.position.y = 0.290 * b;
    tana.add(yoqa);

    // BELBOG‘ (qiyiqcha) — o‘ralgan mato va tugun
    tana.add(halqa(0.156 * b, 0.034 * b, 0.020 * b, belMat, 22));
    tana.add(halqa(0.158 * b, 0.012 * b, 0.052 * b, M.mato(RANG.oltin), 22));
    var tugun = donacha(0.048 * b, belMat, 0, 0.016 * b, 0.152 * b, 10);
    tugun.scale.set(1.2, 0.9, 0.7);
    tana.add(tugun);
    [1, -1].forEach(function (t) {
      var uch = plita(0.036 * b, 0.130 * b, 0.016 * b, belMat, t * 0.036 * b, -0.052 * b, 0.150 * b);
      uch.rotation.z = t * 0.16;
      tana.add(uch);
    });
  }

  /* ---------------------------------------------------------
     QO‘L — yelka pivot → yelka-tirsak → tirsak pivot → bilak → kaft
     Kaft Z o‘qi bo‘ylab yassilangan: qo‘l oldinga ko‘tarilganda
     kaft o‘z-o‘zidan yuqoriga qaraydi (piyola uzatish holati).
     --------------------------------------------------------- */
  function qolYasa(tomon) {
    var nomOld = tomon > 0 ? 'ong' : 'chap';

    var yelkaPivot = new THREE.Group();
    yelkaPivot.name = nomOld + 'Yelka';
    yelkaPivot.position.set(tomon * xYelka * b, yYelka * b, 0);

    // Yelka bo‘g‘imi qopqog‘i (kiyim rangida)
    var qopqoq = donacha(0.056 * b, ustMat, 0, 0.006 * b, 0, 12);
    qopqoq.scale.set(1, 0.9, 1);
    yelkaPivot.add(qopqoq);

    // Yelka–tirsak bo‘g‘ini
    var ustQol = kapsula(0.045 * b, 0.100 * b, ustMat);
    ustQol.position.y = -0.082 * b;
    yelkaPivot.add(ustQol);

    var tirsakPivot = new THREE.Group();
    tirsakPivot.name = nomOld + 'Tirsak';
    tirsakPivot.position.y = -0.166 * b;
    yelkaPivot.add(tirsakPivot);

    // Tirsak bo‘g‘imi
    tirsakPivot.add(donacha(0.042 * b, ustMat, 0, 0, 0, 10));

    // Bilak — yeng uchi kiyim rangida, panjaga yaqini teri
    var bilak = kapsula(0.038 * b, 0.078 * b, ustMat);
    bilak.position.y = -0.072 * b;
    tirsakPivot.add(bilak);
    tirsakPivot.add(halqa(0.040 * b, 0.012 * b, -0.126 * b, yoqaMat, 14));
    var bilakTeri = kapsula(0.032 * b, 0.020 * b, teriMat);
    bilakTeri.position.y = -0.140 * b;
    tirsakPivot.add(bilakTeri);

    var kaftPivot = new THREE.Group();
    kaftPivot.name = nomOld + 'Kaft';
    kaftPivot.position.y = -0.160 * b;
    tirsakPivot.add(kaftPivot);

    // Kaft — Z bo‘yicha yassilangan sfera
    var kaft = donacha(0.042 * b, teriMat, 0, -0.032 * b, 0, 12);
    kaft.scale.set(0.86, 1.05, 0.42);
    kaftPivot.add(kaft);

    // Beshta barmoq
    for (var i = 0; i < 5; i++) {
      var uzunlik = (i === 0) ? 0.030 : (i === 2 ? 0.048 : 0.042);
      var barmoq = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0085 * b, 0.0075 * b, uzunlik * b, 6), teriMat);
      if (i === 0) {
        // bosh barmoq — yon tomonda
        barmoq.position.set(-tomon * 0.040 * b, -0.048 * b, 0.006 * b);
        barmoq.rotation.z = tomon * 0.95;
      } else {
        barmoq.position.set((i - 2.5) * 0.021 * b, (-0.064 - uzunlik / 2 + 0.024) * b, 0);
        barmoq.rotation.z = (i - 2.5) * 0.10;
      }
      kaftPivot.add(barmoq);
    }
    return { yelka: yelkaPivot, tirsak: tirsakPivot, kaft: kaftPivot };
  }

  var ongQol = qolYasa(1);
  var chapQol = qolYasa(-1);
  tana.add(ongQol.yelka, chapQol.yelka);

  /* ---------------------------------------------------------
     BO‘YIN VA BOSH — bosh pivoti bo‘yin tubida
     --------------------------------------------------------- */
  var bosh = new THREE.Group();
  bosh.name = 'bosh';
  bosh.position.set(0, yBoyin * b, 0);
  tana.add(bosh);

  var boyin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.040 * b, 0.046 * b, 0.062 * b, 14), teriMat);
  boyin.position.y = 0.022 * b;
  bosh.add(boyin);

  // Bosh — biroz cho‘zilgan sfera
  var kalla = donacha(bosR, teriMat, 0, 0.105 * b, 0, 16);
  kalla.scale.set(0.94, 1.10, 0.96);
  bosh.add(kalla);

  // Iyak — pastki jag‘ni biroz oldinga chiqaradi
  var iyak = donacha(bosR * 0.62, teriMat, 0, 0.062 * b, 0.020 * b, 12);
  iyak.scale.set(0.9, 0.72, 0.9);
  bosh.add(iyak);

  // Quloqlar (ro‘mol ostida ko‘rinmasa ham anatomiya to‘g‘ri bo‘lsin)
  [1, -1].forEach(function (t) {
    var quloq = donacha(bosR * 0.30, teriTuqMat, t * bosR * 0.96, 0.104 * b, -0.004 * b, 10);
    quloq.scale.set(0.35, 1.0, 0.7);
    bosh.add(quloq);
  });

  // Yuz: ikkita ko‘z, qoshlar, burun va og‘iz chizig‘i
  var yuzZ = bosR * 0.86;
  [1, -1].forEach(function (t) {
    bosh.add(donacha(bosR * 0.155, kozMat, t * bosR * 0.38, 0.118 * b, yuzZ * 0.94, 10));
    var qosh = plita(bosR * 0.44, bosR * 0.075, bosR * 0.14, sochMat,
      t * bosR * 0.38, 0.146 * b, yuzZ * 0.90);
    qosh.rotation.z = -t * 0.16;
    bosh.add(qosh);
  });

  var burun = new THREE.Mesh(new THREE.ConeGeometry(bosR * 0.20, bosR * 0.42, 10), teriMat);
  burun.position.set(0, 0.098 * b, yuzZ * 0.94);
  burun.rotation.x = Math.PI / 2;
  bosh.add(burun);

  bosh.add(plita(bosR * 0.46, bosR * 0.09, bosR * 0.12, labMat, 0, 0.072 * b, yuzZ * 0.86));

  /* --- Bosh kiyimi va soch --- */
  if (ayolmi) {
    // RO‘MOL — boshni yopgan yarim shar
    var romol = new THREE.Mesh(
      new THREE.SphereGeometry(bosR * 1.10, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.60), romolMat);
    romol.scale.set(0.98, 1.05, 1.02);
    romol.position.y = 0.105 * b;
    bosh.add(romol);
    // Peshona bo‘ylab ro‘mol chekkasi
    var chek = new THREE.Mesh(
      new THREE.TorusGeometry(bosR * 1.02, bosR * 0.09, 8, 20, Math.PI * 1.55), romolMat);
    chek.rotation.x = Math.PI / 2;
    chek.rotation.z = Math.PI * 1.22;
    chek.position.y = 0.118 * b;
    bosh.add(chek);
    // Orqaga tushgan uchburchak mato
    var uchburchak = new THREE.Mesh(new THREE.ConeGeometry(bosR * 1.05, bosR * 2.10, 3), romolMat);
    uchburchak.scale.set(1, 1, 0.30);
    uchburchak.rotation.x = Math.PI - 0.18;
    uchburchak.rotation.y = Math.PI / 6;
    uchburchak.position.set(0, 0.052 * b, -bosR * 0.62);
    bosh.add(uchburchak);
    // Ikki o‘rim soch
    [1, -1].forEach(function (t) {
      var orim = new THREE.Mesh(
        new THREE.CylinderGeometry(bosR * 0.19, bosR * 0.11, 0.26 * b, 8), sochMat);
      orim.position.set(t * bosR * 0.78, -0.058 * b, -bosR * 0.55);
      orim.rotation.z = t * 0.14;
      orim.rotation.x = -0.18;
      bosh.add(orim);
      // o‘rim uchidagi bog‘ich
      bosh.add(donacha(bosR * 0.15, M.mato(RANG.qizil), t * bosR * 0.92, -0.182 * b, -bosR * 0.72, 8));
      // peshonadan chiqib turgan soch tolasi
      var toli = donacha(bosR * 0.42, sochMat, t * bosR * 0.55, 0.128 * b, bosR * 0.55, 10);
      toli.scale.set(0.6, 0.45, 0.35);
      bosh.add(toli);
    });
  } else {
    // Qora soch — bosh kiyimi ostidan ko‘rinadi
    var soch = new THREE.Mesh(
      new THREE.SphereGeometry(bosR * 1.02, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.52), sochMat);
    soch.scale.set(0.96, 1.06, 0.98);
    soch.position.y = 0.105 * b;
    bosh.add(soch);

    if (s.bosh === 'salla') {
      // SALLA — bir necha o‘ralgan mato halqasi
      for (var iz = 0; iz < 4; iz++) {
        var oram = new THREE.Mesh(
          new THREE.TorusGeometry(bosR * (1.02 - iz * 0.035), bosR * 0.20, 8, 22), M.mato(RANG.matoOq));
        oram.rotation.x = Math.PI / 2;
        oram.rotation.z = iz * 0.35;
        oram.position.y = (0.148 + iz * 0.026) * b;
        bosh.add(oram);
      }
      var sallaUch = donacha(bosR * 0.30, M.mato(RANG.matoOq), -bosR * 0.72, 0.152 * b, -bosR * 0.42, 10);
      sallaUch.scale.set(0.7, 1.4, 0.6);
      bosh.add(sallaUch);
    } else {
      // DO‘PPI — yarim shar, jiyak silindri va oq bodom naqshlar
      var doppi = new THREE.Mesh(
        new THREE.SphereGeometry(bosR * 1.06, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
        M.mato(RANG.chopon));
      doppi.scale.set(1, 0.60, 1);
      doppi.position.y = 0.150 * b;
      bosh.add(doppi);
      var jiyakD = new THREE.Mesh(
        new THREE.CylinderGeometry(bosR * 1.08, bosR * 1.08, bosR * 0.34, 20), M.mato(RANG.chopon));
      jiyakD.position.y = 0.150 * b;
      bosh.add(jiyakD);
      // jiyakdagi oq tishcha qatori
      aylanaBoylab(bosh, 8, bosR * 1.10, 0.150 * b, function () {
        return plita(bosR * 0.16, bosR * 0.20, bosR * 0.05, M.mato(RANG.matoOq));
      });
      // gumbazdagi to‘rtta oq bodom naqsh
      aylanaBoylab(bosh, 4, bosR * 0.62, 0.186 * b, function () {
        var bodom = donacha(bosR * 0.24, M.mato(RANG.matoOq), 0, 0, 0, 10);
        bodom.scale.set(0.55, 0.30, 1.0);
        return bodom;
      });
    }

    if (tur === 'katta') {
      // OQ SOQOL — iyak ostidagi yassilangan sferalar to‘plami
      for (var isq = 0; isq < 7; isq++) {
        var a = -Math.PI * 0.42 + (isq / 6) * Math.PI * 0.84;
        var sq = donacha(bosR * (0.30 - Math.abs(isq - 3) * 0.022), soqolMat,
          Math.sin(a) * bosR * 0.72, 0.048 * b - Math.abs(isq - 3) * 0.004 * b,
          Math.cos(a) * bosR * 0.62, 10);
        sq.scale.set(1, 1.35, 0.9);
        bosh.add(sq);
      }
      var soqolUchi = donacha(bosR * 0.34, soqolMat, 0, 0.006 * b, bosR * 0.40, 12);
      soqolUchi.scale.set(0.9, 1.5, 0.8);
      bosh.add(soqolUchi);
      // Mo‘ylov
      var moylov = donacha(bosR * 0.30, soqolMat, 0, 0.088 * b, bosR * 0.80, 10);
      moylov.scale.set(1.25, 0.32, 0.45);
      bosh.add(moylov);
    }
  }

  /* ---------------------------------------------------------
     YAKUNLASH — miqyos (balandlik = boy), xz markaz, min.y = 0
     --------------------------------------------------------- */
  var guruh = new THREE.Group();
  guruh.name = 'odam-' + tur;
  guruh.add(poya);
  soyaBer(poya, false);

  poya.updateMatrixWorld(true);
  var quti = new THREE.Box3().setFromObject(poya);
  var olcham = new THREE.Vector3();
  quti.getSize(olcham);
  poya.scale.setScalar(boy / (olcham.y || 1));

  poya.updateMatrixWorld(true);
  quti.setFromObject(poya);
  var markaz = new THREE.Vector3();
  quti.getCenter(markaz);
  poya.position.set(-markaz.x, -quti.min.y, -markaz.z);

  guruh.userData.tur = tur;
  guruh.userData.boy = boy;
  guruh.userData.poya = poya;                 // poza balandligi shu guruh orqali o‘zgaradi
  guruh.userData.asosY = poya.position.y;     // tik holatdagi asos balandlik
  guruh.userData.qism = {
    tana:       tana,
    bosh:       bosh,
    ongYelka:   ongQol.yelka,
    ongTirsak:  ongQol.tirsak,
    ongKaft:    ongQol.kaft,
    chapYelka:  chapQol.yelka,
    chapTirsak: chapQol.tirsak,
    chapKaft:   chapQol.kaft,
    ongSon:     ongSon,
    chapSon:    chapSon
  };

  pozaBer(guruh, 'tik');
  return guruh;
}

/* =========================================================
   POZA BERISH
   `pozaBer(odam, poza)` faqat pivotlarning burilishini (va o‘tirish
   holatida ichki tayanchning balandligini) o‘zgartiradi — yangi mesh
   yaratilmaydi, shuning uchun uni istagancha qayta chaqirsa bo‘ladi.

   Pozalar:
     'tik'      — tinch turish, qo‘llar yon tomonda
     'salom'    — o‘ng qo‘l ko‘krak ustida, tana ~12° oldinga egilgan
     'ikkiQol'  — ikki qo‘l oldinga, kaftlar yuqoriga (to‘g‘ri uzatish)
     'birQol'   — faqat o‘ng qo‘l cho‘zilgan (noto‘g‘ri variant)
     'chapQol'  — faqat chap qo‘l cho‘zilgan (noto‘g‘ri variant)
     'olish'    — ikki qo‘l ko‘krak balandligida, kaftlar yuqoriga
     'egilish'  — chuqurroq ta’zim (~25°), o‘ng qo‘l ko‘krakda
     'otirish'  — cho‘kkalab o‘tirish, qo‘llar tizzada
     'kibr'     — qo‘llar belda, bosh orqada (hurmatsiz holat)
   ========================================================= */
export function pozaBer(odam, poza) {
  if (!odam || !odam.userData || !odam.userData.qism) return odam;
  var q = odam.userData.qism;
  var poya = odam.userData.poya;
  var asosY = odam.userData.asosY || 0;
  var b = odam.userData.boy || 1.6;
  var nom = poza || 'tik';

  /* 1) Barcha bo‘g‘imlarni nol holatga qaytarish — poza qayta-qayta
        chaqirilganda oldingi burilishlar qo‘shilib ketmasligi uchun. */
  ['tana', 'bosh', 'ongYelka', 'ongTirsak', 'ongKaft',
   'chapYelka', 'chapTirsak', 'chapKaft', 'ongSon', 'chapSon'].forEach(function (k) {
    if (q[k]) q[k].rotation.set(0, 0, 0);
  });
  if (poya) poya.position.y = asosY;

  /* 2) Yordamchi: bitta qo‘lni bir yo‘la sozlash.
        t = +1 o‘ng qo‘l, -1 chap qo‘l (yon burilishlar shunga ko‘paytiriladi). */
  function qol(t, yx, yy, yz, tx, tz, kx) {
    var oldi = t > 0 ? 'ong' : 'chap';
    q[oldi + 'Yelka'].rotation.set(yx, t * yy, t * yz);
    q[oldi + 'Tirsak'].rotation.set(tx, 0, t * tz);
    q[oldi + 'Kaft'].rotation.set(kx || 0, 0, 0);
  }
  // Yon tomonda tinch osilgan qo‘l
  function qolYonda(t) { qol(t, 0.03, 0, 0.24, -0.10, 0, 0); }
  // Ko‘krak ustidagi qo‘l — o‘zbekcha salomlashish ishorasi
  function qolKokrakda(t) { qol(t, -0.25, 0.00, 0.05, -1.75, -0.60, -0.28); }

  switch (nom) {

    case 'salom':
      q.tana.rotation.x = 0.21;      // ~12° oldinga egilish
      q.bosh.rotation.x = 0.20;      // bosh pastroq
      qolKokrakda(1);
      qol(-1, 0.10, 0, 0.26, -0.20, 0, 0);
      break;

    case 'ikkiQol':
      q.tana.rotation.x = 0.07;
      q.bosh.rotation.x = 0.06;
      qol(1, -1.35, 0.00, 0.10, -0.34, 0.05, -0.22);
      qol(-1, -1.35, 0.00, 0.10, -0.34, 0.05, -0.22);
      break;

    case 'birQol':
      q.tana.rotation.x = 0.03;
      qol(1, -1.30, 0.00, 0.12, -0.30, 0.05, -0.20);
      qolYonda(-1);
      break;

    case 'chapQol':
      q.tana.rotation.x = 0.03;
      qol(-1, -1.30, 0.00, 0.12, -0.30, 0.05, -0.20);
      qolYonda(1);
      break;

    case 'olish':
      q.tana.rotation.x = 0.05;
      q.bosh.rotation.x = 0.10;
      qol(1, -0.88, 0.00, 0.18, -1.10, 0.10, -0.20);
      qol(-1, -0.88, 0.00, 0.18, -1.10, 0.10, -0.20);
      break;

    case 'egilish':
      q.tana.rotation.x = 0.44;      // ~25° ta’zim
      q.bosh.rotation.x = 0.16;
      q.ongSon.rotation.x = 0.10;
      q.chapSon.rotation.x = 0.10;
      qolKokrakda(1);
      qol(-1, 0.26, 0, 0.30, -0.28, 0, 0);
      break;

    case 'otirish':
      if (poya) poya.position.y = asosY - 0.35 * b;
      q.tana.rotation.x = 0.06;
      q.ongSon.rotation.set(-1.34, 0, 0.26);
      q.chapSon.rotation.set(-1.34, 0, -0.26);
      // Chopon/ko‘ylak etagi pol sathidan pastroqqa tushishi tabiiy —
      // o‘tirgan odamning to‘n etagi polga yoyilib turadi.
      // qo‘llar tizzada
      qol(1, -0.95, 0.00, 0.18, -0.55, 0.05, -0.15);
      qol(-1, -0.95, 0.00, 0.18, -0.55, 0.05, -0.15);
      break;

    case 'kibr':
      q.tana.rotation.x = -0.07;     // orqaga tashlangan gavda
      q.bosh.rotation.x = -0.24;     // bosh orqada — mag‘rurlik belgisi
      qol(1, 0.16, 0.00, 0.90, -0.18, -1.34, 0);
      qol(-1, 0.16, 0.00, 0.90, -0.18, -1.34, 0);
      break;

    case 'tik':
    default:
      qolYonda(1);
      qolYonda(-1);
      break;
  }

  odam.userData.poza = nom;
  return odam;
}

/* Barcha mavjud poza nomlari — sahna kodi ro‘yxat qurishi uchun. */
export const POZALAR = ['tik', 'salom', 'ikkiQol', 'birQol', 'chapQol',
                        'olish', 'egilish', 'otirish', 'kibr'];

/* =========================================================
   ========  B QISM: MEHMONDORCHILIK BUYUMLARI  ============
   ========================================================= */

/* =========================================================
   1) KO‘RPACHA — mehmon o‘tiradigan qavilgan yostiq
   Yumshoq chetli to‘rtburchak: qavik chiziqlari to‘ri, qizil-yashil
   gulli mato naqshi va chetdagi jiyak.
   ========================================================= */
export function korpachaYasa() {
  var ich = new THREE.Group();
  var zamin = M.mato(0xB8321F);
  var jiyakMat = M.mato(0x1B3B6F);
  var chok = M.mato(0x8C1F12);

  var EN = 0.92, BOY = 0.64, QAL = 0.11, R = 0.055;

  // Asosiy yumshoq gavda
  ich.add(plita(EN, QAL, BOY, zamin, 0, QAL / 2 + 0.006, 0));

  // Chetlarni yumshatuvchi silindrlar
  [-1, 1].forEach(function (t) {
    var uz = new THREE.Mesh(new THREE.CylinderGeometry(R, R, EN, 14), zamin);
    uz.rotation.z = Math.PI / 2;
    uz.position.set(0, QAL / 2 + 0.006, t * BOY / 2);
    ich.add(uz);
    var qi = new THREE.Mesh(new THREE.CylinderGeometry(R, R, BOY, 14), zamin);
    qi.rotation.x = Math.PI / 2;
    qi.position.set(t * EN / 2, QAL / 2 + 0.006, 0);
    ich.add(qi);
  });
  // Burchak yumaloqlari
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (b) {
    var k = donacha(R, zamin, b[0] * EN / 2, QAL / 2 + 0.006, b[1] * BOY / 2, 12);
    ich.add(k);
  });

  var yUst = QAL + 0.010;

  // Qavik chiziqlari — ingichka botiq plitalar to‘ri
  for (var i = -2; i <= 2; i++) {
    ich.add(plita(0.018, 0.012, BOY + 2 * R - 0.03, chok, i * 0.180, yUst, 0));
  }
  for (var j = -1; j <= 1; j++) {
    ich.add(plita(EN + 2 * R - 0.03, 0.012, 0.018, chok, 0, yUst, j * 0.215));
  }

  // Gulli mato naqshi — qavik kataklaridagi kichik plitalar
  var yashilMat = M.mato(0x2F6B3A);
  var oqMat = M.mato(RANG.matoOq);
  for (var a = 0; a < 5; a++) {
    for (var c = 0; c < 4; c++) {
      var x = -0.360 + a * 0.180;
      var z = -0.322 + c * 0.215;
      var gulMat = ((a + c) % 2 === 0) ? yashilMat : oqMat;
      var gul = plita(0.075, 0.010, 0.075, gulMat, x, yUst + 0.002, z);
      gul.rotation.y = Math.PI / 4;
      ich.add(gul);
    }
  }

  // Chetdagi ko‘k jiyak — ko‘rpachaning hoshiyasi
  [-1, 1].forEach(function (t) {
    ich.add(plita(EN + 2 * R, 0.014, 0.040, jiyakMat, 0, QAL * 0.55, t * (BOY / 2 + R - 0.020)));
    ich.add(plita(0.040, 0.014, BOY + 2 * R, jiyakMat, t * (EN / 2 + R - 0.020), QAL * 0.55, 0));
  });

  return tayyorla(ich, 1.30, true, 'korpacha');
}

/* =========================================================
   2) XONTAXTA — dasturxon yoziladigan past yog‘och stol
   To‘rtta qisqa o‘yma oyoq, yuza chetida o‘yilgan hoshiya.
   ========================================================= */
export function xontaxtaYasa() {
  var ich = new THREE.Group();
  var yog = M.yogoch();
  var yogO = M.yogoch(RANG.yogochOch);
  var yogT = M.yogoch(RANG.yogochTuq);

  var EN = 0.92, BOY = 0.66, H = 0.30;

  // Stol yuzasi
  ich.add(plita(EN, 0.050, BOY, yogO, 0, H, 0));
  // Yuza ostidagi ramka
  ich.add(plita(EN - 0.06, 0.030, BOY - 0.06, yog, 0, H - 0.040, 0));

  // Chetdagi o‘yilgan hoshiya
  [-1, 1].forEach(function (t) {
    ich.add(plita(EN, 0.022, 0.045, yogT, 0, H + 0.030, t * (BOY / 2 - 0.023)));
    ich.add(plita(0.045, 0.022, BOY - 0.09, yogT, t * (EN / 2 - 0.023), H + 0.030, 0));
  });
  // Hoshiyadagi o‘yma nuqtalar
  for (var i = 0; i < 7; i++) {
    var x = -0.36 + i * 0.12;
    ich.add(donacha(0.016, yog, x, H + 0.036, BOY / 2 - 0.023, 8));
    ich.add(donacha(0.016, yog, x, H + 0.036, -(BOY / 2 - 0.023), 8));
  }

  // To‘rtta o‘yma oyoq
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (b) {
    var x = b[0] * (EN / 2 - 0.075), z = b[1] * (BOY / 2 - 0.075);
    var oyoq = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.050, H - 0.055, 12), yog);
    oyoq.position.set(x, (H - 0.055) / 2, z);
    ich.add(oyoq);
    // o‘yma halqalar
    var h1 = halqa(0.052, 0.014, 0.055, yogT, 12); h1.position.x = x; h1.position.z = z; ich.add(h1);
    var h2 = halqa(0.048, 0.012, 0.170, yogT, 12); h2.position.x = x; h2.position.z = z; ich.add(h2);
    // oyoq tagligi
    var tag = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.062, 0.028, 12), yogT);
    tag.position.set(x, 0.014, z);
    ich.add(tag);
  });

  // Oyoqlarni bog‘lovchi ko‘ndalang taxtachalar
  [-1, 1].forEach(function (t) {
    ich.add(plita(EN - 0.15, 0.026, 0.026, yogT, 0, 0.095, t * (BOY / 2 - 0.075)));
    ich.add(plita(0.026, 0.026, BOY - 0.15, yogT, t * (EN / 2 - 0.075), 0.095, 0));
  });

  return tayyorla(ich, 1.35, true, 'xontaxta');
}

/* =========================================================
   3) KAVUSH — ostonada yechib qo‘yiladigan juft charm poyabzal
   Uchi ko‘tarilgan, tagligi va tikuv chizig‘i ko‘rinadigan.
   ========================================================= */
export function kavushYasa() {
  var ich = new THREE.Group();
  var charmMat = M.charm();
  var tagMat = M.charm(RANG.charmOch);
  var chokMat = M.mato(RANG.oltin);

  function bittaKavush(yonalish) {
    var k = new THREE.Group();

    // Taglik — uzunasiga cho‘zilgan yassi plita
    k.add(plita(0.20, 0.030, 0.52, tagMat, 0, 0.015, 0));
    // Poshna
    k.add(plita(0.17, 0.045, 0.14, tagMat, 0, 0.052, -0.185));

    // Ust qismi — yassilangan sfera (oyoq usti)
    var ust = donacha(0.14, charmMat, 0, 0.055, -0.045, 14);
    ust.scale.set(0.72, 0.68, 1.35);
    k.add(ust);

    // Burun — uchi yuqoriga qayrilgan
    var burun = new THREE.Mesh(new THREE.ConeGeometry(0.088, 0.26, 12), charmMat);
    burun.position.set(0, 0.065, 0.185);
    burun.rotation.x = Math.PI * 0.40;
    burun.scale.set(1, 1, 0.85);
    k.add(burun);
    // Qayrilgan uchning tugmasi
    k.add(donacha(0.030, charmMat, 0, 0.165, 0.245, 10));

    // Oyoq kiriladigan og‘iz halqasi
    var ogiz = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.016, 8, 18), charmMat);
    ogiz.rotation.x = Math.PI / 2 - 0.22;
    ogiz.position.set(0, 0.115, -0.115);
    k.add(ogiz);

    // Tikuv chiziqlari — sariq ip
    k.add(plita(0.012, 0.012, 0.30, chokMat, 0.070, 0.052, 0.020));
    k.add(plita(0.012, 0.012, 0.30, chokMat, -0.070, 0.052, 0.020));
    for (var i = 0; i < 6; i++) {
      k.add(plita(0.028, 0.010, 0.010, chokMat, 0, 0.128, 0.010 + i * 0.042));
    }
    k.rotation.y = yonalish * 0.10;
    return k;
  }

  var ong = bittaKavush(1);   ong.position.x = 0.135;
  var chap = bittaKavush(-1); chap.position.x = -0.135; chap.position.z = -0.035;
  ich.add(ong, chap);

  return tayyorla(ich, 1.05, true, 'kavush');
}

/* =========================================================
   4) MEVALI TOVOQ — dasturxonning doimiy bezagi
   Keng chinni tovoq; ichida olma, uzum boshi, o‘rik va anor.
   ========================================================= */
export function mevaTovoqYasa() {
  var ich = new THREE.Group();

  // Chinni tovoq
  var tovoq = charx([
    [0.000, 0.030], [0.140, 0.026], [0.300, 0.046], [0.420, 0.098],
    [0.500, 0.170], [0.530, 0.226], [0.516, 0.246], [0.482, 0.214],
    [0.452, 0.160], [0.360, 0.106], [0.220, 0.078], [0.000, 0.070]
  ], 26, M.chinni(RANG.chinni, true));
  ich.add(tovoq);
  ich.add(halqa(0.190, 0.026, 0.014, M.chinni(0xE4DCCB)));
  ich.add(halqa(0.492, 0.010, 0.198, M.mato(RANG.kok), 26));
  ich.add(halqa(0.430, 0.008, 0.150, M.mato(RANG.kok), 24));

  // Olma — uch dona qizil sfera, bandi bilan
  var olmaMat = M.jilo(0xB92B23);
  [[-0.14, 0.155, 0.10], [0.15, 0.150, 0.13], [0.02, 0.160, -0.16]].forEach(function (p) {
    var olma = donacha(0.105, olmaMat, p[0], p[1] + 0.055, p[2], 14);
    olma.scale.set(1, 0.92, 1);
    ich.add(olma);
    var band = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.010, 0.055, 6), M.yogoch(RANG.yogochTuq));
    band.position.set(p[0], p[1] + 0.150, p[2]);
    ich.add(band);
    var barg = donacha(0.040, M.ovqat(RANG.yashil), p[0] + 0.035, p[1] + 0.160, p[2], 8);
    barg.scale.set(1, 0.22, 0.55);
    ich.add(barg);
  });

  // Uzum boshi — kichik yashil sferalar piramidasi
  var uzumMat = M.jilo(0x7FA14A);
  var uzumX = 0.24, uzumZ = -0.05, uzumY = 0.205;
  var qatlam = [[0, 0.000], [5, 0.062], [4, 0.118], [2, 0.168], [1, 0.212]];
  qatlam.forEach(function (q, qi) {
    if (q[0] === 0) return;
    for (var i = 0; i < q[0]; i++) {
      var a = (i / q[0]) * Math.PI * 2 + qi * 0.5;
      var r = 0.062 - qi * 0.011;
      ich.add(donacha(0.040, uzumMat,
        uzumX + Math.cos(a) * r, uzumY + q[1], uzumZ + Math.sin(a) * r, 10));
    }
  });
  var shox = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.070, 6), M.yogoch(RANG.yogochTuq));
  shox.position.set(uzumX, uzumY + 0.250, uzumZ);
  ich.add(shox);

  // O‘rik — sariq kichik sferalar
  var orikMat = M.jilo(0xE8A93C);
  [[-0.28, -0.10], [-0.22, 0.14], [-0.33, 0.04]].forEach(function (p) {
    var o = donacha(0.068, orikMat, p[0], 0.190, p[1], 12);
    o.scale.set(1, 0.94, 1);
    ich.add(o);
    ich.add(plita(0.006, 0.012, 0.060, M.ovqat(0xC98A2A), p[0], 0.252, p[1]));
  });

  // Anor — yorilgan qizil shar, ichida donalari ko‘rinadi
  var anorMat = M.jilo(0xA3232C);
  var anor = donacha(0.125, anorMat, 0.03, 0.215, 0.24, 14);
  anor.scale.set(1, 0.94, 1);
  ich.add(anor);
  // yorig‘i — ichkaridagi oq parda va donalar
  var yoriq = donacha(0.098, M.ovqat(0xF0E2CE), 0.05, 0.230, 0.30, 12);
  yoriq.scale.set(0.75, 0.75, 0.55);
  ich.add(yoriq);
  for (var d = 0; d < 7; d++) {
    var ad = (d / 7) * Math.PI * 2;
    ich.add(donacha(0.026, M.jilo(0xD2313B),
      0.05 + Math.cos(ad) * 0.048, 0.235 + Math.sin(ad) * 0.040, 0.335, 8));
  }
  // anor toji
  var toj = new THREE.Mesh(new THREE.CylinderGeometry(0.030, 0.018, 0.050, 8), anorMat);
  toj.position.set(0.03, 0.330, 0.24);
  ich.add(toj);

  return tayyorla(ich, 1.30, true, 'meva-tovoq');
}

/* =========================================================
   5) SHIRINLIKLAR LAGANI — parvarda, navvot, holva, mayiz
   Choy dasturxonining birinchi qatori.
   ========================================================= */
export function shirinlikYasa() {
  var ich = new THREE.Group();

  // Yassi lagan
  var lagan = charx([
    [0.000, 0.024], [0.180, 0.020], [0.360, 0.026], [0.480, 0.048],
    [0.545, 0.086], [0.560, 0.112], [0.546, 0.128], [0.516, 0.100],
    [0.470, 0.070], [0.350, 0.050], [0.180, 0.044], [0.000, 0.042]
  ], 26, M.chinni(RANG.chinni, true));
  ich.add(lagan);
  ich.add(halqa(0.220, 0.024, 0.010, M.chinni(0xE4DCCB)));
  ich.add(halqa(0.505, 0.009, 0.070, M.mato(RANG.kok), 26));
  aylanaBoylab(ich, 12, 0.435, 0.052, function () {
    return donacha(0.020, M.mato(RANG.kok), 0, 0, 0, 8);
  });

  // Parvarda — kichik oq silindrlar uyumi
  var parvardaMat = M.ovqat(0xF6F1E6);
  var joy = [[-0.28, -0.10], [-0.20, 0.05], [-0.31, 0.09], [-0.14, -0.14], [-0.24, -0.02], [-0.13, 0.12]];
  joy.forEach(function (p, i) {
    var pv = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.040, 12), parvardaMat);
    pv.position.set(p[0], 0.066 + (i > 3 ? 0.040 : 0), p[1]);
    pv.rotation.y = i * 0.4;
    ich.add(pv);
  });

  // Navvot — sariq kristall bo‘laklari (Octahedron)
  var navvotMat = M.jilo(0xE7C05A);
  [[0.16, -0.20, 0.075], [0.26, -0.08, 0.062], [0.13, -0.05, 0.058], [0.22, -0.21, 0.050], [0.19, -0.13, 0.115]]
    .forEach(function (p, i) {
      var nv = new THREE.Mesh(new THREE.OctahedronGeometry(p[2], 0), navvotMat);
      nv.position.set(p[0], 0.060 + p[2] * 0.7, p[1]);
      nv.rotation.set(i * 0.5, i * 0.8, i * 0.3);
      ich.add(nv);
    });

  // Holva bo‘lagi — jigarrang kubcha, ustida kunjut
  var holvaMat = M.ovqat(0xB98A52);
  var holva = plita(0.24, 0.090, 0.20, holvaMat, 0.20, 0.100, 0.20);
  holva.rotation.y = 0.25;
  ich.add(holva);
  var holva2 = plita(0.14, 0.075, 0.13, M.ovqat(0xA87A45), 0.28, 0.155, 0.13);
  holva2.rotation.y = -0.30;
  ich.add(holva2);
  for (var k = 0; k < 6; k++) {
    ich.add(donacha(0.012, M.ovqat(0xF0E4CA), 0.14 + k * 0.028, 0.148, 0.16 + (k % 3) * 0.045, 6));
  }

  // Mayiz uyumi — mayda to‘q donalar
  var mayizMat = M.ovqat(0x6B4426);
  for (var m = 0; m < 11; m++) {
    var am = (m / 11) * Math.PI * 2;
    var my = donacha(0.030, mayizMat,
      -0.02 + Math.cos(am) * 0.10, 0.075 + (m % 3) * 0.026, 0.26 + Math.sin(am) * 0.07, 8);
    my.scale.set(1, 0.7, 1.3);
    my.rotation.y = am;
    ich.add(my);
  }

  return tayyorla(ich, 1.25, true, 'shirinlik');
}

/* =========================================================
   6) PALOV LAGANI — dasturxonning bosh taomi
   Katta ko‘k-oq chinni lagan, guruch tepaligi, qazi bo‘laklari,
   sabzi chiziqlari va tepasidagi piyoz halqalari.
   ========================================================= */
export function palovLaganiYasa() {
  var ich = new THREE.Group();

  // Katta lagan
  var lagan = charx([
    [0.000, 0.028], [0.200, 0.024], [0.400, 0.036], [0.560, 0.086],
    [0.650, 0.156], [0.685, 0.212], [0.670, 0.232], [0.632, 0.198],
    [0.598, 0.140], [0.500, 0.090], [0.320, 0.062], [0.000, 0.056]
  ], 28, M.chinni(RANG.chinni, true));
  ich.add(lagan);
  ich.add(halqa(0.250, 0.028, 0.012, M.chinni(0xE4DCCB)));

  // Ko‘k naqsh halqalari va nuqtalari
  ich.add(halqa(0.640, 0.011, 0.186, M.mato(RANG.kok), 28));
  ich.add(halqa(0.588, 0.009, 0.140, M.mato(RANG.kok), 26));
  aylanaBoylab(ich, 16, 0.614, 0.164, function () {
    return donacha(0.022, M.mato(RANG.kok), 0, 0, 0, 8);
  });

  // Guruch tepaligi — yassilangan sariq sfera
  var guruchMat = M.ovqat(RANG.guruch);
  var tepalik = donacha(0.470, guruchMat, 0, 0.060, 0, 22);
  tepalik.scale.set(1, 0.44, 1);
  ich.add(tepalik);
  // guruch donalari — yuzaning g‘adir-budurligi
  for (var i = 0; i < 22; i++) {
    var a = Math.random() * Math.PI * 2;
    var r = Math.sqrt(Math.random()) * 0.42;
    var don = donacha(0.028, guruchMat, Math.cos(a) * r,
      0.060 + Math.cos(r * 2.4) * 0.180, Math.sin(a) * r, 8);
    don.scale.set(1, 0.55, 1.7);
    don.rotation.y = a;
    ich.add(don);
  }

  // Sabzi chiziqlari — sariq ingichka qutichalar
  var sabziMat = M.ovqat(0xE2A63A);
  for (var j = 0; j < 10; j++) {
    var aj = (j / 10) * Math.PI * 2 + 0.3;
    var rj = 0.18 + (j % 3) * 0.075;
    var sabzi = plita(0.030, 0.022, 0.155, sabziMat,
      Math.cos(aj) * rj, 0.070 + Math.cos(rj * 2.4) * 0.180, Math.sin(aj) * rj);
    sabzi.rotation.y = aj + 0.6;
    ich.add(sabzi);
  }

  // Qazi va go‘sht bo‘laklari — jigarrang qutichalar
  var goshtMat = M.ovqat(RANG.gosht);
  [[0.00, 0.00, 0.20], [0.18, -0.12, 0.16], [-0.16, 0.14, 0.15], [-0.05, -0.20, 0.14], [0.14, 0.16, 0.13]]
    .forEach(function (p, k) {
      var rr = Math.sqrt(p[0] * p[0] + p[1] * p[1]);
      var gb = plita(p[2], 0.070, p[2] * 0.72, goshtMat,
        p[0], 0.105 + Math.cos(rr * 2.4) * 0.180, p[1]);
      gb.rotation.y = k * 0.6;
      ich.add(gb);
    });

  // Bosh piyoz halqalari — tepada
  var piyozMat = M.ovqat(0xF2E9DC);
  [[0.05, 0.00, 0.115], [-0.09, 0.08, 0.095], [0.02, -0.11, 0.085]].forEach(function (p) {
    var ph = new THREE.Mesh(new THREE.TorusGeometry(p[2], 0.017, 6, 18), piyozMat);
    ph.rotation.x = Math.PI / 2;
    ph.position.set(p[0], 0.255, p[1]);
    ich.add(ph);
  });
  // Ko‘kat — jimjit yashil sepma
  for (var z = 0; z < 8; z++) {
    var az = (z / 8) * Math.PI * 2;
    ich.add(donacha(0.020, M.ovqat(0x3F6B32),
      Math.cos(az) * 0.20, 0.250, Math.sin(az) * 0.20, 6));
  }

  return tayyorla(ich, 1.40, true, 'palov-lagani');
}

/* =========================================================
   7) SAMOVAR — mehmon kutishning ramzi
   Jez tana (pastda keng, o‘rtada bo‘g‘im, tepada tor), ko‘mir
   kamerasi va oyoqchalar, jo‘mrak, ikki yon dasta, qopqoq va
   uning ustida kichik choynak.
   ========================================================= */
export function samovarYasa() {
  var ich = new THREE.Group();
  var jez = M.jez(RANG.jez);
  var jezIkki = M.jez(RANG.jez, true);
  var jezT = M.jez(RANG.jezTuq);

  // Ko‘mir kamerasi va oyoqchalar
  var kamera = new THREE.Mesh(new THREE.CylinderGeometry(0.230, 0.260, 0.170, 18), jezT);
  kamera.position.y = 0.115;
  ich.add(kamera);
  for (var i = 0; i < 3; i++) {
    var a = (i / 3) * Math.PI * 2 + Math.PI / 6;
    var oyoq = new THREE.Mesh(new THREE.CylinderGeometry(0.030, 0.044, 0.060, 8), jezT);
    oyoq.position.set(Math.cos(a) * 0.185, 0.030, Math.sin(a) * 0.185);
    ich.add(oyoq);
  }
  // Ko‘mir eshikchasi
  var eshikcha = new THREE.Mesh(new THREE.BoxGeometry(0.130, 0.090, 0.030), M.jez(0x5A3E18));
  eshikcha.position.set(0, 0.115, 0.250);
  ich.add(eshikcha);
  ich.add(donacha(0.020, jez, 0, 0.115, 0.272, 8));

  // Tana — charxlangan jez gavda
  var tana = charx([
    [0.000, 0.170], [0.250, 0.180], [0.300, 0.250], [0.320, 0.360],
    [0.300, 0.460], [0.240, 0.530], [0.196, 0.560], [0.230, 0.610],
    [0.260, 0.700], [0.250, 0.790], [0.216, 0.850], [0.200, 0.880],
    [0.196, 0.900]
  ], 24, jezIkki);
  ich.add(tana);

  // Naqsh halqalari
  ich.add(halqa(0.322, 0.014, 0.360, jezT, 24));
  ich.add(halqa(0.200, 0.020, 0.562, jezT, 20));
  ich.add(halqa(0.252, 0.012, 0.760, jezT, 22));
  aylanaBoylab(ich, 12, 0.312, 0.430, function () {
    return donacha(0.024, jezT, 0, 0, 0, 8);
  });

  // Jo‘mrak — silindr, og‘iz va qo‘l dastagi
  var jomrak = new THREE.Mesh(new THREE.CylinderGeometry(0.040, 0.046, 0.230, 12), jez);
  jomrak.rotation.x = Math.PI / 2 - 0.30;
  jomrak.position.set(0, 0.310, 0.320);
  ich.add(jomrak);
  var ogiz = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.038, 0.055, 12), jezT);
  ogiz.rotation.x = Math.PI / 2 - 0.30;
  ogiz.position.set(0, 0.268, 0.428);
  ich.add(ogiz);
  // jo‘mrak dastagi (buragich)
  var buragich = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.150, 8), jezT);
  buragich.rotation.z = Math.PI / 2;
  buragich.position.set(0, 0.400, 0.300);
  ich.add(buragich);
  ich.add(donacha(0.028, jezT, 0.078, 0.400, 0.300, 8));
  ich.add(donacha(0.028, jezT, -0.078, 0.400, 0.300, 8));

  // Ikki yon dasta
  [1, -1].forEach(function (t) {
    var dasta = new THREE.Mesh(new THREE.TorusGeometry(0.100, 0.024, 8, 16, Math.PI), jezT);
    dasta.position.set(t * 0.290, 0.430, 0);
    dasta.rotation.set(Math.PI / 2, 0, t > 0 ? -Math.PI / 2 : Math.PI / 2);
    ich.add(dasta);
  });

  // Qopqoq
  var qopqoq = new THREE.Mesh(
    new THREE.SphereGeometry(0.205, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), jez);
  qopqoq.scale.set(1, 0.46, 1);
  qopqoq.position.y = 0.898;
  ich.add(qopqoq);
  ich.add(halqa(0.206, 0.014, 0.900, jezT, 20));

  // Qopqoq ustidagi kichik choynak
  var chy = 0.985;
  var choynak = charx([
    [0.000, 0.000], [0.075, 0.000], [0.105, 0.030], [0.118, 0.085],
    [0.100, 0.130], [0.062, 0.158], [0.052, 0.180]
  ], 18, M.chinni(RANG.chinni, true));
  choynak.position.y = chy;
  ich.add(choynak);
  var chQopqoq = new THREE.Mesh(
    new THREE.SphereGeometry(0.056, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.chinni());
  chQopqoq.scale.set(1, 0.55, 1);
  chQopqoq.position.y = chy + 0.180;
  ich.add(chQopqoq);
  ich.add(donacha(0.020, M.mato(RANG.kok), 0, chy + 0.218, 0, 8));
  // choynak jo‘mragi va dastasi
  var chYol = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.090, chy + 0.055, 0),
    new THREE.Vector3(0.145, chy + 0.090, 0),
    new THREE.Vector3(0.175, chy + 0.150, 0)
  ]);
  ich.add(new THREE.Mesh(new THREE.TubeGeometry(chYol, 12, 0.018, 8, false), M.chinni()));
  var chDasta = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.014, 6, 14, Math.PI), M.chinni());
  chDasta.position.set(-0.100, chy + 0.105, 0);
  chDasta.rotation.z = Math.PI / 2;
  ich.add(chDasta);
  ich.add(halqa(0.112, 0.008, chy + 0.075, M.mato(RANG.kok), 18));

  return tayyorla(ich, 1.45, false, 'samovar');
}

/* =========================================================
   8) OFTOBA VA TOG‘ORA — qo‘l yuvish to‘plami
   Mehmon dasturxonga o‘tirishdan oldin qo‘l yuvadi: jez oftoba
   (uzun tor bo‘yinli ko‘za, egri jo‘mrak, dasta) va uning ostidagi
   keng tog‘ora.
   ========================================================= */
export function oftobaYasa() {
  var ich = new THREE.Group();
  var jez = M.jez(RANG.jez);
  var jezIkki = M.jez(RANG.jez, true);
  var jezT = M.jez(RANG.jezTuq);

  /* --- Tog‘ora: keng yassi jez tovoq --- */
  var togora = charx([
    [0.000, 0.020], [0.220, 0.016], [0.420, 0.030], [0.560, 0.078],
    [0.640, 0.146], [0.668, 0.196], [0.652, 0.214], [0.618, 0.176],
    [0.588, 0.122], [0.500, 0.078], [0.340, 0.052], [0.000, 0.044]
  ], 28, jezIkki);
  ich.add(togora);
  ich.add(halqa(0.270, 0.026, 0.010, jezT));
  // chetidagi naqsh halqasi
  ich.add(halqa(0.628, 0.012, 0.172, jezT, 28));
  aylanaBoylab(ich, 18, 0.598, 0.140, function () {
    return donacha(0.022, jezT, 0, 0, 0, 8);
  });
  // tog‘ora tubidagi panjara (suv oqadigan to‘r)
  for (var i = -2; i <= 2; i++) {
    ich.add(plita(0.480, 0.010, 0.020, jezT, 0, 0.052, i * 0.090));
  }

  /* --- Oftoba: tog‘ora ichida turadi --- */
  var oftoba = new THREE.Group();
  oftoba.position.set(-0.06, 0.052, -0.02);

  var tana = charx([
    [0.000, 0.000], [0.130, 0.000], [0.185, 0.024], [0.245, 0.086],
    [0.278, 0.180], [0.268, 0.280], [0.215, 0.352], [0.140, 0.406],
    [0.098, 0.470], [0.090, 0.560], [0.104, 0.628], [0.132, 0.668],
    [0.118, 0.694], [0.086, 0.650], [0.074, 0.590], [0.000, 0.576]
  ], 22, jezIkki);
  oftoba.add(tana);

  // Kunda, qorin va bo‘yin naqshlari
  oftoba.add(halqa(0.132, 0.022, 0.012, jezT));
  oftoba.add(halqa(0.280, 0.013, 0.180, jezT, 22));
  oftoba.add(halqa(0.246, 0.011, 0.300, jezT, 22));
  oftoba.add(halqa(0.100, 0.014, 0.560, jezT, 18));
  aylanaBoylab(oftoba, 10, 0.272, 0.240, function () {
    return donacha(0.024, jezT, 0, 0, 0, 8);
  });

  // Qopqoq
  var qop = new THREE.Mesh(
    new THREE.SphereGeometry(0.108, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), jez);
  qop.scale.set(1, 0.55, 1);
  qop.position.y = 0.686;
  oftoba.add(qop);
  oftoba.add(donacha(0.034, jezT, 0, 0.756, 0, 10));

  // Egri jo‘mrak — TubeGeometry
  var yol = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.200, 0.140, 0),
    new THREE.Vector3(0.330, 0.230, 0),
    new THREE.Vector3(0.410, 0.390, 0),
    new THREE.Vector3(0.418, 0.540, 0),
    new THREE.Vector3(0.372, 0.640, 0)
  ]);
  oftoba.add(new THREE.Mesh(new THREE.TubeGeometry(yol, 22, 0.042, 10, false), jez));
  var jOgiz = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.044, 0.055, 12, 1, true), jezIkki);
  jOgiz.position.set(0.364, 0.664, 0);
  jOgiz.rotation.z = 0.38;
  oftoba.add(jOgiz);

  // Dasta — jo‘mrakning qarshi tomonida
  var dasta = new THREE.Mesh(new THREE.TorusGeometry(0.165, 0.026, 8, 18, Math.PI), jezT);
  dasta.position.set(-0.150, 0.400, 0);
  dasta.rotation.z = Math.PI / 2;
  oftoba.add(dasta);
  // dastani bo‘yinga ulovchi band
  var band = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.020, 0.110, 8), jezT);
  band.rotation.z = Math.PI / 2 - 0.5;
  band.position.set(-0.130, 0.590, 0);
  oftoba.add(band);

  ich.add(oftoba);

  // Tog‘ora chetiga qo‘yilgan sovun toshi
  var sovun = plita(0.140, 0.050, 0.100, M.ovqat(0xEFE6D0), 0.34, 0.075, 0.20);
  sovun.rotation.y = 0.4;
  ich.add(sovun);

  return tayyorla(ich, 1.35, true, 'oftoba');
}

/* =========================================================
   9) KASHTALI SOCHIQ — qo‘l artish uchun taxlangan oq mato
   Bir necha yupqa qatlam, chetlarida qizil-ko‘k kashta hoshiyasi.
   ========================================================= */
export function sochiqYasa() {
  var ich = new THREE.Group();
  var oq = M.mato(RANG.matoOq);
  var oqSoya = M.mato(0xEDE6D8);
  var qizil = M.mato(RANG.qizil);
  var kok = M.mato(RANG.kok);

  var EN = 0.80, BOY = 0.46, QAL = 0.032;

  // Taxlangan qatlamlar — har biri sal kichrayib boradi
  for (var i = 0; i < 4; i++) {
    var k = 1 - i * 0.035;
    var y = 0.018 + i * QAL;
    ich.add(plita(EN * k, QAL - 0.004, BOY * k, i % 2 ? oqSoya : oq, 0, y, 0));
    // taxning yumshoq buklamasi (old cheti)
    var buk = new THREE.Mesh(new THREE.CylinderGeometry(QAL / 2, QAL / 2, EN * k, 10), i % 2 ? oqSoya : oq);
    buk.rotation.z = Math.PI / 2;
    buk.position.set(0, y, BOY * k / 2);
    ich.add(buk);
    var buk2 = buk.clone();
    buk2.position.z = -BOY * k / 2;
    ich.add(buk2);
  }

  var yUst = 0.018 + 3 * QAL + QAL / 2;

  // Kashta hoshiyasi — qizil va ko‘k chiziqlar
  var enU = EN * 0.895, boyU = BOY * 0.895;
  [1, -1].forEach(function (t) {
    ich.add(plita(enU, 0.010, 0.040, qizil, 0, yUst, t * (boyU / 2 - 0.038)));
    ich.add(plita(enU, 0.010, 0.018, kok, 0, yUst + 0.002, t * (boyU / 2 - 0.078)));
    ich.add(plita(0.040, 0.010, boyU - 0.076, qizil, t * (enU / 2 - 0.026), yUst, 0));
  });

  // Kashta tugmalari — hoshiya ustidagi ritm
  for (var j = 0; j < 9; j++) {
    var x = -enU / 2 + 0.055 + j * (enU - 0.110) / 8;
    ich.add(donacha(0.018, kok, x, yUst + 0.010, boyU / 2 - 0.038, 8));
    ich.add(donacha(0.018, kok, x, yUst + 0.010, -(boyU / 2 - 0.038), 8));
  }

  // Markazdagi kichik kashta guli
  ich.add(disk(0.070, 0.010, qizil, 0, yUst + 0.006, 0, 16));
  ich.add(disk(0.034, 0.010, kok, 0, yUst + 0.012, 0, 12));
  aylanaBoylab(ich, 8, 0.110, yUst + 0.008, function () {
    var barg = donacha(0.036, qizil, 0, 0, 0, 8);
    barg.scale.set(1, 0.22, 0.55);
    return barg;
  });

  return tayyorla(ich, 1.10, true, 'sochiq');
}

/* =========================================================
   10) SHORVA KOSASI — mehmonga tortiladigan issiq taom idishi
   Chinni kosa, tashqarisida ko‘k naqsh halqalari, ichida qaymoqli
   shorva yuzasi.
   ========================================================= */
export function kosaYasa() {
  var ich = new THREE.Group();

  var kosa = charx([
    [0.000, 0.000], [0.140, 0.000], [0.170, 0.036], [0.250, 0.140],
    [0.320, 0.280], [0.348, 0.400], [0.340, 0.412], [0.310, 0.294],
    [0.244, 0.160], [0.166, 0.062], [0.000, 0.048]
  ], 24, M.chinni(RANG.chinni, true));
  ich.add(kosa);

  // Kunda
  ich.add(halqa(0.146, 0.024, 0.016, M.chinni(0xE4DCCB)));

  // Tashqi ko‘k naqsh halqalari
  ich.add(halqa(0.344, 0.010, 0.392, M.mato(RANG.kok), 24));
  ich.add(halqa(0.300, 0.009, 0.256, M.mato(RANG.kok), 24));
  ich.add(halqa(0.222, 0.008, 0.116, M.mato(RANG.kok), 22));
  // naqsh nuqtalari — paxta guli ritmi
  var kokMat = M.mato(RANG.kok);
  aylanaBoylab(ich, 10, 0.290, 0.200, function () {
    var n = donacha(0.030, kokMat, 0, 0, 0, 8);
    n.scale.set(1, 1.4, 0.35);
    return n;
  });

  // Shorva yuzasi — yassi disk
  ich.add(disk(0.318, 0.014, M.ovqat(0xD8A85E), 0, 0.372, 0, 24));
  // Qaymoq — yuzadagi oq halqa va tomchilar
  var qaymoq = M.ovqat(0xF6F0E2);
  var halqaQ = new THREE.Mesh(new THREE.TorusGeometry(0.150, 0.020, 6, 20), qaymoq);
  halqaQ.rotation.x = Math.PI / 2;
  halqaQ.position.y = 0.382;
  ich.add(halqaQ);
  ich.add(disk(0.052, 0.012, qaymoq, 0, 0.383, 0, 12));
  aylanaBoylab(ich, 6, 0.238, 0.381, function () {
    var t = donacha(0.036, qaymoq, 0, 0, 0, 8);
    t.scale.set(1, 0.30, 1);
    return t;
  });
  // Ko‘kat sepmasi
  for (var i = 0; i < 9; i++) {
    var a = (i / 9) * Math.PI * 2 + 0.4;
    var r = 0.08 + (i % 3) * 0.075;
    ich.add(plita(0.030, 0.008, 0.012, M.ovqat(0x3F6B32),
      Math.cos(a) * r, 0.386, Math.sin(a) * r));
  }

  return tayyorla(ich, 1.00, true, 'kosa');
}

/* =========================================================
   11) O‘YMA YOG‘OCH ESHIK — hovli darvozasi
   Ikki tabaqa, har birida o‘yma girih panellari, o‘rtasida jez
   taqillatgich halqa, tepasida naqshli peshtoq, pastida ostona.
   ========================================================= */
export function eshikYasa() {
  var ich = new THREE.Group();
  var yog = M.yogoch();
  var yogT = M.yogoch(RANG.yogochTuq);
  var yogO = M.yogoch(RANG.yogochOch);
  var jez = M.jez(RANG.jez);

  var EN = 0.90, H = 1.32, OST = 0.10;

  // Yon ustunlar
  [1, -1].forEach(function (t) {
    var ustun = plita(0.105, H, 0.110, yogT, t * (EN / 2 + 0.052), H / 2, 0);
    ich.add(ustun);
    // ustundagi o‘yma halqalar
    for (var i = 0; i < 5; i++) {
      ich.add(plita(0.118, 0.026, 0.122, yog, t * (EN / 2 + 0.052), 0.22 + i * 0.24, 0));
    }
  });

  // Tepa bosh (peshtoq)
  ich.add(plita(EN + 0.30, 0.110, 0.130, yogT, 0, H + 0.055, 0));
  ich.add(plita(EN + 0.36, 0.045, 0.160, yog, 0, H + 0.132, 0));
  // peshtoqdagi o‘yma naqsh — kichik girih tishchalar
  for (var p = 0; p < 9; p++) {
    var px = -0.44 + p * 0.11;
    var tish = plita(0.060, 0.055, 0.030, yogO, px, H + 0.055, 0.070);
    tish.rotation.z = Math.PI / 4;
    ich.add(tish);
  }

  // OSTONA — ko‘ndalang balandroq bo‘sag‘a
  ich.add(plita(EN + 0.24, OST, 0.190, yogT, 0, OST / 2, 0));
  ich.add(plita(EN + 0.24, 0.022, 0.200, yogO, 0, OST, 0));

  // Ikki tabaqa
  [1, -1].forEach(function (t) {
    var tabaqa = new THREE.Group();
    tabaqa.position.set(t * EN / 4, 0, 0);

    // asos taxta
    tabaqa.add(plita(EN / 2 - 0.012, H - OST - 0.03, 0.055, yog, 0, OST + (H - OST) / 2 - 0.015, 0));
    // tabaqa ramkasi
    tabaqa.add(plita(EN / 2 - 0.012, 0.055, 0.075, yogT, 0, H - 0.045, 0));
    tabaqa.add(plita(EN / 2 - 0.012, 0.055, 0.075, yogT, 0, OST + 0.040, 0));
    tabaqa.add(plita(0.055, H - OST - 0.10, 0.075, yogT, t * (EN / 4 - 0.030), OST + (H - OST) / 2, 0));

    // o‘yma girih panellari — yupqa plitalar to‘ri
    for (var r = 0; r < 3; r++) {
      var py = OST + 0.180 + r * 0.360;
      tabaqa.add(plita(EN / 2 - 0.110, 0.290, 0.020, yogO, 0, py, 0.038));
      // ichidagi kesishgan kvadratlar (girih)
      [0, Math.PI / 4].forEach(function (bur) {
        var kv = new THREE.Group();
        [[0.170, 0.028, 0, 0.085], [0.170, 0.028, 0, -0.085],
         [0.028, 0.170, 0.085, 0], [0.028, 0.170, -0.085, 0]].forEach(function (c) {
          var m = new THREE.Mesh(new THREE.BoxGeometry(c[0], c[1], 0.026), yogT);
          m.position.set(c[2], c[3], 0);
          kv.add(m);
        });
        kv.rotation.z = bur;
        kv.position.set(0, py, 0.058);
        tabaqa.add(kv);
      });
      tabaqa.add(donacha(0.032, yogT, 0, py, 0.062, 10));
    }
    ich.add(tabaqa);
  });

  // Jez taqillatgich halqalar
  [1, -1].forEach(function (t) {
    var taq = new THREE.Mesh(new THREE.TorusGeometry(0.070, 0.016, 8, 18), jez);
    taq.position.set(t * 0.115, 0.74, 0.085);
    ich.add(taq);
    ich.add(donacha(0.034, jez, t * 0.115, 0.815, 0.080, 10));
    // tabaqa dastasi
    var dasta = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.120, 8), jez);
    dasta.position.set(t * 0.330, 0.68, 0.075);
    ich.add(dasta);
  });

  return tayyorla(ich, 1.45, true, 'eshik');
}

/* =========================================================
   12) GULDON — mehmonxona javonidagi sopol guldon
   Bo‘yinli ko‘za, ichida bir necha gul (ingichka poya, rangli
   yassilangan gulbarglar) va yashil barglar.
   ========================================================= */
export function guldonYasa() {
  var ich = new THREE.Group();
  var sopol = M.chinni(0xC1502E, true);
  var sopolT = M.chinni(0x93381F);

  // Ko‘za tanasi
  var koza = charx([
    [0.000, 0.000], [0.140, 0.000], [0.190, 0.030], [0.252, 0.110],
    [0.286, 0.230], [0.272, 0.350], [0.212, 0.436], [0.160, 0.500],
    [0.148, 0.560], [0.170, 0.610], [0.156, 0.634], [0.128, 0.594],
    [0.122, 0.540], [0.000, 0.524]
  ], 22, sopol);
  ich.add(koza);
  ich.add(halqa(0.142, 0.022, 0.014, sopolT));
  ich.add(halqa(0.288, 0.012, 0.230, M.mato(RANG.matoOq), 22));
  ich.add(halqa(0.242, 0.010, 0.340, M.mato(RANG.kok), 22));
  ich.add(halqa(0.152, 0.014, 0.560, M.mato(RANG.kok), 18));
  aylanaBoylab(ich, 10, 0.280, 0.285, function () {
    var n = donacha(0.026, M.mato(RANG.matoOq), 0, 0, 0, 8);
    n.scale.set(1, 1.2, 0.4);
    return n;
  });

  // Gullar — poya, gulbarglar va markaz
  var gulRang = [0xE0B33A, 0xC1502E, 0xF2E4E9, 0x8E5FA8, 0xE07B39];
  var joylar = [[0.00, 0.00, 0.46, 0.00, 0.00], [0.14, 0.05, 0.38, 0.22, 0.08],
                [-0.13, 0.08, 0.40, -0.20, 0.12], [0.05, -0.14, 0.34, 0.08, -0.24],
                [-0.06, -0.12, 0.30, -0.10, -0.20]];
  joylar.forEach(function (j, i) {
    var uzun = j[2];
    var poya = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, uzun, 6), M.ovqat(0x3F6B32));
    poya.position.set(j[0] * 0.5, 0.610 + uzun / 2, j[1] * 0.5);
    poya.rotation.z = -j[3] * 0.7;
    poya.rotation.x = j[4] * 0.7;
    ich.add(poya);

    var gx = j[0] * 0.5 + j[3] * 0.30;
    var gz = j[1] * 0.5 + j[4] * 0.30;
    var gy = 0.610 + uzun;
    var mat = M.jilo(gulRang[i % gulRang.length]);
    // gulbarglar
    for (var k = 0; k < 6; k++) {
      var a = (k / 6) * Math.PI * 2;
      var barg = donacha(0.070, mat, gx + Math.cos(a) * 0.055, gy, gz + Math.sin(a) * 0.055, 8);
      barg.scale.set(1, 0.34, 0.62);
      barg.rotation.y = -a;
      ich.add(barg);
    }
    // gul markazi
    ich.add(donacha(0.042, M.jilo(0xE8C34A), gx, gy + 0.014, gz, 10));
  });

  // Yashil barglar — poyalar orasidan chiqadi
  var bargMat = M.ovqat(0x4E7A3A);
  [[0.20, 0.06, 0.7], [-0.19, 0.10, -0.6], [0.06, -0.20, 2.2], [-0.10, -0.16, -2.4]]
    .forEach(function (bp) {
      var barg = donacha(0.120, bargMat, bp[0], 0.760, bp[1], 10);
      barg.scale.set(1.35, 0.18, 0.50);
      barg.rotation.y = bp[2];
      barg.rotation.z = 0.30;
      ich.add(barg);
    });

  return tayyorla(ich, 1.20, false, 'guldon');
}

/* =========================================================
   REYESTR — sahna kodi shu jadvaldan foydalanib ro‘yxat quradi
   ========================================================= */
export const ODOB_BUYUMLARI = {
  korpacha: {
    nom: 'Ko‘rpacha',
    yasa: korpachaYasa,
    izoh: 'Mehmonga eng avval ko‘rpacha solinadi — o‘tirish joyi hurmatning ' +
          'birinchi belgisi. To‘rga, ya’ni eshikdan uzoq joyga solingan ' +
          'ko‘rpacha eng aziz mehmonga atalgan bo‘ladi.'
  },
  xontaxta: {
    nom: 'Xontaxta',
    yasa: xontaxtaYasa,
    izoh: 'Dasturxon yoziladigan past yog‘och stol. Uning atrofida katta-yu ' +
          'kichik bir halqa bo‘lib o‘tiradi; xontaxtaga oyoq uzatish yoki ' +
          'suyanish odobsizlik sanaladi.'
  },
  kavush: {
    nom: 'Kavush',
    yasa: kavushYasa,
    izoh: 'Uyga kirishdan oldin poyabzal ostonada yechiladi va uchi eshik ' +
          'tomonga qaratib qo‘yiladi. Bu — uy pokligiga hurmat hamda ' +
          'chiqayotgan mehmonga qulaylik.'
  },
  meva: {
    nom: 'Mevali tovoq',
    yasa: mevaTovoqYasa,
    izoh: 'Dasturxonning to‘kinlik belgisi. Meva mehmon oldiga yaqin ' +
          'qo‘yiladi, uy egasi esa eng yaxshi bo‘lagini o‘zi emas, ' +
          'mehmonga uzatadi.'
  },
  shirinlik: {
    nom: 'Shirinliklar',
    yasa: shirinlikYasa,
    izoh: 'Parvarda, navvot, holva va mayiz — choy dasturxonining birinchi ' +
          'qatori. «Shirin so‘z — shirinlikdan totli» deb, mehmonni avval ' +
          'yaxshi so‘z bilan kutib olish o‘rgatiladi.'
  },
  palov: {
    nom: 'Palov lageni',
    yasa: palovLaganiYasa,
    izoh: 'Milliy taomlarning boshi. Palov bitta katta lagandan birga ' +
          'yeyiladi — bu hamjihatlik ramzi; lagan avval kattalar tomonga ' +
          'suriladi va ular boshlagach, boshqalar qo‘l uzatadi.'
  },
  samovar: {
    nom: 'Samovar',
    yasa: samovarYasa,
    izoh: 'Uzluksiz qaynayotgan samovar — «uy mehmonga doim tayyor» degani. ' +
          'Choy kichikroq idishga uch marta qaytarib quyiladi, so‘ng ' +
          'piyolaga yarimlab uzatiladi.'
  },
  oftoba: {
    nom: 'Oftoba va tog‘ora',
    yasa: oftobaYasa,
    izoh: 'Dasturxonga o‘tirishdan oldin qo‘l yuviladi. Suvni odatda uydagi ' +
          'kichik yoshli bola quyadi — bu unga xizmat va hurmat odobini ' +
          'amalda o‘rgatishning qadimiy usuli.'
  },
  sochiq: {
    nom: 'Kashtali sochiq',
    yasa: sochiqYasa,
    izoh: 'Qo‘l yuvilgach uzatiladigan kashtali oq mato. Uni ikki qo‘llab ' +
          'uzatish va yuvilgan qo‘lni silkitmaslik dasturxon odobining ' +
          'mayda, ammo e’tiborli qoidasidir.'
  },
  kosa: {
    nom: 'Shorva kosasi',
    yasa: kosaYasa,
    izoh: 'Issiq taom kosada tortiladi. To‘la qilib quyilgan kosa mehmonning ' +
          'qo‘lini kuydirmasin deb ikki qo‘llab, ohista uzatiladi.'
  },
  eshik: {
    nom: 'O‘yma eshik',
    yasa: eshikYasa,
    izoh: 'Hovli darvozasi va ostona. Ostonaga qadam qo‘yib turib salom ' +
          'berilmaydi, unda o‘tirilmaydi; mehmon eshikdan kirganda uy egasi ' +
          'o‘rnidan turib kutib oladi.'
  },
  guldon: {
    nom: 'Guldon',
    yasa: guldonYasa,
    izoh: 'Mehmonxona javonidagi sopol guldon. Uyning ozodaligi va ' +
          'ko‘rkamligi ham mehmonga bo‘lgan hurmatning bir ko‘rinishi ' +
          'hisoblanadi.'
  }
};

/* Barcha buyumlarni bir chaqiruvda yasash — namoyish galereyasi uchun. */
export function barchaBuyumlar() {
  var natija = {};
  Object.keys(ODOB_BUYUMLARI).forEach(function (kalit) {
    natija[kalit] = ODOB_BUYUMLARI[kalit].yasa();
  });
  return natija;
}

export default ODOB_BUYUMLARI;
