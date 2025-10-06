export class TokenShare {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(raw: string): TokenShare {
    const normalized = raw.trim();

    if (!normalized) {
      throw new Error("TokenShare nao pode ser vazio");
    }

    if (normalized.length < 24) {
      throw new Error("TokenShare deve ter pelo menos 24 caracteres");
    }

    if (!/^[a-zA-Z0-9\-_]+$/.test(normalized)) {
      throw new Error("TokenShare contem caracteres invalidos");
    }

    return new TokenShare(normalized);
  }

  getValue(): string {
    return this.value;
  }
}
