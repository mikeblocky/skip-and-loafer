/* global Buffer */
const ROUTES = [
  { pattern: /^\/?sync\/create\/?$/, loader: () => import('../../api/sync/create.js') },
  { pattern: /^\/?sync\/claim\/?$/, loader: () => import('../../api/sync/claim.js') },
  { pattern: /^\/?reads\/increment\/?$/, loader: () => import('../../api/reads/increment.js') },
  { pattern: /^\/?reads\/top\/?$/, loader: () => import('../../api/reads/top.js') },
  { pattern: /^\/?quiz\/results\/?$/, loader: () => import('../../api/quiz/results.js') },
  { pattern: /^\/?quiz\/leaderboard\/?$/, loader: () => import('../../api/quiz/leaderboard.js') },
  { pattern: /^\/?community\/signatures\/?$/, loader: () => import('../../api/community/signatures.js') },
  { pattern: /^\/?community\/fan-gallery\/?$/, loader: () => import('../../api/community/fan-gallery.js') },
  { pattern: /^\/?chat\/rooms\/?$/, loader: () => import('../../api/chat/rooms.js') },
  { pattern: /^\/?chat\/rooms\/[^/]+\/?$/, loader: () => import('../../api/chat/rooms/[roomId].js') },
];

function parseBody(event) {
  if (!event.body) return undefined;

  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;

  const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(rawBody);
    } catch {
      return {};
    }
  }

  return rawBody;
}

function createResponseAdapter() {
  const headers = {};
  let statusCode = 200;
  let body = '';
  let ended = false;

  return {
    res: {
      setHeader(name, value) {
        headers[name] = value;
      },
      status(code) {
        statusCode = code;
        return this;
      },
      json(payload) {
        headers['Content-Type'] = headers['Content-Type'] || 'application/json';
        body = JSON.stringify(payload);
        ended = true;
        return this;
      },
      end(payload = '') {
        body = payload;
        ended = true;
        return this;
      },
    },
    toNetlifyResponse() {
      return {
        statusCode,
        headers,
        body: typeof body === 'string' ? body : String(body || ''),
      };
    },
    get ended() {
      return ended;
    },
  };
}

function createRequest(event, routePath) {
  const query = { ...(event.queryStringParameters || {}) };
  const roomMatch = routePath.match(/^\/?chat\/rooms\/([^/]+)\/?$/);
  if (roomMatch) {
    query.roomId = roomMatch[1];
  }

  return {
    method: event.httpMethod,
    headers: event.headers,
    query,
    body: parseBody(event),
  };
}

export async function handler(event) {
  const routePath = event.path
    .replace(/^\/\.netlify\/functions\/api\/?/, '')
    .replace(/^\/api\/?/, '');

  const route = ROUTES.find((candidate) => candidate.pattern.test(routePath));
  if (!route) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'API route not found' }),
    };
  }

  const module = await route.loader();
  const adapter = createResponseAdapter();
  const req = createRequest(event, routePath);

  await module.default(req, adapter.res);
  return adapter.toNetlifyResponse();
}
