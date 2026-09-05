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
function darslikTugmasi(env) {
  const manzil = String(env.WEBAPP_URL || "").trim();
  if (!manzil.startsWith("https://")) return TUGMANI_OCHIR;
  return {
    keyboard: [[{ text: "📚 Darslikni ochish", web_app: { url: manzil } }]],
    resize_keyboard: true,
    is_persistent: true,
  };
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
    { reply_markup: darslikTugmasi(env) }
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

  // Allaqachon ro'yxatdan o'tgan bo'lsa — darhol Mini App tugmasi.
  if (talaba) {
    await holatOchir(env, foydalanuvchi.id);
    await tg.yubor(
      chatId,
      `${salom}\nSiz ro'yxatdan o'tgansiz:\n` +
        `👤 ${qalqon(talaba.ism)} ${qalqon(talaba.familiya)}\n` +
        `🏫 ${qalqon(talaba.oqish_joyi)}\n` +
        `📚 ${qalqon(talaba.kurs)}, ${qalqon(talaba.yonalish)}\n\n` +
        "Pastdagi «📚 Darslikni ochish» tugmasini bosing.\n" +
        "Ma'lumotlaringizni yangilash: /yangila",
      { reply_markup: darslikTugmasi(env) }
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
    { reply_markup: talaba ? darslikTugmasi(env) : TUGMANI_OCHIR }
  );
}

async function buyruqNatijam(tg, env, xabar) {
  const tgId = xabar.from.id;
  const talaba = await talabaOq(env, tgId);
  if (!talaba) {
    await tg.yubor(xabar.chat.id, "Siz hali ro'yxatdan o'tmagansiz. /start bosing.");
    return;
  }

  const kalitlar = await kalitlarniOl(env, `n:${tgId}:`);
  if (kalitlar.length === 0) {
    await tg.yubor(
      xabar.chat.id,
      "Sizda hali natija yo'q. Darslikdagi testlarni yechib ko'ring."
    );
    return;
  }
  kalitlar.sort((a, b) => kalitVaqti(b.name) - kalitVaqti(a.name));

  const satrlar = ["📊 <b>Sizning oxirgi natijalaringiz</b>\n"];
  for (const kalit of kalitlar.slice(0, 20)) {
    const n = kalit.metadata || {};
    satrlar.push(
      `📘 ${n.modul}-modul — <b>${n.foiz}%</b> ` +
        `(${n.tur === "oyin" ? "o'yin" : "test"}) · ${qalqon(n.sana)}`
    );
  }
  await tg.uzunYubor(xabar.chat.id, satrlar.join("\n"));
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
      "/qidir &lt;ism&gt; — talabani qidirish"
    );
  }
  if (adminMi(env, tgId)) {
    satrlar.push(
      "\n<b>Admin uchun</b>",
      "/boshla — botni yoqish",
      "/toxtat — botni to'xtatish",
      "/muzlat — saytni muzlatish",
      "/yoq — saytni qayta ochish",
      "/statistika — umumiy raqamlar",
      "/eksport — natijalarni CSV'da olish",
      "/sozla — buyruq menyularini o'rnatish"
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
  await tg.yubor(xabar.chat.id, "⏳ Saytni muzlatish buyrug'i yuborilmoqda…");
  const javob = await githubOqimi(env, "muzlat");
  await tg.yubor(
    xabar.chat.id,
    javob.ok
      ? "🔒 Sayt muzlatildi.\nGitHub Pages 1–2 daqiqada yangilanadi.\nQayta ochish: /yoq"
      : `⚠️ Bajarilmadi.\n${qalqon(javob.izoh)}`
  );
}

async function buyruqYoq(tg, env, xabar) {
  await tg.yubor(xabar.chat.id, "⏳ Saytni ochish buyrug'i yuborilmoqda…");
  const javob = await githubOqimi(env, "yoq");
  await tg.yubor(
    xabar.chat.id,
    javob.ok
      ? "🔓 Sayt qayta ochildi.\nGitHub Pages 1–2 daqiqada yangilanadi."
      : `⚠️ Bajarilmadi.\n${qalqon(javob.izoh)}`
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
]);

const ADMIN_MENYU = MUALLIF_MENYU.concat([
  { command: "boshla", description: "Botni yoqish" },
  { command: "toxtat", description: "Botni to'xtatish" },
  { command: "muzlat", description: "Saytni muzlatish" },
  { command: "yoq", description: "Saytni qayta ochish" },
  { command: "statistika", description: "Umumiy statistika" },
  { command: "eksport", description: "CSV eksport" },
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
    case "qidir": {
      if (!muallifMi(env, tgId)) {
        await ruxsatYoq(tg, xabar);
        return true;
      }
      if (buyruq === "natijalar") await buyruqNatijalar(tg, env, xabar, arg);
      else if (buyruq === "talabalar") await buyruqTalabalar(tg, env, xabar);
      else if (buyruq === "hisobot") await buyruqHisobot(tg, env, xabar);
      else await buyruqQidir(tg, env, xabar, arg);
      return true;
    }

    /* ---- Super admin ---- */
    case "boshla":
    case "toxtat":
    case "muzlat":
    case "yoq":
    case "statistika":
    case "eksport":
    case "sozla": {
      if (!adminMi(env, tgId)) {
        await ruxsatYoq(tg, xabar);
        return true;
      }
      if (buyruq === "boshla") await buyruqBoshla(tg, env, xabar);
      else if (buyruq === "toxtat") await buyruqToxtat(tg, env, xabar);
      else if (buyruq === "muzlat") await buyruqMuzlat(tg, env, xabar);
      else if (buyruq === "yoq") await buyruqYoq(tg, env, xabar);
      else if (buyruq === "statistika") await buyruqStatistika(tg, env, xabar);
      else if (buyruq === "eksport") await buyruqEksport(tg, env, xabar);
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
    { reply_markup: talaba ? darslikTugmasi(env) : TUGMANI_OCHIR }
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
