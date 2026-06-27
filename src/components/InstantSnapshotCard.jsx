import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Zap, RefreshCw, TrendingUp, TrendingDown, ArrowRight, AlertTriangle, ChevronDown } from 'lucide-react';
import { hotelApi } from '@/lib/api';
import { useLang } from '@/lib/i18n';
import { useFormatPrice, cn } from '@/lib/utils';

const TXT = {
  uz: {
    title: 'Bepul narx tahlili',
    sub: 'TripAdvisor orqali 8+ OTA kanalidan — pulsiz',
    loading: 'Narxlaringiz yig\'ilmoqda (bepul)...',
    loadingHint: 'Birinchi marta biroz vaqt olishi mumkin — raqiblar topilmoqda',
    myPrice: 'Mening eng arzon narxim',
    marketAvg: 'Bozor o\'rtachasi',
    position: 'Bozordagi o\'rnim',
    of: 'dan',
    expensive: (p) => `Raqiblar sizdan o'rtacha ${p}% arzon`,
    cheaper: (p) => `Siz bozordan ${p}% arzonsiz — narxni oshirish imkoni bor`,
    onpar: 'Narxingiz bozor bilan deyarli mos',
    loss: (v) => `Taxminan ${v}/oy yo'qotyapsiz`,
    noOwn: 'Mehmonxonangiz TripAdvisor\'da topilmadi. Sozlamalarda TripAdvisor havolasini qo\'shing.',
    noComp: 'Raqiblar narxi topilmadi. Raqiblar sahifasida qo\'shing.',
    retry: 'Yangilash',
    details: 'Batafsil narxlar',
    free: 'BEPUL',
  },
  ru: {
    title: 'Бесплатный анализ цен',
    sub: 'Через TripAdvisor из 8+ OTA каналов — без оплаты',
    loading: 'Собираем ваши цены (бесплатно)...',
    loadingHint: 'Первый раз может занять время — ищем конкурентов',
    myPrice: 'Моя минимальная цена',
    marketAvg: 'Средняя по рынку',
    position: 'Моё место на рынке',
    of: 'из',
    expensive: (p) => `Конкуренты в среднем на ${p}% дешевле`,
    cheaper: (p) => `Вы на ${p}% дешевле рынка — можно поднять цену`,
    onpar: 'Ваша цена примерно на уровне рынка',
    loss: (v) => `Теряете примерно ${v}/мес`,
    noOwn: 'Отель не найден на TripAdvisor. Добавьте ссылку TripAdvisor в настройках.',
    noComp: 'Цены конкурентов не найдены. Добавьте их на странице конкурентов.',
    retry: 'Обновить',
    details: 'Подробные цены',
    free: 'БЕСПЛАТНО',
  },
  en: {
    title: 'Free price check',
    sub: 'From 8+ OTA channels via TripAdvisor — no cost',
    loading: 'Collecting your prices (free)...',
    loadingHint: 'First run may take a moment — finding competitors',
    myPrice: 'My lowest price',
    marketAvg: 'Market average',
    position: 'My market position',
    of: 'of',
    expensive: (p) => `Competitors are ${p}% cheaper on average`,
    cheaper: (p) => `You are ${p}% below market — room to raise price`,
    onpar: 'Your price is about on par with the market',
    loss: (v) => `Losing roughly ${v}/mo`,
    noOwn: 'Your hotel was not found on TripAdvisor. Add a TripAdvisor link in Settings.',
    noComp: 'No competitor prices found. Add them on the Competitors page.',
    retry: 'Refresh',
    details: 'Detailed prices',
    free: 'FREE',
  },
};

const STALE_MS = 6 * 60 * 60 * 1000; // 6 soat — shu vaqtdan keyin avto-yangilash

export default function InstantSnapshotCard() {
  const lang = useLang((s) => s.lang);
  const t = TXT[lang] || TXT.uz;
  const formatPrice = useFormatPrice();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  // Yig'iladigan (collapsible) — holat eslab qolinadi. Yopilsa, pastdagi
  // grafik/raqib kartalari tezroq ko'rinadi (kam scroll).
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('rr_snapshot_collapsed') === 'true'
  );
  function toggleCollapsed() {
    setCollapsed((v) => {
      const next = !v;
      try { localStorage.setItem('rr_snapshot_collapsed', String(next)); } catch {}
      return next;
    });
  }

  const run = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await hotelApi.instantSnapshot();
      setData(res);
      try { localStorage.setItem('rr_instant_at', String(Date.now())); } catch {}
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sahifaga kirilganda: oxirgi yangilanish 6 soatdan eski bo'lsa avto-ishga tushadi
  useEffect(() => {
    let last = 0;
    try { last = Number(localStorage.getItem('rr_instant_at') || 0); } catch {}
    if (Date.now() - last > STALE_MS) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const s = data?.summary;
  const myBest = data?.own?.bestPrice || 0;
  const hasOwn = myBest > 0;
  const hasComp = (s?.competitorsCount || 0) > 0;
  const gap = s?.gapPct || 0;

  // USD formatlash (Xotelo USD qaytaradi)
  const usd = (v) => `$${Math.round(v).toLocaleString('en-US')}`;

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 via-card to-card p-5 sm:p-6">
      {/* Sarlavha — bosilsa yig'iladi/ochiladi */}
      <div className={cn('flex items-start justify-between gap-3', collapsed ? 'mb-0' : 'mb-4')}>
        <button onClick={toggleCollapsed} className="flex items-center gap-3 min-w-0 text-left flex-1">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{t.title}</h3>
              <span className="text-[10px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded">{t.free}</span>
            </div>
            {/* Yopilganda qisqa xulosa, ochiqda tavsif */}
            {collapsed && hasOwn ? (
              <p className="text-xs text-muted-foreground truncate">
                {t.myPrice}: <span className="font-semibold text-primary">{usd(myBest)}</span>
                {hasComp && <> · {t.marketAvg}: {usd(s.marketAvg)} · {s.position}/{s.total}</>}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">{t.sub}</p>
            )}
          </div>
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={run}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            {!collapsed && t.retry}
          </button>
          <button
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Ochish' : "Yig'ish"}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', collapsed ? '' : 'rotate-180')} />
          </button>
        </div>
      </div>

      {!collapsed && (
      <>
      {/* ── Tana (yopilganda ko'rinmaydi) ── */}

      {/* Loading */}
      {loading && (
        <div className="py-6 text-center">
          <div className="w-7 h-7 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-foreground font-medium">{t.loading}</p>
          <p className="text-xs text-muted-foreground mt-1">{t.loadingHint}</p>
        </div>
      )}

      {/* Natija */}
      {!loading && data && (
        <>
          {!hasOwn ? (
            <div className="flex items-start gap-2.5 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{t.noOwn}</span>
            </div>
          ) : (
            <>
              {/* Statlar */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <Stat label={t.myPrice} value={usd(myBest)} accent />
                <Stat label={t.marketAvg} value={hasComp ? usd(s.marketAvg) : '—'} />
                <Stat label={t.position} value={hasComp ? `${s.position}/${s.total}` : '—'} />
              </div>

              {/* Asosiy xabar (aha) */}
              {hasComp ? (
                <div
                  className={cn(
                    'rounded-xl p-4 flex items-start gap-3',
                    gap > 2 ? 'bg-destructive/5 border border-destructive/20'
                      : gap < -2 ? 'bg-success/5 border border-success/20'
                      : 'bg-muted border',
                  )}
                >
                  {gap > 2 ? <TrendingDown className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    : gap < -2 ? <TrendingUp className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    : <TrendingUp className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />}
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-sm">
                      {gap > 2 ? t.expensive(Math.abs(gap))
                        : gap < -2 ? t.cheaper(Math.abs(gap))
                        : t.onpar}
                    </p>
                    {gap > 2 && s.estMonthlyLossUSD > 0 && (
                      <p className="text-sm text-destructive font-medium mt-0.5">
                        {t.loss(usd(s.estMonthlyLossUSD))}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t.noComp}</p>
              )}

              <Link
                to="/prices"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-4"
              >
                {t.details} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </>
      )}

      {/* Boshlang'ich (hali yuklanmagan) */}
      {!loading && !data && !error && (
        <button onClick={run} className="text-sm text-primary font-medium hover:underline">
          {t.retry} →
        </button>
      )}
      </>
      )}
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <p className="text-[11px] text-muted-foreground uppercase tracking-wide truncate">{label}</p>
      <p className={cn('text-lg font-bold mt-1', accent ? 'text-primary' : 'text-foreground')}>{value}</p>
    </div>
  );
}
