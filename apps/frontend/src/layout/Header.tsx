import { Bell, Clock, LogOut, SlidersHorizontal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { HealthProbe } from '../HealthProbe';
import { env } from '../core/config/env';
import { EasyModeToggle } from '../components/EasyModeToggle';
import { LanguageToggle } from '../components/LanguageToggle';
import { ThemeToggle } from '../components/ThemeToggle';
import { VoiceButton } from '../components/VoiceButton';
import { useAuthStore } from '../features/auth/store';

export function Header() {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const voiceLang = i18n.language.startsWith('en') ? 'en-US' : 'pt-BR';
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handlePointer = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointer);
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    if (env.authDisabled) {
      navigate('/inicio', { replace: true });
      return;
    }
    if (env.logoutRedirect) {
      navigate(env.logoutRedirect, { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[rgba(var(--color-border),0.4)] bg-[rgba(var(--color-surface),0.9)] backdrop-blur-xl transition">
      <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap sm:gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate('/inicio')}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-[rgba(var(--color-primary),0.12)] text-[rgb(var(--color-primary))] transition hover:border-[rgba(var(--color-primary),0.6)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(30,136,229,0.35)]"
              aria-label={t('nav.home', 'Inicio')}
            >
              <Clock className="h-6 w-6" aria-hidden />
            </button>
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
              <span className="whitespace-nowrap text-sm font-semibold uppercase tracking-[0.32em] text-[rgb(var(--color-primary))] sm:text-base">
                {t('app.name')}
              </span>
              <span className="truncate text-sm text-[rgba(var(--color-text),0.75)]">
                {t('app.tagline')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/alerts"
              aria-label={t('nav.alerts', 'Alertas')}
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-[rgba(var(--color-primary),0.25)] bg-[rgba(var(--color-primary),0.12)] px-3 text-sm font-semibold text-[rgb(var(--color-primary))] shadow-soft transition hover:border-[rgba(var(--color-primary),0.45)] hover:bg-[rgba(var(--color-primary),0.2)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(30,136,229,0.35)]"
            >
              <Bell className="h-5 w-5" aria-hidden />
              <span className="hidden sm:inline">{t('nav.alerts', 'Alertas')}</span>
            </Link>

            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-haspopup="true"
                aria-expanded={isMenuOpen}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(var(--color-border),0.6)] bg-[rgba(var(--color-surface),0.95)] text-[rgb(var(--color-text))] transition hover:border-[rgba(var(--color-primary),0.5)] hover:text-[rgb(var(--color-primary))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(30,136,229,0.35)] sm:w-auto sm:px-3 sm:text-sm sm:font-semibold"
              >
                <SlidersHorizontal className="h-5 w-5" aria-hidden />
                <span className="sr-only sm:not-sr-only">
                  {isMenuOpen ? t('app.collapseControls') : t('app.expandControls')}
                </span>
              </button>

              {isMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+0.75rem)] z-40 w-72 rounded-[28px] border border-[rgba(var(--color-border),0.3)] bg-[rgb(var(--color-surface))] p-4 shadow-elevated">
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className="flex flex-col items-center gap-2 rounded-[26px] border border-[rgba(var(--color-border),0.2)] bg-[rgb(var(--color-surface))] px-3 py-4 text-[rgba(var(--color-text),0.75)] shadow-soft transition cursor-default select-none"
                      role="status"
                      aria-live="polite"
                      aria-label="API"
                    >
                      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(var(--color-border),0.25)] bg-[rgba(var(--color-primary),0.1)] text-[rgb(var(--color-primary))] shadow-soft transition">
                        <HealthProbe size={24} />
                      </span>
                      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[rgba(var(--color-text),0.6)]">
                        API
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-2 rounded-[26px] border border-[rgba(var(--color-border),0.2)] bg-[rgb(var(--color-surface))] px-3 py-4 text-[rgba(var(--color-text),0.75)] shadow-soft transition">
                      <VoiceButton
                        variant="compact"
                        text={t('app.voiceText', 'Texto de demonstração da Agenda Amiga')}
                        label={t('app.voice', 'Ouvir')}
                        lang={voiceLang}
                        className="!h-14 !w-14 !rounded-full !border !border-[rgba(var(--color-border),0.2)] !bg-[rgba(var(--color-primary),0.12)] !text-[rgb(var(--color-primary))] !shadow-soft hover:!border-[rgba(var(--color-primary),0.35)] hover:!bg-[rgba(var(--color-primary),0.18)]"
                      />
                      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[rgba(var(--color-text),0.6)]">
                        {t('app.voice', 'Ouvir')}
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-2 rounded-[26px] border border-[rgba(var(--color-border),0.2)] bg-[rgb(var(--color-surface))] px-3 py-4 text-[rgba(var(--color-text),0.75)] shadow-soft transition">
                      <ThemeToggle
                        variant="compact"
                        className="!h-14 !w-14 !rounded-full !border !border-[rgba(var(--color-border),0.2)] !bg-[rgba(var(--color-primary),0.1)] !text-[rgb(var(--color-primary))] !shadow-soft hover:!border-[rgba(var(--color-primary),0.35)] hover:!bg-[rgba(var(--color-primary),0.18)]"
                      />
                      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[rgba(var(--color-text),0.6)]">
                        {t('app.theme', 'Tema')}
                      </span>
                    </div>

                    {!env.authDisabled ? (
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="group flex flex-col items-center gap-2 rounded-[26px] border border-[rgba(var(--color-border),0.2)] bg-[rgb(var(--color-surface))] px-3 py-4 text-[rgba(var(--color-text),0.75)] shadow-soft transition hover:border-[rgba(var(--color-primary),0.45)] hover:bg-[rgba(var(--color-primary),0.12)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(30,136,229,0.35)]"
                      >
                        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(var(--color-border),0.2)] bg-[rgba(var(--color-primary),0.12)] text-[rgb(var(--color-primary))] shadow-soft transition group-hover:border-[rgba(var(--color-primary),0.45)] group-hover:bg-[rgba(var(--color-primary),0.18)]">
                          <LogOut className="h-5 w-5" aria-hidden />
                        </span>
                        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[rgba(var(--color-text),0.6)]">
                          {t('app.logout', 'Logout')}
                        </span>
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-5 space-y-4 rounded-[26px] border border-[rgba(var(--color-border),0.18)] bg-[rgb(var(--color-surface))] p-4 shadow-soft">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-[rgba(var(--color-text),0.75)]">
                        {t('app.easyMode')}
                      </span>
                      <EasyModeToggle variant="compact" />
                    </div>
                    <LanguageToggle />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

type AgendaLogoProps = {
  className?: string;
};

function AgendaLogo({ className }: AgendaLogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}
