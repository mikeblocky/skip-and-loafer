import {
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_QUIZ_DIFFICULTIES,
  ALLOWED_QUIZ_SETS,
  CHARSET,
  MAX_IMAGE_DATA_URL_LENGTH,
} from './constants.js';

const MEDIA_R2_PATHS = new Set(['anime/episode1.mp4']);
const MEDIA_R2_PATH_PATTERNS = [/^gallery\/musical\/.+\.mp4$/i];

export function isMediaR2Path(pathname) {
  const key = pathname.replace(/^\/+/, '');
  if (MEDIA_R2_PATHS.has(key)) return true;
  return MEDIA_R2_PATH_PATTERNS.some((pattern) => pattern.test(key));
}

export function clampText(value, max) {
  // eslint-disable-next-line no-control-regex
  return String(value || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max);
}

export function createEntityId(prefix) {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const token = [...bytes].map((byte) => byte.toString(36).padStart(2, '0')).join('').slice(0, 12);
  return `${prefix}_${Date.now().toString(36)}_${token}`;
}

export function generateKey() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let key = '';
  for (let index = 0; index < 8; index += 1) {
    if (index === 4) key += '-';
    key += CHARSET[bytes[index] % CHARSET.length];
  }
  return key;
}

export function isValidSyncKey(key) {
  return /^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/.test(String(key || '').trim().toUpperCase());
}

export function nowIso() {
  return new Date().toISOString();
}

export function normalizeName(name) {
  const trimmed = String(name || 'Player').trim().slice(0, 24);
  return trimmed || 'Player';
}

export function normalizeScoreToHundred(score) {
  const safeScore = Number(score) || 0;
  return Math.max(0, Math.min(100, safeScore));
}

export function normalizeQuizDifficulty(value) {
  const normalized = String(value || 'easy').trim().toLowerCase();
  return ALLOWED_QUIZ_DIFFICULTIES.has(normalized) ? normalized : 'easy';
}

export function normalizeQuizSet(value) {
  const normalized = String(value || '10').trim().toLowerCase();
  return ALLOWED_QUIZ_SETS.has(normalized) ? normalized : '10';
}

export function normalizePositiveInt(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return null;
  return Math.round(number);
}

export function sortLeaderboard(entries) {
  return [...entries].sort((a, b) => {
    if (normalizeScoreToHundred(b.bestScore) !== normalizeScoreToHundred(a.bestScore)) {
      return normalizeScoreToHundred(b.bestScore) - normalizeScoreToHundred(a.bestScore);
    }
    if ((a.played || 0) !== (b.played || 0)) return (a.played || 0) - (b.played || 0);
    return (a.name || '').localeCompare(b.name || '');
  });
}

export function rowToSignature(row) {
  return {
    id: row.id,
    name: row.name,
    message: row.message,
    type: row.type,
    createdAt: row.created_at,
  };
}

export function rowToFanGalleryEntry(row, url) {
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

export function parseImageDataUrl(value) {
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

export function base64ToBytes(base64) {
  const binary = atob(base64);
  if (binary.length > MAX_IMAGE_DATA_URL_LENGTH) throw new Error('Image upload is too large');
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export function imageBytesMatchMime(bytes, mimeType) {
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
    return (
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
    );
  }
  return false;
}

export async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function extensionFromMime(mimeType) {
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  return 'bin';
}

export function galleryImageUrl(request, imageKey) {
  return `${new URL(request.url).origin}/api/community/fan-gallery/images/${encodeURIComponent(imageKey)}`;
}
