/* =========================================================
   «MADRASANI BUNYOD ET» — HAQIQIY 3D O‘YIN
   9-modul: xalq pedagogikasida diniy ta’limotlar.

   MAVZUGA HURMAT BILAN
   O‘yinda muqaddas matn tasvirlanmaydi va o‘qilmaydi. Faqat
   me’morchilik unsurlari (poydevor, devor, peshtoq, gumbaz,
   minora) va ilm anjomlari (lavh, kitob, siyohdon, qamish
   qalam, xattotlik varag‘i, shamchiroq) bilan ishlanadi.
   Mazmun ta’limiy: ilm olish, adab va ustozga hurmat.

   O‘YIN QOIDASI
   O‘n bir bosqich. Har bosqichda oldingi qatorda uchta 3D
   buyum turadi va yuqorida vazifa yoziladi: masalan «Madrasa
   poydevorini tanlang» yoki «Kitob qo‘yg‘ich — lavhni tanlang».
   To‘g‘ri buyum bosilsa, u yoy chizib uchib o‘z o‘rniga
   o‘rnashadi va madrasa ko‘z oldingizda qad rostlaydi; xato
   bo‘lsa buyum silkinadi va nima uchun mos emasligi aytiladi.
   Avval bino quriladi, so‘ng hujra ilm anjomlari bilan
   jihozlanadi. Oxirida foiz hisoblanib xotiraga yoziladi.

   Bu fayl mustaqil: o‘z HTML karkasi va uslublarini o‘zi quradi.
   Three.js faqat assets/vendor/ dan olinadi.
   ========================================================= */
import * as THREE from '../vendor/three.module.min.js';
import { DINIY } from './model-diniy.js';

(function () {
  'use strict';

  var idish = document.getElementById('oyin3d-madrasa') ||
              document.getElementById('oyin3d');
  if (!idish) return;
  if (idish.dataset.oyin3dBand) return;
  idish.dataset.oyin3dBand = 'madrasa';

  /* =========================================================
     1. USLUBLAR (`o3md-` prefiks)
     ========================================================= */
  if (!document.getElementById('o3md-uslub')) {
    var uslub = document.createElement('style');
    uslub.id = 'o3md-uslub';
    uslub.textContent = [
      '.o3md-boshlash{display:flex;flex-direction:column;align-items:center;gap:14px;',
      '  padding:30px 22px;border-radius:18px;text-align:center;',
      '  background:linear-gradient(150deg,#14304A 0%,#1B3B6F 55%,#7A2436 100%);color:#FBF7F0;',
      '  box-shadow:0 2px 4px rgba(26,22,20,.08),0 12px 28px rgba(26,22,20,.16);}',
      '.o3md-boshlash h4{margin:0;font-size:1.16rem;line-height:1.3;}',
      '.o3md-boshlash p{margin:0;max-width:52ch;font-size:.93rem;line-height:1.55;opacity:.94;}',
      '.o3md-tugma{cursor:pointer;margin-top:4px;padding:13px 30px;border:0;border-radius:999px;',
      '  background:#2E9BB8;color:#06222B;font:inherit;font-size:1rem;font-weight:700;',
      '  box-shadow:0 6px 18px rgba(26,22,20,.32);transition:transform .15s ease,background .15s ease;}',
      '.o3md-tugma:hover{transform:translateY(-2px);background:#43B4CF;}',
      '.o3md-tugma:active{transform:translateY(1px);}',
      '.o3md-tugma:focus-visible{outline:3px solid #FBF7F0;outline-offset:3px;}',
      '.o3md-sahna{position:relative;width:100%;border-radius:18px;overflow:hidden;background:#E8DCC2;',
      '  box-shadow:0 2px 4px rgba(26,22,20,.08),0 12px 28px rgba(26,22,20,.14);}',
      '.o3md-sahna canvas{display:block;width:100%;height:auto;touch-action:manipulation;cursor:pointer;}',
      '.o3md-ust{position:absolute;inset:0;pointer-events:none;font:inherit;}',
      '.o3md-qator{position:absolute;top:11px;left:11px;right:11px;display:flex;',
      '  align-items:flex-start;justify-content:space-between;gap:8px;flex-wrap:wrap;}',
      '.o3md-tabl{flex:0 0 auto;display:inline-flex;gap:6px;align-items:baseline;',
      '  padding:7px 14px;border-radius:999px;background:rgba(251,247,240,.93);color:#1B3B6F;',
      '  font-size:.82rem;font-weight:600;white-space:nowrap;box-shadow:0 2px 8px rgba(26,22,20,.18);}',
      '.o3md-tabl b{font-size:1rem;color:#C1502E;}',
      '.o3md-nom{flex:1 1 auto;order:0;min-width:0;padding:8px 18px;border-radius:999px;',
      '  background:rgba(20,48,74,.94);color:#FBF7F0;font-size:.98rem;font-weight:700;',
      '  line-height:1.3;text-align:center;box-shadow:0 4px 14px rgba(26,22,20,.28);}',
      '.o3md-past{position:absolute;left:12px;right:12px;bottom:12px;text-align:center;}',
      '.o3md-xabar{display:inline-block;margin:0;max-width:100%;padding:8px 17px;border-radius:999px;',
      '  background:rgba(20,30,26,.68);color:#FBF7F0;font-size:.86rem;font-weight:600;line-height:1.4;}',
      '.o3md-xabar:empty{display:none;}',
      '.o3md-xabar.togri{background:rgba(28,110,133,.92);color:#DDF3F8;}',
      '.o3md-xabar.xato{background:rgba(150,52,26,.9);color:#FFE2D6;}',
      '.o3md-natija{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;',
      '  justify-content:center;gap:10px;text-align:center;padding:20px;',
      '  background:rgba(20,48,74,.93);color:#FBF7F0;}',
      '.o3md-natija h4{margin:0;font-size:1.22rem;}',
      '.o3md-foiz{font-size:2.5rem;font-weight:800;color:#2E9BB8;line-height:1;}',
      '.o3md-natija p{margin:0;font-size:.92rem;max-width:38ch;line-height:1.5;}',
      '.o3md-qayta{pointer-events:auto;cursor:pointer;margin-top:6px;padding:11px 24px;border:0;',
      '  border-radius:999px;background:#2E9BB8;color:#06222B;font:inherit;font-size:.96rem;',
      '  font-weight:700;box-shadow:0 4px 12px rgba(26,22,20,.3);transition:transform .15s ease;}',
      '.o3md-qayta:hover{transform:translateY(-2px);}',
      '.o3md-xato-quti{margin:0;padding:22px;border-radius:16px;background:#FBF7F0;color:#1B3B6F;',
      '  text-align:center;font-weight:600;line-height:1.5;}',
      '.o3md-tor .o3md-qator{top:7px;left:7px;right:7px;gap:5px;}',
      '.o3md-tor .o3md-tabl{padding:4px 9px;font-size:.68rem;gap:4px;}',
      '.o3md-tor .o3md-tabl b{font-size:.8rem;}',
      '.o3md-tor .o3md-nom{padding:5px 11px;font-size:.78rem;}',
      '.o3md-tor .o3md-past{left:7px;right:7px;bottom:8px;}',
      '.o3md-tor .o3md-xabar{padding:5px 11px;font-size:.71rem;}',
      '.o3md-tor .o3md-foiz{font-size:1.9rem;}',
      '.o3md-tor .o3md-natija h4{font-size:1.02rem;}',
      '.o3md-tor .o3md-natija p{font-size:.78rem;}',
      '@media (prefers-reduced-motion: reduce){.o3md-tugma,.o3md-qayta{transition:none;}}'
    ].join('\n');
    document.head.appendChild(uslub);
  }

  /* =========================================================
     2. WEBGL VA BOSHLASH PANELI
     ========================================================= */
  function webglBor() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }
  if (!webglBor()) {
    var xatoP = document.createElement('p');
    xatoP.className = 'o3md-xato-quti';
    xatoP.textContent = 'Brauzeringiz 3D grafikani qo‘llab-quvvatlamaydi. ' +
      'Mavzuni quyidagi interaktiv o‘yin va test topshiriqlari orqali o‘zlashtiring.';
    idish.appendChild(xatoP);
    return;
  }

  var panel = document.createElement('div');
  panel.className = 'o3md-boshlash';
  panel.innerHTML =
    '<h4>Madrasani bunyod et va hujrani jihozla</h4>' +
    '<p>Avval poydevordan minoragacha — madrasa qad rostlaydi. So‘ng hujra ' +
    'ilm anjomlari bilan jihozlanadi: lavh, kitob, siyohdon, qamish qalam, ' +
    'xattotlik varag‘i va shamchiroq. Har bosqichda uch buyumdan to‘g‘risini toping.</p>' +
    '<button type="button" class="o3md-tugma">▶ O‘yinni boshlash</button>';
  idish.appendChild(panel);

  var boshlaTugma = panel.querySelector('.o3md-tugma');
  boshlaTugma.addEventListener('click', function () {
    boshlaTugma.disabled = true;
    boshlaTugma.textContent = 'Sahna tayyorlanmoqda…';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        try {
          panel.remove();
          oyinniQur();
        } catch (e) {
          var p = document.createElement('p');
          p.className = 'o3md-xato-quti';
          p.textContent = '3D sahnani ochib bo‘lmadi. Sahifani yangilab ko‘ring.';
          idish.appendChild(p);
          if (window.console) console.error(e);
        }
      });
    });
  });

  /* =========================================================
     3. BOSQICHLAR — vazifa, to‘g‘ri javob, chalg‘ituvchilar,
        sahnadagi o‘rin va o‘lcham.
        `nusxa` — bir bosqichda bir nechta nusxa qo‘yiladi
        (minoralar madrasa ikki chetiga o‘rnatiladi).
        `yassi` — buyum polga yotqiziladi.
     ========================================================= */
  var BOSQICHLAR = [
    {
      vazifa: '1-bosqich: madrasa POYDEVORINI tanlang',
      togri: 'poydevor', yolgon: ['lavh', 'qandil'],
      joy: [{ x: 0, y: 0, z: -3.6 }], olcham: 5.0, kSc: { x: 1, y: 0.9, z: 1 },
      dars: 'Har bir bino ham, har bir ilm ham mustahkam poydevordan boshlanadi.'
    },
    {
      vazifa: '2-bosqich: hovlini o‘rab turuvchi G‘ISHT DEVORNI tanlang',
      togri: 'devor', yolgon: ['joynamoz', 'tasbeh'],
      joy: [{ x: 0, y: null, z: -4.55 }], olcham: 4.9, kSc: { x: 1, y: 1.35, z: 1.5 },
      ustidan: true,
      dars: 'Devor — hovlini ajratadi; madrasada tartib va tinchlik shu bilan saqlangan.'
    },
    {
      vazifa: '3-bosqich: bosh darvoza — PESHTOQNI tanlang',
      togri: 'peshtoq', yolgon: ['qalamdon', 'salla'],
      joy: [{ x: 0, y: null, z: -3.35 }], olcham: 3.3, kSc: { x: 1, y: 1.15, z: 1.4 },
      ustidan: true,
      dars: 'Peshtoq ostidan o‘tgan kishi tolibi ilm — bilim izlovchi hisoblangan.'
    },
    {
      vazifa: '4-bosqich: darsxona ustidagi GUMBAZNI tanlang',
      togri: 'gumbaz', yolgon: ['siyohdon', 'oltiKitob'],
      joy: [{ x: 0, y: null, z: -4.55 }], olcham: 2.6, kSc: { x: 1, y: 1, z: 1 },
      ustiga: 'devor',
      dars: 'Feruza gumbaz — geometriya, hisob va me’morchilik ilmining birgalikdagi natijasi.'
    },
    {
      vazifa: '5-bosqich: ikki chekkaga MINORA o‘rnating',
      togri: 'minora', yolgon: ['shamchiroq', 'qamishQalam'],
      joy: [{ x: -2.55, y: null, z: -4.3 }, { x: 2.55, y: null, z: -4.3 }],
      olcham: 3.6, kSc: { x: 1, y: 1, z: 1 }, ustidan: true,
      dars: 'Minora shahar uzra yo‘l ko‘rsatgan; ilm ham hayotda shunday mo‘ljal beradi.'
    },
    {
      vazifa: '6-bosqich: hovli poliga KOSHIN panelini yotqizing',
      togri: 'koshin', yolgon: ['qumgon', 'ganch'],
      joy: [{ x: 0, y: null, z: -1.95 }], olcham: 2.2, kSc: { x: 1, y: 1, z: 1 },
      ustidan: true,
      dars: 'Girih naqshi sirkul va chizg‘ich bilan chizilgan — san’at va aniq fan uyg‘unligi.'
    },
    {
      vazifa: '7-bosqich: kitob qo‘yg‘ich — LAVHNI hujraga qo‘ying',
      togri: 'lavh', yolgon: ['koshin', 'minora'],
      joy: [{ x: -1.55, y: 0.30, z: 0.55 }], olcham: 1.15,
      dars: 'Kitobni yerga qo‘ymay, lavhga qo‘yish — adab talabi.'
    },
    {
      vazifa: '8-bosqich: hadis to‘plamlari — OLTI KITOBNI qo‘ying',
      togri: 'oltiKitob', yolgon: ['joynamoz', 'devor'],
      joy: [{ x: -0.42, y: 0.30, z: 1.20 }], olcham: 0.85,
      dars: '«Al-kutub as-sitta»: al-Buxoriy, Muslim, at-Termiziy, Abu Dovud, an-Nasoiy, Ibn Mojja.'
    },
    {
      vazifa: '9-bosqich: xattot anjomi — SIYOHDONNI qo‘ying',
      togri: 'siyohdon', yolgon: ['tasbeh', 'gumbaz'],
      joy: [{ x: 0.42, y: 0.30, z: 0.42 }], olcham: 0.55,
      dars: '«Qalam vositasi bilan ta’lim berdi» — siyoh va qalam ilmning quroli.'
    },
    {
      vazifa: '10-bosqich: yozuv quroli — QAMISH QALAMNI qo‘ying',
      togri: 'qamishQalam', yolgon: ['qalamdon', 'salla'],
      joy: [{ x: 1.05, y: 0.30, z: 0.45 }], olcham: 0.80,
      dars: 'Uchi qiya kesilgan qamish qalam bilan xattotlar yillab mashq qilgan.'
    },
    {
      vazifa: '11-bosqich: mashq varag‘i — XATTOTLIK VARAG‘INI qo‘ying',
      togri: 'xattotVaraq', yolgon: ['qandil', 'poydevor'],
      joy: [{ x: 0.95, y: 0.30, z: 1.30 }], olcham: 1.00,
      dars: 'Xattotlik sabr maktabi: bir chiziq minglab marta takrorlanib mukammallashgan.'
    },
    {
      vazifa: '12-bosqich: hujrani yoritish — SHAMCHIROQNI qo‘ying',
      togri: 'shamchiroq', yolgon: ['qumgon', 'peshtoq'],
      joy: [{ x: 2.05, y: 0.30, z: 0.85 }], olcham: 1.05,
      dars: 'Hadisda olim «yorug‘lik berib, o‘zini kuydiradigan shamchiroq»ga o‘xshatiladi.'
    }
  ];

  /* =========================================================
     4. O‘YINNI QURISH
     ========================================================= */
  function oyinniQur() {

    var kamHarakat = !!(window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    var sahnaDiv = document.createElement('div');
    sahnaDiv.className = 'o3md-sahna';
    sahnaDiv.innerHTML =
      '<canvas></canvas>' +
      '<div class="o3md-ust">' +
        '<div class="o3md-qator">' +
          '<span class="o3md-tabl">Ball <b class="o3md-ball">0</b></span>' +
          '<span class="o3md-nom">Tayyorlanmoqda…</span>' +
          '<span class="o3md-tabl">Bosqich <b class="o3md-bosqich">1</b>/' + BOSQICHLAR.length + '</span>' +
        '</div>' +
        '<div class="o3md-past">' +
          '<p class="o3md-xabar" role="status">Uch buyumdan to‘g‘risini bosing</p>' +
        '</div>' +
      '</div>';
    idish.appendChild(sahnaDiv);

    var canvas    = sahnaDiv.querySelector('canvas');
    var ballEl    = sahnaDiv.querySelector('.o3md-ball');
    var bosqichEl = sahnaDiv.querySelector('.o3md-bosqich');
    var nomEl     = sahnaDiv.querySelector('.o3md-nom');
    var xabarEl   = sahnaDiv.querySelector('.o3md-xabar');

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas, antialias: true, alpha: false, powerPreference: 'high-performance'
      });
    } catch (e) {
      sahnaDiv.remove();
      var p = document.createElement('p');
      p.className = 'o3md-xato-quti';
      p.textContent = 'Brauzeringiz 3D ni qo‘llab-quvvatlamaydi.';
      idish.appendChild(p);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.05;

    var sahna = new THREE.Scene();
    sahna.background = new THREE.Color(0xE8DCC2);
    sahna.fog = new THREE.Fog(0xE8DCC2, 18, 40);

    var kamera = new THREE.PerspectiveCamera(46, 16 / 10, 0.1, 120);

    sahna.add(new THREE.HemisphereLight(0xEAF3FF, 0xC0A078, 1.15));
    var quyosh = new THREE.DirectionalLight(0xFFF3DC, 2.25);
    quyosh.position.set(6, 11, 7.5);
    quyosh.castShadow = true;
    quyosh.shadow.mapSize.set(1536, 1536);
    quyosh.shadow.camera.near = 1;
    quyosh.shadow.camera.far = 36;
    quyosh.shadow.camera.left = -9;
    quyosh.shadow.camera.right = 9;
    quyosh.shadow.camera.top = 10;
    quyosh.shadow.camera.bottom = -7;
    quyosh.shadow.bias = -0.0012;
    quyosh.shadow.normalBias = 0.025;
    sahna.add(quyosh);
    sahna.add(quyosh.target);
    quyosh.target.position.set(0, 1, -2);
    var yon = new THREE.DirectionalLight(0x8FB4D8, 0.34);
    yon.position.set(-7, 4, -6);
    sahna.add(yon);

    function mat(rang, gadir, metall) {
      return new THREE.MeshStandardMaterial({
        color: rang, roughness: gadir == null ? 0.88 : gadir,
        metalness: metall == null ? 0.03 : metall
      });
    }

    /* ---------- Hovli zamini ---------- */
    var zamin = new THREE.Mesh(new THREE.CircleGeometry(16, 48), mat(0xDCCBA6, 0.98));
    zamin.rotation.x = -Math.PI / 2;
    zamin.receiveShadow = true;
    sahna.add(zamin);

    // Hovli tosh yo‘lkasi.
    var yolka = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.06, 6.0), mat(0xCDBB94, 0.95));
    yolka.position.set(0, 0.03, -1.4);
    yolka.receiveShadow = true;
    sahna.add(yolka);
    for (var yi = 0; yi < 7; yi++) {
      var chiz = new THREE.Mesh(new THREE.BoxGeometry(7.3, 0.02, 0.035), mat(0xB9A582, 0.95));
      chiz.position.set(0, 0.062, -4.2 + yi * 0.92);
      chiz.receiveShadow = true;
      sahna.add(chiz);
    }

    /* ---------- Hujra suffasi — ilm anjomlari shu yerga qo‘yiladi ---------- */
    var suffa = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.30, 2.5), mat(0x8A6A44, 0.82));
    suffa.position.set(0, 0.15, 0.85);
    suffa.castShadow = true;
    suffa.receiveShadow = true;
    sahna.add(suffa);
    var suffaJiyak = new THREE.Mesh(new THREE.BoxGeometry(5.7, 0.05, 2.6), mat(0x6E5334, 0.8));
    suffaJiyak.position.set(0, 0.32, 0.85);
    suffaJiyak.receiveShadow = true;
    sahna.add(suffaJiyak);
    // Suffa oldidagi ustunchalar.
    [-2.4, -0.8, 0.8, 2.4].forEach(function (x) {
      var u = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.13, 0.30, 10), mat(0x6E5334, 0.85));
      u.position.set(x, 0.15, 2.16);
      u.castShadow = true;
      sahna.add(u);
    });

    /* ---------- Tanlov taglikilari ---------- */
    var TANLOV_Z = 3.55;
    var TANLOV_X = [-2.5, 0, 2.5];
    TANLOV_X.forEach(function (x) {
      var tag = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.1, 0.16, 28), mat(0xB08E64, 0.85));
      tag.position.set(x, 0.08, TANLOV_Z);
      tag.castShadow = true;
      tag.receiveShadow = true;
      sahna.add(tag);
      var h = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.026, 6, 34), mat(0xD4A24C, 0.5, 0.3));
      h.rotation.x = -Math.PI / 2;
      h.position.set(x, 0.163, TANLOV_Z);
      sahna.add(h);
    });

    /* =========================================================
       5. YORDAMCHILAR
       ========================================================= */
    var quti = new THREE.Box3();
    var vek = new THREE.Vector3();

    function olchamla(g, kerak) {
      g.updateMatrixWorld(true);
      quti.setFromObject(g);
      quti.getSize(vek);
      var eng = Math.max(vek.x, vek.y, vek.z) || 1;
      g.scale.setScalar(kerak / eng);
      return kerak / eng;
    }
    function ergaQoy(g, x, y, z) {
      g.updateMatrixWorld(true);
      quti.setFromObject(g);
      quti.getCenter(vek);
      g.position.x += x - vek.x;
      g.position.z += z - vek.z;
      g.position.y += y - quti.min.y;
    }
    function tozala(obj) {
      obj.traverse(function (o) {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { m.dispose(); });
        }
      });
    }

    var harakatlar = [];
    function harakat(dav, qadam, tugash) {
      harakatlar.push({ t: 0, dav: kamHarakat ? Math.min(dav, 0.12) : dav, qadam: qadam, tugash: tugash });
    }
    function yumshoq(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

    /* =========================================================
       6. HOLAT
       ========================================================= */
    var bosqich = 0, ball = 0, xatoSoni = 0;
    var tanlovlar = [];      // hozirgi uch variant
    var qurilgan = [];       // sahnaga o‘rnatilgan qismlar
    var balandlik = {};      // qism kaliti -> ustki y qiymati
    var qulflangan = true, tugadi = false;

    function xabar(matn, tur) {
      xabarEl.textContent = matn;
      xabarEl.className = 'o3md-xabar' + (tur ? ' ' + tur : '');
    }
    function aralashtir(a) {
      a = a.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }

    /* Qurilish qismining o‘rnatiladigan balandligi:
       `ustiga` berilgan bo‘lsa — o‘sha qismning tepasi,
       `ustidan` bo‘lsa — poydevor tepasi, aks holda yer. */
    function boshlangichY(b) {
      if (b.ustiga && balandlik[b.ustiga] != null) return balandlik[b.ustiga];
      if (b.ustidan && balandlik.poydevor != null) return balandlik.poydevor;
      return 0;
    }

    /* =========================================================
       7. BOSQICHNI QURISH
       ========================================================= */
    function bosqichniQur() {
      tanlovlar.forEach(function (t) { sahna.remove(t.guruh); tozala(t.guruh); });
      tanlovlar = [];

      var b = BOSQICHLAR[bosqich];
      var kalitlar = aralashtir([b.togri].concat(b.yolgon));

      kalitlar.forEach(function (kalit, i) {
        var malumot = DINIY[kalit];
        if (!malumot) return;
        var g = malumot.yasa();
        olchamla(g, 1.30);
        ergaQoy(g, TANLOV_X[i], 0.165, TANLOV_Z);
        g.userData.kalit = kalit;
        g.userData.togri = (kalit === b.togri);
        g.userData.asos = { x: g.position.x, y: g.position.y };
        g.userData.faol = true;
        sahna.add(g);
        tanlovlar.push({ kalit: kalit, guruh: g });
      });

      nomEl.textContent = b.vazifa;
      bosqichEl.textContent = (bosqich + 1);
      xabar('Uch buyumdan to‘g‘risini bosing');
      qulflangan = false;
    }

    /* =========================================================
       8. TANLASH VA O‘RNATISH
       ========================================================= */
    function tanla(g) {
      if (qulflangan || tugadi || !g.userData.faol) return;
      var b = BOSQICHLAR[bosqich];
      var malumot = DINIY[g.userData.kalit];

      if (!g.userData.togri) {
        xatoSoni++;
        xabar('Bu — ' + malumot.nom + '. ' + malumot.izoh, 'xato');
        silkit(g);
        return;
      }

      ball++;
      ballEl.textContent = ball;
      g.userData.faol = false;
      qulflangan = true;
      xabar(malumot.nom + ' o‘rnatildi. ' + b.dars, 'togri');

      // Qolgan ikki variant asta so‘nadi.
      tanlovlar.forEach(function (t) {
        if (t.guruh === g) return;
        t.guruh.userData.faol = false;
        pastgaTushir(t.guruh);
      });

      var y0 = boshlangichY(b);

      // Birinchi nusxa — tanlangan buyumning o‘zi uchib boradi.
      var birinchi = b.joy[0];
      ornat(g, b, birinchi, y0, true, function () {
        // Qolgan nusxalar (masalan ikkinchi minora) darhol qo‘yiladi.
        for (var n = 1; n < b.joy.length; n++) {
          var nusxa = malumot.yasa();
          qoyish(nusxa, b, b.joy[n], y0);
          sahna.add(nusxa);
          qurilgan.push(nusxa);
        }
        // Shu qismning tepasini eslab qolamiz — keyingi qismlar shunga qo‘nadi.
        g.updateMatrixWorld(true);
        quti.setFromObject(g);
        balandlik[b.togri] = quti.max.y;

        qulflangan = false;
        keyingiBosqich();
      });
      qurilgan.push(g);
    }

    // Buyumni bosqich talabiga ko‘ra o‘lchab, o‘z o‘rniga qo‘yish.
    function qoyish(g, b, joy, y0) {
      olchamla(g, b.olcham);
      if (b.kSc) g.scale.set(g.scale.x * b.kSc.x, g.scale.y * b.kSc.y, g.scale.z * b.kSc.z);
      ergaQoy(g, joy.x, joy.y == null ? y0 : joy.y, joy.z);
    }

    // Tanlangan buyum yoy chizib o‘z o‘rniga uchadi.
    function ornat(g, b, joy, y0, jonli, tugagach) {
      var b0 = { x: g.position.x, y: g.position.y, z: g.position.z };
      var s0 = { x: g.scale.x, y: g.scale.y, z: g.scale.z };

      // Yakuniy holatni oldindan hisoblab, keyin boshlang‘ichga qaytaramiz.
      qoyish(g, b, joy, y0);
      var b1 = { x: g.position.x, y: g.position.y, z: g.position.z };
      var s1 = { x: g.scale.x, y: g.scale.y, z: g.scale.z };
      g.position.set(b0.x, b0.y, b0.z);
      g.scale.set(s0.x, s0.y, s0.z);

      var r0 = g.rotation.y;
      harakat(jonli ? 0.85 : 0.01, function (p) {
        var e = yumshoq(p);
        g.position.x = b0.x + (b1.x - b0.x) * e;
        g.position.z = b0.z + (b1.z - b0.z) * e;
        g.position.y = b0.y + (b1.y - b0.y) * e + Math.sin(p * Math.PI) * 2.1;
        g.scale.set(
          s0.x + (s1.x - s0.x) * e,
          s0.y + (s1.y - s0.y) * e,
          s0.z + (s1.z - s0.z) * e
        );
        g.rotation.y = r0 + e * (Math.PI * 2 - r0);
      }, function () {
        g.position.set(b1.x, b1.y, b1.z);
        g.scale.set(s1.x, s1.y, s1.z);
        g.rotation.y = 0;
        if (tugagach) tugagach();
      });
    }

    function silkit(g) {
      var a = g.userData.asos;
      harakat(0.45, function (p) {
        g.position.x = a.x + Math.sin(p * Math.PI * 7) * 0.18 * (1 - p);
        g.position.y = a.y + Math.abs(Math.sin(p * Math.PI * 3)) * 0.14 * (1 - p);
      }, function () {
        g.position.x = a.x;
        g.position.y = a.y;
      });
    }

    // Tanlanmagan variantlar taglik ostiga tushib yo‘qoladi.
    function pastgaTushir(g) {
      var y0 = g.position.y;
      harakat(0.55, function (p) {
        g.position.y = y0 - p * 1.4;
        g.scale.multiplyScalar(1 - p * 0.06);
      }, function () {
        sahna.remove(g);
        tozala(g);
      });
    }

    /* =========================================================
       9. BOSQICHLAR KETMA-KETLIGI
       ========================================================= */
    function keyingiBosqich() {
      bosqich++;
      if (bosqich >= BOSQICHLAR.length) {
        qulflangan = true;
        harakat(1.4, function () {}, yakunla);
        xabar('Madrasa bunyod bo‘ldi va hujra jihozlandi!', 'togri');
        return;
      }
      qulflangan = true;
      harakat(1.5, function () {}, function () { bosqichniQur(); });
    }

    function yakunla() {
      tugadi = true;
      var jami = ball + xatoSoni;
      var foiz = jami ? Math.round((ball / jami) * 100) : 0;
      try {
        if (window.Xotira && window.Xotira.modulYoz) {
          window.Xotira.modulYoz(9, { oyin3d: foiz });
        }
      } catch (e) {}

      var baho;
      if (foiz >= 90) baho = 'A’lo! Madrasa me’morchiligi va ilm anjomlarini yaxshi bilasiz.';
      else if (foiz >= 70) baho = 'Yaxshi. Ayrim anjomlarning nomini takrorlab qo‘ying.';
      else if (foiz >= 50) baho = 'O‘rtacha. Ma’ruza matnidagi madrasa va ilm bo‘limini qayta o‘qing.';
      else baho = 'Mavzuni o‘qib chiqing va yana urinib ko‘ring — har urinish bilim qo‘shadi.';

      var oyna = document.createElement('div');
      oyna.className = 'o3md-natija';
      oyna.innerHTML =
        '<h4>Natija</h4>' +
        '<div class="o3md-foiz">' + foiz + '%</div>' +
        '<p>To‘g‘ri tanlov: ' + ball + ' ta, xato: ' + xatoSoni + ' ta.<br>' + baho +
        '<br><b>Adab saboqi:</b> ilm olish — sabr, ustozga hurmat va kamtarlik bilan bo‘ladi.</p>' +
        '<button type="button" class="o3md-qayta">Qaytadan o‘ynash</button>';
      sahnaDiv.querySelector('.o3md-ust').appendChild(oyna);
      oyna.querySelector('.o3md-qayta').addEventListener('click', function () {
        oyna.remove();
        qurilgan.forEach(function (g) { sahna.remove(g); tozala(g); });
        qurilgan = [];
        balandlik = {};
        bosqich = 0; ball = 0; xatoSoni = 0; tugadi = false;
        ballEl.textContent = '0';
        bosqichniQur();
      });
    }

    /* =========================================================
       10. BOSISH
       ========================================================= */
    var nur = new THREE.Raycaster();
    var nuqta = new THREE.Vector2();
    canvas.addEventListener('pointerdown', function (e) {
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
    });

    /* =========================================================
       11. O‘LCHAM VA RENDER
       ========================================================= */
    function olcham() {
      var w = idish.clientWidth || 640;
      var h = Math.max(280, Math.min(Math.round(w * 0.66), 560));
      renderer.setSize(w, h, false);
      var tor = w < 560;
      sahnaDiv.classList.toggle('o3md-tor', tor);
      kamera.aspect = w / h;
      kamera.fov = tor ? 54 : 46;
      kamera.position.set(0, tor ? 6.4 : 5.8, tor ? 10.4 : 9.6);
      kamera.lookAt(0, 1.35, -1.0);
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
        var hh = harakatlar[i];
        hh.t += dt;
        var p = Math.min(hh.t / hh.dav, 1);
        hh.qadam(p);
        if (p >= 1) {
          harakatlar.splice(i, 1);
          if (hh.tugash) hh.tugash();
        }
      }
      if (!kamHarakat) {
        for (var k = 0; k < tanlovlar.length; k++) {
          var g = tanlovlar[k].guruh;
          if (g.userData.faol) g.rotation.y += dt * 0.40;
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
