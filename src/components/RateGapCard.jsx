import { useState, useEffect } from 'react';
import { Loader2, Scale, Info, TriangleAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { metricsApi } from '@/lib/api';
import { useLang } from '@/lib/i18n';
import { getCache, setCache } from '@/lib/clientCache';
import { cn } from '@/lib/utils';
import ExelyStateCard, { classifyExelyError } from '@/components/ExelyStateCard';

/**
 * E'LON NARXI ↔ AMALDA OLINGAN NARX.
 *
 * Mahsulotdagi yagona joy: ikkala tomon bir ekranda. Rate shopper faqat
 * tashqarini ko'radi, PMS dashboard'i faqat ichkarini.
 *
 * ⚠️ SABAB AYTILMAYDI. Farq komissiya, kanal aksiyasi, xona turi
 * aralashmasi yoki uzoq qolish chegirmasidan bo'lishi mumkin — Exely
 * javobida komissiya maydoni yo'q va soliq nolga teng, ya'ni ma'lumotdan
 * ajratib bo'lmaydi. Shuning uchun FAKT ko'rsatiladi, ehtimoliy sabablar
 * esa ro'yxat sifatida beriladi va tanlash mehmonxonaga qoldiriladi.
 * Bu "Genius chegirmasi aniqlandi" deb yozishdan halolroq.
 */
export default function RateGapCard() {
  const lang = useLang((s) => s.lang);
  const L = (uz, ru, en) => (lang === 'uz' ? uz : lang === 'ru' ? ru : en);

  const [data, setData] = useState(() => getCache('rateGap', 60 * 60_000));
  const [loading, setLoading] = useState(!data);
  const [failState, setFailState] = useState(null);

  useEffect(() => {
    let alive = true;
    metricsApi.rateGap()
      .then((d) => { if (alive) { setData(d); setCache('rateGap', d); setFailState(null); } })
      .catch((err) => { if (alive) setFailState(classifyExelyError(err)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  if (failState === 'not_connected') return null;
  if (failState) return <ExelyStateCard state={failState} compact />;
  if (loading) {
    return (
      <Card><CardContent className="py-8 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </CardContent></Card>
    );
  }

  const channels = (data?.channels || []).filter((c) => c.comparableDays > 0);
  if (!channels.length) return null;

  const main = channels.find((c) => c.reliable) || channels[0];

  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border/60 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shrink-0">
          <Scale className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold">
            {L('E‘lon narxi va amalda olingani', 'Витринная цена и фактическая', 'Shop rate vs realized rate')}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {L('Bir xil tunash sanalari bo‘yicha', 'По одинаковым датам проживания', 'Matched on the same stay dates')}
          </div>
        </div>
      </div>

      <CardContent className="p-5 space-y-4">
        {/* Asosiy taqqoslash — eng ko'p ma'lumotli kanal */}
        <div>
          <div className="text-[11px] text-muted-foreground mb-2">
            {main.channel} · {main.comparableDays} {L('kun', 'дн.', 'days')}
            {!main.reliable && ` · ${L('ma’lumot kam', 'мало данных', 'few data points')}`}
          </div>
          <div className="grid grid-cols-2 gap-1px rounded-xl overflow-hidden border border-border/60">
            <div className="bg-muted/40 px-4 py-3">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {L('OTA’da ko‘rinadi', 'Видно на OTA', 'Shown on the OTA')}
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-0.5">${main.medianShown}</div>
            </div>
            <div className="bg-primary/[0.06] px-4 py-3 border-l border-border/60">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {L('Amalda olinadi', 'Фактически получено', 'Actually received')}
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-0.5 text-primary">${main.medianRealized}</div>
            </div>
          </div>
          {main.medianGapPct != null && (
            <div className={cn('mt-2 rounded-lg px-3 py-2 text-xs font-medium tabular-nums flex items-center gap-2',
              Math.abs(main.medianGapPct) >= 25
                ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40'
                : 'bg-muted/40 text-muted-foreground border border-border/60')}>
              {Math.abs(main.medianGapPct) >= 25 && <TriangleAlert className="h-3.5 w-3.5 shrink-0" />}
              {main.medianGapPct > 0 ? '+' : ''}{main.medianGapPct}%
              <span className="font-normal">
                {L('median farq', 'медианная разница', 'median difference')}
              </span>
            </div>
          )}
        </div>

        {/* Boshqa kanallar */}
        {channels.length > 1 && (
          <div className="space-y-1">
            {channels.filter((c) => c.key !== main.key).map((c) => (
              <div key={c.key} className="flex items-center gap-2 text-xs rounded-lg bg-muted/30 px-3 py-2">
                <span className="font-medium flex-1 truncate">{c.channel}</span>
                <span className="tabular-nums text-muted-foreground">${c.medianShown} → ${c.medianRealized}</span>
                <span className="tabular-nums w-14 text-right">{c.medianGapPct > 0 ? '+' : ''}{c.medianGapPct}%</span>
                {!c.reliable && (
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {c.comparableDays} {L('kun', 'дн.', 'd')}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Sanalar ro'yxati */}
        {main.rows.length > 1 && (
          <details className="group">
            <summary className="text-[11px] text-muted-foreground cursor-pointer hover:text-foreground select-none">
              {L('Kunlar bo‘yicha ko‘rish', 'Показать по дням', 'Show by date')} ({main.rows.length})
            </summary>
            <div className="mt-2 max-h-52 overflow-y-auto space-y-0.5">
              {main.rows.map((r) => (
                <div key={r.date} className="flex items-center gap-2 text-[11px] tabular-nums px-2 py-1 rounded hover:bg-muted/40">
                  <span className="text-muted-foreground w-20">{r.date.slice(5)}</span>
                  <span className="w-14 text-right">${r.shown}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="w-16 text-right font-medium">${r.realized}</span>
                  <span className="text-muted-foreground w-10 text-right">{r.nights}t</span>
                  <span className={cn('w-14 text-right', r.gapPct <= -25 ? 'text-amber-600 dark:text-amber-500' : 'text-muted-foreground')}>
                    {r.gapPct > 0 ? '+' : ''}{r.gapPct}%
                  </span>
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Halollik: sababni BIZ aytmaymiz */}
        <div className="flex items-start gap-1.5 pt-3 border-t border-border/50 text-[10.5px] text-muted-foreground leading-relaxed">
          <Info className="h-3.5 w-3.5 shrink-0 mt-px" />
          <span>
            {L('Farqning sababini tizim aniqlay olmaydi — Exely javobida komissiya maydoni yo‘q va soliq nolga teng. Ehtimoliy sabablar: kanal komissiyasi, Genius/mobil chegirma, xona turi aralashmasi, uzoq qolish tarifi. Qaysi biri amal qilishini siz bilasiz.',
               'Причину разницы система определить не может — в ответе Exely нет поля комиссии, налог нулевой. Возможные причины: комиссия канала, скидка Genius/мобильная, микс типов номеров, тариф длительного проживания.',
               'The system cannot attribute the difference — Exely returns no commission field and zero tax. Possible causes: channel commission, Genius/mobile discount, room-type mix, length-of-stay rates.')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
