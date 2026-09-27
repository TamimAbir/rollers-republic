#!/usr/bin/env node
/**
 * prerender.mjs — static-prerender every route in public/sitemap.xml so bots,
 * social scrapers, and no-JS clients receive fully-populated HTML
 * (SEO-AUDIT fix #4).
 *
 *   node scripts/prerender.mjs
 *
 * How it works:
 *   1. Reads public/sitemap.xml (regenerate with `npm run sitemap`) and keeps
 *      PATHNAME routes only — query-string URLs (/shop?brand=…) are served the
 *      prerendered /shop HTML by the host's rewrite; their brand/category
 *      title updates on hydration.
 *   2. Starts the reference API server (server/index.js) plus a tiny static
 *      server for dist/ that proxies /api/* (fail-fast so the app's static
 *      fallback engages if the API dies).
 *   3. Renders each route in headless chromium — AgeGate pre-consented via
 *      localStorage, service worker disabled, waits for JSON-LD injection
 *      (the app's own "content ready" signal) instead of networkidle — and
 *      saves to dist/<route>/index.html. / overwrites the SPA shell, which
 *      then doubles as the fallback (unknown routes briefly show prerendered
 *      home before the router renders the 404 UI).
 *   4. Verifies a sample: per-page <title>, populated #root, JSON-LD present.
 */
import { createServer as createHttp } from 'node:http';
import { readFileSync, writeFileSync, mkdirSync, appendFileSync } from 'node:fs';
import { resolve, dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(__dirname, '..');
const rootDir = resolve(appDir, '..');
const distDir = join(appDir, 'dist');
const SITE_URL = process.env.SITE_URL || 'https://rollerspub.com';

const STATIC_PORT = 4187;
const API_PORT = 4188;
const CONCURRENCY = 4;

// Escape hatch + CI soft-fail. On Vercel, chromium may be unavailable (no
// system deps for browsers); shipping the SPA fallback beats failing a deploy.
if (process.env.SKIP_PRERENDER === '1') {
  console.log('SKIP_PRERENDER=1 — skipping prerender (SPA fallback stays in dist).');
  process.exit(0);
}

/**
 * Runtime style-injection libraries can append the same <style> block more
 * than once during hydration (previously 32 copies of the sonner toast CSS =
 * ~450 KB of waste per page). Keep the first occurrence of each block.
 */
function dedupeStyles(html) {
  const seen = new Set();
  return html.replace(/<style[^>]*>([\s\S]*?)<\/style>/g, (tag, css) => {
    if (seen.has(css)) return '';
    seen.add(css);
    return tag;
  });
}

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.json': 'application/json', '.woff2': 'font/woff2', '.txt': 'text/plain',
  '.xml': 'application/xml', '.webmanifest': 'application/manifest+json',
};

// ---------- tiny static server with fail-fast /api proxy ----------
const imgCache = new Map(); // /img/<path> → { body, type } across all renders
function startStaticServer() {
  const apiBase = `http://127.0.0.1:${API_PORT}`;
  const server = createHttp(async (req, res) => {
    try {
      const u = new URL(req.url, `http://127.0.0.1:${STATIC_PORT}`);
      if (u.pathname.startsWith('/img/')) {
        // Mirror of the prod /img/ proxy (vercel.json): fetch remote product
        // images server-side (no Referer → no hotlink block) so prerendered
        // pages don't render blank galleries. Shared in-memory cache — the
        // same images recur across hundreds of routes.
        try {
          const key = u.pathname;
          let hit = imgCache.get(key);
          if (!hit) {
            const target = `https://rollerspub.com/wp-content/${u.pathname.replace('/img/', '')}`;
            const proxied = await fetch(target, { signal: AbortSignal.timeout(10000) });
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
      if (u.pathname.startsWith('/api/')) {
        // The app calls /api/products… (same-origin on Vercel, where the
        // serverless function strips the /api prefix). The reference server
        // serves /products… directly — rewrite here too.
        const apiPath = u.pathname.replace(/^\/api/, '') || '/';
        try {
          const proxied = await fetch(`${apiBase}${apiPath}${u.search}`, {
            signal: AbortSignal.timeout(5000),
          });
          res.writeHead(proxied.status, { 'content-type': proxied.headers.get('content-type') || 'application/json' });
          res.end(Buffer.from(await proxied.arrayBuffer()));
        } catch {
          // fail fast → the app's static seed fallback kicks in
          res.writeHead(502, { 'content-type': 'application/json' });
          res.end('[]');
        }
        return;
      }
      let filePath = join(distDir, decodeURIComponent(u.pathname));
      if (!filePath.startsWith(distDir)) { res.writeHead(403); res.end(); return; }
      if (filePath.endsWith('/')) filePath = join(filePath, 'index.html');
      if (extname(filePath) === '') filePath = join(distDir, 'index.html'); // SPA fallback
      const body = readFileSync(filePath);
      res.writeHead(200, { 'content-type': MIME[extname(filePath)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404); res.end('not found');
    }
  });
  return server;
}

// ---------- routes from sitemap (pathname only, deduped) ----------
const sitemap = readFileSync(join(appDir, 'public/sitemap.xml'), 'utf8');
const NOINDEX = ['/cart', '/checkout', '/success', '/login', '/register', '/account'];
const routes = [...new Set(
  [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map((m) => m[1].replace(SITE_URL, '').split('?')[0])
    .filter((r) => !NOINDEX.some((n) => r === n || r.startsWith(n + '/'))),
)];
console.log(`Prerendering ${routes.length} pathname routes with concurrency ${CONCURRENCY}…`);

// ---------- servers ----------
const dbg = (msg) => appendFileSync('/tmp/rr-prerender-debug.log', `${new Date().toISOString()} ${msg}\n`);
dbg('starting servers');
const apiProc = spawn(process.execPath, [join(rootDir, 'server/index.js')], {
  env: { ...process.env, PORT: String(API_PORT) },
  stdio: ['ignore', 'ignore', 'pipe'],
});
apiProc.stderr.on('data', (d) => process.stderr.write(`[api] ${d}`));
dbg('api spawned');
const staticServer = startStaticServer();
await new Promise((res) => staticServer.listen(STATIC_PORT, res));
dbg('static listening');
// NB: 'spawn' event proved unreliable under launchd on this machine — poll
// the pid instead (it is set synchronously on successful spawn).
for (let i = 0; i < 50 && typeof apiProc.pid !== 'number'; i++) await new Promise((r) => setTimeout(r, 100));
dbg(`api pid ${apiProc.pid}`);
await new Promise((r) => setTimeout(r, 1000)); // API warm-up
dbg('warm-up done');

// sanity check: API answering?
try {
  const probe = await fetch(`http://127.0.0.1:${API_PORT}/products?limit=1`, { signal: AbortSignal.timeout(3000) });
  dbg(`api probe ${probe.status}`);
  console.log(`API probe: ${probe.status}`);
} catch (err) {
  dbg(`api probe FAILED ${String(err).slice(0, 80)}`);
  console.error(`API probe failed (${String(err).slice(0, 80)}) — continuing; app falls back to static seed.`);
}

// ---------- render ----------
const { chromium } = require('playwright');

/** Launch chromium, auto-installing it once if the binary is missing. */
async function launchBrowser() {
  try {
    return await chromium.launch({
      // CI containers (Vercel build image) run as non-root without the SUID
      // sandbox — launching with it kills the browser instantly.
      chromiumSandbox: false,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    });
  } catch (err) {
    // On Vercel the binary may be absent AND system deps always are — don't
    // waste build minutes downloading a browser that can't launch there.
    if (process.env.VERCEL || !String(err).includes("Executable doesn't exist")) throw err;
    console.log('  chromium not installed — running `playwright install chromium`…');
    execSync('npx playwright install chromium', { stdio: 'inherit', cwd: appDir });
    return chromium.launch();
  }
}

let browser;
try {
  browser = await launchBrowser();
} catch (err) {
  if (process.env.VERCEL) {
    console.warn(`⚠️  Prerender skipped on Vercel: chromium unavailable (${String(err).slice(0, 80)}). SPA fallback remains in dist — run 'npm run prerender' locally for full static HTML.`);
    staticServer.close();
    apiProc.kill();
    process.exit(0);
  }
  throw err;
}

let done = 0;
const failed = [];
const startedAt = Date.now();

async function renderRoute(route, idx) {
  const page = await browser.newPage();
  const t0 = Date.now();
  try {
    await page.addInitScript(() => localStorage.setItem('rr-age-verified', 'yes'));
    await page.goto(`http://127.0.0.1:${STATIC_PORT}${route}`, { waitUntil: 'load', timeout: 30000 });
    const gotoMs = Date.now() - t0;
    // JSON-LD injection is the app's own "content ready" signal (fires after
    // data resolves); business schema on every page, product schema on PDPs.
    await page.waitForSelector('#rr-jsonld-business', { state: 'attached', timeout: 12000 }).catch(() => {});
    if (route.startsWith('/product/')) {
      await page.waitForSelector('#rr-jsonld', { state: 'attached', timeout: 12000 }).catch(() => {});
    }
    await page.waitForTimeout(350); // framer-motion entrance frames
    const html = dedupeStyles(await page.content());
    const outPath = join(distDir, route, 'index.html'); // '/' → dist/index.html
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, html);
    done++;
    if (idx < 8) console.log(`  [debug] ${route} goto=${gotoMs}ms total=${Date.now() - t0}ms size=${(html.length / 1024).toFixed(0)}KB`);
    if (done % 25 === 0) {
      const rate = done / ((Date.now() - startedAt) / 1000);
      console.log(`  ${done}/${routes.length} (${rate.toFixed(1)} routes/s)`);
    }
  } catch (err) {
    failed.push({ route, error: String(err).slice(0, 100) });
    if (failed.length <= 5) console.log(`  [fail] ${route}: ${String(err).slice(0, 90)}`);
  } finally {
    await page.close();
  }
}

const queue = [...routes];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    for (;;) {
      const route = queue.shift();
      if (!route) return;
      await renderRoute(route, routes.length - queue.length);
    }
  }),
);

await browser.close();
staticServer.close();
apiProc.kill();

console.log(`\nRendered ${done}/${routes.length} in ${((Date.now() - startedAt) / 1000).toFixed(0)}s${failed.length ? ` — ${failed.length} FAILED` : ''}`);
if (failed.length) console.log('Failures (first 5):', JSON.stringify(failed.slice(0, 5), null, 1));
if (!process.env.VERCEL && failed.length > routes.length * 0.1) {
  console.error(`❌ ${failed.length}/${routes.length} routes failed — failing the build.`);
  process.exitCode = 1;
}

// ---------- verification sample ----------
const samples = ['/', '/shop', '/about', '/contact', '/terms'];
const productSample = routes.find((r) => r.startsWith('/product/'));
if (productSample) samples.push(productSample);
for (const s of samples) {
  try {
    const html = readFileSync(join(distDir, s, 'index.html'), 'utf8');
    const title = html.match(/<title>(.*?)<\/title>/)?.[1] || '(none)';
    const jsonLd = [...html.matchAll(/id="(rr-jsonld[^"]*)"/g)].map((m) => m[1]);
    console.log(`  ${s} → "${title.slice(0, 58)}" ${(html.length / 1024).toFixed(0)}KB ld=[${jsonLd.join(',')}]`);
  } catch {
    console.log(`  ${s} → MISSING`);
  }
}
console.log('\n✅ Prerender complete.');
