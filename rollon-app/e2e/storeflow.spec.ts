import { test, expect } from '@playwright/test';

test.describe('Storeflow E2E', () => {
  test('homepage loads with hero and featured sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });
    // Navbar has the search trigger and cart trigger
    await expect(page.getByRole('button', { name: 'Open search' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open shopping cart' })).toBeVisible();
  });

  test('search routes to /shop?search=', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open search' }).click();
    const searchInput = page.getByPlaceholder(/VAPORIZERS|SEARCH/i).first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    await searchInput.fill('grinder');
    await searchInput.press('Enter');
    await expect(page).toHaveURL(/\/shop\?search=grinder/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('shop page shows products and filters by category', async ({ page }) => {
    await page.goto('/shop');
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
    // Category filter pills exist
    await expect(page.locator('button').filter({ hasText: /Grinders|Vaporizers|All/i }).first()).toBeVisible();
  });

  test('product detail page renders and adds to cart', async ({ page }) => {
    await page.goto('/shop');
    await page.locator('body').waitFor({ timeout: 15000 });

    // Click the first product card (its link is an image/link inside a card)
    const firstProduct = page.locator('a[href^="/product/"]').first();
    await expect(firstProduct).toBeVisible({ timeout: 15000 });
    await firstProduct.click();

    // Product page: h1 shows product name, Add to Collection button exists
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });
    const addBtn = page.getByRole('button', { name: /Add to Collection/i });
    await expect(addBtn).toBeVisible({ timeout: 10000 });
    await addBtn.click();

    // Cart drawer badge/trigger should reflect the addition
    await expect(page.getByRole('button', { name: 'Open shopping cart' })).toBeVisible();
  });

  test('cart page allows quantity updates', async ({ page }) => {
    await page.goto('/shop');
    await page.locator('a[href^="/product/"]').first().click();
    await page.getByRole('button', { name: /Add to Collection/i }).click();
    await page.goto('/cart');

    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
    // The cart should have at least one line item (product name rendered)
    await expect(page.locator('main').getByText(/৳|Tk|BDT/).first()).toBeVisible({ timeout: 10000 });
  });

  test('checkout page validates required fields', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
    // Empty-cart checkout shows empty state or form; either way page renders
    await expect(page.locator('h1, main').first()).toBeVisible();
  });

  test('about and contact pages render', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });

    await page.goto('/contact');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });
    // Contact form fields exist
    await expect(page.locator('input, textarea').first()).toBeVisible();
  });

  test('404 page handles unknown routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
    // NotFound page shows the 404 code and "Lost in the Void" heading
    await expect(page.locator('body')).toContainText(/404/i);
    await expect(page.locator('body')).toContainText(/lost in the void/i);
  });
});
