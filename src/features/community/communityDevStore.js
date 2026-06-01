const SIGNATURES_KEY = 'skip_dev_signatures_v1';
const FAN_GALLERY_KEY = 'skip_dev_fanGallery_v1';
const SIGNATURE_LIMIT = 80;
const FAN_GALLERY_LIMIT = 20;

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readArray(key) {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeArray(key, value) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore local dev storage issues
  }
}

function createId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso() {
  return new Date().toISOString();
}

export function listDevSignatures() {
  return readArray(SIGNATURES_KEY);
}

export function addDevSignature(body) {
  const type = body?.type === 'pride' ? 'pride' : 'sign';
  const entry = {
    id: createId(type),
    name: String(body?.name || '').trim().slice(0, 48),
    message: String(body?.message || '').trim().slice(0, 280),
    type,
    createdAt: nowIso(),
  };

  const next = [entry, ...readArray(SIGNATURES_KEY)].slice(0, SIGNATURE_LIMIT);
  writeArray(SIGNATURES_KEY, next);
  return { entry, signatures: next };
}

export function listDevFanGalleryEntries() {
  return readArray(FAN_GALLERY_KEY);
}

export function addDevFanGalleryEntry(body) {
  const entry = {
    id: createId('fan'),
    name: String(body?.name || '').trim().slice(0, 60),
    description: String(body?.description || '').trim().slice(0, 240),
    imageDataUrl: String(body?.imageDataUrl || ''),
    mimeType: String(body?.mimeType || '').trim().slice(0, 24),
    width: Number(body?.width) || null,
    height: Number(body?.height) || null,
    createdAt: nowIso(),
  };

  const next = [entry, ...readArray(FAN_GALLERY_KEY)].slice(0, FAN_GALLERY_LIMIT);
  writeArray(FAN_GALLERY_KEY, next);
  return { entry, entries: next };
}
