import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Footer } from './Footer';
import { Header } from './Header';
import { NavRail } from './NavRail';

export function AppShell() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-bg))] via-[rgba(var(--color-primary),0.05)] to-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] transition-colors">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[rgb(var(--color-primary))] focus:px-6 focus:py-3 focus:text-lg focus:text-white"
      >
        {t('app.skipToContent')}
      </a>
      <Header />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-24 pt-6 sm:px-8 lg:flex-row">
        <NavRail />
        <main id="main-content" className="flex-1 space-y-10">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
