"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListarPacientesPorTutor = void 0;
class ListarPacientesPorTutor {
    constructor(pacienteRepository) {
        this.pacienteRepository = pacienteRepository;
    }
    async execute({ tutorId }) {
        if (!tutorId.trim()) {
            throw new Error("TutorId obrigatorio");
        }
        const pacientes = await this.pacienteRepository.listarPorTutor(tutorId);
        return {
            pacientes: pacientes.map((paciente) => paciente.snapshot),
        };
    }
}
exports.ListarPacientesPorTutor = ListarPacientesPorTutor;
