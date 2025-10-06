import { useMemo } from "react";
import { ScreenHeader, ScreenSection } from "../components/ui/Screen";
import { useDoseLogs } from "../hooks/useDoses";
import { useTratamentos } from "../hooks/useTratamentos";
import { usePacientes } from "../hooks/usePacientes";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "full" });
const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });
const timeFormatter = new Intl.DateTimeFormat("pt-BR", { timeStyle: "short" });

export default function AgendaScreen() {
  const { data: logs = [], isLoading } = useDoseLogs();
  const { data: tratamentos = [] } = useTratamentos();
  const { data: pacientes = [] } = usePacientes();

  const tratamentosMap = useMemo(
    () => new Map(tratamentos.map((tratamento) => [tratamento.id, tratamento])),
    [tratamentos]
  );
  const pacientesMap = useMemo(
    () => new Map(pacientes.map((paciente) => [paciente.id, paciente.nome] as const)),
    [pacientes]
  );

  const groupedLogs = useMemo(() => {
    return logs
      .slice()
      .sort((a, b) => new Date(b.dataHoraISO).getTime() - new Date(a.dataHoraISO).getTime())
      .reduce<Record<string, typeof logs>>((acc, log) => {
        const key = shortDateFormatter.format(new Date(log.dataHoraISO));
        acc[key] = acc[key] ? [...acc[key], log] : [log];
        return acc;
      }, {});
  }, [logs]);

  const calendar = useMemo(() => buildMonthMatrix(new Date()), []);

  return (
    <div className="flex flex-col gap-8">
      <ScreenHeader
        overline="Agenda"
        title="Ritmo de doses e compromissos"
        description="Visualize o calendario vivo da familia e revise cada registro com clareza."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr,1fr]">
        <ScreenSection title="Calendario vivo" description="Dias com rotina ativa ficam sempre em evidencia">
          <CalendarView matrix={calendar} />
        </ScreenSection>

        <ScreenSection title="Historico de doses" description="Agrupamos por dia para facilitar revisoes rapidas">
          {isLoading ? (
            <p className="text-sm text-muted">Carregando agenda da familia.</p>
          ) : Object.keys(groupedLogs).length === 0 ? (
            <p className="text-sm text-muted">Nenhum registro disponivel.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {Object.entries(groupedLogs).map(([data, itens]) => (
                <div key={data} className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">{data}</h3>
                  <ul className="flex flex-col gap-2 text-sm">
                    {itens.map((log) => {
                      const tratamento = tratamentosMap.get(log.tratamentoId);
                      const pacienteNome = tratamento ? pacientesMap.get(tratamento.pacienteId) ?? "Familiar" : "Familiar";
                      return (
                        <li key={log.id} className="rounded-2xl border border-border/70 bg-background/80 px-3 py-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-foreground">{tratamento?.medicamento ?? "Tratamento"}</span>
                            <span className="rounded-full bg-muted/10 px-2 py-1 text-xs text-muted">{pacienteNome}</span>
                            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                              {timeFormatter.format(new Date(log.dataHoraISO))}
                            </span>
                            <StatusBadge status={log.status} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </ScreenSection>
      </div>
    </div>
  );
}

type CalendarCell = {
  date: Date | null;
  isToday: boolean;
};

type CalendarMatrix = CalendarCell[][];

function buildMonthMatrix(reference: Date): CalendarMatrix {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const prefix = (firstDay.getDay() + 6) % 7;

  const cells: CalendarCell[] = [];
  for (let i = 0; i < prefix; i += 1) {
    cells.push({ date: null, isToday: false });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const current = new Date(year, month, day);
    const isToday = isSameDate(current, reference);
    cells.push({ date: current, isToday });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ date: null, isToday: false });
  }

  const matrix: CalendarMatrix = [];
  for (let index = 0; index < cells.length; index += 7) {
    matrix.push(cells.slice(index, index + 7));
  }
  return matrix;
}

function isSameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const weekdays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];

function CalendarView({ matrix }: { matrix: CalendarMatrix }) {
  const title = dateFormatter.format(new Date());
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">Hoje</span>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted">
        {weekdays.map((weekday) => (
          <div key={weekday} className="font-semibold uppercase tracking-wide">
            {weekday}
          </div>
        ))}
        {matrix.map((week, weekIndex) =>
          week.map((cell, cellIndex) => (
            <div
              key={`${weekIndex}-${cellIndex}`}
              className={`flex h-16 items-center justify-center rounded-xl border border-border/60 text-sm ${
                cell.isToday ? "bg-primary/10 text-primary font-semibold" : "text-muted"
              } ${cell.date ? "" : "opacity-40"}`}
            >
              {cell.date?.getDate() ?? ""}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const palette: Record<string, string> = {
    PENDENTE: "bg-warning/10 text-warning",
    ATRASADA: "bg-danger/10 text-danger",
    CONFIRMADA: "bg-success/10 text-success",
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${palette[status] ?? "bg-muted/10 text-muted"}`}>{status}</span>;
}
