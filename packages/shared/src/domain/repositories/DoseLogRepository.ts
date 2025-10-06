import { DoseLog } from "../entities/DoseLog";
import { Periodo } from "../value-objects/Periodo";

export interface DoseLogRepository {
  salvarEmLote(doseLogs: DoseLog[]): Promise<void>;
  listarPorMedicamentoEPeriodo(medicamentoId: string, periodo: Periodo): Promise<DoseLog[]>;
  obterPorId(id: string): Promise<DoseLog | null>;
  atualizarStatus(doseLog: DoseLog): Promise<void>;
}
