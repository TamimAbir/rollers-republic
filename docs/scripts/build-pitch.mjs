#!/usr/bin/env node
/**
 * build-pitch.mjs — inlines the buyer-flow screenshots into the pitch one-pager
 * as base64 data URIs, producing a single self-contained HTML file you can
 * email, AirDrop, or drop on any static host.
 *
 *   node scripts/build-pitch.mjs
 *
 * Inputs:  docs/pitch.template.html, docs/screenshots/*.png
 * Output:  docs/pitch.html
 *
 * Regenerate screenshots first if the UI changed:
 *   cd app && node scripts/capture-flow.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsDir = resolve(__dirname, '..');

const template = readFileSync(resolve(docsDir, 'pitch.template.html'), 'utf8');

const images = [
  '01-home-hero.png',
  '02-shop-raw-filter.png',
  '03-product-detail.png',
  '04-added-to-cart.png',
  '05-cart-page.png',
  '06-checkout.png',
];

const size = (bytes) => (bytes / 1024 / 1024).toFixed(2) + ' MB';

let html = template;
let total = 0;
for (const name of images) {
  const png = readFileSync(resolve(docsDir, 'screenshots', name));
  total += png.length;
  const dataUri = `data:image/png;base64,${png.toString('base64')}`;
  const token = `screenshots/${name}`;
  if (!html.includes(token)) {
    throw new Error(`Template does not reference ${token} — keep the template in sync with build-pitch.mjs`);
  }
  html = html.replaceAll(token, dataUri);
  console.log(`  inlined ${name} (${size(png.length)})`);
}

writeFileSync(resolve(docsDir, 'pitch.html'), html);
console.log(`\n✅ docs/pitch.html written — ${images.length} screenshots embedded, images total ${size(total)}`);
