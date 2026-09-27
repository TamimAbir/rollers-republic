#!/usr/bin/env node
/**
 * generate-catalog.mjs — derive the client's fallback dataset from the SSOT.
 *
 *   node scripts/generate-catalog.mjs          (auto: skips when up to date)
 *   node scripts/generate-catalog.mjs --check  (CI: exits 1 on drift)
 *
 * server/seed.json is the one hand-edited data source (categories, products,
 * testimonials, brands). This script turns it into the typed module consumed
 * by `src/lib/api.ts` and `src/store/databaseStore.ts`, so there is exactly
 * one place to edit catalog data. Wired into the build chain via the
 * `prebuild` / `predev` npm hooks in package.json.
 *
 * Zero dependencies: plain JSON.parse + JSON.stringify, plus a strict-shape
 * sanity check (unknown product keys, dangling categoryId, duplicate
 * ids/slugs) so a malformed seed fails the build with a readable message.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(__dirname, '..');
const rootDir = resolve(appDir, '..');
const seedPath = resolve(rootDir, 'server', 'seed.json');
const outPath = resolve(appDir, 'src', 'data', 'catalog.ts');
const checkMode = process.argv.includes('--check');

// Keys allowed on a seed product — anything else is a typo or a new field
// that also belongs in `app/src/types/index.ts` and here.
const PRODUCT_KEYS = new Set([
  'id', 'name', 'slug', 'description', 'price', 'originalPrice', 'salePrice',
  'image', 'images', 'category', 'categoryId', 'rating', 'reviewCount',
  'brand', 'brandSlug', 'featured', 'inStock', 'stock', 'badge', 'tags',
  'specifications', 'new',
]);
const CATEGORY_KEYS = new Set(['id', 'name', 'slug', 'description', 'image', 'icon', 'productCount', 'gradient']);
const BRAND_KEYS = new Set(['id', 'name', 'slug', 'logo']);
const TESTIMONIAL_KEYS = new Set(['id', 'name', 'avatar', 'rating', 'quote']);

function fail(message) {
  console.error(`✗ generate-catalog: ${message}`);
  process.exit(1);
}

function validate(seed) {
  const problems = [];
  for (const key of ['categories', 'products', 'testimonials', 'brands']) {
    if (!Array.isArray(seed[key])) problems.push(`seed.${key} is not an array`);
  }
  if (problems.length) fail(problems.join('; '));

  const seenIds = new Set();
  const seenSlugs = new Set();
  for (const p of seed.products) {
    const unknown = Object.keys(p).filter((k) => !PRODUCT_KEYS.has(k));
    if (unknown.length) problems.push(`product ${p.id ?? '?'} has unknown field(s): ${unknown.join(', ')}`);
    if (seenIds.has(p.id)) problems.push(`duplicate product id: ${p.id}`);
    if (seenSlugs.has(p.slug)) problems.push(`duplicate product slug: ${p.slug}`);
    seenIds.add(p.id);
    seenSlugs.add(p.slug);
  }
  const categorySlugs = new Set(seed.categories.map((c) => c.slug));
  for (const c of seed.categories) {
    const unknown = Object.keys(c).filter((k) => !CATEGORY_KEYS.has(k));
    if (unknown.length) problems.push(`category ${c.slug}: unknown field(s) ${unknown.join(', ')}`);
  }
  for (const p of seed.products) {
    if (!categorySlugs.has(p.categoryId)) problems.push(`product ${p.id}: categoryId "${p.categoryId}" matches no category slug`);
  }
  for (const b of seed.brands) {
    const unknown = Object.keys(b).filter((k) => !BRAND_KEYS.has(k));
    if (unknown.length) problems.push(`brand ${b.slug}: unknown field(s) ${unknown.join(', ')}`);
  }
  for (const t of seed.testimonials) {
    const unknown = Object.keys(t).filter((k) => !TESTIMONIAL_KEYS.has(k));
    if (unknown.length) problems.push(`testimonial ${t.id}: unknown field(s) ${unknown.join(', ')}`);
  }
  if (problems.length) fail(`seed.json failed validation:\n  - ${problems.slice(0, 10).join('\n  - ')}`);
}

// Serialize with stable key order and 2-space indent so the committed module
// diffs cleanly when only a few products change.
function emit(name, typeAnn, items) {
  return `export const ${name}: ${typeAnn} = ${JSON.stringify(items, null, 2)};\n`;
}

function buildModule(seed) {
  return `// GENERATED FILE — do not edit. Source of truth: server/seed.json.
// Regenerate with: node scripts/generate-catalog.mjs  (also runs via predev/prebuild)
import type { Product, Category, Brand, Testimonial } from '@/types';

export type { Product, Category, Brand, Testimonial };

export const categories: Category[] = ${JSON.stringify(seed.categories, null, 2)};

export const brands: Brand[] = ${JSON.stringify(seed.brands, null, 2)};

export const products: Product[] = ${JSON.stringify(seed.products, null, 2)};

export const testimonials: Testimonial[] = ${JSON.stringify(seed.testimonials, null, 2)};
`;
}

const seed = JSON.parse(readFileSync(seedPath, 'utf8'));
validate(seed);

const next = buildModule(seed);

if (checkMode) {
  if (!existsSync(outPath)) fail(`missing ${outPath} — run node scripts/generate-catalog.mjs and commit the result`);
  const current = readFileSync(outPath, 'utf8');
  if (current !== next) {
    console.error('✗ src/data/catalog.ts is out of date with server/seed.json.');
    console.error('  Run: node scripts/generate-catalog.mjs  (then commit the updated file)');
    process.exit(1);
  }
  console.log('✅ src/data/catalog.ts is in sync with server/seed.json');
  process.exit(0);
}

if (existsSync(outPath)) {
  const current = readFileSync(outPath, 'utf8');
  if (current === next) {
    console.log(`✓ catalog.ts already up to date (${seed.products.length} products from server/seed.json)`);
    process.exit(0);
  }
}

writeFileSync(outPath, next);
console.log(`✓ src/data/catalog.ts generated from server/seed.json (${seed.categories.length} categories, ${seed.products.length} products, ${seed.brands.length} brands, ${seed.testimonials.length} testimonials)`);
