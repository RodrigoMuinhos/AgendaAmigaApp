"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenShare = void 0;
class TokenShare {
    constructor(value) {
        this.value = value;
    }
    static create(raw) {
        const normalized = raw.trim();
        if (!normalized) {
            throw new Error("TokenShare nao pode ser vazio");
        }
        if (normalized.length < 24) {
            throw new Error("TokenShare deve ter pelo menos 24 caracteres");
        }
        if (!/^[a-zA-Z0-9\-_]+$/.test(normalized)) {
            throw new Error("TokenShare contem caracteres invalidos");
        }
        return new TokenShare(normalized);
    }
    getValue() {
        return this.value;
    }
}
exports.TokenShare = TokenShare;
