/* =========================================================
   «MEHMON KUTISH» — HAQIQIY 3D O‘YIN (Three.js)
   11-modul: «O‘zbek xalqining muomala madaniyati, axloqiy
   me’yorlari, turmush kechirish tartib-qoidalarining tarbiyaviy
   ahamiyati».

   Sahna — o‘zbek mehmonxonasi: gilam ustida yozilgan dasturxon,
   atrofida ko‘rpachalar, to‘rda o‘yma eshik va ostona, burchakda
   samovar.

   1-bosqich — DASTURXON TUZASH. Oldingi taxtada sakkizta buyum
   turadi: oftoba-tog‘ora, non, choynak, piyola, shirinliklar,
   mevali tovoq, shorva kosasi, palov lageni. Ularni an’anaviy
   TARTIBDA dasturxonga qo‘yish kerak: avval qo‘l yuvish, so‘ng
   non, keyin choy, shirinlik-meva, oxirida issiq taom.

   2-bosqich — ODOB TANLOVI. Uch xil holat 3D dioramada yonma-yon
   ko‘rsatiladi (salomlashish, piyolani uzatish, non odobi,
   ostonada poyabzal, mehmonga to‘r joyi). O‘quvchi to‘g‘risini
   tanlaydi.

   Three.js faqat assets/vendor/ dan. WebGL bo‘lmasa sahifadagi
   oddiy o‘yin zaxira sifatida ochiq qoladi.
   ========================================================= */
import * as THREE from '../vendor/three.module.min.js';

(async function () {
  'use strict';

  var idish = document.getElementById('oyin3d-mehmon');
  if (!idish) return;

  function webglBor() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }
  if (!webglBor()) {
    idish.innerHTML = '<p class="uch-xato">Brauzeringiz 3D grafikani qo‘llab-quvvatlamaydi. ' +
      'Quyidagi oddiy o‘yin variantida ishlashingiz mumkin.</p>';
    return;
  }

  var kamHarakat = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================
     1. Model kutubxonalari
     ========================================================= */
  var yuklandi = await Promise.allSettled([
    import('./model-maishiy.js'),
    import('./model-odob.js')
  ]);
  var MAISHIY = (yuklandi[0].status === 'fulfilled' && yuklandi[0].value.MAISHIY) || {};
  var odobMod = (yuklandi[1].status === 'fulfilled' && yuklandi[1].value) || {};
  var ODOB    = odobMod.ODOB_BUYUMLARI || {};
  var odamYasa = typeof odobMod.odamYasa === 'function' ? odobMod.odamYasa : null;
  var pozaBer  = typeof odobMod.pozaBer === 'function' ? odobMod.pozaBer : function () {};

  function yasagich(kalit) {
    if (ODOB[kalit] && typeof ODOB[kalit].yasa === 'function') return ODOB[kalit];
    if (MAISHIY[kalit] && typeof MAISHIY[kalit].yasa === 'function') return MAISHIY[kalit];
    return null;
  }
  function xavfsizYasa(fn) {
    try { var g = fn(); return (g && g.isObject3D) ? g : null; } catch (e) { return null; }
  }

  /* ---------- 1-bosqich buyumlari: an’anaviy tartib ---------- */
  var TARTIB = [
    { kalit: 'oftoba',    nom: 'Oftoba va tog‘ora', joy: [ 0.00, 0, 3.05],
      izoh: 'Mehmon dasturxonga o‘tirishdan avval qo‘l yuvadi. Uy egasi oftobadan ' +
            'suv quyib, tog‘orani tutadi va sochiq uzatadi — bu mehmondo‘stlikning ' +
            'birinchi belgisi.' },
    { kalit: 'non',       nom: 'Non',               joy: [ 0.00, 0,-0.55],
      izoh: 'Dasturxonga eng avval non qo‘yiladi va u to‘rga — eng hurmatli joyga ' +
            'to‘g‘rilanadi. Non yuzi doim yuqoriga qaraydi, uni sindirib bo‘lish esa ' +
            'katta odamning haqqi.' },
    { kalit: 'choynak',   nom: 'Choynak',           joy: [-1.55, 0, 0.75],
      izoh: 'Nondan keyin choy keladi. Choy uch marta qaytarib damlanadi, choynak ' +
            'esa dasturxonning uy egasiga yaqin tomonida turadi.' },
    { kalit: 'piyola',    nom: 'Piyola',            joy: [-0.70, 0, 1.45],
      izoh: 'Piyola to‘ldirib emas, ozroq quyib uzatiladi: mehmon qayta-qayta ' +
            'so‘rashi — suhbat uzayishi belgisi. Piyola ikki qo‘llab beriladi.' },
    { kalit: 'shirinlik', nom: 'Shirinliklar',      joy: [ 1.50, 0,-0.95],
      izoh: 'Choy bilan birga parvarda, navvot, holva qo‘yiladi. Shirinliklar ' +
            'dasturxonning yuqori qismiga, nonning ikki yoniga teriladi.' },
    { kalit: 'meva',      nom: 'Mevali tovoq',      joy: [-1.55, 0,-0.95],
      izoh: 'Mevalar shirinliklardan keyin qo‘yiladi. Ular yuvilgan, butun holda ' +
            'teriladi: mehmonga eng yaxshi mevani tanlab uzatish odat.' },
    { kalit: 'kosa',      nom: 'Shorva kosasi',     joy: [ 0.85, 0, 1.45],
      izoh: 'Issiq taom choydan keyin tortiladi. Kosa ikki qo‘llab uzatiladi va ' +
            'eng avval kattalarga beriladi.' },
    { kalit: 'palov',     nom: 'Palov lageni',      joy: [ 1.60, 0, 0.70],
      izoh: 'Palov dasturxonning eng oxirgi va eng ulug‘ taomi. Lagan o‘rtaga ' +
            'qo‘yiladi, hamma bir lagandan yeydi — bu birdamlik ramzi.' }
  ].filter(function (b) { return !!yasagich(b.kalit); });

  if (TARTIB.length < 4) {
    idish.innerHTML = '<p class="uch-xato">3D dasturxon modellari yuklanmadi. ' +
      'Quyidagi oddiy o‘yin variantida ishlashingiz mumkin.</p>';
    return;
  }

  /* =========================================================
     2. Uslub (umumiy style.css ga tegilmaydi)
     ========================================================= */
  if (!document.getElementById('m3-uslub')) {
    var st = document.createElement('style');
    st.id = 'm3-uslub';
    st.textContent =
      '.m3-tanlov{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:14px 0 0}' +
      '.m3-tan{cursor:pointer;font-family:inherit;font-size:13.5px;font-weight:600;color:#2A2A33;' +
        'background:#FFFDF8;border:1.5px solid rgba(0,0,0,.14);border-radius:999px;padding:8px 17px;' +
        'transition:transform .12s,box-shadow .12s,border-color .12s}' +
      '.m3-tan:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,.12)}' +
      '.m3-tan:disabled{opacity:.45;cursor:default}' +
      '.m3-tan.m3-togri{border-color:#2F6B45;background:#EAF5EE}' +
      '.m3-tan.m3-xato{border-color:#A3232C;background:#FBEDED}' +
      '.m3-izoh{margin:14px 0 0;padding:14px 16px;border-radius:14px;background:#FFFDF8;' +
        'border:1px solid rgba(0,0,0,.10);font-size:14.5px;line-height:1.65;min-height:22px}' +
      '.m3-izoh h4{margin:0 0 5px;font-size:15px}.m3-izoh p{margin:0;color:#4A4A55}' +
      '.m3-izoh.m3-yashil{border-color:#2F6B45;background:#F2F9F4}' +
      '.m3-izoh.m3-qizil{border-color:#A3232C;background:#FDF3F3}' +
      '#m3-odob[hidden]{display:none !important}' +
      '@media (max-width:560px){.m3-tan{font-size:12.5px;padding:7px 13px}.m3-izoh{font-size:13.5px}}';
    document.head.appendChild(st);
  }

  /* =========================================================
     3. Interfeys
     ========================================================= */
  idish.innerHTML =
    '<div class="uch-sahna">' +
      '<canvas class="uch-canvas"></canvas>' +
      '<div class="uch-ust">' +
        '<span>Bosqich <b id="m3-bosqich">1</b>/2</span>' +
        '<span>Qadam <b id="m3-qadam">0</b>/<b id="m3-jami">0</b></span>' +
        '<span>To‘g‘ri <b id="m3-ball">0</b></span>' +
      '</div>' +
      '<p class="uch-maslahat" id="m3-maslahat">«Mehmon kutishni boshlash» tugmasini bosing</p>' +
    '</div>' +
    '<div class="m3-tanlov" id="m3-tanlov"></div>' +
    '<div class="m3-izoh" id="m3-izoh"><p>Mehmon keldi. Dasturxonni an’anaviy tartibda ' +
      'tuzing, so‘ng odob holatlarini farqlab ko‘ring.</p></div>' +
    '<div class="oyin-tugmalar">' +
      '<button type="button" class="tug tug-asos tug-kichik" id="m3-boshla">▶ Mehmon kutishni boshlash</button>' +
      '<button type="button" class="tug tug-ramka tug-kichik" id="m3-odob" hidden>🤝 Odob bosqichiga o‘tish</button>' +
      '<button type="button" class="tug tug-ramka tug-kichik" id="m3-qayta">Qaytadan</button>' +
    '</div>';

  var canvas    = idish.querySelector('.uch-canvas');
  var maslahat  = idish.querySelector('#m3-maslahat');
  var elBosqich = idish.querySelector('#m3-bosqich');
  var elQadam   = idish.querySelector('#m3-qadam');
  var elJami    = idish.querySelector('#m3-jami');
  var elBall    = idish.querySelector('#m3-ball');
  var elIzoh    = idish.querySelector('#m3-izoh');
  var qatorTan  = idish.querySelector('#m3-tanlov');
  var tBoshla   = idish.querySelector('#m3-boshla');
  var tOdob     = idish.querySelector('#m3-odob');
  var tQayta    = idish.querySelector('#m3-qayta');

  function xabar(m) { maslahat.textContent = m; }
  function izoh(sarl, matn, rang) {
    elIzoh.className = 'm3-izoh' + (rang ? ' m3-' + rang : '');
    elIzoh.innerHTML = (sarl ? '<h4>' + sarl + '</h4>' : '') + '<p>' + matn + '</p>';
  }

  /* =========================================================
     4. Sahna
     ========================================================= */
  var sahna = new THREE.Scene();
  sahna.background = new THREE.Color(0xEFE2C9);

  var kamera = new THREE.PerspectiveCamera(46, 16 / 10, 0.1, 100);
  var KAM_1 = new THREE.Vector3(0, 6.5, 8.5);
  var NIG_1 = new THREE.Vector3(0, 0.45, 1.0);
  var KAM_2 = new THREE.Vector3(0, 3.1, 8.3);
  var NIG_2 = new THREE.Vector3(0, 0.85, 0);
  var nigoh = NIG_1.clone();
  kamera.position.copy(KAM_1);
  kamera.lookAt(nigoh);

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  sahna.add(new THREE.HemisphereLight(0xFFF6E6, 0xB08E64, 1.05));
  var quyosh = new THREE.DirectionalLight(0xFFEFD2, 1.4);
  quyosh.position.set(5, 11, 7);
  quyosh.castShadow = true;
  quyosh.shadow.mapSize.set(1536, 1536);
  quyosh.shadow.camera.left = -11; quyosh.shadow.camera.right = 11;
  quyosh.shadow.camera.top = 11;   quyosh.shadow.camera.bottom = -11;
  quyosh.shadow.camera.far = 34;
  quyosh.shadow.bias = -0.0009;
  sahna.add(quyosh);
  var toldiruvchi = new THREE.DirectionalLight(0xC1502E, 0.24);
  toldiruvchi.position.set(-6, 3, -5);
  sahna.add(toldiruvchi);

  /* ---------- Yer — har ikki bosqichda ko‘rinadi ---------- */
  function gilamYasa(en, boy, rang, hoshiyaRang) {
    var g = new THREE.Group();
    var asos = new THREE.Mesh(
      new THREE.BoxGeometry(en, 0.07, boy),
      new THREE.MeshStandardMaterial({ color: rang, roughness: 0.97 })
    );
    asos.position.y = 0.035;
    asos.receiveShadow = true;
    g.add(asos);
    [[en - 0.5, boy - 0.5], [en - 1.1, boy - 1.1]].forEach(function (o, i) {
      var ramka = new THREE.Mesh(
        new THREE.BoxGeometry(o[0], 0.012, o[1]),
        new THREE.MeshStandardMaterial({
          color: i ? 0xF1E3C8 : hoshiyaRang, roughness: 0.9,
          transparent: true, opacity: 0.55
        })
      );
      ramka.position.y = 0.075 + i * 0.004;
      g.add(ramka);
    });
    return g;
  }

  var pol = gilamYasa(15, 15, 0x8C3A2B, 0xD4A24C);
  sahna.add(pol);

  /* =========================================================
     5. XONA — 1-bosqich
     ========================================================= */
  var xona = new THREE.Group();
  sahna.add(xona);

  // Orqa devor
  var devor = new THREE.Mesh(
    new THREE.BoxGeometry(15, 4.2, 0.35),
    new THREE.MeshStandardMaterial({ color: 0xE6D5B4, roughness: 0.97 })
  );
  devor.position.set(0, 2.1, -6.6);
  devor.receiveShadow = true;
  xona.add(devor);
  // Devor hoshiyasi — ganch friz
  var friz = new THREE.Mesh(
    new THREE.BoxGeometry(15, 0.3, 0.45),
    new THREE.MeshStandardMaterial({ color: 0xF3EDE0, roughness: 0.9 })
  );
  friz.position.set(0, 3.3, -6.55);
  xona.add(friz);
  for (var fi = 0; fi < 22; fi++) {
    var yulduz = new THREE.Mesh(
      new THREE.ConeGeometry(0.11, 0.09, 8),
      new THREE.MeshStandardMaterial({ color: 0x1B3B6F, roughness: 0.7 })
    );
    yulduz.rotation.x = Math.PI / 2;
    yulduz.position.set(-7 + fi * 0.65, 3.3, -6.3);
    xona.add(yulduz);
  }

  // O‘yma eshik va ostona
  var eshikM = yasagich('eshik');
  if (eshikM) {
    var e = xavfsizYasa(eshikM.yasa);
    if (e) {
      e.scale.setScalar(2.6);
      e.position.set(0, 0.05, -6.35);
      e.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      xona.add(e);
    }
  }

  // Samovar burchakda
  var samovarM = yasagich('samovar');
  if (samovarM) {
    var sv = xavfsizYasa(samovarM.yasa);
    if (sv) {
      sv.scale.setScalar(1.6);
      sv.position.set(-5.1, 0.08, -4.2);
      sv.traverse(function (o) { if (o.isMesh) o.castShadow = true; });
      xona.add(sv);
    }
  }

  // Dasturxon — gilam ustida yozilgan
  var dasturxonM = yasagich('dasturxon');
  if (dasturxonM) {
    var dx = xavfsizYasa(dasturxonM.yasa);
    if (dx) {
      dx.scale.setScalar(4.3);
      dx.position.set(0, 0.08, 0.3);
      dx.traverse(function (o) { if (o.isMesh) o.receiveShadow = true; });
      xona.add(dx);
    }
  }

  // Ko‘rpachalar dasturxon atrofida
  var korpachaM = yasagich('korpacha');
  if (korpachaM) {
    [[-3.3, 0.3, 0], [3.3, 0.3, 0], [0, -3.1, 0], [-2.3, -2.3, Math.PI / 4], [2.3, -2.3, -Math.PI / 4]]
      .forEach(function (p) {
        var k = xavfsizYasa(korpachaM.yasa);
        if (!k) return;
        k.scale.setScalar(1.9);
        k.position.set(p[0], 0.08, p[1]);
        k.rotation.y = p[2] || 0;
        k.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        xona.add(k);
      });
  }

  /* ---------- Buyum taxtasi (oldinda) ---------- */
  var taxta = new THREE.Mesh(
    new THREE.BoxGeometry(8.4, 0.16, 2.9),
    new THREE.MeshStandardMaterial({ color: 0x8A6A44, roughness: 0.9 })
  );
  taxta.position.set(0, 0.12, 4.9);
  taxta.castShadow = true; taxta.receiveShadow = true;
  xona.add(taxta);
  var taxtaHoshiya = new THREE.Mesh(
    new THREE.BoxGeometry(8.6, 0.06, 3.1),
    new THREE.MeshStandardMaterial({ color: 0xB08E64, roughness: 0.85 })
  );
  taxtaHoshiya.position.set(0, 0.045, 4.9);
  xona.add(taxtaHoshiya);

  /* ---------- Buyum modellari va joylari ---------- */
  var buyumlar = [];   // { kalit, guruh, halqa, uy, maqsad, qoyilgan }

  TARTIB.forEach(function (b, i) {
    var manba = yasagich(b.kalit);
    var g = xavfsizYasa(manba.yasa);
    if (!g) return;
    g.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

    var ustun = i % 4, qator = Math.floor(i / 4);
    var uy = new THREE.Vector3(-3.0 + ustun * 2.0, 0.20, 4.25 + qator * 1.25);
    g.scale.setScalar(0.92);
    g.position.copy(uy);
    xona.add(g);

    // Dasturxondagi joy belgisi
    var halqa = new THREE.Mesh(
      new THREE.TorusGeometry(0.46, 0.035, 8, 30),
      new THREE.MeshStandardMaterial({
        color: 0xD4A24C, roughness: 0.5, metalness: 0.3,
        transparent: true, opacity: 0.0,
        emissive: new THREE.Color(0xD4A24C), emissiveIntensity: 0.4
      })
    );
    halqa.rotation.x = -Math.PI / 2;
    halqa.position.set(b.joy[0], 0.12, b.joy[2]);
    xona.add(halqa);

    buyumlar.push({
      kalit: b.kalit, nom: b.nom, izoh: b.izoh, guruh: g, halqa: halqa,
      uy: uy, maqsad: new THREE.Vector3(b.joy[0], 0.13, b.joy[2]), qoyilgan: false
    });
  });

  /* =========================================================
     6. DIORAMA MAYDONI — 2-bosqich
     ========================================================= */
  var diorama = new THREE.Group();
  diorama.visible = false;
  sahna.add(diorama);

  var poydevorlar = [];
  [-3.45, 0, 3.45].forEach(function (x, i) {
    var p = new THREE.Group();
    var disk = new THREE.Mesh(
      new THREE.CylinderGeometry(1.55, 1.62, 0.22, 32),
      new THREE.MeshStandardMaterial({ color: 0xC0A177, roughness: 0.94 })
    );
    disk.position.y = 0.11;
    disk.receiveShadow = true;
    p.add(disk);
    var halqa = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.07, 8, 40),
      new THREE.MeshStandardMaterial({
        color: 0xD4A24C, roughness: 0.45, metalness: 0.3,
        transparent: true, opacity: 0.35,
        emissive: new THREE.Color(0xD4A24C), emissiveIntensity: 0.15
      })
    );
    halqa.rotation.x = -Math.PI / 2;
    halqa.position.y = 0.23;
    p.add(halqa);
    // Raqam ustuni o‘rniga — turli balandlikdagi tayoqchalar (1, 2, 3)
    for (var t = 0; t <= i; t++) {
      var tayoq = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, 0.34, 10),
        new THREE.MeshStandardMaterial({ color: 0x1B3B6F, roughness: 0.6 })
      );
      tayoq.position.set(-1.25 + t * 0.17, 0.39, 1.24);
      p.add(tayoq);
    }
    p.position.set(x, 0.08, 0);
    p.userData.indeks = i;
    p.userData.halqa = halqa;
    p.userData.ich = new THREE.Group();
    p.add(p.userData.ich);
    diorama.add(p);
    poydevorlar.push(p);
  });

  function poydevorniTozala() {
    poydevorlar.forEach(function (p) {
      var ich = p.userData.ich;
      for (var i = ich.children.length - 1; i >= 0; i--) ich.remove(ich.children[i]);
    });
  }

  /* ---------- Diorama qurish yordamchilari ---------- */
  function odam(tur, chopon, boy) {
    if (!odamYasa) return null;
    var o = xavfsizYasa(function () {
      return odamYasa({ tur: tur, chopon: chopon, boy: boy });
    });
    if (o) o.traverse(function (n) { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
    return o;
  }

  function balandligi(obj) {
    obj.updateMatrixWorld(true);
    var q = new THREE.Box3().setFromObject(obj);
    return q.max.y - q.min.y;
  }

  function kaftgaQoy(figura, tomon, model, miqyos) {
    if (!figura || !model) return;
    var q = figura.userData && figura.userData.qism;
    var kaft = q && (tomon === 'chap' ? q.chapKaft : q.ongKaft);
    model.scale.setScalar(miqyos || 0.42);
    if (!kaft) { model.position.set(0, 0.9, 0.35); figura.add(model); return; }
    figura.updateMatrixWorld(true);
    var p = new THREE.Vector3();
    kaft.getWorldPosition(p);
    figura.worldToLocal(p);
    model.position.copy(p).add(new THREE.Vector3(0, 0.05, 0.04));
    figura.add(model);
  }

  function kichikDasturxon(guruh, x, z, burilish) {
    var d = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.035, 1.15),
      new THREE.MeshStandardMaterial({ color: 0xFBF7F0, roughness: 0.95 })
    );
    d.position.set(x, 0.24, z);
    d.rotation.y = burilish || 0;
    d.receiveShadow = true;
    guruh.add(d);
    var h = new THREE.Mesh(
      new THREE.BoxGeometry(1.32, 0.008, 0.98),
      new THREE.MeshStandardMaterial({ color: 0xC1502E, roughness: 0.9, transparent: true, opacity: 0.6 })
    );
    h.position.set(x, 0.262, z);
    h.rotation.y = burilish || 0;
    guruh.add(h);
    return d;
  }

  function ostonaVaEshik(guruh) {
    var dev = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 1.7, 0.18),
      new THREE.MeshStandardMaterial({ color: 0xE6D5B4, roughness: 0.96 })
    );
    dev.position.set(0, 1.07, -0.75);
    dev.receiveShadow = true;
    guruh.add(dev);
    var teshik = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 1.35, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x2A2118, roughness: 1 })
    );
    teshik.position.set(0, 0.92, -0.68);
    guruh.add(teshik);
    // Ikki tabaqa — yon tomonga ochilgan
    [[-0.78, 0.5], [0.78, -0.5]].forEach(function (t) {
      var tab = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 1.32, 0.07),
        new THREE.MeshStandardMaterial({ color: 0x6E5334, roughness: 0.85 })
      );
      tab.position.set(t[0], 0.9, -0.6);
      tab.rotation.y = t[1];
      tab.castShadow = true;
      guruh.add(tab);
      var pan = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 0.5, 0.02),
        new THREE.MeshStandardMaterial({ color: 0x8A6A44, roughness: 0.8 })
      );
      pan.position.set(t[0] + Math.sin(t[1]) * 0.05, 1.05, -0.6 + Math.cos(t[1]) * 0.05);
      pan.rotation.y = t[1];
      guruh.add(pan);
    });
    // OSTONA — bo‘sag‘a
    var ostona = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.16, 0.34),
      new THREE.MeshStandardMaterial({ color: 0x5A452C, roughness: 0.88 })
    );
    ostona.position.set(0, 0.3, -0.55);
    ostona.castShadow = true; ostona.receiveShadow = true;
    guruh.add(ostona);
    return ostona;
  }

  /* ---------- Savollar ---------- */
  var SAVOLLAR = [];

  if (odamYasa) {
    SAVOLLAR.push({
      savol: 'Bola kattaga qanday salom beradi?',
      togri: 0,
      izohlar: [
        'To‘g‘ri. O‘zbek odobida kichik kattaga o‘ng qo‘lini ko‘ksiga qo‘yib, ' +
        'boshini biroz egib salom beradi. Salomni kichik birinchi beradi.',
        'Qo‘lni belga qo‘yib, boshni orqaga tashlab turish — kibr belgisi. ' +
        'Xalqimizda bunday holat hurmatsizlik hisoblanadi.',
        'Salomlashishda va biror narsani uzatishda chap qo‘l ishlatilmaydi. ' +
        'O‘ng qo‘l — hurmat, chap qo‘l — beodoblik belgisi sanalgan.'
      ],
      qur: function (ich, variant) {
        var katta = odam('katta', 0x1B3B6F, 1.55);
        var bola  = odam('bola', 0x8C3A2B, 1.02);
        if (!katta || !bola) return false;
        katta.position.set(-0.52, 0.22, 0);
        katta.rotation.y = Math.PI / 2;
        pozaBer(katta, 'tik');
        ich.add(katta);
        bola.position.set(0.55, 0.22, 0);
        bola.rotation.y = -Math.PI / 2;
        pozaBer(bola, ['salom', 'kibr', 'chapQol'][variant]);
        ich.add(bola);
        return true;
      }
    });

    SAVOLLAR.push({
      savol: 'Bola piyolani kattaga qanday uzatadi?',
      togri: 0,
      izohlar: [
        'To‘g‘ri. Piyola, non, kosa — hammasi ikki qo‘llab yoki o‘ng qo‘l bilan ' +
        '(chap qo‘l ko‘krakda) uzatiladi. Bu chuqur hurmat ifodasi.',
        'Bir qo‘lda, shoshib uzatish — mehmonni yoki kattani e’tiborsiz qoldirish ' +
        'demakdir. Odob bo‘yicha ikkinchi qo‘l ham qo‘shiladi.',
        'Chap qo‘l bilan uzatish xalqimizda qat’iy man etilgan. Bu odobsizlik ' +
        'sanaladi va bola kichikligidan shundan qaytariladi.'
      ],
      qur: function (ich, variant) {
        var katta = odam('katta', 0x2F6B45, 1.55);
        var bola  = odam('bola', 0xD4A24C, 1.02);
        if (!katta || !bola) return false;
        katta.position.set(-0.52, 0.22, 0);
        katta.rotation.y = Math.PI / 2;
        pozaBer(katta, 'olish');
        ich.add(katta);
        bola.position.set(0.58, 0.22, 0);
        bola.rotation.y = -Math.PI / 2;
        pozaBer(bola, ['ikkiQol', 'birQol', 'chapQol'][variant]);
        var pm = yasagich('piyola');
        var p = pm ? xavfsizYasa(pm.yasa) : null;
        if (p) {
          p.traverse(function (o) { if (o.isMesh) o.castShadow = true; });
          kaftgaQoy(bola, variant === 2 ? 'chap' : 'ong', p, 0.5);
        }
        ich.add(bola);
        return true;
      }
    });
  }

  SAVOLLAR.push({
    savol: 'Non dasturxonda qanday turishi kerak?',
    togri: 0,
    izohlar: [
      'To‘g‘ri. Non yuzi — naqshli tomoni — doim yuqoriga qaratib qo‘yiladi va ' +
      'dasturxonning to‘riga to‘g‘rilanadi.',
      'Nonni ag‘darib qo‘yish xalqimizda og‘ir gunoh sanalgan: «Non — ne’mat, ' +
      'uni ag‘darma» deb o‘rgatilgan.',
      'Nonni yerga qo‘yish yoki tashlab yuborish mumkin emas. Yerdagi non ' +
      'ko‘tarilib, ko‘zga surtilib, baland joyga qo‘yiladi.'
    ],
    qur: function (ich, variant) {
      var nm = yasagich('non');
      var n = nm ? xavfsizYasa(nm.yasa) : null;
      if (!n) return false;
      n.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      n.scale.setScalar(0.9);
      var h = balandligi(n);
      kichikDasturxon(ich, 0, 0.05, 0);
      if (variant === 0) {
        n.position.set(0, 0.27, 0.05);
      } else if (variant === 1) {
        n.rotation.x = Math.PI;
        n.position.set(0, 0.27 + h, 0.05);
      } else {
        n.position.set(0.72, 0.02, 0.82);
        n.rotation.z = 0.35;
      }
      ich.add(n);
      // Yonida choynak — dasturxon ekanini bildiradi
      var cm = yasagich('choynak');
      var c = cm ? xavfsizYasa(cm.yasa) : null;
      if (c) {
        c.traverse(function (o) { if (o.isMesh) o.castShadow = true; });
        c.scale.setScalar(0.6);
        c.position.set(-0.5, 0.27, -0.28);
        ich.add(c);
      }
      return true;
    }
  });

  SAVOLLAR.push({
    savol: 'Poyabzal ostonada qanday qoldiriladi?',
    togri: 0,
    izohlar: [
      'To‘g‘ri. Kavush ostonadan tashqarida, juft qilib, uchi eshikka qaratib ' +
      'qo‘yiladi — chiqishda kiyish oson bo‘ladi va xona toza qoladi.',
      'Poyabzalni xonaga, gilam ustiga kiritish mumkin emas: uy — poklik joyi, ' +
      'dasturxon esa shu gilamga yoziladi.',
      'Ostona ustida yoki eshik og‘zida sochilib yotgan poyabzal yo‘lni to‘sadi. ' +
      'Ostonaga qadam qo‘yish yoki unda turish ham odobdan emas.'
    ],
    qur: function (ich, variant) {
      var ostona = ostonaVaEshik(ich);
      var km = yasagich('kavush');
      var k = km ? xavfsizYasa(km.yasa) : null;
      if (!k) return false;
      k.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      k.scale.setScalar(0.62);
      if (variant === 0) {
        k.position.set(0, 0.22, -0.2);   // ostonadan tashqarida, uchi eshikka
        k.rotation.y = Math.PI;
      } else if (variant === 1) {
        k.position.set(0.15, 0.22, 0.72); // xona ichida, gilam ustida
        k.rotation.y = 0.3;
        var kg = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 0.04, 1.1),
          new THREE.MeshStandardMaterial({ color: 0x8C3A2B, roughness: 0.96 })
        );
        kg.position.set(0.1, 0.235, 0.72);
        kg.receiveShadow = true;
        ich.add(kg);
      } else {
        k.position.set(0.05, 0.40, -0.55); // ostona ustida ko‘ndalang
        k.rotation.set(0, Math.PI / 2, 0.18);
      }
      ich.add(k);
      return ostona ? true : true;
    }
  });

  SAVOLLAR.push({
    savol: 'Mehmonning ko‘rpachasi qayerga solinadi?',
    togri: 0,
    izohlar: [
      'To‘g‘ri. Mehmon TO‘RGA — eshikdan eng uzoq, eng hurmatli joyga o‘tqaziladi. ' +
      'Bu joy oilaning eng aziz kishisiga atalgan.',
      'Eshik yoni — uy egasining yoki kichiklarning joyi: u yerda o‘tirgan kishi ' +
      'kelib-ketuvchilarga xizmat qiladi. Mehmonni bu yerga o‘tqazish — kamsitish.',
      'Ostonada o‘tirish yoki ostona ustida joy solish xalqimizda man etilgan: ' +
      '«Ostona — uyning chegarasi, unda o‘tirilmaydi» deyilgan.'
    ],
    qur: function (ich, variant) {
      ostonaVaEshik(ich);
      var xm = yasagich('korpacha');
      var k = xm ? xavfsizYasa(xm.yasa) : null;
      if (!k) return false;
      k.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      k.scale.setScalar(1.15);
      var joy = [[0, 0.24, 0.85], [-0.95, 0.24, -0.1], [0, 0.40, -0.55]][variant];
      k.position.set(joy[0], joy[1], joy[2]);
      k.rotation.y = variant === 1 ? Math.PI / 2 : 0;
      ich.add(k);

      var mehmon = odam('katta', 0x8C3A2B, 1.45);
      if (mehmon) {
        pozaBer(mehmon, 'otirish');
        mehmon.position.set(joy[0], joy[1] + 0.06, joy[2] + (variant === 1 ? 0 : 0.02));
        mehmon.rotation.y = variant === 1 ? Math.PI / 2 : Math.PI;
        ich.add(mehmon);
      }
      var dm = yasagich('dasturxon');
      var d = dm ? xavfsizYasa(dm.yasa) : null;
      if (d) {
        d.scale.setScalar(1.5);
        d.position.set(0, 0.235, 0.15);
        d.traverse(function (o) { if (o.isMesh) o.receiveShadow = true; });
        ich.add(d);
      }
      return true;
    }
  });

  /* =========================================================
     7. Animatsiya navbati
     ========================================================= */
  var vazifalar = [];
  function qoshVazifa(dav, qadam, tugash) {
    vazifalar.push({ t: 0, dav: kamHarakat ? 0.001 : Math.max(dav, 0.001),
                     qadam: qadam || function () {}, tugash: tugash || null });
  }
  function yumshoq(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function kutish(d) { qoshVazifa(d, null, null); }

  function uchir(obj, dan, ga, dav, m1) {
    var m0 = obj.scale.x;
    qoshVazifa(dav, function (p) {
      var e = yumshoq(p);
      obj.position.lerpVectors(dan, ga, e);
      obj.position.y += Math.sin(p * Math.PI) * 1.5;
      obj.scale.setScalar(m0 + (m1 - m0) * e);
    }, function () { obj.position.copy(ga); obj.scale.setScalar(m1); });
  }

  function silkit(obj, dav) {
    var p0 = obj.position.clone();
    qoshVazifa(dav, function (p) {
      obj.position.x = p0.x + Math.sin(p * Math.PI * 9) * 0.18 * (1 - p);
    }, function () { obj.position.copy(p0); });
  }

  function halqaChaqnat(mat, rang, dav, asosOpak) {
    var asos = mat.color.clone();
    var yangi = new THREE.Color(rang);
    qoshVazifa(dav, function (p) {
      var k = Math.sin(Math.min(p, 1) * Math.PI);
      mat.color.copy(asos).lerp(yangi, k);
      mat.emissive.copy(asos).lerp(yangi, k);
      mat.emissiveIntensity = 0.15 + k * 0.9;
      mat.opacity = (asosOpak === undefined ? 0.35 : asosOpak) + k * 0.55;
    }, function () {
      mat.color.copy(asos); mat.emissive.copy(asos);
      mat.emissiveIntensity = 0.15;
      mat.opacity = (asosOpak === undefined ? 0.35 : asosOpak);
    });
  }

  function kameraKoch(pos, qara, dav) {
    var p0 = kamera.position.clone(), n0 = nigoh.clone();
    qoshVazifa(dav, function (p) {
      var e = yumshoq(p);
      kamera.position.lerpVectors(p0, pos, e);
      nigoh.lerpVectors(n0, qara, e);
    }, null);
  }

  /* =========================================================
     8. 1-BOSQICH — dasturxon tuzish
     ========================================================= */
  var qadam = 0, ball = 0, holat = 'tayyor';
  var b1Togri = 0, b1Jami = buyumlar.length;

  function belgiKorsat() {
    // Navbatdagi buyumning joyi ohista yonib turadi
    buyumlar.forEach(function (b, i) {
      b.halqa.material.opacity = (i === qadam && holat === 'tanlash') ? 0.55 : 0.0;
    });
  }

  function bosqichBirBoshla() {
    qadam = 0; b1Togri = 0;
    buyumlar.forEach(function (b) {
      b.qoyilgan = false;
      b.guruh.position.copy(b.uy);
      b.guruh.scale.setScalar(0.92);
      b.guruh.rotation.set(0, 0, 0);
      b.halqa.material.opacity = 0;
    });
    elJami.textContent = b1Jami;
    elQadam.textContent = '0';
    elBosqich.textContent = '1';
    holat = 'tanlash';
    belgiKorsat();
    tanlovTugmalari([]);
    xabar('Dasturxonga qaysi buyum birinchi qo‘yiladi?');
    izoh('1-bosqich — dasturxon tuzish',
      'Oldingi taxtada sakkiz buyum turibdi. Ularni an’anaviy tartibda ' +
      'dasturxonga qo‘ying: buyumni bosing. Dasturxondagi oltin halqa — ' +
      'navbatdagi buyumning joyi.');
  }

  function buyumBosildi(b) {
    if (holat !== 'tanlash' || b.qoyilgan) return;
    var kutilgan = buyumlar[qadam];
    if (b === kutilgan) {
      holat = 'javob';
      b.qoyilgan = true;
      b1Togri++; ball++;
      elBall.textContent = ball;
      halqaChaqnat(b.halqa.material, 0x2F6B45, 0.9, 0.55);
      uchir(b.guruh, b.guruh.position.clone(), b.maqsad.clone(), 0.8, 1.05);
      xabar('To‘g‘ri: ' + b.nom);
      izoh(b.nom, b.izoh, 'yashil');
      qadam++;
      elQadam.textContent = qadam;
      kutish(0.75);
      qoshVazifa(0.001, null, function () {
        if (qadam >= buyumlar.length) { bosqichBirTugadi(); return; }
        holat = 'tanlash';
        belgiKorsat();
        xabar('Endi navbat qaysi buyumga?');
      });
    } else {
      holat = 'javob';
      silkit(b.guruh, 0.5);
      xabar('Bu buyum hali erta — navbat «' + kutilgan.nom + '» ga.');
      izoh('Tartib buzildi', 'Hozir dasturxonga <b>' + kutilgan.nom + '</b> qo‘yilishi ' +
        'kerak. ' + kutilgan.izoh, 'qizil');
      kutish(0.6);
      qoshVazifa(0.001, null, function () { holat = 'tanlash'; belgiKorsat(); });
    }
  }

  function bosqichBirTugadi() {
    holat = 'oraliq';
    belgiKorsat();
    var foiz = Math.round(b1Togri / b1Jami * 100);
    xabar('Dasturxon tayyor! Mehmonni taklif qilsa bo‘ladi.');
    izoh('1-bosqich tugadi — dasturxon to‘liq tuzildi',
      'Endi odob bosqichiga o‘ting: uch xil holatdan to‘g‘risini tanlaysiz. ' +
      '«Odob bosqichiga o‘tish» tugmasini bosing.', 'yashil');
    saqla();
    if (SAVOLLAR.length) { tOdob.hidden = false; tOdob.focus(); }
    else { yakun(); }
  }

  /* =========================================================
     9. 2-BOSQICH — odob tanlovi
     ========================================================= */
  var sNomer = 0, b2Togri = 0, tartib2 = [], joriySavol = null, joriyTartib = null;

  function aralash(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function tanlovTugmalari(yorliqlar) {
    qatorTan.innerHTML = '';
    yorliqlar.forEach(function (y, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'm3-tan';
      b.textContent = y;
      b.addEventListener('click', function () { dioramaJavob(i); });
      qatorTan.appendChild(b);
    });
  }

  function bosqichIkkiBoshla() {
    vazifalar.length = 0;
    holat = 'kamera';
    tOdob.hidden = true;
    elBosqich.textContent = '2';
    sNomer = 0; b2Togri = 0;
    tartib2 = SAVOLLAR.map(function (_, i) { return i; });
    xona.visible = false;
    diorama.visible = true;
    kameraKoch(KAM_2.clone(), NIG_2.clone(), 1.0);
    elJami.textContent = SAVOLLAR.length;
    elQadam.textContent = '0';
    qoshVazifa(0.001, null, function () { keyingiDiorama(); });
  }

  function keyingiDiorama() {
    if (sNomer >= tartib2.length) { yakun(); return; }
    var s = SAVOLLAR[tartib2[sNomer]];
    joriySavol = s;
    poydevorniTozala();

    // Variantlar tasodifiy joylashadi
    joriyTartib = aralash([0, 1, 2]);
    var qurildi = true;
    poydevorlar.forEach(function (p, i) {
      var ok = false;
      try { ok = s.qur(p.userData.ich, joriyTartib[i], i); } catch (e) { ok = false; }
      if (!ok) qurildi = false;
      p.userData.halqa.material.opacity = 0.35;
    });
    if (!qurildi) { sNomer++; keyingiDiorama(); return; }

    sNomer++;
    elQadam.textContent = sNomer;
    holat = 'diorama';
    tanlovTugmalari(['1-holat', '2-holat', '3-holat']);
    xabar(s.savol);
    izoh('', s.savol + ' Uch dioramadan to‘g‘risini bosing yoki pastdagi tugmani tanlang.');
  }

  function dioramaJavob(indeks) {
    if (holat !== 'diorama') return;
    holat = 'javob2';
    var variant = joriyTartib[indeks];
    var togri = (variant === joriySavol.togri);
    var togriIndeks = joriyTartib.indexOf(joriySavol.togri);

    var tugmalar = qatorTan.querySelectorAll('.m3-tan');
    for (var i = 0; i < tugmalar.length; i++) tugmalar[i].disabled = true;
    if (tugmalar[togriIndeks]) tugmalar[togriIndeks].classList.add('m3-togri');
    if (!togri && tugmalar[indeks]) tugmalar[indeks].classList.add('m3-xato');

    if (togri) {
      b2Togri++; ball++;
      elBall.textContent = ball;
      halqaChaqnat(poydevorlar[indeks].userData.halqa.material, 0x2F6B45, 1.0);
      xabar('To‘g‘ri javob!');
    } else {
      halqaChaqnat(poydevorlar[indeks].userData.halqa.material, 0xA3232C, 0.8);
      halqaChaqnat(poydevorlar[togriIndeks].userData.halqa.material, 0x2F6B45, 1.2);
      xabar('To‘g‘risi — ' + (togriIndeks + 1) + '-holat.');
    }
    izoh((togriIndeks + 1) + '-holat to‘g‘ri', joriySavol.izohlar[variant],
         togri ? 'yashil' : 'qizil');

    kutish(togri ? 1.6 : 2.4);
    qoshVazifa(0.001, null, function () { keyingiDiorama(); });
  }

  /* =========================================================
     10. Yakun va saqlash
     ========================================================= */
  function saqla() {
    var jami = b1Jami + SAVOLLAR.length;
    var foiz = jami ? Math.round((b1Togri + b2Togri) / jami * 100) : 0;
    try {
      if (window.Xotira && window.Xotira.modulYoz) {
        window.Xotira.modulYoz(11, { oyin3d: foiz });
      }
    } catch (e) {}
    return foiz;
  }

  function yakun() {
    holat = 'tugadi';
    tanlovTugmalari([]);
    poydevorniTozala();
    var foiz = saqla();
    xabar('O‘yin tugadi — ' + foiz + '%');
    var baho = foiz >= 85 ? 'Ajoyib! Dasturxon odobi va muomala qoidalarini puxta bilasiz.'
             : foiz >= 60 ? 'Yaxshi natija. Ayrim qoidalarni takrorlab qo‘ying.'
             : 'Mavzuni qayta o‘qib, o‘yinni takrorlang.';
    izoh('Umumiy natija: ' + foiz + '%',
      baho + ' Dasturxon tuzish: ' + b1Togri + '/' + b1Jami +
      ', odob savollari: ' + b2Togri + '/' + SAVOLLAR.length + '.',
      foiz >= 60 ? 'yashil' : '');
    tBoshla.textContent = '▶ Qaytadan o‘ynash';
  }

  /* =========================================================
     11. Bosish
     ========================================================= */
  var nur = new THREE.Raycaster();
  var nuqta = new THREE.Vector2();

  canvas.addEventListener('pointerdown', function (ev) {
    var r = canvas.getBoundingClientRect();
    nuqta.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
    nuqta.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
    nur.setFromCamera(nuqta, kamera);

    if (holat === 'tanlash') {
      var guruhlar = buyumlar.filter(function (b) { return !b.qoyilgan; })
        .map(function (b) { return b.guruh; });
      if (!guruhlar.length) return;
      var k = nur.intersectObjects(guruhlar, true);
      if (!k.length) return;
      var o = k[0].object;
      while (o && guruhlar.indexOf(o) === -1) o = o.parent;
      if (!o) return;
      for (var i = 0; i < buyumlar.length; i++) {
        if (buyumlar[i].guruh === o) { buyumBosildi(buyumlar[i]); return; }
      }
      return;
    }

    if (holat === 'diorama') {
      var k2 = nur.intersectObjects(poydevorlar, true);
      if (!k2.length) return;
      var p = k2[0].object;
      while (p && poydevorlar.indexOf(p) === -1) p = p.parent;
      if (p) dioramaJavob(p.userData.indeks);
    }
  });

  /* =========================================================
     12. Tugmalar
     ========================================================= */
  function hammasiniQayta() {
    vazifalar.length = 0;
    poydevorniTozala();
    diorama.visible = false;
    xona.visible = true;
    kamera.position.copy(KAM_1);
    nigoh.copy(NIG_1);
    ball = 0; b2Togri = 0; sNomer = 0;
    elBall.textContent = '0';
    tOdob.hidden = true;
    tanlovTugmalari([]);
  }

  tBoshla.addEventListener('click', function () {
    hammasiniQayta();
    tBoshla.textContent = '▶ Qaytadan boshlash';
    bosqichBirBoshla();
  });
  tOdob.addEventListener('click', bosqichIkkiBoshla);
  tQayta.addEventListener('click', function () {
    hammasiniQayta();
    buyumlar.forEach(function (b) {
      b.qoyilgan = false;
      b.guruh.position.copy(b.uy);
      b.guruh.scale.setScalar(0.92);
      b.halqa.material.opacity = 0;
    });
    qadam = 0; b1Togri = 0;
    elQadam.textContent = '0';
    elJami.textContent = b1Jami;
    elBosqich.textContent = '1';
    tBoshla.textContent = '▶ Mehmon kutishni boshlash';
    holat = 'tayyor';
    xabar('«Mehmon kutishni boshlash» tugmasini bosing');
    izoh('', 'Mehmon keldi. Dasturxonni an’anaviy tartibda tuzing, so‘ng odob ' +
      'holatlarini farqlab ko‘ring.');
  });

  elJami.textContent = b1Jami;

  /* =========================================================
     13. O‘lcham va render halqasi
     ========================================================= */
  function olcham() {
    var w = idish.clientWidth || 640;
    var h = Math.max(300, Math.min(Math.round(w * 0.63), 560));
    renderer.setSize(w, h, false);
    kamera.aspect = w / h;
    kamera.updateProjectionMatrix();
  }
  olcham();
  if (window.ResizeObserver) new ResizeObserver(olcham).observe(idish);
  else window.addEventListener('resize', olcham);

  var ishlayapti = false, oxirgi = 0, soat = 0;

  function halqaFn(vaqt) {
    if (!ishlayapti) return;
    var dt = Math.min((vaqt - oxirgi) / 1000, 0.05);
    oxirgi = vaqt;
    soat += dt;

    if (vazifalar.length) {
      var v = vazifalar[0];
      v.t += dt;
      var p = Math.min(v.t / v.dav, 1);
      v.qadam(p);
      if (p >= 1) { vazifalar.shift(); if (v.tugash) v.tugash(); }
    }

    // Navbatdagi joy belgisi pulsatsiya qiladi
    if (holat === 'tanlash' && buyumlar[qadam] && !kamHarakat) {
      buyumlar[qadam].halqa.material.opacity = 0.35 + Math.sin(soat * 3.2) * 0.22;
      buyumlar[qadam].guruh.rotation.y += dt * 0.5;
    }

    kamera.lookAt(nigoh);
    renderer.render(sahna, kamera);
    requestAnimationFrame(halqaFn);
  }

  function yoq() {
    if (ishlayapti) return;
    ishlayapti = true;
    oxirgi = performance.now();
    requestAnimationFrame(halqaFn);
  }
  function ochir() { ishlayapti = false; }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (y) {
      if (y[0].isIntersecting) yoq(); else ochir();
    }, { threshold: 0.02 }).observe(idish);
  } else { yoq(); }
  renderer.render(sahna, kamera);

  window.addEventListener('pagehide', function () {
    ochir();
    try { renderer.dispose(); } catch (e) {}
  });
})();
