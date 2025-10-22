import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <section className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
      <h1 className="text-4xl font-bold text-[rgb(var(--color-primary))]">404</h1>
      <p className="text-2xl font-semibold text-[rgb(var(--color-text))]">{t('notFound.title')}</p>
      <p className="text-lg text-muted">{t('notFound.description')}</p>
      <Button asChild variant="primary"><Link to="/">{t('notFound.cta')}</Link></Button>
    </section>
  );
}
