/**
 * GET  /api/quiz/leaderboard
 * POST /api/quiz/leaderboard
 *
 * Global quiz leaderboard (best score + play count per player).
 */
import { query } from '../../src/server/postgres.js';

const normalizeName = (name) => {
  const trimmed = String(name || 'Player').trim().slice(0, 24);
  return trimmed || 'Player';
};

const normalizeScoreToHundred = (score) => {
  const safeScore = Number(score) || 0;
  return Math.max(0, Math.min(100, safeScore));
};

const sortEntries = (entries) => {
  return [...entries].sort((a, b) => {
    if (normalizeScoreToHundred(b.bestScore) !== normalizeScoreToHundred(a.bestScore)) {
      return normalizeScoreToHundred(b.bestScore) - normalizeScoreToHundred(a.bestScore);
    }
    if ((a.played || 0) !== (b.played || 0)) return (a.played || 0) - (b.played || 0);
    return (a.name || '').localeCompare(b.name || '');
  });
};

const parseLeaderboard = (rows) => {
  const entries = (rows || []).map((row) => ({
    name: normalizeName(row.name),
    bestScore: normalizeScoreToHundred(row.bestScore),
    played: Number(row.played) || 0,
    updatedAt: Number(row.updatedAt) || Date.now(),
  }));

  return sortEntries(entries).slice(0, 100);
};

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
        `
          SELECT name, best_score AS "bestScore", played, updated_at AS "updatedAt"
          FROM quiz_leaderboard
          ORDER BY best_score DESC, played ASC, name ASC
          LIMIT 100
        `,
      );
      return res.status(200).json({ leaderboard: parseLeaderboard(result.rows) });
    }

    const name = normalizeName(req.body?.name);
    const score = Number(req.body?.score);

    if (!Number.isFinite(score) || score < 0) {
      return res.status(400).json({ error: 'Invalid score' });
    }

    await query(
      `
        INSERT INTO quiz_leaderboard (name, best_score, played, updated_at)
        VALUES ($1, $2, 1, $3)
        ON CONFLICT (name)
        DO UPDATE SET
          best_score = GREATEST(quiz_leaderboard.best_score, EXCLUDED.best_score),
          played = quiz_leaderboard.played + 1,
          updated_at = EXCLUDED.updated_at
      `,
      [name, normalizeScoreToHundred(score), Date.now()],
    );

    const result = await query(
      `
        SELECT name, best_score AS "bestScore", played, updated_at AS "updatedAt"
        FROM quiz_leaderboard
        ORDER BY best_score DESC, played ASC, name ASC
        LIMIT 100
      `,
    );

    return res.status(200).json({ leaderboard: parseLeaderboard(result.rows) });
  } catch (error) {
    console.error('quiz/leaderboard error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
