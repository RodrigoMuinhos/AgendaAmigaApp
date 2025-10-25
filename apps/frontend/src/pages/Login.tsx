import { FormEvent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, KeyRound, LogIn, Mail, ShieldCheck, User, UserPlus } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { cn } from '../utils/cn';
import { env } from '../core/config/env';

type Mode = 'login' | 'register';

export function LoginPage() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('login');
  const [searchParams] = useSearchParams();

  const isLogin = mode === 'login';
  const oauthError = searchParams.get('error');
  const oauthProvider = searchParams.get('provider');

  const socialUrls = useMemo(() => {
    const normalize = (value: string, fallbackPath: string) => {
      if (value) {
        return value;
      }

      const base = env.apiHttpBase || '';
      const sanitizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
      return `${sanitizedBase}${fallbackPath}`;
    };

    return {
      google: normalize(env.googleAuthUrl, '/api/auth/google'),
      govbr: normalize(env.govBrAuthUrl, '/api/auth/govbr'),
    };
  }, []);

  const startSocialLogin = (provider: 'google' | 'govbr') => {
    const target = socialUrls[provider];

    if (!target) {
      // eslint-disable-next-line no-alert
      alert(
        t(
          'login.socialUnavailable',
          'Configuração de login social ausente. Contate o suporte.',
        ),
      );
      return;
    }

    const resolvedTarget = new URL(target, window.location.origin);
    const callback = `${window.location.origin}/login-success?provider=${provider}`;
    resolvedTarget.searchParams.set('return_to', callback);

    window.location.assign(resolvedTarget.toString());
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: Integrate with real auth flow
    // eslint-disable-next-line no-console
    console.info(`[auth] ${mode} flow submitted`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-bg))] via-[rgba(var(--color-primary),0.08)] to-[rgb(var(--color-bg))] text-[rgb(var(--color-text))]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12 sm:px-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-[0.2em] text-[rgb(var(--color-primary))]">
            {t('login.brand', 'AGENDA AMIGA')}
          </h1>
          <p className="mt-2 text-sm text-[rgba(var(--color-text),0.7)]">
            {t('login.subtitle', 'Cuidados em família com um só login.')}
          </p>
        </div>

        <div className="rounded-[32px] border border-[rgba(var(--color-border),0.3)] bg-[rgb(var(--color-surface))] p-8 shadow-elevated backdrop-blur-sm">
          {oauthError ? (
            <div className="mb-6 rounded-3xl border border-[rgba(var(--color-border),0.35)] bg-[rgba(239,68,68,0.08)] px-4 py-3 text-sm text-[rgb(220,38,38)]">
              {t('login.oauthError', 'Não foi possível iniciar o login com {{provider}}. Verifique a configuração e tente novamente.', {
                provider: oauthProvider ?? 'o provedor',
              })}
            </div>
          ) : null}
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-[24px] border border-[rgba(var(--color-border),0.25)] bg-[rgba(var(--color-surface),0.9)] p-1">
            <button
              type="button"
              className={cn(
                'flex flex-col items-center gap-1 rounded-[18px] px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] transition',
                isLogin
                  ? 'bg-[rgb(var(--color-primary))] text-white shadow-soft'
                  : 'text-[rgba(var(--color-text),0.6)] hover:bg-[rgba(var(--color-primary),0.08)]',
              )}
              onClick={() => setMode('login')}
            >
              <LogIn className="h-4 w-4" />
              {t('login.signIn', 'Entrar')}
            </button>
            <button
              type="button"
              className={cn(
                'flex flex-col items-center gap-1 rounded-[18px] px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] transition',
                !isLogin
                  ? 'bg-[rgb(var(--color-primary))] text-white shadow-soft'
                  : 'text-[rgba(var(--color-text),0.6)] hover:bg-[rgba(var(--color-primary),0.08)]',
              )}
              onClick={() => setMode('register')}
            >
              <UserPlus className="h-4 w-4" />
              {t('login.signUp', 'Cadastrar')}
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin ? (
              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.15em] text-[rgba(var(--color-text),0.7)]">
                  {t('login.fullName', 'Nome completo')}
                </label>
                <Input
                  type="text"
                  name="name"
                  placeholder={t('login.fullNamePlaceholder', 'Como devemos chamar você?')}
                  required
                />
              </div>
            ) : null}

            <div>
              <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.15em] text-[rgba(var(--color-text),0.7)]">
                {t('login.email', 'E-mail')}
              </label>
              <Input
                type="email"
                name="email"
                placeholder={t('login.emailPlaceholder', 'nome@exemplo.com')}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.15em] text-[rgba(var(--color-text),0.7)]">
                {t('login.password', 'Senha')}
              </label>
              <Input
                type="password"
                name="password"
                placeholder={t('login.passwordPlaceholder', 'Digite sua senha')}
                minLength={6}
                required
              />
            </div>

            {!isLogin ? (
              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.15em] text-[rgba(var(--color-text),0.7)]">
                  {t('login.passwordConfirm', 'Confirme a senha')}
                </label>
                <Input
                  type="password"
                  name="passwordConfirm"
                  placeholder={t('login.passwordConfirmPlaceholder', 'Repita a senha')}
                  minLength={6}
                  required
                />
              </div>
            ) : null}

            {isLogin ? (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm font-semibold text-[rgb(var(--color-primary))] transition hover:text-[rgba(var(--color-primary),0.8)]"
                >
                  {t('login.recover', 'Esqueci minha senha')}
                </button>
              </div>
            ) : null}

            <Button type="submit" className="w-full">
              <span className="flex items-center justify-center gap-2">
                {isLogin ? (
                  <>
                    <LogIn className="h-5 w-5" />
                    {t('login.submitSignIn', 'Entrar na Agenda Amiga')}
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    {t('login.submitSignUp', 'Criar minha conta')}
                  </>
                )}
              </span>
            </Button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-[rgba(var(--color-border),0.4)]" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(var(--color-text),0.45)]">
              {t('login.orContinue', 'ou continue com')}
            </span>
            <span className="h-px flex-1 bg-[rgba(var(--color-border),0.4)]" />
          </div>

          <div className="grid gap-3">
            <Button
              type="button"
              variant="ghost"
              className="w-full border border-[rgba(var(--color-border),0.35)] bg-[rgba(var(--color-surface),0.9)] text-[rgb(var(--color-text))]"
              onClick={() => setMode('login')}
            >
              <span className="flex items-center justify-center gap-3">
                <Mail className="h-5 w-5" aria-hidden />
                {t('login.socialEmail', 'Usar e-mail e senha')}
              </span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full border border-[rgba(var(--color-border),0.35)] bg-[rgba(var(--color-surface),0.9)] text-[rgb(var(--color-text))]"
              onClick={() => startSocialLogin('google')}
            >
              <span className="flex items-center justify-center gap-3">
                <ShieldCheck className="h-5 w-5 text-[#4285F4]" aria-hidden />
                {t('login.socialGoogle', 'Entrar com Google')}
              </span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full border border-[rgba(var(--color-border),0.35)] bg-[rgba(var(--color-surface),0.9)] text-[rgb(var(--color-text))]"
              onClick={() => startSocialLogin('govbr')}
            >
              <span className="flex items-center justify-center gap-3">
                <KeyRound className="h-5 w-5 text-[#1E5BC6]" aria-hidden />
                {t('login.socialGov', 'Entrar com gov.br')}
              </span>
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-[rgba(var(--color-text),0.7)]">
          {isLogin ? (
            <span className="inline-flex items-center gap-2">
              {t('login.noAccount', 'Ainda não tem cadastro?')}
              <button
                type="button"
                className="inline-flex items-center gap-1 font-semibold text-[rgb(var(--color-primary))] transition hover:text-[rgba(var(--color-primary),0.8)]"
                onClick={() => setMode('register')}
              >
                <User className="h-4 w-4" />
                {t('login.createAccount', 'Criar conta agora')}
              </button>
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              {t('login.haveAccount', 'Já tem uma conta?')}
              <button
                type="button"
                className="inline-flex items-center gap-1 font-semibold text-[rgb(var(--color-primary))] transition hover:text-[rgba(var(--color-primary),0.8)]"
                onClick={() => setMode('login')}
              >
                <LogIn className="h-4 w-4" />
                {t('login.backToSignIn', 'Entrar')}
              </button>
            </span>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[rgba(var(--color-text),0.6)] transition hover:text-[rgb(var(--color-primary))]"
          >
            <ArrowRight className="h-4 w-4 rotate-180" aria-hidden />
            {t('login.backHome', 'Voltar para a página inicial')}
          </Link>
        </div>
      </div>
    </div>
  );
}
