import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, LogIn, User, UserPlus } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { cn } from '../utils/cn';
import { useAuthStore } from '../features/auth/store';
import { env } from '../core/config/env';

type Mode = 'login' | 'register';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [searchParams] = useSearchParams();
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [cpfInput, setCpfInput] = useState('');
  const [formSuccess, setFormSuccess] = useState<string | undefined>(undefined);
  const successModeSwitchRef = useRef(false);

  const status = useAuthStore((state) => state.status);
  const initialize = useAuthStore((state) => state.initialize);
  const authenticating = useAuthStore((state) => state.authenticating);
  const login = useAuthStore((state) => state.login);
  const registerAccount = useAuthStore((state) => state.register);
  const storeError = useAuthStore((state) => state.error);
  const clearAuthError = useAuthStore((state) => state.clearError);

  const isLogin = mode === 'login';
  const oauthError = searchParams.get('error');
  const oauthProvider = searchParams.get('provider');

  useEffect(() => {
    if (status === 'idle') {
      void initialize();
    }
  }, [initialize, status]);

  useEffect(() => {
    if (status === 'authenticated') {
      navigate('/inicio', { replace: true });
    }
  }, [navigate, status]);

  useEffect(() => {
    setCpfInput('');
  }, [mode]);

  useEffect(() => {
    if (storeError) {
      setFormError(storeError);
    }
  }, [storeError]);

  useEffect(() => {
    setFormError(undefined);
    clearAuthError();
    if (successModeSwitchRef.current) {
      successModeSwitchRef.current = false;
    } else {
      setFormSuccess(undefined);
    }
  }, [mode, clearAuthError]);

  if (env.authDisabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-bg))] via-[rgba(var(--color-primary),0.12)] to-[rgb(var(--color-bg))] text-[rgb(var(--color-text))]">
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12 sm:px-10">
          <div className="rounded-3xl border border-dashed border-[rgba(var(--color-primary),0.35)] bg-[rgba(var(--color-surface),0.95)] p-8 text-center shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[rgba(var(--color-text),0.6)]">
              {t('login.disabled.badge', 'Modo teste livre')}
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-[rgb(var(--color-primary))]">
              {t('login.disabled.title', 'Login temporariamente desativado')}
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-[rgba(var(--color-text),0.75)]">
              {t(
                'login.disabled.description',
                'Liberamos o acesso direto ao painel para voce experimentar a Agenda Amiga sem criar conta.',
              )}
            </p>
            <Button asChild className="mt-6 w-full">
              <Link to="/inicio">{t('login.disabled.goHome', 'Ir para o painel')}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formatCpf = useMemo(
    () => (value: string) => {
      const digits = value.replace(/\D/g, '').slice(0, 11);
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
      if (digits.length <= 9) {
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
      }
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    },
    [],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(undefined);
    setFormSuccess(undefined);

    const data = new FormData(event.currentTarget);
    const nome = String(data.get('name') ?? '').trim();
    const senha = String(data.get('password') ?? '');
    const cpfRaw = String(data.get('cpf') ?? '').trim();
    const cpfDigits = cpfRaw.replace(/\D/g, '');
    const email = String(data.get('email') ?? '').trim();

    if (!cpfDigits || (isLogin && !senha)) {
      const message = isLogin
        ? t('login.validation.missingCredentials', 'Informe CPF e senha.')
        : t('login.validation.missingCpf', 'Informe o CPF para continuar.');
      setFormError(message);
      return;
    }

    if (cpfDigits.length !== 11) {
      setFormError(t('login.validation.responsavelCpf', 'Informe um CPF valido.'));
      return;
    }

    if (isLogin) {
      const success = await login({ cpf: cpfDigits, senha });
      if (success) {
        navigate('/inicio', { replace: true });
      }
      return;
    }

    if (!nome.length) {
      setFormError(t('login.validation.fullName', 'Informe seu nome completo.'));
      return;
    }

    if (!email.length) {
      setFormError(t('login.validation.email', 'Informe um email valido para receber a senha.'));
      return;
    }

    const success = await registerAccount({
      nome,
      cpf: cpfDigits,
      email,
    });

    if (success) {
      const successMessage = t(
        'login.register.success',
        'Email enviado com sucesso. Verifique sua caixa de entrada.',
      );
      setFormSuccess(successMessage);
      successModeSwitchRef.current = true;
      setMode('login');
      setCpfInput('');
      return;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-bg))] via-[rgba(var(--color-primary),0.08)] to-[rgb(var(--color-bg))] text-[rgb(var(--color-text))]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12 sm:px-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-[0.2em] text-[rgb(var(--color-primary))]">
            {t('login.brand', 'AGENDA AMIGA')}
          </h1>
          <p className="mt-2 text-sm text-[rgba(var(--color-text),0.7)]">
            {t('login.subtitle', 'Cuidados em familia com um so login.')}
          </p>
        </div>

        <div className="rounded-[32px] border border-[rgba(var(--color-border),0.3)] bg-[rgb(var(--color-surface))] p-8 shadow-elevated backdrop-blur-sm">
          {oauthError ? (
            <div className="mb-4 rounded-3xl border border-[rgba(var(--color-border),0.35)] bg-[rgba(239,68,68,0.08)] px-4 py-3 text-sm text-[rgb(220,38,38)]">
              {t(
                'login.oauthError',
                'Nao foi possivel iniciar o login com {{provider}}. Verifique a configuracao e tente novamente.',
                {
                  provider: oauthProvider ?? 'o provedor',
                }
              )}
            </div>
          ) : null}

          {formError ? (
            <div className="mb-4 rounded-3xl border border-[rgba(var(--color-border),0.35)] bg-[rgba(239,68,68,0.08)] px-4 py-3 text-sm text-[rgb(220,38,38)]">
              {formError}
            </div>
          ) : null}
          {formSuccess ? (
            <div className="mb-4 rounded-3xl border border-lime-200 bg-lime-50 px-4 py-3 text-sm text-lime-700">
              {formSuccess}
            </div>
          ) : null}

          <div className="mb-6 grid grid-cols-2 gap-2 rounded-[24px] border border-[rgba(var(--color-border),0.25)] bg-[rgba(var(--color-surface),0.9)] p-1">
            <button
              type="button"
              className={cn(
                'flex flex-col items-center gap-1 rounded-[18px] px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] transition',
                isLogin
                  ? 'bg-[rgb(var(--color-primary))] text-white shadow-soft'
                  : 'text-[rgba(var(--color-text),0.6)] hover:bg-[rgba(var(--color-primary),0.08)]'
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
                  : 'text-[rgba(var(--color-text),0.6)] hover:bg-[rgba(var(--color-primary),0.08)]'
              )}
              onClick={() => setMode('register')}
            >
              <UserPlus className="h-4 w-4" />
              {t('login.signUp', 'Cadastrar')}
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin ? (
              <>
                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.15em] text-[rgba(var(--color-text),0.7)]">
                    {t('login.fullName', 'Nome completo')}
                  </label>
                  <Input
                    type="text"
                    name="name"
                    placeholder={t('login.fullNamePlaceholder', 'Como devemos chamar voce?')}
                    required
                    disabled={authenticating}
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.15em] text-[rgba(var(--color-text),0.7)]">
                    {t('login.email', 'E-mail')}
                  </label>
                  <Input
                    type="email"
                    name="email"
                    placeholder={t('login.emailPlaceholder', 'seu@email.com')}
                    required
                    disabled={authenticating}
                    autoComplete="email"
                  />
                </div>
              </>
            ) : null}

            <div>
              <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.15em] text-[rgba(var(--color-text),0.7)]">
                {t('login.cpf', 'CPF')}
              </label>
              <Input
                type="text"
                name="cpf"
                value={cpfInput}
                onChange={(event) => setCpfInput(formatCpf(event.target.value))}
                placeholder={t('login.cpfPlaceholder', '000.000.000-00')}
                required
                disabled={authenticating}
                inputMode="numeric"
                autoComplete={isLogin ? 'username' : 'off'}
              />
            </div>

            {isLogin ? (
              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.15em] text-[rgba(var(--color-text),0.7)]">
                  {t('login.password', 'Senha')}
                </label>
                <Input
                  type="password"
                  name="password"
                  placeholder={t('login.passwordPlaceholder', 'Digite sua senha')}
                  required
                  disabled={authenticating}
                  autoComplete="current-password"
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

            <Button type="submit" className="w-full" disabled={authenticating}>
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

        </div>

        <div className="mt-6 text-center text-sm text-[rgba(var(--color-text),0.7)]">
          {isLogin ? (
            <span className="inline-flex items-center gap-2">
              {t('login.noAccount', 'Ainda nao tem cadastro?')}
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
              {t('login.haveAccount', 'Ja tem uma conta?')}
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
            {t('login.backHome', 'Voltar para a pagina inicial')}
          </Link>
        </div>
      </div>
    </div>
  );
}
