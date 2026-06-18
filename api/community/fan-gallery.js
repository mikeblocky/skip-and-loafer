/* global Buffer */
import { createHash } from 'crypto';
import { query } from '../../src/server/postgres.js';

const MAX_IMAGE_DATA_URL_LENGTH = 8_000_000;

function sanitizeImageDataUrl(value) {
  const normalized = String(value || '').trim();
  if (!/^data:image\/[^;]+;base64,/i.test(normalized)) return '';
  if (normalized.length > MAX_IMAGE_DATA_URL_LENGTH) return '';
  return normalized;
}

function normalizePositiveInt(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n);
}

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
    description: row.description,
    imageDataUrl: row.image_data_url,
    mimeType: row.mime_type,
    width: row.width,
    height: row.height,
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
        `SELECT id, name, description, image_data_url, mime_type, width, height, created_at
         FROM fan_gallery
         ORDER BY created_at DESC
         LIMIT 20`,
      );
      return res.status(200).json({ entries: result.rows.map(rowToEntry) });
    }

    const imageDataUrl = sanitizeImageDataUrl(req.body?.imageDataUrl);
    if (!imageDataUrl) {
      return res.status(400).json({ error: 'A valid image upload is required' });
    }

    const id = createEntityId('fan');
    const name = clampText(req.body?.name, 60);
    const description = clampText(req.body?.description, 240);
    const mimeType = clampText(req.body?.mimeType, 24);
    const width = normalizePositiveInt(req.body?.width);
    const height = normalizePositiveInt(req.body?.height);

    const imageHash = createHash('sha256').update(imageDataUrl).digest('hex').slice(0, 32);

    await query(
      `INSERT INTO fan_gallery (id, name, description, image_data_url, image_hash, mime_type, width, height)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (image_hash) DO NOTHING`,
      [id, name, description, imageDataUrl, imageHash, mimeType, width, height],
    );

    const result = await query(
      `SELECT id, name, description, image_data_url, mime_type, width, height, created_at
       FROM fan_gallery
       ORDER BY created_at DESC
       LIMIT 20`,
    );
    const entries = result.rows.map(rowToEntry);
    return res.status(200).json({ entry: entries.find((e) => e.id === id) || null, entries });
  } catch (error) {
    console.error('community/fan-gallery error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
