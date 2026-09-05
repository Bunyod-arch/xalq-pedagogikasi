# Xalq pedagogikasi — elektron darslik

**M. Usmonova** · Namangan davlat pedagogika instituti · 2025
60110100 — Pedagogika. Tarbiya fani o‘qituvchisi

🔗 **[bunyod-arch.github.io/xalq-pedagogikasi](https://bunyod-arch.github.io/xalq-pedagogikasi/)**

---

## Nima bor

| | |
|---|---|
| **14 modul** | Darslikning to‘liq ilmiy-nazariy matni |
| **Maxsus kurs dasturi** | Tajriba-sinov dasturi: 9 ta trening, interaktiv metodlar, anketalar |
| **Darslik haqida** | Annotatsiya, kirish va to‘liq mundarija (o‘zbek + rus) |
| **98 test savoli** | Har modulga 7 tadan, avtomatik baholanadi, izohi bilan |
| **14 interaktiv o‘yin** | Klaster, T-jadval, saralash, maqol davomi, juftlash, ha/yo‘q |
| **85 atama** | Qidiruvli glossariy |
| **95 manba** | Foydalanilgan adabiyotlar ro‘yxati |
| **44 yakuniy savol** | Kurs bo‘yicha yakuniy nazorat |
| **Video va audio** | Har modulda video dars; 5- va 12-modulda alla va lirik qo‘shiqlar |

Har bir modul sahifasida: reja · **qisqacha mazmun** · tayanch so‘zlar · video dars ·
to‘liq ma’ruza matni · interaktiv o‘yin · topshiriq · nazorat savollari · test ·
izohlar · mavzuga oid adabiyotlar.

Manba hujjatlarning **99,5 %** matni saytga joylashtirilgan (qolgani — sarlavha
takrorlari va sahifa raqamlari).

## Modullar

1. Xalq pedagogikasi fanining maqsad va vazifalari, mazmuni
2. Xalq pedagogikasining didaktik imkoniyatlarini o‘quv-tarbiyaviy jarayonga tadbiq etish
3. Xalq pedagogikasida oila va oilaviy tarbiyaning aks etishi
4. Xalq pedagogikasida yoshlarni tarbiyalashning metod, usul va vositalari
5. Xalq pedagogikasi va o‘zbek xalq og‘zaki ijodi
6. Xalq pedagogikasi va xalq og‘zaki ijodida dostonlar
7. Xalq pedagogikasida milliy urf-odatlar, an’analar, udumlar, marosimlar
8. Xalq pedagogikasida milliy o‘yinlarning mazmuni va tarbiyaviy ahamiyati
9. Xalq pedagogikasida diniy ta’limotlar
10. Xalq pedagogikasida xalq amaliy san’ati va madaniyatining o‘rni
11. O‘zbek xalqining muomala madaniyati va axloqiy me’yorlari
12. Milliy musiqa, qo‘shiqchilik va milliy teatrlar
13. Xalq pedagogikasi manbalarida ustoz-o‘qituvchi kasbining ulug‘lanishi
14. Xalq tarbiya nazariyasida tabiatni muhofaza qilish va sog‘lom turmush

## Texnik ma’lumot

Statik sayt — server, ma’lumotlar bazasi va build talab qilinmaydi.
Faylni brauzerda ochish yoki GitHub Pages orqali ishlatish kifoya.

```
index.html            Skroll-hikoya: o‘quvchining bosqichma-bosqich o‘zgarishi
modullar.html         14 modul ro‘yxati
modul-1..14.html      Modul sahifalari (generatsiya qilingan)
dastur.html           Maxsus kurs dasturi (treninglar, metodlar)
darslik-haqida.html   Annotatsiya, kirish, mundarija
glossariy.html        Qidiruvli atamalar lug‘ati
adabiyotlar.html      Foydalanilgan adabiyotlar
yakuniy.html          Yakuniy nazorat savollari

assets/css/style.css       Yagona dizayn tizimi
assets/css/animatsiya.css  Animatsiyalar va ikonkalar
assets/css/hikoya.css      Bosh sahifadagi skroll-hikoya (12 qatlam, --p bo‘yicha)
assets/css/tailwind.css    Tailwind (oldindan build qilingan, ~4 KB)
assets/js/app.js           Menyu, progress, localStorage
assets/js/animatsiya.js    Bo‘limga o‘tish, ikonkalar, raqam sanash
assets/js/hikoya.js        Skroll-hikoya boshqaruvi (GSAP ScrollTrigger + zaxira)
assets/vendor/             GSAP 3.15 va ScrollTrigger (lokal, CDN‘siz)
assets/js/oyin.js          O‘yin dvigateli (5 tur)
assets/js/test.js          Test dvigateli
assets/js/qidiruv.js       Glossariy/adabiyot qidiruvi
assets/data/*.js           Modullar, o‘yinlar va testlar ma’lumoti
```

Modul kartochkalari va barcha matn HTML ichida tayyor turadi — JavaScript
o‘chirilgan bo‘lsa ham sahifalar bo‘sh qolmaydi.

### Bosh sahifadagi transformatsiya

Bitta qahramon 12 ta mustaqil qatlamdan iborat (kiyim, soch, do‘ppi, chopon,
daftar, qalam, kitob, ryukzak, qosh, og‘iz, qovoq, yonoq). Har bir qatlamning
ko‘rinishi `--p` (0…1 skroll foizi) dan CSS `clamp()` bilan hisoblanadi —
`assets/css/hikoya.css` ichidagi jadval. Vaqtlarni o‘zgartirish uchun faqat
shu sonlarni tahrirlash kifoya, JavaScript‘ga tegilmaydi.

GSAP ScrollTrigger `scrub` bilan qiymatni yumshatadi; GSAP yuklanmasa
`requestAnimationFrame` zaxirasi ishlaydi. O‘lchangan tezlik: ~60 FPS.

### Tailwind'ni qayta qurish

```bash
npx tailwindcss@3 -i tailwind.input.css -o assets/css/tailwind.css --minify
```

### Testlar yoki o‘yinlarni o‘zgartirish

Savollar — [`assets/data/testlar.js`](assets/data/testlar.js),
o‘yinlar — [`assets/data/oyinlar.js`](assets/data/oyinlar.js).
Ikkalasi ham oddiy JavaScript obyekti, HTML'ga tegmasdan tahrirlash mumkin.

### Video va audio almashtirish

Har modulning video bloki `modul-N.html` ichidagi `<iframe src="…/embed/VIDEO_ID">`
qatorida. `VIDEO_ID` ni almashtirish kifoya.

## Saytni muzlatish va yoqish

Saytni istalgan vaqt yopib, keyin qayta ochish mumkin. Uch yo‘l bor —
batafsil qo‘llanma: [bot/README.md](bot/README.md)

| Yo‘l | Qanday | Nima kerak |
|---|---|---|
| **GitHub tugmasi** (tavsiya) | Actions → «Saytni muzlatish yoki yoqish» → Run workflow | hech narsa |
| **Faylni tahrirlash** | `holat.json` da `"faol": true` ↔ `false` | hech narsa |
| **Telegram bot** | 🔒 / 🔓 tugmalari | bot tokeni + GitHub tokeni + bot ishlaydigan joy |

Muzlatilganda tashrifchi «Sayt vaqtincha to‘xtatilgan» oynasini ko‘radi.
Qat‘iy o‘chirish kerak bo‘lsa: Settings → Pages → Source → **None**.

## Talablar

- Zamonaviy brauzer (Chrome, Safari, Firefox, Edge)
- Telefon, planshet va kompyuterga moslashgan
- Natijalar brauzer xotirasida (`localStorage`) saqlanadi

---

Eski (2025-yil sentyabrigacha bo‘lgan) variant `eski-variant` branchida saqlangan.
