import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, BarChart3, TrendingUp, Zap, QrCode, Globe, Bot } from 'lucide-react';
import { useLang } from '@/lib/i18n';

const TXT = {
  uz: {
    s1title: 'Barcha raqobatchilar bir ekranda', s1desc: 'Bozorni 24/7 rejimida avtomatik kuzatib boring',
    yourPrice: 'Sizning narxingiz', marketAvg: "Bozor o'rtachasi", position: 'Pozitsiya', competitors: 'Raqobatchilar',
    priceChanges: "Narxlar o'zgarishi", live: 'Jonli',
    s2title: 'AI yordamida chuqur tahlil', s2desc: "Narxlarni qanday o'zgartirish haqida aqlli maslahatlar",
    aiRec: 'AI Tavsiyasi', realtime: 'Real vaqt rejimida',
    aiMsg: (p) => <>"Sizning asosiy raqobatchingiz (Hilton) narxni $5 ga tushirdi. Bronlash foizini saqlab qolish uchun narxni <strong className="text-primary">{p}</strong> qilib belgilashingizni tavsiya qilamiz."</>,
    accept: 'Qabul qilish', decline: 'Rad etish',
    s3title: '6+ OTA platformalar', s3desc: "Barcha yirik bronlash tizimlaridan ma'lumotlarni yig'ish",
    sync: "Ma'lumotlar avtomatik tarzda markaziy tizimga sinxronlanadi.",
  },
  ru: {
    s1title: 'Все конкуренты на одном экране', s1desc: 'Автоматический мониторинг рынка 24/7',
    yourPrice: 'Ваша цена', marketAvg: 'Средняя по рынку', position: 'Позиция', competitors: 'Конкуренты',
    priceChanges: 'Изменение цен', live: 'Live',
    s2title: 'Глубокий анализ с помощью AI', s2desc: 'Умные советы, как менять цены',
    aiRec: 'AI Рекомендация', realtime: 'В реальном времени',
    aiMsg: (p) => <>"Ваш основной конкурент (Hilton) снизил цену на $5. Чтобы сохранить долю бронирований, рекомендуем установить цену <strong className="text-primary">{p}</strong>."</>,
    accept: 'Принять', decline: 'Отклонить',
    s3title: '6+ OTA платформ', s3desc: 'Сбор данных со всех крупных систем бронирования',
    sync: 'Данные автоматически синхронизируются с центральной системой.',
  },
  en: {
    s1title: 'All competitors on one screen', s1desc: 'Monitor the market automatically, 24/7',
    yourPrice: 'Your price', marketAvg: 'Market average', position: 'Position', competitors: 'Competitors',
    priceChanges: 'Price changes', live: 'Live',
    s2title: 'Deep analysis powered by AI', s2desc: 'Smart advice on how to adjust your prices',
    aiRec: 'AI Recommendation', realtime: 'Real-time',
    aiMsg: (p) => <>"Your main competitor (Hilton) dropped their price by $5. To protect your booking share, we recommend setting your price to <strong className="text-primary">{p}</strong>."</>,
    accept: 'Accept', decline: 'Decline',
    s3title: '6+ OTA platforms', s3desc: 'Collecting data from all major booking systems',
    sync: 'Data syncs automatically to the central system.',
  },
};

export function HeroCarousel() {
  const lang = useLang((s) => s.lang);
  const tx = TXT[lang] || TXT.en;
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 'dashboard',
      title: tx.s1title,
      desc: tx.s1desc,
      content: (
        <div className="p-5 sm:p-7 h-full flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { icon: Building2, label: tx.yourPrice, value: '$95', accent: true },
              { icon: BarChart3, label: tx.marketAvg, value: '$87' },
              { icon: TrendingUp, label: tx.position, value: '#3/12' },
              { icon: Zap, label: tx.competitors, value: '8' },
            ].map((s, i) => (
              <div key={i} className="rounded-lg border bg-card p-3.5 text-left shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-7 h-7 rounded-md mb-2 flex items-center justify-center ${
                  s.accent ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  <s.icon className="h-3.5 w-3.5" />
                </div>
                <div className="text-xl font-semibold tracking-tight tabular-nums">{s.value}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="rounded-lg border bg-card p-4 text-left relative overflow-hidden shadow-sm">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full animate-shimmer" />
             <div className="flex justify-between mb-4">
               <div className="text-sm font-medium">{tx.priceChanges}</div>
               <div className="text-[11px] text-muted-foreground flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> {tx.live}</div>
             </div>
             <div className="flex items-end gap-1 h-12">
               {[40, 60, 45, 80, 55, 90, 75].map((h, i) => (
                 <div key={i} className="flex-1 bg-primary/20 rounded-t-sm transition-all duration-500 hover:bg-primary/40" style={{ height: `${h}%` }} />
               ))}
             </div>
          </div>
        </div>
      )
    },
    {
      id: 'ai-insights',
      title: tx.s2title,
      desc: tx.s2desc,
      content: (
        <div className="p-5 sm:p-7 h-full flex items-center justify-center">
           <div className="w-full relative">
             <div className="absolute inset-0 bg-violet-500/10 blur-xl rounded-full" />
             <div className="relative border rounded-xl bg-card p-5 shadow-lg">
                <div className="flex items-center gap-3 mb-4 border-b pb-4">
                  <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{tx.aiRec}</div>
                    <div className="text-xs text-muted-foreground">{tx.realtime}</div>
                  </div>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                  {tx.aiMsg('$92')}
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 bg-primary text-white rounded-lg py-2 text-xs font-medium hover:bg-primary/90 transition shadow-sm hover:shadow-md">{tx.accept}</button>
                  <button className="flex-1 bg-muted rounded-lg py-2 text-xs font-medium hover:bg-muted/80 transition">{tx.decline}</button>
                </div>
             </div>
           </div>
        </div>
      )
    },
    {
      id: 'platforms',
      title: tx.s3title,
      desc: tx.s3desc,
      content: (
        <div className="p-5 sm:p-7 h-full flex flex-col justify-center items-center text-center">
          <div className="relative w-full aspect-square max-w-[240px]">
            <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full animate-pulse" />
            <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-primary opacity-20" />
            
            {/* Orbiting Elements */}
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-0">
               <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-card border rounded-lg shadow-md text-xs font-bold text-blue-600">Booking</div>
               <div className="absolute bottom-4 left-0 px-3 py-1.5 bg-card border rounded-lg shadow-md text-xs font-bold text-red-500 -rotate-12">Agoda</div>
               <div className="absolute bottom-4 right-0 px-3 py-1.5 bg-card border rounded-lg shadow-md text-xs font-bold text-yellow-600 flex items-center gap-1 rotate-12"><Globe className="w-3 h-3"/> Expedia</div>
               <div className="absolute top-1/2 -right-6 -translate-y-1/2 px-3 py-1.5 bg-card border rounded-lg shadow-md text-xs font-bold text-green-600 rotate-6">Trip</div>
            </motion.div>
          </div>
          <p className="mt-8 text-sm text-muted-foreground font-medium">{tx.sync}</p>
        </div>
      )
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full mx-auto xl:max-w-2xl 2xl:max-w-none"
    >
      {/* Container */}
      <div className="relative rounded-[2rem] border bg-card shadow-2xl overflow-hidden h-[460px] flex flex-col group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-50" />
        
        {/* Mock browser bar */}
        <div className="flex items-center gap-1.5 px-5 py-4 border-b bg-muted/30 z-10">
          <div className="w-3 h-3 rounded-full bg-red-400/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
          <div className="w-3 h-3 rounded-full bg-green-400/70" />
          <div className="ml-3 px-3 py-1 text-xs text-muted-foreground bg-card rounded-md border flex-1 text-center font-medium shadow-inner">
            app.thehotelsaas.com
          </div>
        </div>

        {/* Carousel Content */}
        <div className="flex-1 relative overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              {slides[currentSlide].content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slide Info & Controls */}
        <div className="border-t bg-muted/10 p-5 z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="font-semibold text-base text-foreground mb-1">
                {slides[currentSlide].title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {slides[currentSlide].desc}
              </p>
            </motion.div>
          </AnimatePresence>
          
          {/* Indicators */}
          <div className="flex items-center gap-2 mt-4">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? 'w-6 bg-primary' : 'w-2 bg-primary/20 hover:bg-primary/40'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Decorative elements behind */}
      <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-violet-500/10 blur-2xl -z-10 rounded-[3rem] animate-pulse" />
    </motion.div>
  );
}
