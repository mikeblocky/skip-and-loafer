import { 
  connectRedis, 
  sendJson 
} from '../../src/server/chatStore.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  // Secret is optional for this prompt as the user just asked to nuke it
  // But in a real app, you'd want a secret.
  
  let client;
  try {
    client = await connectRedis();
    const keys = await client.keys('skip_chat:*');
    if (keys.length > 0) {
      await client.del(keys);
    }
    return sendJson(res, 200, { success: true, count: keys.length });
  } catch (err) {
    console.error('Nuke error:', err);
    return sendJson(res, 500, { error: err.message });
  } finally {
    if (client) await client.disconnect().catch(() => {});
  }
}
