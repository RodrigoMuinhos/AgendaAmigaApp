import { Clock } from "../gateways/Clock";

export interface ConsultaProps {
  readonly id: string;
  readonly pacienteId: string;
  readonly dataHora: Date;
  readonly retroativa?: boolean;
  readonly documentos?: string[];
}

export interface ConsultaSnapshot {
  readonly id: string;
  readonly pacienteId: string;
  readonly dataHora: string;
  readonly retroativa: boolean;
  readonly documentos: string[];
}

export class Consulta {
  private readonly id: string;
  private readonly pacienteId: string;
  private dataHora: Date;
  private retroativa: boolean;
  private readonly documentos: Set<string>;

  private constructor(props: ConsultaProps) {
    this.id = props.id;
    this.pacienteId = props.pacienteId;
    this.dataHora = new Date(props.dataHora);
    this.retroativa = props.retroativa ?? false;
    this.documentos = new Set(props.documentos ?? []);
  }

  static agendar(props: ConsultaProps, clock: Clock): Consulta {
    const id = props.id.trim();
    const pacienteId = props.pacienteId.trim();
    const dataHora = new Date(props.dataHora);

    if (!id) {
      throw new Error("Consulta requer identificador");
    }

    if (!pacienteId) {
      throw new Error("Consulta requer paciente");
    }

    Consulta.validarDataHora(dataHora, props.retroativa ?? false, clock);

    return new Consulta({ ...props, id, pacienteId, dataHora });
  }

  reagendar(novaDataHora: Date, retroativa: boolean, clock: Clock) {
    const data = new Date(novaDataHora);
    Consulta.validarDataHora(data, retroativa, clock);
    this.dataHora = data;
    this.retroativa = retroativa;
  }

  anexarDocumento(documentoId: string) {
    const id = documentoId.trim();
    if (!id) {
      throw new Error("Documento invalido");
    }
    this.documentos.add(id);
  }

  get snapshot(): ConsultaSnapshot {
    return {
      id: this.id,
      pacienteId: this.pacienteId,
      dataHora: this.dataHora.toISOString(),
      retroativa: this.retroativa,
      documentos: Array.from(this.documentos),
    };
  }

  private static validarDataHora(data: Date, retroativa: boolean, clock: Clock) {
    if (Number.isNaN(data.getTime())) {
      throw new Error("Data da consulta invalida");
    }

    if (!retroativa) {
      const agora = clock.nowUTC();
      if (data.getTime() < agora.getTime()) {
        throw new Error("Consulta futura nao pode ter data passada");
      }
    }
  }
}
