/* =========================================================
   «TARBIYA BOG‘I» — HAQIQIY 3D O‘YIN (Three.js · WebGL)
   4-modul: Xalq pedagogikasida yoshlarni tarbiyalashning
   metod, usul va vositalari.

   Bog‘ o‘rtasidagi tepalikda yosh NIHOL — bola timsoli. Uning
   atrofida yarim doira bo‘ylab to‘rtta TARBIYA SUPASI turadi:
   Aqliy, Axloqiy, Jismoniy va Mehnat tarbiyasi. Har bir supa —
   ikkita o‘yma ustun, ravoq va naqshli yorliq lavhasi.

   Sahna oldida bitta buyum aylanib turadi. O‘yinchi uni o‘z
   supasiga bosadi: to‘g‘ri bo‘lsa buyum yoy chizib supaga uchadi,
   supa yorishadi va NIHOL BIR POG‘ONA O‘SADI. Xato bo‘lsa supa
   qizil chaqnaydi va niholdan bitta barg to‘kiladi.

   O‘yin DARHOL qurilmaydi — avval «▶ 3D o‘yinni boshlash»
   tugmasi ko‘rinadi, sahna faqat tugma bosilganda quriladi.

   Bu fayl mustaqil: o‘z HTML karkasini, o‘z uslublarini va
   butun 3D sahnasini o‘zi quradi. Boshqa fayllarga tegmaydi.
   ========================================================= */
import * as THREE from '../vendor/three.module.min.js';
import {
  kitobYasa, nonYasa, dasturxonYasa, choynakYasa, ketmonYasa, oroqYasa,
  davotQalamYasa, rahleYasa, kurashBelbogYasa, kamonYasa, arqonYasa,
  savatYasa, niholYasa, ravoqYasa
} from './model-tarbiya.js';

(function () {
  'use strict';

  /* =========================================================
     0. IDISH
     ========================================================= */
  var idish = document.getElementById('oyin3d-tarbiya');
  if (!idish) return;
  if (idish.dataset.o3trBand) return;
  idish.dataset.o3trBand = '1';

  /* =========================================================
     1. USLUBLAR — faqat shu o‘yinga tegishli (`o3tr-` prefiksi)
     ========================================================= */
  if (!document.getElementById('o3tr-uslub')) {
    var uslub = document.createElement('style');
    uslub.id = 'o3tr-uslub';
    uslub.textContent = [
      '.o3tr-kirish{position:relative;width:100%;box-sizing:border-box;border-radius:18px;',
      '  padding:34px 22px;text-align:center;color:#22301F;',
      '  background:radial-gradient(120% 110% at 50% 0%,#E6F1DA 0%,#CFE3C6 55%,#B9D6B0 100%);',
      '  box-shadow:0 2px 4px rgba(26,22,20,.08),0 12px 28px rgba(26,22,20,.14);}',
      '.o3tr-kirish .o3tr-nishon{display:block;font-size:2.6rem;line-height:1;margin-bottom:10px;}',
      '.o3tr-kirish h4{margin:0 0 8px;font-size:1.18rem;color:#1B3B6F;}',
      '.o3tr-kirish p{margin:0 auto 16px;max-width:44ch;font-size:.92rem;line-height:1.5;color:#3A4A38;}',
      '.o3tr-boshla{cursor:pointer;padding:12px 26px;border:0;border-radius:999px;',
      '  background:#1B3B6F;color:#FBF7F0;font:inherit;font-size:1rem;font-weight:700;',
      '  box-shadow:0 4px 14px rgba(27,59,111,.35);transition:transform .15s ease,box-shadow .15s ease;',
      '  touch-action:manipulation;}',
      '.o3tr-boshla:hover{transform:translateY(-2px);box-shadow:0 7px 18px rgba(27,59,111,.4);}',
      '.o3tr-boshla:active{transform:translateY(1px);}',
      '.o3tr-boshla[disabled]{opacity:.6;cursor:progress;}',

      '.o3tr-sahna{position:relative;width:100%;border-radius:18px;overflow:hidden;',
      '  background:#D8E8CE;box-shadow:0 2px 4px rgba(26,22,20,.08),0 12px 28px rgba(26,22,20,.14);}',
      '.o3tr-sahna canvas{display:block;width:100%;height:auto;touch-action:manipulation;}',
      '.o3tr-ust{position:absolute;inset:0;pointer-events:none;font:inherit;}',
      '.o3tr-qator{position:absolute;top:11px;left:11px;right:11px;display:flex;',
      '  align-items:flex-start;justify-content:space-between;gap:8px;flex-wrap:wrap;}',
      '.o3tr-tabl{flex:0 0 auto;display:inline-flex;gap:6px;align-items:baseline;',
      '  padding:7px 14px;border-radius:999px;background:rgba(251,247,240,.93);color:#1B3B6F;',
      '  font-size:.84rem;font-weight:600;letter-spacing:.01em;white-space:nowrap;',
      '  box-shadow:0 2px 8px rgba(26,22,20,.18);}',
      '.o3tr-tabl b{font-size:1.02rem;color:#C1502E;}',
      '.o3tr-nom{flex:0 1 auto;order:0;min-width:0;',
      '  padding:8px 18px;border-radius:999px;background:rgba(47,107,69,.94);color:#FBF7F0;',
      '  font-size:1rem;font-weight:700;line-height:1.25;text-align:center;',
      '  box-shadow:0 4px 14px rgba(26,22,20,.28);}',
      '.o3tr-past{position:absolute;left:12px;right:12px;bottom:12px;display:flex;',
      '  flex-direction:column;align-items:center;gap:6px;}',
      '.o3tr-osish{background:rgba(47,107,69,.92);color:#EAF6E4;}',
      '.o3tr-osish b{color:#F2D48A;}',
      '.o3tr-xabar{display:inline-block;margin:0;max-width:100%;padding:7px 16px;',
      '  border-radius:999px;background:rgba(26,40,30,.62);color:#FBF7F0;',
      '  font-size:.85rem;font-weight:600;line-height:1.35;}',
      '.o3tr-xabar:empty{display:none;}',
      '.o3tr-xabar.togri{background:rgba(31,84,52,.88);color:#DFF6E4;}',
      '.o3tr-xabar.xato{background:rgba(150,52,26,.88);color:#FFE2D6;}',
      '.o3tr-natija{position:absolute;inset:0;display:flex;flex-direction:column;',
      '  align-items:center;justify-content:center;gap:9px;text-align:center;padding:20px;',
      '  background:rgba(27,59,111,.92);color:#FBF7F0;}',
      '.o3tr-natija h4{margin:0;font-size:1.25rem;}',
      '.o3tr-natija .o3tr-foiz{font-size:2.4rem;font-weight:800;color:#D4A24C;line-height:1;}',
      '.o3tr-natija p{margin:0;font-size:.92rem;max-width:36ch;line-height:1.45;}',
      '.o3tr-natija .o3tr-masal{font-style:italic;color:#E9DCC0;}',
      '.o3tr-qayta{pointer-events:auto;cursor:pointer;margin-top:6px;padding:10px 22px;',
      '  border:0;border-radius:999px;background:#D4A24C;color:#2A1B08;',
      '  font:inherit;font-size:.95rem;font-weight:700;touch-action:manipulation;',
      '  box-shadow:0 4px 12px rgba(26,22,20,.3);transition:transform .15s ease;}',
      '.o3tr-qayta:hover{transform:translateY(-2px);} .o3tr-qayta:active{transform:translateY(1px);}',
      '.o3tr-xato{margin:0;padding:22px;border-radius:16px;background:#FBF7F0;color:#1B3B6F;',
      '  text-align:center;font-weight:600;}',

      '.o3tr-tor .o3tr-qator{top:7px;left:7px;right:7px;gap:5px;}',
      '.o3tr-tor .o3tr-tabl{padding:4px 9px;font-size:.7rem;gap:4px;}',
      '.o3tr-tor .o3tr-tabl b{font-size:.82rem;}',
      '.o3tr-tor .o3tr-nom{padding:5px 11px;font-size:.8rem;}',
      '.o3tr-tor .o3tr-past{left:7px;right:7px;bottom:8px;gap:4px;}',
      '.o3tr-tor .o3tr-xabar{padding:5px 11px;font-size:.72rem;}',
      '.o3tr-tor .o3tr-natija{gap:6px;padding:14px;}',
      '.o3tr-tor .o3tr-natija .o3tr-foiz{font-size:1.9rem;}',
      '.o3tr-tor .o3tr-natija h4{font-size:1.05rem;}',
      '.o3tr-tor .o3tr-natija p{font-size:.78rem;}',
      '@media (prefers-reduced-motion: reduce){',
      '  .o3tr-boshla,.o3tr-qayta{transition:none;}}'
    ].join('\n');
    document.head.appendChild(uslub);
  }

  /* =========================================================
     2. WEBGL BORMI?
     ========================================================= */
  function webglBor() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }
  function xatoXabari(matn) {
    var p = document.createElement('p');
    p.className = 'o3tr-xato';
    p.textContent = matn;
    idish.appendChild(p);
  }
  if (!webglBor()) {
    xatoXabari('Brauzeringiz 3D grafikani qo‘llab-quvvatlamaydi. ' +
      'O‘yinsiz ham modul matni va testlar to‘liq ishlaydi.');
    return;
  }

  /* Harakatni kamaytirish rejimi */
  var kamHarakat = !!(window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var tezlik = kamHarakat ? 0.45 : 1;

  /* =========================================================
     3. BOSHLASH TUGMASI — sahna faqat bosilganda quriladi
     ========================================================= */
  var kirish = null;
  var tugma = idish.querySelector('.o3tr-boshla');

  if (!tugma) {
    kirish = document.createElement('div');
    kirish.className = 'o3tr-kirish';
    kirish.innerHTML =
      '<span class="o3tr-nishon" aria-hidden="true">🌳</span>' +
      '<h4>Tarbiya bog‘i — 3D o‘yin</h4>' +
      '<p>Bog‘ o‘rtasidagi nihol — bola timsoli. Har bir buyumni o‘z tarbiya ' +
      'supasiga joylang: to‘g‘ri javob bersangiz, nihol bir pog‘ona o‘sadi.</p>' +
      '<button type="button" class="o3tr-boshla">▶ 3D o‘yinni boshlash</button>';
    idish.appendChild(kirish);
    tugma = kirish.querySelector('.o3tr-boshla');
  } else {
    kirish = tugma.parentNode === idish ? tugma : tugma.closest('.o3tr-kirish') || tugma;
  }

  var qurildi = false;
  function boshlashniBos() {
    if (qurildi) return;
    qurildi = true;
    tugma.disabled = true;
    tugma.textContent = 'Bog‘ tayyorlanmoqda…';
    /* Bir ramka kutamiz — tugma matni yangilanib ulgursin */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (kirish && kirish.parentNode) kirish.parentNode.removeChild(kirish);
        else if (tugma.parentNode) tugma.parentNode.removeChild(tugma);
        try {
          qur();
        } catch (e) {
          xatoXabari('3D sahnani ochib bo‘lmadi. Sahifani yangilab ko‘ring.');
        }
      });
    });
  }
  tugma.addEventListener('click', boshlashniBos);

  /* =========================================================
     4. SAHNANI QURISH (lazy)
     ========================================================= */
  function qur() {

    /* ---------- 4.1 HTML karkas ---------- */
    var sahnaDiv = document.createElement('div');
    sahnaDiv.className = 'o3tr-sahna';
    sahnaDiv.innerHTML =
      '<canvas></canvas>' +
      '<div class="o3tr-ust">' +
        '<div class="o3tr-qator">' +
          '<span class="o3tr-tabl">Ball <b class="o3tr-ball">0</b></span>' +
          '<span class="o3tr-nom">Tayyorlanmoqda…</span>' +
          '<span class="o3tr-tabl">Qoldi <b class="o3tr-qoldi">12</b></span>' +
        '</div>' +
        '<div class="o3tr-past">' +
          '<span class="o3tr-tabl o3tr-osish">🌱 Nihol: <b class="o3tr-pogona">0</b>/12</span>' +
          '<p class="o3tr-xabar" role="status">Buyumni to‘g‘ri tarbiya supasiga bosing</p>' +
        '</div>' +
      '</div>';
    idish.appendChild(sahnaDiv);

    var canvas    = sahnaDiv.querySelector('canvas');
    var ballEl    = sahnaDiv.querySelector('.o3tr-ball');
    var qoldiEl   = sahnaDiv.querySelector('.o3tr-qoldi');
    var nomEl     = sahnaDiv.querySelector('.o3tr-nom');
    var pogonaEl  = sahnaDiv.querySelector('.o3tr-pogona');
    var xabarEl   = sahnaDiv.querySelector('.o3tr-xabar');

    /* ---------- 4.2 Ma’lumot ---------- */
    var SUPA = [
      { nom: 'Aqliy tarbiya',   rang: 0x1B3B6F, yorliq: '#1B3B6F' },
      { nom: 'Axloqiy tarbiya', rang: 0xC1502E, yorliq: '#8E3418' },
      { nom: 'Jismoniy tarbiya',rang: 0x2F6B45, yorliq: '#1E4A2E' },
      { nom: 'Mehnat tarbiyasi',rang: 0x8A5A34, yorliq: '#5C3A20' }
    ];

    var BUYUM = [
      /* Aqliy tarbiya */
      { nom: 'Kitob',              s: 0, yasa: function () { return kitobYasa(true); }, o: 1.00,
        izoh: 'Bilim manbai — aqliy tarbiyaning asosi.' },
      { nom: 'Davot va qamish qalam', s: 0, yasa: davotQalamYasa, o: 1.05,
        izoh: 'Maktabdorlikda xat-savod shu bilan o‘rgatilgan.' },
      { nom: 'Rahle (lavh)',       s: 0, yasa: rahleYasa,        o: 1.10,
        izoh: 'Kitob qo‘yiladigan o‘yma taglik — ilmga hurmat.' },
      /* Axloqiy tarbiya */
      { nom: 'Non',                s: 1, yasa: nonYasa,          o: 1.20,
        izoh: 'Nonni e’zozlash — axloq darsining birinchisi.' },
      { nom: 'Dasturxon',          s: 1, yasa: dasturxonYasa,    o: 1.05,
        izoh: 'Dasturxon odobi — muomala madaniyati o‘lchovi.' },
      { nom: 'Choynak',            s: 1, yasa: choynakYasa,      o: 1.10,
        izoh: 'Choy uzatish — mehmondo‘stlik va hurmat namunasi.' },
      /* Jismoniy tarbiya */
      { nom: 'Kurash belbog‘i',    s: 2, yasa: kurashBelbogYasa, o: 1.05,
        izoh: 'Milliy kurash — chiniqish va mardlik maktabi.' },
      { nom: 'Kamon va o‘q',       s: 2, yasa: kamonYasa,        o: 1.00,
        izoh: 'Merganlik mashqi chaqqonlik va diqqatni o‘stirgan.' },
      { nom: 'Arqon',              s: 2, yasa: arqonYasa,        o: 1.05,
        izoh: 'Arqon tortish o‘yini kuch va jamoaviylikni sinagan.' },
      /* Mehnat tarbiyasi */
      { nom: 'Ketmon',             s: 3, yasa: ketmonYasa,       o: 1.05,
        izoh: '«Mehnat bilan el ko‘karar» — dehqonchilik quroli.' },
      { nom: 'O‘roq',              s: 3, yasa: oroqYasa,         o: 1.10,
        izoh: 'Hosil yig‘im-terimi bolani mehnatga o‘rgatgan.' },
      { nom: 'Meva savati',        s: 3, yasa: savatYasa,        o: 1.10,
        izoh: '«Barvaqt qilingan harakat, hosilga berar barakat».' }
    ];
    var JAMI = BUYUM.length;          // 12

    /* ---------- 4.3 Renderer · sahna · kamera ---------- */
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas, antialias: true, alpha: false, powerPreference: 'high-performance'
      });
    } catch (e) {
      sahnaDiv.remove();
      xatoXabari('Brauzeringiz 3D ni qo‘llab-quvvatlamaydi.');
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.06;

    var sahna = new THREE.Scene();
    sahna.fog = new THREE.Fog(0xD6E7CE, 26, 62);

    var kamera = new THREE.PerspectiveCamera(44, 16 / 10, 0.1, 140);
    var QARASH = new THREE.Vector3(0, 2.3, -0.6);
    kamera.position.set(0, 7.0, 12.6);
    kamera.lookAt(QARASH);

    /* Yorug‘lik: yumshoq osmon nuri + soya beruvchi quyosh */
    sahna.add(new THREE.HemisphereLight(0xCFE6F7, 0x76914F, 1.12));

    var quyosh = new THREE.DirectionalLight(0xFFF3DE, 2.30);
    quyosh.position.set(7.5, 13, 9);
    quyosh.castShadow = true;
    quyosh.shadow.mapSize.set(1024, 1024);
    quyosh.shadow.camera.near = 1;
    quyosh.shadow.camera.far = 40;
    quyosh.shadow.camera.left = -13;
    quyosh.shadow.camera.right = 13;
    quyosh.shadow.camera.top = 11;
    quyosh.shadow.camera.bottom = -8;
    quyosh.shadow.bias = -0.0012;
    quyosh.shadow.normalBias = 0.02;
    sahna.add(quyosh);
    sahna.add(quyosh.target);
    quyosh.target.position.set(0, 1.2, -4);

    /* ---------- 4.4 Osmon gumbazi va yer ---------- */
    function osmonToqima() {
      var c = document.createElement('canvas');
      c.width = 4; c.height = 256;
      var k = c.getContext('2d');
      var gr = k.createLinearGradient(0, 0, 0, 256);
      gr.addColorStop(0.00, '#6CA9E0');
      gr.addColorStop(0.40, '#A8D2ED');
      gr.addColorStop(0.72, '#DCEAD8');
      gr.addColorStop(1.00, '#D6E7CE');
      k.fillStyle = gr; k.fillRect(0, 0, 4, 256);
      var t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }
    var osmon = new THREE.Mesh(
      new THREE.SphereGeometry(62, 24, 16),
      new THREE.MeshBasicMaterial({
        map: osmonToqima(), side: THREE.BackSide, fog: false, depthWrite: false
      })
    );
    sahna.add(osmon);

    var maysa = new THREE.Mesh(
      new THREE.CircleGeometry(44, 48),
      new THREE.MeshStandardMaterial({ color: 0x74A551, roughness: 0.99 })
    );
    maysa.rotation.x = -Math.PI / 2;
    maysa.receiveShadow = true;
    sahna.add(maysa);

    /* So‘qmoq — oldindan tepalikka olib boradi */
    var soqmoq = new THREE.Mesh(
      new THREE.PlaneGeometry(2.0, 16),
      new THREE.MeshStandardMaterial({ color: 0xC7B489, roughness: 0.98 })
    );
    soqmoq.rotation.x = -Math.PI / 2;
    soqmoq.position.set(0, 0.012, 0.4);
    soqmoq.receiveShadow = true;
    sahna.add(soqmoq);

    /* ---------- 4.5 Tepalik va nihol ---------- */
    var TEPA = new THREE.Vector3(0, 0, -7.4);
    var TEPA_H = 1.55;
    var NIHOL_OLCHAM = 2.20;

    var tepalik = new THREE.Mesh(
      new THREE.SphereGeometry(3.20, 32, 18, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x7FAF58, roughness: 0.98 })
    );
    tepalik.scale.y = TEPA_H / 3.20;
    tepalik.position.copy(TEPA);
    tepalik.receiveShadow = true;
    tepalik.castShadow = true;
    sahna.add(tepalik);

    /* Tepalik tepasidagi ishlangan tuproq va tosh jiyak */
    var tuproq = new THREE.Mesh(
      new THREE.CircleGeometry(1.15, 28),
      new THREE.MeshStandardMaterial({ color: 0x6B4E31, roughness: 0.99 })
    );
    tuproq.rotation.x = -Math.PI / 2;
    tuproq.position.set(TEPA.x, TEPA_H + 0.012, TEPA.z);
    tuproq.receiveShadow = true;
    sahna.add(tuproq);

    var jiyakGeo = new THREE.SphereGeometry(0.13, 8, 6);
    var jiyakMat = new THREE.MeshStandardMaterial({ color: 0xC9BFA6, roughness: 0.95 });
    for (var ji = 0; ji < 16; ji++) {
      var ja = (ji / 16) * Math.PI * 2;
      var tosh = new THREE.Mesh(jiyakGeo, jiyakMat);
      tosh.position.set(
        TEPA.x + Math.cos(ja) * 1.18, TEPA_H + 0.03, TEPA.z + Math.sin(ja) * 1.18);
      tosh.scale.set(1, 0.62, 1);
      tosh.castShadow = true; tosh.receiveShadow = true;
      sahna.add(tosh);
    }

    /* Nihol o‘sish halqasi (to‘g‘ri javobda chaqnaydi) */
    var halqaMat = new THREE.MeshBasicMaterial({
      color: 0xFFE7A0, transparent: true, opacity: 0, depthWrite: false, fog: false
    });
    var osishHalqa = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.07, 8, 36), halqaMat);
    osishHalqa.rotation.x = -Math.PI / 2;
    osishHalqa.position.set(TEPA.x, TEPA_H + 0.06, TEPA.z);
    osishHalqa.visible = false;
    sahna.add(osishHalqa);

    var nihol = null;
    var pogona = 0;

    function niholQoy(p, jonlantir) {
      var yangi = niholYasa(p);
      yangi.traverse(function (o) {
        if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; }
      });
      yangi.position.set(TEPA.x, TEPA_H, TEPA.z);
      yangi.scale.setScalar(NIHOL_OLCHAM);
      sahna.add(yangi);

      if (nihol) yoq(nihol);
      nihol = yangi;

      if (jonlantir) {
        tven(0.55, function (v) {
          var s = orqaChiqish(v);
          yangi.scale.setScalar(NIHOL_OLCHAM * (0.80 + 0.20 * s));
        }, function () { yangi.scale.setScalar(NIHOL_OLCHAM); });

        osishHalqa.visible = true;
        tven(0.7, function (v) {
          halqaMat.opacity = (1 - v) * 0.75;
          osishHalqa.scale.setScalar(0.5 + v * 1.9);
        }, function () {
          halqaMat.opacity = 0;
          osishHalqa.visible = false;
          osishHalqa.scale.setScalar(1);
        });
      }
    }

    /* Xato javobda niholdan bitta barg to‘kiladi */
    function bargTok() {
      if (!nihol) return;
      var barglar = [];
      nihol.traverse(function (o) {
        if (o.isMesh && o.userData && o.userData.barg) barglar.push(o);
      });
      if (!barglar.length) return;

      var b = barglar[Math.floor(Math.random() * barglar.length)];
      var joy = new THREE.Vector3(), burilish = new THREE.Quaternion(), olcham = new THREE.Vector3();
      b.getWorldPosition(joy);
      b.getWorldQuaternion(burilish);
      b.getWorldScale(olcham);

      /* Daraxt bilan umumiy geometriyani ulashmasin — nusxa olamiz */
      var tushgan = new THREE.Mesh(b.geometry.clone(), b.material.clone());
      tushgan.position.copy(joy);
      tushgan.quaternion.copy(burilish);
      tushgan.scale.copy(olcham);
      tushgan.castShadow = true;
      sahna.add(tushgan);
      if (b.parent) b.parent.remove(b);

      var y0 = joy.y;
      tven(1.5, function (v) {
        tushgan.position.y = y0 + (0.06 - y0) * v;
        tushgan.position.x = joy.x + Math.sin(v * 7.5) * 0.42 * (1 - v * 0.35);
        tushgan.position.z = joy.z + Math.cos(v * 5.0) * 0.24;
        tushgan.rotation.z += 0.07;
        tushgan.rotation.x += 0.045;
      }, function () {
        sahna.remove(tushgan);
        tushgan.geometry.dispose();
        tushgan.material.dispose();
      });
    }

    /* ---------- 4.6 Bezak: daraxtlar, butalar ---------- */
    var tanaMat = new THREE.MeshStandardMaterial({ color: 0x6B4526, roughness: 0.9 });
    var bargMat = new THREE.MeshStandardMaterial({ color: 0x2F6B45, roughness: 0.85 });
    var butaMat = new THREE.MeshStandardMaterial({ color: 0x46905A, roughness: 0.9 });
    var tanaGeo = new THREE.CylinderGeometry(0.14, 0.22, 1.5, 6);
    var tojGeo  = new THREE.SphereGeometry(1.0, 10, 8);
    var butaGeo = new THREE.SphereGeometry(0.55, 12, 9);

    function daraxt(x, z, o) {
      var d = new THREE.Group();
      var t = new THREE.Mesh(tanaGeo, tanaMat);
      t.position.y = 0.75; t.castShadow = true; d.add(t);
      for (var i = 0; i < 3; i++) {
        var toj = new THREE.Mesh(tojGeo, bargMat);
        toj.position.set((i - 1) * 0.45, 1.85 + (i === 1 ? 0.42 : 0), (i - 1) * 0.28);
        toj.scale.setScalar(i === 1 ? 0.92 : 0.72);
        toj.castShadow = true;
        d.add(toj);
      }
      d.position.set(x, 0, z);
      d.scale.setScalar(o);
      sahna.add(d);
    }
    daraxt(-10.4, -8.2, 1.15);
    daraxt(10.8, -9.0, 1.05);
    daraxt(-7.6, -12.0, 0.92);
    daraxt(6.6, -12.6, 0.86);
    daraxt(-12.6, -3.4, 0.95);
    daraxt(12.4, -4.2, 0.9);

    function buta(x, z, o) {
      var b = new THREE.Mesh(butaGeo, butaMat);
      b.position.set(x, 0.33 * o, z);
      b.scale.set(o, o * 0.74, o);
      b.castShadow = true; b.receiveShadow = true;
      sahna.add(b);
    }
    buta(-8.0, -6.0, 1.0);  buta(-6.7, -7.1, 0.72);
    buta(8.2, -6.4, 1.05);  buta(7.0, -7.5, 0.78);
    buta(-3.4, -8.4, 0.9);  buta(3.6, -8.8, 0.94);
    buta(0.8, -12.1, 0.68);  buta(-9.4, 0.6, 0.8);
    buta(9.6, 0.2, 0.85);

    /* ---------- 4.7 Yorliq lavhasi (CanvasTexture + girih) ---------- */
    function girihYulduz(k, cx, cy, r, rang) {
      k.save();
      k.translate(cx, cy);
      k.strokeStyle = rang;
      k.lineWidth = 3.4;
      for (var s = 0; s < 2; s++) {
        k.save();
        k.rotate(s * Math.PI / 4);
        k.beginPath();
        for (var i = 0; i < 4; i++) {
          var a = i * Math.PI / 2 + Math.PI / 4;
          var x = Math.cos(a) * r, y = Math.sin(a) * r;
          if (i === 0) k.moveTo(x, y); else k.lineTo(x, y);
        }
        k.closePath();
        k.stroke();
        k.restore();
      }
      k.beginPath();
      k.arc(0, 0, r * 0.36, 0, Math.PI * 2);
      k.stroke();
      k.restore();
    }

    function yorliqToqima(nom, rangHex) {
      var c = document.createElement('canvas');
      c.width = 512; c.height = 176;
      var k = c.getContext('2d');

      var gr = k.createLinearGradient(0, 0, 0, 176);
      gr.addColorStop(0, '#FDFAF1');
      gr.addColorStop(1, '#EDE1C8');
      k.fillStyle = gr;
      k.fillRect(0, 0, 512, 176);

      k.strokeStyle = rangHex;
      k.lineWidth = 11;
      k.strokeRect(6, 6, 500, 164);
      k.lineWidth = 3;
      k.strokeRect(21, 21, 470, 134);

      /* Chetlardagi girih yulduzlari */
      girihYulduz(k, 50, 88, 24, rangHex);
      girihYulduz(k, 462, 88, 24, rangHex);

      /* Yuqori va quyi romb tasmasi */
      k.strokeStyle = rangHex;
      k.lineWidth = 2;
      for (var i = 0; i < 12; i++) {
        var x = 92 + i * 30;
        [32, 144].forEach(function (y) {
          k.beginPath();
          k.moveTo(x, y - 7); k.lineTo(x + 9, y);
          k.lineTo(x, y + 7);  k.lineTo(x - 9, y);
          k.closePath(); k.stroke();
        });
      }

      /* Nomi — kengligiga qarab shrift kichrayadi */
      var olch = 62;
      k.fillStyle = rangHex;
      k.textAlign = 'center';
      k.textBaseline = 'middle';
      do {
        k.font = 'bold ' + olch + 'px Georgia, "Times New Roman", serif';
        olch -= 2;
      } while (k.measureText(nom).width > 356 && olch > 22);
      k.fillText(nom, 256, 90);

      var t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return t;
    }

    /* ---------- 4.8 Tarbiya supalari (yarim doira bo‘ylab) ---------- */
    var SUPA_X   = [-5.35, -2.45, 2.45, 5.35];
    var SUPA_Z   = [-2.60, -1.10, -1.10, -2.60];
    var SUPA_ROT = [0.34, 0.11, -0.11, -0.34];
    var RAVOQ_OLCHAM = 2.15;

    var supalar = [];
    var nishonlar = [];

    SUPA.forEach(function (K, i) {
      var guruh = new THREE.Group();
      guruh.position.set(SUPA_X[i], 0, SUPA_Z[i]);
      guruh.rotation.y = SUPA_ROT[i];

      var rang = new THREE.Color(K.rang);
      var toshMat = new THREE.MeshStandardMaterial({ color: 0xE2D7BE, roughness: 0.92 });
      var qirraMat = new THREE.MeshStandardMaterial({
        color: rang.clone().lerp(new THREE.Color(0xFFFFFF), 0.12), roughness: 0.6, metalness: 0.05
      });

      /* Supa poli (tokcha) */
      var pol = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.30, 1.60), toshMat);
      pol.position.y = 0.15;
      pol.castShadow = true; pol.receiveShadow = true;
      guruh.add(pol);

      /* Pol qirrasi — supaning o‘z rangi */
      var qirra = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.075, 1.67), qirraMat);
      qirra.position.y = 0.325;
      qirra.castShadow = true; qirra.receiveShadow = true;
      guruh.add(qirra);

      /* Oldingi zinapoya */
      var zina = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.16, 0.45), toshMat);
      zina.position.set(0, 0.08, 1.00);
      zina.castShadow = true; zina.receiveShadow = true;
      guruh.add(zina);

      /* Ravoq — ikki o‘yma ustun va peshtoq yoyi */
      var ravoq = ravoqYasa(K.rang);
      ravoq.scale.setScalar(RAVOQ_OLCHAM);
      ravoq.position.set(0, 0.363, -0.10);
      ravoq.traverse(function (o) {
        if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
      });
      guruh.add(ravoq);

      /* Yorliq lavhasi — ravoq ichida */
      var toqima = yorliqToqima(K.nom, K.yorliq);
      var lavhaMat = new THREE.MeshStandardMaterial({ map: toqima, roughness: 0.86 });
      var lavha = new THREE.Mesh(new THREE.PlaneGeometry(1.92, 0.63), lavhaMat);
      lavha.position.set(0, 2.52, 0.16);
      lavha.rotation.x = -0.05;
      guruh.add(lavha);

      /* Lavha ramkasi */
      var ramka = new THREE.Mesh(
        new THREE.BoxGeometry(2.02, 0.71, 0.06),
        new THREE.MeshStandardMaterial({ color: 0x6E5334, roughness: 0.85 }));
      ramka.position.set(0, 2.52, 0.12);
      ramka.rotation.x = -0.05;
      ramka.castShadow = true;
      guruh.add(ramka);

      /* Yerdagi doira — bezak va kattaroq bosish maydoni */
      var padMat = new THREE.MeshStandardMaterial({
        color: rang, roughness: 1, transparent: true, opacity: 0.22
      });
      var pad = new THREE.Mesh(new THREE.CircleGeometry(1.30, 28), padMat);
      pad.rotation.x = -Math.PI / 2;
      pad.position.set(0, 0.02, 1.25);
      guruh.add(pad);

      sahna.add(guruh);

      /* Yorish uchun barcha materiallarni yig‘amiz */
      var matlar = [];
      guruh.traverse(function (o) {
        if (!o.isMesh) return;
        o.userData.sIdx = i;
        nishonlar.push(o);
        var ro = Array.isArray(o.material) ? o.material : [o.material];
        ro.forEach(function (m) {
          if (m && m.emissive && matlar.indexOf(m) < 0) matlar.push(m);
        });
      });

      supalar.push({
        idx: i, nom: K.nom, guruh: guruh, pad: pad, matlar: matlar,
        bazaX: SUPA_X[i], joriyX: SUPA_X[i],
        orin: new THREE.Vector3()
      });
    });

    /* Supaga qo‘yiladigan nuqtani (buyum uchishi kerak bo‘lgan joy) hisoblash */
    function orinlarYangila() {
      sahna.updateMatrixWorld(true);
      supalar.forEach(function (S) {
        S.orin.set(0, 0.62, 0.12);
        S.guruh.localToWorld(S.orin);
      });
    }

    /* ---------- 4.9 Tven (oddiy animatsiya ro‘yxati) ---------- */
    var tvenlar = [];
    function tven(dav, yur, tamom) {
      tvenlar.push({ v: 0, dav: Math.max(0.05, dav * tezlik), yur: yur, tamom: tamom });
    }
    function kutish(dav, tamom) { tven(dav, function () {}, tamom); }
    function tvenYangila(dt) {
      for (var i = tvenlar.length - 1; i >= 0; i--) {
        var t = tvenlar[i];
        t.v += dt / t.dav;
        if (t.v > 1) t.v = 1;
        t.yur(t.v);
        if (t.v >= 1) { tvenlar.splice(i, 1); if (t.tamom) t.tamom(); }
      }
    }
    function yumshoq(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
    function chiqish(x) { return 1 - Math.pow(1 - x, 3); }
    function orqaChiqish(x) {
      var c1 = 1.70158, c3 = c1 + 1;
      return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    }

    /* ---------- 4.10 O‘yin holati ---------- */
    var navbat = [], joriy = null, ball = 0, urinilgan = 0;
    var bloklangan = true, tugadi = false, natijaDiv = null;
    var tushmoqda = false, kutayotganBosish = null;

    var MARKAZ = new THREE.Vector3(0, 2.10, 3.8);
    var OLCHAM = 1.55;

    function aralash(a) {
      a = a.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }
    function tabloYangila() {
      ballEl.textContent = ball;
      qoldiEl.textContent = JAMI - urinilgan;
      pogonaEl.textContent = pogona;
    }
    function xabar(matn, tur) {
      xabarEl.textContent = matn;
      xabarEl.className = 'o3tr-xabar' + (tur ? ' ' + tur : '');
    }

    /* Obyektni sahnadan olib tashlab, xotirasini bo‘shatamiz */
    function yoq(g) {
      sahna.remove(g);
      g.traverse(function (o) {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          var ro = Array.isArray(o.material) ? o.material : [o.material];
          ro.forEach(function (mat) {
            for (var k in mat) {
              var v = mat[k];
              if (v && v.isTexture) v.dispose();
            }
            mat.dispose();
          });
        }
      });
    }

    function buyumYarat(mal) {
      var g = mal.yasa();
      g.traverse(function (o) {
        if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
      });
      g.scale.setScalar(mal.o * OLCHAM);
      g.position.copy(MARKAZ);
      sahna.add(g);
      return g;
    }

    function keyingi() {
      if (!navbat.length) { yakunla(); return; }
      var mal = navbat.shift();
      var g = buyumYarat(mal);
      joriy = { mal: mal, guruh: g, olcham: mal.o * OLCHAM, vaqt: 0 };

      nomEl.textContent = mal.nom;
      xabar('Bu qaysi tarbiya supasiga tegishli? Supani bosing.');

      tushmoqda = true;
      kutayotganBosish = null;
      g.position.y = MARKAZ.y + 2.6;
      g.scale.setScalar(0.01);
      tven(0.5, function (v) {
        var p = chiqish(v);
        g.position.y = MARKAZ.y + 2.6 * (1 - p);
        g.scale.setScalar(mal.o * OLCHAM * (0.3 + 0.7 * p));
      }, function () {
        g.position.y = MARKAZ.y;
        g.scale.setScalar(mal.o * OLCHAM);
        bloklangan = false;
        tushmoqda = false;
        if (kutayotganBosish != null) {
          var q = kutayotganBosish;
          kutayotganBosish = null;
          javobBer(q);
        }
      });
    }

    /* ---------- 4.11 Supa effektlari ---------- */
    var NUR = new THREE.Color(0xFFD98A);
    var QIZIL = new THREE.Color(0xE04A2A);

    function matniTozala(S) {
      S.matlar.forEach(function (m) { m.emissive.setRGB(0, 0, 0); });
      S.pad.material.opacity = 0.22;
      S.guruh.position.set(S.joriyX, 0, S.guruh.position.z);
    }

    function supaYorit(S) {
      tven(0.9, function (v) {
        var s = Math.sin(v * Math.PI);
        S.matlar.forEach(function (m) {
          m.emissive.copy(NUR).multiplyScalar(s * 0.55);
        });
        S.pad.material.opacity = 0.22 + s * 0.42;
        S.guruh.position.y = s * 0.10;
      }, function () {
        S.guruh.position.y = 0;
        matniTozala(S);
      });
    }

    function supaXato(S) {
      tven(0.8, function (v) {
        var s = Math.abs(Math.sin(v * Math.PI * 3)) * (1 - v);
        S.matlar.forEach(function (m) {
          m.emissive.copy(QIZIL).multiplyScalar(s * 0.8);
        });
        S.guruh.position.x = S.joriyX + Math.sin(v * Math.PI * 9) * 0.15 * (1 - v);
      }, function () { matniTozala(S); });
    }

    /* Buyumning chayqalishi (xato javob) */
    function buyumChayqal(g, tamom) {
      var bx = g.position.x;
      tven(0.55, function (v) {
        g.position.x = bx + Math.sin(v * Math.PI * 7) * 0.36 * (1 - v);
        g.rotation.z = Math.sin(v * Math.PI * 7) * 0.28 * (1 - v);
      }, function () {
        g.position.x = bx; g.rotation.z = 0;
        if (tamom) tamom();
      });
    }

    /* Buyumning yoy chizib supaga uchishi */
    function uchir(g, S, olcham, tamom) {
      var b = g.position.clone();
      var e = S.orin;
      var balandlik = Math.max(b.y, e.y) + 2.6;
      tven(0.85, function (v) {
        var p = yumshoq(v);
        var q = 1 - p;
        g.position.x = q * q * b.x + 2 * q * p * ((b.x + e.x) / 2) + p * p * e.x;
        g.position.z = q * q * b.z + 2 * q * p * ((b.z + e.z) / 2) + p * p * e.z;
        g.position.y = q * q * b.y + 2 * q * p * balandlik + p * p * e.y;
        g.rotation.y += 0.15;
        g.rotation.x = p * 1.1;
        g.scale.setScalar(olcham * (1 - 0.62 * p));
      }, function () {
        yoq(g);
        if (tamom) tamom();
      });
    }

    /* ---------- 4.12 Bosish (raycasting) ---------- */
    var nur = new THREE.Raycaster();
    var nuqta = new THREE.Vector2();

    function bosildi(hodisa) {
      if (tugadi || !joriy) return;
      if (bloklangan && !tushmoqda) return;
      var r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      nuqta.x = ((hodisa.clientX - r.left) / r.width) * 2 - 1;
      nuqta.y = -((hodisa.clientY - r.top) / r.height) * 2 + 1;
      nur.setFromCamera(nuqta, kamera);
      var urish = nur.intersectObjects(nishonlar, false);
      if (!urish.length) return;
      var i = urish[0].object.userData.sIdx;
      if (i == null) return;
      if (bloklangan) { kutayotganBosish = i; return; }
      javobBer(i);
    }

    function javobBer(i) {
      bloklangan = true;
      urinilgan++;
      var mal = joriy.mal, g = joriy.guruh, olcham = joriy.olcham;
      var togri = mal.s;

      if (i === togri) {
        ball++;
        pogona = Math.min(12, pogona + 1);
        tabloYangila();
        xabar('Barakalla! «' + mal.nom + '» — ' + SUPA[togri].nom + '. ' + mal.izoh, 'togri');
        supaYorit(supalar[i]);
        uchir(g, supalar[i], olcham, function () {
          joriy = null;
          niholQoy(pogona, true);
          kutish(0.45, keyingi);
        });
      } else {
        tabloYangila();
        xabar('Xato. «' + mal.nom + '» — ' + SUPA[togri].nom +
              ' supasiga tegishli. ' + mal.izoh, 'xato');
        supaXato(supalar[i]);
        bargTok();
        buyumChayqal(g, function () {
          uchir(g, supalar[togri], olcham, function () {
            joriy = null;
            supaYorit(supalar[togri]);
            kutish(0.45, keyingi);
          });
        });
      }
    }

    canvas.addEventListener('pointerdown', bosildi);

    /* ---------- 4.13 Yakun va qayta boshlash ---------- */
    function yakunla() {
      tugadi = true;
      joriy = null;
      var foiz = Math.round(ball / JAMI * 100);
      nomEl.textContent = 'O‘yin tugadi';
      xabar('');

      var baho = foiz >= 90
        ? 'Ofarin! Bog‘ingizdagi nihol mevali daraxtga aylandi.'
        : foiz >= 70
          ? 'Yaxshi natija. Yana bir urinishda daraxt to‘liq mevaga kiradi.'
          : foiz >= 45
            ? 'O‘rtacha. Aqliy, axloqiy, jismoniy va mehnat tarbiyasi ' +
              'vositalarini qaytadan ko‘rib chiqing.'
            : 'Hozircha qiyin bo‘ldi. 4-modul matnini o‘qib, yana urinib ko‘ring.';

      natijaDiv = document.createElement('div');
      natijaDiv.className = 'o3tr-natija';
      natijaDiv.innerHTML =
        '<h4>Natija</h4>' +
        '<div class="o3tr-foiz">' + foiz + '%</div>' +
        '<p>' + JAMI + ' ta buyumdan ' + ball + ' tasini to‘g‘ri joyladingiz. ' +
        'Nihol ' + pogona + '/12 pog‘onaga o‘sdi.</p>' +
        '<p>' + baho + '</p>' +
        '<p class="o3tr-masal">«Daraxtning qiyshiq o‘sgan joylarini kesib, ' +
        'parvarish qilib turilsa — to‘g‘ri o‘sadi».</p>' +
        '<button type="button" class="o3tr-qayta">↻ Qaytadan o‘ynash</button>';
      sahnaDiv.appendChild(natijaDiv);
      natijaDiv.querySelector('.o3tr-qayta').addEventListener('click', qaytaBoshla);

      try {
        if (window.Xotira && window.Xotira.modulYoz) {
          window.Xotira.modulYoz(4, { oyin3d: foiz });
        }
      } catch (e) {}
    }

    function qaytaBoshla() {
      if (natijaDiv) { natijaDiv.remove(); natijaDiv = null; }
      tvenlar.length = 0;
      supalar.forEach(function (S) {
        S.guruh.position.set(S.joriyX, 0, S.guruh.position.z);
        matniTozala(S);
      });
      halqaMat.opacity = 0;
      osishHalqa.visible = false;
      ball = 0; urinilgan = 0; pogona = 0;
      tugadi = false; bloklangan = true;
      tushmoqda = false; kutayotganBosish = null;
      niholQoy(0, false);
      navbat = aralash(BUYUM);
      tabloYangila();
      keyingi();
    }

    /* ---------- 4.14 O‘lcham · ko‘rinish · render halqasi ---------- */
    function olchamla() {
      var w = Math.round(idish.clientWidth || sahnaDiv.clientWidth || 640);
      if (w < 200) w = 200;
      var h = Math.min(540, Math.round(w * 10 / 16));
      if (h < 300) h = 300;
      renderer.setSize(w, h);
      kamera.aspect = w / h;
      kamera.updateProjectionMatrix();

      var tor = w < 560;
      sahnaDiv.classList.toggle('o3tr-tor', tor);

      /* Tor ekranda supalar qatorini siqamiz */
      var siqish = tor ? 0.74 : 1;
      supalar.forEach(function (S) {
        S.joriyX = S.bazaX * siqish;
        S.guruh.position.x = S.joriyX;
      });

      /* Butun yarim doira doim ko‘rinib tursin */
      var yarimKenglik = 5.35 * siqish + 1.55;
      var yarimV = (kamera.fov / 2) * Math.PI / 180;
      var yarimH = Math.atan(Math.tan(yarimV) * kamera.aspect);
      var masofa = yarimKenglik / Math.tan(yarimH) * 1.05;
      kamera.position.z = Math.max(12.6, masofa + 1.0);
      kamera.lookAt(QARASH);

      orinlarYangila();
      render();
    }

    var oxirgiVaqt = 0, ramka = 0, yuribdi = false, korinmoqda = false;

    function yangila(dt) {
      tvenYangila(dt);
      if (joriy && joriy.guruh) {
        joriy.vaqt += dt;
        joriy.guruh.rotation.y += dt * 0.70;
        if (!bloklangan) {
          joriy.guruh.position.y = MARKAZ.y + Math.sin(joriy.vaqt * 1.5) * 0.10;
        }
      }
      if (nihol && !kamHarakat) {
        nihol.rotation.z = Math.sin(performance.now() / 1000 * 0.9) * 0.012;
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
      if (korinmoqda && !document.hidden) halqaBoshla();
      else halqaToxtat();
    }

    var kuzatOlcham = null, kuzatKorinish = null;
    if (window.ResizeObserver) {
      kuzatOlcham = new ResizeObserver(olchamla);
      kuzatOlcham.observe(idish);
    } else {
      window.addEventListener('resize', olchamla);
    }
    if (window.IntersectionObserver) {
      kuzatKorinish = new IntersectionObserver(function (yozuv) {
        korinmoqda = yozuv[0].isIntersecting;
        holatniQara();
      }, { threshold: 0.05 });
      kuzatKorinish.observe(sahnaDiv);
    } else {
      korinmoqda = true;
    }
    document.addEventListener('visibilitychange', holatniQara);

    /* ---------- 4.15 Tozalash ---------- */
    var tozalandi = false;
    function tozala() {
      if (tozalandi) return;
      tozalandi = true;
      halqaToxtat();
      tvenlar.length = 0;
      if (kuzatOlcham) kuzatOlcham.disconnect();
      else window.removeEventListener('resize', olchamla);
      if (kuzatKorinish) kuzatKorinish.disconnect();
      document.removeEventListener('visibilitychange', holatniQara);
      window.removeEventListener('pagehide', tozala);
      canvas.removeEventListener('pointerdown', bosildi);

      sahna.traverse(function (o) {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          var ro = Array.isArray(o.material) ? o.material : [o.material];
          ro.forEach(function (mat) {
            for (var k in mat) {
              var v = mat[k];
              if (v && v.isTexture) v.dispose();
            }
            mat.dispose();
          });
        }
      });
      sahna.clear();
      renderer.dispose();
    }
    window.addEventListener('pagehide', tozala);

    /* ---------- 4.16 Boshladik ---------- */
    niholQoy(0, false);
    olchamla();
    navbat = aralash(BUYUM);
    tabloYangila();
    keyingi();
    holatniQara();
    render();
  }
})();
