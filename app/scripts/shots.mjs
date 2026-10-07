/**
 * shots.mjs — capture the buyer-flow screenshots used by the owner pitch.
 *
 * Serves the built `app/dist/` with the same same-origin shape production has
 * (`/api/*` → reference server, `/img/*` → hotlink-safe proxy), then drives
 * chromium through the six frames a real customer walks:
 *
 *   home → shop (filtered) → product → add to cart → cart → checkout
 *
 * The age gate is pre-cleared exactly as prerender.mjs does it, so every frame
 * lands on real content rather than the age wall.
 *
 * Usage:
 *   node scripts/shots.mjs                 # all six, desktop + mobile
 *   node scripts/shots.mjs --only=shop     # one frame
 *   node scripts/shots.mjs --mobile-only
 *
 * Output: docs/screenshots/*.png (overwrites the previous, pre-change set)
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join, extname, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(__dirname, '..');
const rootDir = resolve(appDir, '..');
const distDir = join(appDir, 'dist');
const outDir = join(rootDir, 'docs', 'screenshots');

const STATIC_PORT = 4391;
const API_PORT = 4392;

const args = process.argv.slice(2);
const only = (args.find((a) => a.startsWith('--only=')) || '').split('=')[1];
const mobileOnly = args.includes('--mobile-only');
const desktopOnly = args.includes('--desktop-only');

if (!existsSync(join(distDir, 'index.html'))) {
  console.error('dist/ is missing — run `npm run build` first (prerender included).');
  process.exit(1);
}

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json',
  '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
};

const imgCache = new Map();

const server = createServer(async (req, res) => {
  try {
    const u = new URL(req.url, `http://127.0.0.1:${STATIC_PORT}`);

    // Product imagery lives on the client's host, which blocks hotlinked
    // requests. Fetch server-side without a Referer — mirrors vercel.json.
    if (u.pathname.startsWith('/img/')) {
      try {
        const key = u.pathname;
        let hit = imgCache.get(key);
        if (!hit) {
          const target = `https://rollerspub.com/wp-content/${key.replace('/img/', '')}`;
          const proxied = await fetch(target, { signal: AbortSignal.timeout(15000) });
          if (!proxied.ok) throw new Error(String(proxied.status));
          hit = {
            body: Buffer.from(await proxied.arrayBuffer()),
            type: proxied.headers.get('content-type') || 'image/jpeg',
          };
          imgCache.set(key, hit);
        }
        res.writeHead(200, { 'content-type': hit.type, 'cache-control': 'public, max-age=86400' });
        res.end(hit.body);
      } catch {
        res.writeHead(404); res.end();
      }
      return;
    }

    // Same-origin /api/*, exactly as the Vercel serverless function rewrites it.
    if (u.pathname.startsWith('/api/')) {
      const apiPath = u.pathname.replace(/^\/api/, '') || '/';
      try {
        const proxied = await fetch(`http://127.0.0.1:${API_PORT}${apiPath}${u.search}`, {
          signal: AbortSignal.timeout(8000),
        });
        res.writeHead(proxied.status, { 'content-type': proxied.headers.get('content-type') || 'application/json' });
        res.end(Buffer.from(await proxied.arrayBuffer()));
      } catch {
        res.writeHead(502, { 'content-type': 'application/json' });
        res.end('[]');
      }
      return;
    }

    let filePath = join(distDir, decodeURIComponent(u.pathname));
    if (!filePath.startsWith(distDir)) { res.writeHead(403); res.end(); return; }
    if (filePath.endsWith('/')) filePath = join(filePath, 'index.html');
    if (extname(filePath) === '') filePath = join(distDir, 'index.html'); // SPA fallback
    res.writeHead(200, { 'content-type': MIME[extname(filePath)] || 'application/octet-stream' });
    res.end(readFileSync(filePath));
  } catch {
    res.writeHead(404); res.end('not found');
  }
});

// --- reference API ---
const apiProc = spawn(process.execPath, [join(rootDir, 'server', 'index.js')], {
  env: { ...process.env, PORT: String(API_PORT) },
  stdio: ['ignore', 'ignore', 'inherit'],
});

await new Promise((r) => server.listen(STATIC_PORT, r));
await new Promise((r) => setTimeout(r, 1200)); // API warm-up

try {
  const probe = await fetch(`http://127.0.0.1:${API_PORT}/products?limit=1`, { signal: AbortSignal.timeout(5000) });
  console.log(`API probe: ${probe.status}`);
} catch (err) {
  console.warn(`API probe failed (${String(err).slice(0, 60)}) — shots will use the bundled catalog.`);
}

const BASE = `http://127.0.0.1:${STATIC_PORT}`;

/** Frames: [slug, path, async prepare(page)] */
const FRAMES = [
  { slug: '01-home-hero', path: '/', settle: 1200 },
  { slug: '02-shop-raw-filter', path: '/shop?category=rolling-papers', settle: 2200 },
  {
    slug: '03-product-detail',
    path: '/product/raw-classic-paper-tin-box',
    settle: 2400,
  },
  {
    slug: '04-added-to-cart',
    path: '/product/raw-classic-paper-tin-box',
    settle: 2000,
    async act(page) {
      // Add the product, then capture the confirmation toast.
      const btn = page.locator('button').filter({ hasText: /add to (cart|bag)/i }).first();
      if (await btn.count()) {
        await btn.click({ timeout: 8000 }).catch(() => {});
        await page.waitForTimeout(1200);
      }
    },
  },
  {
    slug: '05-cart-page',
    path: '/cart',
    settle: 1800,
    async act(page) {
      // Ensure the cart has something in it for an honest screenshot.
      await page.evaluate(() => {
        const raw = localStorage.getItem('rr-cart');
        if (raw && raw !== '[]' && JSON.parse(raw).length) return;
        localStorage.setItem('rr-cart', JSON.stringify([
          { id: '11680', name: 'Raw Classic Paper Tin Box', slug: 'raw-classic-paper-tin-box',
            price: 700, image: '/images/products/raw-classic-paper-tin-box.jpg',
            category: 'Accessories', categoryId: 'accessories', quantity: 1, inStock: true, stock: 25 },
        ]));
      });
      await page.reload({ waitUntil: 'load' });
      await page.waitForTimeout(1800);
    },
  },
  { slug: '06-checkout', path: '/checkout', settle: 2200 },
];

const VIEWPORTS = [
  ...(mobileOnly ? [] : [{ name: 'desktop', width: 1440, height: 900, dsf: 2 }]),
  ...(desktopOnly ? [] : [{ name: 'mobile', width: 390, height: 844, dsf: 2 }]),
];

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });

const frames = only ? FRAMES.filter((f) => f.slug.includes(only)) : FRAMES;
if (!frames.length) {
  console.error(`No frame matches --only=${only}`);
  process.exit(1);
}

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.dsf,
    isMobile: vp.name === 'mobile',
    hasTouch: vp.name === 'mobile',
  });

  for (const frame of frames) {
    const page = await context.newPage();
    // Same age-gate bypass prerender uses.
    await page.addInitScript(() => {
      try { localStorage.setItem('rr-age-verified', 'yes'); } catch {}
    });

    try {
      await page.goto(BASE + frame.path, { waitUntil: 'load', timeout: 45000 });
      await page.waitForTimeout(frame.settle);
      if (frame.act) await frame.act(page);

      const suffix = vp.name === 'mobile' ? '-mobile' : '';
      const file = join(outDir, `${frame.slug}${suffix}.png`);
      await page.screenshot({ path: file, fullPage: false });
      console.log(`  ✓ ${frame.slug}${suffix}`);
    } catch (err) {
      console.error(`  ✗ ${frame.slug}${suffix}: ${String(err).slice(0, 120)}`);
    } finally {
      await page.close();
    }
  }

  await context.close();
}

await browser.close();
server.close();
apiProc.kill();
console.log(`\nScreenshots written to ${outDir}`);
process.exit(0);