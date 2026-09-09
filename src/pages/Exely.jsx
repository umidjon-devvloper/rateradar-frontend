import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  Plug, Loader2, RefreshCw, Check, AlertCircle, BedDouble, Tag, Globe,
  CalendarClock, Users, Info, Database, BarChart3 as BarChartIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { metricsApi, integrationApi } from '@/lib/api';
import { useLang } from '@/lib/i18n';
import { getCache, setCache } from '@/lib/clientCache';
import { cn, formatUzsCompact } from '@/lib/utils';
import ExelyStateCard, { classifyExelyError } from '@/components/ExelyStateCard';
import RateGapCard from '@/components/RateGapCard';

// ════════════════════════════════════════════════════════════════════
// EXELY — o'z bronlarimdan chiqadigan HAMMA narsa bitta sahifada.
//
// Dashboard'dagi kartalar "bugun nima qilay" savoliga javob beradi.
// Bu sahifa boshqa savolga: "biznesim aslida qanday ishlaydi" —
// qaysi kanal pul keltiradi, qaysi xona turi bo'sh qoladi, mehmonlar
// qachon bron qiladi, qaysi tarif ishlaydi.
//
// Har bir bo'lim BITTA savolga javob beradi va o'lchov birligi
// har joyda bir xil: XONA-TUN (bron emas). 2 xonali 3 tunlik bron =
// 6 xona-tun. Faqat shu birlikda kanallar solishtiriladi.
// ════════════════════════════════════════════════════════════════════

const PERIODS = [
  { days: 90, uz: '90 kun', ru: '90 дн', en: '90 d' },
  { days: 364, uz: '1 yil', ru: '1 год', en: '1 y' },
];

const DOW = {
  uz: ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'],
  ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

const LEAD_LABEL = {
  past:     { uz: "o'tmish", ru: 'прошлое', en: 'past' },
  same_day: { uz: 'kelgan kuni', ru: 'в день заезда', en: 'same day' },
  '1_3':    { uz: '1–3 kun', ru: '1–3 дн', en: '1–3 d' },
  '4_7':    { uz: '4–7 kun', ru: '4–7 дн', en: '4–7 d' },
  '8_14':   { uz: '8–14 kun', ru: '8–14 дн', en: '8–14 d' },
  '15_30':  { uz: '15–30 kun', ru: '15–30 дн', en: '15–30 d' },
  '31_90':  { uz: '31–90 kun', ru: '31–90 дн', en: '31–90 d' },
  '90_plus':{ uz: '90+ kun', ru: '90+ дн', en: '90+ d' },
};

function ymd(d) { return d.toISOString().slice(0, 10); }

/** Bo'lim qobig'i — sarlavha + izoh + tarkib. */
function Section({ icon: Icon, title, hint, tone = 'from-slate-500 to-slate-600', children, right }) {
  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border/60 flex items-center gap-2.5">
        <div className={cn('w-8 h-8 rounded-lg text-white flex items-center justify-center shrink-0 bg-gradient-to-br', tone)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">{title}</div>
          {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
        </div>
        {right}
      </div>
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}

/**
 * Kesim jadvali. Grafik EMAS — chunki bu yerda bir vaqtda 4 ta o'lchov
 * solishtiriladi (tun, ulush, ADR, bekor qilish). Grafikda ular bir-birini
 * bosib ketardi; jadval + ulush chizig'i aniqroq va zichroq.
 */
function BreakdownTable({ rows, lang, showCancel = false, emptyText }) {
  const L = (uz, ru, en) => (lang === 'uz' ? uz : lang === 'ru' ? ru : en);
  if (!rows?.length) return <div className="text-xs text-muted-foreground py-4">{emptyText}</div>;
  const max = Math.max(...rows.map((r) => r.roomNights), 1);

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-xs min-w-[520px]">
        <thead>
          <tr className="text-[10px] uppercase tracking-wide text-muted-foreground">
            <th className="text-left font-medium pb-2 pl-1">{L('Nomi', 'Название', 'Name')}</th>
            <th className="text-right font-medium pb-2">{L('Xona-tun', 'Ночей', 'Room-nights')}</th>
            <th className="text-right font-medium pb-2 w-[26%]">{L('Ulush', 'Доля', 'Share')}</th>
            <th className="text-right font-medium pb-2">ADR</th>
            {showCancel && <th className="text-right font-medium pb-2 pr-1">{L('Bekor', 'Отмены', 'Cancel')}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-t border-border/50">
              <td className="py-2 pl-1 pr-2 font-medium truncate max-w-[190px]" title={r.label}>{r.label}</td>
              <td className="py-2 text-right tabular-nums">{r.roomNights.toLocaleString()}</td>
              <td className="py-2 pl-2">
                <div className="flex items-center gap-2 justify-end">
                  <div className="flex-1 h-1.5 rounded-full bg-muted/70 overflow-hidden max-w-[110px]">
                    <div className="h-full bg-primary/70" style={{ width: `${(r.roomNights / max) * 100}%` }} />
                  </div>
                  <span className="tabular-nums text-muted-foreground w-10 text-right">{r.share}%</span>
                </div>
              </td>
              <td className="py-2 text-right tabular-nums">{r.adr ? formatUzsCompact(r.adr, lang) : '—'}</td>
              {showCancel && (
                <td className={cn('py-2 text-right tabular-nums pr-1',
                  r.cancellationRate > 30 ? 'text-rose-600 dark:text-rose-400 font-medium' : 'text-muted-foreground')}>
                  {r.cancellationRate != null ? `${r.cancellationRate}%` : '—'}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Bitta o'lchovli ustunli diagramma (bitta o'q — ikkinchi shkala yo'q). */
function SimpleBars({ data, xKey, yKey, lang, tooltipLabel, highlightMax = false }) {
  const max = Math.max(...data.map((d) => d[yKey]), 0);
  return (
    <ResponsiveContainer width="100%" height={170} minWidth={0}>
      <BarChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.4)" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false} axisLine={false} interval={0} />
        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false} axisLine={false} width={44} allowDecimals={false} />
        <ReTooltip
          cursor={{ fill: 'hsl(var(--muted)/0.35)' }}
          contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))',
            borderRadius: '8px', fontSize: '11px' }}
          separator=" "
          formatter={(v) => [v.toLocaleString(), tooltipLabel]}
        />
        <Bar dataKey={yKey} radius={[4, 4, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i}
              fill={highlightMax && d[yKey] === max ? 'hsl(var(--primary))' : 'hsl(var(--primary)/0.45)'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function Exely() {
  const lang = useLang((s) => s.lang);
  const L = (uz, ru, en) => (lang === 'uz' ? uz : lang === 'ru' ? ru : en);

  const [days, setDays] = useState(364);
  const [integ, setInteg] = useState(null);
  const [prop, setProp] = useState(null);
  const [data, setData] = useState(() => getCache(`exelyPage:364`, 30 * 60_000));
  const [loading, setLoading] = useState(true);
  // null = hammasi joyida. Aks holda ExelyStateCard ko'rsatiladigan holat.
  const [failState, setFailState] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    integrationApi.exely().then(setInteg).catch(() => {});
    integrationApi.exelyProperty().then(setProp).catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    const key = `exelyPage:${days}`;
    const cached = getCache(key, 30 * 60_000);
    setData(cached);
    setLoading(!cached);

    const to = new Date(); to.setUTCHours(0, 0, 0, 0);
    const from = new Date(to.getTime() - (days - 1) * 86400_000);
    const [f, t] = [ymd(from), ymd(to)];

    Promise.all([
      metricsApi.summary(f, t),
      metricsApi.breakdown('channel', f, t),
      metricsApi.breakdown('roomType', f, t),
      metricsApi.breakdown('ratePlan', f, t),
      metricsApi.breakdown('dow', f, t),
      metricsApi.breakdown('month', f, t),
      metricsApi.distributions(f, t),
    ])
      .then(([summary, channel, roomType, ratePlan, dow, month, dist]) => {
        if (!alive) return;
        const next = { summary, channel, roomType, ratePlan, dow, month, dist };
        setData(next); setCache(key, next);
        setFailState(null);
      })
      .catch((err) => { if (alive) setFailState(classifyExelyError(err)); })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  }, [days]);

  async function doSync() {
    setSyncing(true);
    try { await integrationApi.syncExely(); } catch { /* 409 — allaqachon ketyapti */ }
    setTimeout(() => integrationApi.exely().then(setInteg).catch(() => {}), 2000);
    setTimeout(() => setSyncing(false), 2000);
  }

  // ── Ma'lumot yo'q: sabab QANDAY bo'lishidan qat'i nazar tushuntiriladi ──
  // Ilgari bu yerda faqat 409 tekshirilardi va boshqa xatoda sahifa
  // butunlay bo'sh qolardi (real hodisa: server yangilanmagan → 404 → oq ekran).
  if (failState) {
    return (
      <div className="space-y-6 animate-fade-in max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight">Exely</h1>
        <ExelyStateCard state={failState} />
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  // Bu yerga yetib kelib ma'lumot bo'lmasa — kutilmagan holat, lekin
  // baribir bo'sh ekran ko'rsatmaymiz.
  if (!data) return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Exely</h1>
      <ExelyStateCard state="error" />
    </div>
  );

  const s = data.summary;
  const pending = integ?.pendingDetails || 0;

  const dowRows = (data.dow?.rows || []).map((r) => ({
    ...r, label: (DOW[lang] || DOW.en)[Number(r.key) - 1] || r.key,
  }));
  const monthRows = (data.month?.rows || []).map((r) => ({ ...r, label: r.key.slice(2) }));
  const leadRows = (data.dist?.leadTime || []).map((b) => ({
    ...b, label: (LEAD_LABEL[b.bucket] || {})[lang] || b.bucket,
  }));

  const kpis = [
    { label: L('To‘lish', 'Загрузка', 'Occupancy'), value: s.occupancy != null ? `${s.occupancy}%` : '—', accent: true },
    { label: 'ADR', value: formatUzsCompact(s.adr, lang) },
    { label: 'RevPAR', value: formatUzsCompact(s.revPar, lang) },
    { label: L('Tushum', 'Доход', 'Revenue'), value: formatUzsCompact(s.revenue, lang) },
    { label: L('Xona-tun', 'Ночей', 'Room-nights'), value: s.roomNights.toLocaleString(), sub: `/ ${s.availableRoomNights.toLocaleString()}` },
    { label: L('Bekor qilish', 'Отмены', 'Cancellations'), value: `${s.behaviour.cancellationRate}%`, sub: `${s.behaviour.cancelled}/${s.behaviour.bookings}` },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── Sarlavha + ulanish holati ───────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            Exely
            {integ?.status === 'active' && (
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                <Check className="h-3 w-3 mr-1" />{L('ulangan', 'подключено', 'connected')}
              </Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {integ?.property?.name || '—'}
            {integ?.sync?.totalBookings ? ` · ${integ.sync.totalBookings.toLocaleString()} ${L('bron', 'броней', 'bookings')}` : ''}
            {pending > 0 && ` · ${pending.toLocaleString()} ${L('yuklanmoqda', 'загружается', 'loading')}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-muted/60 p-0.5">
            {PERIODS.map((p) => (
              <button key={p.days} onClick={() => setDays(p.days)}
                className={cn('px-3 py-1.5 text-xs rounded-md transition-colors',
                  days === p.days ? 'bg-card shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground')}>
                {p[lang] || p.en}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={doSync} disabled={syncing || integ?.sync?.running}>
            <RefreshCw className={cn('h-3.5 w-3.5 mr-1.5', (syncing || integ?.sync?.running) && 'animate-spin')} />
            {L('Yangilash', 'Обновить', 'Sync')}
          </Button>
        </div>
      </div>

      {/* ── Asosiy raqamlar ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {kpis.map((k) => (
          <div key={k.label} className={cn('rounded-xl px-3 py-2.5',
            k.accent ? 'bg-primary/[0.07] border border-primary/20' : 'bg-muted/40')}>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground truncate">{k.label}</div>
            <div className={cn('font-semibold tabular-nums leading-tight mt-0.5',
              k.accent ? 'text-xl text-primary' : 'text-lg')}>{k.value}</div>
            {k.sub && <div className="text-[10px] text-muted-foreground">{k.sub}</div>}
          </div>
        ))}
      </div>

      {(s.capacity?.estimated || s.coverage?.ok === false) && (
        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 px-3 py-2 text-[11px] flex items-start gap-2">
          <Info className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span>
            {s.capacity?.estimated && L(`Xona soni kiritilmagan — ${s.capacity.rooms} ta deb taxmin qilindi, to‘lish va RevPAR shunga bog‘liq.`,
              `Количество номеров не указано — принято ${s.capacity.rooms}.`,
              `Room count not set — assumed ${s.capacity.rooms}.`)}
            {s.coverage?.ok === false && ` ${s.coverage.skippedNights} ${L('tun kursi topilmadi.', 'ночей без курса валюты.', 'nights lack an FX rate.')}`}
          </span>
        </div>
      )}

      {/* ── E'lon narxi ↔ amaldagi narx ─────────────────────────────
          Kanallar jadvalidan OLDIN: u "qancha sotdim" deydi, bu esa
          "e'lon qilgan narxim bilan olganim bir xilmi" deydi. */}
      <RateGapCard />

      {/* ── Kanallar ────────────────────────────────────────────────── */}
      <Section
        icon={Globe} tone="from-indigo-500 to-sky-500"
        title={L('Kanallar', 'Каналы', 'Channels')}
        hint={L('Qaysi kanal qancha tun va qancha pul keltiradi', 'Какой канал приносит ночи и доход', 'Which channel brings nights and revenue')}
      >
        <BreakdownTable rows={data.channel?.rows} lang={lang} showCancel
          emptyText={L('Ma’lumot yo‘q', 'Нет данных', 'No data')} />
      </Section>

      {/* ── Xona turlari + tariflar ─────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Section
          icon={BedDouble} tone="from-emerald-500 to-teal-500"
          title={L('Xona turlari', 'Типы номеров', 'Room types')}
          hint={L('Qaysi xona sotiladi va qanchaga', 'Какие номера продаются и по какой цене', 'Which rooms sell and at what rate')}
        >
          <BreakdownTable rows={data.roomType?.rows} lang={lang}
            emptyText={L('Ma’lumot yo‘q', 'Нет данных', 'No data')} />
        </Section>

        <Section
          icon={Tag} tone="from-violet-500 to-fuchsia-500"
          title={L('Tarif rejalari', 'Тарифы', 'Rate plans')}
          hint={L('Qaysi tarif orqali sotilyapti', 'Через какой тариф продаётся', 'Which rate plan sells')}
        >
          <BreakdownTable rows={data.ratePlan?.rows?.slice(0, 10)} lang={lang}
            emptyText={L('Ma’lumot yo‘q', 'Нет данных', 'No data')} />
        </Section>
      </div>

      {/* ── Bron xulqi ──────────────────────────────────────────────── */}
      <Section
        icon={CalendarClock} tone="from-orange-500 to-amber-500"
        title={L('Mehmonlar qachon bron qiladi', 'Когда бронируют гости', 'When guests book')}
        hint={L('Bron qilingandan kelishgacha qancha vaqt — narx strategiyasining asosi', 'Сколько времени до заезда — основа ценовой стратегии', 'Booking window — the base of your pricing strategy')}
      >
        <SimpleBars data={leadRows} xKey="label" yKey="bookings" lang={lang}
          tooltipLabel={L('bron', 'броней', 'bookings')} highlightMax />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50">
          <div>
            <div className="text-[11px] font-medium text-muted-foreground mb-2">
              {L('Necha tun qolishadi', 'Сколько ночей остаются', 'Length of stay')}
            </div>
            <div className="space-y-1">
              {(data.dist?.lengthOfStay || []).map((b) => {
                const max = Math.max(...(data.dist?.lengthOfStay || []).map((x) => x.stays), 1);
                return (
                  <div key={b.bucket} className="flex items-center gap-2 text-xs">
                    <span className="w-12 text-muted-foreground tabular-nums">{b.bucket.replace('_', '–')}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted/70 overflow-hidden">
                      <div className="h-full bg-primary/60" style={{ width: `${(b.stays / max) * 100}%` }} />
                    </div>
                    <span className="w-12 text-right tabular-nums">{b.stays}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />{L('Necha kishi kelishadi', 'Сколько человек', 'Party size')}
            </div>
            <div className="space-y-1">
              {(data.dist?.partySize || []).slice(0, 6).map((p, i) => {
                const max = Math.max(...(data.dist?.partySize || []).map((x) => x.stays), 1);
                return (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-20 text-muted-foreground">
                      {p.adults} {L('katta', 'взр', 'ad')}{p.children ? ` + ${p.children}` : ''}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-muted/70 overflow-hidden">
                      <div className="h-full bg-primary/60" style={{ width: `${(p.stays / max) * 100}%` }} />
                    </div>
                    <span className="w-12 text-right tabular-nums">{p.stays}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Hafta kuni + mavsum ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Section
          icon={CalendarClock} tone="from-sky-500 to-cyan-500"
          title={L('Hafta kunlari', 'Дни недели', 'Day of week')}
          hint={L('Qaysi kunlar to‘ladi, qaysilari bo‘sh qoladi', 'Какие дни заполняются', 'Which days fill up')}
        >
          <SimpleBars data={dowRows} xKey="label" yKey="roomNights" lang={lang}
            tooltipLabel={L('xona-tun', 'ночей', 'room-nights')} highlightMax />
        </Section>

        <Section
          icon={BarChartIcon} tone="from-rose-500 to-pink-500"
          title={L('Mavsumiylik', 'Сезонность', 'Seasonality')}
          hint={L('Oylar bo‘yicha sotilgan tunlar', 'Проданные ночи по месяцам', 'Room-nights by month')}
        >
          <SimpleBars data={monthRows} xKey="label" yKey="roomNights" lang={lang}
            tooltipLabel={L('xona-tun', 'ночей', 'room-nights')} highlightMax />
        </Section>
      </div>

      {/* ── Exely'dan nima olinadi (shaffoflik) ─────────────────────── */}
      <Section
        icon={Database} tone="from-slate-500 to-slate-700"
        title={L('Exely’dan nima olinadi', 'Что берётся из Exely', 'What we pull from Exely')}
        hint={L('Ulanish nimani qamrayotgani va nimani qamramasligi', 'Что покрывает подключение, а что нет', 'What the connection covers and what it does not')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div className="font-medium text-[11px] uppercase tracking-wide text-muted-foreground">
              {L('Obyekt profili', 'Профиль объекта', 'Property profile')}
            </div>
            <div className="rounded-lg bg-muted/40 px-3 py-2.5 space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">{L('Xona turlari', 'Типы номеров', 'Room types')}</span><span className="tabular-nums font-medium">{prop?.property?.roomTypeCount ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{L('Tarif rejalari', 'Тарифы', 'Rate plans')}</span><span className="tabular-nums font-medium">{prop?.property?.ratePlanCount ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{L('Valyuta', 'Валюта', 'Currency')}</span><span className="font-medium">{prop?.property?.currency || '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{L('Vaqt mintaqasi', 'Часовой пояс', 'Time zone')}</span><span className="font-medium">{prop?.property?.timeZone || '—'}</span></div>
            </div>
            {prop?.property?.roomTypes?.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {prop.property.roomTypes.map((r) => (
                  <span key={r.id} className="rounded-md bg-muted/60 px-2 py-0.5 text-[10px]">{r.name}</span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="font-medium text-[11px] uppercase tracking-wide text-muted-foreground">
              {L('API ruxsatlari', 'Доступы API', 'API access')}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(prop?.apiAccesses || []).map((a) => (
                <span key={a} className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 text-[10px]">
                  <Check className="h-3 w-3" />{a}
                </span>
              ))}
            </div>
            {/* Halollik: nimaga hozircha erisha olmasligimiz ochiq aytiladi.
                Bu "yo'q funksiya"ni yashirishdan ko'ra foydaliroq — mijoz
                Exely'dan nimani so'rashi kerakligini biladi. */}
            <div className="rounded-lg bg-muted/40 px-3 py-2.5 text-[11px] text-muted-foreground leading-relaxed mt-2">
              <div className="flex items-start gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>
                  {L('Oldinga qarab o‘z narx va bo‘sh xonalaringizni olish (Search API) hozircha yopiq. Kerak bo‘lsa Exely’dan so‘rash mumkin — u kelsa bu sahifaga kelajak narxlar ham qo‘shiladi.',
                     'Получение будущих цен и доступности (Search API) пока закрыто. Можно запросить у Exely — тогда сюда добавятся и будущие цены.',
                     'Forward-looking own rates and availability (Search API) is not enabled yet. You can request it from Exely.')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <p className="text-[10px] text-muted-foreground text-center pb-2">
        {L('Mehmonlar shaxsiy ma’lumoti (ism, telefon, hujjat) saqlanmaydi — faqat sana, xona turi, tarif va narx.',
           'Персональные данные гостей не сохраняются — только даты, тип номера, тариф и цена.',
           'Guest personal data is never stored — only dates, room type, rate plan and price.')}
      </p>
    </div>
  );
}
