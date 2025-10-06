export class NumeroCarteirinha {
  private readonly value: string;

  private constructor(raw: string) {
    this.value = raw;
  }

  static create(raw: string): NumeroCarteirinha {
    const normalized = raw.trim();

    if (!normalized) {
      throw new Error("NumeroCarteirinha nao pode ser vazio");
    }

    if (normalized.length > 40) {
      throw new Error("NumeroCarteirinha excede comprimento maximo");
    }

    return new NumeroCarteirinha(normalized);
  }

  getValue(): string {
    return this.value;
  }
}
