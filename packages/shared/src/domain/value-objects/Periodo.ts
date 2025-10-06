export interface PeriodoProps {
  readonly inicio?: Date | null;
  readonly fim?: Date | null;
}

export class Periodo {
  private readonly inicio?: Date;
  private readonly fim?: Date;

  private constructor({ inicio, fim }: { inicio?: Date; fim?: Date }) {
    this.inicio = inicio ? new Date(inicio) : undefined;
    this.fim = fim ? new Date(fim) : undefined;
  }

  static create({ inicio, fim }: PeriodoProps): Periodo {
    if (inicio && fim && inicio.getTime() > fim.getTime()) {
      throw new Error("Periodo invalido: inicio deve ser anterior ou igual ao fim");
    }

    return new Periodo({ inicio: inicio ?? undefined, fim: fim ?? undefined });
  }

  getInicio(): Date | undefined {
    return this.inicio ? new Date(this.inicio) : undefined;
  }

  getFim(): Date | undefined {
    return this.fim ? new Date(this.fim) : undefined;
  }

  contem(data: Date): boolean {
    const alvo = data.getTime();

    if (this.inicio && alvo < this.inicio.getTime()) {
      return false;
    }

    if (this.fim && alvo > this.fim.getTime()) {
      return false;
    }

    return true;
  }

  toJSON(): { inicio: string | null; fim: string | null } {
    return {
      inicio: this.inicio?.toISOString() ?? null,
      fim: this.fim?.toISOString() ?? null,
    };
  }
}
