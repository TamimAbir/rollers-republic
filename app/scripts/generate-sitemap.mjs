#!/usr/bin/env node
/**
 * generate-sitemap.mjs — build public/sitemap.xml from the canonical catalog
 * (SEO-AUDIT fix #3: the store has 949 products; the old hand-written sitemap
 * had 4 URLs).
 *
 *   node scripts/generate-sitemap.mjs
 *
 * Emits:
 *   /                      (home, priority 1.0)
 *   /shop                  (all products, 0.9)
 *   /shop?category=<slug>  (8 categories, 0.8)
 *   /shop?brand=<slug>     (82 brands, 0.7)
 *   /product/<slug>        (in-stock products, 0.7)
 *   /about /contact        (0.5)
 *   /terms /privacy /age-policy (0.3)
 *
 * Skips out-of-stock product URLs (they 404-behave in the UI and waste
 * crawl budget); the count is printed either way.
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(__dirname, '..');
const rootDir = resolve(appDir, '..');
const outFile = resolve(appDir, 'public/sitemap.xml');

const SITE_URL = process.env.SITE_URL || 'https://rollerspub.com';

// --- Load the canonical catalog (same esbuild transpile as generate-seed.mjs) ---
const require = createRequire(import.meta.url);
let esbuild;
try {
  esbuild = require('esbuild');
} catch {
  esbuild = require(require.resolve('esbuild', { paths: [appDir] }));
}
const built = resolve('/tmp', `rr-sitemap-data-${process.pid}.mjs`);
await esbuild.build({
  entryPoints: [resolve(appDir, 'src/data/products.ts')],
  format: 'esm',
  outfile: built,
  bundle: false,
  logLevel: 'error',
});
const { products, categories, brands } = await import(`file://${built}`);

// --- Helpers ---
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const url = (path, { priority, changefreq = 'weekly' }) =>
  `  <url><loc>${SITE_URL}${path}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;

// --- URLs ---
const urls = [
  url('/', { priority: '1.0', changefreq: 'daily' }),
  url('/shop', { priority: '0.9', changefreq: 'daily' }),
];

for (const c of categories) {
  urls.push(url(`/shop?category=${encodeURIComponent(c.slug)}`, { priority: '0.8', changefreq: 'daily' }));
}
for (const b of brands) {
  urls.push(url(`/shop?brand=${encodeURIComponent(b.slug)}`, { priority: '0.7', changefreq: 'weekly' }));
}

let inStockCount = 0;
for (const p of products) {
  if (!p.inStock || !p.slug) continue;
  inStockCount++;
  urls.push(url(`/product/${encodeURIComponent(p.slug)}`, { priority: '0.7', changefreq: 'weekly' }));
}

urls.push(url('/about', { priority: '0.5', changefreq: 'monthly' }));
urls.push(url('/contact', { priority: '0.5', changefreq: 'monthly' }));
for (const path of ['/terms', '/privacy', '/age-policy']) {
  urls.push(url(path, { priority: '0.3', changefreq: 'yearly' }));
}

// --- Write ---
const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.join('\n') +
  `\n</urlset>\n`;

writeFileSync(outFile, xml);

const skipped = products.length - inStockCount;
console.log(`✅ sitemap.xml written: ${urls.length} URLs`);
console.log(`   home 1 · shop 1 · categories ${categories.length} · brands ${brands.length} · products ${inStockCount} (skipped ${skipped} out-of-stock) · static 5`);
