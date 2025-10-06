"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EsquemaDoseSemanal = exports.EsquemaDoseDiario = exports.EsquemaDose = void 0;
class EsquemaDose {
    constructor(props) {
        if (!props.horarios.length) {
            throw new Error("EsquemaDose requer ao menos um horario");
        }
        this.horarios = [...props.horarios];
        this.timezone = props.timezone;
        this.periodo = props.periodo ?? undefined;
    }
    obterPeriodoEfetivo(periodo) {
        const inicioPeriodo = periodo.getInicio();
        const fimPeriodo = periodo.getFim();
        if (!inicioPeriodo || !fimPeriodo) {
            throw new Error("Periodo de projecao precisa de inicio e fim definidos");
        }
        let inicio = new Date(inicioPeriodo);
        let fim = new Date(fimPeriodo);
        if (this.periodo?.getInicio()) {
            const vigenciaInicio = this.periodo.getInicio();
            if (vigenciaInicio.getTime() > inicio.getTime()) {
                inicio = vigenciaInicio;
            }
        }
        if (this.periodo?.getFim()) {
            const vigenciaFim = this.periodo.getFim();
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
exports.EsquemaDose = EsquemaDose;
class EsquemaDoseDiario extends EsquemaDose {
    constructor(props) {
        super(props);
    }
    getTipo() {
        return "DIARIO_HORARIOS_FIXOS";
    }
    projetarInstancias(periodo, clock) {
        const { inicio, fim } = this.obterPeriodoEfetivo(periodo);
        const resultados = [];
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
exports.EsquemaDoseDiario = EsquemaDoseDiario;
class EsquemaDoseSemanal extends EsquemaDose {
    constructor(props) {
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
    getTipo() {
        return "SEMANAL_DIAS_FIXOS";
    }
    projetarInstancias(periodo, clock) {
        const { inicio, fim } = this.obterPeriodoEfetivo(periodo);
        const resultados = [];
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
exports.EsquemaDoseSemanal = EsquemaDoseSemanal;
function inicioUTCDoDia(data) {
    return new Date(Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate()));
}
