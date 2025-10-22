export const SHARED_READY = true;

export type Id = string;

export function assert(condition: unknown, message = "Assertion failed"): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export { ListarPacientesPorTutor } from "./usecases/pacientes/ListarPacientesPorTutor";
export { ConfirmarTomadaDose } from "./application/doses/ConfirmarTomadaDose";
export { AlterarEsquemaDose } from "./application/medicamentos/AlterarEsquemaDose";
export { GerarShareLink } from "./application/share-links/GerarShareLink";

export type { Clock } from "./domain/gateways/Clock";
export type { PacienteRepository } from "./domain/repositories/PacienteRepository";
export type { MedicamentoRepository } from "./domain/repositories/MedicamentoRepository";
export type { DoseLogRepository } from "./domain/repositories/DoseLogRepository";
export type { ShareLinkRepository } from "./domain/repositories/ShareLinkRepository";

export * from "./domain/aggregates/Paciente";
export * from "./domain/aggregates/ShareLink";
export * from "./domain/entities/DoseLog";
export * from "./domain/entities/Medicamento";
export * from "./domain/entities/PlanoSaude";
export * from "./domain/entities/EsquemaDose";
export * from "./domain/value-objects/DoseHorario";
export * from "./domain/value-objects/NumeroCarteirinha";
export * from "./domain/value-objects/Periodo";
export * from "./domain/value-objects/TokenShare";
export * from "./domain/value-objects/UnidadeDosagem";
export * from "./domain/specifications/EscopoCompartilhamento";
