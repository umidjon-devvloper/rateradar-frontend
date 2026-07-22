import { useState, useEffect, useRef } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Sparkles,
  Star,
  Download,
  Loader2,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
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
import { useFormatPrice, cn } from '@/lib/utils';
import { getCache, setCache } from '@/lib/clientCache';

export default function Dashboard() {
  const t = useT();
  const lang = useLang((s) => s.lang);
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
  // Tahlil panelini yig'ib qo'yish — holat eslab qolinadi
  const [otaAdviceCollapsed, setOtaAdviceCollapsed] = useState(
    () => localStorage.getItem('rr_ota_advice_collapsed') === '1'
  );
  const toggleOtaAdvice = () => {
    setOtaAdviceCollapsed((p) => {
      localStorage.setItem('rr_ota_advice_collapsed', p ? '0' : '1');
      return !p;
    });
  };

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

  // Narx prognozi — davr tanlanadi (7/14/30 kun), keshlangan
  const [chartDays, setChartDays] = useState(14);
  useEffect(() => {
    if (!hotel?._id) return;
    const key = `forecast:${hotel._id}:${chartDays}`;
    const cached = getCache(key, 6 * 3600_000);
    if (cached) setForecast(cached);
    pricesApi
      .rateShopper(chartDays, 'all')
      .then((f) => {
        setForecast(f);
        setCache(key, f);
      })
      .catch(() => {});
  }, [hotel?._id, chartDays]);

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

  const L = (uz, ru, en) => (lang === 'uz' ? uz : lang === 'ru' ? ru : en);

  // ── RateRadar Score (0-100) — kompozit ball, 3 vaznli komponent ──
  // Narx raqobati (50%): bozor o'rtachasiga yaqinlik; Reyting (30%); Kanal qamrovi (20%).
  const priceScore = myPrice > 0 && avgPrice > 0
    ? Math.max(0, Math.round(100 - Math.min(100, (Math.abs(myPrice - avgPrice) / avgPrice) * 200)))
    : 0;
  const ratingScore = hotel?.rating ? Math.round((hotel.rating / 5) * 100) : 0;
  const channelsWithPrice = (otaAdvice?.channels || []).filter((c) => c.currentPrice > 0).length;
  const channelScore = Math.min(100, Math.round((channelsWithPrice / 6) * 100));
  const radarScore = Math.round(priceScore * 0.5 + ratingScore * 0.3 + channelScore * 0.2);
  const grade = radarScore >= 80
    ? { label: L("A'lo", 'Отлично', 'Excellent'), cls: 'bg-emerald-500/15 text-emerald-400' }
    : radarScore >= 60
    ? { label: L('Yaxshi', 'Хорошо', 'Good'), cls: 'bg-sky-500/15 text-sky-400' }
    : radarScore >= 40
    ? { label: L("O'rtacha", 'Средне', 'Average'), cls: 'bg-amber-500/15 text-amber-400' }
    : { label: L('Past', 'Низко', 'Low'), cls: 'bg-rose-500/15 text-rose-400' };

  // Kanal qamrovi donut — raqiblarning qaysi kanallarda narxi borligi
  const CHANNEL_META = {
    bookingcom: { name: 'Booking.com', color: '#1a56db' },
    agoda: { name: 'Agoda', color: '#e11d48' },
    expedia: { name: 'Expedia', color: '#ca8a04' },
    hotelscom: { name: 'Hotels.com', color: '#dc2626' },
    tripcom: { name: 'Trip.com', color: '#0284c7' },
    google: { name: 'Google', color: '#16a34a' },
  };
  const channelDonut = (() => {
    const counts = {};
    competitors.forEach((c) => {
      Object.entries(c.latestPrices || {}).forEach(([k, v]) => {
        if (v > 0) counts[k] = (counts[k] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([k, v]) => ({
        name: CHANNEL_META[k]?.name || k,
        value: v,
        color: CHANNEL_META[k]?.color || '#94a3b8',
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  })();

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

      {/* ═══ SCORE BAND — qora lenta: kompozit ball + vaznli komponentlar ═══ */}
      <div className="rounded-2xl bg-slate-900 dark:bg-slate-950 text-slate-100 p-5 lg:p-6 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Chap: aylana ball + daraja */}
          <div className="flex items-center gap-5 min-w-0 lg:w-[330px] shrink-0">
            <ScoreGauge value={radarScore} />
            <div className="min-w-0">
              <div className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                RateRadar Score™
              </div>
              <span className={cn('inline-block mt-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold', grade.cls)}>
                {grade.label}
              </span>
              <div className="text-xs text-slate-400 mt-2 truncate">
                {hotel?.name}{hotel?.city ? ` · ${hotel.city}` : ''}
              </div>
              {hotel?.rating > 0 && (
                <div className="inline-flex items-center gap-1 text-xs text-yellow-400 mt-1">
                  <Star className="h-3 w-3 fill-current" />
                  {hotel.rating.toFixed(1)}
                  {hotel.reviewCount > 0 && (
                    <span className="text-slate-500">({hotel.reviewCount})</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* O'ng: 3 vaznli sub-ball kartalar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            <SubScore
              label={L('Narx raqobati', 'Ценовая конкуренция', 'Price competitiveness')}
              value={priceScore} weight="50%" barCls="bg-emerald-400"
              weightText={L('vazn', 'вес', 'weight')}
            />
            <SubScore
              label={L('Reyting', 'Рейтинг', 'Rating')}
              value={ratingScore} weight="30%" barCls="bg-sky-400"
              weightText={L('vazn', 'вес', 'weight')}
            />
            <SubScore
              label={L('Kanal qamrovi', 'Охват каналов', 'Channel coverage')}
              value={channelScore} weight="20%" barCls="bg-violet-400"
              weightText={L('vazn', 'вес', 'weight')}
            />
          </div>
        </div>

        {/* Yangilash qatori */}
        {hotel && (
          <div className="relative mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
            <Button
              onClick={refreshAllFromSerpApi}
              disabled={refreshing}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {refreshing ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5 mr-1.5" />
              )}
              {refreshing ? t('refreshing') : t('refreshSerpApi')}
            </Button>
            {refreshResult && (
              <div className="text-xs text-emerald-400 inline-flex items-center gap-1.5">
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
              <div className="text-xs text-rose-400">⚠ {refreshError}</div>
            )}
          </div>
        )}
      </div>

      {/* ═══ KPI KARTALAR — rangli top-border, ikonka o'ngda ═══ */}
      {hotel && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard color="emerald" icon={DollarSign}
            label={t('myPrice')}
            value={myPrice > 0 ? formatPrice(myPrice) : '—'}
            sub={t('bookingPerNight')} />
          <KpiCard color="sky" icon={TrendingUp}
            label={t('avgPrice')}
            value={avgPrice > 0 ? formatPrice(avgPrice) : '—'}
            sub={`${competitors.length} ${t('nCompetitors')}`}
            delta={myPrice && avgPrice ? (myPrice > avgPrice ? 'high' : myPrice < avgPrice ? 'low' : null) : null} />
          <KpiCard color="amber" icon={Users}
            label={t('competitorsTracked')}
            value={competitors.length}
            sub="300m" />
          <KpiCard color="violet" icon={TrendingDown}
            label={t('yourPosition')}
            value={`#${yourRank}/${totalHotels}`}
            sub={t('byPrice')} />
        </div>
      )}

      {/* ═══ AI TAVSIYA — HAR BIR OTA KANALI UCHUN ═══
          Raqiblarning aynan shu kanaldagi narxlari tahlil qilinib,
          har kanalga aniq narx tavsiya qilinadi (Gemini, 6h kesh). */}
      {(otaAdvice?.channels?.length > 0 || otaAdviceLoading) && (
        <Card variant="glass" className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {lang === 'uz' ? 'AI tavsiya — har bir OTA uchun' : lang === 'ru' ? 'AI совет — для каждого OTA' : 'AI advice — per OTA channel'}
              </CardTitle>
              <div className="flex items-center gap-2">
                {/* Tahlilni yig'ish/ochish */}
                <Button size="sm" variant="outline" onClick={toggleOtaAdvice}>
                  {otaAdviceCollapsed
                    ? <><ChevronDown className="h-3.5 w-3.5 mr-1" />{lang === 'uz' ? 'Ochish' : lang === 'ru' ? 'Развернуть' : 'Expand'}</>
                    : <><ChevronUp className="h-3.5 w-3.5 mr-1" />{lang === 'uz' ? "Yig'ish" : lang === 'ru' ? 'Свернуть' : 'Collapse'}</>}
                </Button>
                <Button size="sm" onClick={() => loadOtaAdvice(true)} disabled={otaAdviceLoading}>
                  {otaAdviceLoading
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <><Sparkles className="h-3.5 w-3.5 mr-1.5" />{lang === 'uz' ? 'AI tahlil' : lang === 'ru' ? 'AI анализ' : 'AI analyze'}</>}
                </Button>
              </div>
            </div>
            {!otaAdviceCollapsed && otaAdvice?.summary && (
              <p className="text-xs text-muted-foreground mt-1">
                <b>{lang === 'uz' ? 'Umumiy xulosa' : lang === 'ru' ? 'Общий вывод' : 'Summary'}:</b> {otaAdvice.summary}
              </p>
            )}
          </CardHeader>
          {!otaAdviceCollapsed && (
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
          )}
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
          <div className="flex items-center gap-2">
            {/* Davr tanlagich — 7/14/30 kun */}
            <div className="flex items-center gap-1">
              {[7, 14, 30].map((d) => (
                <button key={d} onClick={() => setChartDays(d)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors',
                    chartDays === d
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'text-muted-foreground border-border hover:text-foreground'
                  )}>
                  {d}D
                </button>
              ))}
            </div>
            <Badge variant="outline" className="text-[10px] gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </Badge>
          </div>
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

        {/* Kanal qamrovi donut — raqib narxlari qaysi kanallardan kelgani */}
        {channelDonut.length > 0 && (
          <Card variant="glass" className="sm:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-primary" />
                {L('Kanallar bo\'yicha qamrov', 'Охват по каналам', 'Coverage by channel')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={channelDonut} dataKey="value" nameKey="name"
                      innerRadius={45} outerRadius={65} paddingAngle={2} strokeWidth={0}>
                      {channelDonut.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <ReTooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px', fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-xl font-bold tabular-nums">{competitorPrices.length}</div>
                  <div className="text-[9px] text-muted-foreground uppercase">{t('nCompetitors')}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center">
                {channelDonut.map((d, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
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

// ═══ Score band elementlari (reference-dizayn) ═══

// Aylana ball ko'rsatkichi — gradient halqa, markazda katta raqam
function ScoreGauge({ value = 0, size = 112 }) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r}
          stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <defs>
          <linearGradient id="rrScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r}
          stroke="url(#rrScoreGrad)" strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-4xl font-extrabold tabular-nums text-white">
        {value}
      </div>
    </div>
  );
}

// Qora lentadagi vaznli sub-ball kartasi
function SubScore({ label, value, weight, weightText, barCls }) {
  return (
    <div className="rounded-xl bg-white/[0.06] border border-white/10 px-4 py-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-slate-300 font-medium truncate">{label}</span>
        <span className="text-xl font-bold tabular-nums">{value}</span>
      </div>
      <div className="mt-2.5 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-700', barCls)}
          style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      <div className="text-[10px] text-slate-500 mt-1.5">{weight} {weightText}</div>
    </div>
  );
}

// Oq KPI karta — rangli top-border, ikonka o'ngda
function KpiCard({ color, icon: Icon, label, value, sub, delta }) {
  const topCls = {
    emerald: 'border-t-emerald-500', sky: 'border-t-sky-500',
    amber: 'border-t-amber-500', violet: 'border-t-violet-500',
  }[color] || 'border-t-primary';
  const iconCls = {
    emerald: 'bg-emerald-500/10 text-emerald-600',
    sky: 'bg-sky-500/10 text-sky-600',
    amber: 'bg-amber-500/10 text-amber-600',
    violet: 'bg-violet-500/10 text-violet-600',
  }[color] || 'bg-primary/10 text-primary';
  return (
    <div className={cn('rounded-xl border border-border/60 border-t-4 bg-card p-4 shadow-sm hover:shadow-md transition-shadow', topCls)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground truncate">{label}</div>
          <div className="text-2xl font-bold tracking-tight tabular-nums mt-1 flex items-center gap-1.5">
            {value}
            {delta && (
              <span className={cn('text-sm', delta === 'high' ? 'text-amber-500' : 'text-emerald-500')}>
                {delta === 'high' ? '↑' : '↓'}
              </span>
            )}
          </div>
          {sub && <div className="text-[11px] text-muted-foreground/70 mt-0.5 truncate">{sub}</div>}
        </div>
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', iconCls)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
