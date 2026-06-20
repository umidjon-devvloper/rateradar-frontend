import { useState, useEffect } from 'react';
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
import { hotelApi, pricesApi } from '@/lib/api';
import { useT, useLang } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useFormatPrice, cn } from '@/lib/utils';

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

  useEffect(() => {
    hotelApi
      .competitors()
      .then((c) => setCompetitors(c || []))
      .finally(() => setLoading(false));
  }, []);

  // 14 kunlik narx prognozi — bizning hotel va bozor o'rtachasi
  useEffect(() => {
    if (!hotel?._id) return;
    pricesApi
      .rateShopper(14, 'all')
      .then(setForecast)
      .catch(() => setForecast(null));
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
    <div className="space-y-6 animate-fade-in">
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
            <div className="flex items-center gap-4 lg:gap-6">
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('myPrice')}</div>
                {hotel.currentPrice > 0 ? (
                  <div className="text-2xl font-semibold tracking-tight tabular-nums">
                    {formatPrice(hotel.currentPrice)}
                  </div>
                ) : (
                  <Link
                    to="/settings"
                    className="text-sm text-primary hover:underline tabular-nums inline-flex items-center gap-1"
                  >
                    {t('enterPriceShort')} →
                  </Link>
                )}
                <div className="text-[10px] text-muted-foreground">{t('bookingPerNight')}</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('competitorsTracked')}</div>
                <div className="text-2xl font-semibold tracking-tight tabular-nums">{competitors.length}</div>
                <div className="text-[10px] text-muted-foreground">300m</div>
              </div>
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

      {/* Jonli narx yangilash progress — animatsiyali */}
      <PriceRefreshProgress open={showProgress} onClose={() => setShowProgress(false)} />

      {/* Stats cards */}
      <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StaggerItem>
          <StatCard
            icon={DollarSign}
            label={t('myPrice')}
            count={myPrice}
            format={formatPrice}
            sub={t('perNight')}
            accent="primary"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={TrendingUp}
            label={t('avgPrice')}
            count={avgPrice}
            format={formatPrice}
            sub={`${competitors.length} ${t('nCompetitors')}`}
            delta={myPrice > avgPrice ? 'high' : myPrice < avgPrice ? 'low' : null}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={Users}
            label={t('competitorsTracked')}
            count={competitors.length}
            sub="300m"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={TrendingDown}
            label={t('yourPosition')}
            value={`#${yourRank}/${totalHotels}`}
            sub={t('byPrice')}
          />
        </StaggerItem>
      </Stagger>

      {/* 14 kunlik narx prognozi grafigi */}
      <Card variant="glass" className="overflow-hidden">
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
            <div className="h-72">
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

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Cheapest / Expensive */}
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

        {/* AI insights placeholder */}
        <Card variant="premium" className="hover-lift bg-gradient-to-br from-primary/5 via-card to-fuchsia-500/5">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {t('aiAnalysis')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('aiPlaceholder')}
            </p>
            <Badge variant="outline" className="mt-3">
              Phase 3
            </Badge>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

function StatCard({ icon: Icon, label, value, count, format, sub, delta, accent }) {
  return (
    <Card variant="glass" className="hover-lift h-full">
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-2">
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
