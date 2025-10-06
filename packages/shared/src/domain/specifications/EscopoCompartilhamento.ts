export type TipoRecursoCompartilhado = "documento" | "medicamento" | "consulta" | "historico";

export class EscopoCompartilhamento {
  private readonly regras: Map<TipoRecursoCompartilhado, Set<string> | null>;

  private constructor(regras?: Map<TipoRecursoCompartilhado, Set<string> | null>) {
    this.regras = regras ? new Map(regras) : new Map();
  }

  static criarVazio(): EscopoCompartilhamento {
    return new EscopoCompartilhamento();
  }

  incluir(tipo: TipoRecursoCompartilhado, identificadores?: string[]): EscopoCompartilhamento {
    const atual = this.regras.get(tipo);

    if (!identificadores || identificadores.length === 0) {
      this.regras.set(tipo, null);
      return this;
    }

    const set = atual === null ? null : new Set(atual ? Array.from(atual) : []);

    if (set === null) {
      return this;
    }

    for (const id of identificadores) {
      const valor = id.trim();
      if (!valor) {
        throw new Error("Identificador invalido no escopo");
      }
      set.add(valor);
    }

    this.regras.set(tipo, set);
    return this;
  }

  abrange(tipo: TipoRecursoCompartilhado, identificador?: string): boolean {
    const regra = this.regras.get(tipo);

    if (regra === undefined) {
      return false;
    }

    if (regra === null) {
      return true;
    }

    if (!identificador) {
      return false;
    }

    return regra.has(identificador);
  }

  estaVazio(): boolean {
    return this.regras.size === 0;
  }

  snapshot(): Record<string, string[] | "*"> {
    const resultado: Record<string, string[] | "*"> = {};

    for (const [tipo, ids] of this.regras.entries()) {
      resultado[tipo] = ids === null ? "*" : Array.from(ids);
    }

    return resultado;
  }

  clonar(): EscopoCompartilhamento {
    const clone = new Map<TipoRecursoCompartilhado, Set<string> | null>();
    for (const [tipo, ids] of this.regras.entries()) {
      clone.set(tipo, ids === null ? null : new Set(ids));
    }
    return new EscopoCompartilhamento(clone);
  }
}
