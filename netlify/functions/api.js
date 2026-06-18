/* global Buffer */
import syncCreate from '../../api/sync/create.js';
import syncClaim from '../../api/sync/claim.js';
import readsIncrement from '../../api/reads/increment.js';
import readsTop from '../../api/reads/top.js';
import quizResults from '../../api/quiz/results.js';
import quizLeaderboard from '../../api/quiz/leaderboard.js';
import communitySignatures from '../../api/community/signatures.js';
import communityFanGallery from '../../api/community/fan-gallery.js';
import chatRooms from '../../api/chat/rooms.js';
import chatRoom from '../../api/chat/rooms/[roomId].js';

const ROUTES = [
  { pattern: /^\/?sync\/create\/?$/, handler: syncCreate },
  { pattern: /^\/?sync\/claim\/?$/, handler: syncClaim },
  { pattern: /^\/?reads\/increment\/?$/, handler: readsIncrement },
  { pattern: /^\/?reads\/top\/?$/, handler: readsTop },
  { pattern: /^\/?quiz\/results\/?$/, handler: quizResults },
  { pattern: /^\/?quiz\/leaderboard\/?$/, handler: quizLeaderboard },
  { pattern: /^\/?community\/signatures\/?$/, handler: communitySignatures },
  { pattern: /^\/?community\/fan-gallery\/?$/, handler: communityFanGallery },
  { pattern: /^\/?chat\/rooms\/?$/, handler: chatRooms },
  { pattern: /^\/?chat\/rooms\/[^/]+\/?$/, handler: chatRoom },
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
  try {
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

    const adapter = createResponseAdapter();
    const req = createRequest(event, routePath);

    await route.handler(req, adapter.res);
    return adapter.toNetlifyResponse();
  } catch (error) {
    console.error('netlify api adapter error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}
