/* =========================================================================
   «BAXSHI MAJLISI» — HAQIQIY 3D O‘YIN (Three.js · WebGL)
   6-modul: «Xalq pedagogikasi va xalq og‘zaki ijodida dostonlar».

   O‘yin mazmuni
   -------------
   Cho‘l kechasi. O‘tov oldida gulxan yonadi, uning yonida chordana qurib
   o‘tirgan baxshi do‘mbira chertib «Alpomish» dostonidan kuylaydi;
   atrofda tinglovchilar o‘tiribdi. Baxshi oldidagi yog‘och laganlarga
   dostondagi buyumlar — kamon, nayza, qalqon, dubulg‘a, belbog‘, tanga,
   uzuk, qamchin, ot, do‘mbira — ko‘tariladi. Baxshi savol beradi,
   o‘quvchi to‘g‘ri buyumni bosadi.

   Har bir tafsilot uchun alohida, tanib olsa bo‘ladigan 3D model
   ishlatiladi. Modellar tayyor kutubxonalardan olinadi:
     model-doston.js — baxshi, o‘tov, gulxan, tinglovchi va «Alpomish»
                       dostoni jabduqlari
     model-cholgu.js — do‘mbira, dutor, rubob, doira, chang, nay
     model-oyin.js   — ot, qo‘y, qilich, chavgon, arqon, do‘ppi, ro‘mol
     model-maishiy.js— kitob, non, choynak

   Bu fayl mustaqil: o‘z HTML karkasini, uslublarini va butun sahnasini
   o‘zi quradi. Umumiy fayllarga tegmaydi.
   ========================================================================= */
import * as THREE from '../vendor/three.module.min.js';

(async function () {
  'use strict';

  /* =======================================================================
     0. IDISH
     ======================================================================= */
  var idish = document.getElementById('oyin3d-baxshi') ||
              document.getElementById('oyin3d');
  if (!idish) return;
  if (idish.querySelector('canvas')) return;
  if (idish.dataset.oyin3dBand) return;
  idish.dataset.oyin3dBand = 'baxshi';

  var MODUL = parseInt(idish.dataset.modul || '6', 10);

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
    xp.className = 'o3b-xato';
    xp.textContent = 'Brauzeringiz 3D grafikani qo‘llab-quvvatlamaydi. ' +
                     'Quyidagi oddiy o‘yin variantida ishlashingiz mumkin.';
    idish.appendChild(xp);
    return;
  }

  var kamHarakat = !!(window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* =======================================================================
     2. USLUBLAR — «o3b-» old qo‘shimchasi
     ======================================================================= */
  if (!document.getElementById('o3b-uslub')) {
    var uslub = document.createElement('style');
    uslub.id = 'o3b-uslub';
    uslub.textContent = [
      '.o3b-sahna{position:relative;width:100%;border-radius:18px;overflow:hidden;',
      '  background:#141A2E;box-shadow:0 2px 4px rgba(26,22,20,.10),0 12px 30px rgba(26,22,20,.20);}',
      '.o3b-sahna canvas{display:block;width:100%;height:auto;touch-action:manipulation;cursor:pointer;}',
      '.o3b-ust{position:absolute;inset:0;pointer-events:none;font:inherit;}',
      '.o3b-qator{position:absolute;top:11px;left:11px;right:11px;display:flex;',
      '  align-items:flex-start;justify-content:space-between;gap:8px;}',
      '.o3b-tabl{flex:0 0 auto;display:inline-flex;gap:6px;align-items:baseline;',
      '  padding:6px 13px;border-radius:999px;background:rgba(20,26,46,.86);color:#F3E6CE;',
      '  border:1px solid rgba(212,162,76,.45);',
      '  font-size:.82rem;font-weight:600;white-space:nowrap;}',
      '.o3b-tabl b{font-size:1rem;color:#D4A24C;}',
      '.o3b-doston{flex:0 0 auto;padding:6px 15px;border-radius:999px;',
      '  background:rgba(150,80,31,.92);color:#FBF7F0;font-size:.78rem;font-weight:700;',
      '  letter-spacing:.04em;text-transform:uppercase;white-space:nowrap;}',
      '.o3b-savolquti{position:absolute;left:12px;right:12px;top:52px;text-align:center;}',
      '.o3b-savol{display:inline-block;margin:0;max-width:44ch;padding:10px 18px 10px 18px;',
      '  border-radius:16px;background:rgba(43,33,24,.93);color:#F7E9CE;',
      '  border:1px solid rgba(212,162,76,.5);',
      '  font-size:.95rem;font-weight:600;line-height:1.35;',
      '  box-shadow:0 6px 18px rgba(0,0,0,.4);}',
      '.o3b-savol b{display:block;font-size:.72rem;letter-spacing:.06em;',
      '  text-transform:uppercase;color:#D4A24C;margin-bottom:3px;font-weight:700;}',
      '.o3b-past{position:absolute;left:12px;right:12px;bottom:12px;text-align:center;}',
      '.o3b-xabar{display:inline-block;margin:0;max-width:100%;padding:7px 16px;',
      '  border-radius:999px;background:rgba(20,26,46,.82);color:#F3E6CE;',
      '  font-size:.85rem;font-weight:600;line-height:1.35;}',
      '.o3b-xabar:empty{display:none;}',
      '.o3b-xabar.togri{background:rgba(31,84,52,.92);color:#DFF6E4;}',
      '.o3b-xabar.xato{background:rgba(150,52,26,.92);color:#FFE2D6;}',
      '.o3b-parda{position:absolute;inset:0;display:flex;flex-direction:column;',
      '  align-items:center;justify-content:center;gap:11px;text-align:center;padding:22px;',
      '  background:linear-gradient(160deg,rgba(20,26,46,.95),rgba(90,45,18,.94));',
      '  color:#F7E9CE;pointer-events:auto;}',
      '.o3b-parda h4{margin:0;font-size:1.3rem;line-height:1.25;}',
      '.o3b-parda p{margin:0;font-size:.92rem;max-width:38ch;line-height:1.5;}',
      '.o3b-foiz{font-size:2.5rem;font-weight:800;color:#D4A24C;line-height:1;}',
      '.o3b-ich{pointer-events:auto;cursor:pointer;margin-top:4px;padding:11px 26px;',
      '  border:0;border-radius:999px;background:#D4A24C;color:#2A1B08;',
      '  font:inherit;font-size:.98rem;font-weight:700;',
      '  box-shadow:0 5px 14px rgba(0,0,0,.4);transition:transform .15s ease;}',
      '.o3b-ich:hover{transform:translateY(-2px);} .o3b-ich:active{transform:translateY(1px);}',
      '.o3b-xato{margin:0;padding:22px;border-radius:16px;background:#FBF7F0;color:#1B3B6F;',
      '  text-align:center;font-weight:600;}',
      '.o3b-tor .o3b-qator{top:7px;left:7px;right:7px;gap:5px;}',
      '.o3b-tor .o3b-tabl{padding:4px 9px;font-size:.68rem;gap:4px;}',
      '.o3b-tor .o3b-tabl b{font-size:.8rem;}',
      '.o3b-tor .o3b-doston{padding:4px 10px;font-size:.64rem;}',
      '.o3b-tor .o3b-savolquti{top:40px;left:7px;right:7px;}',
      '.o3b-tor .o3b-savol{padding:7px 13px;font-size:.8rem;border-radius:13px;}',
      '.o3b-tor .o3b-savol b{font-size:.62rem;}',
      '.o3b-tor .o3b-past{left:7px;right:7px;bottom:8px;}',
      '.o3b-tor .o3b-xabar{padding:5px 11px;font-size:.73rem;}',
      '.o3b-tor .o3b-foiz{font-size:2rem;} .o3b-tor .o3b-parda h4{font-size:1.05rem;}',
      '.o3b-tor .o3b-parda p{font-size:.8rem;}',
      '@media (prefers-reduced-motion: reduce){.o3b-ich{transition:none;}}'
    ].join('\n');
    document.head.appendChild(uslub);
  }

  /* =======================================================================
     3. HTML KARKAS
     ======================================================================= */
  var sahnaDiv = document.createElement('div');
  sahnaDiv.className = 'o3b-sahna';
  sahnaDiv.innerHTML =
    '<canvas></canvas>' +
    '<div class="o3b-ust">' +
      '<div class="o3b-qator">' +
        '<span class="o3b-tabl">Ball <b class="o3b-ball">0</b></span>' +
        '<span class="o3b-doston">Alpomish kechasi</span>' +
        '<span class="o3b-tabl">Qoldi <b class="o3b-qoldi">0</b></span>' +
      '</div>' +
      '<div class="o3b-savolquti"><p class="o3b-savol"></p></div>' +
      '<div class="o3b-past"><p class="o3b-xabar" role="status"></p></div>' +
    '</div>';
  idish.appendChild(sahnaDiv);

  var tugmaQator = document.createElement('div');
  tugmaQator.className = 'oyin-tugmalar';
  tugmaQator.innerHTML =
    '<button type="button" class="tug tug-asos tug-kichik o3b-boshla">▶ Dostonni boshlash</button>' +
    '<button type="button" class="tug tug-ramka tug-kichik o3b-qayta">↻ Qaytadan</button>';
  idish.appendChild(tugmaQator);

  var canvas  = sahnaDiv.querySelector('canvas');
  var ballEl  = sahnaDiv.querySelector('.o3b-ball');
  var qoldiEl = sahnaDiv.querySelector('.o3b-qoldi');
  var turEl   = sahnaDiv.querySelector('.o3b-doston');
  var savolEl = sahnaDiv.querySelector('.o3b-savol');
  var xabarEl = sahnaDiv.querySelector('.o3b-xabar');
  var boshlaTg = tugmaQator.querySelector('.o3b-boshla');
  var qaytaTg  = tugmaQator.querySelector('.o3b-qayta');

  /* =======================================================================
     4. MODEL KUTUBXONALARI
     ======================================================================= */
  var MANBALAR = [
    ['./model-doston.js',  'DOSTON'],
    ['./model-cholgu.js',  'CHOLGULAR'],
    ['./model-oyin.js',    'OYIN_BUYUMLARI'],
    ['./model-maishiy.js', 'MAISHIY'],
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
  function yasa(k) {
    if (!bor(k)) return null;
    try { return KUTUB[k].yasa(); } catch (e) { return null; }
  }

  /* =======================================================================
     5. BAXSHI SAVOLLARI — «Alpomish» va dostonchilik tafsilotlari
     ======================================================================= */
  var SAVOLLAR = [
    { tur: 'Dostonchilik',
      savol: 'Baxshi doston aytganda qaysi cholg‘uda jo‘r bo‘ladi?',
      javob: 'dombra', chalgituvchi: ['chang', 'nay', 'doira', 'rubob'],
      izoh: 'Baxshilar do‘mbira, dutor, tor chalib, qo‘biz chertib doston aytganlar.' },

    { tur: 'Barchin sharti',
      savol: 'Barchinning birinchi sharti — poyga. Unda qaysi jonivor sinaladi?',
      javob: 'ot', chalgituvchi: ['qoy', 'qamchin', 'arqon', 'chavgon'],
      izoh: 'Alpomish poygaga Boychibor otini mindirib chiqadi.' },

    { tur: 'Barchin sharti',
      savol: 'Ikkinchi shart — kurash. Polvonlar beliga nimani bog‘laydi?',
      javob: 'belbog', chalgituvchi: ['romol', 'arqon', 'qamchin', 'doppi'],
      izoh: 'Kurash belbog‘i — mardlik va halol kuch sinovining belgisi.' },

    { tur: 'Barchin sharti',
      savol: 'Uchinchi shart — «yoyi sinmay qolganga tegaman». Qaysi qurol sinaladi?',
      javob: 'kamon', chalgituvchi: ['nayza', 'qilich', 'chavgon', 'qamchin'],
      izoh: 'Yoy tortish alplarning kuchi va chidamini o‘lchagan.' },

    { tur: 'Barchin sharti',
      savol: 'To‘rtinchi shart — «ming qadamda» nimani urish kerak edi?',
      javob: 'tanga', chalgituvchi: ['uzuk', 'qalqon', 'doppi', 'kitob'],
      izoh: 'Ming qadamdan tanga pulni urgan mergan g‘olib deb topilgan.' },

    { tur: 'Jang lavhasi',
      savol: '«Qo‘lda nayzasi so‘lqillab…» — Alpomish qo‘lidagi qurol qaysi?',
      javob: 'nayza', chalgituvchi: ['chavgon', 'arqon', 'qamchin', 'kamon'],
      izoh: 'Nayza — jangnoma dostonlaridagi eng ko‘p tilga olinadigan qurol.' },

    { tur: 'Jang lavhasi',
      savol: '«Dubulg‘a boshda dungullab…» — dubulg‘a qaysi buyum?',
      javob: 'dubulga', chalgituvchi: ['doppi', 'qalqon', 'romol', 'doira'],
      izoh: 'Dubulg‘a — jangchining boshini asraydigan temir qalpoq.' },

    { tur: 'Jang lavhasi',
      savol: '«Kark qubba qalqon qarqillab…» — jangchini to‘sadigan buyum qaysi?',
      javob: 'qalqon', chalgituvchi: ['doira', 'dubulga', 'doppi', 'kitob'],
      izoh: 'Qalqon markazidagi qubba zarbani chetga uchiradi.' },

    { tur: '«Ravshan» dostoni',
      savol: '«Ravshan» dostonida Ravshan Zulxumorni nimada ko‘rib qoladi?',
      javob: 'uzuk', chalgituvchi: ['tanga', 'doppi', 'qalqon', 'doira'],
      izoh: 'Ishqiy-romantik dostonlarda voqea tuguni shunday boshlanadi.' },

    { tur: 'Doston turlari',
      savol: '«Layli va Majnun», «Farhod va Shirin» kabi kitobiy dostonlar qanday shaklda yaratilgan?',
      javob: 'kitob', chalgituvchi: ['dombra', 'doira', 'uzuk', 'nay'],
      izoh: 'Kitobiy dostonlar shoirlar tomonidan yozma shaklda yaratilgan.' },

    { tur: 'Cho‘l odati',
      savol: 'Chavandoz va baxshi ot minganda qo‘lida nimani tutadi?',
      javob: 'qamchin', chalgituvchi: ['chavgon', 'nayza', 'arqon', 'belbog'],
      izoh: 'Qamchin — otliqning ajralmas hamrohi, dostonlarda ko‘p tilga olinadi.' }
  ];

  var TAYYOR = SAVOLLAR.filter(function (s) {
    if (!bor(s.javob)) return false;
    s.chalgituvchi = s.chalgituvchi.filter(bor);
    return s.chalgituvchi.length >= 2;
  });
  if (!TAYYOR.length) {
    sahnaDiv.remove(); tugmaQator.remove();
    var xp2 = document.createElement('p');
    xp2.className = 'o3b-xato';
    xp2.textContent = '3D modellar kutubxonasi yuklanmadi.';
    idish.appendChild(xp2);
    return;
  }

  /* =======================================================================
     6. SAHNA — CHO‘L KECHASI
     ======================================================================= */
  var sahna = new THREE.Scene();
  sahna.background = new THREE.Color(0x141A2E);
  sahna.fog = new THREE.Fog(0x141A2E, 11, 30);

  var kamera = new THREE.PerspectiveCamera(43, 16 / 10, 0.1, 140);

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  /* ---------- Yorug‘lik: oy nuri + gulxan alangasi ---------- */
  sahna.add(new THREE.HemisphereLight(0x40507E, 0x241C14, 0.62));
  var oyNuri = new THREE.DirectionalLight(0x9FB4E8, 0.62);
  oyNuri.position.set(-5.5, 8.5, 3.2);
  oyNuri.castShadow = true;
  oyNuri.shadow.mapSize.set(1024, 1024);
  oyNuri.shadow.camera.left = -8;  oyNuri.shadow.camera.right = 8;
  oyNuri.shadow.camera.top = 8;    oyNuri.shadow.camera.bottom = -6;
  oyNuri.shadow.camera.near = 0.5; oyNuri.shadow.camera.far = 26;
  oyNuri.shadow.bias = -0.0009;
  sahna.add(oyNuri);

  var GULXAN_JOY = new THREE.Vector3(2.55, 0, -2.35);
  var alanga = new THREE.PointLight(0xFF9B3C, 2.6, 16, 1.7);
  alanga.position.set(GULXAN_JOY.x, 0.85, GULXAN_JOY.z);
  sahna.add(alanga);
  // Buyumlarni oldindan yumshoq yorituvchi ikkinchi iliq nur
  var oldNur = new THREE.DirectionalLight(0xFFC489, 0.55);
  oldNur.position.set(1.6, 3.4, 5.2);
  sahna.add(oldNur);

  /* ---------- Yer — cho‘l ---------- */
  var yer = new THREE.Mesh(
    new THREE.CircleGeometry(20, 48),
    new THREE.MeshStandardMaterial({ color: 0x4A3B2A, roughness: 1 })
  );
  yer.rotation.x = -Math.PI / 2;
  yer.receiveShadow = true;
  sahna.add(yer);

  /* ---------- Kigiz (majlis gilami) ---------- */
  var kigiz = new THREE.Mesh(
    new THREE.BoxGeometry(10.4, 0.07, 5.6),
    new THREE.MeshStandardMaterial({ color: 0x7A2F26, roughness: 0.98 })
  );
  kigiz.position.set(0, 0.035, -0.5);
  kigiz.receiveShadow = true;
  sahna.add(kigiz);
  [[10.0, 5.2], [9.5, 4.7]].forEach(function (o, i) {
    var m = new THREE.MeshStandardMaterial({
      color: i ? 0xD4A24C : 0xE6D4B0, roughness: 0.7, metalness: 0.15
    });
    [1, -1].forEach(function (s) {
      var a = new THREE.Mesh(new THREE.BoxGeometry(o[0], 0.012, 0.07), m);
      a.position.set(0, 0.075 + i * 0.002, -0.5 + s * o[1] / 2);
      sahna.add(a);
      var b = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.012, o[1]), m);
      b.position.set(s * o[0] / 2, 0.075 + i * 0.002, -0.5);
      sahna.add(b);
    });
  });

  /* ---------- Yulduzli osmon va oy ---------- */
  var yulduzMat = new THREE.MeshBasicMaterial({ color: 0xFFF6DC });
  var yulduzGeo = new THREE.SphereGeometry(0.12, 6, 4);
  var osmon = new THREE.Group();
  for (var y = 0; y < 90; y++) {
    var yl = new THREE.Mesh(yulduzGeo, yulduzMat);
    var fi = Math.random() * Math.PI * 2;
    var teta = Math.random() * 0.85 + 0.14;
    var R = 46;
    yl.position.set(
      Math.cos(fi) * Math.sin(teta) * R,
      Math.cos(teta * 0.9) * R * 0.9 + 6,
      Math.sin(fi) * Math.sin(teta) * R - 8
    );
    if (yl.position.y < 4) continue;
    yl.scale.setScalar(0.5 + Math.random() * 1.4);
    osmon.add(yl);
  }
  sahna.add(osmon);

  var oy = new THREE.Mesh(
    new THREE.SphereGeometry(1.9, 22, 16),
    new THREE.MeshBasicMaterial({ color: 0xF6EEDA })
  );
  oy.position.set(-15, 13, -26);
  sahna.add(oy);

  /* ---------- Uzoqdagi tepaliklar ---------- */
  var tepaMat = new THREE.MeshStandardMaterial({ color: 0x2A2E46, roughness: 1 });
  [[-13, -17, 4.2], [-5.5, -20, 3.0], [7, -19, 3.8], [15, -16, 3.2]].forEach(function (t) {
    var tepa = new THREE.Mesh(new THREE.ConeGeometry(t[2] * 1.7, t[2], 12), tepaMat);
    tepa.position.set(t[0], t[2] / 2 - 0.4, t[1]);
    sahna.add(tepa);
  });

  /* =======================================================================
     7. ME’YORLASH YORDAMCHILARI
     ======================================================================= */
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
    model.traverse(function (o) { if (o.isMesh) o.castShadow = true; });
  }

  /* =======================================================================
     8. SAHNA QAHRAMONLARI — o‘tov, gulxan, baxshi, tinglovchilar
     ======================================================================= */
  var olovQismlari = [];      // lipillatiladigan alanga konuslari
  var baxshiObj = null, baxshiQol = null;
  var tinglovchilar = [];

  // O‘tov
  var otov = yasa('otov');
  if (otov) {
    moslash(otov, 4.6);
    otov.position.set(-3.5, 0, -5.2);
    otov.rotation.y = 0.42;
    soyaBer(otov);
    sahna.add(otov);
  }

  // Gulxan
  var gulxan = yasa('gulxan');
  if (gulxan) {
    moslash(gulxan, 1.5);
    gulxan.position.copy(GULXAN_JOY);
    soyaBer(gulxan);
    sahna.add(gulxan);
    if (gulxan.userData && Array.isArray(gulxan.userData.olov)) {
      olovQismlari = gulxan.userData.olov;
    }
  }

  // Baxshi — kigizning to‘rida, tomoshabinga yuzlangan
  baxshiObj = yasa('baxshi');
  if (baxshiObj) {
    moslash(baxshiObj, 1.75);
    baxshiObj.position.set(-0.35, 0.07, -2.75);
    soyaBer(baxshiObj);
    sahna.add(baxshiObj);
    if (baxshiObj.userData) baxshiQol = baxshiObj.userData.ongQol || null;

    // Baxshi qo‘lidagi do‘mbira
    var soz = yasa('dombra');
    if (soz) {
      moslash(soz, 1.25);
      soz.position.set(0.42, 0.42, 0.30);
      soz.rotation.set(0.15, 0.25, -1.05);
      soyaBer(soz);
      baxshiObj.add(soz);
    }
  }

  // Tinglovchilar — gulxan atrofida yarim doira
  var TINGLOVCHI_JOY = [
    [-3.15, -2.05, 0.85], [-2.15, -3.55, 0.55], [1.15, -3.75, -0.35],
    [4.15, -3.35, -0.95], [4.55, -1.35, -1.35]
  ];
  TINGLOVCHI_JOY.forEach(function (p, i) {
    var t = null;
    try { t = KUTUB['tinglovchi'] ? KUTUB['tinglovchi'].yasa(i) : null; } catch (e) { t = null; }
    if (!t) return;
    moslash(t, 1.35 + (i % 2) * 0.08);
    t.position.set(p[0], 0.07, p[1]);
    t.rotation.y = p[2];
    soyaBer(t);
    sahna.add(t);
    tinglovchilar.push({ obj: t, faza: Math.random() * Math.PI * 2 });
  });

  /* =======================================================================
     9. LAGANLAR — buyumlar shu laganlar ustida ko‘tariladi
     ======================================================================= */
  var LAGAN_BALAND = 0.30;

  function laganYasa() {
    var g = new THREE.Group();
    var yogT = new THREE.MeshStandardMaterial({ color: 0x5B4326, roughness: 0.85 });
    var yogO = new THREE.MeshStandardMaterial({ color: 0x93714A, roughness: 0.8 });

    var poy = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.40, 0.14, 22), yogT);
    poy.position.y = 0.07;
    poy.castShadow = true; poy.receiveShadow = true;
    g.add(poy);

    var tovoq = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.34, 0.13, 26), yogO);
    tovoq.position.y = 0.20;
    tovoq.castShadow = true; tovoq.receiveShadow = true;
    g.add(tovoq);

    var gardish = new THREE.Mesh(new THREE.TorusGeometry(0.50, 0.028, 8, 34),
      new THREE.MeshStandardMaterial({ color: 0xD4A24C, roughness: 0.42, metalness: 0.5 }));
    gardish.rotation.x = -Math.PI / 2;
    gardish.position.y = 0.265;
    g.add(gardish);

    // Tovoq yuzasidagi o‘yma naqsh — sakkiz nurli yulduz
    for (var i = 0; i < 8; i++) {
      var a = (i / 8) * Math.PI * 2;
      var nur2 = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.012, 0.035), yogT);
      nur2.position.set(Math.cos(a) * 0.28, 0.268, Math.sin(a) * 0.28);
      nur2.rotation.y = -a;
      g.add(nur2);
    }
    return g;
  }

  var UYA_SONI = 4;
  var ORALIQ = 2.15;
  var uyalar = [];
  for (var u = 0; u < UYA_SONI; u++) {
    var uya = new THREE.Group();
    uya.position.set((u - (UYA_SONI - 1) / 2) * ORALIQ, 0.07, 1.15);
    uya.add(laganYasa());

    var buyumUya = new THREE.Group();
    buyumUya.position.y = LAGAN_BALAND;
    uya.add(buyumUya);

    var yutuqHalqa = new THREE.Mesh(
      new THREE.TorusGeometry(0.60, 0.035, 10, 40),
      new THREE.MeshStandardMaterial({
        color: 0xD4A24C, roughness: 0.3, metalness: 0.6,
        emissive: 0x8A5F16, emissiveIntensity: 1.1
      })
    );
    yutuqHalqa.rotation.x = -Math.PI / 2;
    yutuqHalqa.position.y = LAGAN_BALAND + 0.01;
    yutuqHalqa.visible = false;
    uya.add(yutuqHalqa);

    sahna.add(uya);
    uyalar.push({
      guruh: uya, buyumUya: buyumUya, halqa: yutuqHalqa,
      model: null, kalit: null, bazaX: uya.position.x, aylanma: 0
    });
  }

  /* =======================================================================
     10. TVEN
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
     11. O‘YIN MANTIG‘I
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
    xabarEl.className = 'o3b-xabar' + (tur ? ' ' + tur : '');
  }
  function savolYoz(sarlavha, matn) {
    savolEl.innerHTML = '';
    if (sarlavha) {
      var b = document.createElement('b');
      b.textContent = sarlavha;
      savolEl.appendChild(b);
    }
    savolEl.appendChild(document.createTextNode(matn || ''));
  }

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

  function keyingi() {
    if (!navbat.length) { yakunla(); return; }
    joriy = navbat.shift();
    bloklangan = true;
    hammasiniBoshat();

    var chalg = aralash(joriy.chalgituvchi).slice(0, UYA_SONI - 1);
    var kalitlar = aralash([joriy.javob].concat(chalg));
    joriyJavobIdx = kalitlar.indexOf(joriy.javob);

    turEl.textContent = joriy.tur;
    savolYoz('Baxshi so‘raydi', joriy.savol);
    xabar('To‘g‘ri buyumni bosing');

    kalitlar.forEach(function (k, i) {
      var uya = uyalar[i];
      var model = buyumTayyorla(k, 1.34);
      if (!model) return;
      soyaBer(model);
      uya.model = model;
      uya.kalit = k;
      uya.buyumUya.add(model);
      uya.buyumUya.rotation.y = 0;
      uya.aylanma = Math.random() * Math.PI * 2;

      var bazaY = LAGAN_BALAND;
      var kech = i * 0.09;
      var dav = 0.55 + kech;
      uya.buyumUya.position.y = bazaY - 0.7;
      uya.buyumUya.scale.setScalar(0.01);
      (function (U, y0, kechikish, davomiylik) {
        tven(davomiylik, function (p) {
          var o = Math.max(0, (p * davomiylik - kechikish) / 0.55);
          if (o <= 0) return;
          var e = sakrash(Math.min(1, o));
          U.buyumUya.position.y = y0 - 0.7 + 0.7 * Math.min(1, e);
          U.buyumUya.scale.setScalar(Math.max(0.01, Math.min(1, e)));
        }, function () {
          U.buyumUya.position.y = y0;
          U.buyumUya.scale.setScalar(1);
        });
      })(uya, bazaY, kech, dav);
    });

    kutish(0.75, function () { bloklangan = false; });
  }

  /* ---------- Bosish ---------- */
  var nur = new THREE.Raycaster();
  var nuqta = new THREE.Vector2();

  function bosildi(e) {
    if (!boshlandi || tugadi || bloklangan || !joriy) return;
    var r = canvas.getBoundingClientRect();
    nuqta.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    nuqta.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    nur.setFromCamera(nuqta, kamera);
    var nishonlar = uyalar.map(function (x) { return x.guruh; });
    var kes = nur.intersectObjects(nishonlar, true);
    if (!kes.length) return;
    var o = kes[0].object;
    while (o.parent && nishonlar.indexOf(o) === -1) o = o.parent;
    var idx = nishonlar.indexOf(o);
    if (idx === -1) return;
    javobBerildi(idx);
  }
  canvas.addEventListener('pointerdown', bosildi);

  function kotar(uya, balandlik, dav) {
    var y0 = uya.buyumUya.position.y;
    var y1 = LAGAN_BALAND + balandlik;
    tven(dav, function (p) { uya.buyumUya.position.y = y0 + (y1 - y0) * yumshoq(p); }, null);
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
      // Baxshi mamnun bo‘lib boshini qimirlatadi
      if (baxshiObj) {
        var r0 = baxshiObj.rotation.x;
        tven(0.6, function (p) {
          baxshiObj.rotation.x = r0 + Math.sin(p * Math.PI * 2) * 0.09;
        }, function () { baxshiObj.rotation.x = r0; });
      }
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
      uyalar.forEach(function (uya) {
        if (!uya.model) return;
        var y0 = uya.buyumUya.position.y;
        var k0 = uya.buyumUya.scale.x;
        tven(0.34, function (p) {
          var e = yumshoq(p);
          uya.buyumUya.position.y = y0 - 0.35 * e;
          uya.buyumUya.scale.setScalar(Math.max(0.01, k0 * (1 - e)));
        }, null);
      });
      kutish(0.45, keyingi);
    });
  }

  /* =======================================================================
     12. BOSHLASH · YAKUN
     ======================================================================= */
  function pardaKorsat(sarlavha, matn, foiz, tugmaMatn, ish) {
    pardaYop();
    pardaDiv = document.createElement('div');
    pardaDiv.className = 'o3b-parda';
    pardaDiv.innerHTML =
      '<h4>' + sarlavha + '</h4>' +
      (foiz === null ? '' : '<div class="o3b-foiz">' + foiz + '%</div>') +
      '<p>' + matn + '</p>' +
      '<button type="button" class="o3b-ich">' + tugmaMatn + '</button>';
    sahnaDiv.appendChild(pardaDiv);
    pardaDiv.querySelector('.o3b-ich').addEventListener('click', ish);
  }
  function pardaYop() { if (pardaDiv) { pardaDiv.remove(); pardaDiv = null; } }

  function boshla() {
    pardaYop();
    tvenlar.length = 0;
    hammasiniBoshat();
    uyalar.forEach(function (x) { x.guruh.position.x = x.bazaX; });
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
    turEl.textContent = 'Yakun';
    savolEl.textContent = '';
    xabar('');
    var baho = foiz >= 80
      ? 'Barakalla! «Alpomish» va dostonchilik san’atini yaxshi bilasiz.'
      : foiz >= 50
        ? 'Yaxshi urinish. Barchinning to‘rt shartini yana bir bor eslang.'
        : 'Hozircha qiyin bo‘ldi. 6-modul matnini o‘qib, yana urinib ko‘ring.';
    pardaKorsat('Baxshi majlisi tugadi',
      JAMI + ' ta savoldan ' + ball + ' tasiga to‘g‘ri javob berdingiz. ' + baho,
      foiz, '↻ Qaytadan tinglash', boshla);

    try {
      if (window.Xotira && window.Xotira.modulYoz) {
        window.Xotira.modulYoz(MODUL, { oyin3d: foiz });
      }
    } catch (e) {}
  }

  boshlaTg.addEventListener('click', boshla);
  qaytaTg.addEventListener('click', boshla);

  pardaKorsat('Baxshi majlisi',
    'Gulxan atrofida baxshi «Alpomish» dostonidan kuylaydi. ' +
    'Har savolda oldingizdagi laganlarga dostondagi buyumlar ko‘tariladi — ' +
    'baxshi so‘ragan buyumni bosing.',
    null, '▶ Dostonni boshlash', boshla);

  /* =======================================================================
     13. O‘LCHAM · RENDER
     ======================================================================= */
  function olchamla() {
    var w = Math.round(idish.clientWidth || sahnaDiv.clientWidth || 640);
    if (w < 220) w = 220;
    var h = Math.min(540, Math.round(w * 0.63));
    if (h < 330) h = 330;
    renderer.setSize(w, h, false);
    kamera.aspect = w / h;
    kamera.updateProjectionMatrix();

    var tor = w < 560;
    sahnaDiv.classList.toggle('o3b-tor', tor);

    var siqish = tor ? 0.78 : 1;
    uyalar.forEach(function (uya, i) {
      uya.bazaX = (i - (UYA_SONI - 1) / 2) * ORALIQ * siqish;
      uya.guruh.position.x = uya.bazaX;
      uya.guruh.scale.setScalar(siqish < 1 ? 0.92 : 1);
    });

    var yarimKenglik = (UYA_SONI - 1) / 2 * ORALIQ * siqish + 1.15;
    var yarimV = (kamera.fov / 2) * Math.PI / 180;
    var yarimH = Math.atan(Math.tan(yarimV) * kamera.aspect);
    var masofa = yarimKenglik / Math.tan(yarimH) * 1.06;
    kamera.position.set(0, 3.05, Math.max(5.9, masofa + 2.5));
    kamera.lookAt(0, 1.15, -0.55);
    render();
  }

  var oxirgiVaqt = 0, ramka = 0, yuribdi = false, korinmoqda = false, umr = 0;

  function yangila(dt) {
    umr += dt;
    tvenYangila(dt);

    // Gulxan lipillashi — alanga konuslari va nur kuchi
    if (!kamHarakat) {
      var lip = 0.82 + Math.sin(umr * 9.1) * 0.11 + Math.sin(umr * 21.3) * 0.06;
      alanga.intensity = 2.2 + lip * 0.9;
      olovQismlari.forEach(function (ol, i) {
        var s = 0.88 + Math.sin(umr * (7 + i * 2.3) + i) * 0.13;
        ol.scale.set(s, 0.9 + lip * 0.24, s);
      });
      // Tinglovchilar sekin tebranadi
      tinglovchilar.forEach(function (t) {
        t.obj.rotation.z = Math.sin(umr * 1.15 + t.faza) * 0.028;
      });
      // Baxshi doston aytayotgandek yengil tebranadi
      if (baxshiObj) baxshiObj.rotation.z = Math.sin(umr * 1.5) * 0.035;
      if (baxshiQol) baxshiQol.rotation.x = Math.sin(umr * 5.2) * 0.16;

      // Buyumlar sekin aylanadi
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
    kuzatKorinish = new IntersectionObserver(function (yz) {
      korinmoqda = yz[0].isIntersecting;
      holatniQara();
    }, { threshold: 0.05 });
    kuzatKorinish.observe(sahnaDiv);
  } else {
    korinmoqda = true;
  }
  document.addEventListener('visibilitychange', holatniQara);

  /* =======================================================================
     14. TOZALASH
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
     15. ISHGA TUSHIRISH
     ======================================================================= */
  olchamla();
  tabloYangila();
  holatniQara();
  render();
})();
