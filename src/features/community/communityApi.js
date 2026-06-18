import {
  addDevFanGalleryEntry,
  addDevSignature,
  listDevFanGalleryEntries,
  listDevSignatures,
} from './communityDevStore';

const COMMUNITY_CACHE_TTL_MS = 30_000;

function fingerprintSignature(e) { return `${String(e.name || '').trim()}|${String(e.message || '').trim()}`; }
function fingerprintGallery(e) { return `${String(e.name || '').trim()}|${String(e.description || '').trim()}`; }

function createCachedCollectionResource(loadEntries, storageKey) {
  let cache = null;
  let request = null;
  let updatedAt = 0;

  const writeCache = (entries) => {
    cache = Array.isArray(entries) ? entries : [];
    updatedAt = Date.now();
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(cache));
      } catch {}
    }

    // Remove pending items whose content now exists in the server response
    const pendingKey =
      storageKey === 'skip_signatures_cache' ? 'skip_pending_signatures' :
      storageKey === 'skip_fangallery_cache' ? 'skip_pending_gallery' : null;
    const fingerprint = storageKey === 'skip_signatures_cache' ? fingerprintSignature : fingerprintGallery;
    if (pendingKey) {
      try {
        const serverFingerprints = new Set(cache.map(fingerprint));
        const pending = JSON.parse(localStorage.getItem(pendingKey) || '[]');
        const stillPending = pending.filter((e) => !serverFingerprints.has(fingerprint(e)));
        localStorage.setItem(pendingKey, JSON.stringify(stillPending));
      } catch {}
    }

    return cache;
  };

  const readCache = () => {
    if (cache == null && storageKey) {
      try {
        const raw = localStorage.getItem(storageKey);
        cache = raw ? JSON.parse(raw) : [];
      } catch {
        cache = [];
      }
    }
    const currentCache = cache || [];

    if (storageKey === 'skip_signatures_cache') {
      try {
        const serverFingerprints = new Set(currentCache.map(fingerprintSignature));
        const pending = JSON.parse(localStorage.getItem('skip_pending_signatures') || '[]');
        const uniquePending = pending.filter((e) => !serverFingerprints.has(fingerprintSignature(e)));
        return [...uniquePending, ...currentCache];
      } catch {}
    } else if (storageKey === 'skip_fangallery_cache') {
      try {
        const serverFingerprints = new Set(currentCache.map(fingerprintGallery));
        const pending = JSON.parse(localStorage.getItem('skip_pending_gallery') || '[]');
        const uniquePending = pending.filter((e) => !serverFingerprints.has(fingerprintGallery(e)));
        return [...uniquePending, ...currentCache];
      } catch {}
    }

    return currentCache;
  };

  const fetchEntries = async ({ force = false, maxAgeMs = COMMUNITY_CACHE_TTL_MS } = {}) => {
    if (!navigator.onLine) {
      return readCache();
    }
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

const signaturesResource = createCachedCollectionResource(requestSignatures, 'skip_signatures_cache');
const fanGalleryResource = createCachedCollectionResource(requestFanGalleryEntries, 'skip_fangallery_cache');

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
    if (!navigator.onLine) {
      throw new TypeError('Failed to fetch (offline)');
    }
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
    
    // Offline queue fallback
    console.error('Failed to post signature, queuing offline:', error);
    const { enqueueSignature } = await import('../../utils/offlineSync');
    const entry = enqueueSignature(body);
    const signatures = signaturesResource.readCache();
    return {
      entry,
      signatures,
    };
  }
}

export async function fetchFanGalleryEntries(options) {
  return fanGalleryResource.fetchEntries(options);
}

export async function createFanGalleryEntry(body) {
  try {
    if (!navigator.onLine) {
      throw new TypeError('Failed to fetch (offline)');
    }
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
    
    // Offline queue fallback
    console.error('Failed to post drawing, queuing offline:', error);
    const { enqueueFanGallery } = await import('../../utils/offlineSync');
    const entry = enqueueFanGallery(body);
    const entries = fanGalleryResource.readCache();
    return {
      entry,
      entries,
    };
  }
}
