import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Star, Sparkles } from 'lucide-react';
import { Reveal } from '@/components/ui/motion';
import { cn } from '@/lib/utils';
import { useLang } from '@/lib/i18n';

const TXT = {
  uz: {
    title: "Tizim qanday ko'rinishga ega?",
    desc: "RateRadar - bu oddiy quruq raqamlar emas, o'ta chiroyli va qulay interfeysli tahlil tizimi. Har bir funksiya mehmonxona boshqaruvini zavqliroq qilish uchun dizayn qilingan.",
    tabPrices: 'Narxlar tahlili', tabReviews: 'Sharhlar', tabAi: 'AI maslahatlar',
    aiCard: 'Gemini Strategiyasi',
  },
  ru: {
    title: 'Как выглядит система?',
    desc: 'RateRadar — это не сухие цифры, а красивая и удобная аналитическая система. Каждая функция создана, чтобы управление отелем приносило удовольствие.',
    tabPrices: 'Анализ цен', tabReviews: 'Отзывы', tabAi: 'AI советы',
    aiCard: 'Стратегия Gemini',
  },
  en: {
    title: 'What does the system look like?',
    desc: 'RateRadar is not dry numbers — it is a beautiful, easy-to-use analytics system. Every feature is designed to make hotel management enjoyable.',
    tabPrices: 'Price analytics', tabReviews: 'Reviews', tabAi: 'AI advice',
    aiCard: 'Gemini Strategy',
  },
};

export function DashboardPreview() {
  const lang = useLang((s) => s.lang);
  const tx = TXT[lang] || TXT.en;
  const tabs = [
    { id: 'prices', label: tx.tabPrices, icon: LineChart, color: 'text-blue-500', bg: 'bg-blue-500' },
    { id: 'reviews', label: tx.tabReviews, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500' },
    { id: 'ai', label: tx.tabAi, icon: Sparkles, color: 'text-violet-500', bg: 'bg-violet-500' },
  ];
  const [activeTab, setActiveTab] = useState('prices');

  return (
    <section className="py-24 border-t bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/[0.03] rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Reveal className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {tx.title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {tx.desc}
          </p>
        </Reveal>

        {/* Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative px-6 py-3 rounded-full flex items-center gap-2 text-sm font-semibold transition-all duration-300",
                  isActive ? "text-primary-foreground shadow-lg scale-105" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-tab-indicator"
                    className={cn("absolute inset-0 rounded-full -z-10", tab.bg)}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <tab.icon className={cn("w-4 h-4", isActive ? "text-white" : tab.color)} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Mockup Container */}
        <div className="relative mx-auto rounded-xl sm:rounded-[2rem] border border-border/50 bg-muted/30 p-2 sm:p-4 shadow-2xl backdrop-blur-sm max-w-5xl h-[400px] sm:h-[600px] overflow-hidden">
          <div className="absolute top-4 left-6 flex gap-2 z-20">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>

          <div className="w-full h-full rounded-lg sm:rounded-2xl bg-card border shadow-inner relative overflow-hidden mt-6 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {activeTab === 'prices' && (
                <motion.div
                  key="prices"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full flex flex-col p-8"
                >
                  <div className="w-full h-12 bg-muted/50 rounded-lg mb-8" />
                  <div className="flex gap-8 h-full">
                    <div className="w-1/3 bg-muted/20 rounded-xl border p-4 space-y-4">
                      <div className="h-8 w-2/3 bg-muted rounded-md" />
                      <div className="h-16 w-full bg-blue-500/10 rounded-md border border-blue-500/20" />
                      <div className="h-16 w-full bg-muted/50 rounded-md" />
                      <div className="h-16 w-full bg-muted/50 rounded-md" />
                    </div>
                    <div className="w-2/3 bg-muted/20 rounded-xl border p-6 flex flex-col justify-end relative overflow-hidden">
                      <svg className="w-full h-48 text-blue-500/20" viewBox="0 0 100 50" preserveAspectRatio="none">
                        <path d="M0,50 L0,30 C20,40 30,10 50,20 C70,30 80,5 100,15 L100,50 Z" fill="currentColor" />
                        <path d="M0,30 C20,40 30,10 50,20 C70,30 80,5 100,15" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full flex flex-col p-8"
                >
                  <div className="flex gap-4 mb-8">
                    <div className="w-32 h-32 rounded-full border-[8px] border-yellow-500 flex items-center justify-center text-4xl font-bold">9.2</div>
                    <div className="flex-1 bg-muted/20 rounded-xl border p-6 space-y-3">
                      <div className="h-4 w-full bg-yellow-500/20 rounded-full" />
                      <div className="h-4 w-4/5 bg-green-500/20 rounded-full" />
                      <div className="h-4 w-2/3 bg-red-500/20 rounded-full" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <div className="bg-muted/30 rounded-lg p-4 space-y-2 border">
                      <div className="flex text-yellow-500 gap-1"><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/></div>
                      <div className="h-3 w-full bg-muted rounded-full mt-4" />
                      <div className="h-3 w-4/5 bg-muted rounded-full" />
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4 space-y-2 border">
                      <div className="flex text-yellow-500 gap-1"><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/></div>
                      <div className="h-3 w-full bg-muted rounded-full mt-4" />
                      <div className="h-3 w-3/5 bg-muted rounded-full" />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'ai' && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full flex items-center justify-center p-8 relative"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-transparent" />
                  <div className="w-full max-w-lg bg-card border border-violet-500/30 rounded-2xl p-8 shadow-2xl relative z-10 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-violet-500/10 text-violet-500 mx-auto flex items-center justify-center mb-6">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{tx.aiCard}</h3>
                    <div className="space-y-4 text-left">
                      <div className="p-4 rounded-lg bg-muted/50 border flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                        <div className="flex-1 h-12 bg-muted rounded animate-pulse" />
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50 border flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                        <div className="flex-1 h-8 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
