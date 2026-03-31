import {
  addFanGalleryEntry,
  applyCors,
  clampText,
  connectRedis,
  createEntityId,
  createTimestamp,
  listFanGalleryEntries,
  sendJson,
} from '../../src/server/communityStore.js';

const MAX_IMAGE_DATA_URL_LENGTH = 8000000;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '12mb',
    },
  },
};

function sanitizeImageDataUrl(value) {
  const normalized = String(value || '').trim();
  if (!/^data:image\/[^;]+;base64,/i.test(normalized)) return '';
  if (normalized.length > MAX_IMAGE_DATA_URL_LENGTH) return '';
  return normalized;
}

function normalizePositiveInt(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return null;
  return Math.round(number);
}

function normalizeFanGalleryEntry(rawEntry) {
  const imageDataUrl = sanitizeImageDataUrl(rawEntry?.imageDataUrl);
  return {
    id: String(rawEntry?.id || ''),
    name: clampText(rawEntry?.name, 60),
    description: clampText(rawEntry?.description, 240),
    imageDataUrl,
    mimeType: clampText(rawEntry?.mimeType, 24),
    width: normalizePositiveInt(rawEntry?.width),
    height: normalizePositiveInt(rawEntry?.height),
    createdAt: String(rawEntry?.createdAt || createTimestamp()),
  };
}

export default async function handler(req, res) {
  applyCors(res, 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!['GET', 'POST'].includes(req.method)) return sendJson(res, 405, { error: 'Method not allowed' });

  let client;
  try {
    client = await connectRedis();

    if (req.method === 'GET') {
      const entries = (await listFanGalleryEntries(client))
        .map(normalizeFanGalleryEntry)
        .filter((entry) => entry.id && entry.imageDataUrl);
      return sendJson(res, 200, { entries });
    }

    const imageDataUrl = sanitizeImageDataUrl(req.body?.imageDataUrl);
    const name = clampText(req.body?.name, 60);
    const description = clampText(req.body?.description, 240);
    const mimeType = clampText(req.body?.mimeType, 24);
    const width = normalizePositiveInt(req.body?.width);
    const height = normalizePositiveInt(req.body?.height);

    if (!imageDataUrl) {
      return sendJson(res, 400, { error: 'A sanitized image upload is required' });
    }

    const entry = normalizeFanGalleryEntry({
      id: createEntityId('fan'),
      name,
      description,
      imageDataUrl,
      mimeType,
      width,
      height,
      createdAt: createTimestamp(),
    });

    const entries = await addFanGalleryEntry(client, entry);
    return sendJson(res, 200, { entry, entries });
  } catch (error) {
    console.error('community/fan-gallery error:', error);
    return sendJson(res, 500, { error: error.message || 'Internal server error' });
  } finally {
    if (client) await client.disconnect().catch(() => {});
  }
}

