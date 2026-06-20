import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useT, useLang } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function Register() {
  const t = useT();
  const lang = useLang((s) => s.lang);
  const navigate = useNavigate();
  const register = useAuth((s) => s.register);
  const loading = useAuth((s) => s.loading);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError(lang === 'uz' ? 'Parol kamida 6 belgi' : lang === 'ru' ? 'Пароль минимум 6 символов' : 'Password at least 6 chars');
      return;
    }
    try {
      await register({ name, email, password, lang });
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative">
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
              <p className="text-xs text-muted-foreground mt-1">{t('createAccount')}</p>
            </div>
          </Link>
        </div>

        <div className="flex bg-secondary rounded-lg p-1 mb-6">
          <Link
            to="/login"
            className="flex-1 py-1.5 px-3 rounded-md text-sm font-medium text-muted-foreground text-center hover:text-foreground transition-colors"
          >
            {t('login')}
          </Link>
          <button className="flex-1 py-1.5 px-3 rounded-md text-sm font-medium bg-card shadow-sm">
            {t('register')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="name">{t('name')}</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="Ali Valiyev"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                autoFocus
                className="pl-10"
              />
            </div>
          </div>

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
                placeholder="kamida 6 belgi"
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
                {t('registering')}
              </>
            ) : (
              t('signUp')
            )}
          </Button>
        </form>

        <div className="text-center text-sm mt-6 text-muted-foreground">
          {t('haveAccount')}{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            {t('signIn')}
          </Link>
        </div>
      </div>

      <div className="relative mt-6 text-xs text-muted-foreground">
        © 2026 TheHotelSaaS
      </div>
    </div>
  );
}
