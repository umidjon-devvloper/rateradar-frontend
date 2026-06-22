import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Lightbulb, ArrowRight, RefreshCw, Loader2, ConciergeBell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { aiApi } from '@/lib/api';
import { useLang } from '@/lib/i18n';
import { useFormatPrice } from '@/lib/utils';
import { getCache, setCache } from '@/lib/clientCache';

/**
 * AI Maslahatchi — o'zini-o'zi yuklaydigan, keshlanadigan panel.
 *
 * Narx/statistika + raqiblarga qarab tavsiya beradi. Backend (aiApi.priceRecommendations)
 * hotel-service ulanmagan bo'lsa "ulang" maslahatini ham qaytarishi mumkin
 * (recommendation.action === 'connect_hotel_service').
 *
 * Token tejash uchun natija 12 soat localStorage'da keshlanadi. "Yangilash"
 * bosilgandagina AI'ga qayta so'rov ketadi (force=true).
 *
 * Props:
 *   hotel    — { _id, ... } aktiv mehmonxona
 *   autoLoad — birinchi ochilishda avtomatik yuklash (default true)
 */
export default function AiAdvisor({ hotel, autoLoad = true }) {
  const lang = useLang((s) => s.lang);
  const formatPrice = useFormatPrice();
  const L = (uz, ru, en) => (lang === 'uz' ? uz : lang === 'ru' ? ru : en);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const loadedRef = useRef(false);

  // force=false — keshdan (so'rov yubormaydi); force=true — AI'ga qayta so'rov.
  const loadAi = useCallback(
    async (force = false) => {
      if (!hotel?._id) return;
      const cacheKey = `ai:${hotel._id}:${lang}`;
      if (!force) {
        const cached = getCache(cacheKey, 12 * 3600_000); // 12 soat
        if (cached) {
          setData(cached);
          return;
        }
      }
      setLoading(true);
      setError('');
      try {
        const res = await aiApi.priceRecommendations(lang, force);
        setData(res);
        setCache(cacheKey, res);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    },
    [lang, hotel?._id],
  );

  // Birinchi ochilishda bir martagina avtomatik yuklash (keshdan yoki AI'dan).
  useEffect(() => {
    if (!autoLoad || loadedRef.current || !hotel?._id) return;
    loadedRef.current = true;
    loadAi();
  }, [autoLoad, hotel?._id, loadAi]);

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
              {L('Narx va statistikaga qarab tavsiyalar', 'Рекомендации по ценам и статистике', 'Recommendations based on pricing & stats')}
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => loadAi(true)} disabled={loading}>
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
            <Button variant="outline" size="sm" className="mt-3" onClick={() => loadAi(true)}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              {L('Qayta urinish', 'Повторить', 'Retry')}
            </Button>
          </div>
        ) : recs.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {L(
              "Hozircha tavsiya yo'q. Raqiblar narxini yangilab, qayta urinib ko'ring.",
              'Пока нет рекомендаций. Обновите цены конкурентов.',
              'No recommendations yet. Refresh competitor prices and try again.',
            )}
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
              {recs.map((r, i) => {
                const isHs = r.action === 'connect_hotel_service';
                return (
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
                    {/* hotel-service ulanish tavsiyasi — to'g'ridan-to'g'ri havola */}
                    {isHs && (
                      <Link
                        to="/hotel-service"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                      >
                        <ConciergeBell className="h-3.5 w-3.5" />
                        {L('Mehmonxona xizmatiga ulanish', 'Подключить сервис отеля', 'Connect hotel service')}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {L(
                "AI tomonidan yaratilgan — yakuniy qarorni o'zingiz qabul qiling",
                'Сгенерировано ИИ — окончательное решение за вами',
                'AI-generated — final decision is yours',
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
