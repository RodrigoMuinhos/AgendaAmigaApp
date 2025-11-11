import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Footer } from './Footer';
import { Header } from './Header';
import { NavRail } from './NavRail';
import { useAuthStore } from '../features/auth/store';
import { env } from '../core/config/env';

export function AppShell() {
  const { t } = useTranslation();
  const status = useAuthStore((state) => state.status);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    if (status === 'idle') {
      void initialize();
    }
  }, [initialize, status]);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[rgb(var(--color-primary))] border-b-transparent" />
        <p className="mt-4 text-sm text-[rgba(var(--color-text),0.7)]">{t('app.loading', 'Carregando sua agenda...')}</p>
      </div>
    );
  }

  if (!env.authDisabled && status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-bg))] via-[rgba(var(--color-primary),0.05)] to-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] transition-colors">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[rgb(var(--color-primary))] focus:px-6 focus:py-3 focus:text-lg focus:text-white"
      >
        {t('app.skipToContent')}
      </a>
      <Header />
      {env.authDisabled ? (
        <div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-8">
          <div className="rounded-3xl border border-dashed border-[rgba(var(--color-primary),0.35)] bg-[rgba(var(--color-primary),0.08)] px-4 py-3 text-sm font-semibold text-[rgb(var(--color-primary))] shadow-soft sm:text-base">
            {t(
              'app.demoModeNotice',
              'Modo teste liberado. Voce esta navegando sem login para experimentar a Agenda Amiga.',
            )}
          </div>
        </div>
      ) : null}
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
