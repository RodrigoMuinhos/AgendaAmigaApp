"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Consulta = void 0;
class Consulta {
    constructor(props) {
        this.id = props.id;
        this.pacienteId = props.pacienteId;
        this.dataHora = new Date(props.dataHora);
        this.retroativa = props.retroativa ?? false;
        this.documentos = new Set(props.documentos ?? []);
    }
    static agendar(props, clock) {
        const id = props.id.trim();
        const pacienteId = props.pacienteId.trim();
        const dataHora = new Date(props.dataHora);
        if (!id) {
            throw new Error("Consulta requer identificador");
        }
        if (!pacienteId) {
            throw new Error("Consulta requer paciente");
        }
        Consulta.validarDataHora(dataHora, props.retroativa ?? false, clock);
        return new Consulta({ ...props, id, pacienteId, dataHora });
    }
    reagendar(novaDataHora, retroativa, clock) {
        const data = new Date(novaDataHora);
        Consulta.validarDataHora(data, retroativa, clock);
        this.dataHora = data;
        this.retroativa = retroativa;
    }
    anexarDocumento(documentoId) {
        const id = documentoId.trim();
        if (!id) {
            throw new Error("Documento invalido");
        }
        this.documentos.add(id);
    }
    get snapshot() {
        return {
            id: this.id,
            pacienteId: this.pacienteId,
            dataHora: this.dataHora.toISOString(),
            retroativa: this.retroativa,
            documentos: Array.from(this.documentos),
        };
    }
    static validarDataHora(data, retroativa, clock) {
        if (Number.isNaN(data.getTime())) {
            throw new Error("Data da consulta invalida");
        }
        if (!retroativa) {
            const agora = clock.nowUTC();
            if (data.getTime() < agora.getTime()) {
                throw new Error("Consulta futura nao pode ter data passada");
            }
        }
    }
}
exports.Consulta = Consulta;
