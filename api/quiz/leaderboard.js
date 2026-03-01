/* global process */
/**
 * GET  /api/quiz/leaderboard
 * POST /api/quiz/leaderboard
 *
 * Global quiz leaderboard (best score + play count per player).
 */
import { createClient } from 'redis';

const PREFIX = 'quiz:';
const LEADERBOARD_KEY = `${PREFIX}leaderboard`;

const normalizeName = (name) => {
  const trimmed = String(name || 'Player').trim().slice(0, 24);
  return trimmed || 'Player';
};

const sortEntries = (entries) => {
  return [...entries].sort((a, b) => {
    if ((b.bestScore || 0) !== (a.bestScore || 0)) return (b.bestScore || 0) - (a.bestScore || 0);
    if ((a.played || 0) !== (b.played || 0)) return (a.played || 0) - (b.played || 0);
    return (a.name || '').localeCompare(b.name || '');
  });
};

const parseLeaderboard = (rawMap) => {
  const entries = Object.entries(rawMap || {}).map(([name, rawValue]) => {
    try {
      const parsed = JSON.parse(rawValue);
      return {
        name,
        bestScore: Number(parsed.bestScore) || 0,
        played: Number(parsed.played) || 0,
        updatedAt: Number(parsed.updatedAt) || Date.now(),
      };
    } catch {
      return {
        name,
        bestScore: 0,
        played: 0,
        updatedAt: Date.now(),
      };
    }
  });

  return sortEntries(entries).slice(0, 100);
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
      const rawMap = await client.hGetAll(LEADERBOARD_KEY);
      await client.disconnect();
      return res.status(200).json({ leaderboard: parseLeaderboard(rawMap) });
    }

    const name = normalizeName(req.body?.name);
    const score = Number(req.body?.score);

    if (!Number.isFinite(score) || score < 0) {
      await client.disconnect();
      return res.status(400).json({ error: 'Invalid score' });
    }

    const existingRaw = await client.hGet(LEADERBOARD_KEY, name);
    const existing = existingRaw ? JSON.parse(existingRaw) : null;

    const updated = {
      bestScore: Math.max(Number(existing?.bestScore) || 0, score),
      played: (Number(existing?.played) || 0) + 1,
      updatedAt: Date.now(),
    };

    await client.hSet(LEADERBOARD_KEY, name, JSON.stringify(updated));
    const rawMap = await client.hGetAll(LEADERBOARD_KEY);
    await client.disconnect();

    return res.status(200).json({ leaderboard: parseLeaderboard(rawMap) });
  } catch (error) {
    console.error('quiz/leaderboard error:', error);
    if (client) await client.disconnect().catch(() => {});
    return res.status(500).json({ error: 'Internal server error' });
  }
}
