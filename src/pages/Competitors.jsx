import { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Plus, MapPin, Star, Trash2, Loader2, Building2, X,
  RefreshCw, DollarSign, Clock,
  ChevronRight, BarChart2, Mail, Map, List,
  MessageSquare, ExternalLink, DownloadCloud, Sparkles, Lightbulb, ArrowRight,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SearchSelect } from '@/components/ui/search-select';
import CompetitorMap from '@/components/CompetitorMap';
import { hotelApi, searchApi, aiApi } from '@/lib/api';
import { useT, useLang } from '@/lib/i18n';
import { cn, useFormatPrice } from '@/lib/utils';
import { getOtaBrand } from '@/lib/otaBrands';

// ─── OTA display names ────────────────────────────────
const OTA_DISPLAY = {
  google: 'Google Hotels',
  bookingcom: 'Booking.com',
  agoda: 'Agoda',
  hotelscom: 'Hotels.com',
  tripcom: 'Trip.com',
  expedia: 'Expedia',
  tripadvisor: 'TripAdvisor',
  priceline: 'Priceline',
  kayak: 'Kayak',
};

// ─── Helpers ──────────────────────────────────────────
function timeAgo(date) {
  if (!date) return null;
  const diff = Date.now() - new Date(date).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 2) return 'Az oldin';
  if (min < 60) return `${min} daqiqa oldin`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} soat oldin`;
  return `${Math.floor(h / 24)} kun oldin`;
}

// Kartochkada qaysi kanal qanday yorliq bilan ko'rsatiladi. Bu yerda yo'q
// kanallar uchun key'ning o'zi ishlatiladi (xohlagan SerpAPI partner ham
// ko'rinadi: bluepillowcom, etripnet, hometogo va boshqalar).
const CHANNEL_LABEL = {
  bookingcom:  'booking',
  agoda:       'agoda',
  expedia:     'expedia',
  hotelscom:   'hotels',
  tripcom:     'trip',
  priceline:   'priceline',
  viocom:      'vio',
  edreams:     'edreams',
  tripadvisor: 'tripadvisor',
  googlehotels: 'google',
  google:      'google',
};

// Kanal tartibi — eng tanilganlar oldinda, qolganlar narx bo'yicha
const CHANNEL_ORDER = [
  'bookingcom', 'agoda', 'expedia', 'hotelscom', 'tripcom',
  'google', 'googlehotels', 'priceline', 'viocom', 'edreams', 'tripadvisor',
];

function collectChannelPrices(latestPrices) {
  if (!latestPrices) return [];
  // Backenddan JSON sifatida keladi — har doim plain object.
  // (`Map` lucide-react ikon nomi bilan soyalangani uchun `instanceof Map` ishlatmaymiz.)
  const entries =
    typeof latestPrices.entries === 'function'
      ? [...latestPrices.entries()]
      : Object.entries(latestPrices);

  const out = entries
    // Google aggregator narxini chiplarda ko'rsatmaymiz — boshqa OTA'larniki.
    .filter(([key, v]) => Number(v) > 0 && key !== 'google' && key !== 'googlehotels')
    .map(([key, price]) => ({
      key,
      label: CHANNEL_LABEL[key] || key,
      price: Math.round(Number(price)),
    }));

  out.sort((a, b) => {
    const ai = CHANNEL_ORDER.indexOf(a.key);
    const bi = CHANNEL_ORDER.indexOf(b.key);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.price - b.price;
  });

  return out;
}

function avgFromChannels(chips) {
  if (!chips.length) return 0;
  return Math.round(chips.reduce((s, c) => s + c.price, 0) / chips.length);
}

// ─── Sub-components ───────────────────────────────────
function StarsDisplay({ stars }) {
  if (!stars) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-3 w-3',
            i < stars ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/30'
          )}
        />
      ))}
    </span>
  );
}

// ─── Hotel Card (rasm bo'yicha) ──────────────────────
function HotelCard({
  name, address, distanceKm, stars, rating,
  channels, isOwn = false, onClick, onDelete, onRefresh, isFetching,
  onFetchHasData, isFetchingHasData,
}) {
  const formatPrice = useFormatPrice();
  const avg = avgFromChannels(channels);
  return (
    <div
      className={cn(
        'rounded-2xl border bg-card p-4 sm:p-5 transition-all',
        isOwn ? 'border-primary/40 ring-1 ring-primary/30 bg-primary/[0.03]' : 'border-border hover:border-foreground/20',
        onClick && 'cursor-pointer hover:shadow-sm'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base sm:text-lg font-semibold tracking-tight truncate">{name}</h3>
            {isOwn && (
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-primary text-primary-foreground">
                Mening hotelim
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
            {(address || distanceKm > 0) && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {address ? <span className="truncate max-w-[260px]">{address}</span> : null}
                {distanceKm > 0 && <span className="tabular-nums">{distanceKm} km</span>}
              </span>
            )}
            {stars > 0 && (
              <span className="inline-flex items-center gap-0.5">
                {Array.from({ length: stars }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </span>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg</div>
          <div className="flex items-baseline gap-2 justify-end">
            <div className="text-2xl font-bold tabular-nums">
              {avg > 0 ? formatPrice(avg) : '—'}
            </div>
            {rating > 0 && (
              <span className="text-sm font-medium tabular-nums">
                {rating.toFixed(1)} <Star className="inline h-3 w-3 -mt-0.5 fill-amber-400 text-amber-400" />
              </span>
            )}
          </div>
        </div>
      </div>

      {channels.length > 0 ? (
        <div className="mt-3.5 flex items-center gap-1.5 flex-wrap">
          {channels.map((ch) => (
            <span
              key={ch.label}
              className="text-[11px] font-mono px-2 py-1 rounded-md border bg-background text-foreground/80"
            >
              {ch.label}: {formatPrice(ch.price)}
            </span>
          ))}
        </div>
      ) : (
        <div className="mt-3.5 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-muted-foreground italic">
            Kanal narxi yo'q
          </span>
          {!isOwn && onFetchHasData && (
            <button
              onClick={(e) => { e.stopPropagation(); onFetchHasData(); }}
              disabled={isFetchingHasData}
              title="Booking.com narxini olish"
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFetchingHasData ? <Loader2 className="h-3 w-3 animate-spin" /> : <DownloadCloud className="h-3 w-3" />}
              Booking narxini olish
            </button>
          )}
        </div>
      )}

      {(onRefresh || onDelete) && (
        <div className="mt-3 flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isFetching}
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFetching ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              Narxlar
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="O'chirish"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────
function CompetitorDetailModal({ comp, myPrice, onClose, onFetchPrice }) {
  const formatPrice = useFormatPrice();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [activeTab, setActiveTab] = useState('prices');

  const loadDetail = useCallback(() => {
    setLoading(true);
    hotelApi
      .getCompetitorDetail(comp._id)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [comp._id]);

  useEffect(() => { loadDetail(); }, [loadDetail]);

  const handleFetch = async () => {
    setFetching(true);
    try {
      await onFetchPrice(comp._id);
      loadDetail();
    } finally {
      setFetching(false);
    }
  };

  const otaEntries = data
    ? Object.entries(data.otaPrices || {})
        .filter(([, v]) => v > 0)
        .sort(([, a], [, b]) => a - b)
    : [];

  const hasPriceHistory = data?.history?.length > 1;
  const hasRatingHistory = data?.ratingHistory?.length > 1;

  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(comp.name + ' reviews')}`;

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 backdrop-blur-md bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-strong rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-up shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary ring-1 ring-primary/20 flex items-center justify-center text-base font-bold shrink-0">
              {comp.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold truncate">{comp.name}</h2>
              {comp.address && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                  <MapPin className="h-3 w-3 shrink-0" />{comp.address}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors shrink-0 ml-2">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap gap-4 px-5 py-3.5 bg-muted/20 border-b border-border/40">
          <div className="flex items-center gap-2">
            <StarsDisplay stars={comp.stars} />
          </div>
          {comp.rating > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              </div>
              <div>
                <div className="text-sm font-bold tabular-nums leading-none">{comp.rating.toFixed(1)}</div>
                {comp.reviewCount > 0 && (
                  <div className="text-[10px] text-muted-foreground">{comp.reviewCount.toLocaleString()} sharh</div>
                )}
              </div>
            </div>
          )}
          {comp.distanceKm > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />{comp.distanceKm} km uzoqlikda
            </div>
          )}
          {comp.lastPriceFetchedAt && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
              <Clock className="h-3 w-3" />Yangilangan: {timeAgo(comp.lastPriceFetchedAt)}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border/60 px-5 pt-1">
          {[
            { key: 'prices', label: 'OTA Narxlar', icon: DollarSign },
            { key: 'history', label: 'Narx tarixi', icon: BarChart2 },
            { key: 'reviews', label: 'Sharhlar', icon: MessageSquare },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors',
                activeTab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-3.5 w-3.5" />{label}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4 min-h-[240px]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Tab: OTA Narxlar */}
              {activeTab === 'prices' && (
                otaEntries.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {otaEntries.map(([key, price]) => {
                      const label = OTA_DISPLAY[key] || key;
                      const brand = getOtaBrand(key);
                      const diff = myPrice > 0 ? price - myPrice : null;
                      return (
                        <div
                          key={key}
                          className="flex items-center gap-2.5 rounded-xl bg-card/60 border border-border/60 p-3"
                        >
                          <div className={cn(
                            'w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold text-white',
                            brand.gradient
                          )}>
                            {brand.short}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] text-muted-foreground truncate">{label}</div>
                            <div className="text-sm font-semibold tabular-nums">{formatPrice(price)}</div>
                          </div>
                          {diff !== null && (
                            <div className={cn(
                              'text-[10px] font-semibold shrink-0',
                              diff > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                            )}>
                              {diff > 0 ? `+${formatPrice(Math.round(diff))}` : `-${formatPrice(Math.round(Math.abs(diff)))}`}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 rounded-xl bg-muted/20 border border-dashed border-border">
                    <DollarSign className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Narxlar hali olinmagan</p>
                    <p className="text-[11px] text-muted-foreground/70 mt-1">
                      Quyidagi tugmani bosib narxlarni oling
                    </p>
                  </div>
                )
              )}

              {/* Tab: Narx tarixi */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  {hasPriceHistory ? (
                    <div>
                      <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                        <BarChart2 className="h-3.5 w-3.5" />
                        30 kunlik Google narx trendi
                      </p>
                      <div className="h-44 rounded-xl bg-card/60 border border-border/60 p-3">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={data.history} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.4)" />
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                              tickFormatter={(v) => v.slice(5)}
                              interval="preserveStartEnd"
                            />
                            <YAxis
                              tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                              tickFormatter={(v) => formatPrice(v)}
                              width={62}
                            />
                            <ReTooltip
                              contentStyle={{
                                background: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                fontSize: '11px',
                              }}
                              formatter={(v) => [formatPrice(v), 'Narx']}
                              labelFormatter={(l) => l}
                            />
                            <Line
                              type="monotone"
                              dataKey="price"
                              stroke="hsl(var(--primary))"
                              strokeWidth={2}
                              dot={{ r: 3, fill: 'hsl(var(--primary))' }}
                              activeDot={{ r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart2 className="h-6 w-6 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Narx tarixi yo&apos;q</p>
                      <p className="text-[11px] opacity-70 mt-1">
                        Narx olgandan so&apos;ng 30 kunlik trend ko&apos;rsatiladi
                      </p>
                    </div>
                  )}

                  {hasRatingHistory && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        Rating o&apos;zgarishi
                      </p>
                      <div className="h-36 rounded-xl bg-card/60 border border-border/60 p-3">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={data.ratingHistory} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.4)" />
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                              tickFormatter={(v) => v.slice(5)}
                              interval="preserveStartEnd"
                            />
                            <YAxis
                              tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                              domain={['auto', 'auto']}
                              width={28}
                            />
                            <ReTooltip
                              contentStyle={{
                                background: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                fontSize: '11px',
                              }}
                              formatter={(v) => [v, 'Rating']}
                            />
                            <Line
                              type="monotone"
                              dataKey="rating"
                              stroke="#f59e0b"
                              strokeWidth={2}
                              dot={{ r: 3, fill: '#f59e0b' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Sharhlar */}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {/* Rating summary */}
                  {comp.rating > 0 && (
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                          {comp.rating.toFixed(1)}
                        </div>
                        <div className="flex items-center gap-0.5 mt-1 justify-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                'h-3 w-3',
                                i < Math.round(comp.rating / 2)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-muted text-muted-foreground/30'
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        {comp.reviewCount > 0 && (
                          <p className="text-sm font-medium">{comp.reviewCount.toLocaleString()} ta sharh</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Google Hotels dan olingan
                        </p>
                      </div>
                    </div>
                  )}

                  {/* External links */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      Tashqi manbalar
                    </p>
                    <a
                      href={googleSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl border border-border/60 hover:bg-accent/40 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                          G
                        </div>
                        <div>
                          <div className="text-sm font-medium">Google Sharhlar</div>
                          <div className="text-[11px] text-muted-foreground">
                            {comp.name} sharhlarini ko&apos;rish
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>
                    <a
                      href={`https://www.tripadvisor.com/Search?q=${encodeURIComponent(comp.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl border border-border/60 hover:bg-accent/40 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-[10px] font-bold">
                          T
                        </div>
                        <div>
                          <div className="text-sm font-medium">TripAdvisor</div>
                          <div className="text-[11px] text-muted-foreground">
                            Mehmon sharhlarini ko&apos;rish
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex gap-2 px-5 pb-5 pt-1 border-t border-border/40">
          <Button variant="outline" size="sm" className="flex-1" onClick={handleFetch} disabled={fetching}>
            {fetching
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <RefreshCw className="h-3.5 w-3.5" />}
            Narxlarni yangilash
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>Yopish</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────
export default function Competitors() {
  const t = useT();
  const lang = useLang((s) => s.lang);
  const { hotel } = useOutletContext();
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [picked, setPicked] = useState(null);
  const [adding, setAdding] = useState(false);
  const [fetchingId, setFetchingId] = useState(null);
  const [fetchingHasDataId, setFetchingHasDataId] = useState(null);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0, active: false });
  const [detailComp, setDetailComp] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'map'
  // AI maslahatchi (sahifa tagida)
  const [aiData, setAiData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const aiLoadedRef = useRef(false);

  // force=true — "Yangilash" bosilganda AI'ga qayta so'rov (token sarflanadi).
  // force=false — keshdan oladi (token ketmaydi); kesh bo'lmasa bir marta generatsiya.
  const loadAi = useCallback(async (force = false) => {
    setAiLoading(true);
    setAiError('');
    try {
      const res = await aiApi.priceRecommendations(lang, force);
      setAiData(res);
    } catch (err) {
      setAiError(err.response?.data?.error || err.message);
    } finally {
      setAiLoading(false);
    }
  }, [lang]);
  // Avto Xotelo-enrich har sahifa ochilishida bir martagina ishlasin (qayta navigatsiya zarariga yo'l qo'ymaslik).
  const xoteloAutoFetched = useRef(false);

  const [lng, lat] = hotel?.location?.coordinates || [];
  const hotelSearchCity = hotel ? { city: hotel.city, lat, lng } : {};
  const myPrice = hotel?.currentPrice || 0;
  const myStars = hotel?.stars || 0;
  const [ownChannelPrices, setOwnChannelPrices] = useState({});

  const load = useCallback(() => {
    setLoading(true);
    hotelApi
      .competitors()
      .then((c) => setCompetitors(c || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Raqiblar yuklangach, AI maslahatni bir marta avtomatik olamiz.
  useEffect(() => {
    if (aiLoadedRef.current) return;
    if (loading || !competitors.length || !hotel?._id) return;
    aiLoadedRef.current = true;
    loadAi();
  }, [loading, competitors.length, hotel?._id, loadAi]);

  // Foydalanuvchining shaxsiy hoteli uchun OTA kanal narxlarini olamiz
  // (Booking, Agoda, Hotels.com …) — raqiblar kartasi bilan bir xil ko'rinishda.
  useEffect(() => {
    if (!hotel?._id) return;
    hotelApi
      .otaChannels({ lite: true })
      .then((data) => {
        const map = {};
        for (const ch of data?.channels || []) {
          if (!(ch?.price > 0)) continue;
          const key = String(ch.source).toLowerCase().replace(/[^a-z0-9]/g, '');
          map[key] = ch.price;
        }
        setOwnChannelPrices(map);
      })
      .catch(() => {});
  }, [hotel?._id]);

  const handleAdd = async () => {
    if (!picked) return;
    setAdding(true);
    try {
      await hotelApi.addCompetitor({
        name: picked.name,
        address: picked.address,
        googlePlaceId: picked.placeId || '',
        osmId: picked.osmId || '',
        lat: picked.lat,
        lng: picked.lng,
      });
      setPicked(null);
      setShowAdd(false);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Xato');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('O\'chirilsinmi?')) return;
    await hotelApi.deleteCompetitor(id);
    setCompetitors((prev) => prev.filter((c) => c._id !== id));
  };

  // Backend qaytargan otaPrices arrayini latestPrices key-value map'iga aylantiradi.
  // Source nomlarini backenddagi normalize bilan bir xil qiladi: "Booking.com" → "bookingcom".
  const otaPricesToMap = (otaPrices = []) => {
    const map = {};
    for (const ota of otaPrices) {
      if (!ota?.source || !(ota.price > 0)) continue;
      const key = String(ota.source).toLowerCase().replace(/[^a-z0-9]/g, '');
      if (key === 'google' || key === 'googlehotels') continue; // aggregator, OTA emas
      map[key] = ota.price;
    }
    return map;
  };

  const mergeCompetitorResult = (comp, result) => ({
    ...comp,
    latestPrices: {
      ...(comp.latestPrices || {}),
      ...otaPricesToMap(result.otaPrices),
    },
    stars: result.stars || comp.stars,
    rating: result.rating || comp.rating,
    lastPriceFetchedAt: result.lastPriceFetchedAt,
  });

  const handleFetchPrice = async (id) => {
    setFetchingId(id);
    try {
      const result = await hotelApi.fetchCompetitorPrice(id);
      setCompetitors((prev) =>
        prev.map((c) => (c._id === id ? mergeCompetitorResult(c, result) : c))
      );
      return result;
    } catch (err) {
      alert(err.response?.data?.error || 'Narx topilmadi');
    } finally {
      setFetchingId(null);
    }
  };

  // SerpAPI kanali topmagan raqib uchun Booking.com narxini HasData'dan oladi.
  const handleFetchHasData = async (id) => {
    setFetchingHasDataId(id);
    try {
      const result = await hotelApi.fetchCompetitorHasData(id);
      setCompetitors((prev) =>
        prev.map((c) => (c._id === id ? mergeCompetitorResult(c, result) : c))
      );
      return result;
    } catch (err) {
      alert(err.response?.data?.error || 'Booking narxi topilmadi');
    } finally {
      setFetchingHasDataId(null);
    }
  };

  const handleBulkFetch = async () => {
    if (bulkProgress.active) return;
    const ids = competitors.map((c) => c._id);
    setBulkProgress({ done: 0, total: ids.length, active: true });
    for (let i = 0; i < ids.length; i++) {
      try {
        const result = await hotelApi.fetchCompetitorPrice(ids[i]);
        setCompetitors((prev) =>
          prev.map((c) => (c._id === ids[i] ? mergeCompetitorResult(c, result) : c))
        );
      } catch {}
      setBulkProgress({ done: i + 1, total: ids.length, active: i + 1 < ids.length });
    }
  };

  // Sahifa ochilganda hech qachon narx olinmagan raqiblar uchun Xotelo (bepul)'dan to'ldirish.
  // `lastPriceFetchedAt` belgisi orqali — backend har urinishda (muvaffaqiyatli yoki yo'q) shu maydonni yangilaydi,
  // shuning uchun qayta refresh'da o'sha raqiblar avto-trigger'ga ilinmaydi (SerpAPI tripadvisor quotasini saqlash uchun).
  // Sessiya ichida ham bir martagina ishga tushadi.
  // Xotelo bulk fetch endi bu sahifada chaqirilmaydi — Xotelo faqat /xotelo sahifasida.
  // Raqib narxlari Apify cron orqali yangilanadi yoki Rate Shopper'dagi
  // "Booking.com'dan olish" tugmasi orqali.
  useEffect(() => {
    if (!loading && !xoteloAutoFetched.current) xoteloAutoFetched.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, competitors.length]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('competitors')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {competitors.length} ta kuzatilayotgan hotel
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          {competitors.length > 0 && (
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
                  viewMode === 'table'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent text-muted-foreground'
                )}
              >
                <List className="h-3.5 w-3.5" /> Jadval
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors border-l border-border',
                  viewMode === 'map'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent text-muted-foreground'
                )}
              >
                <Map className="h-3.5 w-3.5" /> Xarita
              </button>
            </div>
          )}

          {competitors.length > 0 && viewMode === 'table' && (
            <Button variant="outline" size="sm" onClick={handleBulkFetch} disabled={bulkProgress.active} className="gap-1.5">
              {bulkProgress.active ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" />{bulkProgress.done}/{bulkProgress.total}</>
              ) : (
                <><RefreshCw className="h-3.5 w-3.5" />Barchasini yangilash</>
              )}
            </Button>
          )}

          <Button onClick={() => setShowAdd(!showAdd)} size="sm">
            {showAdd ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showAdd ? t('cancel') : t('addCompetitor')}
          </Button>
        </div>
      </div>

      {/* Bulk progress bar */}
      {bulkProgress.total > 0 && (
        <div className="rounded-xl bg-card/60 border border-border/60 p-3.5 flex items-center gap-3">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">
                {bulkProgress.active ? 'Narxlar olinmoqda...' : 'Yangilash tugadi'}
              </span>
              <span className="font-medium tabular-nums">{bulkProgress.done}/{bulkProgress.total}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${(bulkProgress.done / bulkProgress.total) * 100}%` }}
              />
            </div>
          </div>
          {!bulkProgress.active && (
            <button
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setBulkProgress({ done: 0, total: 0, active: false })}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <Card variant="glass" className="animate-fade-up">
          <CardHeader>
            <CardTitle className="text-base">Yangi raqib qo&apos;shish</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Hotelni qidiring</Label>
              <SearchSelect
                placeholder={t('hotelPlaceholder')}
                fetchOptions={(q) => searchApi.hotels(q, hotel?.countryCode, hotelSearchCity)}
                getKey={(h) => h.placeId || h.osmId || h.name}
                getLabel={(h) => h.name}
                renderOption={(h) => (
                  <div>
                    <div className="text-sm font-medium">{h.name}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{h.address}
                    </div>
                  </div>
                )}
                selected={picked}
                onSelect={setPicked}
              />
            </div>
            {picked && (
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                  {picked.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{picked.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{picked.address}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-primary shrink-0" />
              </div>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>{t('cancel')}</Button>
              <Button size="sm" onClick={handleAdd} disabled={!picked || adding}>
                {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                {t('addCompetitor')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map view */}
      {viewMode === 'map' && (
        <div className="animate-fade-up space-y-2">
          <div className="text-[11px] text-muted-foreground bg-primary/5 border border-primary/20 rounded-md px-3 py-2 flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">+</span>
            <span>{t('mapDiscoverHint') || 'Xaritaning biror joyini bosing — atrofdagi mehmonxonalar paydo bo\'ladi. Yashil "+" markerlarni bosib raqib sifatida qo\'shing.'}</span>
          </div>
          <CompetitorMap
            hotel={hotel}
            competitors={competitors}
            myStars={myStars}
            onSelectComp={(c) => setDetailComp(c)}
            enableDiscover
            onAddDiscovered={async (h) => {
              try {
                await hotelApi.addCompetitor({
                  name: h.name,
                  address: h.address,
                  googlePlaceId: h.placeId || '',
                  osmId: h.osmId || '',
                  lat: h.lat,
                  lng: h.lng,
                });
                load();
              } catch (err) {
                alert(err.response?.data?.error || 'Xato');
              }
            }}
          />
        </div>
      )}

      {/* Card view (Competitor Analysis) */}
      {viewMode === 'table' && (
        <div className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Competitor Analysis</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Atrofingizdagi hotellar narxlari va reytinglari</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {/* Own hotel — birinchi karta */}
              {hotel && (
                <HotelCard
                  name={hotel.name}
                  address={hotel.city}
                  distanceKm={0}
                  stars={hotel.stars}
                  rating={hotel.rating}
                  channels={[
                    ...(hotel.currentPrice > 0
                      ? [{ label: 'mening narxim', price: Math.round(hotel.currentPrice) }]
                      : []),
                    ...collectChannelPrices(ownChannelPrices),
                  ]}
                  isOwn
                />
              )}

              {competitors.length === 0 ? (
                <div className="rounded-2xl border bg-card text-center py-16 px-6">
                  <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center mb-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">Hozircha raqiblar yo&apos;q</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Yangi raqiblar qo&apos;shish uchun yuqoridagi tugmadan foydalaning
                  </p>
                </div>
              ) : (
                competitors.map((c, i) => (
                  <motion.div
                    key={c._id}
                    variants={fadeInUp}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: Math.min(i * 0.05, 0.4) }}
                  >
                    <HotelCard
                      name={c.name}
                      address={c.address}
                      distanceKm={c.distanceKm}
                      stars={c.stars}
                      rating={c.rating}
                      channels={collectChannelPrices(c.latestPrices)}
                      onClick={() => setDetailComp(c)}
                      onRefresh={() => handleFetchPrice(c._id)}
                      onFetchHasData={() => handleFetchHasData(c._id)}
                      onDelete={() => handleDelete(c._id)}
                      isFetching={fetchingId === c._id}
                      isFetchingHasData={fetchingHasDataId === c._id}
                    />
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer hints */}
      {competitors.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-center text-[11px] text-muted-foreground/60">
          <span className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            Narx 5%+ o&apos;zgarganda email yuboriladi
          </span>
        </div>
      )}

      {/* AI maslahatchi — sahifa tagida */}
      {competitors.length > 0 && (
        <AiAdvisor
          data={aiData}
          loading={aiLoading}
          error={aiError}
          onRefresh={() => loadAi(true)}
          lang={lang}
        />
      )}

      {/* Detail Modal */}
      {detailComp && (
        <CompetitorDetailModal
          comp={detailComp}
          myPrice={myPrice}
          onClose={() => setDetailComp(null)}
          onFetchPrice={handleFetchPrice}
        />
      )}
    </div>
  );
}

// ─── AI Maslahatchi paneli ─────────────────────────────
function AiAdvisor({ data, loading, error, onRefresh, lang }) {
  const formatPrice = useFormatPrice();
  const L = (uz, ru, en) => (lang === 'uz' ? uz : lang === 'ru' ? ru : en);
  const recs = data?.recommendations || [];

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.04] to-fuchsia-500/[0.03]">
      <div className="px-5 py-3.5 border-b border-border/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-fuchsia-500 text-white flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">
              {L('AI Maslahatchi', 'AI Советник', 'AI Advisor')}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {L('Raqiblar narxiga qarab tavsiyalar', 'Рекомендации по ценам конкурентов', 'Recommendations based on competitor pricing')}
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
          {L('Yangilash', 'Обновить', 'Refresh')}
        </Button>
      </div>

      <CardContent className="p-5">
        {loading && !recs.length ? (
          <div className="py-10 flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">
              {L('AI tahlil qilmoqda...', 'AI анализирует...', 'AI is analyzing...')}
            </p>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={onRefresh}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              {L('Qayta urinish', 'Повторить', 'Retry')}
            </Button>
          </div>
        ) : recs.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {L('Hozircha tavsiya yo\'q. Raqiblar narxini yangilab, qayta urinib ko\'ring.',
               'Пока нет рекомендаций. Обновите цены конкурентов.',
               'No recommendations yet. Refresh competitor prices and try again.')}
          </div>
        ) : (
          <div className="space-y-4">
            {data?.summary && (
              <div className="flex items-start gap-2.5 text-sm bg-card/60 border border-border/60 rounded-xl p-3.5">
                <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{data.summary}</p>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {recs.map((r, i) => (
                <div key={i} className="rounded-xl border border-border/60 bg-card/70 p-4 flex flex-col">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-md bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">
                      {r.priority || i + 1}
                    </span>
                    <h4 className="text-sm font-semibold leading-tight">{r.title}</h4>
                  </div>
                  {r.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed flex-1">{r.description}</p>
                  )}
                  {(r.currentPrice > 0 || r.suggestedPrice > 0) && (
                    <div className="flex items-center gap-2 mt-3 text-sm font-semibold tabular-nums">
                      {r.currentPrice > 0 && <span className="text-muted-foreground line-through">{formatPrice(r.currentPrice)}</span>}
                      {r.suggestedPrice > 0 && (
                        <>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-emerald-600 dark:text-emerald-400">{formatPrice(r.suggestedPrice)}</span>
                        </>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                    {r.platform && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {r.platform}
                      </span>
                    )}
                    {r.expectedImpact && (
                      <span className="text-[10px] text-muted-foreground">{r.expectedImpact}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {L('AI tomonidan yaratilgan — yakuniy qarorni o\'zingiz qabul qiling',
                 'Сгенерировано ИИ — окончательное решение за вами',
                 'AI-generated — final decision is yours')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
