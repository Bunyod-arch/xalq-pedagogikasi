/* =========================================================
   QO'SHIMCHA INTERAKTIV BLOKLAR
   O'quv dasturida o'yin, folklor, musiqa va teatr bilan bog'liq
   modullar (5, 8, 12) uchun ikkinchi, jonliroq mashg'ulotlar.
   ========================================================= */
window.OYINLAR2 = {

/* ---------- 5-MODUL: XALQ TOPISHMOQLARI ----------
   Darslikda topishmoqlar bolalar tafakkuri va mushohada
   qobiliyatini o'stirish vositasi sifatida ko'rsatilgan. */
5: { tur:"topishmoq", nishon:"🧩", nom:"Xalq topishmoqlari",
  qoida:"Har bir topishmoqning javobini toping. Topishmoq — bolalar tafakkurini charxlaydigan eng qadimiy o‘quv vositasi.",
  savollar:[
    { matn:"Og‘zi bor, tili yo‘q — ichi to‘la so‘z.",
      javob:"Kitob", variantlar:["Kitob","Qo‘ng‘iroq","Quduq"],
      izoh:"Kitob gapirmaydi, lekin unda son-sanoqsiz so‘z bor." },
    { matn:"Bir uyda ming qo‘chqor.",
      javob:"Anor", variantlar:["Anor","Qovun","Yong‘oq"],
      izoh:"Anorning po‘sti — uy, ichidagi donalar — qo‘chqorlar." },
    { matn:"Yozda kiyinadi, qishda yechinadi.",
      javob:"Daraxt", variantlar:["Daraxt","Qo‘y","Tog‘"],
      izoh:"Daraxt yozda barg yoyadi, kuzda to‘kadi." },
    { matn:"Uyi bor, eshigi yo‘q.",
      javob:"Tuxum", variantlar:["Tuxum","G‘or","Beshik"],
      izoh:"Tuxum po‘sti butun — kirish yo‘li yo‘q." },
    { matn:"Kunduzi uxlaydi, kechasi ko‘zi ochiladi.",
      javob:"Boyqush", variantlar:["Boyqush","Chumoli","Qaldirg‘och"],
      izoh:"Boyqush — tungi qush." },
    { matn:"Onasi tebranadi, bolasi uxlaydi.",
      javob:"Beshik", variantlar:["Beshik","Shamol","Daryo"],
      izoh:"Beshik — alla aytiladigan joy; birinchi tarbiya maskani." },
    { matn:"Erta bilan to‘rt oyoq, kunduzi ikki oyoq, kechqurun uch oyoq.",
      javob:"Inson", variantlar:["Inson","Ot","Beshik"],
      izoh:"Bolalik — emaklash, yoshlik — yurish, qarilik — hassa bilan." },
    { matn:"Bergan sari ko‘payadi, saqlagan sari kamayadi.",
      javob:"Bilim", variantlar:["Bilim","Oltin","Suv"],
      izoh:"Ilm ulashilgani sari ortadi — xalq pedagogikasining asosiy g‘oyasi." }
  ] },

/* ---------- 8-MODUL: «O'RTA QO'LINI TOP» ----------
   Darslikda sanab o'tilgan xalq o'yinlaridan biri. Diqqat va
   kuzatuvchanlikni o'stiradi. */
8: { tur:"topish", nishon:"🎯", nom:"«O‘rta qo‘lini top»",
  qoida:"Olma do‘ppilardan birining tagida. Do‘ppilar aralashtiriladi — diqqat bilan kuzating va olma qayerdaligini toping. Har darajada aralashtirish tezlashadi.",
  dopqi:4, boshDaraja:1 },

/* ---------- 12-MODUL: QO'G'IRCHOQ TEATRI ----------
   Darslikda drama to'garagi va milliy teatr tarbiya vositasi
   sifatida ko'rsatilgan. Bu — ijodiy mashg'ulot. */
12:{ tur:"sahna", nishon:"🎭", nom:"Qo‘g‘irchoq teatri — sahna quring",
  qoida:"Qahramon, sahna va xulosani tanlang — kichik spektakl matni tayyor bo‘ladi. Uni sinfda qo‘g‘irchoq bilan o‘ynash mumkin.",
  qahramonlar:[
    { nom:"Qiziqchi", nishon:"🤹", tavsif:"hozirjavob, kulgili" },
    { nom:"Polvon",   nishon:"💪", tavsif:"kuchli, mard" },
    { nom:"Buvijon",  nishon:"👵", tavsif:"donishmand, mehribon" },
    { nom:"Baxshi",   nishon:"🎤", tavsif:"doston aytuvchi" },
    { nom:"Hunarmand",nishon:"🏺", tavsif:"sabrli usta" },
    { nom:"Talaba",   nishon:"🎓", tavsif:"izlanuvchan yosh" }
  ],
  sahnalar:[
    { nom:"Mahalla to‘yi",   nishon:"🎊", matn:"mahalla to‘yida odamlar yig‘ilgan" },
    { nom:"Ustaxona",        nishon:"🔨", matn:"ustaxonada shogird hunar o‘rganmoqda" },
    { nom:"Maktab hovlisi",  nishon:"🏫", matn:"maktab hovlisida bolalar o‘yin o‘ynamoqda" },
    { nom:"Choyxona",        nishon:"🍵", matn:"choyxonada keksalar suhbatlashmoqda" },
    { nom:"Dala",            nishon:"🌾", matn:"dalada hosil yig‘im-terimi ketmoqda" },
    { nom:"Beshik boshida",  nishon:"🌙", matn:"beshik boshida ona alla aytmoqda" }
  ],
  xulosalar:[
    "«Bola — aziz, odobi undan aziz»",
    "«Bilagi zo‘r birni yiqar, bilimi zo‘r mingni yiqar»",
    "«Bir bolaga butun mahalla ota-ona»",
    "«Ilmsiz bir yashar, ilmli ming yashar»",
    "«Bug‘doy eksang bug‘doy olasan, arpa eksang arpa olasan»",
    "«Beshikdan to qabrgacha ilm izla»"
  ] }
};
