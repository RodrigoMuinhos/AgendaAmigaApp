import { Consulta } from "../entities/Consulta";
import { Periodo } from "../value-objects/Periodo";

export interface ConsultaRepository {
  salvar(consulta: Consulta): Promise<void>;
  listarPorPacienteEPeriodo(pacienteId: string, periodo: Periodo): Promise<Consulta[]>;
}
