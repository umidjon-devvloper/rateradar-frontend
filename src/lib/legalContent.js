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
    title: 'Ommaviy oferta',
    updated: "Oxirgi yangilanish: 2026-yil 2-iyul",
    intro:
      "Ushbu hujjat O'zbekiston Respublikasi Fuqarolik kodeksining 367–369-moddalariga muvofiq ommaviy oferta (ochiq taklif) hisoblanadi. TheHotelSaaS (RateRadar) platformasidan foydalanish yoki to'lovni amalga oshirish orqali Foydalanuvchi quyidagi shartlarni to'liq va so'zsiz qabul qiladi (aksept).",
    sections: [
      {
        h: '1. Atamalar',
        list: [
          "Ijrochi — platformani taqdim etuvchi tomon (rekvizitlar quyida keltirilgan).",
          "Foydalanuvchi — platformadan foydalanuvchi yoki to'lovni amalga oshiruvchi jismoniy/yuridik shaxs.",
          "Xizmat — mehmonxonalar uchun narx monitoringi, reyting tahlili va daromad boshqaruvi obunasi.",
          "Aksept — Foydalanuvchi tomonidan ushbu oferta shartlarini to'liq qabul qilinishi (to'lov yoki ro'yxatdan o'tish orqali).",
        ],
      },
      {
        h: '2. Oferta predmeti',
        p: "Ijrochi Foydalanuvchiga tanlangan tarif rejasiga muvofiq platformadan foydalanish (obuna) xizmatini taqdim etadi, Foydalanuvchi esa uni belgilangan tartibda to'laydi.",
      },
      {
        h: '3. Xizmat narxi va to\'lov tartibi',
        p: "Xizmat narxi platformadagi tarif rejasida (Billing bo'limida) ko'rsatiladi va O'zbekiston so'mida belgilanadi. To'lovlar ATMOS to'lov shlyuzi orqali UzCard, Humo, Visa va Mastercard kartalari bilan onlayn amalga oshiriladi. To'lov Foydalanuvchi tomonidan aksept qilingandan so'ng obuna faollashadi. Ijrochi karta ma'lumotlarini (raqam, CVV) saqlamaydi — ular ATMOS xavfsiz muhitida qayta ishlanadi.",
      },
      {
        h: '4. Tomonlarning huquq va majburiyatlari',
        list: [
          "Ijrochi xizmatni uzluksiz taqdim etishga va texnik yordam ko'rsatishga harakat qiladi.",
          "Foydalanuvchi to'g'ri ma'lumot berishi va xizmatdan qonuniy maqsadlarda foydalanishi shart.",
          "Ijrochi profilaktika yoki fors-major holatlarida xizmatni vaqtincha to'xtatish huquqiga ega.",
        ],
      },
      {
        h: '5. Pulni qaytarish (refund)',
        p: "Foydalanuvchi obunani istalgan vaqtda bekor qilishi mumkin; u joriy hisob-kitob davri oxirigacha amal qiladi. Xizmat ko'rsatilmagan yoki noto'g'ri hisoblangan hollarda pulni qaytarish uchun info@thehotelsaas.com manziliga murojaat qilinadi; ariza 10 ish kuni ichida ko'rib chiqiladi va mablag' to'lov qilingan kartaga qaytariladi.",
      },
      {
        h: '6. Javobgarlik',
        p: "Xizmat \"borligicha\" (as is) taqdim etiladi. Ijrochi uchinchi tomon (OTA) ma'lumotlarining to'liq aniqligini kafolatlamaydi va ulardan foydalanish natijasidagi bilvosita zararlar uchun javobgar emas. Tomonlar O'zbekiston Respublikasi qonunchiligiga muvofiq javobgar bo'ladilar.",
      },
      {
        h: '7. Nizolarni hal qilish',
        p: "Barcha nizolar muzokaralar yo'li bilan hal qilinadi. Kelishuvga erishilmasa, nizo O'zbekiston Respublikasining amaldagi qonunchiligiga muvofiq sud tartibida ko'rib chiqiladi.",
      },
      {
        h: '8. Amal qilish muddati',
        p: "Oferta platformada e'lon qilingan paytdan boshlab amal qiladi va yangi tahriri joylashtirilgunga qadar kuchda bo'ladi. Ijrochi ofertaga o'zgartirish kiritish huquqini o'zida saqlaydi.",
      },
      {
        h: '9. Ijrochi rekvizitlari',
        list: [
          "Tashkilot nomi: DENDI PLAZA",
          "STIR (INN): 300717633",
          "Manzil: Buxoro shahri, Islom Karimov ko'chasi",
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
    title: 'Публичная оферта',
    updated: 'Последнее обновление: 2 июля 2026 г.',
    intro:
      'Настоящий документ является публичной офертой в соответствии со статьями 367–369 Гражданского кодекса Республики Узбекистан. Используя платформу TheHotelSaaS (RateRadar) или совершая оплату, Пользователь полностью и безоговорочно принимает нижеследующие условия (акцепт).',
    sections: [
      {
        h: '1. Термины',
        list: [
          'Исполнитель — сторона, предоставляющая платформу (реквизиты указаны ниже).',
          'Пользователь — физическое или юридическое лицо, использующее платформу или совершающее оплату.',
          'Услуга — подписка на мониторинг цен, анализ рейтингов и управление доходом для отелей.',
          'Акцепт — полное принятие Пользователем условий настоящей оферты (через оплату или регистрацию).',
        ],
      },
      {
        h: '2. Предмет оферты',
        p: 'Исполнитель предоставляет Пользователю услугу использования платформы (подписку) согласно выбранному тарифному плану, а Пользователь оплачивает её в установленном порядке.',
      },
      {
        h: '3. Стоимость услуги и порядок оплаты',
        p: 'Стоимость услуги указывается в тарифном плане на платформе (раздел Billing) и устанавливается в узбекских сумах. Оплата производится онлайн через платёжный шлюз ATMOS картами UzCard, Humo, Visa и Mastercard. Подписка активируется после акцепта (оплаты). Исполнитель не хранит данные карты (номер, CVV) — они обрабатываются в защищённой среде ATMOS.',
      },
      {
        h: '4. Права и обязанности сторон',
        list: [
          'Исполнитель стремится предоставлять услугу непрерывно и оказывать техническую поддержку.',
          'Пользователь обязан предоставлять достоверные данные и использовать сервис в законных целях.',
          'Исполнитель вправе временно приостановить услугу при профилактике или форс-мажоре.',
        ],
      },
      {
        h: '5. Возврат средств',
        p: 'Пользователь может отменить подписку в любое время; она действует до конца текущего расчётного периода. При неоказании услуги или ошибочном списании для возврата следует обратиться на info@thehotelsaas.com; заявление рассматривается в течение 10 рабочих дней, средства возвращаются на карту оплаты.',
      },
      {
        h: '6. Ответственность',
        p: 'Услуга предоставляется «как есть» (as is). Исполнитель не гарантирует полную точность данных третьих сторон (OTA) и не несёт ответственности за косвенный ущерб от их использования. Стороны несут ответственность в соответствии с законодательством Республики Узбекистан.',
      },
      {
        h: '7. Разрешение споров',
        p: 'Все споры разрешаются путём переговоров. При недостижении согласия спор рассматривается в судебном порядке согласно действующему законодательству Республики Узбекистан.',
      },
      {
        h: '8. Срок действия',
        p: 'Оферта действует с момента её публикации на платформе и до размещения новой редакции. Исполнитель оставляет за собой право вносить изменения в оферту.',
      },
      {
        h: '9. Реквизиты Исполнителя',
        list: [
          'Наименование организации: DENDI PLAZA',
          'ИНН (STIR): 300717633',
          'Адрес: г. Бухара, ул. Ислама Каримова',
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
    title: 'Public Offer',
    updated: 'Last updated: July 2, 2026',
    intro:
      'This document constitutes a public offer under Articles 367–369 of the Civil Code of the Republic of Uzbekistan. By using the TheHotelSaaS (RateRadar) platform or making a payment, the User fully and unconditionally accepts the following terms (acceptance).',
    sections: [
      {
        h: '1. Definitions',
        list: [
          'Provider — the party offering the platform (requisites listed below).',
          'User — an individual or legal entity using the platform or making a payment.',
          'Service — a subscription to price monitoring, rating analysis and revenue management for hotels.',
          'Acceptance — the User\'s full acceptance of these offer terms (via payment or registration).',
        ],
      },
      {
        h: '2. Subject of the offer',
        p: 'The Provider grants the User access to the platform (subscription) according to the selected pricing plan, and the User pays for it in the established manner.',
      },
      {
        h: '3. Price and payment procedure',
        p: 'The service price is shown in the pricing plan on the platform (Billing section) and set in Uzbek so‘m. Payments are made online through the ATMOS payment gateway using UzCard, Humo, Visa and Mastercard. The subscription is activated after acceptance (payment). The Provider does not store card details (number, CVV) — they are processed in the secure ATMOS environment.',
      },
      {
        h: '4. Rights and obligations of the parties',
        list: [
          'The Provider strives to deliver the service continuously and offer technical support.',
          'The User must provide accurate data and use the service for lawful purposes.',
          'The Provider may temporarily suspend the service for maintenance or force majeure.',
        ],
      },
      {
        h: '5. Refunds',
        p: 'The User may cancel the subscription at any time; it remains active until the end of the current billing period. If the service was not provided or was charged in error, contact info@thehotelsaas.com for a refund; the request is reviewed within 10 business days and funds are returned to the card used for payment.',
      },
      {
        h: '6. Liability',
        p: 'The service is provided "as is". The Provider does not guarantee the full accuracy of third-party (OTA) data and is not liable for indirect damages arising from its use. The parties are liable in accordance with the legislation of the Republic of Uzbekistan.',
      },
      {
        h: '7. Dispute resolution',
        p: 'All disputes are resolved through negotiation. If no agreement is reached, the dispute is settled in court in accordance with the applicable legislation of the Republic of Uzbekistan.',
      },
      {
        h: '8. Term',
        p: 'The offer is valid from the moment it is published on the platform until a new version is posted. The Provider reserves the right to amend the offer.',
      },
      {
        h: '9. Provider requisites',
        list: [
          'Organization name: DENDI PLAZA',
          'TIN (INN/STIR): 300717633',
          'Address: Bukhara city, Islom Karimov street',
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
