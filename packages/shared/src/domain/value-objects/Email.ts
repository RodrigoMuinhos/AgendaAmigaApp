export class Email {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(raw: string): Email {
    const normalized = raw.trim().toLowerCase();

    if (!normalized) {
      throw new Error("Email nao pode ser vazio");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalized)) {
      throw new Error("Email invalido");
    }

    if (normalized.length > 180) {
      throw new Error("Email excede limite de 180 caracteres");
    }

    return new Email(normalized);
  }

  getValue(): string {
    return this.value;
  }
}
