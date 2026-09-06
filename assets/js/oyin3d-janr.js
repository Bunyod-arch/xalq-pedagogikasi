/* =========================================================================
   «OG‘ZAKI IJOD XAZINASI» — HAQIQIY 3D O‘YIN (Three.js · WebGL)
   5-modul: «Xalq pedagogikasi va o‘zbek xalq og‘zaki ijodi».

   O‘yin mazmuni
   -------------
   Hovlidagi gilam ustida to‘rtta o‘yma yog‘och kursi (ustun) turadi.
   Har savolda ular ustiga to‘rtta HAQIQIY 3D buyum ko‘tariladi — anor,
   tuxum, igna, sham, non, ketmon, beshik, do‘mbira, doira, gilam va
   boshqalar. Yuqorida janr nishoni (Topishmoq · Maqol · Ertak · Qo‘shiq ·
   Doston) va savol matni chiqadi. O‘quvchi to‘g‘ri buyumni bosadi.

   Har bir tushuncha uchun alohida, tanib olsa bo‘ladigan model ishlatiladi:
   matn yozilgan kub yoki shartli belgi YO‘Q. Modellar tayyor
   kutubxonalardan olinadi:
     model-ogzaki.js  — topishmoq javoblari va ertak buyumlari
     model-maishiy.js — beshik, non, kitob, ketmon, o‘roq…
     model-cholgu.js  — do‘mbira, doira, dutor, nay, chang, rubob
     model-oyin.js    — olma, do‘ppi, qilich, ro‘mol, terak…
     model-hunar.js   — gilam, so‘zana, pichoq, ko‘za…

   Bu fayl mustaqil: o‘z HTML karkasini, o‘z uslublarini va butun 3D
   sahnasini o‘zi quradi. Umumiy fayllarga (app.js, style.css, oyin.js,
   test.js) tegmaydi.
   ========================================================================= */
import * as THREE from '../vendor/three.module.min.js';

(async function () {
  'use strict';

  /* =======================================================================
     0. IDISH
     ======================================================================= */
  var idish = document.getElementById('oyin3d-janr') ||
              document.getElementById('oyin3d');
  if (!idish) return;
  if (idish.querySelector('canvas')) return;        // boshqa o‘yin band qilgan
  if (idish.dataset.oyin3dBand) return;
  idish.dataset.oyin3dBand = 'janr';

  var MODUL = parseInt(idish.dataset.modul || '5', 10);

  /* =======================================================================
     1. WEBGL BORMI?
     ======================================================================= */
  function webglBor() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }
  if (!webglBor()) {
    var xp = document.createElement('p');
    xp.className = 'o3j-xato';
    xp.textContent = 'Brauzeringiz 3D grafikani qo‘llab-quvvatlamaydi. ' +
                     'Quyidagi oddiy o‘yin variantida ishlashingiz mumkin.';
    idish.appendChild(xp);
    return;
  }

  var kamHarakat = !!(window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* =======================================================================
     2. USLUBLAR — faqat shu o‘yinga tegishli («o3j-» old qo‘shimchasi)
     ======================================================================= */
  if (!document.getElementById('o3j-uslub')) {
    var uslub = document.createElement('style');
    uslub.id = 'o3j-uslub';
    uslub.textContent = [
      '.o3j-sahna{position:relative;width:100%;border-radius:18px;overflow:hidden;',
      '  background:#F3E6CE;box-shadow:0 2px 4px rgba(26,22,20,.08),0 12px 28px rgba(26,22,20,.14);}',
      '.o3j-sahna canvas{display:block;width:100%;height:auto;touch-action:manipulation;cursor:pointer;}',
      '.o3j-ust{position:absolute;inset:0;pointer-events:none;font:inherit;}',
      '.o3j-qator{position:absolute;top:11px;left:11px;right:11px;display:flex;',
      '  align-items:flex-start;justify-content:space-between;gap:8px;}',
      '.o3j-tabl{flex:0 0 auto;display:inline-flex;gap:6px;align-items:baseline;',
      '  padding:6px 13px;border-radius:999px;background:rgba(251,247,240,.93);color:#1B3B6F;',
      '  font-size:.82rem;font-weight:600;white-space:nowrap;',
      '  box-shadow:0 2px 8px rgba(26,22,20,.16);}',
      '.o3j-tabl b{font-size:1rem;color:#C1502E;}',
      '.o3j-janr{flex:0 0 auto;padding:6px 15px;border-radius:999px;',
      '  background:rgba(47,107,69,.94);color:#FBF7F0;font-size:.78rem;font-weight:700;',
      '  letter-spacing:.04em;text-transform:uppercase;white-space:nowrap;',
      '  box-shadow:0 3px 10px rgba(26,22,20,.24);}',
      '.o3j-savolquti{position:absolute;left:12px;right:12px;top:52px;text-align:center;}',
      '.o3j-savol{display:inline-block;margin:0;max-width:44ch;padding:9px 18px;',
      '  border-radius:16px;background:rgba(27,59,111,.93);color:#FBF7F0;',
      '  font-size:.95rem;font-weight:600;line-height:1.35;',
      '  box-shadow:0 5px 16px rgba(26,22,20,.26);}',
      '.o3j-past{position:absolute;left:12px;right:12px;bottom:12px;text-align:center;}',
      '.o3j-xabar{display:inline-block;margin:0;max-width:100%;padding:7px 16px;',
      '  border-radius:999px;background:rgba(43,33,24,.66);color:#FBF7F0;',
      '  font-size:.85rem;font-weight:600;line-height:1.35;}',
      '.o3j-xabar:empty{display:none;}',
      '.o3j-xabar.togri{background:rgba(31,84,52,.9);color:#DFF6E4;}',
      '.o3j-xabar.xato{background:rgba(150,52,26,.9);color:#FFE2D6;}',
      '.o3j-parda{position:absolute;inset:0;display:flex;flex-direction:column;',
      '  align-items:center;justify-content:center;gap:11px;text-align:center;padding:22px;',
      '  background:linear-gradient(160deg,rgba(27,59,111,.94),rgba(43,33,24,.94));',
      '  color:#FBF7F0;pointer-events:auto;}',
      '.o3j-parda h4{margin:0;font-size:1.3rem;line-height:1.25;}',
      '.o3j-parda p{margin:0;font-size:.92rem;max-width:38ch;line-height:1.5;}',
      '.o3j-foiz{font-size:2.5rem;font-weight:800;color:#D4A24C;line-height:1;}',
      '.o3j-ich{pointer-events:auto;cursor:pointer;margin-top:4px;padding:11px 26px;',
      '  border:0;border-radius:999px;background:#D4A24C;color:#2A1B08;',
      '  font:inherit;font-size:.98rem;font-weight:700;',
      '  box-shadow:0 5px 14px rgba(26,22,20,.32);transition:transform .15s ease;}',
      '.o3j-ich:hover{transform:translateY(-2px);} .o3j-ich:active{transform:translateY(1px);}',
      '.o3j-xato{margin:0;padding:22px;border-radius:16px;background:#FBF7F0;color:#1B3B6F;',
      '  text-align:center;font-weight:600;}',
      '.o3j-tor .o3j-qator{top:7px;left:7px;right:7px;gap:5px;}',
      '.o3j-tor .o3j-tabl{padding:4px 9px;font-size:.68rem;gap:4px;}',
      '.o3j-tor .o3j-tabl b{font-size:.8rem;}',
      '.o3j-tor .o3j-janr{padding:4px 10px;font-size:.64rem;}',
      '.o3j-tor .o3j-savolquti{top:40px;left:7px;right:7px;}',
      '.o3j-tor .o3j-savol{padding:7px 13px;font-size:.8rem;border-radius:13px;}',
      '.o3j-tor .o3j-past{left:7px;right:7px;bottom:8px;}',
      '.o3j-tor .o3j-xabar{padding:5px 11px;font-size:.73rem;}',
      '.o3j-tor .o3j-foiz{font-size:2rem;} .o3j-tor .o3j-parda h4{font-size:1.05rem;}',
      '.o3j-tor .o3j-parda p{font-size:.8rem;}',
      '@media (prefers-reduced-motion: reduce){.o3j-ich{transition:none;}}'
    ].join('\n');
    document.head.appendChild(uslub);
  }

  /* =======================================================================
     3. HTML KARKAS
     ======================================================================= */
  var sahnaDiv = document.createElement('div');
  sahnaDiv.className = 'o3j-sahna';
  sahnaDiv.innerHTML =
    '<canvas></canvas>' +
    '<div class="o3j-ust">' +
      '<div class="o3j-qator">' +
        '<span class="o3j-tabl">Ball <b class="o3j-ball">0</b></span>' +
        '<span class="o3j-janr">Og‘zaki ijod</span>' +
        '<span class="o3j-tabl">Qoldi <b class="o3j-qoldi">0</b></span>' +
      '</div>' +
      '<div class="o3j-savolquti"><p class="o3j-savol"></p></div>' +
      '<div class="o3j-past"><p class="o3j-xabar" role="status"></p></div>' +
    '</div>';
  idish.appendChild(sahnaDiv);

  var tugmaQator = document.createElement('div');
  tugmaQator.className = 'oyin-tugmalar';
  tugmaQator.innerHTML =
    '<button type="button" class="tug tug-asos tug-kichik o3j-boshla">▶ O‘yinni boshlash</button>' +
    '<button type="button" class="tug tug-ramka tug-kichik o3j-qayta">↻ Qaytadan</button>';
  idish.appendChild(tugmaQator);

  var canvas   = sahnaDiv.querySelector('canvas');
  var ballEl   = sahnaDiv.querySelector('.o3j-ball');
  var qoldiEl  = sahnaDiv.querySelector('.o3j-qoldi');
  var janrEl   = sahnaDiv.querySelector('.o3j-janr');
  var savolEl  = sahnaDiv.querySelector('.o3j-savol');
  var xabarEl  = sahnaDiv.querySelector('.o3j-xabar');
  var boshlaTg = tugmaQator.querySelector('.o3j-boshla');
  var qaytaTg  = tugmaQator.querySelector('.o3j-qayta');

  /* =======================================================================
     4. MODEL KUTUBXONALARINI YUKLASH
     Yo‘q yoki xato kutubxona jimgina tashlanadi — o‘yin baribir ishlaydi.
     ======================================================================= */
  var MANBALAR = [
    ['./model-ogzaki.js',  'OGZAKI'],
    ['./model-maishiy.js', 'MAISHIY'],
    ['./model-cholgu.js',  'CHOLGULAR'],
    ['./model-oyin.js',    'OYIN_BUYUMLARI'],
    ['./model-hunar.js',   'HUNARLAR']
  ];
  var natijalar = await Promise.allSettled(MANBALAR.map(function (m) { return import(m[0]); }));
  var KUTUB = {};
  natijalar.forEach(function (n, i) {
    if (n.status !== 'fulfilled') return;
    var ro = n.value[MANBALAR[i][1]];
    if (!ro) return;
    Object.keys(ro).forEach(function (k) { if (!KUTUB[k]) KUTUB[k] = ro[k]; });
  });

  function bor(k) { return !!(KUTUB[k] && typeof KUTUB[k].yasa === 'function'); }
  function nomi(k) { return (KUTUB[k] && KUTUB[k].nom) || k; }

  /* =======================================================================
     5. SAVOLLAR — har bir javob alohida 3D modelga bog‘langan
     ======================================================================= */
  var SAVOLLAR = [
    { janr: 'Topishmoq',
      savol: 'Tashqarisi qip-qizil, ichi to‘la la’l-marvarid. Bu qaysi meva?',
      javob: 'anor',   chalgituvchi: ['olma', 'qovun', 'yongoq', 'tarvuz'],
      izoh: 'Anor — o‘zbek topishmoqlarining eng mashhur javoblaridan biri.' },

    { janr: 'Topishmoq',
      savol: 'Oppoq uyning na eshigi bor, na derazasi; ichida sarig‘i bor.',
      javob: 'tuxum',  chalgituvchi: ['yongoq', 'piyola', 'olma', 'anor'],
      izoh: 'Tuxum topishmog‘i bolani kuzatishga va o‘xshatishga o‘rgatadi.' },

    { janr: 'Topishmoq',
      savol: 'O‘zi kichkina, ko‘zi bitta, dumi uzun — kiyimni tikadi.',
      javob: 'igna',   chalgituvchi: ['qalam', 'pichoq', 'kalit', 'oroq'],
      izoh: 'Igna va ip — mehnat qurolining topishmoqdagi ko‘chma tasviri.' },

    { janr: 'Topishmoq',
      savol: 'Bir oyoqda tik turadi, boshida o‘ti bor, yonsa o‘zi kichrayadi.',
      javob: 'sham',   chalgituvchi: ['qalam', 'nay', 'xurmacha', 'choynak'],
      izoh: 'Sham topishmog‘i tabiat hodisasini she’riy jumboqqa aylantiradi.' },

    { janr: 'Topishmoq',
      savol: 'Temirdan tug‘ilgan, tishi bor, ammo chaynamaydi — uyning sirini ochadi.',
      javob: 'kalit',  chalgituvchi: ['pichoq', 'oroq', 'igna', 'ketmon'],
      izoh: 'Kalit va qulf topishmoqlari bolada mantiqiy fikrni o‘stiradi.' },

    { janr: 'Maqol',
      savol: '«Non — ne’matning boshi» maqolida qaysi ne’mat ulug‘lanadi?',
      javob: 'non',    chalgituvchi: ['olma', 'anor', 'tuxum', 'qovun'],
      izoh: 'Non hurmati — xalq pedagogikasidagi eng qadimiy odoblardan biri.' },

    { janr: 'Maqol',
      savol: '«Mehnatning tagi — rohat». Bog‘-rog‘ni obod qiladigan mehnat quroli qaysi?',
      javob: 'ketmon', chalgituvchi: ['oroq', 'pichoq', 'qilich', 'chavgon'],
      izoh: 'Ketmon — mehnat tarbiyasining ramzi bo‘lgan qadimiy qurol.' },

    { janr: 'Maqol',
      savol: '«Ilmsiz bir yashar, ilmli ming yashar». Bilim manbai qaysi?',
      javob: 'kitob',  chalgituvchi: ['daftar', 'qalam', 'oyna', 'suzani'],
      izoh: 'Kitob — maqollarda aql va bilim xazinasi deb ulug‘lanadi.' },

    { janr: 'Ertak',
      savol: '«Oltin tarvuz» ertagida kambag‘al chol ekkan urug‘dan qanday meva unadi?',
      javob: 'tarvuz', chalgituvchi: ['qovun', 'anor', 'olma', 'yongoq'],
      izoh: 'Ertak halollik mukofotlanishini oddiy meva timsolida tushuntiradi.' },

    { janr: 'Ertak',
      savol: 'Sehrli ertaklarda qahramonni osmonga ko‘taradigan buyum qaysi?',
      javob: 'gilam',  chalgituvchi: ['suzani', 'romol', 'dasturxon', 'doppi'],
      izoh: 'Uchar gilam — o‘zbek sehrli ertaklarining mashhur mo‘jizasi.' },

    { janr: 'Qo‘shiq',
      savol: 'Ona alla aytadigan joy qaysi?',
      javob: 'beshik', chalgituvchi: ['sandiq', 'dasturxon', 'suzani', 'xurmacha'],
      izoh: 'Alla — bolaga aytiladigan birinchi qo‘shiq, beshik esa uning maskani.' },

    { janr: 'Qo‘shiq',
      savol: 'To‘y va yalla qo‘shiqlariga jo‘r bo‘ladigan zarbli cholg‘u qaysi?',
      javob: 'doira',  chalgituvchi: ['dutor', 'nay', 'chang', 'rubob'],
      izoh: 'Doira zarbi qo‘shiq va raqsning umumiy maromini belgilaydi.' },

    { janr: 'Doston',
      savol: 'Baxshi doston aytganda qaysi cholg‘uda jo‘r bo‘ladi?',
      javob: 'dombra', chalgituvchi: ['rubob', 'chang', 'nay', 'doira'],
      izoh: 'Do‘mbira — dostonchilik san’atining ajralmas hamrohi.' }
  ];

  /* Kutubxonada yo‘q modellar bo‘lsa, savol jimgina tashlanadi. */
  var TAYYOR = SAVOLLAR.filter(function (s) {
    if (!bor(s.javob)) return false;
    s.chalgituvchi = s.chalgituvchi.filter(bor);
    return s.chalgituvchi.length >= 2;
  });
  if (!TAYYOR.length) {
    sahnaDiv.remove();
    tugmaQator.remove();
    var xp2 = document.createElement('p');
    xp2.className = 'o3j-xato';
    xp2.textContent = '3D modellar kutubxonasi yuklanmadi.';
    idish.appendChild(xp2);
    return;
  }

  /* =======================================================================
     6. SAHNA · YORUG‘LIK · HOVLI
     ======================================================================= */
  var sahna = new THREE.Scene();
  sahna.background = new THREE.Color(0xF3E6CE);
  sahna.fog = new THREE.Fog(0xF3E6CE, 14, 34);

  var kamera = new THREE.PerspectiveCamera(42, 16 / 10, 0.1, 120);

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  sahna.add(new THREE.HemisphereLight(0xFFF6E4, 0xC9A87A, 1.05));
  var quyosh = new THREE.DirectionalLight(0xFFF0D0, 1.5);
  quyosh.position.set(4.6, 9.5, 5.4);
  quyosh.castShadow = true;
  quyosh.shadow.mapSize.set(1024, 1024);
  quyosh.shadow.camera.left = -8;  quyosh.shadow.camera.right = 8;
  quyosh.shadow.camera.top = 8;    quyosh.shadow.camera.bottom = -6;
  quyosh.shadow.camera.near = 0.5; quyosh.shadow.camera.far = 26;
  quyosh.shadow.bias = -0.0009;
  sahna.add(quyosh);
  var yonNur = new THREE.DirectionalLight(0xC1502E, 0.26);
  yonNur.position.set(-5.2, 3.4, -3.8);
  sahna.add(yonNur);

  /* ---------- Yer — hovli supasi ---------- */
  var yer = new THREE.Mesh(
    new THREE.CircleGeometry(16, 48),
    new THREE.MeshStandardMaterial({ color: 0xC9A87A, roughness: 0.95 })
  );
  yer.rotation.x = -Math.PI / 2;
  yer.receiveShadow = true;
  sahna.add(yer);

  /* ---------- Gilam — o‘yin maydoni ---------- */
  var gilamGuruh = new THREE.Group();
  var gilamAsos = new THREE.Mesh(
    new THREE.BoxGeometry(9.4, 0.07, 4.6),
    new THREE.MeshStandardMaterial({ color: 0x8C3A2B, roughness: 0.97 })
  );
  gilamAsos.position.y = 0.035;
  gilamAsos.receiveShadow = true;
  gilamGuruh.add(gilamAsos);

  // Gilam hoshiyasi — ikki qator oltin chiziq
  [[9.0, 4.2], [8.5, 3.7]].forEach(function (o, i) {
    var ramkaMat = new THREE.MeshStandardMaterial({
      color: i ? 0xD4A24C : 0xEDE6D6, roughness: 0.6, metalness: 0.2
    });
    [[0, (o[1] / 2)], [0, -(o[1] / 2)]].forEach(function (p) {
      var ch = new THREE.Mesh(new THREE.BoxGeometry(o[0], 0.012, 0.07), ramkaMat);
      ch.position.set(p[0], 0.075 + i * 0.002, p[1]);
      gilamGuruh.add(ch);
    });
    [[(o[0] / 2), 0], [-(o[0] / 2), 0]].forEach(function (p) {
      var ch = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.012, o[1]), ramkaMat);
      ch.position.set(p[0], 0.075 + i * 0.002, p[1]);
      gilamGuruh.add(ch);
    });
  });

  // Gilam markazidagi bodom naqshlar qatori
  var naqshMat = new THREE.MeshStandardMaterial({ color: 0xD4A24C, roughness: 0.55, metalness: 0.25 });
  for (var nq = 0; nq < 9; nq++) {
    var bodom = new THREE.Mesh(new THREE.SphereGeometry(0.10, 10, 8), naqshMat);
    bodom.scale.set(0.7, 0.14, 1.5);
    bodom.position.set(-4.0 + nq * 1.0, 0.078, -1.55);
    gilamGuruh.add(bodom);
    var bodom2 = bodom.clone();
    bodom2.position.z = 1.55;
    gilamGuruh.add(bodom2);
  }
  sahna.add(gilamGuruh);

  /* ---------- Paxsa devor va darvoza ramkasi ---------- */
  var devorMat = new THREE.MeshStandardMaterial({ color: 0xD3B78C, roughness: 0.98 });
  var devor = new THREE.Mesh(new THREE.BoxGeometry(18, 1.9, 0.45), devorMat);
  devor.position.set(0, 0.95, -4.6);
  devor.castShadow = true; devor.receiveShadow = true;
  sahna.add(devor);
  // Devor tepasidagi g‘isht qatori
  for (var g = 0; g < 22; g++) {
    var gisht = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.16, 0.55),
      new THREE.MeshStandardMaterial({ color: 0xC9A87A, roughness: 0.95 }));
    gisht.position.set(-8.1 + g * 0.78, 1.98, -4.6);
    gisht.castShadow = true;
    sahna.add(gisht);
  }
  // Devordagi peshtoq (o‘yma yog‘och ramka)
  var peshtoq = new THREE.Mesh(
    new THREE.TorusGeometry(1.25, 0.11, 10, 28, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x6E5334, roughness: 0.8 })
  );
  peshtoq.position.set(0, 1.35, -4.32);
  peshtoq.castShadow = true;
  sahna.add(peshtoq);
  [-1.25, 1.25].forEach(function (x) {
    var ustun = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 1.36, 12),
      new THREE.MeshStandardMaterial({ color: 0x6E5334, roughness: 0.8 }));
    ustun.position.set(x, 0.68, -4.32);
    ustun.castShadow = true;
    sahna.add(ustun);
  });

  /* ---------- Hovli daraxtlari (kutubxonada bo‘lsa — oq terak) ---------- */
  if (bor('terak')) {
    [-5.6, 5.6].forEach(function (x, i) {
      try {
        var d = KUTUB['terak'].yasa();
        moslash(d, 3.4);
        d.position.set(x, 0, -3.4 + i * 0.5);
        d.rotation.y = i ? 0.7 : -0.5;
        sahna.add(d);
      } catch (e) {}
    });
  }

  /* =======================================================================
     7. USTUNLAR (kursilar) — buyum shu ustun ustida turadi
     ======================================================================= */
  var USTUN_BALAND = 0.86;

  function ustunYasa() {
    var g = new THREE.Group();
    var yogT = new THREE.MeshStandardMaterial({ color: 0x6E5334, roughness: 0.82 });
    var yogO = new THREE.MeshStandardMaterial({ color: 0xB08E64, roughness: 0.78 });

    // Yo‘nilgan (o‘yma) tana — LatheGeometry profili
    var nuqtalar = [
      new THREE.Vector2(0.00, 0.00), new THREE.Vector2(0.40, 0.00),
      new THREE.Vector2(0.42, 0.06), new THREE.Vector2(0.28, 0.13),
      new THREE.Vector2(0.20, 0.26), new THREE.Vector2(0.15, 0.42),
      new THREE.Vector2(0.21, 0.56), new THREE.Vector2(0.16, 0.66),
      new THREE.Vector2(0.19, 0.72), new THREE.Vector2(0.40, 0.78),
      new THREE.Vector2(0.42, 0.84), new THREE.Vector2(0.40, 0.86),
      new THREE.Vector2(0.00, 0.86)
    ];
    var tana = new THREE.Mesh(new THREE.LatheGeometry(nuqtalar, 26), yogT);
    tana.castShadow = true; tana.receiveShadow = true;
    g.add(tana);

    // Ustki taxta va uning oltin gardishi
    var taxta = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.42, 0.05, 26), yogO);
    taxta.position.y = 0.865;
    taxta.castShadow = true; taxta.receiveShadow = true;
    g.add(taxta);

    var gardish = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.022, 8, 32),
      new THREE.MeshStandardMaterial({ color: 0xD4A24C, roughness: 0.45, metalness: 0.45 }));
    gardish.rotation.x = -Math.PI / 2;
    gardish.position.y = 0.888;
    g.add(gardish);

    // Poydevordagi to‘rt oyoq mixchasi
    for (var i = 0; i < 4; i++) {
      var a = (i / 4) * Math.PI * 2 + 0.4;
      var mix = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6),
        new THREE.MeshStandardMaterial({ color: 0xD4A24C, roughness: 0.5, metalness: 0.4 }));
      mix.position.set(Math.cos(a) * 0.33, 0.045, Math.sin(a) * 0.33);
      g.add(mix);
    }
    return g;
  }

  /* Modelni me’yorlash: eng katta o‘lchami `olcham`, pastki nuqtasi y=0,
     markazi (0,·,0). Kutubxona modellari allaqachon me’yorlangan, ammo
     turli fayllar birga ishlatilgani uchun bu yerda yana bir bor
     tekshiramiz — shunda ustun ustida hammasi bir xil turadi. */
  function moslash(model, olcham) {
    var q = new THREE.Box3().setFromObject(model);
    var o = q.getSize(new THREE.Vector3());
    var eng = Math.max(o.x, o.y, o.z) || 1;
    model.scale.setScalar(olcham / eng);
    var q2 = new THREE.Box3().setFromObject(model);
    var m = q2.getCenter(new THREE.Vector3());
    model.position.x -= m.x;
    model.position.z -= m.z;
    model.position.y -= q2.min.y;
    return model;
  }

  /* Yassi buyum (daftar, gilam, so‘zana, oyna) tepadan qaralganda tanilmaydi —
     shuning uchun uni ko‘rgazma taxtasidek tomoshabinga qiyalatib qo‘yamiz. */
  function buyumTayyorla(kalit, olcham) {
    var xom = null;
    try { xom = KUTUB[kalit] ? KUTUB[kalit].yasa() : null; } catch (e) { xom = null; }
    if (!xom) return null;
    var q = new THREE.Box3().setFromObject(xom);
    var o = q.getSize(new THREE.Vector3());
    var g = new THREE.Group();
    g.add(xom);
    if (o.y < 0.42 * Math.max(o.x, o.z)) xom.rotation.x = -1.02;
    moslash(g, olcham);
    return g;
  }

  function soyaBer(model) {
    model.traverse(function (o) {
      if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; }
    });
  }

  /* ---------- To‘rtta uya (ustun + buyum) ---------- */
  var UYA_SONI = 4;
  var ORALIQ = 2.2;
  var uyalar = [];

  for (var u = 0; u < UYA_SONI; u++) {
    var uya = new THREE.Group();
    uya.position.set((u - (UYA_SONI - 1) / 2) * ORALIQ, 0.07, 0.35);
    var ustun = ustunYasa();
    uya.add(ustun);

    var buyumUya = new THREE.Group();          // model shu yerga qo‘yiladi
    buyumUya.position.y = USTUN_BALAND + 0.05;
    uya.add(buyumUya);

    // Yutuq halqasi — to‘g‘ri javobda yonadi
    var yutuqHalqa = new THREE.Mesh(
      new THREE.TorusGeometry(0.56, 0.035, 10, 40),
      new THREE.MeshStandardMaterial({
        color: 0xD4A24C, roughness: 0.35, metalness: 0.6,
        emissive: 0x6B4A12, emissiveIntensity: 0.9
      })
    );
    yutuqHalqa.rotation.x = -Math.PI / 2;
    yutuqHalqa.position.y = USTUN_BALAND + 0.02;
    yutuqHalqa.visible = false;
    uya.add(yutuqHalqa);

    sahna.add(uya);
    uyalar.push({
      guruh: uya, ustun: ustun, buyumUya: buyumUya, halqa: yutuqHalqa,
      model: null, kalit: null, bazaX: uya.position.x, aylanma: 0
    });
  }

  /* =======================================================================
     8. ANIMATSIYA YORDAMCHILARI (tven)
     ======================================================================= */
  var tvenlar = [];
  function tven(dav, qadam, tugash) {
    tvenlar.push({ t: 0, dav: Math.max(0.001, kamHarakat ? dav * 0.35 : dav),
                   qadam: qadam, tugash: tugash });
  }
  function kutish(dav, tugash) { tven(dav, function () {}, tugash); }
  function yumshoq(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function sakrash(x) {
    var c = 1.70158 + 1;
    return 1 + c * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2);
  }
  function tvenYangila(dt) {
    for (var i = 0; i < tvenlar.length; i++) {
      var v = tvenlar[i];
      v.t += dt;
      var p = Math.min(v.t / v.dav, 1);
      v.qadam(p);
      if (p >= 1) { if (v.tugash) v.tugash(); tvenlar.splice(i, 1); i--; }
    }
  }

  /* =======================================================================
     9. O‘YIN HOLATI
     ======================================================================= */
  var navbat = [], joriy = null, joriyJavobIdx = -1;
  var ball = 0, bajarildi = 0, JAMI = 0;
  var bloklangan = true, tugadi = false, boshlandi = false;
  var pardaDiv = null;

  function aralash(r) {
    var a = r.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function tabloYangila() {
    ballEl.textContent = ball;
    qoldiEl.textContent = Math.max(0, JAMI - bajarildi);
  }
  function xabar(m, tur) {
    xabarEl.textContent = m || '';
    xabarEl.className = 'o3j-xabar' + (tur ? ' ' + tur : '');
  }

  /* ---------- Uyani tozalash ---------- */
  function uyaniBoshat(uya) {
    if (!uya.model) return;
    uya.buyumUya.remove(uya.model);
    uya.model.traverse(function (o) {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { m.dispose(); });
      }
    });
    uya.model = null; uya.kalit = null;
    uya.halqa.visible = false;
  }

  function hammasiniBoshat() { uyalar.forEach(uyaniBoshat); }

  /* ---------- Savolni qo‘yish ---------- */
  function keyingi() {
    if (!navbat.length) { yakunla(); return; }
    joriy = navbat.shift();
    bloklangan = true;

    hammasiniBoshat();

    // Javob + chalg‘ituvchilardan to‘rtta buyum
    var chalg = aralash(joriy.chalgituvchi).slice(0, UYA_SONI - 1);
    var kalitlar = aralash([joriy.javob].concat(chalg));
    joriyJavobIdx = kalitlar.indexOf(joriy.javob);

    janrEl.textContent = joriy.janr;
    savolEl.textContent = joriy.savol;
    xabar('Javobni bosib tanlang');

    kalitlar.forEach(function (k, i) {
      var uya = uyalar[i];
      var model = buyumTayyorla(k, 1.38);
      if (!model) return;
      soyaBer(model);
      uya.model = model;
      uya.kalit = k;
      uya.buyumUya.add(model);
      uya.buyumUya.position.y = USTUN_BALAND + 0.05;
      uya.buyumUya.scale.setScalar(1);
      uya.buyumUya.rotation.y = 0;
      uya.aylanma = Math.random() * Math.PI * 2;

      // Buyum ustun ustida qalqib paydo bo‘ladi: pastdan ko‘tarilib,
      // ayni paytda kichikdan to‘liq o‘lchamgacha kattalashadi.
      var bazaY = uya.buyumUya.position.y;
      var kech = i * 0.09;                 // uyalar navbat bilan ochiladi
      var dav  = 0.55 + kech;
      uya.buyumUya.position.y = bazaY - 0.7;
      uya.buyumUya.scale.setScalar(0.01);
      (function (U, y0, kechikish, davomiylik) {
        tven(davomiylik, function (p) {
          var o = Math.max(0, (p * davomiylik - kechikish) / 0.55);
          if (o <= 0) return;
          var e = sakrash(Math.min(1, o));
          U.buyumUya.position.y = y0 - 0.7 + 0.7 * Math.min(1, o < 1 ? e : 1);
          U.buyumUya.scale.setScalar(Math.max(0.01, Math.min(1, e)));
        }, function () {
          U.buyumUya.position.y = y0;
          U.buyumUya.scale.setScalar(1);
        });
      })(uya, bazaY, kech, dav);
    });

    // Ko‘tarilish tugagach bosishga ruxsat
    kutish(0.75, function () { bloklangan = false; });
  }

  /* ---------- Bosildi ---------- */
  var nur = new THREE.Raycaster();
  var nuqta = new THREE.Vector2();

  function bosildi(e) {
    if (!boshlandi || tugadi || bloklangan || !joriy) return;
    var r = canvas.getBoundingClientRect();
    nuqta.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    nuqta.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    nur.setFromCamera(nuqta, kamera);

    var nishonlar = uyalar.map(function (u) { return u.guruh; });
    var kes = nur.intersectObjects(nishonlar, true);
    if (!kes.length) return;
    var o = kes[0].object;
    while (o.parent && nishonlar.indexOf(o) === -1) o = o.parent;
    var idx = nishonlar.indexOf(o);
    if (idx === -1) return;
    javobBerildi(idx);
  }
  canvas.addEventListener('pointerdown', bosildi);

  function javobBerildi(i) {
    bloklangan = true;
    bajarildi++;
    var togri = (i === joriyJavobIdx);
    var rostUya = uyalar[joriyJavobIdx];

    if (togri) {
      ball++;
      tabloYangila();
      xabar('Barakalla! To‘g‘ri javob — ' + nomi(joriy.javob) + '.', 'togri');
      rostUya.halqa.visible = true;
      kotar(rostUya, 0.55, 0.45);
      aylantir(rostUya, Math.PI * 2, 0.7);
    } else {
      tabloYangila();
      xabar('Xato. To‘g‘ri javob — ' + nomi(joriy.javob) + '. ' + (joriy.izoh || ''), 'xato');
      chayqat(uyalar[i]);
      kutish(0.4, function () {
        rostUya.halqa.visible = true;
        kotar(rostUya, 0.55, 0.45);
        aylantir(rostUya, Math.PI * 2, 0.7);
      });
    }

    kutish(togri ? 1.6 : 2.5, function () {
      // Buyumlar kichrayib so‘nadi — keyingi savolga joy bo‘shaydi
      uyalar.forEach(function (uya) {
        if (!uya.model) return;
        var y0 = uya.buyumUya.position.y;
        var k0 = uya.buyumUya.scale.x;
        tven(0.34, function (p) {
          var e = yumshoq(p);
          uya.buyumUya.position.y = y0 + (y0 - 0.35 - y0) * e;
          uya.buyumUya.scale.setScalar(Math.max(0.01, k0 * (1 - e)));
        }, null);
      });
      kutish(0.45, keyingi);
    });
  }

  function kotar(uya, balandlik, dav) {
    var y0 = uya.buyumUya.position.y;
    var y1 = USTUN_BALAND + 0.05 + balandlik;
    tven(dav, function (p) {
      uya.buyumUya.position.y = y0 + (y1 - y0) * yumshoq(p);
    }, null);
  }
  function aylantir(uya, burchak, dav) {
    var b0 = uya.buyumUya.rotation.y;
    tven(dav, function (p) { uya.buyumUya.rotation.y = b0 + burchak * yumshoq(p); }, null);
  }
  function chayqat(uya) {
    var x0 = uya.guruh.position.x;
    tven(0.45, function (p) {
      uya.guruh.position.x = x0 + Math.sin(p * Math.PI * 5) * 0.16 * (1 - p);
    }, function () { uya.guruh.position.x = x0; });
  }

  /* =======================================================================
     10. BOSHLASH · YAKUN · QAYTA BOSHLASH
     ======================================================================= */
  function pardaKorsat(sarlavha, matn, foiz, tugmaMatn, ish) {
    pardaYop();
    pardaDiv = document.createElement('div');
    pardaDiv.className = 'o3j-parda';
    pardaDiv.innerHTML =
      '<h4>' + sarlavha + '</h4>' +
      (foiz === null ? '' : '<div class="o3j-foiz">' + foiz + '%</div>') +
      '<p>' + matn + '</p>' +
      '<button type="button" class="o3j-ich">' + tugmaMatn + '</button>';
    sahnaDiv.appendChild(pardaDiv);
    pardaDiv.querySelector('.o3j-ich').addEventListener('click', ish);
  }
  function pardaYop() { if (pardaDiv) { pardaDiv.remove(); pardaDiv = null; } }

  function boshla() {
    pardaYop();
    tvenlar.length = 0;
    hammasiniBoshat();
    uyalar.forEach(function (u) { u.guruh.position.x = u.bazaX; });
    navbat = aralash(TAYYOR);
    JAMI = navbat.length;
    ball = 0; bajarildi = 0;
    tugadi = false; boshlandi = true; bloklangan = true;
    boshlaTg.textContent = '▶ Boshidan';
    tabloYangila();
    keyingi();
  }

  function yakunla() {
    tugadi = true; joriy = null; boshlandi = false;
    var foiz = JAMI ? Math.round(ball / JAMI * 100) : 0;
    janrEl.textContent = 'Yakun';
    savolEl.textContent = '';
    xabar('');
    var baho = foiz >= 80
      ? 'Barakalla! Xalq og‘zaki ijodi janrlarini yaxshi ajratasiz.'
      : foiz >= 50
        ? 'Yaxshi urinish. Topishmoq va maqollarni yana bir ko‘zdan kechiring.'
        : 'Hozircha qiyin bo‘ldi. 5-modul matnini o‘qib, yana urinib ko‘ring.';
    pardaKorsat('Natija',
      JAMI + ' ta savoldan ' + ball + ' tasiga to‘g‘ri javob berdingiz. ' + baho,
      foiz, '↻ Qaytadan o‘ynash', boshla);

    try {
      if (window.Xotira && window.Xotira.modulYoz) {
        window.Xotira.modulYoz(MODUL, { oyin3d: foiz });
      }
    } catch (e) {}
  }

  boshlaTg.addEventListener('click', boshla);
  qaytaTg.addEventListener('click', boshla);

  /* Boshlanishidan oldingi taklif pardasi */
  pardaKorsat('Og‘zaki ijod xazinasi',
    'Har savolda ustunlar ustiga to‘rtta haqiqiy buyum ko‘tariladi. ' +
    'Topishmoq, maqol, ertak, qo‘shiq va doston bo‘yicha to‘g‘ri buyumni bosing.',
    null, '▶ O‘yinni boshlash', boshla);

  /* =======================================================================
     11. O‘LCHAM · KO‘RINISH · RENDER HALQASI
     ======================================================================= */
  function olchamla() {
    var w = Math.round(idish.clientWidth || sahnaDiv.clientWidth || 640);
    if (w < 220) w = 220;
    var h = Math.min(520, Math.round(w * 0.62));
    if (h < 320) h = 320;
    renderer.setSize(w, h, false);
    kamera.aspect = w / h;
    kamera.updateProjectionMatrix();

    var tor = w < 560;
    sahnaDiv.classList.toggle('o3j-tor', tor);

    // Tor ekranda ustunlar qatorini siqamiz
    var siqish = tor ? 0.78 : 1;
    uyalar.forEach(function (uya, i) {
      uya.bazaX = (i - (UYA_SONI - 1) / 2) * ORALIQ * siqish;
      uya.guruh.position.x = uya.bazaX;
      uya.guruh.scale.setScalar(siqish < 1 ? 0.92 : 1);
    });

    // Butun qator doim kadrga sig‘sin
    var yarimKenglik = (UYA_SONI - 1) / 2 * ORALIQ * siqish + 0.95;
    var yarimV = (kamera.fov / 2) * Math.PI / 180;
    var yarimH = Math.atan(Math.tan(yarimV) * kamera.aspect);
    var masofa = yarimKenglik / Math.tan(yarimH) * 1.04;
    kamera.position.set(0, 2.20, Math.max(4.6, masofa + 0.35));
    kamera.lookAt(0, 1.52, 0);
    render();
  }

  var oxirgiVaqt = 0, ramka = 0, yuribdi = false, korinmoqda = false;

  function yangila(dt) {
    tvenYangila(dt);
    // Buyumlar sekin aylanib turadi — har tomonini ko‘rish uchun
    if (!kamHarakat) {
      uyalar.forEach(function (uya) {
        if (!uya.model || bloklangan) return;
        uya.aylanma += dt * 0.55;
        uya.buyumUya.rotation.y = uya.aylanma;
      });
    }
  }
  function render() { renderer.render(sahna, kamera); }
  function halqa() {
    ramka = requestAnimationFrame(halqa);
    var hozir = performance.now() / 1000;
    var dt = Math.min(hozir - oxirgiVaqt, 0.05);
    oxirgiVaqt = hozir;
    yangila(dt);
    render();
  }
  function halqaBoshla() {
    if (yuribdi) return;
    yuribdi = true;
    oxirgiVaqt = performance.now() / 1000;
    ramka = requestAnimationFrame(halqa);
  }
  function halqaToxtat() {
    if (!yuribdi) return;
    yuribdi = false;
    cancelAnimationFrame(ramka);
  }
  function holatniQara() {
    if (korinmoqda && !document.hidden) halqaBoshla(); else halqaToxtat();
  }

  var kuzatOlcham = null, kuzatKorinish = null;
  if (window.ResizeObserver) {
    kuzatOlcham = new ResizeObserver(olchamla);
    kuzatOlcham.observe(idish);
  } else {
    window.addEventListener('resize', olchamla);
  }
  if (window.IntersectionObserver) {
    kuzatKorinish = new IntersectionObserver(function (y) {
      korinmoqda = y[0].isIntersecting;
      holatniQara();
    }, { threshold: 0.05 });
    kuzatKorinish.observe(sahnaDiv);
  } else {
    korinmoqda = true;
  }
  document.addEventListener('visibilitychange', holatniQara);

  /* =======================================================================
     12. TOZALASH
     ======================================================================= */
  var tozalandi = false;
  function tozala() {
    if (tozalandi) return;
    tozalandi = true;
    halqaToxtat();
    tvenlar.length = 0;
    if (kuzatOlcham) kuzatOlcham.disconnect(); else window.removeEventListener('resize', olchamla);
    if (kuzatKorinish) kuzatKorinish.disconnect();
    document.removeEventListener('visibilitychange', holatniQara);
    canvas.removeEventListener('pointerdown', bosildi);
    sahna.traverse(function (o) {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) {
          for (var k in m) { var v = m[k]; if (v && v.isTexture) v.dispose(); }
          m.dispose();
        });
      }
    });
    sahna.clear();
    renderer.dispose();
  }
  window.addEventListener('pagehide', tozala);

  /* =======================================================================
     13. ISHGA TUSHIRISH
     ======================================================================= */
  olchamla();
  tabloYangila();
  holatniQara();
  render();
})();
