/**
 * GET  /api/quiz/results
 * POST /api/quiz/results
 *
 * Global quiz results history (latest attempts across users).
 */
import { query } from '../../src/server/postgres.js';

const normalizeName = (name) => {
  const trimmed = String(name || 'Player').trim().slice(0, 24);
  return trimmed || 'Player';
};

const normalizeResult = (rawItem) => {
  try {
    const parsed = rawItem || {};
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

  try {
    if (req.method === 'GET') {
      const result = await query(
        `
          SELECT
            id,
            name,
            score,
            total,
            difficulty_mode AS "difficultyMode",
            question_set AS "questionSet",
            played_at AS "playedAt"
          FROM quiz_results
          ORDER BY played_at DESC
          LIMIT 250
        `,
      );
      const results = result.rows.map(normalizeResult).filter(Boolean);
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
      return res.status(400).json({ error: 'Invalid score' });
    }

    if (!Number.isFinite(payload.total) || payload.total <= 0) {
      return res.status(400).json({ error: 'Invalid total' });
    }

    await query(
      `
        INSERT INTO quiz_results (id, name, score, total, difficulty_mode, question_set, played_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id)
        DO UPDATE SET
          name = EXCLUDED.name,
          score = EXCLUDED.score,
          total = EXCLUDED.total,
          difficulty_mode = EXCLUDED.difficulty_mode,
          question_set = EXCLUDED.question_set,
          played_at = EXCLUDED.played_at
      `,
      [
        payload.id,
        payload.name,
        payload.score,
        payload.total,
        payload.difficultyMode,
        payload.questionSet,
        payload.playedAt,
      ],
    );

    const result = await query(
      `
        SELECT
          id,
          name,
          score,
          total,
          difficulty_mode AS "difficultyMode",
          question_set AS "questionSet",
          played_at AS "playedAt"
        FROM quiz_results
        ORDER BY played_at DESC
        LIMIT 250
      `,
    );
    const results = result.rows.map(normalizeResult).filter(Boolean);
    return res.status(200).json({ results });
  } catch (error) {
    console.error('quiz/results error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
