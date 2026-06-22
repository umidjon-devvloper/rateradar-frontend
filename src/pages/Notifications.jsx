import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Bell, AlertTriangle, TrendingDown, TrendingUp, MessageSquare,
  Sparkles, Info, CheckCheck, RefreshCw, ChevronRight, Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT, useLang } from '@/lib/i18n';
import { notificationApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { getCache, setCache } from '@/lib/clientCache';

const TYPE_ICON = {
  competitor_below: TrendingDown,
  price_drop: TrendingDown,
  price_rise: TrendingUp,
  new_review: MessageSquare,
  negative_review: AlertTriangle,
  ai_recommendation: Sparkles,
  system: Info,
};

const SEVERITY_COLOR = {
  warning: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950/30',
  critical: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30',
  info: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30',
};

function timeAgo(date, t) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return t('justNow');
  if (m < 60) return `${m} ${t('minutesAgo')}`;
  if (h < 24) return `${h} ${t('hoursAgo')}`;
  return `${d} ${t('daysAgo')}`;
}

// Bildirishnomalarni sana bo'yicha guruhlash kaliti
function dateGroupKey(date) {
  const d = new Date(date);
  const now = new Date();
  const startOfDay = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOfDay(now) - startOfDay(d)) / 86400000);
  if (Number.isNaN(days) || days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return 'week';
  return 'earlier';
}

const GROUP_LABEL = {
  today: { uz: 'Bugun', ru: 'Сегодня', en: 'Today' },
  yesterday: { uz: 'Kecha', ru: 'Вчера', en: 'Yesterday' },
  week: { uz: 'Shu hafta', ru: 'На этой неделе', en: 'This week' },
  earlier: { uz: 'Avvalroq', ru: 'Ранее', en: 'Earlier' },
};
const GROUP_ORDER = ['today', 'yesterday', 'week', 'earlier'];

export default function Notifications() {
  const t = useT();
  const lang = useLang((s) => s.lang);
  const navigate = useNavigate();
  const { hotel } = useOutletContext();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | unread
  const [markingAll, setMarkingAll] = useState(false);

  // Stale-while-revalidate: keshdan darrov ko'rsatamiz (TTL qisqa — bildirishnoma
  // tez o'zgaradi), orqa fonda yangilab unread sonini aniqlaymiz.
  async function load() {
    const key = hotel?._id ? `notifications:${hotel._id}` : null;
    const cached = key ? getCache(key, 5 * 60_000) : null; // 5 daqiqa
    if (cached) {
      setNotifications(cached.notifications || []);
      setUnreadCount(cached.unreadCount || 0);
      setLoading(false);
    } else {
      setLoading(true);
    }
    try {
      const data = await notificationApi.list();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      if (key) setCache(key, data);
    } finally {
      setLoading(false);
    }
  }

  // Mehmonxona almashganda — o'sha mehmonxonaning bildirishnomalarini qayta yuklaymiz.
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotel?._id]);

  async function handleClick(n) {
    if (!n.read) {
      await notificationApi.markRead(n._id).catch(() => {});
      setNotifications((arr) => arr.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    if (n.type === 'competitor_below' || n.type === 'price_drop' || n.type === 'price_rise') navigate('/prices');
    else if (n.type === 'new_review' || n.type === 'negative_review') navigate('/reviews');
    else if (n.type === 'ai_recommendation') navigate('/ai');
  }

  async function handleMarkAllRead() {
    setMarkingAll(true);
    try {
      await notificationApi.markAllRead();
      setNotifications((arr) => arr.map((x) => ({ ...x, read: true })));
      setUnreadCount(0);
    } finally {
      setMarkingAll(false);
    }
  }

  // Filtr + sana bo'yicha guruhlash
  const groups = useMemo(() => {
    const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;
    const map = {};
    for (const n of filtered) {
      const k = dateGroupKey(n.createdAt);
      (map[k] ||= []).push(n);
    }
    return GROUP_ORDER.filter((k) => map[k]?.length).map((k) => ({ key: k, items: map[k] }));
  }, [notifications, filter]);

  const total = notifications.length;
  const tabs = [
    { key: 'all', label: lang === 'uz' ? 'Hammasi' : lang === 'ru' ? 'Все' : 'All', count: total },
    { key: 'unread', label: t('unread') || (lang === 'ru' ? 'Непрочитанные' : 'Unread'), count: unreadCount },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            {t('notifications')}
            {unreadCount > 0 && (
              <span className="ml-1 min-w-[22px] h-[22px] px-1.5 bg-red-500 text-white text-xs font-semibold rounded-full inline-flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === 'uz' ? 'Raqobatchi narxlari, sharhlar va tizim ogohlantirishlari'
              : lang === 'ru' ? 'Цены конкурентов, отзывы и системные оповещения'
              : 'Competitor prices, reviews and system alerts'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter tabs */}
          <div className="inline-flex items-center gap-1 bg-muted/60 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5',
                  filter === tab.key
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
                <span className={cn(
                  'min-w-[18px] h-[18px] px-1 rounded-full text-[10px] inline-flex items-center justify-center',
                  filter === tab.key ? 'bg-primary/10 text-primary' : 'bg-muted-foreground/15 text-muted-foreground'
                )}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={markingAll}>
              <CheckCheck className={cn('h-3.5 w-3.5 mr-1.5', markingAll && 'animate-pulse')} />
              {t('markAllRead')}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={cn('h-3.5 w-3.5 mr-1.5', loading && 'animate-spin')} />
            {t('refresh')}
          </Button>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="inline-block w-7 h-7 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <div className="text-sm text-muted-foreground mt-3">{t('loading')}</div>
        </div>
      ) : groups.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Inbox className="h-7 w-7 text-muted-foreground/60" />
          </div>
          <div className="text-base font-medium">
            {filter === 'unread'
              ? (lang === 'uz' ? 'O\'qilmagan bildirishnoma yo\'q' : lang === 'ru' ? 'Нет непрочитанных' : 'No unread notifications')
              : t('noNotifications')}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {lang === 'uz' ? 'Yangi o\'zgarishlar bo\'lganda shu yerda ko\'rinadi'
              : lang === 'ru' ? 'Новые изменения появятся здесь'
              : 'New changes will appear here'}
          </div>
        </div>
      ) : (
        <div className="space-y-6 max-w-3xl">
          {groups.map((group) => (
            <div key={group.key}>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 px-1">
                {GROUP_LABEL[group.key][lang] || GROUP_LABEL[group.key].en}
              </div>
              <div className="space-y-2">
                {group.items.map((n) => {
                  const Icon = TYPE_ICON[n.type] || Info;
                  const colorClass = SEVERITY_COLOR[n.severity] || SEVERITY_COLOR.info;
                  return (
                    <button
                      key={n._id}
                      onClick={() => handleClick(n)}
                      className={cn(
                        'w-full flex gap-3.5 p-4 rounded-xl border text-left transition-all group relative',
                        'hover:shadow-md hover:border-primary/30',
                        n.read ? 'bg-card border-border/60' : 'bg-primary/[0.035] border-primary/20'
                      )}
                    >
                      {!n.read && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-primary rounded-r-full" />
                      )}
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', colorClass)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <div className={cn('text-sm flex-1 min-w-0', n.read ? 'font-medium text-foreground/90' : 'font-semibold')}>
                            {n.title}
                          </div>
                          <div className="text-[11px] text-muted-foreground/80 shrink-0 mt-0.5 whitespace-nowrap">
                            {timeAgo(n.createdAt, t)}
                          </div>
                        </div>
                        {n.message && (
                          <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.message}</div>
                        )}
                        {n.payload?.diffPercent != null && (
                          <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
                            <span>−{n.payload.diffPercent}%</span>
                            {n.payload.competitorPrice != null && n.payload.hotelPrice != null && (
                              <span className="text-red-500/70 font-normal">
                                ${n.payload.competitorPrice} vs ${n.payload.hotelPrice}
                              </span>
                            )}
                            {n.payload.competitorSource && (
                              <span className="text-red-500 font-semibold">· {n.payload.competitorSource}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-colors self-center shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
