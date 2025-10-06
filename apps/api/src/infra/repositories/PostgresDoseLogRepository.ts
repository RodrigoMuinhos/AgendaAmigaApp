import { DoseLog, DoseLogRepository, Periodo } from "@agenda-amiga/shared";
import { query, withTransaction } from "../database";
import { mapDoseLogRowToDomain, DoseLogRow } from "./mappers";

export class PostgresDoseLogRepository implements DoseLogRepository {
  async salvarEmLote(doseLogs: DoseLog[]): Promise<void> {
    if (!doseLogs.length) {
      return;
    }

    await withTransaction(async (client) => {
      for (const log of doseLogs) {
        const snapshot = log.snapshot;

        await client.query(
          `
            INSERT INTO dose_logs (
              id,
              medicamento_id,
              horario_previsto,
              status,
              horario_real,
              atualizado_em
            )
            VALUES ($1, $2, $3, $4, $5, NOW())
            ON CONFLICT (id) DO UPDATE SET
              medicamento_id = EXCLUDED.medicamento_id,
              horario_previsto = EXCLUDED.horario_previsto,
              status = EXCLUDED.status,
              horario_real = EXCLUDED.horario_real,
              atualizado_em = NOW()
          `,
          [
            snapshot.id,
            snapshot.medicamentoId,
            new Date(snapshot.horarioPrevisto),
            snapshot.status,
            snapshot.horarioReal ? new Date(snapshot.horarioReal) : null,
          ]
        );
      }
    });
  }

  async listarPorMedicamentoEPeriodo(medicamentoId: string, periodo: Periodo): Promise<DoseLog[]> {
    const filtros: string[] = ["medicamento_id = $1"];
    const params: any[] = [medicamentoId];
    let paramIndex = 2;

    const inicio = periodo.getInicio();
    if (inicio) {
      filtros.push(`horario_previsto >= $${paramIndex}`);
      params.push(inicio);
      paramIndex += 1;
    }

    const fim = periodo.getFim();
    if (fim) {
      filtros.push(`horario_previsto <= $${paramIndex}`);
      params.push(fim);
      paramIndex += 1;
    }

    const result = await query<DoseLogRow>(
      `
        SELECT
          id,
          medicamento_id,
          horario_previsto,
          status,
          horario_real
        FROM dose_logs
        WHERE ${filtros.join(" AND ")}
        ORDER BY horario_previsto
      `,
      params
    );

    return result.rows.map(mapDoseLogRowToDomain);
  }

  async atualizarStatus(doseLog: DoseLog): Promise<void> {
    const snapshot = doseLog.snapshot;

    await query(
      `
        UPDATE dose_logs
        SET status = $2, horario_real = $3, atualizado_em = NOW()
        WHERE id = $1
      `,
      [
        snapshot.id,
        snapshot.status,
        snapshot.horarioReal ? new Date(snapshot.horarioReal) : null,
      ]
    );
  }

  async obterPorId(id: string): Promise<DoseLog | null> {
    const result = await query<DoseLogRow>(
      `
        SELECT
          id,
          medicamento_id,
          horario_previsto,
          status,
          horario_real
        FROM dose_logs
        WHERE id = $1
        LIMIT 1
      `,
      [id]
    );

    if (!result.rowCount) {
      return null;
    }

    return mapDoseLogRowToDomain(result.rows[0]);
  }
}
