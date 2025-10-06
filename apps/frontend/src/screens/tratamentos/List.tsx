import { useMemo, useState } from "react";
import { Panel } from "../../components/DashboardCards";
import { usePacientes } from "../../hooks/usePacientes";
import {
  useAlterarStatusTratamento,
  useDeletarTratamento,
  useSalvarTratamento,
  useTratamentos,
} from "../../hooks/useTratamentos";
import { useToast } from "../../components/Toast";
import type { Paciente } from "../../types/paciente.types";
import type { TratamentoDetalhe } from "../../types/tratamento.types";

const statusOptions = [
  { id: "TODOS", label: "Todos" },
  { id: "ATIVO", label: "Ativos" },
  { id: "PAUSADO", label: "Pausados" },
  { id: "ENCERRADO", label: "Encerrados" },
] as const;

type StatusFilterId = (typeof statusOptions)[number]["id"];

type TreatmentFormState = {
  id?: string;
  pacienteId: string;
  medicamento: string;
  dosagem: string;
  recorrencia: TratamentoDetalhe["recorrencia"];
  horarios: string;
  notas?: string;
  status: TratamentoDetalhe["status"];
};

const emptyForm: TreatmentFormState = {
  pacienteId: "",
  medicamento: "",
  dosagem: "",
  recorrencia: "DIARIO_HORARIOS_FIXOS",
  horarios: "",
  notas: "",
  status: "ATIVO",
};

export default function TratamentosListScreen() {
  const { data: tratamentos = [], isLoading } = useTratamentos();
  const { data: pacientes = [] } = usePacientes();
  const salvarTratamento = useSalvarTratamento();
  const alterarStatus = useAlterarStatusTratamento();
  const deletarTratamento = useDeletarTratamento();
  const { pushToast } = useToast();

  const [statusFilter, setStatusFilter] = useState<StatusFilterId>("TODOS");
  const [pacienteFilter, setPacienteFilter] = useState<string>("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState<TreatmentFormState>(emptyForm);

  const pacienteMap = useMemo(() => new Map(pacientes.map((paciente) => [paciente.id, paciente.nome] as const)), [pacientes]);

  const filtered = useMemo(() => {
    return tratamentos.filter((tratamento) => {
      const statusOk = statusFilter === "TODOS" || tratamento.status === statusFilter;
      const pacienteOk = pacienteFilter === "todos" || tratamento.pacienteId === pacienteFilter;
      return statusOk && pacienteOk;
    });
  }, [pacienteFilter, statusFilter, tratamentos]);

  const openCreateModal = () => {
    setFormState(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (tratamento: TratamentoDetalhe) => {
    setFormState({
      id: tratamento.id,
      pacienteId: tratamento.pacienteId,
      medicamento: tratamento.medicamento,
      dosagem: tratamento.dosagem,
      recorrencia: tratamento.recorrencia,
      horarios: tratamento.horarios?.join(",") ?? "",
      notas: tratamento.notas ?? "",
      status: tratamento.status,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.pacienteId || !formState.medicamento || !formState.dosagem) {
      pushToast({ title: "Campos obrigatórios", description: "Preencha familiar, medicamento e dosagem", variant: "warning" });
      return;
    }

    try {
      await salvarTratamento.mutateAsync({
        id: formState.id,
        pacienteId: formState.pacienteId,
        medicamento: formState.medicamento,
        dosagem: formState.dosagem,
        recorrencia: formState.recorrencia,
        horarios: formState.horarios
          .split(",")
          .map((horario) => horario.trim())
          .filter(Boolean),
        notas: formState.notas,
        status: formState.status,
      });
      pushToast({ title: "Medicação salva", variant: "success" });
      setIsModalOpen(false);
    } catch (error) {
      pushToast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "danger",
      });
    }
  };

  const handleAlterarStatus = async (id: string, status: TratamentoDetalhe["status"]) => {
    try {
      await alterarStatus.mutateAsync({ id, status });
      pushToast({ title: "Status atualizado", variant: "success" });
    } catch (error) {
      pushToast({
        title: "Erro ao atualizar",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "danger",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja remover esta medicação?")) {
      return;
    }
    try {
      await deletarTratamento.mutateAsync(id);
      pushToast({ title: "Medicação removida", variant: "success" });
    } catch (error) {
      pushToast({
        title: "Erro ao remover",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "danger",
      });
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Medicações</h1>
          <p className="text-sm text-muted">Organize horários, dosagens e lembretes da família</p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-hover"
        >
          Adicionar medicação
        </button>
      </header>

      <Panel title="Filtros" description="Filtre para encontrar rapidamente o que cada familiar está tomando">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Status
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilterId)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary"
            >
              {statusOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Familiar
            <select
              value={pacienteFilter}
              onChange={(event) => setPacienteFilter(event.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary"
            >
              <option value="todos">Todos os familiares</option>
              {pacientes.map((paciente) => (
                <option key={paciente.id} value={paciente.id}>
                  {paciente.nome}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Panel>

      {isLoading ? (
        <p className="text-sm text-muted">Carregando tratamentos…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted">Nenhum tratamento encontrado com os filtros selecionados.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((tratamento) => (
            <article key={tratamento.id} className="flex flex-col gap-3 rounded-lg border border-border bg-surface px-4 py-4 shadow-soft">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-semibold text-foreground">{tratamento.medicamento}</h3>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">{tratamento.dosagem}</span>
                <span className="rounded-full bg-muted/10 px-2 py-1 text-xs text-muted">{formatRecorrencia(tratamento.recorrencia)}</span>
              </div>
              <p className="text-sm text-muted">Familiar: {pacienteMap.get(tratamento.pacienteId) ?? "—"}</p>
              {tratamento.horarios && tratamento.horarios.length > 0 && (
                <p className="text-xs text-muted">Horários: {tratamento.horarios.join(" • ")}</p>
              )}
              {tratamento.notas && <p className="text-xs text-muted">Notas: {tratamento.notas}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                <label className="flex items-center gap-2">
                  Status
                  <select
                    value={tratamento.status}
                    onChange={(event) => handleAlterarStatus(tratamento.id, event.target.value as TratamentoDetalhe["status"])}
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                  >
                    <option value="ATIVO">Ativo</option>
                    <option value="PAUSADO">Pausado</option>
                    <option value="ENCERRADO">Encerrado</option>
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => openEditModal(tratamento)}
                  className="rounded-md border border-border px-2 py-1 text-xs text-muted transition hover:border-primary hover:text-primary"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(tratamento.id)}
                  className="rounded-md border border-danger px-2 py-1 text-xs text-danger transition hover:bg-danger/10"
                >
                  Remover
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {isModalOpen && (
        <TreatmentModal
          onClose={closeModal}
          onSubmit={handleSubmit}
          formState={formState}
          setFormState={setFormState}
          pacientes={pacientes}
          saving={salvarTratamento.isPending}
        />
      )}
    </div>
  );
}

function formatRecorrencia(recorrencia: TratamentoDetalhe["recorrencia"]) {
  switch (recorrencia) {
    case "DIARIO_HORARIOS_FIXOS":
      return "Diário (horários fixos)";
    case "SEMANA":
      return "Semanal";
    case "INTERVALO":
      return "Por intervalo";
    default:
      return recorrencia;
  }
}

type TreatmentModalProps = {
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  formState: TreatmentFormState;
  setFormState: React.Dispatch<React.SetStateAction<TreatmentFormState>>;
  pacientes: Paciente[];
  saving: boolean;
};

function TreatmentModal({ onClose, onSubmit, formState, setFormState, pacientes, saving }: TreatmentModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-lg border border-border bg-surface shadow-elevated">
        <header className="flex items-center justify-between border-b border-border/70 px-4 py-3">
          <h2 className="text-lg font-semibold text-foreground">{formState.id ? "Editar medicação" : "Adicionar medicação"}</h2>
          <button onClick={onClose} aria-label="Fechar" className="text-xl text-muted hover:text-primary">
            ×
          </button>
        </header>
        <form onSubmit={onSubmit} className="flex flex-col gap-4 px-4 py-4 text-sm">
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Familiar
            <select
              value={formState.pacienteId}
              onChange={(event) => setFormState((state) => ({ ...state, pacienteId: event.target.value }))}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary"
              required
            >
              <option value="" disabled>
                Selecione um familiar
              </option>
              {pacientes.map((paciente) => (
                <option key={paciente.id} value={paciente.id}>
                  {paciente.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Medicamento
            <input
              type="text"
              value={formState.medicamento}
              onChange={(event) => setFormState((state) => ({ ...state, medicamento: event.target.value }))}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary"
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Dosagem
            <input
              type="text"
              value={formState.dosagem}
              onChange={(event) => setFormState((state) => ({ ...state, dosagem: event.target.value }))}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary"
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Recorrência
            <select
              value={formState.recorrencia}
              onChange={(event) => setFormState((state) => ({ ...state, recorrencia: event.target.value as TreatmentFormState["recorrencia"] }))}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary"
            >
              <option value="DIARIO_HORARIOS_FIXOS">Diário (horários fixos)</option>
              <option value="SEMANA">Semanal</option>
              <option value="INTERVALO">Por intervalo</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Horários (separe por vírgulas)
            <input
              type="text"
              value={formState.horarios}
              onChange={(event) => setFormState((state) => ({ ...state, horarios: event.target.value }))}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary"
              placeholder="08:00, 20:00"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Notas
            <textarea
              value={formState.notas}
              onChange={(event) => setFormState((state) => ({ ...state, notas: event.target.value }))}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary"
              rows={3}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Status
            <select
              value={formState.status}
              onChange={(event) => setFormState((state) => ({ ...state, status: event.target.value as TreatmentFormState["status"] }))}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary"
            >
              <option value="ATIVO">Ativo</option>
              <option value="PAUSADO">Pausado</option>
              <option value="ENCERRADO">Encerrado</option>
            </select>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm text-muted transition hover:border-primary hover:text-primary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-hover disabled:opacity-60"
            >
              {saving ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

