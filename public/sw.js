// Bump this when the shell assets OR the response headers (e.g. CSP) change, so
// old caches holding a stale index.html (with an outdated CSP) are purged.
const SHELL_VERSION = 'v13';
const SHELL_CACHE = `skip-shell-${SHELL_VERSION}`;
const RUNTIME_CACHE = `skip-runtime-${SHELL_VERSION}`;
const OFFLINE_CACHE = `skip-offline-${SHELL_VERSION}`;
const BUILD_ASSET_MANIFEST = '/offline-build-assets.json';

// ── Caching model ─────────────────────────────────────────────────────────────
// Three caches, each filled by a DIFFERENT and EXPLICIT trigger. Nothing is ever
// bulk pre-downloaded in the background:
//
//   SHELL_CACHE   — the minimal app shell only (index.html, manifest, icons, the
//                   self-hosted fonts in SHELL_ASSETS). Precached on install so the
//                   app can boot offline. Small and fixed; this is the ONLY thing
//                   fetched automatically.
//
//   RUNTIME_CACHE — populated lazily, strictly on demand. An asset lands here only
//                   when the user actually requests it while browsing (the
//                   shouldCacheRuntimeRequest branch in fetch caches the response of
//                   a real navigation). The worker never fetches anything the user
//                   did not already load.
//
//   OFFLINE_CACHE — the full offline library (all chapter / gallery / build assets
//                   from the manifest). OPT-IN ONLY: filled when the page posts a
//                   SKIP_CACHE_OFFLINE_ASSETS message, which the app sends solely
//                   when the user has enabled "offline library" in Settings. Wiped
//                   by SKIP_CLEAR_OFFLINE_CACHE. The install step does NOT touch it.
// ──────────────────────────────────────────────────────────────────────────────

// Files to pre-cache on install (small set — only truly static shell assets).
// Fonts are self-hosted now, so the .ttf files are part of the precached shell.
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/swt2-512.png',
  '/Sniglet-Regular.ttf',
  '/Sniglet-ExtraBold.ttf',
  '/ComingSoon-Regular.ttf',
];

const MEDIA_EXTENSIONS = /\.(?:avif|gif|ico|jpe?g|png|svg|ttf|webp|woff2?)$/i;
// Video files are intentionally excluded here — the fetch handler passes them
// straight through to the network instead of ever routing them through a cache.
const VIDEO_EXTENSIONS = /\.(?:mp4|m4v|webm|mov)$/i;
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
  // Only full 200 responses are cacheable. A 206 (partial/range) response throws
  // in cache.put(), and opaque/redirected responses aren't useful here.
  if (response && response.status === 200) {
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

// Downloads the whole build manifest into OFFLINE_CACHE. This is the opt-in offline
// library, so it runs ONLY from the SKIP_CACHE_OFFLINE_ASSETS message handler — never
// on install. Calling it eagerly would pull every chapter/gallery asset in the
// background without the user asking, which is exactly what we don't want.
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

// ── Install: pre-cache the minimal shell ONLY ────────────────────────────────
self.addEventListener('install', (event) => {
  // Activate immediately rather than waiting for every old tab to close. A buggy
  // prior worker (e.g. one that threw on video range requests) would otherwise keep
  // controlling open pages until a manual update; skipWaiting + clients.claim on
  // activate guarantees the corrected worker takes over on the next load.
  self.skipWaiting();
  // Precache the small, fixed app shell so the app can boot offline — and nothing
  // else. The full offline library is deliberately NOT fetched here; it is opt-in and
  // only cached when the user enables offline mode (SKIP_CACHE_OFFLINE_ASSETS).
  // Everything else is cached lazily, per request, as the user actually visits it.
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)),
  );
});

// ── Activate: purge stale caches ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((n) => n !== SHELL_CACHE && n !== RUNTIME_CACHE && !n.startsWith('skip-offline-'))
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

  // Never intercept video files (the R2-served musical gallery .mp4s). They're large
  // and streamed via range requests: a 206 can't be stored in the Cache API (cache.put
  // throws) and a full 200 is too big to cache usefully. Routing them through the SW
  // only breaks native streaming/seeking, so let the browser fetch them directly.
  if (VIDEO_EXTENSIONS.test(url.pathname) || request.headers.has('range')) {
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
          // Never resolve respondWith() to undefined — that becomes a network error.
          const fallback = await caches.match(request);
          return fallback || Response.error();
        }
      }),
    );
    return;
  }

  // Shell static files (icons, manifest, fonts in root) — Stale-while-revalidate.
  if (
    url.origin === self.location.origin &&
    (url.pathname === '/manifest.json' ||
      url.pathname.endsWith('.woff2') ||
      url.pathname.endsWith('.woff') ||
      url.pathname.endsWith('.ttf') ||
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
