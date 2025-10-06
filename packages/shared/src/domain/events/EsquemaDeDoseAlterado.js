"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EsquemaDeDoseAlterado = void 0;
class EsquemaDeDoseAlterado {
    constructor(payload) {
        this.name = "EsquemaDeDoseAlterado";
        this.medicamentoId = payload.medicamentoId;
        this.occurredAt = new Date(payload.alteradoEm);
    }
}
exports.EsquemaDeDoseAlterado = EsquemaDeDoseAlterado;
