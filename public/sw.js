// Bump this when the shell assets OR the response headers (e.g. CSP) change, so
// old caches holding a stale index.html (with an outdated CSP) are purged.
const SHELL_VERSION = 'v9';
const SHELL_CACHE = `skip-shell-${SHELL_VERSION}`;
const FONT_CACHE = `skip-fonts-${SHELL_VERSION}`;
const RUNTIME_CACHE = `skip-runtime-${SHELL_VERSION}`;
const OFFLINE_CACHE = `skip-offline-${SHELL_VERSION}`;
const BUILD_ASSET_MANIFEST = '/offline-build-assets.json';

// Files to pre-cache on install (small set — only truly static shell assets).
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/swt2-512.png',
];

const MEDIA_EXTENSIONS = /\.(?:avif|gif|ico|jpe?g|mp4|png|svg|webm|webp|woff2?)$/i;
const MAX_BACKGROUND_CACHE_CONCURRENCY = 3;
const MAX_RUNTIME_CACHE_ENTRIES = 180;
const NAVIGATION_TIMEOUT_MS = 2800;
let backgroundCachePromise = Promise.resolve();

const sameOrigin = (url) => url.origin === self.location.origin;

const shouldCacheRuntimeRequest = (request, url) => {
  if (request.method !== 'GET') return false;
  if (!sameOrigin(url)) return false;
  if (url.pathname.startsWith('/api/')) return false;
  return (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/gallery/') ||
    url.pathname.startsWith('/manga/') ||
    url.pathname.startsWith('/blog/') ||
    url.pathname.startsWith('/covers/') ||
    url.pathname.startsWith('/portrait/') ||
    url.pathname.startsWith('/characters/') ||
    url.pathname.startsWith('/icon/') ||
    url.pathname.startsWith('/volumes/') ||
    MEDIA_EXTENSIONS.test(url.pathname)
  );
};

const putIfOk = async (cache, request, response) => {
  if (response && response.ok) {
    await cache.put(request, response.clone());
  }
  return response;
};

const trimCache = async (cacheName, maxEntries) => {
  const cache = await caches.open(cacheName);
  const requests = await cache.keys();
  if (requests.length <= maxEntries) return;
  await Promise.all(requests.slice(0, requests.length - maxEntries).map((request) => cache.delete(request)));
};

const getBackgroundCacheConcurrency = () => {
  const connection = self.navigator?.connection || self.navigator?.mozConnection || self.navigator?.webkitConnection;
  if (connection?.saveData || /(^slow-2g$|^2g$)/.test(connection?.effectiveType || '')) return 1;
  return MAX_BACKGROUND_CACHE_CONCURRENCY;
};

const cacheOfflineAssets = async (assets = [], onProgress) => {
  const uniqueAssets = [...new Set(assets)]
    .filter((asset) => typeof asset === 'string' && asset.startsWith('/') && !asset.startsWith('/api/'));
  if (!uniqueAssets.length) return { cached: 0, total: 0 };

  const cache = await caches.open(OFFLINE_CACHE);
  let nextIndex = 0;
  let cachedCount = 0;
  let processedCount = 0;

  const reportProgress = () => {
    if (typeof onProgress === 'function') {
      onProgress({ cached: cachedCount, processed: processedCount, total: uniqueAssets.length });
    }
  };

  const cacheNext = async () => {
    while (nextIndex < uniqueAssets.length) {
      const asset = uniqueAssets[nextIndex];
      nextIndex += 1;
      const request = new Request(asset, { cache: 'reload' });
      const cached = await caches.match(request);
      if (cached) {
        cachedCount += 1;
        processedCount += 1;
        if (processedCount === 1 || processedCount % 12 === 0 || processedCount === uniqueAssets.length) reportProgress();
        continue;
      }

      try {
        const response = await fetch(request);
        await putIfOk(cache, request, response);
        if (response.ok) cachedCount += 1;
      } catch {
        // Keep going; one missing or quota-blocked asset should not cancel the rest.
      } finally {
        processedCount += 1;
        if (processedCount === 1 || processedCount % 12 === 0 || processedCount === uniqueAssets.length) reportProgress();
      }
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(getBackgroundCacheConcurrency(), uniqueAssets.length) }, cacheNext),
  );

  return { cached: cachedCount, total: uniqueAssets.length };
};

const cacheBuildAssets = async () => {
  try {
    const response = await fetch(BUILD_ASSET_MANIFEST, { cache: 'reload' });
    if (!response.ok) return;
    const manifest = await response.clone().json();
    const cache = await caches.open(SHELL_CACHE);
    await cache.put(BUILD_ASSET_MANIFEST, response);
    await cacheOfflineAssets(manifest.assets || []);
  } catch {
    // Dev server and older deploys may not have the generated build manifest yet.
  }
};

// ── Install: pre-cache shell ──────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => cacheBuildAssets()),
  );
});

// ── Activate: purge stale caches ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((n) => n !== SHELL_CACHE && n !== FONT_CACHE && n !== RUNTIME_CACHE && !n.startsWith('skip-offline-'))
          .map((n) => caches.delete(n)),
      ))
      .then(() => self.registration.navigationPreload?.enable?.())
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (event.data?.type === 'SKIP_CLEAR_OFFLINE_CACHE') {
    event.waitUntil(
      caches.keys().then((names) => Promise.all(
        names
          .filter((name) => name.startsWith('skip-offline-'))
          .map((name) => caches.delete(name)),
      )).then(() => {
        if (event.source) {
          event.source.postMessage({
            type: 'SKIP_OFFLINE_CACHE_CLEARED',
          });
        }
      }),
    );
    return;
  }

  if (event.data?.type !== 'SKIP_CACHE_OFFLINE_ASSETS') return;
  const assets = Array.isArray(event.data.assets) ? event.data.assets : [];
  const postProgress = (status) => {
    if (!event.source || !status) return;
    event.source.postMessage({
      type: 'SKIP_OFFLINE_CACHE_PROGRESS',
      ...status,
    });
  };
  backgroundCachePromise = backgroundCachePromise
    .catch(() => {})
    .then(() => cacheBuildAssets())
    .then(() => cacheOfflineAssets(assets, postProgress))
    .then((status) => {
      if (event.source && status) {
        event.source.postMessage({
          type: 'SKIP_OFFLINE_CACHE_COMPLETE',
          ...status,
        });
      }
    });
  event.waitUntil(backgroundCachePromise);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/#chapters';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existingClient = clients.find((client) => 'focus' in client);
      if (existingClient) {
        if ('navigate' in existingClient) {
          return existingClient.navigate(targetUrl).then((client) => client.focus());
        }
        return existingClient.focus();
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return undefined;
    }),
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Pass through: API calls and non-GET requests.
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api/')
  ) {
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
        try {
          const response = await fetch(request);
          if (response.ok) cache.put(request, response.clone());
          return response;
        } catch {
          // A stale document CSP can block this cross-origin fetch. Degrade
          // gracefully (cached copy or an empty stylesheet) so the page keeps
          // rendering with fallback fonts instead of throwing an uncaught error.
          if (cached) return cached;
          if (url.hostname === 'fonts.googleapis.com') {
            return new Response('', { status: 200, headers: { 'Content-Type': 'text/css' } });
          }
          return Response.error();
        }
      }),
    );
    return;
  }

  // Navigation requests — Network-first, fall back to cached shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      Promise.race([
        Promise.resolve(event.preloadResponse).then((response) => response || fetch(request)),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Navigation timed out')), NAVIGATION_TIMEOUT_MS);
        }),
      ])
        .then((response) => {
          const clone = response.clone();
          caches.open(SHELL_CACHE).then((cache) => {
            cache.put('/', clone.clone());
            cache.put('/index.html', clone);
          });
          return response;
        })
        .catch(() =>
          caches.match('/').then((r) => r || caches.match('/index.html') || new Response('', { status: 503 })),
        ),
    );
    return;
  }

  if (shouldCacheRuntimeRequest(request, url)) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(async (cache) => {
        const cached = await caches.match(request);
        if (cached) return cached;

        try {
          const response = await fetch(request);
          const cachedResponse = await putIfOk(cache, request, response);
          trimCache(RUNTIME_CACHE, MAX_RUNTIME_CACHE_ENTRIES).catch(() => {});
          return cachedResponse;
        } catch {
          return caches.match(request);
        }
      }),
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
