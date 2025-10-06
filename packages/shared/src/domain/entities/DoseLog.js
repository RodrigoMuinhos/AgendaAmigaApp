"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoseLog = void 0;
const DoseConfirmada_1 = require("../events/DoseConfirmada");
class DoseLog {
    constructor(props) {
        this.domainEvents = [];
        this.id = props.id;
        this.medicamentoId = props.medicamentoId;
        this.horarioPrevisto = new Date(props.horarioPrevisto);
        this.horarioReal = props.horarioReal ? new Date(props.horarioReal) : null;
        this.state = this.criarEstadoInicial(props.status ?? "PENDENTE");
    }
    static criar(props) {
        const id = props.id.trim();
        const medicamentoId = props.medicamentoId.trim();
        if (!id) {
            throw new Error("DoseLog requer identificador");
        }
        if (!medicamentoId) {
            throw new Error("DoseLog requer medicamento vinculado");
        }
        return new DoseLog({
            ...props,
            id,
            medicamentoId,
            horarioPrevisto: new Date(props.horarioPrevisto),
        });
    }
    confirmarTomada(agora) {
        this.state = this.state.confirmarTomada(this, agora);
    }
    marcarAtrasado(agora) {
        this.state = this.state.marcarAtrasado(this, agora);
    }
    reverterParaPendente() {
        this.state = this.state.reverterParaPendente(this);
    }
    get snapshot() {
        return {
            id: this.id,
            medicamentoId: this.medicamentoId,
            horarioPrevisto: this.horarioPrevisto.toISOString(),
            status: this.state.getStatus(),
            horarioReal: this.horarioReal?.toISOString() ?? null,
        };
    }
    getStatus() {
        return this.state.getStatus();
    }
    getHorarioPrevisto() {
        return new Date(this.horarioPrevisto);
    }
    getId() {
        return this.id;
    }
    getMedicamentoId() {
        return this.medicamentoId;
    }
    registrarEvento(evento) {
        this.domainEvents.push(evento);
    }
    pullDomainEvents() {
        const eventos = [...this.domainEvents];
        this.domainEvents.length = 0;
        return eventos;
    }
    criarEstadoInicial(status) {
        switch (status) {
            case "PENDENTE":
                return new EstadoPendente();
            case "TOMADO":
                return new EstadoTomado();
            case "ATRASADO":
                return new EstadoAtrasado();
            default:
                return new EstadoPendente();
        }
    }
    atualizarHorarioReal(valor) {
        this.horarioReal = valor ? new Date(valor) : null;
    }
}
exports.DoseLog = DoseLog;
class EstadoPendente {
    confirmarTomada(contexto, agora) {
        const previsto = contexto.getHorarioPrevisto();
        if (agora.getTime() < previsto.getTime()) {
            throw new Error("Nao e possivel confirmar tomada antes do horario previsto");
        }
        contexto.atualizarHorarioReal(agora);
        contexto.registrarEvento(new DoseConfirmada_1.DoseConfirmada({
            doseLogId: contexto.getId(),
            medicamentoId: contexto.getMedicamentoId(),
            confirmadoEm: agora,
        }));
        return new EstadoTomado();
    }
    marcarAtrasado(contexto, agora) {
        const previsto = contexto.getHorarioPrevisto();
        if (agora.getTime() <= previsto.getTime()) {
            throw new Error("Dose so pode ser marcada como atrasada apos o horario previsto");
        }
        contexto.atualizarHorarioReal(agora);
        return new EstadoAtrasado();
    }
    reverterParaPendente(_contexto) {
        return this;
    }
    getStatus() {
        return "PENDENTE";
    }
}
class EstadoTomado {
    confirmarTomada(_contexto, _agora) {
        return this;
    }
    marcarAtrasado(_contexto, _agora) {
        throw new Error("Nao e possivel marcar como atrasado uma dose tomada");
    }
    reverterParaPendente(contexto) {
        contexto.atualizarHorarioReal(null);
        return new EstadoPendente();
    }
    getStatus() {
        return "TOMADO";
    }
}
class EstadoAtrasado {
    confirmarTomada(_contexto, _agora) {
        throw new Error("Dose atrasada ja contem registro real");
    }
    marcarAtrasado(_contexto, _agora) {
        return this;
    }
    reverterParaPendente(contexto) {
        contexto.atualizarHorarioReal(null);
        return new EstadoPendente();
    }
    getStatus() {
        return "ATRASADO";
    }
}
