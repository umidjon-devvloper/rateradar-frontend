import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { create } from 'zustand';
import { useLang } from './i18n';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Hotel narxlari qaysi valyutada saqlangani — global state.
// Hozir foydalanilmaydi (narxlar har doim USD'da ko'rsatiladi), lekin
// boshqa joylar import qilgan bo'lsa, kompatibellik uchun saqlanadi.
export const useSourceCurrency = create((set) => ({
  currency: 'USD',
  setCurrency: (c) => set({ currency: c || 'USD' }),
}));

// Narxlar har doim USD'da ko'rsatiladi (foydalanuvchi so'roviga ko'ra).
// Til o'zgarganda valyuta o'zgartirilmaydi — UZ/RU/EN — hammasi $XX.
export function formatPrice(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value));
}

// Hook ham har doim USD qaytaradi — komponentlar oldingi `useFormatPrice()`
// chaqiruvini saqlab qolishi mumkin, kod o'zgarishsiz ishlaydi.
export function useFormatPrice() {
  // useLang chaqiramiz — komponent til o'zgartirsa qayta render bo'lsin
  // (boshqa matnlar tarjima qilinadi, narx esa USD'da qoladi).
  useLang((s) => s.lang);
  return (value) => formatPrice(value);
}

export function useCurrencyCode() {
  return 'USD';
}

export function formatDate(date, locale = 'uz') {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString(
    locale === 'uz' ? 'uz-UZ' : locale === 'ru' ? 'ru-RU' : 'en-US',
    { day: 'numeric', month: 'short', year: 'numeric' }
  );
}
