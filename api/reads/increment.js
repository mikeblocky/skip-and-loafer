/**
 * POST /api/reads/increment
 *
 * Increment the global read count for a specific chapter.
 */
import { query } from '../../src/server/postgres.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { chapter } = req.body || {};

        if (chapter === undefined || chapter === null) {
            return res.status(400).json({ error: 'Missing chapter number' });
        }

        const result = await query(
            `
                INSERT INTO read_counts (chapter, count)
                VALUES ($1, 1)
                ON CONFLICT (chapter)
                DO UPDATE SET count = read_counts.count + 1
                RETURNING count
            `,
            [String(chapter)],
        );
        const newCount = result.rows[0].count;

        return res.status(200).json({ chapter, count: newCount });
    } catch (err) {
        console.error('reads/increment error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
