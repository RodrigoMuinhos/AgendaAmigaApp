"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmarTomadaDose = void 0;
class ConfirmarTomadaDose {
    constructor(doseLogRepository, clock) {
        this.doseLogRepository = doseLogRepository;
        this.clock = clock;
    }
    async execute({ doseLogId, instante }) {
        const id = doseLogId.trim();
        if (!id) {
            throw new Error("DoseLogId obrigatorio");
        }
        const doseLog = await this.doseLogRepository.obterPorId(id);
        if (!doseLog) {
            throw new Error("DoseLog nao encontrado");
        }
        const agora = instante ?? this.clock.nowUTC();
        doseLog.confirmarTomada(agora);
        await this.doseLogRepository.atualizarStatus(doseLog);
        const eventos = doseLog.pullDomainEvents();
        return {
            status: doseLog.getStatus(),
            eventos,
        };
    }
}
exports.ConfirmarTomadaDose = ConfirmarTomadaDose;
