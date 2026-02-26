/* global process */
/**
 * GET /api/reads/top
 *
 * Retrieve the top 10 read chapters globally.
 */
import { createClient } from 'redis';

const PREFIX = 'reads:';

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

        const allReads = await client.hGetAll(`${PREFIX}global`);
        await client.disconnect();

        const leaderboard = Object.entries(allReads)
            .map(([chapter, count]) => ({ chapter: parseFloat(chapter), count: parseInt(count, 10) }))
            .filter(e => e.count > 0 && !isNaN(e.chapter))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return res.status(200).json({ leaderboard });
    } catch (err) {
        console.error('reads/top error:', err);
        if (client) await client.disconnect().catch(() => { });
        return res.status(500).json({ error: 'Internal server error' });
    }
}
