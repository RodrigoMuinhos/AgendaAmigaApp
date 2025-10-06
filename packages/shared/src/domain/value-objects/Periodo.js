"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Periodo = void 0;
class Periodo {
    constructor({ inicio, fim }) {
        this.inicio = inicio ? new Date(inicio) : undefined;
        this.fim = fim ? new Date(fim) : undefined;
    }
    static create({ inicio, fim }) {
        if (inicio && fim && inicio.getTime() > fim.getTime()) {
            throw new Error("Periodo invalido: inicio deve ser anterior ou igual ao fim");
        }
        return new Periodo({ inicio: inicio ?? undefined, fim: fim ?? undefined });
    }
    getInicio() {
        return this.inicio ? new Date(this.inicio) : undefined;
    }
    getFim() {
        return this.fim ? new Date(this.fim) : undefined;
    }
    contem(data) {
        const alvo = data.getTime();
        if (this.inicio && alvo < this.inicio.getTime()) {
            return false;
        }
        if (this.fim && alvo > this.fim.getTime()) {
            return false;
        }
        return true;
    }
    toJSON() {
        return {
            inicio: this.inicio?.toISOString() ?? null,
            fim: this.fim?.toISOString() ?? null,
        };
    }
}
exports.Periodo = Periodo;
