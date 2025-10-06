import { DomainEvent } from "../events/DomainEvent";
import { DoseConfirmada } from "../events/DoseConfirmada";

export type DoseStatus = "PENDENTE" | "TOMADO" | "ATRASADO";

export interface DoseLogSnapshot {
  readonly id: string;
  readonly medicamentoId: string;
  readonly horarioPrevisto: string;
  readonly status: DoseStatus;
  readonly horarioReal: string | null;
}

export interface DoseLogProps {
  readonly id: string;
  readonly medicamentoId: string;
  readonly horarioPrevisto: Date;
  readonly status?: DoseStatus;
  readonly horarioReal?: Date | null;
}

export class DoseLog {
  private readonly id: string;
  private readonly medicamentoId: string;
  private readonly horarioPrevisto: Date;
  private horarioReal?: Date | null;
  private state: DoseLogState;
  private readonly domainEvents: DomainEvent[] = [];

  private constructor(props: DoseLogProps) {
    this.id = props.id;
    this.medicamentoId = props.medicamentoId;
    this.horarioPrevisto = new Date(props.horarioPrevisto);
    this.horarioReal = props.horarioReal ? new Date(props.horarioReal) : null;
    this.state = this.criarEstadoInicial(props.status ?? "PENDENTE");
  }

  static criar(props: DoseLogProps): DoseLog {
    const id = props.id.trim();
    const medicamentoId = props.medicamentoId.trim();

    if (!id) {
      throw new Error("DoseLog requer identificador");
    }

    if (!medicamentoId) {
      throw new Error("DoseLog requer medicamento vinculado");
    }

    return new DoseLog({
      ...props,
      id,
      medicamentoId,
      horarioPrevisto: new Date(props.horarioPrevisto),
    });
  }

  confirmarTomada(agora: Date) {
    this.state = this.state.confirmarTomada(this, agora);
  }

  marcarAtrasado(agora: Date) {
    this.state = this.state.marcarAtrasado(this, agora);
  }

  reverterParaPendente() {
    this.state = this.state.reverterParaPendente(this);
  }

  get snapshot(): DoseLogSnapshot {
    return {
      id: this.id,
      medicamentoId: this.medicamentoId,
      horarioPrevisto: this.horarioPrevisto.toISOString(),
      status: this.state.getStatus(),
      horarioReal: this.horarioReal?.toISOString() ?? null,
    };
  }

  getStatus(): DoseStatus {
    return this.state.getStatus();
  }

  getHorarioPrevisto(): Date {
    return new Date(this.horarioPrevisto);
  }

  getId(): string {
    return this.id;
  }

  getMedicamentoId(): string {
    return this.medicamentoId;
  }

  registrarEvento(evento: DomainEvent) {
    this.domainEvents.push(evento);
  }

  pullDomainEvents(): DomainEvent[] {
    const eventos = [...this.domainEvents];
    this.domainEvents.length = 0;
    return eventos;
  }

  private criarEstadoInicial(status: DoseStatus): DoseLogState {
    switch (status) {
      case "PENDENTE":
        return new EstadoPendente();
      case "TOMADO":
        return new EstadoTomado();
      case "ATRASADO":
        return new EstadoAtrasado();
      default:
        return new EstadoPendente();
    }
  }

  atualizarHorarioReal(valor: Date | null) {
    this.horarioReal = valor ? new Date(valor) : null;
  }
}

interface DoseLogState {
  confirmarTomada(contexto: DoseLog, agora: Date): DoseLogState;
  marcarAtrasado(contexto: DoseLog, agora: Date): DoseLogState;
  reverterParaPendente(contexto: DoseLog): DoseLogState;
  getStatus(): DoseStatus;
}

class EstadoPendente implements DoseLogState {
  confirmarTomada(contexto: DoseLog, agora: Date): DoseLogState {
    const previsto = contexto.getHorarioPrevisto();

    if (agora.getTime() < previsto.getTime()) {
      throw new Error("Nao e possivel confirmar tomada antes do horario previsto");
    }

    contexto.atualizarHorarioReal(agora);
    contexto.registrarEvento(
      new DoseConfirmada({
        doseLogId: contexto.getId(),
        medicamentoId: contexto.getMedicamentoId(),
        confirmadoEm: agora,
      })
    );

    return new EstadoTomado();
  }

  marcarAtrasado(contexto: DoseLog, agora: Date): DoseLogState {
    const previsto = contexto.getHorarioPrevisto();

    if (agora.getTime() <= previsto.getTime()) {
      throw new Error("Dose so pode ser marcada como atrasada apos o horario previsto");
    }

    contexto.atualizarHorarioReal(agora);
    return new EstadoAtrasado();
  }

  reverterParaPendente(_contexto: DoseLog): DoseLogState {
    return this;
  }

  getStatus(): DoseStatus {
    return "PENDENTE";
  }
}

class EstadoTomado implements DoseLogState {
  confirmarTomada(_contexto: DoseLog, _agora: Date): DoseLogState {
    return this;
  }

  marcarAtrasado(_contexto: DoseLog, _agora: Date): DoseLogState {
    throw new Error("Nao e possivel marcar como atrasado uma dose tomada");
  }

  reverterParaPendente(contexto: DoseLog): DoseLogState {
    contexto.atualizarHorarioReal(null);
    return new EstadoPendente();
  }

  getStatus(): DoseStatus {
    return "TOMADO";
  }
}

class EstadoAtrasado implements DoseLogState {
  confirmarTomada(_contexto: DoseLog, _agora: Date): DoseLogState {
    throw new Error("Dose atrasada ja contem registro real");
  }

  marcarAtrasado(_contexto: DoseLog, _agora: Date): DoseLogState {
    return this;
  }

  reverterParaPendente(contexto: DoseLog): DoseLogState {
    contexto.atualizarHorarioReal(null);
    return new EstadoPendente();
  }

  getStatus(): DoseStatus {
    return "ATRASADO";
  }
}
