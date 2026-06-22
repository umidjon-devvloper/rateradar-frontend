import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Star, MapPin, RefreshCw, Loader2, Building2, Download, Tag,
  TrendingUp, TrendingDown, BarChart3,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CompetitorMap from '@/components/CompetitorMap';
import { hotelApi, pricesApi } from '@/lib/api';
import { useT, useLang } from '@/lib/i18n';
import { useFormatPrice, cn } from '@/lib/utils';
import { getCache, setCache } from '@/lib/clientCache';

function getCompPrice(c) {
  const m = c.latestPrices;
  if (!m) return 0;
  const get = (k) => m.get?.(k) ?? m[k] ?? 0;
  return get('bookingcom') || get('booking') || get('agoda') ||
         get('expedia') || get('hotelscom') || get('tripcom') || 0;
}

export default function RatingMap() {
  const t = useT();
  const lang = useLang((s) => s.lang);
  const formatPrice = useFormatPrice();
  const { hotel, setHotel } = useOutletContext();
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [sortBy, setSortBy] = useState('price'); // 'price' | 'rating'
  const [catRatings, setCatRatings] = useState(null);
  const [catLoading, setCatLoading] = useState(true);

  async function loadCategoryRatings(refresh = false) {
    const key = hotel?._id ? `catRatings:${hotel._id}` : null;
    // refresh=true bo'lsa keshni e'tiborsiz qoldiramiz (qayta hisoblash).
    const cached = !refresh && key ? getCache(key, 12 * 3600_000) : null; // 12 soat
    if (cached) { setCatRatings(cached); setCatLoading(false); } else { setCatLoading(true); }
    try {
      const res = await hotelApi.categoryRatings(refresh);
      setCatRatings(res);
      if (key) setCache(key, res);
    } catch (err) {
      console.warn('Kategoriya reytinglari yuklanmadi:', err.message);
      if (!cached) setCatRatings({ configured: false, categories: [] });
    } finally {
      setCatLoading(false);
    }
  }

  // Raqiblar — Dashboard/Competitors bilan bir xil kesh kaliti (`competitors:<id>`).
  async function load() {
    const key = hotel?._id ? `competitors:${hotel._id}` : null;
    const cached = key ? getCache(key, 6 * 3600_000) : null; // 6 soat
    if (cached) { setCompetitors(cached); setLoading(false); } else { setLoading(true); }
    try {
      const list = await hotelApi.competitors();
      setCompetitors(list || []);
      if (key) setCache(key, list || []);
    } catch (err) {
      console.warn('Raqiblar yuklanmadi:', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function scan() {
    setScanning(true);
    try {
      await pricesApi.refreshAll();
      const fresh = await hotelApi.getMine();
      setHotel(fresh);
      await load();
    } catch (err) {
      console.warn('Skanerlash xato:', err.message);
    } finally {
      setScanning(false);
    }
  }

  useEffect(() => { load(); loadCategoryRatings(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [hotel?._id]);

  // Narxli raqiblar
  const compsWithPrice = useMemo(
    () => competitors
      .map((c) => ({ ...c, _price: getCompPrice(c) }))
      .filter((c) => c._price > 0),
    [competitors]
  );

  const myPrice = hotel?.currentPrice || 0;
  const myRatingRaw = hotel?.rating || 0;
  const myRating10 = myRatingRaw <= 5 ? myRatingRaw * 2 : myRatingRaw;

  const avgPrice = compsWithPrice.length
    ? Math.round(compsWithPrice.reduce((s, c) => s + c._price, 0) / compsWithPrice.length)
    : 0;

  const cheapest = compsWithPrice.reduce(
    (min, c) => (!min || c._price < min._price ? c : min), null
  );
  const expensive = compsWithPrice.reduce(
    (max, c) => (!max || c._price > max._price ? c : max), null
  );

  const allPrices = myPrice > 0
    ? [myPrice, ...compsWithPrice.map((c) => c._price)]
    : compsWithPrice.map((c) => c._price);
  const minPrice = allPrices.length ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length ? Math.max(...allPrices) : 0;

  const totalHotels = compsWithPrice.length + (myPrice > 0 ? 1 : 0);
  const cheaperCount = compsWithPrice.filter((c) => c._price < myPrice).length;
  const myRank = cheaperCount + 1;

  const diffVsAvg = avgPrice > 0 ? myPrice - avgPrice : 0;
  const diffPct = avgPrice > 0 ? Math.round((diffVsAvg / avgPrice) * 100) : 0;
  const pinPct = maxPrice > minPrice
    ? ((myPrice - minPrice) / (maxPrice - minPrice)) * 100
    : 50;

  const sortedComps = useMemo(() => {
    return [...compsWithPrice].sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return a._price - b._price;
    });
  }, [compsWithPrice, sortBy]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">
            {hotel?.name ? `${hotel.name} — ${t('marketPosition')}` : t('ratingMapTitle')}
          </h1>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {[hotel?.city, hotel?.country].filter(Boolean).join(', ')}
            </span>
            <span>
              🏨 <b className="text-foreground">{totalHotels}</b> {t('competitor').toLowerCase()}
            </span>
            {compsWithPrice.length > 0 && (
              <span>
                📊 {t('marketAvg')}: <b className="text-foreground">{formatPrice(avgPrice)}</b>
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={scan}
            disabled={scanning || loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {scanning ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Download className="h-3.5 w-3.5 mr-1.5" />}
            {scanning ? t('refreshing') : t('scanWithSerpApi')}
          </Button>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={cn('h-3.5 w-3.5 mr-1.5', loading && 'animate-spin')} />
            {t('refresh')}
          </Button>
        </div>
      </div>

      {/* Xarita + Category Ratings (rasm bo'yicha yonma-yon) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Xarita — raqiblar shahar bo'ylab joylashuvi (2 ustun) */}
        <Card variant="glass" className="lg:col-span-2 overflow-hidden">
          <div className="px-5 py-3 border-b flex items-center justify-between">
            <div className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {t('locationMap') || 'Xarita'}
            </div>
            <span className="text-[11px] text-muted-foreground">
              {competitors.length} {t('competitor').toLowerCase()}
            </span>
          </div>
          <CardContent className="p-3">
            <CompetitorMap
              hotel={hotel}
              competitors={competitors}
              myStars={hotel?.stars || 0}
              onSelectComp={() => {}}
            />
          </CardContent>
        </Card>

        {/* Category Ratings (1 ustun) */}
        <CategoryRatingsPanel
          data={catRatings}
          loading={catLoading}
          onRefresh={() => loadCategoryRatings(true)}
          t={t}
          lang={lang}
        />
      </div>

      {/* 4 ta stat kartochka */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* My price (accent) */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-900">
          <CardContent className="pt-5 pb-4">
            <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Tag className="h-4 w-4 text-white" />
            </div>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-300">
              {t('myPriceLabel')}
            </div>
            <div className="mt-2 text-3xl font-bold tabular-nums tracking-tight">
              {myPrice > 0 ? formatPrice(myPrice) : '—'}
            </div>
            <div className="mt-1 text-xs text-slate-300">
              {diffPct > 0 ? `${diffPct}% ${t('expensiveBy')}` :
               diffPct < 0 ? `${Math.abs(diffPct)}% ${t('cheaperBy')}` :
               t('market')}
            </div>
          </CardContent>
        </Card>

        {/* Avg */}
        <Card variant="glass" className="relative overflow-hidden">
          <CardContent className="pt-5 pb-4">
            <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              {t('avgMarket')}
            </div>
            <div className="mt-2 text-3xl font-bold tabular-nums tracking-tight">
              {avgPrice > 0 ? formatPrice(avgPrice) : '—'}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {compsWithPrice.length} {t('competitor').toLowerCase()}
            </div>
          </CardContent>
        </Card>

        {/* Cheapest */}
        <Card variant="glass" className="relative overflow-hidden">
          <CardContent className="pt-5 pb-4">
            <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              {t('cheapestCompetitor')}
            </div>
            <div className="mt-2 text-3xl font-bold tabular-nums tracking-tight">
              {cheapest ? formatPrice(cheapest._price) : '—'}
            </div>
            <div className="mt-1 text-xs text-muted-foreground truncate">
              {cheapest?.name || '—'}
            </div>
          </CardContent>
        </Card>

        {/* Expensive */}
        <Card variant="glass" className="relative overflow-hidden">
          <CardContent className="pt-5 pb-4">
            <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-rose-600" />
            </div>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              {t('expensiveCompetitor')}
            </div>
            <div className="mt-2 text-3xl font-bold tabular-nums tracking-tight">
              {expensive ? formatPrice(expensive._price) : '—'}
            </div>
            <div className="mt-1 text-xs text-muted-foreground truncate">
              {expensive?.name || '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hero + Position */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Hero (2 ustun) */}
        <Card variant="glass" className="lg:col-span-2 overflow-hidden">
          <div className="relative h-56">
            <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur text-primary text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full">
              {t('myHotel')}
            </div>
            {hotel?.photoUrl ? (
              <img
                src={hotel.photoUrl}
                alt={hotel?.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-fuchsia-500/10 flex items-center justify-center">
                <Building2 className="h-16 w-16 text-muted-foreground/40" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute left-4 bottom-3 right-4 z-10 text-white">
              <div className="text-xl font-semibold">{hotel?.name || '—'}</div>
              <div className="text-xs opacity-85 mt-0.5 flex items-center gap-1.5">
                {hotel?.stars > 0 && <span>{hotel.stars}★ {lang === 'uz' ? 'hotel' : ''} · </span>}
                <MapPin className="h-3 w-3" />
                {[hotel?.city, hotel?.country].filter(Boolean).join(', ')}
              </div>
            </div>
          </div>
          <CardContent className="p-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted/40 rounded-xl px-3.5 py-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {t('myPriceLabel')}
                </div>
                <div className="mt-1 text-xl font-bold tabular-nums">
                  {myPrice > 0 ? formatPrice(myPrice) : '—'}
                </div>
              </div>
              <div className="bg-muted/40 rounded-xl px-3.5 py-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {t('rating')}
                </div>
                <div className="mt-1 text-xl font-bold tabular-nums flex items-center gap-1.5">
                  {myRating10 > 0 ? myRating10.toFixed(1) : '—'}
                  {myRating10 > 0 && (
                    <span className="text-amber-400 text-xs">
                      {Array.from({ length: Math.round(myRating10 / 2) }).map((_, i) => (
                        <Star key={i} className="inline h-3 w-3 fill-amber-400" />
                      ))}
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-muted/40 rounded-xl px-3.5 py-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {t('reviewsCountSuffix')}
                </div>
                <div className="mt-1 text-xl font-bold tabular-nums">
                  {hotel?.reviewCount?.toLocaleString() || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Position panel (1 ustun) */}
        <Card variant="glass">
          <div className="px-5 py-3 border-b flex items-center justify-between">
            <div className="text-sm font-semibold">{t('marketPosition')}</div>
            <span className="text-[10px] text-muted-foreground font-semibold">{t('byPrice')}</span>
          </div>
          <CardContent className="p-5">
            <div className="text-center py-2">
              <div className="text-5xl font-bold tabular-nums tracking-tight">
                #{myRank}
                <span className="text-2xl text-muted-foreground">/{totalHotels}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 max-w-[240px] mx-auto leading-relaxed">
                {totalHotels} {t('competitor').toLowerCase()}'dan <b>{myRank}-{lang === 'ru' ? 'е место' : lang === 'en' ? 'place' : 'o\'rinda'}</b>.
                {' '}<b>{cheaperCount}</b> {t('cheaperBy')}, <b>{compsWithPrice.length - cheaperCount}</b> {t('expensiveBy')}.
              </p>
            </div>

            {/* Scale bar */}
            <div className="mt-5">
              <div className="relative h-2 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500">
                {myPrice > 0 && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-[3px] border-foreground shadow-lg"
                    style={{ left: `${pinPct}%`, transform: 'translate(-50%, -50%)' }}
                  />
                )}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-muted-foreground font-semibold">
                <span>{minPrice > 0 ? formatPrice(minPrice) : '—'} {t('cheaperBy')}</span>
                <span>{maxPrice > 0 ? formatPrice(maxPrice) : '—'} {t('expensiveBy')}</span>
              </div>
            </div>

            {/* Mini stats */}
            <div className="mt-5 space-y-0">
              <MiniRow color="bg-indigo-500" label={t('myPriceLabel')} value={myPrice > 0 ? formatPrice(myPrice) : '—'} />
              <MiniRow color="bg-muted-foreground/50" label={t('avgMarket')} value={avgPrice > 0 ? formatPrice(avgPrice) : '—'} />
              <MiniRow color="bg-emerald-500" label={t('cheapestCompetitor')} value={cheapest ? formatPrice(cheapest._price) : '—'} />
              <MiniRow color="bg-rose-500" label={t('expensiveCompetitor')} value={expensive ? formatPrice(expensive._price) : '—'} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Competitors grid */}
      <div className="flex items-end justify-between mt-2 mb-2">
        <div>
          <h3 className="text-xl font-semibold tracking-tight">{t('competitors')}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {compsWithPrice.length} {t('nearbyHotels')} · {t('vsCity')} {t('myPriceLabel').toLowerCase()}
          </p>
        </div>
        <div className="inline-flex gap-0.5 bg-muted p-0.5 rounded-lg">
          <button
            onClick={() => setSortBy('price')}
            className={cn(
              'px-3 py-1 text-xs font-semibold rounded-md transition-all',
              sortBy === 'price' ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t('myPrice')}
          </button>
          <button
            onClick={() => setSortBy('rating')}
            className={cn(
              'px-3 py-1 text-xs font-semibold rounded-md transition-all',
              sortBy === 'rating' ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t('rating')}
          </button>
        </div>
      </div>

      {sortedComps.length === 0 ? (
        <Card variant="glass">
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            ) : (
              <>
                <Building2 className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                {t('noRatingYet')}
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedComps.map((c) => {
            const diff = c._price - myPrice;
            const diffPctC = myPrice > 0 ? Math.round((diff / myPrice) * 100) : 0;
            const sign = diff > 0 ? '+' : '';
            const badgeCls = diff > 0
              ? 'bg-rose-50 text-rose-600 border-rose-200/60 dark:bg-rose-950/40 dark:border-rose-800/50'
              : diff < 0
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60 dark:bg-emerald-950/40 dark:border-emerald-800/50'
                : 'bg-muted text-muted-foreground border-border';
            return (
              <Card
                key={c._id}
                variant="glass"
                className="overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all"
              >
                <div className="relative h-32 bg-muted">
                  {c.photoUrl ? (
                    <img
                      src={c.photoUrl}
                      alt={c.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/5 to-muted flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                  <span className={cn(
                    'absolute top-2.5 right-2.5 text-[11px] font-bold tabular-nums px-2 py-1 rounded-full border backdrop-blur',
                    badgeCls
                  )}>
                    {diff === 0 ? '=' : `${sign}${diffPctC}%`}
                  </span>
                </div>
                <CardContent className="p-3.5">
                  <div className="font-semibold text-sm truncate">{c.name}</div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {c.rating > 0 && (
                      <>
                        <span className="text-amber-400">
                          {Array.from({ length: Math.round(c.rating) }).map((_, i) => (
                            <Star key={i} className="inline h-2.5 w-2.5 fill-amber-400" />
                          ))}
                        </span>
                        <span>{c.rating.toFixed(1)}</span>
                      </>
                    )}
                    {c.distanceKm > 0 && (
                      <>
                        <span className="opacity-50">·</span>
                        <span>{c.distanceKm} km</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-end justify-between mt-3">
                    <div className="text-xl font-bold tabular-nums">
                      {formatPrice(c._price)}
                      <span className="text-[11px] text-muted-foreground font-medium ml-0.5">
                        /{t('perNight').split(' ')[0]}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {c.reviewCount || 0} {t('reviewsCountSuffix')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Booking subscore yorliqlarini tarjima qilamiz
const CAT_LABELS = {
  'Location': { uz: 'Joylashuv', ru: 'Расположение', en: 'Location' },
  'Cleanliness': { uz: 'Tozalik', ru: 'Чистота', en: 'Cleanliness' },
  'Staff': { uz: 'Xizmat (xodimlar)', ru: 'Персонал', en: 'Staff' },
  'Comfort': { uz: 'Qulaylik', ru: 'Комфорт', en: 'Comfort' },
  'Facilities': { uz: 'Qulayliklar', ru: 'Удобства', en: 'Facilities' },
  'Value for money': { uz: 'Narx-sifat', ru: 'Цена/качество', en: 'Value for money' },
  'Free Wifi': { uz: 'Wi-Fi', ru: 'Wi-Fi', en: 'Free WiFi' },
};

function catLabel(label, lang) {
  return CAT_LABELS[label]?.[lang] || label;
}

// Subscore (0–10) bo'yicha rang
function scoreBarColor(v) {
  if (v >= 9) return 'bg-emerald-500';
  if (v >= 8) return 'bg-blue-500';
  if (v >= 7) return 'bg-amber-500';
  return 'bg-rose-500';
}

function CategoryRatingsPanel({ data, loading, onRefresh, t, lang }) {
  const cats = data?.categories || [];
  return (
    <Card variant="glass" className="overflow-hidden">
      <div className="px-5 py-3 border-b flex items-center justify-between">
        <div className="text-sm font-semibold">{t('categoryRatings') || 'Category Ratings'}</div>
        <button
          onClick={onRefresh}
          disabled={loading}
          title={lang === 'uz' ? 'Booking.com\'dan yangilash' : lang === 'ru' ? 'Обновить с Booking.com' : 'Refresh from Booking.com'}
          className="text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
        </button>
      </div>
      <CardContent className="p-5">
        {loading && !cats.length ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : cats.length === 0 ? (
          <div className="py-8 text-center">
            <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-xs text-muted-foreground">
              {data?.reason === 'no_booking_url'
                ? (lang === 'uz' ? 'Booking.com URL topilmadi. Sozlamalarda kiriting.' : lang === 'ru' ? 'Booking.com URL не найден. Добавьте в настройках.' : 'No Booking.com URL. Add it in Settings.')
                : (lang === 'uz' ? 'Reyting ma\'lumoti yo\'q — yangilang.' : lang === 'ru' ? 'Нет данных — обновите.' : 'No rating data — refresh.')}
            </p>
            <Button variant="outline" size="sm" className="mt-3" onClick={onRefresh} disabled={loading}>
              <RefreshCw className={cn('h-3.5 w-3.5 mr-1.5', loading && 'animate-spin')} />
              {t('refresh')}
            </Button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {data?.overall > 0 && (
              <div className="flex items-center justify-between pb-2 mb-1 border-b border-border/40">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {lang === 'uz' ? 'Umumiy' : lang === 'ru' ? 'Общий' : 'Overall'}
                </span>
                <span className="text-lg font-bold tabular-nums">{data.overall.toFixed(1)}</span>
              </div>
            )}
            {cats.map((c) => (
              <div key={c.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{catLabel(c.label, lang)}</span>
                  <span className="text-sm font-semibold tabular-nums">{c.value.toFixed(1)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', scoreBarColor(c.value))}
                    style={{ width: `${Math.min(100, c.value * 10)}%` }}
                  />
                </div>
              </div>
            ))}
            {data?.asOf && (
              <div className="text-[10px] text-muted-foreground pt-1">
                Booking.com · {new Date(data.asOf).toLocaleDateString(lang === 'ru' ? 'ru-RU' : lang === 'uz' ? 'uz-UZ' : 'en-US', { day: 'numeric', month: 'short' })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MiniRow({ color, label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-t first:border-t-0 border-border/40">
      <div className="flex items-center gap-2.5 text-sm">
        <span className={cn('w-2 h-2 rounded-full', color)} />
        {label}
      </div>
      <div className="text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}
