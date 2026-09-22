/**
 * render-og-image.mjs — rasterize app/public/images/og-image.svg to a
 * 1200x630 PNG (SEO-AUDIT fix #2: Facebook/WhatsApp cannot render SVG
 * link previews).
 *
 *   node scripts/render-og-image.mjs
 *
 * Output: app/public/images/og-image.png
 */
import { chromium } from 'playwright';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { statSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath = resolve(__dirname, '../public/images/og-image.svg');
const outPath = resolve(__dirname, '../public/images/og-image.png');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(`file://${svgPath}`);
await page.waitForTimeout(300); // let fonts/gradients paint
await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();

const kb = Math.round(statSync(outPath).size / 1024);
console.log(`✅ og-image.png rendered (${kb} KB) → public/images/og-image.png`);
