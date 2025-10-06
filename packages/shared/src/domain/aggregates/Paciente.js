"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Paciente = void 0;
class Paciente {
    constructor(props) {
        this.id = props.id;
        this.tutorId = props.tutorId;
        this.nomeCompleto = props.nomeCompleto;
        this.condicoes = props.condicoes ?? [];
        this.alergias = props.alergias ?? [];
        this.planoSaude = props.planoSaude ?? null;
    }
    static criar(props) {
        const id = props.id.trim();
        const tutorId = props.tutorId.trim();
        const nome = props.nomeCompleto.trim();
        if (!id) {
            throw new Error("Paciente requer identificador");
        }
        if (!tutorId) {
            throw new Error("Paciente requer tutorId");
        }
        if (!nome) {
            throw new Error("Nome do paciente nao pode ser vazio");
        }
        const condicoes = (props.condicoes ?? []).map((item) => Paciente.validarTextoCurto(item));
        const alergias = (props.alergias ?? []).map((item) => Paciente.validarTextoCurto(item));
        return new Paciente({
            ...props,
            id,
            tutorId,
            nomeCompleto: nome,
            condicoes,
            alergias,
        });
    }
    atualizarPerfil(input) {
        const nome = input.nomeCompleto.trim();
        if (!nome) {
            throw new Error("Nome do paciente nao pode ser vazio");
        }
        this.nomeCompleto = nome;
        this.condicoes = (input.condicoes ?? []).map((item) => Paciente.validarTextoCurto(item));
        this.alergias = (input.alergias ?? []).map((item) => Paciente.validarTextoCurto(item));
    }
    vincularPlanoSaude(plano) {
        this.planoSaude = plano;
    }
    get snapshot() {
        return {
            id: this.id,
            tutorId: this.tutorId,
            nomeCompleto: this.nomeCompleto,
            condicoes: [...this.condicoes],
            alergias: [...this.alergias],
            planoSaude: this.planoSaude?.snapshot ?? null,
        };
    }
    static validarTextoCurto(valor) {
        const texto = valor.trim();
        if (texto.length > 180) {
            throw new Error("Texto excede limite de 180 caracteres");
        }
        return texto;
    }
}
exports.Paciente = Paciente;
