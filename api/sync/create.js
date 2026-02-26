/* global process */
/**
 * POST /api/sync/create
 *
 * Accepts  { data: { ... }, key?: "ABCD-1234" }
 * Returns  { key: "ABCD-1234" }
 *
 * Uses Redis for persistent storage. Keys expire after 36 days.
 */
import { createClient } from 'redis';

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const PREFIX = 'sync:';

function generateKey() {
    let key = '';
    for (let i = 0; i < 8; i++) {
        if (i === 4) key += '-';
        key += CHARSET[Math.floor(Math.random() * CHARSET.length)];
    }
    return key;
}

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

        const { data, key: existingKey } = req.body || {};

        if (!data || typeof data !== 'object') {
            await client.disconnect();
            return res.status(400).json({ error: 'Missing or invalid "data" field' });
        }

        const payload = JSON.stringify(data);
        if (payload.length > 51200) {
            await client.disconnect();
            return res.status(413).json({ error: 'Payload too large (max 50KB)' });
        }

        // Update existing key if provided
        if (existingKey) {
            const exists = await client.exists(`${PREFIX}${existingKey}`);
            if (exists) {
                await client.set(`${PREFIX}${existingKey}`, payload);
                await client.disconnect();
                return res.status(200).json({ key: existingKey });
            }
        }

        // Generate a new key
        let key;
        let attempts = 0;
        do {
            key = generateKey();
            attempts++;
        } while ((await client.exists(`${PREFIX}${key}`)) && attempts < 10);

        await client.set(`${PREFIX}${key}`, payload);
        await client.disconnect();

        return res.status(200).json({ key });
    } catch (err) {
        console.error('sync/create error:', err);
        if (client) await client.disconnect().catch(() => { });
        return res.status(500).json({ error: 'Internal server error' });
    }
}
