import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, CreditCard, ShieldCheck, Loader2, CheckCircle2, Info, Globe, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { paymentApi } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';

/**
 * ATMOS to'lov oynasi — 3 bosqichli oqim:
 *   card  → SMS-OTP → success
 *
 * Props:
 *   plan      — { id, name, priceUzs }  (sotib olinadigan reja)
 *   onClose   — yopish callback
 *   onSuccess — to'lov muvaffaqiyatli bo'lganda (ixtiyoriy)
 */
export function PaymentModal({ plan, onClose, onSuccess }) {
  const t = useT();
  const updateUser = useAuth((s) => s.updateUser);

  const [step, setStep] = useState('method'); // method | card | otp | success
  const [paymentId, setPaymentId] = useState(null);
  const [card, setCard] = useState('');
  const [expiry, setExpiry] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ESC bilan yopish
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const priceStr = `${Number(plan.priceUzs).toLocaleString('uz-UZ')} ${t('currencyUzs')}`;

  // Karta raqamini 4 talab bo'lib formatlaymiz
  const fmtCard = (v) =>
    v
      .replace(/\D/g, '')
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, '$1 ')
      .trim();
  const fmtExpiry = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  // ATMOS to'lov sahifasi (Visa/MC/UzCard/Humo) → tashqi sahifaga yo'naltirish
  async function handlePayViaPage() {
    setError('');
    setLoading(true);
    try {
      const successUrl = `${window.location.origin}/billing`;
      const { url } = await paymentApi.createInvoice(plan.id, successUrl);
      if (url) {
        window.location.href = url; // ATMOS hosted checkout sahifasi
      } else {
        setError('URL olinmadi');
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  }

  async function handleSendCard(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // 1-qadam: to'lov yaratish (har urinishda yangi tranzaksiya)
      const created = await paymentApi.create(plan.id);
      // 2-qadam: karta yuborish → SMS-OTP
      await paymentApi.submitCard(created.paymentId, card.replace(/\s/g, ''), expiry);
      setPaymentId(created.paymentId);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await paymentApi.confirm(paymentId, otp.replace(/\D/g, ''));
      // Foydalanuvchi rejasini darhol yangilaymiz (UI uchun)
      if (res.plan) updateUser({ plan: res.plan });
      setStep('success');
      onSuccess?.(res);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    try {
      await paymentApi.resendOtp(paymentId);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">{t('paymentTitle')}</span>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Plan summary */}
        <div className="px-6 pt-5">
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
            <div>
              <div className="text-xs text-muted-foreground">{plan.name} — {t('payForPlan')}</div>
              <div className="text-lg font-semibold tracking-tight">{priceStr}</div>
            </div>
            <div className="text-xs text-muted-foreground">/ {t('perMonth')}</div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {step === 'method' && (
            <div className="space-y-3">
              <div className="text-xs font-medium text-muted-foreground">
                {t('choosePayMethod')}
              </div>

              {/* ATMOS to'lov sahifasi — Visa/MC/UzCard/Humo */}
              <button
                onClick={handlePayViaPage}
                disabled={loading}
                className="w-full text-left rounded-xl border border-primary/40 bg-primary/[0.04] hover:bg-primary/[0.08] transition-colors p-4 flex items-center gap-3 disabled:opacity-60"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{t('payViaPageTitle')}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-semibold">
                      {t('recommended')}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {loading ? t('redirectingToAtmos') : t('payViaPageDesc')}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>

              {/* Saytda karta + SMS-OTP — UzCard/Humo */}
              <button
                onClick={() => setStep('card')}
                disabled={loading}
                className="w-full text-left rounded-xl border hover:bg-accent/40 transition-colors p-4 flex items-center gap-3 disabled:opacity-60"
              >
                <div className="w-9 h-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{t('payViaCardTitle')}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{t('payViaCardDesc')}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>

              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
          )}

          {step === 'card' && (
            <form onSubmit={handleSendCard} className="space-y-4">
              <div className="text-xs font-medium text-muted-foreground">
                {t('paymentStep1')}
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  {t('cardNumberLabel')}
                </label>
                <Input
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="9860 0901 0101 4364"
                  value={card}
                  onChange={(e) => setCard(fmtCard(e.target.value))}
                  required
                />
              </div>
              <div className="w-1/2">
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  {t('cardExpiryLabel')}
                </label>
                <Input
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="02/28"
                  value={expiry}
                  onChange={(e) => setExpiry(fmtExpiry(e.target.value))}
                  required
                />
              </div>

              <div className="flex items-start gap-2 rounded-md bg-blue-500/5 border border-blue-500/20 px-3 py-2 text-[11px] text-muted-foreground">
                <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" />
                <span>{t('testCardHint')}</span>
              </div>

              {error && <p className="text-xs text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t('sendSmsCode')
                )}
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleConfirm} className="space-y-4">
              <div className="text-xs font-medium text-muted-foreground">
                {t('paymentStep2')}
              </div>
              <p className="text-xs text-muted-foreground">{t('smsSentMsg')}</p>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  {t('smsCodeLabel')}
                </label>
                <Input
                  inputMode="numeric"
                  placeholder="111111"
                  className="text-center tracking-[0.5em] text-lg"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  autoFocus
                  required
                />
              </div>

              {error && <p className="text-xs text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  `${t('payNow')} — ${priceStr}`
                )}
              </Button>
              <button
                type="button"
                onClick={handleResend}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('resendSmsCode')}
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="font-medium">{t('paymentSuccessMsg')}</p>
              <Button onClick={onClose} className="mt-6 w-full">
                {t('close')}
              </Button>
            </div>
          )}
        </div>

        {/* Footer trust badge */}
        {step !== 'success' && (
          <div className="px-6 py-3 border-t flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            ATMOS · UzCard · Humo
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
