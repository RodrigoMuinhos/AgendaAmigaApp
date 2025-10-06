"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SenhaHash = void 0;
class SenhaHash {
    constructor(value) {
        this.value = value;
    }
    static create(raw) {
        const normalized = raw.trim();
        if (!normalized) {
            throw new Error("SenhaHash nao pode ser vazio");
        }
        if (normalized.length < 30) {
            throw new Error("SenhaHash parece invalida (curta demais)");
        }
        return new SenhaHash(normalized);
    }
    getValue() {
        return this.value;
    }
}
exports.SenhaHash = SenhaHash;
