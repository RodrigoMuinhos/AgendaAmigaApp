import { Clock } from "../../domain/gateways/Clock";
import { DomainEvent } from "../../domain/events/DomainEvent";
import { DoseStatus } from "../../domain/entities/DoseLog";
import { DoseLogRepository } from "../../domain/repositories/DoseLogRepository";

export interface ConfirmarTomadaDoseInput {
  readonly doseLogId: string;
  readonly instante?: Date;
}

export interface ConfirmarTomadaDoseOutput {
  readonly status: DoseStatus;
  readonly eventos: DomainEvent[];
}

export class ConfirmarTomadaDose {
  constructor(private readonly doseLogRepository: DoseLogRepository, private readonly clock: Clock) {}

  async execute({ doseLogId, instante }: ConfirmarTomadaDoseInput): Promise<ConfirmarTomadaDoseOutput> {
    const id = doseLogId.trim();

    if (!id) {
      throw new Error("DoseLogId obrigatorio");
    }

    const doseLog = await this.doseLogRepository.obterPorId(id);

    if (!doseLog) {
      throw new Error("DoseLog nao encontrado");
    }

    const agora = instante ?? this.clock.nowUTC();

    doseLog.confirmarTomada(agora);

    await this.doseLogRepository.atualizarStatus(doseLog);

    const eventos = doseLog.pullDomainEvents();

    return {
      status: doseLog.getStatus(),
      eventos,
    };
  }
}
