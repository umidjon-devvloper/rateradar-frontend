import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useT } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

export function PublicNavbar() {
  const t = useT();
  const token = useAuth((s) => s.token);
  const user = useAuth((s) => s.user);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '#features', label: t('navFeatures') },
    { href: '#how', label: t('navHowItWorks') },
    { href: '#hotel-service', label: t('hsBadge') },
    { href: '#pricing', label: t('navPricing') },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-200',
        scrolled
          ? 'bg-background/80 backdrop-blur-md border-b'
          : 'bg-transparent border-b border-transparent'
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            {token && user ? (
              <Button asChild size="sm">
                <Link to="/dashboard">{t('dashboard')}</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">{t('login')}</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/register">{t('signUp')}</Link>
                </Button>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 -mr-2 text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t py-4 space-y-3 animate-fade-in">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2"
              >
                {l.label}
              </a>
            ))}
            <div className="pt-3 border-t flex items-center justify-between gap-2">
              <LanguageSwitcher />
              {token && user ? (
                <Button asChild size="sm" className="flex-1">
                  <Link to="/dashboard">{t('dashboard')}</Link>
                </Button>
              ) : (
                <div className="flex gap-2 flex-1">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link to="/login">{t('login')}</Link>
                  </Button>
                  <Button asChild size="sm" className="flex-1">
                    <Link to="/register">{t('signUp')}</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
