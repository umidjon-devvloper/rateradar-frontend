// ════════════════════════════════════════════════════════════════════
// OTA / platforma brend vizuallari — YAGONA MANBA (single source of truth)
//
// Ilgari har bir sahifa o'z rang xaritasini saqlardi (Prices, OtaChannels,
// Competitors, Reviews) — bir xil brendlar har joyda turlicha ko'rinardi.
// Endi hammasi shu yerdan oladi.
//
// Har bir brend uchun:
//   gradient — avatar/ikonka uchun to'liq `bg-gradient-to-br ...` klasi
//   badge    — yumshoq "pill" yorlig'i (och fon + matn, dark variant bilan)
//   short    — 1–3 belgilik qisqartma
// ════════════════════════════════════════════════════════════════════

const BRANDS = {
  booking:        { label: 'Booking.com',  gradient: 'bg-gradient-to-br from-blue-500 to-blue-700',           badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',         short: 'B'  },
  agoda:          { label: 'Agoda',        gradient: 'bg-gradient-to-br from-rose-500 to-fuchsia-600',        badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',         short: 'A'  },
  expedia:        { label: 'Expedia',      gradient: 'bg-gradient-to-br from-amber-400 to-fuchsia-600',       badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300', short: 'E'  },
  hotels:         { label: 'Hotels.com',   gradient: 'bg-gradient-to-br from-orange-400 to-red-600',          badge: 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300', short: 'H'  },
  trip:           { label: 'Trip.com',     gradient: 'bg-gradient-to-br from-sky-400 to-blue-700',            badge: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',             short: 'T'  },
  google:         { label: 'Google Hotels',gradient: 'bg-gradient-to-br from-red-500 via-amber-500 to-emerald-500', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',   short: 'G'  },
  priceline:      { label: 'Priceline',    gradient: 'bg-gradient-to-br from-indigo-400 to-indigo-700',       badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300', short: 'P'  },
  tripadvisor:    { label: 'TripAdvisor',  gradient: 'bg-gradient-to-br from-teal-400 to-emerald-600',        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300', short: 'TA' },
  airbnb:         { label: 'Airbnb',       gradient: 'bg-gradient-to-br from-pink-400 to-rose-600',           badge: 'bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300',         short: 'Ab' },
  ostrovok:       { label: 'Ostrovok',     gradient: 'bg-gradient-to-br from-emerald-400 to-emerald-600',     badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300', short: 'O'  },
  yandex:         { label: 'Yandex Travel',gradient: 'bg-gradient-to-br from-amber-400 to-orange-500',        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',     short: 'YT' },
  vio:            { label: 'Vio.com',      gradient: 'bg-gradient-to-br from-violet-400 to-purple-700',       badge: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300', short: 'V'  },
  edreams:        { label: 'eDreams',      gradient: 'bg-gradient-to-br from-cyan-400 to-sky-600',            badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',         short: 'eD' },
  amari:          { label: 'Amari.com',    gradient: 'bg-gradient-to-br from-rose-400 to-pink-700',           badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',         short: 'Am' },
  destinia:       { label: 'Destinia',     gradient: 'bg-gradient-to-br from-lime-400 to-green-600',          badge: 'bg-lime-100 text-lime-700 dark:bg-lime-950/40 dark:text-lime-300',         short: 'D'  },
  orbitz:         { label: 'Orbitz',       gradient: 'bg-gradient-to-br from-blue-400 to-indigo-600',         badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300', short: 'Or' },
  travelocity:    { label: 'Travelocity',  gradient: 'bg-gradient-to-br from-sky-400 to-blue-600',            badge: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',             short: 'Tv' },
  hotwire:        { label: 'Hotwire',      gradient: 'bg-gradient-to-br from-yellow-400 to-orange-500',       badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300', short: 'Hw' },
  kayak:          { label: 'Kayak',        gradient: 'bg-gradient-to-br from-orange-400 to-red-500',          badge: 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300', short: 'K'  },
  makemytrip:     { label: 'MakeMyTrip',   gradient: 'bg-gradient-to-br from-red-400 to-pink-600',            badge: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',             short: 'MMT'},
  cleartrip:      { label: 'Cleartrip',    gradient: 'bg-gradient-to-br from-cyan-400 to-blue-600',           badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',         short: 'CT' },
  zenhotels:      { label: 'ZenHotels',    gradient: 'bg-gradient-to-br from-green-400 to-emerald-600',       badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300', short: 'Z'  },
  hotelscombined: { label: 'HotelsCombined',gradient:'bg-gradient-to-br from-amber-400 to-yellow-600',        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',     short: 'HC' },
  skyscanner:     { label: 'Skyscanner',   gradient: 'bg-gradient-to-br from-sky-400 to-cyan-600',            badge: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',             short: 'Sk' },
};

// Turli yozilishlarni kanonik kalitga moslash (lotin + kiril + normalizatsiya)
const ALIASES = {
  bookingcom: 'booking', bookings: 'booking',
  googlehotels: 'google', googlehotel: 'google', googletravel: 'google',
  hotelscom: 'hotels',
  tripcom: 'trip',
  yandextravel: 'yandex', яндекс: 'yandex', 'яндекс трэвел': 'yandex', 'яндекс путешествия': 'yandex',
  островок: 'ostrovok',
  viocom: 'vio',
  amaricom: 'amari',
  mmt: 'makemytrip',
};

// Neytral zaxira (noma'lum brend)
const NEUTRAL = {
  gradient: 'bg-gradient-to-br from-slate-400 to-slate-600',
  badge: 'bg-muted text-muted-foreground',
};

function canonicalKey(name) {
  const raw = String(name || '').toLowerCase().trim();
  if (!raw) return null;
  if (BRANDS[raw]) return raw;
  if (ALIASES[raw]) return ALIASES[raw];
  const stripped = raw.replace(/[^a-z0-9]/g, '');
  if (BRANDS[stripped]) return stripped;
  if (ALIASES[stripped]) return ALIASES[stripped];
  return null;
}

// Nomdan qisqartma yasash (noma'lum brendlar uchun)
export function otaInitials(name) {
  const s = String(name || '').replace(/[^A-Za-z0-9]/g, '');
  return s.slice(0, 2).toUpperCase() || '?';
}

// Asosiy API: istalgan OTA nomi/kaliti bo'yicha brend vizualini qaytaradi.
// Har doim to'liq obyekt qaytadi (noma'lum bo'lsa neytral zaxira bilan).
export function getOtaBrand(name) {
  const key = canonicalKey(name);
  if (key && BRANDS[key]) return { key, ...BRANDS[key] };
  return {
    key: null,
    label: String(name || ''),
    gradient: NEUTRAL.gradient,
    badge: NEUTRAL.badge,
    short: otaInitials(name),
  };
}

export default getOtaBrand;
