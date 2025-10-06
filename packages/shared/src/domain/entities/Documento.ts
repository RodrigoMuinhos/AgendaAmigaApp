export type TipoDocumento = "laudo" | "exame" | "receita" | "outro";

export interface DocumentoProps {
  readonly id: string;
  readonly pacienteId: string;
  readonly tipo: TipoDocumento;
  readonly titulo: string;
  readonly compartilhaveis?: boolean;
}

export interface DocumentoSnapshot {
  readonly id: string;
  readonly pacienteId: string;
  readonly tipo: TipoDocumento;
  readonly titulo: string;
  readonly marcadoParaCompartilhamento: boolean;
}

export class Documento {
  private readonly id: string;
  private readonly pacienteId: string;
  private readonly tipo: TipoDocumento;
  private titulo: string;
  private compartilhamentoAtivo: boolean;

  private constructor(props: DocumentoProps) {
    this.id = props.id;
    this.pacienteId = props.pacienteId;
    this.tipo = props.tipo;
    this.titulo = props.titulo;
    this.compartilhamentoAtivo = props.compartilhaveis ?? false;
  }

  static criar(props: DocumentoProps): Documento {
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

  renomear(novoTitulo: string) {
    const titulo = novoTitulo.trim();
    if (!titulo) {
      throw new Error("Titulo de documento nao pode ser vazio");
    }
    this.titulo = titulo;
  }

  get snapshot(): DocumentoSnapshot {
    return {
      id: this.id,
      pacienteId: this.pacienteId,
      tipo: this.tipo,
      titulo: this.titulo,
      marcadoParaCompartilhamento: this.compartilhamentoAtivo,
    };
  }

  private static readonly tiposPermitidos = new Set<TipoDocumento>(["laudo", "exame", "receita", "outro"]);
}
