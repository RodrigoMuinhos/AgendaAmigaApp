import { PacienteSnapshot } from "../../domain/aggregates/Paciente";
import { PacienteRepository } from "../../domain/repositories/PacienteRepository";

export interface ListarPacientesPorTutorInput {
  tutorId: string;
}

export interface ListarPacientesPorTutorOutput {
  pacientes: PacienteSnapshot[];
}

export class ListarPacientesPorTutor {
  constructor(private readonly pacienteRepository: PacienteRepository) {}

  async execute({ tutorId }: ListarPacientesPorTutorInput): Promise<ListarPacientesPorTutorOutput> {
    if (!tutorId.trim()) {
      throw new Error("TutorId obrigatorio");
    }

    const pacientes = await this.pacienteRepository.listarPorTutor(tutorId);

    return {
      pacientes: pacientes.map((paciente) => paciente.snapshot),
    };
  }
}
