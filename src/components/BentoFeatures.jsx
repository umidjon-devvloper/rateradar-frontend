import { motion } from 'framer-motion';
import { LineChart, Zap, Globe2, ShieldCheck, Sparkles, MessageSquare } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { Reveal } from '@/components/ui/motion';

export function BentoFeatures() {
  return (
    <section id="features" className="py-24 relative bg-muted/10 border-t">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] -z-10"></div>
      
      <div className="max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[11px] font-semibold uppercase tracking-wider text-primary mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
            Imkoniyatlar
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Sizga kerak bo'lgan hamma narsa
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Hotelingizning bozordagi pozitsiyasini yaxshilash uchun mo'ljallangan to'liq vosita. Asosiy e'tibor avtomatlashtirish va AI orqali tezkor qarorlar qabul qilishga qaratilgan.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[280px]">
          {/* Bento Box 1: Katta quti (Real vaqt narxlar) */}
          <Reveal className="md:col-span-2 md:row-span-2 h-full" delay={0.1}>
            <SpotlightCard className="h-full p-8 flex flex-col group border-none shadow-xl bg-gradient-to-br from-card to-muted/20">
              <div className="mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <LineChart className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">Real vaqt narx monitoringi</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Raqobatchilaringiz qachon narxni tushirayotganini darhol bilib oling. Booking, Expedia va Agoda narxlari har 2 soatda avtomatik yangilanib turadi.
                </p>
              </div>
              <div className="mt-auto relative rounded-xl border bg-background overflow-hidden h-40 flex items-center justify-center shadow-inner group-hover:border-primary/30 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
                {/* Mockup grafik */}
                <svg className="w-full h-full text-primary/20 p-4" viewBox="0 0 100 50" preserveAspectRatio="none">
                  <path d="M0,50 L0,40 C10,35 20,45 30,30 C40,15 50,25 60,10 C70,-5 80,20 90,5 C95,-2.5 100,5 100,5 L100,50 Z" fill="currentColor" />
                  <path d="M0,40 C10,35 20,45 30,30 C40,15 50,25 60,10 C70,-5 80,20 90,5 C95,-2.5 100,5 100,5" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
                </svg>
              </div>
            </SpotlightCard>
          </Reveal>

          {/* Bento Box 2: O'rtacha (AI) */}
          <Reveal className="md:col-span-2 lg:col-span-2 h-full" delay={0.2}>
            <SpotlightCard className="h-full p-8 flex flex-col group bg-card">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center group-hover:rotate-12 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 bg-violet-500/10 text-violet-600 text-xs font-bold rounded-full">Gemini AI</span>
              </div>
              <h3 className="text-xl font-bold mb-2">AI tavsiyalari</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Gemini sizning bozor pozitsiyangizni o'rganadi va kunlik narx strategiyasini yozib beradi. O'ylashga vaqt ketkazmaysiz.
              </p>
              <div className="mt-auto bg-muted/50 rounded-xl p-4 text-xs font-mono text-muted-foreground border group-hover:border-violet-500/30 transition-colors">
                > Analizing competitors...<br/>
                > Optimal price for tomorrow: <span className="text-green-500 font-bold">$120</span>
              </div>
            </SpotlightCard>
          </Reveal>

          {/* Bento Box 3: Kichik (Multi-OTA) */}
          <Reveal className="md:col-span-1 lg:col-span-1 h-full" delay={0.3}>
            <SpotlightCard className="h-full p-8 flex flex-col items-center justify-center text-center group bg-card">
              <Globe2 className="w-12 h-12 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold mb-2">Multi-OTA</h3>
              <p className="text-sm text-muted-foreground">
                6+ platforma (Booking, Expedia, Agoda...) qo'llab-quvvatlanadi.
              </p>
            </SpotlightCard>
          </Reveal>

          {/* Bento Box 4: Kichik (Sharhlar) */}
          <Reveal className="md:col-span-1 lg:col-span-1 h-full" delay={0.4}>
            <SpotlightCard className="h-full p-8 flex flex-col items-center justify-center text-center group bg-card">
              <MessageSquare className="w-12 h-12 text-pink-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold mb-2">Sharhlar Tahlili</h3>
              <p className="text-sm text-muted-foreground">
                Mijoz sharhlari avto-tarjima qilinadi va hissiyot aniqlanadi.
              </p>
            </SpotlightCard>
          </Reveal>

          {/* Bento Box 5: Uzunchoq gorizontal (Bildirishnomalar) */}
          <Reveal className="md:col-span-3 lg:col-span-4 h-full" delay={0.5}>
            <SpotlightCard className="h-full p-8 flex flex-col md:flex-row items-center gap-8 group bg-card overflow-hidden">
              <div className="w-16 h-16 shrink-0 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold mb-2">Tezkor bildirishnomalar</h3>
                <p className="text-muted-foreground">
                  Raqib narxni tushirsa yoki salbiy sharh chiqsa darhol xabar olasiz. Vaqtni yo'qotmay narxni birinchi bo'lib tushiring.
                </p>
              </div>
              
              <div className="hidden lg:flex gap-4">
                <div className="px-4 py-2 rounded-lg bg-rose-500/10 text-rose-600 text-sm font-bold border border-rose-500/20 shadow-sm animate-pulse">
                  Raqib narxni tushirdi!
                </div>
                <div className="px-4 py-2 rounded-lg bg-yellow-500/10 text-yellow-600 text-sm font-bold border border-yellow-500/20 shadow-sm">
                  Yangi sharh (4.0)
                </div>
              </div>
            </SpotlightCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
