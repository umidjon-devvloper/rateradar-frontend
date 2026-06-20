import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, MinusCircle, Search, Sparkles, X } from 'lucide-react';
import { onPriceProgress } from '@/lib/socket';
import { getOtaBrand } from '@/lib/otaBrands';
import { useLang } from '@/lib/i18n';
import { popIn, staggerContainer, fadeInUp } from '@/lib/animations';
import { cn } from '@/lib/utils';

const l = (lang, uz, ru, en) => (lang === 'ru' ? ru : lang === 'en' ? en : uz);

// Kanal status → vizual.
function StatusIcon({ status }) {
  if (status === 'done') {
    return (
      <motion.span variants={popIn} initial="hidden" animate="show" key="done">
        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      </motion.span>
    );
  }
  if (status === 'fail' || status === 'failed') {
    return <XCircle className="h-5 w-5 text-rose-400" />;
  }
  if (status === 'skipped') {
    return <MinusCircle className="h-5 w-5 text-muted-foreground/50" />;
  }
  if (status === 'processing' || status === 'searching') {
    return <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />;
  }
  // pending
  return <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30 inline-block" />;
}

function ChannelRow({ label, state, lang }) {
  const brand = getOtaBrand(label);
  const status = state?.status || 'pending';
  const active = status === 'processing' || status === 'searching';
  const done = status === 'done';

  return (
    <motion.div
      variants={fadeInUp}
      layout
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-colors',
        active && 'border-indigo-300/60 bg-indigo-50/50 dark:bg-indigo-950/20',
        done && 'border-emerald-200/60 bg-emerald-50/40 dark:bg-emerald-950/15',
        !active && !done && 'border-border/50',
      )}
    >
      {/* Brend avatar — process paytida yengil pulse */}
      <motion.div
        animate={active ? { scale: [1, 1.08, 1] } : { scale: 1 }}
        transition={active ? { repeat: Infinity, duration: 1.2 } : {}}
        className={cn(
          'h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0',
          brand.gradient,
        )}
      >
        {brand.short}
      </motion.div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{brand.label}</div>
        <div className="text-[11px] text-muted-foreground">
          {status === 'done' && l(lang, 'Narx keldi', 'Цена получена', 'Price received')}
          {active && l(lang, 'Olinmoqda…', 'Загрузка…', 'Fetching…')}
          {(status === 'fail' || status === 'failed') && l(lang, 'Narx topilmadi', 'Цена не найдена', 'No price')}
          {status === 'skipped' && l(lang, 'Mavjud emas', 'Недоступно', 'Not available')}
          {status === 'pending' && l(lang, 'Kutilyapti', 'Ожидание', 'Pending')}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {done && state?.price > 0 && (
          <motion.span
            variants={popIn} initial="hidden" animate="show"
            className="text-sm font-semibold text-emerald-600 dark:text-emerald-400"
          >
            ${Math.round(state.price)}
          </motion.span>
        )}
        <AnimatePresence mode="wait" initial={false}>
          <StatusIcon status={status} />
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/**
 * Narx yangilash jarayonini jonli, animatsiyali ko'rsatadi.
 *   open      — panel ochiqmi (tugma bosilganda true)
 *   onClose   — yopish
 * Socket `price:progress` eventlarini tinglaydi.
 */
export default function PriceRefreshProgress({ open, onClose }) {
  const lang = useLang((s) => s.lang);
  const [channels, setChannels] = useState({}); // label -> { status, price, via }
  const [order, setOrder] = useState([]);        // kanal tartibi
  const [phase, setPhase] = useState('own');      // own | competitors | complete
  const [comp, setComp] = useState({ total: 0, done: 0, failed: 0, current: '' });
  const resetRef = useRef(false);

  // Ochilganda holatni tozalaymiz (yangi yugurish).
  useEffect(() => {
    if (open && !resetRef.current) {
      resetRef.current = true;
      setChannels({});
      setOrder([]);
      setPhase('own');
      setComp({ total: 0, done: 0, failed: 0, current: '' });
    }
    if (!open) resetRef.current = false;
  }, [open]);

  // Socket eventlarini tinglaymiz.
  useEffect(() => {
    if (!open) return;
    const off = onPriceProgress((p) => {
      if (!p || !p.stage) return;

      if (p.stage === 'start' && Array.isArray(p.channels)) {
        setOrder(p.channels);
        setChannels(Object.fromEntries(p.channels.map((c) => [c, { status: 'pending' }])));
        return;
      }
      if (p.stage === 'own') {
        if (p.status === 'complete') { setPhase('competitors'); return; }
        if (p.channel) {
          setChannels((prev) => ({
            ...prev,
            [p.channel]: { status: p.status, price: p.price, via: p.via },
          }));
          setOrder((prev) => (prev.includes(p.channel) ? prev : [...prev, p.channel]));
        }
        return;
      }
      if (p.stage === 'competitors') {
        setPhase('competitors');
        setComp((c) => ({ ...c, total: p.total || 0 }));
        return;
      }
      if (p.stage === 'competitor') {
        setComp((c) => {
          if (p.status === 'processing') return { ...c, current: p.name };
          if (p.status === 'done') return { ...c, done: c.done + 1, current: '' };
          if (p.status === 'failed') return { ...c, failed: c.failed + 1, current: '' };
          return c;
        });
        return;
      }
      if (p.stage === 'complete') {
        setPhase('complete');
      }
    });
    return off;
  }, [open]);

  const doneCount = order.filter((c) => channels[c]?.status === 'done').length;
  const totalChannels = order.length || 5;
  const compProgress = comp.total ? Math.round(((comp.done + comp.failed) / comp.total) * 100) : 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -8 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -8 }}
          transition={{ type: 'spring', stiffness: 200, damping: 28 }}
          className="overflow-hidden"
        >
          <div className="rounded-2xl border border-border/60 bg-card shadow-soft p-4 sm:p-5 mb-4">
            {/* Sarlavha */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: phase === 'complete' ? 0 : 360 }}
                  transition={phase === 'complete' ? {} : { repeat: Infinity, duration: 2.5, ease: 'linear' }}
                  className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center"
                >
                  <Sparkles className="h-4 w-4 text-white" />
                </motion.div>
                <div>
                  <div className="text-sm font-semibold">
                    {phase === 'complete'
                      ? l(lang, 'Yangilash tugadi', 'Обновление завершено', 'Refresh complete')
                      : l(lang, 'Narxlar yangilanmoqda…', 'Обновление цен…', 'Refreshing prices…')}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {phase === 'own' && l(lang, 'Sizning mehmonxona kanallari', 'Каналы вашего отеля', 'Your hotel channels')}
                    {phase === 'competitors' && l(lang, 'Raqiblar tekshirilmoqda', 'Проверка конкурентов', 'Checking competitors')}
                    {phase === 'complete' && l(lang, 'Barcha ma\'lumotlar yig\'ildi', 'Все данные собраны', 'All data collected')}
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Kanal progress bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
                <span className="flex items-center gap-1">
                  <Search className="h-3 w-3" />
                  {l(lang, 'Kanallar', 'Каналы', 'Channels')}
                </span>
                <span>{doneCount}/{totalChannels}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500"
                  animate={{ width: `${(doneCount / totalChannels) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
              </div>
            </div>

            {/* Kanal qatorlari */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
            >
              {order.map((label) => (
                <ChannelRow key={label} label={label} state={channels[label]} lang={lang} />
              ))}
            </motion.div>

            {/* Raqiblar bo'limi */}
            <AnimatePresence>
              {(phase === 'competitors' || phase === 'complete') && comp.total > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 pt-4 border-t border-border/50"
                >
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
                    <span>{l(lang, 'Raqiblar', 'Конкуренты', 'Competitors')}</span>
                    <span>{comp.done + comp.failed}/{comp.total}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500"
                      animate={{ width: `${compProgress}%` }}
                      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                    />
                  </div>
                  <AnimatePresence mode="wait">
                    {comp.current && (
                      <motion.div
                        key={comp.current}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-500" />
                        <span className="truncate">{comp.current}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {phase === 'complete' && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      {l(lang,
                        `${comp.done} ta raqib yangilandi`,
                        `Обновлено ${comp.done} конкурентов`,
                        `${comp.done} competitors updated`)}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
