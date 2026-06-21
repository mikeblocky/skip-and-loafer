import { test, expect } from '@playwright/test';

const closeReleaseNotes = async (page) => {
  const gotIt = page.getByRole('button', { name: /got it|dismiss/i });
  if (await gotIt.isVisible().catch(() => false)) {
    await gotIt.click();
  }
};

const waitForControllingServiceWorker = async (page) => {
  await page.waitForFunction(async () => {
    if (!('serviceWorker' in navigator)) return false;
    const registration = await navigator.serviceWorker.ready.catch(() => null);
    return Boolean(registration?.active);
  });

  const controlled = await page.evaluate(() => Boolean(navigator.serviceWorker.controller));
  if (!controlled) {
    await page.reload({ waitUntil: 'networkidle' });
    await closeReleaseNotes(page);
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  }
};

const readManifestAssets = (page) => page.evaluate(async () => {
  const response = await fetch('/offline-build-assets.json').catch(() => null);
  if (!response || !response.ok) return [];
  const manifest = await response.json();
  return Array.isArray(manifest.assets) ? manifest.assets : [];
});

test.describe('PWA offline smoke', () => {
  test('boots offline from the precached shell without bulk-caching the library', async ({ page, context }) => {
    await page.goto('/#settings');
    await closeReleaseNotes(page);

    await expect(page.getByText(/App installation & offline/i)).toBeVisible();
    await waitForControllingServiceWorker(page);

    // The full offline library must NOT be downloaded automatically. With offline mode
    // left off, the build manifest's assets should not all be sitting in a cache — only
    // the shell and whatever the visit itself happened to request.
    const assetPaths = await readManifestAssets(page);
    expect(assetPaths.length).toBeGreaterThan(0);
    const allAssetsCached = await page.evaluate(async (paths) => {
      const matches = await Promise.all(paths.map((path) => caches.match(path)));
      return matches.every(Boolean);
    }, assetPaths);
    expect(allAssetsCached).toBe(false);

    // The shell itself still works offline (served from the install precache plus the
    // assets this visit already pulled into the runtime cache).
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });

    await expect(page.getByText(/App installation & offline/i)).toBeVisible();

    await context.setOffline(false);
  });

  test('caches the full library only after an explicit opt-in message', async ({ page, context }) => {
    await page.goto('/#settings');
    await closeReleaseNotes(page);
    await waitForControllingServiceWorker(page);

    const assetPaths = await readManifestAssets(page);
    expect(assetPaths.length).toBeGreaterThan(0);

    // Simulate the Settings opt-in: the page tells the worker to cache the library and
    // waits for the completion message it posts back.
    await page.evaluate(() => new Promise((resolve, reject) => {
      const worker = navigator.serviceWorker.controller;
      if (!worker) {
        reject(new Error('No controlling service worker'));
        return;
      }
      const timeout = setTimeout(() => reject(new Error('Offline cache did not complete')), 30000);
      navigator.serviceWorker.addEventListener('message', function onMessage(event) {
        if (event.data?.type === 'SKIP_OFFLINE_CACHE_COMPLETE') {
          clearTimeout(timeout);
          navigator.serviceWorker.removeEventListener('message', onMessage);
          resolve();
        }
      });
      worker.postMessage({ type: 'SKIP_CACHE_OFFLINE_ASSETS', assets: [] });
    }));

    // After opting in, every manifest asset should be cached.
    await expect.poll(() => page.evaluate(async (paths) => {
      const matches = await Promise.all(paths.map((path) => caches.match(path)));
      return matches.every(Boolean);
    }, assetPaths), { timeout: 30000 }).toBe(true);

    await context.setOffline(false);
  });
});
