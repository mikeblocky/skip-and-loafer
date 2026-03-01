/* global process */
/**
 * GET  /api/quiz/results
 * POST /api/quiz/results
 *
 * Global quiz results history (latest attempts across users).
 */
import { createClient } from 'redis';

const PREFIX = 'quiz:';
const RESULTS_KEY = `${PREFIX}results`;
const MAX_RESULTS = 300;

const normalizeName = (name) => {
  const trimmed = String(name || 'Player').trim().slice(0, 24);
  return trimmed || 'Player';
};

const parseResult = (rawItem) => {
  try {
    const parsed = JSON.parse(rawItem);
    return {
      id: String(parsed.id || `${parsed.playedAt || Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
      name: normalizeName(parsed.name),
      score: Number(parsed.score) || 0,
      total: Math.max(1, Number(parsed.total) || 1),
      difficultyMode: String(parsed.difficultyMode || 'easy'),
      questionSet: String(parsed.questionSet || '10'),
      playedAt: Number(parsed.playedAt) || Date.now(),
    };
  } catch {
    return null;
  }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });

  let client;
  try {
    client = createClient({ url: process.env.REDIS_URL });
    client.on('error', (error) => console.error('Redis Client Error', error));
    await client.connect();

    if (req.method === 'GET') {
      const rawItems = await client.lRange(RESULTS_KEY, 0, 99);
      const results = rawItems
        .map(parseResult)
        .filter(Boolean)
        .sort((a, b) => (b.playedAt || 0) - (a.playedAt || 0));

      await client.disconnect();
      return res.status(200).json({ results });
    }

    const payload = {
      id: String(req.body?.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
      name: normalizeName(req.body?.name),
      score: Number(req.body?.score),
      total: Number(req.body?.total),
      difficultyMode: String(req.body?.difficultyMode || 'easy'),
      questionSet: String(req.body?.questionSet || '10'),
      playedAt: Number(req.body?.playedAt) || Date.now(),
    };

    if (!Number.isFinite(payload.score) || payload.score < 0) {
      await client.disconnect();
      return res.status(400).json({ error: 'Invalid score' });
    }

    if (!Number.isFinite(payload.total) || payload.total <= 0) {
      await client.disconnect();
      return res.status(400).json({ error: 'Invalid total' });
    }

    await client.lPush(RESULTS_KEY, JSON.stringify(payload));
    await client.lTrim(RESULTS_KEY, 0, MAX_RESULTS - 1);

    const rawItems = await client.lRange(RESULTS_KEY, 0, 99);
    const results = rawItems
      .map(parseResult)
      .filter(Boolean)
      .sort((a, b) => (b.playedAt || 0) - (a.playedAt || 0));

    await client.disconnect();
    return res.status(200).json({ results });
  } catch (error) {
    console.error('quiz/results error:', error);
    if (client) await client.disconnect().catch(() => {});
    return res.status(500).json({ error: 'Internal server error' });
  }
}
