import { PWA_SYNC_COMPLETE_EVENT, PWA_SYNC_IDLE_EVENT, PWA_SYNC_START_EVENT } from './pwaEvents.js';

const PENDING_READS_KEY = 'skip_pending_reads';
const PENDING_SIGS_KEY = 'skip_pending_signatures_v2';
const PENDING_GALLERY_KEY = 'skip_pending_gallery_v2';
const SIGNATURES_CACHE_KEY = 'skip_signatures_v2';
const FAN_GALLERY_CACHE_KEY = 'skip_fangallery_v2';

// Clear stale pre-v2 queues so they never get re-submitted
try {
  localStorage.removeItem('skip_pending_signatures');
  localStorage.removeItem('skip_pending_gallery');
} catch {};

const getQueue = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveQueue = (key, queue) => {
  try {
    localStorage.setItem(key, JSON.stringify(queue));
  } catch (e) {
    console.error(`Failed to save offline queue for ${key}`, e);
  }
};

const dispatchOfflineQueueChange = (type) => {
  try {
    window.dispatchEvent(new CustomEvent('skip_offline_queue_change', { detail: { type } }));
  } catch {}
};

export const enqueueReadIncrement = (chapterNumber) => {
  const queue = getQueue(PENDING_READS_KEY);
  queue.push(chapterNumber);
  saveQueue(PENDING_READS_KEY, queue);
};

export const enqueueSignature = (signature) => {
  const queue = getQueue(PENDING_SIGS_KEY);
  const tempId = `temp_sign_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const entry = {
    ...signature,
    id: tempId,
    createdAt: new Date().toISOString(),
    isPending: true,
  };
  queue.push(entry);
  saveQueue(PENDING_SIGS_KEY, queue);
  dispatchOfflineQueueChange('signatures');
  return entry;
};

export const enqueueFanGallery = (entry) => {
  const queue = getQueue(PENDING_GALLERY_KEY);
  const tempId = `temp_fan_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const pendingEntry = {
    ...entry,
    id: tempId,
    createdAt: new Date().toISOString(),
    isPending: true,
  };
  queue.push(pendingEntry);
  saveQueue(PENDING_GALLERY_KEY, queue);
  dispatchOfflineQueueChange('gallery');
  return pendingEntry;
};

export const getPendingOfflineRequestCount = () =>
  getQueue(PENDING_READS_KEY).length + getQueue(PENDING_SIGS_KEY).length + getQueue(PENDING_GALLERY_KEY).length;

export const getPendingSignatures = () => getQueue(PENDING_SIGS_KEY);

export const getPendingFanGalleryEntries = () => getQueue(PENDING_GALLERY_KEY);

// Custom event to trigger UI re-sync after background syncing completes
export const triggerOfflineSyncComplete = (type) => {
  const event = new CustomEvent(PWA_SYNC_COMPLETE_EVENT, { detail: { type } });
  window.dispatchEvent(event);
};

let isSyncing = false;

export const flushPendingRequests = async () => {
  if (isSyncing || !navigator.onLine) return;
  isSyncing = true;
  window.dispatchEvent(new CustomEvent(PWA_SYNC_START_EVENT, {
    detail: { pending: getPendingOfflineRequestCount() },
  }));

  try {
    // 1. Flush Pending Reads
    const reads = getQueue(PENDING_READS_KEY);
    if (reads.length > 0) {
      const remainingReads = [];
      for (const chapter of reads) {
        try {
          const response = await fetch('/api/reads/increment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chapter }),
          });
          if (!response.ok) throw new Error('API error');
        } catch (e) {
          remainingReads.push(chapter);
        }
      }
      saveQueue(PENDING_READS_KEY, remainingReads);
      triggerOfflineSyncComplete('reads');
    }

    // 2. Flush Pending Signatures
    const sigs = getQueue(PENDING_SIGS_KEY);
    if (sigs.length > 0) {
      const remainingSigs = [];
      let updatedSignatures = null;
      for (const sig of sigs) {
        try {
          const response = await fetch('/api/community/signatures', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: sig.name,
              message: sig.message,
              type: sig.type,
            }),
          });
          if (!response.ok) throw new Error('API error');
          const payload = await response.json();
          updatedSignatures = payload.signatures;
        } catch (e) {
          remainingSigs.push(sig);
        }
      }
      saveQueue(PENDING_SIGS_KEY, remainingSigs);
      if (updatedSignatures) {
        // Write the new server state to localStorage cache
        try {
          localStorage.setItem(SIGNATURES_CACHE_KEY, JSON.stringify(updatedSignatures));
        } catch {}
        triggerOfflineSyncComplete('signatures');
      }
    }

    // 3. Flush Pending Fan Drawings
    const gallery = getQueue(PENDING_GALLERY_KEY);
    if (gallery.length > 0) {
      const remainingGallery = [];
      let updatedGallery = null;
      for (const entry of gallery) {
        try {
          const response = await fetch('/api/community/fan-gallery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: entry.name,
              description: entry.description,
              imageDataUrl: entry.imageDataUrl,
              mimeType: entry.mimeType,
              width: entry.width,
              height: entry.height,
            }),
          });
          if (!response.ok) throw new Error('API error');
          const payload = await response.json();
          updatedGallery = payload.entries;
        } catch (e) {
          remainingGallery.push(entry);
        }
      }
      saveQueue(PENDING_GALLERY_KEY, remainingGallery);
      if (updatedGallery) {
        try {
          localStorage.setItem(FAN_GALLERY_CACHE_KEY, JSON.stringify(updatedGallery));
        } catch {}
        triggerOfflineSyncComplete('gallery');
      }
    }
  } catch (error) {
    console.error('Offline request queue flushing encountered an error:', error);
  } finally {
    isSyncing = false;
    window.dispatchEvent(new CustomEvent(PWA_SYNC_IDLE_EVENT, {
      detail: { pending: getPendingOfflineRequestCount() },
    }));
  }
};
