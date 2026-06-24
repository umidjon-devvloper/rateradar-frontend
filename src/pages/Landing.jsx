import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Sparkles,
  MessageSquare,
  MapPin,
  Bell,
  Layers,
  ArrowRight,
  Check,
  Building2,
  BarChart3,
  Zap,
  QrCode,
  Send,
  ConciergeBell,
  Languages,
  Utensils,
  Car,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PublicNavbar } from '@/components/PublicNavbar';
import { SupportChat } from '@/components/SupportChat';
import { PaymentModal } from '@/components/PaymentModal';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/motion';
import CountUp from '@/components/ui/CountUp';
import { useT } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { Logo } from '@/components/Logo';

// Bo'lim ustidagi kichik yorliq (premium SaaS uslubi — limon nuqta bilan)
function Eyebrow({ children }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[11px] font-semibold uppercase tracking-wider text-primary mb-4">
      <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
      {children}
    </div>
  );
}

export default function Landing() {
  const t = useT();
  const navigate = useNavigate();
  const isAuthenticated = useAuth((s) => s.isAuthenticated());
  const [payPlan, setPayPlan] = useState(null); // { id, name, priceUzs }

  const features = [
    { icon: TrendingUp, title: t('feature1Title'), desc: t('feature1Desc') },
    { icon: Sparkles, title: t('feature2Title'), desc: t('feature2Desc') },
    { icon: MessageSquare, title: t('feature3Title'), desc: t('feature3Desc') },
    { icon: MapPin, title: t('feature4Title'), desc: t('feature4Desc') },
    { icon: Bell, title: t('feature5Title'), desc: t('feature5Desc') },
    { icon: Layers, title: t('feature6Title'), desc: t('feature6Desc') },
  ];

  const steps = [
    { num: '01', title: t('step1Title'), desc: t('step1Desc') },
    { num: '02', title: t('step2Title'), desc: t('step2Desc') },
    { num: '03', title: t('step3Title'), desc: t('step3Desc') },
  ];

  // Narxlar so'mda — backend config/plans.js bilan mos bo'lishi kerak.
  const plans = [
    {
      id: 'free',
      title: t('planFreeTitle'),
      desc: t('planFreeDesc'),
      priceUzs: 0,
      features: [
        t('planFreeFeat1'),
        t('planFreeFeat2'),
        t('planFreeFeat3'),
        t('planFreeFeat4'),
      ],
      cta: t('getStarted'),
      popular: false,
    },
    {
      id: 'starter',
      title: t('planStarterTitle'),
      desc: t('planStarterDesc'),
      priceUzs: 1000, // TEST: vaqtincha 1000 so'm. ASLI: 99000
      features: [
        t('planStarterFeat1'),
        t('planStarterFeat2'),
        t('planStarterFeat3'),
        t('planStarterFeat4'),
      ],
      cta: t('subscribe'),
      popular: true,
    },
    {
      id: 'pro',
      title: t('planProTitle'),
      desc: t('planProDesc'),
      priceUzs: 1000, // TEST: vaqtincha 1000 so'm. ASLI: 199000
      features: [
        t('planProFeat1'),
        t('planProFeat2'),
        t('planProFeat3'),
        t('planProFeat4'),
      ],
      cta: t('subscribe'),
      popular: false,
    },
  ];

  // Mehmonxona xizmati bosqichlari (QR → xizmat → Telegram → hisobot)
  const hsSteps = [
    { icon: QrCode, title: t('hsStep1Title'), desc: t('hsStep1Desc') },
    { icon: Languages, title: t('hsStep2Title'), desc: t('hsStep2Desc') },
    { icon: Send, title: t('hsStep3Title'), desc: t('hsStep3Desc') },
    { icon: BarChart3, title: t('hsStep4Title'), desc: t('hsStep4Desc') },
  ];

  const hsServices = [
    { icon: Sparkles, label: t('hsSvcClean') },
    { icon: Utensils, label: t('hsSvcFood') },
    { icon: Car, label: t('hsSvcTaxi') },
    { icon: Layers, label: t('hsSvcTowel') },
  ];

  // Har bir imkoniyat ikonkasi uchun jonli gradient rang (premium ko'rinish)
  const featureColors = [
    'from-blue-500 to-indigo-600',
    'from-violet-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-cyan-500 to-sky-600',
  ];

  // Hero ostidagi statistika bandi (iRoom uslubida — yirik raqamlar, count-up animatsiya)
  const stats = [
    { num: 6, suffix: '+', label: t('statOta') },
    { num: 300, suffix: 'm', label: t('statRadius') },
    { text: '24/7', label: t('statMonitor') },
    { num: 3, suffix: '', label: t('statLangs') },
  ];

  // Reja tugmasi: Free → ro'yxatdan o'tish; pulli → kirgan bo'lsa to'lov oynasi,
  // aks holda avval login/register sahifasiga.
  function handlePlanCta(p) {
    if (p.id === 'free') return navigate('/register');
    if (!isAuthenticated) return navigate('/register');
    setPayPlan({ id: p.id, name: p.title, priceUzs: p.priceUzs });
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] via-background to-background" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-20 sm:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-10 items-center">
            {/* CHAP — matn */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-card text-xs font-medium text-muted-foreground mb-6 animate-fade-in">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                </span>
                {t('landingTagline')}
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-[4.2rem] font-extrabold tracking-tight leading-[0.98]">
                {t('heroT1')}{' '}
                <span className="inline-block bg-lime-300 text-neutral-900 px-3 pb-1 rounded-xl box-decoration-clone -rotate-1">
                  {t('heroHi')}
                </span>
              </h1>

              <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {t('landingSub')}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button asChild size="xl" className="rounded-full">
                  <Link to="/register" className="flex items-center gap-2">
                    {t('ctaPrimary')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="xl" variant="outline" className="rounded-full">
                  <a href="#features">{t('ctaSecondary')}</a>
                </Button>
              </div>

              <p className="mt-6 text-xs text-muted-foreground">{t('trustBadge')}</p>
            </div>

            {/* O'NG — dashboard mockup */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
            <div className="relative rounded-xl border bg-card shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent pointer-events-none" />
              {/* Mock browser bar */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b bg-muted/30">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                <div className="ml-3 px-3 py-0.5 text-[11px] text-muted-foreground bg-card rounded-md border">
                  app.thehotelsaas.com/dashboard
                </div>
              </div>

              {/* Mock dashboard content */}
              <div className="p-5 sm:p-7">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                  {[
                    { icon: Building2, label: 'My price', value: '$95', accent: true },
                    { icon: BarChart3, label: 'Avg market', value: '$87' },
                    { icon: TrendingUp, label: 'Position', value: '#3/12' },
                    { icon: Zap, label: 'Competitors', value: '8' },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="rounded-lg border bg-card p-3.5 text-left"
                    >
                      <div
                        className={`w-7 h-7 rounded-md mb-2 flex items-center justify-center ${
                          s.accent
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <s.icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="text-xl font-semibold tracking-tight tabular-nums">
                        {s.value}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mock chart */}
                <div className="rounded-lg border bg-card p-4 text-left">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-medium">Price trend — 7 days</div>
                    <div className="text-[11px] text-muted-foreground">Updated 2h ago</div>
                  </div>
                  <svg
                    viewBox="0 0 600 140"
                    className="w-full h-32"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 80 Q 60 70, 100 65 T 200 50 T 300 55 T 400 35 T 500 40 T 600 25 L 600 140 L 0 140 Z"
                      fill="url(#grad)"
                    />
                    <path
                      d="M 0 80 Q 60 70, 100 65 T 200 50 T 300 55 T 400 35 T 500 40 T 600 25"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                    />
                    <path
                      d="M 0 100 Q 60 95, 100 92 T 200 88 T 300 95 T 400 80 T 500 85 T 600 75"
                      fill="none"
                      stroke="hsl(var(--muted-foreground))"
                      strokeOpacity="0.3"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  </svg>
                  <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-0.5 bg-primary rounded" />
                      My hotel
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-0.5 bg-muted-foreground/50 rounded" />
                      Market avg
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS BAND — iRoom uslubida yirik raqamlar */}
      <section className="border-y bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <StaggerItem key={s.label}>
                <div className="text-4xl sm:text-5xl font-extrabold tracking-tight tabular-nums">
                  {s.text ? s.text : <CountUp value={s.num} suffix={s.suffix} />}
                </div>
                <div className="mt-1.5 text-sm text-muted-foreground">{s.label}</div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 sm:py-28 border-t relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.06] rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/[0.05] rounded-full blur-3xl -z-10" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Reveal className="max-w-2xl mx-auto text-center mb-14">
            <Eyebrow>{t('navFeatures')}</Eyebrow>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              {t('featuresTitle')}
            </h2>
            <p className="mt-4 text-muted-foreground">{t('featuresSub')}</p>
          </Reveal>

          <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <StaggerItem
                key={i}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="group relative bg-card p-7 rounded-2xl border hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 transition-shadow overflow-hidden"
              >
                {/* hover'da paydo bo'luvchi yumshoq gradient fon */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${featureColors[i % featureColors.length]} text-white flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="relative font-semibold text-base mb-2">{f.title}</h3>
                <p className="relative text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-20 sm:py-28 border-t bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl mx-auto text-center mb-14">
            <Eyebrow>{t('navHowItWorks')}</Eyebrow>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              {t('howItWorksTitle')}
            </h2>
          </Reveal>

          <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {steps.map((s, i) => (
              <StaggerItem key={i} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-full w-full h-px bg-gradient-to-r from-border to-transparent -translate-x-6 z-0" />
                )}
                <div className="relative bg-card border rounded-2xl p-7 h-full hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">
                  <div className="text-5xl font-extrabold mb-3 tabular-nums bg-gradient-to-br from-primary to-violet-500 bg-clip-text text-transparent">
                    {s.num}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* HOTEL SERVICE — QR + Telegram */}
      <section id="hotel-service" className="py-20 sm:py-28 border-t">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Chap: matn + bosqichlar */}
            <Reveal>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-card text-xs font-medium text-primary mb-5">
                <ConciergeBell className="h-3.5 w-3.5" />
                {t('hsBadge')}
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                {t('hsTitle')}
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {t('hsSub')}
              </p>

              <div className="mt-8 space-y-5">
                {hsSteps.map((s, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-500 text-white flex items-center justify-center shadow-md shadow-primary/20">
                        <s.icon className="h-5 w-5" />
                      </div>
                      {i < hsSteps.length - 1 && (
                        <div className="absolute left-1/2 top-10 w-px h-5 bg-border -translate-x-1/2" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{s.title}</div>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* O'ng: telefon mockup — QR menyu */}
            <Reveal as="div" delay={0.12} className="relative flex justify-center">
              {/* fon yorug'lik */}
              <div className="absolute inset-0 -z-10 flex items-center justify-center">
                <div className="w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-60" />
              </div>

              <div className="relative w-[280px] rounded-[2.2rem] border-[6px] border-foreground/10 bg-card shadow-2xl overflow-hidden">
                {/* status bar */}
                <div className="h-7 bg-muted/40 flex items-center justify-center">
                  <div className="w-16 h-1.5 rounded-full bg-foreground/15" />
                </div>

                {/* header */}
                <div className="px-5 pt-5 pb-4 text-center border-b">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <div className="text-sm font-semibold">TheHotelSaaS Hotel</div>
                  <div className="text-[11px] text-muted-foreground">Room 204</div>
                </div>

                {/* xizmat menyusi */}
                <div className="px-4 py-4">
                  <div className="text-[11px] font-medium text-muted-foreground mb-2.5">
                    {t('hsMenuTitle')}
                  </div>
                  <div className="space-y-2">
                    {hsServices.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-xl border bg-background px-3 py-2.5"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <s.icon className="h-4 w-4" />
                        </div>
                        <span className="text-[13px] font-medium">{s.label}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
                      </div>
                    ))}
                  </div>

                  {/* Telegram yetkazish indikatori */}
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary/[0.06] border border-primary/15 px-3 py-2.5">
                    <Send className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-[11px] text-muted-foreground">
                      {t('hsStep3Title')}
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 sm:py-28 border-t bg-muted/20 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/[0.05] rounded-full blur-3xl -z-0" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Reveal className="max-w-2xl mx-auto text-center mb-14">
            <Eyebrow>{t('navPricing')}</Eyebrow>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              {t('pricingTitle')}
            </h2>
            <p className="mt-4 text-muted-foreground">{t('pricingSub')}</p>
          </Reveal>

          <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto items-stretch">
            {plans.map((p, i) => (
              <StaggerItem
                key={i}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className={`relative rounded-2xl border p-7 flex flex-col bg-card transition-shadow ${
                  p.popular
                    ? 'border-primary ring-2 ring-primary/40 shadow-2xl shadow-primary/15 lg:scale-105 z-10'
                    : 'hover:shadow-lg'
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-300" />
                    {t('mostPopular')}
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {p.title}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground/70">
                    {p.desc}
                  </div>
                </div>

                <div className="mt-5 flex items-baseline gap-1.5">
                  {p.priceUzs === 0 ? (
                    <span className="text-4xl font-semibold tracking-tight">
                      {t('priceFree')}
                    </span>
                  ) : (
                    <>
                      <span className="text-4xl font-semibold tracking-tight">
                        {p.priceUzs.toLocaleString('uz-UZ')}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {t('currencyUzs')} / {t('perMonth')}
                      </span>
                    </>
                  )}
                </div>

                <ul className="mt-6 space-y-2.5 flex-1">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm">
                      <div className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="mt-7 w-full rounded-full"
                  variant={p.popular ? 'default' : 'outline'}
                  onClick={() => handlePlanCta(p)}
                >
                  {p.cta}
                </Button>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* To'lov oynasi */}
      {payPlan && (
        <PaymentModal plan={payPlan} onClose={() => setPayPlan(null)} />
      )}

      {/* FINAL CTA */}
      <section className="py-20 sm:py-28 border-t relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -z-10" />
        <Reveal className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            {t('ctaFinalTitle')}
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            {t('ctaFinalSub')}
          </p>
          <Button asChild size="xl" className="mt-8 rounded-full">
            <Link to="/register" className='flex items-center gap-3'>
              {t('ctaPrimary')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="border-t bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Reveal as="div" className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Logo />
              <p className="mt-4 text-xs text-muted-foreground max-w-xs leading-relaxed">
                {t('landingTagline')}
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-lime-400" />
                </span>
                {t('statMonitor')}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {t('footerProduct')}
              </div>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                    {t('navFeatures')}
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                    {t('navPricing')}
                  </a>
                </li>
                <li>
                  <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                    {t('login')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {t('footerCompany')}
              </div>
              <ul className="space-y-2 text-sm">
                <li>
                  <a className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    {t('footerAbout')}
                  </a>
                </li>
                <li>
                  <a className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    {t('footerContact')}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {t('footerLegal')}
              </div>
              <ul className="space-y-2 text-sm">
                <li>
                  <a className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    {t('footerTerms')}
                  </a>
                </li>
                <li>
                  <a className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    {t('footerPrivacy')}
                  </a>
                </li>
              </ul>
            </div>
          </Reveal>

          <div className="mt-10 pt-6 border-t text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© 2026 TheHotelSaaS. {t('footerRights')}.</span>
            <span className="flex items-center gap-1.5">
              UzCard · Humo · Visa · Mastercard
            </span>
          </div>
        </div>
      </footer>
      <SupportChat />
    </div>
  );
}
