import { MessageSquare, Star, ThumbsUp, ThumbsDown, PieChart as PieChartIcon, LineChart as LineChartIcon } from 'lucide-react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Sharhlar Score Board — WhizzScore-uslubidagi obro' paneli.
 *
 * • Qora lenta: kompozit "Sharh balli" (0-100) aylana gauge'da + 3 vaznli komponent:
 *     Reyting 60% · Hajm 20% · Yangilik 20%
 * • 4 KPI karta (rangli top-border)
 * • Reyting trendi (oylik: o'rtacha ball chizig'i + sharhlar soni ustunlari)
 * • Platforma bo'yicha donut
 *
 * Hammasi allaqachon yuklangan sharhlar ro'yxatidan hisoblanadi — qo'shimcha so'rovsiz.
 */

const PLATFORM_COLORS = {
  Google: '#16a34a', 'Booking.com': '#1a56db', Booking: '#1a56db',
  Agoda: '#e11d48', Expedia: '#ca8a04', 'Trip.com': '#0284c7',
  TripAdvisor: '#10b981', Yandex: '#eab308',
};

export default function ReviewsScoreBoard({ reviews = [], stats = {}, total = 0, lang = 'uz' }) {
  const L = (uz, ru, en) => (lang === 'uz' ? uz : lang === 'ru' ? ru : en);

  if (!reviews.length) return null;

  // ── Ball komponentlari ──
  const avg = stats.avgRating ||
    Math.round((reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length) * 10) / 10;
  const ratingScore = Math.round((avg / 5) * 100);
  const volumeScore = Math.min(100, total); // 100+ sharh = to'liq ball
  const now = Date.now();
  const recent30 = reviews.filter((r) => {
    const d = r.publishedAt || r.createdAt;
    return d && now - new Date(d).getTime() < 30 * 86400_000;
  }).length;
  const freshScore = Math.min(100, recent30 * 10); // oyiga 10+ yangi sharh = to'liq
  const score = Math.round(ratingScore * 0.6 + volumeScore * 0.2 + freshScore * 0.2);

  const grade = score >= 80
    ? { label: L("A'lo", 'Отлично', 'Excellent'), cls: 'bg-emerald-500/15 text-emerald-400' }
    : score >= 60
    ? { label: L('Yaxshi', 'Хорошо', 'Good'), cls: 'bg-sky-500/15 text-sky-400' }
    : score >= 40
    ? { label: L("O'rtacha", 'Средне', 'Average'), cls: 'bg-amber-500/15 text-amber-400' }
    : { label: L('Past', 'Низко', 'Low'), cls: 'bg-rose-500/15 text-rose-400' };

  const positivePct = total > 0 ? Math.round(((stats.positive || 0) / total) * 100) : 0;

  // ── Oylik trend (oxirgi 6 oy): o'rtacha reyting + soni ──
  const monthsShort = lang === 'ru'
    ? ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
    : lang === 'en'
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    : ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'];
  const trend = (() => {
    const buckets = new Map();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      buckets.set(`${d.getFullYear()}-${d.getMonth()}`, {
        label: `${monthsShort[d.getMonth()]}`, sum: 0, count: 0,
      });
    }
    reviews.forEach((r) => {
      const raw = r.publishedAt || r.createdAt;
      if (!raw) return;
      const d = new Date(raw);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const b = buckets.get(key);
      if (b) { b.sum += r.rating || 0; b.count += 1; }
    });
    return [...buckets.values()].map((b) => ({
      label: b.label,
      count: b.count,
      avg: b.count ? Math.round((b.sum / b.count) * 10) / 10 : null,
    }));
  })();

  // ── Platforma bo'yicha donut ──
  const donut = (() => {
    const counts = {};
    reviews.forEach((r) => {
      const p = r.platform || 'Google';
      counts[p] = (counts[p] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, color: PLATFORM_COLORS[name] || '#94a3b8' }))
      .sort((a, b) => b.value - a.value);
  })();

  const tooltipStyle = {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '11px',
  };

  return (
    <div className="space-y-3">
      {/* ═══ QORA SCORE LENTA ═══ */}
      <div className="rounded-2xl bg-slate-900 dark:bg-slate-950 text-slate-100 p-5 lg:p-6 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex items-center gap-5 min-w-0 lg:w-[300px] shrink-0">
            <ScoreGauge value={score} />
            <div className="min-w-0">
              <div className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                {L('Sharh balli', 'Балл отзывов', 'Review Score')}™
              </div>
              <span className={cn('inline-block mt-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold', grade.cls)}>
                {grade.label}
              </span>
              <div className="inline-flex items-center gap-1 text-xs text-yellow-400 mt-2">
                <Star className="h-3 w-3 fill-current" />
                {avg.toFixed(1)}
                <span className="text-slate-500">/ 5 · {total} {L('sharh', 'отзывов', 'reviews')}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            <SubScore label={L('Reyting balli', 'Балл рейтинга', 'Rating score')}
              value={ratingScore} weight="60%" barCls="bg-emerald-400"
              weightText={L('vazn', 'вес', 'weight')} />
            <SubScore label={L('Hajm balli', 'Балл объёма', 'Volume score')}
              value={volumeScore} weight="20%" barCls="bg-sky-400"
              weightText={L('vazn', 'вес', 'weight')} />
            <SubScore label={L('Yangilik balli', 'Балл свежести', 'Freshness score')}
              value={freshScore} weight="20%" barCls="bg-violet-400"
              weightText={L('vazn', 'вес', 'weight')} />
          </div>
        </div>
      </div>

      {/* ═══ KPI KARTALAR ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard color="sky" icon={MessageSquare}
          label={L('Jami sharhlar', 'Всего отзывов', 'Total reviews')}
          value={total}
          sub={`${recent30} ${L("oxirgi 30 kunda", 'за 30 дней', 'last 30 days')}`} />
        <KpiCard color="emerald" icon={Star}
          label={L("O'rtacha reyting", 'Средний рейтинг', 'Avg rating')}
          value={`${avg.toFixed(1)}/5`}
          sub={`${donut.length} ${L('platforma', 'платформ', 'platforms')}`} />
        <KpiCard color="amber" icon={ThumbsUp}
          label={L('Ijobiy ulush', 'Доля позитива', 'Positive share')}
          value={`${positivePct}%`}
          sub={`${stats.positive || 0} ${L('ijobiy', 'позитивных', 'positive')}`} />
        <KpiCard color="rose" icon={ThumbsDown}
          label={L('Salbiy sharhlar', 'Негативные', 'Negative reviews')}
          value={stats.negative || 0}
          sub={L('javob talab qiladi', 'требуют ответа', 'need a response')} />
      </div>

      {/* ═══ GRAFIKLAR: trend + platforma donut ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card variant="glass" className="lg:col-span-2 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <LineChartIcon className="h-4 w-4 text-primary" />
              {L('Reyting trendi', 'Тренд рейтинга', 'Rating trend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trend} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.4)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false} axisLine={false} />
                  <YAxis yAxisId="avg" domain={[0, 5]}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false} axisLine={false} />
                  <YAxis yAxisId="count" orientation="right" allowDecimals={false}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false} axisLine={false} />
                  <ReTooltip contentStyle={tooltipStyle} />
                  <Bar yAxisId="count" dataKey="count"
                    name={L('Sharhlar soni', 'Кол-во отзывов', 'Review count')}
                    fill="hsl(var(--muted-foreground)/0.25)" radius={[4, 4, 0, 0]} barSize={18} />
                  <Line yAxisId="avg" type="monotone" dataKey="avg" connectNulls
                    name={L("O'rtacha reyting", 'Средний рейтинг', 'Avg rating')}
                    stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-primary" />
              {L("Platformalar bo'yicha", 'По каналам', 'Reviews by channel')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-44 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donut} dataKey="value" nameKey="name"
                    innerRadius={48} outerRadius={70} paddingAngle={2} strokeWidth={0}>
                    {donut.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <ReTooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-xl font-bold tabular-nums">{total}</div>
                <div className="text-[9px] text-muted-foreground uppercase">
                  {L('jami', 'всего', 'total')}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center">
              {donut.map((d, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Aylana ball — gradient halqa, markazda katta raqam
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
          <linearGradient id="revScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r}
          stroke="url(#revScoreGrad)" strokeWidth={stroke} fill="none"
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
function KpiCard({ color, icon: Icon, label, value, sub }) {
  const topCls = {
    emerald: 'border-t-emerald-500', sky: 'border-t-sky-500',
    amber: 'border-t-amber-500', rose: 'border-t-rose-500',
  }[color] || 'border-t-primary';
  const iconCls = {
    emerald: 'bg-emerald-500/10 text-emerald-600',
    sky: 'bg-sky-500/10 text-sky-600',
    amber: 'bg-amber-500/10 text-amber-600',
    rose: 'bg-rose-500/10 text-rose-600',
  }[color] || 'bg-primary/10 text-primary';
  return (
    <div className={cn('rounded-xl border border-border/60 border-t-4 bg-card p-4 shadow-sm hover:shadow-md transition-shadow', topCls)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground truncate">{label}</div>
          <div className="text-2xl font-bold tracking-tight tabular-nums mt-1">{value}</div>
          {sub && <div className="text-[11px] text-muted-foreground/70 mt-0.5 truncate">{sub}</div>}
        </div>
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', iconCls)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
