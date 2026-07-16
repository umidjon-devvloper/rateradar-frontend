import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/motion';
import { useLang } from '@/lib/i18n';

const TXT = {
  uz: {
    badge: 'Mijozlar Fikri',
    title: 'Nega hotellar bizni tanlaydi?',
    roles: ['Boshqaruvchi, Grand Hotel', 'Daromad menejeri, Silk Road Resort', "Egasining o'rinbosari, City Inn"],
    texts: [
      "RateRadar orqali daromadimiz roppa-rosa 20% ga oshdi. Endi har kuni ertalab konkurentlar narxini izlab vaqt yo'qotmaymiz, hammasi tayyor keladi.",
      "Eng yaxshi funksiyasi bu — AI tavsiyalari. Mehmonxona to'lish ehtimoliga qarab qachon narxni ko'tarish kerakligini o'zi aytib turadi.",
      "Mehmonxona xizmati (QR orqali buyurtma) funksiyasi juda zo'r! Xodimlarimiz ishi osonlashdi, mehmonlar ham telegram orqali tez javob olyapti.",
    ],
  },
  ru: {
    badge: 'Отзывы клиентов',
    title: 'Почему отели выбирают нас?',
    roles: ['Управляющий, Grand Hotel', 'Менеджер по доходам, Silk Road Resort', 'Зам. владельца, City Inn'],
    texts: [
      'С RateRadar наш доход вырос ровно на 20%. Больше не тратим время каждое утро на поиск цен конкурентов — всё приходит готовым.',
      'Лучшая функция — AI-рекомендации. Система сама подсказывает, когда поднять цену в зависимости от вероятности заполнения отеля.',
      'Сервис отеля (заказ по QR) — просто супер! Работа персонала упростилась, гости быстро получают ответ через Telegram.',
    ],
  },
  en: {
    badge: 'Testimonials',
    title: 'Why do hotels choose us?',
    roles: ['General Manager, Grand Hotel', 'Revenue Manager, Silk Road Resort', 'Deputy Owner, City Inn'],
    texts: [
      "With RateRadar our revenue grew by a solid 20%. We no longer waste every morning hunting competitor prices — everything arrives ready.",
      "The best feature is the AI recommendations. It tells you when to raise prices based on occupancy probability.",
      "The hotel service (QR ordering) feature is brilliant! Our staff's work got easier, and guests get quick replies via Telegram.",
    ],
  },
};

export function TestimonialSection() {
  const lang = useLang((s) => s.lang);
  const tx = TXT[lang] || TXT.en;

  const testimonials = [
    { name: "Azizbek Rahimov", image: "https://i.pravatar.cc/150?u=a042581f4e29026024d" },
    { name: "Malika Umarova", image: "https://i.pravatar.cc/150?u=a04258114e29026702d" },
    { name: "Rustam Qosimov", image: "https://i.pravatar.cc/150?u=a04258114e29026302d" },
  ].map((p, i) => ({ ...p, role: tx.roles[i], text: tx.texts[i], rating: 5 }));

  return (
    <section className="py-24 border-t bg-muted/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/[0.03] rounded-full blur-3xl -z-10" />

      <div className="max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Reveal className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[11px] font-semibold uppercase tracking-wider text-primary mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
            {tx.badge}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            {tx.title}
          </h2>
        </Reveal>

        <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <StaggerItem key={i}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative bg-card p-8 rounded-3xl border shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 h-full flex flex-col group"
                style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
              >
                <div className="absolute top-6 right-6 text-primary/10 group-hover:text-primary/20 transition-colors">
                  <Quote size={48} />
                </div>
                
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-muted-foreground leading-relaxed flex-grow relative z-10">
                  "{t.text}"
                </p>

                <div className="mt-8 flex items-center gap-4 relative z-10">
                  <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full border-2 border-background shadow-md" />
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{t.name}</h4>
                    <span className="text-xs text-muted-foreground">{t.role}</span>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
