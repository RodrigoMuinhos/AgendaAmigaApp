import type { SVGProps } from "react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HighlightCard } from "../../components/ui/HighlightCard";
import { ScreenHeader, ScreenSection } from "../../components/ui/Screen";
import { AddFamilyButton } from "../../features/familia/cadastro/AddFamilyButton";
import type { ChildProfile } from "../../features/familia/cadastro/types";
import type { Paciente } from "../../types/paciente.types";
import { usePacientes } from "../../hooks/usePacientes";
import { Search as SearchIcon } from "lucide-react";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" });
const timeFormatter = new Intl.DateTimeFormat("pt-BR", { timeStyle: "short" });
const weightFormatter = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 1 });
const heightFormatter = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const imcFormatter = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const moodPalette: Record<string, string> = {
  Calmo: "bg-success/10 text-success",
  Calma: "bg-success/10 text-success",
  Alegre: "bg-primary/10 text-primary",
  Concentrado: "bg-primary/10 text-primary",
  Tranquilo: "bg-success/10 text-success",
  Ansioso: "bg-warning/10 text-warning",
  Ansiosa: "bg-warning/10 text-warning",
  Irritado: "bg-danger/10 text-danger",
  Irritada: "bg-danger/10 text-danger",
};

const activityPalette: Record<string, string> = {
  planejada: "bg-primary/10 text-primary",
  concluida: "bg-success/10 text-success",
  cancelada: "bg-danger/10 text-danger",
  em_andamento: "bg-warning/10 text-warning",
};

export default function PacientesListScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [createdPacientes, setCreatedPacientes] = useState<Paciente[]>([]);
  const navigate = useNavigate();
  const { data: pacientes, isLoading } = usePacientes();
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredCreated = useMemo(() => {
    if (!normalizedSearch) {
      return createdPacientes;
    }
    return createdPacientes.filter((paciente) => paciente.nome.toLowerCase().includes(normalizedSearch));
  }, [createdPacientes, normalizedSearch]);

  const filteredFetched = useMemo(() => {
    if (!normalizedSearch) {
      return pacientes;
    }
    return pacientes.filter((paciente) => paciente.nome.toLowerCase().includes(normalizedSearch));
  }, [pacientes, normalizedSearch]);

  const mergedPacientes = useMemo(() => {
    const createdIds = new Set(filteredCreated.map((paciente) => paciente.id));
    const deduplicatedFetched = filteredFetched.filter((paciente) => !createdIds.has(paciente.id));
    return [...filteredCreated, ...deduplicatedFetched];
  }, [filteredCreated, filteredFetched]);

  const totalPacientes = mergedPacientes.length;

  const comAlergias = useMemo(
    () => mergedPacientes.filter((paciente) => paciente.alergias.length > 0).length,
    [mergedPacientes],
  );
  const comPlano = useMemo(
    () => mergedPacientes.filter((paciente) => Boolean((paciente as { plano?: unknown }).plano)).length,
    [mergedPacientes],
  );
  const today = useMemo(() => new Date(), []);
  const comRegistrosHoje = useMemo(
    () =>
      mergedPacientes.filter((paciente) =>
        (paciente.humorDiario ?? []).some((registro) => isSameDay(new Date(registro.data), today)),
      ).length,
    [mergedPacientes, today],
  );
  const comAtividades = useMemo(
    () => mergedPacientes.filter((paciente) => (paciente.atividades ?? []).length > 0).length,
    [mergedPacientes],
  );

  const handleCreated = useCallback((profile: ChildProfile) => {
    const mapped = mapChildProfileToPaciente(profile);
    setCreatedPacientes((current) => [mapped, ...current.filter((item) => item.id !== mapped.id)]);
  }, []);

  const pacientesEmTela = mergedPacientes;

  return (
    <div className="flex flex-col gap-8">
      <ScreenHeader
        overline="Familia"
        title="Cards de cada familiar"
        description="Centralize dados clinicos, emocionais e de rotina em uma narrativa visual unificada."
        actions={
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex items-center gap-2 rounded-2xl border border-border/80 bg-background px-3 py-2">
              <SearchIcon className="h-4 w-4 text-muted" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar familiar"
                className="w-full border-none bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none sm:w-56"
                aria-label="Buscar familiar"
              />
            </div>
            <AddFamilyButton onCreated={handleCreated} />
          </div>
        }
      />

      <ScreenSection title="Mapa da familia" description="Acompanhe como os cards distribuem o cuidado" layout="grid">
        <HighlightCard
          subtitle="Familiares ativos"
          title={String(totalPacientes)}
          description="Perfis com cards prontos para uso"
          tone="primary"
        />
        <HighlightCard
          subtitle="Registros de humor hoje"
          title={String(comRegistrosHoje)}
          description="Diarios preenchidos nas ultimas 24h"
          tone="warning"
        />
        <HighlightCard
          subtitle="Familiares com alergias"
          title={String(comAlergias)}
          description="Use esses dados em alertas e bloqueios"
          tone="danger"
        />
        <HighlightCard
          subtitle="Com plano registrado"
          title={String(comPlano)}
          description="Planos cadastrados facilitam autorizacoes"
          tone="success"
        />
        <HighlightCard
          subtitle="Rotinas ativas"
          title={String(comAtividades)}
          description="Familiares com tarefas ou agendas configuradas"
        />
      </ScreenSection>

      <ScreenSection
        title="Cards por familiar"
        description="Veja detalhes e personalize cada jornada com um toque"
      >
        <p className="text-sm text-muted">{totalPacientes} familiar(es) encontrados</p>
        {isLoading ? (
          <p className="text-sm text-muted">Carregando familiares.</p>
        ) : pacientesEmTela.length === 0 ? (
          <HighlightCard
            title="Nenhum familiar encontrado"
            description="Ajuste a busca ou crie um novo card de familiar."
          />
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {pacientesEmTela.map((paciente) => (
              <PacienteCard key={paciente.id} paciente={paciente} today={today} onOpen={() => navigate(`/app/familia/${paciente.id}`)} />
            ))}
          </div>
        )}
      </ScreenSection>
    </div>
  );
}

type PacienteCardProps = {
  paciente: Paciente;
  today: Date;
  onOpen: () => void;
};

function PacienteCard({ paciente, today, onOpen }: PacienteCardProps) {
  const vitais = paciente.dadosVitais;
  const peso = typeof vitais?.pesoKg === "number" ? weightFormatter.format(vitais.pesoKg) : "-";
  const altura = typeof vitais?.alturaCm === "number" ? heightFormatter.format(vitais.alturaCm) : "-";
  const imcCalculado = calcularImc(vitais?.pesoKg, vitais?.alturaCm, vitais?.imc);
  const imc = typeof imcCalculado === "number" ? imcFormatter.format(imcCalculado) : "-";
  const vitaisAtualizadosEm = vitais?.atualizadoEm ? dateFormatter.format(new Date(vitais.atualizadoEm)) : null;

  const ultimaConsulta = paciente.ultimaConsulta;
  const ultimaConsultaData = ultimaConsulta ? dateFormatter.format(new Date(ultimaConsulta.data)) : "Sem registro";
  const ultimaConsultaProf = ultimaConsulta?.profissional ?? "Sem profissional vinculado";

  const sortedHumor = (paciente.humorDiario ?? [])
    .slice()
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  const humorHoje = sortedHumor.find((registro) => isSameDay(new Date(registro.data), today));
  const humorDestaque = humorHoje ?? sortedHumor[0];
  const humorHorario = humorDestaque ? timeFormatter.format(new Date(humorDestaque.data)) : null;

  const ultimaAtividade = (paciente.atividades ?? [])
    .slice()
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0];

  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-background/95 p-5 shadow-soft">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{paciente.nome}</h3>
          <p className="text-xs text-muted">
            {paciente.condicoes.length ? paciente.condicoes.join(", ") : "Sem condições registradas"}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="rounded-xl border border-primary/40 px-3 py-1 text-xs font-semibold text-primary transition hover:bg-primary/10"
        >
          Ver ficha
        </button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">Vitais</h4>
          <div className="flex gap-4 text-sm">
            <div>
              <p className="text-xs text-muted">Peso</p>
              <p className="font-semibold text-foreground">{peso} kg</p>
            </div>
            <div>
              <p className="text-xs text-muted">Altura</p>
              <p className="font-semibold text-foreground">{altura} cm</p>
            </div>
            <div>
              <p className="text-xs text-muted">IMC</p>
              <p className="font-semibold text-foreground">{imc}</p>
            </div>
          </div>
          {vitaisAtualizadosEm ? <p className="text-xs text-muted">Atualizado em {vitaisAtualizadosEm}</p> : null}
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">Humor</h4>
          {humorDestaque ? (
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${moodPalette[humorDestaque.humor] ?? "bg-muted/10 text-muted"}`}>
                {humorDestaque.humor}
              </span>
              <span className="text-xs text-muted">{humorHorario}</span>
            </div>
          ) : (
            <p className="text-xs text-muted">Sem registros recentes</p>
          )}
        </div>
      </section>

      <section className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">Atividades</h4>
        {ultimaAtividade ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${activityPalette[ultimaAtividade.status] ?? "bg-muted/10 text-muted"}`}>
              {ultimaAtividade.status}
            </span>
            <span className="text-sm text-foreground">{ultimaAtividade.titulo}</span>
            <span className="text-xs text-muted">
              {dateFormatter.format(new Date(ultimaAtividade.data))} às {timeFormatter.format(new Date(ultimaAtividade.data))}
            </span>
          </div>
        ) : (
          <p className="text-xs text-muted">Sem atividades registradas</p>
        )}
      </section>

      <footer className="flex flex-wrap gap-2 text-xs text-muted">
        {(paciente.alergias ?? []).map((alergia) => (
          <span key={alergia} className="rounded-full bg-danger/10 px-3 py-1 font-semibold text-danger">
            {alergia}
          </span>
        ))}
      </footer>
    </article>
  );
}

function isSameDay(a: Date, b: Date) {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

function calcularImc(peso?: number, altura?: number, fallback?: number) {
  if (typeof peso !== "number" || typeof altura !== "number" || altura === 0) {
    return fallback;
  }
  const metros = altura / 100;
  return peso / (metros * metros);
}

function mapChildProfileToPaciente(profile: ChildProfile): Paciente {
  const idade = calcularIdade(profile.dataNascimento);
  const ultimaMedida = profile.crescimento?.[profile.crescimento.length - 1];
  const pesoKg = ultimaMedida?.pesoKg;
  const alturaCm = ultimaMedida?.alturaCm;
  const imc = typeof pesoKg === "number" && typeof alturaCm === "number" && alturaCm > 0 ? pesoKg / Math.pow(alturaCm / 100, 2) : undefined;

  return {
    id: profile.id,
    nome: profile.nomeCompleto,
    idade,
    dataNascimento: profile.dataNascimento,
    condicoes: profile.condicoes ?? [],
    alergias: (profile.alergias ?? []).map((alergia) => alergia.nome),
    diagnosticoTea: undefined,
    dadosVitais: ultimaMedida
      ? {
          pesoKg,
          alturaCm,
          imc,
          atualizadoEm: ultimaMedida.data,
        }
      : undefined,
    ultimaConsulta: undefined,
    avaliacoesRecentes: undefined,
    humorDiario: [],
    atividades: [],
    interesses: [],
    sensibilidades: [],
  };
}

function calcularIdade(dataISO?: string) {
  if (!dataISO) {
    return undefined;
  }
  const data = new Date(dataISO);
  if (Number.isNaN(data.getTime())) {
    return undefined;
  }
  const hoje = new Date();
  let idade = hoje.getFullYear() - data.getFullYear();
  const mes = hoje.getMonth() - data.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < data.getDate())) {
    idade -= 1;
  }
  return idade;
}

