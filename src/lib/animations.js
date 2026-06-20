// Umumiy framer-motion variantlari — butun ilova bo'ylab bir xil, silliq his.
// Sahifalar bu variantlarni import qilib `motion.*` elementlarda ishlatadi.

// Konteyner — bolalarini ketma-ket (stagger) paydo qiladi.
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};

// Pastdan yumshoq ko'tarilib, ozgina kattalashib paydo bo'lish (stat kartalar,
// ro'yxat elementlari) — yengil "overshoot" bilan jonliroq his beradi.
export const fadeInUp = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24, mass: 0.6 },
  },
};

// Narx katakchasi — kichikdan "otilib" chiqadi (overshoot bilan). Jadval
// katakchalari diagonal kaskad bo'lib paydo bo'lishi uchun.
export const cellPop = {
  hidden: { opacity: 0, scale: 0.55, y: 8 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 520, damping: 22, mass: 0.5 },
  },
};

// Yon tomondan kirish (sidebar/panel elementlari).
export const fadeInLeft = {
  hidden: { opacity: 0, x: -18 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 240, damping: 24 } },
};

// Kichik masshtabdan kattalashib paydo bo'lish (modal, badge, ✓ belgilar).
export const popIn = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 22 } },
  exit: { opacity: 0, scale: 0.85, transition: { duration: 0.15 } },
};

// Sahifa o'tishi — yo'naltiruvchi (Router outlet).
export const pageTransition = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
};

// Dropdown / menyu — yuqoridan ochiladi (origin-top scale + fade).
export const dropdownMenu = {
  hidden: { opacity: 0, y: -8, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 420, damping: 30 } },
  exit: { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.12 } },
};

// Qo'ng'iroq "jiringlashi" — yangi bildirishnoma kelganda.
export const bellRingAnim = {
  rotate: [0, -18, 14, -10, 8, -4, 0],
  transition: { duration: 0.7, ease: 'easeInOut' },
};

// Hover'da yengil ko'tarilish (kartalar). `whileHover`/`whileTap` bilan ishlatiladi.
export const hoverLift = {
  rest: { y: 0, scale: 1 },
  hover: { y: -4, scale: 1.015, transition: { type: 'spring', stiffness: 400, damping: 24 } },
  tap: { scale: 0.98 },
};
