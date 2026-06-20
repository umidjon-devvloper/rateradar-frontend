import { useLang } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const LANGS = [
  { code: 'uz', label: 'UZ' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
];

export function LanguageSwitcher({ className }) {
  const { lang, setLang } = useLang();
  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLang(l.code)}
          className={cn(
            'px-3 py-1 rounded-full text-xs font-medium transition-colors border',
            lang === l.code
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card text-muted-foreground border-border hover:bg-accent'
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
