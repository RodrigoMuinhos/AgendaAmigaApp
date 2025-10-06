"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Medicamento = void 0;
const EsquemaDeDoseAlterado_1 = require("../events/EsquemaDeDoseAlterado");
class Medicamento {
    constructor(props) {
        this.domainEvents = [];
        this.id = props.id;
        this.pacienteId = props.pacienteId;
        this.nome = props.nome;
        this.dosagem = props.dosagem;
        this.unidadeDosagem = props.unidadeDosagem;
        this.esquema = props.esquema ?? null;
        this.ativo = props.ativo ?? true;
    }
    static criar(props) {
        const id = props.id.trim();
        const pacienteId = props.pacienteId.trim();
        const nome = props.nome.trim();
        if (!id) {
            throw new Error("Medicamento requer identificador");
        }
        if (!pacienteId) {
            throw new Error("Medicamento deve estar vinculado a um paciente");
        }
        if (!nome) {
            throw new Error("Medicamento requer nome");
        }
        if (!Number.isFinite(props.dosagem) || props.dosagem <= 0) {
            throw new Error("Dosagem do medicamento deve ser positiva");
        }
        return new Medicamento({
            ...props,
            id,
            pacienteId,
            nome,
            dosagem: props.dosagem,
        });
    }
    definirEsquema(novoEsquema) {
        if (!this.ativo) {
            throw new Error("Nao e possivel atualizar esquema de medicamento inativo");
        }
        this.esquema = novoEsquema;
        this.domainEvents.push(new EsquemaDeDoseAlterado_1.EsquemaDeDoseAlterado({
            medicamentoId: this.id,
            alteradoEm: new Date(),
        }));
    }
    desativar() {
        this.ativo = false;
    }
    reativar() {
        this.ativo = true;
    }
    gerarProjecoesDeDose(periodo, clock) {
        if (!this.esquema) {
            return [];
        }
        return this.esquema.projetarInstancias(periodo, clock);
    }
    pullDomainEvents() {
        const eventos = [...this.domainEvents];
        this.domainEvents.length = 0;
        return eventos;
    }
    get snapshot() {
        return {
            id: this.id,
            pacienteId: this.pacienteId,
            nome: this.nome,
            dosagem: this.dosagem,
            unidadeDosagem: this.unidadeDosagem.getValue(),
            ativo: this.ativo,
            esquema: this.esquema ? { tipo: this.esquema.getTipo() } : null,
        };
    }
}
exports.Medicamento = Medicamento;
