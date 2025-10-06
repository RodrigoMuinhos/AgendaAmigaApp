import { AlterarEsquemaDose, Clock, ConfirmarTomadaDose, GerarShareLink, ListarPacientesPorTutor } from "@agenda-amiga/shared";

import { PostgresDoseLogRepository } from "./infra/repositories/PostgresDoseLogRepository";
import { PostgresMedicamentoRepository } from "./infra/repositories/PostgresMedicamentoRepository";
import { PostgresPacienteRepository } from "./infra/repositories/PostgresPacienteRepository";
import { PostgresShareLinkRepository } from "./infra/repositories/PostgresShareLinkRepository";

class SystemClock implements Clock {
  nowUTC(): Date {
    return new Date();
  }

  todayAt(timezone: string, hours: number, minutes: number): Date {
    const reference = this.nowUTC();
    return this.at(timezone, reference, hours, minutes);
  }

  at(_timezone: string, date: Date, hours: number, minutes: number): Date {
    const reference = new Date(date);
    reference.setUTCHours(hours, minutes, 0, 0);
    return reference;
  }
}

const clock = new SystemClock();
const pacienteRepository = new PostgresPacienteRepository();
const medicamentoRepository = new PostgresMedicamentoRepository();
const doseLogRepository = new PostgresDoseLogRepository();
const shareLinkRepository = new PostgresShareLinkRepository();

const listarPacientesPorTutor = new ListarPacientesPorTutor(pacienteRepository);
const confirmarTomadaDose = new ConfirmarTomadaDose(doseLogRepository, clock);
const alterarEsquemaDose = new AlterarEsquemaDose(medicamentoRepository, clock);
const gerarShareLink = new GerarShareLink(shareLinkRepository, clock);

export const container = {
  clock,
  repositories: {
    paciente: pacienteRepository,
    medicamento: medicamentoRepository,
    doseLog: doseLogRepository,
    shareLink: shareLinkRepository,
  },
  usecases: {
    listarPacientesPorTutor,
    confirmarTomadaDose,
    alterarEsquemaDose,
    gerarShareLink,
  },
};
