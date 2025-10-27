import { PacienteSnapshot } from "../../domain/aggregates/Paciente";
import { PacienteRepository } from "../../domain/repositories/PacienteRepository";

export interface ListarPacientesInput {
  tutorId: string;
}

export interface ListarPacientesOutput {
  pacientes: PacienteSnapshot[];
}

export class ListarPacientes {
  constructor(private readonly pacienteRepository: PacienteRepository) {}

  async execute({ tutorId }: ListarPacientesInput): Promise<ListarPacientesOutput> {
    if (!tutorId.trim()) {
      throw new Error("TutorId obrigatorio");
    }

    const pacientes = await this.pacienteRepository.listarPorTutor(tutorId);

    return {
      pacientes: pacientes.map((paciente) => paciente.snapshot),
    };
  }
}
