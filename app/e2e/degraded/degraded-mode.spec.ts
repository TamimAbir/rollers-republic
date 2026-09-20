import { test, expect } from '@playwright/test';

/**
 * Degraded-mode E2E: the app runs in remote mode against a dead API port.
 * The client must (1) still render the store from the bundled dataset and
 * (2) show the DegradedModeBanner so the outage is never silent.
 */
test.describe('Degraded mode (remote API down)', () => {
  test('homepage renders from fallback data and shows the degraded banner', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/', { waitUntil: 'networkidle' });

    // The banner must be visible — an outage is never silent.
    await expect(page.getByRole('status')).toBeVisible();
    await expect(page.getByText(/showing cached catalog/i)).toBeVisible();

    // The store still renders products from the fallback dataset.
    await expect(page.locator('h1, .hero-title, [class*="hero"]').first()).toBeVisible();
  });

  test('shop still lists products in degraded mode', async ({ page }) => {
    await page.goto('/shop', { waitUntil: 'networkidle' });

    await expect(page.getByRole('status')).toBeVisible();
    // Fallback data must still power the grid (6 seed products).
    await expect(page.locator('a[href^="/product/"]').first()).toBeVisible();
  });
});
