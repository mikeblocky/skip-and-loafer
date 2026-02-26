/* global process */
/**
 * POST /api/reads/increment
 *
 * Increment the global read count for a specific chapter.
 */
import { createClient } from 'redis';

const PREFIX = 'reads:';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    let client;
    try {
        client = createClient({ url: process.env.REDIS_URL });
        client.on('error', err => console.error('Redis Client Error', err));
        await client.connect();

        const { chapter } = req.body || {};

        if (chapter === undefined || chapter === null) {
            await client.disconnect();
            return res.status(400).json({ error: 'Missing chapter number' });
        }

        const newCount = await client.hIncrBy(`${PREFIX}global`, String(chapter), 1);
        await client.disconnect();

        return res.status(200).json({ chapter, count: newCount });
    } catch (err) {
        console.error('reads/increment error:', err);
        if (client) await client.disconnect().catch(() => { });
        return res.status(500).json({ error: 'Internal server error' });
    }
}
