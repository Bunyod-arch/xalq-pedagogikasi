/* =========================================================
   «MANBALAR XAZINASI» — HAQIQIY 3D O‘YIN (Three.js)
   1-modul: «Xalq pedagogikasi fanining maqsad va vazifalari,
   mazmuni».

   Ma’ruzada xalq pedagogikasining manbalari uch turga
   bo‘lingan. O‘yinchi har bir manbani o‘z xazinasiga —
   uchta o‘yma sandiqdan biriga joylaydi.

   Har bir manba uchun alohida, aniq 3D model yasalgan
   (`model-manba.js`). Matn yorlig‘li kub yo‘q.

   Three.js faqat `assets/vendor/` dan yuklanadi.
   ========================================================= */
import * as THREE from '../vendor/three.module.min.js';

(function () {
  'use strict';

  var idish = document.getElementById('oyin3d-manba');
  if (!idish) return;

  /* =========================================================
     1. QO‘LLAB-QUVVATLASHNI TEKSHIRISH
     ========================================================= */
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
     2. USLUBLAR — faqat shu o‘yinga tegishli (`o3mn-`)
     ========================================================= */
  if (!document.getElementById('o3mn-uslub')) {
    var uslub = document.createElement('style');
    uslub.id = 'o3mn-uslub';
    uslub.textContent = [
      '.o3mn-afisha{position:relative;border-radius:18px;padding:26px 22px;text-align:center;',
      '  background:linear-gradient(150deg,#1B3B6F 0%,#2A4E86 55%,#3C2A5E 100%);color:#FBF7F0;',
      '  box-shadow:0 2px 4px rgba(26,22,20,.08),0 12px 28px rgba(26,22,20,.16);}',
      '.o3mn-afisha h4{margin:0 0 8px;font-size:1.18rem;letter-spacing:.01em;}',
      '.o3mn-afisha p{margin:0 auto 16px;max-width:52ch;font-size:.92rem;line-height:1.55;',
      '  color:#E7EDF7;}',
      '.o3mn-turlar{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:0 0 18px;',
      '  padding:0;list-style:none;}',
      '.o3mn-turlar li{padding:6px 14px;border-radius:999px;font-size:.8rem;font-weight:600;',
      '  background:rgba(251,247,240,.14);border:1px solid rgba(251,247,240,.28);}',
      '.o3mn-boshla{cursor:pointer;border:0;border-radius:999px;padding:13px 30px;',
      '  background:#D4A24C;color:#2A1B08;font:inherit;font-size:1rem;font-weight:800;',
      '  box-shadow:0 6px 18px rgba(0,0,0,.28);transition:transform .15s ease,box-shadow .15s ease;}',
      '.o3mn-boshla:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(0,0,0,.34);}',
      '.o3mn-boshla:active{transform:translateY(1px);}',
      '.o3mn-yuk{margin-top:12px;font-size:.85rem;color:#D8E2F1;}',

      '.o3mn-sahna{position:relative;width:100%;border-radius:18px;overflow:hidden;',
      '  background:#EFE2C6;box-shadow:0 2px 4px rgba(26,22,20,.08),0 12px 28px rgba(26,22,20,.14);}',
      '.o3mn-sahna canvas{display:block;width:100%;height:auto;touch-action:none;cursor:grab;}',
      '.o3mn-sahna canvas:active{cursor:grabbing;}',
      '.o3mn-ust{position:absolute;inset:0;pointer-events:none;font:inherit;}',
      '.o3mn-qator{position:absolute;top:11px;left:11px;right:11px;display:flex;',
      '  align-items:flex-start;justify-content:space-between;gap:8px;flex-wrap:wrap;}',
      '.o3mn-tabl{flex:0 0 auto;display:inline-flex;gap:6px;align-items:baseline;',
      '  padding:7px 14px;border-radius:999px;background:rgba(251,247,240,.93);color:#1B3B6F;',
      '  font-size:.84rem;font-weight:600;white-space:nowrap;',
      '  box-shadow:0 2px 8px rgba(26,22,20,.18);}',
      '.o3mn-tabl b{font-size:1.02rem;color:#C1502E;}',
      '.o3mn-nom{flex:1 1 12ch;order:0;min-width:0;',
      '  padding:8px 18px;border-radius:999px;background:rgba(27,59,111,.94);color:#FBF7F0;',
      '  font-size:.98rem;font-weight:700;line-height:1.25;text-align:center;',
      '  box-shadow:0 4px 14px rgba(26,22,20,.28);}',
      '.o3mn-past{position:absolute;left:12px;right:12px;bottom:12px;text-align:center;}',
      '.o3mn-xabar{display:inline-block;margin:0;max-width:100%;padding:7px 16px;',
      '  border-radius:999px;background:rgba(26,22,20,.66);color:#FBF7F0;',
      '  font-size:.85rem;font-weight:600;line-height:1.4;}',
      '.o3mn-xabar:empty{display:none;}',
      '.o3mn-xabar.togri{background:rgba(31,84,52,.9);color:#DFF6E4;}',
      '.o3mn-xabar.xato{background:rgba(150,52,26,.9);color:#FFE2D6;}',
      '.o3mn-natija{position:absolute;inset:0;display:flex;flex-direction:column;',
      '  align-items:center;justify-content:center;gap:10px;text-align:center;padding:20px;',
      '  background:rgba(27,59,111,.92);color:#FBF7F0;}',
      '.o3mn-natija h4{margin:0;font-size:1.22rem;}',
      '.o3mn-foiz{font-size:2.5rem;font-weight:800;color:#D4A24C;line-height:1;}',
      '.o3mn-natija p{margin:0;font-size:.92rem;max-width:36ch;line-height:1.5;}',
      '.o3mn-qayta{pointer-events:auto;cursor:pointer;margin-top:6px;padding:11px 24px;',
      '  border:0;border-radius:999px;background:#D4A24C;color:#2A1B08;',
      '  font:inherit;font-size:.95rem;font-weight:700;',
      '  box-shadow:0 4px 12px rgba(26,22,20,.3);transition:transform .15s ease;}',
      '.o3mn-qayta:hover{transform:translateY(-2px);}',
      '.o3mn-qayta:active{transform:translateY(1px);}',
      '.o3mn-xato{margin:0;padding:22px;border-radius:16px;background:#FBF7F0;color:#1B3B6F;',
      '  text-align:center;font-weight:600;}',

      '.o3mn-tor .o3mn-qator{top:7px;left:7px;right:7px;gap:5px;}',
      '.o3mn-tor .o3mn-tabl{padding:4px 9px;font-size:.7rem;gap:4px;}',
      '.o3mn-tor .o3mn-tabl b{font-size:.82rem;}',
      '.o3mn-tor .o3mn-nom{padding:5px 11px;font-size:.78rem;flex-basis:100%;order:-1;}',
      '.o3mn-tor .o3mn-past{left:7px;right:7px;bottom:8px;}',
      '.o3mn-tor .o3mn-xabar{padding:5px 11px;font-size:.72rem;}',
      '.o3mn-tor .o3mn-foiz{font-size:1.9rem;}',
      '.o3mn-tor .o3mn-natija h4{font-size:1.02rem;}',
      '.o3mn-tor .o3mn-natija p{font-size:.79rem;}',
      '@media (prefers-reduced-motion: reduce){',
      '  .o3mn-boshla,.o3mn-qayta{transition:none;}}'
    ].join('\n');
    document.head.appendChild(uslub);
  }

  /* =========================================================
     3. AFISHA — o‘yin ko‘rinadigan tugmadan ochiladi
     ========================================================= */
  var afisha = document.createElement('div');
  afisha.className = 'o3mn-afisha';
  afisha.innerHTML =
    '<h4>«Manbalar xazinasi» — 3D o‘yin</h4>' +
    '<p>Ma’ruzada aytilganidek, o‘zbek xalq pedagogikasining manbalari uch turga ' +
      'bo‘linadi. Har bir manbaning aniq 3D modeli o‘rtadagi kursi ustida paydo ' +
      'bo‘ladi — uni sudrab aylantirib ko‘ring va o‘z sandig‘iga joylang.</p>' +
    '<ul class="o3mn-turlar">' +
      '<li>Mutafakkirlar merosi</li>' +
      '<li>Xalq og‘zaki ijodi</li>' +
      '<li>Islomiy ta’limot</li>' +
    '</ul>' +
    '<button type="button" class="o3mn-boshla">▶ 3D o‘yinni boshlash</button>' +
    '<p class="o3mn-yuk" hidden>Sahna tayyorlanmoqda…</p>';
  idish.appendChild(afisha);

  var boshlaTug = afisha.querySelector('.o3mn-boshla');
  var yukEl = afisha.querySelector('.o3mn-yuk');

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
    import('./model-manba.js')
      .then(function (kutubxona) {
        afisha.remove();
        oyinQur(kutubxona.MANBALAR, kutubxona.MANBA_TURLARI);
      })
      .catch(function (x) {
        ochilgan = false;
        boshlaTug.disabled = false;
        yukEl.textContent = 'Modellarni yuklab bo‘lmadi. Sahifani yangilab ko‘ring.';
        if (window.console) console.error(x);
      });
  });

  /* =========================================================
     4. O‘YINNI QURISH
     ========================================================= */
  function oyinQur(MANBALAR, TURLAR) {

    /* ---------- 4.1. HTML karkas ---------- */
    var sahnaDiv = document.createElement('div');
    sahnaDiv.className = 'o3mn-sahna';
    sahnaDiv.innerHTML =
      '<canvas></canvas>' +
      '<div class="o3mn-ust">' +
        '<div class="o3mn-qator">' +
          '<span class="o3mn-tabl">To‘g‘ri <b class="o3mn-ball">0</b></span>' +
          '<span class="o3mn-nom">Tayyorlanmoqda…</span>' +
          '<span class="o3mn-tabl">Qoldi <b class="o3mn-qoldi">0</b></span>' +
        '</div>' +
        '<div class="o3mn-past">' +
          '<p class="o3mn-xabar" role="status">Manbani o‘z sandig‘iga bosing</p>' +
        '</div>' +
      '</div>';
    idish.appendChild(sahnaDiv);

    var canvas  = sahnaDiv.querySelector('canvas');
    var ballEl  = sahnaDiv.querySelector('.o3mn-ball');
    var qoldiEl = sahnaDiv.querySelector('.o3mn-qoldi');
    var nomEl   = sahnaDiv.querySelector('.o3mn-nom');
    var xabarEl = sahnaDiv.querySelector('.o3mn-xabar');
    var ustQatlam = sahnaDiv.querySelector('.o3mn-ust');

    /* ---------- 4.2. Renderer, sahna, kamera ---------- */
    var telefon = (window.innerWidth || 800) < 620;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !telefon, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, telefon ? 1.5 : 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    var sahna = new THREE.Scene();
    sahna.background = new THREE.Color(0xEFE2C6);
    sahna.fog = new THREE.Fog(0xEFE2C6, 15, 34);

    var kamera = new THREE.PerspectiveCamera(42, 16 / 10, 0.1, 100);
    kamera.position.set(0, 4.5, 8.2);
    kamera.lookAt(0, 1.35, 0.6);

    sahna.add(new THREE.HemisphereLight(0xFFF6E4, 0xB99A6E, 1.05));
    var quyosh = new THREE.DirectionalLight(0xFFF0D0, 1.55);
    quyosh.position.set(5, 10.5, 6.5);
    quyosh.castShadow = true;
    quyosh.shadow.mapSize.set(telefon ? 1024 : 2048, telefon ? 1024 : 2048);
    quyosh.shadow.camera.left = -9;  quyosh.shadow.camera.right = 9;
    quyosh.shadow.camera.top = 9;    quyosh.shadow.camera.bottom = -9;
    quyosh.shadow.bias = -0.0009;
    sahna.add(quyosh);
    var toldiruvchi = new THREE.DirectionalLight(0x8FA9D6, 0.34);
    toldiruvchi.position.set(-6, 4, -5);
    sahna.add(toldiruvchi);

    /* ---------- 4.3. Yer — hovli va suzana gilam ---------- */
    var yer = new THREE.Mesh(
      new THREE.CylinderGeometry(13, 13, 0.5, 44),
      new THREE.MeshStandardMaterial({ color: 0xD9C6A2, roughness: 0.96 })
    );
    yer.position.y = -0.25;
    yer.receiveShadow = true;
    sahna.add(yer);

    var gilam = new THREE.Mesh(
      new THREE.CylinderGeometry(5.6, 5.6, 0.06, 48),
      new THREE.MeshStandardMaterial({ color: 0x8C2F28, roughness: 0.98 })
    );
    gilam.position.set(0, 0.03, 0.9);
    gilam.receiveShadow = true;
    sahna.add(gilam);

    // Gilamdagi suzana halqalari
    [5.2, 4.6, 2.3].forEach(function (r, i) {
      var halqa = new THREE.Mesh(
        new THREE.TorusGeometry(r, i === 2 ? 0.05 : 0.035, 8, 64),
        new THREE.MeshStandardMaterial({
          color: i === 1 ? 0x1B3B6F : 0xD4A24C, roughness: 0.6, metalness: 0.2
        })
      );
      halqa.rotation.x = -Math.PI / 2;
      halqa.position.set(0, 0.065 + i * 0.001, 0.9);
      sahna.add(halqa);
    });
    // Gilam chetidagi bodom naqshlar
    for (var gi = 0; gi < 20; gi++) {
      var ga = (gi / 20) * Math.PI * 2;
      var bodom = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 10, 8),
        new THREE.MeshStandardMaterial({ color: gi % 2 ? 0xD4A24C : 0x1B3B6F, roughness: 0.7 })
      );
      bodom.scale.set(1.5, 0.16, 0.75);
      bodom.position.set(Math.cos(ga) * 4.9, 0.07, Math.sin(ga) * 4.9 + 0.9);
      bodom.rotation.y = -ga;
      sahna.add(bodom);
    }

    /* ---------- 4.4. Yorliq to‘qimasi (sandiq peshtaxtasi) ---------- */
    /* Matnni berilgan kenglikka sig‘adigan qilib kichraytiradi */
    function sigdir(k, matn, kenglik, engKatta, ogirlik) {
      var olcham = engKatta;
      do {
        k.font = ogirlik + ' ' + olcham + 'px Georgia, "Times New Roman", serif';
        if (k.measureText(matn).width <= kenglik) break;
        olcham -= 2;
      } while (olcham > 10);
      return olcham;
    }

    function yorliqToqima(sarlavha, izoh, rangHex) {
      var EN = 768, BO = 200;
      var c = document.createElement('canvas');
      c.width = EN; c.height = BO;
      var k = c.getContext('2d');

      k.fillStyle = '#FBF7F0';
      k.fillRect(0, 0, EN, BO);
      k.strokeStyle = rangHex; k.lineWidth = 12;
      k.strokeRect(10, 10, EN - 20, BO - 20);
      // Ichki nozik chiziq — o‘yma jiyak taassuroti
      k.strokeStyle = 'rgba(26,22,20,.22)'; k.lineWidth = 3;
      k.strokeRect(26, 26, EN - 52, BO - 52);

      k.textAlign = 'center'; k.textBaseline = 'middle';
      k.fillStyle = rangHex;
      sigdir(k, sarlavha, EN - 90, 72, '700');
      k.fillText(sarlavha, EN / 2, 82);

      k.fillStyle = 'rgba(26,22,20,.68)';
      sigdir(k, izoh, EN - 90, 34, '400');
      k.fillText(izoh, EN / 2, 145);

      var t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      return t;
    }

    /* ---------- 4.5. Sandiq modeli ---------- */
    var SANDIQ_EN = 2.9, SANDIQ_BO = 1.7, SANDIQ_BAL = 1.05;

    function sandiqYasa(tur) {
      var S = new THREE.Group();

      var yogochMat = new THREE.MeshStandardMaterial({ color: 0x6E4B2A, roughness: 0.85 });
      var boyoqMat  = new THREE.MeshStandardMaterial({ color: tur.rang, roughness: 0.72 });
      var misMat    = new THREE.MeshStandardMaterial({ color: 0xA9713C, roughness: 0.35, metalness: 0.75 });
      var oltinMat  = new THREE.MeshStandardMaterial({ color: 0xD4A24C, roughness: 0.35, metalness: 0.6 });

      /* Oyoqchalar */
      for (var sx = -1; sx <= 1; sx += 2) {
        for (var sz = -1; sz <= 1; sz += 2) {
          var oyoq = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.28, 0.3), yogochMat);
          oyoq.position.set(sx * (SANDIQ_EN / 2 - 0.2), 0.14, sz * (SANDIQ_BO / 2 - 0.2));
          oyoq.castShadow = true; oyoq.receiveShadow = true;
          S.add(oyoq);
        }
      }

      /* Tana */
      var tana = new THREE.Mesh(
        new THREE.BoxGeometry(SANDIQ_EN, SANDIQ_BAL, SANDIQ_BO), yogochMat);
      tana.position.y = 0.28 + SANDIQ_BAL / 2;
      tana.castShadow = true; tana.receiveShadow = true;
      S.add(tana);

      /* Old yuzadagi bo‘yalgan taxta */
      var old = new THREE.Mesh(new THREE.BoxGeometry(SANDIQ_EN - 0.24, SANDIQ_BAL - 0.22, 0.05), boyoqMat);
      old.position.set(0, 0.28 + SANDIQ_BAL / 2, SANDIQ_BO / 2 + 0.008);
      old.castShadow = true;
      S.add(old);

      /* Yorliq — sandiq peshtaxtasi */
      var yorliq = new THREE.Mesh(
        new THREE.PlaneGeometry(SANDIQ_EN - 0.42, 0.645),
        new THREE.MeshStandardMaterial({
          map: yorliqToqima(tur.nom, tur.qisqa, '#' + tur.rang.toString(16).padStart(6, '0')),
          roughness: 0.8
        })
      );
      yorliq.position.set(0, 0.28 + SANDIQ_BAL / 2, SANDIQ_BO / 2 + 0.038);
      S.add(yorliq);

      /* Mis burchak temirlari */
      [-1, 1].forEach(function (sx) {
        var temir = new THREE.Mesh(
          new THREE.BoxGeometry(0.11, SANDIQ_BAL + 0.03, SANDIQ_BO + 0.03), misMat);
        temir.position.set(sx * (SANDIQ_EN / 2 - 0.10), 0.28 + SANDIQ_BAL / 2, 0);
        temir.castShadow = true;
        S.add(temir);
        // Mixchalar
        for (var mi = 0; mi < 3; mi++) {
          var mix = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), oltinMat);
          mix.position.set(sx * (SANDIQ_EN / 2 - 0.10), 0.5 + mi * 0.33, SANDIQ_BO / 2 + 0.02);
          S.add(mix);
        }
      });

      /* Qopqoq — orqa qirrasida menteşa bilan ochiladi */
      var qopqoq = new THREE.Group();
      var yassi = new THREE.Mesh(
        new THREE.BoxGeometry(SANDIQ_EN + 0.1, 0.14, SANDIQ_BO + 0.1), yogochMat);
      yassi.position.y = 0.07;
      yassi.castShadow = true; yassi.receiveShadow = true;
      qopqoq.add(yassi);
      // Yarim silindr gumbaz
      var gumbaz = new THREE.Mesh(
        new THREE.CylinderGeometry(SANDIQ_BO / 2 + 0.05, SANDIQ_BO / 2 + 0.05,
          SANDIQ_EN + 0.1, 22, 1, false, 0, Math.PI), boyoqMat);
      gumbaz.rotation.z = Math.PI / 2;
      gumbaz.scale.set(0.42, 1, 1);
      gumbaz.position.y = 0.14;
      gumbaz.castShadow = true;
      qopqoq.add(gumbaz);
      // Qopqoqdagi mis kamarlar
      [-0.75, 0, 0.75].forEach(function (nx) {
        var kamar = new THREE.Mesh(
          new THREE.TorusGeometry(SANDIQ_BO / 2 + 0.06, 0.035, 8, 20, Math.PI), misMat);
        kamar.rotation.y = Math.PI / 2;
        kamar.rotation.z = Math.PI;
        kamar.scale.set(1, 0.42, 1);
        kamar.position.set(nx * (SANDIQ_EN / 2 - 0.3), 0.14, 0);
        qopqoq.add(kamar);
      });
      // Qulf
      var qulf = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.3, 0.09), oltinMat);
      qulf.position.set(0, 0.05, SANDIQ_BO / 2 + 0.06);
      qulf.castShadow = true;
      qopqoq.add(qulf);
      var qulfHalqa = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.028, 8, 18), misMat);
      qulfHalqa.position.set(0, -0.06, SANDIQ_BO / 2 + 0.09);
      qopqoq.add(qulfHalqa);

      qopqoq.position.set(0, 0.28 + SANDIQ_BAL, -SANDIQ_BO / 2);
      // Menteşa nuqtasi orqada bo‘lishi uchun bolalarni oldinga suramiz
      qopqoq.children.forEach(function (b) { b.position.z += SANDIQ_BO / 2; });
      S.add(qopqoq);

      S.userData.qopqoq = qopqoq;
      S.userData.tur = tur.id;
      S.userData.ochiq = 0;
      return S;
    }

    var sandiqlar = TURLAR.map(function (tur, i) {
      var S = sandiqYasa(tur);
      S.position.set((i - 1) * 3.55, 0, -2.35);
      sahna.add(S);
      return S;
    });

    /* ---------- 4.6. Kursi (lavh) — manba shu yerda turadi ---------- */
    var kursi = new THREE.Group();
    var kursiTana = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 1.15, 0.55, 26),
      new THREE.MeshStandardMaterial({ color: 0xC0A87E, roughness: 0.9 })
    );
    kursiTana.position.y = 0.275;
    kursiTana.castShadow = true; kursiTana.receiveShadow = true;
    kursi.add(kursiTana);
    var kursiUst = new THREE.Mesh(
      new THREE.CylinderGeometry(1.05, 1.05, 0.12, 26),
      new THREE.MeshStandardMaterial({ color: 0x8C6A42, roughness: 0.82 })
    );
    kursiUst.position.y = 0.58;
    kursiUst.castShadow = true; kursiUst.receiveShadow = true;
    kursi.add(kursiUst);
    var kursiHalqa = new THREE.Mesh(
      new THREE.TorusGeometry(0.96, 0.045, 8, 34),
      new THREE.MeshStandardMaterial({ color: 0xD4A24C, roughness: 0.4, metalness: 0.55 })
    );
    kursiHalqa.rotation.x = -Math.PI / 2;
    kursiHalqa.position.y = 0.645;
    kursi.add(kursiHalqa);
    kursi.position.set(0, 0, 2.4);
    sahna.add(kursi);

    /* ---------- 4.7. Ma’lumot: manbalar ro‘yxati ---------- */
    var KALITLAR = Object.keys(MANBALAR);

    function aralashtir(a) {
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }

    /* ---------- 4.8. Animatsiya navbati ---------- */
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

    /* ---------- 4.9. Holat ---------- */
    var navbat = [], joriy = null, joriyKalit = null;
    var togri = 0, jami = KALITLAR.length, indeks = 0;
    var bandmi = false, tugadi = false;

    function tabloYangila() {
      ballEl.textContent = togri;
      qoldiEl.textContent = Math.max(jami - indeks, 0);
    }
    function xabar(matn, tur) {
      xabarEl.textContent = matn || '';
      xabarEl.className = 'o3mn-xabar' + (tur ? ' ' + tur : '');
    }

    /* ---------- 4.10. Manbani sahnaga chiqarish ---------- */
    function modelYarat(kalit) {
      var g = MANBALAR[kalit].yasa();
      g.traverse(function (o) {
        if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; }
      });
      var ustki = new THREE.Group();
      ustki.add(g);
      g.scale.setScalar(1.45);        // sahnada yaxshi ko‘rinishi uchun
      return ustki;
    }

    function keyingi() {
      if (indeks >= jami) { yakunla(); return; }
      joriyKalit = navbat[indeks];
      joriy = modelYarat(joriyKalit);
      joriy.position.set(0, 0.64, 2.4);
      joriy.rotation.y = -0.5;
      sahna.add(joriy);

      nomEl.textContent = MANBALAR[joriyKalit].nom;
      xabar('Bu manba qaysi sandiqqa tegishli? Sandiqni bosing.');
      tabloYangila();

      // Paydo bo‘lish — pastdan ko‘tarilib, aylanib chiqadi
      joriy.scale.setScalar(0.01);
      tven(0.5, function (p) {
        var e = chiqish(p);
        joriy.scale.setScalar(0.02 + e * 0.98);
        joriy.position.y = 0.64 + (1 - e) * 0.5;
        joriy.rotation.y = -0.5 + (1 - e) * 1.6;
      }, function () {
        joriy.scale.setScalar(1);
        joriy.position.y = 0.64;
        bandmi = false;
      });
    }

    /* ---------- 4.11. Sandiq harakatlari ---------- */
    function qopqoqOch(S, ochiqmi) {
      var b = S.userData.ochiq, m = ochiqmi ? 1 : 0;
      tven(0.3, function (p) {
        S.userData.ochiq = b + (m - b) * yumshoq(p);
        S.userData.qopqoq.rotation.x = -S.userData.ochiq * 1.9;
      });
    }
    function sandiqSakra(S) {
      tven(0.5, function (p) {
        S.position.y = Math.sin(p * Math.PI) * 0.28;
      }, function () { S.position.y = 0; });
    }
    function sandiqXato(S) {
      tven(0.7, function (p) {
        S.position.x = S.userData.asosX + Math.sin(p * Math.PI * 6) * (1 - p) * 0.17;
      }, function () { S.position.x = S.userData.asosX; });
    }

    sandiqlar.forEach(function (S) { S.userData.asosX = S.position.x; });

    /* Manbaning sandiqqa uchishi — yoy bo‘ylab */
    function uchir(g, S, tamom) {
      var b = g.position.clone();
      var m = new THREE.Vector3(S.position.x, 1.5, S.position.z + 0.15);
      tven(0.75, function (p) {
        var e = yumshoq(p);
        g.position.x = b.x + (m.x - b.x) * e;
        g.position.z = b.z + (m.z - b.z) * e;
        g.position.y = b.y + (m.y - b.y) * e + Math.sin(p * Math.PI) * 1.7;
        g.rotation.y += 0.09;
        g.rotation.x = p * 0.7;
        var k = 1 - e * 0.75;
        g.scale.setScalar(k);
      }, function () { if (tamom) tamom(); });
    }

    /* Xato javobda — manba chayqaladi */
    function chayqal(g, tamom) {
      tven(0.55, function (p) {
        g.rotation.z = Math.sin(p * Math.PI * 5) * (1 - p) * 0.42;
      }, function () { g.rotation.z = 0; if (tamom) tamom(); });
    }

    /* Uchqunlar — to‘g‘ri javobda */
    var uchqunlar = [];
    function uchqunChiqar(S) {
      var soni = telefon ? 10 : 20;
      for (var i = 0; i < soni; i++) {
        var u = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.07 + Math.random() * 0.05),
          new THREE.MeshStandardMaterial({
            color: i % 2 ? 0xD4A24C : 0xF0DCA8, roughness: 0.3, metalness: 0.5,
            transparent: true, opacity: 1
          })
        );
        u.position.set(S.position.x + (Math.random() - 0.5) * 2.2, 1.5,
          S.position.z + 0.4 + (Math.random() - 0.5) * 0.8);
        u.userData.tez = new THREE.Vector3(
          (Math.random() - 0.5) * 2.6, 2.6 + Math.random() * 2.4, (Math.random() - 0.2) * 2.0);
        u.userData.umr = 0;
        sahna.add(u);
        uchqunlar.push(u);
      }
    }
    function uchqunYangila(dt) {
      for (var i = uchqunlar.length - 1; i >= 0; i--) {
        var u = uchqunlar[i];
        u.userData.umr += dt;
        u.userData.tez.y -= 7.5 * dt;
        u.position.addScaledVector(u.userData.tez, dt);
        u.rotation.x += dt * 4; u.rotation.y += dt * 5;
        u.material.opacity = Math.max(0, 1 - u.userData.umr / 1.3);
        if (u.userData.umr > 1.3) {
          sahna.remove(u);
          u.geometry.dispose(); u.material.dispose();
          uchqunlar.splice(i, 1);
        }
      }
    }

    /* ---------- 4.12. Javob ---------- */
    function javobBer(sandiqIdx) {
      if (bandmi || tugadi || !joriy) return;
      bandmi = true;

      var mal = MANBALAR[joriyKalit];
      var togriIdx = -1;
      for (var i = 0; i < TURLAR.length; i++) if (TURLAR[i].id === mal.tur) togriIdx = i;

      var g = joriy, tanlandi = sandiqlar[sandiqIdx], rost = sandiqlar[togriIdx];
      joriy = null;
      indeks++;

      if (sandiqIdx === togriIdx) {
        togri++;
        xabar('To‘g‘ri! ' + mal.izoh, 'togri');
        qopqoqOch(rost, true);
        uchir(g, rost, function () {
          yoq(g);
          uchqunChiqar(rost);
          sandiqSakra(rost);
          qopqoqOch(rost, false);
          kutish(0.35, function () { tabloYangila(); keyingi(); });
        });
      } else {
        xabar('Bu emas. ' + mal.nom + ' — «' + TURLAR[togriIdx].nom + '» manbasi.', 'xato');
        sandiqXato(tanlandi);
        chayqal(g, function () {
          qopqoqOch(rost, true);
          uchir(g, rost, function () {
            yoq(g);
            qopqoqOch(rost, false);
            kutish(0.5, function () { tabloYangila(); keyingi(); });
          });
        });
      }
    }

    function yoq(g) {
      sahna.remove(g);
      g.traverse(function (o) {
        if (o.isMesh) {
          if (o.geometry) o.geometry.dispose();
          var ro = Array.isArray(o.material) ? o.material : [o.material];
          ro.forEach(function (mt) { if (mt && mt.dispose) mt.dispose(); });
        }
      });
    }

    /* ---------- 4.13. Sichqoncha va sensor ---------- */
    var nur = new THREE.Raycaster();
    var nuqta = new THREE.Vector2();
    var sudrash = null;

    function joyla(e) {
      var r = canvas.getBoundingClientRect();
      nuqta.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      nuqta.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    }

    function bosildi(e) {
      sudrash = { x: e.clientX, y: e.clientY, yurdi: 0, id: e.pointerId };
      try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
    }
    function surildi(e) {
      if (!sudrash || e.pointerId !== sudrash.id) return;
      var dx = e.clientX - sudrash.x, dy = e.clientY - sudrash.y;
      sudrash.yurdi += Math.abs(dx) + Math.abs(dy);
      if (joriy) {
        joriy.rotation.y += dx * 0.011;
        joriy.rotation.x = Math.max(-0.6, Math.min(0.6, joriy.rotation.x + dy * 0.006));
      }
      sudrash.x = e.clientX; sudrash.y = e.clientY;
      e.preventDefault();
    }
    function qoyildi(e) {
      if (!sudrash || e.pointerId !== sudrash.id) return;
      var yurdi = sudrash.yurdi;
      sudrash = null;
      try { canvas.releasePointerCapture(e.pointerId); } catch (x) {}
      if (yurdi > 10) return;               // sudrash edi, bosish emas
      joyla(e);
      nur.setFromCamera(nuqta, kamera);
      var kesishuv = nur.intersectObjects(sandiqlar, true);
      if (!kesishuv.length) return;
      var o = kesishuv[0].object;
      while (o && sandiqlar.indexOf(o) === -1) o = o.parent;
      var idx = sandiqlar.indexOf(o);
      if (idx !== -1) javobBer(idx);
    }

    canvas.addEventListener('pointerdown', bosildi);
    canvas.addEventListener('pointermove', surildi, { passive: false });
    canvas.addEventListener('pointerup', qoyildi);
    canvas.addEventListener('pointercancel', function () { sudrash = null; });

    /* Klaviatura bilan ham o‘ynash mumkin: 1, 2, 3 */
    function tugmaBosildi(e) {
      if (e.key === '1' || e.key === '2' || e.key === '3') javobBer(parseInt(e.key, 10) - 1);
    }
    sahnaDiv.tabIndex = 0;
    sahnaDiv.setAttribute('aria-label',
      '3D o‘yin: manbani sandiqqa joylang. 1, 2, 3 tugmalari bilan ham tanlash mumkin.');
    sahnaDiv.addEventListener('keydown', tugmaBosildi);

    /* ---------- 4.14. Yakun ---------- */
    function yakunla() {
      tugadi = true;
      nomEl.textContent = 'O‘yin tugadi';
      xabar('');
      var foiz = Math.round((togri / jami) * 100);

      var baho;
      if (foiz === 100) baho = 'A’lo! Uch manba turini mukammal ajratdingiz.';
      else if (foiz >= 80) baho = 'Juda yaxshi. Manbalar tasnifi o‘zlashtirilgan.';
      else if (foiz >= 60) baho = 'Yaxshi. Ma’ruzaning «manbalar» bandini takrorlang.';
      else baho = 'Ma’ruza matnidagi uch manba turini yana bir bor o‘qib chiqing.';

      var quti = document.createElement('div');
      quti.className = 'o3mn-natija';
      quti.innerHTML =
        '<h4>Manbalar xazinasi</h4>' +
        '<span class="o3mn-foiz">' + foiz + '%</span>' +
        '<p>' + jami + ' ta manbadan ' + togri + ' tasini to‘g‘ri joyladingiz. ' + baho + '</p>' +
        '<button type="button" class="o3mn-qayta">Qaytadan o‘ynash</button>';
      ustQatlam.appendChild(quti);
      quti.querySelector('.o3mn-qayta').addEventListener('click', function () {
        quti.remove();
        qaytaBoshla();
      });

      try {
        if (window.Xotira) window.Xotira.modulYoz(1, { oyin3d: foiz });
      } catch (x) {}
    }

    function qaytaBoshla() {
      tugadi = false; togri = 0; indeks = 0; bandmi = true;
      tvenlar.length = 0;
      uchqunlar.forEach(function (u) {
        sahna.remove(u); u.geometry.dispose(); u.material.dispose();
      });
      uchqunlar.length = 0;
      if (joriy) { yoq(joriy); joriy = null; }
      sandiqlar.forEach(function (S) {
        S.position.x = S.userData.asosX; S.position.y = 0;
        S.userData.ochiq = 0; S.userData.qopqoq.rotation.x = 0;
      });
      navbat = aralashtir(KALITLAR.slice());
      tabloYangila();
      keyingi();
    }

    /* ---------- 4.15. O‘lcham ---------- */
    function olchamla() {
      var w = idish.clientWidth || 640;
      var h = Math.round(Math.min(Math.max(w * 0.62, 300), 560));
      renderer.setSize(w, h, false);
      kamera.aspect = w / h;
      // Tor ekranda kamerani biroz orqaga suramiz
      var tor = w < 560;
      sahnaDiv.classList.toggle('o3mn-tor', tor);
      kamera.position.set(0, tor ? 5.0 : 4.5, tor ? 9.6 : 8.2);
      kamera.lookAt(0, tor ? 1.5 : 1.35, tor ? 0.4 : 0.6);
      kamera.updateProjectionMatrix();
    }
    olchamla();
    if (window.ResizeObserver) new ResizeObserver(olchamla).observe(idish);
    else window.addEventListener('resize', olchamla);

    /* ---------- 4.16. Halqa ---------- */
    var ishlayapti = false, oxirgi = 0;

    function halqa(vaqt) {
      if (!ishlayapti) return;
      var dt = Math.min((vaqt - oxirgi) / 1000, 0.05);
      oxirgi = vaqt;

      tvenYangila(dt);
      uchqunYangila(dt);

      if (joriy && !bandmi && !sudrash && !kamHarakat) {
        joriy.rotation.y += dt * 0.55;
        joriy.position.y = 0.64 + Math.sin(vaqt / 620) * 0.06;
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

    /* ---------- 4.17. Boshlash ---------- */
    navbat = aralashtir(KALITLAR.slice());
    bandmi = true;
    tabloYangila();
    yoqHalqa();
    keyingi();
    sahnaDiv.focus({ preventScroll: true });
  }
})();
