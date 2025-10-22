import { ChevronLeft } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useCriancasStore } from '../store';
import { formatarIdade } from '../utils/idade';

export function CadernetaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const avisoNavegacao = (location.state as { aviso?: string } | undefined)?.aviso;

  const { crianca, carregando, buscarPorId, setSelecionada } = useCriancasStore((state) => ({
    crianca: id ? state.criancas.find((item) => item.id === id) : undefined,
    carregando: state.carregando,
    buscarPorId: state.buscarPorId,
    setSelecionada: state.setSelecionada,
  }));

  useEffect(() => {
    if (!id) {
      return;
    }
    setSelecionada(id);
    if (!crianca) {
      void buscarPorId(id);
    }
  }, [id, crianca, buscarPorId, setSelecionada]);

  const idade = useMemo(() => (crianca ? formatarIdade(crianca.nascimentoISO) : ''), [crianca]);

  if (!id) {
    return <Navigate to="/criancas" replace state={{ aviso: 'Selecione uma crianca para abrir a caderneta.' }} />;
  }

  if (carregando && !crianca) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-[rgba(var(--color-text),0.7)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[rgb(var(--color-primary))] border-b-transparent" />
        <p>Carregando caderneta...</p>
      </div>
    );
  }

  if (!crianca) {
    return (
      <EmptyState
        title="Crianca nao encontrada"
        description="Selecione um registro valido para visualizar a caderneta."
        action={
          <Button asChild><Link to="/criancas">Ir para lista de criancas</Link></Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-[rgba(var(--color-border),0.4)] bg-[rgb(var(--color-surface))] p-6 shadow-soft">
        <div className="flex items-center gap-3 text-sm text-[rgba(var(--color-text),0.6)]">
          <Button type="button" variant="ghost" size="sm" onClick={() => navigate(-1)} className="w-fit">
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Voltar
          </Button>
          {avisoNavegacao ? (
            <span className="rounded-full bg-[rgba(var(--color-primary),0.12)] px-3 py-1 text-xs font-semibold text-[rgb(var(--color-primary))]">
              {avisoNavegacao}
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[rgb(var(--color-text))]">{crianca.nome}</h1>
            <p className="text-sm text-[rgba(var(--color-text),0.7)]">Idade aproximada: {idade}</p>
            <p className="text-xs text-[rgba(var(--color-text),0.6)]">Cartao SUS: {crianca.cartaoSUS ?? 'Nao informado'}</p>
          </div>
          <div className="flex flex-col items-start gap-1 text-sm text-[rgba(var(--color-text),0.7)]">
            <span className="font-semibold text-[rgb(var(--color-primary))]">Responsavel</span>
            <span>{crianca.responsavel?.nome ?? 'Nao informado'}</span>
            {crianca.responsavel?.telefone ? <span>{crianca.responsavel.telefone}</span> : null}
          </div>
        </div>
      </div>

      <Outlet context={{ criancaId: crianca.id }} />
    </div>
  );
}

