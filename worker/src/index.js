/**
 * «Xalq pedagogikasi» elektron darsligi — Telegram bot.
 * Cloudflare Workers uchun (ES modules, webhook usuli).
 *
 * Vazifalari:
 *   1. Talabalarni ro'yxatdan o'tkazish (ism, familiya, telefon, rasm,
 *      o'qish joyi, kurs, yo'nalish) — suhbat holati KV'da saqlanadi.
 *   2. Darslikdagi test va o'yin natijalarini Telegram Mini App'dan
 *      (`Telegram.WebApp.sendData`) qabul qilish, saqlash va darhol
 *      muallifga yuborish.
 *   3. Rollar: MUALLIF (natijalarni ko'radi) va SUPER ADMIN (botni
 *      yoqadi/o'chiradi, saytni muzlatadi, statistika va eksport).
 *
 * XAVFSIZLIK:
 *   - Bot tokeni hech qachon kodda saqlanmaydi — faqat `env.TG_TOKEN`.
 *   - Webhook `X-Telegram-Bot-Api-Secret-Token` sarlavhasi bilan himoyalangan.
 *   - Foydalanuvchi kiritgan har qanday matn HTML'ga qalqonlanadi.
 *
 * Tashqi kutubxona ishlatilmaydi — faqat Workers'ning o'z `fetch` API si.
 */

/* =====================================================================
 *  1-BO'LIM. KONSTANTALAR
 * ===================================================================== */

/** Modul raqami → modul nomi (darslikdagi 14 ta modul). */
const MODUL_NOMLARI = {
  1: "Xalq pedagogikasi fanining maqsad va vazifalari, mazmuni",
  2: "Xalq pedagogikasining didaktik imkoniyatlarini o'quv-tarbiyaviy jarayonga tadbiq etish",
  3: "Xalq pedagogikasida oila va oilaviy tarbiyaning aks etishi",
  4: "Xalq pedagogikasida yoshlarni tarbiyalashning metod, usul va vositalari",
  5: "Xalq pedagogikasi va o'zbek xalq og'zaki ijodi",
  6: "Xalq pedagogikasi va xalq og'zaki ijodida dostonlar",
  7: "Xalq pedagogikasida milliy urf-odatlar, an'analar, udumlar, marosimlarning tarbiya vositasi sifatidagi o'rni",
  8: "Xalq pedagogikasida milliy o'yinlarning mazmuni va tarbiyaviy ahamiyati",
  9: "Xalq pedagogikasida diniy ta'limotlar",
  10: "Xalq pedagogikasida xalq amaliy san'ati va madaniyatining o'rni",
  11: "O'zbek xalqining muomala madaniyati, axloqiy me'yorlari, turmush kechirish tartib-qoidalarining tarbiyaviy ahamiyati",
  12: "Milliy musiqa, qo'shiqchilik va milliy teatrlar xalq pedagogikasining tarbiya vositasi sifatida",
  13: "Xalq pedagogikasi manbalarida ustoz-o'qituvchi kasbining ulug'lanishi",
  14: "Xalq tarbiya nazariyasida tabiatni muhofaza qilish va sog'lom turmush masalalari",
};

/** Toshkent vaqti — UTC+5. */
const TOSHKENT_SOAT = 5;

/** Suhbat holati KV'da shuncha soniya saqlanadi (2 soat). */
const HOLAT_MUDDATI = 7200;

/** Bitta Telegram xabarining xavfsiz uzunligi. */
const XABAR_UZUNLIGI = 3500;

/** Ism-familiyada ruxsat etilgan qo'shimcha belgilar. */
const QOSHIMCHA_BELGILAR = " -'ʼ‘’`";

/** Ro'yxatdan o'tish qadamlari — ketma-ketligi shu tartibda. */
const QADAMLAR = [
  "ism",
  "familiya",
  "telefon",
  "rasm",
  "oqish_joyi",
  "kurs",
  "yonalish",
];

/* =====================================================================
 *  2-BO'LIM. UMUMIY YORDAMCHI FUNKSIYALAR
 * ===================================================================== */

/**
 * HTML uchun xavfli belgilarni almashtiradi.
 * Foydalanuvchi kiritgan HAR QANDAY matn shu funksiyadan o'tkaziladi.
 */
function qalqon(matn) {
  if (matn === null || matn === undefined || matn === "") return "—";
  return String(matn)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Toshkent vaqti bo'yicha «YYYY-MM-DD HH:MM» ko'rinishidagi sana. */
function hozir(sana) {
  const vaqt = new Date((sana ? sana.getTime() : Date.now()) + TOSHKENT_SOAT * 3600000);
  const ikki = (son) => String(son).padStart(2, "0");
  return (
    `${vaqt.getUTCFullYear()}-${ikki(vaqt.getUTCMonth() + 1)}-${ikki(vaqt.getUTCDate())}` +
    ` ${ikki(vaqt.getUTCHours())}:${ikki(vaqt.getUTCMinutes())}`
  );
}

/** Faqat sana (fayl nomi uchun). */
function bugun() {
  return hozir().slice(0, 10);
}

/** Matnni belgilangan uzunlikkacha qisqartiradi (KV metama'lumoti uchun). */
function qisqart(matn, uzunlik) {
  const tozalangan = String(matn === null || matn === undefined ? "" : matn);
  return tozalangan.length > uzunlik ? tozalangan.slice(0, uzunlik) : tozalangan;
}

/** Har bir so'zning bosh harfini kattalashtiradi. */
function bosh_harf(matn) {
  return String(matn)
    .split(/\s+/)
    .filter(Boolean)
    .map((soz) => soz.charAt(0).toLocaleUpperCase("uz") + soz.slice(1).toLocaleLowerCase("uz"))
    .join(" ");
}

/** Ikki sirni vaqt bo'yicha xavfsiz solishtiradi. */
function sirTeng(birinchi, ikkinchi) {
  const a = String(birinchi || "");
  const b = String(ikkinchi || "");
  if (a.length !== b.length || a.length === 0) return false;
  let farq = 0;
  for (let i = 0; i < a.length; i += 1) farq |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return farq === 0;
}

/** Sonni xavfsiz o'qiydi; son bo'lmasa null. */
function songa(qiymat) {
  if (qiymat === null || qiymat === undefined || qiymat === "") return null;
  const son = Number(qiymat);
  return Number.isFinite(son) ? son : null;
}

/* =====================================================================
 *  3-BO'LIM. TEKSHIRUVLAR (validatsiya)
 * ===================================================================== */

/** Ism yoki familiya to'g'ri kiritilganmi? (2–40 belgi, faqat harflar) */
function ismTogrimi(matn) {
  const tozalangan = String(matn || "").trim();
  if (tozalangan.length < 2 || tozalangan.length > 40) return false;
  let harfBor = false;
  for (const belgi of tozalangan) {
    const harfmi = /\p{L}/u.test(belgi);
    if (!harfmi && !QOSHIMCHA_BELGILAR.includes(belgi)) return false;
    if (harfmi) harfBor = true;
  }
  return harfBor;
}

/**
 * Telefon raqamini bir ko'rinishga keltiradi.
 * To'g'ri bo'lmasa null qaytaradi. Masalan: «901234567» → «+998901234567».
 */
function telefonniTozala(matn) {
  if (!matn) return null;
  let raqam = String(matn).replace(/[^\d+]/g, "");
  if (raqam.startsWith("00")) raqam = `+${raqam.slice(2)}`;
  const faqatRaqam = raqam.replace(/^\++/, "");
  if (!/^\d+$/.test(faqatRaqam)) return null;
  if (faqatRaqam.length < 9 || faqatRaqam.length > 15) return null;
  return `+${faqatRaqam.length === 9 ? `998${faqatRaqam}` : faqatRaqam}`;
}

/** «3», «3-kurs», «9-sinf» kabi javoblarni qabul qiladi. */
function kursniTekshir(matn) {
  const tozalangan = String(matn || "").trim();
  if (tozalangan.length < 1 || tozalangan.length > 20) return null;
  const moslik = tozalangan.match(/\d{1,2}/);
  if (!moslik) return null;
  const raqam = parseInt(moslik[0], 10);
  if (tozalangan.toLowerCase().includes("sinf")) {
    return raqam >= 1 && raqam <= 11 ? `${raqam}-sinf` : null;
  }
  if (raqam >= 1 && raqam <= 6) return `${raqam}-kurs`;
  if (raqam >= 7 && raqam <= 11) return `${raqam}-sinf`;
  return null;
}

/* =====================================================================
 *  4-BO'LIM. ROLLAR
 * ===================================================================== */

function adminMi(env, tgId) {
  return String(tgId) === String(env.ADMIN_ID || "");
}

/** Admin ham muallif huquqlariga ega (super admin). */
function muallifMi(env, tgId) {
  return String(tgId) === String(env.MUALLIF_ID || "") || adminMi(env, tgId);
}

/* =====================================================================
 *  5-BO'LIM. TELEGRAM API QATLAMI
 * ===================================================================== */

class Telegram {
  constructor(token) {
    this.asos = `https://api.telegram.org/bot${token}`;
  }

  /** Telegram API'ga JSON so'rov yuboradi; xato bo'lsa faqat logga yozadi. */
  async soro(metod, tana) {
    try {
      const javob = await fetch(`${this.asos}/${metod}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tana),
      });
      const natija = await javob.json();
      if (!natija.ok) {
        console.error(`Telegram ${metod} xatosi:`, natija.description || javob.status);
      }
      return natija;
    } catch (xato) {
      console.error(`Telegram ${metod} so'rovida xato:`, xato && xato.message);
      return { ok: false, description: String(xato) };
    }
  }

  yubor(chatId, matn, qoshimcha) {
    return this.soro("sendMessage", {
      chat_id: chatId,
      text: matn,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      ...(qoshimcha || {}),
    });
  }

  rasmYubor(chatId, rasmId, izoh, qoshimcha) {
    return this.soro("sendPhoto", {
      chat_id: chatId,
      photo: rasmId,
      caption: izoh,
      parse_mode: "HTML",
      ...(qoshimcha || {}),
    });
  }

  /** CSV kabi matnli faylni hujjat sifatida yuboradi. */
  async hujjatYubor(chatId, faylNomi, mazmun, izoh) {
    try {
      const forma = new FormData();
      forma.append("chat_id", String(chatId));
      if (izoh) forma.append("caption", izoh);
      // Boshiga BOM qo'yiladi — Excel lotin harflarni to'g'ri ko'rsatishi uchun.
      const bom = String.fromCharCode(0xfeff);
      const blob = new Blob([bom + mazmun], { type: "text/csv;charset=utf-8" });
      forma.append("document", blob, faylNomi);
      const javob = await fetch(`${this.asos}/sendDocument`, { method: "POST", body: forma });
      return await javob.json();
    } catch (xato) {
      console.error("Hujjat yuborishda xato:", xato && xato.message);
      return { ok: false, description: String(xato) };
    }
  }

  /** Uzun matnni Telegram cheklovi bo'yicha bo'lib yuboradi. */
  async uzunYubor(chatId, matn) {
    let bolak = "";
    for (const satr of String(matn).split("\n")) {
      if (bolak.length + satr.length + 1 > XABAR_UZUNLIGI) {
        if (bolak.trim()) await this.yubor(chatId, bolak);
        bolak = "";
      }
      bolak += `${satr}\n`;
    }
    if (bolak.trim()) await this.yubor(chatId, bolak);
  }
}

/* ---------- Klaviaturalar ---------- */

/** Telefon so'rash tugmasi. */
const TELEFON_TUGMA = {
  keyboard: [[{ text: "📞 Telefon raqamimni yuborish", request_contact: true }]],
  resize_keyboard: true,
  one_time_keyboard: true,
};

/** Kurs tanlash tugmalari. */
const KURS_TUGMA = {
  keyboard: [
    [{ text: "1-kurs" }, { text: "2-kurs" }, { text: "3-kurs" }],
    [{ text: "4-kurs" }, { text: "5-kurs" }, { text: "6-kurs" }],
  ],
  resize_keyboard: true,
  one_time_keyboard: true,
};

/** Klaviaturani olib tashlash. */
const TUGMANI_OCHIR = { remove_keyboard: true };

/**
 * Mini App tugmasi.
 * MUHIM: `sendData` faqat ReplyKeyboardMarkup ichidagi web_app tugmasida
 * ishlaydi (inline tugmada emas) — shuning uchun aynan shu ko'rinish.
 */
/* ---------- Tugma yozuvlari (bitta joyda saqlanadi) ---------- */
const T = {
  DARSLIK:    "📚 Darslikni ochish",
  NATIJAM:    "📊 Natijalarim",
  YORDAM:     "ℹ️ Yordam",

  // Muallif va super admin uchun umumiy
  JADVAL:     "🗂 Talabalar jadvali",
  TALABALAR:  "👥 Talabalar",
  NATIJALAR:  "📋 Natijalar",
  HISOBOT:    "📈 Hisobot",
  STATISTIKA: "📊 Statistika",
  EKSPORT:    "📥 CSV eksport",
  QIDIR:      "🔎 Talabani qidirish",

  // FAQAT super admin
  BOT_TOXTAT: "⏸ Botni to'xtatish",
  BOT_YOQ:    "▶️ Botni yoqish",
  SAYT_MUZLAT:"🧊 Saytni muzlatish",
  SAYT_OCH:   "🔓 Saytni ochish",
  SOZLA:      "⚙️ Menyularni sozlash",
};

/**
 * Rolga mos doimiy klaviatura.
 *
 * MUHIM: `sendData` faqat ReplyKeyboardMarkup ichidagi web_app tugmasida
 * ishlaydi (inline tugmada emas) — shuning uchun aynan shu ko'rinish.
 *
 * Super adminda botni va saytni to'xtatish/yoqish tugmalari bor,
 * muallifda esa YO'Q — unga faqat talabalar va natijalar tegishli.
 */
function darslikTugmasi(env, tgId, muzlat) {
  const manzil = String(env.WEBAPP_URL || "").trim();
  // Sayt muzlatilgan bo'lsa TALABAGA Mini App tugmasi berilmaydi —
  // darslikka kirish yo'li butunlay yopiladi. Rol egalarida qoladi,
  // chunki ular qulfni o'zi tekshirishi kerak.
  const rolli = tgId !== undefined && muallifMi(env, tgId);
  const ochish = manzil.startsWith("https://") && (rolli || !muzlat)
    ? [{ text: T.DARSLIK, web_app: { url: manzil } }]
    : null;

  // ---- Super admin ----
  if (tgId !== undefined && adminMi(env, tgId)) {
    const qatorlar = [];
    if (ochish) qatorlar.push(ochish);
    qatorlar.push(
      [{ text: T.BOT_TOXTAT }, { text: T.BOT_YOQ }],
      [{ text: T.SAYT_MUZLAT }, { text: T.SAYT_OCH }],
      [{ text: T.NATIJALAR }, { text: T.HISOBOT }],
      [{ text: T.TALABALAR }, { text: T.QIDIR }],
      [{ text: T.STATISTIKA }, { text: T.EKSPORT }],
      [{ text: T.JADVAL }, { text: T.SOZLA }],
      [{ text: T.YORDAM }]
    );
    return { keyboard: qatorlar, resize_keyboard: true, is_persistent: true };
  }

  // ---- Muallif (to'xtatish tugmalari YO'Q) ----
  if (tgId !== undefined && muallifMi(env, tgId)) {
    const qatorlar = [];
    if (ochish) qatorlar.push(ochish);
    qatorlar.push(
      [{ text: T.JADVAL }, { text: T.TALABALAR }],
      [{ text: T.NATIJALAR }, { text: T.HISOBOT }],
      [{ text: T.STATISTIKA }, { text: T.EKSPORT }],
      [{ text: T.QIDIR }, { text: T.YORDAM }]
    );
    return { keyboard: qatorlar, resize_keyboard: true, is_persistent: true };
  }

  // ---- Talaba ----
  const qatorlar = [];
  if (ochish) qatorlar.push(ochish);
  qatorlar.push([{ text: T.NATIJAM }, { text: T.YORDAM }]);
  return { keyboard: qatorlar, resize_keyboard: true, is_persistent: true };
}

/** Rolga va sayt holatiga mos klaviatura (muzlatishni o'zi tekshiradi). */
async function tugmalar(env, tgId) {
  let muzlat = false;
  try { muzlat = await muzlatilganmi(env); } catch (e) {}
  return darslikTugmasi(env, tgId, muzlat);
}

/** Matn doimiy klaviaturadagi tugmami? */
function tugmaMi(matn) {
  for (const kalit in T) if (T[kalit] === matn) return true;
  return false;
}

/* =====================================================================
 *  6-BO'LIM. MA'LUMOTLAR BAZASI (Cloudflare KV)
 *
 *  Kalitlar:
 *    t:<tg_id>            — talaba ma'lumoti (JSON)
 *    n:<tg_id>:<vaqt>     — bitta natija (JSON)
 *    holat:<tg_id>        — ro'yxatdan o'tish suhbatining holati
 *    sozlama:<nom>        — bot sozlamalari (masalan sozlama:bot_faol)
 * ===================================================================== */

const kalitTalaba = (tgId) => `t:${tgId}`;
const kalitHolat = (tgId) => `holat:${tgId}`;
const kalitSozlama = (nom) => `sozlama:${nom}`;

/** Talabaning ro'yxatlarda ko'rinadigan qisqa metama'lumoti (1 KB dan kichik). */
function talabaBelgisi(malumot) {
  return {
    ism: qisqart(malumot.ism, 40),
    familiya: qisqart(malumot.familiya, 40),
    telefon: qisqart(malumot.telefon, 20),
    oqish_joyi: qisqart(malumot.oqish_joyi, 80),
    kurs: qisqart(malumot.kurs, 20),
    yonalish: qisqart(malumot.yonalish, 80),
  };
}

/** Natijaning qisqa metama'lumoti — ro'yxatlarni tez chizish uchun. */
function natijaBelgisi(yozuv) {
  return {
    tg_id: yozuv.tg_id,
    ism: qisqart(yozuv.ism, 40),
    familiya: qisqart(yozuv.familiya, 40),
    modul: yozuv.modul,
    foiz: yozuv.foiz,
    togri: yozuv.togri,
    jami: yozuv.jami,
    tur: yozuv.tur,
    sana: yozuv.sana,
  };
}

async function talabaOq(env, tgId) {
  try {
    return await env.BAZA.get(kalitTalaba(tgId), "json");
  } catch (xato) {
    console.error("Talabani o'qishda xato:", xato && xato.message);
    return null;
  }
}

async function talabaSaqla(env, tgId, malumot) {
  await env.BAZA.put(kalitTalaba(tgId), JSON.stringify(malumot), {
    metadata: talabaBelgisi(malumot),
  });
}

/** Takrorlanmas qisqa qo'shimcha — bir zumda kelgan ikki natija to'qnashmasligi uchun. */
function tasodifiyQuyruq() {
  try {
    return crypto.randomUUID().slice(0, 6);
  } catch (xato) {
    return Math.random().toString(36).slice(2, 8);
  }
}

async function natijaSaqla(env, yozuv) {
  // Vaqt 14 xonaga to'ldiriladi — kalitlar vaqt bo'yicha to'g'ri saralanishi uchun.
  // Oxiriga tasodifiy quyruq qo'shiladi: bitta millisekundda kelgan ikki
  // natija bir-birining ustiga yozilib qolmasligi kerak.
  const vaqt = `${String(Date.now()).padStart(14, "0")}-${tasodifiyQuyruq()}`;
  const kalit = `n:${yozuv.tg_id}:${vaqt}`;
  await env.BAZA.put(kalit, JSON.stringify(yozuv), { metadata: natijaBelgisi(yozuv) });
  return kalit;
}

async function holatOq(env, tgId) {
  try {
    return await env.BAZA.get(kalitHolat(tgId), "json");
  } catch (xato) {
    console.error("Holatni o'qishda xato:", xato && xato.message);
    return null;
  }
}

async function holatYoz(env, tgId, holat) {
  await env.BAZA.put(kalitHolat(tgId), JSON.stringify(holat), {
    expirationTtl: HOLAT_MUDDATI,
  });
}

async function holatOchir(env, tgId) {
  try {
    await env.BAZA.delete(kalitHolat(tgId));
  } catch (xato) {
    console.error("Holatni o'chirishda xato:", xato && xato.message);
  }
}

async function sozlamaOq(env, nom, sukut) {
  try {
    const qiymat = await env.BAZA.get(kalitSozlama(nom));
    return qiymat === null || qiymat === undefined ? sukut : qiymat;
  } catch (xato) {
    console.error("Sozlamani o'qishda xato:", xato && xato.message);
    return sukut;
  }
}

async function sozlamaYoz(env, nom, qiymat) {
  try {
    await env.BAZA.put(kalitSozlama(nom), String(qiymat));
  } catch (xato) {
    console.error("Sozlamani yozishda xato:", xato && xato.message);
  }
}

/** Bot yoqilganmi? (admin /toxtat bilan o'chirib qo'yishi mumkin) */
async function botFaolmi(env) {
  return (await sozlamaOq(env, "bot_faol", "1")) !== "0";
}

/**
 * Berilgan prefiks bo'yicha barcha kalitlarni (metama'lumoti bilan) qaytaradi.
 * KV bir so'rovda 1000 tagacha kalit beradi — kursor bilan davom etamiz.
 */
async function kalitlarniOl(env, prefiks, maks) {
  const chegara = maks || 3000;
  const royxat = [];
  let kursor;
  try {
    for (let qadam = 0; qadam < 10; qadam += 1) {
      const javob = await env.BAZA.list({ prefix: prefiks, cursor: kursor, limit: 1000 });
      royxat.push(...javob.keys);
      if (javob.list_complete || royxat.length >= chegara) break;
      kursor = javob.cursor;
      if (!kursor) break;
    }
  } catch (xato) {
    console.error("KV ro'yxatini olishda xato:", xato && xato.message);
  }
  return royxat;
}

/**
 * Natija kalitidan vaqt (ms) ni ajratadi.
 * Kalit ko'rinishi: n:<tg_id>:<vaqt>-<tasodifiy quyruq>
 * parseInt tasodifiy quyruqqa yetganda to'xtaydi — shuning uchun xavfsiz.
 */
function kalitVaqti(kalit) {
  const bolaklar = String(kalit).split(":");
  return parseInt(bolaklar[2] || "0", 10) || 0;
}

/** Barcha natijalarni yangisidan eskisiga qarab qaytaradi. */
async function natijalarniOl(env, chegara) {
  const kalitlar = await kalitlarniOl(env, "n:");
  kalitlar.sort((a, b) => kalitVaqti(b.name) - kalitVaqti(a.name));
  const kesilgan = chegara ? kalitlar.slice(0, chegara) : kalitlar;
  return kesilgan.map((k) => ({ kalit: k.name, ...(k.metadata || {}) }));
}

/** Barcha talabalarni familiya bo'yicha saralab qaytaradi. */
async function talabalarniOl(env) {
  const kalitlar = await kalitlarniOl(env, "t:");
  const royxat = kalitlar.map((k) => ({
    tg_id: k.name.slice(2),
    ...(k.metadata || {}),
  }));
  royxat.sort((a, b) =>
    `${a.familiya || ""} ${a.ism || ""}`.localeCompare(`${b.familiya || ""} ${b.ism || ""}`, "uz")
  );
  return royxat;
}

/* =====================================================================
 *  7-BO'LIM. RO'YXATDAN O'TISH (/start suhbati)
 * ===================================================================== */

/** Har bir qadamning savoli va klaviaturasi. */
function qadamSavoli(qadam) {
  switch (qadam) {
    case "ism":
      return { matn: "1️⃣ <b>Ismingizni</b> yozing:", tugma: TUGMANI_OCHIR };
    case "familiya":
      return { matn: "2️⃣ <b>Familiyangizni</b> yozing:", tugma: TUGMANI_OCHIR };
    case "telefon":
      return {
        matn:
          "3️⃣ <b>Telefon raqamingizni</b> yuboring.\n\n" +
          "Pastdagi tugmani bosing yoki raqamni qo'lda yozing " +
          "(masalan: +998901234567).",
        tugma: TELEFON_TUGMA,
      };
    case "rasm":
      return {
        matn:
          "4️⃣ Endi <b>rasmingizni</b> yuboring (bitta surat).\n\n" +
          "Rasm hujjat (fayl) sifatida emas, oddiy surat sifatida yuborilishi kerak.",
        tugma: TUGMANI_OCHIR,
      };
    case "oqish_joyi":
      return {
        matn: "5️⃣ <b>O'qish joyingizni</b> yozing (muassasa to'liq nomi):",
        tugma: TUGMANI_OCHIR,
      };
    case "kurs":
      return {
        matn:
          "6️⃣ <b>Kursingizni</b> tanlang yoki yozing.\n\n" +
          "Oliy ta'lim uchun: 1–6-kurs. Maktab o'quvchisi bo'lsangiz " +
          "«9-sinf» kabi yozing.",
        tugma: KURS_TUGMA,
      };
    case "yonalish":
      return {
        matn:
          "7️⃣ <b>Ta'lim yo'nalishingizni</b> yozing\n" +
          "(masalan: Boshlang'ich ta'lim):",
        tugma: TUGMANI_OCHIR,
      };
    default:
      return { matn: "Savol topilmadi.", tugma: TUGMANI_OCHIR };
  }
}

/**
 * Qadamga kelgan javobni tekshiradi.
 * Natija: { qiymat } yoki { xato: "sabab" }.
 */
/* =====================================================================
 *  OQ RO'YXAT — faqat muallif kiritgan talabalar ro'yxatdan o'ta oladi.
 *
 *  Kalitlar:
 *    oq:t:<telefon>     — telefon bo'yicha ruxsat
 *    oq:i:<ism-familya> — ism-familiya bo'yicha ruxsat
 *    sozlama:oq         — "1" yoqilgan, "0" o'chirilgan
 * ===================================================================== */

/** Telefon raqamdan faqat oxirgi 9 raqamni oladi (O'zbekiston raqamlari). */
function telefonKalit(xom) {
  const raqamlar = String(xom || "").replace(/\D+/g, "");
  if (raqamlar.length < 7) return "";
  return raqamlar.slice(-9);
}

/** Ismni solishtirish uchun soddalashtiradi: kichik harf, apostroflarsiz. */
function ismKalit(xom) {
  return String(xom || "")
    .toLowerCase()
    .replace(/[\u2018\u2019\u02bb\u02bc'`\u00b4]/g, "")
    .replace(/[^a-z\u0400-\u04ff0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Ism va familiyani tartibdan qat'i nazar bir xil kalitga keltiradi. */
function juftKalit(birinchi, ikkinchi) {
  const sozlar = (ismKalit(birinchi) + " " + ismKalit(ikkinchi)).split(" ").filter(Boolean);
  if (sozlar.length === 0) return "";
  return sozlar.sort().join(" ");
}

/** Oq ro'yxat yoqilganmi? */
async function oqRoyxatFaolmi(env) {
  try {
    const q = await env.BAZA.get("sozlama:oq");
    if (q === "0") return false;
    if (q === "1") return true;
  } catch (xato) {
    console.error("Oq ro'yxat sozlamasi o'qilmadi:", xato && xato.message);
  }
  // Sozlama qo'yilmagan bo'lsa — ro'yxatda yozuv bo'lsa faol hisoblanadi.
  const bor = await kalitlarniOl(env, "oq:", 1);
  return bor.length > 0;
}

/** Ro'yxatdagi yozuvlar sonini qaytaradi. */
async function oqRoyxatSoni(env) {
  const kalitlar = await kalitlarniOl(env, "oq:t:");
  const ismlar = await kalitlarniOl(env, "oq:i:");
  return { telefon: kalitlar.length, ism: ismlar.length };
}

/**
 * Talaba ro'yxatda bormi? Telefon YOKI ism-familiya mos kelsa — ha.
 * Ro'yxat o'chirilgan bo'lsa hamma uchun ruxsat.
 */
async function oqRoyxatdaBormi(env, malumot) {
  if (!(await oqRoyxatFaolmi(env))) return true;
  try {
    const tk = telefonKalit(malumot.telefon);
    if (tk && (await env.BAZA.get("oq:t:" + tk)) !== null) return true;
    const ik = juftKalit(malumot.ism, malumot.familiya);
    if (ik && (await env.BAZA.get("oq:i:" + ik)) !== null) return true;
  } catch (xato) {
    console.error("Oq ro'yxat tekshiruvi xatosi:", xato && xato.message);
    return true; // xizmat uzilsa talabani to'sib qo'ymaymiz
  }
  return false;
}

/**
 * Matndagi satrlardan ro'yxat yasaydi.
 * Har bir satr: «Familiya Ism +998901234567» yoki «Familiya;Ism;+998…»
 * Telefon ham, ism ham bo'lishi shart emas — bittasi yetadi.
 */
function royxatSatrlariniTahlil(matn) {
  const natija = [];
  for (const xomSatr of String(matn || "").split(/\r?\n/)) {
    const satr = xomSatr.replace(/[;,\t|]+/g, " ").trim();
    if (!satr || satr.startsWith("#")) continue;
    const telMoslik = satr.match(/[+]?\d[\d\s()-]{6,}\d/);
    const telefon = telMoslik ? telefonKalit(telMoslik[0]) : "";
    const ismQismi = telMoslik ? satr.replace(telMoslik[0], " ") : satr;
    const sozlar = ismKalit(ismQismi).split(" ").filter(Boolean);
    const ism = sozlar.length >= 2 ? sozlar.sort().join(" ") : "";
    if (!telefon && !ism) continue;
    natija.push({ satr: satr.slice(0, 120), telefon, ism });
  }
  return natija;
}

/** Tahlil qilingan yozuvlarni bazaga yozadi. */
async function oqRoyxatgaQosh(env, yozuvlar) {
  let telefon = 0;
  let ism = 0;
  for (const y of yozuvlar) {
    if (y.telefon) {
      await env.BAZA.put("oq:t:" + y.telefon, y.satr);
      telefon += 1;
    }
    if (y.ism) {
      await env.BAZA.put("oq:i:" + y.ism, y.satr);
      ism += 1;
    }
  }
  return { telefon, ism };
}

/* ---------- Suratda odam bor-yo'qligini tekshirish ---------- */

/**
 * COCO yorliqlarining o'zbekcha nomlari — foydalanuvchiga tushunarli
 * xabar berish uchun (masalan: "suratda mushuk ko'rindi").
 */
const YORLIQ_UZBEKCHA = {
  cat: "mushuk", dog: "it", bird: "qush", horse: "ot", sheep: "qo'y",
  cow: "sigir", elephant: "fil", bear: "ayiq", zebra: "zebra",
  giraffe: "jirafa", car: "mashina", truck: "yuk mashinasi",
  bus: "avtobus", motorcycle: "mototsikl", bicycle: "velosiped",
  airplane: "samolyot", boat: "qayiq", train: "poyezd",
  "potted plant": "gul", "teddy bear": "qo'g'irchoq", book: "kitob",
  chair: "stul", couch: "divan", bed: "karavot", tv: "televizor",
  laptop: "noutbuk", "cell phone": "telefon", clock: "soat",
  bottle: "shisha", cup: "piyola", "dining table": "stol",
  pizza: "pitsa", cake: "tort", apple: "olma", banana: "banan",
  flower: "gul", vase: "vaza", umbrella: "soyabon",
};

/** Yorliqni o'zbekchaga o'giradi; tarjimasi bo'lmasa o'zini qaytaradi. */
function yorliqTarjima(yorliq) {
  const kalit = String(yorliq || "").toLowerCase();
  return YORLIQ_UZBEKCHA[kalit] || kalit;
}

/**
 * Telegram suratini yuklab olib, Cloudflare Workers AI (DETR-ResNet-50)
 * yordamida unda ODAM bor-yo'qligini aniqlaydi.
 *
 * Qaytadi:
 *   { odam: true }                    — suratda odam bor
 *   { odam: false, topilgan: [...] }  — odam yo'q, boshqa narsa ko'rindi
 *   { nomalum: true }                 — tekshirib bo'lmadi (ruxsat beriladi)
 *
 * MUHIM: tekshiruv ishlamay qolsa ro'yxatdan o'tish TO'XTAMAYDI —
 * surat qabul qilinadi, chunki xizmatning uzilishi talabaning aybi emas.
 */
async function suratdaOdamBormi(env, fileId) {
  if (!env.AI || !env.TG_TOKEN) return { nomalum: true };
  try {
    const fayl = await fetch(
      "https://api.telegram.org/bot" + env.TG_TOKEN +
        "/getFile?file_id=" + encodeURIComponent(fileId)
    ).then((r) => r.json());
    const yol = fayl && fayl.result && fayl.result.file_path;
    if (!yol) return { nomalum: true };

    const javob = await fetch(
      "https://api.telegram.org/file/bot" + env.TG_TOKEN + "/" + yol
    );
    if (!javob.ok) return { nomalum: true };

    const bufer = await javob.arrayBuffer();
    if (bufer.byteLength === 0 || bufer.byteLength > 5 * 1024 * 1024) {
      return { nomalum: true };
    }
    const bayt = [...new Uint8Array(bufer)];

    const natija = await env.AI.run("@cf/facebook/detr-resnet-50", { image: bayt });
    const topilganlar = Array.isArray(natija)
      ? natija
      : (natija && natija.result) || [];
    if (!Array.isArray(topilganlar) || topilganlar.length === 0) {
      return { odam: false, topilgan: [] };
    }

    let odamBalli = 0;
    const boshqalar = [];
    for (const t of topilganlar) {
      const ball = Number(t && t.score) || 0;
      if (ball < 0.55) continue;
      const yorliq = String((t && t.label) || "").toLowerCase();
      if (yorliq === "person") odamBalli = Math.max(odamBalli, ball);
      else boshqalar.push(yorliq);
    }
    if (odamBalli >= 0.55) return { odam: true };
    return { odam: false, topilgan: [...new Set(boshqalar)].slice(0, 3) };
  } catch (xato) {
    console.error("Rasm tekshiruvi xatosi:", xato && xato.message);
    return { nomalum: true };
  }
}

function qadamniTekshir(qadam, xabar) {
  const matn = (xabar.text || "").trim();

  if (qadam === "rasm") {
    if (!Array.isArray(xabar.photo) || xabar.photo.length === 0) {
      return {
        xato:
          "❌ Bu surat emas. Iltimos, rasmni <b>surat</b> sifatida " +
          "yuboring (fayl yoki matn emas).",
      };
    }
    // Eng katta o'lchamdagi suratning file_id si olinadi.
    return { qiymat: xabar.photo[xabar.photo.length - 1].file_id };
  }

  if (qadam === "telefon") {
    const xom = xabar.contact ? xabar.contact.phone_number : matn;
    const raqam = telefonniTozala(xom);
    if (!raqam) {
      return {
        xato:
          "❌ Raqam noto'g'ri. Masalan: +998901234567\n" +
          "Yoki pastdagi tugmani bosing.",
        tugma: TELEFON_TUGMA,
      };
    }
    return { qiymat: raqam };
  }

  if (qadam === "ism" || qadam === "familiya") {
    if (!ismTogrimi(matn)) {
      const nom = qadam === "ism" ? "Ism" : "Familiya";
      return {
        xato: `❌ ${nom} faqat harflardan iborat va 2–40 ta belgi bo'lishi kerak. Qaytadan yozing:`,
      };
    }
    return { qiymat: bosh_harf(matn) };
  }

  if (qadam === "kurs") {
    const kurs = kursniTekshir(matn);
    if (!kurs) {
      return {
        xato:
          "❌ Tushunarsiz. 1 dan 6 gacha kurs raqamini yoki " +
          "«9-sinf» ko'rinishida sinfni yozing:",
        tugma: KURS_TUGMA,
      };
    }
    return { qiymat: kurs };
  }

  // oqish_joyi va yonalish — 3–120 ta belgi.
  if (matn.length < 3 || matn.length > 120) {
    const nom = qadam === "oqish_joyi" ? "Muassasa nomi" : "Yo'nalish nomi";
    return { xato: `❌ ${nom} 3–120 ta belgi bo'lishi kerak. Qaytadan yozing:` };
  }
  return { qiymat: matn };
}

/** Ro'yxatdan o'tishni boshlaydi. */
async function royxatniBoshla(tg, env, chatId, tgId, salom) {
  await holatYoz(env, tgId, { qadam: "ism", malumot: {} });
  if (salom) await tg.yubor(chatId, salom, { reply_markup: TUGMANI_OCHIR });
  const savol = qadamSavoli("ism");
  await tg.yubor(chatId, savol.matn, { reply_markup: savol.tugma });
}

/** Suhbatning navbatdagi qadamini bajaradi. */
async function royxatQadami(tg, env, xabar, holat) {
  const chatId = xabar.chat.id;
  const tgId = xabar.from.id;
  const qadam = holat.qadam;

  const javob = qadamniTekshir(qadam, xabar);
  if (javob.xato) {
    await tg.yubor(chatId, javob.xato, { reply_markup: javob.tugma || undefined });
    return;
  }

  // Telefon kiritilgach — talaba muallif ro'yxatida bormi, tekshiriladi.
  if (qadam === "telefon") {
    const nomzod = {
      ism: (holat.malumot || {}).ism,
      familiya: (holat.malumot || {}).familiya,
      telefon: javob.qiymat,
    };
    if (!(await oqRoyxatdaBormi(env, nomzod))) {
      await holatOchir(env, tgId);
      await tg.yubor(
        chatId,
        "🚫 <b>Kirish cheklangan</b>\n\n" +
          "Sizning ma'lumotlaringiz o'qituvchi kiritgan talabalar " +
          "ro'yxatida topilmadi.\n\n" +
          `Kiritilgan: <b>${qalqon(nomzod.familiya)} ${qalqon(nomzod.ism)}</b>, ` +
          `${qalqon(nomzod.telefon)}\n\n` +
          "Ism-familiyangizni yoki telefon raqamingizni xato yozgan " +
          "bo'lishingiz mumkin — /start bosib qaytadan urinib ko'ring. " +
          "Agar to'g'ri bo'lsa, o'qituvchingizga murojaat qiling.",
        { reply_markup: TUGMANI_OCHIR }
      );
      return;
    }
  }

  // Surat bo'lsa — unda haqiqatan odam bor-yo'qligi tekshiriladi.
  if (qadam === "rasm") {
    await tg.yubor(chatId, "🔍 Rasm tekshirilmoqda, biroz kuting…");
    const tekshiruv = await suratdaOdamBormi(env, javob.qiymat);
    if (tekshiruv.odam === false) {
      const nima =
        tekshiruv.topilgan && tekshiruv.topilgan.length
          ? " Suratda ko'ringani: <b>" +
            qalqon(tekshiruv.topilgan.map(yorliqTarjima).join(", ")) +
            "</b>."
          : "";
      await tg.yubor(
        chatId,
        "❌ Bu suratda <b>odam</b> ko'rinmadi." + nima + "\n\n" +
          "Iltimos, <b>o'zingizning</b> suratingizni yuboring — " +
          "yuzingiz aniq ko'rinib tursin. Hayvon, uy, manzara yoki " +
          "boshqa rasm qabul qilinmaydi.",
        { reply_markup: TUGMANI_OCHIR }
      );
      return;
    }
    if (tekshiruv.odam === true) {
      await tg.yubor(chatId, "✅ Rasm qabul qilindi.");
    }
  }

  const malumot = { ...(holat.malumot || {}) };
  malumot[qadam === "rasm" ? "rasm_id" : qadam] = javob.qiymat;

  const keyingiIndeks = QADAMLAR.indexOf(qadam) + 1;
  if (keyingiIndeks < QADAMLAR.length) {
    const keyingi = QADAMLAR[keyingiIndeks];
    await holatYoz(env, tgId, { qadam: keyingi, malumot });
    const savol = qadamSavoli(keyingi);
    await tg.yubor(chatId, savol.matn, { reply_markup: savol.tugma });
    return;
  }

  // Oxirgi qadam — ma'lumot saqlanadi.
  await royxatniYakunla(tg, env, xabar, malumot);
}

/** Ro'yxatni saqlaydi, talabaga tabrik, muallifga xabar yuboradi. */
async function royxatniYakunla(tg, env, xabar, malumot) {
  const chatId = xabar.chat.id;
  const foydalanuvchi = xabar.from;

  const talaba = {
    tg_id: foydalanuvchi.id,
    username: foydalanuvchi.username || "",
    ism: malumot.ism,
    familiya: malumot.familiya,
    telefon: malumot.telefon,
    rasm_id: malumot.rasm_id || "",
    oqish_joyi: malumot.oqish_joyi,
    kurs: malumot.kurs,
    yonalish: malumot.yonalish,
    royxat_sanasi: hozir(),
  };

  try {
    await talabaSaqla(env, foydalanuvchi.id, talaba);
  } catch (xato) {
    console.error("Ro'yxatni saqlashda xato:", xato && xato.message);
    await tg.yubor(
      chatId,
      "⚠️ Ma'lumotni saqlashda xatolik yuz berdi. " +
        "Iltimos, /start bilan qaytadan urinib ko'ring."
    );
    return;
  }
  await holatOchir(env, foydalanuvchi.id);

  await tg.yubor(
    chatId,
    "✅ <b>Ro'yxatdan o'tdingiz!</b>\n\n" +
      `👤 Ism: ${qalqon(talaba.ism)}\n` +
      `👤 Familiya: ${qalqon(talaba.familiya)}\n` +
      `📞 Telefon: ${qalqon(talaba.telefon)}\n` +
      `🏫 O'qish joyi: ${qalqon(talaba.oqish_joyi)}\n` +
      `📚 Kurs: ${qalqon(talaba.kurs)}\n` +
      `🎓 Yo'nalish: ${qalqon(talaba.yonalish)}\n\n` +
      "Endi pastdagi «📚 Darslikni ochish» tugmasi orqali darslikni " +
      "oching va testlarni yeching — natijalar avtomatik muallifga yuboriladi.\n" +
      "O'z natijalaringizni ko'rish: /natijam",
    { reply_markup: await tugmalar(env, xabar.from.id) }
  );

  // Muallifga yangi talaba haqida xabar (rasm bilan).
  const sarlavha =
    "🆕 <b>Yangi talaba ro'yxatdan o'tdi</b>\n\n" +
    `👤 ${qalqon(talaba.familiya)} ${qalqon(talaba.ism)}\n` +
    `📞 ${qalqon(talaba.telefon)}\n` +
    `🏫 ${qalqon(talaba.oqish_joyi)}\n` +
    `📚 ${qalqon(talaba.kurs)}\n` +
    `🎓 ${qalqon(talaba.yonalish)}\n` +
    `🔗 ${talaba.username ? `@${qalqon(talaba.username)}` : "—"}\n` +
    `🕓 ${hozir()}`;
  await muallifgaYubor(tg, env, sarlavha, talaba.rasm_id);
}

/** Xabarni muallifga yuboradi (rasm bo'lsa — rasm bilan). */
async function muallifgaYubor(tg, env, matn, rasmId) {
  const muallif = env.MUALLIF_ID;
  if (!muallif) {
    console.error("MUALLIF_ID sozlanmagan — xabar yuborilmadi.");
    return;
  }
  let javob;
  if (rasmId) {
    javob = await tg.rasmYubor(muallif, rasmId, matn);
    if (javob && javob.ok) return;
    // Rasm yuborilmasa — hech bo'lmasa matnni yuboramiz.
  }
  await tg.yubor(muallif, matn);
}

/* =====================================================================
 *  8-BO'LIM. TEST VA O'YIN NATIJALARI
 * ===================================================================== */

/**
 * Mini App'dan kelgan ma'lumotni tekshiradi va bir ko'rinishga keltiradi.
 * Qo'llab-quvvatlanadigan ko'rinishlar:
 *   1) JSON: {"modul":3,"foiz":80,"togri":8,"jami":10,"tur":"test"}
 *   2) Kod:  XP-3-8-10  yoki  XP-3-8-10-oyin  (zaxira yo'l)
 * To'g'ri bo'lmasa null qaytaradi.
 */
function natijaniAjrat(xom) {
  const matn = String(xom || "").trim();
  if (!matn) return null;
  if (matn.length > 2000) return null;

  let malumot = null;

  if (matn.startsWith("{")) {
    try {
      malumot = JSON.parse(matn);
    } catch (xato) {
      console.error("Natija JSON'i o'qilmadi:", xato && xato.message);
      return null;
    }
    if (!malumot || typeof malumot !== "object" || Array.isArray(malumot)) return null;
  } else {
    const moslik = matn.match(
      /^(?:XP|xp)[-_ ]?(\d{1,2})[-_ ](\d{1,4})[-_ ](\d{1,4})(?:[-_ ]([A-Za-z']+))?$/
    );
    if (!moslik) return null;
    malumot = {
      modul: moslik[1],
      togri: moslik[2],
      jami: moslik[3],
      tur: (moslik[4] || "test").toLowerCase(),
    };
  }

  const modul = songa(malumot.modul);
  const togri = songa(malumot.togri);
  const jami = songa(malumot.jami);
  let foiz = songa(malumot.foiz);

  // Foiz berilmagan bo'lsa — to'g'ri/jami dan hisoblaymiz.
  if (foiz === null && togri !== null && jami) foiz = Math.round((togri * 1000) / jami) / 10;
  if (foiz === null || foiz < 0 || foiz > 100) return null;
  if (modul === null || modul < 1 || modul > 99) return null;
  if (jami !== null && (jami <= 0 || jami > 1000)) return null;
  if (togri !== null && (togri < 0 || (jami !== null && togri > jami))) return null;

  let tur = String(malumot.tur === undefined ? "test" : malumot.tur).toLowerCase().trim();
  tur = tur === "test" ? "test" : "oyin";

  return {
    modul: Math.trunc(modul),
    foiz: Math.round(foiz * 10) / 10,
    togri: togri === null ? null : Math.trunc(togri),
    jami: jami === null ? null : Math.trunc(jami),
    tur,
  };
}

/** Muallifga yuboriladigan chiroyli xabarni tayyorlaydi. */
function natijaMatni(talaba, natija, sana) {
  const belgi = natija.tur === "oyin" ? "🎮" : "📝";
  const baho = natija.foiz >= 80 ? "🟢" : natija.foiz >= 60 ? "🟡" : "🔴";
  const ballar =
    natija.togri !== null && natija.jami !== null
      ? `\n✔️ To'g'ri javob: ${natija.togri} / ${natija.jami}`
      : "";
  const modulNomi = MODUL_NOMLARI[natija.modul] || "nomi noma'lum";
  const havola = talaba.username ? `@${qalqon(talaba.username)}` : "—";

  return (
    `${belgi} <b>Yangi natija</b>\n\n` +
    `👤 <b>${qalqon(talaba.familiya)} ${qalqon(talaba.ism)}</b>\n` +
    `📞 ${qalqon(talaba.telefon)}\n` +
    `🏫 ${qalqon(talaba.oqish_joyi)}\n` +
    `📚 ${qalqon(talaba.kurs)}\n` +
    `🎓 ${qalqon(talaba.yonalish)}\n` +
    `🔗 ${havola}\n` +
    "➖➖➖➖➖➖➖➖\n" +
    `📘 Modul: <b>${natija.modul}</b> — ${qalqon(modulNomi)}\n` +
    `🧩 Turi: ${natija.tur === "oyin" ? "o'yin" : "test"}\n` +
    `${baho} Natija: <b>${natija.foiz}%</b>${ballar}\n` +
    `🕓 Sana: ${sana}`
  );
}

/** Natijani tekshiradi, KV'ga saqlaydi va muallifga yuboradi. */
async function natijaniQaytaIshla(tg, env, xabar, xom, manba) {
  const chatId = xabar.chat.id;
  const tgId = xabar.from.id;

  const talaba = await talabaOq(env, tgId);
  if (!talaba) {
    await tg.yubor(
      chatId,
      "🔒 Natija qabul qilinmadi.\n\n" +
        "Avval ro'yxatdan o'tishingiz kerak — /start buyrug'ini bosing."
    );
    return;
  }

  const natija = natijaniAjrat(xom);
  if (!natija) {
    console.error("Natija tushunarsiz:", String(xom).slice(0, 200));
    await tg.yubor(
      chatId,
      "⚠️ Natija tushunarsiz bo'ldi. Iltimos, testni darslik " +
        "ichidagi tugma orqali qaytadan yakunlang."
    );
    return;
  }

  const sana = hozir();
  const yozuv = {
    tg_id: tgId,
    ism: talaba.ism,
    familiya: talaba.familiya,
    modul: natija.modul,
    foiz: natija.foiz,
    togri: natija.togri,
    jami: natija.jami,
    tur: natija.tur,
    manba,
    sana,
  };

  try {
    await natijaSaqla(env, yozuv);
  } catch (xato) {
    console.error("Natijani saqlashda xato:", xato && xato.message);
  }

  // Talabaga qisqa tasdiq.
  const modulNomi = MODUL_NOMLARI[natija.modul] || "";
  await tg.yubor(
    chatId,
    "✅ <b>Natijangiz qabul qilindi!</b>\n\n" +
      `📘 ${natija.modul}-modul${modulNomi ? ` — ${qalqon(modulNomi)}` : ""}\n` +
      `📊 Natija: <b>${natija.foiz}%</b>` +
      (natija.togri !== null && natija.jami !== null
        ? ` (${natija.togri}/${natija.jami})`
        : "") +
      "\n\nNatija muallifga yuborildi. Barcha natijalaringiz: /natijam"
  );

  // Muallifga darhol xabar.
  await muallifgaYubor(tg, env, natijaMatni(talaba, natija, sana));
}

/* =====================================================================
 *  9-BO'LIM. UMUMIY BUYRUQLAR (barcha foydalanuvchilar uchun)
 * ===================================================================== */

async function buyruqStart(tg, env, xabar) {
  const chatId = xabar.chat.id;
  const foydalanuvchi = xabar.from;
  const talaba = await talabaOq(env, foydalanuvchi.id);

  const salom =
    `<b>Assalomu alaykum, ${qalqon(foydalanuvchi.first_name)}!</b>\n\n` +
    "«Xalq pedagogikasi» elektron darsligi botiga xush kelibsiz.\n";

  // ── ROLNI AVTOMATIK ANIQLASH ──────────────────────────────────
  // Super admin va muallif ro'yxatdan O'TMAYDI — ular talaba emas.
  if (adminMi(env, foydalanuvchi.id)) {
    await holatOchir(env, foydalanuvchi.id);
    const soni = await oqRoyxatSoni(env);
    const oqFaol = await oqRoyxatFaolmi(env);
    await tg.yubor(
      chatId,
      `${salom}\n` +
        "🛡 Siz <b>SUPER ADMIN</b> sifatida tanildingiz.\n" +
        `🆔 <code>${foydalanuvchi.id}</code>\n\n` +
        "Sizga ro'yxatdan o'tish kerak emas — pastda <b>barcha tugmalaringiz</b> chiqdi.\n\n" +
        "<b>⏸ ▶️ 🧊 🔓 — faqat sizda</b>\n" +
        "Botni to'xtatish/yoqish va saytni muzlatish/ochish. " +
        "Muallifda bu tugmalar yo'q.\n\n" +
        "<b>📋 📈 👥 📊 📥 🔎 — nazorat</b>\n" +
        "Natijalar, hisobot, talabalar, statistika, CSV eksport va qidiruv.\n\n" +
        "<b>🗂 Talabalar jadvali</b> — kim kira olishini belgilaydi.\n" +
        "Hozir: " + (oqFaol ? "🟢 nazorat yoqilgan" : "⚪ nazorat o'chirilgan") +
        ` (telefon ${soni.telefon}, ism ${soni.ism})`,
      { reply_markup: await tugmalar(env, xabar.from.id) }
    );
    return;
  }

  if (muallifMi(env, foydalanuvchi.id)) {
    await holatOchir(env, foydalanuvchi.id);
    const soni = await oqRoyxatSoni(env);
    const oqFaol = await oqRoyxatFaolmi(env);
    await tg.yubor(
      chatId,
      `${salom}\n` +
        "✍️ Siz <b>MUALLIF</b> sifatida tanildingiz.\n" +
        `🆔 <code>${foydalanuvchi.id}</code>\n\n` +
        "Sizga ro'yxatdan o'tish kerak emas — talabalarning barcha " +
        "test va o'yin natijalari sizga avtomatik kelib turadi.\n\n" +
        "Pastda <b>tugmalaringiz</b> chiqdi:\n" +
        "🗂 <b>Talabalar jadvali</b> — ro'yxatni yuklaysiz, faqat " +
        "shu talabalar kira oladi\n" +
        "👥 Talabalar · 📋 Natijalar · 📈 Hisobot — ballarni nazorat qilasiz\n" +
        "📊 Statistika · 📥 CSV eksport · 🔎 Talabani qidirish\n" +
        "📚 Darslikni ochish — saytni ko'rasiz\n\n" +
        "Hozirgi holat: " + (oqFaol ? "🟢 nazorat yoqilgan" : "⚪ nazorat o'chirilgan") +
        ` (telefon ${soni.telefon}, ism ${soni.ism})`,
      { reply_markup: await tugmalar(env, xabar.from.id) }
    );
    return;
  }

  // Allaqachon ro'yxatdan o'tgan bo'lsa — darhol Mini App tugmasi.
  if (talaba) {
    await holatOchir(env, foydalanuvchi.id);

    // Sayt muzlatilgan bo'lsa darslik ochilmaydi.
    if (await muzlatilganmi(env)) {
      await tg.yubor(
        chatId,
        `${salom}\n🔒 <b>Darslik vaqtincha yopilgan.</b>\n\n` +
          "Texnik ishlar olib borilmoqda. Sayt qayta ochilishi bilan " +
          "«📚 Darslikni ochish» tugmasi yana paydo bo'ladi.\n\n" +
          "Shu paytgacha to'plagan natijalaringizni ko'rishingiz mumkin.",
        { reply_markup: await tugmalar(env, foydalanuvchi.id) }
      );
      return;
    }

    await tg.yubor(
      chatId,
      `${salom}\nSiz ro'yxatdan o'tgansiz:\n` +
        `👤 ${qalqon(talaba.ism)} ${qalqon(talaba.familiya)}\n` +
        `🏫 ${qalqon(talaba.oqish_joyi)}\n` +
        `📚 ${qalqon(talaba.kurs)}, ${qalqon(talaba.yonalish)}\n\n` +
        "Pastdagi «📚 Darslikni ochish» tugmasini bosing.\n" +
        "Ma'lumotlaringizni yangilash: /yangila",
      { reply_markup: await tugmalar(env, xabar.from.id) }
    );
    return;
  }

  await royxatniBoshla(
    tg,
    env,
    chatId,
    foydalanuvchi.id,
    `${salom}\nTest natijalaringiz muallifga yetib borishi uchun avval ` +
      "qisqa ro'yxatdan o'tishingiz kerak.\n" +
      "Istalgan paytda bekor qilish uchun: /bekor"
  );
}

async function buyruqYangila(tg, env, xabar) {
  // Rolli foydalanuvchilar talaba emas — ular uchun ro'yxat yo'q.
  if (muallifMi(env, xabar.from.id)) {
    await tg.yubor(
      xabar.chat.id,
      "Siz " +
        (adminMi(env, xabar.from.id) ? "super admin" : "muallif") +
        " sifatida tanilgansiz — ro'yxatdan o'tish kerak emas.\n" +
        "Buyruqlar ro'yxati: /start",
      { reply_markup: await tugmalar(env, xabar.from.id) }
    );
    return;
  }
  await royxatniBoshla(
    tg,
    env,
    xabar.chat.id,
    xabar.from.id,
    "✏️ Ma'lumotlaringizni yangilaymiz. Savollarga qaytadan " +
      "javob bering.\nBekor qilish: /bekor"
  );
}

async function buyruqBekor(tg, env, xabar) {
  const holat = await holatOq(env, xabar.from.id);
  await holatOchir(env, xabar.from.id);
  const talaba = await talabaOq(env, xabar.from.id);
  await tg.yubor(
    xabar.chat.id,
    holat
      ? "🚫 Bekor qilindi. Qaytadan boshlash uchun: /start"
      : "Hozir bekor qiladigan amal yo'q. /start bilan boshlashingiz mumkin.",
    { reply_markup: talaba ? await tugmalar(env, xabar.from.id) : TUGMANI_OCHIR }
  );
}

/** Foizga qarab o'zlashtirish darajasi. */
function ozlashtirishDarajasi(foiz) {
  if (foiz >= 90) return { belgi: "🟢", nom: "A'lo" };
  if (foiz >= 75) return { belgi: "🔵", nom: "Yaxshi" };
  if (foiz >= 60) return { belgi: "🟡", nom: "Qoniqarli" };
  if (foiz > 0) return { belgi: "🔴", nom: "Takrorlash kerak" };
  return { belgi: "⚪", nom: "Boshlanmagan" };
}

/** Foizni 10 bo'lakli ustun ko'rinishida chizadi. */
function ustunChiz(foiz) {
  const toliq = Math.round((Math.max(0, Math.min(100, foiz)) / 100) * 10);
  return "▰".repeat(toliq) + "▱".repeat(10 - toliq);
}

/**
 * «📊 Natijalarim» — har bir modul bo'yicha o'zlashtirish hisoboti.
 * Modulning eng yuqori natijasi o'zlashtirish deb olinadi.
 */
async function buyruqNatijam(tg, env, xabar) {
  const tgId = xabar.from.id;
  const talaba = await talabaOq(env, tgId);
  if (!talaba) {
    await tg.yubor(xabar.chat.id, "Siz hali ro'yxatdan o'tmagansiz. /start bosing.");
    return;
  }

  const kalitlar = await kalitlarniOl(env, `n:${tgId}:`);

  // Modul raqami bo'yicha yig'ish.
  const modullar = {};
  for (const kalit of kalitlar) {
    const n = kalit.metadata || {};
    const raqam = Number(n.modul);
    if (!raqam || !MODUL_NOMLARI[raqam]) continue;
    const foiz = Number(n.foiz) || 0;
    if (!modullar[raqam]) {
      modullar[raqam] = { eng_yuqori: 0, yigindi: 0, soni: 0, oxirgi: "", turlar: new Set() };
    }
    const m = modullar[raqam];
    m.eng_yuqori = Math.max(m.eng_yuqori, foiz);
    m.yigindi += foiz;
    m.soni += 1;
    m.turlar.add(n.tur === "oyin" ? "o'yin" : "test");
    if (!m.oxirgi || String(n.sana || "") > m.oxirgi) m.oxirgi = String(n.sana || "");
  }

  const jamiModul = Object.keys(MODUL_NOMLARI).length;
  const ishlangan = Object.keys(modullar).length;

  if (ishlangan === 0) {
    await tg.yubor(
      xabar.chat.id,
      "📊 <b>Natijalaringiz</b>\n\n" +
        "Sizda hali natija yo'q.\n\n" +
        `Darslikda <b>${jamiModul} ta modul</b> bor. «📚 Darslikni ochish» ` +
        "tugmasini bosing, mavzuni o'qing va test yoki o'yinni yakunlang — " +
        "natija shu yerda avtomatik ko'rinadi.",
      { reply_markup: await tugmalar(env, xabar.from.id) }
    );
    return;
  }

  // Umumiy o'zlashtirish — BARCHA modullar bo'yicha (ishlanmagani 0 ball).
  let umumiyYigindi = 0;
  for (let r = 1; r <= jamiModul; r += 1) {
    umumiyYigindi += modullar[r] ? modullar[r].eng_yuqori : 0;
  }
  const umumiy = Math.round(umumiyYigindi / jamiModul);
  const jamiUrinish = Object.values(modullar).reduce((y, m) => y + m.soni, 0);
  const daraja = ozlashtirishDarajasi(umumiy);

  const satrlar = [
    `📊 <b>Natijalaringiz</b> — ${qalqon(talaba.ism)} ${qalqon(talaba.familiya)}\n`,
    `${daraja.belgi} Umumiy o'zlashtirish: <b>${umumiy}%</b> — ${daraja.nom}`,
    `${ustunChiz(umumiy)}`,
    `📘 Boshlangan modul: <b>${ishlangan}</b> / ${jamiModul} · ` +
      `urinishlar: <b>${jamiUrinish}</b>`,
    "\n━━━━━━━━━━━━━━━━━━",
  ];

  for (let r = 1; r <= jamiModul; r += 1) {
    const nomi = MODUL_NOMLARI[r] || "";
    const m = modullar[r];
    if (!m) {
      satrlar.push(
        `\n⚪ <b>${r}-modul</b> — hali boshlanmagan\n` +
          `<i>${qalqon(nomi.slice(0, 58))}</i>`
      );
      continue;
    }
    const d = ozlashtirishDarajasi(m.eng_yuqori);
    const ortacha = Math.round(m.yigindi / m.soni);
    satrlar.push(
      `\n${d.belgi} <b>${r}-modul</b> — <b>${m.eng_yuqori}%</b> · ${d.nom}\n` +
        `<i>${qalqon(nomi.slice(0, 58))}</i>\n` +
        `${ustunChiz(m.eng_yuqori)}  ${m.soni} urinish · o'rtacha ${ortacha}%` +
        (m.turlar.size ? ` · ${[...m.turlar].join(", ")}` : "")
    );
  }

  // Maslahat — nimani takrorlash kerak.
  const zaif = Object.entries(modullar)
    .filter(([, m]) => m.eng_yuqori < 75)
    .sort((a, b) => a[1].eng_yuqori - b[1].eng_yuqori)
    .slice(0, 3)
    .map(([r]) => `${r}-modul`);
  const boshlanmagan = [];
  for (let r = 1; r <= jamiModul; r += 1) if (!modullar[r]) boshlanmagan.push(r);

  satrlar.push("\n━━━━━━━━━━━━━━━━━━\n");
  if (zaif.length) {
    satrlar.push(`🔁 <b>Takrorlash tavsiya etiladi:</b> ${zaif.join(", ")}`);
  }
  if (boshlanmagan.length) {
    satrlar.push(
      `▶️ <b>Keyingi qadam:</b> ${boshlanmagan[0]}-modulni boshlang ` +
        `(yana ${boshlanmagan.length} ta modul kutmoqda).`
    );
  }
  if (!zaif.length && !boshlanmagan.length) {
    satrlar.push("🏆 Barcha modullar yaxshi o'zlashtirilgan. Tabriklaymiz!");
  }

  await tg.uzunYubor(xabar.chat.id, satrlar.join("\n"));
  await tg.yubor(
    xabar.chat.id,
    "Davom etish uchun pastdagi tugmalardan foydalaning.",
    { reply_markup: await tugmalar(env, xabar.from.id) }
  );
}

/** Telegram hujjatini yuklab, matn sifatida o'qiydi (.txt / .csv). */
async function hujjatMatniniOq(env, hujjat) {
  const olcham = Number(hujjat.file_size) || 0;
  if (olcham > 2 * 1024 * 1024) {
    return { xato: "❌ Fayl juda katta (2 MB dan oshmasin)." };
  }
  try {
    const javob = await fetch(
      "https://api.telegram.org/bot" + env.TG_TOKEN +
        "/getFile?file_id=" + encodeURIComponent(hujjat.file_id)
    ).then((r) => r.json());
    const yol = javob && javob.result && javob.result.file_path;
    if (!yol) return { xato: "❌ Faylni yuklab bo'lmadi." };
    const fayl = await fetch(
      "https://api.telegram.org/file/bot" + env.TG_TOKEN + "/" + yol
    );
    if (!fayl.ok) return { xato: "❌ Faylni yuklab bo'lmadi." };
    return { matn: await fayl.text() };
  } catch (xato) {
    console.error("Hujjat o'qilmadi:", xato && xato.message);
    return { xato: "❌ Faylni o'qishda xatolik yuz berdi." };
  }
}

/**
 * «🗂 Talabalar jadvali» tugmasi — holatni ko'rsatadi va darhol
 * ro'yxat kutish holatiga o'tadi, ya'ni keyingi xabar yoki fayl
 * talabalar ro'yxati sifatida qabul qilinadi.
 */
async function tugmaJadval(tg, env, xabar) {
  const faol = await oqRoyxatFaolmi(env);
  const soni = await oqRoyxatSoni(env);
  await holatYoz(env, xabar.from.id, { qadam: "oq_royxat_kutish", malumot: {} });
  await tg.yubor(
    xabar.chat.id,
    "🗂 <b>Talabalar jadvali</b>\n\n" +
      `Holati: ${faol ? "🟢 <b>YOQILGAN</b> — faqat ro'yxatdagilar kira oladi" : "⚪ <b>O'CHIRILGAN</b> — hamma kira oladi"}\n` +
      `Bazada: telefon <b>${soni.telefon}</b>, ism <b>${soni.ism}</b>\n\n` +
      "📝 <b>Endi ro'yxatni yuboring</b> — bitta xabarda, har bir talaba " +
      "alohida qatorda. Yoki <b>.txt / .csv fayl</b> tashlang.\n\n" +
      "<b>Qator ko'rinishi</b> (telefon yoki ism — bittasi yetadi):\n" +
      "<code>Jo'rabekov Bunyodbek +998901234567</code>\n" +
      "<code>Karimova Nodira</code>\n" +
      "<code>+998911112233</code>\n\n" +
      "Ro'yxatni ko'rish: /royxat_kor\n" +
      "Nazoratni o'chirish: /royxat_ochir\n" +
      "Ro'yxatni tozalash: /royxat_tozala\n" +
      "Bekor qilish: /bekor"
  );
}

/** /royxat — oq ro'yxat holati va qo'llanmasi (muallif uchun). */
async function buyruqRoyxat(tg, env, xabar) {
  const faol = await oqRoyxatFaolmi(env);
  const soni = await oqRoyxatSoni(env);
  await tg.yubor(
    xabar.chat.id,
    "📋 <b>Talabalar ro'yxati (kirish nazorati)</b>\n\n" +
      `Holati: ${faol ? "🟢 <b>YOQILGAN</b> — faqat ro'yxatdagilar kira oladi" : "⚪ <b>O'CHIRILGAN</b> — hamma kira oladi"}\n` +
      `Telefon bo'yicha yozuv: <b>${soni.telefon}</b>\n` +
      `Ism-familiya bo'yicha yozuv: <b>${soni.ism}</b>\n\n` +
      "<b>Ro'yxat qo'shish</b>\n" +
      "1) <code>/royxat_qosh</code> buyrug'ini yuboring, so'ng talabalar " +
      "ro'yxatini bitta xabarda yuboring — har bir talaba alohida qatorda.\n" +
      "2) Yoki shu yerga <b>.txt / .csv fayl</b> tashlang.\n\n" +
      "<b>Qator ko'rinishi</b> (telefon yoki ism — bittasi yetadi):\n" +
      "<code>Jo'rabekov Bunyodbek +998901234567</code>\n" +
      "<code>Karimova Nodira</code>\n" +
      "<code>+998911112233</code>\n\n" +
      "<b>Boshqa buyruqlar</b>\n" +
      "<code>/royxat_kor</code> — ro'yxatni ko'rish\n" +
      "<code>/royxat_yon</code> — nazoratni yoqish\n" +
      "<code>/royxat_ochir</code> — nazoratni o'chirish (hamma kiradi)\n" +
      "<code>/royxat_tozala</code> — ro'yxatni butunlay o'chirish"
  );
}

/** /royxat_qosh — keyingi xabar ro'yxat sifatida qabul qilinadi. */
async function buyruqRoyxatQosh(tg, env, xabar) {
  await holatYoz(env, xabar.from.id, { qadam: "oq_royxat_kutish", malumot: {} });
  await tg.yubor(
    xabar.chat.id,
    "📝 Endi talabalar ro'yxatini <b>bitta xabarda</b> yuboring — " +
      "har bir talaba alohida qatorda.\n\n" +
      "Yoki <b>.txt / .csv fayl</b> tashlang.\n\n" +
      "Bekor qilish: /bekor"
  );
}

/** Ro'yxat matnini qabul qilib bazaga yozadi. */
async function royxatMatniniQabulQil(tg, env, xabar, matn) {
  const yozuvlar = royxatSatrlariniTahlil(matn);
  if (yozuvlar.length === 0) {
    await tg.yubor(
      xabar.chat.id,
      "❌ Ro'yxatdan hech qanday yozuv topilmadi.\n\n" +
        "Har bir qatorda kamida ism-familiya yoki telefon raqam bo'lishi kerak."
    );
    return;
  }
  const qoshildi = await oqRoyxatgaQosh(env, yozuvlar);
  await env.BAZA.put("sozlama:oq", "1");
  await holatOchir(env, xabar.from.id);
  const soni = await oqRoyxatSoni(env);
  await tg.yubor(
    xabar.chat.id,
    `✅ <b>${yozuvlar.length} ta qator</b> qabul qilindi.\n\n` +
      `Yangi telefon kalitlari: ${qoshildi.telefon}\n` +
      `Yangi ism kalitlari: ${qoshildi.ism}\n\n` +
      `Bazada jami: telefon <b>${soni.telefon}</b>, ism <b>${soni.ism}</b>\n\n` +
      "🟢 Kirish nazorati <b>yoqildi</b> — endi faqat shu ro'yxatdagi " +
      "talabalar ro'yxatdan o'ta oladi."
  );
}

/** /royxat_kor — ro'yxatni ko'rsatadi. */
async function buyruqRoyxatKor(tg, env, xabar) {
  const kalitlar = await kalitlarniOl(env, "oq:");
  if (kalitlar.length === 0) {
    await tg.yubor(xabar.chat.id, "Ro'yxat bo'sh. /royxat_qosh bilan to'ldiring.");
    return;
  }
  const korilgan = new Set();
  const satrlar = ["📋 <b>Ro'yxatdagi talabalar</b>\n"];
  let raqam = 0;
  for (const kalit of kalitlar) {
    const qiymat = await env.BAZA.get(kalit.name);
    const kalitMatn = String(qiymat || kalit.name);
    if (korilgan.has(kalitMatn)) continue;
    korilgan.add(kalitMatn);
    raqam += 1;
    if (raqam > 200) break;
    satrlar.push(`${raqam}. ${qalqon(kalitMatn)}`);
  }
  satrlar.push(`\nJami noyob yozuv: <b>${korilgan.size}</b>`);
  await tg.uzunYubor(xabar.chat.id, satrlar.join("\n"));
}

/** /royxat_yon va /royxat_ochir — nazoratni yoqadi yoki o'chiradi. */
async function buyruqRoyxatHolat(tg, env, xabar, yoqilsin) {
  await env.BAZA.put("sozlama:oq", yoqilsin ? "1" : "0");
  await tg.yubor(
    xabar.chat.id,
    yoqilsin
      ? "🟢 Kirish nazorati <b>yoqildi</b> — faqat ro'yxatdagi talabalar kira oladi."
      : "⚪ Kirish nazorati <b>o'chirildi</b> — hamma ro'yxatdan o'ta oladi."
  );
}

/** /royxat_tozala — ro'yxatni butunlay o'chiradi. */
async function buyruqRoyxatTozala(tg, env, xabar) {
  const kalitlar = await kalitlarniOl(env, "oq:");
  for (const kalit of kalitlar) {
    await env.BAZA.delete(kalit.name);
  }
  await env.BAZA.put("sozlama:oq", "0");
  await tg.yubor(
    xabar.chat.id,
    `🗑 Ro'yxat tozalandi (${kalitlar.length} ta kalit o'chirildi).\n` +
      "Kirish nazorati o'chirildi — hozircha hamma kira oladi."
  );
}

async function buyruqYordam(tg, env, xabar) {
  const tgId = xabar.from.id;
  const satrlar = [
    "ℹ️ <b>Yordam</b>\n",
    "/start — ro'yxatdan o'tish yoki darslikni ochish",
    "/yangila — ma'lumotlarni yangilash",
    "/natijam — mening natijalarim",
    "/bekor — amalni bekor qilish",
    "/yordam — shu yordam",
  ];
  if (muallifMi(env, tgId)) {
    satrlar.push(
      "\n<b>Muallif uchun</b>",
      "/natijalar — oxirgi 20 ta natija",
      "/talabalar — talabalar ro'yxati",
      "/hisobot — modullar bo'yicha o'rtacha foiz",
      "/qidir &lt;ism&gt; — talabani qidirish",
      "/statistika — umumiy statistika",
      "/eksport — natijalarni CSV'da olish",
      "\n<b>Kirish nazorati</b>",
      "/royxat — holat va qo'llanma",
      "/royxat_qosh — ro'yxat qo'shish (matn yoki .txt/.csv fayl)",
      "/royxat_kor — ro'yxatni ko'rish",
      "/royxat_yon — nazoratni yoqish",
      "/royxat_ochir — nazoratni o'chirish",
      "/royxat_tozala — ro'yxatni butunlay o'chirish"
    );
  }
  if (adminMi(env, tgId)) {
    satrlar.push(
      "\n<b>Admin uchun</b>",
      "/boshla — botni yoqish",
      "/toxtat — botni to'xtatish",
      "/muzlat — saytni muzlatish",
      "/yoq — saytni qayta ochish",
      "/sozla — buyruq menyularini o'rnatish",
      "\n<i>Botni va saytni to'xtatish faqat super adminda.</i>"
    );
  }
  await tg.yubor(xabar.chat.id, satrlar.join("\n"));
}

/* =====================================================================
 *  10-BO'LIM. MUALLIF BUYRUQLARI
 * ===================================================================== */

async function buyruqNatijalar(tg, env, xabar, arg) {
  let chegara = 20;
  const berilgan = parseInt(arg, 10);
  if (Number.isFinite(berilgan)) chegara = Math.max(1, Math.min(100, berilgan));

  const natijalar = await natijalarniOl(env, chegara);
  if (natijalar.length === 0) {
    await tg.yubor(xabar.chat.id, "Hozircha birorta ham natija yo'q.");
    return;
  }

  const satrlar = [`📊 <b>Oxirgi ${natijalar.length} ta natija</b>\n`];
  for (const n of natijalar) {
    const modulNomi = MODUL_NOMLARI[n.modul] || "";
    satrlar.push(
      `• <b>${qalqon(n.familiya)} ${qalqon(n.ism)}</b> — ` +
        `${n.modul}-modul, <b>${n.foiz}%</b> ` +
        `(${n.tur === "oyin" ? "o'yin" : "test"}` +
        `${n.togri !== null && n.togri !== undefined && n.jami ? `, ${n.togri}/${n.jami}` : ""})\n` +
        `  📘 ${qalqon(modulNomi.slice(0, 60))}\n` +
        `  🕓 ${qalqon(n.sana)}`
    );
  }
  await tg.uzunYubor(xabar.chat.id, satrlar.join("\n"));
}

async function buyruqTalabalar(tg, env, xabar) {
  const talabalar = await talabalarniOl(env);
  if (talabalar.length === 0) {
    await tg.yubor(xabar.chat.id, "Hozircha ro'yxatdan o'tgan talaba yo'q.");
    return;
  }

  // Har bir talabaning nechta natijasi borligini sanaymiz.
  const natijaKalitlari = await kalitlarniOl(env, "n:");
  const sanoq = {};
  for (const kalit of natijaKalitlari) {
    const id = String(kalit.name).split(":")[1];
    sanoq[id] = (sanoq[id] || 0) + 1;
  }

  const satrlar = [`👥 <b>Talabalar (${talabalar.length} ta)</b>\n`];
  talabalar.forEach((t, indeks) => {
    satrlar.push(
      `${indeks + 1}. <b>${qalqon(t.familiya)} ${qalqon(t.ism)}</b>\n` +
        `   📞 ${qalqon(t.telefon)} · 📚 ${qalqon(t.kurs)}\n` +
        `   🏫 ${qalqon(t.oqish_joyi)}\n` +
        `   🎓 ${qalqon(t.yonalish)} · 📊 ${sanoq[t.tg_id] || 0} ta natija`
    );
  });
  await tg.uzunYubor(xabar.chat.id, satrlar.join("\n"));
}

async function buyruqHisobot(tg, env, xabar) {
  const natijalar = await natijalarniOl(env);
  if (natijalar.length === 0) {
    await tg.yubor(xabar.chat.id, "Hisobot uchun ma'lumot yo'q.");
    return;
  }

  // Modul bo'yicha yig'amiz.
  const modullar = {};
  const talabalar = {};
  for (const n of natijalar) {
    const foiz = Number(n.foiz) || 0;
    const m = modullar[n.modul] || { soni: 0, yigindi: 0, eng_yuqori: 0, eng_past: 100 };
    m.soni += 1;
    m.yigindi += foiz;
    m.eng_yuqori = Math.max(m.eng_yuqori, foiz);
    m.eng_past = Math.min(m.eng_past, foiz);
    modullar[n.modul] = m;

    const t = talabalar[n.tg_id] || {
      soni: 0,
      yigindi: 0,
      ism: n.ism,
      familiya: n.familiya,
    };
    t.soni += 1;
    t.yigindi += foiz;
    talabalar[n.tg_id] = t;
  }

  const ortacha = (yigindi, soni) => Math.round((yigindi / soni) * 10) / 10;

  const satrlar = ["📈 <b>Modullar bo'yicha hisobot</b>\n"];
  const raqamlar = Object.keys(modullar)
    .map(Number)
    .sort((a, b) => a - b);
  for (const raqam of raqamlar) {
    const m = modullar[raqam];
    const nomi = MODUL_NOMLARI[raqam] || "";
    satrlar.push(
      `📘 <b>${raqam}-modul</b> — ${m.soni} ta natija\n` +
        `   ${qalqon(nomi.slice(0, 60))}\n` +
        `   O'rtacha: <b>${ortacha(m.yigindi, m.soni)}%</b> · ` +
        `eng yuqori: ${m.eng_yuqori}% · eng past: ${m.eng_past}%`
    );
  }

  const engYaxshi = Object.values(talabalar)
    .map((t) => ({ ...t, ortacha: ortacha(t.yigindi, t.soni) }))
    .sort((a, b) => b.ortacha - a.ortacha || b.soni - a.soni)
    .slice(0, 10);
  if (engYaxshi.length > 0) {
    satrlar.push("\n🏆 <b>Eng yaxshi natijalar</b>");
    engYaxshi.forEach((t, indeks) => {
      satrlar.push(
        `${indeks + 1}. ${qalqon(t.familiya)} ${qalqon(t.ism)} — ` +
          `<b>${t.ortacha}%</b> (${t.soni} ta test)`
      );
    });
  }
  await tg.uzunYubor(xabar.chat.id, satrlar.join("\n"));
}

async function buyruqQidir(tg, env, xabar, soralgan) {
  const soz = String(soralgan || "").trim().toLowerCase();
  if (soz.length < 2) {
    await tg.yubor(
      xabar.chat.id,
      "Qidirish uchun kamida 2 ta belgi yozing.\nMasalan: <code>/qidir Aliyev</code>"
    );
    return;
  }

  const talabalar = await talabalarniOl(env);
  const topilgan = talabalar.filter((t) =>
    `${t.ism || ""} ${t.familiya || ""} ${t.telefon || ""} ${t.oqish_joyi || ""}`
      .toLowerCase()
      .includes(soz)
  );

  if (topilgan.length === 0) {
    await tg.yubor(xabar.chat.id, `🔍 «${qalqon(soralgan)}» bo'yicha hech kim topilmadi.`);
    return;
  }

  const satrlar = [`🔍 <b>Topildi: ${topilgan.length} ta</b>\n`];
  for (const t of topilgan.slice(0, 30)) {
    const kalitlar = await kalitlarniOl(env, `n:${t.tg_id}:`, 200);
    kalitlar.sort((a, b) => kalitVaqti(b.name) - kalitVaqti(a.name));
    satrlar.push(
      `👤 <b>${qalqon(t.familiya)} ${qalqon(t.ism)}</b>\n` +
        `   📞 ${qalqon(t.telefon)} · 📚 ${qalqon(t.kurs)}\n` +
        `   🏫 ${qalqon(t.oqish_joyi)}\n` +
        `   🎓 ${qalqon(t.yonalish)} · 📊 ${kalitlar.length} ta natija`
    );
    for (const kalit of kalitlar.slice(0, 5)) {
      const n = kalit.metadata || {};
      satrlar.push(
        `      ↳ ${n.modul}-modul: <b>${n.foiz}%</b> · ${qalqon(n.sana)}`
      );
    }
  }
  await tg.uzunYubor(xabar.chat.id, satrlar.join("\n"));
}

/* =====================================================================
 *  11-BO'LIM. ADMIN BUYRUQLARI (super admin)
 * ===================================================================== */

async function buyruqBoshla(tg, env, xabar) {
  await sozlamaYoz(env, "bot_faol", "1");
  console.log(`Bot YOQILDI (admin: ${xabar.from.id})`);
  await tg.yubor(xabar.chat.id, "🟢 Bot yoqildi. Foydalanuvchilar ishlata oladi.");
}

async function buyruqToxtat(tg, env, xabar) {
  await sozlamaYoz(env, "bot_faol", "0");
  console.log(`Bot TO'XTATILDI (admin: ${xabar.from.id})`);
  await tg.yubor(
    xabar.chat.id,
    "🔴 Bot to'xtatildi.\n" +
      "Endi oddiy foydalanuvchilarga «bot vaqtincha ishlamayapti» " +
      "xabari ko'rinadi. Qayta yoqish: /boshla"
  );
}

/**
 * GitHub Actions «muzlat.yml» ish oqimini ishga tushiradi.
 * Natija: { ok, izoh }.
 */
/* =====================================================================
 *  SAYT QULFI — ikki qatlamli.
 *
 *  1-qatlam (DOIM ISHLAYDI, hech qanday token kerak emas):
 *     Holat KV'da `sozlama:muzlat` kalitida saqlanadi va bot
 *     `/holat` manzilida tarqatadi. Sayt shu manzilni o'qib,
 *     muzlatilgan bo'lsa ustiga qulf oynasini chiqaradi.
 *     Bir zumda ishlaydi — GitHub Pages qayta qurilishini kutmaydi.
 *
 *  2-qatlam (GH_TOKEN bo'lsa qo'shimcha):
 *     GitHub Actions oqimi `holat.json` ni o'zgartiradi. Bu qattiqroq
 *     qulf, lekin 1-2 daqiqa vaqt oladi.
 * ===================================================================== */

/** Sayt muzlatilganmi? */
async function muzlatilganmi(env) {
  try {
    return (await env.BAZA.get("sozlama:muzlat")) === "1";
  } catch (xato) {
    console.error("Muzlatish holati o'qilmadi:", xato && xato.message);
    return false; // xatoda sayt OCHIQ qoladi
  }
}

/** Muzlatish holatini yozadi. */
async function muzlatishniYoz(env, muzlat) {
  await env.BAZA.put("sozlama:muzlat", muzlat ? "1" : "0");
  await env.BAZA.put("sozlama:muzlat_vaqti", hozir());
}

/** Sayt uchun JSON javob (CORS ochiq — statik sayt o'qiy oladi). */
async function holatJavobi(env) {
  const muzlat = await muzlatilganmi(env);
  let vaqt = "";
  try { vaqt = (await env.BAZA.get("sozlama:muzlat_vaqti")) || ""; } catch (e) {}
  return new Response(
    JSON.stringify({
      faol: !muzlat,
      sarlavha: "Sayt vaqtincha to'xtatilgan",
      xabar: "Texnik ishlar olib borilmoqda. Iltimos, keyinroq urinib ko'ring.",
      yangilangan: vaqt,
    }),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}

async function githubOqimi(env, holat) {
  if (!env.GH_TOKEN) return { ok: false, izoh: "GH_TOKEN siri qo'yilmagan." };
  if (!env.GH_REPO) return { ok: false, izoh: "GH_REPO o'zgaruvchisi berilmagan." };

  const oqim = env.GH_OQIM || "muzlat.yml";
  const shox = env.GH_SHOX || "main";
  const manzil = `https://api.github.com/repos/${env.GH_REPO}/actions/workflows/${oqim}/dispatches`;

  try {
    const javob = await fetch(manzil, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GH_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "xalq-pedagogikasi-bot",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref: shox, inputs: { holat } }),
    });
    if (javob.status === 204) return { ok: true, izoh: "OK" };
    const matn = await javob.text();
    return { ok: false, izoh: `GitHub javobi ${javob.status}: ${matn.slice(0, 300)}` };
  } catch (xato) {
    console.error("GitHub so'rovida xato:", xato && xato.message);
    return { ok: false, izoh: `Tarmoq xatosi: ${xato && xato.message}` };
  }
}

async function buyruqMuzlat(tg, env, xabar) {
  await tg.yubor(xabar.chat.id, "⏳ Sayt muzlatilmoqda…");

  // 1-qatlam — doim ishlaydi.
  await muzlatishniYoz(env, true);

  // 2-qatlam — GH_TOKEN bo'lsa qo'shimcha (qattiq qulf).
  const gh = env.GH_TOKEN ? await githubOqimi(env, "muzlat") : null;

  await tg.yubor(
    xabar.chat.id,
    "🔒 <b>Sayt muzlatildi.</b>\n\n" +
      "Ziyoratchilar sahifani ochsa qulf oynasini ko'radi — " +
      "<b>bir zumda</b>, kutish shart emas.\n\n" +
      (gh
        ? gh.ok
          ? "🔐 Qo'shimcha qattiq qulf ham yuborildi (GitHub 1–2 daqiqada yangilaydi).\n\n"
          : `⚠️ Qattiq qulf yuborilmadi: ${qalqon(gh.izoh)}\n(Asosiy qulf baribir ishlayapti.)\n\n`
        : "") +
      "Qayta ochish: «🔓 Saytni ochish» tugmasi."
  );
}

async function buyruqYoq(tg, env, xabar) {
  await tg.yubor(xabar.chat.id, "⏳ Sayt ochilmoqda…");

  await muzlatishniYoz(env, false);
  const gh = env.GH_TOKEN ? await githubOqimi(env, "yoq") : null;

  await tg.yubor(
    xabar.chat.id,
    "🔓 <b>Sayt ochildi.</b> Darslik yana ishlayapti.\n\n" +
      (gh
        ? gh.ok
          ? "🔐 Qattiq qulf ham olib tashlandi (GitHub 1–2 daqiqada yangilaydi)."
          : `⚠️ Qattiq qulfni olishda: ${qalqon(gh.izoh)}`
        : "")
  );
}

async function buyruqStatistika(tg, env, xabar) {
  const talabalar = await talabalarniOl(env);
  const natijalar = await natijalarniOl(env);

  const jamiFoiz = natijalar.reduce((yigindi, n) => yigindi + (Number(n.foiz) || 0), 0);
  const ortacha = natijalar.length ? Math.round((jamiFoiz / natijalar.length) * 10) / 10 : 0;
  const bugungiSana = bugun();
  const bugungi = natijalar.filter((n) => String(n.sana || "").startsWith(bugungiSana)).length;
  const testlar = natijalar.filter((n) => n.tur === "test").length;
  const faol = await botFaolmi(env);

  await tg.yubor(
    xabar.chat.id,
    "📉 <b>Umumiy statistika</b>\n\n" +
      `👥 Talabalar: <b>${talabalar.length}</b>\n` +
      `📊 Natijalar: <b>${natijalar.length}</b> ` +
      `(test: ${testlar}, o'yin: ${natijalar.length - testlar})\n` +
      `📅 Bugun: <b>${bugungi}</b> ta natija\n` +
      `🎯 O'rtacha ball: <b>${ortacha}%</b>\n` +
      `🤖 Bot holati: ${faol ? "🟢 yoqilgan" : "🔴 to'xtatilgan"}\n` +
      `🕓 ${hozir()}`
  );
}

async function buyruqEksport(tg, env, xabar) {
  const natijalar = await natijalarniOl(env);
  if (natijalar.length === 0) {
    await tg.yubor(xabar.chat.id, "Eksport uchun ma'lumot yo'q.");
    return;
  }

  // Talabalarning to'liq ma'lumotini kalit bo'yicha xaritaga solamiz.
  const talabalar = await talabalarniOl(env);
  const xarita = {};
  for (const t of talabalar) xarita[t.tg_id] = t;

  const maydon = (qiymat) => {
    const matn = String(qiymat === null || qiymat === undefined ? "" : qiymat);
    return /[";\n]/.test(matn) ? `"${matn.replace(/"/g, '""')}"` : matn;
  };

  const satrlar = [
    ["Familiya", "Ism", "Telefon", "O'qish joyi", "Kurs", "Yo'nalish",
      "Modul", "Modul nomi", "Turi", "To'g'ri", "Jami", "Foiz", "Sana"].join(";"),
  ];
  // Eskisidan yangisiga qarab yozamiz.
  for (const n of natijalar.slice().reverse()) {
    const t = xarita[String(n.tg_id)] || {};
    satrlar.push(
      [
        t.familiya, t.ism, t.telefon, t.oqish_joyi, t.kurs, t.yonalish,
        n.modul, MODUL_NOMLARI[n.modul] || "",
        n.tur === "oyin" ? "o'yin" : "test",
        n.togri, n.jami, n.foiz, n.sana,
      ].map(maydon).join(";")
    );
  }

  const csv = satrlar.join("\n");
  const izoh = `📄 Jami ${natijalar.length} ta natija · ${hozir()}`;
  const javob = await tg.hujjatYubor(xabar.chat.id, `natijalar-${bugun()}.csv`, csv, izoh);

  // Hujjat yuborilmasa — CSV ni oddiy matn sifatida yuboramiz.
  if (!javob || !javob.ok) {
    await tg.yubor(xabar.chat.id, izoh);
    await tg.uzunYubor(xabar.chat.id, `<pre>${qalqon(csv)}</pre>`);
  }
}

/* ---------- Buyruq menyulari (har rol o'zinikini ko'radi) ---------- */

const ODDIY_MENYU = [
  { command: "start", description: "Ro'yxatdan o'tish / darslikni ochish" },
  { command: "natijam", description: "Mening natijalarim" },
  { command: "yangila", description: "Ma'lumotlarni yangilash" },
  { command: "bekor", description: "Bekor qilish" },
  { command: "yordam", description: "Yordam" },
];

const MUALLIF_MENYU = ODDIY_MENYU.concat([
  { command: "natijalar", description: "Oxirgi natijalar" },
  { command: "talabalar", description: "Talabalar ro'yxati" },
  { command: "hisobot", description: "Modullar bo'yicha hisobot" },
  { command: "qidir", description: "Talabani qidirish" },
  { command: "statistika", description: "Umumiy statistika" },
  { command: "eksport", description: "CSV eksport" },
  { command: "royxat", description: "Talabalar ro'yxati (kirish nazorati)" },
  { command: "royxat_qosh", description: "Ro'yxatga talaba qo'shish" },
  { command: "royxat_kor", description: "Ro'yxatni ko'rish" },
  { command: "royxat_yon", description: "Kirish nazoratini yoqish" },
  { command: "royxat_ochir", description: "Kirish nazoratini o'chirish" },
  { command: "royxat_tozala", description: "Ro'yxatni tozalash" },
]);

// Super admin — muallifning hamma imkoniyati + botni va saytni
// to'xtatish/yoqish. Bu buyruqlar MUALLIFDA YO'Q.
const ADMIN_MENYU = MUALLIF_MENYU.concat([
  { command: "boshla", description: "Botni yoqish" },
  { command: "toxtat", description: "Botni to'xtatish" },
  { command: "muzlat", description: "Saytni muzlatish" },
  { command: "yoq", description: "Saytni qayta ochish" },
  { command: "sozla", description: "Menyularni o'rnatish" },
]);

/** /sozla — buyruq menyularini rollar bo'yicha o'rnatadi (faqat admin). */
async function buyruqSozla(tg, env, xabar) {
  const xatolar = [];

  const oddiy = await tg.soro("setMyCommands", {
    commands: ODDIY_MENYU,
    scope: { type: "default" },
  });
  if (!oddiy.ok) xatolar.push(`oddiy: ${oddiy.description}`);

  if (env.MUALLIF_ID) {
    const muallif = await tg.soro("setMyCommands", {
      commands: MUALLIF_MENYU,
      scope: { type: "chat", chat_id: Number(env.MUALLIF_ID) },
    });
    if (!muallif.ok) xatolar.push(`muallif: ${muallif.description}`);
  }

  if (env.ADMIN_ID) {
    const admin = await tg.soro("setMyCommands", {
      commands: ADMIN_MENYU,
      scope: { type: "chat", chat_id: Number(env.ADMIN_ID) },
    });
    if (!admin.ok) xatolar.push(`admin: ${admin.description}`);
  }

  await tg.yubor(
    xabar.chat.id,
    xatolar.length === 0
      ? "✅ Buyruq menyulari o'rnatildi.\n\n" +
          "• Oddiy foydalanuvchi — 5 ta buyruq\n" +
          `• Muallif (${qalqon(env.MUALLIF_ID)}) — ${MUALLIF_MENYU.length} ta\n` +
          `• Admin (${qalqon(env.ADMIN_ID)}) — ${ADMIN_MENYU.length} ta\n\n` +
          "Telegramda menyu bir-ikki daqiqada yangilanadi."
      : `⚠️ Ba'zi menyular o'rnatilmadi:\n${qalqon(xatolar.join("\n"))}`
  );
}

/* =====================================================================
 *  12-BO'LIM. BUYRUQLARNI TAQSIMLASH
 * ===================================================================== */

async function ruxsatYoq(tg, xabar) {
  await tg.yubor(xabar.chat.id, "⛔️ Bu buyruq siz uchun mavjud emas.");
}

/**
 * Buyruqni bajaradi. Buyruq tanilmasa false qaytaradi.
 */
async function buyruqniBajar(tg, env, xabar, buyruq, arg) {
  const tgId = xabar.from.id;

  switch (buyruq) {
    /* ---- Barcha foydalanuvchilar ---- */
    case "start":
      await buyruqStart(tg, env, xabar);
      return true;
    case "yangila":
      await buyruqYangila(tg, env, xabar);
      return true;
    case "bekor":
      await buyruqBekor(tg, env, xabar);
      return true;
    case "natijam":
      await buyruqNatijam(tg, env, xabar);
      return true;
    case "yordam":
    case "help":
      await buyruqYordam(tg, env, xabar);
      return true;

    /* ---- Muallif ---- */
    case "natijalar":
    case "talabalar":
    case "hisobot":
    case "qidir":
    case "statistika":
    case "eksport":
    case "royxat":
    case "royxat_qosh":
    case "royxat_kor":
    case "royxat_yon":
    case "royxat_ochir":
    case "royxat_tozala": {
      if (!muallifMi(env, tgId)) {
        await ruxsatYoq(tg, xabar);
        return true;
      }
      if (buyruq === "natijalar") await buyruqNatijalar(tg, env, xabar, arg);
      else if (buyruq === "talabalar") await buyruqTalabalar(tg, env, xabar);
      else if (buyruq === "hisobot") await buyruqHisobot(tg, env, xabar);
      else if (buyruq === "statistika") await buyruqStatistika(tg, env, xabar);
      else if (buyruq === "eksport") await buyruqEksport(tg, env, xabar);
      else if (buyruq === "royxat") await buyruqRoyxat(tg, env, xabar);
      else if (buyruq === "royxat_qosh") await buyruqRoyxatQosh(tg, env, xabar);
      else if (buyruq === "royxat_kor") await buyruqRoyxatKor(tg, env, xabar);
      else if (buyruq === "royxat_yon") await buyruqRoyxatHolat(tg, env, xabar, true);
      else if (buyruq === "royxat_ochir") await buyruqRoyxatHolat(tg, env, xabar, false);
      else if (buyruq === "royxat_tozala") await buyruqRoyxatTozala(tg, env, xabar);
      else await buyruqQidir(tg, env, xabar, arg);
      return true;
    }

    /* ---- Super admin ---- */
    case "boshla":
    case "toxtat":
    case "muzlat":
    case "yoq":
    case "sozla": {
      if (!adminMi(env, tgId)) {
        await ruxsatYoq(tg, xabar);
        return true;
      }
      if (buyruq === "boshla") await buyruqBoshla(tg, env, xabar);
      else if (buyruq === "toxtat") await buyruqToxtat(tg, env, xabar);
      else if (buyruq === "muzlat") await buyruqMuzlat(tg, env, xabar);
      else if (buyruq === "yoq") await buyruqYoq(tg, env, xabar);
      else await buyruqSozla(tg, env, xabar);
      return true;
    }

    default:
      return false;
  }
}

/* =====================================================================
 *  13-BO'LIM. YANGILANISHNI QAYTA ISHLASH
 * ===================================================================== */

async function xabarniQaytaIshla(tg, env, xabar) {
  const chatId = xabar.chat.id;
  const tgId = xabar.from.id;

  // Bot to'xtatilgan bo'lsa — faqat muallif va admin ishlata oladi.
  if (!muallifMi(env, tgId) && !(await botFaolmi(env))) {
    await tg.yubor(
      chatId,
      "🔴 Bot vaqtincha ishlamayapti.\n\n" +
        "Texnik ishlar olib borilmoqda. Iltimos, birozdan keyin urinib ko'ring.",
      { reply_markup: TUGMANI_OCHIR }
    );
    return;
  }

  // 1) Mini App'dan kelgan natija.
  if (xabar.web_app_data && xabar.web_app_data.data) {
    await natijaniQaytaIshla(tg, env, xabar, xabar.web_app_data.data, "web_app");
    return;
  }

  const matn = (xabar.text || "").trim();

  // 2) Buyruqlar.
  if (matn.startsWith("/")) {
    const moslik = matn.match(/^\/([A-Za-z0-9_]+)(?:@\S+)?(?:\s+([\s\S]+))?$/);
    if (moslik) {
      const bajarildi = await buyruqniBajar(tg, env, xabar, moslik[1].toLowerCase(), moslik[2]);
      if (bajarildi) return;
    }
    await tg.yubor(
      chatId,
      "❓ Bunday buyruq yo'q. Buyruqlar ro'yxati: /yordam"
    );
    return;
  }

  // 2a) Muallif ro'yxat yubormoqda — matn yoki hujjat.
  const kutish = await holatOq(env, tgId);
  if (kutish && kutish.qadam === "oq_royxat_kutish" && muallifMi(env, tgId) &&
      !tugmaMi(matn)) {
    if (xabar.document) {
      const fayl = await hujjatMatniniOq(env, xabar.document);
      if (fayl.xato) {
        await tg.yubor(chatId, fayl.xato);
        return;
      }
      await royxatMatniniQabulQil(tg, env, xabar, fayl.matn);
      return;
    }
    if (matn) {
      await royxatMatniniQabulQil(tg, env, xabar, matn);
      return;
    }
  }

  // 2a-2) Muallif to'g'ridan-to'g'ri .txt/.csv fayl tashladi.
  if (xabar.document && muallifMi(env, tgId)) {
    const nomi = String(xabar.document.file_name || "").toLowerCase();
    if (nomi.endsWith(".txt") || nomi.endsWith(".csv")) {
      const fayl = await hujjatMatniniOq(env, xabar.document);
      if (fayl.xato) {
        await tg.yubor(chatId, fayl.xato);
        return;
      }
      await royxatMatniniQabulQil(tg, env, xabar, fayl.matn);
      return;
    }
  }

  // 2a-3) Muallif talabani qidirmoqda — keyingi matn qidiruv so'zi.
  if (kutish && kutish.qadam === "qidiruv_kutish" && muallifMi(env, tgId) &&
      matn && !tugmaMi(matn)) {
    await holatOchir(env, tgId);
    await buyruqQidir(tg, env, xabar, matn);
    return;
  }

  // 2b) Doimiy klaviatura tugmalari — rol bo'yicha.
  if (tugmaMi(matn)) {
    // Tugma bosilgan bo'lsa, yarim qolgan amal bekor qilinadi.
    if (kutish && !QADAMLAR.includes(kutish.qadam)) await holatOchir(env, tgId);

    const admin = adminMi(env, tgId);
    const muallif = muallifMi(env, tgId);

    /* ---- Hamma uchun ---- */
    if (matn === T.YORDAM) { await buyruqYordam(tg, env, xabar); return; }
    if (matn === T.NATIJAM) { await buyruqNatijam(tg, env, xabar); return; }

    /* ---- FAQAT super admin: botni va saytni boshqarish ---- */
    if (matn === T.BOT_TOXTAT || matn === T.BOT_YOQ ||
        matn === T.SAYT_MUZLAT || matn === T.SAYT_OCH || matn === T.SOZLA) {
      if (!admin) { await ruxsatYoq(tg, xabar); return; }
      if (matn === T.BOT_TOXTAT) await buyruqToxtat(tg, env, xabar);
      else if (matn === T.BOT_YOQ) await buyruqBoshla(tg, env, xabar);
      else if (matn === T.SAYT_MUZLAT) await buyruqMuzlat(tg, env, xabar);
      else if (matn === T.SAYT_OCH) await buyruqYoq(tg, env, xabar);
      else await buyruqSozla(tg, env, xabar);
      return;
    }

    /* ---- Muallif va super admin: talabalar va natijalar ---- */
    if (matn === T.JADVAL || matn === T.TALABALAR || matn === T.NATIJALAR ||
        matn === T.HISOBOT || matn === T.STATISTIKA || matn === T.EKSPORT ||
        matn === T.QIDIR) {
      if (!muallif) { await ruxsatYoq(tg, xabar); return; }
      if (matn === T.TALABALAR) await buyruqTalabalar(tg, env, xabar);
      else if (matn === T.NATIJALAR) await buyruqNatijalar(tg, env, xabar);
      else if (matn === T.HISOBOT) await buyruqHisobot(tg, env, xabar);
      else if (matn === T.STATISTIKA) await buyruqStatistika(tg, env, xabar);
      else if (matn === T.EKSPORT) await buyruqEksport(tg, env, xabar);
      else if (matn === T.JADVAL) await tugmaJadval(tg, env, xabar);
      else {
        await holatYoz(env, tgId, { qadam: "qidiruv_kutish", malumot: {} });
        await tg.yubor(
          xabar.chat.id,
          "🔎 Qidirmoqchi bo'lgan talabaning <b>ismini yoki familiyasini</b> yozing.\n\n" +
            "Bekor qilish: /bekor"
        );
      }
      return;
    }

    /* ---- Darslikni ochish tugmasi web_app bo'lgani uchun bu yerga
           tushmaydi; boshqa har qanday tugma uchun yordam. ---- */
    await buyruqYordam(tg, env, xabar);
    return;
  }

  // 3) Ro'yxatdan o'tish suhbati davom etayotgan bo'lsa.
  const holat = await holatOq(env, tgId);
  if (holat && QADAMLAR.includes(holat.qadam)) {
    await royxatQadami(tg, env, xabar, holat);
    return;
  }

  // 4) Matn ko'rinishidagi natija kodi (zaxira yo'l): XP-3-8-10
  if (/^(?:XP|xp)[-_ ]?\d/.test(matn)) {
    await natijaniQaytaIshla(tg, env, xabar, matn, "matn");
    return;
  }

  // 5) Boshqa har qanday xabar.
  const talaba = await talabaOq(env, tgId);
  await tg.yubor(
    chatId,
    talaba
      ? "Darslikni ochish uchun pastdagi «📚 Darslikni ochish» " +
          "tugmasini bosing.\nBuyruqlar: /yordam"
      : "Avval ro'yxatdan o'ting — /start buyrug'ini bosing.",
    { reply_markup: talaba ? await tugmalar(env, xabar.from.id) : TUGMANI_OCHIR }
  );
}

/** Telegram yuborgan yangilanishni tahlil qiladi. */
async function yangilanishniQaytaIshla(update, env) {
  const tg = new Telegram(env.TG_TOKEN);

  const xabar = update.message || update.edited_message;
  if (!xabar || !xabar.chat || !xabar.from || xabar.from.is_bot) return;
  // Faqat shaxsiy suhbat.
  if (xabar.chat.type !== "private") return;

  try {
    await xabarniQaytaIshla(tg, env, xabar);
  } catch (xato) {
    console.error("Xabarni qayta ishlashda xato:", (xato && xato.stack) || xato);
    try {
      await tg.yubor(
        xabar.chat.id,
        "⚠️ Kutilmagan xatolik yuz berdi. Iltimos, biroz o'tib " +
          "qaytadan urinib ko'ring yoki /start bosing."
      );
    } catch (ikkinchiXato) {
      console.error("Xatolik xabarini yuborib bo'lmadi:", ikkinchiXato && ikkinchiXato.message);
    }
  }
}

/* =====================================================================
 *  14-BO'LIM. HOLAT SAHIFASI (GET so'rov)
 * ===================================================================== */

function holatSahifasi(env) {
  const sozlangan = {
    "Bot tokeni (TG_TOKEN)": Boolean(env.TG_TOKEN),
    "Webhook siri (SECRET)": Boolean(env.SECRET),
    "Ma'lumotlar bazasi (BAZA)": Boolean(env.BAZA),
    "Muallif ID (MUALLIF_ID)": Boolean(env.MUALLIF_ID),
    "Admin ID (ADMIN_ID)": Boolean(env.ADMIN_ID),
    "Darslik manzili (WEBAPP_URL)": Boolean(env.WEBAPP_URL),
    "GitHub tokeni (GH_TOKEN)": Boolean(env.GH_TOKEN),
  };

  const qatorlar = Object.entries(sozlangan)
    .map(([nom, bor]) => `<li>${bor ? "✅" : "⚠️"} ${qalqon(nom)}</li>`)
    .join("");

  const sahifa =
    `<!doctype html><html lang="uz"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<title>Xalq pedagogikasi — bot</title>` +
    `<style>body{font-family:system-ui,sans-serif;max-width:36rem;margin:3rem auto;` +
    `padding:0 1rem;line-height:1.6;color:#1f2937}h1{font-size:1.3rem}` +
    `ul{padding-left:1.2rem}code{background:#f3f4f6;padding:.1rem .3rem;border-radius:.2rem}` +
    `</style></head><body>` +
    `<h1>🤖 «Xalq pedagogikasi» Telegram boti</h1>` +
    `<p>Bot ishlayapti. Bu sahifa faqat holatni ko'rsatadi — ` +
    `Telegram so'rovlari <code>POST</code> orqali qabul qilinadi.</p>` +
    `<h2 style="font-size:1rem">Sozlamalar</h2><ul>${qatorlar}</ul>` +
    `<p>Vaqt (Toshkent): <b>${hozir()}</b></p>` +
    `</body></html>`;

  return new Response(sahifa, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

/* =====================================================================
 *  15-BO'LIM. WORKER KIRISH NUQTASI
 * ===================================================================== */

export default {
  async fetch(request, env, ctx) {
    try {
      const manzil = new URL(request.url);

      // Webhook'ni o'rnatish/tekshirish — faqat sir bilan.
      // Bot tokeni Cloudflare ichidan tashqariga chiqmaydi.
      if (manzil.pathname === "/webhook-ornat") {
        if (!env.SECRET || !sirTeng(manzil.searchParams.get("sir"), env.SECRET)) {
          return new Response("Ruxsat yo'q", { status: 401 });
        }
        if (!env.TG_TOKEN) {
          return new Response("TG_TOKEN qo'yilmagan", { status: 500 });
        }
        const tayin = {
          url: manzil.origin,
          secret_token: env.SECRET,
          drop_pending_updates: true,
          allowed_updates: ["message", "edited_message", "callback_query"],
        };
        const j1 = await fetch(
          "https://api.telegram.org/bot" + env.TG_TOKEN + "/setWebhook",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tayin),
          }
        ).then((r) => r.json());
        const j2 = await fetch(
          "https://api.telegram.org/bot" + env.TG_TOKEN + "/getWebhookInfo"
        ).then((r) => r.json());
        const j3 = await fetch(
          "https://api.telegram.org/bot" + env.TG_TOKEN + "/getMe"
        ).then((r) => r.json());
        return new Response(
          JSON.stringify({ setWebhook: j1, webhookInfo: j2, bot: j3 }, null, 2),
          { headers: { "Content-Type": "application/json; charset=utf-8" } }
        );
      }

      // Rasm tanish modelini sinash — faqat sir bilan (diagnostika).
      if (manzil.pathname === "/rasm-sinov") {
        if (!env.SECRET || !sirTeng(manzil.searchParams.get("sir"), env.SECRET)) {
          return new Response("Ruxsat yo'q", { status: 401 });
        }
        if (!env.AI) return new Response("AI ulanmagan", { status: 500 });
        const rasmManzil = manzil.searchParams.get("rasm");
        if (!rasmManzil) return new Response("rasm=... kerak", { status: 400 });
        const r = await fetch(rasmManzil, {
          headers: { "User-Agent": "xalq-pedagogikasi-bot/1.0 (diagnostika)" },
        });
        if (!r.ok) return new Response("Rasm yuklanmadi: " + r.status, { status: 502 });
        const bayt = [...new Uint8Array(await r.arrayBuffer())];
        const natija = await env.AI.run("@cf/facebook/detr-resnet-50", { image: bayt });
        const royxat = Array.isArray(natija) ? natija : (natija && natija.result) || [];
        const muhim = royxat
          .filter((t) => (Number(t && t.score) || 0) >= 0.55)
          .map((t) => ({ yorliq: t.label, ball: Math.round(t.score * 100) / 100 }));
        return new Response(
          JSON.stringify({ bayt: bayt.length, topilgan: muhim }, null, 2),
          { headers: { "Content-Type": "application/json; charset=utf-8" } }
        );
      }

      // Sayt qulfi holati — ochiq manzil, sayt shuni o'qiydi.
      if (manzil.pathname === "/holat") {
        if (request.method === "OPTIONS") {
          return new Response(null, {
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, OPTIONS",
            },
          });
        }
        return holatJavobi(env);
      }

      // GET — qisqa holat sahifasi.
      if (request.method === "GET" || request.method === "HEAD") {
        return holatSahifasi(env);
      }

      if (request.method !== "POST") {
        return new Response("Faqat POST qabul qilinadi.", { status: 405 });
      }

      // Webhook siri tekshiriladi — mos kelmasa 401.
      const sir = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
      if (!env.SECRET || !sirTeng(sir, env.SECRET)) {
        console.error("Webhook siri mos kelmadi — so'rov rad etildi.");
        return new Response("Ruxsat yo'q", { status: 401 });
      }

      if (!env.TG_TOKEN) {
        console.error("TG_TOKEN siri qo'yilmagan.");
        return new Response("ok");
      }

      let update;
      try {
        update = await request.json();
      } catch (xato) {
        console.error("JSON o'qilmadi:", xato && xato.message);
        return new Response("ok");
      }

      await yangilanishniQaytaIshla(update, env);
    } catch (xato) {
      // Telegram qayta-qayta yubormasligi uchun har doim 200 qaytaramiz.
      console.error("Umumiy xato:", (xato && xato.stack) || xato);
    }
    return new Response("ok");
  },
};
