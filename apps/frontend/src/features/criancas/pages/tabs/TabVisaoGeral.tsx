import dayjs from 'dayjs';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { Card } from '../../../../components/ui/card';
import { useOutletContext } from 'react-router-dom';
import { useCriancasStore } from '../../store';
import { formatarIdade } from '../../utils/idade';

type TabContext = {
  criancaId: string;
};

export function TabVisaoGeral() {
  const { criancaId } = useOutletContext<TabContext>();
  const crianca = useCriancasStore((state) => state.criancas.find((item) => item.id === criancaId));

  if (!crianca) {
    return (
      <EmptyState
        title="Crianca nao encontrada"
        description="Selecione um cadastro valido para visualizar a visao geral."
      />
    );
  }

  const idade = formatarIdade(crianca.nascimentoISO);
  const nascimento = dayjs(crianca.nascimentoISO).isValid()
    ? dayjs(crianca.nascimentoISO).format('DD/MM/YYYY')
    : crianca.nascimentoISO;

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <header className="space-y-1">
          <h3 className="text-xl font-semibold text-[rgb(var(--color-text))]">Dados principais</h3>
          <p className="text-sm text-[rgba(var(--color-text),0.7)]">
            Informacoes basicas registradas na caderneta.
          </p>
        </header>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase text-[rgba(var(--color-text),0.55)]">Nome</dt>
            <dd className="text-base font-semibold text-[rgb(var(--color-text))]">{crianca.nome}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-[rgba(var(--color-text),0.55)]">Nascimento</dt>
            <dd className="text-base font-semibold text-[rgb(var(--color-text))]">{nascimento}</dd>
            <dd className="text-xs text-[rgba(var(--color-text),0.6)]">{idade}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-[rgba(var(--color-text),0.55)]">Sexo</dt>
            <dd className="text-base font-semibold text-[rgb(var(--color-text))]">{crianca.sexo}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-[rgba(var(--color-text),0.55)]">Cartao SUS</dt>
            <dd className="text-base font-semibold text-[rgb(var(--color-text))]">
              {crianca.cartaoSUS ?? 'Nao informado'}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="space-y-3">
        <header>
          <h3 className="text-xl font-semibold text-[rgb(var(--color-text))]">Responsavel</h3>
        </header>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase text-[rgba(var(--color-text),0.55)]">Nome</dt>
            <dd className="text-base font-semibold text-[rgb(var(--color-text))]">
              {crianca.responsavel?.nome ?? 'Nao informado'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-[rgba(var(--color-text),0.55)]">Telefone</dt>
            <dd className="text-base font-semibold text-[rgb(var(--color-text))]">
              {crianca.responsavel?.telefone ?? 'Nao informado'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-[rgba(var(--color-text),0.55)]">Parentesco</dt>
            <dd className="text-base font-semibold text-[rgb(var(--color-text))]">
              {crianca.responsavel?.parentesco ?? 'Nao informado'}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
