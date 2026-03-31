import {
  addDevFanGalleryEntry,
  addDevSignature,
  listDevFanGalleryEntries,
  listDevSignatures,
} from './communityDevStore';

let signaturesCache = null;
let signaturesRequest = null;
let fanGalleryCache = null;
let fanGalleryRequest = null;

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

export function getCachedSignatures() {
  return signaturesCache;
}

export function getCachedFanGalleryEntries() {
  return fanGalleryCache;
}

export async function fetchSignatures({ force = false } = {}) {
  if (!force && signaturesCache) return signaturesCache;
  if (!force && signaturesRequest) return signaturesRequest;

  signaturesRequest = requestSignatures()
    .then((entries) => {
      signaturesCache = entries;
      return entries;
    })
    .finally(() => {
      signaturesRequest = null;
    });

  return signaturesRequest;
}

export async function preloadSignatures() {
  return fetchSignatures();
}

export async function refreshSignatures() {
  return fetchSignatures({ force: true });
}

export async function createSignature(body) {
  try {
    const response = await fetch('/api/community/signatures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const payload = await parseResponse(response);
    signaturesCache = Array.isArray(payload.signatures) ? payload.signatures : [];
    return {
      entry: payload.entry || null,
      signatures: signaturesCache,
    };
  } catch (error) {
    if (shouldUseDevFallback(error)) {
      const result = addDevSignature(body);
      signaturesCache = result.signatures;
      return result;
    }
    throw error;
  }
}

export async function fetchFanGalleryEntries({ force = false } = {}) {
  if (!force && fanGalleryCache) return fanGalleryCache;
  if (!force && fanGalleryRequest) return fanGalleryRequest;

  fanGalleryRequest = requestFanGalleryEntries()
    .then((entries) => {
      fanGalleryCache = entries;
      return entries;
    })
    .finally(() => {
      fanGalleryRequest = null;
    });

  return fanGalleryRequest;
}

export async function preloadFanGalleryEntries() {
  return fetchFanGalleryEntries();
}

export async function refreshFanGalleryEntries() {
  return fetchFanGalleryEntries({ force: true });
}

export async function createFanGalleryEntry(body) {
  try {
    const response = await fetch('/api/community/fan-gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const payload = await parseResponse(response);
    fanGalleryCache = Array.isArray(payload.entries) ? payload.entries : [];
    return {
      entry: payload.entry || null,
      entries: fanGalleryCache,
    };
  } catch (error) {
    if (shouldUseDevFallback(error)) {
      const result = addDevFanGalleryEntry(body);
      fanGalleryCache = result.entries;
      return result;
    }
    throw error;
  }
}
