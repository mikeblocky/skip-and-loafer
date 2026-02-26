import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ── Local dev API plugin (simulates Vercel serverless functions) ──
function localSyncApiPlugin() {
  const store = new Map();
  const globalReadsStore = new Map();
  const TTL_MS = 36 * 24 * 60 * 60 * 1000; // 36 days (matches Redis TTL)
  const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  function generateKey() {
    let key = '';
    for (let i = 0; i < 8; i++) {
      if (i === 4) key += '-';
      key += CHARSET[Math.floor(Math.random() * CHARSET.length)];
    }
    return key;
  }

  function purgeExpired() {
    const now = Date.now();
    for (const [k, v] of store) {
      if (now - v.createdAt > TTL_MS) store.delete(k);
    }
  }

  function isExpired(entry) {
    return Date.now() - entry.createdAt > TTL_MS;
  }

  return {
    name: 'local-sync-api',
    configureServer(server) {
      // POST /api/sync/create
      server.middlewares.use('/api/sync/create', (req, res, next) => {
        if (req.method !== 'POST') return next();

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const { data, key: existingKey } = JSON.parse(body);
            if (!data || typeof data !== 'object') {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing or invalid "data" field' }));
              return;
            }
            if (JSON.stringify(data).length > 51200) {
              res.statusCode = 413;
              res.end(JSON.stringify({ error: 'Payload too large (max 50KB)' }));
              return;
            }

            purgeExpired();

            // Update existing key — refresh TTL on update
            if (existingKey && store.has(existingKey)) {
              store.set(existingKey, { data, createdAt: Date.now() });
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ key: existingKey }));
              return;
            }

            // Generate new key
            let key;
            let attempts = 0;
            do { key = generateKey(); attempts++; } while (store.has(key) && attempts < 10);

            store.set(key, { data, createdAt: Date.now() });

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ key }));
          } catch {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal server error' }));
          }
        });
      });

      // GET /api/sync/claim?key=...&peek=true
      server.middlewares.use((req, res, next) => {
        const urlObj = new URL(req.url, 'http://localhost');
        if (!urlObj.pathname.startsWith('/api/sync/claim') || req.method !== 'GET') return next();

        purgeExpired(); // Also purge on read

        const key = decodeURIComponent(urlObj.searchParams.get('key') || '');
        const peek = urlObj.searchParams.get('peek') === 'true';

        if (!key) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Missing key parameter' }));
          return;
        }

        const entry = store.get(key);

        res.setHeader('Content-Type', 'application/json');

        if (!entry || isExpired(entry)) {
          if (entry) store.delete(key);
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Key not found or expired' }));
          return;
        }

        const { data } = entry;
        if (!peek) store.delete(key);
        res.end(JSON.stringify({ data }));
      });

      // POST /api/reads/increment
      server.middlewares.use('/api/reads/increment', (req, res, next) => {
        if (req.method !== 'POST') return next();
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const { chapter } = JSON.parse(body);
            if (chapter == null) {
              res.statusCode = 400; res.end(JSON.stringify({ error: 'Missing chapter number' }));
              return;
            }
            const current = globalReadsStore.get(String(chapter)) || 0;
            const newCount = current + 1;
            globalReadsStore.set(String(chapter), newCount);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ chapter, count: newCount }));
          } catch {
            res.statusCode = 500; res.end(JSON.stringify({ error: 'Internal server error' }));
          }
        });
      });

      // GET /api/reads/top
      server.middlewares.use('/api/reads/top', (req, res, next) => {
        if (req.method !== 'GET') return next();
        try {
          const leaderboard = Array.from(globalReadsStore.entries())
            .map(([chapter, count]) => ({ chapter: parseFloat(chapter), count: parseInt(count, 10) }))
            .filter(e => e.count > 0 && !isNaN(e.chapter))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ leaderboard }));
        } catch {
          res.statusCode = 500; res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localSyncApiPlugin()],
})
