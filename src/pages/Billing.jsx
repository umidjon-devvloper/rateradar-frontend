import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, Loader2, Sparkles, CreditCard, Info, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaymentModal } from '@/components/PaymentModal';
import { useAuth } from '@/lib/auth';
import { useT } from '@/lib/i18n';
import { paymentApi } from '@/lib/api';

// Reja imkoniyatlari i18n kalitlari (Landing bilan bir xil).
const PLAN_FEATURES = {
  free: ['planFreeFeat1', 'planFreeFeat2', 'planFreeFeat3', 'planFreeFeat4'],
  starter: ['planStarterFeat1', 'planStarterFeat2', 'planStarterFeat3', 'planStarterFeat4'],
  pro: ['planProFeat1', 'planProFeat2', 'planProFeat3', 'planProFeat4'],
};
const PLAN_TITLE = { free: 'planFreeTitle', starter: 'planStarterTitle', pro: 'planProTitle' };

export default function Billing() {
  const t = useT();
  const user = useAuth((s) => s.user);
  const refreshUser = useAuth((s) => s.refresh);
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState(null); // { plans, atmosReady }
  const [loading, setLoading] = useState(true);
  const [payPlan, setPayPlan] = useState(null);
  const [paidBanner, setPaidBanner] = useState(false);

  async function load() {
    try {
      const res = await paymentApi.plans();
      setData(res);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  // ATMOS to'lov sahifasidan qaytish — ?pay=<id> bo'lsa holatni sinxronlaymiz.
  useEffect(() => {
    const payId = searchParams.get('pay');
    if (!payId) return;
    (async () => {
      try {
        const p = await paymentApi.get(payId); // backend invoice statusini sinxronlaydi
        if (p?.status === 'paid') {
          setPaidBanner(true);
          await refreshUser(); // user.plan / planExpiresAt yangilanadi
        }
      } catch {
        /* e'tiborsiz */
      } finally {
        searchParams.delete('pay');
        setSearchParams(searchParams, { replace: true });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentPlan = user?.plan || 'free';
  const expires = user?.planExpiresAt ? new Date(user.planExpiresAt) : null;

  // Ko'rsatiladigan rejalar: Free (statik) + backenddan kelgan pulli rejalar.
  const freeCard = { id: 'free', name: t('planFreeTitle'), priceUzs: 0 };
  const paidCards = data?.plans || [];
  const cards = [freeCard, ...paidCards];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('billingTitle')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('billingSub')}</p>
      </div>

      {paidBanner && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/5 px-4 py-3 text-sm">
          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
          {t('paymentSuccessMsg')}
        </div>
      )}

      {/* Joriy reja */}
      <div className="rounded-xl border bg-card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{t('currentPlanLabel')}</div>
            <div className="font-semibold">{t(PLAN_TITLE[currentPlan] || 'planFreeTitle')}</div>
          </div>
        </div>
        {expires && currentPlan !== 'free' && (
          <div className="text-right text-xs text-muted-foreground">
            {t('planActiveUntil')}: {expires.toLocaleDateString('uz-UZ')}
          </div>
        )}
      </div>

      {data && !data.atmosReady && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
          {t('paymentNotReady')}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.map((p) => {
            const isCurrent = p.id === currentPlan;
            const popular = p.id === 'starter';
            return (
              <div
                key={p.id}
                className={`relative rounded-xl border p-6 flex flex-col ${
                  popular ? 'border-primary shadow-lg shadow-primary/10' : ''
                } bg-card`}
              >
                {popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[11px] font-medium">
                    {t('mostPopular')}
                  </div>
                )}

                <div className="text-sm font-medium text-muted-foreground">{p.name}</div>
                <div className="mt-4 flex items-baseline gap-1.5">
                  {p.priceUzs === 0 ? (
                    <span className="text-3xl font-semibold tracking-tight">{t('priceFree')}</span>
                  ) : (
                    <>
                      <span className="text-3xl font-semibold tracking-tight">
                        {p.priceUzs.toLocaleString('uz-UZ')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t('currencyUzs')} / {t('perMonth')}
                      </span>
                    </>
                  )}
                </div>

                <ul className="mt-5 space-y-2 flex-1">
                  {(PLAN_FEATURES[p.id] || []).map((fk) => (
                    <li key={fk} className="flex items-start gap-2 text-sm">
                      <div className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </div>
                      <span>{t(fk)}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Badge variant="secondary" className="mt-6 justify-center py-1.5">
                    {t('activePlanBadge')}
                  </Badge>
                ) : p.id === 'free' ? (
                  <div className="mt-6 h-9" />
                ) : (
                  <Button
                    className="mt-6 w-full"
                    variant={popular ? 'default' : 'outline'}
                    disabled={data && !data.atmosReady}
                    onClick={() => setPayPlan({ id: p.id, name: p.name, priceUzs: p.priceUzs })}
                  >
                    <CreditCard className="h-4 w-4" />
                    {currentPlan === 'free' ? t('subscribe') : t('upgradePlan')}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {payPlan && (
        <PaymentModal
          plan={payPlan}
          onClose={() => setPayPlan(null)}
          onSuccess={() => {
            setPayPlan(null);
          }}
        />
      )}
    </div>
  );
}
