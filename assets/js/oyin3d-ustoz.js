/* =========================================================================
   «USTOZ VA SHOGIRD» — HAQIQIY 3D O‘YIN (Three.js)
   13-modul: Xalq pedagogikasi manbalarida ustoz-o‘qituvchi kasbining
   ulug‘lanishi.

   Sahna — qadimiy maktab hujrasi va uning burchagidagi ustaxona.
   Darslikda nomlangan har bir detalning ALOHIDA 3D modeli bor:
     ustoz (maktabdor), shogird, lavh, siyohdon, qamish qalam,
     xattotlik taxtasi, kitob, daftar, bolg‘a, sandon, ko‘rpacha.
   Modellar: assets/js/model-maktab.js va assets/js/model-maishiy.js.

   O‘YIN QOIDASI (ikki bosqichli):
     1) Ustoz shogirdga vazifa beradi — o‘yinchi raxtdagi TO‘G‘RI BUYUMni
        bosadi, buyum shogird qo‘liga uchib boradi.
     2) So‘ng ustoz aytadigan TO‘G‘RI O‘GIT tanlanadi — uchta xalq
        maqolidan biri (barchasi 13-modul matnidan olingan).
   Sakkiz bosqich, oxirida foiz natija chiqadi va xotiraga yoziladi.
   ========================================================================= */

import * as THREE from '../vendor/three.module.min.js';

(function () {
  'use strict';

  const idish = document.getElementById('oyin3d-ustoz');
  if (!idish) return;

  function webglBor() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }
  if (!webglBor()) {
    idish.innerHTML = '<p class="uch-xato">Brauzeringiz 3D grafikani qo‘llab-quvvatlamaydi. ' +
      'Quyidagi oddiy interaktiv o‘yinda mavzuni baribir mustahkamlashingiz mumkin.</p>';
    return;
  }

  const kamHarakat = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ====================================================================
     BUYUMLAR — raxtda turadigan, bosiladigan modellar
     ==================================================================== */
  const BUYUMLAR = [
    { kalit: 'qamish',   kutubxona: 'maktab',  model: 'qamish',   nom: 'Qamish qalam', olcham: 1.15 },
    { kalit: 'siyohdon', kutubxona: 'maktab',  model: 'siyohdon', nom: 'Siyohdon',     olcham: 0.95 },
    { kalit: 'lavh',     kutubxona: 'maktab',  model: 'lavh',     nom: 'Lavh',         olcham: 1.15 },
    { kalit: 'taxta',    kutubxona: 'maktab',  model: 'taxta',    nom: 'Xattotlik taxtasi', olcham: 1.20 },
    { kalit: 'kitob',    kutubxona: 'maishiy', model: 'kitob',    nom: 'Kitob',        olcham: 1.15 },
    { kalit: 'daftar',   kutubxona: 'maishiy', model: 'daftar',   nom: 'Daftar',       olcham: 1.05 },
    { kalit: 'bolga',    kutubxona: 'maktab',  model: 'bolga',    nom: 'Bolg‘a',       olcham: 1.15 },
    { kalit: 'ketmon',   kutubxona: 'maishiy', model: 'ketmon',   nom: 'Ketmon',       olcham: 1.25 }
  ];

  /* ====================================================================
     BOSQICHLAR — vazifa + o‘git. Maqollar 13-modul matnidan olingan.
     ==================================================================== */
  const BOSQICHLAR = [
    {
      kalit: 'qamish',
      savol: 'Shogird xat mashqini boshlamoqchi. Ustoz unga nimani uzatadi?',
      togriIzoh: 'Qamish qalam — uchi qiya kesilgan xattotlik quroli. ' +
                 'Sharq maktablarida xat-savod aynan shu qalam bilan o‘rgatilgan.',
      ogitTogri: '«Ilm olish — igna bilan quduq qazish»',
      ogitIzoh: 'Xat mashqi kun sayin takrorlanadi; ilm sabr va bardosh bilan yig‘iladi.',
      ogitXato: ['«Aql ko‘pga yetkazar, hunar ko‘kka»', '«Har kim ekkanin o‘radi»']
    },
    {
      kalit: 'siyohdon',
      savol: 'Qalam tayyor. Endi yozish uchun shogirdga yana nima kerak?',
      togriIzoh: 'Siyohdon — qamish qalam botiriladigan sopol idish. ' +
                 'Siyoh to‘kilmasin deb u og‘ir va keng tagli qilib yasalgan.',
      ogitTogri: '«Avval bil, keyin qil»',
      ogitIzoh: 'Qalamni siyohga botirishdan oldin nima yozishni bilib olish kerak.',
      ogitXato: ['«Ustoz otangdan ulug‘»', '«Har kim ekkanin o‘radi»']
    },
    {
      kalit: 'taxta',
      savol: 'Shogird harflarni qayta-qayta yozib mashq qilmoqchi. Nimaga yozadi?',
      togriIzoh: 'Xattotlik taxtasi — yozilgan mashq yuvib tashlanadi va ' +
                 'taxta yana ishga yaraydi. Shu bois qog‘oz tejalgan.',
      ogitTogri: '«Ustoz ko‘rmagan shogird — har maqomda yurg‘alar»',
      ogitIzoh: 'Mashqni ustoz ko‘rib, xatosini tuzatib turmasa, shogird adashadi.',
      ogitXato: ['«Ilm olish — igna bilan quduq qazish»', '«Hurmat qilsang, hurmat ko‘rasan»']
    },
    {
      kalit: 'lavh',
      savol: 'Ustoz kitobni yerga qo‘ymaydi. Kitob nimaning ustiga qo‘yiladi?',
      togriIzoh: 'Lavh — buklama yog‘och kitob kursisi. Kitobni lavhga qo‘yish ' +
                 'ilmga va kitobga bo‘lgan hurmat belgisi hisoblangan.',
      ogitTogri: '«Bola aziz, odobi undan-da aziz»',
      ogitIzoh: 'Kitobni ehtiyot qilish — odob; odob esa bilimdan ham qadrli.',
      ogitXato: ['«Avval o‘rgan, keyin o‘rgat»', '«Aql ko‘pga yetkazar, hunar ko‘kka»']
    },
    {
      kalit: 'kitob',
      savol: 'Shogird darsni mustaqil o‘qib o‘rganmoqchi. Ustoz nimani beradi?',
      togriIzoh: 'Kitob — bilim manbai. Maktabdor domla kitobni shogirdga ' +
                 'o‘qib, ma’nosini tushuntirib bergan.',
      ogitTogri: '«Ustoz otangdan ulug‘»',
      ogitIzoh: 'Ota-ona dunyoga keltiradi, ustoz esa bilim berib yuksaklikka ko‘taradi.',
      ogitXato: ['«Avval bil, keyin qil»', '«Har kim ekkanin o‘radi»']
    },
    {
      kalit: 'daftar',
      savol: 'Shogird kundalik mashqlarini yozib borishi kerak. Unga nima kerak?',
      togriIzoh: 'Daftar — shogirdning kundalik mehnati va izlanishi belgisi. ' +
                 'Yozib borilgan bilim yodda mustahkam qoladi.',
      ogitTogri: '«Avval o‘rgan, keyin o‘rgat»',
      ogitIzoh: 'O‘zi puxta o‘rganmagan kishi boshqaga to‘g‘ri o‘rgata olmaydi.',
      ogitXato: ['«Bola aziz, odobi undan-da aziz»', '«Ilm olish — igna bilan quduq qazish»']
    },
    {
      kalit: 'bolga',
      savol: 'Shogird temirchilik hunarini o‘rganmoqchi. Ustaxonada unga nima kerak?',
      togriIzoh: 'Bolg‘a — temirchi hunarining asosiy quroli. Hunarmand oilalarda ' +
                 'bola mehnat jarayonining o‘zida kasb-hunarni egallagan.',
      ogitTogri: '«Aql ko‘pga yetkazar, hunar ko‘kka»',
      ogitIzoh: 'Bilim odamni yuksaltiradi, qo‘lida hunari borni esa hech narsa yiqitmaydi.',
      ogitXato: ['«Ustoz otangdan ulug‘»', '«Avval bil, keyin qil»']
    },
    {
      kalit: 'ketmon',
      savol: 'Ustoz dehqonchilik hunarini o‘rgatmoqchi. Yer chopish uchun nima kerak?',
      togriIzoh: 'Ketmon — dehqonchilik quroli. Dehqon oilasida bola kichikligidan ' +
                 'mehnatga jalb etilib, kasbni ota-bobosidan o‘rgangan.',
      ogitTogri: '«Har kim ekkanin o‘radi»',
      ogitIzoh: 'Mehnat qilgan hosilini oladi — bugungi mehnat ertangi natijadir.',
      ogitXato: ['«Bola aziz, odobi undan-da aziz»',
                 '«Ustoz ko‘rmagan shogird — har maqomda yurg‘alar»']
    }
  ];

  /* ====================================================================
     OCHISH TUGMASI
     ==================================================================== */
  idish.innerHTML =
    '<div style="text-align:center;padding:30px 18px;border-radius:14px;' +
      'background:linear-gradient(160deg,#F5E9D6,#E6D3B2);border:1px solid rgba(26,22,20,.12)">' +
      '<p style="margin:0 0 6px;font-size:34px" aria-hidden="true">📖 ✒️ 🔨 🎓</p>' +
      '<p style="margin:0 0 16px;font-size:15px;color:#4A4038;max-width:48ch;' +
        'margin-inline:auto;line-height:1.6">' +
        'Qadimiy maktab hujrasi: ustoz ko‘rpacha ustida, shogird tiz cho‘kib o‘tiribdi. ' +
        'Raxtdagi sakkiz buyumdan to‘g‘risini tanlab, shogirdga uzating va ' +
        'ustoz aytadigan o‘gitni toping.' +
      '</p>' +
      '<button type="button" class="tug tug-asos" id="us-ochish-tug">▶ Maktab hujrasini ochish</button>' +
    '</div>';

  const ochishTug = idish.querySelector('#us-ochish-tug');
  ochishTug.addEventListener('click', function () {
    ochishTug.disabled = true;
    ochishTug.textContent = 'Sahna yuklanmoqda…';
    qur().catch(function (x) {
      idish.innerHTML = '<p class="uch-xato">Sahnani yuklab bo‘lmadi. ' +
        'Sahifani yangilab, qaytadan urinib ko‘ring.</p>';
      if (window.console) console.error(x);
    });
  }, { once: true });

  /* ====================================================================
     SAHNA
     ==================================================================== */
  async function qur() {

    const [maktabLib, maishiyLib] = await Promise.all([
      import('./model-maktab.js'),
      import('./model-maishiy.js')
    ]);
    const KUTUB = { maktab: maktabLib.MAKTAB, maishiy: maishiyLib.MAISHIY };

    idish.innerHTML =
      '<div class="uch-sahna">' +
        '<canvas class="uch-canvas"></canvas>' +
        '<div class="uch-ust">' +
          '<span>Bosqich <b id="us-bosqich">1/8</b></span>' +
          '<span>Ochko <b id="us-ochko">0</b></span>' +
        '</div>' +
        '<p class="uch-maslahat" id="us-maslahat">Boshlash tugmasini bosing</p>' +
      '</div>' +
      '<div id="us-ogitlar" style="display:none;margin-top:14px">' +
        '<p style="margin:0 0 8px;font-family:inherit;font-size:14px;font-weight:700;color:#4A4038" ' +
          'id="us-ogit-savol">Ustoz shogirdga qaysi o‘gitni aytadi?</p>' +
        '<div style="display:flex;flex-direction:column;gap:8px" id="us-ogit-tugmalar"></div>' +
      '</div>' +
      '<div class="oyin-tugmalar">' +
        '<button type="button" class="tug tug-asos tug-kichik" id="us-boshla">▶ Boshlash</button>' +
        '<button type="button" class="tug tug-ramka tug-kichik" id="us-qayta">↻ Qaytadan</button>' +
      '</div>' +
      '<p id="us-izoh" style="margin:14px 0 0;padding:12px 16px;border-radius:12px;' +
        'background:#F7EFE1;border:1px solid rgba(26,22,20,.10);font-size:14.5px;' +
        'line-height:1.6;color:#4A4038;min-height:3.2em">' +
        'Maktab hujrasi tayyor. «Boshlash» tugmasini bosing — ustoz birinchi ' +
        'vazifasini aytadi.</p>';

    const canvas    = idish.querySelector('.uch-canvas');
    const maslahatE = idish.querySelector('#us-maslahat');
    const bosqichE  = idish.querySelector('#us-bosqich');
    const ochkoE    = idish.querySelector('#us-ochko');
    const izohE     = idish.querySelector('#us-izoh');
    const ogitBlok  = idish.querySelector('#us-ogitlar');
    const ogitTugmalar = idish.querySelector('#us-ogit-tugmalar');

    function xabar(m) { maslahatE.textContent = m; }
    function izoh(m) { izohE.innerHTML = m; }

    /* ---------------- Sahna asoslari ---------------- */
    const sahna = new THREE.Scene();
    sahna.background = new THREE.Color(0xEFE0C4);
    sahna.fog = new THREE.Fog(0xEFE0C4, 18, 40);

    const kamera = new THREE.PerspectiveCamera(44, 16 / 10, 0.1, 120);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    sahna.add(new THREE.HemisphereLight(0xFFF3DC, 0xB9915F, 1.05));
    const quyosh = new THREE.DirectionalLight(0xFFEFCF, 1.45);
    quyosh.position.set(5.5, 12, 8);
    quyosh.castShadow = true;
    quyosh.shadow.mapSize.set(1536, 1536);
    quyosh.shadow.camera.left = -12; quyosh.shadow.camera.right = 12;
    quyosh.shadow.camera.top = 12;   quyosh.shadow.camera.bottom = -12;
    quyosh.shadow.camera.far = 38;
    quyosh.shadow.bias = -0.0008;
    sahna.add(quyosh);
    const derazaNur = new THREE.DirectionalLight(0xC9A87A, 0.28);
    derazaNur.position.set(-7, 4, -5);
    sahna.add(derazaNur);

    /* ---------------- Pol: bo‘yra va gilam ---------------- */
    const pol = new THREE.Mesh(
      new THREE.BoxGeometry(24, 0.4, 20),
      new THREE.MeshStandardMaterial({ color: 0xC9A87A, roughness: 0.94 })
    );
    pol.position.set(0, -0.2, -2);
    pol.receiveShadow = true;
    sahna.add(pol);

    // Bo‘yra — qamish to‘qimasi
    const boyra = new THREE.Mesh(
      new THREE.BoxGeometry(15, 0.05, 12),
      new THREE.MeshStandardMaterial({ color: 0xD9BE86, roughness: 0.96 })
    );
    boyra.position.set(0, 0.025, -1.4);
    boyra.receiveShadow = true;
    sahna.add(boyra);
    for (let i = 0; i < 24; i++) {
      const ip = new THREE.Mesh(
        new THREE.BoxGeometry(15, 0.012, 0.10),
        new THREE.MeshStandardMaterial({ color: 0xC2A469, roughness: 0.95 })
      );
      ip.position.set(0, 0.053, -7.2 + i * 0.5);
      sahna.add(ip);
    }

    // Markaziy gilam
    const gilam = new THREE.Mesh(
      new THREE.BoxGeometry(9.4, 0.05, 6.4),
      new THREE.MeshStandardMaterial({ color: 0x8C3A2B, roughness: 0.96 })
    );
    gilam.position.set(0, 0.07, -2.4);
    gilam.receiveShadow = true;
    sahna.add(gilam);
    // Gilam jiyagi va naqshi
    for (const p of [[0, 3.05], [0, -3.05]]) {
      const j = new THREE.Mesh(new THREE.BoxGeometry(9.4, 0.055, 0.30),
        new THREE.MeshStandardMaterial({ color: 0xD4A24C, roughness: 0.9 }));
      j.position.set(p[0], 0.075, -2.4 + p[1]);
      sahna.add(j);
    }
    for (const x of [-4.55, 4.55]) {
      const j = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.055, 6.4),
        new THREE.MeshStandardMaterial({ color: 0xD4A24C, roughness: 0.9 }));
      j.position.set(x, 0.075, -2.4);
      sahna.add(j);
    }
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 4; j++) {
        const romb = new THREE.Mesh(new THREE.OctahedronGeometry(0.28),
          new THREE.MeshStandardMaterial({ color: 0xE3C98F, roughness: 0.9 }));
        romb.scale.set(0.75, 0.06, 1);
        romb.position.set(-3.9 + i * 1.3, 0.078, -4.3 + j * 1.28);
        sahna.add(romb);
      }
    }

    /* ---------------- Orqa devor va tokchalar ---------------- */
    const devor = new THREE.Mesh(
      new THREE.BoxGeometry(17, 6.4, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xE8DCC4, roughness: 0.95 })
    );
    devor.position.set(0, 3.2, -8.6);
    devor.receiveShadow = true;
    sahna.add(devor);

    // Devor ostidagi to‘q panel
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(17, 1.0, 0.56),
      new THREE.MeshStandardMaterial({ color: 0xC9A87A, roughness: 0.9 })
    );
    panel.position.set(0, 0.5, -8.58);
    sahna.add(panel);

    // Ganch o‘yma tokchalar — ichida kitoblar
    for (let i = 0; i < 5; i++) {
      const x = -5.6 + i * 2.8;
      const tokchaIch = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 2.0, 0.30),
        new THREE.MeshStandardMaterial({ color: 0xD6C6A6, roughness: 0.95 })
      );
      tokchaIch.position.set(x, 2.5, -8.42);
      sahna.add(tokchaIch);

      // Ravoq (yarim doira)
      const ravoq = new THREE.Mesh(
        new THREE.TorusGeometry(0.76, 0.10, 8, 22, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0xF2E9D6, roughness: 0.85 })
      );
      ravoq.position.set(x, 3.5, -8.30);
      sahna.add(ravoq);
      for (const yon of [-1, 1]) {
        const ustun = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.0, 0.14),
          new THREE.MeshStandardMaterial({ color: 0xF2E9D6, roughness: 0.85 }));
        ustun.position.set(x + yon * 0.80, 2.5, -8.30);
        sahna.add(ustun);
      }

      // Tokchadagi kitoblar (uyum)
      const rang = [0x8C3A2B, 0x1B3B6F, 0x2F6B45, 0x6E5334];
      for (let k = 0; k < 3; k++) {
        const kitob = new THREE.Mesh(
          new THREE.BoxGeometry(0.95, 0.16, 0.60),
          new THREE.MeshStandardMaterial({ color: rang[(i + k) % 4], roughness: 0.7 })
        );
        kitob.position.set(x + (k % 2 ? 0.05 : -0.04), 1.66 + k * 0.17, -8.38);
        kitob.rotation.y = (k % 2 ? 0.06 : -0.05);
        kitob.castShadow = true;
        sahna.add(kitob);
      }
    }

    /* ---------------- Modelni sahnaga moslash ---------------- */
    function modelOl(kutubxona, kalit, olcham) {
      const ro = KUTUB[kutubxona];
      const yozuv = ro && ro[kalit];
      if (!yozuv) return null;
      const m = yozuv.yasa();
      const q = new THREE.Box3().setFromObject(m);
      const o = q.getSize(new THREE.Vector3());
      const eng = Math.max(o.x, o.y, o.z) || 1;
      m.scale.setScalar(olcham / eng);
      m.traverse(function (x) { if (x.isMesh) { x.castShadow = true; x.receiveShadow = true; } });
      return m;
    }

    /* ---------------- Ustoz, ko‘rpacha, shogird ---------------- */
    const korpacha = modelOl('maktab', 'korpacha', 2.7);
    if (korpacha) { korpacha.position.set(0, 0.09, -5.5); sahna.add(korpacha); }

    const ustoz = modelOl('maktab', 'ustoz', 2.6);
    if (ustoz) { ustoz.position.set(0, 0.28, -5.55); sahna.add(ustoz); }

    const shogird = modelOl('maktab', 'shogird', 1.95);
    if (shogird) {
      shogird.position.set(-1.05, 0.09, -2.55);
      shogird.rotation.y = 2.75;                 // ustozga qaragan, tomoshabinga yarim yuz
      sahna.add(shogird);
    }

    // Shogird oldidagi kichik ko‘rpacha
    const korpacha2 = modelOl('maktab', 'korpacha', 1.9);
    if (korpacha2) {
      korpacha2.position.set(-1.05, 0.09, -2.55);
      korpacha2.rotation.y = 2.75;
      sahna.add(korpacha2);
    }

    /* ---------------- Ustaxona burchagi: sandon + bolg‘a izi ---------------- */
    const sandon = modelOl('maktab', 'sandon', 2.2);
    if (sandon) { sandon.position.set(5.6, 0.06, -4.6); sandon.rotation.y = -0.5; sahna.add(sandon); }

    // Ustaxona o‘chog‘i — ko‘mir va gulxan
    const ochoq = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.95, 0.55, 18),
      new THREE.MeshStandardMaterial({ color: 0x5A4A3C, roughness: 0.95 })
    );
    ochoq.position.set(7.6, 0.27, -6.2);
    ochoq.castShadow = true; ochoq.receiveShadow = true;
    sahna.add(ochoq);
    const komir = new THREE.Mesh(
      new THREE.SphereGeometry(0.62, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xC1502E, roughness: 0.65,
                                       emissive: 0xC1502E, emissiveIntensity: 0.55 })
    );
    komir.scale.y = 0.35;
    komir.position.set(7.6, 0.55, -6.2);
    sahna.add(komir);
    const ochoqNur = new THREE.PointLight(0xFF9A4A, 0.75, 8);
    ochoqNur.position.set(7.6, 1.0, -6.2);
    sahna.add(ochoqNur);

    /* ---------------- Raxt (buyumlar turadigan javon) ---------------- */
    const raxt = new THREE.Group();
    const RAXT_Z = 2.4;
    const RAXT_KENG = 12.4;

    const raxtTaxta = new THREE.Mesh(
      new THREE.BoxGeometry(RAXT_KENG, 0.22, 1.9),
      new THREE.MeshStandardMaterial({ color: 0x8A6A44, roughness: 0.8 })
    );
    raxtTaxta.position.set(0, 0.62, RAXT_Z);
    raxtTaxta.castShadow = true; raxtTaxta.receiveShadow = true;
    raxt.add(raxtTaxta);

    const raxtJiyak = new THREE.Mesh(
      new THREE.BoxGeometry(RAXT_KENG, 0.10, 0.10),
      new THREE.MeshStandardMaterial({ color: 0xD4A24C, roughness: 0.55, metalness: 0.3 })
    );
    raxtJiyak.position.set(0, 0.70, RAXT_Z + 0.95);
    raxt.add(raxtJiyak);

    for (const x of [-5.8, -1.95, 1.95, 5.8]) {
      const oyoq = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.62, 1.6),
        new THREE.MeshStandardMaterial({ color: 0x6E5334, roughness: 0.85 })
      );
      oyoq.position.set(x, 0.31, RAXT_Z);
      oyoq.castShadow = true; oyoq.receiveShadow = true;
      raxt.add(oyoq);
    }
    sahna.add(raxt);

    /* ---------------- Buyumlarni raxtga joylashtirish ---------------- */
    const buyumlar = [];
    BUYUMLAR.forEach(function (b, i) {
      const guruh = new THREE.Group();
      const x = (i - (BUYUMLAR.length - 1) / 2) * 1.60;
      const y = 0.73, z = RAXT_Z;
      guruh.position.set(x, y, z);

      // Yorishuvchi halqa
      const halqaMat = new THREE.MeshStandardMaterial({
        color: 0xD4A24C, emissive: 0xC1502E, emissiveIntensity: 0,
        roughness: 0.4, metalness: 0.4, transparent: true, opacity: 0.92
      });
      const halqa = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.05, 10, 30), halqaMat);
      halqa.rotation.x = -Math.PI / 2;
      halqa.position.y = 0.012;
      halqa.visible = false;
      guruh.add(halqa);

      const model = modelOl(b.kutubxona, b.model, b.olcham);
      const tashuvchi = new THREE.Group();
      if (model) tashuvchi.add(model);
      guruh.add(tashuvchi);

      guruh.userData = {
        tur: 'buyum', malumot: b, index: i,
        uy: new THREE.Vector3(x, y, z),
        tashuvchi: tashuvchi, halqa: halqa, halqaMat: halqaMat,
        silkinish: 0, aylan: 0
      };
      sahna.add(guruh);
      buyumlar.push(guruh);
    });

    /* ---------------- Kamera ---------------- */
    let burchakY = 0, burchakX = 0.335, masofa = 12.4;
    const nishon = new THREE.Vector3(0, 1.15, -1.6);
    function kameraniJoyla() {
      burchakX = Math.max(0.14, Math.min(0.80, burchakX));
      burchakY = Math.max(-0.65, Math.min(0.65, burchakY));
      masofa = Math.max(9, Math.min(19, masofa));
      kamera.position.set(
        nishon.x + Math.sin(burchakY) * Math.cos(burchakX) * masofa,
        nishon.y + Math.sin(burchakX) * masofa,
        nishon.z + Math.cos(burchakY) * Math.cos(burchakX) * masofa
      );
      kamera.lookAt(nishon);
    }
    kameraniJoyla();

    /* ====================================================================
       O‘YIN MANTIQI
       ==================================================================== */
    const JAMI = BOSQICHLAR.length;
    let tartib = [];       // aralashtirilgan bosqich indekslari
    let n = 0;             // joriy bosqich
    let ochko = 0;
    let holat = 'tayyor';  // tayyor | buyum | ogit | oraliq | tugadi
    let uchuvchi = null;   // shogirdga uchayotgan buyum
    const navbat = [];

    function kechik(s, ish) { navbat.push({ qoldi: s, ish: ish }); }
    function navbatTozala() { navbat.length = 0; }

    function aralashtir(a) {
      const r = a.slice();
      for (let i = r.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = r[i]; r[i] = r[j]; r[j] = t;
      }
      return r;
    }

    function buyumIndeks(kalit) {
      for (let i = 0; i < BUYUMLAR.length; i++) if (BUYUMLAR[i].kalit === kalit) return i;
      return -1;
    }

    function ochkoQosh(k) {
      ochko = Math.max(0, ochko + k);
      ochkoE.textContent = ochko;
    }

    function boshla() {
      navbatTozala();
      ogitBlok.style.display = 'none';
      tartib = aralashtir(BOSQICHLAR.map(function (_, i) { return i; }));
      n = 0; ochko = 0;
      ochkoE.textContent = '0';
      buyumlar.forEach(function (G) {
        G.position.copy(G.userData.uy);
        G.userData.halqa.visible = false;
        G.userData.halqaMat.emissiveIntensity = 0;
        G.userData.tashuvchi.rotation.set(0, 0, 0);
      });
      bosqichSorash();
    }

    function bosqichSorash() {
      if (n >= JAMI) { yakun(); return; }
      holat = 'buyum';
      ogitBlok.style.display = 'none';
      bosqichE.textContent = (n + 1) + '/' + JAMI;
      const B = BOSQICHLAR[tartib[n]];
      xabar(B.savol);
      izoh('<b>Ustoz:</b> ' + B.savol + ' — raxtdagi kerakli buyumni bosing.');
    }

    function buyumBosildi(index) {
      if (holat !== 'buyum') return;
      const B = BOSQICHLAR[tartib[n]];
      const kerak = buyumIndeks(B.kalit);
      const G = buyumlar[index];

      if (index === kerak) {
        ochkoQosh(2);
        holat = 'oraliq';
        G.userData.halqa.visible = true;
        G.userData.halqaMat.emissiveIntensity = 1.2;
        xabar('To‘g‘ri — ' + BUYUMLAR[index].nom + '!');
        izoh('<b>' + BUYUMLAR[index].nom + '.</b> ' + B.togriIzoh);

        // Buyum shogird qo‘liga uchadi
        uchuvchi = {
          guruh: G, t: 0, dav: kamHarakat ? 0.01 : 0.85,
          bosh: G.position.clone(),
          nishon: new THREE.Vector3(-1.05, 1.35, -1.95)
        };
        kechik(kamHarakat ? 0.1 : 1.0, ogitSorash);
      } else {
        ochkoQosh(-1);
        G.userData.silkinish = 1;
        xabar('Bu emas — yana o‘ylab ko‘ring.');
        izoh('<b>' + BUYUMLAR[index].nom + '</b> bu vazifaga to‘g‘ri kelmaydi. ' +
             '<b>Ustoz:</b> ' + B.savol);
      }
    }

    /* ---------------- O‘git bosqichi ---------------- */
    function ogitSorash() {
      holat = 'ogit';
      const B = BOSQICHLAR[tartib[n]];
      const variantlar = aralashtir([B.ogitTogri].concat(B.ogitXato));

      ogitTugmalar.innerHTML = '';
      variantlar.forEach(function (matn) {
        const t = document.createElement('button');
        t.type = 'button';
        t.className = 'tug tug-ramka tug-kichik';
        t.style.textAlign = 'left';
        t.style.width = '100%';
        t.textContent = matn;
        t.addEventListener('click', function () { ogitTanlandi(matn, t); });
        ogitTugmalar.appendChild(t);
      });
      ogitBlok.style.display = '';
      xabar('Ustoz qaysi o‘gitni aytadi?');
      izoh('<b>Endi o‘git:</b> shogirdga aytiladigan to‘g‘ri xalq maqolini tanlang. ' +
           'Uchala maqol ham 13-modul matnidan olingan.');
    }

    function ogitTanlandi(matn, tugma) {
      if (holat !== 'ogit') return;
      holat = 'oraliq';
      const B = BOSQICHLAR[tartib[n]];
      const togri = (matn === B.ogitTogri);

      Array.prototype.forEach.call(ogitTugmalar.children, function (t) {
        t.disabled = true;
        if (t.textContent === B.ogitTogri) {
          t.style.background = '#2F6B45'; t.style.color = '#fff';
          t.style.borderColor = '#2F6B45';
        } else if (t === tugma) {
          t.style.background = '#C1502E'; t.style.color = '#fff';
          t.style.borderColor = '#C1502E';
        }
      });

      if (togri) {
        ochkoQosh(3);
        xabar('Barakalla! O‘git to‘g‘ri.');
        izoh('<b>' + B.ogitTogri + '</b> — ' + B.ogitIzoh +
             ' Shogird ustozga ta’zim qildi.');
        if (shogird) shogird.userData.tazim = 1;
      } else {
        xabar('O‘git noto‘g‘ri tanlandi.');
        izoh('To‘g‘ri o‘git: <b>' + B.ogitTogri + '</b> — ' + B.ogitIzoh);
      }

      kechik(kamHarakat ? 0.4 : 2.2, function () {
        // Buyum joyiga qaytadi
        const kerak = buyumIndeks(B.kalit);
        const G = buyumlar[kerak];
        if (G) {
          uchuvchi = {
            guruh: G, t: 0, dav: kamHarakat ? 0.01 : 0.6,
            bosh: G.position.clone(), nishon: G.userData.uy.clone(), qaytish: true
          };
        }
        ogitBlok.style.display = 'none';
        n++;
        kechik(kamHarakat ? 0.05 : 0.65, bosqichSorash);
      });
    }

    /* ---------------- Yakun ---------------- */
    function yakun() {
      holat = 'tugadi';
      const eng = JAMI * 5;
      const foiz = Math.round((ochko / eng) * 100);
      bosqichE.textContent = JAMI + '/' + JAMI;
      xabar('O‘yin tugadi — natija ' + foiz + '%');

      const baho = foiz >= 85
        ? 'A’lo! Siz ustoz-shogird an’anasining mohiyatini yaxshi tushungansiz.'
        : foiz >= 60
        ? 'Yaxshi natija. Ba’zi o‘gitlarni matndan qayta ko‘rib chiqing.'
        : 'Hozircha qiyin bo‘ldi. 13-modul matnini o‘qib, yana urinib ko‘ring.';

      izoh('<b>Natija: ' + foiz + '%</b> — ' + eng + ' ochkodan ' + ochko +
           ' tasini oldingiz. ' + baho +
           ' Qaytadan o‘ynash uchun «↻ Qaytadan» tugmasini bosing.');

      try {
        if (window.Xotira && window.Xotira.modulYoz) {
          window.Xotira.modulYoz(13, { oyin3d: foiz });
        }
      } catch (e) {}
    }

    /* ---------------- Bosish ---------------- */
    const nur = new THREE.Raycaster();
    const nuqta = new THREE.Vector2();
    let sudralmoqda = false, sudraldi = false, oxX = 0, oxY = 0;

    function ildizTop(obj) {
      let o = obj;
      while (o) { if (o.userData && o.userData.tur) return o; o = o.parent; }
      return null;
    }

    canvas.addEventListener('pointerdown', function (e) {
      sudralmoqda = true; sudraldi = false;
      oxX = e.clientX; oxY = e.clientY;
      try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!sudralmoqda) return;
      const dx = e.clientX - oxX, dy = e.clientY - oxY;
      if (Math.abs(dx) + Math.abs(dy) > 6) sudraldi = true;
      burchakY -= dx * 0.005;
      burchakX += dy * 0.004;
      oxX = e.clientX; oxY = e.clientY;
      kameraniJoyla();
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) {
      canvas.addEventListener(t, function (e) {
        if (t === 'pointerup' && sudralmoqda && !sudraldi) bosildi(e);
        sudralmoqda = false;
      });
    });
    canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      masofa += e.deltaY * 0.006;
      kameraniJoyla();
    }, { passive: false });

    function bosildi(e) {
      const r = canvas.getBoundingClientRect();
      nuqta.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      nuqta.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      nur.setFromCamera(nuqta, kamera);
      const kes = nur.intersectObjects(buyumlar, true);
      if (!kes.length) return;
      const ildiz = ildizTop(kes[0].object);
      if (ildiz && ildiz.userData.tur === 'buyum') buyumBosildi(ildiz.userData.index);
    }

    /* ---------------- Tugmalar ---------------- */
    idish.querySelector('#us-boshla').addEventListener('click', boshla);
    idish.querySelector('#us-qayta').addEventListener('click', boshla);

    /* ---------------- O‘lcham va render ---------------- */
    function olcham() {
      const w = idish.clientWidth || 640;
      const h = Math.min(Math.round(w * 0.62), 560);
      renderer.setSize(w, h, false);
      kamera.aspect = w / h;
      kamera.updateProjectionMatrix();
    }
    olcham();
    if (window.ResizeObserver) new ResizeObserver(olcham).observe(idish);
    else window.addEventListener('resize', olcham);

    function yumshoq(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

    let ishlayapti = false, oxirgi = 0, umumiy = 0;

    function halqa(vaqt) {
      if (!ishlayapti) return;
      const dt = Math.min((vaqt - oxirgi) / 1000, 0.05);
      oxirgi = vaqt;
      umumiy += dt;

      for (let i = 0; i < navbat.length; i++) navbat[i].qoldi -= dt;
      while (navbat.length && navbat[0].qoldi <= 0) {
        const v = navbat.shift();
        try { v.ish(); } catch (e) {}
      }

      /* --- Uchayotgan buyum --- */
      if (uchuvchi) {
        uchuvchi.t += dt;
        const p = Math.min(uchuvchi.t / uchuvchi.dav, 1);
        const e = yumshoq(p);
        const g = uchuvchi.guruh;
        g.position.lerpVectors(uchuvchi.bosh, uchuvchi.nishon, e);
        g.position.y += Math.sin(p * Math.PI) * 1.1;
        g.userData.tashuvchi.rotation.y = e * Math.PI * (uchuvchi.qaytish ? -2 : 2);
        if (p >= 1) {
          g.userData.tashuvchi.rotation.y = 0;
          if (uchuvchi.qaytish) {
            g.userData.halqa.visible = false;
            g.userData.halqaMat.emissiveIntensity = 0;
          }
          uchuvchi = null;
        }
      }

      /* --- Buyumlarning nafis aylanishi va xato silkinishi --- */
      buyumlar.forEach(function (G, i) {
        const u = G.userData;
        if (u.silkinish > 0) {
          u.silkinish = Math.max(0, u.silkinish - dt * 2.6);
          G.position.x = u.uy.x + Math.sin(umumiy * 40) * u.silkinish * 0.13;
          if (u.silkinish === 0) G.position.x = u.uy.x;
        }
        if (!kamHarakat && holat === 'buyum') {
          u.tashuvchi.rotation.y = Math.sin(umumiy * 0.5 + i) * 0.25;
        }
      });

      /* --- Shogird ta’zimi --- */
      if (shogird) {
        const u = shogird.userData;
        if (u.tazim > 0) {
          u.tazim = Math.max(0, u.tazim - dt * 0.85);
          shogird.rotation.x = -Math.sin(u.tazim * Math.PI) * 0.30;
        } else shogird.rotation.x = 0;
      }
      /* --- Ustozning yengil nafas olishi --- */
      if (ustoz && !kamHarakat) {
        ustoz.position.y = 0.28 + Math.sin(umumiy * 1.3) * 0.012;
        ustoz.rotation.y = Math.sin(umumiy * 0.35) * 0.05;
      }
      /* --- O‘choq alangasi --- */
      if (!kamHarakat) {
        komir.material.emissiveIntensity = 0.45 + Math.sin(umumiy * 6.2) * 0.14;
        ochoqNur.intensity = 0.65 + Math.sin(umumiy * 5.1) * 0.18;
      }

      renderer.render(sahna, kamera);
      requestAnimationFrame(halqa);
    }

    function yoq() {
      if (ishlayapti) return;
      ishlayapti = true; oxirgi = performance.now();
      requestAnimationFrame(halqa);
    }
    function ochir() { ishlayapti = false; }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (y) {
        y[0].isIntersecting ? yoq() : ochir();
      }, { threshold: 0.02 }).observe(idish);
    } else { yoq(); }
    yoq();

    window.addEventListener('pagehide', function () {
      ochir();
      try { renderer.dispose(); } catch (e) {}
    });

    xabar('«Boshlash» tugmasini bosing');
  }
})();
