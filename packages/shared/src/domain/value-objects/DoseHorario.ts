export class DoseHorario {
  private readonly value: string;
  private readonly hours: number;
  private readonly minutes: number;

  private constructor(hours: number, minutes: number) {
    this.hours = hours;
    this.minutes = minutes;
    this.value = `${DoseHorario.pad(hours)}:${DoseHorario.pad(minutes)}`;
  }

  static create(raw: string): DoseHorario {
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

  getHours(): number {
    return this.hours;
  }

  getMinutes(): number {
    return this.minutes;
  }

  toString(): string {
    return this.value;
  }

  private static pad(value: number): string {
    return value.toString().padStart(2, "0");
  }
}
