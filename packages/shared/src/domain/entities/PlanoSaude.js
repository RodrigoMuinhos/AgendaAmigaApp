"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanoSaude = void 0;
class PlanoSaude {
    constructor(props) {
        this.operadora = props.operadora;
        this.numeroCarteirinha = props.numeroCarteirinha;
        this.validade = props.validade ?? null;
        this.arquivado = props.arquivado ?? false;
    }
    static criar(props) {
        const operadora = props.operadora.trim();
        if (!operadora) {
            throw new Error("Plano de saude requer nome da operadora");
        }
        if (operadora.length > 120) {
            throw new Error("Nome da operadora excede limite de 120 caracteres");
        }
        if (props.validade && !props.arquivado) {
            const hoje = new Date();
            const validade = props.validade;
            if (validade.getTime() < hoje.getTime()) {
                throw new Error("Validade do plano nao pode estar vencida para planos ativos");
            }
        }
        return new PlanoSaude({ ...props, operadora });
    }
    estaValido(em) {
        if (this.arquivado) {
            return false;
        }
        if (!this.validade) {
            return true;
        }
        return this.validade.getTime() >= em.getTime();
    }
    arquivar() {
        this.arquivado = true;
    }
    get snapshot() {
        return {
            operadora: this.operadora,
            numeroCarteirinha: this.numeroCarteirinha.getValue(),
            validade: this.validade?.toISOString() ?? null,
            arquivado: this.arquivado,
        };
    }
}
exports.PlanoSaude = PlanoSaude;
