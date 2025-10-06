import { Paciente, PacienteRepository } from "@agenda-amiga/shared";
import { query } from "../database";
import { mapPacienteRowToDomain, PacienteRow } from "./mappers";

export class PostgresPacienteRepository implements PacienteRepository {
  async salvar(paciente: Paciente): Promise<void> {
    const snapshot = paciente.snapshot;
    const plano = snapshot.planoSaude;

    await query(
      `
        INSERT INTO pacientes (
          id,
          tutor_id,
          nome_completo,
          condicoes,
          alergias,
          plano_saude_operadora,
          plano_saude_numero,
          plano_saude_validade,
          plano_saude_arquivado,
          atualizado_em
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        ON CONFLICT (id) DO UPDATE SET
          tutor_id = EXCLUDED.tutor_id,
          nome_completo = EXCLUDED.nome_completo,
          condicoes = EXCLUDED.condicoes,
          alergias = EXCLUDED.alergias,
          plano_saude_operadora = EXCLUDED.plano_saude_operadora,
          plano_saude_numero = EXCLUDED.plano_saude_numero,
          plano_saude_validade = EXCLUDED.plano_saude_validade,
          plano_saude_arquivado = EXCLUDED.plano_saude_arquivado,
          atualizado_em = NOW()
      `,
      [
        snapshot.id,
        snapshot.tutorId,
        snapshot.nomeCompleto,
        snapshot.condicoes,
        snapshot.alergias,
        plano?.operadora ?? null,
        plano?.numeroCarteirinha ?? null,
        plano?.validade ? new Date(plano.validade) : null,
        plano?.arquivado ?? false,
      ]
    );
  }

  async listarPorTutor(tutorId: string): Promise<Paciente[]> {
    const result = await query<PacienteRow>(
      `
        SELECT
          id,
          tutor_id,
          nome_completo,
          condicoes,
          alergias,
          plano_saude_operadora,
          plano_saude_numero,
          plano_saude_validade,
          plano_saude_arquivado
        FROM pacientes
        WHERE tutor_id = $1
        ORDER BY nome_completo
      `,
      [tutorId]
    );

    return result.rows.map(mapPacienteRowToDomain);
  }

  async obterPorIdDoTutor(tutorId: string, pacienteId: string): Promise<Paciente | null> {
    const result = await query<PacienteRow>(
      `
        SELECT
          id,
          tutor_id,
          nome_completo,
          condicoes,
          alergias,
          plano_saude_operadora,
          plano_saude_numero,
          plano_saude_validade,
          plano_saude_arquivado
        FROM pacientes
        WHERE tutor_id = $1 AND id = $2
        LIMIT 1
      `,
      [tutorId, pacienteId]
    );

    if (!result.rowCount) {
      return null;
    }

    return mapPacienteRowToDomain(result.rows[0]);
  }
}
