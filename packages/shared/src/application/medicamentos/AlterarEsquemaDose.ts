import { Clock } from "../../domain/gateways/Clock";
import { DomainEvent } from "../../domain/events/DomainEvent";
import { Medicamento, MedicamentoSnapshot } from "../../domain/entities/Medicamento";
import {
  EsquemaDose,
  EsquemaDoseDiario,
  EsquemaDoseSemanal,
  EsquemaDoseSemanalProps,
  TipoRecorrencia,
} from "../../domain/entities/EsquemaDose";
import { DoseHorario } from "../../domain/value-objects/DoseHorario";
import { Periodo } from "../../domain/value-objects/Periodo";
import { MedicamentoRepository } from "../../domain/repositories/MedicamentoRepository";

export interface NovoEsquemaDoseDTO {
  readonly tipo: TipoRecorrencia;
  readonly timezone: string;
  readonly horarios: string[];
  readonly periodo?: {
    readonly inicio?: Date | string | null;
    readonly fim?: Date | string | null;
  } | null;
  readonly diasDaSemana?: number[];
}

export interface AlterarEsquemaDoseInput {
  readonly medicamentoId: string;
  readonly esquema: NovoEsquemaDoseDTO;
}

export interface AlterarEsquemaDoseOutput {
  readonly medicamento: MedicamentoSnapshot;
  readonly eventos: DomainEvent[];
}

export class AlterarEsquemaDose {
  constructor(private readonly medicamentoRepository: MedicamentoRepository, private readonly clock: Clock) {}

  async execute({ medicamentoId, esquema }: AlterarEsquemaDoseInput): Promise<AlterarEsquemaDoseOutput> {
    const id = medicamentoId.trim();

    if (!id) {
      throw new Error("MedicamentoId obrigatorio");
    }

    const medicamento = await this.medicamentoRepository.obterPorId(id);

    if (!medicamento) {
      throw new Error("Medicamento nao encontrado");
    }

    const novoEsquema = this.criarEsquema(esquema);

    medicamento.definirEsquema(novoEsquema);

    await this.medicamentoRepository.salvar(medicamento);

    const eventos = medicamento.pullDomainEvents();

    return {
      medicamento: medicamento.snapshot,
      eventos,
    };
  }

  private criarEsquema(dto: NovoEsquemaDoseDTO): EsquemaDose {
    const horarios = dto.horarios.map((horario) => DoseHorario.create(horario));
    const periodo = dto.periodo
      ? Periodo.create({
          inicio: dto.periodo.inicio ? new Date(dto.periodo.inicio) : undefined,
          fim: dto.periodo.fim ? new Date(dto.periodo.fim) : undefined,
        })
      : undefined;

    switch (dto.tipo) {
      case "DIARIO_HORARIOS_FIXOS":
        return new EsquemaDoseDiario({ horarios, timezone: dto.timezone, periodo });
      case "SEMANAL_DIAS_FIXOS": {
        const props: EsquemaDoseSemanalProps = {
          horarios,
          timezone: dto.timezone,
          periodo,
          diasDaSemana: dto.diasDaSemana ?? [],
        };
        return new EsquemaDoseSemanal(props);
      }
      default:
        throw new Error(`Recorrencia de dose nao suportada: ${dto.tipo}`);
    }
  }
}
