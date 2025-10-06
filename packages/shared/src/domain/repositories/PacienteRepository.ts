import { Paciente } from "../aggregates/Paciente";

export interface PacienteRepository {
  salvar(paciente: Paciente): Promise<void>;
  listarPorTutor(tutorId: string): Promise<Paciente[]>;
  obterPorIdDoTutor(tutorId: string, pacienteId: string): Promise<Paciente | null>;
}
