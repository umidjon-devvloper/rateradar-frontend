import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, TrendingUp, MessageSquare, Sparkles,
  Settings, Globe, Shield, X, BookOpen, Zap, Map, Bell, ConciergeBell,
  ChevronRight, CreditCard, ShieldAlert,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useT } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

function NavItem({ to, icon: Icon, label, collapsed, onClose }) {
  return (
    <NavLink
      to={to}
      onClick={onClose}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm',
          'transition-all duration-200',
          collapsed && 'lg:justify-center lg:px-0',
          isActive
            ? 'text-primary font-semibold bg-gradient-to-r from-primary/[0.12] via-primary/[0.05] to-transparent'
            : 'text-muted-foreground font-medium hover:bg-accent/60 hover:text-foreground',
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Chap accent chizig'i (faol holatda) */}
          <span
            className={cn(
              'absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-primary transition-all duration-300',
              isActive ? 'h-5 opacity-100' : 'h-0 opacity-0',
            )}
          />
          {/* Ikonka qutisi */}
          <span
            className={cn(
              'grid place-items-center rounded-lg shrink-0 transition-all duration-200',
              collapsed ? 'h-9 w-9' : 'h-8 w-8',
              isActive
                ? 'bg-gradient-to-br from-primary to-[hsl(221_83%_45%)] text-white shadow-[0_4px_12px_-2px_hsl(var(--primary)/0.55)]'
                : 'bg-transparent text-muted-foreground group-hover:bg-background group-hover:text-foreground',
            )}
          >
            <Icon className="h-[17px] w-[17px]" />
          </span>
          <span
            className={cn(
              'whitespace-nowrap transition-all duration-200 overflow-hidden',
              collapsed ? 'lg:w-0 lg:opacity-0' : 'opacity-100',
            )}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}

export function Sidebar({ mobileOpen, collapsed, onClose }) {
  const t = useT();
  const user = useAuth((s) => s.user);
  const isAdmin = user?.role === 'admin';
  const isPro = user?.plan === 'pro';

  // Admin — tizim administratori. Unga faqat Admin paneli ko'rsatiladi,
  // mehmonxona egasiga mo'ljallangan sahifalar emas.
  const groups = isAdmin
    ? [
        {
          label: t('navGroupSystem'),
          items: [
            { to: '/admin', icon: Shield, label: 'Admin' },
            { to: '/security', icon: ShieldAlert, label: t('securityNav') },
          ],
        },
      ]
    : [
        {
          label: t('navGroupMonitoring'),
          items: [
            { to: '/dashboard', icon: LayoutDashboard, label: t('overview') },
            { to: '/competitors', icon: Users, label: t('competitors') },
            { to: '/prices', icon: TrendingUp, label: t('rateShopper') },
            { to: '/ota-channels', icon: Globe, label: t('otaChannels') },
            { to: '/xotelo', icon: Zap, label: t('freePrices') },
            { to: '/rating-map', icon: Map, label: t('ratingMap') },
          ],
        },
        {
          label: t('navGroupClients'),
          items: [
            { to: '/reviews', icon: MessageSquare, label: t('reviews') },
            { to: '/notifications', icon: Bell, label: t('notifications') },
            { to: '/ai', icon: Sparkles, label: t('aiAnalysis') },
            { to: '/hotel-service', icon: ConciergeBell, label: t('hotelService') },
          ],
        },
        {
          label: t('navGroupSystem'),
          items: [
            { to: '/billing', icon: CreditCard, label: t('billingNav') },
            { to: '/guide', icon: BookOpen, label: t('guide') },
          ],
        },
      ];

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col',
        'bg-card/80 backdrop-blur-xl border-r border-border/60',
        'transition-all duration-300 ease-in-out',
        mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
        'lg:translate-x-0 lg:shadow-none',
        'w-64',
        collapsed && 'lg:w-[76px]',
      )}
    >
      {/* Yuqori gradient yorug'lik */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/[0.06] to-transparent" />

      {/* Header */}
      <div className="relative flex items-center justify-between h-16 px-4 shrink-0">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className={cn('hidden lg:flex items-center', collapsed && 'lg:justify-center lg:w-full')}>
          <Logo showText={!collapsed} />
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-md hover:bg-accent text-muted-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 px-3 py-2 space-y-5 overflow-y-auto overflow-x-hidden">
        {groups.map((group, gi) => (
          group.items.length > 0 && (
            <div key={gi} className="space-y-1">
              <p
                className={cn(
                  'px-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60',
                  'transition-all duration-200',
                  collapsed ? 'lg:h-0 lg:opacity-0 lg:overflow-hidden' : 'h-4 opacity-100 mb-1',
                )}
              >
                {group.label}
              </p>
              {group.items.map((item) => (
                <NavItem key={item.to} {...item} collapsed={collapsed} onClose={onClose} />
              ))}
            </div>
          )
        ))}
      </nav>

      {/* Footer */}
      <div className="relative p-3 space-y-2 border-t border-border/60">
        {/* Pro karta — faqat oddiy (Pro bo'lmagan) mehmonxona egalari uchun */}
        {!isPro && !isAdmin && (
          <NavLink
            to="/billing"
            onClick={onClose}
            className={cn(
              'group relative overflow-hidden rounded-xl block',
              'bg-gradient-to-br from-primary/[0.14] via-primary/[0.06] to-transparent',
              'border border-primary/20 hover:border-primary/40 transition-colors',
              collapsed ? 'lg:hidden' : 'p-3',
            )}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-[13px] font-semibold text-foreground">{t('upgradePro')}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">{t('upgradeProDesc')}</p>
            <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60 group-hover:translate-x-0.5 transition-transform" />
          </NavLink>
        )}

        <NavItem to="/settings" icon={Settings} label={t('settings')} collapsed={collapsed} onClose={onClose} />
      </div>
    </aside>
  );
}
