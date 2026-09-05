# Saytni boshqarish

Saytni istalgan vaqt **muzlatish** (yopish) va **qayta yoqish** mumkin.
Uch xil yo‘l bor — eng osonidan boshlab.

---

## 1-yo‘l — GitHub tugmasi (eng oson, tavsiya etiladi)

Hech qanday server, bot yoki token kerak emas. Telefondan ham ishlaydi.

1. Repozitoriyni oching → yuqoridagi **Actions** bo‘limi
2. Chapdan **«Saytni muzlatish yoki yoqish»** ni tanlang
3. O‘ngdagi **Run workflow** tugmasini bosing
4. `holat` ro‘yxatidan tanlang:
   - **muzlat** — sayt yopiladi
   - **yoq** — sayt qayta ochiladi
5. **Run workflow** ni bosing

1–2 daqiqada sayt o‘zgaradi. Telefonda **GitHub** ilovasi orqali ham
xuddi shu ishni qilish mumkin.

---

## 2-yo‘l — faylni qo‘lda tahrirlash

1. Repozitoriyda **`holat.json`** faylini oching
2. Qalam (✏️) tugmasini bosing
3. `"faol": true` → `"faol": false` qilib o‘zgartiring (yoki teskarisi)
4. **Commit changes** ni bosing

---

## 3-yo‘l — Telegram bot

`telegram_bot.py` — tugmali bot: 🔒 Muzlatish · 🔓 Yoqish · ℹ️ Holat.

Botni ishlatish uchun uni doimiy ishlab turadigan joyga qo‘yish kerak
(o‘z kompyuteringiz, VPS yoki bepul hosting). Kerak bo‘ladigan uchta narsa:

| O‘zgaruvchi | Nima | Qayerdan olinadi |
|---|---|---|
| `TG_TOKEN` | Bot tokeni | Telegramda **@BotFather** → `/newbot` |
| `TG_EGA`   | Sizning Telegram ID raqamingiz | Telegramda **@userinfobot** |
| `GH_TOKEN` | GitHub tokeni | GitHub → Settings → Developer settings → **Personal access tokens** → Fine-grained → faqat shu repozitoriy, ruxsatlar: **Actions: Read and write**, **Contents: Read and write** |

Ishga tushirish:

```bash
pip install requests
TG_TOKEN=... GH_TOKEN=... TG_EGA=... python3 bot/telegram_bot.py
```

---

## Muhim izoh

`holat.json` orqali muzlatish — **brauzer tomonidagi qulf**. Oddiy
tashrifchi uchun sayt to‘liq yopiq ko‘rinadi, lekin texnik bilimga ega
odam sahifa manbasidan matnni ko‘ra oladi.

Butunlay, qat’iy o‘chirish kerak bo‘lsa:
**Settings → Pages → Source → None** ni tanlang. Shunda manzil
umuman ochilmaydi (404). Qayta yoqish uchun **Source → main** ni
tanlash kifoya.
