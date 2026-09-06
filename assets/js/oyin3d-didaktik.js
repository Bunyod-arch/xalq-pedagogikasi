/* =========================================================
   «XALQ DONISHMANDLIGI CHARXI» — HAQIQIY 3D O‘YIN (Three.js)
   2-modul: «Xalq pedagogikasining didaktik imkoniyatlarini
   o‘quv-tarbiyaviy jarayonga tadbiq etish».

   Ma’ruzada xalq didaktikasining tamoyillari maqol, topishmoq,
   xalq taqvimi, tabiat belgilari va amaliy san’at usullari
   misolida yoritilgan. O‘yinda har bir savolga javob —
   aniq 3D model (`model-didaktik.js`).

   Qoida: tepada maqol yoki topishmoq beriladi, o‘yma
   kursichalar ustida to‘rtta buyum aylanib turadi.
   O‘yinchi to‘g‘ri buyumni bosadi.

   Three.js faqat `assets/vendor/` dan yuklanadi.
   ========================================================= */
import * as THREE from '../vendor/three.module.min.js';

(function () {
  'use strict';

  var idish = document.getElementById('oyin3d-didaktik');
  if (!idish) return;

  function webglBor() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }

  var kamHarakat = !!(window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* =========================================================
     1. USLUBLAR — faqat shu o‘yinga tegishli (`o3dd-`)
     ========================================================= */
  if (!document.getElementById('o3dd-uslub')) {
    var uslub = document.createElement('style');
    uslub.id = 'o3dd-uslub';
    uslub.textContent = [
      '.o3dd-afisha{position:relative;border-radius:18px;padding:26px 22px;text-align:center;',
      '  background:linear-gradient(150deg,#1F5140 0%,#2F6B45 52%,#7A5A1E 100%);color:#FBF7F0;',
      '  box-shadow:0 2px 4px rgba(26,22,20,.08),0 12px 28px rgba(26,22,20,.16);}',
      '.o3dd-afisha h4{margin:0 0 8px;font-size:1.18rem;}',
      '.o3dd-afisha p{margin:0 auto 16px;max-width:52ch;font-size:.92rem;line-height:1.55;',
      '  color:#E9F2E6;}',
      '.o3dd-turlar{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:0 0 18px;',
      '  padding:0;list-style:none;}',
      '.o3dd-turlar li{padding:6px 14px;border-radius:999px;font-size:.8rem;font-weight:600;',
      '  background:rgba(251,247,240,.14);border:1px solid rgba(251,247,240,.28);}',
      '.o3dd-boshla{cursor:pointer;border:0;border-radius:999px;padding:13px 30px;',
      '  background:#D4A24C;color:#2A1B08;font:inherit;font-size:1rem;font-weight:800;',
      '  box-shadow:0 6px 18px rgba(0,0,0,.28);transition:transform .15s ease,box-shadow .15s ease;}',
      '.o3dd-boshla:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(0,0,0,.34);}',
      '.o3dd-boshla:active{transform:translateY(1px);}',
      '.o3dd-yuk{margin-top:12px;font-size:.85rem;color:#DDEBD8;}',

      '.o3dd-sahna{position:relative;width:100%;border-radius:18px;overflow:hidden;',
      '  background:#E7EFDC;box-shadow:0 2px 4px rgba(26,22,20,.08),0 12px 28px rgba(26,22,20,.14);}',
      '.o3dd-sahna canvas{display:block;width:100%;height:auto;touch-action:none;cursor:pointer;}',
      '.o3dd-ust{position:absolute;inset:0;pointer-events:none;font:inherit;}',
      '.o3dd-qator{position:absolute;top:11px;left:11px;right:11px;display:flex;',
      '  align-items:flex-start;justify-content:space-between;gap:8px;}',
      '.o3dd-tabl{flex:0 0 auto;display:inline-flex;gap:6px;align-items:baseline;',
      '  padding:7px 14px;border-radius:999px;background:rgba(251,247,240,.93);color:#1F5140;',
      '  font-size:.84rem;font-weight:600;white-space:nowrap;',
      '  box-shadow:0 2px 8px rgba(26,22,20,.18);}',
      '.o3dd-tabl b{font-size:1.02rem;color:#C1502E;}',
      '.o3dd-savol{position:absolute;top:52px;left:11px;right:11px;',
      '  padding:10px 18px;border-radius:16px;background:rgba(27,45,36,.9);color:#FBF7F0;',
      '  font-size:.95rem;font-weight:600;line-height:1.4;text-align:center;',
      '  box-shadow:0 4px 14px rgba(26,22,20,.28);}',
      '.o3dd-savol em{display:block;font-style:italic;color:#F0D9A2;font-weight:700;',
      '  margin-top:3px;}',
      '.o3dd-past{position:absolute;left:12px;right:12px;bottom:12px;text-align:center;}',
      '.o3dd-xabar{display:inline-block;margin:0;max-width:100%;padding:7px 16px;',
      '  border-radius:999px;background:rgba(26,22,20,.66);color:#FBF7F0;',
      '  font-size:.85rem;font-weight:600;line-height:1.4;}',
      '.o3dd-xabar:empty{display:none;}',
      '.o3dd-xabar.togri{background:rgba(31,84,52,.9);color:#DFF6E4;}',
      '.o3dd-xabar.xato{background:rgba(150,52,26,.9);color:#FFE2D6;}',
      '.o3dd-natija{position:absolute;inset:0;display:flex;flex-direction:column;',
      '  align-items:center;justify-content:center;gap:10px;text-align:center;padding:20px;',
      '  background:rgba(31,81,64,.93);color:#FBF7F0;}',
      '.o3dd-natija h4{margin:0;font-size:1.22rem;}',
      '.o3dd-foiz{font-size:2.5rem;font-weight:800;color:#D4A24C;line-height:1;}',
      '.o3dd-natija p{margin:0;font-size:.92rem;max-width:36ch;line-height:1.5;}',
      '.o3dd-qayta{pointer-events:auto;cursor:pointer;margin-top:6px;padding:11px 24px;',
      '  border:0;border-radius:999px;background:#D4A24C;color:#2A1B08;',
      '  font:inherit;font-size:.95rem;font-weight:700;',
      '  box-shadow:0 4px 12px rgba(26,22,20,.3);transition:transform .15s ease;}',
      '.o3dd-qayta:hover{transform:translateY(-2px);}',
      '.o3dd-qayta:active{transform:translateY(1px);}',

      '.o3dd-tor .o3dd-qator{top:7px;left:7px;right:7px;gap:5px;}',
      '.o3dd-tor .o3dd-tabl{padding:4px 9px;font-size:.7rem;gap:4px;}',
      '.o3dd-tor .o3dd-tabl b{font-size:.82rem;}',
      '.o3dd-tor .o3dd-savol{top:40px;left:7px;right:7px;padding:7px 11px;font-size:.78rem;}',
      '.o3dd-tor .o3dd-past{left:7px;right:7px;bottom:8px;}',
      '.o3dd-tor .o3dd-xabar{padding:5px 11px;font-size:.72rem;}',
      '.o3dd-tor .o3dd-foiz{font-size:1.9rem;}',
      '.o3dd-tor .o3dd-natija h4{font-size:1.02rem;}',
      '.o3dd-tor .o3dd-natija p{font-size:.79rem;}',
      '@media (prefers-reduced-motion: reduce){',
      '  .o3dd-boshla,.o3dd-qayta{transition:none;}}'
    ].join('\n');
    document.head.appendChild(uslub);
  }

  /* =========================================================
     2. AFISHA — ko‘rinadigan tugma
     ========================================================= */
  var afisha = document.createElement('div');
  afisha.className = 'o3dd-afisha';
  afisha.innerHTML =
    '<h4>«Xalq donishmandligi charxi» — 3D o‘yin</h4>' +
    '<p>Ma’ruzada xalq didaktikasining tamoyillari maqol, topishmoq, xalq taqvimi ' +
      'va amaliy san’at usullari misolida keltirilgan. Tepada savol beriladi, ' +
      'kursichalar ustida to‘rtta 3D buyum aylanib turadi — to‘g‘risini bosing.</p>' +
    '<ul class="o3dd-turlar">' +
      '<li>Topishmoq va maqol</li>' +
      '<li>Xalq taqvimi</li>' +
      '<li>Tabiat belgilari</li>' +
      '<li>Amaliy san’at</li>' +
    '</ul>' +
    '<button type="button" class="o3dd-boshla">▶ 3D o‘yinni boshlash</button>' +
    '<p class="o3dd-yuk" hidden>Sahna tayyorlanmoqda…</p>';
  idish.appendChild(afisha);

  var boshlaTug = afisha.querySelector('.o3dd-boshla');
  var yukEl = afisha.querySelector('.o3dd-yuk');

  if (!webglBor()) {
    boshlaTug.disabled = true;
    boshlaTug.textContent = '3D mavjud emas';
    yukEl.hidden = false;
    yukEl.textContent = 'Brauzeringiz 3D grafikani qo‘llab-quvvatlamaydi. ' +
      'Quyidagi oddiy o‘yinda ishtirok etishingiz mumkin.';
    return;
  }

  var ochilgan = false;
  boshlaTug.addEventListener('click', function () {
    if (ochilgan) return;
    ochilgan = true;
    boshlaTug.disabled = true;
    yukEl.hidden = false;
    import('./model-didaktik.js')
      .then(function (kutubxona) {
        afisha.remove();
        oyinQur(kutubxona.DIDAKTIK);
      })
      .catch(function (x) {
        ochilgan = false;
        boshlaTug.disabled = false;
        yukEl.textContent = 'Modellarni yuklab bo‘lmadi. Sahifani yangilab ko‘ring.';
        if (window.console) console.error(x);
      });
  });

  /* =========================================================
     3. SAVOLLAR — ma’ruza matnidan olingan
        j — to‘g‘ri javob kaliti, c — chalg‘ituvchilar
     ========================================================= */
  var SAVOLLAR = [
    { s: 'Topishmoq — javobini toping:', m: '«Pak-pakana bo‘yi bor, yetti qavat to‘ni bor»',
      j: 'piyoz', c: ['urchuq', 'qatiqKoza', 'dorivorGiyoh'],
      i: 'Topishmoqlar orqali bolalarning mushohadasi va tafakkuri o‘stirilgan.' },
    { s: 'Topishmoq — javobini toping:', m: '«Aylanaverib-aylanaverib semirdi xonim»',
      j: 'urchuq', c: ['tarozi', 'quyoshSoati', 'kulolCharxi'],
      i: 'Urchuq — ip yigirish quroli; topishmoq mehnat bilan bilimni bog‘laydi.' },
    { s: 'Xalq taqvimi: bahorning kelishidan qaysi qush darak beradi?', m: '',
      j: 'laylak', c: ['qarga', 'kabutar', 'qaldirgoch'],
      i: 'Laylakning kelishi bahordan darak beradi — shunga mos yumushlar boshlangan.' },
    { s: 'Qor va sovuqdan qaysi qushning ovozi darak beradi?', m: '',
      j: 'qarga', c: ['laylak', 'qaldirgoch', 'kabutar'],
      i: 'Qarg‘aning qag‘illashi qor va sovuqdan darak beradi deb tushunilgan.' },
    { s: 'Qaldirg‘och bilan birga yozdan darak beradigan qush qaysi?', m: '',
      j: 'kabutar', c: ['laylak', 'qarga', 'qaldirgoch'],
      i: 'Qaldirg‘och va yovvoyi kabutar — yozning kelishi belgisi.' },
    { s: 'Yozning kelishini bildiruvchi, ayri dumli qush qaysi?', m: '',
      j: 'qaldirgoch', c: ['laylak', 'qarga', 'kabutar'],
      i: 'Tabiat belgilari orqali dehqonchilik ishlari rejalashtirilgan.' },
    { s: 'Ta’limning ko‘rsatmaliligi qaysi maqolda ifodalangan?',
      m: '«O‘n marta eshitgandan bir bor ko‘rgan yaxshi»',
      j: 'korgazmaLavha', c: ['oyilganTosh', 'qayiq', 'alifbeLavha'],
      i: 'Ko‘rsatmalilik — xalq didaktikasining asosiy tamoyillaridan biri.' },
    { s: 'Bilimning mustahkamligi nimaga o‘xshatilgan?',
      m: '«Yoshlikda o‘rgangan ilm toshga o‘yilgan naqsh kabidir»',
      j: 'oyilganTosh', c: ['korgazmaLavha', 'ganchPanjara', 'tarozi'],
      i: 'Yoshlikda olingan bilim umrbod saqlanadi — mustahkamlik tamoyili.' },
    { s: 'Xalq didaktikasida o‘qish nimaga o‘xshatilgan?',
      m: 'Oqimga qarshi suzish — to‘xtagan orqaga ketadi',
      j: 'qayiq', c: ['suvTegirmoni', 'quyoshSoati', 'omoch'],
      i: 'Ta’lim uzluksiz bo‘lishi kerak — to‘xtash bilimni orqaga suradi.' },
    { s: 'Amalda qo‘llanmaydigan bilim nimaga o‘xshatiladi?', m: 'Yomg‘irsiz…',
      j: 'bulut', c: ['qayiq', 'dorivorGiyoh', 'kozaChiroq'],
      i: 'Ilmning qiymati uning amalda qo‘llanilishi bilan o‘lchanadi.' },
    { s: 'Bilimini boshqalarga o‘rgatmagan kishi nimaga o‘xshatiladi?',
      m: 'Ko‘zaga solib qo‘yilgan yorug‘likka',
      j: 'kozaChiroq', c: ['bulut', 'qatiqKoza', 'tarozi'],
      i: 'Bilimni ulashmaslik qoralanadi — ilm tarqалgandagina foyda beradi.' },
    { s: 'Xalq taqvimi: «Hamal — ekinlarga kirar amal». Dehqon qaysi qurol bilan ish boshlaydi?',
      m: '', j: 'omoch', c: ['oroq', 'tarozi', 'urchuq'],
      i: 'Oy nomlari qishloq xo‘jaligi ishlari bilan bog‘lab o‘rgatilgan.' },
    { s: 'Xalq taqvimi: «Asad — ekiningni yasat». Hosil qaysi qurol bilan yig‘ilgan?',
      m: '', j: 'oroq', c: ['omoch', 'kulolCharxi', 'tarozi'],
      i: 'Yil fasllari va mehnat turlari maqollarda birga o‘rgatilgan.' },
    { s: 'Kimyoga oid bilimlar qaysi ish misolida o‘rgatilgan?',
      m: 'Sutdan qatiq va yog‘ olish',
      j: 'qatiqKoza', c: ['dorivorGiyoh', 'piyoz', 'kozaChiroq'],
      i: 'Chorva mahsulotlarini qayta ishlash — kimyoviy bilimlarning manbai.' },
    { s: 'Astronomiyaga oid bilim — vaqtni quyoshga qarab aniqlash nima bilan o‘rgatilgan?',
      m: '', j: 'quyoshSoati', c: ['tarozi', 'suvTegirmoni', 'korgazmaLavha'],
      i: 'Yulduz va quyosh harakatiga qarab vaqt va fasl aniqlangan.' },
    { s: 'Tibbiyotga oid bilimlar nima bilan bog‘lab tushuntirilgan?', m: '',
      j: 'dorivorGiyoh', c: ['piyoz', 'qatiqKoza', 'bulut'],
      i: 'Dorivor o‘simliklarni to‘plash va davolash usullari o‘rgatilgan.' },
    { s: 'Matematikaga oid bilim — o‘lchash qaysi buyum bilan o‘rgatilgan?', m: '',
      j: 'tarozi', c: ['urchuq', 'quyoshSoati', 'omoch'],
      i: 'Masofa, hosil va uy o‘lchamini o‘lchash — amaliy matematika.' },
    { s: 'Fizikaga oid bilim — suv va shamol kuchidan foydalanish qayerda ko‘rinadi?',
      m: '', j: 'suvTegirmoni', c: ['kulolCharxi', 'omoch', 'qayiq'],
      i: 'Oddiy richag, suv va shamol kuchi amaliyot misolida tushuntirilgan.' },
    { s: 'Amaliy san’at: kulolchilik usullari qaysi asbob bilan o‘rgatilgan?', m: '',
      j: 'kulolCharxi', c: ['suvTegirmoni', 'urchuq', 'tarozi'],
      i: 'Kulolchilik usullari — xalq pedagogikasining didaktik imkoniyatlaridan.' },
    { s: 'Ganch o‘ymakorligi namunasi qaysi?', m: '',
      j: 'ganchPanjara', c: ['oymakorEshik', 'oyilganTosh', 'korgazmaLavha'],
      i: 'Ganch o‘ymakorligi ustalar tajribasi orqali avloddan avlodga o‘tgan.' },
    { s: 'Yog‘och o‘ymakorligi namunasi qaysi?', m: '',
      j: 'oymakorEshik', c: ['ganchPanjara', 'korgazmaLavha', 'qayiq'],
      i: 'Yog‘och o‘ymakorligi mehnat ta’limi darslarida qo‘llanishi mumkin.' },
    { s: 'Zardo‘zlik san’ati namunasi qaysi?', m: '',
      j: 'zardoziChopon', c: ['ganchPanjara', 'oymakorEshik', 'kulolCharxi'],
      i: 'Zardo‘zlik — chevarlar tajribasida shakllangan o‘ziga xos uslub.' },
    { s: 'Ona tilini o‘rgatuvchi buyum qaysi?',
      m: '«Tilni bilish — dilni bilishga yo‘l ochadi»',
      j: 'alifbeLavha', c: ['korgazmaLavha', 'oyilganTosh', 'ganchPanjara'],
      i: 'Ona tili — xalqning bebaho boyligi; ta’lim ona tilida bo‘lishi kerak.' },
  ];

  var RAUND = 10;      // bir o‘yindagi savollar soni

  /* =========================================================
     4. O‘YINNI QURISH
     ========================================================= */
  function oyinQur(MODELLAR) {

    /* Kutubxonada bo‘lmagan kalitli savollarni chetlab o‘tamiz */
    var savollar = SAVOLLAR.filter(function (S) {
      if (!MODELLAR[S.j]) return false;
      S.c = S.c.filter(function (k) { return !!MODELLAR[k]; });
      return S.c.length >= 2;
    });
    if (!savollar.length) {
      idish.innerHTML = '<p class="o3dd-yuk">Model kutubxonasi topilmadi.</p>';
      return;
    }

    /* ---------- 4.1. Karkas ---------- */
    var sahnaDiv = document.createElement('div');
    sahnaDiv.className = 'o3dd-sahna';
    sahnaDiv.innerHTML =
      '<canvas></canvas>' +
      '<div class="o3dd-ust">' +
        '<div class="o3dd-qator">' +
          '<span class="o3dd-tabl">To‘g‘ri <b class="o3dd-ball">0</b></span>' +
          '<span class="o3dd-tabl">Savol <b class="o3dd-raund">1</b>/' + RAUND + '</span>' +
        '</div>' +
        '<p class="o3dd-savol">Tayyorlanmoqda…</p>' +
        '<div class="o3dd-past">' +
          '<p class="o3dd-xabar" role="status">To‘g‘ri buyumni bosing</p>' +
        '</div>' +
      '</div>';
    idish.appendChild(sahnaDiv);

    var canvas   = sahnaDiv.querySelector('canvas');
    var ballEl   = sahnaDiv.querySelector('.o3dd-ball');
    var raundEl  = sahnaDiv.querySelector('.o3dd-raund');
    var savolEl  = sahnaDiv.querySelector('.o3dd-savol');
    var xabarEl  = sahnaDiv.querySelector('.o3dd-xabar');
    var ustQatlam = sahnaDiv.querySelector('.o3dd-ust');

    /* ---------- 4.2. Renderer, sahna, kamera ---------- */
    var telefon = (window.innerWidth || 800) < 620;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !telefon });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, telefon ? 1.5 : 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    var sahna = new THREE.Scene();
    sahna.background = new THREE.Color(0xE7EFDC);
    sahna.fog = new THREE.Fog(0xE7EFDC, 16, 40);

    var kamera = new THREE.PerspectiveCamera(40, 16 / 10, 0.1, 120);

    sahna.add(new THREE.HemisphereLight(0xFFFBEC, 0x9DAE86, 1.05));
    var quyosh = new THREE.DirectionalLight(0xFFF3D6, 1.5);
    quyosh.position.set(4.5, 10, 7);
    quyosh.castShadow = true;
    quyosh.shadow.mapSize.set(telefon ? 1024 : 2048, telefon ? 1024 : 2048);
    quyosh.shadow.camera.left = -9;  quyosh.shadow.camera.right = 9;
    quyosh.shadow.camera.top = 9;    quyosh.shadow.camera.bottom = -9;
    quyosh.shadow.bias = -0.0009;
    sahna.add(quyosh);
    var toldiruvchi = new THREE.DirectionalLight(0x86A7C8, 0.32);
    toldiruvchi.position.set(-6, 3.5, -4);
    sahna.add(toldiruvchi);

    /* ---------- 4.3. Hovli yeri ---------- */
    var yer = new THREE.Mesh(
      new THREE.CylinderGeometry(15, 15, 0.5, 44),
      new THREE.MeshStandardMaterial({ color: 0xC8CBA4, roughness: 0.97 })
    );
    yer.position.y = -0.25;
    yer.receiveShadow = true;
    sahna.add(yer);

    var supa = new THREE.Mesh(
      new THREE.CylinderGeometry(5.2, 5.5, 0.28, 40),
      new THREE.MeshStandardMaterial({ color: 0xB59A6E, roughness: 0.92 })
    );
    supa.position.set(0, -0.14, 0.4);
    supa.receiveShadow = true;
    sahna.add(supa);

    var supaHalqa = new THREE.Mesh(
      new THREE.TorusGeometry(5.0, 0.07, 8, 52),
      new THREE.MeshStandardMaterial({ color: 0x8A6A44, roughness: 0.8 })
    );
    supaHalqa.rotation.x = -Math.PI / 2;
    supaHalqa.position.set(0, 0.01, 0.4);
    sahna.add(supaHalqa);

    /* ---------- 4.4. Orqadagi charxpalak — mavzu ramzi ---------- */
    var charx = new THREE.Group();
    var yogochMat = new THREE.MeshStandardMaterial({ color: 0x7A5A32, roughness: 0.86 });
    var yogochOchMat = new THREE.MeshStandardMaterial({ color: 0xA6874F, roughness: 0.82 });
    var oltinMat = new THREE.MeshStandardMaterial({ color: 0xD4A24C, roughness: 0.38, metalness: 0.55 });

    var gardish = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.16, 12, 40), yogochMat);
    gardish.castShadow = true;
    charx.add(gardish);
    var ichGardish = new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.09, 10, 36), yogochOchMat);
    charx.add(ichGardish);
    var stupitsa = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.36, 16), yogochMat);
    stupitsa.rotation.x = Math.PI / 2;
    stupitsa.castShadow = true;
    charx.add(stupitsa);
    var markazNaqsh = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.42, 8), oltinMat);
    markazNaqsh.rotation.x = Math.PI / 2;
    charx.add(markazNaqsh);
    for (var ci = 0; ci < 12; ci++) {
      var ca = (ci / 12) * Math.PI * 2;
      var pana = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.2, 0.12), yogochOchMat);
      pana.position.set(Math.cos(ca) * 1.15, Math.sin(ca) * 1.15, 0);
      pana.rotation.z = ca - Math.PI / 2;
      pana.castShadow = true;
      charx.add(pana);
      // Gardishdagi oltin mixchalar
      var mix = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), oltinMat);
      mix.position.set(Math.cos(ca) * 2.3, Math.sin(ca) * 2.3, 0.18);
      charx.add(mix);
    }
    charx.position.set(0, 2.9, -5.4);
    sahna.add(charx);

    // Charxni ushlab turuvchi ikki ustun
    [-2.75, 2.75].forEach(function (x) {
      var ustun = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 3.2, 12), yogochMat);
      ustun.position.set(x, 1.6, -5.4);
      ustun.castShadow = true;
      sahna.add(ustun);
      var boshcha = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), oltinMat);
      boshcha.position.set(x, 3.3, -5.4);
      sahna.add(boshcha);
    });
    var kondalang = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.18, 0.24), yogochMat);
    kondalang.position.set(0, 2.9, -5.62);
    sahna.add(kondalang);

    /* ---------- 4.5. Kursichalar — buyumlar shu ustida turadi ---------- */
    var ORIN = 4;
    var kursilar = [];
    for (var ki = 0; ki < ORIN; ki++) {
      var K = new THREE.Group();

      var poya = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.56, 0.72, 18), yogochMat);
      poya.position.y = 0.36;
      poya.castShadow = true; poya.receiveShadow = true;
      K.add(poya);

      var ust = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.13, 20), yogochOchMat);
      ust.position.y = 0.78;
      ust.castShadow = true; ust.receiveShadow = true;
      K.add(ust);

      // DIQQAT: nomi `halqa` bo'lmasin — pastda animatsiya halqasi
      // `function halqa()` bor, `var` uni ustiga yozib yuboradi.
      var oltinHalqa = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.045, 8, 28), oltinMat);
      oltinHalqa.rotation.x = -Math.PI / 2;
      oltinHalqa.position.y = 0.845;
      K.add(oltinHalqa);

      // Kursicha yonidagi o‘yma teshikchalar
      for (var kj = 0; kj < 6; kj++) {
        var ka = (kj / 6) * Math.PI * 2;
        var oyma = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6),
          new THREE.MeshStandardMaterial({ color: 0x4A3520, roughness: 0.9 }));
        oyma.scale.set(0.5, 1.4, 0.5);
        oyma.position.set(Math.cos(ka) * 0.47, 0.4, Math.sin(ka) * 0.47);
        K.add(oyma);
      }

      // Tanlashda yonadigan halqa
      var nurHalqa = new THREE.Mesh(
        new THREE.TorusGeometry(0.72, 0.055, 8, 30),
        new THREE.MeshStandardMaterial({
          color: 0xD4A24C, emissive: 0x8A5F12, roughness: 0.4,
          transparent: true, opacity: 0
        })
      );
      nurHalqa.rotation.x = -Math.PI / 2;
      nurHalqa.position.y = 0.9;
      K.add(nurHalqa);

      var burchak = (ki - (ORIN - 1) / 2) * 0.52;    // old tomonga yoy
      var R = 3.15;
      K.position.set(Math.sin(burchak) * R, 0, Math.cos(burchak) * R - 0.55);
      K.rotation.y = burchak;
      K.userData.nurHalqa = nurHalqa;
      K.userData.asosY = 0;
      sahna.add(K);
      kursilar.push(K);
    }

    /* ---------- 4.6. Animatsiya navbati ---------- */
    var tvenlar = [];
    function tven(dav, yur, tamom) {
      tvenlar.push({ t: 0, dav: kamHarakat ? Math.min(dav, 0.12) : dav, yur: yur, tamom: tamom });
    }
    function kutish(dav, tamom) { tven(dav, function () {}, tamom); }
    function tvenYangila(dt) {
      for (var i = tvenlar.length - 1; i >= 0; i--) {
        var v = tvenlar[i];
        v.t += dt;
        var p = Math.min(v.t / v.dav, 1);
        v.yur(p);
        if (p >= 1) { tvenlar.splice(i, 1); if (v.tamom) v.tamom(); }
      }
    }
    function yumshoq(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
    function chiqish(x) { return 1 - Math.pow(1 - x, 3); }

    /* ---------- 4.7. Holat ---------- */
    var navbat = [], joriySavol = null, buyumlar = [];
    var togri = 0, raund = 0, bandmi = true, tugadi = false;

    function aralashtir(a) {
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }
    function tabloYangila() {
      ballEl.textContent = togri;
      raundEl.textContent = Math.min(raund + 1, RAUND);
    }
    function xabar(matn, tur) {
      xabarEl.textContent = matn || '';
      xabarEl.className = 'o3dd-xabar' + (tur ? ' ' + tur : '');
    }

    function tozalaBuyumlar() {
      buyumlar.forEach(function (b) {
        if (!b) return;
        sahna.remove(b);
        b.traverse(function (o) {
          if (o.isMesh) {
            if (o.geometry) o.geometry.dispose();
            var ro = Array.isArray(o.material) ? o.material : [o.material];
            ro.forEach(function (mt) { if (mt && mt.dispose) mt.dispose(); });
          }
        });
      });
      buyumlar = [];
    }

    /* ---------- 4.8. Yangi savol ---------- */
    function keyingi() {
      if (raund >= RAUND) { yakunla(); return; }
      bandmi = true;
      tozalaBuyumlar();

      joriySavol = navbat[raund];
      var kalitlar = aralashtir([joriySavol.j].concat(joriySavol.c.slice(0, 3)));
      while (kalitlar.length < ORIN) kalitlar.push(kalitlar[0]);   // xavfsizlik
      kalitlar = kalitlar.slice(0, ORIN);

      savolEl.innerHTML = joriySavol.s +
        (joriySavol.m ? '<em>' + joriySavol.m + '</em>' : '');
      xabar('To‘g‘ri buyumni bosing');
      tabloYangila();

      kalitlar.forEach(function (kalit, i) {
        var g = MODELLAR[kalit].yasa();
        g.traverse(function (o) { if (o.isMesh) o.castShadow = true; });
        var qop = new THREE.Group();
        qop.add(g);
        g.scale.setScalar(1.15);
        var K = kursilar[i];
        qop.position.set(K.position.x, 0.845, K.position.z);
        qop.userData.kalit = kalit;
        qop.userData.orin = i;
        sahna.add(qop);
        buyumlar.push(qop);

        // Ko‘tarilib chiqish
        qop.scale.setScalar(0.02);
        tven(0.42 + i * 0.09, function (p) {
          var e = chiqish(p);
          qop.scale.setScalar(0.02 + e * 0.98);
          qop.position.y = 0.845 + (1 - e) * 0.6;
        }, function () {
          qop.scale.setScalar(1);
          qop.position.y = 0.845;
          if (i === ORIN - 1) bandmi = false;
        });
      });
    }

    /* ---------- 4.9. Javob ---------- */
    var uchqunlar = [];
    function uchqunChiqar(joy) {
      var soni = telefon ? 12 : 24;
      for (var i = 0; i < soni; i++) {
        var u = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.06 + Math.random() * 0.05),
          new THREE.MeshStandardMaterial({
            color: i % 2 ? 0xD4A24C : 0xF3E2B0, roughness: 0.3, metalness: 0.5,
            transparent: true, opacity: 1
          })
        );
        u.position.set(joy.x + (Math.random() - 0.5) * 0.9, joy.y + 0.5,
          joy.z + (Math.random() - 0.5) * 0.9);
        u.userData.tez = new THREE.Vector3(
          (Math.random() - 0.5) * 2.4, 2.4 + Math.random() * 2.2, (Math.random() - 0.5) * 2.4);
        u.userData.umr = 0;
        sahna.add(u);
        uchqunlar.push(u);
      }
    }
    function uchqunYangila(dt) {
      for (var i = uchqunlar.length - 1; i >= 0; i--) {
        var u = uchqunlar[i];
        u.userData.umr += dt;
        u.userData.tez.y -= 7 * dt;
        u.position.addScaledVector(u.userData.tez, dt);
        u.rotation.x += dt * 4; u.rotation.y += dt * 5;
        u.material.opacity = Math.max(0, 1 - u.userData.umr / 1.2);
        if (u.userData.umr > 1.2) {
          sahna.remove(u); u.geometry.dispose(); u.material.dispose();
          uchqunlar.splice(i, 1);
        }
      }
    }

    function halqaYondir(K, davomiylik) {
      var h = K.userData.nurHalqa;
      tven(davomiylik, function (p) {
        h.material.opacity = Math.sin(p * Math.PI) * 0.95;
        var k = 1 + p * 0.45;
        h.scale.set(k, k, 1);
      }, function () {
        h.material.opacity = 0;
        h.scale.set(1, 1, 1);
      });
    }

    function javobBer(orin) {
      if (bandmi || tugadi || !joriySavol) return;
      var qop = buyumlar[orin];
      if (!qop) return;
      bandmi = true;

      var togriOrin = -1;
      for (var i = 0; i < buyumlar.length; i++) {
        if (buyumlar[i] && buyumlar[i].userData.kalit === joriySavol.j) togriOrin = i;
      }
      var rostQop = buyumlar[togriOrin];
      var rostNom = MODELLAR[joriySavol.j].nom;
      raund++;

      if (orin === togriOrin) {
        togri++;
        xabar('To‘g‘ri — ' + rostNom + '. ' + joriySavol.i, 'togri');
        halqaYondir(kursilar[orin], 0.9);
        uchqunChiqar(qop.position);
        // Ko‘tarilib, aylanib tushadi
        tven(0.9, function (p) {
          qop.position.y = 0.845 + Math.sin(p * Math.PI) * 0.85;
          qop.rotation.y += 0.11;
        }, function () { qop.position.y = 0.845; });
      } else {
        xabar('Bu emas. To‘g‘ri javob — ' + rostNom + '. ' + joriySavol.i, 'xato');
        // Xato tanlov chayqaladi
        tven(0.6, function (p) {
          qop.rotation.z = Math.sin(p * Math.PI * 5) * (1 - p) * 0.35;
        }, function () { qop.rotation.z = 0; });
        if (rostQop) {
          halqaYondir(kursilar[togriOrin], 1.3);
          tven(1.0, function (p) {
            rostQop.position.y = 0.845 + Math.sin(p * Math.PI) * 0.7;
            rostQop.rotation.y += 0.09;
          }, function () { rostQop.position.y = 0.845; });
        }
      }

      tabloYangila();
      kutish(kamHarakat ? 0.6 : 2.1, function () {
        // Buyumlar pastga tushib yo‘qoladi
        var kop = buyumlar.slice();
        tven(0.34, function (p) {
          kop.forEach(function (b) { if (b) { b.scale.setScalar(1 - p); } });
        }, function () { keyingi(); });
      });
    }

    /* ---------- 4.10. Boshqaruv: bosish va sudrash ---------- */
    var nur = new THREE.Raycaster();
    var nuqta = new THREE.Vector2();
    var sudrash = null;
    var kamBurchak = 0, kamMaqsad = 0;

    function bosildi(e) {
      sudrash = { x: e.clientX, yurdi: 0, id: e.pointerId };
      try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
    }
    function surildi(e) {
      if (!sudrash || e.pointerId !== sudrash.id) return;
      var dx = e.clientX - sudrash.x;
      sudrash.yurdi += Math.abs(dx);
      kamMaqsad = Math.max(-0.42, Math.min(0.42, kamMaqsad - dx * 0.0035));
      sudrash.x = e.clientX;
      e.preventDefault();
    }
    function qoyildi(e) {
      if (!sudrash || e.pointerId !== sudrash.id) return;
      var yurdi = sudrash.yurdi;
      sudrash = null;
      try { canvas.releasePointerCapture(e.pointerId); } catch (x) {}
      if (yurdi > 10) return;
      var r = canvas.getBoundingClientRect();
      nuqta.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      nuqta.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      nur.setFromCamera(nuqta, kamera);
      // Buyum yoki uning kursichasi bosilsa ham javob hisoblanadi
      var maqsadlar = buyumlar.concat(kursilar);
      var kesishuv = nur.intersectObjects(maqsadlar, true);
      if (!kesishuv.length) return;
      var o = kesishuv[0].object;
      while (o && maqsadlar.indexOf(o) === -1) o = o.parent;
      if (!o) return;
      var bi = buyumlar.indexOf(o);
      if (bi !== -1) { javobBer(bi); return; }
      var kiIdx = kursilar.indexOf(o);
      if (kiIdx !== -1) javobBer(kiIdx);
    }
    canvas.addEventListener('pointerdown', bosildi);
    canvas.addEventListener('pointermove', surildi, { passive: false });
    canvas.addEventListener('pointerup', qoyildi);
    canvas.addEventListener('pointercancel', function () { sudrash = null; });

    sahnaDiv.tabIndex = 0;
    sahnaDiv.setAttribute('aria-label',
      '3D o‘yin: savolga mos buyumni bosing. 1–4 tugmalari bilan ham tanlash mumkin.');
    sahnaDiv.addEventListener('keydown', function (e) {
      if (['1', '2', '3', '4'].indexOf(e.key) !== -1) javobBer(parseInt(e.key, 10) - 1);
    });

    /* ---------- 4.11. Yakun ---------- */
    function yakunla() {
      tugadi = true;
      savolEl.textContent = 'O‘yin tugadi';
      xabar('');
      var foiz = Math.round((togri / RAUND) * 100);

      var baho;
      if (foiz === 100) baho = 'A’lo! Xalq didaktikasining tamoyillarini mukammal bilasiz.';
      else if (foiz >= 80) baho = 'Juda yaxshi natija. Maqol va topishmoqlar o‘zlashtirilgan.';
      else if (foiz >= 60) baho = 'Yaxshi. Ma’ruzadagi maqollarni yana bir bor takrorlang.';
      else baho = 'Ma’ruza matnidagi didaktik tamoyillarni qaytadan o‘qib chiqing.';

      var quti = document.createElement('div');
      quti.className = 'o3dd-natija';
      quti.innerHTML =
        '<h4>Xalq donishmandligi charxi</h4>' +
        '<span class="o3dd-foiz">' + foiz + '%</span>' +
        '<p>' + RAUND + ' ta savoldan ' + togri + ' tasiga to‘g‘ri javob berdingiz. ' + baho + '</p>' +
        '<button type="button" class="o3dd-qayta">Qaytadan o‘ynash</button>';
      ustQatlam.appendChild(quti);
      quti.querySelector('.o3dd-qayta').addEventListener('click', function () {
        quti.remove();
        qaytaBoshla();
      });

      try {
        if (window.Xotira) window.Xotira.modulYoz(2, { oyin3d: foiz });
      } catch (x) {}
    }

    function qaytaBoshla() {
      tugadi = false; togri = 0; raund = 0;
      tvenlar.length = 0;
      uchqunlar.forEach(function (u) {
        sahna.remove(u); u.geometry.dispose(); u.material.dispose();
      });
      uchqunlar.length = 0;
      kursilar.forEach(function (K) {
        K.userData.nurHalqa.material.opacity = 0;
        K.userData.nurHalqa.scale.set(1, 1, 1);
      });
      navbat = aralashtir(savollar.slice()).slice(0, RAUND);
      tabloYangila();
      keyingi();
    }

    /* ---------- 4.12. O‘lcham ---------- */
    function olchamla() {
      var w = idish.clientWidth || 640;
      var h = Math.round(Math.min(Math.max(w * 0.64, 320), 580));
      renderer.setSize(w, h, false);
      var tor = w < 560;
      sahnaDiv.classList.toggle('o3dd-tor', tor);
      kamera.aspect = w / h;
      kamera.fov = tor ? 46 : 40;
      kamera.updateProjectionMatrix();
      kameraJoyla();
    }
    function kameraJoyla() {
      var tor = sahnaDiv.classList.contains('o3dd-tor');
      var uzoq = tor ? 9.4 : 8.4;
      var bal = tor ? 4.6 : 4.1;
      kamera.position.set(Math.sin(kamBurchak) * uzoq, bal, Math.cos(kamBurchak) * uzoq + 1.2);
      kamera.lookAt(0, 1.35, 1.0);
    }
    olchamla();
    if (window.ResizeObserver) new ResizeObserver(olchamla).observe(idish);
    else window.addEventListener('resize', olchamla);

    /* ---------- 4.13. Halqa ---------- */
    var ishlayapti = false, oxirgi = 0;
    function halqa(vaqt) {
      if (!ishlayapti) return;
      var dt = Math.min((vaqt - oxirgi) / 1000, 0.05);
      oxirgi = vaqt;

      tvenYangila(dt);
      uchqunYangila(dt);

      // Kamera yumshoq suriladi
      if (Math.abs(kamMaqsad - kamBurchak) > 0.0004) {
        kamBurchak += (kamMaqsad - kamBurchak) * Math.min(dt * 6, 1);
        kameraJoyla();
      }

      if (!kamHarakat) {
        charx.rotation.z += dt * 0.16;
        buyumlar.forEach(function (b, i) {
          if (b) b.rotation.y += dt * (0.42 + i * 0.04);
        });
      }

      renderer.render(sahna, kamera);
      requestAnimationFrame(halqa);
    }
    function yoqHalqa() {
      if (ishlayapti) return;
      ishlayapti = true; oxirgi = performance.now();
      requestAnimationFrame(halqa);
    }
    function ochirHalqa() { ishlayapti = false; }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (y) {
        y[0].isIntersecting ? yoqHalqa() : ochirHalqa();
      }, { threshold: 0.03 }).observe(sahnaDiv);
    } else { yoqHalqa(); }

    window.addEventListener('pagehide', function () {
      ochirHalqa();
      try { renderer.dispose(); } catch (x) {}
    });

    /* ---------- 4.14. Boshlash ---------- */
    navbat = aralashtir(savollar.slice()).slice(0, RAUND);
    tabloYangila();
    yoqHalqa();
    keyingi();
    sahnaDiv.focus({ preventScroll: true });
  }
})();
