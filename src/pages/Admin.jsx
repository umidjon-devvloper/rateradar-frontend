import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Users, Building2, Database, MessageSquare, TrendingUp,
  ExternalLink, AlertCircle, CheckCircle2, RefreshCw,
  Shield, Globe, Sparkles, MapPin, Activity, Send, Loader2,
  Lightbulb, Search, DollarSign, CreditCard,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

const CATEGORY_LABEL = {
  prices: 'Narx manbalari (OTA)',
  ai:     'AI / Sun\'iy intellekt',
  geo:    'Joy / Rasm',
  search: 'Qidiruv',
  serp:   'SERP / Scrapers',
};

const CATEGORY_ICON = {
  prices: DollarSign,
  ai:     Sparkles,
  geo:    MapPin,
  search: Search,
  serp:   Database,
};

export default function Admin() {
  const user = useAuth((s) => s.user);

  if (user && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const [tab, setTab] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [apiStats, setApiStats] = useState(null);
  const [users, setUsers] = useState(null);
  const [active, setActive] = useState(null);
  const [txns, setTxns] = useState(null);
  const [loading, setLoading] = useState(false);

  async function loadAll() {
    setLoading(true);
    try {
      const [d, s, u, a, t] = await Promise.all([
        adminApi.dashboard().catch(() => null),
        adminApi.apiStats().catch(() => null),
        adminApi.users({ limit: 50 }).catch(() => null),
        adminApi.activeUsers().catch(() => null),
        adminApi.transactions({ limit: 50 }).catch(() => null),
      ]);
      setDashboard(d);
      setApiStats(s);
      setUsers(u);
      setActive(a);
      setTxns(t);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  const tabs = [
    { id: 'overview', label: 'Umumiy', icon: Activity },
    { id: 'apis',     label: 'API Limitlar', icon: Database },
    { id: 'users',    label: 'Foydalanuvchilar', icon: Users },
    { id: 'active',   label: 'Faol foydalanuvchilar', icon: Shield },
    { id: 'txns',     label: 'Tranzaksiyalar', icon: CreditCard },
    { id: 'broadcast',label: 'Xabarnoma', icon: Send },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Admin Panel</h1>
            <Badge variant="outline" className="text-[10px]">
              {apiStats?.currentMonth}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Tizim statistikasi, API limitlar va foydalanuvchilar
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadAll} disabled={loading}>
          <RefreshCw className={cn('h-3.5 w-3.5 mr-1.5', loading && 'animate-spin')} />
          Yangilash
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map((tb) => {
            const Icon = tb.icon;
            return (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  tab === tb.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tb.label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === 'overview' && <OverviewTab dashboard={dashboard} />}
      {tab === 'apis'     && <ApiStatsTab apiStats={apiStats} />}
      {tab === 'users'    && <UsersTab users={users} reload={loadAll} />}
      {tab === 'active'   && <ActiveTab active={active} />}
      {tab === 'txns'     && <TransactionsTab initial={txns} />}
      {tab === 'broadcast'&& <BroadcastTab />}
    </div>
  );
}

function BroadcastTab() {
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [lang, setLang] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [inApp, setInApp] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const canSend = subject.trim() && message.trim() && !sending;

  async function send() {
    if (!canSend) return;
    const filterNote = [
      lang && `til = ${lang}`,
      countryCode && `davlat = ${countryCode.toUpperCase()}`,
    ].filter(Boolean).join(', ') || 'BARCHA aktiv foydalanuvchilar';
    if (!window.confirm(`Xabar yuborilsinmi?\n\nQabul qiluvchilar: ${filterNote}`)) return;

    setSending(true);
    setError('');
    setResult(null);
    try {
      const res = await adminApi.broadcast({
        subject: subject.trim(),
        title: title.trim(),
        message: message.trim(),
        lang,
        countryCode: countryCode.trim(),
        inApp,
      });
      setResult(res);
      setSubject(''); setTitle(''); setMessage('');
    } catch (err) {
      setError(err?.response?.data?.error || 'Yuborishda xatolik');
    } finally {
      setSending(false);
    }
  }

  const inputCls = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Send className="h-4 w-4 text-muted-foreground" />
          Foydalanuvchilarga xabarnoma yuborish
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Email mavzusi (subject) *</label>
          <input className={inputCls} value={subject} onChange={(e) => setSubject(e.target.value)}
            placeholder="Masalan: TheHotelSaaS'da yangi imkoniyat!" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Sarlavha (xabar ichida)</label>
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Ixtiyoriy — bo'sh qolsa mavzu ishlatiladi" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Matn *</label>
          <textarea className={cn(inputCls, 'min-h-[120px] resize-y')} value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Yangilik haqida batafsil yozing. Yangi qatorlar saqlanadi." />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Til filtri</label>
            <select className={inputCls} value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="">Barcha tillar</option>
              <option value="uz">O'zbek (uz)</option>
              <option value="ru">Rus (ru)</option>
              <option value="en">Ingliz (en)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Davlat kodi filtri</label>
            <input className={inputCls} value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              placeholder="Masalan: UZ (bo'sh = barchasi)" maxLength={2} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={inApp} onChange={(e) => setInApp(e.target.checked)} />
          Ilova ichida ham bildirishnoma yaratilsin (qo'ng'iroq belgisi)
        </label>

        <div className="flex items-center gap-3 pt-1">
          <Button onClick={send} disabled={!canSend}>
            {sending
              ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Yuborilmoqda...</>
              : <><Send className="h-3.5 w-3.5 mr-1.5" />Yuborish</>}
          </Button>
          {error && <span className="text-sm text-red-600">{error}</span>}
          {result && (
            <span className="text-sm text-green-600">
              ✅ {result.sent} ta email yuborildi
              {result.failed ? `, ${result.failed} ta xato` : ''}
              {result.inApp ? `, ${result.inApp} ta ilova bildirishnomasi` : ''}
              {' '}(jami {result.total})
            </span>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground border-t pt-3">
          ⚠️ Email haqiqiy foydalanuvchilarga ketadi va orqaga qaytarilmaydi. Filtr bo'sh qolsa
          barcha aktiv foydalanuvchilarga yuboriladi.
        </p>
      </CardContent>
    </Card>
  );
}

function OverviewTab({ dashboard }) {
  if (!dashboard) {
    return <div className="text-sm text-muted-foreground py-8 text-center">Yuklanmoqda...</div>;
  }
  const c = dashboard.counts || {};
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <CountCard icon={Users} label="Foydalanuvchilar" value={c.users} accent="primary" />
        <CountCard icon={Building2} label="Mehmonxonalar" value={c.hotels} />
        <CountCard icon={MapPin} label="Raqobatchilar" value={c.competitors} />
        <CountCard icon={MessageSquare} label="Sharhlar" value={c.reviews} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <CountCard icon={TrendingUp} label="Narx snapshotlari" value={c.snapshots} />
        <CountCard icon={Activity} label="So'nggi 7 kun ro'yxat" value={c.recentSignups} accent="green" />
      </div>

      {/* Davlatlar bo'yicha */}
      {dashboard.usersByCountry?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Davlatlar bo'yicha</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dashboard.usersByCountry.slice(0, 8).map((c) => (
                <div key={c._id || 'unknown'} className="flex items-center gap-3 text-sm">
                  <span className="font-medium w-12">{c._id || '—'}</span>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full"
                      style={{ width: `${(c.count / dashboard.usersByCountry[0].count) * 100}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground tabular-nums w-8 text-right">{c.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ApiStatsTab({ apiStats }) {
  if (!apiStats) {
    return <div className="text-sm text-muted-foreground py-8 text-center">Yuklanmoqda...</div>;
  }
  const grouped = (apiStats.providers || []).reduce((acc, p) => {
    (acc[p.category] = acc[p.category] || []).push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, providers]) => {
        const Icon = CATEGORY_ICON[category] || Database;
        return (
          <div key={category}>
            <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              {CATEGORY_LABEL[category] || category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {providers.map((p) => <ProviderCard key={p.name} provider={p} />)}
            </div>
          </div>
        );
      })}

      {/* Tavsiyalar — eng pastda */}
      {(apiStats.recommendations || []).length > 0 && (
        <div className="pt-2">
          <h2 className="text-sm font-semibold mb-1 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Tavsiya etiladi (qo'shsa yaxshi bo'ladi)
          </h2>
          <p className="text-xs text-muted-foreground mb-3">
            Hozir ishlatilmagan, lekin sayt uchun foydali — ayniqsa zaif joylarni mustahkamlaydi.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {apiStats.recommendations.map((r) => (
              <Card key={r.label} className="border-amber-200/60 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/10">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-sm">{r.label}</span>
                    <Badge
                      className={cn(
                        'text-[10px]',
                        r.priority === 'high'
                          ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300'
                          : r.priority === 'medium'
                          ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {r.priority === 'high' ? 'Yuqori' : r.priority === 'medium' ? "O'rta" : 'Past'} muhimlik
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug mb-2">{r.why}</p>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-green-600">{r.limit}</span>
                    <a
                      href={r.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                    >
                      <Globe className="h-3 w-3" />
                      {new URL(r.website).hostname}
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProviderCard({ provider: p }) {
  // Limit chipi matni
  const limitText = p.payPerUse
    ? 'Pullik (limit yo\'q)'
    : p.monthlyLimit
    ? `${p.monthlyLimit.toLocaleString('en-US')} / oy`
    : 'Cheksiz';

  return (
    <Card className={cn(!p.configured && 'opacity-70')}>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{p.label}</span>
              {p.recommended && <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">Tavsiya</Badge>}
              {!p.configured && !p.free && <Badge variant="outline" className="text-[10px]">Kalit yo'q</Badge>}
              {p.free && <Badge variant="secondary" className="text-[10px]">Bepul</Badge>}
              {p.payPerUse && <Badge variant="secondary" className="text-[10px]">Pullik</Badge>}
            </div>
            <a
              href={p.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-muted-foreground hover:text-primary inline-flex items-center gap-1 mt-0.5"
            >
              <Globe className="h-3 w-3" />
              {new URL(p.website).hostname}
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
          {/* Limit chipi */}
          <div className="shrink-0 text-right">
            <div className="text-base font-semibold tabular-nums whitespace-nowrap">{limitText}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Limit</div>
          </div>
        </div>

        {p.note && <p className="text-[11px] text-muted-foreground leading-snug">{p.note}</p>}
      </CardContent>
    </Card>
  );
}

function UsersTab({ users, reload }) {
  if (!users) {
    return <div className="text-sm text-muted-foreground py-8 text-center">Yuklanmoqda...</div>;
  }

  async function toggle(id) {
    try {
      await adminApi.toggleUser(id);
      await reload();
    } catch {}
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">
          Barcha foydalanuvchilar ({users.total})
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="divide-y">
          {(users.users || []).map((u) => (
            <div key={u._id} className="px-6 py-3 flex items-center gap-3">
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0',
                u.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              )}>
                {u.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm truncate">{u.name}</span>
                  <Badge variant="secondary" className="text-[10px] capitalize">{u.plan}</Badge>
                  {u.role === 'admin' && <Badge variant="default" className="text-[10px]">Admin</Badge>}
                  {!u.isActive && <Badge variant="destructive" className="text-[10px]">Bloklangan</Badge>}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {u.email} • {u.city || u.countryCode || '—'}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] text-muted-foreground">
                  {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : '—'}
                </div>
                <Button
                  size="sm"
                  variant={u.isActive ? 'outline' : 'default'}
                  onClick={() => toggle(u._id)}
                  className="text-[10px] h-7 mt-1"
                >
                  {u.isActive ? 'Bloklash' : 'Yoqish'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ActiveTab({ active }) {
  if (!active) {
    return <div className="text-sm text-muted-foreground py-8 text-center">Yuklanmoqda...</div>;
  }
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <CountCard icon={Activity} label="Faol (30 kun)" value={active.stats?.activeCount} accent="green" />
        <CountCard icon={Users} label="Nofaol" value={active.stats?.inactiveCount} />
        <CountCard icon={Users} label="Jami" value={active.stats?.total} accent="primary" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">So'nggi 30 kun ichida login qilganlar</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="divide-y">
            {(active.active || []).map((u) => (
              <div key={u._id} className="px-6 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-950/30 text-green-600 flex items-center justify-center text-sm font-semibold shrink-0">
                  {u.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{u.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{u.email}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] text-muted-foreground">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : '—'}
                  </div>
                  <Badge variant="secondary" className="text-[10px] mt-0.5 capitalize">{u.plan}</Badge>
                </div>
              </div>
            ))}
            {!active.active?.length && (
              <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                Hech kim hozircha aktiv emas
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// To'lov holatlari uchun yorliq + rang
const TXN_STATUS = {
  paid:     { label: "To'langan",      cls: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300' },
  otp_sent: { label: 'OTP yuborilgan', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
  created:  { label: 'Yaratilgan',     cls: 'bg-muted text-muted-foreground' },
  failed:   { label: 'Xato',           cls: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300' },
  reversed: { label: 'Qaytarilgan',    cls: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' },
};

// Tiyin → so'm (1 so'm = 100 tiyin), o'zbekcha ming-ajratuvchi bilan.
function tiyinToUzs(tiyin) {
  return (Number(tiyin || 0) / 100).toLocaleString('ru-RU');
}

function TransactionsTab({ initial }) {
  const [data, setData] = useState(initial);
  const [status, setStatus] = useState('');
  const [plan, setPlan] = useState('');
  const [channel, setChannel] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.transactions({
        limit: 50,
        status: status || undefined,
        plan: plan || undefined,
        channel: channel || undefined,
        search: search.trim() || undefined,
      });
      setData(res);
    } catch {
      /* xato — eski ma'lumot qoladi */
    } finally {
      setLoading(false);
    }
  }

  // Filtr o'zgarsa qayta yuklash (qidiruvdan tashqari — u Enter/tugma bilan)
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status, plan, channel]);

  if (!data) {
    return <div className="text-sm text-muted-foreground py-8 text-center">Yuklanmoqda...</div>;
  }

  const byStatus = data.summary?.byStatus || {};
  const inputCls = 'rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40';

  return (
    <div className="space-y-4">
      {/* Summary kartalari */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <CountCard icon={DollarSign} label="Jami tushum (so'm)" value={tiyinToUzs(data.summary?.paidRevenue)} accent="green" />
        <CountCard icon={CheckCircle2} label="To'langan" value={byStatus.paid?.count || 0} accent="primary" />
        <CountCard icon={Loader2} label="OTP kutilmoqda" value={byStatus.otp_sent?.count || 0} />
        <CountCard icon={AlertCircle} label="Xato" value={byStatus.failed?.count || 0} />
      </div>

      {/* Filtrlar */}
      <div className="flex flex-wrap items-center gap-2">
        <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Barcha holatlar</option>
          {Object.entries(TXN_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select className={inputCls} value={plan} onChange={(e) => setPlan(e.target.value)}>
          <option value="">Barcha rejalar</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
        </select>
        <select className={inputCls} value={channel} onChange={(e) => setChannel(e.target.value)}>
          <option value="">Barcha kanallar</option>
          <option value="card">Karta (SMS-OTP)</option>
          <option value="invoice">To'lov sahifasi</option>
        </select>
        <div className="flex items-center gap-1">
          <input
            className={inputCls}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            placeholder="Email / ism / karta..."
          />
          <Button size="sm" variant="outline" className="h-8" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Tranzaksiyalar ({data.total})</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="divide-y">
            {(data.transactions || []).map((t) => {
              const st = TXN_STATUS[t.status] || { label: t.status, cls: 'bg-muted text-muted-foreground' };
              return (
                <div key={t._id} className="px-6 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">{t.user?.name || '—'}</span>
                      <Badge variant="secondary" className="text-[10px] capitalize">{t.plan}</Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {t.channel === 'invoice' ? 'Sahifa' : 'Karta'}
                      </Badge>
                      <Badge className={cn('text-[10px] border-transparent', st.cls)}>{st.label}</Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {t.user?.email || '—'}
                      {t.cardPan ? ` • ${t.cardPan}` : ''}
                      {t.errorMessage ? ` • ${t.errorMessage}` : ''}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold tabular-nums whitespace-nowrap">
                      {tiyinToUzs(t.amount)} so'm
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(t.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
            {!data.transactions?.length && (
              <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                Tranzaksiyalar topilmadi
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CountCard({ icon: Icon, label, value, accent }) {
  const accentClass = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-success-bg text-success',
  }[accent] || 'bg-muted text-muted-foreground';
  return (
    <Card>
      <CardContent className="pt-5">
        <div className={cn('w-7 h-7 rounded-md flex items-center justify-center mb-2', accentClass)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="text-2xl font-semibold tracking-tight tabular-nums">{value ?? 0}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      </CardContent>
    </Card>
  );
}
