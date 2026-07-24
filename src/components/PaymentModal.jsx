import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, CreditCard, ShieldCheck, Loader2, CheckCircle2, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { paymentApi } from '@/lib/api';
import { useT, useLang } from '@/lib/i18n';
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
  const lang = useLang((s) => s.lang);
  const updateUser = useAuth((s) => s.updateUser);

  const [step, setStep] = useState('method'); // method | card | otp | success
  const [paymentId, setPaymentId] = useState(null);
  const [card, setCard] = useState('');
  const [expiry, setExpiry] = useState('');
  const [otp, setOtp] = useState('');
  const [cvc, setCvc] = useState('');       // Visa/MC CVV
  const [cardName, setCardName] = useState('');
  const [saveCard, setSaveCard] = useState(false); // opt-in: kartani eslab qol (avto-to'lov)
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

  async function handleSendCard(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // 1-qadam: to'lov yaratish (har urinishda yangi tranzaksiya)
      const created = await paymentApi.create(plan.id);
      // 2-qadam: karta yuborish → SMS-OTP (saveCard=true → kartani bog'laydi)
      await paymentApi.submitCard(created.paymentId, card.replace(/\s/g, ''), expiry, saveCard);
      setPaymentId(created.paymentId);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  // Visa/Mastercard — o'z formamiz (/mps/pay). Karta bog'lanadi (avto-to'lov
  // mumkin), 3DS uchun ATMOS redirectUri'ga yo'naltiramiz.
  async function handleVisaSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { redirectUri, paymentId } = await paymentApi.createMps({
        plan: plan.id,
        cardNumber: card.replace(/\s/g, ''),
        expiry,
        cvc: cvc.replace(/\D/g, ''),
        cardName: cardName.trim(),
        saveCard,
      });
      if (redirectUri) {
        // 3DS'dan qaytgach holatni tekshirish uchun paymentId'ni saqlaymiz
        // (qaytish URL'i ?pay=<id> ni olib kelmasa ham Billing tekshiradi).
        try { localStorage.setItem('pendingMps', paymentId); } catch (_) {}
        window.location.href = redirectUri; // ATMOS bank 3DS sahifasi
      } else {
        setError(t('paymentNotReady') || 'To\'lov boshlanmadi');
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
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
            <div className="text-right text-xs text-muted-foreground">
              {plan.priceUsd ? <div className="text-sm font-semibold text-foreground">${plan.priceUsd}</div> : null}
              / {(plan.durationDays || 30) >= 365 ? t('perYear') : t('perMonth')}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {step === 'method' && (
            <div className="space-y-3">
              <div className="text-xs font-medium text-muted-foreground">
                {t('choosePayMethod')}
              </div>

              {/* Humo karta — FAOL usul (saytda karta + SMS-OTP) */}
              <button
                onClick={() => setStep('card')}
                disabled={loading}
                className="w-full text-left rounded-xl border border-primary/40 bg-primary/[0.04] hover:bg-primary/[0.08] transition-colors p-4 flex items-center gap-3 disabled:opacity-60"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{t('payWithHumo')}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-600 text-[9px] font-semibold">
                      {t('activeBadge')}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{t('payWithHumoDesc')}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>

              {/* Visa / Mastercard — o'z formamiz (CVV + 3DS), karta saqlanadi */}
              <button
                onClick={() => { setError(''); setStep('visaCard'); }}
                disabled={loading}
                className="w-full text-left rounded-xl border border-primary/40 bg-primary/[0.04] hover:bg-primary/[0.08] transition-colors p-4 flex items-center gap-3 disabled:opacity-60"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Visa · Mastercard</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-600 text-[9px] font-semibold">
                      {t('activeBadge')}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {lang === 'uz' ? 'Xavfsiz to\'lov sahifasi (CVV + 3D-Secure)'
                      : lang === 'ru' ? 'Защищённая страница оплаты (CVV + 3D-Secure)'
                      : 'Secure payment page (CVV + 3D-Secure)'}
                  </div>
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

              {/* Kartani eslab qol — avto-to'lov (opt-in) */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none rounded-xl border border-border/60 bg-muted/30 p-3">
                <input
                  type="checkbox"
                  checked={saveCard}
                  onChange={(e) => setSaveCard(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-primary shrink-0"
                />
                <span className="text-xs leading-relaxed">
                  <span className="font-medium">
                    {lang === 'uz' ? 'Kartani eslab qol — har oy avtomatik to\'la'
                      : lang === 'ru' ? 'Запомнить карту — автосписание каждый месяц'
                      : 'Remember card — auto-charge every month'}
                  </span>
                  <span className="block text-muted-foreground mt-0.5">
                    {lang === 'uz' ? 'Obuna muddati tugaganda avtomatik uzaytiriladi. Istalgan vaqt bekor qilasiz.'
                      : lang === 'ru' ? 'Подписка продлится автоматически по истечении срока. Отмена в любой момент.'
                      : 'Subscription renews automatically when it expires. Cancel anytime.'}
                  </span>
                </span>
              </label>

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

          {step === 'visaCard' && (
            <form onSubmit={handleVisaSubmit} className="space-y-4">
              <div className="text-xs font-medium text-muted-foreground">
                Visa · Mastercard
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  {t('cardNumberLabel')}
                </label>
                <Input
                  inputMode="numeric" autoComplete="cc-number"
                  placeholder="4231 2000 9000 7831"
                  value={card}
                  onChange={(e) => setCard(fmtCard(e.target.value))}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  {lang === 'ru' ? 'Имя владельца карты' : lang === 'en' ? 'Cardholder name' : 'Karta egasining ismi'}
                </label>
                <Input
                  autoComplete="cc-name" placeholder="UMIDJON GAFFOROV"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1.5 block">
                    {t('cardExpiryLabel')}
                  </label>
                  <Input
                    inputMode="numeric" autoComplete="cc-exp" placeholder="12/29"
                    value={expiry}
                    onChange={(e) => setExpiry(fmtExpiry(e.target.value))}
                    required
                  />
                </div>
                <div className="w-24">
                  <label className="text-xs text-muted-foreground mb-1.5 block">CVV/CVC</label>
                  <Input
                    inputMode="numeric" autoComplete="cc-csc" placeholder="•••" maxLength={4}
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    required
                  />
                </div>
              </div>

              {/* Kartani eslab qol — avto-to'lov (opt-in) */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none rounded-xl border border-border/60 bg-muted/30 p-3">
                <input
                  type="checkbox" checked={saveCard}
                  onChange={(e) => setSaveCard(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-primary shrink-0"
                />
                <span className="text-xs leading-relaxed">
                  <span className="font-medium">
                    {lang === 'uz' ? 'Kartani eslab qol — har oy avtomatik to\'la'
                      : lang === 'ru' ? 'Запомнить карту — автосписание каждый месяц'
                      : 'Remember card — auto-charge every month'}
                  </span>
                </span>
              </label>

              <p className="text-[11px] text-muted-foreground bg-amber-500/10 rounded-lg px-3 py-2">
                {lang === 'uz' ? 'Keyingi qadamda bankingizning 3D-Secure (SMS) tasdig\'i so\'raladi.'
                  : lang === 'ru' ? 'На следующем шаге банк запросит 3D-Secure (SMS) подтверждение.'
                  : 'Your bank will ask for 3D-Secure (SMS) confirmation on the next step.'}
              </p>

              {error && <p className="text-xs text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('payBtn') || 'To\'lash'}
              </Button>
              <button type="button" onClick={() => { setError(''); setStep('method'); }}
                className="w-full text-xs text-muted-foreground hover:text-foreground">
                ← {t('back') || 'Orqaga'}
              </button>
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

        {/* Footer trust badge + support */}
        {step !== 'success' && (
          <div className="px-6 py-3 border-t space-y-1 text-center text-[11px] text-muted-foreground">
            <div className="flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              ATMOS · Humo · UzCard · Visa · Mastercard
            </div>
            <div>
              {t('supportPrompt')}{' '}
              <a
                href="https://t.me/rateradar_support"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Telegram
              </a>
              {' · '}
              <a href="mailto:info@thehotelsaas.com" className="text-primary hover:underline font-medium">
                Email
              </a>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
