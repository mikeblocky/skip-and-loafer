const CACHE_TTL_MS = 30_000;

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

export function shouldUseDevFallback(error) {
  return !!import.meta.env.DEV && (error?.status === 404 || error instanceof TypeError);
}

export { parseResponse };

export function createCachedResource({ loadEntries, cacheKey, pendingKey, fingerprint }) {
  let cache = null;
  let request = null;
  let updatedAt = 0;

  const writeCache = (entries) => {
    cache = Array.isArray(entries) ? entries : [];
    updatedAt = Date.now();
    try { localStorage.setItem(cacheKey, JSON.stringify(cache)); } catch {}

    if (pendingKey && fingerprint) {
      try {
        const serverPrints = new Set(cache.map(fingerprint));
        const pending = JSON.parse(localStorage.getItem(pendingKey) || '[]');
        const stillPending = pending.filter((e) => !serverPrints.has(fingerprint(e)));
        localStorage.setItem(pendingKey, JSON.stringify(stillPending));
      } catch {}
    }

    return cache;
  };

  const readCache = () => {
    if (cache == null) {
      try {
        const raw = localStorage.getItem(cacheKey);
        cache = raw ? JSON.parse(raw) : [];
      } catch {
        cache = [];
      }
    }
    const current = cache || [];

    if (pendingKey && fingerprint) {
      try {
        const serverPrints = new Set(current.map(fingerprint));
        const pending = JSON.parse(localStorage.getItem(pendingKey) || '[]');
        const uniquePending = pending.filter((e) => !serverPrints.has(fingerprint(e)));
        return [...uniquePending, ...current];
      } catch {}
    }

    return current;
  };

  const fetchEntries = async ({ force = false, maxAgeMs = CACHE_TTL_MS } = {}) => {
    if (!navigator.onLine) return readCache();
    const isFresh = cache != null && Number.isFinite(maxAgeMs) && (Date.now() - updatedAt) <= maxAgeMs;
    if (!force && isFresh) return cache;
    if (request) return request;

    request = loadEntries()
      .then(writeCache)
      .finally(() => { request = null; });

    return request;
  };

  return { readCache, writeCache, fetchEntries };
}
