/**
 * GET /api/reads/top
 *
 * Retrieve the top 10 read chapters globally.
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
        const result = await query(
            `
                SELECT chapter, count
                FROM read_counts
                WHERE count > 0
                ORDER BY count DESC
                LIMIT 10
            `,
        );

        const leaderboard = result.rows
            .map(({ chapter, count }) => ({ chapter: parseFloat(chapter), count: parseInt(count, 10) }))
            .filter(e => e.count > 0 && !isNaN(e.chapter))
            .slice(0, 10);

        return res.status(200).json({ leaderboard });
    } catch (err) {
        console.error('reads/top error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
