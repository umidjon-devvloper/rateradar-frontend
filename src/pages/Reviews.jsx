import { useState, useEffect } from 'react';
import {
  MessageSquare, Star, Sparkles, ThumbsUp, ThumbsDown, RefreshCw, Download,
  Copy, Check, Send, X, Loader2, Pencil,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useT, useLang } from '@/lib/i18n';
import { reviewApi, hotelApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { getCache, setCache } from '@/lib/clientCache';
import { getOtaBrand } from '@/lib/otaBrands';
import ReviewsScoreBoard from '@/components/ReviewsScoreBoard';

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
  'bg-indigo-500', 'bg-fuchsia-500', 'bg-sky-500', 'bg-teal-500',
];

function avatarColor(name) {
  const s = String(name || 'A');
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name) {
  const parts = String(name || 'A').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0] || 'A').slice(0, 2).toUpperCase();
}

function relativeDate(date, lang) {
  if (!date) {
    return lang === 'uz' ? 'Sana noma\'lum' : lang === 'ru' ? 'Дата неизвестна' : 'Date unknown';
  }
  const d = new Date(date).getTime();
  if (Number.isNaN(d)) {
    return lang === 'uz' ? 'Sana noma\'lum' : lang === 'ru' ? 'Дата неизвестна' : 'Date unknown';
  }
  const days = Math.round((Date.now() - d) / (1000 * 60 * 60 * 24));
  if (days <= 0) return lang === 'uz' ? 'Bugun' : lang === 'ru' ? 'Сегодня' : 'Today';
  if (days === 1) return lang === 'uz' ? 'Kecha' : lang === 'ru' ? 'Вчера' : 'Yesterday';
  if (days < 30) {
    if (lang === 'ru') return `${days} ${days < 5 ? 'дня' : 'дней'} назад`;
    if (lang === 'uz') return `${days} kun oldin`;
    return `${days} days ago`;
  }
  // Bir yildan eski sharhlar uchun yilni ham ko'rsatamiz
  const overYear = days >= 365;
  return new Date(date).toLocaleDateString(
    lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'uz-UZ',
    overYear
      ? { day: 'numeric', month: 'short', year: 'numeric' }
      : { day: 'numeric', month: 'short' }
  );
}

function topicChipClass(sentiment) {
  if (sentiment === 'negative') return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/40';
  if (sentiment === 'positive') return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/40';
  return 'bg-muted text-muted-foreground border-border';
}

export default function Reviews() {
  const t = useT();
  const lang = useLang((s) => s.lang);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [scraping, setScraping] = useState(false);
  const [scrapeMsg, setScrapeMsg] = useState('');
  const [selected, setSelected] = useState(null);
  const [fetchingAll, setFetchingAll] = useState(false);

  // Stale-while-revalidate: keshdan darrov, orqa fonda yangilaymiz.
  // Aktiv hotel id'ni kalitga qo'shamiz (mehmonxonalar orasida aralashmasin).
  async function load() {
    const hid = localStorage.getItem('rr_active_hotel_id') || 'me';
    const key = `reviews:${hid}:${filter}`;
    const cached = getCache(key, 30 * 60_000); // 30 daqiqa
    if (cached) { setData(cached); setLoading(false); } else { setLoading(true); }
    try {
      const params = {};
      if (filter !== 'all') params.sentiment = filter;
      const res = await reviewApi.list(params);
      setData(res);
      setCache(key, res);
    } finally {
      setLoading(false);
    }
  }

  // Bir bosishda BARCHA platformadan (Booking, Agoda, Expedia, Trip, Yandex)
  // sharh oladi — har birini alohida bosib o'tirmaslik uchun. Parallel, tezroq.
  async function fetchAllSources() {
    const sources = ['booking', 'agoda', 'expedia', 'trip', 'yandex'];
    setFetchingAll(true);
    setScrapeMsg(
      lang === 'uz' ? 'Barcha platformalardan olinmoqda…'
      : lang === 'ru' ? 'Загрузка со всех платформ…'
      : 'Fetching from all platforms…'
    );
    try {
      const results = await Promise.allSettled(
        sources.map((source) => reviewApi.scrapeApify({ autoFind: true, source }))
      );
      const added = results.reduce(
        (s, r) => s + (r.status === 'fulfilled' ? (r.value?.added || 0) : 0), 0
      );
      const ok = results.filter((r) => r.status === 'fulfilled').length;
      setScrapeMsg(
        lang === 'uz' ? `${ok}/${sources.length} platforma — jami ${added} ta sharh olindi`
        : lang === 'ru' ? `${ok}/${sources.length} платформ — всего ${added} отзывов`
        : `${ok}/${sources.length} platforms — ${added} reviews total`
      );
      await load();
    } finally {
      setFetchingAll(false);
    }
  }

  // URL topilmaganda foydalanuvchi qo'lda kiritган URL'ni hotel.otaUrls'ga
  // saqlaydi (mavjudlarni saqlab, faqat shu platformani qo'shadi) va qayta yuklaydi.
  const SOURCE_TO_OTA = {
    booking: 'Booking.com', agoda: 'Agoda', expedia: 'Expedia',
    trip: 'Trip.com', yandex: 'Yandex',
  };
  async function saveSourceUrl(source, rawUrl) {
    const otaName = SOURCE_TO_OTA[source];
    const url = String(rawUrl || '').trim();
    if (!otaName || !url) return;
    const me = await hotelApi.getMine();
    const merged = { ...(me?.otaUrls || {}), [otaName]: url };
    await hotelApi.update({ otaUrls: merged });
    setScrapeMsg(
      lang === 'uz' ? `✓ ${otaName} havolasi saqlandi`
      : lang === 'ru' ? `✓ Ссылка ${otaName} сохранена`
      : `✓ ${otaName} URL saved`
    );
    await load();
  }

  async function scrapeFromInternet(reset = false) {
    setScraping(true);
    setScrapeMsg('');
    try {
      const res = await reviewApi.scrape(reset);
      if (res.notFound) {
        setScrapeMsg(res.message || (
          lang === 'uz' ? 'Mehmonxona Google\'da topilmadi'
          : lang === 'ru' ? 'Отель не найден в Google'
          : 'Hotel not found on Google'
        ));
      } else if (res.added > 0) {
        const placeName = res.matchedPlace?.name ? ` (${res.matchedPlace.name})` : '';
        const srcBreakdown = res.addedBySource
          ? ' — ' + Object.entries(res.addedBySource).map(([s, n]) => `${s}:${n}`).join(', ')
          : '';
        setScrapeMsg(
          lang === 'uz' ? `${res.added} ta yangi sharh yuklandi${placeName}${srcBreakdown}`
          : lang === 'ru' ? `Загружено ${res.added} новых отзывов${placeName}${srcBreakdown}`
          : `${res.added} new reviews loaded${placeName}${srcBreakdown}`
        );
        await load();
      } else {
        setScrapeMsg(res.message || (
          lang === 'uz' ? 'Yangi sharh topilmadi'
          : lang === 'ru' ? 'Новых отзывов не найдено'
          : 'No new reviews found'
        ));
      }
      setTimeout(() => setScrapeMsg(''), 6000);
    } catch (err) {
      setScrapeMsg(err.response?.data?.error || err.message);
    } finally {
      setScraping(false);
    }
  }

  useEffect(() => {
    setPlatformFilter('all');
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const allReviews = data?.reviews || [];
  const stats = data?.stats || { positive: 0, negative: 0, neutral: 0 };
  const total = data?.total || 0;

  const platforms = ['all', ...Array.from(new Set(allReviews.map((r) => r.platform).filter(Boolean)))];
  const reviews = platformFilter === 'all' ? allReviews : allReviews.filter((r) => r.platform === platformFilter);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {lang === 'uz' ? 'AI Sharhlar tahlili' : lang === 'ru' ? 'AI Анализ Отзывов' : 'AI Review Analysis'}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === 'uz' ? 'Avtomatik kategoriyalash va javob generatsiyasi'
              : lang === 'ru' ? 'Автоматическая категоризация и генерация ответов'
              : 'Automatic categorization and response generation'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FilterTabs filter={filter} setFilter={setFilter} total={total} stats={stats} lang={lang} />
        </div>
      </div>
      {scrapeMsg && (
        <div className="text-xs text-muted-foreground -mt-2 ml-1">{scrapeMsg}</div>
      )}

      {/* Sharhlar Score Board — obro' paneli (ball, KPI, trend, platforma donut) */}
      <ReviewsScoreBoard reviews={allReviews} stats={stats} total={total} lang={lang} />

      {/* Bir bosishda barcha platformadan sharh olish — har birini alohida
          bosmaslik uchun. Kartalar ustida katta, ko'zga tashlanadigan tugma. */}
      <Button
        onClick={fetchAllSources}
        disabled={fetchingAll}
        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-soft"
      >
        {fetchingAll ? (
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        ) : (
          <Download className="h-5 w-5 mr-2" />
        )}
        {fetchingAll
          ? (lang === 'uz' ? 'Barcha platformalardan olinmoqda…' : lang === 'ru' ? 'Загрузка со всех платформ…' : 'Fetching from all platforms…')
          : (lang === 'uz' ? 'Bu platformalarning hammasidan sharh olish' : lang === 'ru' ? 'Загрузить отзывы со всех платформ' : 'Fetch reviews from all these platforms')}
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-3">
        <ApifySourceCard
          source="booking"
          label="Booking.com"
          url={data?.apifyProvider?.bookingUrl}
          configured={data?.apifyProvider?.configured}
          lang={lang}
          onSaveUrl={saveSourceUrl}
        />
        <ApifySourceCard
          source="agoda"
          label="Agoda"
          url={data?.apifyProvider?.agodaUrl}
          configured={data?.apifyProvider?.configured}
          lang={lang}
          onSaveUrl={saveSourceUrl}
        />
        <ApifySourceCard
          source="expedia"
          label="Expedia"
          url={data?.apifyProvider?.expediaUrl}
          configured={data?.apifyProvider?.configured}
          lang={lang}
          onSaveUrl={saveSourceUrl}
        />
        <ApifySourceCard
          source="trip"
          label="Trip.com"
          url={data?.apifyProvider?.tripUrl}
          configured={data?.apifyProvider?.configured}
          lang={lang}
          onSaveUrl={saveSourceUrl}
        />
        <ApifySourceCard
          source="yandex"
          label="Yandex"
          url={data?.apifyProvider?.yandexUrl}
          configured={data?.apifyProvider?.configured}
          lang={lang}
          onSaveUrl={saveSourceUrl}
        />
      </div>

      {platforms.length > 2 && (
        <div className="flex gap-1.5 flex-wrap">
          {platforms.map((p) => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                platformFilter === p
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              )}
            >
              {p === 'all'
                ? (lang === 'uz' ? 'Barchasi' : lang === 'ru' ? 'Все' : 'All')
                : p}
              {p === 'all' && <span className="ml-1 opacity-60">({allReviews.length})</span>}
              {p !== 'all' && (
                <span className="ml-1 opacity-60">({allReviews.filter((r) => r.platform === p).length})</span>
              )}
            </button>
          ))}
        </div>
      )}

      {loading && !data ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">{t('loading')}</CardContent>
        </Card>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="max-w-md mx-auto text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h2 className="text-base font-semibold mb-1">{t('noReviewsYet')}</h2>
              <p className="text-sm text-muted-foreground">{t('noReviewsHint')}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <ReviewCard key={r._id} review={r} lang={lang} onGenerate={() => setSelected(r)} />
          ))}
        </div>
      )}

      {selected && (
        <AiResponseModal review={selected} lang={lang} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

// Manba kartasi ramkasi — brend rangiga mos yumshoq chiziq
const SOURCE_BORDER = {
  booking: 'border-blue-200 dark:border-blue-800/50',
  agoda: 'border-rose-200 dark:border-rose-800/50',
  expedia: 'border-amber-200 dark:border-amber-800/50',
  trip: 'border-sky-200 dark:border-sky-800/50',
  yandex: 'border-amber-200 dark:border-amber-800/50',
};

function ApifySourceCard({ source, label, url, configured, lang, onSaveUrl }) {
  const [input, setInput] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const l = (uz, en) => lang === 'uz' ? uz : en;
  const brand = getOtaBrand(label);
  if (!configured) return null;

  const clickable = Boolean(url);
  // URL bo'lmasa yoki foydalanuvchi "qalam"ni bosgan bo'lsa — kiritish rejimi.
  const showInput = !clickable || editing;

  const startEdit = () => { setInput(url || ''); setEditing(true); setError(''); };

  const save = async () => {
    const v = input.trim();
    if (!v) return;
    setSaving(true);
    setError('');
    try {
      await onSaveUrl?.(source, v);
      setEditing(false);
      setInput('');
    } catch (err) {
      // Xatoni yutib yubormaymiz — foydalanuvchi "saqlanmadi"ni ko'rsin.
      setError(err?.response?.data?.error || err?.message || l('Saqlashda xato', 'Save failed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className={cn(SOURCE_BORDER[source], clickable && !editing && 'transition-shadow hover:shadow-md')}>
      <CardContent className="py-3 flex items-center gap-3">
        <div className={cn(
          'w-9 h-9 rounded-xl text-white font-semibold text-sm flex items-center justify-center shrink-0 shadow-soft',
          brand.gradient
        )}>
          {brand.short}
        </div>

        {!showInput ? (
          <>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              title={url}
              className="min-w-0 flex-1 flex items-center gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="text-xs flex items-center gap-1.5">
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground">— {l('sharhlar', 'reviews')}</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5 truncate">📎 {url}</div>
              </div>
              <span className="text-muted-foreground shrink-0 text-base leading-none">↗</span>
            </a>
            <button
              onClick={startEdit}
              title={l('Havolani o\'zgartirish', 'Edit URL')}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <div className="min-w-0 flex-1">
            <div className="text-xs flex items-center gap-1.5">
              <span className="font-medium">{label}</span>
              {clickable ? (
                <span className="text-muted-foreground">
                  — {l('havolani o\'zgartirish', 'edit URL')}
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400">
                  — {l('URL topilmadi — qo\'lda kiriting', 'URL not found — enter manually')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <input
                type="url"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
                placeholder={l(`${label} sahifa havolasi`, `${label} page URL`)}
                className="flex-1 min-w-0 text-[11px] px-2 py-1.5 rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button size="sm" variant="default" onClick={save} disabled={saving || !input.trim()}>
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : l('Saqlash', 'Save')}
              </Button>
              {clickable && (
                <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setError(''); }} disabled={saving}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            {error && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 break-all">{error}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FilterTabs({ filter, setFilter, total, stats, lang }) {
  const tabs = [
    { v: 'all', icon: null, label: lang === 'uz' ? 'Hammasi' : lang === 'ru' ? 'Все' : 'All', count: total },
    { v: 'positive', icon: ThumbsUp, label: lang === 'uz' ? 'Ijobiy' : lang === 'ru' ? 'Позитив' : 'Positive', count: stats.positive },
    { v: 'negative', icon: ThumbsDown, label: lang === 'uz' ? 'Salbiy' : lang === 'ru' ? 'Негатив' : 'Negative', count: stats.negative },
  ];
  return (
    <div className="inline-flex rounded-md border bg-card p-0.5">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = filter === tab.v;
        return (
          <button
            key={tab.v}
            onClick={() => setFilter(tab.v)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors',
              active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {Icon && <Icon className="h-3 w-3" />}
            <span>{tab.label}</span>
            {tab.v === 'all' && <span className="opacity-70">({tab.count})</span>}
          </button>
        );
      })}
    </div>
  );
}

function ReviewCard({ review, lang, onGenerate }) {
  const platformClass = getOtaBrand(review.platform).badge;
  const ratingOf10 = Math.round((review.rating || 0) * 2);

  return (
    <Card className={cn(!review.seenByUser && 'border-primary/30')}>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={cn('w-10 h-10 rounded-full text-white text-sm font-semibold flex items-center justify-center shrink-0', avatarColor(review.author))}>
              {initials(review.author)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm truncate">{review.author || 'Anonymous'}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded', platformClass)}>
                  {review.platform}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {relativeDate(review.publishedAt, lang)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm font-medium shrink-0 px-2 py-1 rounded-md bg-muted/50">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="tabular-nums">{ratingOf10}</span>
          </div>
        </div>

        {review.text && (
          <p className="text-sm leading-relaxed text-foreground/90 line-clamp-3 mb-3">
            {review.text}
          </p>
        )}

        {review.topics?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {review.topics.map((topic) => (
              <span
                key={topic}
                className={cn(
                  'text-[11px] px-2 py-0.5 rounded-full border',
                  topicChipClass(review.sentiment)
                )}
              >
                #{topic}
              </span>
            ))}
          </div>
        )}

        <Button variant="outline" className="w-full" onClick={onGenerate}>
          <Sparkles className="h-3.5 w-3.5 mr-2 text-primary" />
          {lang === 'uz' ? 'AI javob generatsiya qilish' : lang === 'ru' ? 'Generate AI Response' : 'Generate AI Response'}
        </Button>
      </CardContent>
    </Card>
  );
}

function AiResponseModal({ review, lang, onClose }) {
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const platformClass = getOtaBrand(review.platform).badge;
  const ratingOf10 = Math.round((review.rating || 0) * 2);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    reviewApi.generateResponse(review._id, lang)
      .then((res) => { if (alive) setResponse(res.response || ''); })
      .catch((err) => {
        if (alive) setError(err.response?.data?.error || err.message);
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [review._id, lang]);

  function copyToClipboard() {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-card rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto border" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between p-5 border-b">
          <div>
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {lang === 'uz' ? 'AI javob sharhga' : lang === 'ru' ? 'AI-ответ на отзыв' : 'AI response to review'}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {lang === 'uz'
                ? `Tonallik va teglar asosida ${review.author || 'mehmon'} sharhi uchun yaratildi`
                : lang === 'ru'
                ? `Сгенерировано на основе тональности и тегов отзыва от ${review.author || 'гость'}`
                : `Generated based on tone and tags of ${review.author || 'guest'}'s review`}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded', platformClass)}>
                {review.platform}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {ratingOf10}/10
              </span>
            </div>
            <p className="text-sm text-foreground/80 italic leading-relaxed">
              "{review.text}"
            </p>
          </div>

          <div>
            <label className="text-xs font-medium mb-1.5 block">
              {lang === 'uz' ? 'Sizning javobingiz' : lang === 'ru' ? 'Ваш ответ' : 'Your response'}
            </label>
            {loading ? (
              <div className="border rounded-lg p-6 flex items-center justify-center text-muted-foreground gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">
                  {lang === 'uz' ? 'AI javob yozmoqda...' : lang === 'ru' ? 'AI составляет ответ...' : 'AI is generating response...'}
                </span>
              </div>
            ) : error ? (
              <div className="border border-rose-200 dark:border-rose-900/50 rounded-lg p-4 text-sm text-rose-600">
                {error}
              </div>
            ) : (
              <textarea
                className="w-full min-h-[180px] border rounded-lg p-3 text-sm leading-relaxed bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
              />
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={copyToClipboard} disabled={!response}>
              {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
              {copied
                ? (lang === 'uz' ? 'Nusxalandi' : lang === 'ru' ? 'Скопировано' : 'Copied')
                : (lang === 'uz' ? 'Nusxalash' : lang === 'ru' ? 'Копировать' : 'Copy')}
            </Button>
            <Button disabled={!response}>
              <Send className="h-3.5 w-3.5 mr-1.5" />
              {lang === 'uz' ? 'Joylash' : lang === 'ru' ? 'Опубликовать' : 'Publish'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
