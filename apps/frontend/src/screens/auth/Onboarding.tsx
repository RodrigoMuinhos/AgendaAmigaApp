import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Step = {
  id: string;
  title: string;
  description: string;
  fields: string[];
};

const STEPS: Step[] = [
  {
    id: "tutor",
    title: "Sobre voce",
    description: "Entenda quem esta coordenando os cuidados.",
    fields: ["Nome completo", "Relacionamento com o paciente", "Melhor horario para alertas"],
  },
  {
    id: "familia",
    title: "Familia",
    description: "Liste quem recebe o cuidado para personalizar os cards.",
    fields: ["Nome do familiar", "Idade", "Condicoes e alergias"],
  },
  {
    id: "tratamentos",
    title: "Tratamentos",
    description: "Adicione medicamentos, dosagens e quem administra.",
    fields: ["Medicamento", "Dosagem", "Recorrencia"],
  },
  {
    id: "agenda",
    title: "Agenda",
    description: "Defina horarios, rotinas e tarefas extras.",
    fields: ["Horario", "Responsavel", "Observacoes"],
  },
];

export function OnboardingScreen() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentStep = useMemo(() => STEPS[currentIndex], [currentIndex]);

  const next = useCallback(() => {
    if (currentIndex === STEPS.length - 1) {
      navigate("/app");
      return;
    }
    setCurrentIndex((value) => value + 1);
  }, [currentIndex, navigate]);

  const back = useCallback(() => {
    if (currentIndex === 0) {
      navigate(-1);
      return;
    }
    setCurrentIndex((value) => value - 1);
  }, [currentIndex, navigate]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between text-xs font-medium text-muted">
        <span>
          Passo {currentIndex + 1} de {STEPS.length}
        </span>
        <button type="button" onClick={() => navigate("/app")} className="text-primary hover:text-primary-hover">
          Pular onboarding
        </button>
      </div>
      <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
        <div className="grid gap-3 sm:grid-cols-4">
          {STEPS.map((step, index) => {
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;
            const classes = isActive
              ? "border-primary/60 bg-primary/10 text-primary"
              : isCompleted
                ? "border-success/40 bg-success/5 text-success"
                : "border-border/60 bg-surface text-muted";
            return (
              <div
                key={step.id}
                className={
                  'flex flex-col gap-1 rounded-xl border px-3 py-3 text-xs font-semibold transition ' + classes
                }
              >
                <span>
                  {index + 1}. {step.title}
                </span>
                <span className="text-[11px] font-normal text-muted">{step.description}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-surface/95 p-5 shadow-soft">
        <h3 className="text-lg font-semibold text-foreground">{currentStep.title}</h3>
        <p className="text-sm text-muted">{currentStep.description}</p>
        <ul className="space-y-3 text-sm text-foreground">
          {currentStep.fields.map((field, index) => (
            <li key={field} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                {index + 1}
              </span>
              <div>
                <div className="font-semibold">{field}</div>
                <div className="text-xs text-muted">Preencha para destravar cards personalizados neste passo.</div>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={back}
            className="rounded-2xl border border-border/80 px-5 py-3 text-sm font-semibold text-muted transition hover:border-primary hover:text-primary"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={next}
            className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            {currentIndex === STEPS.length - 1 ? "Concluir e ver cards" : "Avancar"}
          </button>
        </div>
      </div>
    </div>
  );
}
