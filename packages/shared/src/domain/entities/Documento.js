"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Documento = void 0;
class Documento {
    constructor(props) {
        this.id = props.id;
        this.pacienteId = props.pacienteId;
        this.tipo = props.tipo;
        this.titulo = props.titulo;
        this.compartilhamentoAtivo = props.compartilhaveis ?? false;
    }
    static criar(props) {
        const id = props.id.trim();
        const pacienteId = props.pacienteId.trim();
        const titulo = props.titulo.trim();
        if (!id) {
            throw new Error("Documento requer identificador");
        }
        if (!pacienteId) {
            throw new Error("Documento requer paciente");
        }
        if (!titulo) {
            throw new Error("Documento requer titulo");
        }
        if (!Documento.tiposPermitidos.has(props.tipo)) {
            throw new Error("Tipo de documento invalido");
        }
        return new Documento({ ...props, id, pacienteId, titulo });
    }
    marcarParaCompartilhamento() {
        this.compartilhamentoAtivo = true;
    }
    desmarcarCompartilhamento() {
        this.compartilhamentoAtivo = false;
    }
    renomear(novoTitulo) {
        const titulo = novoTitulo.trim();
        if (!titulo) {
            throw new Error("Titulo de documento nao pode ser vazio");
        }
        this.titulo = titulo;
    }
    get snapshot() {
        return {
            id: this.id,
            pacienteId: this.pacienteId,
            tipo: this.tipo,
            titulo: this.titulo,
            marcadoParaCompartilhamento: this.compartilhamentoAtivo,
        };
    }
}
exports.Documento = Documento;
Documento.tiposPermitidos = new Set(["laudo", "exame", "receita", "outro"]);
