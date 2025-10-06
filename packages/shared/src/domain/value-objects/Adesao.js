"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Adesao = void 0;
class Adesao {
    constructor({ valor, periodo, casasDecimais }) {
        this.valor = valor;
        this.periodo = periodo;
        this.casasDecimais = casasDecimais;
    }
    static create({ valor, periodo, casasDecimais = 4 }) {
        if (Number.isNaN(valor) || !Number.isFinite(valor)) {
            throw new Error("Adesao invalida");
        }
        if (valor < 0 || valor > 1) {
            throw new Error("Adesao precisa estar entre 0 e 1");
        }
        const precision = Math.max(0, Math.min(6, Math.trunc(casasDecimais)));
        const arredondado = Number.parseFloat(valor.toFixed(precision));
        return new Adesao({ valor: arredondado, periodo, casasDecimais: precision });
    }
    getValor() {
        return this.valor;
    }
    getPercentual() {
        return Math.round(this.valor * 10000) / 100;
    }
    getPeriodo() {
        return this.periodo;
    }
    toJSON() {
        return {
            valor: this.valor,
            percentual: this.getPercentual(),
            periodo: this.periodo.toJSON(),
        };
    }
}
exports.Adesao = Adesao;
