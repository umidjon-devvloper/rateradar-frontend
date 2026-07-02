/**
 * Ommaviy huquqiy / kompaniya sahifalari uchun kontent (uz / ru / en).
 *
 * To'lovlar bo'yicha ma'lumot ATMOS to'lov shlyuzi hujjatlariga asoslangan
 * (apigw.atmos.uz — UzCard, Humo, Visa, Mastercard).
 * Har bir sahifa `useLang` orqali joriy tilni tanlaydi.
 */

export const CONTACT = {
  email: 'info@thehotelsaas.com',
  telegram: '@rateradar_support',
  telegramUrl: 'https://t.me/rateradar_support',
  brand: 'TheHotelSaaS',
};

const uz = {
  about: {
    title: 'Biz haqimizda',
    intro:
      "TheHotelSaaS (RateRadar) — mehmonxonalar uchun narx va reyting monitoringi platformasi. Biz O'zbekiston va mintaqadagi mehmonxonalarga raqobatchilar narxlarini kuzatish, OTA kanallaridagi ma'lumotlarni bir joyda ko'rish va sun'iy intellekt yordamida daromadni oshirishga yordam beramiz.",
    sections: [
      {
        h: 'Bizning vazifamiz',
        p: "Mehmonxona egalari va revenue-menejerlarga aniq, real vaqtdagi ma'lumot berish orqali to'g'ri narx qarorlarini qabul qilishga ko'maklashish. Booking.com, Expedia, Agoda va boshqa platformalardagi narxlarni avtomatik yig'ib, tushunarli tahlilga aylantiramiz.",
      },
      {
        h: 'Nima taklif qilamiz',
        list: [
          "Raqobatchilar narxlarini avtomatik kuzatish va taqqoslash",
          "OTA kanallari va reytinglarni yagona panelda birlashtirish",
          "AI asosidagi narx tavsiyalari va daromad tahlili",
          "Mehmonlar uchun QR orqali xizmat buyurtma tizimi",
        ],
      },
      {
        h: 'To\'lovlar',
        p: "Platformadagi to'lovlar ATMOS to'lov shlyuzi orqali xavfsiz amalga oshiriladi. UzCard, Humo, Visa va Mastercard kartalari qo'llab-quvvatlanadi.",
      },
    ],
  },
  contact: {
    title: "Bog'lanish",
    intro:
      "Savollaringiz, takliflaringiz yoki texnik yordam kerak bo'lsa — biz bilan bog'laning. Odatda ish kunlari 24 soat ichida javob beramiz.",
    sections: [],
  },
  terms: {
    title: 'Foydalanish shartlari',
    updated: "Oxirgi yangilanish: 2026-yil 1-iyul",
    intro:
      "Ushbu shartlar TheHotelSaaS (RateRadar) platformasidan foydalanishni tartibga soladi. Xizmatdan foydalanish orqali siz ushbu shartlarga rozilik bildirasiz.",
    sections: [
      {
        h: '1. Xizmat tavsifi',
        p: "TheHotelSaaS mehmonxonalar uchun narx monitoringi, reyting tahlili va daromad boshqaruvi vositalarini taqdim etadi. Biz uchinchi tomon platformalaridan (OTA) ochiq ma'lumotlarni yig'amiz va tahlil qilamiz.",
      },
      {
        h: '2. Akkaunt va foydalanish',
        p: "Ro'yxatdan o'tishda to'g'ri ma'lumot berishingiz kerak. Akkaunt xavfsizligi va parol maxfiyligi uchun siz javobgarsiz. Xizmatdan qonunga zid maqsadlarda foydalanish taqiqlanadi.",
      },
      {
        h: '3. To\'lov va obuna',
        p: "Pullik rejalar obuna asosida ishlaydi. To'lovlar ATMOS to'lov shlyuzi orqali UzCard, Humo, Visa va Mastercard kartalari bilan amalga oshiriladi. Barcha to'lovlar xavfsiz shifrlangan ulanish orqali qayta ishlanadi; biz karta ma'lumotlarini saqlamaymiz.",
      },
      {
        h: '4. Bekor qilish va qaytarish',
        p: "Obunani istalgan vaqtda bekor qilishingiz mumkin — bu joriy hisob-kitob davri oxirigacha amal qiladi. Qaytarish masalalari bo'yicha info@thehotelsaas.com manziliga murojaat qiling.",
      },
      {
        h: '5. Javobgarlikni cheklash',
        p: "Xizmat \"borligicha\" (as is) taqdim etiladi. Biz uchinchi tomon ma'lumotlarining to'liq aniqligini kafolatlamaymiz va ulardan foydalanish natijasida kelib chiqadigan bilvosita zararlar uchun javobgar emasmiz.",
      },
      {
        h: '6. Shartlarga o\'zgartirish',
        p: "Biz ushbu shartlarni vaqti-vaqti bilan yangilashimiz mumkin. Muhim o'zgarishlar haqida platformada yoki email orqali xabar beramiz.",
      },
    ],
  },
  privacy: {
    title: 'Maxfiylik siyosati',
    updated: "Oxirgi yangilanish: 2026-yil 1-iyul",
    intro:
      "Ushbu siyosat biz qanday ma'lumotlarni yig'ishimiz, ulardan qanday foydalanishimiz va ularni qanday himoya qilishimizni tushuntiradi.",
    sections: [
      {
        h: '1. Yig\'iladigan ma\'lumotlar',
        list: [
          "Akkaunt ma'lumotlari: ism, email, mehmonxona nomi va joylashuvi",
          "Foydalanish ma'lumotlari: platformadagi harakatlar va sozlamalar",
          "To'lov ma'lumotlari: to'lovlar ATMOS orqali amalga oshiriladi, biz karta raqamlarini saqlamaymiz",
        ],
      },
      {
        h: "2. Ma'lumotlardan foydalanish",
        p: "Yig'ilgan ma'lumotlardan xizmatni taqdim etish, yaxshilash, texnik yordam ko'rsatish va sizni muhim yangilanishlar haqida ogohlantirish uchun foydalanamiz.",
      },
      {
        h: '3. To\'lov ma\'lumotlari xavfsizligi',
        p: "Barcha to'lovlar ATMOS to'lov shlyuzi (apigw.atmos.uz) orqali qayta ishlanadi. Karta ma'lumotlari to'g'ridan-to'g'ri ATMOS xavfsiz muhitida shifrlanadi — biz to'liq karta raqami yoki CVV kabi maxfiy ma'lumotlarni saqlamaymiz va ko'rmaymiz.",
      },
      {
        h: "4. Ma'lumotlarni uchinchi tomonlarga berish",
        p: "Biz sizning shaxsiy ma'lumotlaringizni sotmaymiz. Ma'lumotlar faqat xizmatni ta'minlash uchun zarur bo'lgan hollarda (masalan, to'lov shlyuzi) yoki qonun talab qilganda ulashiladi.",
      },
      {
        h: "5. Ma'lumotlar xavfsizligi",
        p: "Ma'lumotlaringizni himoya qilish uchun shifrlash, kirishni cheklash va monitoring kabi zamonaviy xavfsizlik choralaridan foydalanamiz.",
      },
      {
        h: '6. Sizning huquqlaringiz',
        p: "Siz o'z ma'lumotlaringizga kirish, ularni tuzatish yoki o'chirishni so'rash huquqiga egasiz. Buning uchun info@thehotelsaas.com manziliga murojaat qiling.",
      },
    ],
  },
  offer: {
    title: 'Ommaviy oferta (Litsenziya shartnomasi)',
    updated: "Oxirgi yangilangan sana: 02.07.2026",
    intro:
      "Ushbu hujjat thehotelsaas.com (keyingi o'rinlarda — «Sayt» yoki «Tizim») operatori bo'lgan Lochin ekspres plyus MChJ (keyingi o'rinlarda — «Litsenziar») tomonidan yuridik shaxslar va yakka tartibdagi tadbirkorlarga (keyingi o'rinlarda — «Litsenziat» yoki «Foydalanuvchi») SaaS-platformadan foydalanish huquqini taqdim etish bo'yicha rasmiy taklif (Ommaviy oferta) hisoblanadi. O'zbekiston Respublikasi Fuqarolik kodeksining 369-moddasiga muvofiq, ushbu ofertada ko'rsatilgan shartlar qabul qilinishi (aksept) va Tizimda ro'yxatdan o'tilishi yoki obuna haqi to'lanishi shartnoma tuzilganligini anglatadi va u yuridik kuchga ega.",
    sections: [
      {
        h: "1. Atamalar va ta'riflar",
        list: [
          "SaaS-platforma (Tizim) — thehotelsaas.com manzilida joylashgan, mehmonxonalarni boshqarish (PMS, Channel Manager va b.) uchun mo'ljallangan bulutli dasturiy ta'minot.",
          "Aksept — Foydalanuvchi tomonidan Oferta shartlarini to'liq va so'zsiz qabul qilinishi (ro'yxatdan o'tish yoki to'lov qilish orqali).",
          "Litsenziat (Foydalanuvchi) — Tizimdan o'z tijorat faoliyatida foydalanuvchi mehmonxona, xostel yoki boshqa joylashtirish vositasi egasi (yuridik shaxs yoki YaTT).",
          "Tarif rejasi (Obuna) — Tizim funksiyalaridan foydalanish muddati, narxi va hajmini belgilovchi shartlar to'plami.",
        ],
      },
      {
        h: '2. Shartnoma predmeti',
        list: [
          "2.1. Litsenziar Foydalanuvchiga Tizimdan (SaaS) internet orqali oddiy (noeksklyuziv) litsenziya shartlarida foydalanish huquqini beradi.",
          "2.2. Foydalanuvchi tanlangan Tarif rejasiga muvofiq xizmatlar uchun haq to'lash va Tizimdan faqat qonuniy maqsadlarda foydalanish majburiyatini oladi.",
        ],
      },
      {
        h: "3. Ro'yxatdan o'tish va aksept",
        list: [
          "3.1. Shartnoma Foydalanuvchi Saytda ro'yxatdan o'tgan (shaxsiy kabinet ochgan) yoki Tarif bo'yicha birinchi to'lovni amalga oshirgan paytdan boshlab kuchga kiradi.",
          "3.2. Ro'yxatdan o'tish paytida Foydalanuvchi haqiqiy va to'g'ri ma'lumotlarni (mehmonxona nomi, STIR (INN), telefon, email) kiritishi shart.",
        ],
      },
      {
        h: "4. To'lov shartlari va avtomatik yangilanish (Auto-Renewal)",
        list: [
          "4.1. Tizimdan foydalanish narxi va tariflari Saytning «Tariflar» sahifasida ko'rsatilgan. Litsenziar tariflarni bir tomonlama o'zgartirish huquqiga ega (bu haqda 10 kun oldin xabar beriladi).",
          "4.2. To'lovlar 100% oldindan to'lov (prepayment) tizimida amalga oshiriladi.",
          "4.3. Avtomatik obuna: Foydalanuvchi bank kartasini ulaganida, keyingi davr (oy/yil) uchun to'lov obuna muddati tugashidan oldin kartadan avtomatik yechib olinishiga rozilik beradi. Foydalanuvchi obunani istalgan vaqtda shaxsiy kabinetida bekor qilishi mumkin.",
          "4.4. To'langan mablag'lar qaytarilmaydi, chunki dasturiy ta'minotga kirish huquqi to'lov qilingan zahoti to'liq taqdim etilgan hisoblanadi.",
        ],
      },
      {
        h: '5. Tomonlarning huquq va majburiyatlari',
        list: [
          "5.1. Litsenziar majburiyatlari: Tizimning uzluksiz ishlashini ta'minlash (texnik cheklovlar doirasida, ~99% uptime); Foydalanuvchi ma'lumotlarining xavfsizligi va maxfiyligini saqlash.",
          "5.2. Foydalanuvchi majburiyatlari: shaxsiy kabinet parollarini uchinchi shaxslarga bermaslik; Tizimni buzishga, nusxalashga yoki uning kodini o'g'irlashga urinmaslik.",
        ],
      },
      {
        h: "6. Mas'uliyatni cheklash (Disclaimer)",
        list: [
          "6.1. Tizim «Qanday bo'lsa, shunday» («As Is») tamoyili asosida taqdim etiladi. Litsenziar Tizim Foydalanuvchining barcha kutganlariga mos kelishiga kafolat bermaydi.",
          "6.2. Litsenziar internet uzilishlari, xakerlik hujumlari, elektr energiyasi o'chishi yoki uchinchi tomon xizmatlari (masalan, Booking.com, Expedia API uzilishlari) tufayli yuzaga kelgan ma'lumotlar yo'qolishi yoki boy berilgan foyda uchun javobgar emas.",
          "6.3. Litsenziarning umumiy moliyaviy javobgarligi Foydalanuvchi tomonidan oxirgi 1 (bir) oy davomida to'langan obuna miqdoridan oshib ketishi mumkin emas.",
        ],
      },
      {
        h: "7. Maxfiylik va shaxsiy ma'lumotlar xavfsizligi",
        list: [
          "7.1. Litsenziat Tizimga kiritadigan mehmonlar (mijozlar) ma'lumotlari O'zbekiston Respublikasining «Shaxsiy ma'lumotlar to'g'risida»gi Qonuniga muvofiq himoya qilinadi.",
          "7.2. Litsenziar Foydalanuvchining ruxsatisiz uning ma'lumotlarini uchinchi tomonlarga sotmaydi va oshkor qilmaydi (qonunchilikda belgilangan holatlar mustasno).",
        ],
      },
      {
        h: '8. Fors-major va nizolarni hal etish',
        list: [
          "8.1. Tomonlar yengib bo'lmas kuchlar (tabiiy ofatlar, urush, davlat taqiqlari, global internet uzilishlari) vaqtida majburiyatlardan ozod qilinadilar.",
          "8.2. Ushbu Shartnoma yuzasidan kelib chiqadigan barcha nizolar muzokaralar yo'li bilan, kelishuv bo'lmaganda esa Buxoro viloyati iqtisodiy sudi orqali hal qilinadi.",
        ],
      },
      {
        h: "9. Rekvizitlar (Litsenziar ma'lumotlari)",
        list: [
          "Tashkilot nomi: Lochin ekspres plyus MChJ",
          "Manzil: Buxoro shahri, Islom Karimov ko'chasi, 21-uy",
          "Email: info@thehotelsaas.com",
        ],
      },
    ],
  },
};

const ru = {
  about: {
    title: 'О нас',
    intro:
      'TheHotelSaaS (RateRadar) — платформа мониторинга цен и рейтингов для отелей. Мы помогаем отелям в Узбекистане и регионе отслеживать цены конкурентов, видеть данные OTA-каналов в одном месте и увеличивать доход с помощью искусственного интеллекта.',
    sections: [
      {
        h: 'Наша миссия',
        p: 'Предоставлять владельцам отелей и revenue-менеджерам точные данные в реальном времени, чтобы принимать правильные ценовые решения. Мы автоматически собираем цены с Booking.com, Expedia, Agoda и других платформ и превращаем их в понятную аналитику.',
      },
      {
        h: 'Что мы предлагаем',
        list: [
          'Автоматический мониторинг и сравнение цен конкурентов',
          'Объединение OTA-каналов и рейтингов в единой панели',
          'Ценовые рекомендации и анализ дохода на базе AI',
          'Система заказа услуг для гостей через QR-код',
        ],
      },
      {
        h: 'Платежи',
        p: 'Платежи на платформе безопасно обрабатываются через платёжный шлюз ATMOS. Поддерживаются карты UzCard, Humo, Visa и Mastercard.',
      },
    ],
  },
  contact: {
    title: 'Связаться с нами',
    intro:
      'Если у вас есть вопросы, предложения или нужна техническая поддержка — свяжитесь с нами. Обычно мы отвечаем в течение 24 часов в рабочие дни.',
    sections: [],
  },
  terms: {
    title: 'Условия использования',
    updated: 'Последнее обновление: 1 июля 2026 г.',
    intro:
      'Настоящие условия регулируют использование платформы TheHotelSaaS (RateRadar). Используя сервис, вы соглашаетесь с этими условиями.',
    sections: [
      {
        h: '1. Описание сервиса',
        p: 'TheHotelSaaS предоставляет инструменты мониторинга цен, анализа рейтингов и управления доходом для отелей. Мы собираем и анализируем открытые данные со сторонних платформ (OTA).',
      },
      {
        h: '2. Аккаунт и использование',
        p: 'При регистрации вы обязаны предоставлять достоверную информацию. Вы несёте ответственность за безопасность аккаунта и конфиденциальность пароля. Запрещается использовать сервис в противозаконных целях.',
      },
      {
        h: '3. Оплата и подписка',
        p: 'Платные тарифы работают на основе подписки. Платежи осуществляются через платёжный шлюз ATMOS картами UzCard, Humo, Visa и Mastercard. Все платежи обрабатываются по защищённому шифрованному соединению; мы не храним данные карт.',
      },
      {
        h: '4. Отмена и возврат',
        p: 'Вы можете отменить подписку в любое время — она действует до конца текущего расчётного периода. По вопросам возврата обращайтесь на info@thehotelsaas.com.',
      },
      {
        h: '5. Ограничение ответственности',
        p: 'Сервис предоставляется «как есть» (as is). Мы не гарантируем полную точность сторонних данных и не несём ответственности за косвенный ущерб, возникший в результате их использования.',
      },
      {
        h: '6. Изменение условий',
        p: 'Мы можем периодически обновлять эти условия. О существенных изменениях мы уведомим на платформе или по электронной почте.',
      },
    ],
  },
  privacy: {
    title: 'Политика конфиденциальности',
    updated: 'Последнее обновление: 1 июля 2026 г.',
    intro:
      'Эта политика объясняет, какие данные мы собираем, как их используем и как защищаем.',
    sections: [
      {
        h: '1. Собираемые данные',
        list: [
          'Данные аккаунта: имя, email, название и расположение отеля',
          'Данные использования: действия и настройки на платформе',
          'Платёжные данные: платежи проходят через ATMOS, мы не храним номера карт',
        ],
      },
      {
        h: '2. Использование данных',
        p: 'Мы используем собранные данные для предоставления и улучшения сервиса, технической поддержки и уведомления вас о важных обновлениях.',
      },
      {
        h: '3. Безопасность платёжных данных',
        p: 'Все платежи обрабатываются через платёжный шлюз ATMOS (apigw.atmos.uz). Данные карты шифруются непосредственно в защищённой среде ATMOS — мы не храним и не видим полный номер карты или CVV.',
      },
      {
        h: '4. Передача данных третьим лицам',
        p: 'Мы не продаём ваши персональные данные. Данные передаются только когда это необходимо для работы сервиса (например, платёжному шлюзу) или по требованию закона.',
      },
      {
        h: '5. Безопасность данных',
        p: 'Для защиты ваших данных мы применяем современные меры безопасности: шифрование, ограничение доступа и мониторинг.',
      },
      {
        h: '6. Ваши права',
        p: 'Вы имеете право на доступ, исправление или удаление ваших данных. Для этого обращайтесь на info@thehotelsaas.com.',
      },
    ],
  },
  offer: {
    title: 'Публичная оферта (Лицензионный договор)',
    updated: 'Последнее обновление: 02.07.2026',
    intro:
      'Настоящий документ является официальным предложением (Публичной офертой) оператора сайта thehotelsaas.com (далее — «Сайт» или «Система») — Lochin ekspres plyus MChJ (далее — «Лицензиар») — юридическим лицам и индивидуальным предпринимателям (далее — «Лицензиат» или «Пользователь») о предоставлении права пользования SaaS-платформой. В соответствии со статьёй 369 Гражданского кодекса Республики Узбекистан, принятие (акцепт) указанных в оферте условий и регистрация в Системе либо оплата подписки означают заключение договора, имеющего юридическую силу.',
    sections: [
      {
        h: '1. Термины и определения',
        list: [
          'SaaS-платформа (Система) — облачное программное обеспечение по адресу thehotelsaas.com, предназначенное для управления отелями (PMS, Channel Manager и др.).',
          'Акцепт — полное и безоговорочное принятие Пользователем условий Оферты (через регистрацию или оплату).',
          'Лицензиат (Пользователь) — владелец отеля, хостела или иного средства размещения, использующий Систему в коммерческой деятельности (юридическое лицо или ИП).',
          'Тарифный план (Подписка) — набор условий, определяющих срок, стоимость и объём использования функций Системы.',
        ],
      },
      {
        h: '2. Предмет договора',
        list: [
          '2.1. Лицензиар предоставляет Пользователю право пользования Системой (SaaS) через интернет на условиях простой (неисключительной) лицензии.',
          '2.2. Пользователь обязуется оплачивать услуги согласно выбранному Тарифному плану и использовать Систему только в законных целях.',
        ],
      },
      {
        h: '3. Регистрация и акцепт',
        list: [
          '3.1. Договор вступает в силу с момента регистрации Пользователя на Сайте (создания личного кабинета) либо совершения первой оплаты по Тарифу.',
          '3.2. При регистрации Пользователь обязан указывать достоверные и точные данные (название отеля, ИНН (STIR), телефон, email).',
        ],
      },
      {
        h: '4. Условия оплаты и автопродление (Auto-Renewal)',
        list: [
          '4.1. Стоимость и тарифы указаны на странице «Тарифы» Сайта. Лицензиар вправе в одностороннем порядке изменять тарифы (с уведомлением за 10 дней).',
          '4.2. Оплата производится на условиях 100% предоплаты (prepayment).',
          '4.3. Автоподписка: при привязке банковской карты Пользователь соглашается на автоматическое списание оплаты за следующий период (месяц/год) до окончания срока подписки. Пользователь может отменить подписку в любое время в личном кабинете.',
          '4.4. Уплаченные средства не возвращаются, так как право доступа к ПО считается предоставленным в полном объёме сразу после оплаты.',
        ],
      },
      {
        h: '5. Права и обязанности сторон',
        list: [
          '5.1. Обязанности Лицензиара: обеспечивать непрерывную работу Системы (в рамках технических ограничений, ~99% uptime); сохранять безопасность и конфиденциальность данных Пользователя.',
          '5.2. Обязанности Пользователя: не передавать пароли личного кабинета третьим лицам; не пытаться взломать, скопировать Систему или похитить её код.',
        ],
      },
      {
        h: '6. Ограничение ответственности (Disclaimer)',
        list: [
          '6.1. Система предоставляется по принципу «как есть» («As Is»). Лицензиар не гарантирует полное соответствие Системы всем ожиданиям Пользователя.',
          '6.2. Лицензиар не несёт ответственности за потерю данных или упущенную выгоду вследствие сбоев интернета, хакерских атак, отключения электроэнергии или сбоев сторонних сервисов (например, API Booking.com, Expedia).',
          '6.3. Общая финансовая ответственность Лицензиара не может превышать сумму подписки, уплаченную Пользователем за последний 1 (один) месяц.',
        ],
      },
      {
        h: '7. Конфиденциальность и защита персональных данных',
        list: [
          '7.1. Данные гостей (клиентов), вносимые Лицензиатом в Систему, защищаются в соответствии с Законом Республики Узбекистан «О персональных данных».',
          '7.2. Лицензиар не продаёт и не раскрывает данные Пользователя третьим лицам без его согласия (за исключением случаев, предусмотренных законодательством).',
        ],
      },
      {
        h: '8. Форс-мажор и разрешение споров',
        list: [
          '8.1. Стороны освобождаются от обязательств во время обстоятельств непреодолимой силы (стихийные бедствия, война, государственные запреты, глобальные сбои интернета).',
          '8.2. Все споры по настоящему Договору разрешаются путём переговоров, а при недостижении согласия — через Экономический суд Бухарской области.',
        ],
      },
      {
        h: '9. Реквизиты (данные Лицензиара)',
        list: [
          'Наименование организации: Lochin ekspres plyus MChJ',
          'Адрес: г. Бухара, ул. Ислама Каримова, дом 21',
          'Email: info@thehotelsaas.com',
        ],
      },
    ],
  },
};

const en = {
  about: {
    title: 'About Us',
    intro:
      'TheHotelSaaS (RateRadar) is a price and rating intelligence platform for hotels. We help hotels in Uzbekistan and the region track competitor prices, see OTA channel data in one place, and grow revenue with the help of artificial intelligence.',
    sections: [
      {
        h: 'Our mission',
        p: 'To give hotel owners and revenue managers accurate, real-time data so they can make the right pricing decisions. We automatically collect prices from Booking.com, Expedia, Agoda and other platforms and turn them into clear analytics.',
      },
      {
        h: 'What we offer',
        list: [
          'Automatic monitoring and comparison of competitor prices',
          'OTA channels and ratings unified in a single dashboard',
          'AI-powered pricing recommendations and revenue analysis',
          'QR-based service ordering system for guests',
        ],
      },
      {
        h: 'Payments',
        p: 'Payments on the platform are processed securely through the ATMOS payment gateway. UzCard, Humo, Visa and Mastercard are supported.',
      },
    ],
  },
  contact: {
    title: 'Contact Us',
    intro:
      'If you have questions, suggestions, or need technical support — get in touch. We usually respond within 24 hours on business days.',
    sections: [],
  },
  terms: {
    title: 'Terms of Service',
    updated: 'Last updated: July 1, 2026',
    intro:
      'These terms govern your use of the TheHotelSaaS (RateRadar) platform. By using the service you agree to these terms.',
    sections: [
      {
        h: '1. Service description',
        p: 'TheHotelSaaS provides price monitoring, rating analysis and revenue management tools for hotels. We collect and analyze publicly available data from third-party platforms (OTAs).',
      },
      {
        h: '2. Account and use',
        p: 'You must provide accurate information when registering. You are responsible for account security and password confidentiality. Using the service for unlawful purposes is prohibited.',
      },
      {
        h: '3. Payment and subscription',
        p: 'Paid plans work on a subscription basis. Payments are made through the ATMOS payment gateway using UzCard, Humo, Visa and Mastercard. All payments are processed over a secure encrypted connection; we do not store card details.',
      },
      {
        h: '4. Cancellation and refunds',
        p: 'You can cancel your subscription at any time — it remains active until the end of the current billing period. For refund matters, contact info@thehotelsaas.com.',
      },
      {
        h: '5. Limitation of liability',
        p: 'The service is provided "as is". We do not guarantee the full accuracy of third-party data and are not liable for indirect damages arising from its use.',
      },
      {
        h: '6. Changes to terms',
        p: 'We may update these terms from time to time. We will notify you of material changes on the platform or by email.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    updated: 'Last updated: July 1, 2026',
    intro:
      'This policy explains what data we collect, how we use it, and how we protect it.',
    sections: [
      {
        h: '1. Data we collect',
        list: [
          'Account data: name, email, hotel name and location',
          'Usage data: actions and settings on the platform',
          'Payment data: payments go through ATMOS; we do not store card numbers',
        ],
      },
      {
        h: '2. How we use data',
        p: 'We use collected data to provide and improve the service, offer technical support, and notify you about important updates.',
      },
      {
        h: '3. Payment data security',
        p: 'All payments are processed through the ATMOS payment gateway (apigw.atmos.uz). Card data is encrypted directly within the secure ATMOS environment — we do not store or see the full card number or CVV.',
      },
      {
        h: '4. Sharing with third parties',
        p: 'We do not sell your personal data. Data is shared only when necessary to provide the service (e.g. the payment gateway) or when required by law.',
      },
      {
        h: '5. Data security',
        p: 'We use modern security measures — encryption, access control and monitoring — to protect your data.',
      },
      {
        h: '6. Your rights',
        p: 'You have the right to access, correct or request deletion of your data. To do so, contact info@thehotelsaas.com.',
      },
    ],
  },
  offer: {
    title: 'Public Offer (License Agreement)',
    updated: 'Last updated: 02.07.2026',
    intro:
      'This document is an official offer (Public Offer) by the operator of thehotelsaas.com (hereinafter — the "Site" or "System") — Lochin ekspres plyus MChJ (hereinafter — the "Licensor") — to legal entities and sole proprietors (hereinafter — the "Licensee" or "User") to grant the right to use the SaaS platform. Under Article 369 of the Civil Code of the Republic of Uzbekistan, acceptance of the terms set out in this offer together with registration in the System or payment of the subscription constitutes a legally binding agreement.',
    sections: [
      {
        h: '1. Terms and definitions',
        list: [
          'SaaS platform (System) — cloud software at thehotelsaas.com designed for hotel management (PMS, Channel Manager, etc.).',
          'Acceptance — the User\'s full and unconditional acceptance of the Offer terms (via registration or payment).',
          'Licensee (User) — the owner of a hotel, hostel or other accommodation using the System in commercial activity (legal entity or sole proprietor).',
          'Pricing plan (Subscription) — the set of terms defining the duration, price and scope of use of the System\'s features.',
        ],
      },
      {
        h: '2. Subject of the agreement',
        list: [
          '2.1. The Licensor grants the User the right to use the System (SaaS) over the internet under a simple (non-exclusive) license.',
          '2.2. The User undertakes to pay for the services according to the selected Pricing plan and to use the System for lawful purposes only.',
        ],
      },
      {
        h: '3. Registration and acceptance',
        list: [
          '3.1. The agreement takes effect from the moment the User registers on the Site (creates an account) or makes the first payment under the Tariff.',
          '3.2. When registering, the User must provide accurate and correct data (hotel name, TIN (INN), phone, email).',
        ],
      },
      {
        h: '4. Payment terms and auto-renewal',
        list: [
          '4.1. Prices and tariffs are listed on the "Pricing" page of the Site. The Licensor may unilaterally change tariffs (with 10 days\' notice).',
          '4.2. Payments are made on a 100% prepayment basis.',
          '4.3. Auto-renewal: by linking a bank card, the User consents to automatic charging for the next period (month/year) before the subscription expires. The User may cancel the subscription at any time in their account.',
          '4.4. Paid funds are non-refundable, as the right to access the software is deemed fully granted immediately upon payment.',
        ],
      },
      {
        h: '5. Rights and obligations of the parties',
        list: [
          '5.1. Licensor obligations: ensure continuous operation of the System (within technical limits, ~99% uptime); maintain the security and confidentiality of User data.',
          '5.2. User obligations: not to share account passwords with third parties; not to attempt to hack, copy the System or steal its code.',
        ],
      },
      {
        h: '6. Limitation of liability (Disclaimer)',
        list: [
          '6.1. The System is provided "as is". The Licensor does not guarantee that the System will meet all of the User\'s expectations.',
          '6.2. The Licensor is not liable for data loss or lost profit due to internet outages, hacker attacks, power failures or third-party service failures (e.g. Booking.com, Expedia API outages).',
          '6.3. The Licensor\'s total financial liability may not exceed the subscription amount paid by the User for the last 1 (one) month.',
        ],
      },
      {
        h: '7. Privacy and personal data security',
        list: [
          '7.1. Guest (customer) data entered by the Licensee into the System is protected in accordance with the Law of the Republic of Uzbekistan "On Personal Data".',
          '7.2. The Licensor does not sell or disclose the User\'s data to third parties without consent (except as required by law).',
        ],
      },
      {
        h: '8. Force majeure and dispute resolution',
        list: [
          '8.1. The parties are released from obligations during force majeure events (natural disasters, war, government bans, global internet outages).',
          '8.2. All disputes under this Agreement are resolved through negotiation, and failing agreement — through the Economic Court of the Bukhara Region.',
        ],
      },
      {
        h: '9. Requisites (Licensor details)',
        list: [
          'Organization name: Lochin ekspres plyus MChJ',
          'Address: Bukhara city, Islom Karimov street, house 21',
          'Email: info@thehotelsaas.com',
        ],
      },
    ],
  },
};

const content = { uz, ru, en };

export function getLegalContent(lang, page) {
  const l = content[lang] || content.en;
  return l[page] || content.en[page];
}
