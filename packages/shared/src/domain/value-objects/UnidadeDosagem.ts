export type UnidadeDosagemTipo = "mg" | "ml" | "gotas" | "comprimidos" | "capsulas";

export class UnidadeDosagem {
  private static readonly allowed: Set<UnidadeDosagemTipo> = new Set([
    "mg",
    "ml",
    "gotas",
    "comprimidos",
    "capsulas",
  ]);

  private constructor(private readonly value: UnidadeDosagemTipo) {}

  static create(raw: string): UnidadeDosagem {
    const normalized = raw.trim().toLowerCase() as UnidadeDosagemTipo;

    if (!UnidadeDosagem.allowed.has(normalized)) {
      throw new Error("Unidade de dosagem nao suportada");
    }

    return new UnidadeDosagem(normalized);
  }

  getValue(): UnidadeDosagemTipo {
    return this.value;
  }
}
