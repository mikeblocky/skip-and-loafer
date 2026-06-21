const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const SYNC_TTL_DAYS = 36;
const MAX_SYNC_PAYLOAD_LENGTH = 10 * 1024 * 1024;
const MAX_IMAGE_DATA_URL_LENGTH = 8_000_000;
const MAX_JSON_BODY_LENGTH = 10 * 1024 * 1024;
const MAX_COMMUNITY_JSON_BODY_LENGTH = 16 * 1024;
const MAX_QUIZ_JSON_BODY_LENGTH = 8 * 1024;
const MAX_READS_JSON_BODY_LENGTH = 512;
const COMMUNITY_SIGNATURE_LIMIT = 80;
const COMMUNITY_FAN_GALLERY_LIMIT = 20;
const MEDIA_R2_PATHS = new Set(['anime/episode1.mp4']);
// Oversized media that can't ride the Workers asset bundle (25 MiB/file limit) is
// uploaded to the R2 media bucket and served by handleMediaAsset instead. The whole
// Musical gallery's videos live there; their still images stay as normal assets.
const MEDIA_R2_PATH_PATTERNS = [/^gallery\/musical\/.+\.mp4$/i];

function isMediaR2Path(pathname) {
  const key = pathname.replace(/^\/+/, '');
  if (MEDIA_R2_PATHS.has(key)) return true;
  return MEDIA_R2_PATH_PATTERNS.some((pattern) => pattern.test(key));
}
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_QUIZ_DIFFICULTIES = new Set(['easy', 'normal', 'hard', 'expert']);
const ALLOWED_QUIZ_SETS = new Set(['10', '20', 'all']);
const SECURITY_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "form-action 'self'",
    // Cloudflare Web Analytics injects beacon.min.js from static.cloudflareinsights.com.
    "script-src 'self' 'wasm-unsafe-eval' https://static.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline'",
    // Fonts are now self-hosted (.ttf in /public), so no external font origins are needed.
    "font-src 'self'",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: data:",
    // cloudflareinsights.com receives the RUM beacon report.
    "connect-src 'self' https://cdn.jsdelivr.net https://storage.googleapis.com https://cloudflareinsights.com",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
  ].join('; '),
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Origin-Agent-Cluster': '?1',
  'Permissions-Policy': 'camera=(self), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-Permitted-Cross-Domain-Policies': 'none',
};

function getRequestOrigin(request) {
  const origin = request.headers.get('Origin');
  if (!origin) return '';

  try {
    const requestUrl = new URL(request.url);
    const originUrl = new URL(origin);
    return originUrl.origin === requestUrl.origin ? originUrl.origin : '';
  } catch {
    return '';
  }
}

function applyCorsHeaders(headers, request, methods = 'GET, POST, OPTIONS') {
  const origin = getRequestOrigin(request);
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
  }
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  headers.set('Access-Control-Allow-Methods', methods);
}

function addSecurityHeaders(response, request) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }
  if (request?.url.startsWith('https://')) {
    headers.set('Strict-Transport-Security', SECURITY_HEADERS['Strict-Transport-Security']);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function json(payload, init = {}, request) {
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json');
  if (request) applyCorsHeaders(headers, request);
  return new Response(JSON.stringify(payload), { ...init, headers });
}

function empty(status = 204, extraHeaders = {}, request, methods) {
  const headers = new Headers(extraHeaders);
  if (request) applyCorsHeaders(headers, request, methods);
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

async function readJson(request, maxLength = MAX_JSON_BODY_LENGTH) {
  if (!String(request.headers.get('content-type') || '').toLowerCase().includes('application/json')) {
    throw new Error('Expected application/json');
  }
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > maxLength) throw new Error('JSON body too large');

  try {
    return await request.json();
  } catch {
    return {};
  }
}

function clampText(value, max) {
  return String(value || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max);
}

function createEntityId(prefix) {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const token = [...bytes].map((byte) => byte.toString(36).padStart(2, '0')).join('').slice(0, 12);
  return `${prefix}_${Date.now().toString(36)}_${token}`;
}

function generateKey() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let key = '';
  for (let index = 0; index < 8; index += 1) {
    if (index === 4) key += '-';
    key += CHARSET[bytes[index] % CHARSET.length];
  }
  return key;
}

function isValidSyncKey(key) {
  return /^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/.test(String(key || '').trim().toUpperCase());
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

function normalizeQuizDifficulty(value) {
  const normalized = String(value || 'easy').trim().toLowerCase();
  return ALLOWED_QUIZ_DIFFICULTIES.has(normalized) ? normalized : 'easy';
}

function normalizeQuizSet(value) {
  const normalized = String(value || '10').trim().toLowerCase();
  return ALLOWED_QUIZ_SETS.has(normalized) ? normalized : '10';
}

function requireSameOriginWrite(request) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) return null;
  const origin = request.headers.get('Origin');
  if (!origin) return null;
  if (!getRequestOrigin(request)) return json({ error: 'Cross-origin writes are not allowed' }, { status: 403 }, request);
  return null;
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
  const mimeType = match[1].toLowerCase();
  if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) return null;
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(match[2])) return null;

  return {
    mimeType,
    base64: match[2],
    normalized,
  };
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  if (binary.length > MAX_IMAGE_DATA_URL_LENGTH) throw new Error('Image upload is too large');
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

// The data: URL only tells us what the client *claims* the type is. Verify the
// decoded bytes actually begin with the matching magic number so a non-image
// (or a mismatched type) can't be stored and later served under an image/* label.
function imageBytesMatchMime(bytes, mimeType) {
  if (bytes.length < 12) return false;
  if (mimeType === 'image/jpeg') {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === 'image/png') {
    return (
      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
      bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
    );
  }
  if (mimeType === 'image/webp') {
    // "RIFF" .... "WEBP"
    return (
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
    );
  }
  return false;
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function extensionFromMime(mimeType) {
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  return 'bin';
}

function galleryImageUrl(request, imageKey) {
  return `${new URL(request.url).origin}/api/community/fan-gallery/images/${encodeURIComponent(imageKey)}`;
}

async function purgeExpiredSyncEntries(db) {
  await db.prepare('DELETE FROM sync_entries WHERE expires_at <= ?').bind(Date.now()).run();
}

async function handleSyncCreate(request, env) {
  if (request.method === 'OPTIONS') return empty(200, {}, request, 'POST, OPTIONS');
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
    const normalizedKey = String(existingKey).trim().toUpperCase();
    if (!isValidSyncKey(normalizedKey)) {
      return json({ error: 'Invalid sync key format' }, { status: 400 });
    }

    await env.DB.prepare(
      `INSERT INTO sync_entries (key, payload, expires_at, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET
         payload = excluded.payload,
         expires_at = excluded.expires_at,
         updated_at = excluded.updated_at`,
    ).bind(normalizedKey, payload, expiresAt, Date.now()).run();
    return json({ key: normalizedKey });
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
  if (request.method === 'OPTIONS') return empty(200, {}, request, 'GET, OPTIONS');
  if (request.method !== 'GET') return methodNotAllowed(['GET', 'OPTIONS']);

  const url = new URL(request.url);
  const key = url.searchParams.get('key') || '';
  const peek = url.searchParams.get('peek') === 'true';
  if (!key) return json({ error: 'Missing key parameter' }, { status: 400 });
  const normalizedKey = key.trim().toUpperCase();
  if (!isValidSyncKey(normalizedKey)) return json({ error: 'Invalid key parameter' }, { status: 400 });

  await purgeExpiredSyncEntries(env.DB);
  const row = await env.DB.prepare(
    'SELECT payload FROM sync_entries WHERE key = ? AND expires_at > ?',
  ).bind(normalizedKey, Date.now()).first();

  if (!row) return json({ error: 'Key not found or expired' }, { status: 404 });
  if (!peek) await env.DB.prepare('DELETE FROM sync_entries WHERE key = ?').bind(normalizedKey).run();

  return json(
    { data: JSON.parse(row.payload) },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } },
  );
}

async function handleReadsIncrement(request, env) {
  if (request.method === 'OPTIONS') return empty(200, {}, request, 'POST, OPTIONS');
  if (request.method !== 'POST') return methodNotAllowed(['POST', 'OPTIONS']);

  const body = await readJson(request, MAX_READS_JSON_BODY_LENGTH);
  if (body.chapter === undefined || body.chapter === null) {
    return json({ error: 'Missing chapter number' }, { status: 400 });
  }

  const chapterNumber = Number(body.chapter);
  if (!Number.isFinite(chapterNumber) || chapterNumber <= 0 || chapterNumber > 999) {
    return json({ error: 'Invalid chapter number' }, { status: 400 });
  }
  const chapter = String(chapterNumber);
  await env.DB.prepare(
    `INSERT INTO read_counts (chapter, count)
     VALUES (?, 1)
     ON CONFLICT(chapter) DO UPDATE SET count = read_counts.count + 1`,
  ).bind(chapter).run();

  const row = await env.DB.prepare('SELECT count FROM read_counts WHERE chapter = ?').bind(chapter).first();
  return json({ chapter: body.chapter, count: Number(row?.count) || 0 });
}

async function handleReadsTop(request, env) {
  if (request.method === 'OPTIONS') return empty(200, {}, request, 'GET, OPTIONS');
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
  if (request.method === 'OPTIONS') return empty(200, {}, request, 'GET, POST, OPTIONS');
  if (!['GET', 'POST'].includes(request.method)) return methodNotAllowed(['GET', 'POST', 'OPTIONS']);

  if (request.method === 'POST') {
    const body = await readJson(request, MAX_QUIZ_JSON_BODY_LENGTH);
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
    id: String(row.id || createEntityId('quiz')),
    name: normalizeName(row.name),
    score: Number(row.score) || 0,
    total: Math.max(1, Number(row.total) || 1),
    difficultyMode: normalizeQuizDifficulty(row.difficultyMode),
    questionSet: normalizeQuizSet(row.questionSet),
    playedAt: Number(row.playedAt) || Date.now(),
  };
}

async function handleQuizResults(request, env) {
  if (request.method === 'OPTIONS') return empty(200, {}, request, 'GET, POST, OPTIONS');
  if (!['GET', 'POST'].includes(request.method)) return methodNotAllowed(['GET', 'POST', 'OPTIONS']);

  if (request.method === 'POST') {
    const body = await readJson(request, MAX_QUIZ_JSON_BODY_LENGTH);
    const payload = {
      id: clampText(body.id, 80) || createEntityId('quiz'),
      name: normalizeName(body.name),
      score: Number(body.score),
      total: Number(body.total),
      difficultyMode: normalizeQuizDifficulty(body.difficultyMode),
      questionSet: normalizeQuizSet(body.questionSet),
      playedAt: Number(body.playedAt) || Date.now(),
    };

    if (!Number.isFinite(payload.score) || payload.score < 0) return json({ error: 'Invalid score' }, { status: 400 });
    if (!Number.isFinite(payload.total) || payload.total <= 0 || payload.total > 500) return json({ error: 'Invalid total' }, { status: 400 });
    if (payload.score > payload.total) return json({ error: 'Invalid score' }, { status: 400 });

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
  if (request.method === 'OPTIONS') return empty(200, {}, request, 'GET, POST, OPTIONS');
  if (!['GET', 'POST'].includes(request.method)) return methodNotAllowed(['GET', 'POST', 'OPTIONS']);

  let insertedId = null;
  if (request.method === 'POST') {
    const body = await readJson(request, MAX_COMMUNITY_JSON_BODY_LENGTH);
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
  if (request.method === 'OPTIONS') return empty(200, {}, request, 'GET, OPTIONS');
  if (request.method !== 'GET') return methodNotAllowed(['GET', 'OPTIONS']);
  if (!env.FAN_GALLERY_BUCKET) return json({ error: 'Fan gallery bucket is not configured' }, { status: 500 });
  if (!/^fan-gallery\/fan_[a-z0-9_]+?\.(?:jpg|png|webp)$/.test(imageKey)) {
    return json({ error: 'Image not found' }, { status: 404 });
  }

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
  if (request.method === 'OPTIONS') return empty(200, {}, request, 'GET, POST, OPTIONS');
  if (!['GET', 'POST'].includes(request.method)) return methodNotAllowed(['GET', 'POST', 'OPTIONS']);

  let entryId = null;
  if (request.method === 'POST') {
    if (!env.FAN_GALLERY_BUCKET) return json({ error: 'Fan gallery bucket is not configured' }, { status: 500 });

    const body = await readJson(request, MAX_IMAGE_DATA_URL_LENGTH);
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
      const mimeType = parsedImage.mimeType;
      const width = normalizePositiveInt(body.width);
      const height = normalizePositiveInt(body.height);
      const imageKey = `fan-gallery/${entryId}.${extensionFromMime(parsedImage.mimeType)}`;
      const imageUrl = galleryImageUrl(request, imageKey);

      let imageBytes;
      try {
        imageBytes = base64ToBytes(parsedImage.base64);
      } catch {
        return json({ error: 'Image upload is too large' }, { status: 413 });
      }

      if (!imageBytesMatchMime(imageBytes, parsedImage.mimeType)) {
        return json({ error: 'A valid image upload is required' }, { status: 400 });
      }

      await env.FAN_GALLERY_BUCKET.put(imageKey, imageBytes, {
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
  if (request.method === 'OPTIONS') return empty(200, {}, request, 'GET, OPTIONS');
  if (request.method !== 'GET') return methodNotAllowed(['GET', 'OPTIONS']);

  const countryCode = String(request.headers.get('cf-ipcountry') || '').trim().toUpperCase();
  return json(
    { countryCode: /^[A-Z]{2}$/.test(countryCode) ? countryCode : null },
    { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' } },
  );
}

async function handleApiRequest(request, env) {
  const originError = requireSameOriginWrite(request);
  if (originError) return originError;

  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';

  try {
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
  } catch (error) {
    const message = String(error?.message || '');
    if (message.includes('too large')) return json({ error: 'Request body too large' }, { status: 413 }, request);
    if (message.includes('application/json')) return json({ error: 'Expected application/json' }, { status: 415 }, request);
    return json({ error: 'Bad request' }, { status: 400 }, request);
  }

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
    if (url.pathname.startsWith('/api/')) return addSecurityHeaders(await handleApiRequest(request, env), request);
    if (isMediaR2Path(url.pathname)) {
      return addSecurityHeaders(await handleMediaAsset(request, env, url.pathname), request);
    }
    return addSecurityHeaders(await env.ASSETS.fetch(request), request);
  },
};
