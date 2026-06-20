import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, TrendingUp, Globe, MessageSquare,
  Sparkles, Settings, ChevronRight, CheckCircle2,
  Bell, BookOpen, Lightbulb, ExternalLink, Search,
  Rocket, BarChart3, Cog,
} from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/motion';
import { fadeInUp } from '@/lib/animations';
import { cn } from '@/lib/utils';

// Bo'lim strukturasi (til-mustaqil): id, guruh, ikonka, rang.
const SECTIONS = [
  { id: 'dashboard', group: 'monitor', icon: LayoutDashboard, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' },
  { id: 'competitors', group: 'monitor', icon: Users, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40' },
  { id: 'rate-shopper', group: 'monitor', icon: TrendingUp, color: 'text-green-500 bg-green-50 dark:bg-green-950/40' },
  { id: 'ota-channels', group: 'monitor', icon: Globe, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40' },
  { id: 'reviews', group: 'guests', icon: MessageSquare, color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/40' },
  { id: 'ai', group: 'guests', icon: Sparkles, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' },
  { id: 'settings', group: 'system', icon: Settings, color: 'text-gray-500 bg-gray-100 dark:bg-gray-800/60' },
  { id: 'notifications', group: 'system', icon: Bell, color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/40' },
];

const GROUP_META = [
  { id: 'monitor', icon: BarChart3 },
  { id: 'guests', icon: Sparkles },
  { id: 'system', icon: Cog },
];

// ─── Interfeys matnlari (3 til) ────────────────────────────────────────────────
const UI = {
  uz: {
    heroBadge: 'Qo\'llanma',
    heroTitle: 'TheHotelSaaS\'dan to\'liq foydalanish qo\'llanmasi',
    heroSubtitle: 'Sakkizta asosiy bo\'lim bo\'yicha qadamba-qadam ko\'rsatma. Quyidagi bo\'limlardan birini tanlang yoki to\'rt qadamdan iborat tezkor boshlanishdan foydalaning.',
    statSection: 'Bo\'lim', statStep: 'Qadam', statLang: 'Til', statLangVal: 'O\'zbek', statLevel: 'Daraja', statLevelVal: 'Boshlovchi',
    quickStart: 'Tezkor boshlanish', quickStartHint: '— birinchi marta kirayotgan bo\'lsangiz',
    stepLabel: (n) => `${n}-qadam`,
    stepByStep: 'Qadamba-qadam', stepWord: 'qadam', important: 'Muhim',
    usefulTips: 'Foydali maslahatlar',
    prev: 'Oldingi', next: 'Keyingi',
    searchPlaceholder: 'Bo\'lim qidirish...', noResults: 'Hech narsa topilmadi',
    sectionWord: 'Bo\'lim',
    groups: { monitor: 'Kuzatuv', guests: 'Mijozlar va tahlil', system: 'Tizim' },
  },
  ru: {
    heroBadge: 'Руководство',
    heroTitle: 'Полное руководство по TheHotelSaaS',
    heroSubtitle: 'Пошаговая инструкция по восьми основным разделам. Выберите раздел ниже или воспользуйтесь быстрым стартом из четырёх шагов.',
    statSection: 'Раздел', statStep: 'Шаг', statLang: 'Язык', statLangVal: 'Русский', statLevel: 'Уровень', statLevelVal: 'Начинающий',
    quickStart: 'Быстрый старт', quickStartHint: '— если вы впервые',
    stepLabel: (n) => `Шаг ${n}`,
    stepByStep: 'Пошагово', stepWord: 'шагов', important: 'Важно',
    usefulTips: 'Полезные советы',
    prev: 'Назад', next: 'Далее',
    searchPlaceholder: 'Поиск раздела...', noResults: 'Ничего не найдено',
    sectionWord: 'Раздел',
    groups: { monitor: 'Мониторинг', guests: 'Гости и анализ', system: 'Система' },
  },
  en: {
    heroBadge: 'Guide',
    heroTitle: 'Complete TheHotelSaaS User Guide',
    heroSubtitle: 'Step-by-step instructions across eight core sections. Pick a section below or use the four-step quick start.',
    statSection: 'Sections', statStep: 'Steps', statLang: 'Language', statLangVal: 'English', statLevel: 'Level', statLevelVal: 'Beginner',
    quickStart: 'Quick start', quickStartHint: '— if it\'s your first time',
    stepLabel: (n) => `Step ${n}`,
    stepByStep: 'Step by step', stepWord: 'steps', important: 'Important',
    usefulTips: 'Useful tips',
    prev: 'Previous', next: 'Next',
    searchPlaceholder: 'Search section...', noResults: 'Nothing found',
    sectionWord: 'Section',
    groups: { monitor: 'Monitoring', guests: 'Guests & analysis', system: 'System' },
  },
};

const QUICK_START = [
  { id: 'settings', label: { uz: 'Hotel ma\'lumotlarini kiriting', ru: 'Введите данные отеля', en: 'Enter hotel details' } },
  { id: 'competitors', label: { uz: 'Raqiblarni qo\'shing', ru: 'Добавьте конкурентов', en: 'Add competitors' } },
  { id: 'rate-shopper', label: { uz: 'Narxlarni solishtiring', ru: 'Сравните цены', en: 'Compare prices' } },
  { id: 'ai', label: { uz: 'AI tavsiyani oling', ru: 'Получите AI-совет', en: 'Get AI advice' } },
];

// ─── Bo'lim kontenti (3 til) ───────────────────────────────────────────────────
const CONTENT = {
  uz: {
    dashboard: {
      title: 'Boshqaruv paneli',
      subtitle: 'Hotelingizning umumiy holatini bir nazar bilan ko\'ring',
      steps: [
        { title: 'Asosiy ko\'rsatkichlar', desc: 'Yuqori qismida 4 ta karta: mening narxim, o\'rtacha bozor narxi, bozordagi o\'rnim va kuzatilayotgan raqiblar soni.' },
        { title: 'Narx trendi grafigi', desc: 'Oxirgi 7 kundagi narx o\'zgarishi grafigi — sizning narxingiz (ko\'k chiziq) va bozor o\'rtachasi (kulrang chiziq) taqqoslanadi.' },
        { title: 'Tezkor harakatlar', desc: 'Pastki qismida raqiblar ro\'yxati va oxirgi AI tavsiyalari ko\'rinadi. Ularga bosib to\'liq sahifaga o\'tishingiz mumkin.' },
      ],
      tips: ['Dashboard har safar sahifa ochilganda yangilanadi', 'Narx trendi grafigidagi nuqtalarga sichqoncha olib boring — aniq narx ko\'rinadi'],
      link: '/dashboard', linkLabel: 'Boshqaruv paneliga o\'tish',
    },
    competitors: {
      title: 'Raqiblar',
      subtitle: 'Atrofingizdagi raqib hotellarni kuzating va solishtiring',
      steps: [
        { title: 'Raqib qo\'shish', desc: '"Raqib qo\'shish" tugmasini bosing. Tizim joylashuvingiz atrofidagi 300 m ichidagi hotellarni avtomatik taklif qiladi. Ko\'proq kerak bo\'lsa qidirish orqali qo\'lda qo\'shing.' },
        { title: 'Raqib ma\'lumotlari', desc: 'Har bir raqib kartasida: nomi, yulduz darajasi, masofa, reyting va oxirgi narxi ko\'rinadi. Narx qizil bo\'lsa — u sizdan arzonroq.' },
        { title: 'Xarita ko\'rinishi', desc: 'Yuqori o\'ng burchakdagi xarita belgisi orqali barcha raqiblarni xaritada ko\'rishingiz mumkin.' },
        { title: 'Raqibni o\'chirish', desc: 'Keraksiz raqibni kartadagi qizil "O\'chirish" tugmasi yordamida olib tashlang.' },
      ],
      tips: ['Maksimal samaradorlik uchun 5-10 ta raqib qo\'shing', 'Faqat sizning katagoriyangizga mos hotellarni qo\'shing (bir xil yulduz)'],
      link: '/competitors', linkLabel: 'Raqiblar sahifasiga o\'tish',
    },
    'rate-shopper': {
      title: 'Rate Shopper',
      subtitle: 'Raqiblar narxlarini sanalar bo\'yicha taqqoslang',
      steps: [
        { title: 'Ko\'rinishni tanlang', desc: 'Yuqorida ikkita tab: "Raqiblar" — raqiblar bo\'yicha narx jadvali; "Xona turlari" — o\'z xonalaringiz narxlari.' },
        { title: 'Sana oralig\'ini o\'zgartiring', desc: '"7 kun", "14 kun" yoki "30 kun" tugmalaridan birini tanlang. Jadval tanlangan davr uchun har bir kun narxini ko\'rsatadi.' },
        { title: 'Narxni o\'qing', desc: 'Jadvalda har bir katakcha rangi: ko\'k = sizdan arzon, kulrang = bozor o\'rtachasi, yashil = sizdan qimmat. Katakchaga bosib foiz farqni ko\'ring.' },
        { title: 'Bozor o\'rtachasi', desc: 'Jadvalning pastki qatorida "Bozor o\'rtachasi" — barcha raqiblarning kun bo\'yicha o\'rtacha narxi.' },
      ],
      tips: ['Dam olish kunlarida narxlar odatda 10-15% yuqori — bu normal holat', 'Raqibingiz narxi siznikidan 20%+ past bo\'lsa — strategiyangizni qayta ko\'rib chiqing'],
      link: '/prices', linkLabel: 'Rate Shopper sahifasiga o\'tish',
    },
    'ota-channels': {
      title: 'OTA Kanallar',
      subtitle: 'Hotelingizning turli platformalardagi narxlarini kuzating',
      steps: [
        { title: 'TripAdvisor URL kiriting', desc: 'Birinchi marta: Sozlamalar sahifasiga o\'ting va hotelingizning TripAdvisor sahifasi URL manzilini kiriting. Bu narx manbai uchun kerak.', highlight: true },
        { title: 'Kanallar ro\'yxati', desc: '8 ta asosiy OTA kanali ko\'rinadi: Booking.com, Agoda, Hotels.com, Expedia, Vio.com, Trip.com, Priceline, TripAdvisor. Ulangan kanallar yuqorida, uzilganlar pastda.' },
        { title: 'Qo\'lda narx kiritish', desc: 'Agar kanal avtomatik ulanmagan bo\'lsa, uning ustiga bosing va narxni qo\'lda kiriting. Bu narx 90 kun saqlanadi.' },
        { title: 'Narxni tozalash', desc: 'Qo\'lda kiritilgan narxni olib tashlash uchun kanal modali ichida "Narxni tozalash" tugmasini bosing.' },
      ],
      tips: ['Narx manbai bepul va TripAdvisor URL orqali ishlaydi', 'Ba\'zi kanallar (Priceline, TripAdvisor) har doim ham narx bermaydi — bu normal', '"Keshlangan" belgisi — oxirgi 7 kun ichidagi saqlangan narx'],
      link: '/ota-channels', linkLabel: 'OTA Kanallar sahifasiga o\'tish',
    },
    reviews: {
      title: 'Sharhlar',
      subtitle: 'Mijoz sharhlarini o\'qing, filtrlang va AI javoblarini oling',
      steps: [
        { title: 'Sharhlarni filtrlash', desc: 'Yuqoridagi tugmalar: "Hamma", "Ijobiy" (reyting ≥4), "Neytral" (reyting 3), "Salbiy" (reyting ≤2). Platformaga ko\'ra ham filtrlash mumkin.' },
        { title: 'Sharh ko\'rsatkichlari', desc: 'Sahifa yuqorisida: o\'rtacha reyting, ijobiy/neytral/salbiy sharhlar soni va jami sharhlar miqdori.' },
        { title: 'AI javob yaratish', desc: 'Har bir sharh kartasidagi "AI javob" tugmasini bosing — tizim mijozga mos javob matnini taklif qiladi.' },
        { title: 'Sharhlarni yangilash', desc: '"Yangi sharhlarni olish" tugmasi Google dan yangi sharhlarni yuklab oladi.' },
      ],
      tips: ['Salbiy sharhlarga tezda javob berish reytingga ijobiy ta\'sir qiladi', 'AI javoblar faqat taklif — uni o\'zingiz tahrirlashingiz mumkin'],
      link: '/reviews', linkLabel: 'Sharhlar sahifasiga o\'tish',
    },
    ai: {
      title: 'AI Tahlil',
      subtitle: 'Gemini AI yordamida bozor strategiyasini oling',
      steps: [
        { title: 'Tahlilni boshlash', desc: '"Tahlil qilish" tugmasini bosing — AI hozirgi narxlar, raqiblar va bozor holatini o\'rganadi.' },
        { title: 'Tavsiyalarni o\'qing', desc: 'AI bir necha bo\'limda tavsiya beradi: narx strategiyasi, raqobat holati, kuchli tomonlar va takomillashtirish kerak bo\'lgan joylar.' },
        { title: 'Tarix', desc: 'Oldingi tahlillar saqlanadi — "Tarix" bo\'limida avvalgi tavsiyalarni ko\'rishingiz mumkin.' },
      ],
      tips: ['Haftada 2-3 marta AI tahlil olish maqsadga muvofiq', 'AI bozor ma\'lumotlari asosida ish yuritadi — qancha ko\'p raqib bo\'lsa, tavsiya aniqroq'],
      link: '/ai', linkLabel: 'AI Tahlil sahifasiga o\'tish',
    },
    settings: {
      title: 'Sozlamalar',
      subtitle: 'Hotel ma\'lumotlari va tizim parametrlarini sozlang',
      steps: [
        { title: 'Hotel ma\'lumotlari', desc: 'Hotel nomi, manzil, yulduz soni, xonalar soni va joriy narxingizni kiriting. Bu ma\'lumotlar AI tahlil va Rate Shopper uchun ishlatiladi.' },
        { title: 'TripAdvisor URL', desc: 'Hotelingizning TripAdvisor sahifasini oching, brauzer manzil qatoridagi URLni ko\'chiring va "TripAdvisor URL" maydoniga joylashtiring. OTA narxlarini olish uchun kerak.', highlight: true },
        { title: 'Interfeys tili', desc: '"Til" bo\'limida O\'zbek, Rus yoki Ingliz tilini tanlang. O\'zgartirish darhol kuchga kiradi.' },
        { title: 'Akkaunt', desc: 'Profilingizning ismi va emailini ko\'rishingiz mumkin.' },
      ],
      tips: ['TripAdvisor URL formati: tripadvisor.com/Hotel_Review-g...-d....html', 'Joriy narxingizni to\'g\'ri kiriting — Rate Shopper taqqoslash uchun shu narxni ishlatadi'],
      link: '/settings', linkLabel: 'Sozlamalar sahifasiga o\'tish',
    },
    notifications: {
      title: 'Bildirishnomalar',
      subtitle: 'Muhim o\'zgarishlar haqida darhol xabar oling',
      steps: [
        { title: 'Bildirishnomalar paneli', desc: 'Yuqori o\'ng burchakdagi qo\'ng\'iroq belgisi yangi bildirishnomalar sonini ko\'rsatadi. Bosib ro\'yxatni oching.' },
        { title: 'Bildirishnoma turlari', desc: 'Tizim quyidagi holatlarda xabar beradi: raqib narxini tushirganda, yangi salbiy sharh chiqganda va AI yangi tavsiya tayyorlaganda.' },
        { title: 'O\'qish va o\'tish', desc: 'Bildirishnomaga bosing — u o\'qilgan bo\'ladi va mos sahifaga o\'tadi (masalan, narx o\'zgarishi → Rate Shopper).' },
        { title: 'Barchasini o\'qish', desc: '"Barchasini o\'qilgan deb belgilash" tugmasi barcha bildirishnomalarni bir vaqtda o\'qilgan qiladi.' },
      ],
      tips: ['Bildirishnomalar har daqiqada avtomatik yangilanadi', 'Eski bildirishnomalar (30 kundan ortiq) avtomatik o\'chiriladi'],
      link: null, linkLabel: null,
    },
  },

  ru: {
    dashboard: {
      title: 'Панель управления',
      subtitle: 'Оцените общее состояние отеля одним взглядом',
      steps: [
        { title: 'Ключевые показатели', desc: 'Вверху 4 карточки: моя цена, средняя цена рынка, моя позиция на рынке и количество отслеживаемых конкурентов.' },
        { title: 'График динамики цен', desc: 'График изменения цен за последние 7 дней — ваша цена (синяя линия) сравнивается со средней по рынку (серая линия).' },
        { title: 'Быстрые действия', desc: 'Внизу отображаются список конкурентов и последние AI-рекомендации. Нажмите, чтобы перейти на полную страницу.' },
      ],
      tips: ['Панель обновляется при каждом открытии страницы', 'Наведите курсор на точки графика цен — появится точная цена'],
      link: '/dashboard', linkLabel: 'Перейти к панели управления',
    },
    competitors: {
      title: 'Конкуренты',
      subtitle: 'Отслеживайте и сравнивайте отели-конкуренты рядом с вами',
      steps: [
        { title: 'Добавить конкурента', desc: 'Нажмите «Добавить конкурента». Система автоматически предложит отели в радиусе 300 м. Если нужно больше — добавьте вручную через поиск.' },
        { title: 'Данные конкурента', desc: 'На карточке каждого конкурента: название, звёздность, расстояние, рейтинг и последняя цена. Красная цена — он дешевле вас.' },
        { title: 'Вид на карте', desc: 'Через значок карты в правом верхнем углу можно увидеть всех конкурентов на карте.' },
        { title: 'Удалить конкурента', desc: 'Удалите ненужного конкурента красной кнопкой «Удалить» на карточке.' },
      ],
      tips: ['Для максимальной эффективности добавьте 5-10 конкурентов', 'Добавляйте только отели вашей категории (одинаковая звёздность)'],
      link: '/competitors', linkLabel: 'Перейти к конкурентам',
    },
    'rate-shopper': {
      title: 'Rate Shopper',
      subtitle: 'Сравнивайте цены конкурентов по датам',
      steps: [
        { title: 'Выберите вид', desc: 'Вверху две вкладки: «Конкуренты» — таблица цен по конкурентам; «Типы номеров» — цены ваших номеров.' },
        { title: 'Измените период', desc: 'Выберите «7 дней», «14 дней» или «30 дней». Таблица покажет цену на каждый день выбранного периода.' },
        { title: 'Читайте цены', desc: 'Цвет ячейки: зелёный = дешевле рынка, серый = средняя цена, красный = дороже рынка. Нажмите на ячейку, чтобы увидеть разницу в процентах.' },
        { title: 'Средняя по рынку', desc: 'В нижней строке таблицы «Средняя по рынку» — средняя цена всех конкурентов по дням.' },
      ],
      tips: ['В выходные цены обычно на 10-15% выше — это нормально', 'Если цена конкурента ниже вашей на 20%+ — пересмотрите стратегию'],
      link: '/prices', linkLabel: 'Перейти к Rate Shopper',
    },
    'ota-channels': {
      title: 'OTA-каналы',
      subtitle: 'Отслеживайте цены вашего отеля на разных платформах',
      steps: [
        { title: 'Введите URL TripAdvisor', desc: 'В первый раз: перейдите в Настройки и введите URL страницы вашего отеля на TripAdvisor. Это нужно для источника цен.', highlight: true },
        { title: 'Список каналов', desc: 'Отображаются 8 основных OTA-каналов: Booking.com, Agoda, Hotels.com, Expedia, Vio.com, Trip.com, Priceline, TripAdvisor. Подключённые вверху, отключённые внизу.' },
        { title: 'Ручной ввод цены', desc: 'Если канал не подключился автоматически, нажмите на него и введите цену вручную. Цена хранится 90 дней.' },
        { title: 'Очистить цену', desc: 'Чтобы удалить введённую вручную цену, нажмите «Очистить цену» в окне канала.' },
      ],
      tips: ['Источник цен бесплатный и работает через URL TripAdvisor', 'Некоторые каналы (Priceline, TripAdvisor) не всегда дают цену — это нормально', 'Метка «В кэше» — цена, сохранённая за последние 7 дней'],
      link: '/ota-channels', linkLabel: 'Перейти к OTA-каналам',
    },
    reviews: {
      title: 'Отзывы',
      subtitle: 'Читайте отзывы гостей, фильтруйте и получайте AI-ответы',
      steps: [
        { title: 'Фильтрация отзывов', desc: 'Кнопки вверху: «Все», «Положительные» (рейтинг ≥4), «Нейтральные» (рейтинг 3), «Отрицательные» (рейтинг ≤2). Также можно фильтровать по платформе.' },
        { title: 'Показатели отзывов', desc: 'Вверху страницы: средний рейтинг, количество положительных/нейтральных/отрицательных отзывов и общее число.' },
        { title: 'Создать AI-ответ', desc: 'Нажмите «AI-ответ» на карточке отзыва — система предложит подходящий текст ответа гостю.' },
        { title: 'Обновить отзывы', desc: 'Кнопка «Получить новые отзывы» загружает свежие отзывы из Google.' },
      ],
      tips: ['Быстрый ответ на отрицательные отзывы положительно влияет на рейтинг', 'AI-ответы — лишь предложение, вы можете их редактировать'],
      link: '/reviews', linkLabel: 'Перейти к отзывам',
    },
    ai: {
      title: 'AI-анализ',
      subtitle: 'Получите рыночную стратегию с помощью Gemini AI',
      steps: [
        { title: 'Запустить анализ', desc: 'Нажмите «Анализировать» — AI изучит текущие цены, конкурентов и состояние рынка.' },
        { title: 'Читайте рекомендации', desc: 'AI даёт рекомендации по нескольким разделам: ценовая стратегия, конкурентная ситуация, сильные стороны и зоны для улучшения.' },
        { title: 'История', desc: 'Предыдущие анализы сохраняются — их можно посмотреть в разделе «История».' },
      ],
      tips: ['Полезно получать AI-анализ 2-3 раза в неделю', 'AI работает на основе рыночных данных — чем больше конкурентов, тем точнее совет'],
      link: '/ai', linkLabel: 'Перейти к AI-анализу',
    },
    settings: {
      title: 'Настройки',
      subtitle: 'Настройте данные отеля и параметры системы',
      steps: [
        { title: 'Данные отеля', desc: 'Введите название, адрес, звёздность, количество номеров и текущую цену. Эти данные используются для AI-анализа и Rate Shopper.' },
        { title: 'URL TripAdvisor', desc: 'Откройте страницу отеля на TripAdvisor, скопируйте URL из адресной строки и вставьте в поле «URL TripAdvisor». Нужно для получения цен OTA.', highlight: true },
        { title: 'Язык интерфейса', desc: 'В разделе «Язык» выберите узбекский, русский или английский. Изменение вступает в силу сразу.' },
        { title: 'Аккаунт', desc: 'Вы можете видеть имя и email вашего профиля.' },
      ],
      tips: ['Формат URL TripAdvisor: tripadvisor.com/Hotel_Review-g...-d....html', 'Введите текущую цену правильно — Rate Shopper использует её для сравнения'],
      link: '/settings', linkLabel: 'Перейти к настройкам',
    },
    notifications: {
      title: 'Уведомления',
      subtitle: 'Мгновенно узнавайте о важных изменениях',
      steps: [
        { title: 'Панель уведомлений', desc: 'Значок колокольчика в правом верхнем углу показывает число новых уведомлений. Нажмите, чтобы открыть список.' },
        { title: 'Типы уведомлений', desc: 'Система уведомляет: когда конкурент снизил цену, появился новый отрицательный отзыв и когда AI подготовил новую рекомендацию.' },
        { title: 'Прочтение и переход', desc: 'Нажмите на уведомление — оно станет прочитанным и откроется нужная страница (например, изменение цены → Rate Shopper).' },
        { title: 'Прочитать все', desc: 'Кнопка «Отметить все как прочитанные» отмечает все уведомления прочитанными сразу.' },
      ],
      tips: ['Уведомления обновляются автоматически каждую минуту', 'Старые уведомления (более 30 дней) удаляются автоматически'],
      link: null, linkLabel: null,
    },
  },

  en: {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'See your hotel\'s overall status at a glance',
      steps: [
        { title: 'Key metrics', desc: 'Four cards at the top: my price, average market price, my market position, and the number of tracked competitors.' },
        { title: 'Price trend chart', desc: 'A chart of price changes over the last 7 days — your price (blue line) compared to the market average (gray line).' },
        { title: 'Quick actions', desc: 'The competitor list and latest AI recommendations appear at the bottom. Click them to open the full page.' },
      ],
      tips: ['The dashboard refreshes every time you open the page', 'Hover over points on the price chart to see the exact price'],
      link: '/dashboard', linkLabel: 'Go to dashboard',
    },
    competitors: {
      title: 'Competitors',
      subtitle: 'Track and compare competitor hotels near you',
      steps: [
        { title: 'Add a competitor', desc: 'Click "Add competitor". The system auto-suggests hotels within 300 m. Need more? Add manually via search.' },
        { title: 'Competitor details', desc: 'Each competitor card shows: name, star rating, distance, rating, and latest price. A red price means they\'re cheaper than you.' },
        { title: 'Map view', desc: 'Use the map icon in the top-right to see all competitors on a map.' },
        { title: 'Remove a competitor', desc: 'Remove an unwanted competitor with the red "Delete" button on the card.' },
      ],
      tips: ['Add 5-10 competitors for best results', 'Only add hotels in your category (same star rating)'],
      link: '/competitors', linkLabel: 'Go to competitors',
    },
    'rate-shopper': {
      title: 'Rate Shopper',
      subtitle: 'Compare competitor prices by date',
      steps: [
        { title: 'Pick a view', desc: 'Two tabs at the top: "Competitors" — a price table by competitor; "Room types" — your own room prices.' },
        { title: 'Change the date range', desc: 'Choose "7 days", "14 days", or "30 days". The table shows a price for each day of the selected period.' },
        { title: 'Read the prices', desc: 'Cell color: green = below market, gray = market average, red = above market. Click a cell to see the percentage difference.' },
        { title: 'Market average', desc: 'The bottom row "Market average" shows the average price of all competitors per day.' },
      ],
      tips: ['Weekend prices are usually 10-15% higher — that\'s normal', 'If a competitor\'s price is 20%+ below yours — review your strategy'],
      link: '/prices', linkLabel: 'Go to Rate Shopper',
    },
    'ota-channels': {
      title: 'OTA Channels',
      subtitle: 'Track your hotel\'s prices across different platforms',
      steps: [
        { title: 'Enter TripAdvisor URL', desc: 'First time: go to Settings and enter your hotel\'s TripAdvisor page URL. It\'s needed for the price source.', highlight: true },
        { title: 'Channel list', desc: 'Eight main OTA channels are shown: Booking.com, Agoda, Hotels.com, Expedia, Vio.com, Trip.com, Priceline, TripAdvisor. Connected ones on top, disconnected below.' },
        { title: 'Enter price manually', desc: 'If a channel didn\'t connect automatically, click it and enter the price manually. The price is kept for 90 days.' },
        { title: 'Clear the price', desc: 'To remove a manually entered price, click "Clear price" in the channel modal.' },
      ],
      tips: ['The price source is free and works via the TripAdvisor URL', 'Some channels (Priceline, TripAdvisor) don\'t always return a price — that\'s normal', 'A "Cached" label means a price saved within the last 7 days'],
      link: '/ota-channels', linkLabel: 'Go to OTA Channels',
    },
    reviews: {
      title: 'Reviews',
      subtitle: 'Read guest reviews, filter them, and get AI replies',
      steps: [
        { title: 'Filter reviews', desc: 'Buttons at the top: "All", "Positive" (rating ≥4), "Neutral" (rating 3), "Negative" (rating ≤2). You can also filter by platform.' },
        { title: 'Review metrics', desc: 'At the top of the page: average rating, counts of positive/neutral/negative reviews, and the total.' },
        { title: 'Generate an AI reply', desc: 'Click "AI reply" on a review card — the system suggests a fitting reply to the guest.' },
        { title: 'Refresh reviews', desc: 'The "Get new reviews" button loads fresh reviews from Google.' },
      ],
      tips: ['Replying quickly to negative reviews boosts your rating', 'AI replies are just suggestions — you can edit them yourself'],
      link: '/reviews', linkLabel: 'Go to reviews',
    },
    ai: {
      title: 'AI Analysis',
      subtitle: 'Get a market strategy powered by Gemini AI',
      steps: [
        { title: 'Start the analysis', desc: 'Click "Analyze" — the AI studies current prices, competitors, and market conditions.' },
        { title: 'Read the recommendations', desc: 'The AI gives recommendations across several areas: pricing strategy, competitive position, strengths, and areas to improve.' },
        { title: 'History', desc: 'Past analyses are saved — view previous recommendations in the "History" section.' },
      ],
      tips: ['Running an AI analysis 2-3 times a week is ideal', 'The AI works from market data — the more competitors, the more accurate the advice'],
      link: '/ai', linkLabel: 'Go to AI Analysis',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Configure hotel details and system parameters',
      steps: [
        { title: 'Hotel details', desc: 'Enter the name, address, star rating, number of rooms, and your current price. This data is used for AI Analysis and Rate Shopper.' },
        { title: 'TripAdvisor URL', desc: 'Open your hotel\'s TripAdvisor page, copy the URL from the address bar, and paste it into the "TripAdvisor URL" field. Needed to fetch OTA prices.', highlight: true },
        { title: 'Interface language', desc: 'In the "Language" section choose Uzbek, Russian, or English. Changes take effect immediately.' },
        { title: 'Account', desc: 'You can view your profile\'s name and email.' },
      ],
      tips: ['TripAdvisor URL format: tripadvisor.com/Hotel_Review-g...-d....html', 'Enter your current price correctly — Rate Shopper uses it for comparison'],
      link: '/settings', linkLabel: 'Go to settings',
    },
    notifications: {
      title: 'Notifications',
      subtitle: 'Get instant alerts about important changes',
      steps: [
        { title: 'Notifications panel', desc: 'The bell icon in the top-right shows the number of new notifications. Click to open the list.' },
        { title: 'Notification types', desc: 'The system alerts you when: a competitor lowers their price, a new negative review appears, and when the AI prepares a new recommendation.' },
        { title: 'Read and navigate', desc: 'Click a notification — it\'s marked as read and opens the relevant page (e.g., price change → Rate Shopper).' },
        { title: 'Mark all read', desc: 'The "Mark all as read" button marks all notifications as read at once.' },
      ],
      tips: ['Notifications refresh automatically every minute', 'Old notifications (over 30 days) are deleted automatically'],
      link: null, linkLabel: null,
    },
  },
};

function StepCard({ num, title, desc, highlight, importantLabel }) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ x: 4 }}
      className={cn(
        'flex gap-4 p-4 rounded-lg border bg-card transition-colors',
        highlight ? 'border-primary/40 bg-primary/[0.03]' : 'hover:border-foreground/10'
      )}
    >
      <div className={cn(
        'w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5',
        highlight ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
      )}>
        {num}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium mb-1 flex items-center gap-2 flex-wrap">
          {title}
          {highlight && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">{importantLabel}</span>}
        </div>
        <div className="text-sm text-muted-foreground leading-relaxed">{desc}</div>
      </div>
    </motion.div>
  );
}

function SectionCard({ section, title, isActive, onClick }) {
  const Icon = section.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors text-left',
        isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      <div className={cn('w-7 h-7 rounded-md flex items-center justify-center shrink-0', section.color)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <span className="truncate">{title}</span>
      {isActive && <ChevronRight className="h-3.5 w-3.5 ml-auto shrink-0" />}
    </button>
  );
}

export default function Guide() {
  const lang = useLang((s) => s.lang);
  const ui = UI[lang] || UI.uz;
  const content = CONTENT[lang] || CONTENT.uz;

  const [active, setActive] = useState('dashboard');
  const [query, setQuery] = useState('');

  const item = content[active];
  const section = SECTIONS.find((s) => s.id === active);
  const Icon = section?.icon || BookOpen;
  const activeIdx = SECTIONS.findIndex((s) => s.id === active);
  const prevSection = activeIdx > 0 ? SECTIONS[activeIdx - 1] : null;
  const nextSection = activeIdx < SECTIONS.length - 1 ? SECTIONS[activeIdx + 1] : null;

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GROUP_META.map((g) => ({
      ...g,
      label: ui.groups[g.id],
      sections: SECTIONS.filter((s) => {
        if (s.group !== g.id) return false;
        if (!q) return true;
        const c = content[s.id];
        return c.title.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q);
      }),
    })).filter((g) => g.sections.length > 0);
  }, [query, content, ui]);

  const totalSteps = useMemo(
    () => Object.values(content).reduce((sum, c) => sum + c.steps.length, 0),
    [content]
  );

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 via-card to-card p-6 sm:p-8">
          <div aria-hidden className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
            <BookOpen className="h-4 w-4" />
            <span>{ui.heroBadge}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{ui.heroTitle}</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-2xl">{ui.heroSubtitle}</p>

          <Stagger className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-xl">
            <Stat label={ui.statSection} value={SECTIONS.length} />
            <Stat label={ui.statStep} value={totalSteps} />
            <Stat label={ui.statLang} value={ui.statLangVal} />
            <Stat label={ui.statLevel} value={ui.statLevelVal} />
          </Stagger>
        </div>
      </Reveal>

      {/* Quick start */}
      <Reveal delay={0.05}>
        <div className="bg-card border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">{ui.quickStart}</span>
            <span className="text-xs text-muted-foreground">{ui.quickStartHint}</span>
          </div>
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {QUICK_START.map((q, i) => {
              const s = SECTIONS.find((x) => x.id === q.id);
              const SIcon = s.icon;
              return (
                <StaggerItem key={q.id}>
                  <motion.button
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActive(q.id)}
                    className="group relative w-full flex items-start gap-3 p-3 rounded-lg border bg-background hover:border-primary/40 hover:bg-primary/[0.02] transition-colors text-left"
                  >
                    <div className={cn('w-8 h-8 rounded-md flex items-center justify-center shrink-0', s.color)}>
                      <SIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                        {ui.stepLabel(i + 1)}
                      </div>
                      <div className="text-sm font-medium leading-snug">{q.label[lang]}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                  </motion.button>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </Reveal>

      {/* Main: sidebar + content */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-20">
          <div className="bg-card border rounded-xl p-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={ui.searchPlaceholder}
                className="w-full pl-8 pr-2.5 py-1.5 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              />
            </div>

            <div className="space-y-3">
              {filteredGroups.map((group) => {
                const GIcon = group.icon;
                return (
                  <div key={group.id} className="space-y-0.5">
                    <div className="flex items-center gap-1.5 px-2 pt-1 pb-1">
                      <GIcon className="h-3 w-3 text-muted-foreground" />
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {group.label}
                      </div>
                    </div>
                    {group.sections.map((s) => (
                      <SectionCard
                        key={s.id}
                        section={s}
                        title={content[s.id].title}
                        isActive={active === s.id}
                        onClick={() => setActive(s.id)}
                      />
                    ))}
                  </div>
                );
              })}
              {filteredGroups.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-4">{ui.noResults}</div>
              )}
            </div>
          </div>
        </aside>

        {/* Content — bo'lim almashganda silliq animatsiya */}
        <div className="flex-1 min-w-0 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${active}-${lang}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
              {/* Section header */}
              <div className="bg-card border rounded-xl p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', section?.color)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      {ui.sectionWord} {activeIdx + 1} / {SECTIONS.length}
                    </div>
                    <h2 className="text-xl font-semibold tracking-tight">{item.title}</h2>
                    <p className="text-muted-foreground text-sm mt-1">{item.subtitle}</p>
                  </div>
                </div>

                {item.link && (
                  <div className="mt-4 pt-4 border-t">
                    <Link to={item.link} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium">
                      {item.linkLabel}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Steps */}
              <div className="bg-card border rounded-xl p-5 sm:p-6 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold">{ui.stepByStep}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{item.steps.length} {ui.stepWord}</span>
                </div>
                <Stagger className="space-y-3">
                  {item.steps.map((step, i) => (
                    <StaggerItem key={i}>
                      <StepCard num={i + 1} title={step.title} desc={step.desc} highlight={step.highlight} importantLabel={ui.important} />
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>

              {/* Tips */}
              {item.tips?.length > 0 && (
                <div className="bg-card border rounded-xl p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-md bg-yellow-500/10 flex items-center justify-center">
                      <Lightbulb className="h-3.5 w-3.5 text-yellow-500" />
                    </div>
                    <span className="text-sm font-semibold">{ui.usefulTips}</span>
                  </div>
                  <ul className="space-y-2.5">
                    {item.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prev / Next nav */}
              <div className="grid grid-cols-2 gap-3">
                {prevSection ? (
                  <button
                    onClick={() => setActive(prevSection.id)}
                    className="group flex items-center gap-3 p-3 rounded-lg border bg-card hover:border-primary/40 transition-colors text-left"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180 text-muted-foreground group-hover:text-primary shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{ui.prev}</div>
                      <div className="text-sm font-medium truncate">{content[prevSection.id].title}</div>
                    </div>
                  </button>
                ) : <div />}
                {nextSection ? (
                  <button
                    onClick={() => setActive(nextSection.id)}
                    className="group flex items-center gap-3 p-3 rounded-lg border bg-card hover:border-primary/40 transition-colors text-right justify-end"
                  >
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{ui.next}</div>
                      <div className="text-sm font-medium truncate">{content[nextSection.id].title}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                  </button>
                ) : <div />}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <StaggerItem>
      <div className="rounded-lg border bg-background/60 backdrop-blur px-3 py-2">
        <div className="text-lg font-semibold leading-tight">{value}</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</div>
      </div>
    </StaggerItem>
  );
}
