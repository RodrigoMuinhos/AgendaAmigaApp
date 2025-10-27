import { useEffect, useMemo, useState } from 'react';
import { Edit, Ruler, Scale } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '../../../../components/ui/button';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { asArray } from '../../../../core/utils/arrays';
import { useCriancasStore } from '../../store';
import { ResumoCrescimento } from '../../components/Crescimento/ResumoCrescimento';
import { TabelaCrescimento } from '../../components/Crescimento/TabelaCrescimento';
import { RegistroCrescimentoModal } from '../../components/Crescimento/RegistroCrescimentoModal';
import { CrescimentoChart } from '../../components/Crescimento/CrescimentoChart';
import { analisarMedidasCrescimento } from '../../utils/crescimento';
import type { CrescimentoRegistro } from '../../types';

type TabContext = {
  criancaId: string;
};

type ModalState =
  | { aberto: false }
  | { aberto: true; modo: 'criar'; registro?: undefined }
  | { aberto: true; modo: 'editar'; registro: CrescimentoRegistro };

export function TabCrescimento() {
  const { criancaId } = useOutletContext<TabContext>();
  const [modal, setModal] = useState<ModalState>({ aberto: false });

  const {
    registros,
    addCrescimento,
    editarCrescimento,
    listarMedidasCrescimento,
    getCaderneta,
    crianca,
  } = useCriancasStore((state) => ({
    registros: asArray(state.cadernetas[criancaId]?.crescimento?.registros),
    addCrescimento: state.addCrescimento,
    editarCrescimento: state.editarCrescimento,
    listarMedidasCrescimento: state.listarMedidasCrescimento,
    getCaderneta: state.getCaderneta,
    crianca: state.criancas.find((item) => item.id === criancaId),
  }));

  useEffect(() => {
    getCaderneta(criancaId);
  }, [criancaId, getCaderneta]);

  const medidas = useMemo(() => listarMedidasCrescimento(criancaId), [listarMedidasCrescimento, criancaId, registros]);
  const analises = useMemo(
    () => analisarMedidasCrescimento(crianca, medidas),
    [crianca, medidas],
  );
  const analiseMaisRecente = analises[0];

  const handleCriar = () => setModal({ aberto: true, modo: 'criar' });
  const handleEditarUltimo = () => {
    if (!registros.length) return;
    setModal({ aberto: true, modo: 'editar', registro: registros[0] });
  };

  const handleSubmit = (
    registro: CrescimentoRegistro,
    metadata: { modo: 'criar' | 'editar'; originalDataISO?: string },
  ) => {
    if (metadata.modo === 'editar' && metadata.originalDataISO) {
      editarCrescimento(criancaId, metadata.originalDataISO, registro);
    } else {
      addCrescimento(registro);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-[rgba(var(--color-border),0.3)] bg-[rgb(var(--color-surface))] p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-[rgb(var(--color-text))]">Crescimento</h2>
          <p className="text-sm text-[rgba(var(--color-text),0.7)]">
            Registre peso, estatura e perimetro cefalico para acompanhar o desenvolvimento de {crianca?.nome ?? 'a crianca'}.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {analises.length ? (
            <Button type="button" variant="ghost" size="sm" onClick={handleEditarUltimo}>
              <Edit className="h-4 w-4" aria-hidden />
              <span>Editar ultima</span>
            </Button>
          ) : null}
          <Button type="button" onClick={handleCriar} className="self-start sm:self-auto">
            <Scale className="h-5 w-5" aria-hidden />
            <span>Adicionar medidas</span>
          </Button>
        </div>
      </header>

      {analises.length ? (
        <ResumoCrescimento destaque={analiseMaisRecente} onEditar={handleEditarUltimo} />
      ) : (
        <EmptyState
          icon={<Ruler className="h-8 w-8" aria-hidden />}
          title="Nenhuma medida registrada"
          description="Adicione pelo menos uma medida para acompanhar graficamente o crescimento."
        />
      )}

      {analises.length ? (
        <CrescimentoChart analises={analises} />
      ) : null}

      {analises.length ? (
        <section className="space-y-4">
          <h3 className="text-xl font-semibold text-[rgb(var(--color-text))]">Historico de medidas</h3>
          <TabelaCrescimento analises={analises} />
        </section>
      ) : null}

      <RegistroCrescimentoModal
        open={modal.aberto}
        onClose={() => setModal({ aberto: false })}
        criancaId={criancaId}
        modo={modal.aberto ? modal.modo : 'criar'}
        registroInicial={modal.aberto && modal.modo === 'editar' ? modal.registro : undefined}
        originalDataISO={modal.aberto && modal.modo === 'editar' ? modal.registro?.dataISO : undefined}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
