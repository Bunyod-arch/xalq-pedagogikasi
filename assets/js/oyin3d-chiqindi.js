/* =========================================================
   «CHIQINDILARNI SARALASH» — HAQIQIY 3D O‘YIN (Three.js · WebGL)
   14-modul: tabiatni muhofaza qilish.

   Yashil maysazorda to‘rtta hajmli konteyner turadi: Qog‘oz (ko‘k),
   Plastik (sariq), Shisha (yashil), Organik (jigarrang). Sahna
   markazida chiqindi predmeti aylanib turadi — o‘yinchi uni to‘g‘ri
   konteynerga bosib tashlaydi. 11 ta predmetdan keyin natija chiqadi.

   Bu fayl mustaqil: o‘z HTML karkasini, o‘z uslublarini va
   butun 3D sahnasini o‘zi quradi. Boshqa fayllarga tegmaydi.
   ========================================================= */
import * as THREE from '../vendor/three.module.min.js';

(function () {
  'use strict';

  /* =========================================================
     0. IDISHNI TOPISH
     Avval maxsus `#oyin3d-chiqindi`, topilmasa umumiy `#oyin3d`.
     Agar idish topilmasa yoki uni boshqa 3D o‘yin band qilib
     bo‘lgan bo‘lsa — jimgina chiqamiz, sayt buzilmaydi.
     ========================================================= */
  var idish = document.getElementById('oyin3d-chiqindi') ||
              document.getElementById('oyin3d');
  if (!idish) return;
  if (idish.querySelector('canvas')) return;      // boshqa o‘yin band qilgan
  if (idish.dataset.oyin3dBand) return;
  idish.dataset.oyin3dBand = 'chiqindi';

  /* =========================================================
     1. WEBGL BORMI?
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
    p.className = 'o3ch-xato';
    p.textContent = matn;
    idish.appendChild(p);
  }
  if (!webglBor()) {
    xatoXabari('Brauzeringiz 3D ni qo‘llab-quvvatlamaydi.');
    return;
  }

  /* Harakatni kamaytirish rejimi — animatsiyalar qisqaradi. */
  var kamHarakat = !!(window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var tezlik = kamHarakat ? 0.45 : 1;

  /* =========================================================
     2. USLUBLAR — faqat shu o‘yinga tegishli (`o3ch-` old qo‘shimchasi),
        shuning uchun saytdagi boshqa uslublar bilan to‘qnashmaydi.
     ========================================================= */
  if (!document.getElementById('o3ch-uslub')) {
    var uslub = document.createElement('style');
    uslub.id = 'o3ch-uslub';
    uslub.textContent = [
      '.o3ch-sahna{position:relative;width:100%;border-radius:18px;overflow:hidden;',
      '  background:#DCEBD6;box-shadow:0 2px 4px rgba(26,22,20,.08),0 12px 28px rgba(26,22,20,.14);}',
      '.o3ch-sahna canvas{display:block;width:100%;height:auto;touch-action:manipulation;}',
      '.o3ch-ust{position:absolute;inset:0;pointer-events:none;font:inherit;}',
      '.o3ch-qator{position:absolute;top:11px;left:11px;right:11px;display:flex;',
      '  align-items:flex-start;justify-content:space-between;gap:8px;flex-wrap:wrap;}',
      '.o3ch-tabl{flex:0 0 auto;display:inline-flex;gap:6px;align-items:baseline;',
      '  padding:7px 14px;border-radius:999px;background:rgba(251,247,240,.92);color:#1B3B6F;',
      '  font-size:.84rem;font-weight:600;letter-spacing:.01em;white-space:nowrap;',
      '  box-shadow:0 2px 8px rgba(26,22,20,.18);}',
      '.o3ch-tabl b{font-size:1.02rem;color:#C1502E;}',
      '.o3ch-past{position:absolute;left:12px;right:12px;bottom:12px;text-align:center;}',
      '.o3ch-nom{flex:0 1 auto;order:0;min-width:0;',
      '  padding:8px 18px;border-radius:999px;background:rgba(27,59,111,.94);color:#FBF7F0;',
      '  font-size:1rem;font-weight:700;line-height:1.25;text-align:center;',
      '  box-shadow:0 4px 14px rgba(26,22,20,.28);}',
      '.o3ch-xabar{display:inline-block;margin:0;max-width:100%;padding:7px 16px;',
      '  border-radius:999px;background:rgba(26,40,30,.62);color:#FBF7F0;',
      '  font-size:.85rem;font-weight:600;line-height:1.35;}',
      '.o3ch-xabar:empty{display:none;}',
      '.o3ch-xabar.togri{background:rgba(31,84,52,.86);color:#DFF6E4;}',
      '.o3ch-xabar.xato{background:rgba(150,52,26,.86);color:#FFE2D6;}',
      '.o3ch-natija{position:absolute;inset:0;display:flex;flex-direction:column;',
      '  align-items:center;justify-content:center;gap:10px;text-align:center;padding:20px;',
      '  background:rgba(27,59,111,.9);color:#FBF7F0;}',
      '.o3ch-natija h4{margin:0;font-size:1.25rem;}',
      '.o3ch-natija .o3ch-foiz{font-size:2.4rem;font-weight:800;color:#D4A24C;line-height:1;}',
      '.o3ch-natija p{margin:0;font-size:.92rem;max-width:34ch;}',
      '.o3ch-qayta{pointer-events:auto;cursor:pointer;margin-top:6px;padding:10px 22px;',
      '  border:0;border-radius:999px;background:#D4A24C;color:#2A1B08;',
      '  font:inherit;font-size:.95rem;font-weight:700;',
      '  box-shadow:0 4px 12px rgba(26,22,20,.3);transition:transform .15s ease;}',
      '.o3ch-qayta:hover{transform:translateY(-2px);} .o3ch-qayta:active{transform:translateY(1px);}',
      '.o3ch-xato{margin:0;padding:22px;border-radius:16px;background:#FBF7F0;color:#1B3B6F;',
      '  text-align:center;font-weight:600;}',
      '.o3ch-tor .o3ch-qator{top:7px;left:7px;right:7px;gap:5px;}',
      '.o3ch-tor .o3ch-tabl{padding:4px 9px;font-size:.7rem;gap:4px;}',
      '.o3ch-tor .o3ch-tabl b{font-size:.82rem;}',
      '.o3ch-tor .o3ch-nom{padding:5px 11px;font-size:.8rem;}',
      '.o3ch-tor .o3ch-past{left:7px;right:7px;bottom:8px;}',
      '.o3ch-tor .o3ch-xabar{padding:5px 11px;font-size:.72rem;}',
      '.o3ch-tor .o3ch-natija .o3ch-foiz{font-size:1.9rem;}',
      '.o3ch-tor .o3ch-natija h4{font-size:1.05rem;}',
      '.o3ch-tor .o3ch-natija p{font-size:.8rem;}',
      '@media (prefers-reduced-motion: reduce){.o3ch-qayta{transition:none;}}'
    ].join('\n');
    document.head.appendChild(uslub);
  }

  /* =========================================================
     3. HTML KARKAS — canvas ustidagi ball va xabar paneli
     ========================================================= */
  var sahnaDiv = document.createElement('div');
  sahnaDiv.className = 'o3ch-sahna';
  sahnaDiv.innerHTML =
    '<canvas></canvas>' +
    '<div class="o3ch-ust">' +
      '<div class="o3ch-qator">' +
        '<span class="o3ch-tabl">Ball <b class="o3ch-ball">0</b></span>' +
        '<span class="o3ch-nom">Tayyorlanmoqda…</span>' +
        '<span class="o3ch-tabl">Qoldi <b class="o3ch-qoldi">11</b></span>' +
      '</div>' +
      '<div class="o3ch-past">' +
        '<p class="o3ch-xabar" role="status">Predmetni to‘g‘ri konteynerga bosing</p>' +
      '</div>' +
    '</div>';
  idish.appendChild(sahnaDiv);

  var canvas  = sahnaDiv.querySelector('canvas');
  var ballEl  = sahnaDiv.querySelector('.o3ch-ball');
  var qoldiEl = sahnaDiv.querySelector('.o3ch-qoldi');
  var nomEl   = sahnaDiv.querySelector('.o3ch-nom');
  var xabarEl = sahnaDiv.querySelector('.o3ch-xabar');

  /* =========================================================
     4. MA’LUMOT — konteynerlar va chiqindilar
     ========================================================= */
  var KONTEYNER = [
    { nom: 'Qog‘oz',  rang: 0x2C5FA8, quyuq: 0x1B3B6F, yorliq: '#1B3B6F' },
    { nom: 'Plastik', rang: 0xD4A24C, quyuq: 0x9C7226, yorliq: '#7A5417' },
    { nom: 'Shisha',  rang: 0x2F6B45, quyuq: 0x1E4A2E, yorliq: '#1E4A2E' },
    { nom: 'Organik', rang: 0x8A5A34, quyuq: 0x5C3A20, yorliq: '#5C3A20' }
  ];

  /* =========================================================
     5. RENDERER · SAHNA · KAMERA · YORUG‘LIK
     ========================================================= */
  var renderer, sahna, kamera;
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
  renderer.shadowMap.type = THREE.PCFShadowMap;   // yumshoq, eskirmagan
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;

  sahna = new THREE.Scene();
  sahna.fog = new THREE.Fog(0xCFE4D8, 24, 52);

  kamera = new THREE.PerspectiveCamera(44, 16 / 10, 0.1, 120);
  kamera.position.set(0, 5.6, 9.3);
  kamera.lookAt(0, 1.75, 1.1);

  /* Yumshoq osmon nuri + quyosh (soya beruvchi) */
  var osmonNur = new THREE.HemisphereLight(0xBFDDF5, 0x6E9950, 1.15);
  sahna.add(osmonNur);

  var quyosh = new THREE.DirectionalLight(0xFFF4E0, 2.35);
  quyosh.position.set(6.5, 11, 7.5);
  quyosh.castShadow = true;
  quyosh.shadow.mapSize.set(1024, 1024);
  quyosh.shadow.camera.near = 1;
  quyosh.shadow.camera.far = 34;
  quyosh.shadow.camera.left = -11;
  quyosh.shadow.camera.right = 11;
  quyosh.shadow.camera.top = 9;
  quyosh.shadow.camera.bottom = -6;
  quyosh.shadow.bias = -0.0012;
  quyosh.shadow.normalBias = 0.02;
  sahna.add(quyosh);
  sahna.add(quyosh.target);
  quyosh.target.position.set(0, 1, 0);

  /* =========================================================
     6. FON — gradientli osmon gumbazi va maysazor
     ========================================================= */
  function osmonToqima() {
    var c = document.createElement('canvas');
    c.width = 4; c.height = 256;
    var k = c.getContext('2d');
    var g = k.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0.00, '#6FB2E8');   // tepa — to‘q havorang
    g.addColorStop(0.45, '#AFD9F2');
    g.addColorStop(0.78, '#DDEFE2');
    g.addColorStop(1.00, '#CFE4D8');   // ufq — tumanga qo‘shiladi
    k.fillStyle = g; k.fillRect(0, 0, 4, 256);
    var t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  var osmon = new THREE.Mesh(
    new THREE.SphereGeometry(56, 24, 16),
    new THREE.MeshBasicMaterial({
      map: osmonToqima(), side: THREE.BackSide, fog: false, depthWrite: false
    })
  );
  sahna.add(osmon);

  var maysa = new THREE.Mesh(
    new THREE.CircleGeometry(38, 44),
    new THREE.MeshStandardMaterial({ color: 0x76A855, roughness: 0.98, metalness: 0 })
  );
  maysa.rotation.x = -Math.PI / 2;
  maysa.receiveShadow = true;
  sahna.add(maysa);

  /* Maysa ustidagi to‘qroq yo‘lka — konteynerlar turgan joy */
  var yolka = new THREE.Mesh(
    new THREE.PlaneGeometry(14.6, 4.2),
    new THREE.MeshStandardMaterial({ color: 0x8FB86C, roughness: 0.95 })
  );
  yolka.rotation.x = -Math.PI / 2;
  yolka.position.set(0, 0.012, -1.1);
  yolka.receiveShadow = true;
  sahna.add(yolka);

  /* =========================================================
     7. BEZAK — daraxtlar va butalar (kam poligon)
     ========================================================= */
  var tanaMat  = new THREE.MeshStandardMaterial({ color: 0x6B4526, roughness: 0.9 });
  var bargMat  = new THREE.MeshStandardMaterial({ color: 0x2F6B45, roughness: 0.85 });
  var butaMat  = new THREE.MeshStandardMaterial({ color: 0x3E8451, roughness: 0.9 });
  var tanaGeo  = new THREE.CylinderGeometry(0.13, 0.2, 1.4, 6);
  var bargGeo  = new THREE.ConeGeometry(0.95, 1.6, 9);
  var butaGeo  = new THREE.SphereGeometry(0.55, 12, 9);

  function daraxt(x, z, o) {
    var g = new THREE.Group();
    var t = new THREE.Mesh(tanaGeo, tanaMat);
    t.position.y = 0.7; t.castShadow = true; g.add(t);
    var b1 = new THREE.Mesh(bargGeo, bargMat);
    b1.position.y = 1.85; b1.castShadow = true; g.add(b1);
    var b2 = new THREE.Mesh(bargGeo, bargMat);
    b2.position.y = 2.75; b2.scale.setScalar(0.72); b2.castShadow = true; g.add(b2);
    g.position.set(x, 0, z);
    g.scale.setScalar(o);
    sahna.add(g);
  }
  daraxt(-9.2, -6.5, 1.15);
  daraxt(9.6, -7.4, 1.0);
  daraxt(-6.4, -10.5, 0.9);
  daraxt(5.2, -11.2, 0.8);

  function buta(x, z, o) {
    var b = new THREE.Mesh(butaGeo, butaMat);
    b.position.set(x, 0.34 * o, z);
    b.scale.set(o, o * 0.72, o);
    b.castShadow = true; b.receiveShadow = true;
    sahna.add(b);
  }
  buta(-7.2, -3.2, 1.0);  buta(-5.9, -4.1, 0.7);
  buta(7.4, -3.6, 1.05);  buta(6.2, -4.6, 0.75);
  buta(-2.6, -5.4, 0.85); buta(2.9, -5.8, 0.9);
  buta(0.2, -6.6, 0.65);

  /* =========================================================
     8. KONTEYNERLAR — qopqoq · tana · halqa · yorliq
     ========================================================= */

  /* Yorliq lavhasi: nom + qayta ishlash uchburchagi (canvas orqali chiziladi) */
  function yorliqToqima(nom, rangHex) {
    var c = document.createElement('canvas');
    c.width = 256; c.height = 128;
    var k = c.getContext('2d');
    k.fillStyle = '#FBF7F0';
    k.fillRect(0, 0, 256, 128);
    k.strokeStyle = rangHex; k.lineWidth = 8;
    k.strokeRect(4, 4, 248, 120);

    /* Uchta aylanma o‘q — qayta ishlash belgisi */
    k.fillStyle = rangHex;
    for (var i = 0; i < 3; i++) {
      k.save();
      k.translate(48, 64);
      k.rotate(i * 2 * Math.PI / 3);
      k.beginPath();
      k.moveTo(-15, -21); k.lineTo(11, -21); k.lineTo(11, -30);
      k.lineTo(27, -16);  k.lineTo(11, -2);  k.lineTo(11, -11);
      k.lineTo(-15, -11);
      k.closePath(); k.fill();
      k.restore();
    }

    k.fillStyle = rangHex;
    k.font = 'bold 34px Georgia, "Times New Roman", serif';
    k.textAlign = 'center'; k.textBaseline = 'middle';
    k.fillText(nom, 158, 66);

    var t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  }

  var TANA_GEO   = new THREE.CylinderGeometry(0.92, 0.76, 1.7, 4);
  var HALQA_GEO  = new THREE.CylinderGeometry(0.95, 0.95, 0.13, 4);
  var POY_GEO    = new THREE.CylinderGeometry(0.79, 0.82, 0.12, 4);
  var QOPQOQ_GEO = new THREE.CylinderGeometry(0.99, 0.96, 0.15, 4);
  var DASTA_GEO  = new THREE.TorusGeometry(0.17, 0.035, 6, 12);
  var PAD_GEO    = new THREE.CircleGeometry(1.15, 24);
  var YORLIQ_GEO = new THREE.PlaneGeometry(1.16, 0.56);

  var konteynerlar = [];
  var nishonlar = [];              // raycasting uchun

  KONTEYNER.forEach(function (K, i) {
    var g = new THREE.Group();
    g.position.set(-4.35 + i * 2.9, 0, -1.1);

    var tanaM   = new THREE.MeshStandardMaterial({ color: K.rang, roughness: 0.62, metalness: 0.06 });
    var quyuqM  = new THREE.MeshStandardMaterial({ color: K.quyuq, roughness: 0.55, metalness: 0.1 });

    /* Poy — yerga tegib turgan qism */
    var poy = new THREE.Mesh(POY_GEO, quyuqM);
    poy.position.y = 0.06; poy.rotation.y = Math.PI / 4;
    poy.castShadow = true; poy.receiveShadow = true; g.add(poy);

    /* Tana — pastga qarab toraygan to‘rt qirrali gavda */
    var tana = new THREE.Mesh(TANA_GEO, tanaM);
    tana.position.y = 0.97; tana.rotation.y = Math.PI / 4;
    tana.castShadow = true; tana.receiveShadow = true; g.add(tana);

    /* Yuqori halqa */
    var halqa = new THREE.Mesh(HALQA_GEO, quyuqM);
    halqa.position.y = 1.83; halqa.rotation.y = Math.PI / 4;
    halqa.castShadow = true; g.add(halqa);

    /* Qopqoq — orqa qirrasidan ochiladi */
    var menta = new THREE.Group();
    menta.position.set(0, 1.9, -0.66);
    var qopqoq = new THREE.Mesh(QOPQOQ_GEO, quyuqM);
    qopqoq.position.set(0, 0.06, 0.66);
    qopqoq.rotation.y = Math.PI / 4;
    qopqoq.castShadow = true;
    menta.add(qopqoq);
    var dasta = new THREE.Mesh(DASTA_GEO, quyuqM);
    dasta.position.set(0, 0.15, 1.02);
    dasta.rotation.x = Math.PI / 2;
    menta.add(dasta);
    g.add(menta);

    /* Yorliq — old yuzada, gavdaning qiyaligiga moslab */
    var yorliqM = new THREE.MeshStandardMaterial({
      map: yorliqToqima(K.nom, K.yorliq), roughness: 0.85
    });
    var yorliq = new THREE.Mesh(YORLIQ_GEO, yorliqM);
    yorliq.position.set(0, 1.0, 0.62);
    yorliq.rotation.x = -0.062;
    g.add(yorliq);

    /* Yerdagi doira — ham bezak, ham kattaroq bosish maydoni */
    var pad = new THREE.Mesh(PAD_GEO, new THREE.MeshStandardMaterial({
      color: K.quyuq, roughness: 1, transparent: true, opacity: 0.28
    }));
    pad.rotation.x = -Math.PI / 2;
    pad.position.y = 0.02;
    g.add(pad);

    sahna.add(g);

    var K3 = {
      guruh: g, menta: menta, tanaM: tanaM, quyuqM: quyuqM,
      asosRang: new THREE.Color(K.rang),
      asosQuyuq: new THREE.Color(K.quyuq),
      bazaX: g.position.x,
      ogiz: new THREE.Vector3(g.position.x, 2.05, g.position.z + 0.1),
      nom: K.nom, ochiq: 0, sakrash: 0, silkinish: 0
    };
    konteynerlar.push(K3);

    /* Raycasting nishonlari */
    [poy, tana, halqa, qopqoq, yorliq, pad].forEach(function (m) {
      m.userData.kIdx = i;
      nishonlar.push(m);
    });
  });

  /* =========================================================
     9. CHIQINDI MODELLARI — hammasi Three.js primitivlaridan
     ========================================================= */
  function m(rang, gadir, xushmol) {
    return new THREE.MeshStandardMaterial({
      color: rang, roughness: gadir == null ? 0.8 : gadir, metalness: xushmol || 0
    });
  }
  function shaffof(rang, ochiq, gadir) {
    return new THREE.MeshStandardMaterial({
      color: rang, roughness: gadir == null ? 0.12 : gadir, metalness: 0,
      transparent: true, opacity: ochiq
    });
  }

  /* 1) Eski gazeta — yassi qog‘oz varaq, ustida bosma satrlar */
  function gazeta() {
    var g = new THREE.Group();
    var qogozM = m(0xEFE9DC, 0.96);
    var siyohM = m(0x7C7568, 0.95);
    var varaqGeo = new THREE.BoxGeometry(1.25, 0.028, 0.86);
    var v1 = new THREE.Mesh(varaqGeo, qogozM);
    v1.position.y = 0.02; g.add(v1);
    var v2 = new THREE.Mesh(varaqGeo, qogozM);
    v2.position.set(0.05, 0.06, -0.03); v2.rotation.y = 0.09; g.add(v2);
    var satrGeo = new THREE.BoxGeometry(0.9, 0.006, 0.035);
    for (var i = 0; i < 5; i++) {
      var s = new THREE.Mesh(satrGeo, siyohM);
      s.position.set(-0.05, 0.077, -0.26 + i * 0.13);
      if (i === 0) s.scale.set(0.65, 1, 2.6);   // sarlavha
      g.add(s);
    }
    return g;
  }

  /* 2) Karton quti — ochilgan to‘rtta qanoti bilan */
  function karton() {
    var g = new THREE.Group();
    var kartonM = m(0xC08E56, 0.92);
    var lentaM  = m(0xD9C9A8, 0.85);
    var quti = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.78, 0.86), kartonM);
    quti.position.y = 0.39; g.add(quti);
    var qanotGeo = new THREE.BoxGeometry(0.92, 0.035, 0.42);
    var burchak = [[0, 0.44, 1], [0, -0.44, -1], [1, 0, 0], [-1, 0, 0]];
    for (var i = 0; i < 4; i++) {
      var q = new THREE.Mesh(qanotGeo, kartonM);
      var yon = burchak[i];
      q.position.y = 0.79;
      if (i < 2) {
        q.position.z = yon[1] * 1.05;
        q.rotation.x = yon[2] * 1.05;
      } else {
        q.rotation.y = Math.PI / 2;
        q.position.x = yon[0] * 0.47;
        q.rotation.x = -yon[0] * 0.95;
        q.scale.z = 0.94;
      }
      g.add(q);
    }
    var lenta = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.79, 0.88), lentaM);
    lenta.position.set(0, 0.39, 0.005); lenta.scale.z = 1.01; g.add(lenta);
    return g;
  }

  /* 3) Daftar — muqova, oq varaqlar va prujina halqalari */
  function daftar() {
    var g = new THREE.Group();
    var muqovaM = m(0x2C5FA8, 0.7);
    var varaqM  = m(0xF9F5EA, 0.95);
    var simM    = m(0xB9BCC2, 0.35, 0.75);
    var muqova = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.06, 1.02), muqovaM);
    g.add(muqova);
    var varaq = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.11, 0.97), varaqM);
    varaq.position.y = 0.085; g.add(varaq);
    var orqa = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.05, 1.02), muqovaM);
    orqa.position.y = 0.16; orqa.rotation.z = 0.05; g.add(orqa);
    var halqaGeo = new THREE.TorusGeometry(0.062, 0.017, 6, 10);
    for (var i = 0; i < 6; i++) {
      var h = new THREE.Mesh(halqaGeo, simM);
      h.position.set(-0.39, 0.08, -0.4 + i * 0.16);
      h.rotation.y = Math.PI / 2;
      g.add(h);
    }
    return g;
  }

  /* 4) Plastik shisha — gavda, yelka, bo‘yin, qopqoq va yorliq */
  function plastikShisha() {
    var g = new THREE.Group();
    var plastikM = shaffof(0xC8E8F5, 0.55, 0.1);
    var gavda = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.31, 0.8, 18), plastikM);
    gavda.position.y = 0.4; g.add(gavda);
    var yelka = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.29, 0.26, 18), plastikM);
    yelka.position.y = 0.93; g.add(yelka);
    var boyin = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.16, 14), plastikM);
    boyin.position.y = 1.14; g.add(boyin);
    var qopqoq = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.145, 0.13, 16), m(0x2F6B45, 0.5));
    qopqoq.position.y = 1.28; g.add(qopqoq);
    var yorliq = new THREE.Mesh(new THREE.CylinderGeometry(0.315, 0.325, 0.3, 18), m(0xD4A24C, 0.85));
    yorliq.position.y = 0.42; g.add(yorliq);
    return g;
  }

  /* 5) Selofan paket — g‘ijimlangan yumshoq xalta, ikkita dastasi bilan */
  function selofan() {
    var g = new THREE.Group();
    var paketM = shaffof(0xF2F6F4, 0.5, 0.3);
    var xalta = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 12), paketM);
    xalta.scale.set(1.15, 0.9, 0.78);
    xalta.position.y = 0.44; g.add(xalta);
    var past = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 10), paketM);
    past.scale.set(1.2, 0.55, 0.85); past.position.set(0.16, 0.16, 0.08); g.add(past);
    var dastaGeo = new THREE.TorusGeometry(0.15, 0.04, 6, 12);
    var d1 = new THREE.Mesh(dastaGeo, paketM);
    d1.position.set(-0.2, 0.86, 0); d1.rotation.set(0.25, 0, 0.4); g.add(d1);
    var d2 = new THREE.Mesh(dastaGeo, paketM);
    d2.position.set(0.2, 0.86, 0); d2.rotation.set(-0.25, 0, -0.4); g.add(d2);
    return g;
  }

  /* 6) Plastik qopqoq — kichkina, qirrali halqasi bilan */
  function qopqoqcha() {
    var g = new THREE.Group();
    var qM = m(0xC1502E, 0.5);
    var t = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.17, 20), qM);
    t.position.y = 0.09; g.add(t);
    var halqa = new THREE.Mesh(new THREE.TorusGeometry(0.345, 0.032, 6, 20), m(0xA43F21, 0.55));
    halqa.position.y = 0.05; halqa.rotation.x = Math.PI / 2; g.add(halqa);
    /* Ustidagi botiq doira */
    var botiq = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.03, 16), m(0xD26A45, 0.55));
    botiq.position.y = 0.175; g.add(botiq);
    return g;
  }

  /* 7) Shisha banka — yashil shaffof, metall qopqog‘i bilan */
  function banka() {
    var g = new THREE.Group();
    var shishaM = shaffof(0x9CC9A6, 0.48, 0.08);
    var gavda = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.37, 0.82, 20), shishaM);
    gavda.position.y = 0.41; g.add(gavda);
    var boyin = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.35, 0.14, 20), shishaM);
    boyin.position.y = 0.89; g.add(boyin);
    var qopqoq = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.12, 20), m(0xC9A24A, 0.35, 0.7));
    qopqoq.position.y = 1.01; g.add(qopqoq);
    var halqa = new THREE.Mesh(new THREE.TorusGeometry(0.355, 0.03, 6, 18), shishaM);
    halqa.position.y = 0.79; halqa.rotation.x = Math.PI / 2; g.add(halqa);
    return g;
  }

  /* 8) Singan oyna — uchta yupqa uchburchak parcha */
  function oynaBolagi() {
    var g = new THREE.Group();
    var oynaM = shaffof(0xD5EBF4, 0.62, 0.05);
    var parchaGeo = new THREE.ConeGeometry(0.36, 0.86, 3);
    var joy = [
      [0, 0.2, 0, 0.1, 0.3, 0.05],
      [-0.34, 0.14, 0.16, -0.15, 1.1, 0.55],
      [0.32, 0.12, -0.12, 0.2, -0.7, -0.75]
    ];
    joy.forEach(function (j, i) {
      var p = new THREE.Mesh(parchaGeo, oynaM);
      p.position.set(j[0], j[1], j[2]);
      p.rotation.set(j[3], j[4], j[5]);
      p.scale.set(1, 1, 0.14);
      if (i > 0) p.scale.multiplyScalar(0.72);
      g.add(p);
    });
    return g;
  }

  /* 9) Olma po‘sti — spiral qilib archilgan qizil po‘st */
  function olmaPosti() {
    var g = new THREE.Group();
    var postM = m(0xC0392B, 0.6);
    for (var i = 0; i < 4; i++) {
      var r = 0.42 - i * 0.06;
      var halqa = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.055, 8, 18, Math.PI * 1.55), postM
      );
      halqa.position.y = 0.1 + i * 0.16;
      halqa.rotation.x = Math.PI / 2;
      halqa.rotation.z = i * 1.35;
      g.add(halqa);
    }
    var uch = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), postM);
    uch.position.set(0.34, 0.06, 0); g.add(uch);
    return g;
  }

  /* 10) Choy quyqasi — piyola va ichidagi to‘q choy quyqasi */
  function choyQuyqasi() {
    var g = new THREE.Group();
    var piyolaM = new THREE.MeshStandardMaterial({
      color: 0xF7F3E8, roughness: 0.35, side: THREE.DoubleSide
    });
    var choyM = m(0x54341C, 0.95);
    var piyola = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.26, 0.46, 18, 1, true), piyolaM
    );
    piyola.position.y = 0.25; g.add(piyola);
    var tag = new THREE.Mesh(new THREE.CircleGeometry(0.26, 18), piyolaM);
    tag.position.y = 0.03; tag.rotation.x = -Math.PI / 2; g.add(tag);
    var quyqa = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 10), choyM);
    quyqa.scale.set(1, 0.34, 1); quyqa.position.y = 0.34; g.add(quyqa);
    var dasta = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.035, 6, 12), piyolaM);
    dasta.position.set(0.4, 0.3, 0); dasta.rotation.y = Math.PI / 2; g.add(dasta);
    var tokGeo = new THREE.SphereGeometry(0.06, 8, 6);
    for (var i = 0; i < 3; i++) {
      var t = new THREE.Mesh(tokGeo, choyM);
      t.position.set(-0.42 + i * 0.13, 0.05, 0.24 - i * 0.1);
      t.scale.y = 0.5; g.add(t);
    }
    return g;
  }

  /* 11) Non ushog‘i — bir bo‘lak non qobig‘i va mayda ushoqlar */
  function nonUshogi() {
    var g = new THREE.Group();
    var qobiqM = m(0xC8862F, 0.85);
    var ichM   = m(0xF0D9A8, 0.9);
    var bolak = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 12), qobiqM);
    bolak.scale.set(1.25, 0.62, 0.92); bolak.position.y = 0.24; g.add(bolak);
    var ich = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 10), ichM);
    ich.scale.set(1.15, 0.42, 0.85); ich.position.set(-0.04, 0.2, 0.02); g.add(ich);
    var ushoqGeo = new THREE.SphereGeometry(0.09, 10, 8);
    var joy = [[-0.5, 0.07, 0.2], [0.48, 0.06, -0.18], [0.26, 0.05, 0.36], [-0.3, 0.05, -0.34]];
    joy.forEach(function (j, i) {
      var u = new THREE.Mesh(ushoqGeo, i % 2 ? ichM : qobiqM);
      u.position.set(j[0], j[1], j[2]);
      u.scale.setScalar(0.75 + (i % 3) * 0.2);
      g.add(u);
    });
    return g;
  }

  /* Ro‘yxat: nom · to‘g‘ri konteyner · model · o‘lcham */
  var CHIQINDILAR = [
    { nom: 'Eski gazeta',    s: 0, yasa: gazeta,        o: 1.0 },
    { nom: 'Karton quti',    s: 0, yasa: karton,        o: 0.95 },
    { nom: 'Daftar',         s: 0, yasa: daftar,        o: 1.05 },
    { nom: 'Plastik shisha', s: 1, yasa: plastikShisha, o: 0.95 },
    { nom: 'Selofan paket',  s: 1, yasa: selofan,       o: 1.0 },
    { nom: 'Plastik qopqoq', s: 1, yasa: qopqoqcha,     o: 1.7 },
    { nom: 'Shisha banka',   s: 2, yasa: banka,         o: 1.0 },
    { nom: 'Singan oyna',    s: 2, yasa: oynaBolagi,    o: 1.05 },
    { nom: 'Olma po‘sti',    s: 3, yasa: olmaPosti,     o: 1.1 },
    { nom: 'Choy quyqasi',   s: 3, yasa: choyQuyqasi,   o: 1.05 },
    { nom: 'Non ushog‘i',    s: 3, yasa: nonUshogi,     o: 1.1 }
  ];
  var JAMI = CHIQINDILAR.length;

  /* =========================================================
     10. ANIMATSIYA YORDAMCHILARI (oddiy tven ro‘yxati)
     ========================================================= */
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

  /* =========================================================
     11. O‘YIN HOLATI
     ========================================================= */
  var navbat = [], joriy = null, ball = 0, urinilgan = 0;
  var bloklangan = true, tugadi = false, natijaDiv = null;
  /* Predmet tushayotgan payt bosilsa — bosishni yodda tutamiz va
     tushish tugashi bilan qo‘llaymiz (telefonda tez bosishga qulay). */
  var tushmoqda = false, kutayotganBosish = null;

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
  }
  function xabar(matn, tur) {
    xabarEl.textContent = matn;
    xabarEl.className = 'o3ch-xabar' + (tur ? ' ' + tur : '');
  }

  /* Predmetni sahnaga chiqarish */
  var MARKAZ = new THREE.Vector3(0, 1.5, 4.35);
  var OLCHAM = 1.32;            // predmetlarning umumiy kattaligi

  function predmetYarat(mal) {
    var g = mal.yasa();
    g.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    g.scale.setScalar(mal.o * OLCHAM);
    g.position.copy(MARKAZ);
    sahna.add(g);
    return g;
  }

  function keyingi() {
    if (!navbat.length) { yakunla(); return; }
    var mal = navbat.shift();
    var g = predmetYarat(mal);
    joriy = { mal: mal, guruh: g, olcham: mal.o * OLCHAM, aylanish: 0 };

    nomEl.textContent = mal.nom;
    xabar('Qaysi konteynerga tashlaymiz? Konteynerni bosing.');

    /* Yuqoridan yumshoq tushib kelish */
    tushmoqda = true;
    kutayotganBosish = null;
    g.position.y = MARKAZ.y + 2.4;
    g.scale.setScalar(0.01);
    tven(0.5, function (v) {
      var p = chiqish(v);
      g.position.y = MARKAZ.y + 2.4 * (1 - p);
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

  /* Konteyner qopqog‘ini ochish/yopish */
  function qopqoqOch(K, ochiqmi) {
    var bosh = K.ochiq, oxir = ochiqmi ? 1.15 : 0;
    tven(0.28, function (v) {
      K.ochiq = bosh + (oxir - bosh) * yumshoq(v);
      K.menta.rotation.x = K.ochiq;
    });
  }

  /* Konteyner sakrashi */
  function konteynerSakra(K) {
    tven(0.5, function (v) {
      var s = Math.sin(v * Math.PI);
      K.guruh.position.y = s * 0.34;
      K.guruh.scale.set(1 - s * 0.06, 1 + s * 0.1, 1 - s * 0.06);
    }, function () {
      K.guruh.position.y = 0;
      K.guruh.scale.set(1, 1, 1);
    });
  }

  /* Konteynerning qizarib chayqalishi */
  var QIZIL = new THREE.Color(0xC1502E);
  function konteynerXato(K) {
    tven(0.75, function (v) {
      var s = Math.sin(v * Math.PI);
      K.tanaM.color.copy(K.asosRang).lerp(QIZIL, s * 0.85);
      K.quyuqM.color.copy(K.asosQuyuq).lerp(QIZIL, s * 0.7);
      K.guruh.position.x = K.ogiz.x + Math.sin(v * Math.PI * 8) * 0.13 * (1 - v);
    }, function () {
      K.tanaM.color.copy(K.asosRang);
      K.quyuqM.color.copy(K.asosQuyuq);
      K.guruh.position.x = K.ogiz.x;
    });
  }

  /* Predmetning chayqalishi (xato javob) */
  function predmetChayqal(g, tamom) {
    var bx = g.position.x;
    tven(0.55, function (v) {
      g.position.x = bx + Math.sin(v * Math.PI * 7) * 0.34 * (1 - v);
      g.rotation.z = Math.sin(v * Math.PI * 7) * 0.28 * (1 - v);
    }, function () {
      g.position.x = bx; g.rotation.z = 0;
      if (tamom) tamom();
    });
  }

  /* Predmetni sahnadan olib tashlab, xotirasini bo‘shatamiz.
     Har bir predmet o‘z geometriyasi va materialini yasaydi —
     shuning uchun ularni bemalol tozalash mumkin. */
  function yoq(g) {
    sahna.remove(g);
    g.traverse(function (o) {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        var ro = Array.isArray(o.material) ? o.material : [o.material];
        ro.forEach(function (mat) { mat.dispose(); });
      }
    });
  }

  /* Predmetning yoy chizib konteynerga uchishi */
  function uchir(g, K, olcham, tamom) {
    var b = g.position.clone();
    var e = K.ogiz;
    var balandlik = Math.max(b.y, e.y) + 2.3;
    qopqoqOch(K, true);
    tven(0.8, function (v) {
      var p = yumshoq(v);
      var q = 1 - p;
      g.position.x = q * q * b.x + 2 * q * p * ((b.x + e.x) / 2) + p * p * e.x;
      g.position.z = q * q * b.z + 2 * q * p * ((b.z + e.z) / 2) + p * p * e.z;
      g.position.y = q * q * b.y + 2 * q * p * balandlik + p * p * e.y;
      g.rotation.y += 0.16;
      g.rotation.x = p * 1.4;
      g.scale.setScalar(olcham * (1 - 0.72 * p));
    }, function () {
      yoq(g);
      qopqoqOch(K, false);
      konteynerSakra(K);
      if (tamom) tamom();
    });
  }

  /* =========================================================
     12. BOSISH — raycasting
     ========================================================= */
  var nur = new THREE.Raycaster();
  var nuqta = new THREE.Vector2();

  function bosildi(hodisa) {
    if (tugadi || !joriy) return;
    if (bloklangan && !tushmoqda) return;      // animatsiya davom etmoqda
    var r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    nuqta.x = ((hodisa.clientX - r.left) / r.width) * 2 - 1;
    nuqta.y = -((hodisa.clientY - r.top) / r.height) * 2 + 1;
    nur.setFromCamera(nuqta, kamera);
    var urish = nur.intersectObjects(nishonlar, false);
    if (!urish.length) return;
    var i = urish[0].object.userData.kIdx;
    if (i == null) return;
    if (bloklangan) { kutayotganBosish = i; return; }
    javobBer(i);
  }

  function javobBer(i) {
    bloklangan = true;
    urinilgan++;
    var mal = joriy.mal, g = joriy.guruh, olcham = joriy.olcham;
    var togriIdx = mal.s;

    if (i === togriIdx) {
      ball++;
      tabloYangila();
      xabar('Barakalla! «' + mal.nom + '» — ' + KONTEYNER[togriIdx].nom + '.', 'togri');
      uchir(g, konteynerlar[i], olcham, function () {
        joriy = null;
        kutish(0.35, keyingi);
      });
    } else {
      tabloYangila();
      xabar('Xato. «' + mal.nom + '» — ' + KONTEYNER[togriIdx].nom +
            ' konteyneriga tushadi.', 'xato');
      konteynerXato(konteynerlar[i]);
      predmetChayqal(g, function () {
        /* To‘g‘ri konteynerni ko‘rsatib, predmetni o‘sha yerga jo‘natamiz */
        uchir(g, konteynerlar[togriIdx], olcham, function () {
          joriy = null;
          kutish(0.4, keyingi);
        });
      });
    }
  }

  canvas.addEventListener('pointerdown', bosildi);

  /* =========================================================
     13. YAKUN VA QAYTA BOSHLASH
     ========================================================= */
  function yakunla() {
    tugadi = true;
    joriy = null;
    var foiz = Math.round(ball / JAMI * 100);
    nomEl.textContent = 'O‘yin tugadi';
    xabar('');

    natijaDiv = document.createElement('div');
    natijaDiv.className = 'o3ch-natija';
    var baho = foiz >= 80
      ? 'Barakalla! Siz chiqindilarni saralashni yaxshi bilasiz — tabiat asrash shundan boshlanadi.'
      : foiz >= 50
        ? 'Yaxshi urinish. Ba’zi predmetlarni qayta ko‘rib chiqing va yana o‘ynang.'
        : 'Hozircha qiyin bo‘ldi. 14-modul matnini o‘qib, yana urinib ko‘ring.';
    natijaDiv.innerHTML =
      '<h4>Natija</h4>' +
      '<div class="o3ch-foiz">' + foiz + '%</div>' +
      '<p>' + JAMI + ' ta chiqindidan ' + ball + ' tasini to‘g‘ri saraladingiz.</p>' +
      '<p>' + baho + '</p>' +
      '<button type="button" class="o3ch-qayta">↻ Qaytadan o‘ynash</button>';
    sahnaDiv.appendChild(natijaDiv);
    natijaDiv.querySelector('.o3ch-qayta').addEventListener('click', qaytaBoshla);

    /* Natijani saytning umumiy xotirasiga yozamiz (bo‘lsa) */
    try {
      if (window.Xotira && window.Xotira.modulYoz) {
        window.Xotira.modulYoz(14, { oyin3d: foiz });
      }
    } catch (e) {}
  }

  function qaytaBoshla() {
    if (natijaDiv) { natijaDiv.remove(); natijaDiv = null; }
    tvenlar.length = 0;
    konteynerlar.forEach(function (K) {
      K.menta.rotation.x = 0; K.ochiq = 0;
      K.guruh.position.set(K.ogiz.x, 0, K.guruh.position.z);
      K.guruh.scale.set(1, 1, 1);
      K.tanaM.color.copy(K.asosRang);
      K.quyuqM.color.copy(K.asosQuyuq);
    });
    ball = 0; urinilgan = 0; tugadi = false; bloklangan = true;
    tushmoqda = false; kutayotganBosish = null;
    navbat = aralash(CHIQINDILAR);
    tabloYangila();
    keyingi();
  }

  /* =========================================================
     14. O‘LCHAM · KO‘RINISH · RENDER HALQASI
     ========================================================= */
  function olchamla() {
    var w = Math.round(idish.clientWidth || sahnaDiv.clientWidth || 640);
    if (w < 200) w = 200;
    var h = Math.min(520, Math.round(w * 10 / 16));
    if (h < 290) h = 290;          // telefonda sahna juda past bo‘lib qolmasin
    renderer.setSize(w, h);
    kamera.aspect = w / h;
    kamera.updateProjectionMatrix();

    var tor = w < 560;
    sahnaDiv.classList.toggle('o3ch-tor', tor);

    /* Tor ekranda konteynerlar qatorini siqamiz — shunda ular
       kichrayib ketmasdan ekranga sig‘adi. */
    var siqish = tor ? 0.74 : 1;
    konteynerlar.forEach(function (K) {
      K.guruh.position.x = K.bazaX * siqish;
      K.ogiz.x = K.guruh.position.x;
    });

    /* Kamerani shunday joylaymizki, butun qator doim ko‘rinib tursin */
    var yarimKenglik = 4.35 * siqish + 1.2;
    var yarimV = (kamera.fov / 2) * Math.PI / 180;
    var yarimH = Math.atan(Math.tan(yarimV) * kamera.aspect);
    var masofa = yarimKenglik / Math.tan(yarimH) * 1.06;
    kamera.position.z = Math.max(9.3, masofa - 1.1);
    kamera.lookAt(0, 1.75, 1.1);
    render();
  }

  var oxirgiVaqt = 0;
  var ramka = 0, yuribdi = false, korinmoqda = false;

  function yangila(dt) {
    tvenYangila(dt);
    if (joriy && joriy.guruh) {
      joriy.aylanish += dt;
      joriy.guruh.rotation.y += dt * 0.75;
      if (!bloklangan) {
        joriy.guruh.position.y = MARKAZ.y + Math.sin(joriy.aylanish * 1.6) * 0.09;
      }
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
    oxirgiVaqt = performance.now() / 1000;   // to‘plangan vaqtni tashlaymiz
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

  /* =========================================================
     15. TOZALASH — sahifa yopilganda xotirani bo‘shatamiz
     ========================================================= */
  var tozalandi = false;
  function tozala() {
    if (tozalandi) return;
    tozalandi = true;
    halqaToxtat();
    tvenlar.length = 0;
    if (kuzatOlcham) kuzatOlcham.disconnect(); else window.removeEventListener('resize', olchamla);
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

  /* =========================================================
     16. BOSHLADIK
     ========================================================= */
  olchamla();
  navbat = aralash(CHIQINDILAR);
  tabloYangila();
  keyingi();
  holatniQara();
  render();
})();
