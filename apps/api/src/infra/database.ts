import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

const DEFAULT_PORT = 5432;

const connectionString = process.env.DATABASE_URL;

const pool = connectionString
  ? new Pool({ connectionString })
  : new Pool({
      host: process.env.DB_HOST ?? "localhost",
      port: Number(process.env.DB_PORT ?? DEFAULT_PORT),
      user: process.env.DB_USER ?? "agenda_amiga",
      password: process.env.DB_PASSWORD ?? "agenda_amiga",
      database: process.env.DB_NAME ?? "agenda_amiga",
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    });

pool.on("error", (error) => {
  console.error("PostgreSQL pool error", error);
});

export type DbClient = PoolClient;

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

export async function withTransaction<T>(handler: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await handler(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export function getPool() {
  return pool;
}


