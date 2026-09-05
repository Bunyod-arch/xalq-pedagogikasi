#!/usr/bin/env bash
# =====================================================================
#  «Xalq pedagogikasi» Telegram botini Cloudflare'ga joylash
#  Bitta buyruq bilan: bash worker/ishga-tushirish.sh
# =====================================================================
set -e
cd "$(dirname "$0")"

yashil() { printf "\033[32m%s\033[0m\n" "$1"; }
sariq()  { printf "\033[33m%s\033[0m\n" "$1"; }
qizil()  { printf "\033[31m%s\033[0m\n" "$1"; }
bosh()   { printf "\n\033[1m── %s\033[0m\n" "$1"; }

bosh "1/6 · Wrangler tekshirilmoqda"
if ! npx --yes wrangler --version >/dev/null 2>&1; then
  qizil "Wrangler ishga tushmadi. Internet aloqasini tekshiring."; exit 1
fi
yashil "Wrangler tayyor: $(npx --yes wrangler --version 2>/dev/null | tail -1)"

bosh "2/6 · Cloudflare hisobiga kirish"
if npx --yes wrangler whoami >/dev/null 2>&1; then
  yashil "Allaqachon kirgansiz: $(npx --yes wrangler whoami 2>/dev/null | grep -i 'account' | head -1)"
else
  sariq "Brauzer ochiladi — Cloudflare hisobingizga kiring va «Allow» tugmasini bosing."
  npx --yes wrangler login
fi

bosh "3/6 · Ma'lumotlar bazasi (KV)"
if grep -q "SHU_YERGA_KV_ID_NI_QOYING" wrangler.toml; then
  sariq "Yangi KV bazasi yaratilmoqda…"
  CHIQISH=$(npx --yes wrangler kv namespace create BAZA 2>&1)
  echo "$CHIQISH"
  KV_ID=$(echo "$CHIQISH" | grep -oE '"?id"?[[:space:]]*[:=][[:space:]]*"[a-f0-9]{32}"' | grep -oE '[a-f0-9]{32}' | head -1)
  if [ -z "$KV_ID" ]; then
    qizil "KV id topilmadi. Yuqoridagi chiqishdan id ni olib, wrangler.toml ga qo'lda qo'ying."; exit 1
  fi
  # macOS va Linux uchun mos
  if sed --version >/dev/null 2>&1; then
    sed -i "s/SHU_YERGA_KV_ID_NI_QOYING/$KV_ID/" wrangler.toml
  else
    sed -i '' "s/SHU_YERGA_KV_ID_NI_QOYING/$KV_ID/" wrangler.toml
  fi
  yashil "KV bazasi yaratildi va wrangler.toml ga yozildi: $KV_ID"
else
  yashil "KV bazasi allaqachon sozlangan."
fi

bosh "4/6 · Sirlar"
sariq "Bot tokenini @BotFather dan oling (/newbot yoki /revoke)."
sariq "Token SHU OYNAGA kiritiladi — hech qayerga yozilmaydi."
npx --yes wrangler secret put TG_TOKEN

# Webhook siri — o'zimiz tasodifiy yasaymiz
WEBHOOK_SIRI=$(LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 40)
echo "$WEBHOOK_SIRI" | npx --yes wrangler secret put SECRET >/dev/null
yashil "Webhook siri avtomatik yaratildi va saqlandi."

printf "\nSaytni bot orqali muzlatmoqchimisiz? GitHub tokeni kerak bo'ladi. (h/y) "
read -r JAVOB
if [ "$JAVOB" = "h" ] || [ "$JAVOB" = "H" ]; then
  sariq "GitHub → Settings → Developer settings → Personal access tokens →"
  sariq "Fine-grained → faqat shu repozitoriy → Actions: Read and write,"
  sariq "Contents: Read and write. Tokenni shu oynaga kiriting:"
  npx --yes wrangler secret put GH_TOKEN
else
  yashil "O'tkazib yuborildi — keyinroq qo'shish mumkin."
fi

bosh "5/6 · Cloudflare'ga joylash"
JOYLASH=$(npx --yes wrangler deploy 2>&1)
echo "$JOYLASH"
MANZIL=$(echo "$JOYLASH" | grep -oE 'https://[a-z0-9.-]+\.workers\.dev' | head -1)
if [ -z "$MANZIL" ]; then
  qizil "Worker manzili topilmadi. Yuqoridagi chiqishni tekshiring."; exit 1
fi
yashil "Bot joylandi: $MANZIL"

bosh "6/6 · Telegram webhook o'rnatilmoqda"
sariq "Bot tokenini yana bir marta kiriting (webhook o'rnatish uchun):"
read -r -s BOT_TOKEN
echo
NATIJA=$(curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"${MANZIL}\",\"secret_token\":\"${WEBHOOK_SIRI}\",\"drop_pending_updates\":true,\"allowed_updates\":[\"message\",\"edited_message\",\"callback_query\"]}")
echo "$NATIJA"
if echo "$NATIJA" | grep -q '"ok":true'; then
  yashil "Webhook o'rnatildi."
else
  qizil "Webhook o'rnatilmadi — yuqoridagi javobni tekshiring."; exit 1
fi

printf "\n"
yashil "════════════════════════════════════════════"
yashil "  BOT ISHGA TUSHDI"
yashil "════════════════════════════════════════════"
printf "  Manzil : %s\n" "$MANZIL"
printf "  Holat  : %s (brauzerda ochib ko'ring)\n" "$MANZIL"
printf "\n  Endi Telegramda botingizga /start yozing.\n"
printf "  Admin hisobingizdan bir marta /sozla yuboring — menyular o'rnatiladi.\n\n"
printf "  Jurnalni kuzatish:  npx wrangler tail\n\n"
