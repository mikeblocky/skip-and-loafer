/* global process */
import { createClient } from 'redis';
import { query } from '../src/server/postgres.js';

const SYNC_PREFIX = 'sync:';
const ROOM_PREFIX = 'chat:room:';
const DEFAULT_SYNC_TTL_DAYS = 36;
const KV_KEYS = [
  'community:signatures',
  'community:fan-gallery',
  'chat:rooms:index',
];

function normalizeName(name) {
  const trimmed = String(name || 'Player').trim().slice(0, 24);
  return trimmed || 'Player';
}

function normalizeScoreToHundred(score) {
  const safeScore = Number(score) || 0;
  return Math.max(0, Math.min(100, safeScore));
}

function parseJson(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

async function scanKeys(redis, pattern) {
  const keys = [];
  let cursor = '0';

  do {
    const result = await redis.scan(cursor, { MATCH: pattern, COUNT: 200 });
    cursor = String(result.cursor);
    keys.push(...result.keys);
  } while (cursor !== '0');

  return keys;
}

async function migrateSyncEntries(redis) {
  const keys = await scanKeys(redis, `${SYNC_PREFIX}*`);
  let migrated = 0;
  console.log(`Found ${keys.length} sync keys`);

  for (const redisKey of keys) {
    const raw = await redis.get(redisKey);
    if (!raw) continue;

    const payload = parseJson(raw);
    if (!payload || typeof payload !== 'object') continue;

    const ttlSeconds = await redis.ttl(redisKey);
    const expiresExpression = ttlSeconds > 0
      ? `now() + ($3 * interval '1 second')`
      : `now() + ($3 * interval '1 day')`;
    const ttlValue = ttlSeconds > 0 ? ttlSeconds : DEFAULT_SYNC_TTL_DAYS;

    await query(
      `
        INSERT INTO sync_entries (key, payload, expires_at, updated_at)
        VALUES ($1, $2::jsonb, ${expiresExpression}, now())
        ON CONFLICT (key)
        DO UPDATE SET payload = EXCLUDED.payload, expires_at = EXCLUDED.expires_at, updated_at = now()
      `,
      [redisKey.slice(SYNC_PREFIX.length), JSON.stringify(payload), ttlValue],
    );
    migrated += 1;
  }

  return migrated;
}

async function migrateReadCounts(redis) {
  const allReads = await redis.hGetAll('reads:global');
  let migrated = 0;
  console.log(`Found ${Object.keys(allReads || {}).length} read count entries`);

  for (const [chapter, rawCount] of Object.entries(allReads || {})) {
    const count = Number.parseInt(rawCount, 10);
    if (!chapter || !Number.isFinite(count) || count <= 0) continue;

    await query(
      `
        INSERT INTO read_counts (chapter, count)
        VALUES ($1, $2)
        ON CONFLICT (chapter)
        DO UPDATE SET count = GREATEST(read_counts.count, EXCLUDED.count)
      `,
      [chapter, count],
    );
    migrated += 1;
  }

  return migrated;
}

async function migrateQuizResults(redis) {
  const rawItems = await redis.lRange('quiz:results', 0, -1);
  let migrated = 0;
  console.log(`Found ${rawItems.length} quiz result entries`);

  for (const rawItem of rawItems) {
    const parsed = parseJson(rawItem);
    if (!parsed || typeof parsed !== 'object') continue;

    const payload = {
      id: String(parsed.id || `${parsed.playedAt || Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
      name: normalizeName(parsed.name),
      score: Number(parsed.score),
      total: Number(parsed.total),
      difficultyMode: String(parsed.difficultyMode || 'easy'),
      questionSet: String(parsed.questionSet || '10'),
      playedAt: Number(parsed.playedAt) || Date.now(),
    };

    if (!Number.isFinite(payload.score) || payload.score < 0) continue;
    if (!Number.isFinite(payload.total) || payload.total <= 0) continue;

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
    migrated += 1;
  }

  return migrated;
}

async function migrateQuizLeaderboard(redis) {
  const rawMap = await redis.hGetAll('quiz:leaderboard');
  let migrated = 0;
  console.log(`Found ${Object.keys(rawMap || {}).length} quiz leaderboard entries`);

  for (const [name, rawValue] of Object.entries(rawMap || {})) {
    const parsed = parseJson(rawValue, {});
    const entry = {
      name: normalizeName(name),
      bestScore: normalizeScoreToHundred(parsed.bestScore),
      played: Number(parsed.played) || 0,
      updatedAt: Number(parsed.updatedAt) || Date.now(),
    };

    await query(
      `
        INSERT INTO quiz_leaderboard (name, best_score, played, updated_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name)
        DO UPDATE SET
          best_score = GREATEST(quiz_leaderboard.best_score, EXCLUDED.best_score),
          played = GREATEST(quiz_leaderboard.played, EXCLUDED.played),
          updated_at = GREATEST(quiz_leaderboard.updated_at, EXCLUDED.updated_at)
      `,
      [entry.name, entry.bestScore, entry.played, entry.updatedAt],
    );
    migrated += 1;
  }

  return migrated;
}

async function migrateKeyValue(redis) {
  const roomKeys = await scanKeys(redis, `${ROOM_PREFIX}*`);
  const keys = [...new Set([...KV_KEYS, ...roomKeys])];
  let migrated = 0;
  console.log(`Found ${roomKeys.length} chat room keys and ${KV_KEYS.length} fixed key-value keys`);

  for (const key of keys) {
    const value = await redis.get(key);
    if (value == null) continue;

    await query(
      `
        INSERT INTO app_kv (key, value, updated_at)
        VALUES ($1, $2, now())
        ON CONFLICT (key)
        DO UPDATE SET value = EXCLUDED.value, updated_at = now()
      `,
      [key, value],
    );
    migrated += 1;
  }

  return migrated;
}

async function main() {
  if (!process.env.REDIS_URL) {
    throw new Error('Missing REDIS_URL for the source Redis database');
  }

  const redis = createClient({ url: process.env.REDIS_URL });
  redis.on('error', (error) => console.error('Redis client error:', error));
  await redis.connect();

  try {
    console.log('Migrating sync entries...');
    const summary = {
      syncEntries: await migrateSyncEntries(redis),
      readCounts: 0,
      quizResults: 0,
      quizLeaderboard: 0,
      keyValueEntries: 0,
    };
    console.log('Migrating read counts...');
    summary.readCounts = await migrateReadCounts(redis);
    console.log('Migrating quiz results...');
    summary.quizResults = await migrateQuizResults(redis);
    console.log('Migrating quiz leaderboard...');
    summary.quizLeaderboard = await migrateQuizLeaderboard(redis);
    console.log('Migrating key-value entries...');
    summary.keyValueEntries = await migrateKeyValue(redis);

    console.log('Redis to Postgres migration complete:');
    console.table(summary);
  } finally {
    await redis.disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
