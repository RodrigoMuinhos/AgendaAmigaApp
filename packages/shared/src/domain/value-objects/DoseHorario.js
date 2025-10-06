"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoseHorario = void 0;
class DoseHorario {
    constructor(hours, minutes) {
        this.hours = hours;
        this.minutes = minutes;
        this.value = `${DoseHorario.pad(hours)}:${DoseHorario.pad(minutes)}`;
    }
    static create(raw) {
        const normalized = raw.trim();
        if (!/^\d{2}:\d{2}$/.test(normalized)) {
            throw new Error("DoseHorario deve estar no formato hh:mm");
        }
        const [hoursStr, minutesStr] = normalized.split(":");
        const hours = Number.parseInt(hoursStr, 10);
        const minutes = Number.parseInt(minutesStr, 10);
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            throw new Error("DoseHorario invalido");
        }
        return new DoseHorario(hours, minutes);
    }
    getHours() {
        return this.hours;
    }
    getMinutes() {
        return this.minutes;
    }
    toString() {
        return this.value;
    }
    static pad(value) {
        return value.toString().padStart(2, "0");
    }
}
exports.DoseHorario = DoseHorario;
