import { Calendar, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { HeaderCriancas } from '../components/HeaderCriancas';
import { useCriancasStore } from '../store';
import type { Crianca } from '../types';
import { formatarIdade } from '../utils/idade';

function AvatarMini({ crianca }: { crianca: Crianca }) {
  if (crianca.avatarUrl) {
    return (
      <img
        src={crianca.avatarUrl}
        alt=""
        className="h-16 w-16 rounded-2xl object-cover"
      />
    );
  }

  const iniciais =
    crianca.nome
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase())
      .join('') || '?';

  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(var(--color-primary),0.12)] text-xl font-semibold text-[rgb(var(--color-primary))]">
      {iniciais}
    </div>
  );
}

export function ListaCriancasPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const aviso = (location.state as { aviso?: string } | undefined)?.aviso;
  const { criancas, listar, carregando, erro, limparErro, setSelecionada } = useCriancasStore((state) => ({
    criancas: state.criancas,
    listar: state.listar,
    carregando: state.carregando,
    erro: state.erro,
    limparErro: state.limparErro,
    setSelecionada: state.setSelecionada,
  }));

  useEffect(() => {
    if (!criancas.length) {
      listar().catch(() => {
        /* erros ja tratados no estado */
      });
    }
  }, [criancas.length, listar]);

  useEffect(() => {
    if (aviso) {
      navigate(location.pathname, { replace: true });
    }
  }, [aviso, navigate, location.pathname]);

  return (
    <div className="space-y-8">
      <HeaderCriancas onAdd={() => navigate('/criancas/nova')} />

      {aviso ? (
        <div className="rounded-2xl border border-[rgba(var(--color-primary),0.3)] bg-[rgba(var(--color-primary),0.08)] px-4 py-3 text-sm text-[rgb(var(--color-primary))]">
          {aviso}
        </div>
      ) : null}

      {erro ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700"
        >
          <div className="flex items-center justify-between">
            <span>{erro}</span>
            <button
              type="button"
              onClick={limparErro}
              className="text-sm font-semibold underline"
            >
              Fechar
            </button>
          </div>
        </div>
      ) : null}

      {carregando && !criancas.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-3xl border border-[rgba(var(--color-border),0.4)] bg-[rgba(var(--color-surface),0.7)] p-6"
            >
              <div className="mb-4 h-6 w-24 rounded-full bg-[rgba(var(--color-border),0.3)]" />
              <div className="flex flex-col gap-3">
                <div className="h-4 w-full rounded-full bg-[rgba(var(--color-border),0.2)]" />
                <div className="h-4 w-2/3 rounded-full bg-[rgba(var(--color-border),0.2)]" />
                <div className="h-4 w-1/2 rounded-full bg-[rgba(var(--color-border),0.2)]" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!carregando && !criancas.length ? (
        <EmptyState
          title="Nenhuma crianca cadastrada ainda."
          description="Comece incluindo a primeira crianca para acompanhar dados essenciais e facilitar a comunicacao com a familia."
          action={
            <Button type="button" onClick={() => navigate('/criancas/nova')}>
              Adicionar crianca
            </Button>
          }
        />
      ) : null}

      {criancas.length ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {criancas.map((crianca, index) => {
            const hasId = Boolean(crianca.id && crianca.id.trim().length);
            const cardKey = hasId ? crianca.id : `tmp-${index}`;
            const nome =
              typeof crianca.nome === 'string' && crianca.nome.trim().length
                ? crianca.nome
                : 'Nome nao informado';
            const nascimentoValido =
              typeof crianca.nascimentoISO === 'string' &&
              crianca.nascimentoISO.trim().length &&
              !Number.isNaN(Date.parse(crianca.nascimentoISO));
            const idadeTexto = nascimentoValido ? formatarIdade(crianca.nascimentoISO) : 'Data invalida';
            return (
              <Card
                key={cardKey}
                className="flex flex-col gap-4 rounded-3xl bg-[rgb(var(--color-surface))] p-6 shadow-soft"
              >
                <div className="flex items-center gap-4">
                  <AvatarMini crianca={crianca} />
                  <div>
                    <h3 className="text-xl font-semibold text-[rgb(var(--color-text))]">{nome}</h3>
                    <p className="flex items-center gap-2 text-sm text-[rgba(var(--color-text),0.7)]">
                      <Calendar className="h-4 w-4 text-[rgb(var(--color-primary))]" aria-hidden />
                      <span>{idadeTexto}</span>
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="justify-between"
                  disabled={!hasId}
                  onClick={() => {
                    if (!hasId) return;
                    setSelecionada(crianca.id);
                    navigate(`/criancas/${crianca.id}`);
                  }}
                >
                  Ver ficha
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </Button>
              </Card>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
