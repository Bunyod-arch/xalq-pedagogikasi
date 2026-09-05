# «Xalq pedagogikasi» Telegram boti — o'rnatish qo'llanmasi

Bu bot **Cloudflare Workers** da ishlaydi. Ya'ni sizga kompyuter yoki
server doim yoqilgan turishi shart emas — bot bulutda, bepul tarifda,
kunu-tun ishlaydi.

Butun o'rnatish **15–20 daqiqa** vaqt oladi. Har bir qadamni tartib
bilan bajaring.

---

## Kerakli narsalar (oldindan tayyorlab qo'ying)

| Nima | Qayerdan olinadi |
|---|---|
| **Bot tokeni** | Telegramda **@BotFather** → `/newbot` → bot nomi va foydalanuvchi nomini kiriting → token beradi |
| **Telegram ID** raqamlaringiz | Telegramda **@userinfobot** ga `/start` yozing → ID ni ko'rsatadi |
| **GitHub tokeni** (ixtiyoriy, saytni muzlatish uchun) | GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained** → faqat shu repozitoriy, ruxsatlar: **Actions: Read and write**, **Contents: Read and write** |

> ⚠️ **Token — bu kalit.** Uni hech kimga bermang, hech qanday faylga
> yozmang, suratga olib yubormang. Agar bilmasdan birovga ko'rsatib
> qo'ysangiz — @BotFather → `/revoke` bilan darhol bekor qiling.

---

## 1-qadam. Cloudflare'da bepul hisob ochish

1. Brauzerda **https://dash.cloudflare.com/sign-up** manzilini oching
2. Elektron pochta va parol yozib **Sign Up** ni bosing
3. Pochtangizga kelgan xatdagi tasdiqlash havolasini bosing

Karta raqami so'ralmaydi — bepul tarif yetarli (kuniga 100 000 so'rov).

---

## 2-qadam. Wrangler dasturini o'rnatish

Wrangler — Cloudflare'ning buyruq qatori dasturi. Avval kompyuteringizda
**Node.js** bo'lishi kerak (https://nodejs.org — LTS versiyasi).

Terminalni oching va yozing:

```bash
npm install -g wrangler
```

Tekshirish:

```bash
wrangler --version
```

Versiya raqami chiqsa — hammasi joyida.

---

## 3-qadam. Cloudflare hisobiga kirish

```bash
wrangler login
```

Brauzer ochiladi → **Allow** tugmasini bosing → terminalga qayting.
«Successfully logged in» yozuvi chiqadi.

---

## 4-qadam. Bot papkasiga o'tish

```bash
cd xalq-pedagogikasi/worker
```

Keyingi barcha buyruqlar **shu papka ichida** beriladi.

---

## 5-qadam. Ma'lumotlar bazasini (KV) yaratish

```bash
wrangler kv namespace create BAZA
```

Buyruq quyidagiga o'xshash javob beradi:

```
[[kv_namespaces]]
binding = "BAZA"
id = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6"
```

Shu **id** raqamini nusxalang va `wrangler.toml` faylini ochib,
`SHU_YERGA_KV_ID_NI_QOYING` yozuvi o'rniga qo'ying:

```toml
[[kv_namespaces]]
binding = "BAZA"
id = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6"
```

---

## 6-qadam. `wrangler.toml` dagi raqamlarni to'g'rilash

Xuddi shu faylda `[vars]` bo'limini tekshiring:

```toml
[vars]
MUALLIF_ID = "703407068"     # muallifning Telegram ID si
ADMIN_ID   = "1118923120"    # super adminning Telegram ID si
GH_REPO    = "Bunyod-arch/xalq-pedagogikasi"
WEBAPP_URL = "https://bunyod-arch.github.io/xalq-pedagogikasi/"
```

Agar ID raqamlaringiz boshqa bo'lsa — o'zingiznikini yozing.

---

## 7-qadam. Sirlarni (secret) qo'yish

Sirlar faylga **yozilmaydi** — ular Cloudflare'ning himoyalangan
xotirasida saqlanadi. Uchta buyruq bering, har birida so'ralganda
qiymatni yopishtiring va Enter bosing.

**1) Bot tokeni** (@BotFather bergan):

```bash
wrangler secret put TG_TOKEN
```

**2) Webhook siri** — bu shunchaki uzun tasodifiy parol. Uni o'zingiz
o'ylab topasiz (masalan 32 ta harf-raqam). Bir joyga yozib qo'ying —
9-qadamda yana kerak bo'ladi.

Tasodifiy sir yaratish (ixtiyoriy):

```bash
openssl rand -hex 24
```

Keyin:

```bash
wrangler secret put SECRET
```

**3) GitHub tokeni** (faqat `/muzlat` va `/yoq` buyruqlari uchun; kerak
bo'lmasa bu qadamni tashlab ketsangiz ham bo'ladi):

```bash
wrangler secret put GH_TOKEN
```

---

## 8-qadam. Botni Cloudflare'ga joylash

```bash
wrangler deploy
```

Oxirida shunga o'xshash manzil chiqadi — **uni nusxalang**:

```
https://xalq-pedagogikasi-bot.SIZNING-NOMINGIZ.workers.dev
```

Shu manzilni brauzerda ochsangiz, botning holat sahifasi ko'rinadi
(qaysi sozlama qo'yilgan, qaysi biri yo'q).

---

## 9-qadam. Webhook o'rnatish

Telegramga «xabarlarni ana shu manzilga yubor» deb aytamiz.
Quyidagi buyruqda **uchta joyni** o'zingiznikiga almashtiring:

- `BOT_TOKEN` — @BotFather bergan token
- `https://...workers.dev` — 8-qadamdagi manzil
- `SIZNING_SIRINGIZ` — 7-qadamda o'ylab topgan SECRET

```bash
curl -s -X POST "https://api.telegram.org/botBOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://xalq-pedagogikasi-bot.SIZNING-NOMINGIZ.workers.dev",
    "secret_token": "SIZNING_SIRINGIZ",
    "drop_pending_updates": true,
    "allowed_updates": ["message", "edited_message"]
  }'
```

Javobda `"ok":true` bo'lsa — hammasi joyida.

Tekshirish:

```bash
curl -s "https://api.telegram.org/botBOT_TOKEN/getWebhookInfo"
```

`"pending_update_count":0` va xato yo'qligini ko'ring.

---

## 10-qadam. BotFather'da Mini App'ni sozlash

Test natijalari botga kelishi uchun darslik **Mini App** sifatida
ro'yxatdan o'tishi kerak.

1. Telegramda **@BotFather** ni oching
2. `/newapp` deb yozing
3. Botingizni tanlang
4. Ilova nomi: `Xalq pedagogikasi`
5. Qisqa tavsif: `Xalq pedagogikasi elektron darsligi`
6. Rasm so'raydi — 640×360 o'lchamdagi istalgan rasm yuboring
7. **Web App URL** so'raganda yozing:
   `https://bunyod-arch.github.io/xalq-pedagogikasi/`
8. Qisqa nom (short name): `darslik`

Keyin menyu tugmasini ham qo'yamiz:

1. @BotFather → `/setmenubutton`
2. Botni tanlang
3. Manzil: `https://bunyod-arch.github.io/xalq-pedagogikasi/`
4. Tugma nomi: `📚 Darslik`

> **Muhim:** natijalar (`sendData`) faqat **pastdagi klaviatura**
> tugmasi orqali ochilgan Mini App'dan keladi. Bot ro'yxatdan o'tish
> tugagach aynan shunday tugma beradi («📚 Darslikni ochish») — shuning
> uchun talabalar darslikni **shu tugma orqali** ochishlari kerak.

---

## 11-qadam. Menyularni o'rnatish va tekshirish

1. Telegramda botingizni oching va **/start** yozing
2. Ro'yxatdan o'tish savollari boshlanadi — javob bering
3. Oxirida «📚 Darslikni ochish» tugmasi chiqadi
4. Tugmani bosing → darslik ochiladi → biror modulning testini yeching
5. Test tugagach natija **avtomatik muallifga** yetib boradi

Admin hisobidan bir marta **/sozla** yozing — shunda har bir rol
o'ziga tegishli buyruqlar menyusini ko'radi.

---

## Buyruqlar

**Barcha foydalanuvchilar:**

| Buyruq | Vazifasi |
|---|---|
| `/start` | Ro'yxatdan o'tish yoki darslikni ochish |
| `/yangila` | Ma'lumotlarni qaytadan kiritish |
| `/natijam` | O'z natijalarini ko'rish |
| `/bekor` | Ro'yxatdan o'tishni bekor qilish |
| `/yordam` | Yordam |

**Muallif uchun:**

| Buyruq | Vazifasi |
|---|---|
| `/natijalar` | Oxirgi 20 ta natija (`/natijalar 50` — 50 tasi) |
| `/talabalar` | Ro'yxatdan o'tganlar ro'yxati |
| `/hisobot` | Modullar bo'yicha o'rtacha foiz |
| `/qidir Aliyev` | Talabani ism, familiya yoki telefon bo'yicha qidirish |

**Super admin uchun** (yuqoridagilarning hammasi + quyidagilar):

| Buyruq | Vazifasi |
|---|---|
| `/boshla` | Botni yoqish |
| `/toxtat` | Botni vaqtincha to'xtatish |
| `/muzlat` | Saytni muzlatish (GitHub Actions orqali) |
| `/yoq` | Saytni qayta ochish |
| `/statistika` | Umumiy raqamlar |
| `/eksport` | Barcha natijalarni CSV faylda olish |
| `/sozla` | Buyruq menyularini rollar bo'yicha o'rnatish |

---

## Muhit o'zgaruvchilari jadvali

| Nomi | Turi | Majburiymi | Nima uchun | Qayerdan olinadi |
|---|---|---|---|---|
| `TG_TOKEN` | **sir** | ✅ ha | Bot tokeni | @BotFather → `/newbot` |
| `SECRET` | **sir** | ✅ ha | Webhook'ni himoyalash (soxta so'rovlar rad etiladi) | O'zingiz o'ylab topasiz: `openssl rand -hex 24` |
| `GH_TOKEN` | **sir** | ❌ yo'q | Saytni muzlatish/yoqish | GitHub → Fine-grained token (Actions + Contents: RW) |
| `BAZA` | KV binding | ✅ ha | Talabalar, natijalar, holat | `wrangler kv namespace create BAZA` |
| `MUALLIF_ID` | vars | ✅ ha | Natijalar shu odamga yuboriladi | @userinfobot |
| `ADMIN_ID` | vars | ✅ ha | Super admin huquqlari | @userinfobot |
| `WEBAPP_URL` | vars | ✅ ha | Mini App (darslik) manzili | Sayt manzili |
| `GH_REPO` | vars | ❌ yo'q | GitHub repozitoriysi | `Bunyod-arch/xalq-pedagogikasi` |
| `GH_OQIM` | vars | ❌ yo'q | Ish oqimi fayli | `muzlat.yml` |
| `GH_SHOX` | vars | ❌ yo'q | Repozitoriy shoxi | `main` |

**Sir (secret)** — `wrangler secret put NOMI` bilan qo'yiladi, faylga yozilmaydi.
**vars** — `wrangler.toml` ichidagi `[vars]` bo'limida turadi (ochiq ma'lumot).

---

## Ma'lumotlar qanday saqlanadi

Hammasi Cloudflare KV da, quyidagi kalitlar bilan:

| Kalit | Nima saqlanadi |
|---|---|
| `t:<telegram_id>` | Talabaning ma'lumoti (ism, familiya, telefon, rasm, o'qish joyi, kurs, yo'nalish) |
| `n:<telegram_id>:<vaqt>` | Bitta test yoki o'yin natijasi |
| `holat:<telegram_id>` | Ro'yxatdan o'tish suhbatining qaysi qadamda turgani (2 soatdan keyin o'chadi) |
| `sozlama:bot_faol` | Bot yoqilganmi (`1`) yoki to'xtatilganmi (`0`) |

---

## Nimadir ishlamasa

**Bot javob bermayapti:**

```bash
curl -s "https://api.telegram.org/botBOT_TOKEN/getWebhookInfo"
```

`last_error_message` da sabab yozilgan bo'ladi.

**Jonli jurnalni (log) ko'rish:**

```bash
wrangler tail
```

Terminal ochiq turganda botga xabar yozing — barcha xatolar shu yerda
ko'rinadi.

**«Ruxsat yo'q» (401) xatosi** — `SECRET` siri bilan `setWebhook` dagi
`secret_token` bir xil emas. Sirni qaytadan qo'ying va 9-qadamni
takrorlang.

**Natija kelmayapti** — darslik pastdagi «📚 Darslikni ochish»
tugmasi orqali ochilganini tekshiring. Menyu tugmasi yoki oddiy havola
orqali ochilganda Telegram `sendData` ni botga yubormaydi.

**Kodni o'zgartirdingizmi?** — har safar qaytadan joylang:

```bash
wrangler deploy
```

---

## Xavfsizlik bo'yicha eslatma

- Token va sirlar **hech qaysi faylda** yo'q — faqat Cloudflare'ning
  himoyalangan xotirasida.
- `.dev.vars` fayli `.gitignore` ga kiritilgan — u GitHub'ga tushmaydi.
- Webhook maxfiy sarlavha bilan himoyalangan: sirni bilmagan hech kim
  botga soxta xabar yubora olmaydi.
- Foydalanuvchi kiritgan barcha matn Telegramga yuborilishidan oldin
  qalqonlanadi — zararli belgilar ishlamaydi.
