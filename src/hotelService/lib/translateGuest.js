import { EN_BASE } from "./i18n";

const CACHE_PREFIX = "hs_ui_";

/**
 * Til kodini MyMemory format ga o'tkazish
 */
const toMyMemory = (code) => {
  const MAP = {
    zh: "zh-CN", pt: "pt-PT", he: "iw", jv: "jw",
  };
  return MAP[code] || code;
};

/**
 * Barcha UI matnlarni BITTA API chaqiruvida tarjima qilish.
 * Natija localStorage ga saqlanadi — keyingi kirishda API chaqirilmaydi.
 */
export const getTranslations = async (langCode) => {
  // Ingliz tili — to'g'ridan qaytarish
  if (langCode === "en") return EN_BASE;

  // Keshdan tekshirish
  const cacheKey = `${CACHE_PREFIX}${langCode}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try { return { ...EN_BASE, ...JSON.parse(cached) }; } catch {}
  }

  // Barcha matnlarni | || | separator bilan birlashtirish
  const SEPARATOR = " |~| ";
  const keys   = Object.keys(EN_BASE);
  const values = Object.values(EN_BASE);
  const combined = values.join(SEPARATOR);

  // Faqat 1 ta API chaqiruv
  const mmCode = toMyMemory(langCode);
  const url = `https://api.mymemory.translated.net/get` +
    `?q=${encodeURIComponent(combined)}&langpair=en|${mmCode}` +
    (import.meta.env.VITE_MYMEMORY_EMAIL ? `&de=${import.meta.env.VITE_MYMEMORY_EMAIL}` : "");

  try {
    const res  = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();

    if (data.responseStatus === 200) {
      const parts = data.responseData.translatedText.split(SEPARATOR);

      if (parts.length === keys.length) {
        const result = {};
        keys.forEach((k, i) => { result[k] = parts[i]?.trim() || EN_BASE[k]; });
        localStorage.setItem(cacheKey, JSON.stringify(result));
        return { ...EN_BASE, ...result };
      }
    }
  } catch {}

  // Fallback: ingliz tili
  return EN_BASE;
};

/**
 * Keshni tozalash (biror til uchun)
 */
export const clearTranslationCache = (langCode) => {
  localStorage.removeItem(`${CACHE_PREFIX}${langCode}`);
};
