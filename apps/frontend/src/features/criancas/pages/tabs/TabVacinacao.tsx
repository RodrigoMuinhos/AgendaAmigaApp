import { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Syringe } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { useOutletContext } from 'react-router-dom';
import { useCriancasStore } from '../../store';
import { vacinasCatalogo } from '../../vacinas.catalogo';
import { calcularResumoVacinacao } from '../../selectors';
import { ResumoCobertura } from '../../components/Vacinacao/ResumoCobertura';
import { TabelaVacinacao } from '../../components/Vacinacao/TabelaVacinacao';
import { RegistroVacinaModal } from '../../components/Vacinacao/RegistroVacinaModal';

type TabContext = {
  criancaId: string;
};

function formatarIdadeAlvo(idade?: number) {
  if (idade === undefined) return 'Qualquer idade';
  if (idade === 0) return 'Ao nascer';
  if (idade < 12) return `${idade} meses`;
  const anos = Math.floor(idade / 12);
  const meses = idade % 12;
  if (meses === 0) {
    return `${anos} anos`;
  }
  return `${anos} anos e ${meses} meses`;
}

export function TabVacinacao() {
  const { criancaId } = useOutletContext<TabContext>();
  const [modalAberto, setModalAberto] = useState(false);

  const { historico, addVacina, listarPendencias, proximasDoses, getCaderneta, crianca } = useCriancasStore(
    (state) => ({
      historico: state.cadernetas[criancaId]?.vacinacao.historico ?? [],
      addVacina: state.addVacina,
      listarPendencias: state.listarPendencias,
      proximasDoses: state.proximasDoses,
      getCaderneta: state.getCaderneta,
      crianca: state.criancas.find((item) => item.id === criancaId),
    }),
  );

  useEffect(() => {
    getCaderneta(criancaId);
  }, [criancaId, getCaderneta]);

  const pendencias = useMemo(
    () => listarPendencias(criancaId, vacinasCatalogo),
    [criancaId, listarPendencias, historico],
  );

  const proximas = useMemo(
    () => proximasDoses(criancaId, vacinasCatalogo),
    [criancaId, proximasDoses, historico],
  );

  const resumo = useMemo(() => {
    const pendentesCount = pendencias.reduce((acc, item) => acc + item.doses.length, 0);
    return calcularResumoVacinacao(historico, pendentesCount, proximas.length, vacinasCatalogo);
  }, [historico, pendencias, proximas]);

  const nomeCrianca = crianca?.nome ?? 'a crianca';

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-[rgba(var(--color-border),0.3)] bg-[rgb(var(--color-surface))] p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-[rgb(var(--color-text))]">Caderneta de vacinacao</h2>
          <p className="text-sm text-[rgba(var(--color-text),0.7)]">
            Registre doses aplicadas, acompanhe proximas recomendacoes e pendencias do calendario oficial.
          </p>
        </div>
        <Button type="button" onClick={() => setModalAberto(true)} className="self-start sm:self-auto">
          <Syringe className="h-5 w-5" aria-hidden />
          <span>Registrar vacina</span>
        </Button>
      </header>

      <ResumoCobertura dados={resumo} />

      <section className="space-y-3 rounded-3xl border border-[rgba(var(--color-border),0.3)] bg-[rgb(var(--color-surface))] p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-[rgb(var(--color-primary))]" aria-hidden />
          <div>
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text))]">Proximas doses</h3>
            <p className="text-xs text-[rgba(var(--color-text),0.65)]">
              Sugestoes baseadas na idade recomendada. Ajuste conforme avaliacao da equipe de saude.
            </p>
          </div>
        </div>
        {proximas.length ? (
          <ul className="space-y-2">
            {proximas.slice(0, 5).map((item) => (
              <li
                key={`${item.vacina.id}-${item.dose.codigo}`}
                className="flex flex-col gap-1 rounded-2xl border border-[rgba(var(--color-border),0.3)] bg-[rgba(var(--color-primary),0.08)] px-4 py-3 text-sm text-[rgba(var(--color-text),0.85)]"
              >
                <span className="font-semibold text-[rgb(var(--color-primary))]">{item.vacina.nome}</span>
                <span>{item.dose.rotulo}</span>
                <span className="text-xs text-[rgba(var(--color-text),0.6)]">
                  Idade alvo: {formatarIdadeAlvo(item.dose.idadeAlvoMeses)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-[rgba(var(--color-border),0.4)] bg-[rgba(var(--color-surface),0.6)] px-4 py-4 text-sm text-[rgba(var(--color-text),0.7)]">
            Nenhuma proxima dose prevista. Revise o calendario com a equipe de saude periodicamente.
          </p>
        )}
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-[rgb(var(--color-text))]">Historico de vacinacao</h3>
        <TabelaVacinacao registros={historico} catalogo={vacinasCatalogo} />
      </section>

      {pendencias.length ? (
        <section className="space-y-3 rounded-3xl border border-[rgba(var(--color-danger),0.25)] bg-[rgba(248,113,113,0.1)] p-5">
          <h3 className="text-lg font-semibold text-red-600">Pendencias identificadas</h3>
          <ul className="list-disc space-y-2 pl-5 text-sm text-red-700">
            {pendencias.map((item) => (
              <li key={item.vacina.id}>
                {item.vacina.nome}: {item.doses.map((dose) => dose.rotulo).join(', ')}
              </li>
            ))}
          </ul>
          <p className="text-xs text-[rgba(220,38,38,0.8)]">
            Procure a unidade de saude para regularizar o esquema vacinal de {nomeCrianca}.
          </p>
        </section>
      ) : null}

      <RegistroVacinaModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        criancaId={criancaId}
        catalogo={vacinasCatalogo}
        onConfirm={addVacina}
      />

      {!historico.length ? (
        <EmptyState
          icon={<Syringe className="h-8 w-8" aria-hidden />}
          title="Nenhuma vacina registrada ainda."
          description="Comece adicionando as doses ja aplicadas para manter a caderneta completa."
          action={
            <Button type="button" onClick={() => setModalAberto(true)}>
              Registrar vacina
            </Button>
          }
        />
      ) : null}
    </div>
  );
}
