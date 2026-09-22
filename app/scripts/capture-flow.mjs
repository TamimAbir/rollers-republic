/**
 * capture-flow.mjs — walks the buyer flow in headless chromium and saves
 * screenshots at each step for human review (client demo / pitch assets).
 *
 *   node scripts/capture-flow.mjs
 *
 * Output: ../docs/screenshots/*.png
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../../docs/screenshots');
mkdirSync(outDir, { recursive: true });

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

const shot = (page, name) =>
  page.screenshot({ path: resolve(outDir, name), fullPage: false });

const run = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. Home (age gate first visit)
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /yes.*18 or older/i }).click();
  await page.getByRole('link', { name: 'Explore Collection' }).waitFor();
  await shot(page, '01-home-hero.png');

  // 2. Shop via RAW brand chip (real user path: click "Shop Raw products")
  await page.getByRole('link', { name: 'Shop Raw products' }).click();
  await page.waitForURL('**/shop?brand=raw');
  await page.getByText(/items found/i).waitFor();
  await page.waitForTimeout(1200); // let entrance animations settle
  await shot(page, '02-shop-raw-filter.png');

  // 3. Product detail page
  await page.getByRole('link', { name: /view raw classic 1 1\/4 size \+ tips/i }).first().click();
  await page.waitForURL('**/product/**');
  await page.waitForTimeout(1200);
  await shot(page, '03-product-detail.png');

  // 4. Add to cart (PDP CTA is "Add to Collection")
  await page.getByRole('button', { name: /add to collection/i }).first().click();
  await page.waitForTimeout(800);
  await shot(page, '04-added-to-cart.png');

  // 5. Cart page
  await page.goto(`${BASE}/cart`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await shot(page, '05-cart-page.png');

  // 6. Checkout page
  await page.getByRole('button', { name: /proceed to checkout|checkout/i }).first().click().catch(() => {});
  await page.waitForTimeout(1500);
  await shot(page, '06-checkout.png');

  await browser.close();
  console.log(`Saved screenshots to ${outDir}`);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
