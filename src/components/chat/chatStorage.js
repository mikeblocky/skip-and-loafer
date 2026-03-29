import { FALLBACK_COLORS, PORTRAIT_DATA } from '../mystery/mysteryData';
import { MAX_DRAWING_DATA_URL_LENGTH } from './chatConstants';

const PROFILE_STORAGE_KEY = 'skip_chat_profile_v1';
const MEMBERSHIP_STORAGE_KEY = 'skip_chat_memberships_v1';
const CREATOR_TOKEN_STORAGE_KEY = 'skip_chat_creator_tokens_v1';
const LAST_ROOM_STORAGE_KEY = 'skip_chat_lastRoom_v1';
const ROOM_LIST_STORAGE_KEY = 'skip_chat_room_list_v1';
const CHAT_DEVICE_ID_KEY = 'skip_chat_device_id_v1';
const CATALOG_CACHE_STORAGE_KEY = 'skip_chat_catalog_cache_v1';
const ROOM_PINS_STORAGE_KEY = 'skip_chat_room_pins_v1';
const IDENTITY_KEYS_STORAGE_KEY = 'skip_chat_identity_keys_v1';

function safeJsonParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function getNormalizedRoomId(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

export function readProfile() {
  if (typeof window === 'undefined') {
    return {
      characterName: PORTRAIT_DATA[0]?.name || '',
    };
  }

  const stored = safeJsonParse(window.localStorage.getItem(PROFILE_STORAGE_KEY), {});
  return {
    characterName: PORTRAIT_DATA[0]?.name || '',
    ...stored,
  };
}

export function writeProfile(profile) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

function getOrCreateDeviceId() {
  if (typeof window === 'undefined') return '';
  let deviceId = window.localStorage.getItem(CHAT_DEVICE_ID_KEY);
  if (!deviceId) {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      deviceId = crypto.randomUUID();
    } else {
      deviceId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    }
    window.localStorage.setItem(CHAT_DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

export function getUniversalUserId() {
  const deviceId = getOrCreateDeviceId();
  if (!deviceId) return '';
  return `u_${deviceId.slice(0, 12).replace(/-/g, '')}`;
}

export function readCatalogCache() {
  if (typeof window === 'undefined') return {};
  return safeJsonParse(window.localStorage.getItem(CATALOG_CACHE_STORAGE_KEY), {});
}

export function writeCatalogCache(nextCache) {
  if (typeof window === 'undefined') return;
  const entries = Object.entries(nextCache || {});
  const pruned = Object.fromEntries(entries.slice(-30));
  window.localStorage.setItem(CATALOG_CACHE_STORAGE_KEY, JSON.stringify(pruned));
}

function readMemberships() {
  if (typeof window === 'undefined') return {};
  return safeJsonParse(window.localStorage.getItem(MEMBERSHIP_STORAGE_KEY), {});
}

function readRoomPins() {
  if (typeof window === 'undefined') return {};
  return safeJsonParse(window.localStorage.getItem(ROOM_PINS_STORAGE_KEY), {});
}

export function writeRoomPin(roomId, pin) {
  if (typeof window === 'undefined' || !roomId || !pin) return;
  const pins = readRoomPins();
  pins[getNormalizedRoomId(roomId)] = pin;
  window.localStorage.setItem(ROOM_PINS_STORAGE_KEY, JSON.stringify(pins));
}

export function getStoredRoomPin(roomId) {
  return readRoomPins()[getNormalizedRoomId(roomId)] || '';
}

function readIdentityKeys() {
  if (typeof window === 'undefined') return {};
  return safeJsonParse(window.localStorage.getItem(IDENTITY_KEYS_STORAGE_KEY), {});
}

export function writeIdentityKey(roomId, key) {
  if (typeof window === 'undefined' || !roomId || !key) return;
  const keys = readIdentityKeys();
  keys[getNormalizedRoomId(roomId)] = key;
  window.localStorage.setItem(IDENTITY_KEYS_STORAGE_KEY, JSON.stringify(keys));
}

export function getStoredIdentityKey(roomId) {
  return readIdentityKeys()[getNormalizedRoomId(roomId)] || '';
}

function readCreatorTokens() {
  if (typeof window === 'undefined') return {};
  return safeJsonParse(window.localStorage.getItem(CREATOR_TOKEN_STORAGE_KEY), {});
}

function writeMemberships(nextMemberships) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MEMBERSHIP_STORAGE_KEY, JSON.stringify(nextMemberships));
}

function writeCreatorTokens(nextTokens) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CREATOR_TOKEN_STORAGE_KEY, JSON.stringify(nextTokens));
}

export function setStoredParticipant(roomId, participantId) {
  const normalizedId = getNormalizedRoomId(roomId);
  if (!normalizedId) return;
  const memberships = readMemberships();
  memberships[normalizedId] = participantId;
  writeMemberships(memberships);
}

export function removeStoredParticipant(roomId) {
  const normalizedId = getNormalizedRoomId(roomId);
  if (!normalizedId) return;
  const memberships = readMemberships();
  delete memberships[normalizedId];
  writeMemberships(memberships);
}

export function getStoredParticipant(roomId) {
  return readMemberships()[getNormalizedRoomId(roomId)] || '';
}

export function setStoredCreatorToken(roomId, creatorToken) {
  const normalizedId = getNormalizedRoomId(roomId);
  if (!normalizedId) return;
  const tokens = readCreatorTokens();
  tokens[normalizedId] = creatorToken;
  writeCreatorTokens(tokens);
}

export function getStoredCreatorToken(roomId) {
  return readCreatorTokens()[getNormalizedRoomId(roomId)] || '';
}

export function removeStoredCreatorToken(roomId) {
  const normalizedId = getNormalizedRoomId(roomId);
  if (!normalizedId) return;
  const tokens = readCreatorTokens();
  delete tokens[normalizedId];
  writeCreatorTokens(tokens);
}

export function readLastRoomId() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(LAST_ROOM_STORAGE_KEY) || '';
}

export function readSavedRoomIds() {
  if (typeof window === 'undefined') return [];
  const stored = safeJsonParse(window.localStorage.getItem(ROOM_LIST_STORAGE_KEY), []);
  const membershipIds = Object.keys(readMemberships());
  const allIds = [...(Array.isArray(stored) ? stored : []), ...membershipIds]
    .map(getNormalizedRoomId)
    .filter(Boolean);
  return [...new Set(allIds)];
}

export function writeSavedRoomIds(roomIds) {
  if (typeof window === 'undefined') return;
  const normalized = (roomIds || []).map(getNormalizedRoomId).filter(Boolean);
  window.localStorage.setItem(ROOM_LIST_STORAGE_KEY, JSON.stringify(normalized));
}

export function writeLastRoomId(roomId) {
  if (typeof window === 'undefined') return;
  const normalizedId = getNormalizedRoomId(roomId);
  if (normalizedId) {
    window.localStorage.setItem(LAST_ROOM_STORAGE_KEY, normalizedId);
  } else {
    window.localStorage.removeItem(LAST_ROOM_STORAGE_KEY);
  }
}

export function createParticipantId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `participant_${crypto.randomUUID()}`;
  }

  return `participant_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeRoomCode(value) {
  const cleaned = String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);

  if (cleaned.length <= 4) return cleaned;
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
}

export function formatTime(value) {
  if (!value) return '';

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function getPaletteByIndex(index) {
  return FALLBACK_COLORS[Math.max(index, 0) % FALLBACK_COLORS.length];
}

export function sanitizeDrawingDataUrl(value) {
  const normalized = String(value || '').trim();
  if (!normalized.startsWith('data:image/png;base64,')) return '';
  if (normalized.length > MAX_DRAWING_DATA_URL_LENGTH) return '';
  return normalized;
}
