import { listDevFanGalleryEntries, addDevFanGalleryEntry } from './communityDevStore';
import { createCachedResource, parseResponse, shouldUseDevFallback } from './communityCache';

const resource = createCachedResource({
  cacheKey: 'skip_fangallery_v2',
  pendingKey: 'skip_pending_gallery_v2',
  fingerprint: (e) => `${String(e.name || '').trim()}|${String(e.description || '').trim()}`,
  loadEntries: async () => {
    const response = await fetch('/api/community/fan-gallery', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const payload = await parseResponse(response);
    return Array.isArray(payload.entries) ? payload.entries : [];
  },
});

export function getCachedFanGalleryEntries() {
  return resource.readCache();
}

export async function fetchFanGalleryEntries(options) {
  try {
    return await resource.fetchEntries(options);
  } catch (error) {
    if (shouldUseDevFallback(error)) return listDevFanGalleryEntries();
    throw error;
  }
}

export async function createFanGalleryEntry(body) {
  try {
    if (!navigator.onLine) throw new TypeError('Failed to fetch (offline)');

    const response = await fetch('/api/community/fan-gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const payload = await parseResponse(response);
    const entries = resource.writeCache(payload.entries);
    return { entry: payload.entry || null, entries };
  } catch (error) {
    if (shouldUseDevFallback(error)) {
      const result = addDevFanGalleryEntry(body);
      resource.writeCache(result.entries);
      return result;
    }
    console.error('Failed to post drawing, queuing offline:', error);
    const { enqueueFanGallery } = await import('../../utils/offlineSync');
    const entry = enqueueFanGallery(body);
    return { entry, entries: resource.readCache() };
  }
}
