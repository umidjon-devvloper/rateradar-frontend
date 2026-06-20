import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { RefreshCw, Star, MapPin, ArrowDown, ArrowUp, Minus, Download, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CountUp from '@/components/ui/CountUp';
import { Reveal } from '@/components/ui/motion';
import PriceRefreshProgress from '@/components/PriceRefreshProgress';
import { cellPop } from '@/lib/animations';
import { useT, useLang } from '@/lib/i18n';
import { pricesApi } from '@/lib/api';
import { cn, useFormatPrice } from '@/lib/utils';
import { getOtaBrand } from '@/lib/otaBrands';

const DAY_OPTIONS = [
  { value: 7,  key: 'sevenDays' },
  { value: 14, key: 'fourteenDays' },
  { value: 30, key: 'thirtyDays' },
];

function formatDateColumn(iso, lang) {
  const d = new Date(iso);
  const day = d.getDate();
  const monthsUz = ['yan', 'fev', 'mar', 'apr', 'may', 'iyun', 'iyul', 'avg', 'sen', 'okt', 'noy', 'dek'];
  const monthsRu = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const months = lang === 'ru' ? monthsRu : lang === 'en' ? monthsEn : monthsUz;
  const weekdayUz = ['Yak', 'Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha'];
  const weekdayRu = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  const weekdayEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const wd = lang === 'ru' ? weekdayRu : lang === 'en' ? weekdayEn : weekdayUz;
  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
  return { weekday: wd[d.getDay()], date: `${day} ${months[d.getMonth()]}`, isWeekend };
}

function diffColor(diff) {
  if (diff <= -3) return 'text-green-700 bg-green-50 dark:bg-green-950/30 border-green-200/60 dark:border-green-800/50';
  if (diff >= 3)  return 'text-red-600 bg-red-50 dark:bg-red-950/30 border-red-200/60 dark:border-red-800/50';
  return 'text-muted-foreground bg-muted/30 border-border';
}

function diffIcon(diff) {
  if (diff <= -3) return ArrowDown;
  if (diff >= 3)  return ArrowUp;
  return Minus;
}

// ─── Room Types Table ──────────────────────────────────────────────────────────

function RoomTable({ data, lang, t }) {
  const formatPrice = useFormatPrice();
  if (!data) return <div className="py-16 text-center text-sm text-muted-foreground">{t('loading')}</div>;
  if (!data.rows?.length) return <div className="py-16 text-center text-sm text-muted-foreground">{t('noRoomData')}</div>;

  return (
    <table className="w-full text-sm">
      <thead className="bg-muted/40 border-b">
        <tr>
          <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground sticky left-0 bg-muted/40 z-10 min-w-[180px]">
            {t('roomTypeView')}
          </th>
          {data.columns.map((iso) => {
            const f = formatDateColumn(iso, lang);
            return (
              <th key={iso} className={cn('px-2 py-3 text-center font-medium min-w-[100px]', f.isWeekend && 'bg-primary/5')}>
                <div className={cn('text-[10px] uppercase tracking-wider', f.isWeekend ? 'text-primary' : 'text-muted-foreground')}>
                  {f.weekday}
                </div>
                <div className="text-xs text-foreground mt-0.5">{f.date}</div>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody className="divide-y">
        {data.rows.map(({ room, prices }, ri) => (
          <tr key={room.name} className="hover:bg-muted/20 transition-colors">
            <td className="px-4 py-3 sticky left-0 bg-card z-10 hover:bg-muted/20">
              <div className="font-semibold text-sm">{room.name}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                {room.guests > 0 && <span>{room.guests} {t('guestsSuffix')}</span>}
                {room.sqm > 0 && <><span>·</span><span>{room.sqm} m²</span></>}
                {room.description && <><span>·</span><span className="truncate max-w-[90px]">{room.description}</span></>}
              </div>
            </td>
            {data.columns.map((iso, ci) => {
              const cell = prices[iso];
              if (!cell) return <td key={iso} className="px-2 py-3 text-center text-muted-foreground">—</td>;
              const Icon = diffIcon(cell.diff);
              return (
                <td key={iso} className="px-1.5 py-2 text-center">
                  <motion.div
                    variants={cellPop}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    transition={{ delay: Math.min((ri + ci) * 0.04, 0.5) }}
                    whileHover={{ scale: 1.09, y: -3 }}
                    className={cn(
                      'inline-flex flex-col items-center px-2.5 py-1.5 rounded-lg border min-w-[80px] transition-shadow hover:shadow-lg cursor-default',
                      diffColor(cell.diff)
                    )}
                  >
                    <div className="text-sm font-bold tabular-nums">
                      <CountUp value={cell.price} format={formatPrice} duration={0.9} />
                    </div>
                    <div className="flex items-center gap-0.5 text-[10px] tabular-nums leading-none mt-0.5 opacity-80">
                      <Icon className="h-2.5 w-2.5 shrink-0" />
                      <span>{Math.abs(cell.diff)}%</span>
                      {cell.marketAvg > 0 && (
                        <span className="text-muted-foreground ml-0.5">
                          · {t('marketAvgShort')} {formatPrice(cell.marketAvg)}
                        </span>
                      )}
                    </div>
                  </motion.div>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Competitors Table ─────────────────────────────────────────────────────────

function CompetitorTable({ data, hotel, lang, t, channel }) {
  const formatPrice = useFormatPrice();
  if (!data) return <div className="py-16 text-center text-sm text-muted-foreground">{t('loading')}</div>;
  if (!data.rows?.length) return <div className="py-16 text-center text-sm text-muted-foreground">{t('noCompetitorsYet')}</div>;

  return (
    <table className="w-full text-sm">
      <thead className="bg-muted/40 border-b">
        <tr>
          <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground sticky left-0 bg-muted/40 z-10 min-w-[200px]">
            {t('competitor')}
          </th>
          {data.columns.map((iso) => {
            const f = formatDateColumn(iso, lang);
            return (
              <th key={iso} className={cn('px-2 py-3 text-center font-medium min-w-[88px]', f.isWeekend && 'bg-primary/5')}>
                <div className={cn('text-[10px] uppercase tracking-wider', f.isWeekend ? 'text-primary' : 'text-muted-foreground')}>
                  {f.weekday}
                </div>
                <div className="text-xs text-foreground mt-0.5">{f.date}</div>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody className="divide-y">
        {hotel && (
          <tr className="bg-primary/5">
            <td className="px-4 py-3 sticky left-0 bg-primary/5 z-10">
              <div className="font-semibold text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {data.myHotel.name}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {t('myPrice')}: {data.myHotel.price > 0 ? formatPrice(data.myHotel.price) : '—'}
                {data.myHotel.stars > 0 && (
                  <span className="ml-2 inline-flex items-center gap-0.5">
                    {Array.from({ length: data.myHotel.stars }).map((_, i) => (
                      <Star key={i} className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </span>
                )}
              </div>
            </td>
            {data.columns.map((iso) => (
              <td key={iso} className="px-2 py-3 text-center">
                <div className="text-sm font-semibold tabular-nums">
                  {data.myHotel.price > 0 ? formatPrice(data.myHotel.price) : '—'}
                </div>
              </td>
            ))}
          </tr>
        )}

        <tr className="bg-muted/20">
          <td className="px-4 py-2.5 sticky left-0 bg-muted/20 z-10">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('avgMarket')}
            </div>
          </td>
          {data.columns.map((iso) => {
            const avg = data.marketAvg[iso] || 0;
            return (
              <td key={iso} className="px-2 py-2.5 text-center">
                <div className="text-xs text-muted-foreground tabular-nums">
                  {avg > 0 ? formatPrice(avg) : '—'}
                </div>
              </td>
            );
          })}
        </tr>

        {data.rows.map(({ competitor: c, prices }, ri) => (
          <tr key={c._id} className="hover:bg-muted/20 transition-colors">
            <td className="px-4 py-3 sticky left-0 bg-card z-10 hover:bg-muted/20">
              <div className="font-medium text-sm truncate max-w-[180px]">{c.name}</div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                {c.distanceKm > 0 && (
                  <span className="flex items-center gap-0.5">
                    <MapPin className="h-2.5 w-2.5" />
                    {c.distanceKm} km
                  </span>
                )}
                {c.stars > 0 && (
                  <span className="inline-flex items-center gap-0.5">
                    {Array.from({ length: c.stars }).map((_, i) => (
                      <Star key={i} className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </span>
                )}
              </div>
            </td>
            {data.columns.map((iso, ci) => {
              const cell = prices[iso];
              const hasPrice = cell && cell.price > 0;
              // Kanal tanlanganda raqibda u kanal bo'lmasa "$0" ko'rsatamiz
              // ("—" o'rniga — foydalanuvchi so'roviga ko'ra).
              if (!hasPrice && channel === 'all') {
                return <td key={iso} className="px-2 py-3 text-center text-muted-foreground/60 text-sm">—</td>;
              }
              const price = hasPrice ? cell.price : 0;
              const diff = cell?.diff || 0;
              const Icon = diffIcon(diff);
              return (
                <td key={iso} className="px-1.5 py-2 text-center">
                  <motion.div
                    variants={cellPop}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    transition={{ delay: Math.min((ri + ci) * 0.035, 0.5) }}
                    whileHover={{ scale: 1.09, y: -3 }}
                    className={cn(
                      'inline-flex flex-col items-center px-2 py-1 rounded-md border min-w-[68px] transition-shadow hover:shadow-lg cursor-default',
                      hasPrice ? diffColor(diff) : 'text-muted-foreground/60 bg-muted/20 border-border'
                    )}
                  >
                    <div className="text-sm font-semibold tabular-nums">
                      <CountUp value={price} format={formatPrice} duration={0.9} />
                    </div>
                    {hasPrice && data.myHotel.price > 0 && (
                      <div className="flex items-center gap-0.5 text-[10px] tabular-nums leading-none">
                        <Icon className="h-2.5 w-2.5" />
                        {Math.abs(diff)}%
                      </div>
                    )}
                  </motion.div>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Prices() {
  const t = useT();
  const lang = useLang((s) => s.lang);
  const formatPrice = useFormatPrice();
  const { hotel } = useOutletContext();
  const [view, setView] = useState('rooms');
  const [days, setDays] = useState(7);
  const [channel, setChannel] = useState('all');
  const [roomData, setRoomData] = useState(null);
  const [compData, setCompData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshResult, setRefreshResult] = useState(null);
  const [showProgress, setShowProgress] = useState(false);

  // SerpAPI bulk — bitta yugurishda o'z mehmonxona + barcha raqiblar uchun
  // BARCHA OTA kanallar (Booking, Agoda, Expedia, Hotels.com, Trip.com…) yangilanadi.
  async function refreshAllChannels() {
    setRefreshing(true);
    setRefreshResult(null);
    setError('');
    setShowProgress(true); // jonli animatsiyali panel
    try {
      const res = await pricesApi.refreshAll();
      // refreshResult shaklini moslashtirib qo'yamiz (eski UI bilan mos)
      setRefreshResult({
        channel: lang === 'uz' ? 'Barcha kanallar' : 'All channels',
        own: {
          found: res.own.channels > 0,
          price: res.own.otaPrices?.[0]?.price || 0,
          message: res.own.message,
        },
        competitors: {
          total: res.competitors.total,
          matched: res.competitors.matched,
          failed: res.competitors.failed,
          message: res.competitors.failed > 0
            ? (lang === 'uz'
                ? `${res.competitors.failed} ta raqibda narx topilmadi`
                : `${res.competitors.failed} competitors had no price`)
            : '',
        },
      });
      await loadCompetitors(days, channel);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Refresh xatosi');
    } finally {
      setRefreshing(false);
    }
  }

  // Apify Booking — o'z mehmonxona REAL xona turlari + narxlarini olib keladi.
  async function refreshRooms() {
    setRefreshing(true);
    setRefreshResult(null);
    setError('');
    try {
      const res = await pricesApi.refreshRooms();
      if (res.found) {
        setRefreshResult({
          channel: 'Booking.com',
          own: { found: true, price: res.minPrice || 0, message: '' },
          competitors: { total: 0, matched: 0, failed: 0, message: '' },
          rooms: res.roomsCount,
        });
        await loadRooms(days);
      } else {
        setError(res.message || (lang === 'uz' ? 'Xona narxi topilmadi' : 'No room prices found'));
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Refresh xatosi');
    } finally {
      setRefreshing(false);
    }
  }

  async function loadRooms(d = days) {
    setLoading(true);
    setError('');
    try {
      const res = await pricesApi.roomShopper(d);
      setRoomData(res);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Xato');
    } finally {
      setLoading(false);
    }
  }

  async function loadCompetitors(d = days, ch = channel) {
    setLoading(true);
    setError('');
    try {
      const res = await pricesApi.rateShopper(d, ch);
      setCompData(res);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Xato');
    } finally {
      setLoading(false);
    }
  }

  function reload() {
    if (view === 'rooms') loadRooms(days);
    else loadCompetitors(days, channel);
  }

  useEffect(() => {
    if (view === 'rooms') loadRooms(days);
    else loadCompetitors(days, channel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, days, channel]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{t('rateShopper')}</h1>
            <Badge variant="outline" className="text-[10px]">Live</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{t('rateShopperDesc')}</p>
        </div>
        <div className="flex items-center gap-2">
          {view === 'rooms' && (
            <Button
              size="sm"
              onClick={refreshRooms}
              disabled={refreshing || loading}
              title={lang === 'uz'
                ? 'Booking.com — o\'z mehmonxonangiz real xona narxlari'
                : 'Booking.com — your real room prices'}
            >
              {refreshing ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5 mr-1.5" />
              )}
              {refreshing
                ? (lang === 'uz' ? 'Olib kelinmoqda...' : lang === 'ru' ? 'Загружается...' : 'Fetching...')
                : (lang === 'uz' ? 'Booking narxini olish' : lang === 'ru' ? 'Цены с Booking' : 'Fetch from Booking')}
            </Button>
          )}
          {view === 'competitors' && (
            <Button
              size="sm"
              onClick={refreshAllChannels}
              disabled={refreshing || loading}
              title={lang === 'uz'
                ? 'Barcha OTA kanallar — bitta so\'rovda'
                : 'All OTA channels — in one request'}
            >
              {refreshing ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5 mr-1.5" />
              )}
              {refreshing
                ? (lang === 'uz' ? 'Olib kelinmoqda...' : lang === 'ru' ? 'Загружается...' : 'Fetching...')
                : (lang === 'uz' ? 'Barcha kanallar' : lang === 'ru' ? 'Все каналы' : 'All channels')}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={reload} disabled={loading || refreshing}>
            <RefreshCw className={cn('h-3.5 w-3.5 mr-1.5', loading && 'animate-spin')} />
            {t('refresh')}
          </Button>
        </div>
      </div>

      {/* Jonli narx yangilash progress — animatsiyali */}
      <PriceRefreshProgress open={showProgress} onClose={() => setShowProgress(false)} />

      {/* View toggle + Day selector + Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* View tabs */}
          <div className="inline-flex rounded-md border bg-card p-0.5">
            {[
              { key: 'rooms', label: t('roomTypeView') },
              { key: 'competitors', label: t('competitorView') },
            ].map((v) => (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded transition-colors',
                  view === v.key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Day selector */}
          <div className="inline-flex rounded-md border bg-card p-0.5">
            {DAY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDays(opt.value)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded transition-colors',
                  days === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t(opt.key)}
              </button>
            ))}
          </div>

          {/* Channel selector — dinamik dropdown */}
          {view === 'competitors' && (
            <div className="inline-flex items-center gap-2">
              {channel !== 'all' && (
                <span className={cn(
                  'w-5 h-5 rounded-full text-white text-[10px] font-semibold flex items-center justify-center',
                  getOtaBrand(channel).gradient
                )}>
                  {getOtaBrand(channel).short}
                </span>
              )}
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="h-8 pl-2.5 pr-7 rounded-md border bg-card text-xs font-medium text-foreground hover:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
              >
                <option value="all">★ {t('allChannels')}</option>
                {(compData?.availableChannels || []).map((source) => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-green-100 dark:bg-green-950/40 border border-green-300/50" />
            <span className="text-muted-foreground">{t('belowMarket')}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-muted border" />
            <span className="text-muted-foreground">≈ {t('market')}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-100 dark:bg-red-950/40 border border-red-300/50" />
            <span className="text-muted-foreground">{t('aboveMarket')}</span>
          </span>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 dark:border-red-800/50">
          <CardContent className="py-4 text-sm text-red-600">{error}</CardContent>
        </Card>
      )}

      {refreshResult && view === 'rooms' && (
        <Card className="border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/40 dark:bg-emerald-950/20">
          <CardContent className="py-3 px-4 text-sm flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-emerald-800 dark:text-emerald-200">
                {lang === 'uz' ? 'Booking.com\'dan real narx olindi' : lang === 'ru' ? 'Реальные цены с Booking.com' : 'Real prices from Booking.com'}
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                {lang === 'uz'
                  ? <>{refreshResult.rooms} ta xona turi · eng arzon: {refreshResult.own.price > 0 ? formatPrice(refreshResult.own.price) : '—'}</>
                  : lang === 'ru'
                    ? <>{refreshResult.rooms} типов номеров · от {refreshResult.own.price > 0 ? formatPrice(refreshResult.own.price) : '—'}</>
                    : <>{refreshResult.rooms} room types · from {refreshResult.own.price > 0 ? formatPrice(refreshResult.own.price) : '—'}</>}
              </div>
            </div>
            <button onClick={() => setRefreshResult(null)} className="text-emerald-600 hover:text-emerald-800 text-xs">✕</button>
          </CardContent>
        </Card>
      )}

      {refreshResult && view === 'competitors' && (
        <Card className="border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/40 dark:bg-emerald-950/20">
          <CardContent className="py-3 px-4 text-sm flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-emerald-800 dark:text-emerald-200">
                {lang === 'uz' ? `${refreshResult.channel}'dan yangilandi` : lang === 'ru' ? `Обновлено с ${refreshResult.channel}` : `Refreshed from ${refreshResult.channel}`}
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                {lang === 'uz'
                  ? <>Mening narxim: {refreshResult.own.found ? formatPrice(refreshResult.own.price) : '—'} · Raqiblar: {refreshResult.competitors.matched}/{refreshResult.competitors.total} topildi {refreshResult.competitors.failed > 0 && `(${refreshResult.competitors.failed} topilmadi)`}</>
                  : lang === 'ru'
                    ? <>Моя цена: {refreshResult.own.found ? formatPrice(refreshResult.own.price) : '—'} · Конкурентов: {refreshResult.competitors.matched}/{refreshResult.competitors.total} найдено</>
                    : <>My price: {refreshResult.own.found ? formatPrice(refreshResult.own.price) : '—'} · Competitors: {refreshResult.competitors.matched}/{refreshResult.competitors.total} matched</>}
              </div>
              {refreshResult.own.message && (
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 italic">
                  {refreshResult.own.message}
                </div>
              )}
              {refreshResult.competitors.message && (
                <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5 italic">
                  ⚠ {refreshResult.competitors.message}
                </div>
              )}
            </div>
            <button onClick={() => setRefreshResult(null)} className="text-emerald-600 hover:text-emerald-800 text-xs">✕</button>
          </CardContent>
        </Card>
      )}

      <Reveal>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-16 text-center text-sm text-muted-foreground">{t('loading')}</div>
            ) : view === 'rooms' ? (
              <RoomTable data={roomData} lang={lang} t={t} />
            ) : (
              <CompetitorTable data={compData} hotel={hotel} lang={lang} t={t} channel={channel} />
            )}
          </div>
        </Card>
      </Reveal>
    </div>
  );
}
