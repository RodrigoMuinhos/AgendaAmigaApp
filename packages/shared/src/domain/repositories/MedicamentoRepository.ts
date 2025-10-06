import { Medicamento } from "../entities/Medicamento";

export interface MedicamentoRepository {
  salvar(medicamento: Medicamento): Promise<void>;
  obterPorId(id: string): Promise<Medicamento | null>;
  listarPorPaciente(pacienteId: string): Promise<Medicamento[]>;
  desativar(id: string): Promise<void>;
}
