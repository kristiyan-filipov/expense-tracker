import { Pool, type PoolConfig, type QueryResult, type QueryResultRow } from 'pg';

/**
 * Playwright PostgreSQL helper.
 *
 * Connects with the `pg` driver using `DATABASE_URL` from `.env.local`
 * (loaded by playwright.config.ts). Supabase's transaction pooler (port 6543)
 * does not support named prepared statements, so queries disable them.
 */

export type ExpenseRow = {
  id: string;
  user_id: string;
  name: string;
  amount: string | number;
  created_at: Date | string;
};

let pool: Pool | null = null;

function cleanDatabaseUrl(url: string | undefined): string {
  if (!url) return '';
  let cleaned = url.trim();
  while (cleaned.startsWith('DATABASE_URL=')) {
    cleaned = cleaned.substring('DATABASE_URL='.length).trim();
  }
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

export function isDbConfigured(): boolean {
  const url = cleanDatabaseUrl(process.env.DATABASE_URL);
  if (!url) return false;
  if (!/^postgres(ql)?:\/\//i.test(url)) return false;
  if (/YOUR_PASSWORD/i.test(url)) return false;
  return true;
}

function buildPoolConfig(): PoolConfig {
  const connectionString = cleanDatabaseUrl(process.env.DATABASE_URL);
  const isSupabase =
    connectionString.includes('supabase.com') || connectionString.includes('pooler.supabase');

  return {
    connectionString,
    max: 2,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 15_000,
    // Transaction-mode PgBouncer cannot reuse named prepared statements.
    // node-pg still sends unnamed extended-query prepares unless this is off.
    ...(isSupabase
      ? {
          ssl: { rejectUnauthorized: false },
        }
      : {}),
  };
}

export function getPool(): Pool {
  if (!isDbConfigured()) {
    throw new Error(
      'DATABASE_URL is missing or invalid. Set a postgresql:// connection string in .env.local before running database tests.',
    );
  }

  if (!pool) {
    pool = new Pool(buildPoolConfig());
  }

  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = [],
): Promise<QueryResult<T>> {
  return getPool().query<T>({
    text,
    values,
  });
}

export async function getExpenseById(id: string): Promise<ExpenseRow | undefined> {
  const result = await query<ExpenseRow>(
    `SELECT id, user_id, name, amount, created_at
     FROM expenses
     WHERE id = $1`,
    [id],
  );

  return result.rows[0];
}

export async function countExpenses(name?: string): Promise<number> {
  if (name !== undefined) {
    const result = await query<{ count: string }>(
      `SELECT COUNT(*)::int AS count FROM expenses WHERE name = $1`,
      [name],
    );
    return Number(result.rows[0].count);
  }

  const result = await query<{ count: string }>(`SELECT COUNT(*)::int AS count FROM expenses`);
  return Number(result.rows[0].count);
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
