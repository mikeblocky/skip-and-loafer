import { query } from '../../src/server/postgres.js';

function clampText(value, max) {
  return String(value || '').trim().slice(0, max);
}

function createEntityId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function rowToEntry(row) {
  return {
    id: row.id,
    name: row.name,
    message: row.message,
    type: row.type,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', req.method === 'GET' ? 'public, max-age=20, stale-while-revalidate=40' : 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });

  try {
    if (req.method === 'GET') {
      const result = await query(
        `SELECT id, name, message, type, created_at
         FROM signatures
         ORDER BY created_at DESC
         LIMIT 80`,
      );
      return res.status(200).json({ signatures: result.rows.map(rowToEntry) });
    }

    const name = clampText(req.body?.name, 48);
    const message = clampText(req.body?.message, 280);
    const type = req.body?.type === 'pride' ? 'pride' : 'sign';

    if (!name) return res.status(400).json({ error: 'Name is required' });
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const id = createEntityId(type === 'pride' ? 'pride' : 'sign');

    await query(
      `INSERT INTO signatures (id, name, message, type) VALUES ($1, $2, $3, $4)`,
      [id, name, message, type],
    );

    const result = await query(
      `SELECT id, name, message, type, created_at
       FROM signatures
       ORDER BY created_at DESC
       LIMIT 80`,
    );
    const signatures = result.rows.map(rowToEntry);
    return res.status(200).json({ entry: signatures.find((s) => s.id === id) || null, signatures });
  } catch (error) {
    console.error('community/signatures error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
