import { Clock } from "../gateways/Clock";
import { Periodo } from "../value-objects/Periodo";
import { DoseHorario } from "../value-objects/DoseHorario";

export interface DoseProjecao {
  readonly horarioPrevisto: Date;
}

export type TipoRecorrencia = "DIARIO_HORARIOS_FIXOS" | "SEMANAL_DIAS_FIXOS";

export interface EsquemaDoseProps {
  readonly horarios: DoseHorario[];
  readonly timezone: string;
  readonly periodo?: Periodo | null;
}

export abstract class EsquemaDose {
  protected readonly horarios: DoseHorario[];
  protected readonly timezone: string;
  protected readonly periodo?: Periodo;

  protected constructor(props: EsquemaDoseProps) {
    if (!props.horarios.length) {
      throw new Error("EsquemaDose requer ao menos um horario");
    }

    this.horarios = [...props.horarios];
    this.timezone = props.timezone;
    this.periodo = props.periodo ?? undefined;
  }

  abstract getTipo(): TipoRecorrencia;

  abstract projetarInstancias(periodo: Periodo, clock: Clock): DoseProjecao[];

  protected obterPeriodoEfetivo(periodo: Periodo): { inicio: Date; fim: Date } {
    const inicioPeriodo = periodo.getInicio();
    const fimPeriodo = periodo.getFim();

    if (!inicioPeriodo || !fimPeriodo) {
      throw new Error("Periodo de projecao precisa de inicio e fim definidos");
    }

    let inicio = new Date(inicioPeriodo);
    let fim = new Date(fimPeriodo);

    if (this.periodo?.getInicio()) {
      const vigenciaInicio = this.periodo.getInicio()!;
      if (vigenciaInicio.getTime() > inicio.getTime()) {
        inicio = vigenciaInicio;
      }
    }

    if (this.periodo?.getFim()) {
      const vigenciaFim = this.periodo.getFim()!;
      if (vigenciaFim.getTime() < fim.getTime()) {
        fim = vigenciaFim;
      }
    }

    if (inicio.getTime() > fim.getTime()) {
      throw new Error("Periodo de projecao nao intersecta com a vigencia do esquema");
    }

    return { inicio, fim };
  }
}

export interface EsquemaDoseDiarioProps extends EsquemaDoseProps {}

export class EsquemaDoseDiario extends EsquemaDose {
  constructor(props: EsquemaDoseDiarioProps) {
    super(props);
  }

  getTipo(): TipoRecorrencia {
    return "DIARIO_HORARIOS_FIXOS";
  }

  projetarInstancias(periodo: Periodo, clock: Clock): DoseProjecao[] {
    const { inicio, fim } = this.obterPeriodoEfetivo(periodo);
    const resultados: DoseProjecao[] = [];
    const cursor = inicioUTCDoDia(inicio);

    while (cursor.getTime() <= fim.getTime()) {
      for (const horario of this.horarios) {
        const previsto = clock.at(this.timezone, cursor, horario.getHours(), horario.getMinutes());
        if (previsto.getTime() < inicio.getTime() || previsto.getTime() > fim.getTime()) {
          continue;
        }
        resultados.push({ horarioPrevisto: previsto });
      }
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return resultados.sort((a, b) => a.horarioPrevisto.getTime() - b.horarioPrevisto.getTime());
  }
}

export interface EsquemaDoseSemanalProps extends EsquemaDoseProps {
  readonly diasDaSemana: number[]; // 0 (domingo) a 6 (sabado)
}

export class EsquemaDoseSemanal extends EsquemaDose {
  private readonly diasDaSemana: Set<number>;

  constructor(props: EsquemaDoseSemanalProps) {
    super(props);

    if (!props.diasDaSemana.length) {
      throw new Error("Esquema semanal requer ao menos um dia da semana");
    }

    for (const dia of props.diasDaSemana) {
      if (dia < 0 || dia > 6) {
        throw new Error("Dia da semana invalido em esquema");
      }
    }

    this.diasDaSemana = new Set(props.diasDaSemana);
  }

  getTipo(): TipoRecorrencia {
    return "SEMANAL_DIAS_FIXOS";
  }

  projetarInstancias(periodo: Periodo, clock: Clock): DoseProjecao[] {
    const { inicio, fim } = this.obterPeriodoEfetivo(periodo);
    const resultados: DoseProjecao[] = [];
    const cursor = inicioUTCDoDia(inicio);

    while (cursor.getTime() <= fim.getTime()) {
      const diaSemana = cursor.getUTCDay();
      if (this.diasDaSemana.has(diaSemana)) {
        for (const horario of this.horarios) {
          const previsto = clock.at(this.timezone, cursor, horario.getHours(), horario.getMinutes());
          if (previsto.getTime() < inicio.getTime() || previsto.getTime() > fim.getTime()) {
            continue;
          }
          resultados.push({ horarioPrevisto: previsto });
        }
      }
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return resultados.sort((a, b) => a.horarioPrevisto.getTime() - b.horarioPrevisto.getTime());
  }
}

function inicioUTCDoDia(data: Date): Date {
  return new Date(Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate()));
}
