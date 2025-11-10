import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { Button } from '../../../../components/ui/button';
import { asArray } from '../../../../core/utils/arrays';
import { useCriancasStore } from '../../store';
import { ResumoCrescimento } from '../../components/Crescimento/ResumoCrescimento';
import { analisarMedidasCrescimento } from '../../utils/crescimento';

type TabContext = {
  criancaId: string;
};

export function TabVisaoGeral() {
  const { criancaId } = useOutletContext<TabContext>();
  const navigate = useNavigate();
  const { crianca, registros, listarMedidasCrescimento, getCaderneta } = useCriancasStore((state) => ({
    crianca: state.criancas.find((item) => item.id === criancaId),
    registros: asArray(state.cadernetas[criancaId]?.crescimento?.registros),
    listarMedidasCrescimento: state.listarMedidasCrescimento,
    getCaderneta: state.getCaderneta,
  }));

  useEffect(() => {
    getCaderneta(criancaId);
  }, [criancaId, getCaderneta]);

  if (!crianca) {
    return (
      <EmptyState
        title="Crianca nao encontrada"
        description="Selecione um cadastro valido para visualizar a visao geral."
      />
    );
  }

  const medidas = useMemo(
    () => listarMedidasCrescimento(criancaId),
    [listarMedidasCrescimento, criancaId, registros],
  );
  const analises = useMemo(
    () => analisarMedidasCrescimento(crianca, medidas),
    [crianca, medidas],
  );
  const abrirCrescimento = () => navigate('../crescimento');

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <ResumoCrescimento
          analises={analises}
          onEditar={abrirCrescimento}
          editarLabel="Atualizar ficha de crescimento"
          novoRegistroLabel="Registrar primeira medida"
          limite={1}
        />
        <div className="flex justify-end">
          <Button asChild variant="ghost" size="sm">
            <Link to="../crescimento">Ver historico completo</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
