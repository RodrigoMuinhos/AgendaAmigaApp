import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Phone } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { getAuthToken } from '../../../services/api';
import { FormCrianca } from '../components/FormCrianca';
import { useCriancasStore } from '../store';
import { useAuthStore, AUTH_STORAGE_KEY } from '../../auth/store';
import type { Crianca, CriancaCreateInput } from '../types';
import { formatarIdade } from '../utils/idade';

type SessionSnapshot = {
  storeTokenPreview?: string;
  httpTokenPreview?: string;
  tokensMatch: boolean;
  hasStoredSession: boolean;
  storedUserId?: string;
};

function previewToken(token?: string | null): string | undefined {
  if (!token) return undefined;
  if (token.length <= 14) return token;
  return `${token.slice(0, 8)}...${token.slice(-4)}`;
}

function captureSessionSnapshot(storeToken?: string, httpToken?: string | null): SessionSnapshot {
  let hasStoredSession = false;
  let storedUserId: string | undefined;
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      hasStoredSession = Boolean(raw);
      if (raw) {
        const parsed = JSON.parse(raw) as { user?: { id?: string } };
        storedUserId = parsed?.user?.id;
      }
    } catch {
      hasStoredSession = false;
    }
  }
  return {
    storeTokenPreview: previewToken(storeToken ?? null),
    httpTokenPreview: previewToken(httpToken),
    tokensMatch: Boolean(storeToken && httpToken && storeToken === httpToken),
    hasStoredSession,
    storedUserId,
  };
}

export function NovaCriancaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const authState = useAuthStore((state) => ({
    status: state.status,
    token: state.token,
    user: state.user,
  }));
  const authUserLabel = authState.user?.nome ?? authState.user?.id;
  const [confirmado, setConfirmado] = useState(false);
  const [recemCriada, setRecemCriada] = useState<Crianca | undefined>(undefined);
  const [sessionSnapshot, setSessionSnapshot] = useState<SessionSnapshot>(() =>
    captureSessionSnapshot(authState.token, getAuthToken()),
  );
  const [toastVisible, setToastVisible] = useState(false);

  const { criar, carregando, erro, limparErro } = useCriancasStore((state) => ({
    criar: state.criar,
    carregando: state.carregando,
    erro: state.erro,
    limparErro: state.limparErro,
  }));

  const salvarCrianca = useMutation({
    mutationFn: async (dados: CriancaCreateInput) => {
      limparErro();
      const criada = await criar(dados);
      if (!criada) {
        throw new Error('NÃ£o foi possÃ­vel salvar os dados da crianÃ§a.');
      }
      return criada;
    },
    onSuccess: (criada) => {
      queryClient.invalidateQueries({ queryKey: ['criancas'] }).catch(() => undefined);
      setRecemCriada(criada);
      setConfirmado(true); // Mostra confirmaÃ§Ã£o
    },
  });

  useEffect(() => {
    return () => setRecemCriada(undefined);
  }, []);

  useEffect(() => {
    setSessionSnapshot(captureSessionSnapshot(authState.token, getAuthToken()));
  }, [authState.status, authState.token, salvarCrianca.isPending]);

  useEffect(() => {
    if (!salvarCrianca.isSuccess) {
      setToastVisible(false);
      return;
    }
    if (typeof window === 'undefined') {
      return;
    }
    setToastVisible(true);
    const timer = window.setTimeout(() => setToastVisible(false), 4000);
    return () => window.clearTimeout(timer);
  }, [salvarCrianca.isSuccess]);

  const status = useMemo<'idle' | 'success' | 'error'>(() => {
    if (salvarCrianca.isError) return 'error';
    if (salvarCrianca.isSuccess) return 'success';
    return 'idle';
  }, [salvarCrianca.isError, salvarCrianca.isSuccess]);

  const statusMessage = useMemo(() => {
    if (status === 'success') return 'CrianÃ§a salva com sucesso!';
    if (status === 'error') {
      const message =
        erro ||
        (salvarCrianca.error instanceof Error
          ? salvarCrianca.error.message
          : 'NÃ£o foi possÃ­vel salvar os dados.');
      return message;
    }
    return undefined;
  }, [erro, salvarCrianca.error, status]);

  const handleSubmit = async (dados: CriancaCreateInput) => {
    await salvarCrianca.mutateAsync(dados);
  };

  return (
    <div className="space-y-6">
      {toastVisible && recemCriada ? (
        <div className="fixed top-6 right-6 z-50 w-full max-w-sm">
          <div
            role="status"
            className="pointer-events-auto flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-xl backdrop-blur"
          >
            <div>
              <p className="text-sm font-semibold text-emerald-900">CrianÃ§a salva!</p>
              <p className="text-xs text-emerald-700">{recemCriada.nome}</p>
            </div>
            <button
              type="button"
              className="text-xs font-semibold text-emerald-700 underline-offset-2 hover:underline"
              onClick={() => setToastVisible(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      ) : null}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-[rgb(var(--color-primary))] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(30,136,229,0.25)]"
        >
          Voltar
        </button>
        <h1 className="text-3xl font-semibold text-[rgb(var(--color-text))]">Adicionar crianÃ§a</h1>
        <p className="text-sm text-[rgba(var(--color-text),0.7)]">
          Preencha os campos essenciais para registrar a crianÃ§a e facilitar o acompanhamento.
        </p>
      </div>

      <Card className="rounded-3xl bg-[rgb(var(--color-surface))] p-6 shadow-elevated">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-[rgba(var(--color-text),0.7)]">
          <span className="rounded-full border border-[rgba(var(--color-border),0.3)] bg-[rgba(var(--color-primary),0.08)] px-3 py-1 text-[rgba(var(--color-text),0.75)]">
            SessÃ£o: {authState.status}
            {authUserLabel ? ` Â· ${authUserLabel}` : ''}
          </span>
          <span
            className={`rounded-full border px-3 py-1 text-[0.55rem] ${
              sessionSnapshot.httpTokenPreview
                ? 'border-emerald-500 bg-[rgba(16,185,129,0.08)] text-emerald-900'
                : 'border-amber-500 bg-[rgba(250,204,21,0.12)] text-amber-900'
            }`}
          >
            Authorization header: {sessionSnapshot.httpTokenPreview ? 'presente' : 'ausente'}
          </span>
          <span className="rounded-full border border-[rgba(var(--color-border),0.3)] bg-[rgba(var(--color-surface),0.4)] px-3 py-1 text-[rgba(var(--color-text),0.75)]">
            Token armazenado: {sessionSnapshot.storeTokenPreview ?? 'ausente'}
          </span>
          <span className="rounded-full border border-[rgba(var(--color-border),0.3)] bg-[rgba(var(--color-surface),0.4)] px-3 py-1 text-[rgba(var(--color-text),0.75)]">
            LocalStorage: {sessionSnapshot.hasStoredSession ? 'salvo' : 'limpo'}
            {sessionSnapshot.storedUserId ? ` Â· ${sessionSnapshot.storedUserId}` : ''}
          </span>
          <span
            className={`rounded-full border px-3 py-1 text-[0.55rem] ${
              sessionSnapshot.tokensMatch
                ? 'border-emerald-500 bg-[rgba(16,185,129,0.08)] text-emerald-900'
                : 'border-rose-500 bg-[rgba(244,63,94,0.12)] text-rose-800'
            }`}
          >
            Tokens sincronizados: {sessionSnapshot.tokensMatch ? 'sim' : 'nÃ£o'}
          </span>
        </div>
        {confirmado ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-2 text-4xl text-green-600">âœ…</div>
              <p className="text-lg font-semibold text-green-700">CrianÃ§a cadastrada com sucesso!</p>
              <p className="text-sm text-gray-500 mt-1">
                Revise os dados abaixo ou avance para a ficha completa.
              </p>
            </div>

            {recemCriada ? (
              <div className="space-y-4 rounded-3xl border border-[rgba(var(--color-border),0.3)] bg-[rgba(var(--color-surface),0.85)] p-5 shadow-inner">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(var(--color-primary),0.12)] text-lg font-semibold text-[rgb(var(--color-primary))]">
                    {recemCriada.nome
                      ?.split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((parte) => parte[0]?.toUpperCase())
                      .join('') || '?'}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[rgb(var(--color-text))]">
                      {recemCriada.nome || 'Nome nÃ£o informado'}
                    </h3>
                    <p className="flex items-center gap-2 text-sm text-[rgba(var(--color-text),0.7)]">
                      <Calendar className="h-4 w-4 text-[rgb(var(--color-primary))]" aria-hidden />
                      <span>{formatarIdade(recemCriada.nascimentoISO)}</span>
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-[rgba(var(--color-primary),0.08)] px-4 py-3 text-sm text-[rgba(var(--color-text),0.75)]">
                  <p className="font-semibold text-[rgb(var(--color-primary))]">ResponsÃ¡vel</p>
                  <p>{recemCriada.responsavel?.nome ?? 'NÃ£o informado'}</p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[rgb(var(--color-primary))]" aria-hidden />
                    <span>{recemCriada.responsavel?.telefone ?? 'Sem telefone'}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => navigate(`/criancas/${recemCriada.id}`)}
                    className="flex-1 justify-center"
                  >
                    Ver ficha completa
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate('/criancas')}
                    className="flex-1 justify-center"
                  >
                    Voltar para lista
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <FormCrianca
            onSubmit={handleSubmit}
            onCancel={() => navigate('/criancas')}
            isSubmitting={salvarCrianca.isPending || carregando}
            status={status}
            statusMessage={statusMessage}
          />
        )}
      </Card>
    </div>
  );
}
