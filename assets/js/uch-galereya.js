/* =========================================================
   3D GALEREYA — modul mavzusidagi buyumlarning aniq modellari
   Darslikda nomlangan har bir buyumning o‘z 3D modeli bor.
   Foydalanuvchi buyumni aylantirib, yaqinlashtirib ko‘radi.

   Model kutubxonalari:
     model-cholgu.js  — milliy cholg‘ular
     model-hunar.js   — hunarmandchilik buyumlari
     model-oyin.js    — milliy o‘yin buyumlari
     model-maishiy.js — maishiy va marosim buyumlari
   ========================================================= */
import * as THREE from '../vendor/three.module.min.js';

(async function () {
  'use strict';

  const idish = document.getElementById('galereya');
  if (!idish) return;

  const modul = parseInt(idish.dataset.modul || '0', 10);

  /* ---------- WebGL tekshiruvi ---------- */
  function webglBor() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }
  if (!webglBor()) {
    idish.innerHTML = '<p class="uch-xato">Brauzeringiz 3D grafikani qo‘llab-quvvatlamaydi.</p>';
    return;
  }

  /* ---------- Kutubxonalarni yuklash (yo‘qi bo‘lsa o‘tkazib yuboriladi) ---------- */
  const manbalar = [
    ['./model-cholgu.js',  'CHOLGULAR'],
    ['./model-hunar.js',   'HUNARLAR'],
    ['./model-oyin.js',    'OYIN_BUYUMLARI'],
    ['./model-maishiy.js', 'MAISHIY'],
  ];
  const natijalar = await Promise.allSettled(manbalar.map(m => import(m[0])));

  let hammasi = {};
  natijalar.forEach((n, i) => {
    if (n.status !== 'fulfilled') return;
    const ro = n.value[manbalar[i][1]];
    if (ro) Object.keys(ro).forEach(k => { hammasi[k] = ro[k]; });
  });

  /* ---------- Shu modulga tegishli buyumlarni tanlash ---------- */
  // Modul -> buyum kalitlari. Kutubxonada bo‘lmagan kalit jimgina tashlanadi.
  const MODUL_BUYUMLARI = {
    1:  ['kitob', 'qalam', 'daftar'],
    3:  ['beshik', 'dasturxon', 'non', 'choynak', 'piyola'],
    4:  ['ketmon', 'oroq', 'kitob'],
    5:  ['beshik', 'kitob', 'olma'],
    6:  ['dombra', 'kitob'],
    7:  ['qozon', 'non', 'dasturxon', 'doppi'],
    8:  ['doppi', 'olma', 'terak', 'junTop', 'chimTop', 'qilich', 'chavgon', 'arqon', 'ot', 'qoy', 'romol'],
    10: ['xurmacha', 'sopolLagan', 'suzani', 'qumgon', 'misLagan', 'taqinchoq', 'ganch', 'pichoq', 'gilam'],
    11: ['dasturxon', 'non', 'choynak', 'piyola', 'doppi'],
    12: ['dutor', 'rubob', 'dombra', 'doira', 'chang', 'nay'],
    13: ['kitob', 'daftar', 'qalam'],
    14: ['ketmon', 'oroq'],
  };

  const kalitlar = (MODUL_BUYUMLARI[modul] || []).filter(k => hammasi[k]);
  if (!kalitlar.length) { idish.remove(); return; }

  /* =========================================================
     Interfeys
     ========================================================= */
  idish.innerHTML =
    '<div class="gal-sahna"><canvas class="gal-canvas"></canvas>' +
      '<p class="gal-ishora">Sichqoncha bilan sudrab aylantiring · g‘ildirak bilan yaqinlashtiring</p>' +
    '</div>' +
    '<div class="gal-malumot">' +
      '<h4 id="gal-nom"></h4><p id="gal-izoh"></p>' +
    '</div>' +
    '<div class="gal-royxat" id="gal-royxat"></div>';

  const canvas   = idish.querySelector('.gal-canvas');
  const nomEl    = idish.querySelector('#gal-nom');
  const izohEl   = idish.querySelector('#gal-izoh');
  const royxatEl = idish.querySelector('#gal-royxat');

  /* =========================================================
     Sahna
     ========================================================= */
  const sahna = new THREE.Scene();
  sahna.background = new THREE.Color(0xF7EFE1);

  const kamera = new THREE.PerspectiveCamera(38, 16 / 10, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  sahna.add(new THREE.HemisphereLight(0xFFF6E6, 0xC9A87A, 1.1));
  const asosiy = new THREE.DirectionalLight(0xFFF2DA, 1.55);
  asosiy.position.set(3.2, 5.4, 3.6);
  asosiy.castShadow = true;
  asosiy.shadow.mapSize.set(1024, 1024);
  asosiy.shadow.camera.left = -3; asosiy.shadow.camera.right = 3;
  asosiy.shadow.camera.top = 3;   asosiy.shadow.camera.bottom = -3;
  asosiy.shadow.bias = -0.001;
  sahna.add(asosiy);
  const yon = new THREE.DirectionalLight(0xC1502E, 0.3);
  yon.position.set(-3.4, 1.8, -2.6);
  sahna.add(yon);

  // Poydevor — milliy naqshli disk
  const poydevor = new THREE.Mesh(
    new THREE.CylinderGeometry(1.35, 1.45, 0.12, 40),
    new THREE.MeshStandardMaterial({ color: 0xC9A87A, roughness: 0.85 })
  );
  poydevor.position.y = -0.06;
  poydevor.receiveShadow = true;
  sahna.add(poydevor);

  [1.16, 0.95].forEach((r, i) => {
    const h = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.012, 6, 48),
      new THREE.MeshStandardMaterial({ color: 0xD4A24C, roughness: 0.5, metalness: 0.3 })
    );
    h.rotation.x = -Math.PI / 2;
    h.position.y = 0.002 + i * 0.001;
    sahna.add(h);
  });

  /* =========================================================
     Model almashtirish
     ========================================================= */
  const guruh = new THREE.Group();
  sahna.add(guruh);
  let joriy = null, joriyKalit = null;

  function tozala(obj) {
    obj.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose());
      }
    });
  }

  function korsat(kalit) {
    const b = hammasi[kalit];
    if (!b) return;
    joriyKalit = kalit;

    if (joriy) { guruh.remove(joriy); tozala(joriy); }
    joriy = b.yasa();

    // Modelni poydevorga moslab o‘lchamlaymiz
    const quti = new THREE.Box3().setFromObject(joriy);
    const olcham = quti.getSize(new THREE.Vector3());
    const eng = Math.max(olcham.x, olcham.y, olcham.z) || 1;
    const k = 1.55 / eng;
    joriy.scale.setScalar(k);

    // Pastki nuqtasini poydevorga qo‘yamiz, markazini o‘qqa keltiramiz
    const q2 = new THREE.Box3().setFromObject(joriy);
    const markaz = q2.getCenter(new THREE.Vector3());
    joriy.position.x -= markaz.x;
    joriy.position.z -= markaz.z;
    joriy.position.y -= q2.min.y;

    guruh.add(joriy);

    nomEl.textContent = b.nom + (b.hunar ? ' — ' + b.hunar : b.oyin ? ' — ' + b.oyin : '');
    izohEl.textContent = b.izoh || '';

    royxatEl.querySelectorAll('.gal-tugma').forEach(t => {
      t.classList.toggle('faol', t.dataset.kalit === kalit);
    });
  }

  // Ro‘yxat tugmalari
  kalitlar.forEach(k => {
    const t = document.createElement('button');
    t.type = 'button';
    t.className = 'gal-tugma';
    t.dataset.kalit = k;
    t.textContent = hammasi[k].nom;
    t.addEventListener('click', () => korsat(k));
    royxatEl.appendChild(t);
  });

  /* =========================================================
     Boshqaruv — sudrab aylantirish, g‘ildirak bilan yaqinlashtirish
     ========================================================= */
  let burchakY = 0.6, burchakX = 0.42, masofa = 4.2;
  let sudralmoqda = false, oxirgiX = 0, oxirgiY = 0;

  function kameraniJoyla() {
    burchakX = Math.max(0.08, Math.min(1.35, burchakX));
    masofa = Math.max(2.4, Math.min(7.5, masofa));
    kamera.position.set(
      Math.sin(burchakY) * Math.cos(burchakX) * masofa,
      Math.sin(burchakX) * masofa + 0.55,
      Math.cos(burchakY) * Math.cos(burchakX) * masofa
    );
    kamera.lookAt(0, 0.62, 0);
  }

  canvas.addEventListener('pointerdown', e => {
    sudralmoqda = true; oxirgiX = e.clientX; oxirgiY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', e => {
    if (!sudralmoqda) return;
    burchakY -= (e.clientX - oxirgiX) * 0.008;
    burchakX += (e.clientY - oxirgiY) * 0.006;
    oxirgiX = e.clientX; oxirgiY = e.clientY;
    kameraniJoyla();
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(t =>
    canvas.addEventListener(t, () => { sudralmoqda = false; }));
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    masofa += e.deltaY * 0.0035;
    kameraniJoyla();
  }, { passive: false });

  /* =========================================================
     O‘lcham va render
     ========================================================= */
  function olcham() {
    const w = idish.clientWidth || 640;
    const h = Math.min(Math.round(w * 0.60), 460);
    renderer.setSize(w, h, false);
    kamera.aspect = w / h;
    kamera.updateProjectionMatrix();
  }
  olcham();
  if (window.ResizeObserver) new ResizeObserver(olcham).observe(idish);
  else window.addEventListener('resize', olcham);

  const kamHarakat = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let ishlayapti = false, oxirgi = 0;
  function halqa(t) {
    if (!ishlayapti) return;
    const dt = Math.min((t - oxirgi) / 1000, 0.05);
    oxirgi = t;
    if (!sudralmoqda && !kamHarakat) { burchakY += dt * 0.28; kameraniJoyla(); }
    renderer.render(sahna, kamera);
    requestAnimationFrame(halqa);
  }
  function yoq() { if (!ishlayapti) { ishlayapti = true; oxirgi = performance.now(); requestAnimationFrame(halqa); } }
  function ochir() { ishlayapti = false; }

  kameraniJoyla();
  korsat(kalitlar[0]);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(y => { y[0].isIntersecting ? yoq() : ochir(); },
      { threshold: 0.05 }).observe(idish);
  } else { yoq(); }

  window.addEventListener('pagehide', () => {
    ochir();
    try { renderer.dispose(); } catch (e) {}
  });
})();
