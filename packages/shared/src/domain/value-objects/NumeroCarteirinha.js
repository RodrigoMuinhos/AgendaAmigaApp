"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumeroCarteirinha = void 0;
class NumeroCarteirinha {
    constructor(raw) {
        this.value = raw;
    }
    static create(raw) {
        const normalized = raw.trim();
        if (!normalized) {
            throw new Error("NumeroCarteirinha nao pode ser vazio");
        }
        if (normalized.length > 40) {
            throw new Error("NumeroCarteirinha excede comprimento maximo");
        }
        return new NumeroCarteirinha(normalized);
    }
    getValue() {
        return this.value;
    }
}
exports.NumeroCarteirinha = NumeroCarteirinha;
