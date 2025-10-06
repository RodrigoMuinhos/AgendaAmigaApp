import { Clock } from "../gateways/Clock";
import { DomainEvent } from "../events/DomainEvent";
import { EsquemaDeDoseAlterado } from "../events/EsquemaDeDoseAlterado";
import { Periodo } from "../value-objects/Periodo";
import { UnidadeDosagem } from "../value-objects/UnidadeDosagem";
import { DoseProjecao, EsquemaDose } from "./EsquemaDose";

export interface MedicamentoProps {
  readonly id: string;
  readonly pacienteId: string;
  readonly nome: string;
  readonly dosagem: number;
  readonly unidadeDosagem: UnidadeDosagem;
  readonly esquema?: EsquemaDose | null;
  readonly ativo?: boolean;
}

export interface MedicamentoSnapshot {
  readonly id: string;
  readonly pacienteId: string;
  readonly nome: string;
  readonly dosagem: number;
  readonly unidadeDosagem: string;
  readonly ativo: boolean;
  readonly esquema?: {
    readonly tipo: string;
  } | null;
}

export class Medicamento {
  private readonly id: string;
  private readonly pacienteId: string;
  private nome: string;
  private dosagem: number;
  private unidadeDosagem: UnidadeDosagem;
  private esquema: EsquemaDose | null;
  private ativo: boolean;
  private readonly domainEvents: DomainEvent[] = [];

  private constructor(props: MedicamentoProps) {
    this.id = props.id;
    this.pacienteId = props.pacienteId;
    this.nome = props.nome;
    this.dosagem = props.dosagem;
    this.unidadeDosagem = props.unidadeDosagem;
    this.esquema = props.esquema ?? null;
    this.ativo = props.ativo ?? true;
  }

  static criar(props: MedicamentoProps): Medicamento {
    const id = props.id.trim();
    const pacienteId = props.pacienteId.trim();
    const nome = props.nome.trim();

    if (!id) {
      throw new Error("Medicamento requer identificador");
    }

    if (!pacienteId) {
      throw new Error("Medicamento deve estar vinculado a um paciente");
    }

    if (!nome) {
      throw new Error("Medicamento requer nome");
    }

    if (!Number.isFinite(props.dosagem) || props.dosagem <= 0) {
      throw new Error("Dosagem do medicamento deve ser positiva");
    }

    return new Medicamento({
      ...props,
      id,
      pacienteId,
      nome,
      dosagem: props.dosagem,
    });
  }

  definirEsquema(novoEsquema: EsquemaDose) {
    if (!this.ativo) {
      throw new Error("Nao e possivel atualizar esquema de medicamento inativo");
    }

    this.esquema = novoEsquema;
    this.domainEvents.push(
      new EsquemaDeDoseAlterado({
        medicamentoId: this.id,
        alteradoEm: new Date(),
      })
    );
  }

  desativar() {
    this.ativo = false;
  }

  reativar() {
    this.ativo = true;
  }

  gerarProjecoesDeDose(periodo: Periodo, clock: Clock): DoseProjecao[] {
    if (!this.esquema) {
      return [];
    }

    return this.esquema.projetarInstancias(periodo, clock);
  }

  pullDomainEvents(): DomainEvent[] {
    const eventos = [...this.domainEvents];
    this.domainEvents.length = 0;
    return eventos;
  }

  get snapshot(): MedicamentoSnapshot {
    return {
      id: this.id,
      pacienteId: this.pacienteId,
      nome: this.nome,
      dosagem: this.dosagem,
      unidadeDosagem: this.unidadeDosagem.getValue(),
      ativo: this.ativo,
      esquema: this.esquema ? { tipo: this.esquema.getTipo() } : null,
    };
  }
}
