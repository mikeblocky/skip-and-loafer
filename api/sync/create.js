/**
 * POST /api/sync/create
 *
 * Accepts  { data: { ... }, key?: "ABCD-1234" }
 * Returns  { key: "ABCD-1234" }
 *
 * Uses Netlify Postgres for persistent storage. Keys expire after 36 days.
 */
import { query } from '../../src/server/postgres.js';

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const SYNC_TTL_DAYS = 36;

function generateKey() {
    let key = '';
    for (let i = 0; i < 8; i++) {
        if (i === 4) key += '-';
        key += CHARSET[Math.floor(Math.random() * CHARSET.length)];
    }
    return key;
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { data, key: existingKey } = req.body || {};

        if (!data || typeof data !== 'object') {
            return res.status(400).json({ error: 'Missing or invalid "data" field' });
        }

        const payload = JSON.stringify(data);
        if (payload.length > 10485760) {
            return res.status(413).json({ error: 'Payload too large (max 10MB)' });
        }

        await query('DELETE FROM sync_entries WHERE expires_at <= now()');

        // Update existing key if provided - re-create it if it expired
        if (existingKey) {
            await query(
                `
                    INSERT INTO sync_entries (key, payload, expires_at, updated_at)
                    VALUES ($1, $2::jsonb, now() + ($3 * interval '1 day'), now())
                    ON CONFLICT (key)
                    DO UPDATE SET payload = EXCLUDED.payload, expires_at = EXCLUDED.expires_at, updated_at = now()
                `,
                [existingKey, payload, SYNC_TTL_DAYS],
            );
            return res.status(200).json({ key: existingKey });
        }

        // Generate a new key
        let key;
        let attempts = 0;
        do {
            key = generateKey();
            attempts++;
            const insertResult = await query(
                `
                    INSERT INTO sync_entries (key, payload, expires_at, updated_at)
                    VALUES ($1, $2::jsonb, now() + ($3 * interval '1 day'), now())
                    ON CONFLICT (key) DO NOTHING
                `,
                [key, payload, SYNC_TTL_DAYS],
            );
            if (insertResult.rowCount > 0) {
                return res.status(200).json({ key });
            }
        } while (attempts < 10);

        return res.status(500).json({ error: 'Unable to allocate sync key' });
    } catch (err) {
        console.error('sync/create error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
