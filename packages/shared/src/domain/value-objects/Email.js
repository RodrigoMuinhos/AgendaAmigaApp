"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = void 0;
class Email {
    constructor(value) {
        this.value = value;
    }
    static create(raw) {
        const normalized = raw.trim().toLowerCase();
        if (!normalized) {
            throw new Error("Email nao pode ser vazio");
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalized)) {
            throw new Error("Email invalido");
        }
        if (normalized.length > 180) {
            throw new Error("Email excede limite de 180 caracteres");
        }
        return new Email(normalized);
    }
    getValue() {
        return this.value;
    }
}
exports.Email = Email;
