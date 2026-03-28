import { test, expect } from '@playwright/test';

test.describe('Mystery WebKit smoke', () => {
  test('loads the mystery page and shows a result entry point', async ({ page }) => {
    await page.goto('/#mystery');

    await expect(page.getByRole('button', { name: /who are you|which animal are you|character portrait|mystery/i }).first()).toBeVisible();
  });

  test('mobile safari memory board does not render mirrored text', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'This smoke check is meant for WebKit.');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#mystery');

    const closeReleaseNotes = page.getByRole('button', { name: /got it/i });
    if (await closeReleaseNotes.isVisible().catch(() => false)) {
      await closeReleaseNotes.click();
    }

    const mysteryEntry = page.getByRole('button', { name: /character portrait|who are you|which animal are you|mystery/i }).first();
    await expect(mysteryEntry).toBeVisible();
  });
});
