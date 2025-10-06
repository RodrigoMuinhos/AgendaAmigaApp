import { DomainEvent } from "./DomainEvent";

export interface EsquemaDeDoseAlteradoPayload {
  readonly medicamentoId: string;
  readonly alteradoEm: Date;
}

export class EsquemaDeDoseAlterado implements DomainEvent {
  readonly name = "EsquemaDeDoseAlterado";
  readonly occurredAt: Date;
  readonly medicamentoId: string;

  constructor(payload: EsquemaDeDoseAlteradoPayload) {
    this.medicamentoId = payload.medicamentoId;
    this.occurredAt = new Date(payload.alteradoEm);
  }
}
