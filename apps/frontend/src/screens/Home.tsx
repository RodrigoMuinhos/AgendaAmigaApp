import type { SVGProps } from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScreenSection } from "../components/ui/Screen";
import { useHomeResumo, useLinksCompartilhamento } from "../hooks/useDashboard";
import { useDosesProximas, useConfirmarDose } from "../hooks/useDoses";
import { useTratamentos } from "../hooks/useTratamentos";
import { usePacientes } from "../hooks/usePacientes";
import { useToast } from "../components/Toast";
import { precacheProximasDoses } from "../serviceWorkerRegistration";
import { listarDosesProximas } from "../services/api";

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

const numberFormatter = new Intl.NumberFormat("pt-BR");

type ProximaDoseItem = {
  id: string;
  horario: string;
  status: string;
  paciente: string;
  medicamento: string;
};

type ModuleCard = {
  id: string;
  label: string;
  description: string;
  badge?: string;
  to: string;
  icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  quickAction?: {
    label: string;
    to: string;
  };
};

export default function HomeScreen() {
  const navigate = useNavigate();
  const { data: resumo } = useHomeResumo();
  const { data: proximas = [], isLoading: proximasLoading } = useDosesProximas("tutor-1");
  const { data: links = [], isLoading: linksLoading } = useLinksCompartilhamento();
  const { data: tratamentos = [] } = useTratamentos();
  const { data: pacientes = [] } = usePacientes();
  const confirmDose = useConfirmarDose();
  const { pushToast } = useToast();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    precacheProximasDoses(() => listarDosesProximas("tutor-1"));
  }, []);

  const pacientesMap = useMemo(
    () => new Map(pacientes.map((paciente) => [paciente.id, paciente.nome] as const)),
    [pacientes]
  );
  const tratamentosMap = useMemo(
    () => new Map(tratamentos.map((tratamento) => [tratamento.id, tratamento])),
    [tratamentos]
  );

  const proximasDecoradas: ProximaDoseItem[] = useMemo(() => {
    return proximas.map((log) => {
      const tratamento = tratamentosMap.get(log.tratamentoId);
      const pacienteNome = tratamento ? pacientesMap.get(tratamento.pacienteId) ?? "Familiar" : "Familiar";
      const medicamento = tratamento?.medicamento ?? "Tratamento";
      return {
        id: log.id,
        horario: dateTimeFormatter.format(new Date(log.dataHoraISO)),
        status: log.status,
        paciente: pacienteNome,
        medicamento,
      };
    });
  }, [pacientesMap, proximas, tratamentosMap]);

  const handleConfirmDose = async (logId: string, medicamento: string) => {
    try {
      setConfirmingId(logId);
      await confirmDose.mutateAsync(logId);
      pushToast({
        title: "Dose confirmada",
        description: `${medicamento} marcada como realizada.`,
        variant: "success",
      });
    } catch (error) {
      pushToast({
        title: "Não foi possível confirmar",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "danger",
      });
    } finally {
      setConfirmingId(null);
    }
  };

  const familiaBadge = resumo ? `${numberFormatter.format(resumo.pacientes ?? 0)} perfis` : undefined;
  const tratamentosBadge = resumo ? `${numberFormatter.format(resumo.tratamentosHoje ?? 0)} doses hoje` : undefined;
  const agendaBadge = proximas.length ? `${proximas.length} pendentes` : undefined;
  const inicioBadge = resumo ? `${numberFormatter.format(resumo.linksAtivos ?? 0)} compartilh.` : undefined;

  const modules: ModuleCard[] = useMemo(
    () => [
      {
        id: "familias",
        label: "Famílias",
        description: "Gerencie rede de cuidado",
        badge: familiaBadge,
        to: "/app/familia",
        icon: FamilyIcon,
        quickAction: { label: "Adicionar", to: "/app/familia" },
      },
      {
        id: "tratamentos",
        label: "Tratamentos",
        description: "Agenda de medicamentos",
        badge: tratamentosBadge,
        to: "/app/tratamentos",
        icon: PillAppIcon,
        quickAction: { label: "Nova dose", to: "/app/tratamentos" },
      },
      {
        id: "agenda",
        label: "Agenda",
        description: "Rotinas e tarefas",
        badge: agendaBadge,
        to: "/app/agenda",
        icon: CalendarAppIcon,
        quickAction: { label: "Criar tarefa", to: "/app/agenda" },
      },
      {
        id: "inicio",
        label: "Início",
        description: "Resumo inteligente",
        badge: inicioBadge,
        to: "/app",
        icon: HomeAppIcon,
        quickAction: { label: "Assistente", to: "/app/insights" },
      },
    ],
    [agendaBadge, familiaBadge, inicioBadge, tratamentosBadge]
  );

  return (
    <div className="flex flex-col gap-6">
      <MobileHero resumo={resumo} navigate={navigate} />

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Atalhos principais</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4">
          {modules.map((module) => (
            <AppModuleCard key={module.id} module={module} onNavigate={navigate} />
          ))}
        </div>
      </section>

      <ScreenSection
        title="Hoje"
        description="Veja rapidamente as próximas aplicações"
      >
        {proximasLoading ? (
          <p className="text-sm text-muted">Carregando próximas doses...</p>
        ) : proximasDecoradas.length === 0 ? (
          <p className="text-sm text-muted">Nenhuma dose pendente agora. Tudo dentro do esperado!</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {proximasDecoradas.slice(0, 4).map((dose) => (
              <li
                key={dose.id}
                className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-background/95 px-4 py-3 shadow-soft"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted">{dose.paciente}</p>
                    <h3 className="text-sm font-semibold text-foreground">{dose.medicamento}</h3>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                    <ClockMiniIcon className="h-3.5 w-3.5" />
                    {dose.horario}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <StatusBadge status={dose.status} />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-soft transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={confirmDose.isPending || confirmingId === dose.id || dose.status === "CONFIRMADA"}
                    onClick={() => handleConfirmDose(dose.id, dose.medicamento)}
                  >
                    Confirmar
                  </button>
                  <button className="rounded-xl border border-border/70 px-4 py-2 text-xs font-semibold text-muted transition hover:border-primary hover:text-primary">
                    Ajustar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </ScreenSection>

      <ScreenSection
        title="Guia rápido"
        description="Links ativos para mandar para a rede de apoio"
      >
        {linksLoading ? (
          <p className="text-sm text-muted">Carregando links...</p>
        ) : links.length === 0 ? (
          <p className="text-sm text-muted">Nenhum link ativo. Crie um novo em Configurações.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {links.slice(0, 4).map((link) => (
              <li key={link.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/95 px-4 py-3 text-sm shadow-soft">
                <div>
                  <p className="font-semibold text-foreground">{link.id}</p>
                  <p className="text-xs text-muted">{link.escopo}</p>
                </div>
                <span className="text-xs text-muted">Expira em {dateTimeFormatter.format(new Date(link.expiraEm))}</span>
              </li>
            ))}
          </ul>
        )}
      </ScreenSection>
    </div>
  );
}

type MobileHeroProps = {
  resumo: ReturnType<typeof useHomeResumo>["data"];
  navigate: ReturnType<typeof useNavigate>;
};

function MobileHero({ resumo, navigate }: MobileHeroProps) {
  const stats = [
    { label: "Famílias", value: numberFormatter.format(resumo?.pacientes ?? 0) },
    { label: "Doses hoje", value: numberFormatter.format(resumo?.tratamentosHoje ?? 0) },
    { label: "Compart.", value: numberFormatter.format(resumo?.linksAtivos ?? 0) },
  ];

  return (
    <div className="rounded-[24px] border border-border bg-surface px-5 py-6 shadow-soft">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background text-primary">
          <HeroIcon className="h-10 w-10" />
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Agenda Amiga</p>
          <h1 className="text-lg font-semibold text-foreground">Fluxo guiado para cuidadores</h1>
          <p className="text-xs text-muted">Acompanhe, ajuste e compartilhe o que importa hoje.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/app/insights")}
          className="rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-[11px] font-semibold text-primary shadow-soft transition hover:bg-primary/20"
        >
          Assistente
        </button>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-muted">
        {stats.map((stat) => (
          <span key={stat.label} className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-center font-semibold text-foreground">
            {stat.value}
            <span className="ml-1 font-normal text-muted">{stat.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

type AppModuleCardProps = {
  module: ModuleCard;
  onNavigate: ReturnType<typeof useNavigate>;
};

function AppModuleCard({ module, onNavigate }: AppModuleCardProps) {
  const handleNavigate = () => onNavigate(module.to);

  const handleQuickAction = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (module.quickAction) {
      onNavigate(module.quickAction.to);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleNavigate();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-3xl border border-border bg-surface p-4 text-left shadow-soft transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 active:scale-[0.99] hover:-translate-y-0.5 hover:border-primary/40"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background text-primary">
          <module.icon className="h-7 w-7" />
        </span>
        {module.badge && (
          <span className="rounded-full border border-border bg-background px-3 py-1 text-[11px] font-semibold text-muted">
            {module.badge}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">{module.label}</h3>
        <p className="text-xs text-muted">{module.description}</p>
      </div>
      {module.quickAction && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleQuickAction}
            className="inline-flex items-center gap-1 rounded-xl border border-border bg-background px-3 py-1 text-[11px] font-semibold text-primary transition hover:bg-primary/5"
          >
            <span>{module.quickAction.label}</span>
            <ArrowIcon className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const palette: Record<string, string> = {
    PENDENTE: "bg-warning/10 text-warning",
    ATRASADA: "bg-danger/10 text-danger",
    CONFIRMADA: "bg-success/10 text-success",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${palette[status] ?? "bg-muted/10 text-muted"}`}>
      {status}
    </span>
  );
}

function FamilyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="9" cy="7.5" r="3.5" />
      <circle cx="17" cy="8.5" r="2.5" />
      <path d="M3.5 20c0-3.5 2.8-6.5 6.5-6.5s6.5 3 6.5 6.5" />
      <path d="M14 18.5c.4-2.5 2.4-4.5 4.9-4.5 2.1 0 3.7 1.1 4.1 3.4" strokeOpacity={0.6} />
    </svg>
  );
}

function PillAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="7" />
      <path d="M12 5v14" />
      <path d="M7 11h10" strokeOpacity={0.5} />
    </svg>
  );
}

function CalendarAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="18" height="17" rx="4" />
      <path d="M3 10h18" />
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <path d="M8 15h.01" />
      <path d="M12 15h.01" />
      <path d="M16 15h.01" />
    </svg>
  );
}

function HomeAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m4 10 8-6 8 6" />
      <path d="M5 9v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9" />
    </svg>
  );
}

function ArrowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

function ClockMiniIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v3.2l2.2 1.3" />
    </svg>
  );
}

function HeroIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x={6} y={9} width={36} height={30} rx={10} fill="#F6FAFF" stroke="currentColor" />
      <path d="M6 19h36" />
      <path d="M16 7v10" />
      <path d="M32 7v10" />
      <circle cx={19} cy={28} r={2.5} fill="currentColor" stroke="none" />
      <circle cx={29} cy={28} r={2.5} fill="currentColor" stroke="none" />
      <path d="M18 33.5c1.7 1.6 3.6 2.5 6 2.5s4.3-.9 6-2.5" />
    </svg>
  );
}

