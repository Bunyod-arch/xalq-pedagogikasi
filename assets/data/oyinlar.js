/* =========================================================
   INTERAKTIV O'YINLAR — har modul uchun bittadan
   Mazmun darslik matni va maxsus kurs dasturidagi metodlarga
   (klaster, T-jadval, zanjirli xulosa) asoslangan.
   ========================================================= */
window.OYINLAR = {

/* ---------- 1 ---------- */
1: { tur:"klaster", nishon:"🕸", nom:"Klaster tuzing: xalq pedagogikasi manbalari",
  qoida:"Markazdagi tushunchaga tegishli so‘zlarni bo‘sh uyalarga tashlang. Ortiqcha so‘zlar ham bor — ularni qoldiring.",
  markaz:"Xalq pedagogikasi manbalari",
  togri:["Maqol va matallar","Ertak va afsonalar","Dostonlar","Allalar","Urf-odat va marosimlar","Topishmoqlar"],
  qoshimcha:["Laboratoriya tajribasi","Statistik hisobot","Kompyuter dasturi"] },

/* ---------- 2 ---------- */
2: { tur:"saralash", nishon:"📊", nom:"T-jadval: xalq usullari va zamonaviy texnologiyalar",
  qoida:"Har bir kartochkani mos ustunga joylashtiring.",
  jadval:true,
  savatlar:[{nom:"Xalq pedagogikasi vositasi",turi:"ijobiy"},
            {nom:"Zamonaviy ta’lim texnologiyasi",turi:"salbiy"}],
  donalar:[
    {matn:"Maqol va matal",s:0},{matn:"Doston aytish",s:0},
    {matn:"Alla va beshik qo‘shig‘i",s:0},{matn:"Urf-odat namunasi",s:0},
    {matn:"Ustoz-shogird an’anasi",s:0},
    {matn:"Interaktiv doska",s:1},{matn:"Klaster metodi",s:1},
    {matn:"Onlayn test dasturi",s:1},{matn:"Videodars",s:1}] },

/* ---------- 3 ---------- */
3: { tur:"saralash", nishon:"🏠", nom:"Oilaviy tarbiya: to‘g‘ri va noto‘g‘ri yondashuv",
  qoida:"Ota-onaning xatti-harakatlarini ikki guruhga ajrating.",
  savatlar:[{nom:"To‘g‘ri yondashuv",turi:"ijobiy"},
            {nom:"Noto‘g‘ri yondashuv",turi:"salbiy"}],
  donalar:[
    {matn:"Ota-ona o‘zi ibrat ko‘rsatadi",s:0},
    {matn:"Farzand bilan muntazam suhbatlashadi",s:0},
    {matn:"Kattaga hurmatni amalda o‘rgatadi",s:0},
    {matn:"Bolani mehnatga jalb qiladi",s:0},
    {matn:"Farzandning fikrini tinglaydi",s:0},
    {matn:"Faqat jazo bilan tarbiyalaydi",s:1},
    {matn:"Bolani begonalar oldida kamsitadi",s:1},
    {matn:"Va’da berib, bajarmaydi",s:1},
    {matn:"Bolani har qanday mehnatdan chetlashtiradi",s:1}] },

/* ---------- 4 ---------- */
4: { tur:"saralash", nishon:"🧭", nom:"Tarbiya turlarini ajrating",
  qoida:"Har bir topshiriq qaysi tarbiya turiga tegishli?",
  savatlar:[{nom:"Axloqiy tarbiya"},{nom:"Mehnat tarbiyasi"},{nom:"Jismoniy tarbiya"}],
  donalar:[
    {matn:"O‘git va nasihat berish",s:0},
    {matn:"Ibrat-namuna ko‘rsatish",s:0},
    {matn:"Odob qoidalarini o‘rgatish",s:0},
    {matn:"Hunar-kasb o‘rgatish",s:1},
    {matn:"Dala ishiga jalb qilish",s:1},
    {matn:"Mehnat qurollari bilan tanishtirish",s:1},
    {matn:"Kurash mashqlari",s:2},
    {matn:"Ot minishni o‘rgatish",s:2},
    {matn:"Milliy sport o‘yinlari",s:2}] },

/* ---------- 5 ---------- */
5: { tur:"maqol", nishon:"💬", nom:"Maqolning davomini toping",
  qoida:"Har bir maqolning davomini variantlardan tanlang. Maqollar darslik matnidan olingan.",
  savollar:[
    {bosh:"Bilagi zo‘r birni yiqar,", javob:"bilimi zo‘r mingni yiqar",
     variantlar:["bilimi zo‘r mingni yiqar","kuchi zo‘r yuzni yiqar","so‘zi zo‘r o‘nni yiqar"]},
    {bosh:"Bug‘doy eksang bug‘doy olasan,", javob:"arpa eksang, arpa olasan",
     variantlar:["arpa eksang, arpa olasan","suv quysang, hosil olasan","kech eksang, kam olasan"]},
    {bosh:"Ilmsiz bir yashar,", javob:"ilmli ming yashar",
     variantlar:["ilmli ming yashar","ilmli yuz yashar","ilmli tinch yashar"]},
    {bosh:"Birovga go‘r qazisang,", javob:"o‘zing yiqilasan",
     variantlar:["o‘zing yiqilasan","eling kuladi","ishing bitmaydi"]},
    {bosh:"Bola — aziz,", javob:"odobi undan aziz",
     variantlar:["odobi undan aziz","ilmi undan aziz","mehri undan aziz"]},
    {bosh:"Bir bolaga", javob:"butun mahalla ota-ona",
     variantlar:["butun mahalla ota-ona","bitta ustoz kifoya","yetti nasihat kerak"]}] },

/* ---------- 6 ---------- */
6: { tur:"juftlash", nishon:"📜", nom:"Dostonni ta’rifi bilan juftlang",
  qoida:"Chapdagi doston nomini o‘ngdagi to‘g‘ri ta’rif bilan bog‘lang.",
  juftlar:[
    ["«Alpomish»","Qo‘ng‘irot elining botiri haqidagi qahramonlik dostoni"],
    ["«Go‘ro‘g‘li»","Chambil yurti sarkardasi haqidagi doston turkumi"],
    ["«Kuntug‘mish»","Oilaviy sadoqat va sabr-matonat dostoni"],
    ["«Ravshan»","«Go‘ro‘g‘li» turkumiga kiruvchi doston"],
    ["«Farhod va Shirin»","Alisher Navoiyning mehnat va muhabbat dostoni"],
    ["«Layli va Majnun»","Sof, fidoyi muhabbat haqidagi doston"]] },

/* ---------- 7 ---------- */
7: { tur:"saralash", nishon:"🎊", nom:"Marosim va bayramlarni ajrating",
  qoida:"Qaysi biri oilaviy marosim, qaysi biri mavsumiy bayram-sayil?",
  savatlar:[{nom:"Oilaviy marosimlar"},{nom:"Mavsumiy bayram va sayillar"}],
  donalar:[
    {matn:"Beshik to‘yi",s:0},{matn:"Sunnat to‘yi",s:0},
    {matn:"Nikoh to‘yi",s:0},{matn:"Aqiqa",s:0},
    {matn:"Navro‘z",s:1},{matn:"Sumalak sayli",s:1},
    {matn:"Hosil bayrami",s:1},{matn:"Lola sayli",s:1}] },

/* ---------- 8 ---------- */
8: { tur:"juftlash", nishon:"🤸", nom:"Milliy o‘yin va uning tarbiyaviy ahamiyati",
  qoida:"O‘yin nomini u tarbiyalaydigan fazilat bilan juftlang. O‘yin nomlari darslikdan olingan.",
  juftlar:[
    ["«Oq terakmi, ko‘k terak»","Jamoaviylik va chaqqonlik"],
    ["«Quvlashmachoq»","Tezkorlik va chidamlilik"],
    ["«Tortishmachoq»","Kuch va jamoa hamjihatligi"],
    ["«O‘rta qo‘limni top»","Diqqat va zehn o‘tkirligi"],
    ["«Qilich jangi»","Harbiy-jismoniy tayyorgarlik"],
    ["«Podachi»","Mehnatga oid ko‘nikma"]] },

/* ---------- 9 ---------- */
9: { tur:"haYoq", nishon:"⚖️", nom:"To‘g‘rimi yoki noto‘g‘ri?",
  qoida:"Har bir fikrni baholang. Javobdan keyin izoh ko‘rinadi.",
  gaplar:[
    {matn:"Xalq pedagogikasi diniy manbalardagi tarbiyaviy g‘oyalarga ham tayanadi.", togri:true,
     izoh:"To‘g‘ri. Qur’oni Karim va hadislardagi odob-axloq ko‘rsatmalari xalq tarbiyasining muhim manbasi hisoblanadi."},
    {matn:"Islom ta’limotida ilm olish faqat erkaklarga farz qilingan.", togri:false,
     izoh:"Noto‘g‘ri. Ilm olish har bir musulmon erkak va ayolga farz deb belgilangan."},
    {matn:"Hadislarda ota-onaga hurmat ko‘rsatish ulug‘langan.", togri:true,
     izoh:"To‘g‘ri. Ota-ona haqqi hadislarda alohida ta’kidlangan mavzulardan biri."},
    {matn:"Diniy ekstremizm va fanatizm xalq pedagogikasi qadriyatlariga ziddir.", togri:true,
     izoh:"To‘g‘ri. Darslikda g‘oyaviy tahdidlar — terrorizm, fanatizm, ekstremizm — alohida qoralanadi."},
    {matn:"Qur’oni Karim faqat ibodat masalalarini o‘rgatadi, tarbiyaga aloqasi yo‘q.", togri:false,
     izoh:"Noto‘g‘ri. Unda oila, mehnat, ilm, muomala odobi kabi tarbiyaviy masalalar keng yoritilgan."},
    {matn:"Bag‘rikenglik umuminsoniy qadriyat hisoblanadi.", togri:true,
     izoh:"To‘g‘ri. Bag‘rikenglik — milliy va umumbashariy qadriyatlarning kesishgan nuqtasi."}] },

/* ---------- 10 ---------- */
10:{ tur:"juftlash", nishon:"🏺", nom:"Hunar va uning mahsuloti",
  qoida:"Har bir hunarni u yaratadigan mahsulot bilan juftlang.",
  juftlar:[
    ["Kulolchilik","Sopol idish, xurmacha"],
    ["Kashtachilik","Suzani va choyshab"],
    ["Misgarlik","Mis qumg‘on va lagan"],
    ["Zargarlik","Kumush taqinchoqlar"],
    ["Naqqoshlik","Ganch va yog‘och o‘ymakorligi"],
    ["Pichoqchilik","Chust pichog‘i"],
    ["Gilamchilik","Qo‘lda to‘qilgan gilam"]] },

/* ---------- 11 ---------- */
11:{ tur:"saralash", nishon:"🤝", nom:"Muomala odobi: to‘g‘ri va noto‘g‘ri",
  qoida:"Xatti-harakatlarni odob me’yorlariga ko‘ra ajrating.",
  savatlar:[{nom:"Odobga mos",turi:"ijobiy"},{nom:"Odobga zid",turi:"salbiy"}],
  donalar:[
    {matn:"Kattaga birinchi bo‘lib salom berish",s:0},
    {matn:"Mehmonni izzat-ikrom bilan kutib olish",s:0},
    {matn:"Suhbatdoshni bo‘lmasdan tinglash",s:0},
    {matn:"Ota-onaga «siz»lab murojaat qilish",s:0},
    {matn:"Ustoz oldidan hurmat bilan o‘tish",s:0},
    {matn:"Kattaning gapini bo‘lish",s:1},
    {matn:"Mehmonni kutib olmaslik",s:1},
    {matn:"Baland ovozda janjallashish",s:1},
    {matn:"Bergan va’dani bajarmaslik",s:1}] },

/* ---------- 12 ---------- */
12:{ tur:"juftlash", nishon:"🎼", nom:"Qo‘shiq janri qayerda ijro etiladi?",
  qoida:"Xalq qo‘shig‘i janrini u ijro etiladigan holat bilan juftlang.",
  juftlar:[
    ["Alla","Beshik boshida, bolani uxlatishda"],
    ["Yor-yor","To‘y marosimida, kelin uzatishda"],
    ["Yig‘i-yo‘qlov","Motam marosimida"],
    ["Lapar","Yigit-qizlarning o‘zaro aytishuvida"],
    ["Askiya","To‘y va sayillarda so‘z o‘yini sifatida"],
    ["Ulan","Bayram va sayil tomoshalarida"]] },

/* ---------- 13 ---------- */
13:{ tur:"klaster", nishon:"🎓", nom:"Klaster tuzing: ustoz fazilatlari",
  qoida:"Darslikda ustozga xos deb ko‘rsatilgan fazilatlarni uyalarga tashlang.",
  markaz:"Ustoz fazilatlari",
  togri:["Samimiylik","Iltifotlilik","Haqiqatlilik","Mardlik","Mehribonlik","Intizom","Sabr-toqat"],
  qoshimcha:["Shoshqaloqlik","Manmanlik","Beparvolik"] },

/* ---------- 14 ---------- */
14:{ tur:"saralash", nishon:"♻️", nom:"Chiqindilarni saralang",
  qoida:"Har bir chiqindini o‘z konteyneriga tashlang — tabiatni asrash shundan boshlanadi.",
  savatlar:[{nom:"Qog‘oz"},{nom:"Plastik"},{nom:"Shisha"},{nom:"Organik"}],
  donalar:[
    {matn:"Eski gazeta",s:0},{matn:"Karton quti",s:0},{matn:"Daftar varag‘i",s:0},
    {matn:"Plastik shisha",s:1},{matn:"Selofan paket",s:1},{matn:"Plastik qopqoq",s:1},
    {matn:"Shisha banka",s:2},{matn:"Singan oyna",s:2},
    {matn:"Olma po‘sti",s:3},{matn:"Choy quyqasi",s:3},{matn:"Non ushog‘i",s:3}] }
};
