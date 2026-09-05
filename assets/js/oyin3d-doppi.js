/* =========================================================
   «O‘RTA QO‘LINI TOP» — HAQIQIY 3D O‘YIN (Three.js)
   8-modul: darslikda nomlangan xalq o‘yini.

   To‘rtta 3D do‘ppi stol ustida turadi. Olma bittasining ostiga
   yashiriladi, do‘ppilar yoy chizib joy almashadi, o‘yinchi topadi.
   ========================================================= */
import * as THREE from '../vendor/three.module.min.js';

(function () {
  'use strict';

  var idish = document.getElementById('oyin3d');
  if (!idish) return;

  /* ---------- WebGL bormi? ---------- */
  function webglBor() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }
  if (!webglBor()) {
    idish.innerHTML = '<p class="uch-xato">Brauzeringiz 3D grafikani qo‘llab-quvvatlamaydi. ' +
      'Quyidagi oddiy variantda o‘ynashingiz mumkin.</p>';
    return;
  }

  var kamHarakat = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================
     Interfeys
     ========================================================= */
  idish.innerHTML =
    '<div class="uch-sahna">' +
      '<canvas class="uch-canvas"></canvas>' +
      '<div class="uch-ust">' +
        '<span class="uch-daraja">Daraja <b id="d3-daraja">1</b></span>' +
        '<span class="uch-rekord">Rekord <b id="d3-rekord">0</b></span>' +
      '</div>' +
      '<p class="uch-maslahat" id="d3-maslahat">Boshlash tugmasini bosing</p>' +
    '</div>' +
    '<div class="oyin-tugmalar">' +
      '<button type="button" class="tug tug-asos tug-kichik" id="d3-boshla">▶ Boshlash</button>' +
      '<button type="button" class="tug tug-ramka tug-kichik" id="d3-qayta">Qaytadan</button>' +
    '</div>';

  var canvas   = idish.querySelector('.uch-canvas');
  var maslahat = idish.querySelector('#d3-maslahat');
  var darajaEl = idish.querySelector('#d3-daraja');
  var rekordEl = idish.querySelector('#d3-rekord');

  /* =========================================================
     Sahna
     ========================================================= */
  var sahna = new THREE.Scene();
  sahna.background = new THREE.Color(0xF3E6CE);
  sahna.fog = new THREE.Fog(0xF3E6CE, 12, 26);

  var kamera = new THREE.PerspectiveCamera(42, 16 / 10, 0.1, 100);
  kamera.position.set(0, 4.3, 7.0);
  kamera.lookAt(0, 0.95, 0);

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  /* ---------- Yorug‘lik ---------- */
  sahna.add(new THREE.HemisphereLight(0xFFF4DE, 0xC9A87A, 1.15));
  var quyosh = new THREE.DirectionalLight(0xFFF0D0, 1.5);
  quyosh.position.set(4.5, 9, 5);
  quyosh.castShadow = true;
  quyosh.shadow.mapSize.set(1024, 1024);
  quyosh.shadow.camera.left = -8; quyosh.shadow.camera.right = 8;
  quyosh.shadow.camera.top = 8;   quyosh.shadow.camera.bottom = -8;
  quyosh.shadow.bias = -0.0008;
  sahna.add(quyosh);
  var toldiruvchi = new THREE.DirectionalLight(0xC1502E, 0.28);
  toldiruvchi.position.set(-5, 3, -4);
  sahna.add(toldiruvchi);

  /* ---------- Stol (milliy gilam ustida) ---------- */
  var stol = new THREE.Mesh(
    new THREE.CylinderGeometry(5.1, 5.1, 0.44, 48),
    new THREE.MeshStandardMaterial({ color: 0xC9A87A, roughness: 0.85, metalness: 0.02 })
  );
  stol.position.y = -0.22;
  stol.receiveShadow = true;
  sahna.add(stol);

  var gilam = new THREE.Mesh(
    new THREE.CylinderGeometry(4.3, 4.3, 0.06, 48),
    new THREE.MeshStandardMaterial({ color: 0x8C3A2B, roughness: 0.95 })
  );
  gilam.position.y = 0.02;
  gilam.receiveShadow = true;
  sahna.add(gilam);

  // Gilam ustidagi oltin halqa naqsh
  [3.6, 3.0].forEach(function (r, i) {
    var halqa = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.035, 8, 64),
      new THREE.MeshStandardMaterial({ color: 0xD4A24C, roughness: 0.5, metalness: 0.35 })
    );
    halqa.rotation.x = -Math.PI / 2;
    halqa.position.y = 0.055 + i * 0.001;
    sahna.add(halqa);
  });

  /* =========================================================
     Do‘ppi modeli
     ========================================================= */
  var qMat  = new THREE.MeshStandardMaterial({ color: 0x16162E, roughness: 0.62, metalness: 0.05 });
  var qMat2 = new THREE.MeshStandardMaterial({ color: 0x101024, roughness: 0.7 });
  var oqMat = new THREE.MeshStandardMaterial({ color: 0xFBF7F0, roughness: 0.5 });

  function doppiYasa() {
    var g = new THREE.Group();

    // Gumbaz — yarim shar, biroz bosilgan
    var gumbaz = new THREE.Mesh(
      new THREE.SphereGeometry(0.78, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2),
      qMat
    );
    gumbaz.scale.y = 0.82;
    gumbaz.position.y = 0.30;
    gumbaz.castShadow = true;
    g.add(gumbaz);

    // Chekka (jiyak)
    var chekka = new THREE.Mesh(
      new THREE.CylinderGeometry(0.83, 0.86, 0.30, 24),
      qMat2
    );
    chekka.position.y = 0.15;
    chekka.castShadow = true;
    g.add(chekka);

    // Oq bodom naqshlari — chekka bo‘ylab
    for (var i = 0; i < 8; i++) {
      var a = (i / 8) * Math.PI * 2;
      var bodom = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), oqMat);
      bodom.scale.set(0.62, 1.7, 0.62);
      bodom.position.set(Math.cos(a) * 0.845, 0.16, Math.sin(a) * 0.845);
      g.add(bodom);
    }
    // Gumbaz ustidagi uchburchak naqsh
    for (var k = 0; k < 4; k++) {
      var b = (k / 4) * Math.PI * 2 + 0.4;
      var uch = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.14, 4), oqMat);
      uch.position.set(Math.cos(b) * 0.36, 0.62, Math.sin(b) * 0.36);
      g.add(uch);
    }
    return g;
  }

  /* ---------- Olma ---------- */
  function olmaYasa() {
    var g = new THREE.Group();
    var tana = new THREE.Mesh(
      new THREE.SphereGeometry(0.30, 20, 16),
      new THREE.MeshStandardMaterial({ color: 0xC1502E, roughness: 0.42 })
    );
    tana.scale.y = 0.92;
    tana.castShadow = true;
    g.add(tana);
    var band = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026, 0.03, 0.2, 6),
      new THREE.MeshStandardMaterial({ color: 0x5A3E23, roughness: 0.9 })
    );
    band.position.y = 0.31;
    g.add(band);
    var barg = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0x2F6B45, roughness: 0.7 })
    );
    barg.scale.set(1.5, 0.28, 0.75);
    barg.position.set(0.11, 0.35, 0);
    barg.rotation.z = -0.5;
    g.add(barg);
    g.position.y = 0.30;
    return g;
  }

  /* =========================================================
     Obyektlarni joylashtirish
     ========================================================= */
  var SONI = 4;
  var ORALIQ = 2.0;
  var doppilar = [];
  for (var i = 0; i < SONI; i++) {
    var d = doppiYasa();
    d.scale.setScalar(1.18);
    d.position.set((i - (SONI - 1) / 2) * ORALIQ, 0.06, 0);
    d.userData.joy = i;          // qaysi joyda turibdi
    sahna.add(d);
    doppilar.push(d);
  }
  var olma = olmaYasa();
  olma.visible = false;
  sahna.add(olma);

  /* =========================================================
     Holat
     ========================================================= */
  var daraja = 1, rekord = 0, olmaJoyi = 0;
  var holat = 'tayyor';        // tayyor | korsatish | aralash | tanlash
  var vazifalar = [];          // animatsiya navbati

  try {
    var saqlangan = window.Xotira && window.Xotira.modul(8);
    if (saqlangan && saqlangan.topish3d) { rekord = saqlangan.topish3d; rekordEl.textContent = rekord; }
  } catch (e) {}

  function joyX(j) { return (j - (SONI - 1) / 2) * ORALIQ; }
  function xabar(m) { maslahat.textContent = m; }

  /* ---------- Animatsiya yordamchilari ---------- */
  function qoshVazifa(dav, boshlash, qadam, tugash) {
    vazifalar.push({ t: 0, dav: kamHarakat ? 0.001 : dav, boshlash: boshlash, qadam: qadam, tugash: tugash, boshlandi: false });
  }
  function yumshoq(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

  function kotar(d, balandlik, dav) {
    var y0 = d.position.y;
    qoshVazifa(dav, null, function (p) {
      d.position.y = y0 + (balandlik - y0) * yumshoq(p);
    }, null);
  }

  function almashtir(a, b, dav) {
    var da = doppilar[a], db = doppilar[b];
    var xa = da.position.x, xb = db.position.x;
    var yon = (a < b) ? 1 : -1;
    qoshVazifa(dav, null, function (p) {
      var e = yumshoq(p);
      // yoy bo‘ylab — biri oldindan, biri orqadan o‘tadi
      da.position.x = xa + (xb - xa) * e;
      db.position.x = xb + (xa - xb) * e;
      var yoy = Math.sin(p * Math.PI);
      da.position.z =  yoy * 1.15 * yon;
      db.position.z = -yoy * 1.15 * yon;
      da.position.y = 0.06 + yoy * 0.25;
      db.position.y = 0.06 + yoy * 0.25;
      da.rotation.y =  p * Math.PI * 0.5 * yon;
      db.rotation.y = -p * Math.PI * 0.5 * yon;
    }, function () {
      da.position.z = db.position.z = 0;
      da.position.y = db.position.y = 0.06;
      da.rotation.y = db.rotation.y = 0;
      var t = doppilar[a]; doppilar[a] = doppilar[b]; doppilar[b] = t;
    });
  }

  function kutish(dav) { qoshVazifa(dav, null, function () {}, null); }

  /* =========================================================
     O‘yin mantiqi
     ========================================================= */
  function boshla() {
    if (holat !== 'tayyor') return;
    vazifalar.length = 0;
    doppilar.forEach(function (d, i) {
      d.position.set(joyX(i), 0.06, 0);
      d.rotation.set(0, 0, 0);
    });

    olmaJoyi = Math.floor(Math.random() * SONI);
    olma.position.set(joyX(olmaJoyi), 0.30, 0);
    olma.visible = true;

    holat = 'korsatish';
    xabar('Olma shu yerda — eslab qoling!');

    // 1) Do‘ppini ko‘tarib olmani ko‘rsatamiz
    kotar(doppilar[olmaJoyi], 1.9, 0.5);
    kutish(1.0);
    // 2) Yopamiz va olmani yashiramiz
    kotar(doppilar[olmaJoyi], 0.06, 0.4);
    qoshVazifa(0.001, null, function () {}, function () {
      olma.visible = false;
      xabar('Aralashmoqda…');
    });

    // 3) Aralashtirish ketma-ketligini OLDINDAN hisoblaymiz va
    //    animatsiyalarni to‘g‘ridan-to‘g‘ri navbatga qo‘yamiz.
    var soni = 5 + daraja * 2;
    var tez  = Math.max(0.22, 0.62 - daraja * 0.045);
    var joy  = olmaJoyi;
    for (var s = 0; s < soni; s++) {
      var a = Math.floor(Math.random() * SONI);
      var b = Math.floor(Math.random() * SONI);
      while (b === a) b = Math.floor(Math.random() * SONI);
      if (joy === a) joy = b; else if (joy === b) joy = a;
      almashtir(a, b, tez);
    }
    olmaJoyi = joy;   // olma ko‘rinmayotgani uchun darhol belgilash xavfsiz

    // 4) Tanlash bosqichi
    qoshVazifa(0.001, null, function () {}, function () {
      holat = 'tanlash';
      xabar('Olma qaysi do‘ppi ostida? Bosib tanlang.');
    });
  }

  function tanlandi(d) {
    if (holat !== 'tanlash') return;
    holat = 'javob';
    var togri = (doppilar.indexOf(d) === olmaJoyi);
    var rost = doppilar[olmaJoyi];
    olma.position.x = rost.position.x;
    olma.visible = true;

    kotar(rost, 1.9, 0.45);
    if (!togri) kotar(d, 1.5, 0.4);

    qoshVazifa(0.001, null, function () {}, function () {
      if (togri) {
        daraja++;
        if (daraja - 1 > rekord) {
          rekord = daraja - 1;
          rekordEl.textContent = rekord;
          try { window.Xotira && window.Xotira.modulYoz(8, { topish3d: rekord }); } catch (e) {}
        }
        darajaEl.textContent = daraja;
        xabar('Topdingiz! Keyingi daraja tezroq bo‘ladi.');
      } else {
        daraja = Math.max(1, daraja - 1);
        darajaEl.textContent = daraja;
        xabar('Bu safar topilmadi. Yana urinib ko‘ring.');
      }
    });
    kutish(1.4);
    qoshVazifa(0.001, null, function () {}, function () {
      olma.visible = false;
      doppilar.forEach(function (x) { x.position.y = 0.06; });
      holat = 'tayyor';
    });
  }

  /* =========================================================
     Bosish (raycasting)
     ========================================================= */
  var nur = new THREE.Raycaster();
  var nuqta = new THREE.Vector2();

  canvas.addEventListener('pointerdown', function (e) {
    var r = canvas.getBoundingClientRect();
    nuqta.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    nuqta.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    nur.setFromCamera(nuqta, kamera);
    var kesishuv = nur.intersectObjects(doppilar, true);
    if (kesishuv.length) {
      var o = kesishuv[0].object;
      while (o.parent && doppilar.indexOf(o) === -1) o = o.parent;
      if (doppilar.indexOf(o) !== -1) tanlandi(o);
    }
  });

  idish.querySelector('#d3-boshla').addEventListener('click', boshla);
  idish.querySelector('#d3-qayta').addEventListener('click', function () {
    vazifalar.length = 0;
    daraja = 1; darajaEl.textContent = '1';
    olma.visible = false;
    doppilar.forEach(function (d, i) { d.position.set(joyX(i), 0.06, 0); d.rotation.set(0, 0, 0); });
    holat = 'tayyor';
    xabar('Boshlash tugmasini bosing');
  });

  /* =========================================================
     O‘lcham va render halqasi
     ========================================================= */
  function olcham() {
    var w = idish.clientWidth || 640;
    var h = Math.min(Math.round(w * 0.62), 520);
    renderer.setSize(w, h, false);
    kamera.aspect = w / h;
    kamera.updateProjectionMatrix();
  }
  olcham();
  if (window.ResizeObserver) new ResizeObserver(olcham).observe(idish);
  else window.addEventListener('resize', olcham);

  var ishlayapti = false, oxirgiVaqt = 0;

  function halqa(vaqt) {
    if (!ishlayapti) return;
    var dt = Math.min((vaqt - oxirgiVaqt) / 1000, 0.05);
    oxirgiVaqt = vaqt;

    // Navbatdagi animatsiya
    if (vazifalar.length) {
      var v = vazifalar[0];
      if (!v.boshlandi) { v.boshlandi = true; if (v.boshlash) v.boshlash(); }
      v.t += dt;
      var p = Math.min(v.t / v.dav, 1);
      v.qadam(p);
      if (p >= 1) { if (v.tugash) v.tugash(); vazifalar.shift(); }
    }

    // Olma do‘ppi ostida turgan joyda qolsin
    if (olma.visible && holat !== 'javob') olma.position.x = doppilar[olmaJoyi].position.x;
    if (!kamHarakat) olma.rotation.y += dt * 0.9;

    renderer.render(sahna, kamera);
    requestAnimationFrame(halqa);
  }

  function yoq() {
    if (ishlayapti) return;
    ishlayapti = true;
    oxirgiVaqt = performance.now();
    requestAnimationFrame(halqa);
  }
  function ochir() { ishlayapti = false; }

  // Faqat ekranda ko‘rinsa ishlasin — batareya va FPS uchun
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (y) {
      y[0].isIntersecting ? yoq() : ochir();
    }, { threshold: 0.05 }).observe(idish);
  } else { yoq(); }

  // 3D ishga tushdi — oddiy matnli variant endi kerak emas
  var zaxira = document.getElementById('oyin2');
  if (zaxira) zaxira.style.display = 'none';

  window.addEventListener('pagehide', function () {
    ochir();
    try { renderer.dispose(); } catch (e) {}
  });
})();
