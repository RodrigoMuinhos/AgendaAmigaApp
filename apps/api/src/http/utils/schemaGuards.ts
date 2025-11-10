import { query } from "../../infra/database";

let cpfColumnReadyPromise: Promise<void> | null = null;

async function ensureUsuariosCpfColumnOnce() {
  const existsResult = await query<{ exists: boolean }>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'usuarios'
          AND column_name = 'responsavel_cpf'
          AND table_schema = ANY (current_schemas(false))
      ) AS exists
    `
  );

  if (!existsResult.rows[0]?.exists) {
    await query(`
      ALTER TABLE usuarios
      ADD COLUMN IF NOT EXISTS responsavel_cpf TEXT
    `);
  }
}

export async function ensureUsuariosCpfColumn() {
  if (!cpfColumnReadyPromise) {
    cpfColumnReadyPromise = ensureUsuariosCpfColumnOnce().catch((error) => {
      cpfColumnReadyPromise = null;
      throw error;
    });
  }

  return cpfColumnReadyPromise;
}

