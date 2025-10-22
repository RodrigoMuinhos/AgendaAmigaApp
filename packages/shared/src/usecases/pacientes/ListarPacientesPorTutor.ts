import { PacienteRepository } from "../../domain/repositories/PacienteRepository";

export class ListarPacientesPorTutor {
  constructor(private readonly pacienteRepository: PacienteRepository) {}

  async execute(tutorId: string) {
    return this.pacienteRepository.listarPorTutor(tutorId);
  }
}
