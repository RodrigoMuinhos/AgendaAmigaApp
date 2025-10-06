import { DomainEvent } from "./DomainEvent";

export interface DoseConfirmadaPayload {
  readonly doseLogId: string;
  readonly medicamentoId: string;
  readonly confirmadoEm: Date;
}

export class DoseConfirmada implements DomainEvent {
  readonly name = "DoseConfirmada";
  readonly occurredAt: Date;
  readonly doseLogId: string;
  readonly medicamentoId: string;

  constructor(payload: DoseConfirmadaPayload) {
    this.doseLogId = payload.doseLogId;
    this.medicamentoId = payload.medicamentoId;
    this.occurredAt = new Date(payload.confirmadoEm);
  }
}
