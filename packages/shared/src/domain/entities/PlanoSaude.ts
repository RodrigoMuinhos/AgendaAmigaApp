import { NumeroCarteirinha } from "../value-objects/NumeroCarteirinha";

export interface PlanoSaudeProps {
  readonly operadora: string;
  readonly numeroCarteirinha: NumeroCarteirinha;
  readonly validade?: Date | null;
  readonly arquivado?: boolean;
}

export interface PlanoSaudeSnapshot {
  readonly operadora: string;
  readonly numeroCarteirinha: string;
  readonly validade: string | null;
  readonly arquivado: boolean;
}

export class PlanoSaude {
  private readonly operadora: string;
  private readonly numeroCarteirinha: NumeroCarteirinha;
  private readonly validade?: Date | null;
  private arquivado: boolean;

  private constructor(props: PlanoSaudeProps) {
    this.operadora = props.operadora;
    this.numeroCarteirinha = props.numeroCarteirinha;
    this.validade = props.validade ?? null;
    this.arquivado = props.arquivado ?? false;
  }

  static criar(props: PlanoSaudeProps): PlanoSaude {
    const operadora = props.operadora.trim();

    if (!operadora) {
      throw new Error("Plano de saude requer nome da operadora");
    }

    if (operadora.length > 120) {
      throw new Error("Nome da operadora excede limite de 120 caracteres");
    }

    if (props.validade && !props.arquivado) {
      const hoje = new Date();
      const validade = props.validade;

      if (validade.getTime() < hoje.getTime()) {
        throw new Error("Validade do plano nao pode estar vencida para planos ativos");
      }
    }

    return new PlanoSaude({ ...props, operadora });
  }

  estaValido(em: Date): boolean {
    if (this.arquivado) {
      return false;
    }

    if (!this.validade) {
      return true;
    }

    return this.validade.getTime() >= em.getTime();
  }

  arquivar(): void {
    this.arquivado = true;
  }

  get snapshot(): PlanoSaudeSnapshot {
    return {
      operadora: this.operadora,
      numeroCarteirinha: this.numeroCarteirinha.getValue(),
      validade: this.validade?.toISOString() ?? null,
      arquivado: this.arquivado,
    };
  }
}
