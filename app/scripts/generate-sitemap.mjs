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
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(__dirname, '..');
const rootDir = resolve(appDir, '..');
const outFile = resolve(appDir, 'public/sitemap.xml');

const SITE_URL =
  process.env.SITE_URL || 'https://rollers-republic.vercel.app';

// --- Load the canonical catalog (server/seed.json is the SSOT) ---
const seed = JSON.parse(readFileSync(resolve(rootDir, 'server', 'seed.json'), 'utf8'));
const { products, categories, brands } = seed;

// --- lastmod: last commit date of the SSOT seed (all catalog URLs share it) ---
let seedLastmod;
try {
  seedLastmod = execFileSync(
    'git',
    ['log', '-1', '--format=%cI', '--', 'server/seed.json'],
    { encoding: 'utf8', cwd: rootDir },
  ).trim().slice(0, 10) || undefined; // W3C date (YYYY-MM-DD)
} catch {
  seedLastmod = undefined; // no git metadata (tarball builds) — omit lastmod
}

// --- Helpers ---
const url = (path, { priority, changefreq = 'weekly', lastmod = seedLastmod }) =>
  `  <url><loc>${SITE_URL}${path}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority>${
    lastmod ? `<lastmod>${lastmod}</lastmod>` : ''
  }</url>`;

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
