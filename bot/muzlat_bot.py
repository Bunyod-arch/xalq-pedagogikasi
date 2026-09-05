#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Telegram bot — saytni bir tugma bilan muzlatish va yoqish.

Bot GitHub Actions'dagi «muzlat.yml» ish oqimini ishga tushiradi,
u esa holat.json faylini o'zgartiradi va sayt qulflanadi/ochiladi.

KERAKLI IKKI NARSA (muhit o'zgaruvchilari sifatida beriladi):
  TG_TOKEN  — @BotFather'dan olinadigan bot tokeni
  GH_TOKEN  — GitHub Personal Access Token (fine-grained),
              faqat shu repozitoriyga, «Actions: Read and write»
              va «Contents: Read and write» ruxsati bilan
  TG_EGA    — sizning Telegram ID raqamingiz (faqat siz boshqarasiz)

Ishga tushirish:
  pip install requests
  TG_TOKEN=... GH_TOKEN=... TG_EGA=... python3 bot/telegram_bot.py
"""
import os, time, json, requests

TG_TOKEN = os.environ["TG_TOKEN"]
GH_TOKEN = os.environ["GH_TOKEN"]
TG_EGA   = str(os.environ["TG_EGA"])

REPO   = "Bunyod-arch/xalq-pedagogikasi"
OQIM   = "muzlat.yml"
SAYT   = "https://bunyod-arch.github.io/xalq-pedagogikasi/"
TG     = f"https://api.telegram.org/bot{TG_TOKEN}"

TUGMALAR = {"inline_keyboard": [[
    {"text": "🔒 Muzlatish", "callback_data": "muzlat"},
    {"text": "🔓 Yoqish",    "callback_data": "yoq"},
], [
    {"text": "ℹ️ Holatni tekshirish", "callback_data": "holat"},
]]}


def yubor(chat, matn, tugma=True):
    requests.post(f"{TG}/sendMessage", json={
        "chat_id": chat, "text": matn, "parse_mode": "HTML",
        "reply_markup": TUGMALAR if tugma else None})


def oqim_ishga_tushir(holat):
    """GitHub Actions ish oqimini ishga tushiradi."""
    r = requests.post(
        f"https://api.github.com/repos/{REPO}/actions/workflows/{OQIM}/dispatches",
        headers={"Authorization": f"Bearer {GH_TOKEN}",
                 "Accept": "application/vnd.github+json"},
        json={"ref": "main", "inputs": {"holat": holat}})
    return r.status_code == 204, r.text


def holatni_ol():
    try:
        r = requests.get(SAYT + "holat.json", timeout=15,
                         headers={"Cache-Control": "no-cache"})
        return r.json()
    except Exception as e:
        return {"xato": str(e)}


def main():
    print("Bot ishga tushdi. Ctrl+C bilan to'xtatiladi.")
    ofset = None
    while True:
        try:
            r = requests.get(f"{TG}/getUpdates",
                             params={"timeout": 50, "offset": ofset}, timeout=60)
            for u in r.json().get("result", []):
                ofset = u["update_id"] + 1

                if "message" in u:
                    m = u["message"]
                    if str(m["from"]["id"]) != TG_EGA:
                        continue
                    yubor(m["chat"]["id"],
                          "<b>Xalq pedagogikasi — sayt boshqaruvi</b>\n\n"
                          "Quyidagi tugmalar bilan saytni muzlatish yoki "
                          "qayta yoqish mumkin.")

                elif "callback_query" in u:
                    c = u["callback_query"]
                    if str(c["from"]["id"]) != TG_EGA:
                        continue
                    chat = c["message"]["chat"]["id"]
                    buyruq = c["data"]
                    requests.post(f"{TG}/answerCallbackQuery",
                                  json={"callback_query_id": c["id"]})

                    if buyruq == "holat":
                        h = holatni_ol()
                        if "xato" in h:
                            yubor(chat, f"Holatni o‘qib bo‘lmadi: {h['xato']}")
                        else:
                            yubor(chat, ("🟢 Sayt <b>ochiq</b>" if h.get("faol")
                                         else "🔴 Sayt <b>muzlatilgan</b>")
                                  + f"\nOxirgi o‘zgarish: {h.get('yangilangan','—')}")
                    else:
                        ok, javob = oqim_ishga_tushir(buyruq)
                        if ok:
                            yubor(chat,
                                  ("🔒 Muzlatish" if buyruq == "muzlat" else "🔓 Yoqish")
                                  + " buyrug‘i yuborildi.\n"
                                  "GitHub Pages 1–2 daqiqada yangilanadi.")
                        else:
                            yubor(chat, f"Xatolik: {javob[:300]}")
        except KeyboardInterrupt:
            print("To‘xtatildi.")
            break
        except Exception as e:
            print("Xato:", e)
            time.sleep(5)


if __name__ == "__main__":
    main()
