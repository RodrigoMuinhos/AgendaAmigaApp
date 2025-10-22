import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[rgba(var(--color-border),0.6)] bg-[rgba(var(--color-surface),0.95)] backdrop-blur-sm transition">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>{t('footer.mission', { year })}</span>
        <span>{t('footer.accessibility')}</span>
      </div>
    </footer>
  );
}
