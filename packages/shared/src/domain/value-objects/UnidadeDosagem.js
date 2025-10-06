"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnidadeDosagem = void 0;
class UnidadeDosagem {
    constructor(value) {
        this.value = value;
    }
    static create(raw) {
        const normalized = raw.trim().toLowerCase();
        if (!UnidadeDosagem.allowed.has(normalized)) {
            throw new Error("Unidade de dosagem nao suportada");
        }
        return new UnidadeDosagem(normalized);
    }
    getValue() {
        return this.value;
    }
}
exports.UnidadeDosagem = UnidadeDosagem;
UnidadeDosagem.allowed = new Set([
    "mg",
    "ml",
    "gotas",
    "comprimidos",
    "capsulas",
]);
