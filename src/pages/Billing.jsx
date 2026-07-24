import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Check, Loader2, Sparkles, CreditCard, Info, CheckCircle2, Lock, LifeBuoy, Send, Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaymentModal } from '@/components/PaymentModal';
import { isPlanActive } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { useT } from '@/lib/i18n';
import { paymentApi } from '@/lib/api';

// Reja imkoniyatlari i18n kalitlari (Landing bilan bir xil).
const PLAN_FEATURES = {
  free: ['planFreeFeat1', 'planFreeFeat2', 'planFreeFeat3', 'planFreeFeat4'],
  starter: ['planStarterFeat1', 'planStarterFeat2', 'planStarterFeat3', 'planStarterFeat4'],
  pro: ['planProFeat1', 'planProFeat2', 'planProFeat3', 'planProFeat4'],
  pro_yearly: ['planProFeat1', 'planProFeat2', 'planProFeat3', 'planProFeat4'],
};
const PLAN_TITLE = { free: 'planFreeTitle', starter: 'planStarterTitle', pro: 'planProTitle', pro_yearly: 'planProTitle' };

export default function Billing() {
  const t = useT();
  const user = useAuth((s) => s.user);
  const refreshUser = useAuth((s) => s.refresh);
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState(null); // { plans, atmosReady }
  const [loading, setLoading] = useState(true);
  const [payPlan, setPayPlan] = useState(null);
  const [paidBanner, setPaidBanner] = useState(false);
  const [savedCard, setSavedCard] = useState(null); // { card, autoRenew }
  const [cardBusy, setCardBusy] = useState(false);

  async function load() {
    try {
      const res = await paymentApi.plans();
      setData(res);
    } finally {
      setLoading(false);
    }
  }
  async function loadCard() {
    try {
      const res = await paymentApi.savedCard();
      setSavedCard(res);
    } catch {
      /* e'tiborsiz */
    }
  }
  useEffect(() => {
    load();
    loadCard();
  }, []);

  async function toggleAutoRenew() {
    if (!savedCard?.card) return;
    setCardBusy(true);
    try {
      const res = await paymentApi.setAutoRenew(!savedCard.autoRenew);
      setSavedCard((s) => ({ ...s, autoRenew: res.autoRenew }));
    } catch (e) {
      alert(e.response?.data?.error || e.message);
    } finally {
      setCardBusy(false);
    }
  }
  async function removeCard() {
    if (!window.confirm(t('cardRemoveConfirm'))) return;
    setCardBusy(true);
    try {
      await paymentApi.removeCard();
      setSavedCard({ card: null, autoRenew: false });
    } catch (e) {
      alert(e.response?.data?.error || e.message);
    } finally {
      setCardBusy(false);
    }
  }

  // ATMOS to'lov sahifasidan/3DS'dan qaytish — ?pay=<id> yoki localStorage
  // 'pendingMps' (Visa 3DS) bo'lsa holatni sinxronlaymiz.
  useEffect(() => {
    let payId = searchParams.get('pay');
    let fromStorage = false;
    if (!payId) {
      try { payId = localStorage.getItem('pendingMps'); } catch (_) { /* noop */ }
      fromStorage = Boolean(payId);
    }
    if (!payId) return;
    (async () => {
      try {
        const p = await paymentApi.get(payId); // backend invoice/mps statusini sinxronlaydi
        if (p?.status === 'paid') {
          setPaidBanner(true);
          await refreshUser(); // user.plan / planExpiresAt yangilanadi
          await loadCard();    // saqlangan karta ko'rinsin
        }
      } catch {
        /* e'tiborsiz */
      } finally {
        try { localStorage.removeItem('pendingMps'); } catch (_) { /* noop */ }
        if (!fromStorage) {
          searchParams.delete('pay');
          setSearchParams(searchParams, { replace: true });
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentPlan = user?.plan || 'free';
  const expires = user?.planExpiresAt ? new Date(user.planExpiresAt) : null;
  const planActive = isPlanActive(user);
  const paywall = searchParams.get('paywall') === '1' || !planActive;

  // Sotib olinadigan rejalar: oylik (pro) + yillik (pro_yearly, 2 oy bepul).
  // Eski backend starter qaytarsa — u ko'rsatilmaydi.
  const allPlans = data?.plans || [];
  const paidPlans = allPlans.filter((p) => p.id === 'pro' || p.id === 'pro_yearly');
  const cards = paidPlans.length ? paidPlans : allPlans.slice(0, 1);

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

      {/* Paywall — obuna faol emas: to'lovsiz tizimga kirib bo'lmaydi */}
      {!paidBanner && paywall && (
        <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <Lock className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          {t('paywallNotice')}
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

      {/* Saqlangan karta + avto-to'lov */}
      {savedCard?.card && (
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">
                  {(savedCard.card.provider || 'card').toUpperCase()} ·{' '}
                  {savedCard.card.pan}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t('cardExpiryLabel')}: {savedCard.card.expiry
                    ? `${savedCard.card.expiry.slice(2)}/${savedCard.card.expiry.slice(0, 2)}`
                    : '—'}
                </div>
              </div>
            </div>
            <button
              onClick={removeCard}
              disabled={cardBusy}
              className="text-xs text-destructive hover:underline disabled:opacity-50"
            >
              {t('cardRemove')}
            </button>
          </div>

          {/* Avto-to'lov tumbleri */}
          <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
            <div className="text-sm">
              <div className="font-medium">{t('autoRenewLabel')}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{t('autoRenewHint')}</div>
            </div>
            <button
              onClick={toggleAutoRenew}
              disabled={cardBusy}
              role="switch"
              aria-checked={savedCard.autoRenew}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
                savedCard.autoRenew ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  savedCard.autoRenew ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      )}

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          {cards.map((p) => {
            const yearly = (p.durationDays || 30) >= 365;
            const period = yearly ? t('perYear') : t('perMonth');
            const isCurrent = !yearly && p.id === currentPlan && planActive;
            return (
              <div
                key={p.id}
                className={`relative rounded-xl border p-6 flex flex-col bg-card ${
                  yearly
                    ? 'border-primary shadow-lg shadow-primary/10'
                    : 'border-primary/40'
                }`}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                  <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-[11px] font-medium whitespace-nowrap">
                    {p.name}
                  </span>
                  {yearly && (
                    <span className="px-2 py-1 rounded-full bg-green-500 text-white text-[10px] font-semibold whitespace-nowrap">
                      {t('yearlySaveBadge')}
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-3xl font-semibold tracking-tight">
                    ${p.priceUsd || 49}
                  </span>
                  <span className="text-xs text-muted-foreground">/ {period}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {p.priceUzs.toLocaleString('uz-UZ')} {t('currencyUzs')} / {period}
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
                ) : (
                  <Button
                    className="mt-6 w-full"
                    variant={yearly ? 'default' : 'outline'}
                    disabled={data && !data.atmosReady}
                    onClick={() =>
                      setPayPlan({
                        id: p.id, name: p.name, priceUzs: p.priceUzs,
                        priceUsd: p.priceUsd, durationDays: p.durationDays,
                      })
                    }
                  >
                    <CreditCard className="h-4 w-4" />
                    {currentPlan === 'free' ? t('subscribe') : t('upgradePlan')}
                  </Button>
                )}

                {/* To'lov usullari: Humo · Visa · Mastercard — hammasi faol */}
                <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 font-medium">
                    <span className="w-1 h-1 rounded-full bg-green-500" /> Humo · Visa · Mastercard
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Support bilan bog'lanish — to'lovda muammo bo'lsa */}
      <div className="rounded-xl border bg-muted/30 px-5 py-4 flex items-center justify-between gap-3 flex-wrap max-w-2xl">
        <div className="flex items-center gap-2 text-sm">
          <LifeBuoy className="h-4 w-4 text-primary shrink-0" />
          {t('supportPrompt')}
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <a href="https://t.me/rateradar_support" target="_blank" rel="noreferrer">
              <Send className="h-3.5 w-3.5" />
              Telegram
            </a>
          </Button>
          <Button asChild size="sm" variant="outline">
            <a href="mailto:info@thehotelsaas.com">
              <Mail className="h-3.5 w-3.5" />
              Email
            </a>
          </Button>
        </div>
      </div>

      {payPlan && (
        <PaymentModal
          plan={payPlan}
          onClose={() => setPayPlan(null)}
          onSuccess={async () => {
            // user.plan yangilansin — paywall darhol ochiladi.
            await refreshUser();
            await loadCard(); // saqlangan karta ko'rinsin (agar bog'langan bo'lsa)
            setPaidBanner(true);
          }}
        />
      )}
    </div>
  );
}
