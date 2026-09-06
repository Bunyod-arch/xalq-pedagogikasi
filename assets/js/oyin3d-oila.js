/* =========================================================
   «OILA SHAJARASI» — HAQIQIY 3D O‘YIN (Three.js · WebGL)
   3-modul: «Xalq pedagogikasida oila va oilaviy tarbiyaning
   aks etishi».

   O‘zbek hovlisida katta shajara daraxti o‘sib turibdi. Uning
   shoxlarida yettita bo‘sh uya bor. Sahna oldida oila a’zolari
   navbat bilan paydo bo‘ladi — bobo, buvi, ota, ona, o‘g‘il,
   qiz va beshikdagi chaqaloq. O‘yinchi har birini o‘z avlodiga
   va o‘z tomoniga qo‘yishi kerak:

     · eng yuqori shox — keksa avlod (bobo, buvi)
     · o‘rta shox      — ota-ona
     · quyi shox       — farzandlar
     · chap tomon      — erkaklar,  o‘ng tomon — ayollar
     · daraxt tagidagi beshik — chaqaloqning o‘rni

   Bu fayl mustaqil: o‘z tugmasini, o‘z uslublarini, o‘z HTML
   karkasini va butun 3D sahnasini o‘zi quradi. Saytdagi boshqa
   fayllarga tegmaydi.
   ========================================================= */
import * as THREE from '../vendor/three.module.min.js';
import {
  boboYasa, buviYasa, otaYasa, onaYasa, ogilYasa, qizYasa, chaqaloqYasa,
  supaYasa, tandirYasa, uyaYasa, shajaraYasa
} from './model-oila.js';
import { dasturxonYasa, nonYasa, choynakYasa, piyolaYasa } from './model-maishiy.js';

(function () {
  'use strict';

  /* =========================================================
     0. IDISH
     ========================================================= */
  var idish = document.getElementById('oyin3d-oila');
  if (!idish) return;
  if (idish.dataset.oyin3dBand) return;
  idish.dataset.oyin3dBand = 'oila';

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
     1. USLUBLAR — faqat shu o‘yin uchun (`o3ol-` old qo‘shimchasi)
     ========================================================= */
  if (!document.getElementById('o3ol-uslub')) {
    var uslub = document.createElement('style');
    uslub.id = 'o3ol-uslub';
    uslub.textContent = [
      '.o3ol-poster{border-radius:18px;padding:22px;background:linear-gradient(140deg,#1B3B6F,#10403F);',
      '  color:#FBF7F0;box-shadow:0 2px 4px rgba(26,22,20,.08),0 12px 28px rgba(26,22,20,.16);}',
      '.o3ol-poster h4{margin:0 0 8px;font-size:1.12rem;}',
      '.o3ol-qoida{margin:0 0 14px;font-size:.92rem;line-height:1.55;max-width:62ch;opacity:.94;}',
      '.o3ol-qoida b{color:#F0C77A;}',
      '.o3ol-boshla{cursor:pointer;border:0;border-radius:999px;padding:13px 26px;',
      '  background:#D4A24C;color:#2A1B08;font:inherit;font-size:1rem;font-weight:700;',
      '  box-shadow:0 6px 18px rgba(26,22,20,.28);transition:transform .15s ease,background .15s ease;}',
      '.o3ol-boshla:hover{background:#E3B564;transform:translateY(-2px);}',
      '.o3ol-boshla:active{transform:translateY(1px);}',
      '.o3ol-sahna{position:relative;width:100%;border-radius:18px;overflow:hidden;',
      '  background:#E7D8BC;box-shadow:0 2px 4px rgba(26,22,20,.08),0 12px 28px rgba(26,22,20,.14);}',
      '.o3ol-sahna canvas{display:block;width:100%;height:auto;touch-action:manipulation;}',
      '.o3ol-ust{position:absolute;inset:0;pointer-events:none;font:inherit;}',
      '.o3ol-qator{position:absolute;top:11px;left:11px;right:11px;display:flex;',
      '  align-items:flex-start;justify-content:space-between;gap:8px;flex-wrap:wrap;}',
      '.o3ol-tabl{flex:0 0 auto;display:inline-flex;gap:6px;align-items:baseline;',
      '  padding:7px 14px;border-radius:999px;background:rgba(251,247,240,.93);color:#1B3B6F;',
      '  font-size:.84rem;font-weight:600;white-space:nowrap;box-shadow:0 2px 8px rgba(26,22,20,.18);}',
      '.o3ol-tabl b{font-size:1.02rem;color:#C1502E;}',
      '.o3ol-nom{flex:0 1 auto;min-width:0;padding:8px 18px;border-radius:999px;',
      '  background:rgba(27,59,111,.94);color:#FBF7F0;font-size:1rem;font-weight:700;',
      '  line-height:1.25;text-align:center;box-shadow:0 4px 14px rgba(26,22,20,.28);}',
      '.o3ol-past{position:absolute;left:12px;right:12px;bottom:12px;text-align:center;}',
      '.o3ol-xabar{display:inline-block;margin:0;max-width:100%;padding:7px 16px;border-radius:999px;',
      '  background:rgba(26,40,30,.64);color:#FBF7F0;font-size:.85rem;font-weight:600;line-height:1.35;}',
      '.o3ol-xabar:empty{display:none;}',
      '.o3ol-xabar.togri{background:rgba(31,84,52,.88);color:#DFF6E4;}',
      '.o3ol-xabar.xato{background:rgba(150,52,26,.88);color:#FFE2D6;}',
      '.o3ol-natija{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;',
      '  justify-content:center;gap:10px;text-align:center;padding:20px;',
      '  background:rgba(16,64,63,.92);color:#FBF7F0;}',
      '.o3ol-natija h4{margin:0;font-size:1.25rem;}',
      '.o3ol-foiz{font-size:2.4rem;font-weight:800;color:#D4A24C;line-height:1;}',
      '.o3ol-natija p{margin:0;font-size:.92rem;max-width:36ch;line-height:1.5;}',
      '.o3ol-qayta{pointer-events:auto;cursor:pointer;margin-top:6px;padding:10px 22px;border:0;',
      '  border-radius:999px;background:#D4A24C;color:#2A1B08;font:inherit;font-size:.95rem;',
      '  font-weight:700;box-shadow:0 4px 12px rgba(26,22,20,.3);transition:transform .15s ease;}',
      '.o3ol-qayta:hover{transform:translateY(-2px);}',
      '.o3ol-xato{margin:0;padding:22px;border-radius:16px;background:#FBF7F0;color:#1B3B6F;',
      '  text-align:center;font-weight:600;}',
      '.o3ol-tor .o3ol-qator{top:7px;left:7px;right:7px;gap:5px;}',
      '.o3ol-tor .o3ol-tabl{padding:4px 9px;font-size:.7rem;gap:4px;}',
      '.o3ol-tor .o3ol-tabl b{font-size:.82rem;}',
      '.o3ol-tor .o3ol-nom{padding:5px 11px;font-size:.8rem;}',
      '.o3ol-tor .o3ol-past{left:7px;right:7px;bottom:8px;}',
      '.o3ol-tor .o3ol-xabar{padding:5px 11px;font-size:.72rem;}',
      '.o3ol-tor .o3ol-foiz{font-size:1.9rem;}',
      '.o3ol-tor .o3ol-natija h4{font-size:1.05rem;}',
      '.o3ol-tor .o3ol-natija p{font-size:.8rem;}',
      '@media (prefers-reduced-motion: reduce){.o3ol-boshla,.o3ol-qayta{transition:none;}}'
    ].join('\n');
    document.head.appendChild(uslub);
  }

  /* =========================================================
     2. POSTER — ko‘rinadigan tugma. 3D sahna faqat bosilganda
        quriladi (sahifa tez ochilsin, batareya tejalsin).
     ========================================================= */
  var poster = document.createElement('div');
  poster.className = 'o3ol-poster';
  poster.innerHTML =
    '<h4>Oila shajarasi — 3D o‘yin</h4>' +
    '<p class="o3ol-qoida">Hovlidagi shajara daraxtining shoxlarida yettita bo‘sh uya bor. ' +
    'Oila a’zolarini o‘z o‘rniga qo‘ying: <b>eng yuqori shox</b> — bobo va buvi, ' +
    '<b>o‘rta shox</b> — ota va ona, <b>quyi shox</b> — farzandlar. ' +
    '<b>Chap tomon</b> — erkaklar, <b>o‘ng tomon</b> — ayollar. ' +
    'Daraxt tagidagi <b>beshik</b> — chaqaloqning o‘rni.</p>' +
    '<button type="button" class="o3ol-boshla">▶ 3D o‘yinni boshlash</button>';
  idish.appendChild(poster);

  var boshlaTug = poster.querySelector('.o3ol-boshla');
  boshlaTug.addEventListener('click', function () {
    if (!webglBor()) {
      poster.innerHTML = '<p class="o3ol-xato">Brauzeringiz 3D grafikani ' +
        'qo‘llab-quvvatlamaydi. Modulning boshqa topshiriqlaridan foydalaning.</p>';
      return;
    }
    boshlaTug.disabled = true;
    boshlaTug.textContent = 'Sahna tayyorlanmoqda…';
    // Brauzer tugma holatini chizib ulgursin
    requestAnimationFrame(function () { requestAnimationFrame(qur); });
  });

  /* =========================================================
     3. SAHNANI QURISH
     ========================================================= */
  function qur() {
    var sahnaDiv = document.createElement('div');
    sahnaDiv.className = 'o3ol-sahna';
    sahnaDiv.innerHTML =
      '<canvas></canvas>' +
      '<div class="o3ol-ust">' +
        '<div class="o3ol-qator">' +
          '<span class="o3ol-tabl">Ball <b class="o3ol-ball">0</b></span>' +
          '<span class="o3ol-nom">Tayyorlanmoqda…</span>' +
          '<span class="o3ol-tabl">Qoldi <b class="o3ol-qoldi">7</b></span>' +
        '</div>' +
        '<div class="o3ol-past">' +
          '<p class="o3ol-xabar" role="status">Uyani bosib tanlang</p>' +
        '</div>' +
      '</div>';
    idish.appendChild(sahnaDiv);

    var canvas  = sahnaDiv.querySelector('canvas');
    var ballEl  = sahnaDiv.querySelector('.o3ol-ball');
    var qoldiEl = sahnaDiv.querySelector('.o3ol-qoldi');
    var nomEl   = sahnaDiv.querySelector('.o3ol-nom');
    var xabarEl = sahnaDiv.querySelector('.o3ol-xabar');

    /* ---------- Renderer ---------- */
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas, antialias: true, alpha: false, powerPreference: 'high-performance'
      });
    } catch (e) {
      sahnaDiv.remove();
      poster.innerHTML = '<p class="o3ol-xato">3D sahnani ochib bo‘lmadi.</p>';
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.04;

    poster.remove();

    var sahna = new THREE.Scene();
    sahna.fog = new THREE.Fog(0xE7D8BC, 26, 62);

    var kamera = new THREE.PerspectiveCamera(41, 16 / 10, 0.1, 140);
    kamera.position.set(0, 2.95, 10.9);
    kamera.lookAt(0, 2.15, 0.6);

    /* ---------- Yorug‘lik — kechki oltin yorug‘lik ---------- */
    sahna.add(new THREE.HemisphereLight(0xCDE3F5, 0xB08A5E, 1.12));

    var quyosh = new THREE.DirectionalLight(0xFFEBC8, 2.25);
    quyosh.position.set(7.5, 13, 9);
    quyosh.castShadow = true;
    quyosh.shadow.mapSize.set(1024, 1024);
    quyosh.shadow.camera.near = 1;
    quyosh.shadow.camera.far = 40;
    quyosh.shadow.camera.left = -13;
    quyosh.shadow.camera.right = 13;
    quyosh.shadow.camera.top = 13;
    quyosh.shadow.camera.bottom = -6;
    quyosh.shadow.bias = -0.0012;
    quyosh.shadow.normalBias = 0.02;
    sahna.add(quyosh);
    sahna.add(quyosh.target);
    quyosh.target.position.set(0, 2, 0);

    var toldiruvchi = new THREE.DirectionalLight(0xC98B5E, 0.35);
    toldiruvchi.position.set(-8, 4, -6);
    sahna.add(toldiruvchi);

    /* ---------- Osmon gumbazi ---------- */
    function osmonToqima() {
      var c = document.createElement('canvas');
      c.width = 4; c.height = 256;
      var k = c.getContext('2d');
      var gr = k.createLinearGradient(0, 0, 0, 256);
      gr.addColorStop(0.00, '#7FB6E2');
      gr.addColorStop(0.42, '#BCD8EC');
      gr.addColorStop(0.74, '#EBD9BC');
      gr.addColorStop(1.00, '#E7D8BC');
      k.fillStyle = gr; k.fillRect(0, 0, 4, 256);
      var t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }
    var osmon = new THREE.Mesh(
      new THREE.SphereGeometry(64, 24, 16),
      new THREE.MeshBasicMaterial({
        map: osmonToqima(), side: THREE.BackSide, fog: false, depthWrite: false
      })
    );
    sahna.add(osmon);

    /* ---------- Hovli yeri ---------- */
    var yer = new THREE.Mesh(
      new THREE.CircleGeometry(42, 40),
      new THREE.MeshStandardMaterial({ color: 0xC6A47C, roughness: 0.99 })
    );
    yer.rotation.x = -Math.PI / 2;
    yer.receiveShadow = true;
    sahna.add(yer);

    // Daraxt tagidagi maysa halqasi
    var maysa = new THREE.Mesh(
      new THREE.CircleGeometry(5.6, 32),
      new THREE.MeshStandardMaterial({ color: 0x84A45C, roughness: 0.98 })
    );
    maysa.rotation.x = -Math.PI / 2;
    maysa.position.set(0, 0.012, -0.4);
    maysa.receiveShadow = true;
    sahna.add(maysa);

    /* ---------- Uy devori va ayvon ---------- */
    var loyMat  = new THREE.MeshStandardMaterial({ color: 0xD8C4A2, roughness: 0.98 });
    var yogMat  = new THREE.MeshStandardMaterial({ color: 0x8A6A44, roughness: 0.88 });
    var yogTMat = new THREE.MeshStandardMaterial({ color: 0x6E5334, roughness: 0.9 });

    var devor = new THREE.Mesh(new THREE.BoxGeometry(22, 5.0, 0.5), loyMat);
    devor.position.set(0, 2.5, -11.5);
    devor.receiveShadow = true;
    sahna.add(devor);

    // Eshik — ikki tavaqali o‘yma darvoza
    var eshik = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.0, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x1B3B6F, roughness: 0.7 }));
    eshik.position.set(-6.4, 1.5, -11.22);
    sahna.add(eshik);
    for (var ei = 0; ei < 2; ei++) {
      var tav = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.0, 0.06), yogTMat);
      tav.position.set(-6.4 + (ei ? 0.02 : -0.02) * 40, 1.5, -11.14);
      sahna.add(tav);
    }
    var eshikYoy = new THREE.Mesh(new THREE.TorusGeometry(1.12, 0.12, 8, 20, Math.PI), yogMat);
    eshikYoy.position.set(-6.4, 3.0, -11.2);
    sahna.add(eshikYoy);

    // Derazalar — panjarali
    [3.2, 7.6].forEach(function (dx) {
      var d = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.5, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x2A3E52, roughness: 0.35, metalness: 0.25 }));
      d.position.set(dx, 2.5, -11.22);
      sahna.add(d);
      for (var p = 0; p < 3; p++) {
        var tik = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.5, 0.08), yogMat);
        tik.position.set(dx - 0.6 + p * 0.6, 2.5, -11.14);
        sahna.add(tik);
      }
      var kok = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.07, 0.08), yogMat);
      kok.position.set(dx, 2.5, -11.14);
      sahna.add(kok);
    });

    // Ayvon ustunlari — o‘yma tayanchlar
    [-9.0, -3.0, 3.0, 9.0].forEach(function (ux) {
      var poy = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.3, 12),
        new THREE.MeshStandardMaterial({ color: 0xA9714B, roughness: 0.95 }));
      poy.position.set(ux, 0.15, -9.4);
      poy.receiveShadow = true;
      sahna.add(poy);

      var ust = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.20, 3.5, 10), yogMat);
      ust.position.set(ux, 2.05, -9.4);
      ust.castShadow = true;
      sahna.add(ust);

      // O‘yma halqalar
      [1.0, 2.4].forEach(function (hy) {
        var h = new THREE.Mesh(new THREE.TorusGeometry(0.20, 0.035, 6, 14), yogTMat);
        h.rotation.x = -Math.PI / 2;
        h.position.set(ux, hy, -9.4);
        sahna.add(h);
      });

      var boshi = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.36, 0.5), yogTMat);
      boshi.position.set(ux, 3.95, -9.4);
      sahna.add(boshi);
    });

    var tosin = new THREE.Mesh(new THREE.BoxGeometry(20, 0.3, 0.45), yogTMat);
    tosin.position.set(0, 4.25, -9.4);
    sahna.add(tosin);
    var shipi = new THREE.Mesh(new THREE.BoxGeometry(20, 0.22, 2.4), yogMat);
    shipi.position.set(0, 4.5, -10.4);
    shipi.castShadow = true;
    sahna.add(shipi);

    /* ---------- Hovli buyumlari ---------- */
    var supa = supaYasa();
    supa.scale.setScalar(1.9);
    supa.position.set(5.9, 0, -4.6);
    supa.rotation.y = -0.42;
    sahna.add(supa);

    var dast = dasturxonYasa();
    dast.scale.setScalar(1.35);
    dast.position.set(5.9, 0.62, -4.6);
    dast.rotation.y = -0.42;
    sahna.add(dast);

    var non = nonYasa();
    non.scale.setScalar(1.3);
    non.position.set(5.62, 0.64, -4.35);
    sahna.add(non);

    var choynak = choynakYasa();
    choynak.scale.setScalar(1.3);
    choynak.position.set(6.35, 0.64, -4.85);
    sahna.add(choynak);

    var piyola = piyolaYasa();
    piyola.scale.setScalar(1.3);
    piyola.position.set(6.02, 0.64, -5.05);
    sahna.add(piyola);

    var tandir = tandirYasa();
    tandir.scale.setScalar(1.7);
    tandir.position.set(-6.3, 0, -4.8);
    sahna.add(tandir);

    // Bezak daraxtlar va butalar
    var tanaGeo = new THREE.CylinderGeometry(0.16, 0.24, 1.8, 6);
    var bargGeo = new THREE.SphereGeometry(1.0, 10, 8);
    var tanaMat = new THREE.MeshStandardMaterial({ color: 0x6B4526, roughness: 0.92 });
    var bargMat = new THREE.MeshStandardMaterial({ color: 0x39764A, roughness: 0.88 });
    [[-11.5, -7.5, 1.15], [11.8, -7.0, 1.05], [-13.5, -2.0, 0.9], [13.2, -2.6, 0.95]]
      .forEach(function (d) {
        var t = new THREE.Mesh(tanaGeo, tanaMat);
        t.position.set(d[0], 0.9 * d[2], d[1]);
        t.scale.setScalar(d[2]);
        t.castShadow = true;
        sahna.add(t);
        var b = new THREE.Mesh(bargGeo, bargMat);
        b.position.set(d[0], 2.5 * d[2], d[1]);
        b.scale.set(1.2 * d[2], 0.9 * d[2], 1.0 * d[2]);
        b.castShadow = true;
        sahna.add(b);
      });

    /* =========================================================
       4. SHAJARA DARAXTI VA UYALAR
       ========================================================= */
    var AZOLAR = [
      { kalit: 'bobo',     nom: 'BOBO',     yasa: boboYasa,     old: 1.25, uya: 0.70,
        izoh: 'Bobo — eng keksa avlod, ertak va o‘git egasi.' },
      { kalit: 'buvi',     nom: 'BUVI',     yasa: buviYasa,     old: 1.30, uya: 0.72,
        izoh: 'Buvi — nevaralarga alla va urf-odat o‘rgatgan murabbiy.' },
      { kalit: 'ota',      nom: 'OTA',      yasa: otaYasa,      old: 1.24, uya: 0.70,
        izoh: '«Otaning gapi ikki qilinmagan» — ota oilaning tayanchi.' },
      { kalit: 'ona',      nom: 'ONA',      yasa: onaYasa,      old: 1.28, uya: 0.71,
        izoh: 'Ona — bolaning birinchi ustozi va sirdoshi.' },
      { kalit: 'ogil',     nom: 'O‘G‘IL',   yasa: ogilYasa,     old: 1.60, uya: 0.90,
        izoh: 'O‘g‘il bolaga otaning ustozligi asosiy o‘rin tutgan.' },
      { kalit: 'qiz',      nom: 'QIZ',      yasa: qizYasa,      old: 1.68, uya: 0.94,
        izoh: 'Qiz bolaga onaning rahnamoligi — odob va ro‘zg‘or sabog‘i.' },
      { kalit: 'chaqaloq', nom: 'CHAQALOQ', yasa: chaqaloqYasa, old: 1.75, uya: 1.10,
        izoh: 'Tarbiya beshikdan, alla bilan boshlanadi.' }
    ];

    var UYA_JOY = [
      { kalit: 'bobo', x: -1.95, y: 4.05, z: 0.18, qavat: 'Eng yuqori shox — keksa avlod' },
      { kalit: 'buvi', x:  1.95, y: 4.05, z: 0.18, qavat: 'Eng yuqori shox — keksa avlod' },
      { kalit: 'ota',  x: -3.35, y: 2.55, z: 0.18, qavat: 'O‘rta shox — ota-ona' },
      { kalit: 'ona',  x:  3.35, y: 2.55, z: 0.18, qavat: 'O‘rta shox — ota-ona' },
      { kalit: 'ogil', x: -4.45, y: 1.35, z: 0.18, qavat: 'Quyi shox — farzandlar' },
      { kalit: 'qiz',  x:  4.45, y: 1.35, z: 0.18, qavat: 'Quyi shox — farzandlar' },
      { kalit: 'chaqaloq', x: -2.05, y: 0.05, z: 2.15, qavat: 'Daraxt tagi — beshik o‘rni' }
    ];

    var shajara = shajaraYasa(UYA_JOY.slice(0, 6));
    sahna.add(shajara);

    var uyalar = [];
    var nishonlar = [];

    UYA_JOY.forEach(function (j, i) {
      var u = uyaYasa();
      u.scale.setScalar(1.5);
      u.position.set(j.x, j.y, j.z);
      sahna.add(u);

      // Bosish maydoni — ko‘rinmas, lekin kattaroq
      var bos = new THREE.Mesh(
        new THREE.CylinderGeometry(0.95, 0.95, 1.5, 10),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
      );
      bos.position.set(j.x, j.y + 0.6, j.z);
      bos.userData.uIdx = i;
      sahna.add(bos);
      nishonlar.push(bos);

      uyalar.push({
        guruh: u, halqa: u.userData.halqa, joy: j,
        bazaY: j.y, yonish: 0, silkinish: 0, band: null
      });
    });

    /* ---------- Old maydoncha — navbatdagi a’zo shu yerda turadi ---------- */
    var OLD_Y = 0.60;                      // supa usti — a’zo shu balandlikda turadi
    var maydon = new THREE.Group();
    maydon.position.set(0, 0, 3.70);
    sahna.add(maydon);

    // Ko‘tarma supa — g‘isht poydevor va yog‘och taxta
    var supaPoy = new THREE.Mesh(
      new THREE.CylinderGeometry(1.42, 1.50, 0.30, 30),
      new THREE.MeshStandardMaterial({ color: 0xA9714B, roughness: 0.97 })
    );
    supaPoy.position.y = 0.15;
    supaPoy.receiveShadow = true; supaPoy.castShadow = true;
    maydon.add(supaPoy);

    var supaTaxta = new THREE.Mesh(
      new THREE.CylinderGeometry(1.26, 1.30, 0.26, 30),
      new THREE.MeshStandardMaterial({ color: 0x8A6A44, roughness: 0.9 })
    );
    supaTaxta.position.y = 0.43;
    supaTaxta.receiveShadow = true; supaTaxta.castShadow = true;
    maydon.add(supaTaxta);

    var gilam = new THREE.Mesh(
      new THREE.CylinderGeometry(1.14, 1.14, 0.08, 30),
      new THREE.MeshStandardMaterial({ color: 0x8C3A2B, roughness: 0.96 })
    );
    gilam.position.y = OLD_Y - 0.04;
    gilam.receiveShadow = true;
    maydon.add(gilam);
    [0.98, 0.74].forEach(function (r, k) {
      var h = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.032, 8, 40),
        new THREE.MeshStandardMaterial({ color: 0xD4A24C, roughness: 0.45, metalness: 0.35 })
      );
      h.rotation.x = -Math.PI / 2;
      h.position.y = OLD_Y + 0.001 + k * 0.001;
      maydon.add(h);
    });

    /* ---------- Oila a’zolarining modellari ---------- */
    var modellar = {};
    AZOLAR.forEach(function (a) {
      var m = a.yasa();
      m.scale.setScalar(a.old);
      m.visible = false;
      sahna.add(m);
      modellar[a.kalit] = m;
    });

    /* =========================================================
       5. O‘YIN HOLATI
       ========================================================= */
    var navbat = [], joriy = null, ball = 0, urinilgan = 0;
    var bloklangan = true, tugadi = false, natijaDiv = null;
    var vazifalar = [];

    function aralash(a) {
      var r = a.slice();
      for (var i = r.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = r[i]; r[i] = r[j]; r[j] = t;
      }
      return r;
    }

    function xabar(m, sinf) {
      xabarEl.textContent = m || '';
      xabarEl.className = 'o3ol-xabar' + (sinf ? ' ' + sinf : '');
    }

    /* ---------- Animatsiya navbati ---------- */
    function qoshVazifa(dav, qadam, tugash) {
      vazifalar.push({
        t: 0, dav: kamHarakat ? 0.001 : dav, qadam: qadam, tugash: tugash
      });
    }
    function yumshoq(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

    /* ---------- Navbatdagi a’zoni maydonga chiqarish ---------- */
    function keyingisi() {
      if (!navbat.length) { yakunla(); return; }
      joriy = navbat.shift();
      var m = modellar[joriy.kalit];
      m.visible = true;
      m.scale.setScalar(joriy.old);
      m.position.set(maydon.position.x, OLD_Y + 2.4, maydon.position.z);
      m.rotation.set(0, 0, 0);
      nomEl.textContent = joriy.nom;
      qoldiEl.textContent = String(navbat.length + 1);
      bloklangan = true;

      qoshVazifa(0.55, function (p) {
        var e = yumshoq(p);
        m.position.y = OLD_Y + 2.4 * (1 - e);
      }, function () {
        m.position.y = OLD_Y;
        bloklangan = false;
        xabar(joriy.izoh + ' Uni qaysi uyaga qo‘yasiz?');
      });
    }

    /* ---------- Uyaga qo‘yish ---------- */
    function tanlandi(uIdx) {
      if (bloklangan || tugadi || !joriy) return;
      var uya = uyalar[uIdx];
      if (uya.band) {
        xabar('Bu uya band. Boshqa uyani tanlang.', 'xato');
        uya.silkinish = 1;
        return;
      }
      bloklangan = true;
      urinilgan++;

      var togri = (uya.joy.kalit === joriy.kalit);
      var m = modellar[joriy.kalit];
      var boshX = m.position.x, boshY = m.position.y, boshZ = m.position.z;
      var nishonY = uya.joy.y + 0.14;
      var oldOlcham = joriy.old, uyaOlcham = joriy.uya;

      if (togri) {
        ball++;
        ballEl.textContent = String(ball);
        uya.band = joriy.kalit;
        uya.yonish = 1;
        xabar('To‘g‘ri! ' + uya.joy.qavat + '.', 'togri');

        qoshVazifa(0.75, function (p) {
          var e = yumshoq(p);
          m.position.x = boshX + (uya.joy.x - boshX) * e;
          m.position.z = boshZ + (uya.joy.z - boshZ) * e;
          m.position.y = boshY + (nishonY - boshY) * e + Math.sin(p * Math.PI) * 1.5;
          m.rotation.y = e * Math.PI * 2;
          m.scale.setScalar(oldOlcham + (uyaOlcham - oldOlcham) * e);
        }, function () {
          m.position.set(uya.joy.x, nishonY, uya.joy.z);
          m.rotation.y = 0;
          m.scale.setScalar(uyaOlcham);
        });
      } else {
        var kerak = null;
        for (var i = 0; i < uyalar.length; i++) {
          if (uyalar[i].joy.kalit === joriy.kalit) { kerak = uyalar[i]; break; }
        }
        uya.silkinish = 1;
        xabar('Bu uya emas. ' + joriy.nom + 'ning o‘rni — ' +
              (kerak ? kerak.joy.qavat.toLowerCase() : 'boshqa shox') + '.', 'xato');

        // Xato bo‘lsa ham to‘g‘ri joyini ko‘rsatib qo‘yamiz — o‘rgatuvchi javob
        qoshVazifa(0.35, function (p) {
          m.position.y = boshY + Math.sin(p * Math.PI * 3) * 0.14;
          m.rotation.z = Math.sin(p * Math.PI * 6) * 0.12;
        }, function () { m.rotation.z = 0; });

        if (kerak) {
          kerak.band = joriy.kalit;
          kerak.yonish = 1;
          qoshVazifa(0.85, function (p) {
            var e = yumshoq(p);
            m.position.x = boshX + (kerak.joy.x - boshX) * e;
            m.position.z = boshZ + (kerak.joy.z - boshZ) * e;
            m.position.y = boshY + (kerak.joy.y + 0.14 - boshY) * e + Math.sin(p * Math.PI) * 1.4;
            m.scale.setScalar(oldOlcham + (uyaOlcham - oldOlcham) * e);
          }, function () {
            m.position.set(kerak.joy.x, kerak.joy.y + 0.14, kerak.joy.z);
            m.scale.setScalar(uyaOlcham);
          });
        }
      }

      qoshVazifa(0.45, function () {}, function () {
        joriy = null;
        keyingisi();
      });
    }

    /* ---------- Yakun ---------- */
    function yakunla() {
      tugadi = true;
      bloklangan = true;
      nomEl.textContent = 'Shajara to‘ldi';
      qoldiEl.textContent = '0';
      xabar('');

      var foiz = urinilgan ? Math.round((ball / urinilgan) * 100) : 0;
      var xulosa;
      if (foiz >= 90) {
        xulosa = 'Barakalla! Uch avlod — bobo-buvi, ota-ona va farzandlar — ' +
                 'o‘z o‘rnini topdi. «Bola aziz, odobi undan aziz».';
      } else if (foiz >= 60) {
        xulosa = 'Yaxshi natija. Avlodlar tartibini yana bir bor ko‘rib chiqing: ' +
                 'keksa avlod yuqorida, farzandlar quyi shoxda.';
      } else {
        xulosa = 'Ma’ruza matnidagi oila tarkibiga qaytib qarang va qayta urinib ko‘ring. ' +
                 '«Bir bolaga butun mahalla ota-ona».';
      }

      natijaDiv = document.createElement('div');
      natijaDiv.className = 'o3ol-natija';
      natijaDiv.innerHTML =
        '<h4>Oila shajarasi tayyor</h4>' +
        '<span class="o3ol-foiz">' + foiz + '%</span>' +
        '<p>' + ball + ' ta a’zo ' + urinilgan + ' urinishda to‘g‘ri joylashtirildi.</p>' +
        '<p>' + xulosa + '</p>' +
        '<button type="button" class="o3ol-qayta">Qaytadan o‘ynash</button>';
      sahnaDiv.appendChild(natijaDiv);
      natijaDiv.querySelector('.o3ol-qayta').addEventListener('click', qaytaBoshla);

      try {
        if (window.Xotira && window.Xotira.modulYoz) {
          window.Xotira.modulYoz(3, { oyin3d: foiz });
        }
      } catch (e) {}
    }

    function qaytaBoshla() {
      if (natijaDiv) { natijaDiv.remove(); natijaDiv = null; }
      vazifalar.length = 0;
      ball = 0; urinilgan = 0; tugadi = false; bloklangan = true;
      ballEl.textContent = '0';
      uyalar.forEach(function (u) { u.band = null; u.yonish = 0; u.silkinish = 0; });
      AZOLAR.forEach(function (a) { modellar[a.kalit].visible = false; });
      navbat = aralash(AZOLAR);
      xabar('Uyani bosib tanlang');
      keyingisi();
    }

    /* =========================================================
       6. BOSISH VA KO‘RSATKICH
       ========================================================= */
    var nur = new THREE.Raycaster();
    var nuqta = new THREE.Vector2();
    var ustida = -1;

    function joylash(e) {
      var r = canvas.getBoundingClientRect();
      nuqta.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      nuqta.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      nur.setFromCamera(nuqta, kamera);
      var k = nur.intersectObjects(nishonlar, false);
      return k.length ? k[0].object.userData.uIdx : -1;
    }

    canvas.addEventListener('pointerdown', function (e) {
      var i = joylash(e);
      if (i >= 0) tanlandi(i);
    });
    canvas.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      ustida = joylash(e);
      canvas.style.cursor = (ustida >= 0 && !bloklangan) ? 'pointer' : 'default';
    });
    canvas.addEventListener('pointerleave', function () { ustida = -1; });

    /* =========================================================
       7. O‘LCHAM VA RENDER HALQASI
       ========================================================= */
    function olcham() {
      var w = idish.clientWidth || 640;
      var h = Math.max(300, Math.min(Math.round(w * 0.70), 600));
      renderer.setSize(w, h, false);
      kamera.aspect = w / h;
      kamera.updateProjectionMatrix();
      sahnaDiv.classList.toggle('o3ol-tor', w < 560);
    }
    olcham();
    var kuzatuvchi = null;
    if (window.ResizeObserver) {
      kuzatuvchi = new ResizeObserver(olcham);
      kuzatuvchi.observe(idish);
    } else {
      window.addEventListener('resize', olcham);
    }

    var oltinRang = new THREE.Color(0xD4A24C);
    var qizilRang = new THREE.Color(0xC1502E);
    var yonganRang = new THREE.Color(0xFFE9A8);

    var ishlayapti = false, oxirgi = 0, vaqt = 0;

    function halqa(t) {
      if (!ishlayapti) return;
      var dt = Math.min((t - oxirgi) / 1000, 0.05);
      oxirgi = t;
      vaqt += dt;

      // Animatsiya navbati
      if (vazifalar.length) {
        var v = vazifalar[0];
        v.t += dt;
        var p = Math.min(v.t / v.dav, 1);
        v.qadam(p);
        if (p >= 1) { if (v.tugash) v.tugash(); vazifalar.shift(); }
      }

      // Maydondagi a’zo sekin aylanadi
      if (joriy && !kamHarakat) {
        var m = modellar[joriy.kalit];
        if (m && !vazifalar.length) m.rotation.y = Math.sin(vaqt * 0.7) * 0.55;
      }

      // Uyalarning holati
      uyalar.forEach(function (u, i) {
        if (u.yonish > 0) u.yonish = Math.max(0, u.yonish - dt * 1.2);
        if (u.silkinish > 0) u.silkinish = Math.max(0, u.silkinish - dt * 2.2);

        var rang = u.band ? oltinRang : (u.silkinish > 0 ? qizilRang : oltinRang);
        u.halqa.material.color.copy(rang);
        if (u.yonish > 0) u.halqa.material.color.lerp(yonganRang, u.yonish);

        var kotarish = (i === ustida && !u.band && !bloklangan) ? 0.10 : 0;
        var silk = u.silkinish > 0 ? Math.sin(u.silkinish * Math.PI * 8) * 0.10 : 0;
        u.guruh.position.y = u.bazaY + kotarish + Math.abs(silk) * 0.4;
        u.guruh.position.x = u.joy.x + silk;
        u.guruh.scale.setScalar(1.5 + (i === ustida && !u.band ? 0.08 : 0));
      });

      renderer.render(sahna, kamera);
      requestAnimationFrame(halqa);
    }

    function yoq() {
      if (ishlayapti) return;
      ishlayapti = true;
      oxirgi = performance.now();
      requestAnimationFrame(halqa);
    }
    function ochir() { ishlayapti = false; }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (y) {
        y[0].isIntersecting ? yoq() : ochir();
      }, { threshold: 0.02 }).observe(sahnaDiv);
    } else { yoq(); }
    yoq();

    window.addEventListener('pagehide', function () {
      ochir();
      if (kuzatuvchi) { try { kuzatuvchi.disconnect(); } catch (e) {} }
      try { renderer.dispose(); } catch (e) {}
    });

    /* ---------- Boshlash ---------- */
    navbat = aralash(AZOLAR);
    keyingisi();
  }
})();
