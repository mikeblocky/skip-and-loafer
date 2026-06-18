// Bump this when the shell assets change to force old SW out.
const SHELL_VERSION = 'v3';
const SHELL_CACHE = `skip-shell-${SHELL_VERSION}`;
const FONT_CACHE = `skip-fonts-${SHELL_VERSION}`;

// Files to pre-cache on install (small set — only truly static shell assets).
const SHELL_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/swt2-512.png',
];

// ── Install: pre-cache shell ──────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

// ── Activate: purge stale caches ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((n) => n !== SHELL_CACHE && n !== FONT_CACHE)
          .map((n) => caches.delete(n)),
      ))
      .then(() => self.clients.claim()),
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Pass through: API calls, Netlify internals, non-GET
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_netlify/') ||
    url.pathname.startsWith('/.netlify/')
  ) {
    return;
  }

  // Hashed assets (/assets/*) already have Cache-Control: immutable from
  // the _headers file — the browser HTTP cache handles them perfectly.
  // Let the SW pass through so we don't double-cache megabytes of JS/CSS.
  if (url.pathname.startsWith('/assets/')) {
    return;
  }

  // Google Fonts CSS + woff2 — Cache-first (fonts never change for a given URL).
  if (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    event.respondWith(
      caches.open(FONT_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      }),
    );
    return;
  }

  // Navigation requests — Network-first, fall back to cached shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put('/', clone));
          return response;
        })
        .catch(() =>
          caches.match('/').then((r) => r || new Response('', { status: 503 })),
        ),
    );
    return;
  }

  // Shell static files (icons, manifest, woff2 in root) — Stale-while-revalidate.
  if (
    url.origin === self.location.origin &&
    (url.pathname === '/manifest.json' ||
      url.pathname.endsWith('.woff2') ||
      url.pathname.endsWith('.woff') ||
      url.pathname.endsWith('.ico') ||
      url.pathname.endsWith('.png'))
  ) {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request).then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        });
        return cached || fetchPromise;
      }),
    );
  }
});
