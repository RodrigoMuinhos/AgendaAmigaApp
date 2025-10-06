"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoseConfirmada = void 0;
class DoseConfirmada {
    constructor(payload) {
        this.name = "DoseConfirmada";
        this.doseLogId = payload.doseLogId;
        this.medicamentoId = payload.medicamentoId;
        this.occurredAt = new Date(payload.confirmadoEm);
    }
}
exports.DoseConfirmada = DoseConfirmada;
