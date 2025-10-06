import { Periodo } from "./Periodo";

export interface AdesaoProps {
  readonly valor: number;
  readonly periodo: Periodo;
  readonly casasDecimais?: number;
}

export class Adesao {
  private readonly valor: number;
  private readonly periodo: Periodo;
  private readonly casasDecimais: number;

  private constructor({ valor, periodo, casasDecimais }: { valor: number; periodo: Periodo; casasDecimais: number }) {
    this.valor = valor;
    this.periodo = periodo;
    this.casasDecimais = casasDecimais;
  }

  static create({ valor, periodo, casasDecimais = 4 }: AdesaoProps): Adesao {
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

  getValor(): number {
    return this.valor;
  }

  getPercentual(): number {
    return Math.round(this.valor * 10000) / 100;
  }

  getPeriodo(): Periodo {
    return this.periodo;
  }

  toJSON() {
    return {
      valor: this.valor,
      percentual: this.getPercentual(),
      periodo: this.periodo.toJSON(),
    } as const;
  }
}
