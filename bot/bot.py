#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
«Xalq pedagogikasi» elektron darsligi — Telegram bot.

Vazifalari:
  1. Talabalarni ro'yxatdan o'tkazish (ism, familiya, telefon, rasm,
     o'qish joyi, kurs, yo'nalish).
  2. Darslikdagi test va o'yin natijalarini qabul qilish — Telegram
     Web App (`sendData`) orqali yoki oddiy matnli kod ko'rinishida —
     va ularni darhol muallifga yuborish.
  3. Rollar: MUALLIF (natijalarni ko'radi) va ADMIN (super admin —
     botni yoqadi/o'chiradi, saytni muzlatadi, statistika va eksport).

Barcha ma'lumot `bot/malumot.sqlite` faylida saqlanadi.

MUHIM: bot tokeni hech qachon kodda saqlanmaydi — faqat muhit
o'zgaruvchisi (`TG_TOKEN`) orqali o'qiladi. Batafsil: bot/O'RNATISH.md
"""

import csv
import io
import json
import logging
import os
import re
import sqlite3
import sys
from contextlib import contextmanager
from datetime import datetime, timezone, timedelta

try:
    import httpx  # python-telegram-bot bilan birga o'rnatiladi
except ImportError:  # pragma: no cover
    httpx = None

from telegram import (
    BotCommand,
    BotCommandScopeChat,
    BotCommandScopeDefault,
    KeyboardButton,
    ReplyKeyboardMarkup,
    ReplyKeyboardRemove,
    Update,
)
from telegram.constants import ParseMode
from telegram.ext import (
    Application,
    ApplicationHandlerStop,
    CommandHandler,
    ContextTypes,
    ConversationHandler,
    MessageHandler,
    TypeHandler,
    filters,
)

# =====================================================================
#  1-BO'LIM. SOZLAMALAR (hammasi muhit o'zgaruvchilaridan)
# =====================================================================

# Bot tokeni — MAJBURIY. Kodda saqlanmaydi!
TOKEN = os.environ.get("TG_TOKEN", "").strip()

# Rollar. Sukut qiymatlari topshiriqda kelishilgan raqamlar.
MUALLIF_ID = int(os.environ.get("MUALLIF_ID", "703407068"))
ADMIN_ID = int(os.environ.get("ADMIN_ID", "1118923120"))

# Saytni muzlatish uchun GitHub sozlamalari (ixtiyoriy).
GH_TOKEN = os.environ.get("GH_TOKEN", "").strip()
GH_REPO = os.environ.get("GH_REPO", "Bunyod-arch/xalq-pedagogikasi")
GH_OQIM = os.environ.get("GH_OQIM", "muzlat.yml")
GH_SHOX = os.environ.get("GH_SHOX", "main")

# Ma'lumotlar bazasi — shu faylning yonida.
PAPKA = os.path.dirname(os.path.abspath(__file__))
BAZA_YOLI = os.environ.get("BAZA_YOLI", os.path.join(PAPKA, "malumot.sqlite"))

# Toshkent vaqti (UTC+5) — sanalarni chiroyli ko'rsatish uchun.
TOSHKENT = timezone(timedelta(hours=5))

# Jurnal (log) sozlamasi.
logging.basicConfig(
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    level=logging.INFO,
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(os.path.join(PAPKA, "bot.log"), encoding="utf-8"),
    ],
)
logging.getLogger("httpx").setLevel(logging.WARNING)
jurnal = logging.getLogger("xalq-pedagogikasi")


def hozir():
    """Toshkent vaqti bo'yicha hozirgi sana-vaqt matni."""
    return datetime.now(TOSHKENT).strftime("%Y-%m-%d %H:%M")


# =====================================================================
#  2-BO'LIM. MA'LUMOTLAR BAZASI (sqlite3 — standart kutubxona)
# =====================================================================

@contextmanager
def ulanish():
    """
    Bazaga ulanish. `with ulanish() as conn:` ko'rinishida ishlatiladi —
    blok tugagach o'zgarishlar saqlanadi va ulanish yopiladi.
    """
    conn = sqlite3.connect(BAZA_YOLI, timeout=15)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def bazani_tayyorla():
    """Jadvallarni yaratadi (agar mavjud bo'lmasa)."""
    with ulanish() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS talabalar (
                tg_id         INTEGER PRIMARY KEY,
                username      TEXT,
                ism           TEXT NOT NULL,
                familiya      TEXT NOT NULL,
                telefon       TEXT NOT NULL,
                rasm_id       TEXT,
                oqish_joyi    TEXT NOT NULL,
                kurs          TEXT NOT NULL,
                yonalish      TEXT NOT NULL,
                royxat_sanasi TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS natijalar (
                id     INTEGER PRIMARY KEY AUTOINCREMENT,
                tg_id  INTEGER NOT NULL,
                modul  INTEGER,
                foiz   REAL,
                togri  INTEGER,
                jami   INTEGER,
                tur    TEXT,
                manba  TEXT,
                sana   TEXT NOT NULL,
                FOREIGN KEY (tg_id) REFERENCES talabalar (tg_id)
            );

            CREATE TABLE IF NOT EXISTS sozlamalar (
                kalit  TEXT PRIMARY KEY,
                qiymat TEXT
            );

            CREATE INDEX IF NOT EXISTS natijalar_talaba ON natijalar (tg_id);
            """
        )
    jurnal.info("Ma'lumotlar bazasi tayyor: %s", BAZA_YOLI)


def sozlama_oq(kalit, sukut=None):
    """Sozlamalar jadvalidan bitta qiymatni o'qiydi."""
    try:
        with ulanish() as conn:
            q = conn.execute(
                "SELECT qiymat FROM sozlamalar WHERE kalit = ?", (kalit,)
            ).fetchone()
        return q["qiymat"] if q else sukut
    except sqlite3.Error as xato:
        jurnal.error("Sozlamani o'qishda xato (%s): %s", kalit, xato)
        return sukut


def sozlama_yoz(kalit, qiymat):
    """Sozlamalar jadvaliga qiymat yozadi."""
    try:
        with ulanish() as conn:
            conn.execute(
                "INSERT INTO sozlamalar (kalit, qiymat) VALUES (?, ?) "
                "ON CONFLICT(kalit) DO UPDATE SET qiymat = excluded.qiymat",
                (kalit, str(qiymat)),
            )
    except sqlite3.Error as xato:
        jurnal.error("Sozlamani yozishda xato (%s): %s", kalit, xato)


def bot_faolmi():
    """Bot yoqilganmi? (admin /toxtat bilan o'chirib qo'yishi mumkin)"""
    return sozlama_oq("bot_faol", "1") != "0"


def talaba_oq(tg_id):
    """Talabaning ma'lumotini qaytaradi yoki None."""
    try:
        with ulanish() as conn:
            return conn.execute(
                "SELECT * FROM talabalar WHERE tg_id = ?", (tg_id,)
            ).fetchone()
    except sqlite3.Error as xato:
        jurnal.error("Talabani o'qishda xato: %s", xato)
        return None


def talaba_saqla(tg_id, username, m):
    """Ro'yxatdan o'tgan talabani saqlaydi (qayta yozilishi mumkin)."""
    with ulanish() as conn:
        conn.execute(
            """
            INSERT INTO talabalar
                (tg_id, username, ism, familiya, telefon, rasm_id,
                 oqish_joyi, kurs, yonalish, royxat_sanasi)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(tg_id) DO UPDATE SET
                username      = excluded.username,
                ism           = excluded.ism,
                familiya      = excluded.familiya,
                telefon       = excluded.telefon,
                rasm_id       = excluded.rasm_id,
                oqish_joyi    = excluded.oqish_joyi,
                kurs          = excluded.kurs,
                yonalish      = excluded.yonalish,
                royxat_sanasi = excluded.royxat_sanasi
            """,
            (
                tg_id, username, m["ism"], m["familiya"], m["telefon"],
                m.get("rasm_id"), m["oqish_joyi"], m["kurs"], m["yonalish"],
                hozir(),
            ),
        )


def natija_saqla(tg_id, modul, foiz, togri, jami, tur, manba):
    """Test/o'yin natijasini saqlaydi va uning id raqamini qaytaradi."""
    with ulanish() as conn:
        kursor = conn.execute(
            "INSERT INTO natijalar (tg_id, modul, foiz, togri, jami, tur, manba, sana) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (tg_id, modul, foiz, togri, jami, tur, manba, hozir()),
        )
        return kursor.lastrowid


# =====================================================================
#  3-BO'LIM. TEKSHIRUVLAR VA YORDAMCHI FUNKSIYALAR
# =====================================================================

# Ism-familiyada ruxsat etilgan belgilar: harflar, bo'sh joy, tire, apostrof.
QOSHIMCHA_BELGILAR = set(" -'ʼ‘’`")


def ism_togrimi(matn):
    """Ism yoki familiya to'g'ri kiritilganmi?"""
    matn = (matn or "").strip()
    if not 2 <= len(matn) <= 40:
        return False
    for belgi in matn:
        if not (belgi.isalpha() or belgi in QOSHIMCHA_BELGILAR):
            return False
    return any(b.isalpha() for b in matn)


def telefonni_tozala(matn):
    """Telefon raqamini tozalaydi. To'g'ri bo'lmasa None qaytaradi."""
    if not matn:
        return None
    raqam = re.sub(r"[^\d+]", "", str(matn))
    if raqam.startswith("00"):
        raqam = "+" + raqam[2:]
    faqat_raqam = raqam.lstrip("+")
    if not faqat_raqam.isdigit() or not 9 <= len(faqat_raqam) <= 15:
        return None
    # O'zbekiston raqamlarini bir ko'rinishga keltiramiz.
    if len(faqat_raqam) == 9:
        faqat_raqam = "998" + faqat_raqam
    return "+" + faqat_raqam


def kursni_tekshir(matn):
    """«3», «3-kurs», «9-sinf» kabi javoblarni qabul qiladi."""
    matn = (matn or "").strip()
    if not 1 <= len(matn) <= 20:
        return None
    son = re.search(r"\d{1,2}", matn)
    if not son:
        return None
    raqam = int(son.group())
    if "sinf" in matn.lower():
        return "{}-sinf".format(raqam) if 1 <= raqam <= 11 else None
    if 1 <= raqam <= 6:
        return "{}-kurs".format(raqam)
    if 7 <= raqam <= 11:
        return "{}-sinf".format(raqam)
    return None


def qalqon(matn):
    """HTML uchun xavfli belgilarni almashtiradi."""
    return (
        str(matn if matn is not None else "—")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def admin_mi(tg_id):
    return tg_id == ADMIN_ID


def muallif_mi(tg_id):
    """Admin ham muallif huquqlariga ega (super admin)."""
    return tg_id in (MUALLIF_ID, ADMIN_ID)


def royxatdan_otganmi(tg_id):
    return talaba_oq(tg_id) is not None


# ---------- Klaviaturalar ----------

TELEFON_TUGMA = ReplyKeyboardMarkup(
    [[KeyboardButton("📞 Telefon raqamimni yuborish", request_contact=True)]],
    resize_keyboard=True,
    one_time_keyboard=True,
)

KURS_TUGMA = ReplyKeyboardMarkup(
    [["1-kurs", "2-kurs", "3-kurs"], ["4-kurs", "5-kurs", "6-kurs"]],
    resize_keyboard=True,
    one_time_keyboard=True,
)

OCHIR = ReplyKeyboardRemove()


# =====================================================================
#  4-BO'LIM. RO'YXATDAN O'TISH (/start suhbati)
# =====================================================================

ISM, FAMILIYA, TELEFON, RASM, OQISH_JOYI, KURS, YONALISH = range(7)


async def start(update, context):
    """/start — ro'yxatdan o'tishni boshlaydi."""
    foydalanuvchi = update.effective_user
    mavjud = talaba_oq(foydalanuvchi.id)

    salom = (
        "<b>Assalomu alaykum, {}!</b>\n\n"
        "«Xalq pedagogikasi» elektron darsligi botiga xush kelibsiz.\n"
    ).format(qalqon(foydalanuvchi.first_name))

    if mavjud:
        salom += (
            "\nSiz allaqachon ro'yxatdan o'tgansiz:\n"
            "👤 {} {}\n🏫 {}\n📚 {}, {}\n\n"
            "Ma'lumotlarni yangilash uchun quyidagi savollarga qaytadan "
            "javob bering. Bekor qilish: /bekor"
        ).format(
            qalqon(mavjud["ism"]), qalqon(mavjud["familiya"]),
            qalqon(mavjud["oqish_joyi"]), qalqon(mavjud["kurs"]),
            qalqon(mavjud["yonalish"]),
        )
    else:
        salom += (
            "\nTest natijalaringiz muallifga yetib borishi uchun avval "
            "qisqa ro'yxatdan o'tishingiz kerak.\n"
            "Istalgan paytda bekor qilish uchun: /bekor"
        )

    await update.message.reply_text(salom, parse_mode=ParseMode.HTML,
                                    reply_markup=OCHIR)
    await update.message.reply_text("1️⃣ <b>Ismingizni</b> yozing:",
                                    parse_mode=ParseMode.HTML)
    context.user_data["royxat"] = {}
    return ISM


async def ism_qabul(update, context):
    matn = update.message.text.strip()
    if not ism_togrimi(matn):
        await update.message.reply_text(
            "❌ Ism faqat harflardan iborat bo'lishi va 2–40 ta belgi "
            "bo'lishi kerak. Qaytadan yozing:"
        )
        return ISM
    context.user_data["royxat"]["ism"] = matn.title()
    await update.message.reply_text("2️⃣ <b>Familiyangizni</b> yozing:",
                                    parse_mode=ParseMode.HTML)
    return FAMILIYA


async def familiya_qabul(update, context):
    matn = update.message.text.strip()
    if not ism_togrimi(matn):
        await update.message.reply_text(
            "❌ Familiya faqat harflardan iborat bo'lishi kerak. "
            "Qaytadan yozing:"
        )
        return FAMILIYA
    context.user_data["royxat"]["familiya"] = matn.title()
    await update.message.reply_text(
        "3️⃣ <b>Telefon raqamingizni</b> yuboring.\n\n"
        "Pastdagi tugmani bosing yoki raqamni qo'lda yozing "
        "(masalan: +998901234567).",
        parse_mode=ParseMode.HTML,
        reply_markup=TELEFON_TUGMA,
    )
    return TELEFON


async def telefon_qabul(update, context):
    """Telefon — «contact» tugmasi orqali yoki matn ko'rinishida."""
    xabar = update.message
    xom = xabar.contact.phone_number if xabar.contact else xabar.text
    raqam = telefonni_tozala(xom)
    if not raqam:
        await xabar.reply_text(
            "❌ Raqam noto'g'ri. Masalan: +998901234567\n"
            "Yoki pastdagi tugmani bosing.",
            reply_markup=TELEFON_TUGMA,
        )
        return TELEFON
    context.user_data["royxat"]["telefon"] = raqam
    await xabar.reply_text(
        "4️⃣ Endi <b>rasmingizni</b> yuboring (bitta surat).\n\n"
        "Rasm hujjat (fayl) sifatida emas, oddiy surat sifatida "
        "yuborilishi kerak.",
        parse_mode=ParseMode.HTML,
        reply_markup=OCHIR,
    )
    return RASM


async def rasm_qabul(update, context):
    """Faqat surat qabul qilinadi; eng katta o'lchamdagi file_id saqlanadi."""
    if not update.message.photo:
        await update.message.reply_text(
            "❌ Bu surat emas. Iltimos, rasmni <b>surat</b> sifatida "
            "yuboring (fayl yoki matn emas).",
            parse_mode=ParseMode.HTML,
        )
        return RASM
    context.user_data["royxat"]["rasm_id"] = update.message.photo[-1].file_id
    await update.message.reply_text(
        "5️⃣ <b>O'qish joyingizni</b> yozing (muassasa to'liq nomi):",
        parse_mode=ParseMode.HTML,
    )
    return OQISH_JOYI


async def oqish_joyi_qabul(update, context):
    matn = update.message.text.strip()
    if not 3 <= len(matn) <= 120:
        await update.message.reply_text(
            "❌ Muassasa nomi 3–120 ta belgi bo'lishi kerak. Qaytadan yozing:"
        )
        return OQISH_JOYI
    context.user_data["royxat"]["oqish_joyi"] = matn
    await update.message.reply_text(
        "6️⃣ <b>Kursingizni</b> tanlang yoki yozing.\n\n"
        "Oliy ta'lim uchun: 1–6-kurs. Maktab o'quvchisi bo'lsangiz "
        "«9-sinf» kabi yozing.",
        parse_mode=ParseMode.HTML,
        reply_markup=KURS_TUGMA,
    )
    return KURS


async def kurs_qabul(update, context):
    kurs = kursni_tekshir(update.message.text)
    if not kurs:
        await update.message.reply_text(
            "❌ Tushunarsiz. 1 dan 6 gacha kurs raqamini yoki «9-sinf» "
            "ko'rinishida sinfni yozing:",
            reply_markup=KURS_TUGMA,
        )
        return KURS
    context.user_data["royxat"]["kurs"] = kurs
    await update.message.reply_text(
        "7️⃣ <b>Ta'lim yo'nalishingizni</b> yozing\n"
        "(masalan: Boshlang'ich ta'lim):",
        parse_mode=ParseMode.HTML,
        reply_markup=OCHIR,
    )
    return YONALISH


async def yonalish_qabul(update, context):
    """Oxirgi qadam — ma'lumot bazaga yoziladi va muallifga xabar boradi."""
    matn = update.message.text.strip()
    if not 3 <= len(matn) <= 120:
        await update.message.reply_text(
            "❌ Yo'nalish nomi 3–120 ta belgi bo'lishi kerak. Qaytadan yozing:"
        )
        return YONALISH

    malumot = context.user_data.get("royxat", {})
    malumot["yonalish"] = matn
    foydalanuvchi = update.effective_user

    try:
        talaba_saqla(foydalanuvchi.id, foydalanuvchi.username, malumot)
    except (sqlite3.Error, KeyError) as xato:
        jurnal.exception("Ro'yxatni saqlashda xato: %s", xato)
        await update.message.reply_text(
            "⚠️ Ma'lumotni saqlashda xatolik yuz berdi. "
            "Iltimos, /start bilan qaytadan urinib ko'ring."
        )
        context.user_data.pop("royxat", None)
        return ConversationHandler.END

    context.user_data.pop("royxat", None)

    await update.message.reply_text(
        "✅ <b>Ro'yxatdan o'tdingiz!</b>\n\n"
        "👤 Ism: {}\n"
        "👤 Familiya: {}\n"
        "📞 Telefon: {}\n"
        "🏫 O'qish joyi: {}\n"
        "📚 Kurs: {}\n"
        "🎓 Yo'nalish: {}\n\n"
        "Endi darslikdagi testlarni yechishingiz mumkin — natijalar "
        "avtomatik muallifga yuboriladi.\n"
        "O'z natijalaringizni ko'rish: /natijam".format(
            qalqon(malumot["ism"]), qalqon(malumot["familiya"]),
            qalqon(malumot["telefon"]), qalqon(malumot["oqish_joyi"]),
            qalqon(malumot["kurs"]), qalqon(malumot["yonalish"]),
        ),
        parse_mode=ParseMode.HTML,
        reply_markup=OCHIR,
    )

    # Muallifga yangi talaba haqida xabar (rasm bilan).
    sarlavha = (
        "🆕 <b>Yangi talaba ro'yxatdan o'tdi</b>\n\n"
        "👤 {} {}\n📞 {}\n🏫 {}\n📚 {}\n🎓 {}\n🕓 {}"
    ).format(
        qalqon(malumot["familiya"]), qalqon(malumot["ism"]),
        qalqon(malumot["telefon"]), qalqon(malumot["oqish_joyi"]),
        qalqon(malumot["kurs"]), qalqon(malumot["yonalish"]), hozir(),
    )
    await muallifga_yubor(context, sarlavha, rasm_id=malumot.get("rasm_id"))
    return ConversationHandler.END


async def bekor(update, context):
    """/bekor — ro'yxatdan o'tishni to'xtatadi."""
    context.user_data.pop("royxat", None)
    await update.message.reply_text(
        "🚫 Bekor qilindi. Qaytadan boshlash uchun: /start",
        reply_markup=OCHIR,
    )
    return ConversationHandler.END


async def notogri_qadam(update, context):
    """Suhbat davomida kutilmagan turdagi xabar kelsa."""
    await update.message.reply_text(
        "❌ Iltimos, savolga mos javob yuboring yoki /bekor bosing."
    )


# =====================================================================
#  5-BO'LIM. TEST NATIJALARI
# =====================================================================

async def muallifga_yubor(context, matn, rasm_id=None):
    """Xabarni muallifga (va admin boshqa odam bo'lsa, unga ham) yuboradi."""
    qabul_qiluvchilar = [MUALLIF_ID]
    for kimga in qabul_qiluvchilar:
        try:
            if rasm_id:
                await context.bot.send_photo(
                    chat_id=kimga, photo=rasm_id, caption=matn,
                    parse_mode=ParseMode.HTML,
                )
            else:
                await context.bot.send_message(
                    chat_id=kimga, text=matn, parse_mode=ParseMode.HTML,
                )
        except Exception as xato:  # noqa: BLE001 — bot to'xtab qolmasligi kerak
            jurnal.error("Muallifga (%s) xabar yuborilmadi: %s", kimga, xato)


def natijani_ajrat(xom):
    """
    Kelgan ma'lumotni {modul, foiz, togri, jami, tur} ko'rinishiga keltiradi.

    Ikkita ko'rinish qo'llab-quvvatlanadi:
      1) JSON: {"modul": 3, "foiz": 80, "togri": 8, "jami": 10, "tur": "test"}
      2) Kod:  XP-3-8-10  yoki  XP-3-8-10-oyin  (modul-to'g'ri-jami[-tur])

    To'g'ri bo'lmasa None qaytaradi.
    """
    xom = (xom or "").strip()
    if not xom:
        return None

    malumot = None

    # 1) JSON ko'rinishi
    if xom.startswith("{"):
        try:
            malumot = json.loads(xom)
        except (ValueError, TypeError):
            return None
        if not isinstance(malumot, dict):
            return None

    # 2) Kod ko'rinishi (zaxira yo'l)
    if malumot is None:
        moslik = re.match(
            r"^(?:XP|xp)[-_ ]?(\d{1,2})[-_ ](\d{1,4})[-_ ](\d{1,4})"
            r"(?:[-_ ]([A-Za-z]+))?$",
            xom,
        )
        if not moslik:
            return None
        malumot = {
            "modul": moslik.group(1),
            "togri": moslik.group(2),
            "jami": moslik.group(3),
            "tur": (moslik.group(4) or "test").lower(),
        }

    def son(kalit, sukut=None):
        qiymat = malumot.get(kalit, sukut)
        try:
            return float(qiymat)
        except (TypeError, ValueError):
            return None

    modul = son("modul")
    togri = son("togri")
    jami = son("jami")
    foiz = son("foiz")

    # Foiz berilmagan bo'lsa — to'g'ri/jami dan hisoblaymiz.
    if foiz is None and togri is not None and jami:
        foiz = round(togri * 100.0 / jami, 1)
    if foiz is None:
        return None
    if not 0 <= foiz <= 100:
        return None
    if modul is None or not 1 <= modul <= 99:
        return None
    if jami is not None and not 0 < jami <= 1000:
        return None
    if togri is not None and jami is not None and togri > jami:
        return None

    tur = str(malumot.get("tur", "test")).lower().strip()
    if tur not in ("test", "oyin", "o'yin", "oʻyin"):
        tur = "test"
    if tur != "test":
        tur = "oyin"

    return {
        "modul": int(modul),
        "foiz": round(float(foiz), 1),
        "togri": int(togri) if togri is not None else None,
        "jami": int(jami) if jami is not None else None,
        "tur": tur,
    }


def natija_matni(talaba, natija, sana):
    """Muallifga yuboriladigan chiroyli xabarni tayyorlaydi."""
    belgi = "🎮" if natija["tur"] == "oyin" else "📝"
    baho = "🟢" if natija["foiz"] >= 80 else ("🟡" if natija["foiz"] >= 60 else "🔴")
    ballar = ""
    if natija["togri"] is not None and natija["jami"] is not None:
        ballar = "\n✔️ To'g'ri javob: {} / {}".format(
            natija["togri"], natija["jami"]
        )
    havola = (
        "@{}".format(qalqon(talaba["username"])) if talaba["username"] else "—"
    )
    return (
        "{} <b>Yangi natija</b>\n\n"
        "👤 <b>{} {}</b>\n"
        "📞 {}\n"
        "🏫 {}\n"
        "📚 {}\n"
        "🎓 {}\n"
        "🔗 {}\n"
        "➖➖➖➖➖➖➖➖\n"
        "📘 Modul: <b>{}</b>\n"
        "🧩 Turi: {}\n"
        "{} Natija: <b>{}%</b>{}\n"
        "🕓 Sana: {}"
    ).format(
        belgi,
        qalqon(talaba["familiya"]), qalqon(talaba["ism"]),
        qalqon(talaba["telefon"]),
        qalqon(talaba["oqish_joyi"]),
        qalqon(talaba["kurs"]),
        qalqon(talaba["yonalish"]),
        havola,
        natija["modul"],
        "o'yin" if natija["tur"] == "oyin" else "test",
        baho, natija["foiz"], ballar,
        sana,
    )


async def natijani_qayta_ishla(update, context, xom, manba):
    """Natijani tekshiradi, saqlaydi va muallifga yuboradi."""
    foydalanuvchi = update.effective_user
    talaba = talaba_oq(foydalanuvchi.id)

    # Ro'yxatdan o'tmagan foydalanuvchi natija yubora olmaydi.
    if talaba is None:
        await update.effective_message.reply_text(
            "🔒 Natija qabul qilinmadi.\n\n"
            "Avval ro'yxatdan o'tishingiz kerak — /start buyrug'ini bosing."
        )
        return

    natija = natijani_ajrat(xom)
    if natija is None:
        await update.effective_message.reply_text(
            "❓ Natija tushunarsiz bo'ldi.\n\n"
            "Testni darslik saytida yeching — natija avtomatik yuboriladi.\n"
            "Zaxira yo'l: <code>XP-modul-to'g'ri-jami</code> ko'rinishida "
            "kod yuboring. Masalan: <code>XP-3-8-10</code>",
            parse_mode=ParseMode.HTML,
        )
        return

    sana = hozir()
    try:
        natija_saqla(
            foydalanuvchi.id, natija["modul"], natija["foiz"],
            natija["togri"], natija["jami"], natija["tur"], manba,
        )
    except sqlite3.Error as xato:
        jurnal.exception("Natijani saqlashda xato: %s", xato)
        await update.effective_message.reply_text(
            "⚠️ Natijani saqlashda xatolik yuz berdi. Keyinroq urinib ko'ring."
        )
        return

    await update.effective_message.reply_text(
        "✅ <b>Natijangiz qabul qilindi va muallifga yuborildi.</b>\n\n"
        "📘 Modul: {}\n📊 Natija: {}%\n🕓 {}".format(
            natija["modul"], natija["foiz"], sana
        ),
        parse_mode=ParseMode.HTML,
    )
    await muallifga_yubor(context, natija_matni(talaba, natija, sana))
    jurnal.info(
        "Natija qabul qilindi: %s, modul %s, %s%% (%s)",
        foydalanuvchi.id, natija["modul"], natija["foiz"], manba,
    )


async def web_app_natija(update, context):
    """Telegram Web App (`sendData`) orqali kelgan natija."""
    try:
        xom = update.effective_message.web_app_data.data
    except AttributeError:
        return
    jurnal.info("Web App ma'lumoti: %s", xom[:200])
    await natijani_qayta_ishla(update, context, xom, "web_app")


async def matnli_natija(update, context):
    """Oddiy matn — natija kodi bo'lishi mumkin (zaxira yo'l)."""
    await natijani_qayta_ishla(update, context, update.message.text, "matn")


async def natijam(update, context):
    """/natijam — talaba o'z natijalarini ko'radi."""
    talaba = talaba_oq(update.effective_user.id)
    if talaba is None:
        await update.message.reply_text(
            "Siz hali ro'yxatdan o'tmagansiz. /start bosing."
        )
        return
    with ulanish() as conn:
        qatorlar = conn.execute(
            "SELECT modul, foiz, togri, jami, tur, sana FROM natijalar "
            "WHERE tg_id = ? ORDER BY id DESC LIMIT 20",
            (update.effective_user.id,),
        ).fetchall()
    if not qatorlar:
        await update.message.reply_text(
            "Sizda hali natija yo'q. Darslikdagi testlarni yechib ko'ring."
        )
        return
    satrlar = ["📊 <b>Sizning oxirgi natijalaringiz</b>\n"]
    for q in qatorlar:
        satrlar.append(
            "📘 {}-modul — <b>{}%</b> ({}) · {}".format(
                q["modul"], q["foiz"],
                "o'yin" if q["tur"] == "oyin" else "test", q["sana"],
            )
        )
    await update.message.reply_text("\n".join(satrlar), parse_mode=ParseMode.HTML)


# =====================================================================
#  6-BO'LIM. MUALLIF BUYRUQLARI (/natijalar, /talabalar, /hisobot)
# =====================================================================

async def ruxsat_yoq(update):
    """Ruxsati yo'q foydalanuvchiga xabar beradi."""
    await update.effective_message.reply_text(
        "⛔️ Bu buyruq siz uchun mavjud emas."
    )


async def natijalar(update, context):
    """/natijalar — oxirgi natijalar ro'yxati (muallif uchun)."""
    if not muallif_mi(update.effective_user.id):
        return await ruxsat_yoq(update)

    chegara = 20
    if context.args:
        try:
            chegara = max(1, min(100, int(context.args[0])))
        except ValueError:
            chegara = 20

    with ulanish() as conn:
        qatorlar = conn.execute(
            """
            SELECT n.modul, n.foiz, n.togri, n.jami, n.tur, n.sana,
                   t.ism, t.familiya, t.oqish_joyi, t.kurs
            FROM natijalar n
            LEFT JOIN talabalar t ON t.tg_id = n.tg_id
            ORDER BY n.id DESC LIMIT ?
            """,
            (chegara,),
        ).fetchall()

    if not qatorlar:
        await update.message.reply_text("Hozircha birorta ham natija yo'q.")
        return

    satrlar = ["📊 <b>Oxirgi {} ta natija</b>\n".format(len(qatorlar))]
    for q in qatorlar:
        satrlar.append(
            "• <b>{} {}</b> — {}-modul, <b>{}%</b> ({})\n"
            "  🏫 {} · 📚 {} · 🕓 {}".format(
                qalqon(q["familiya"]), qalqon(q["ism"]), q["modul"], q["foiz"],
                "o'yin" if q["tur"] == "oyin" else "test",
                qalqon(q["oqish_joyi"]), qalqon(q["kurs"]), q["sana"],
            )
        )
    await xabarni_bolib_yubor(update, "\n".join(satrlar))


async def talabalar(update, context):
    """/talabalar — ro'yxatdan o'tgan talabalar."""
    if not muallif_mi(update.effective_user.id):
        return await ruxsat_yoq(update)

    with ulanish() as conn:
        qatorlar = conn.execute(
            """
            SELECT t.*, COUNT(n.id) AS natija_soni
            FROM talabalar t
            LEFT JOIN natijalar n ON n.tg_id = t.tg_id
            GROUP BY t.tg_id
            ORDER BY t.familiya, t.ism
            """
        ).fetchall()

    if not qatorlar:
        await update.message.reply_text("Hozircha ro'yxatdan o'tgan talaba yo'q.")
        return

    satrlar = ["👥 <b>Talabalar ({} ta)</b>\n".format(len(qatorlar))]
    for raqam, q in enumerate(qatorlar, 1):
        satrlar.append(
            "{}. <b>{} {}</b>\n"
            "   📞 {} · 📚 {}\n"
            "   🏫 {}\n"
            "   🎓 {} · 📊 {} ta natija".format(
                raqam, qalqon(q["familiya"]), qalqon(q["ism"]),
                qalqon(q["telefon"]), qalqon(q["kurs"]),
                qalqon(q["oqish_joyi"]), qalqon(q["yonalish"]),
                q["natija_soni"],
            )
        )
    await xabarni_bolib_yubor(update, "\n".join(satrlar))


async def hisobot(update, context):
    """/hisobot — modullar bo'yicha umumlashgan hisobot."""
    if not muallif_mi(update.effective_user.id):
        return await ruxsat_yoq(update)

    with ulanish() as conn:
        modullar = conn.execute(
            """
            SELECT modul,
                   COUNT(*)            AS soni,
                   ROUND(AVG(foiz), 1) AS ortacha,
                   MAX(foiz)           AS eng_yuqori,
                   MIN(foiz)           AS eng_past
            FROM natijalar
            GROUP BY modul ORDER BY modul
            """
        ).fetchall()
        eng_yaxshi = conn.execute(
            """
            SELECT t.ism, t.familiya, ROUND(AVG(n.foiz), 1) AS ortacha,
                   COUNT(n.id) AS soni
            FROM natijalar n JOIN talabalar t ON t.tg_id = n.tg_id
            GROUP BY n.tg_id ORDER BY ortacha DESC, soni DESC LIMIT 10
            """
        ).fetchall()

    if not modullar:
        await update.message.reply_text("Hisobot uchun ma'lumot yo'q.")
        return

    satrlar = ["📈 <b>Modullar bo'yicha hisobot</b>\n"]
    for m in modullar:
        satrlar.append(
            "📘 <b>{}-modul</b> — {} ta natija\n"
            "   O'rtacha: <b>{}%</b> · eng yuqori: {}% · eng past: {}%".format(
                m["modul"], m["soni"], m["ortacha"],
                m["eng_yuqori"], m["eng_past"],
            )
        )
    if eng_yaxshi:
        satrlar.append("\n🏆 <b>Eng yaxshi natijalar</b>")
        for raqam, t in enumerate(eng_yaxshi, 1):
            satrlar.append(
                "{}. {} {} — <b>{}%</b> ({} ta test)".format(
                    raqam, qalqon(t["familiya"]), qalqon(t["ism"]),
                    t["ortacha"], t["soni"],
                )
            )
    await xabarni_bolib_yubor(update, "\n".join(satrlar))


async def xabarni_bolib_yubor(update, matn):
    """Uzun xabarni Telegram cheklovi (4096) bo'yicha bo'lib yuboradi."""
    bolak = ""
    for satr in matn.split("\n"):
        if len(bolak) + len(satr) + 1 > 3500:
            await update.effective_message.reply_text(
                bolak, parse_mode=ParseMode.HTML
            )
            bolak = ""
        bolak += satr + "\n"
    if bolak.strip():
        await update.effective_message.reply_text(
            bolak, parse_mode=ParseMode.HTML
        )


# =====================================================================
#  7-BO'LIM. ADMIN BUYRUQLARI (super admin)
# =====================================================================

async def boshla(update, context):
    """/boshla — botni yoqadi."""
    if not admin_mi(update.effective_user.id):
        return await ruxsat_yoq(update)
    sozlama_yoz("bot_faol", "1")
    jurnal.warning("Bot YOQILDI (admin: %s)", update.effective_user.id)
    await update.message.reply_text("🟢 Bot yoqildi. Foydalanuvchilar ishlata oladi.")


async def toxtat(update, context):
    """/toxtat — botni vaqtincha o'chiradi."""
    if not admin_mi(update.effective_user.id):
        return await ruxsat_yoq(update)
    sozlama_yoz("bot_faol", "0")
    jurnal.warning("Bot TO'XTATILDI (admin: %s)", update.effective_user.id)
    await update.message.reply_text(
        "🔴 Bot to'xtatildi.\n"
        "Endi oddiy foydalanuvchilarga «bot vaqtincha ishlamayapti» "
        "xabari ko'rinadi. Qayta yoqish: /boshla"
    )


async def github_oqimini_chaqir(holat):
    """
    GitHub Actions «muzlat.yml» ish oqimini ishga tushiradi.
    (muvaffaqiyat: True/False, izoh) juftligini qaytaradi.
    """
    if not GH_TOKEN:
        return False, "GH_TOKEN muhit o'zgaruvchisi berilmagan."
    if httpx is None:
        return False, "httpx kutubxonasi topilmadi."

    manzil = (
        "https://api.github.com/repos/{}/actions/workflows/{}/dispatches"
    ).format(GH_REPO, GH_OQIM)
    try:
        async with httpx.AsyncClient(timeout=20) as mijoz:
            javob = await mijoz.post(
                manzil,
                headers={
                    "Authorization": "Bearer {}".format(GH_TOKEN),
                    "Accept": "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2022-11-28",
                },
                json={"ref": GH_SHOX, "inputs": {"holat": holat}},
            )
    except Exception as xato:  # noqa: BLE001
        jurnal.error("GitHub so'rovida xato: %s", xato)
        return False, "Tarmoq xatosi: {}".format(xato)

    if javob.status_code == 204:
        return True, "OK"
    return False, "GitHub javobi {}: {}".format(
        javob.status_code, javob.text[:300]
    )


async def muzlat(update, context):
    """/muzlat — saytni vaqtincha yopadi."""
    if not admin_mi(update.effective_user.id):
        return await ruxsat_yoq(update)
    await update.message.reply_text("⏳ Saytni muzlatish buyrug'i yuborilmoqda…")
    ok, izoh = await github_oqimini_chaqir("muzlat")
    if ok:
        await update.message.reply_text(
            "🔒 Sayt muzlatildi.\nGitHub Pages 1–2 daqiqada yangilanadi.\n"
            "Qayta ochish: /yoq"
        )
    else:
        await update.message.reply_text("⚠️ Bajarilmadi.\n{}".format(qalqon(izoh)),
                                        parse_mode=ParseMode.HTML)


async def yoq(update, context):
    """/yoq — saytni qayta ochadi."""
    if not admin_mi(update.effective_user.id):
        return await ruxsat_yoq(update)
    await update.message.reply_text("⏳ Saytni ochish buyrug'i yuborilmoqda…")
    ok, izoh = await github_oqimini_chaqir("yoq")
    if ok:
        await update.message.reply_text(
            "🔓 Sayt qayta ochildi.\nGitHub Pages 1–2 daqiqada yangilanadi."
        )
    else:
        await update.message.reply_text("⚠️ Bajarilmadi.\n{}".format(qalqon(izoh)),
                                        parse_mode=ParseMode.HTML)


async def statistika(update, context):
    """/statistika — umumiy raqamlar."""
    if not admin_mi(update.effective_user.id):
        return await ruxsat_yoq(update)

    with ulanish() as conn:
        talaba_soni = conn.execute("SELECT COUNT(*) FROM talabalar").fetchone()[0]
        natija_soni = conn.execute("SELECT COUNT(*) FROM natijalar").fetchone()[0]
        ortacha = conn.execute("SELECT ROUND(AVG(foiz), 1) FROM natijalar").fetchone()[0]
        bugun = conn.execute(
            "SELECT COUNT(*) FROM natijalar WHERE sana LIKE ?",
            (datetime.now(TOSHKENT).strftime("%Y-%m-%d") + "%",),
        ).fetchone()[0]
        muassasalar = conn.execute(
            "SELECT COUNT(DISTINCT oqish_joyi) FROM talabalar"
        ).fetchone()[0]

    hajm = 0
    try:
        hajm = os.path.getsize(BAZA_YOLI) // 1024
    except OSError:
        pass

    await update.message.reply_text(
        "📊 <b>Umumiy statistika</b>\n\n"
        "👥 Talabalar: <b>{}</b>\n"
        "🏫 Muassasalar: <b>{}</b>\n"
        "📝 Natijalar: <b>{}</b>\n"
        "📅 Bugungi natijalar: <b>{}</b>\n"
        "📈 O'rtacha ball: <b>{}%</b>\n"
        "💾 Baza hajmi: {} KB\n"
        "⚙️ Bot holati: {}\n"
        "🕓 {}".format(
            talaba_soni, muassasalar, natija_soni, bugun,
            ortacha if ortacha is not None else "—", hajm,
            "🟢 yoqilgan" if bot_faolmi() else "🔴 to'xtatilgan",
            hozir(),
        ),
        parse_mode=ParseMode.HTML,
    )


async def eksport(update, context):
    """/eksport — barcha natijalarni CSV fayl sifatida yuboradi."""
    if not admin_mi(update.effective_user.id):
        return await ruxsat_yoq(update)

    with ulanish() as conn:
        qatorlar = conn.execute(
            """
            SELECT t.familiya, t.ism, t.telefon, t.oqish_joyi, t.kurs,
                   t.yonalish, n.modul, n.tur, n.togri, n.jami, n.foiz, n.sana
            FROM natijalar n LEFT JOIN talabalar t ON t.tg_id = n.tg_id
            ORDER BY n.id
            """
        ).fetchall()

    if not qatorlar:
        await update.message.reply_text("Eksport uchun ma'lumot yo'q.")
        return

    xotira = io.StringIO()
    yozuvchi = csv.writer(xotira, delimiter=";")
    yozuvchi.writerow([
        "Familiya", "Ism", "Telefon", "O'qish joyi", "Kurs", "Yo'nalish",
        "Modul", "Turi", "To'g'ri", "Jami", "Foiz", "Sana",
    ])
    for q in qatorlar:
        yozuvchi.writerow([q[k] if q[k] is not None else "" for k in q.keys()])

    # utf-8-sig — Excel kirill/lotin harflarni to'g'ri ko'rsatishi uchun.
    fayl = io.BytesIO(xotira.getvalue().encode("utf-8-sig"))
    fayl.name = "natijalar-{}.csv".format(
        datetime.now(TOSHKENT).strftime("%Y-%m-%d")
    )
    await update.message.reply_document(
        document=fayl,
        caption="📄 Jami {} ta natija · {}".format(len(qatorlar), hozir()),
    )


# =====================================================================
#  8-BO'LIM. UMUMIY: qulf, yordam, menyular, xatoliklar
# =====================================================================

async def qulf(update, context):
    """
    Har bir yangilanishdan oldin ishlaydi.
    Bot to'xtatilgan bo'lsa — admin va muallifdan boshqa hammani to'xtatadi.
    """
    if bot_faolmi():
        return
    foydalanuvchi = update.effective_user
    if foydalanuvchi and muallif_mi(foydalanuvchi.id):
        return  # admin va muallif har doim ishlata oladi

    # Bir xil xabarni takror yubormaslik uchun 60 soniyalik oraliq.
    oxirgi = context.user_data.get("qulf_xabari", 0) if context.user_data else 0
    hozirgi = datetime.now(timezone.utc).timestamp()
    if hozirgi - oxirgi > 60 and update.effective_message:
        try:
            await update.effective_message.reply_text(
                "🔴 Bot vaqtincha ishlamayapti.\n\n"
                "Texnik ishlar olib borilmoqda. Iltimos, keyinroq urinib "
                "ko'ring.",
                reply_markup=OCHIR,
            )
            if context.user_data is not None:
                context.user_data["qulf_xabari"] = hozirgi
        except Exception as xato:  # noqa: BLE001
            jurnal.error("Qulf xabarini yuborishda xato: %s", xato)

    raise ApplicationHandlerStop


async def yordam(update, context):
    """/yordam — rolga mos qisqa qo'llanma."""
    tg_id = update.effective_user.id
    matn = [
        "ℹ️ <b>«Xalq pedagogikasi» boti</b>\n",
        "Bu bot darslikdagi test va o'yin natijalarini qabul qiladi.\n",
        "<b>Hamma uchun</b>",
        "/start — ro'yxatdan o'tish yoki ma'lumotni yangilash",
        "/natijam — o'z natijalarim",
        "/bekor — amaldagi suhbatni bekor qilish",
        "/yordam — shu yordam",
    ]
    if muallif_mi(tg_id):
        matn += [
            "\n<b>Muallif uchun</b>",
            "/natijalar — oxirgi natijalar (masalan: <code>/natijalar 50</code>)",
            "/talabalar — ro'yxatdan o'tganlar",
            "/hisobot — modullar bo'yicha hisobot",
        ]
    if admin_mi(tg_id):
        matn += [
            "\n<b>Admin uchun</b>",
            "/boshla — botni yoqish",
            "/toxtat — botni to'xtatish",
            "/muzlat — saytni muzlatish",
            "/yoq — saytni qayta ochish",
            "/statistika — umumiy raqamlar",
            "/eksport — natijalarni CSV faylda olish",
        ]
    await update.message.reply_text("\n".join(matn), parse_mode=ParseMode.HTML)


# Rollarga mos menyular (BotCommandScope orqali)
ODDIY_MENYU = [
    BotCommand("start", "Ro'yxatdan o'tish"),
    BotCommand("natijam", "Mening natijalarim"),
    BotCommand("bekor", "Bekor qilish"),
    BotCommand("yordam", "Yordam"),
]

MUALLIF_MENYU = ODDIY_MENYU + [
    BotCommand("natijalar", "Oxirgi natijalar"),
    BotCommand("talabalar", "Talabalar ro'yxati"),
    BotCommand("hisobot", "Modullar bo'yicha hisobot"),
]

ADMIN_MENYU = MUALLIF_MENYU + [
    BotCommand("boshla", "Botni yoqish"),
    BotCommand("toxtat", "Botni to'xtatish"),
    BotCommand("muzlat", "Saytni muzlatish"),
    BotCommand("yoq", "Saytni qayta ochish"),
    BotCommand("statistika", "Umumiy statistika"),
    BotCommand("eksport", "CSV eksport"),
]


async def menyularni_ornat(app):
    """Har bir rol o'z buyruqlarinigina ko'radi."""
    try:
        await app.bot.set_my_commands(ODDIY_MENYU, scope=BotCommandScopeDefault())
        await app.bot.set_my_commands(
            MUALLIF_MENYU, scope=BotCommandScopeChat(chat_id=MUALLIF_ID)
        )
        await app.bot.set_my_commands(
            ADMIN_MENYU, scope=BotCommandScopeChat(chat_id=ADMIN_ID)
        )
        jurnal.info("Menyular o'rnatildi (muallif: %s, admin: %s)",
                    MUALLIF_ID, ADMIN_ID)
    except Exception as xato:  # noqa: BLE001
        jurnal.error("Menyularni o'rnatishda xato: %s", xato)


async def xatolik(update, context):
    """Ushlanmagan xatoliklarni logga yozadi va foydalanuvchini ogohlantiradi."""
    jurnal.error("Xatolik yuz berdi:", exc_info=context.error)
    try:
        if isinstance(update, Update) and update.effective_message:
            await update.effective_message.reply_text(
                "⚠️ Kutilmagan xatolik yuz berdi. Iltimos, qaytadan urinib "
                "ko'ring yoki /start bosing."
            )
    except Exception:  # noqa: BLE001
        pass


# =====================================================================
#  9-BO'LIM. ISHGA TUSHIRISH
# =====================================================================

def qurilma():
    """Application obyektini yig'ib beradi."""
    app = Application.builder().token(TOKEN).post_init(menyularni_ornat).build()

    # -1-guruh: bot yoqilganmi, yo'qmi — hammadan oldin tekshiriladi.
    app.add_handler(TypeHandler(Update, qulf), group=-1)

    # Web App natijasi — suhbatdan ham oldin ishlashi kerak.
    app.add_handler(
        MessageHandler(filters.StatusUpdate.WEB_APP_DATA, web_app_natija)
    )

    # Ro'yxatdan o'tish suhbati.
    suhbat = ConversationHandler(
        entry_points=[CommandHandler("start", start)],
        states={
            ISM: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, ism_qabul),
                MessageHandler(~filters.COMMAND, notogri_qadam),
            ],
            FAMILIYA: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, familiya_qabul),
                MessageHandler(~filters.COMMAND, notogri_qadam),
            ],
            TELEFON: [
                MessageHandler(filters.CONTACT, telefon_qabul),
                MessageHandler(filters.TEXT & ~filters.COMMAND, telefon_qabul),
                MessageHandler(~filters.COMMAND, notogri_qadam),
            ],
            RASM: [
                MessageHandler(filters.PHOTO, rasm_qabul),
                MessageHandler(~filters.COMMAND, rasm_qabul),
            ],
            OQISH_JOYI: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, oqish_joyi_qabul),
                MessageHandler(~filters.COMMAND, notogri_qadam),
            ],
            KURS: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, kurs_qabul),
                MessageHandler(~filters.COMMAND, notogri_qadam),
            ],
            YONALISH: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, yonalish_qabul),
                MessageHandler(~filters.COMMAND, notogri_qadam),
            ],
        },
        fallbacks=[
            CommandHandler("bekor", bekor),
            CommandHandler("start", start),
        ],
        allow_reentry=True,
        name="royxat",
    )
    app.add_handler(suhbat)

    # Buyruqlar.
    app.add_handler(CommandHandler("yordam", yordam))
    app.add_handler(CommandHandler("bekor", bekor))
    app.add_handler(CommandHandler("natijam", natijam))
    app.add_handler(CommandHandler("natijalar", natijalar))
    app.add_handler(CommandHandler("talabalar", talabalar))
    app.add_handler(CommandHandler("hisobot", hisobot))
    app.add_handler(CommandHandler("boshla", boshla))
    app.add_handler(CommandHandler("toxtat", toxtat))
    app.add_handler(CommandHandler("muzlat", muzlat))
    app.add_handler(CommandHandler("yoq", yoq))
    app.add_handler(CommandHandler("statistika", statistika))
    app.add_handler(CommandHandler("eksport", eksport))

    # Oxirgi navbatda: oddiy matn — natija kodi bo'lishi mumkin.
    app.add_handler(
        MessageHandler(filters.TEXT & ~filters.COMMAND, matnli_natija)
    )

    app.add_error_handler(xatolik)
    return app


def main():
    if not TOKEN:
        print(
            "XATO: TG_TOKEN muhit o'zgaruvchisi berilmagan.\n"
            "Ishga tushirish: TG_TOKEN=... python3 bot/bot.py\n"
            "Batafsil: bot/O'RNATISH.md"
        )
        sys.exit(1)

    bazani_tayyorla()
    jurnal.info("Bot ishga tushmoqda… (muallif: %s, admin: %s)",
                MUALLIF_ID, ADMIN_ID)

    app = qurilma()
    try:
        app.run_polling(
            allowed_updates=Update.ALL_TYPES,
            drop_pending_updates=True,
        )
    except KeyboardInterrupt:
        jurnal.info("Bot to'xtatildi (Ctrl+C).")


if __name__ == "__main__":
    main()
