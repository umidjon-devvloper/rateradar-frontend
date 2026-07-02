import { PublicPageLayout, ContentSections } from '@/components/layout/PublicPageLayout';
import { getLegalContent } from '@/lib/legalContent';
import { useLang, useT } from '@/lib/i18n';

export default function Offer() {
  const lang = useLang((s) => s.lang);
  const t = useT();
  const c = getLegalContent(lang, 'offer');

  return (
    <PublicPageLayout title={c.title} subtitle={c.intro} eyebrow={t('footerLegal')}>
      {c.updated && (
        <div className="mb-6 inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          {c.updated}
        </div>
      )}
      <ContentSections sections={c.sections} />
    </PublicPageLayout>
  );
}
