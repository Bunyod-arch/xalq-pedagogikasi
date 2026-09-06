/* =========================================================
   «MAROSIM DASTURXONINI TAYYORLA» — HAQIQIY 3D O‘YIN
   7-modul: milliy urf-odatlar, an’analar, udumlar va marosimlar.

   O‘YIN QOIDASI
   Sahnada gilam ustiga yozilgan dasturxon va uning oldida
   javon turadi. Har bosqichda bitta marosim e’lon qilinadi
   (beshik to‘yi, sunnat to‘yi, nikoh to‘yi, Navro‘z, hosil
   bayrami). Javonda sakkizta 3D buyum ko‘rinadi: to‘rttasi shu
   marosimga tegishli, to‘rttasi boshqa marosimniki. O‘yinchi
   mos buyumlarni bosib tanlaydi — to‘g‘ri buyum yoy chizib
   dasturxonga uchib boradi va shu yerda qoladi. Xato tanlansa,
   buyum silkinadi va qaysi marosimga tegishli ekani aytiladi.
   Beshala marosim yakunlangach foiz hisoblanadi va natija
   modul xotirasiga yoziladi.

   Bu fayl mustaqil: o‘z HTML karkasini, o‘z uslublarini va
   butun 3D sahnasini o‘zi quradi. Umumiy fayllarga tegmaydi.
   Three.js faqat assets/vendor/ dan olinadi.
   ========================================================= */
import * as THREE from '../vendor/three.module.min.js';
import { MAROSIM, MAROSIMLAR } from './model-marosim.js';

(function () {
  'use strict';

  /* =========================================================
     0. IDISHNI TOPISH
     ========================================================= */
  var idish = document.getElementById('oyin3d-marosim') ||
              document.getElementById('oyin3d');
  if (!idish) return;
  if (idish.dataset.oyin3dBand) return;
  idish.dataset.oyin3dBand = 'marosim';

  var TUGMA_NOM = '▶ O‘yinni boshlash';

  /* =========================================================
     1. USLUBLAR — faqat shu o‘yinga tegishli (`o3mr-` prefiks)
     ========================================================= */
  if (!document.getElementById('o3mr-uslub')) {
    var uslub = document.createElement('style');
    uslub.id = 'o3mr-uslub';
    uslub.textContent = [
      '.o3mr-boshlash{display:flex;flex-direction:column;align-items:center;gap:14px;',
      '  padding:30px 22px;border-radius:18px;text-align:center;',
      '  background:linear-gradient(150deg,#1F3A5F 0%,#3A2A4E 60%,#7A2436 100%);color:#FBF7F0;',
      '  box-shadow:0 2px 4px rgba(26,22,20,.08),0 12px 28px rgba(26,22,20,.16);}',
      '.o3mr-boshlash h4{margin:0;font-size:1.16rem;line-height:1.3;}',
      '.o3mr-boshlash p{margin:0;max-width:52ch;font-size:.93rem;line-height:1.55;opacity:.94;}',
      '.o3mr-tugma{cursor:pointer;margin-top:4px;padding:13px 30px;border:0;border-radius:999px;',
      '  background:#D4A24C;color:#2A1B08;font:inherit;font-size:1rem;font-weight:700;',
      '  box-shadow:0 6px 18px rgba(26,22,20,.32);transition:transform .15s ease,background .15s ease;}',
      '.o3mr-tugma:hover{transform:translateY(-2px);background:#E4B563;}',
      '.o3mr-tugma:active{transform:translateY(1px);}',
      '.o3mr-tugma:focus-visible{outline:3px solid #FBF7F0;outline-offset:3px;}',
      '.o3mr-sahna{position:relative;width:100%;border-radius:18px;overflow:hidden;background:#F0E2C8;',
      '  box-shadow:0 2px 4px rgba(26,22,20,.08),0 12px 28px rgba(26,22,20,.14);}',
      '.o3mr-sahna canvas{display:block;width:100%;height:auto;touch-action:manipulation;cursor:pointer;}',
      '.o3mr-ust{position:absolute;inset:0;pointer-events:none;font:inherit;}',
      '.o3mr-qator{position:absolute;top:11px;left:11px;right:11px;display:flex;',
      '  align-items:flex-start;justify-content:space-between;gap:8px;flex-wrap:wrap;}',
      '.o3mr-tabl{flex:0 0 auto;display:inline-flex;gap:6px;align-items:baseline;',
      '  padding:7px 14px;border-radius:999px;background:rgba(251,247,240,.93);color:#1B3B6F;',
      '  font-size:.82rem;font-weight:600;white-space:nowrap;box-shadow:0 2px 8px rgba(26,22,20,.18);}',
      '.o3mr-tabl b{font-size:1rem;color:#C1502E;}',
      '.o3mr-nom{flex:1 1 auto;order:0;min-width:0;padding:8px 18px;border-radius:999px;',
      '  background:rgba(31,58,95,.94);color:#FBF7F0;font-size:.98rem;font-weight:700;',
      '  line-height:1.3;text-align:center;box-shadow:0 4px 14px rgba(26,22,20,.28);}',
      '.o3mr-past{position:absolute;left:12px;right:12px;bottom:12px;text-align:center;}',
      '.o3mr-xabar{display:inline-block;margin:0;max-width:100%;padding:8px 17px;border-radius:999px;',
      '  background:rgba(30,26,20,.68);color:#FBF7F0;font-size:.86rem;font-weight:600;line-height:1.4;}',
      '.o3mr-xabar:empty{display:none;}',
      '.o3mr-xabar.togri{background:rgba(31,84,52,.9);color:#DFF6E4;}',
      '.o3mr-xabar.xato{background:rgba(150,52,26,.9);color:#FFE2D6;}',
      '.o3mr-natija{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;',
      '  justify-content:center;gap:10px;text-align:center;padding:20px;',
      '  background:rgba(31,58,95,.92);color:#FBF7F0;}',
      '.o3mr-natija h4{margin:0;font-size:1.22rem;}',
      '.o3mr-foiz{font-size:2.5rem;font-weight:800;color:#D4A24C;line-height:1;}',
      '.o3mr-natija p{margin:0;font-size:.92rem;max-width:38ch;line-height:1.5;}',
      '.o3mr-qayta{pointer-events:auto;cursor:pointer;margin-top:6px;padding:11px 24px;border:0;',
      '  border-radius:999px;background:#D4A24C;color:#2A1B08;font:inherit;font-size:.96rem;',
      '  font-weight:700;box-shadow:0 4px 12px rgba(26,22,20,.3);transition:transform .15s ease;}',
      '.o3mr-qayta:hover{transform:translateY(-2px);}',
      '.o3mr-xato-quti{margin:0;padding:22px;border-radius:16px;background:#FBF7F0;color:#1B3B6F;',
      '  text-align:center;font-weight:600;line-height:1.5;}',
      '.o3mr-tor .o3mr-qator{top:7px;left:7px;right:7px;gap:5px;}',
      '.o3mr-tor .o3mr-tabl{padding:4px 9px;font-size:.68rem;gap:4px;}',
      '.o3mr-tor .o3mr-tabl b{font-size:.8rem;}',
      '.o3mr-tor .o3mr-nom{padding:5px 11px;font-size:.78rem;}',
      '.o3mr-tor .o3mr-past{left:7px;right:7px;bottom:8px;}',
      '.o3mr-tor .o3mr-xabar{padding:5px 11px;font-size:.71rem;}',
      '.o3mr-tor .o3mr-foiz{font-size:1.9rem;}',
      '.o3mr-tor .o3mr-natija h4{font-size:1.02rem;}',
      '.o3mr-tor .o3mr-natija p{font-size:.78rem;}',
      '@media (prefers-reduced-motion: reduce){.o3mr-tugma,.o3mr-qayta{transition:none;}}'
    ].join('\n');
    document.head.appendChild(uslub);
  }

  /* =========================================================
     2. WEBGL TEKSHIRUVI VA BOSHLASH PANELI
     ========================================================= */
  function webglBor() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }

  if (!webglBor()) {
    var xato = document.createElement('p');
    xato.className = 'o3mr-xato-quti';
    xato.textContent = 'Brauzeringiz 3D grafikani qo‘llab-quvvatlamaydi. ' +
      'Quyidagi interaktiv o‘yin va test topshiriqlari orqali mavzuni ' +
      'baribir o‘zlashtirishingiz mumkin.';
    idish.appendChild(xato);
    return;
  }

  var panel = document.createElement('div');
  panel.className = 'o3mr-boshlash';
  panel.innerHTML =
    '<h4>Marosim dasturxonini tayyorla</h4>' +
    '<p>Beshik to‘yi, sunnat to‘yi, nikoh to‘yi, Navro‘z va hosil bayrami — ' +
    'beshta marosim navbat bilan e’lon qilinadi. Javondagi buyumlardan shu ' +
    'marosimga tegishli bo‘lgan to‘rttasini toping va dasturxonga qo‘ying.</p>' +
    '<button type="button" class="o3mr-tugma">' + TUGMA_NOM + '</button>';
  idish.appendChild(panel);

  var boshlaTugma = panel.querySelector('.o3mr-tugma');
  boshlaTugma.addEventListener('click', function () {
    boshlaTugma.disabled = true;
    boshlaTugma.textContent = 'Sahna tayyorlanmoqda…';
    // Sahna ogʻir — brauzer tugma holatini chizib ulgursin.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        try {
          panel.remove();
          oyinniQur();
        } catch (e) {
          var p = document.createElement('p');
          p.className = 'o3mr-xato-quti';
          p.textContent = '3D sahnani ochib bo‘lmadi. Sahifani yangilab ko‘ring.';
          idish.appendChild(p);
          if (window.console) console.error(e);
        }
      });
    });
  });

  /* =========================================================
     3. O‘YINNI QURISH
     ========================================================= */
  function oyinniQur() {

    var kamHarakat = !!(window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    /* ---------- HTML karkas ---------- */
    var sahnaDiv = document.createElement('div');
    sahnaDiv.className = 'o3mr-sahna';
    sahnaDiv.innerHTML =
      '<canvas></canvas>' +
      '<div class="o3mr-ust">' +
        '<div class="o3mr-qator">' +
          '<span class="o3mr-tabl">Ball <b class="o3mr-ball">0</b></span>' +
          '<span class="o3mr-nom">Tayyorlanmoqda…</span>' +
          '<span class="o3mr-tabl">Qoldi <b class="o3mr-qoldi">4</b></span>' +
        '</div>' +
        '<div class="o3mr-past">' +
          '<p class="o3mr-xabar" role="status">Marosimga mos buyumni bosing</p>' +
        '</div>' +
      '</div>';
    idish.appendChild(sahnaDiv);

    var canvas   = sahnaDiv.querySelector('canvas');
    var ballEl   = sahnaDiv.querySelector('.o3mr-ball');
    var qoldiEl  = sahnaDiv.querySelector('.o3mr-qoldi');
    var nomEl    = sahnaDiv.querySelector('.o3mr-nom');
    var xabarEl  = sahnaDiv.querySelector('.o3mr-xabar');

    /* ---------- Renderer ---------- */
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas, antialias: true, alpha: false, powerPreference: 'high-performance'
      });
    } catch (e) {
      sahnaDiv.remove();
      var p = document.createElement('p');
      p.className = 'o3mr-xato-quti';
      p.textContent = 'Brauzeringiz 3D ni qo‘llab-quvvatlamaydi.';
      idish.appendChild(p);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.06;

    /* ---------- Sahna, kamera, yorug‘lik ---------- */
    var sahna = new THREE.Scene();
    sahna.background = new THREE.Color(0xF0E2C8);
    sahna.fog = new THREE.Fog(0xF0E2C8, 16, 34);

    var kamera = new THREE.PerspectiveCamera(44, 16 / 10, 0.1, 100);
    kamera.position.set(0, 5.5, 8.4);
    kamera.lookAt(0, 0.7, -0.4);

    sahna.add(new THREE.HemisphereLight(0xFFF6E4, 0xC0A078, 1.2));
    var quyosh = new THREE.DirectionalLight(0xFFF2D8, 2.1);
    quyosh.position.set(5.5, 9.5, 6.5);
    quyosh.castShadow = true;
    quyosh.shadow.mapSize.set(1024, 1024);
    quyosh.shadow.camera.near = 1;
    quyosh.shadow.camera.far = 30;
    quyosh.shadow.camera.left = -8;
    quyosh.shadow.camera.right = 8;
    quyosh.shadow.camera.top = 8;
    quyosh.shadow.camera.bottom = -6;
    quyosh.shadow.bias = -0.0012;
    quyosh.shadow.normalBias = 0.02;
    sahna.add(quyosh);
    sahna.add(quyosh.target);
    quyosh.target.position.set(0, 0.5, -1);
    var toldiruvchi = new THREE.DirectionalLight(0xC1502E, 0.3);
    toldiruvchi.position.set(-6, 3, -5);
    sahna.add(toldiruvchi);

    /* =========================================================
       4. DOIMIY SAHNA — gilam, suffa, dasturxon, javon
       ========================================================= */
    function mat(rang, gadir, metall) {
      return new THREE.MeshStandardMaterial({
        color: rang, roughness: gadir == null ? 0.85 : gadir,
        metalness: metall == null ? 0.03 : metall
      });
    }

    // Zamin.
    var zamin = new THREE.Mesh(new THREE.CircleGeometry(15, 44), mat(0xE0CDA8, 0.98));
    zamin.rotation.x = -Math.PI / 2;
    zamin.receiveShadow = true;
    sahna.add(zamin);

    // Milliy gilam — dasturxon ostida.
    var gilam = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 0.06, 48), mat(0x8C3A2B, 0.96));
    gilam.position.set(0, 0.03, -1.9);
    gilam.receiveShadow = true;
    sahna.add(gilam);
    [3.7, 3.1, 2.4].forEach(function (r, i) {
      var h = new THREE.Mesh(new THREE.TorusGeometry(r, 0.035, 8, 60),
        mat(i === 1 ? 0xD4A24C : 0x1B3B6F, 0.55, 0.25));
      h.rotation.x = -Math.PI / 2;
      h.position.set(0, 0.065 + i * 0.001, -1.9);
      sahna.add(h);
    });

    // Suffa — dasturxon qo‘yiladigan past taxta.
    var suffa = new THREE.Mesh(new THREE.CylinderGeometry(2.75, 2.9, 0.24, 40), mat(0x8A6A44, 0.8));
    suffa.position.set(0, 0.12, -1.9);
    suffa.castShadow = true;
    suffa.receiveShadow = true;
    sahna.add(suffa);

    // Yozilgan dasturxon — oq mato, chetlari to‘lqinli.
    var dasturxonGeo = new THREE.CircleGeometry(2.62, 56);
    var dpos = dasturxonGeo.attributes.position;
    for (var di = 0; di < dpos.count; di++) {
      var dx = dpos.getX(di), dy = dpos.getY(di);
      var dr = Math.sqrt(dx * dx + dy * dy);
      if (dr > 2.2) dpos.setZ(di, Math.sin(Math.atan2(dy, dx) * 9) * 0.045);
    }
    dpos.needsUpdate = true;
    dasturxonGeo.computeVertexNormals();
    var dasturxon = new THREE.Mesh(dasturxonGeo, mat(0xFBF7F0, 0.95));
    dasturxon.rotation.x = -Math.PI / 2;
    dasturxon.position.set(0, 0.245, -1.9);
    dasturxon.receiveShadow = true;
    sahna.add(dasturxon);
    // Dasturxon hoshiyasi.
    [2.5, 2.25].forEach(function (r, i) {
      var h = new THREE.Mesh(new THREE.TorusGeometry(r, 0.022, 6, 56),
        mat(i ? 0x1B3B6F : 0xC1502E, 0.9));
      h.rotation.x = -Math.PI / 2;
      h.position.set(0, 0.252 + i * 0.001, -1.9);
      sahna.add(h);
    });

    // Javon — tanlov buyumlari turadigan yog‘och taglik.
    var javon = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.22, 3.0), mat(0xB08E64, 0.85));
    javon.position.set(0, 0.11, 2.5);
    javon.castShadow = true;
    javon.receiveShadow = true;
    sahna.add(javon);
    var javonJiyak = new THREE.Mesh(new THREE.BoxGeometry(8.1, 0.05, 3.1), mat(0x8A6A44, 0.8));
    javonJiyak.position.set(0, 0.235, 2.5);
    javonJiyak.receiveShadow = true;
    sahna.add(javonJiyak);

    /* =========================================================
       5. MODELNI SLOTGA JOYLASH
       Har model o‘z shartnomasi bo‘yicha markazlangan bo‘lsa ham,
       aniqlik uchun qayta o‘lchab, kerakli kenglikka keltiramiz.
       ========================================================= */
    var qutiYordam = new THREE.Box3();
    var vektorYordam = new THREE.Vector3();

    function olchamla(g, kerak) {
      g.updateMatrixWorld(true);
      qutiYordam.setFromObject(g);
      qutiYordam.getSize(vektorYordam);
      var eng = Math.max(vektorYordam.x, vektorYordam.y, vektorYordam.z) || 1;
      g.scale.setScalar(kerak / eng);
    }
    function ergaQoy(g, x, y, z) {
      g.updateMatrixWorld(true);
      qutiYordam.setFromObject(g);
      qutiYordam.getCenter(vektorYordam);
      g.position.x += x - vektorYordam.x;
      g.position.z += z - vektorYordam.z;
      g.position.y += y - qutiYordam.min.y;
    }
    function tozala(obj) {
      obj.traverse(function (o) {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { m.dispose(); });
        }
      });
    }

    /* =========================================================
       6. ANIMATSIYA — bir vaqtda bir nechta harakat
       ========================================================= */
    var harakatlar = [];
    function harakat(dav, qadam, tugash) {
      var h = { t: 0, dav: kamHarakat ? Math.min(dav, 0.12) : dav, qadam: qadam, tugash: tugash };
      harakatlar.push(h);
      return h;
    }
    function yumshoq(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

    /* =========================================================
       7. O‘YIN HOLATI
       ========================================================= */
    var bosqich = 0;              // joriy marosim indeksi
    var KERAK = 4;                // har bosqichda topiladigan buyum soni
    var topildi = 0;
    var ball = 0, xatoSoni = 0;
    var tanlovlar = [];           // javondagi buyum guruhlari
    var qoyilgan = [];            // dasturxonga qo‘yilgan buyumlar
    var qulflangan = true;        // animatsiya paytida bosish o‘chadi
    var tugadi = false;

    var MAROSIM_NOMI = {};
    MAROSIMLAR.forEach(function (m) { MAROSIM_NOMI[m.kalit] = m.nom; });
    MAROSIM_NOMI.umumiy = 'umumiy dasturxon';

    function xabar(matn, tur) {
      xabarEl.textContent = matn;
      xabarEl.className = 'o3mr-xabar' + (tur ? ' ' + tur : '');
    }

    // Dasturxon atrofidagi joylar — buyumlar shu nuqtalarga qo‘yiladi.
    var SLOTLAR = [
      { x: -1.35, z: -2.75 }, { x: 0.00, z: -3.05 }, { x: 1.35, z: -2.75 },
      { x: -1.65, z: -1.45 }, { x: 0.00, z: -1.65 }, { x: 1.65, z: -1.45 },
      { x: -0.80, z: -0.55 }, { x: 0.80, z: -0.55 }
    ];

    // Javondagi joylar — ikki qator, to‘rttadan.
    var JAVON = [];
    for (var jr = 0; jr < 2; jr++) {
      for (var jc = 0; jc < 4; jc++) {
        JAVON.push({ x: -2.85 + jc * 1.90, z: 1.65 + jr * 1.55 });
      }
    }

    function aralashtir(royxat) {
      var a = royxat.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }

    /* =========================================================
       8. BOSQICHNI TAYYORLASH
       ========================================================= */
    function bosqichniQur() {
      var m = MAROSIMLAR[bosqich];

      // Eski tanlovlarni tozalaymiz.
      tanlovlar.forEach(function (t) { sahna.remove(t.guruh); tozala(t.guruh); });
      tanlovlar = [];
      qoyilgan.forEach(function (g) { sahna.remove(g); tozala(g); });
      qoyilgan = [];

      // To‘g‘ri javoblar — shu marosimning buyumlaridan tasodifiy KERAK ta.
      var togrilar = aralashtir(m.buyumlar).slice(0, KERAK);

      // Chalg‘ituvchilar — boshqa marosimlarning buyumlaridan.
      var boshqalar = [];
      MAROSIMLAR.forEach(function (x) {
        if (x.kalit === m.kalit) return;
        x.buyumlar.forEach(function (k) { boshqalar.push(k); });
      });
      var yolgonlar = aralashtir(boshqalar).slice(0, JAVON.length - KERAK);

      var hammasi = aralashtir(togrilar.concat(yolgonlar));

      hammasi.forEach(function (kalit, i) {
        var malumot = MAROSIM[kalit];
        if (!malumot) return;
        var g = malumot.yasa();
        olchamla(g, 1.05);
        ergaQoy(g, JAVON[i].x, 0.245, JAVON[i].z);
        g.userData.kalit = kalit;
        g.userData.togri = (togrilar.indexOf(kalit) !== -1);
        g.userData.joy = i;
        g.userData.asosY = g.position.y;
        g.userData.faol = true;
        sahna.add(g);
        tanlovlar.push({ kalit: kalit, guruh: g });
      });

      topildi = 0;
      nomEl.textContent = m.nom;
      qoldiEl.textContent = KERAK;
      xabar(m.izoh);
      qulflangan = false;
    }

    /* =========================================================
       9. TANLASH
       ========================================================= */
    function tanla(g) {
      if (qulflangan || tugadi || !g.userData.faol) return;
      var malumot = MAROSIM[g.userData.kalit];

      if (g.userData.togri) {
        g.userData.faol = false;
        ball++;
        topildi++;
        ballEl.textContent = ball;
        qoldiEl.textContent = Math.max(0, KERAK - topildi);
        xabar('To‘g‘ri! ' + malumot.nom + ' — ' + malumot.izoh, 'togri');

        // Dasturxondagi bo‘sh joyga yoy chizib uchadi.
        var slot = SLOTLAR[(topildi - 1) % SLOTLAR.length];
        uchir(g, slot.x, slot.z, function () {
          qoyilgan.push(g);
          if (topildi >= KERAK) keyingiBosqich();
        });
      } else {
        xatoSoni++;
        var qayerda = MAROSIM_NOMI[malumot.marosim] || 'boshqa marosim';
        xabar('Bu emas: ' + malumot.nom + ' — ' + qayerda + 'ga tegishli.', 'xato');
        silkit(g);
      }
    }

    // To‘g‘ri buyum javondan dasturxonga uchadi.
    function uchir(g, x, z, tugagach) {
      qulflangan = true;
      var b = { x: g.position.x, y: g.position.y, z: g.position.z };
      var s0 = g.scale.x;
      // Dasturxondagi o‘lchamni topamiz — u yerda biroz kichikroq turadi.
      var eskiScale = g.scale.x;
      olchamla(g, 0.86);
      var s1 = g.scale.x;
      g.scale.setScalar(eskiScale);
      var burilish = g.rotation.y;

      harakat(0.75, function (p) {
        var e = yumshoq(p);
        g.position.x = b.x + (x - b.x) * e;
        g.position.z = b.z + (z - b.z) * e;
        g.position.y = b.y + Math.sin(p * Math.PI) * 1.7 + (0.245 - b.y) * e;
        g.scale.setScalar(s0 + (s1 - s0) * e);
        g.rotation.y = burilish + e * Math.PI * 2;
      }, function () {
        g.position.set(x, 0, z);
        g.scale.setScalar(s1);
        g.rotation.y = burilish;
        ergaQoy(g, x, 0.255, z);
        qulflangan = false;
        if (tugagach) tugagach();
      });
    }

    // Xato buyum joyida silkinadi.
    function silkit(g) {
      var x0 = g.position.x, y0 = g.userData.asosY;
      harakat(0.45, function (p) {
        g.position.x = x0 + Math.sin(p * Math.PI * 7) * 0.16 * (1 - p);
        g.position.y = y0 + Math.abs(Math.sin(p * Math.PI * 3)) * 0.12 * (1 - p);
      }, function () {
        g.position.x = x0;
        g.position.y = y0;
      });
    }

    /* =========================================================
       10. BOSQICHLAR KETMA-KETLIGI
       ========================================================= */
    function keyingiBosqich() {
      qulflangan = true;
      bosqich++;
      if (bosqich >= MAROSIMLAR.length) {
        harakat(1.1, function () {}, yakunla);
        xabar('Dasturxon tayyor! Marosim to‘liq bezatildi.', 'togri');
        return;
      }
      xabar('Ushbu marosim tayyor. Keyingisiga o‘tamiz…', 'togri');
      harakat(1.3, function () {}, function () { bosqichniQur(); });
    }

    function yakunla() {
      tugadi = true;
      var jami = ball + xatoSoni;
      var foiz = jami ? Math.round((ball / jami) * 100) : 0;

      try {
        if (window.Xotira && window.Xotira.modulYoz) {
          window.Xotira.modulYoz(7, { oyin3d: foiz });
        }
      } catch (e) {}

      var baho;
      if (foiz >= 90) baho = 'A’lo! Marosim buyumlarini mukammal bilasiz.';
      else if (foiz >= 70) baho = 'Yaxshi natija. Ayrim udumlarni yana takrorlang.';
      else if (foiz >= 50) baho = 'O‘rtacha. Ma’ruza matnidagi marosimlar bo‘limini qayta o‘qing.';
      else baho = 'Marosimlar bo‘limini o‘qib chiqing va yana urinib ko‘ring.';

      var oyna = document.createElement('div');
      oyna.className = 'o3mr-natija';
      oyna.innerHTML =
        '<h4>Natija</h4>' +
        '<div class="o3mr-foiz">' + foiz + '%</div>' +
        '<p>To‘g‘ri tanlangan buyumlar: ' + ball + ' ta, xato: ' + xatoSoni + ' ta.<br>' + baho + '</p>' +
        '<button type="button" class="o3mr-qayta">Qaytadan o‘ynash</button>';
      sahnaDiv.querySelector('.o3mr-ust').appendChild(oyna);
      oyna.querySelector('.o3mr-qayta').addEventListener('click', function () {
        oyna.remove();
        bosqich = 0; ball = 0; xatoSoni = 0; tugadi = false;
        ballEl.textContent = '0';
        bosqichniQur();
      });
    }

    /* =========================================================
       11. BOSISH (raycasting)
       ========================================================= */
    var nur = new THREE.Raycaster();
    var nuqta = new THREE.Vector2();

    function bosildi(e) {
      if (qulflangan || tugadi) return;
      var r = canvas.getBoundingClientRect();
      nuqta.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      nuqta.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      nur.setFromCamera(nuqta, kamera);

      var nishonlar = tanlovlar
        .filter(function (t) { return t.guruh.userData.faol; })
        .map(function (t) { return t.guruh; });
      var kesishuv = nur.intersectObjects(nishonlar, true);
      if (!kesishuv.length) return;

      var o = kesishuv[0].object;
      while (o && nishonlar.indexOf(o) === -1) o = o.parent;
      if (o) tanla(o);
    }
    canvas.addEventListener('pointerdown', bosildi);

    /* =========================================================
       12. O‘LCHAM VA RENDER HALQASI
       ========================================================= */
    function olcham() {
      var w = idish.clientWidth || 640;
      var h = Math.max(260, Math.min(Math.round(w * 0.64), 520));
      renderer.setSize(w, h, false);
      kamera.aspect = w / h;
      // Tor ekranda kamerani biroz orqaga surib, sahna to‘liq ko‘rinsin.
      var tor = w < 560;
      sahnaDiv.classList.toggle('o3mr-tor', tor);
      kamera.fov = tor ? 52 : 44;
      kamera.position.set(0, tor ? 6.1 : 5.5, tor ? 9.2 : 8.4);
      kamera.lookAt(0, 0.7, -0.4);
      kamera.updateProjectionMatrix();
    }
    olcham();
    if (window.ResizeObserver) new ResizeObserver(olcham).observe(idish);
    else window.addEventListener('resize', olcham);

    var ishlayapti = false, oxirgi = 0;
    function halqa(vaqt) {
      if (!ishlayapti) return;
      var dt = Math.min((vaqt - oxirgi) / 1000, 0.05);
      oxirgi = vaqt;

      for (var i = harakatlar.length - 1; i >= 0; i--) {
        var h = harakatlar[i];
        h.t += dt;
        var p = Math.min(h.t / h.dav, 1);
        h.qadam(p);
        if (p >= 1) {
          harakatlar.splice(i, 1);
          if (h.tugash) h.tugash();
        }
      }

      // Javondagi tanlanmagan buyumlar sekin aylanadi — hajmi ko‘rinsin.
      if (!kamHarakat) {
        for (var k = 0; k < tanlovlar.length; k++) {
          var g = tanlovlar[k].guruh;
          if (g.userData.faol) g.rotation.y += dt * 0.42;
        }
      }

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

    bosqichniQur();
    yoq();

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (y) {
        y[0].isIntersecting ? yoq() : ochir();
      }, { threshold: 0.02 }).observe(idish);
    }

    window.addEventListener('pagehide', function () {
      ochir();
      try { renderer.dispose(); } catch (e) {}
    });
  }
})();
