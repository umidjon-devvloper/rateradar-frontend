import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useT } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function Login() {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuth((s) => s.login);
  const loading = useAuth((s) => s.loading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      const from = location.state?.from?.pathname;
      // Admin — to'g'ridan Admin paneliga (onboarding/dashboard kerak emas)
      if (user.role === 'admin') navigate('/admin', { replace: true });
      else if (!user.onboardingCompleted) navigate('/onboarding', { replace: true });
      else navigate(from || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative w-full max-w-[400px] mb-3 flex justify-end">
        <LanguageSwitcher />
      </div>

      <div className="relative w-full max-w-[400px] bg-card border rounded-2xl p-10 shadow-sm animate-fade-in">
        <div className="flex flex-col items-center gap-4 mb-7">
          <Link to="/" className="flex flex-col items-center gap-3 hover:opacity-80 transition-opacity">
            <Logo showText={false} className="scale-110" />
            <div className="text-center">
              <h1 className="text-xl font-semibold tracking-tight">TheHotelSaaS</h1>
              <p className="text-xs text-muted-foreground mt-1">{t('welcomeBack')}</p>
            </div>
          </Link>
        </div>

        <div className="flex bg-secondary rounded-lg p-1 mb-6">
          <button className="flex-1 py-1.5 px-3 rounded-md text-sm font-medium bg-card shadow-sm">
            {t('login')}
          </button>
          <Link
            to="/register"
            className="flex-1 py-1.5 px-3 rounded-md text-sm font-medium text-muted-foreground text-center hover:text-foreground transition-colors"
          >
            {t('register')}
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">{t('email')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="hello@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">{t('password')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="pl-10"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('loggingIn')}
              </>
            ) : (
              t('signIn')
            )}
          </Button>
        </form>

        <div className="text-center text-sm mt-6 text-muted-foreground">
          {t('noAccount')}{' '}
          <Link to="/register" className="text-primary hover:underline font-medium">
            {t('signUp')}
          </Link>
        </div>
      </div>

      <div className="relative mt-6 text-xs text-muted-foreground">
        © 2026 TheHotelSaaS
      </div>
    </div>
  );
}
