const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const SYNC_TTL_DAYS = 36;
const MAX_SYNC_PAYLOAD_LENGTH = 10 * 1024 * 1024;
const MAX_IMAGE_DATA_URL_LENGTH = 8_000_000;
const COMMUNITY_SIGNATURE_LIMIT = 80;
const COMMUNITY_FAN_GALLERY_LIMIT = 20;
const MEDIA_R2_PATHS = new Set(['anime/episode1.mp4']);

function json(payload, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return new Response(JSON.stringify(payload), { ...init, headers });
}

function empty(status = 204, extraHeaders = {}) {
  const headers = new Headers(extraHeaders);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return new Response(null, { status, headers });
}

function methodNotAllowed(allowed) {
  return json(
    { error: 'Method not allowed' },
    {
      status: 405,
      headers: { Allow: allowed.join(', ') },
    },
  );
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function clampText(value, max) {
  return String(value || '').trim().slice(0, max);
}

function createEntityId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function generateKey() {
  let key = '';
  for (let index = 0; index < 8; index += 1) {
    if (index === 4) key += '-';
    key += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return key;
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeName(name) {
  const trimmed = String(name || 'Player').trim().slice(0, 24);
  return trimmed || 'Player';
}

function normalizeScoreToHundred(score) {
  const safeScore = Number(score) || 0;
  return Math.max(0, Math.min(100, safeScore));
}

function normalizePositiveInt(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return null;
  return Math.round(number);
}

function sortLeaderboard(entries) {
  return [...entries].sort((a, b) => {
    if (normalizeScoreToHundred(b.bestScore) !== normalizeScoreToHundred(a.bestScore)) {
      return normalizeScoreToHundred(b.bestScore) - normalizeScoreToHundred(a.bestScore);
    }
    if ((a.played || 0) !== (b.played || 0)) return (a.played || 0) - (b.played || 0);
    return (a.name || '').localeCompare(b.name || '');
  });
}

function rowToSignature(row) {
  return {
    id: row.id,
    name: row.name,
    message: row.message,
    type: row.type,
    createdAt: row.created_at,
  };
}

function rowToFanGalleryEntry(row, url) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imageDataUrl: row.image_url || url,
    imageUrl: row.image_url || url,
    mimeType: row.mime_type,
    width: row.width,
    height: row.height,
    createdAt: row.created_at,
  };
}

function parseImageDataUrl(value) {
  const normalized = String(value || '').trim();
  if (!/^data:image\/[^;]+;base64,/i.test(normalized)) return null;
  if (normalized.length > MAX_IMAGE_DATA_URL_LENGTH) return null;

  const match = normalized.match(/^data:(image\/[^;]+);base64,(.+)$/i);
  if (!match) return null;

  return {
    mimeType: match[1].toLowerCase(),
    base64: match[2],
    normalized,
  };
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function extensionFromMime(mimeType) {
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/gif') return 'gif';
  if (mimeType === 'image/webp') return 'webp';
  if (mimeType === 'image/svg+xml') return 'svg';
  return 'bin';
}

function galleryImageUrl(request, imageKey) {
  return `${new URL(request.url).origin}/api/community/fan-gallery/images/${encodeURIComponent(imageKey)}`;
}

async function purgeExpiredSyncEntries(db) {
  await db.prepare('DELETE FROM sync_entries WHERE expires_at <= ?').bind(Date.now()).run();
}

async function handleSyncCreate(request, env) {
  if (request.method === 'OPTIONS') return empty(200, { 'Access-Control-Allow-Methods': 'POST, OPTIONS' });
  if (request.method !== 'POST') return methodNotAllowed(['POST', 'OPTIONS']);

  const body = await readJson(request);
  const { data, key: existingKey } = body || {};
  if (!data || typeof data !== 'object') {
    return json({ error: 'Missing or invalid "data" field' }, { status: 400 });
  }

  const payload = JSON.stringify(data);
  if (payload.length > MAX_SYNC_PAYLOAD_LENGTH) {
    return json({ error: 'Payload too large (max 10MB)' }, { status: 413 });
  }

  await purgeExpiredSyncEntries(env.DB);
  const expiresAt = Date.now() + SYNC_TTL_DAYS * 24 * 60 * 60 * 1000;

  if (existingKey) {
    await env.DB.prepare(
      `INSERT INTO sync_entries (key, payload, expires_at, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET
         payload = excluded.payload,
         expires_at = excluded.expires_at,
         updated_at = excluded.updated_at`,
    ).bind(existingKey, payload, expiresAt, Date.now()).run();
    return json({ key: existingKey });
  }

  for (let attempts = 0; attempts < 10; attempts += 1) {
    const key = generateKey();
    const result = await env.DB.prepare(
      `INSERT OR IGNORE INTO sync_entries (key, payload, expires_at, updated_at)
       VALUES (?, ?, ?, ?)`,
    ).bind(key, payload, expiresAt, Date.now()).run();
    if (result.meta?.changes > 0) return json({ key });
  }

  return json({ error: 'Unable to allocate sync key' }, { status: 500 });
}

async function handleSyncClaim(request, env) {
  if (request.method === 'OPTIONS') return empty(200, { 'Access-Control-Allow-Methods': 'GET, OPTIONS' });
  if (request.method !== 'GET') return methodNotAllowed(['GET', 'OPTIONS']);

  const url = new URL(request.url);
  const key = url.searchParams.get('key') || '';
  const peek = url.searchParams.get('peek') === 'true';
  if (!key) return json({ error: 'Missing key parameter' }, { status: 400 });

  await purgeExpiredSyncEntries(env.DB);
  const row = await env.DB.prepare(
    'SELECT payload FROM sync_entries WHERE key = ? AND expires_at > ?',
  ).bind(key, Date.now()).first();

  if (!row) return json({ error: 'Key not found or expired' }, { status: 404 });
  if (!peek) await env.DB.prepare('DELETE FROM sync_entries WHERE key = ?').bind(key).run();

  return json(
    { data: JSON.parse(row.payload) },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } },
  );
}

async function handleReadsIncrement(request, env) {
  if (request.method === 'OPTIONS') return empty(200, { 'Access-Control-Allow-Methods': 'POST, OPTIONS' });
  if (request.method !== 'POST') return methodNotAllowed(['POST', 'OPTIONS']);

  const body = await readJson(request);
  if (body.chapter === undefined || body.chapter === null) {
    return json({ error: 'Missing chapter number' }, { status: 400 });
  }

  const chapter = String(body.chapter);
  await env.DB.prepare(
    `INSERT INTO read_counts (chapter, count)
     VALUES (?, 1)
     ON CONFLICT(chapter) DO UPDATE SET count = read_counts.count + 1`,
  ).bind(chapter).run();

  const row = await env.DB.prepare('SELECT count FROM read_counts WHERE chapter = ?').bind(chapter).first();
  return json({ chapter: body.chapter, count: Number(row?.count) || 0 });
}

async function handleReadsTop(request, env) {
  if (request.method === 'OPTIONS') return empty(200, { 'Access-Control-Allow-Methods': 'GET, OPTIONS' });
  if (request.method !== 'GET') return methodNotAllowed(['GET', 'OPTIONS']);

  const { results } = await env.DB.prepare(
    `SELECT chapter, count
     FROM read_counts
     WHERE count > 0
     ORDER BY count DESC
     LIMIT 10`,
  ).all();

  const leaderboard = (results || [])
    .map(({ chapter, count }) => ({ chapter: parseFloat(chapter), count: parseInt(count, 10) }))
    .filter((entry) => entry.count > 0 && !Number.isNaN(entry.chapter));

  return json(
    { leaderboard },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } },
  );
}

async function handleQuizLeaderboard(request, env) {
  if (request.method === 'OPTIONS') return empty(200, { 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' });
  if (!['GET', 'POST'].includes(request.method)) return methodNotAllowed(['GET', 'POST', 'OPTIONS']);

  if (request.method === 'POST') {
    const body = await readJson(request);
    const name = normalizeName(body.name);
    const score = Number(body.score);
    if (!Number.isFinite(score) || score < 0) return json({ error: 'Invalid score' }, { status: 400 });

    await env.DB.prepare(
      `INSERT INTO quiz_leaderboard (name, best_score, played, updated_at)
       VALUES (?, ?, 1, ?)
       ON CONFLICT(name) DO UPDATE SET
         best_score = max(quiz_leaderboard.best_score, excluded.best_score),
         played = quiz_leaderboard.played + 1,
         updated_at = excluded.updated_at`,
    ).bind(name, normalizeScoreToHundred(score), Date.now()).run();
  }

  const { results } = await env.DB.prepare(
    `SELECT name, best_score AS bestScore, played, updated_at AS updatedAt
     FROM quiz_leaderboard
     ORDER BY best_score DESC, played ASC, name ASC
     LIMIT 100`,
  ).all();
  const leaderboard = sortLeaderboard((results || []).map((row) => ({
    name: normalizeName(row.name),
    bestScore: normalizeScoreToHundred(row.bestScore),
    played: Number(row.played) || 0,
    updatedAt: Number(row.updatedAt) || Date.now(),
  }))).slice(0, 100);

  return json(
    { leaderboard },
    { headers: { 'Cache-Control': request.method === 'GET' ? 'public, max-age=20, stale-while-revalidate=40' : 'no-store' } },
  );
}

function normalizeQuizResult(row) {
  return {
    id: String(row.id || `${row.playedAt || Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    name: normalizeName(row.name),
    score: Number(row.score) || 0,
    total: Math.max(1, Number(row.total) || 1),
    difficultyMode: String(row.difficultyMode || 'easy'),
    questionSet: String(row.questionSet || '10'),
    playedAt: Number(row.playedAt) || Date.now(),
  };
}

async function handleQuizResults(request, env) {
  if (request.method === 'OPTIONS') return empty(200, { 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' });
  if (!['GET', 'POST'].includes(request.method)) return methodNotAllowed(['GET', 'POST', 'OPTIONS']);

  if (request.method === 'POST') {
    const body = await readJson(request);
    const payload = {
      id: String(body.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
      name: normalizeName(body.name),
      score: Number(body.score),
      total: Number(body.total),
      difficultyMode: String(body.difficultyMode || 'easy'),
      questionSet: String(body.questionSet || '10'),
      playedAt: Number(body.playedAt) || Date.now(),
    };

    if (!Number.isFinite(payload.score) || payload.score < 0) return json({ error: 'Invalid score' }, { status: 400 });
    if (!Number.isFinite(payload.total) || payload.total <= 0) return json({ error: 'Invalid total' }, { status: 400 });

    await env.DB.prepare(
      `INSERT INTO quiz_results (id, name, score, total, difficulty_mode, question_set, played_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         score = excluded.score,
         total = excluded.total,
         difficulty_mode = excluded.difficulty_mode,
         question_set = excluded.question_set,
         played_at = excluded.played_at`,
    ).bind(
      payload.id,
      payload.name,
      payload.score,
      payload.total,
      payload.difficultyMode,
      payload.questionSet,
      payload.playedAt,
    ).run();
  }

  const { results } = await env.DB.prepare(
    `SELECT
       id,
       name,
       score,
       total,
       difficulty_mode AS difficultyMode,
       question_set AS questionSet,
       played_at AS playedAt
     FROM quiz_results
     ORDER BY played_at DESC
     LIMIT 250`,
  ).all();

  return json(
    { results: (results || []).map(normalizeQuizResult) },
    { headers: { 'Cache-Control': request.method === 'GET' ? 'public, max-age=20, stale-while-revalidate=40' : 'no-store' } },
  );
}

async function handleSignatures(request, env) {
  if (request.method === 'OPTIONS') return empty(200, { 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' });
  if (!['GET', 'POST'].includes(request.method)) return methodNotAllowed(['GET', 'POST', 'OPTIONS']);

  let insertedId = null;
  if (request.method === 'POST') {
    const body = await readJson(request);
    const name = clampText(body.name, 48);
    const message = clampText(body.message, 280);
    const type = body.type === 'pride' ? 'pride' : 'sign';

    if (!name) return json({ error: 'Name is required' }, { status: 400 });
    if (!message) return json({ error: 'Message is required' }, { status: 400 });

    insertedId = createEntityId(type === 'pride' ? 'pride' : 'sign');
    await env.DB.prepare(
      'INSERT INTO signatures (id, name, message, type, created_at) VALUES (?, ?, ?, ?, ?)',
    ).bind(insertedId, name, message, type, nowIso()).run();
  }

  const { results } = await env.DB.prepare(
    `SELECT id, name, message, type, created_at
     FROM signatures
     ORDER BY created_at DESC
     LIMIT ?`,
  ).bind(COMMUNITY_SIGNATURE_LIMIT).all();
  const signatures = (results || []).map(rowToSignature);

  return json(
    { entry: insertedId ? signatures.find((entry) => entry.id === insertedId) || null : undefined, signatures },
    { headers: { 'Cache-Control': request.method === 'GET' ? 'public, max-age=20, stale-while-revalidate=40' : 'no-store' } },
  );
}

async function handleFanGalleryImage(request, env, imageKey) {
  if (request.method === 'OPTIONS') return empty(200, { 'Access-Control-Allow-Methods': 'GET, OPTIONS' });
  if (request.method !== 'GET') return methodNotAllowed(['GET', 'OPTIONS']);
  if (!env.FAN_GALLERY_BUCKET) return json({ error: 'Fan gallery bucket is not configured' }, { status: 500 });

  const object = await env.FAN_GALLERY_BUCKET.get(imageKey);
  if (!object) return json({ error: 'Image not found' }, { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('Access-Control-Allow-Origin', '*');
  return new Response(object.body, { headers });
}

async function handleFanGallery(request, env) {
  if (request.method === 'OPTIONS') return empty(200, { 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' });
  if (!['GET', 'POST'].includes(request.method)) return methodNotAllowed(['GET', 'POST', 'OPTIONS']);

  let entryId = null;
  if (request.method === 'POST') {
    if (!env.FAN_GALLERY_BUCKET) return json({ error: 'Fan gallery bucket is not configured' }, { status: 500 });

    const body = await readJson(request);
    const parsedImage = parseImageDataUrl(body.imageDataUrl);
    if (!parsedImage) return json({ error: 'A valid image upload is required' }, { status: 400 });

    const imageHash = (await sha256Hex(parsedImage.normalized)).slice(0, 32);
    const existing = await env.DB.prepare(
      'SELECT id FROM fan_gallery WHERE image_hash = ? LIMIT 1',
    ).bind(imageHash).first();
    entryId = existing?.id || createEntityId('fan');

    if (!existing) {
      const name = clampText(body.name, 60);
      const description = clampText(body.description, 240);
      const mimeType = clampText(body.mimeType, 24) || parsedImage.mimeType;
      const width = normalizePositiveInt(body.width);
      const height = normalizePositiveInt(body.height);
      const imageKey = `fan-gallery/${entryId}.${extensionFromMime(parsedImage.mimeType)}`;
      const imageUrl = galleryImageUrl(request, imageKey);

      await env.FAN_GALLERY_BUCKET.put(imageKey, base64ToBytes(parsedImage.base64), {
        httpMetadata: { contentType: parsedImage.mimeType },
        customMetadata: { imageHash, entryId },
      });

      await env.DB.prepare(
        `INSERT INTO fan_gallery
           (id, name, description, image_key, image_url, image_hash, mime_type, width, height, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(entryId, name, description, imageKey, imageUrl, imageHash, mimeType, width, height, nowIso()).run();
    }
  }

  const { results } = await env.DB.prepare(
    `SELECT id, name, description, image_key, image_url, mime_type, width, height, created_at
     FROM fan_gallery
     ORDER BY created_at DESC
     LIMIT ?`,
  ).bind(COMMUNITY_FAN_GALLERY_LIMIT).all();

  const entries = (results || []).map((row) => rowToFanGalleryEntry(row, galleryImageUrl(request, row.image_key)));
  return json(
    { entry: entryId ? entries.find((entry) => entry.id === entryId) || null : undefined, entries },
    { headers: { 'Cache-Control': request.method === 'GET' ? 'public, max-age=20, stale-while-revalidate=40' : 'no-store' } },
  );
}

function handleGeoCountry(request) {
  if (request.method === 'OPTIONS') return empty(200, { 'Access-Control-Allow-Methods': 'GET, OPTIONS' });
  if (request.method !== 'GET') return methodNotAllowed(['GET', 'OPTIONS']);

  const countryCode = String(request.headers.get('cf-ipcountry') || '').trim().toUpperCase();
  return json(
    { countryCode: /^[A-Z]{2}$/.test(countryCode) ? countryCode : null },
    { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' } },
  );
}

async function handleApiRequest(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';

  if (pathname === '/api/sync/create') return handleSyncCreate(request, env);
  if (pathname === '/api/sync/claim') return handleSyncClaim(request, env);
  if (pathname === '/api/reads/increment') return handleReadsIncrement(request, env);
  if (pathname === '/api/reads/top') return handleReadsTop(request, env);
  if (pathname === '/api/quiz/leaderboard') return handleQuizLeaderboard(request, env);
  if (pathname === '/api/quiz/results') return handleQuizResults(request, env);
  if (pathname === '/api/community/signatures') return handleSignatures(request, env);
  if (pathname === '/api/community/fan-gallery') return handleFanGallery(request, env);
  if (pathname.startsWith('/api/community/fan-gallery/images/')) {
    const imageKey = decodeURIComponent(pathname.slice('/api/community/fan-gallery/images/'.length));
    return handleFanGalleryImage(request, env, imageKey);
  }
  if (pathname === '/api/geo/country') return handleGeoCountry(request);

  return json({ error: 'API route not found' }, { status: 404 });
}

async function handleMediaAsset(request, env, pathname) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return methodNotAllowed(['GET', 'HEAD']);
  if (!env.MEDIA_BUCKET) return json({ error: 'Media bucket is not configured' }, { status: 500 });

  const key = pathname.replace(/^\/+/, '');
  const object = await env.MEDIA_BUCKET.get(key, {
    range: request.headers,
    onlyIf: request.headers,
  });

  if (!object) return json({ error: 'Media not found' }, { status: 404 });
  if (object.status === 304) return new Response(null, { status: 304 });
  if (object.status === 412) return new Response(null, { status: 412 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('Access-Control-Allow-Origin', '*');
  if (object.range) {
    headers.set(
      'Content-Range',
      `bytes ${object.range.offset}-${object.range.offset + object.range.length - 1}/${object.size}`,
    );
  }

  return new Response(request.method === 'HEAD' ? null : object.body, {
    status: object.range ? 206 : 200,
    headers,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) return handleApiRequest(request, env);
    if (MEDIA_R2_PATHS.has(url.pathname.replace(/^\/+/, ''))) {
      return handleMediaAsset(request, env, url.pathname);
    }
    return env.ASSETS.fetch(request);
  },
};
