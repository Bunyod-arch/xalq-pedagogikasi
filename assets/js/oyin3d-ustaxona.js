/* =========================================================
   «USTAXONA» — HAQIQIY 3D O‘YIN (Three.js)
   10-modul: «Xalq pedagogikasida xalq amaliy san’ati va
   madaniyatining o‘rni».

   Hovli shaklidagi ustaxonada yetti usta o‘z joyida ishlaydi:
   kulol charxi, zargar stoli, kashta doirasi, misgar sandoni,
   ganchkor stoli, naqqosh stoli va gilamdo‘z dastgohi.

   1-bosqich — TAQSIMLASH. O‘rtadagi kundaga navbat bilan
   hunarmandchilik buyumi qo‘yiladi (sopol xurmacha, so‘zana,
   mis qumg‘on, kumush bilaguzuk, ganch panjara, naqshin ustun,
   xurjun…). O‘quvchi buyumni qaysi usta yasaganini topadi:
   sahnadagi usta joyini bosadi yoki pastdagi tugmani tanlaydi.
   To‘g‘ri javobda buyum yoy chizib o‘sha ustaning stoliga qo‘nadi.

   2-bosqich — KULOLCHILIK CHARXI. Kamera charxga yaqinlashadi,
   charx aylanadi, loy ustidagi olti halqani sudrab ko‘zaga shakl
   beriladi. Namuna siluetiga qanchalik yaqin chiqsa — shuncha ball.

   Three.js faqat assets/vendor/ dan yuklanadi. WebGL bo‘lmasa
   sahifadagi oddiy o‘yin zaxira sifatida ochiq qoladi.
   ========================================================= */
import * as THREE from '../vendor/three.module.min.js';

(async function () {
  'use strict';

  var idish = document.getElementById('oyin3d-ustaxona');
  if (!idish) return;

  /* =========================================================
     0. WebGL bormi?
     ========================================================= */
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
    import('./model-hunar.js'),
    import('./model-ustaxona.js')
  ]);
  var HUNARLAR = (yuklandi[0].status === 'fulfilled' && yuklandi[0].value.HUNARLAR) || {};
  var qoshimcha = (yuklandi[1].status === 'fulfilled' && yuklandi[1].value.USTAXONA_BUYUMLARI) || {};
  var USTALAR   = (yuklandi[1].status === 'fulfilled' && yuklandi[1].value.USTALAR) || {};

  if (!Object.keys(USTALAR).length) {
    idish.innerHTML = '<p class="uch-xato">3D ustaxona modellari yuklanmadi. ' +
      'Quyidagi oddiy o‘yin variantida ishlashingiz mumkin.</p>';
    return;
  }

  // Barcha buyumlar bitta jadvalda
  var BUYUMLAR = {};
  Object.keys(HUNARLAR).forEach(function (k) { BUYUMLAR[k] = HUNARLAR[k]; });
  Object.keys(qoshimcha).forEach(function (k) { BUYUMLAR[k] = qoshimcha[k]; });

  /* Buyum -> usta bog‘lanishi. Darslikda nomlangan yetti hunar. */
  var BOGLANISH = {
    xurmacha:   'kulol',
    sopolLagan: 'kulol',
    suzani:     'kashtachi',
    peshgir:    'kashtachi',
    qumgon:     'misgar',
    misLagan:   'misgar',
    taqinchoq:  'zargar',
    bilaguzuk:  'zargar',
    uzuk:       'zargar',
    ganch:      'ganchkor',
    panjara:    'ganchkor',
    ustun:      'naqqosh',
    gilam:      'gilamdoz',
    xurjun:     'gilamdoz'
  };

  var USTA_KALITLARI = ['kulol', 'zargar', 'kashtachi', 'misgar', 'ganchkor', 'naqqosh', 'gilamdoz']
    .filter(function (k) { return !!USTALAR[k]; });

  // Faqat modeli ham, ustasi ham bor buyumlar o‘yinga kiradi
  var BUYUM_KALITLARI = Object.keys(BOGLANISH).filter(function (k) {
    return BUYUMLAR[k] && typeof BUYUMLAR[k].yasa === 'function' &&
           USTA_KALITLARI.indexOf(BOGLANISH[k]) !== -1;
  });

  if (BUYUM_KALITLARI.length < 4) {
    idish.innerHTML = '<p class="uch-xato">3D buyum modellari yuklanmadi.</p>';
    return;
  }

  /* =========================================================
     2. O‘z uslubi (umumiy style.css ga tegilmaydi)
     ========================================================= */
  if (!document.getElementById('u3-uslub')) {
    var st = document.createElement('style');
    st.id = 'u3-uslub';
    st.textContent =
      '.u3-ustalar{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:14px 0 0}' +
      '.u3-usta{display:inline-flex;align-items:center;gap:7px;cursor:pointer;' +
        'font-family:inherit;font-size:13.5px;font-weight:600;color:#2A2A33;' +
        'background:#FFFDF8;border:1.5px solid rgba(0,0,0,.14);border-radius:999px;' +
        'padding:8px 15px;transition:transform .12s,box-shadow .12s,border-color .12s}' +
      '.u3-usta:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,.12)}' +
      '.u3-usta:disabled{opacity:.45;cursor:default}' +
      '.u3-usta b{width:12px;height:12px;border-radius:50%;display:inline-block;' +
        'box-shadow:inset 0 0 0 1px rgba(0,0,0,.18)}' +
      '.u3-usta.u3-togri{border-color:#2F6B45;background:#EAF5EE}' +
      '.u3-usta.u3-xato{border-color:#A3232C;background:#FBEDED}' +
      '.u3-izoh{margin:14px 0 0;padding:14px 16px;border-radius:14px;background:#FFFDF8;' +
        'border:1px solid rgba(0,0,0,.10);font-size:14.5px;line-height:1.65;min-height:22px}' +
      '.u3-izoh h4{margin:0 0 5px;font-size:15px}' +
      '.u3-izoh p{margin:0;color:#4A4A55}' +
      '.u3-izoh.u3-yashil{border-color:#2F6B45;background:#F2F9F4}' +
      '.u3-izoh.u3-qizil{border-color:#A3232C;background:#FDF3F3}' +
      '#u3-charx[hidden],#u3-tekshir[hidden]{display:none !important}' +
      '@media (max-width:560px){.u3-usta{font-size:12.5px;padding:7px 12px}.u3-izoh{font-size:13.5px}}';
    document.head.appendChild(st);
  }

  /* =========================================================
     3. Interfeys
     ========================================================= */
  idish.innerHTML =
    '<div class="uch-sahna">' +
      '<canvas class="uch-canvas"></canvas>' +
      '<div class="uch-ust">' +
        '<span>Bosqich <b id="u3-bosqich">1</b>/2</span>' +
        '<span>Buyum <b id="u3-savol">0</b>/<b id="u3-jami">0</b></span>' +
        '<span>To‘g‘ri <b id="u3-ball">0</b></span>' +
      '</div>' +
      '<p class="uch-maslahat" id="u3-maslahat">«O‘yinni boshlash» tugmasini bosing</p>' +
    '</div>' +
    '<div class="u3-ustalar" id="u3-ustalar"></div>' +
    '<div class="u3-izoh" id="u3-izoh"><p>Ustaxonada yetti usta ishlaydi. Har bir buyum ' +
      'qaysi ustaning qo‘lidan chiqqanini toping.</p></div>' +
    '<div class="oyin-tugmalar">' +
      '<button type="button" class="tug tug-asos tug-kichik" id="u3-boshla">▶ O‘yinni boshlash</button>' +
      '<button type="button" class="tug tug-ramka tug-kichik" id="u3-charx" hidden>🏺 Charxda ko‘za yasash</button>' +
      '<button type="button" class="tug tug-asos tug-kichik" id="u3-tekshir" hidden>Ko‘zani tekshirish</button>' +
      '<button type="button" class="tug tug-ramka tug-kichik" id="u3-qayta">Qaytadan</button>' +
    '</div>';

  var canvas    = idish.querySelector('.uch-canvas');
  var maslahat  = idish.querySelector('#u3-maslahat');
  var elBosqich = idish.querySelector('#u3-bosqich');
  var elSavol   = idish.querySelector('#u3-savol');
  var elJami    = idish.querySelector('#u3-jami');
  var elBall    = idish.querySelector('#u3-ball');
  var elIzoh    = idish.querySelector('#u3-izoh');
  var qatorUsta = idish.querySelector('#u3-ustalar');
  var tBoshla   = idish.querySelector('#u3-boshla');
  var tCharx    = idish.querySelector('#u3-charx');
  var tTekshir  = idish.querySelector('#u3-tekshir');
  var tQayta    = idish.querySelector('#u3-qayta');

  function xabar(m) { maslahat.textContent = m; }
  function izoh(sarl, matn, rang) {
    elIzoh.className = 'u3-izoh' + (rang ? ' u3-' + rang : '');
    elIzoh.innerHTML = (sarl ? '<h4>' + sarl + '</h4>' : '') + '<p>' + matn + '</p>';
  }

  /* ---------- Usta tugmalari ---------- */
  var ustaTugma = {};
  USTA_KALITLARI.forEach(function (k) {
    var u = USTALAR[k];
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'u3-usta';
    b.dataset.usta = k;
    b.innerHTML = '<b style="background:#' +
      ('000000' + (u.rang >>> 0).toString(16)).slice(-6) + '"></b>' + u.nom;
    b.disabled = true;
    b.addEventListener('click', function () { javobBer(k); });
    qatorUsta.appendChild(b);
    ustaTugma[k] = b;
  });

  /* =========================================================
     4. Sahna
     ========================================================= */
  var sahna = new THREE.Scene();
  sahna.background = new THREE.Color(0xF1E3C8);
  sahna.fog = new THREE.Fog(0xF1E3C8, 18, 40);

  var kamera = new THREE.PerspectiveCamera(46, 16 / 10, 0.1, 120);
  var KAM_UY   = new THREE.Vector3(0, 8.5, 8.5);
  var KAM_NIGOH = new THREE.Vector3(0, 0.75, -1.0);
  var nigoh = KAM_NIGOH.clone();
  kamera.position.copy(KAM_UY);
  kamera.lookAt(nigoh);

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  sahna.add(new THREE.HemisphereLight(0xFFF6E4, 0xB08E64, 1.05));
  var quyosh = new THREE.DirectionalLight(0xFFF0D2, 1.45);
  quyosh.position.set(6, 13, 8);
  quyosh.castShadow = true;
  quyosh.shadow.mapSize.set(1536, 1536);
  quyosh.shadow.camera.left = -13; quyosh.shadow.camera.right = 13;
  quyosh.shadow.camera.top = 13;   quyosh.shadow.camera.bottom = -13;
  quyosh.shadow.camera.far = 40;
  quyosh.shadow.bias = -0.0009;
  sahna.add(quyosh);
  var toldiruvchi = new THREE.DirectionalLight(0xC1502E, 0.26);
  toldiruvchi.position.set(-7, 4, -6);
  sahna.add(toldiruvchi);

  /* ---------- Hovli yer ---------- */
  var yer = new THREE.Mesh(
    new THREE.CircleGeometry(13.5, 56),
    new THREE.MeshStandardMaterial({ color: 0xCBAF86, roughness: 0.96 })
  );
  yer.rotation.x = -Math.PI / 2;
  yer.receiveShadow = true;
  sahna.add(yer);

  // Yer ustidagi g‘isht halqalari — hovli sathi
  [11.6, 9.0].forEach(function (r) {
    var h = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.06, 6, 72),
      new THREE.MeshStandardMaterial({ color: 0xB08E64, roughness: 0.95 })
    );
    h.rotation.x = -Math.PI / 2;
    h.position.y = 0.012;
    sahna.add(h);
  });

  // Markazdagi gilamcha
  var gilamcha = new THREE.Mesh(
    new THREE.CylinderGeometry(3.1, 3.1, 0.05, 48),
    new THREE.MeshStandardMaterial({ color: 0x8C3A2B, roughness: 0.96 })
  );
  gilamcha.position.set(0, 0.03, 0.4);
  gilamcha.receiveShadow = true;
  sahna.add(gilamcha);
  var gilamHoshiya = new THREE.Mesh(
    new THREE.TorusGeometry(2.75, 0.05, 6, 56),
    new THREE.MeshStandardMaterial({ color: 0xD4A24C, roughness: 0.55, metalness: 0.3 })
  );
  gilamHoshiya.rotation.x = -Math.PI / 2;
  gilamHoshiya.position.set(0, 0.062, 0.4);
  sahna.add(gilamHoshiya);

  /* ---------- Orqa devor — paxsa hovli ---------- */
  var devor = new THREE.Mesh(
    new THREE.CylinderGeometry(11.4, 11.6, 3.4, 48, 1, true, Math.PI * 0.86, Math.PI * 1.28),
    new THREE.MeshStandardMaterial({ color: 0xD8C09A, roughness: 0.98, side: THREE.DoubleSide })
  );
  devor.position.y = 1.7;
  devor.receiveShadow = true;
  sahna.add(devor);
  var devorTepa = new THREE.Mesh(
    new THREE.CylinderGeometry(11.75, 11.75, 0.24, 48, 1, true, Math.PI * 0.86, Math.PI * 1.28),
    new THREE.MeshStandardMaterial({ color: 0xB08E64, roughness: 0.95, side: THREE.DoubleSide })
  );
  devorTepa.position.y = 3.45;
  sahna.add(devorTepa);

  /* =========================================================
     5. Usta joylari — yoy bo‘ylab
     ========================================================= */
  var RADIUS = 7.0;
  var stansiyalar = [];   // { kalit, guruh, halqa, jahon }
  var stansiyaGuruh = {};

  USTA_KALITLARI.forEach(function (kalit, i) {
    var n = USTA_KALITLARI.length;
    var t = n > 1 ? i / (n - 1) : 0.5;
    var burchak = Math.PI * (1.055 + t * 0.89);     // ~190° … ~350°
    var x = Math.cos(burchak) * RADIUS;
    var z = Math.sin(burchak) * RADIUS;

    var g;
    try { g = USTALAR[kalit].yasa(); } catch (e) { g = null; }
    if (!g) return;
    g.position.set(x, 0, z);
    g.scale.setScalar(1.12);
    g.rotation.y = Math.atan2(-x, -z);              // markazga qaraydi
    g.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    sahna.add(g);
    stansiyaGuruh[kalit] = g;

    // Ostidagi supacha
    var supa = new THREE.Mesh(
      new THREE.CylinderGeometry(1.75, 1.85, 0.14, 28),
      new THREE.MeshStandardMaterial({ color: 0xC0A177, roughness: 0.95 })
    );
    supa.position.set(x, 0.07, z);
    supa.receiveShadow = true;
    sahna.add(supa);

    // Javob halqasi — yashil/qizil chaqnaydi
    var halqa = new THREE.Mesh(
      new THREE.TorusGeometry(1.72, 0.09, 8, 44),
      new THREE.MeshStandardMaterial({
        color: USTALAR[kalit].rang, roughness: 0.5, metalness: 0.2,
        transparent: true, opacity: 0.34,
        emissive: new THREE.Color(USTALAR[kalit].rang), emissiveIntensity: 0.12
      })
    );
    halqa.rotation.x = -Math.PI / 2;
    halqa.position.set(x, 0.16, z);
    sahna.add(halqa);

    // Buyum qo‘yiladigan jahon nuqtasi
    var joy = (g.userData && g.userData.qoyish && g.userData.qoyish.isVector3)
      ? g.userData.qoyish.clone()
      : new THREE.Vector3(0, 1.0, 0.35);
    g.updateMatrixWorld(true);
    var jahon = g.localToWorld(joy.clone());

    stansiyalar.push({ kalit: kalit, guruh: g, halqa: halqa, jahon: jahon, band: 0 });
  });

  /* ---------- Kulol charxi — aylanuvchi qism ---------- */
  var kulolG   = stansiyaGuruh.kulol || null;
  var charxAyl = (kulolG && kulolG.userData && kulolG.userData.aylanuvchi) || null;
  var charxTez = 0.9;

  /* =========================================================
     6. Markaziy kunda va namoyish buyumi
     ========================================================= */
  var kunda = new THREE.Group();
  var kundaTana = new THREE.Mesh(
    new THREE.CylinderGeometry(0.86, 0.98, 0.62, 26),
    new THREE.MeshStandardMaterial({ color: 0x8A6A44, roughness: 0.9 })
  );
  kundaTana.position.y = 0.31;
  kundaTana.castShadow = true; kundaTana.receiveShadow = true;
  kunda.add(kundaTana);
  var kundaYuza = new THREE.Mesh(
    new THREE.CylinderGeometry(0.92, 0.92, 0.09, 26),
    new THREE.MeshStandardMaterial({ color: 0xB08E64, roughness: 0.82 })
  );
  kundaYuza.position.y = 0.65;
  kundaYuza.castShadow = true; kundaYuza.receiveShadow = true;
  kunda.add(kundaYuza);
  var kundaHalqa = new THREE.Mesh(
    new THREE.TorusGeometry(0.9, 0.045, 8, 30),
    new THREE.MeshStandardMaterial({ color: 0xD4A24C, roughness: 0.5, metalness: 0.35 })
  );
  kundaHalqa.rotation.x = -Math.PI / 2;
  kundaHalqa.position.y = 0.7;
  kunda.add(kundaHalqa);
  kunda.position.set(0, 0.06, 1.5);
  sahna.add(kunda);

  var KUNDA_TEPA = new THREE.Vector3(0, 0.82, 1.5);

  /* Model keshi — bir buyum bir marta yasaladi */
  var kesh = {};
  function buyumModeli(kalit) {
    if (!kesh[kalit]) {
      var g = BUYUMLAR[kalit].yasa();
      g.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      kesh[kalit] = g;
    }
    return kesh[kalit];
  }

  var joriyModel = null;      // kundadagi buyum
  var qoyilganlar = [];       // stollarga qo‘yilgan buyumlar

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

  function uchir(obj, dan, ga, dav, oxirgiMiqyos) {
    var m0 = obj.scale.x;
    var balandlik = Math.max(1.6, dan.distanceTo(ga) * 0.35);
    qoshVazifa(dav, function (p) {
      var e = yumshoq(p);
      obj.position.lerpVectors(dan, ga, e);
      obj.position.y += Math.sin(p * Math.PI) * balandlik;
      obj.rotation.y += 0.12;
      var m = m0 + (oxirgiMiqyos - m0) * e;
      obj.scale.setScalar(m);
    }, function () {
      obj.position.copy(ga);
      obj.scale.setScalar(oxirgiMiqyos);
    });
  }

  function silkit(obj, dav) {
    var x0 = obj.position.x;
    qoshVazifa(dav, function (p) {
      obj.position.x = x0 + Math.sin(p * Math.PI * 8) * 0.22 * (1 - p);
    }, function () { obj.position.x = x0; });
  }

  function chaqnat(st, rang, dav) {
    var m = st.halqa.material;
    var asos = new THREE.Color(USTALAR[st.kalit].rang);
    var yangi = new THREE.Color(rang);
    qoshVazifa(dav, function (p) {
      var k = Math.sin(Math.min(p, 1) * Math.PI);
      m.color.copy(asos).lerp(yangi, k);
      m.emissive.copy(asos).lerp(yangi, k);
      m.emissiveIntensity = 0.12 + k * 0.85;
      m.opacity = 0.34 + k * 0.5;
    }, function () {
      m.color.copy(asos); m.emissive.copy(asos);
      m.emissiveIntensity = 0.12; m.opacity = 0.34;
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
     8. 1-BOSQICH — taqsimlash
     ========================================================= */
  var SAVOL_SONI = Math.min(10, BUYUM_KALITLARI.length);
  var navbat = [], nomer = 0, ball = 0, holat = 'tayyor';

  function aralash(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* Har bir usta kamida bir marta uchraydigan navbat tuzamiz */
  function navbatTuz() {
    var guruhlar = {};
    BUYUM_KALITLARI.forEach(function (k) {
      var u = BOGLANISH[k];
      (guruhlar[u] = guruhlar[u] || []).push(k);
    });
    var tanlangan = [];
    USTA_KALITLARI.forEach(function (u) {
      if (guruhlar[u] && guruhlar[u].length) {
        tanlangan.push(aralash(guruhlar[u])[0]);
      }
    });
    var qolgan = aralash(BUYUM_KALITLARI.filter(function (k) {
      return tanlangan.indexOf(k) === -1;
    }));
    while (tanlangan.length < SAVOL_SONI && qolgan.length) tanlangan.push(qolgan.shift());
    return aralash(tanlangan).slice(0, SAVOL_SONI);
  }

  function tugmalarniYoq(yoqilgan) {
    USTA_KALITLARI.forEach(function (k) {
      ustaTugma[k].disabled = !yoqilgan;
      ustaTugma[k].classList.remove('u3-togri', 'u3-xato');
    });
  }

  function keyingiSavol() {
    if (nomer >= navbat.length) { bosqichBir_tugadi(); return; }
    var kalit = navbat[nomer];
    var b = BUYUMLAR[kalit];

    if (joriyModel) sahna.remove(joriyModel);
    joriyModel = buyumModeli(kalit);
    joriyModel.userData.kalit = kalit;
    joriyModel.position.copy(KUNDA_TEPA);
    joriyModel.scale.setScalar(0.01);
    joriyModel.rotation.set(0, 0, 0);
    sahna.add(joriyModel);

    qoshVazifa(0.45, function (p) {
      joriyModel.scale.setScalar(0.01 + (1.65 - 0.01) * yumshoq(p));
    }, function () { joriyModel.scale.setScalar(1.65); });

    nomer++;
    elSavol.textContent = nomer;
    holat = 'tanlash';
    tugmalarniYoq(true);
    xabar('«' + b.nom + '» — bu qaysi ustaning ishi?');
    izoh('', 'Sahnadagi usta joyini bosing yoki pastdagi tugmani tanlang.');
  }

  function javobBer(tanlanganUsta) {
    if (holat !== 'tanlash') return;
    holat = 'javob';
    tugmalarniYoq(false);

    var kalit = joriyModel.userData.kalit;
    var b = BUYUMLAR[kalit];
    var rost = BOGLANISH[kalit];
    var togri = (tanlanganUsta === rost);

    var stRost = null, stTanlangan = null;
    stansiyalar.forEach(function (s) {
      if (s.kalit === rost) stRost = s;
      if (s.kalit === tanlanganUsta) stTanlangan = s;
    });

    ustaTugma[rost].classList.add('u3-togri');
    if (!togri && ustaTugma[tanlanganUsta]) ustaTugma[tanlanganUsta].classList.add('u3-xato');

    if (togri) {
      ball++;
      elBall.textContent = ball;
      chaqnat(stRost, 0x2F6B45, 0.9);
      xabar('To‘g‘ri! ' + USTALAR[rost].nom + ' ishi.');
      izoh(b.nom + ' — ' + USTALAR[rost].hunar, b.izoh || '', 'yashil');
      if (rost === 'kulol') charxTez = 7.5;
    } else {
      if (stTanlangan) chaqnat(stTanlangan, 0xA3232C, 0.7);
      chaqnat(stRost, 0x2F6B45, 1.2);
      silkit(joriyModel, 0.45);
      xabar('Bu ' + USTALAR[rost].nom + ' ishi edi.');
      izoh(b.nom + ' — ' + USTALAR[rost].hunar, b.izoh || '', 'qizil');
    }

    // Buyum to‘g‘ri ustaning stoliga uchadi
    var maqsad = stRost.jahon.clone();
    maqsad.x += (stRost.band % 3 - 1) * 0.34;
    maqsad.z += Math.floor(stRost.band / 3) * 0.3;
    stRost.band++;
    var uchuvchi = joriyModel;
    joriyModel = null;
    uchir(uchuvchi, uchuvchi.position.clone(), maqsad, togri ? 0.85 : 1.15, 0.55);
    qoshVazifa(0.001, null, function () { qoyilganlar.push(uchuvchi); });

    kutish(togri ? 1.1 : 1.7);
    qoshVazifa(0.001, null, function () { keyingiSavol(); });
  }

  function bosqichBir_tugadi() {
    holat = 'oraliq';
    tugmalarniYoq(false);
    var foiz = Math.round(ball / navbat.length * 100);
    xabar('1-bosqich tugadi: ' + ball + ' / ' + navbat.length);
    izoh('Taqsimlash bosqichi tugadi — ' + foiz + '%',
      'Endi kulolchilik charxida o‘zingiz ko‘za yasab ko‘ring. ' +
      '«Charxda ko‘za yasash» tugmasini bosing.', foiz >= 60 ? 'yashil' : '');
    saqla();
    tCharx.hidden = false;
    tCharx.focus();
  }

  /* =========================================================
     9. 2-BOSQICH — kulolchilik charxida ko‘za yasash
     ========================================================= */
  var BALAND  = [0.02, 0.17, 0.33, 0.50, 0.67, 0.84];
  var NAMUNA  = [0.15, 0.31, 0.40, 0.33, 0.16, 0.21];   // klassik ko‘za silueti
  var MIN_R = 0.08, MAX_R = 0.46;
  var radiuslar = [0.20, 0.20, 0.20, 0.20, 0.20, 0.20];

  var charxTayanch = null;   // ko‘za va halqalar shu guruhda
  var koza = null, kozaSoya = null, dastaklar = [];
  var namunaModel = null;

  function profilNuqtalari(r) {
    var p = [new THREE.Vector2(0.015, 0)];
    for (var i = 0; i < BALAND.length; i++) p.push(new THREE.Vector2(r[i], BALAND[i]));
    p.push(new THREE.Vector2(r[r.length - 1] * 0.94, BALAND[BALAND.length - 1] + 0.05));
    p.push(new THREE.Vector2(r[r.length - 1] * 0.72, BALAND[BALAND.length - 1] + 0.07));
    return p;
  }

  function kozaGeo(r) {
    var g = new THREE.LatheGeometry(profilNuqtalari(r), 36);
    g.computeVertexNormals();
    return g;
  }

  function kozaniYangila() {
    var g = kozaGeo(radiuslar);
    koza.geometry.dispose();
    koza.geometry = g;
    for (var i = 0; i < dastaklar.length; i++) {
      dastaklar[i].position.set(radiuslar[i] + 0.05, BALAND[i], 0);
    }
  }

  function charxniTayyorla() {
    if (charxTayanch) return;
    charxTayanch = new THREE.Group();

    var boshi = (kulolG && kulolG.userData && kulolG.userData.charxBoshi &&
                 kulolG.userData.charxBoshi.isVector3)
      ? kulolG.userData.charxBoshi.clone()
      : new THREE.Vector3(0, 0.95, 0.1);
    kulolG.updateMatrixWorld(true);
    var jahon = kulolG.localToWorld(boshi.clone());
    charxTayanch.position.copy(jahon);
    sahna.add(charxTayanch);

    koza = new THREE.Mesh(
      kozaGeo(radiuslar),
      new THREE.MeshStandardMaterial({
        color: 0xB4653C, roughness: 0.92, metalness: 0.02, side: THREE.DoubleSide
      })
    );
    koza.castShadow = true;
    charxTayanch.add(koza);

    // Namuna silueti — ustiga tushadigan shaffof soya
    kozaSoya = new THREE.Mesh(
      kozaGeo(NAMUNA),
      new THREE.MeshStandardMaterial({
        color: 0x2F6B45, roughness: 0.6, transparent: true, opacity: 0.20,
        side: THREE.DoubleSide, depthWrite: false
      })
    );
    charxTayanch.add(kozaSoya);

    // Sudraladigan halqalar
    var dMat = new THREE.MeshStandardMaterial({
      color: 0xD4A24C, roughness: 0.35, metalness: 0.5,
      emissive: new THREE.Color(0xD4A24C), emissiveIntensity: 0.35
    });
    for (var i = 0; i < BALAND.length; i++) {
      var d = new THREE.Mesh(new THREE.SphereGeometry(0.052, 14, 10), dMat.clone());
      d.userData.indeks = i;
      d.position.set(radiuslar[i] + 0.05, BALAND[i], 0);
      charxTayanch.add(d);
      dastaklar.push(d);
    }

    // Yonida turadigan namuna ko‘za — o‘quvchi ko‘rib turadi
    namunaModel = new THREE.Mesh(
      kozaGeo(NAMUNA),
      new THREE.MeshStandardMaterial({ color: 0xC1502E, roughness: 0.85, side: THREE.DoubleSide })
    );
    namunaModel.castShadow = true;
    var yon = new THREE.Group();
    yon.add(namunaModel);
    var taxta = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.36, 0.09, 20),
      new THREE.MeshStandardMaterial({ color: 0x8A6A44, roughness: 0.9 })
    );
    taxta.position.y = -0.045;
    taxta.receiveShadow = true;
    yon.add(taxta);
    yon.position.copy(jahon);
    // Kameradan chapga — usta stolining yon tomoniga
    var chap = new THREE.Vector3(jahon.x, 0, jahon.z).normalize()
      .cross(new THREE.Vector3(0, 1, 0)).multiplyScalar(1.25);
    yon.position.add(chap);
    sahna.add(yon);
  }

  function bosqichIkki() {
    if (holat === 'charx') return;
    vazifalar.length = 0;
    holat = 'charx';
    tCharx.hidden = true;
    elBosqich.textContent = '2';
    charxniTayyorla();
    charxTez = 6.5;
    canvas.style.touchAction = 'none';

    // Kamera charxdan hovli markaziga tomon chiqib, ko‘zaga yaqinlashadi
    var markaz = charxTayanch.position.clone();
    var yonalish = new THREE.Vector3(markaz.x, 0, markaz.z).normalize();
    var kamPos = markaz.clone()
      .add(yonalish.clone().multiplyScalar(-2.55))
      .add(new THREE.Vector3(0, 1.25, 0));
    kameraKoch(kamPos, markaz.clone().add(new THREE.Vector3(0, 0.42, 0)), 1.3);

    qoshVazifa(0.001, null, function () {
      tTekshir.hidden = false;
      xabar('Oltin nuqtalarni sudrab ko‘zaga shakl bering');
      izoh('2-bosqich — kulolchilik charxi',
        'Charx aylanmoqda. Loydagi olti oltin nuqtani ichkariga yoki tashqariga ' +
        'sudrab, ko‘zaning bo‘yni va qornini shakllantiring. Yashil siluet — ' +
        'namunaning shakli; unga qanchalik yaqin kelsangiz, ball shuncha yuqori. ' +
        'Yonda usta yasagan tayyor ko‘za turibdi.');
    });
  }

  function kozaniTekshir() {
    if (holat !== 'charx') return;
    var xato = 0;
    for (var i = 0; i < NAMUNA.length; i++) xato += Math.abs(radiuslar[i] - NAMUNA[i]);
    xato /= NAMUNA.length;
    var foiz = Math.max(0, Math.min(100, Math.round(100 - (xato / 0.16) * 100)));
    kozaFoiz = foiz;
    holat = 'tugadi';
    tTekshir.hidden = true;
    canvas.style.touchAction = '';

    var baho = foiz >= 85 ? 'Ustaning qo‘li! Ko‘za namunaga juda yaqin chiqdi.'
             : foiz >= 60 ? 'Yaxshi. Ko‘za shakli namunaga o‘xshadi.'
             : foiz >= 35 ? 'O‘rtacha. Qorni va bo‘yni farq qilmoqda.'
             : 'Bu safar shakl chiqmadi. Kulolchilik sabr talab qiladi.';
    xabar('Ko‘za tayyor — ' + foiz + '%');
    var jami = saqla();
    izoh('Ko‘za bahosi: ' + foiz + '%',
      baho + ' Umumiy natija: <b>' + jami + '%</b> ' +
      '(taqsimlash ' + Math.round(ball / Math.max(navbat.length, 1) * 100) + '%, ' +
      'kulolchilik ' + foiz + '%).',
      jami >= 60 ? 'yashil' : '');
  }

  var kozaFoiz = null;

  function saqla() {
    var b1 = navbat.length ? Math.round(ball / navbat.length * 100) : 0;
    var jami = (kozaFoiz === null) ? b1 : Math.round(b1 * 0.7 + kozaFoiz * 0.3);
    try {
      if (window.Xotira && window.Xotira.modulYoz) {
        window.Xotira.modulYoz(10, { oyin3d: jami });
      }
    } catch (e) {}
    return jami;
  }

  /* =========================================================
     10. Bosish va sudrash
     ========================================================= */
  var nur = new THREE.Raycaster();
  var nuqta = new THREE.Vector2();
  var tekislik = new THREE.Plane();
  var sudralayotgan = null;

  function nuqtaniOl(e) {
    var r = canvas.getBoundingClientRect();
    nuqta.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    nuqta.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    nur.setFromCamera(nuqta, kamera);
  }

  canvas.addEventListener('pointerdown', function (e) {
    nuqtaniOl(e);

    if (holat === 'charx' && dastaklar.length) {
      var d = nur.intersectObjects(dastaklar, false);
      if (d.length) {
        sudralayotgan = d[0].object;
        tekislik.set(new THREE.Vector3(0, 1, 0),
          -(charxTayanch.position.y + BALAND[sudralayotgan.userData.indeks]));
        canvas.setPointerCapture(e.pointerId);
        e.preventDefault();
        return;
      }
    }

    if (holat !== 'tanlash') return;
    var guruhlar = stansiyalar.map(function (s) { return s.guruh; });
    var k = nur.intersectObjects(guruhlar, true);
    if (!k.length) return;
    var o = k[0].object;
    while (o && guruhlar.indexOf(o) === -1) o = o.parent;
    if (!o) return;
    var st = stansiyalar[guruhlar.indexOf(o)];
    if (st) javobBer(st.kalit);
  });

  canvas.addEventListener('pointermove', function (e) {
    if (!sudralayotgan) return;
    nuqtaniOl(e);
    var p = new THREE.Vector3();
    if (!nur.ray.intersectPlane(tekislik, p)) return;
    var dx = p.x - charxTayanch.position.x;
    var dz = p.z - charxTayanch.position.z;
    var r = Math.sqrt(dx * dx + dz * dz) - 0.05;
    r = Math.max(MIN_R, Math.min(MAX_R, r));
    radiuslar[sudralayotgan.userData.indeks] = r;
    kozaniYangila();
    e.preventDefault();
  });

  function sudrashniTugat(e) {
    if (!sudralayotgan) return;
    sudralayotgan = null;
    try { canvas.releasePointerCapture(e.pointerId); } catch (err) {}
  }
  canvas.addEventListener('pointerup', sudrashniTugat);
  canvas.addEventListener('pointercancel', sudrashniTugat);

  /* =========================================================
     11. Tugmalar
     ========================================================= */
  function oyinniBoshla() {
    vazifalar.length = 0;
    qoyilganlar.forEach(function (o) { sahna.remove(o); });
    qoyilganlar.length = 0;
    stansiyalar.forEach(function (s) { s.band = 0; });
    if (joriyModel) { sahna.remove(joriyModel); joriyModel = null; }

    navbat = navbatTuz();
    nomer = 0; ball = 0; kozaFoiz = null;
    elJami.textContent = navbat.length;
    elSavol.textContent = '0';
    elBall.textContent = '0';
    elBosqich.textContent = '1';
    tCharx.hidden = true;
    tTekshir.hidden = true;
    tBoshla.textContent = '▶ Qaytadan boshlash';

    if (holat === 'charx' || holat === 'tugadi') {
      kameraKoch(KAM_UY.clone(), KAM_NIGOH.clone(), 1.0);
      canvas.style.touchAction = '';
      charxTez = 0.9;
    }
    holat = 'oraliq';
    qoshVazifa(0.001, null, function () { keyingiSavol(); });
  }

  elJami.textContent = SAVOL_SONI;
  tBoshla.addEventListener('click', oyinniBoshla);
  tCharx.addEventListener('click', bosqichIkki);
  tTekshir.addEventListener('click', kozaniTekshir);
  tQayta.addEventListener('click', function () {
    vazifalar.length = 0;
    qoyilganlar.forEach(function (o) { sahna.remove(o); });
    qoyilganlar.length = 0;
    stansiyalar.forEach(function (s) { s.band = 0; });
    if (joriyModel) { sahna.remove(joriyModel); joriyModel = null; }
    radiuslar = [0.20, 0.20, 0.20, 0.20, 0.20, 0.20];
    if (koza) kozaniYangila();
    kozaFoiz = null;
    nomer = 0; ball = 0; navbat = [];
    elSavol.textContent = '0'; elBall.textContent = '0'; elBosqich.textContent = '1';
    elJami.textContent = SAVOL_SONI;
    tCharx.hidden = true; tTekshir.hidden = true;
    tBoshla.textContent = '▶ O‘yinni boshlash';
    tugmalarniYoq(false);
    charxTez = 0.9;
    canvas.style.touchAction = '';
    kamera.position.copy(KAM_UY); nigoh.copy(KAM_NIGOH);
    holat = 'tayyor';
    xabar('«O‘yinni boshlash» tugmasini bosing');
    izoh('', 'Ustaxonada yetti usta ishlaydi. Har bir buyum qaysi ustaning ' +
      'qo‘lidan chiqqanini toping.');
  });

  /* =========================================================
     12. O‘lcham va render halqasi
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

  var ishlayapti = false, oxirgi = 0;

  function halqaFn(vaqt) {
    if (!ishlayapti) return;
    var dt = Math.min((vaqt - oxirgi) / 1000, 0.05);
    oxirgi = vaqt;

    if (vazifalar.length) {
      var v = vazifalar[0];
      v.t += dt;
      var p = Math.min(v.t / v.dav, 1);
      v.qadam(p);
      if (p >= 1) { vazifalar.shift(); if (v.tugash) v.tugash(); }
    }

    // Charx aylanishi
    if (charxAyl) {
      charxAyl.rotation.y += dt * charxTez;
      if (holat !== 'charx' && charxTez > 0.9) charxTez = Math.max(0.9, charxTez - dt * 4);
    }
    if (koza && holat === 'charx') koza.rotation.y += dt * charxTez * 0.5;

    // Kundadagi buyum sekin aylanadi
    if (joriyModel && !kamHarakat && holat === 'tanlash') joriyModel.rotation.y += dt * 0.6;

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
  // Birinchi kadr darhol chizilsin — zaxira blok yashirilishi uchun
  renderer.render(sahna, kamera);

  var zaxira = document.getElementById('oyin');
  if (zaxira) { /* oddiy o‘yin baribir foydali — o‘chirilmaydi */ }

  window.addEventListener('pagehide', function () {
    ochir();
    try { renderer.dispose(); } catch (e) {}
  });
})();
