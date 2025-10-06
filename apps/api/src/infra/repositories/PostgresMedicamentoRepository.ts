import {
  DoseHorario,
  EsquemaDose,
  EsquemaDoseSemanal,
  Medicamento,
  MedicamentoRepository,
  Periodo,
} from "@agenda-amiga/shared";
import { query } from "../database";
import { mapMedicamentoRowToDomain, MedicamentoRow } from "./mappers";

export class PostgresMedicamentoRepository implements MedicamentoRepository {
  async salvar(medicamento: Medicamento): Promise<void> {
    const snapshot = medicamento.snapshot;
    const esquema = (medicamento as unknown as { esquema: EsquemaDose | null }).esquema;

    const esquemaTipo = esquema ? esquema.getTipo() : null;
    const esquemaTimezone = esquema ? (esquema as any).timezone ?? null : null;
    const esquemaHorarios = esquema ? ((esquema as any).horarios as DoseHorario[]).map((h) => h.toString()) : null;

    const periodo: Periodo | undefined = esquema ? (esquema as any).periodo ?? undefined : undefined;
    const esquemaPeriodoInicio = periodo?.getInicio() ?? null;
    const esquemaPeriodoFim = periodo?.getFim() ?? null;

    let esquemaDiasSemana: number[] | null = null;
    if (esquema && esquema instanceof EsquemaDoseSemanal) {
      const dias: Set<number> = (esquema as any).diasDaSemana ?? new Set<number>();
      esquemaDiasSemana = Array.from(dias.values());
    }

    await query(
      `
        INSERT INTO medicamentos (
          id,
          paciente_id,
          nome,
          dosagem,
          unidade_dosagem,
          ativo,
          esquema_tipo,
          esquema_timezone,
          esquema_periodo_inicio,
          esquema_periodo_fim,
          esquema_horarios,
          esquema_dias_semana,
          atualizado_em
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
        ON CONFLICT (id) DO UPDATE SET
          paciente_id = EXCLUDED.paciente_id,
          nome = EXCLUDED.nome,
          dosagem = EXCLUDED.dosagem,
          unidade_dosagem = EXCLUDED.unidade_dosagem,
          ativo = EXCLUDED.ativo,
          esquema_tipo = EXCLUDED.esquema_tipo,
          esquema_timezone = EXCLUDED.esquema_timezone,
          esquema_periodo_inicio = EXCLUDED.esquema_periodo_inicio,
          esquema_periodo_fim = EXCLUDED.esquema_periodo_fim,
          esquema_horarios = EXCLUDED.esquema_horarios,
          esquema_dias_semana = EXCLUDED.esquema_dias_semana,
          atualizado_em = NOW()
      `,
      [
        snapshot.id,
        snapshot.pacienteId,
        snapshot.nome,
        snapshot.dosagem,
        snapshot.unidadeDosagem,
        snapshot.ativo,
        esquemaTipo,
        esquemaTimezone,
        esquemaPeriodoInicio,
        esquemaPeriodoFim,
        esquemaHorarios,
        esquemaDiasSemana,
      ]
    );
  }

  async obterPorId(id: string): Promise<Medicamento | null> {
    const result = await query<MedicamentoRow>(
      `
        SELECT
          id,
          paciente_id,
          nome,
          dosagem,
          unidade_dosagem,
          ativo,
          esquema_tipo,
          esquema_timezone,
          esquema_periodo_inicio,
          esquema_periodo_fim,
          esquema_horarios,
          esquema_dias_semana
        FROM medicamentos
        WHERE id = $1
        LIMIT 1
      `,
      [id]
    );

    if (!result.rowCount) {
      return null;
    }

    return mapMedicamentoRowToDomain(result.rows[0]);
  }

  async listarPorPaciente(pacienteId: string): Promise<Medicamento[]> {
    const result = await query<MedicamentoRow>(
      `
        SELECT
          id,
          paciente_id,
          nome,
          dosagem,
          unidade_dosagem,
          ativo,
          esquema_tipo,
          esquema_timezone,
          esquema_periodo_inicio,
          esquema_periodo_fim,
          esquema_horarios,
          esquema_dias_semana
        FROM medicamentos
        WHERE paciente_id = $1
        ORDER BY nome
      `,
      [pacienteId]
    );

    return result.rows.map(mapMedicamentoRowToDomain);
  }

  async desativar(id: string): Promise<void> {
    await query(
      `UPDATE medicamentos SET ativo = FALSE, atualizado_em = NOW() WHERE id = $1`,
      [id]
    );
  }
}
