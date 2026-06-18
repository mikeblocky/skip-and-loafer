/* global process */
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

(async () => {
    try {
        const databaseUrl =
            process.env.NETLIFY_DATABASE_URL ||
            process.env.DATABASE_URL ||
            process.env.POSTGRES_URL;

        if (!databaseUrl) {
            throw new Error('Missing NETLIFY_DATABASE_URL, DATABASE_URL, or POSTGRES_URL');
        }

        const pool = new Pool({
            connectionString: databaseUrl,
            ssl: { rejectUnauthorized: false },
        });

        await pool.query('CREATE TABLE IF NOT EXISTS storage_smoke_test (key text PRIMARY KEY, value text NOT NULL)');
        await pool.query(
            `
                INSERT INTO storage_smoke_test (key, value)
                VALUES ($1, $2)
                ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
            `,
            ['sync:TEST-A123', '{"data":"foo"}'],
        );

        const result = await pool.query('SELECT value FROM storage_smoke_test WHERE key = $1', ['sync:TEST-A123']);
        console.log('RESULT:', result.rows[0]?.value);
        await pool.end();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
