import { listDevSignatures, addDevSignature } from './communityDevStore';
import { createCachedResource, parseResponse, shouldUseDevFallback } from './communityCache';

const resource = createCachedResource({
  cacheKey: 'skip_signatures_v2',
  pendingKey: 'skip_pending_signatures_v2',
  fingerprint: (e) => `${String(e.name || '').trim()}|${String(e.message || '').trim()}`,
  loadEntries: async () => {
    const response = await fetch('/api/community/signatures', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const payload = await parseResponse(response);
    return Array.isArray(payload.signatures) ? payload.signatures : [];
  },
});

export function getCachedSignatures() {
  return resource.readCache();
}

export async function fetchSignatures(options) {
  try {
    return await resource.fetchEntries(options);
  } catch (error) {
    if (shouldUseDevFallback(error)) return listDevSignatures();
    throw error;
  }
}

export async function createSignature(body) {
  try {
    if (!navigator.onLine) throw new TypeError('Failed to fetch (offline)');

    const response = await fetch('/api/community/signatures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const payload = await parseResponse(response);
    const signatures = resource.writeCache(payload.signatures);
    return { entry: payload.entry || null, signatures };
  } catch (error) {
    if (shouldUseDevFallback(error)) {
      const result = addDevSignature(body);
      resource.writeCache(result.signatures);
      return result;
    }
    console.error('Failed to post signature, queuing offline:', error);
    const { enqueueSignature } = await import('../../utils/offlineSync');
    const entry = enqueueSignature(body);
    return { entry, signatures: resource.readCache() };
  }
}
