/**
 * Minimal single-route probe for the prerender pipeline. Starts the same
 * servers as prerender.mjs, renders ONE route with verbose timing, exits.
 *
 *   node scripts/prerender-probe.mjs
 */
import { createServer as createHttp } from 'node:http';
import { readFileSync } from 'node:fs';
import { resolve, dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(__dirname, '..');
const rootDir = resolve(appDir, '..');
const distDir = join(appDir, 'dist');
const t0 = Date.now();
const log = (...a) => console.log(`${((Date.now() - t0) / 1000).toFixed(1)}s`, ...a);

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json' };

const staticServer = createHttp(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname.startsWith('/api/')) {
    try {
      const p = await fetch(`http://127.0.0.1:4188${u.pathname}${u.search}`, { signal: AbortSignal.timeout(4000) });
      res.writeHead(p.status, { 'content-type': p.headers.get('content-type') || 'application/json' });
      res.end(Buffer.from(await p.arrayBuffer()));
    } catch { res.writeHead(502); res.end('[]'); }
    return;
  }
  let f = join(distDir, decodeURIComponent(u.pathname));
  if (f.endsWith('/')) f = join(f, 'index.html');
  if (extname(f) === '') f = join(distDir, 'index.html');
  try {
    res.writeHead(200, { 'content-type': MIME[extname(f)] || 'application/octet-stream' });
    res.end(readFileSync(f));
  } catch { res.writeHead(404); res.end(); }
});

await new Promise((r) => staticServer.listen(4187, r));
log('static server up');

const api = spawn(process.execPath, [join(rootDir, 'server/index.js')], { env: { ...process.env, PORT: '4188' }, stdio: ['ignore', 'ignore', 'inherit'] });
await new Promise((r) => api.on('spawn', r));
await new Promise((r) => setTimeout(r, 1000));
const probe = await fetch('http://127.0.0.1:4188/products?limit=1').catch((e) => null);
log('api probe:', probe ? probe.status : 'FAILED');

const { chromium } = require('playwright');
const browser = await chromium.launch();
log('browser launched');

const page = await browser.newPage();
await page.addInitScript(() => localStorage.setItem('rr-age-verified', 'yes'));
await page.goto('http://127.0.0.1:4187/shop', { waitUntil: 'load', timeout: 20000 });
log('goto done');
await page.waitForSelector('#rr-jsonld-business', { state: 'attached', timeout: 12000 }).then(() => log('jsonld attached')).catch((e) => log('jsonld TIMEOUT', String(e).slice(0, 60)));
await page.waitForTimeout(350);
const html = await page.content();
log('content captured:', (html.length / 1024).toFixed(0) + 'KB', '| title:', html.match(/<title>(.*?)<\/title>/)?.[1]);

await browser.close();
staticServer.close();
api.kill();
process.exit(0);
