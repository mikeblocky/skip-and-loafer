import {
  addSignature,
  applyCors,
  clampText,
  connectRedis,
  createEntityId,
  createTimestamp,
  listSignatures,
  sendJson,
} from '../../src/server/communityStore.js';

function normalizeSignatureEntry(rawEntry) {
  return {
    id: String(rawEntry?.id || ''),
    name: clampText(rawEntry?.name, 48),
    message: clampText(rawEntry?.message, 280),
    type: rawEntry?.type === 'pride' ? 'pride' : 'sign',
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
      const signatures = (await listSignatures(client)).map(normalizeSignatureEntry).filter((entry) => entry.id && entry.message);
      return sendJson(res, 200, { signatures });
    }

    const name = clampText(req.body?.name, 48);
    const message = clampText(req.body?.message, 280);
    const type = req.body?.type === 'pride' ? 'pride' : 'sign';

    if (!name) {
      return sendJson(res, 400, { error: 'Name is required' });
    }

    if (!message) {
      return sendJson(res, 400, { error: 'Message is required' });
    }

    const entry = normalizeSignatureEntry({
      id: createEntityId(type === 'pride' ? 'pride' : 'sign'),
      name,
      message,
      type,
      createdAt: createTimestamp(),
    });

    const signatures = await addSignature(client, entry);
    return sendJson(res, 200, { entry, signatures });
  } catch (error) {
    console.error('community/signatures error:', error);
    return sendJson(res, 500, { error: error.message || 'Internal server error' });
  } finally {
    if (client) await client.disconnect().catch(() => {});
  }
}
