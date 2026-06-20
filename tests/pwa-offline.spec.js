import { test, expect } from '@playwright/test';

const closeReleaseNotes = async (page) => {
  const gotIt = page.getByRole('button', { name: /got it|dismiss/i });
  if (await gotIt.isVisible().catch(() => false)) {
    await gotIt.click();
  }
};

test.describe('PWA offline smoke', () => {
  test('loads the app shell after the service worker has cached it', async ({ page, context }) => {
    await page.goto('/#settings');
    await closeReleaseNotes(page);

    await expect(page.getByText(/App installation & offline/i)).toBeVisible();

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

    await expect.poll(() => page.evaluate(async () => {
      if (!('caches' in window)) return false;
      const response = await fetch('/offline-build-assets.json');
      if (!response.ok) return false;
      const manifest = await response.json();
      const assetPaths = Array.isArray(manifest.assets) ? manifest.assets : [];
      if (!assetPaths.length) return false;
      const matches = await Promise.all(assetPaths.map((path) => caches.match(path)));
      return matches.every(Boolean);
    }), { timeout: 30000 }).toBe(true);

    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });

    await expect(page.getByText(/App installation & offline/i)).toBeVisible();
    await expect(page.getByText(/Offline library/i).first()).toBeVisible();

    await context.setOffline(false);
  });
});
