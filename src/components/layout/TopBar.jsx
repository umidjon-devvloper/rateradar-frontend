import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, ChevronDown, Bell, Building2, AlertTriangle,
  TrendingDown, TrendingUp, MessageSquare, Sparkles, Info, Menu,
  Plus, Check,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useT, useLang } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Logo } from '@/components/Logo';
import { notificationApi } from '@/lib/api';
import { onNotification, getSocket } from '@/lib/socket';
import { dropdownMenu, bellRingAnim, popIn } from '@/lib/animations';
import { cn } from '@/lib/utils';

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
  warning: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30',
  critical: 'text-red-500 bg-red-50 dark:bg-red-950/30',
  info: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30',
};

export function TopBar({ hotel, hotels = [], activeHotelId, onSwitchHotel, onAddHotel, onMenuClick }) {
  const t = useT();
  const lang = useLang((s) => s.lang);
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hotelSwitcherOpen, setHotelSwitcherOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);
  const [bellRing, setBellRing] = useState(0); // har yangi bildirishnomada oshadi → qo'ng'iroq jiringlaydi
  const menuRef = useRef(null);
  const switcherRef = useRef(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (switcherRef.current && !switcherRef.current.contains(e.target)) setHotelSwitcherOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        // Trigger competitor price check (creates notifications if needed)
        await notificationApi.checkCompetitors(lang).catch(() => {});
        const { count } = await notificationApi.unreadCount();
        if (!cancelled) setUnreadCount(count);
      } catch {}
    }
    tick();
    const interval = setInterval(tick, 60000); // every minute
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // activeHotelId — mehmonxona almashganda o'sha mehmonxona unread soni qayta olinadi
  }, [lang, activeHotelId]);

  // Real-time socket: yangi bildirishnoma kelganda darhol qo'shamiz
  useEffect(() => {
    if (!user) return;
    getSocket(); // ensure connection
    const off = onNotification((notif) => {
      // Faqat aktiv mehmonxonaning (yoki foydalanuvchi darajasidagi — hotelId yo'q)
      // bildirishnomasini hisoblaymiz/ko'rsatamiz — mehmonxonalar aralashmaydi.
      const nHotel = notif.hotelId ? String(notif.hotelId) : null;
      if (nHotel && activeHotelId && nHotel !== String(activeHotelId)) return;

      if (!notif.read) setUnreadCount((c) => c + 1);
      setBellRing((n) => n + 1); // qo'ng'iroqni jiringlatamiz

      // Toast ko'rsatamiz
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setToast(notif);
      toastTimerRef.current = setTimeout(() => setToast(null), 6000);
    });
    return () => {
      off();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [user, activeHotelId]);

  async function handleNotifClick(n) {
    if (!n.read) {
      await notificationApi.markRead(n._id).catch(() => {});
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    if (n.type === 'competitor_below' || n.type === 'price_drop' || n.type === 'price_rise') navigate('/prices');
    else if (n.type === 'new_review' || n.type === 'negative_review') navigate('/reviews');
    else navigate('/notifications');
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  function handleToastClick() {
    if (!toast) return;
    handleNotifClick(toast);
    setToast(null);
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    // DIQQAT: header'ning o'zida `transform` bo'lmasligi kerak — aks holda
    // `position: sticky` ishlamaydi. Shuning uchun kirish animatsiyasi
    // transformsiz (opacity) `animate-fade-in` orqali, motion emas.
    <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border/60 supports-[backdrop-filter]:bg-card/70 animate-fade-in">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92, rotate: -6 }}
            onClick={onMenuClick}
            className="p-2 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-4 w-4" />
          </motion.button>

          <div className="lg:hidden">
            <Logo showText={false} />
          </div>

          {hotel ? (
            <div className="hidden lg:block relative" ref={switcherRef}>
              <button
                onClick={() => setHotelSwitcherOpen((v) => !v)}
                className={cn(
                  'flex items-center gap-2 text-sm px-3 py-2 rounded-xl border transition-all',
                  hotelSwitcherOpen
                    ? 'bg-accent border-border'
                    : 'border-transparent hover:bg-accent/60 hover:border-border/60'
                )}
              >
                <Building2 className="h-4 w-4 text-primary" />
                <span className="font-medium">{hotel.name}</span>
                {hotel.city && <span className="text-muted-foreground">— {hotel.city}</span>}
                {hotels.length > 1 && (
                  <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', hotelSwitcherOpen && 'rotate-180')} />
                )}
                {hotels.length === 1 && (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/50" />
                )}
              </button>

              <AnimatePresence>
              {hotelSwitcherOpen && (
                <motion.div
                  variants={dropdownMenu}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  style={{ transformOrigin: 'top left' }}
                  className="absolute left-0 top-full mt-1.5 w-72 bg-popover border border-border/60 rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] z-50 overflow-hidden"
                >
                  <div className="px-3 py-2 border-b text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    {t('myHotels') || 'Mening mehmonxonalarim'}
                  </div>
                  <div className="max-h-72 overflow-y-auto py-1">
                    {hotels.map((h) => {
                      const isActive = String(h._id) === String(activeHotelId);
                      return (
                        <button
                          key={h._id}
                          onClick={() => {
                            if (!isActive) onSwitchHotel?.(h._id);
                            setHotelSwitcherOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center gap-2.5 px-3 py-2 hover:bg-accent/60 transition-colors text-left',
                            isActive && 'bg-primary/5'
                          )}
                        >
                          <div className={cn(
                            'w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-semibold shrink-0',
                            isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          )}>
                            {h.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={cn('text-sm truncate', isActive ? 'font-semibold' : 'font-medium')}>
                              {h.name}
                            </div>
                            {h.city && (
                              <div className="text-[11px] text-muted-foreground truncate">{h.city}</div>
                            )}
                          </div>
                          {isActive && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => {
                      setHotelSwitcherOpen(false);
                      onAddHotel?.();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 border-t hover:bg-accent/60 transition-colors text-left text-sm text-primary font-medium"
                  >
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Plus className="h-3.5 w-3.5" />
                    </div>
                    {t('addHotel') || 'Yangi mehmonxona qo\'shish'}
                  </button>
                </motion.div>
              )}
              </AnimatePresence>
            </div>
          ) : (
            <span className="hidden lg:block text-muted-foreground text-sm">{t('welcome')}, {user?.name}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/notifications')}
            title={t('notifications')}
            className="relative p-2 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            <motion.span
              key={bellRing}
              animate={bellRing > 0 ? bellRingAnim : {}}
              style={{ display: 'inline-block', transformOrigin: 'top center' }}
            >
              <Bell className="h-4 w-4" />
            </motion.span>
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  key={unreadCount}
                  variants={popIn}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center shadow-sm shadow-red-500/40"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <div className="relative" ref={menuRef}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-violet-600 text-primary-foreground flex items-center justify-center text-xs font-semibold ring-2 ring-primary/15 shadow-sm">
                {initials}
              </div>
              <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', menuOpen && 'rotate-180')} />
            </motion.button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  variants={dropdownMenu}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  style={{ transformOrigin: 'top right' }}
                  className="absolute right-0 top-full mt-1.5 w-56 bg-popover border border-border/60 rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] py-1 z-50 overflow-hidden"
                >
                  <div className="px-3 py-2 border-b">
                    <div className="text-sm font-medium truncate">{user?.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4 text-muted-foreground" />
                    {t('logout')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Real-time toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="fixed top-16 right-4 z-[60] w-80 max-w-[calc(100vw-2rem)]"
          >
          <button
            onClick={handleToastClick}
            className="w-full text-left bg-popover border shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] rounded-xl p-3 flex gap-3 hover:border-primary/40 transition-colors"
          >
            {(() => {
              const Icon = TYPE_ICON[toast.type] || Info;
              const colorClass = SEVERITY_COLOR[toast.severity] || SEVERITY_COLOR.info;
              return (
                <div className={cn('w-9 h-9 rounded-md flex items-center justify-center shrink-0', colorClass)}>
                  <Icon className="h-4 w-4" />
                </div>
              );
            })()}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <div className="text-sm font-semibold truncate">{toast.title}</div>
              </div>
              {toast.message && (
                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{toast.message}</div>
              )}
              <div className="text-[10px] text-primary mt-1 font-medium">{t('justNow') || 'Hozir'}</div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setToast(null); }}
              className="text-muted-foreground hover:text-foreground p-0.5 -mt-0.5 -mr-0.5 shrink-0"
              aria-label="Yopish"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
