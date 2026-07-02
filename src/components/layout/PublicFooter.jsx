import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Reveal } from '@/components/ui/motion';
import { useT } from '@/lib/i18n';

/**
 * Ommaviy (landing + huquqiy) sahifalar uchun umumiy footer.
 * Havolalar haqiqiy sahifalarga ulangan: /about, /contact, /terms, /privacy.
 */
export function PublicFooter() {
  const t = useT();

  return (
    <footer className="border-t bg-muted/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Reveal as="div" className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-4 text-xs text-muted-foreground max-w-xs leading-relaxed">
              {t('landingTagline')}
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-lime-400" />
              </span>
              {t('statMonitor')}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {t('footerProduct')}
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('navFeatures')}
                </a>
              </li>
              <li>
                <a href="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('navPricing')}
                </a>
              </li>
              <li>
                <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('login')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {t('footerCompany')}
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footerAbout')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footerContact')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {t('footerLegal')}
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footerTerms')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footerPrivacy')}
                </Link>
              </li>
              <li>
                <Link to="/offer" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footerOffer')}
                </Link>
              </li>
            </ul>
          </div>
        </Reveal>

        <div className="mt-10 pt-6 border-t text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 TheHotelSaaS. {t('footerRights')}.</span>
          <span className="flex items-center gap-1.5">UzCard · Humo · Visa · Mastercard</span>
        </div>
      </div>
    </footer>
  );
}
