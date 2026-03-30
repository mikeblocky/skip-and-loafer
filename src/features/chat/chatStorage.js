import { PORTRAIT_DATA } from '../mystery/mysteryData';
import { MAX_DRAWING_DATA_URL_LENGTH } from './chatConstants';
import { FALLBACK_COLORS, getPaletteByIndex } from './chatPalette';

export { getPaletteByIndex };

// Storage Keys
const PROFILE_STORAGE_KEY = 'skip_chat_profile_v1';
const MEMBERSHIP_STORAGE_KEY = 'skip_chat_memberships_v1';
const CREATOR_TOKEN_STORAGE_KEY = 'skip_chat_creator_tokens_v1';
const LAST_ROOM_STORAGE_KEY = 'skip_chat_last_room_v1';
const LEGACY_LAST_ROOM_STORAGE_KEY = 'skip_chat_lastRoom_v1';
const ROOM_LIST_STORAGE_KEY = 'skip_chat_room_list_v1';
const CHAT_DEVICE_ID_KEY = 'skip_chat_device_id_v1';
const CATALOG_CACHE_STORAGE_KEY = 'skip_chat_catalog_cache_v1';
const ROOM_PINS_STORAGE_KEY = 'skip_chat_room_pins_v1';
const IDENTITY_KEYS_STORAGE_KEY = 'skip_chat_identity_keys_v1';
const CHAT_OPEN_STATE_KEY = 'skip_chat_open_state_v1';
const STORAGE_PREFIX_ENTRY_TIME = 'skip_chat_entry_time_';
const MISSING_ROOM_IDS_STORAGE_KEY = 'skip_chat_missing_rooms_v1';


export function readChatOpenState() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(CHAT_OPEN_STATE_KEY) === 'true';
}

export function writeChatOpenState(isOpen) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CHAT_OPEN_STATE_KEY, isOpen ? 'true' : 'false');
}

export function readEntryTime(roomId) {
  if (typeof window === 'undefined' || !roomId) return null;
  const val = window.localStorage.getItem(`${STORAGE_PREFIX_ENTRY_TIME}${roomId}`);
  return val ? parseInt(val, 10) : null;
}

export function writeEntryTime(roomId, time) {
  if (typeof window === 'undefined' || !roomId) return;
  if (!time) {
    window.localStorage.removeItem(`${STORAGE_PREFIX_ENTRY_TIME}${roomId}`);
  } else {
    window.localStorage.setItem(`${STORAGE_PREFIX_ENTRY_TIME}${roomId}`, String(time));
  }
}

function safeJsonParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function readMissingRoomIdsMap() {
  if (typeof window === 'undefined') return {};
  return safeJsonParse(window.localStorage.getItem(MISSING_ROOM_IDS_STORAGE_KEY), {});
}

function writeMissingRoomIdsMap(nextMap) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MISSING_ROOM_IDS_STORAGE_KEY, JSON.stringify(nextMap || {}));
}

export function getNormalizedRoomId(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

export const defaultProfile = {
  characterName: 'Mitsumi',
  paletteIndex: 5,
  messageDirection: 'right', // 'right' or 'left'
};

export function readProfile() {
  if (typeof window === 'undefined') return defaultProfile;
  const storedRaw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!storedRaw) return defaultProfile;

  const stored = safeJsonParse(storedRaw, {});
  const merged = { ...defaultProfile };
  
  if (stored.characterName) merged.characterName = String(stored.characterName);
  if (typeof stored.paletteIndex === 'number') {
    merged.paletteIndex = stored.paletteIndex;
  } else if (typeof stored.paletteIndex === 'string' && !isNaN(parseInt(stored.paletteIndex))) {
    merged.paletteIndex = parseInt(stored.paletteIndex, 10);
  }

  // Final fallback verification
  if (!merged.characterName || !PORTRAIT_DATA.some(p => p.name === merged.characterName)) {
    merged.characterName = defaultProfile.characterName;
  }
  
  if (typeof merged.paletteIndex !== 'number' || merged.paletteIndex < 0) {
    const charIndex = PORTRAIT_DATA.findIndex(p => p.name === merged.characterName);
    merged.paletteIndex = charIndex >= 0 ? charIndex % FALLBACK_COLORS.length : 0;
  }

  if (stored.messageDirection === 'left' || stored.messageDirection === 'right') {
    merged.messageDirection = stored.messageDirection;
  }

  return merged;
}

export function writeProfile(profile) {
  if (typeof window === 'undefined') return;
  if (!profile) return;
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
  if (typeof window !== 'undefined') {
    const syncKey = window.localStorage.getItem('skip_syncKey');
    if (syncKey) {
      // Use the global sync key to provide a consistent identity across devices
      return `u_${syncKey.trim().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15)}`;
    }
  }

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

export function readMemberships() {
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
  const current = window.localStorage.getItem(LAST_ROOM_STORAGE_KEY);
  if (current) return current;
  // Fallback to legacy key
  const legacy = window.localStorage.getItem(LEGACY_LAST_ROOM_STORAGE_KEY);
  if (legacy) {
    // Migration
    window.localStorage.setItem(LAST_ROOM_STORAGE_KEY, legacy);
    window.localStorage.removeItem(LEGACY_LAST_ROOM_STORAGE_KEY);
    return legacy;
  }
  return '';
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

export function isRoomMarkedMissing(roomId) {
  const normalizedId = getNormalizedRoomId(roomId);
  if (!normalizedId) return false;
  return !!readMissingRoomIdsMap()[normalizedId];
}

export function markRoomMissing(roomId) {
  const normalizedId = getNormalizedRoomId(roomId);
  if (!normalizedId) return;
  const current = readMissingRoomIdsMap();
  current[normalizedId] = Date.now();
  writeMissingRoomIdsMap(current);
}

export function clearMissingRoomMark(roomId) {
  const normalizedId = getNormalizedRoomId(roomId);
  if (!normalizedId) return;
  const current = readMissingRoomIdsMap();
  if (!current[normalizedId]) return;
  delete current[normalizedId];
  writeMissingRoomIdsMap(current);
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
  const date = new Date(value);
  const now = new Date();
  const diffHrs = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  const timeStr = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date).toLowerCase();

  if (diffHrs > 24) {
    const dateStr = new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
    }).format(date);
    return `${dateStr}, ${timeStr}`;
  }

  return timeStr;
}

export function sanitizeDrawingDataUrl(value) {
  const normalized = String(value || '').trim();
  if (!normalized.startsWith('data:image/png;base64,')) return '';
  if (normalized.length > MAX_DRAWING_DATA_URL_LENGTH) return '';
  return normalized;
}
