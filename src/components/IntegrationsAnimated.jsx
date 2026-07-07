import { motion } from 'framer-motion';
import { Network, Database, Globe, CalendarRange, MapPin, Building2, Server } from 'lucide-react';
import { Reveal } from '@/components/ui/motion';

export function IntegrationsAnimated() {
  const integrations = [
    { icon: Globe, label: "Booking.com", color: "text-blue-600", bg: "bg-blue-600/10", x: -140, y: -90, delay: 0 },
    { icon: Database, label: "Expedia", color: "text-yellow-600", bg: "bg-yellow-600/10", x: 140, y: -90, delay: 0.2 },
    { icon: MapPin, label: "Agoda", color: "text-rose-600", bg: "bg-rose-600/10", x: -180, y: 30, delay: 0.4 },
    { icon: CalendarRange, label: "Airbnb", color: "text-pink-600", bg: "bg-pink-600/10", x: 180, y: 30, delay: 0.6 },
    { icon: Building2, label: "TravelLine (PMS)", color: "text-teal-600", bg: "bg-teal-600/10", x: -100, y: 130, delay: 0.8 },
    { icon: Server, label: "Opera (PMS)", color: "text-indigo-600", bg: "bg-indigo-600/10", x: 100, y: 130, delay: 1.0 }
  ];

  return (
    <section className="py-24 border-t relative overflow-hidden bg-background">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/[0.03] rounded-full blur-3xl -z-10" />
      
      <div className="max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Reveal className="max-w-2xl mx-auto text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[11px] font-semibold uppercase tracking-wider text-primary mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
            Integratsiyalar
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Barcha tizimlar bilan bitta aloqa
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            OTA platformalardan narxlarni yig'ish va mehmonxona boshqaruv tizimingizga (PMS) to'g'ridan-to'g'ri bog'lanish orqali jarayonni 100% avtomatlashtiring.
          </p>
        </Reveal>

        <div className="relative h-[400px] md:h-[500px] w-full max-w-4xl mx-auto flex items-center justify-center">
          {/* Central Hub */}
          <motion.div 
            className="absolute z-20 w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-primary to-violet-600 p-1 shadow-2xl shadow-primary/40 flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-full h-full rounded-full bg-card flex flex-col items-center justify-center border-4 border-transparent">
              <Network className="w-10 h-10 text-primary mb-1" />
              <span className="text-xs font-bold text-foreground">RateRadar</span>
            </div>
          </motion.div>

          {/* Connection Lines (SVGs) */}
          <svg className="absolute inset-0 w-full h-full -z-10 pointer-events-none opacity-20">
            {integrations.map((item, i) => (
              <motion.line
                key={i}
                x1="50%"
                y1="50%"
                x2={`calc(50% + ${item.x}px)`}
                y2={`calc(50% + ${item.y}px)`}
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="text-primary"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: item.delay }}
              />
            ))}
          </svg>

          {/* Floating Integration Nodes */}
          {integrations.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                whileInView={{ opacity: 1, x: item.x, y: item.y, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100, damping: 15, delay: item.delay }}
                className="absolute z-10"
              >
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
                  className="flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className={`w-16 h-16 rounded-2xl ${item.bg} border border-background shadow-lg flex items-center justify-center group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Icon className={`w-7 h-7 ${item.color}`} />
                  </div>
                  <span className="text-[11px] font-bold text-muted-foreground group-hover:text-foreground transition-colors px-3 py-1 bg-background/80 backdrop-blur rounded-full border shadow-sm">
                    {item.label}
                  </span>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
