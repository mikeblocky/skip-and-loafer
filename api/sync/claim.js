/**
 * GET /api/sync/claim/[key]?peek=true
 *
 * peek=true → returns data without deleting (for continuous sync)
 * default   → returns data and deletes key (legacy one-time)
 *
 * Uses Netlify Postgres for persistent storage.
 */
import { query } from '../../src/server/postgres.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { key, peek } = req.query;

        if (!key) {
            return res.status(400).json({ error: 'Missing key parameter' });
        }

        await query('DELETE FROM sync_entries WHERE expires_at <= now()');

        const result = await query(
            'SELECT payload FROM sync_entries WHERE key = $1 AND expires_at > now()',
            [key],
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Key not found or expired' });
        }

        const data = result.rows[0].payload;

        // Only delete if NOT peeking
        if (peek !== 'true') {
            await query('DELETE FROM sync_entries WHERE key = $1', [key]);
        }

        return res.status(200).json({ data });
    } catch (err) {
        console.error('sync/claim error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
