import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Reveal } from '@/components/ui/motion';

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "Narxlarni yangilash uchun PMS ga ulanish shartmi?",
      answer: "Yo'q, shart emas. Tizim internetdagi ochiq manbalardan (Booking, Expedia, Agoda va h.k.) ma'lumotlarni o'zi yig'adi va tahlil qiladi. Agar xohlasangiz, PMS ga ulash orqali to'g'ridan-to'g'ri narxlarni o'zgartirishingiz mumkin."
    },
    {
      question: "Tizim qancha tilda ishlaydi?",
      answer: "RateRadar interfeysi uchta tilda: O'zbek, Rus va Ingliz tillarida to'liq ishlaydi. Bundan tashqari, Mehmonxona QR xizmatida mijozlarning sharhlari avtomatik ravishda sizning tilingizga tarjima qilib beriladi."
    },
    {
      question: "Bepul sinov muddati qanday ishlaydi?",
      answer: "Bizda vaqt bilan chegaralangan sinov muddati yo'q, uning o'rniga doimiy 'Bepul' rejamiz bor. Siz ro'yxatdan o'tib, 1 ta mehmonxona va 5 ta raqibni umrbod bepul kuzatishingiz mumkin."
    },
    {
      question: "Raqobatchi mehmonxonalar qanday aniqlanadi?",
      answer: "Tizim sizning mehmonxonangiz koordinatalari (karta) asosida 300 metrdan 5 km radiusgacha bo'lgan barcha yaqin mehmonxonalarni avtomatik topadi va sizga ro'yxatini taqdim etadi."
    }
  ];

  return (
    <section className="py-24 border-t bg-background relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[11px] font-semibold uppercase tracking-wider text-primary mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
            FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ko'p so'raladigan savollar
          </h2>
        </Reveal>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <Reveal key={index} delay={index * 0.1}>
                <div 
                  className={`border rounded-2xl overflow-hidden transition-colors duration-300 ${isOpen ? 'bg-muted/30 border-primary/20' : 'bg-card hover:border-border/80'}`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
                  >
                    <span className="font-semibold text-foreground pr-8">{faq.question}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
