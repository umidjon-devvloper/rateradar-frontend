import { useState, useEffect, useRef } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Sparkles,
  Building2,
  MapPin,
  Star,
  Download,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CountUp from '@/components/ui/CountUp';
import { Stagger, StaggerItem, Reveal } from '@/components/ui/motion';
import PriceRefreshProgress from '@/components/PriceRefreshProgress';
import InstantSnapshotCard from '@/components/InstantSnapshotCard';
import AiAdvisor from '@/components/AiAdvisor';
import CategoryRatingsCard from '@/components/CategoryRatingsCard';
import { hotelApi, pricesApi, aiApi } from '@/lib/api';
import { useT, useLang } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useFormatPrice, cn } from '@/lib/utils';
import { getCache, setCache } from '@/lib/clientCache';

export default function Dashboard() {
  const t = useT();
  const lang = useLang((s) => s.lang);
  const user = useAuth((s) => s.user);
  const formatPrice = useFormatPrice();
  const { hotel, setHotel } = useOutletContext();
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshResult, setRefreshResult] = useState(null);
  const [refreshError, setRefreshError] = useState('');
  const [forecast, setForecast] = useState(null);
  const [showProgress, setShowProgress] = useState(false);
  // HAR BIR OTA kanali uchun AI narx tavsiyasi (raqiblar tahlili bilan, 6h kesh)
  const [otaAdvice, setOtaAdvice] = useState(null);
  const [otaAdviceLoading, setOtaAdviceLoading] = useState(false);

  const loadOtaAdvice = (refresh = false) => {
    setOtaAdviceLoading(true);
    aiApi.otaAdvice(lang, refresh)
      .then((d) => setOtaAdvice(d))
      .catch(() => {})
      .finally(() => setOtaAdviceLoading(false));
  };

  useEffect(() => {
    if (!hotel?._id) return;
    loadOtaAdvice(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotel?._id]);

  // Raqiblar — keshdan darrov (stale-while-revalidate). Competitors sahifasi
  // bilan bir xil kalit (`competitors:<id>`) — sahifalar orasida o'tishda
  // qayta backendga ketmaydi, kesh ulashiladi.
  useEffect(() => {
    const key = hotel?._id ? `competitors:${hotel._id}` : null;
    const cached = key ? getCache(key, 6 * 3600_000) : null; // 6 soat
    if (cached) {
      setCompetitors(cached);
      setLoading(false);
    }
    hotelApi
      .competitors()
      .then((c) => {
        setCompetitors(c || []);
        if (key) setCache(key, c || []);
      })
      .finally(() => setLoading(false));
  }, [hotel?._id]);

  // 14 kunlik narx prognozi — bizning hotel va bozor o'rtachasi (keshlangan)
  useEffect(() => {
    if (!hotel?._id) return;
    const key = `forecast:${hotel._id}`;
    const cached = getCache(key, 6 * 3600_000);
    if (cached) setForecast(cached);
    pricesApi
      .rateShopper(14, 'all')
      .then((f) => {
        setForecast(f);
        setCache(key, f);
      })
      .catch(() => {});
  }, [hotel?._id]);

  // Grafik ma'lumotlari: har bir kun uchun [data, sizning narx, bozor avg]
  const chartData = (forecast?.columns || []).map((iso) => {
    const d = new Date(iso);
    const monthsUz = ['yan', 'fev', 'mar', 'apr', 'may', 'iyun', 'iyul', 'avg', 'sen', 'okt', 'noy', 'dek'];
    const monthsRu = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const months = lang === 'ru' ? monthsRu : lang === 'en' ? monthsEn : monthsUz;
    const label = `${d.getDate()} ${months[d.getMonth()]}`;
    return {
      date: label,
      mine: forecast?.myHotel?.price || 0,
      market: forecast?.marketAvg?.[iso] || 0,
    };
  });

  // Bitta tugma — SerpAPI orqali o'z mehmonxona + barcha raqiblar uchun
  // BARCHA OTA kanallarini birdaniga yangilaydi. "Mening narxim" Booking.com
  // narxi bilan to'ldiriladi (backend o'zi tanlaydi).
  async function refreshAllFromSerpApi() {
    setRefreshing(true);
    setRefreshError('');
    setRefreshResult(null);
    setShowProgress(true); // jonli animatsiyali panelni ochamiz
    try {
      const res = await pricesApi.refreshAll();
      const updatedHotel = await hotelApi.getMine();
      const updatedComps = await hotelApi.competitors();
      setHotel(updatedHotel);
      setCompetitors(updatedComps || []);
      setRefreshResult({
        ownChannels: res.own.channels,
        ownPrice: updatedHotel?.currentPrice || 0,
        compsMatched: res.competitors.matched,
        compsTotal: res.competitors.total,
      });
    } catch (err) {
      setRefreshError(err.response?.data?.error || err.message || t('refreshError'));
    } finally {
      setRefreshing(false);
    }
  }

  // ── Avto narx yangilash — faqat BIRINCHI MARTA ──
  // Hotel hali hech qachon yangilanmagan bo'lsa (lastPriceRefreshedAt yo'q),
  // kirganda bir marta o'zi ishga tushadi (onboarding tajribasi). Undan keyin
  // FAQAT foydalanuvchi "Yangilash" tugmasini bosganda yangilanadi — har
  // kirishda avto-yangilanib SerpAPI/proxy xarajatini oshirmasin.
  const autoRefreshedRef = useRef(null);
  useEffect(() => {
    if (!hotel?._id || refreshing) return;
    // Har hotel uchun bu sessiyada faqat bir marta avto-trigger (qayta render'da emas).
    if (autoRefreshedRef.current === hotel._id) return;
    if (hotel.lastPriceRefreshedAt) return; // allaqachon yangilangan — faqat qo'lda
    autoRefreshedRef.current = hotel._id; // takror ishga tushmasin
    refreshAllFromSerpApi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotel?._id, hotel?.lastPriceRefreshedAt]);

  // Real Booking.com narxlari: competitor.latestPrices.bookingcom (Apify cron + refresh).
  // Narx yo'q raqiblar hisob-kitobdan o'tkazib yuboriladi (mock yo'q).
  const myPrice = hotel?.currentPrice || 0;
  const competitorPrices = competitors
    .map((c) => {
      const lp = c.latestPrices || {};
      const price =
        lp.bookingcom || lp.booking || lp.agoda || lp.expedia ||
        lp.hotelscom || lp.tripcom || 0;
      return { ...c, price };
    })
    .filter((c) => c.price > 0);

  const avgPrice = competitorPrices.length
    ? Math.round(competitorPrices.reduce((s, c) => s + c.price, 0) / competitorPrices.length)
    : 0;
  const cheapest = competitorPrices.reduce(
    (min, c) => (!min || c.price < min.price ? c : min),
    null
  );
  const expensive = competitorPrices.reduce(
    (max, c) => (!max || c.price > max.price ? c : max),
    null
  );

  const cheaperCount = myPrice > 0
    ? competitorPrices.filter((c) => c.price < myPrice).length
    : 0;
  const yourRank = cheaperCount + 1;
  const totalHotels = competitorPrices.length + 1;
  const hasRealPrices = competitorPrices.length > 0;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* "Aha moment" — bepul Xotelo narx tahlili (avtomatik) */}
      <InstantSnapshotCard />

      {!loading && competitors.length > 0 && !hasRealPrices && (
        <Card className="border-amber-200 dark:border-amber-800/50 bg-amber-50/40 dark:bg-amber-950/20">
          <CardContent className="py-3 px-4 text-sm">
            <div className="font-medium text-amber-800 dark:text-amber-200">
              {t('realPricesNotCollected')}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hero / Welcome with hotel card */}
      <div className="rounded-2xl glass-strong ring-premium p-5 lg:p-6 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            {hotel?.photoUrl ? (
              <img
                src={hotel.photoUrl}
                alt={hotel.name}
                className="w-14 h-14 rounded-xl object-cover shrink-0 border"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 text-lg font-bold">
                {hotel?.name?.charAt(0).toUpperCase() || '🏨'}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight truncate">
                {t('welcome')}, {user?.name?.split(' ')[0]} 👋
              </h1>
              {hotel ? (
                <>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium text-sm">{hotel.name}</span>
                    {hotel.stars > 0 && (
                      <span className="inline-flex items-center gap-0.5 ml-1">
                        {Array.from({ length: hotel.stars }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </span>
                    )}
                    {hotel.rating > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded-md ml-1">
                        <Star className="h-2.5 w-2.5 fill-current" />
                        {hotel.rating.toFixed(1)}
                        {hotel.reviewCount > 0 && (
                          <span className="text-muted-foreground">({hotel.reviewCount})</span>
                        )}
                      </span>
                    )}
                  </div>
                  {hotel.city && (
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {[hotel.city, hotel.country].filter(Boolean).join(', ')}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground mt-1">
                  Hotel ma'lumotlari yuklanmoqda...
                </div>
              )}
            </div>
          </div>

          {hotel && (
            /* Ixcham 4 mini-stat — katta kartalar o'rniga hero ichida, o'ngda */
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 shrink-0">
              <MiniStat
                label={t('myPrice')}
                value={hotel.currentPrice > 0 ? formatPrice(hotel.currentPrice) : '—'}
                sub={t('bookingPerNight')}
                accent
              />
              <MiniStat
                label={t('avgPrice')}
                value={avgPrice > 0 ? formatPrice(avgPrice) : '—'}
                sub={`${competitors.length} ${t('nCompetitors')}`}
                delta={myPrice && avgPrice ? (myPrice > avgPrice ? 'high' : myPrice < avgPrice ? 'low' : null) : null}
              />
              <MiniStat
                label={t('competitorsTracked')}
                value={competitors.length}
                sub="300m"
              />
              <MiniStat
                label={t('yourPosition')}
                value={`#${yourRank}/${totalHotels}`}
                sub={t('byPrice')}
              />
            </div>
          )}
        </div>

        {/* Bitta SerpAPI yangilash tugmasi — hammasi (own + raqiblar + kanallar) */}
        {hotel && (
          <div className="mt-4 pt-4 border-t border-border/60 flex flex-wrap items-center gap-3">
            <Button
              onClick={refreshAllFromSerpApi}
              disabled={refreshing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {refreshing ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5 mr-1.5" />
              )}
              {refreshing ? t('refreshing') : t('refreshSerpApi')}
            </Button>
            {refreshResult && (
              <div className="text-xs text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>
                  {t('myPriceLabel')}: {refreshResult.ownPrice > 0 ? formatPrice(refreshResult.ownPrice) : '—'}
                  {' · '}
                  {t('competitorsTotalShort')}: {refreshResult.compsMatched}/{refreshResult.compsTotal}
                  {' · '}
                  {refreshResult.ownChannels} {t('channelsCount')}
                </span>
              </div>
            )}
            {refreshError && (
              <div className="text-xs text-rose-600">⚠ {refreshError}</div>
            )}
          </div>
        )}

      </div>

      {/* ═══ AI TAVSIYA — HAR BIR OTA KANALI UCHUN ═══
          Raqiblarning aynan shu kanaldagi narxlari tahlil qilinib,
          har kanalga aniq narx tavsiya qilinadi (Gemini, 6h kesh). */}
      {(otaAdvice?.channels?.length > 0 || otaAdviceLoading) && (
        <Card variant="glass" className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-lg">🤖</span>
                {lang === 'uz' ? 'AI tavsiya — har bir OTA uchun' : lang === 'ru' ? 'AI совет — для каждого OTA' : 'AI advice — per OTA channel'}
                {otaAdvice?.asOf && (
                  <span className="text-[11px] font-normal text-muted-foreground">
                    {new Date(otaAdvice.asOf).toLocaleString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    {' · Gemini AI'}
                  </span>
                )}
              </CardTitle>
              <Button size="sm" onClick={() => loadOtaAdvice(true)} disabled={otaAdviceLoading}>
                {otaAdviceLoading
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <><Sparkles className="h-3.5 w-3.5 mr-1.5" />{lang === 'uz' ? 'AI tahlil' : lang === 'ru' ? 'AI анализ' : 'AI analyze'}</>}
              </Button>
            </div>
            {otaAdvice?.summary && (
              <p className="text-xs text-muted-foreground mt-1">
                <b>{lang === 'uz' ? 'Umumiy xulosa' : lang === 'ru' ? 'Общий вывод' : 'Summary'}:</b> {otaAdvice.summary}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-2.5">
            {(otaAdvice?.channels || []).map((c, i) => {
              const actionCfg = c.action === 'raise'
                ? { label: lang === 'uz' ? '⬆ Ko\'tarish' : lang === 'ru' ? '⬆ Поднять' : '⬆ Raise', cls: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' }
                : c.action === 'lower'
                ? { label: lang === 'uz' ? '⬇ Tushirish' : lang === 'ru' ? '⬇ Снизить' : '⬇ Lower', cls: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400' }
                : { label: lang === 'uz' ? '✓ Saqlash' : lang === 'ru' ? '✓ Оставить' : '✓ Keep', cls: 'bg-muted text-muted-foreground' };
              return (
                <div key={i} className="rounded-xl border bg-card/60 p-3.5">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-baseline gap-2.5 flex-wrap">
                      <span className="font-bold text-sm">{c.channel}</span>
                      {c.currentPrice > 0 && (
                        <span className="text-sm text-muted-foreground tabular-nums">${c.currentPrice}</span>
                      )}
                      {c.suggestedPrice > 0 && (
                        <>
                          <span className="text-muted-foreground text-xs">→</span>
                          <span className="text-base font-bold text-primary tabular-nums">${c.suggestedPrice}</span>
                        </>
                      )}
                      {c.delta !== 0 && c.suggestedPrice > 0 && (
                        <span className={cn('text-xs font-semibold tabular-nums', c.delta > 0 ? 'text-emerald-600' : 'text-rose-600')}>
                          {c.delta > 0 ? '+' : ''}${c.delta}/{lang === 'ru' ? 'ночь' : lang === 'uz' ? 'kecha' : 'night'}
                        </span>
                      )}
                    </div>
                    <span className={cn('text-[11px] font-semibold px-2.5 py-1 rounded-full', actionCfg.cls)}>
                      {actionCfg.label}
                    </span>
                  </div>
                  {c.reason && (
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{c.reason}</p>
                  )}
                  {c.stats && (
                    <p className="text-[11px] text-muted-foreground/70 mt-1 font-mono">
                      {lang === 'uz' ? 'raqiblar' : lang === 'ru' ? 'конкуренты' : 'competitors'}: ${c.stats.min} – ${c.stats.max} (median ${c.stats.median})
                      {c.stats.rank && <> · {lang === 'uz' ? `siz ${c.stats.rank}-o'rin / ${c.stats.total}` : lang === 'ru' ? `вы ${c.stats.rank}-е место / ${c.stats.total}` : `you rank ${c.stats.rank} / ${c.stats.total}`}</>}
                    </p>
                  )}
                </div>
              );
            })}
            {otaAdviceLoading && !otaAdvice?.channels?.length && (
              <div className="py-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {lang === 'uz' ? 'Har bir kanal tahlil qilinmoqda...' : lang === 'ru' ? 'Анализ каждого канала...' : 'Analyzing each channel...'}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Jonli narx yangilash progress — animatsiyali */}
      <PriceRefreshProgress open={showProgress} onClose={() => setShowProgress(false)} />

      {/* Narx prognozi + eng arzon/qimmat raqib — yonma-yon (ixcham, premium) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 14 kunlik narx prognozi grafigi — 2/3 */}
      <Card variant="glass" className="overflow-hidden lg:col-span-2">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {t('priceComparisonTitle')}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {t('priceForecastSubtitle')}
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </Badge>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
              {t('loading')}
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
                  <defs>
                    <linearGradient id="mineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="marketGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#94a3b8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.4)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    width={64}
                    tickFormatter={(v) => formatPrice(v)}
                  />
                  <ReTooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                    formatter={(v, name) => [formatPrice(v), name === 'mine' ? t('myPriceLabel') : t('avgMarket')]}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                    formatter={(v) => v === 'mine' ? (hotel?.name || t('myPriceLabel')) : t('avgMarket')}
                  />
                  <Area
                    type="monotone"
                    dataKey="mine"
                    name="mine"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    fill="url(#mineGrad)"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="market"
                    name="market"
                    stroke="#64748b"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fill="url(#marketGrad)"
                    dot={false}
                    activeDot={{ r: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Eng arzon / eng qimmat raqib — grafik yonidagi o'ng ustun */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
        <Card variant="glass" className="hover-lift">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-success" />
              {t('cheapestCompetitor')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cheapest ? (
              <>
                <div className="text-2xl font-semibold tracking-tight">
                  {formatPrice(cheapest.price)}
                </div>
                <div className="text-sm text-muted-foreground mt-1 truncate">
                  {cheapest.name}
                </div>
                <Badge variant="success" className="mt-3">
                  {t('pricedBelowYou')} {Math.round(((myPrice - cheapest.price) / myPrice) * 100)}% {t('cheaperBy')}
                </Badge>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">{t('noData')}</div>
            )}
          </CardContent>
        </Card>

        <Card variant="glass" className="hover-lift">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-warning" />
              {t('expensiveCompetitor')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expensive ? (
              <>
                <div className="text-2xl font-semibold tracking-tight">
                  {formatPrice(expensive.price)}
                </div>
                <div className="text-sm text-muted-foreground mt-1 truncate">
                  {expensive.name}
                </div>
                <Badge variant="warning" className="mt-3">
                  {t('pricedBelowYou')} {Math.round(((expensive.price - myPrice) / myPrice) * 100)}% {t('expensiveBy')}
                </Badge>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">{t('noData')}</div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>

      {/* Booking.com kategoriya reytinglari (Tozalik, Joylashuv, Xizmat...) —
          HasData yoki jonli skreyper orqali. */}
      <CategoryRatingsCard hotelId={hotel?._id} />

      {/* AI Maslahatchi — narx/statistikaga qarab tavsiyalar (xizmat qo'shish,
          hotel-service'ga ulanish va h.k.). Competitors sahifasi bilan bir xil
          kesh kalitidan (`ai:<id>:<lang>`) foydalanadi. */}
      <AiAdvisor hotel={hotel} />

    </div>
  );
}

function StatCard({ icon: Icon, label, value, count, format, sub, delta, accent }) {
  return (
    <Card variant="glass" className="hover-lift h-full">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-1.5">
          <motion.div
            whileHover={{ rotate: -8, scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center ring-1',
              accent === 'primary'
                ? 'bg-primary/15 text-primary ring-primary/20'
                : 'bg-muted text-muted-foreground ring-border/60'
            )}
          >
            <Icon className="h-4 w-4" />
          </motion.div>
          {delta && (
            <Badge variant={delta === 'high' ? 'warning' : 'success'} className="text-[10px]">
              {delta === 'high' ? '↑' : '↓'}
            </Badge>
          )}
        </div>
        <div className="text-2xl font-semibold tracking-tight tabular-nums">
          {typeof count === 'number'
            ? <CountUp value={count} format={format || ((n) => Math.round(n).toLocaleString())} />
            : value}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
        {sub && <div className="text-[11px] text-muted-foreground/70 mt-0.5">{sub}</div>}
      </CardContent>
    </Card>
  );
}

// Hero ichidagi IXCHAM stat — katta StatCard'larning kichik varianti
function MiniStat({ label, value, sub, delta, accent }) {
  return (
    <div className={cn(
      'rounded-xl px-3.5 py-2.5 min-w-[118px] border',
      accent
        ? 'bg-primary/5 border-primary/20'
        : 'bg-card/60 border-border/60'
    )}>
      <div className="text-[9px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
        {label}
        {delta && (
          <span className={delta === 'high' ? 'text-amber-500' : 'text-emerald-500'}>
            {delta === 'high' ? '↑' : '↓'}
          </span>
        )}
      </div>
      <div className="text-lg font-bold tracking-tight tabular-nums leading-tight mt-0.5">
        {value}
      </div>
      {sub && <div className="text-[9px] text-muted-foreground/70 truncate">{sub}</div>}
    </div>
  );
}
