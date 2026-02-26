/* global process */
/**
 * GET /api/sync/claim/[key]?peek=true
 *
 * peek=true → returns data without deleting (for continuous sync)
 * default   → returns data and deletes key (legacy one-time)
 *
 * Uses Redis for persistent storage.
 */
import { createClient } from 'redis';

const PREFIX = 'sync:';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    let client;
    try {
        client = createClient({ url: process.env.REDIS_URL });
        client.on('error', err => console.error('Redis Client Error', err));
        await client.connect();

        const { key, peek } = req.query;

        if (!key) {
            await client.disconnect();
            return res.status(400).json({ error: 'Missing key parameter' });
        }

        const raw = await client.get(`${PREFIX}${key}`);

        if (!raw) {
            await client.disconnect();
            return res.status(404).json({ error: 'Key not found or expired' });
        }

        const data = JSON.parse(raw);

        // Only delete if NOT peeking
        if (peek !== 'true') {
            await client.del(`${PREFIX}${key}`);
        }

        await client.disconnect();
        return res.status(200).json({ data });
    } catch (err) {
        console.error('sync/claim error:', err);
        if (client) await client.disconnect().catch(() => { });
        return res.status(500).json({ error: 'Internal server error' });
    }
}
