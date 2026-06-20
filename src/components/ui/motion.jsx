import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp, pageTransition } from '@/lib/animations';

/**
 * Reusable motion wrapperlar — sahifalarda tez ishlatish uchun.
 */

// Bitta blok pastdan ko'tarilib paydo bo'ladi (ko'rinishga kelganda).
export function Reveal({ children, className = '', delay = 0, as = 'div', ...rest }) {
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={fadeInUp}
      transition={{ delay }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

// Konteyner — bolalarini ketma-ket paydo qiladi. Bolalar <StaggerItem> bo'lishi kerak.
export function Stagger({ children, className = '', once = true, ...rest }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: '-60px' }}
      variants={staggerContainer}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '', as = 'div', ...rest }) {
  const Comp = motion[as] || motion.div;
  return (
    <Comp className={className} variants={fadeInUp} {...rest}>
      {children}
    </Comp>
  );
}

// Butun sahifa kontentini o'rab, kirish animatsiyasini beradi.
export function PageMotion({ children, className = '' }) {
  return (
    <motion.div className={className} initial="hidden" animate="show" variants={pageTransition}>
      {children}
    </motion.div>
  );
}
