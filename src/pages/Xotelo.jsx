import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  RefreshCw, CheckCircle2, AlertTriangle, Key, Globe,
  Loader2, ExternalLink, Settings2, Info, Zap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { hotelApi } from '@/lib/api';
import { cn, useFormatPrice } from '@/lib/utils';
import { useLang } from '@/lib/i18n';

const CHANNEL_VISUAL = {
  'Booking.com': { bg: 'bg-gradient-to-br from-blue-500 to-blue-700', short: 'B.' },
  'Agoda':        { bg: 'bg-gradient-to-br from-rose-500 to-fuchsia-600', short: 'A' },
  'Hotels.com':   { bg: 'bg-gradient-to-br from-orange-400 to-red-600', short: 'H' },
  'Expedia':      { bg: 'bg-gradient-to-br from-amber-400 to-fuchsia-600', short: 'E' },
  'Vio.com':      { bg: 'bg-gradient-to-br from-violet-400 to-purple-700', short: 'V' },
  'Trip.com':     { bg: 'bg-gradient-to-br from-sky-400 to-blue-700', short: 'T' },
  'Priceline':    { bg: 'bg-gradient-to-br from-indigo-400 to-indigo-700', short: 'P' },
  'TripAdvisor':  { bg: 'bg-gradient-to-br from-teal-400 to-emerald-600', short: 'TA' },
};

function getV(src) {
  return CHANNEL_VISUAL[src] || { bg: 'bg-slate-500', short: src.slice(0, 2).toUpperCase() };
}

function l(lang, uz, ru, en) {
  return lang === 'uz' ? uz : lang === 'ru' ? ru : en;
}

// "2026-06-01" → "1-iyun" / "1 июн" / "Jun 1"
function fmtCheckIn(iso, lang) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const locale = lang === 'ru' ? 'ru-RU' : lang === 'uz' ? 'uz-UZ' : 'en-US';
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}

export default function Xotelo() {
  const lang = useLang((s) => s.lang);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await hotelApi.xoteloRates();
      setData(res);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // Yangi /xotelo-rates endpointi to'g'ridan-to'g'ri Xotelo narxlarini qaytaradi.
  const xotelo = data ? { configured: data.configured, hotelKey: data.hotelKey } : null;
  const xoteloChannels = data?.channels || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-semibold tracking-tight">{l(lang, 'Bepul narxlar', 'Бесплатные цены', 'Free prices')}</h1>
            <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300">
              {l(lang, 'Bepul API', 'Бесплатный API', 'Free API')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {l(lang,
              'TripAdvisor URL orqali 8 ta OTA kanalidan bepul narx olish',
              'Бесплатное получение цен от 8 OTA каналов через TripAdvisor URL',
              'Free price fetching from 8 OTA channels via TripAdvisor URL'
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={cn('h-3.5 w-3.5 mr-1.5', loading && 'animate-spin')} />
          {l(lang, 'Yangilash', 'Обновить', 'Refresh')}
        </Button>
      </div>

      {error && (
        <Card className="border-red-200">
          <CardContent className="py-3 text-sm text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />{error}
          </CardContent>
        </Card>
      )}

      {/* Status card */}
      {loading && !data ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : xotelo?.configured ? (
        <ConfiguredView lang={lang} xotelo={xotelo} channels={xoteloChannels} onRefresh={load} loading={loading} />
      ) : (
        <NotConfiguredView lang={lang} />
      )}

      {/* Qanday ishlaydi */}
      <HowItWorks lang={lang} />
    </div>
  );
}

function ConfiguredView({ lang, xotelo, channels, onRefresh, loading }) {
  const formatPrice = useFormatPrice();
  return (
    <div className="space-y-5">
      {/* Hotel key */}
      <Card className="border-emerald-200 dark:border-emerald-800/50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  {l(lang, 'Ulangan', 'Подключено', 'Connected')}
                  {xotelo.autoFound && (
                    <span className="ml-2 text-[10px] font-normal bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 px-1.5 py-0.5 rounded">
                      {l(lang, 'Avtomatik topildi', 'Найден автоматически', 'Auto-discovered')}
                    </span>
                  )}
                </div>
                {xotelo.hotelKey && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Key className="h-3 w-3 text-muted-foreground" />
                    <code className="text-[11px] text-muted-foreground font-mono">{xotelo.hotelKey}</code>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px]">
                {l(lang, `${channels.length} ta kanal`, `${channels.length} каналов`, `${channels.length} channels`)}
              </Badge>
              <Link to="/settings">
                <Button variant="outline" size="sm">
                  <Settings2 className="h-3.5 w-3.5 mr-1.5" />
                  {l(lang, 'Sozlamalar', 'Настройки', 'Settings')}
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanallar */}
      {channels.length > 0 ? (
        <Card className="overflow-hidden">
          <div className="px-5 py-3 border-b flex items-center justify-between">
            <div className="text-sm font-semibold">
              {l(lang, 'Kelgan narxlar', 'Полученные цены', 'Fetched prices')}
            </div>
            <span className="text-[11px] text-muted-foreground">
              {l(lang, 'Ertaga + indin (soliqsiz)', 'Завтра + послезавтра (без налога)', 'Tomorrow + day after (excl. tax)')}
            </span>
          </div>
          <CardContent className="p-0 divide-y divide-border/60">
            {channels.map((ch) => {
              const v = getV(ch.source);
              return (
                <div key={ch.source} className="flex items-center gap-4 px-5 py-3.5 hover:bg-accent/30 transition-colors">
                  <div className={cn('w-9 h-9 rounded-xl text-white font-semibold text-xs flex items-center justify-center shrink-0', v.bg)}>
                    {v.short}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{ch.source}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {ch.checkIn
                        ? l(lang, `${fmtCheckIn(ch.checkIn, lang)} uchun`, `на ${fmtCheckIn(ch.checkIn, lang)}`, `for ${fmtCheckIn(ch.checkIn, lang)}`)
                        : l(lang, 'Bepul narx manbai', 'Бесплатный источник цен', 'Free price source')}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-base font-semibold tabular-nums">
                      {ch.price > 0 ? formatPrice(ch.price) : '-'}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {l(lang, '/ kecha', '/ ночь', '/ night')}
                    </div>
                  </div>
                  <div className="hidden md:block text-right shrink-0 w-20">
                    <div className="text-[10px] text-muted-foreground">{l(lang, 'Ulush', 'Доля', 'Share')}</div>
                    <div className="text-sm font-medium">{ch.sharePct}%</div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <Globe className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              {l(lang,
                'Narxlar kelmadi. Yangilang yoki TripAdvisor URL ni tekshiring.',
                'Цены не получены. Обновите или проверьте TripAdvisor URL.',
                'No prices fetched. Refresh or check your TripAdvisor URL.'
              )}
            </p>
            <Button variant="outline" size="sm" className="mt-3" onClick={onRefresh} disabled={loading}>
              <RefreshCw className={cn('h-3.5 w-3.5 mr-1.5', loading && 'animate-spin')} />
              {l(lang, 'Qayta urinish', 'Повторить', 'Retry')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function NotConfiguredView({ lang }) {
  return (
    <Card className="border-amber-200 dark:border-amber-800/50">
      <CardContent className="py-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-amber-700 dark:text-amber-300 mb-1">
              {l(lang, 'Ulanmagan', 'Не подключено', 'Not connected')}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {l(lang,
                'Bepul narxlar ishlashi uchun hotelingizning TripAdvisor sahifasi URL manzilini kiriting.',
                'Для работы бесплатных цен введите URL страницы вашего отеля на TripAdvisor.',
                'To enable free prices, add your hotel\'s TripAdvisor page URL.'
              )}
            </p>
            <div className="space-y-2 mb-5">
              {[
                l(lang, '1. TripAdvisor.com ga kiring', '1. Зайдите на TripAdvisor.com', '1. Go to TripAdvisor.com'),
                l(lang, '2. Hotelingizni qidiring va sahifasini oching', '2. Найдите и откройте страницу вашего отеля', '2. Find your hotel page'),
                l(lang, '3. Brauzer manzil qatoridagi URLni ko\'chiring', '3. Скопируйте URL из адресной строки', '3. Copy the URL from the address bar'),
                l(lang, '4. Sozlamalar → TripAdvisor URL ga joylashtiring', '4. Вставьте в Настройки → TripAdvisor URL', '4. Paste in Settings → TripAdvisor URL'),
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                  {step}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link to="/settings">
                <Button size="sm">
                  <Settings2 className="h-3.5 w-3.5 mr-1.5" />
                  {l(lang, 'Sozlamalarga o\'tish', 'Перейти в настройки', 'Go to Settings')}
                </Button>
              </Link>
              <a
                href="https://tripadvisor.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  TripAdvisor
                </Button>
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HowItWorks({ lang }) {
  const steps = [
    {
      icon: Globe,
      title: l(lang, 'TripAdvisor URL', 'TripAdvisor URL', 'TripAdvisor URL'),
      desc: l(lang,
        'Hotel ID ni TripAdvisor URL dan (g{id}-d{id} format) avtomatik ajratib oladi',
        'Автоматически извлекает Hotel ID из TripAdvisor URL (формат g{id}-d{id})',
        'Auto-extracts Hotel ID from TripAdvisor URL (g{id}-d{id} format)'
      ),
    },
    {
      icon: Zap,
      title: l(lang, 'Bepul API', 'Бесплатный API', 'Free API'),
      desc: l(lang,
        'Bepul narx manbai — ro\'yxatdan o\'tish shart emas',
        'Бесплатный источник цен — регистрация не нужна',
        'Free price source — no registration required'
      ),
    },
    {
      icon: Key,
      title: l(lang, '8 ta kanal', '8 каналов', '8 channels'),
      desc: l(lang,
        'Booking.com, Agoda, Hotels.com, Expedia, Vio.com, Trip.com, Priceline, TripAdvisor',
        'Booking.com, Agoda, Hotels.com, Expedia, Vio.com, Trip.com, Priceline, TripAdvisor',
        'Booking.com, Agoda, Hotels.com, Expedia, Vio.com, Trip.com, Priceline, TripAdvisor'
      ),
    },
    {
      icon: Info,
      title: l(lang, 'Cheklov', 'Ограничение', 'Limitation'),
      desc: l(lang,
        'Ba\'zi kanallar (Expedia, Priceline) har doim narx bermaydi — bu normal holat',
        'Некоторые каналы (Expedia, Priceline) не всегда возвращают цены — это нормально',
        'Some channels (Expedia, Priceline) don\'t always return prices — that\'s normal'
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
        {l(lang, 'Qanday ishlaydi', 'Как работает', 'How it works')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {steps.map((s, i) => (
          <div key={i} className="flex items-start gap-3 p-4 border rounded-xl bg-card">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <s.icon className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-medium mb-0.5">{s.title}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
