import { MAX_JSON_BODY_LENGTH, SECURITY_HEADERS } from './constants.js';

export function getRequestOrigin(request) {
  const origin = request.headers.get('Origin');
  if (!origin) return '';

  try {
    const requestUrl = new URL(request.url);
    const originUrl = new URL(origin);
    return originUrl.origin === requestUrl.origin ? originUrl.origin : '';
  } catch {
    return '';
  }
}

export function applyCorsHeaders(headers, request, methods = 'GET, POST, OPTIONS') {
  const origin = getRequestOrigin(request);
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
  }
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  headers.set('Access-Control-Allow-Methods', methods);
}

export function addSecurityHeaders(response, request) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }
  if (request?.url.startsWith('https://')) {
    headers.set('Strict-Transport-Security', SECURITY_HEADERS['Strict-Transport-Security']);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function json(payload, init = {}, request) {
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json');
  if (request) applyCorsHeaders(headers, request);
  return new Response(JSON.stringify(payload), { ...init, headers });
}

export function empty(status = 204, extraHeaders = {}, request, methods) {
  const headers = new Headers(extraHeaders);
  if (request) applyCorsHeaders(headers, request, methods);
  return new Response(null, { status, headers });
}

export function methodNotAllowed(allowed) {
  return json(
    { error: 'Method not allowed' },
    {
      status: 405,
      headers: { Allow: allowed.join(', ') },
    },
  );
}

export async function readJson(request, maxLength = MAX_JSON_BODY_LENGTH) {
  if (!String(request.headers.get('content-type') || '').toLowerCase().includes('application/json')) {
    throw new Error('Expected application/json');
  }
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > maxLength) throw new Error('JSON body too large');

  try {
    return await request.json();
  } catch {
    return {};
  }
}

export function requireSameOriginWrite(request) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) return null;
  const origin = request.headers.get('Origin');
  if (!origin) return null;
  if (!getRequestOrigin(request)) return json({ error: 'Cross-origin writes are not allowed' }, { status: 403 }, request);
  return null;
}
