export class SenhaHash {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(raw: string): SenhaHash {
    const normalized = raw.trim();

    if (!normalized) {
      throw new Error("SenhaHash nao pode ser vazio");
    }

    if (normalized.length < 30) {
      throw new Error("SenhaHash parece invalida (curta demais)");
    }

    return new SenhaHash(normalized);
  }

  getValue(): string {
    return this.value;
  }
}
