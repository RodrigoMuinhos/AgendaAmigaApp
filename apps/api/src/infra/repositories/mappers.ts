import {
  DoseLog,
  DoseLogProps,
  EscopoCompartilhamento,
  EsquemaDose,
  EsquemaDoseDiario,
  EsquemaDoseSemanal,
  Medicamento,
  NumeroCarteirinha,
  Paciente,
  Periodo,
  PlanoSaude,
  ShareLink,
  ShareLinkProps,
  TokenShare,
  UnidadeDosagem,
  DoseHorario,
} from "@agenda-amiga/shared";

export interface PacienteRow {
  id: string;
  tutor_id: string;
  nome_completo: string;
  condicoes: string[] | null;
  alergias: string[] | null;
  plano_saude_operadora: string | null;
  plano_saude_numero: string | null;
  plano_saude_validade: string | Date | null;
  plano_saude_arquivado: boolean;
}

export interface MedicamentoRow {
  id: string;
  paciente_id: string;
  nome: string;
  dosagem: number;
  unidade_dosagem: string;
  ativo: boolean;
  esquema_tipo: string | null;
  esquema_timezone: string | null;
  esquema_periodo_inicio: string | Date | null;
  esquema_periodo_fim: string | Date | null;
  esquema_horarios: string[] | null;
  esquema_dias_semana: number[] | null;
}

export interface DoseLogRow {
  id: string;
  medicamento_id: string;
  horario_previsto: string | Date;
  status: string;
  horario_real: string | Date | null;
}

export interface ShareLinkRow {
  id: string;
  tutor_id: string;
  token: string;
  escopo: Record<string, string[] | "*">;
  expiracao: string | Date;
  revogado: boolean;
  criado_em: string | Date | null;
}

export function mapPacienteRowToDomain(row: PacienteRow): Paciente {
  const plano =
    row.plano_saude_operadora && row.plano_saude_numero
      ? PlanoSaude.criar({
          operadora: row.plano_saude_operadora,
          numeroCarteirinha: NumeroCarteirinha.create(row.plano_saude_numero),
          validade: row.plano_saude_validade ? new Date(row.plano_saude_validade) : undefined,
          arquivado: row.plano_saude_arquivado,
        })
      : null;

  return Paciente.criar({
    id: row.id,
    tutorId: row.tutor_id,
    nomeCompleto: row.nome_completo,
    condicoes: row.condicoes ?? [],
    alergias: row.alergias ?? [],
    planoSaude: plano ?? undefined,
  });
}

export function mapMedicamentoRowToDomain(row: MedicamentoRow): Medicamento {
  const unidade = UnidadeDosagem.create(row.unidade_dosagem);
  let esquema: EsquemaDose | null = null;

  if (row.esquema_tipo && row.esquema_timezone) {
    const horarios = (row.esquema_horarios ?? []).map((valor) => valor.trim()).filter(Boolean);
    const doseHorarios = horarios.map((valor) => DoseHorario.create(valor));
    const periodo =
      row.esquema_periodo_inicio || row.esquema_periodo_fim
        ? Periodo.create({
            inicio: row.esquema_periodo_inicio ? new Date(row.esquema_periodo_inicio) : undefined,
            fim: row.esquema_periodo_fim ? new Date(row.esquema_periodo_fim) : undefined,
          })
        : undefined;

    if (row.esquema_tipo === "DIARIO_HORARIOS_FIXOS") {
      esquema = new EsquemaDoseDiario({ horarios: doseHorarios, timezone: row.esquema_timezone, periodo });
    } else if (row.esquema_tipo === "SEMANAL_DIAS_FIXOS") {
      esquema = new EsquemaDoseSemanal({
        horarios: doseHorarios,
        timezone: row.esquema_timezone,
        periodo,
        diasDaSemana: row.esquema_dias_semana ?? [],
      });
    }
  }

  return Medicamento.criar({
    id: row.id,
    pacienteId: row.paciente_id,
    nome: row.nome,
    dosagem: Number(row.dosagem),
    unidadeDosagem: unidade,
    esquema: esquema ?? undefined,
    ativo: row.ativo,
  });
}

export function mapDoseLogRowToDomain(row: DoseLogRow): DoseLog {
  const props: DoseLogProps = {
    id: row.id,
    medicamentoId: row.medicamento_id,
    horarioPrevisto: new Date(row.horario_previsto),
    status: row.status as DoseLogProps["status"],
    horarioReal: row.horario_real ? new Date(row.horario_real) : undefined,
  };

  return DoseLog.criar(props);
}

export function mapShareLinkRowToDomain(row: ShareLinkRow): ShareLink {
  const escopo = EscopoCompartilhamento.criarVazio();

  for (const [tipo, valor] of Object.entries(row.escopo ?? {})) {
    if (valor === "*") {
      escopo.incluir(tipo as any);
    } else {
      escopo.incluir(tipo as any, valor as string[]);
    }
  }

  const token = TokenShare.create(row.token);

  const ShareLinkCtor = ShareLink as unknown as new (props: ShareLinkProps) => ShareLink;
  const shareLink = new ShareLinkCtor({
    id: row.id,
    tutorId: row.tutor_id,
    token,
    escopo,
    expiracao: new Date(row.expiracao),
    revogado: row.revogado,
    criadoEm: row.criado_em ? new Date(row.criado_em) : undefined,
  });

  shareLink.pullDomainEvents();

  return shareLink;
}
