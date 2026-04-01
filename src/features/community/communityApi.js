import {
  addDevFanGalleryEntry,
  addDevSignature,
  listDevFanGalleryEntries,
  listDevSignatures,
} from './communityDevStore';

const COMMUNITY_CACHE_TTL_MS = 30_000;

function createCachedCollectionResource(loadEntries) {
  let cache = null;
  let request = null;
  let updatedAt = 0;

  const writeCache = (entries) => {
    cache = Array.isArray(entries) ? entries : [];
    updatedAt = Date.now();
    return cache;
  };

  const readCache = () => cache;

  const fetchEntries = async ({ force = false, maxAgeMs = COMMUNITY_CACHE_TTL_MS } = {}) => {
    const isFresh = cache != null && Number.isFinite(maxAgeMs) && (Date.now() - updatedAt) <= maxAgeMs;
    if (!force && isFresh) return cache;
    if (request) return request;

    request = loadEntries()
      .then(writeCache)
      .finally(() => {
        request = null;
      });

    return request;
  };

  return {
    readCache,
    writeCache,
    fetchEntries,
  };
}

async function parseResponse(response) {
  let payload = {};

  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok) {
    const error = new Error(payload.error || 'Request failed');
    error.status = response.status;
    throw error;
  }

  return payload;
}

function shouldUseDevFallback(error) {
  return !!import.meta.env.DEV && (error?.status === 404 || error instanceof TypeError);
}

async function requestSignatures() {
  try {
    const response = await fetch('/api/community/signatures', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const payload = await parseResponse(response);
    return Array.isArray(payload.signatures) ? payload.signatures : [];
  } catch (error) {
    if (shouldUseDevFallback(error)) {
      return listDevSignatures();
    }
    throw error;
  }
}

async function requestFanGalleryEntries() {
  try {
    const response = await fetch('/api/community/fan-gallery', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const payload = await parseResponse(response);
    return Array.isArray(payload.entries) ? payload.entries : [];
  } catch (error) {
    if (shouldUseDevFallback(error)) {
      return listDevFanGalleryEntries();
    }
    throw error;
  }
}

const signaturesResource = createCachedCollectionResource(requestSignatures);
const fanGalleryResource = createCachedCollectionResource(requestFanGalleryEntries);

export function getCachedSignatures() {
  return signaturesResource.readCache();
}

export function getCachedFanGalleryEntries() {
  return fanGalleryResource.readCache();
}

export async function fetchSignatures(options) {
  return signaturesResource.fetchEntries(options);
}

export async function createSignature(body) {
  try {
    const response = await fetch('/api/community/signatures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const payload = await parseResponse(response);
    const signatures = signaturesResource.writeCache(payload.signatures);

    return {
      entry: payload.entry || null,
      signatures,
    };
  } catch (error) {
    if (shouldUseDevFallback(error)) {
      const result = addDevSignature(body);
      signaturesResource.writeCache(result.signatures);
      return result;
    }
    throw error;
  }
}

export async function fetchFanGalleryEntries(options) {
  return fanGalleryResource.fetchEntries(options);
}

export async function createFanGalleryEntry(body) {
  try {
    const response = await fetch('/api/community/fan-gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const payload = await parseResponse(response);
    const entries = fanGalleryResource.writeCache(payload.entries);

    return {
      entry: payload.entry || null,
      entries,
    };
  } catch (error) {
    if (shouldUseDevFallback(error)) {
      const result = addDevFanGalleryEntry(body);
      fanGalleryResource.writeCache(result.entries);
      return result;
    }
    throw error;
  }
}
