/* global process */
import pg from 'pg';

const { Pool } = pg;

let pool;
let schemaReady;

function getDatabaseUrl() {
  const databaseUrl =
    process.env.NETLIFY_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.NEON_DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('Missing Netlify Postgres database URL');
  }

  return databaseUrl;
}

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: getDatabaseUrl(),
      ssl: { rejectUnauthorized: false },
    });
  }

  return pool;
}

async function rawQuery(text, params = []) {
  return getPool().query(text, params);
}

async function runSchemaMigrations() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS sync_entries (
      key text PRIMARY KEY,
      payload jsonb NOT NULL,
      expires_at timestamptz NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS read_counts (
      chapter text PRIMARY KEY,
      count integer NOT NULL DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS quiz_results (
      id text PRIMARY KEY,
      name text NOT NULL,
      score integer NOT NULL,
      total integer NOT NULL,
      difficulty_mode text NOT NULL,
      question_set text NOT NULL,
      played_at bigint NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS quiz_leaderboard (
      name text PRIMARY KEY,
      best_score integer NOT NULL,
      played integer NOT NULL,
      updated_at bigint NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS app_kv (
      key text PRIMARY KEY,
      value text NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS signatures (
      id text PRIMARY KEY,
      name text NOT NULL,
      message text NOT NULL,
      type text NOT NULL DEFAULT 'sign',
      created_at timestamptz NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS fan_gallery (
      id text PRIMARY KEY,
      name text NOT NULL,
      description text NOT NULL DEFAULT '',
      image_data_url text NOT NULL,
      mime_type text NOT NULL DEFAULT '',
      width integer,
      height integer,
      created_at timestamptz NOT NULL DEFAULT now()
    )`,
    `CREATE INDEX IF NOT EXISTS sync_entries_expires_at_idx ON sync_entries (expires_at)`,
    `CREATE INDEX IF NOT EXISTS quiz_results_played_at_idx ON quiz_results (played_at DESC)`,
    `CREATE INDEX IF NOT EXISTS quiz_leaderboard_score_idx ON quiz_leaderboard (best_score DESC, played ASC, name ASC)`,
  ];

  for (const sql of statements) {
    await rawQuery(sql);
  }
}

export async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = runSchemaMigrations().catch((error) => {
      schemaReady = undefined;
      throw error;
    });
  }

  await schemaReady;
}

export async function query(text, params = []) {
  await ensureSchema();
  return rawQuery(text, params);
}

export class PostgresKeyValueClient {
  async connect() {
    await ensureSchema();
    return this;
  }

  async disconnect() {
    return this;
  }

  async get(key) {
    const result = await query('SELECT value FROM app_kv WHERE key = $1', [key]);
    return result.rows[0]?.value || null;
  }

  async set(key, value) {
    await query(
      `
        INSERT INTO app_kv (key, value, updated_at)
        VALUES ($1, $2, now())
        ON CONFLICT (key)
        DO UPDATE SET value = EXCLUDED.value, updated_at = now()
      `,
      [key, value],
    );
    return 'OK';
  }

  async del(key) {
    const result = await query('DELETE FROM app_kv WHERE key = $1', [key]);
    return result.rowCount;
  }

  async exists(key) {
    const result = await query('SELECT 1 FROM app_kv WHERE key = $1 LIMIT 1', [key]);
    return result.rowCount > 0 ? 1 : 0;
  }

  async watch() {
    return 'OK';
  }

  async unwatch() {
    return 'OK';
  }

  multi() {
    const operations = [];
    return {
      set: (key, value) => {
        operations.push(() => this.set(key, value));
        return this;
      },
      del: (key) => {
        operations.push(() => this.del(key));
        return this;
      },
      exec: async () => {
        for (const operation of operations) {
          await operation();
        }
        return ['OK'];
      },
    };
  }

  on() {
    return this;
  }
}
