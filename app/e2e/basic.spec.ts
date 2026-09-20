import { test, expect } from '@playwright/test';

test.describe('Basic E2E Tests', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
  });

  test('shop page loads', async ({ page }) => {
    await page.goto('/shop');
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
  });

  test('cart page loads', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
  });
});
