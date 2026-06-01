import {
  addPrideMessage,
  applyCors,
  clampText,
  connectRedis,
  createEntityId,
  createTimestamp,
  listPrideMessages,
  sendJson,
} from '../../src/server/communityStore.js';

function normalizePrideMessage(rawEntry) {
  return {
    id: String(rawEntry?.id || ''),
    name: clampText(rawEntry?.name, 48),
    message: clampText(rawEntry?.message, 320),
    mood: clampText(rawEntry?.mood, 24) || 'Proud',
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
      const messages = (await listPrideMessages(client))
        .map(normalizePrideMessage)
        .filter((entry) => entry.id && entry.name && entry.message);
      return sendJson(res, 200, { messages });
    }

    const name = clampText(req.body?.name, 48);
    const message = clampText(req.body?.message, 320);
    const mood = clampText(req.body?.mood, 24) || 'Proud';

    if (!name) return sendJson(res, 400, { error: 'Name is required' });
    if (!message) return sendJson(res, 400, { error: 'Message is required' });

    const entry = normalizePrideMessage({
      id: createEntityId('pride'),
      name,
      message,
      mood,
      createdAt: createTimestamp(),
    });

    const messages = await addPrideMessage(client, entry);
    return sendJson(res, 200, { entry, messages });
  } catch (error) {
    console.error('pride/messages error:', error);
    return sendJson(res, 500, { error: error.message || 'Internal server error' });
  } finally {
    if (client) await client.disconnect().catch(() => {});
  }
}
