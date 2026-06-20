﻿﻿﻿﻿﻿import { useState, useEffect } from 'react';
import {
  RefreshCw, AlertCircle, Settings2, TrendingDown, TrendingUp,
  X, Loader2, CheckCircle2, AlertTriangle, XCircle, Download,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useT, useLang } from '@/lib/i18n';
import { hotelApi } from '@/lib/api';
import { cn, formatPrice } from '@/lib/utils';
import { getOtaBrand } from '@/lib/otaBrands';

// "Fetched from X via Y" yorlig'i - qaysi tashqi API'dan kelgan
const VIA_LABEL = {
  serpapi: { uz: ' ', en: ' ', ru: ' ' },
  serp: { uz: ' ', en: ' ', ru: ' ' },
  google_hotels: { uz: 'Google Hotels orqali olindi', en: 'Fetched via Google Hotels', ru: 'Получено через Google Hotels' },
  manual: { uz: '', en: '', ru: '' },
  cached: { uz: '', en: '', ru: '' },
};

function viaLabel(via, lang) {
  if (!via) return null;
  const row = VIA_LABEL[via];
  if (!row) return null;
  return row[lang] || row.en;
}

// Status ranglari — dizayn tizimi tokenlaridan (success / warning / destructive)
const STATUS_VISUAL = {
  connected: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success-bg' },
  attention: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning-bg' },
  disconnected: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
};

function statusLabel(status, lang) {
  if (status === 'connected') return lang === 'uz' ? 'Ulangan' : 'Connected';
  if (status === 'attention') return lang === 'uz' ? "E'tibor kerak" : 'Needs attention';
  return lang === 'uz' ? 'Uzilgan' : 'Disconnected';
}

export default function OtaChannels() {
  const t = useT();
  const lang = useLang((s) => s.lang);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      // Lite rejim — faqat saqlangan ma'lumotlar (xotelo + manual + kesh).
      // SerpAPI va Apify chaqirilmaydi. Foydalanuvchi kerakli kanalga
      // tepadagi tugmalar orqali alohida so'rov yuboradi.
      const res = await hotelApi.otaChannels({ lite: true });
      console.log('OTA Channels:', res);
      setData(res);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // SerpAPI qaytargan barcha kanallarni ko'rsatamiz — hech qanday hard-coded
  // ro'yxat yo'q. Google Hotels qaysi OTA'larni qaytarsa, hammasi narxi bilan
  // chiziladi (arzondan qimmatga).
  const channels = (data?.channels || [])
    .filter((c) => c.price > 0)
    .sort((a, b) => (a.price || 0) - (b.price || 0));

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {lang === 'uz' ? "Kanallar bo'yicha tafsilot" : 'Channel Detail'}
            </h1>
            {data?.source && data.source !== 'none' && (
              <Badge variant="outline" className="text-[10px]">
                {data.source === 'serpapi' || data.source === 'serp' ? (lang === 'uz' ? 'Avto' : 'Auto') : data.source}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{lang === 'uz' ? 'Har bir OTA-partner unumdorligi' : 'Performance of each OTA partner'}</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={cn('h-3.5 w-3.5 mr-1.5', loading && 'animate-spin')} />
          {t('refresh')}
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 dark:border-red-800/50">
          <CardContent className="py-4 text-sm text-red-600 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </CardContent>
        </Card>
      )}

      {/* SerpAPI — barcha kanallarni bitta so'rovda olish (Google Hotels) */}
      <SerpAllChannelsCard
        configured={data?.providers?.serpapi?.configured}
        lang={lang}
        onFetched={load}
      />

      <Card variant="glass" className="overflow-hidden">
        <CardContent className="p-0">
          {loading && !data ? (
            <div className="divide-y divide-border/60">
              {['Booking.com', 'Agoda', 'Hotels.com', 'Expedia', 'Trip.com'].map((source, idx) => (
                <ChannelRowSkeleton key={source} source={source} delayMs={idx * 80} />
              ))}
              <div className="px-5 py-2 text-[11px] text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                {lang === 'uz' ? "Kanallar yuklanmoqda — biroz vaqt olishi mumkin" : 'Loading channels — this may take a moment'}
              </div>
            </div>
          ) : channels.length === 0 ? (
            <div className="py-10 px-5 text-center text-sm text-muted-foreground">
              {lang === 'uz'
                ? "Hozircha kanal narxlari yo'q — yuqoridagi \"Hammasini olib kelish\" tugmasini bosing."
                : 'No channel prices yet — click "Fetch all" above.'}
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {channels.map((ch, idx) => (
                <div key={ch.source} style={{ animationDelay: `${idx * 40}ms` }} className="animate-fade-up">
                  <ChannelRow
                    channel={ch}
                    lang={lang}
                    onConfigure={() => setSelected(ch)}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selected && (
        <ChannelDetailModal
          channel={selected}
          lang={lang}
          onClose={() => setSelected(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}

function SerpAllChannelsCard({ configured, lang, onFetched }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const l = (uz, en) => lang === 'uz' ? uz : en;

  async function run() {
    setBusy(true); setErr(''); setResult(null);
    try {
      const res = await hotelApi.fetchAllOtaChannels();
      setResult(res);
      onFetched?.();
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setBusy(false); }
  }

  if (configured === undefined) return null;

  return (
    <Card className={cn(
      'border-2',
      configured
        ? 'border-primary/30 bg-primary/5'
        : 'border-border'
    )}>
      <CardContent className="py-4 flex items-center gap-3 flex-wrap">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 via-amber-500 to-emerald-500 text-white flex items-center justify-center shrink-0 font-bold shadow-soft">
          G
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold flex items-center gap-1.5 flex-wrap">
            {l('Google Hotels — barcha kanallar', 'Google Hotels — all channels')}
            <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">
              {l('Avto', 'Auto')}
            </Badge>
            {!configured && (
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                {l('Sozlanmagan', 'Not configured')}
              </Badge>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {l(
              'Bir so\'rovda Booking.com, Agoda, Hotels.com, Expedia, Trip.com va boshqalar (soliqsiz, sof narx)',
              'One request → Booking.com, Agoda, Hotels.com, Expedia, Trip.com and more (clean, tax-excluded prices)'
            )}
          </div>
          {result && result.channels > 0 && (
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 font-medium">
              ✓ {result.channels} {l('kanal yangilandi', 'channels updated')}
              {result.otaPrices?.length > 0 && (
                <span className="text-muted-foreground font-normal">
                  {' '}— {result.otaPrices.slice(0, 4).map((o) => `${o.source} $${o.price}`).join(', ')}
                  {result.otaPrices.length > 4 && ` +${result.otaPrices.length - 4}`}
                </span>
              )}
            </div>
          )}
          {result && result.channels === 0 && (
            <div className="text-[11px] text-amber-600 mt-1">
              {l('Narx topilmadi', 'No prices found')}
            </div>
          )}
          {err && (
            <div className="text-[11px] text-rose-600 mt-1">⚠ {err}</div>
          )}
        </div>
        <Button
          onClick={run}
          disabled={busy || !configured}
          className="shrink-0"
        >
          {busy
            ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            : <Download className="h-3.5 w-3.5 mr-1.5" />}
          {busy
            ? l('Olib kelinmoqda...', 'Fetching...')
            : l('Hammasini olib kelish', 'Fetch all')}
        </Button>
      </CardContent>
    </Card>
  );
}

function ChannelRowSkeleton({ source, delayMs }) {
  const v = getOtaBrand(source);
  return (
    <div className="flex items-center gap-4 px-5 py-4 animate-pulse" style={{ animationDelay: `${delayMs}ms` }}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={cn(
          'w-11 h-11 rounded-2xl text-white font-semibold text-sm flex items-center justify-center shrink-0 shadow-soft ring-1 ring-white/20 opacity-60',
          v.gradient
        )}>
          {v.short}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="text-sm font-medium text-muted-foreground/70">{source}</div>
          <div className="h-2.5 w-24 bg-muted rounded" />
        </div>
      </div>
      <div className="hidden sm:block text-right shrink-0 min-w-[90px] space-y-1">
        <div className="h-2 w-16 bg-muted rounded ml-auto" />
        <div className="h-3.5 w-14 bg-muted rounded ml-auto" />
      </div>
      <div className="hidden md:block w-32 shrink-0 space-y-1">
        <div className="h-1.5 w-full bg-muted rounded-full" />
        <div className="h-2 w-20 bg-muted rounded" />
      </div>
      <div className="h-8 w-20 bg-muted rounded shrink-0" />
    </div>
  );
}

function ChannelRow({ channel, lang, onConfigure }) {
  // Bu sahifada narxlar har doim USD'da (SerpAPI manbai bilan bir xil) —
  // so'm/rublga konvertatsiya yo'q, foydalanuvchi so'roviga ko'ra.
  const v = getOtaBrand(channel.source);
  const status = STATUS_VISUAL[channel.status] || STATUS_VISUAL.disconnected;
  const StatusIcon = status.icon;
  const trend = channel.trendPct || 0;
  const TrendIcon = trend >= 0 ? TrendingUp : TrendingDown;
  const trendColor = trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-rose-500' : 'text-muted-foreground';
  const isConnected = channel.status === 'connected';
  const via = viaLabel(channel.via, lang);

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-accent/40 smooth">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {channel.logo ? (
          <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-100 flex items-center justify-center shrink-0 shadow-soft ring-1 ring-white/20 overflow-hidden p-1.5">
            <img
              src={channel.logo}
              alt={channel.source}
              className="w-full h-full object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        ) : (
          <div className={cn(
            'w-11 h-11 rounded-2xl text-white font-semibold text-sm flex items-center justify-center shrink-0 shadow-soft ring-1 ring-white/20',
            v.gradient
          )}>
            {v.short}
          </div>
        )}
        <div className="min-w-0">
          <div className="font-medium text-sm truncate flex items-center gap-2">
            {channel.source}
            {channel.official && (
              <Badge variant="outline" className="text-[9px] h-4 px-1 border-emerald-300 text-emerald-600">
                {lang === 'uz' ? 'Rasmiy' : 'Official'}
              </Badge>
            )}
            {channel.link && (
              <a href={channel.link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline">{'↗'}</a>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <div className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium', status.bg, status.color)}>
              <StatusIcon className="h-2.5 w-2.5" />
              <span>{statusLabel(channel.status, lang)}</span>
            </div>
            {via && (
              <span className="text-[10px] text-muted-foreground/80 italic truncate max-w-[200px]">
                {via}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="hidden sm:block text-right shrink-0 min-w-[90px]">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {lang === 'uz' ? 'Narx / kecha' : 'Price / night'}
        </div>
        <div className="text-base font-semibold tabular-nums mt-0.5">
          {isConnected && channel.price > 0 ? formatPrice(channel.price) : '-'}
        </div>
      </div>

      <div className="hidden md:block w-32 shrink-0">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
          <span>{lang === 'uz' ? 'Ulush' : 'Share'}</span>
          <span className="font-medium text-foreground">{channel.sharePct}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${channel.sharePct}%` }} />
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5">
          <span>Trend</span>
          <span className={cn('font-medium inline-flex items-center gap-0.5', trendColor)}>
            {trend !== 0 && <TrendIcon className="h-3 w-3" />}
            {trend !== 0 ? `${Math.abs(trend)}%` : '-'}
          </span>
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={onConfigure} className="shrink-0">
        <Settings2 className="h-3.5 w-3.5 mr-1.5" />
        {lang === 'uz' ? 'Sozlash' : 'Configure'}
      </Button>
    </div>
  );
}

function ChannelDetailModal({ channel, lang, onClose, onSaved }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [manualPrice, setManualPrice] = useState(channel.price > 0 ? String(channel.price) : '');
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const v = getOtaBrand(channel.source);

  useEffect(() => {
    let alive = true;
    hotelApi.otaChannelDetail(channel.source)
      .then((d) => {
        if (!alive) return;
        setDetail(d);
        // Kanal uzilgan bo'lsa va oxirgi ma'lum narx bor bo'lsa - inputga to'ldirish
        if (channel.price === 0 && d?.summary?.last > 0) {
          setManualPrice(String(d.summary.last));
        }
      })
      .catch(() => { if (alive) setDetail({ trend: [], summary: null }); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [channel.source]);

  async function savePrice() {
    setSaving(true);
    try {
      const p = parseFloat(manualPrice) || 0;
      await hotelApi.setOtaChannelPrice(channel.source, p);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
      onSaved?.();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  }

  const trend = detail?.trend || [];
  const summary = detail?.summary;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div
        className="glass-strong rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-lg text-white font-semibold text-sm flex items-center justify-center', v.gradient)}>
              {v.short}
            </div>
            <div>
              <div className="font-semibold">{channel.source}</div>
              <div className="text-xs text-muted-foreground">
                {lang === 'uz' ? 'Kanal sozlamalari va analitika' : 'Channel settings & analytics'}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryBox
              label={lang === 'uz' ? 'Hozirgi narx' : 'Current price'}
              value={summary?.last ? formatPrice(summary.last) : '-'}
            />
            <SummaryBox
              label={lang === 'uz' ? "O'rtacha" : 'Average'}
              value={summary?.avg ? formatPrice(summary.avg) : '-'}
            />
            <SummaryBox
              label="Min"
              value={summary?.min ? formatPrice(summary.min) : '-'}
              accent="green"
            />
            <SummaryBox
              label="Max"
              value={summary?.max ? formatPrice(summary.max) : '-'}
              accent="red"
            />
          </div>

          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">
              {lang === 'uz' ? '30 kunlik narx trend' : '30-day price trend'}
            </div>
            <div className="border rounded-lg p-4 bg-muted/20">
              {loading ? (
                <div className="h-32 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : trend.length < 2 ? (
                <div className="h-32 flex items-center justify-center text-xs text-muted-foreground">
                  {lang === 'uz' ? "Trend uchun ma'lumot yetarli emas" : 'Not enough data for trend'}
                </div>
              ) : (
                <SparkLine points={trend.map((p) => p.price)} />
              )}
            </div>
          </div>

          <div className="border rounded-lg p-3 space-y-2">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground block">{lang === 'uz' ? "Narx qo'lda kiritish" : 'Manual price entry'}</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <input
                  type="number"
                  min="0"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(e.target.value)}
                  placeholder={lang === 'uz' ? 'masalan 85' : 'e.g. 85'}
                  className="w-full pl-7 pr-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <Button onClick={savePrice} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : savedFlash ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : null}
                {savedFlash
                  ? (lang === 'uz' ? 'Saqlandi' : 'Saved')
                  : (lang === 'uz' ? 'Saqlash' : 'Save')}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {lang === 'uz'
                ? "API'dan narx kelmasa, bu yerga o'zingiz kiriting. 0 yozsangiz o'chiriladi."
                : 'If API has no price, enter manually. 0 to clear.'}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              {lang === 'uz' ? 'Yopish' : 'Close'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryBox({ label, value, accent }) {
  const accentClass = {
    green: 'text-emerald-600',
    red: 'text-rose-500',
  }[accent] || 'text-foreground';
  return (
    <div className="border rounded-lg p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn('text-lg font-semibold tabular-nums mt-1', accentClass)}>{value}</div>
    </div>
  );
}

function SparkLine({ points }) {
  if (!points || points.length < 2) return null;
  const w = 600;
  const h = 120;
  const pad = 8;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = (w - pad * 2) / (points.length - 1);
  const path = points
    .map((p, i) => {
      const x = pad + i * step;
      const y = h - pad - ((p - min) / range) * (h - pad * 2);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const areaPath = `${path} L${w - pad},${h - pad} L${pad},${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32">
      <defs>
        <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#spark-grad)" className="text-primary" />
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
    </svg>
  );
}
