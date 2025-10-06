"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscopoCompartilhamento = void 0;
class EscopoCompartilhamento {
    constructor(regras) {
        this.regras = regras ? new Map(regras) : new Map();
    }
    static criarVazio() {
        return new EscopoCompartilhamento();
    }
    incluir(tipo, identificadores) {
        const atual = this.regras.get(tipo);
        if (!identificadores || identificadores.length === 0) {
            this.regras.set(tipo, null);
            return this;
        }
        const set = atual === null ? null : new Set(atual ? Array.from(atual) : []);
        if (set === null) {
            return this;
        }
        for (const id of identificadores) {
            const valor = id.trim();
            if (!valor) {
                throw new Error("Identificador invalido no escopo");
            }
            set.add(valor);
        }
        this.regras.set(tipo, set);
        return this;
    }
    abrange(tipo, identificador) {
        const regra = this.regras.get(tipo);
        if (regra === undefined) {
            return false;
        }
        if (regra === null) {
            return true;
        }
        if (!identificador) {
            return false;
        }
        return regra.has(identificador);
    }
    estaVazio() {
        return this.regras.size === 0;
    }
    snapshot() {
        const resultado = {};
        for (const [tipo, ids] of this.regras.entries()) {
            resultado[tipo] = ids === null ? "*" : Array.from(ids);
        }
        return resultado;
    }
    clonar() {
        const clone = new Map();
        for (const [tipo, ids] of this.regras.entries()) {
            clone.set(tipo, ids === null ? null : new Set(ids));
        }
        return new EscopoCompartilhamento(clone);
    }
}
exports.EscopoCompartilhamento = EscopoCompartilhamento;
