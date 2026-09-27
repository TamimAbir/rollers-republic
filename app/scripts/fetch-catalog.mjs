#!/usr/bin/env node
/**
 * fetch-catalog.mjs — catalog snapshot from Rollers Republic's live
 * WooCommerce Store API into server/seed.json (the data SSOT, SSOT §7).
 *
 *   node scripts/fetch-catalog.mjs
 *
 * Outputs:
 *   1. scripts/catalog-snapshot.json  — raw normalized intermediate (debug/re-run)
 *   2. ../../server/seed.json         — THE catalog single source of truth
 *   3. ../public/images/products/*    — local images for the first 40 in-stock products
 *
 * The client bundle derives its fallback dataset from seed.json at build time
 * (scripts/generate-catalog.mjs → src/data/catalog.ts) — never hand-edit both.
 *
 * No dependencies — uses Node 20+ global fetch. Re-run anytime to refresh.
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const API = 'https://rollerspub.com/wp-json/wc/store/v1';

const MAX_LOCAL_IMAGES = 40;

// Woo top-level slug → our canonical category (SSOT §6 homepage card set)
const CATEGORY_MAP = {
  'buy-rolling-paper-in-bangladesh-bd': { name: 'Rolling Papers', slug: 'rolling-papers', icon: 'Scroll', gradient: 'from-amber-500 to-orange-500', description: 'RAW, Elements, Juicy Jays, OCB — the classics, 100% authentic' },
  blunts: { name: 'Blunts', slug: 'blunts', icon: 'Leaf', gradient: 'from-amber-600 to-red-500', description: 'Hemp and tobacco wraps for the slow burn' },
  'filter-tips': { name: 'Filter Tips', slug: 'filter-tips', icon: 'CircleDot', gradient: 'from-amber-400 to-amber-700', description: 'Perforated, long-fiber, slim — roll it right' },
  'waterpipes-bongs': { name: 'Waterpipes & Bongs', slug: 'water-pipes', icon: 'Droplets', gradient: 'from-amber-500 to-emerald-500', description: 'Hand-picked glass, beakers and bubblers' },
  vapes: { name: 'Vapes', slug: 'vapes', icon: 'Zap', gradient: 'from-amber-400 to-purple-500', description: 'Disposables, pods and premium vaporizers' },
  munchies: { name: 'Munchies', slug: 'munchies', icon: 'Cookie', gradient: 'from-orange-400 to-pink-500', description: 'Sweet and salty, imported straight from the UK' },
  accessories: { name: 'Accessories', slug: 'accessories', icon: 'Package', gradient: 'from-amber-500 to-teal-500', description: 'Grinders, trays, lighters and everything else' },
  cigars: { name: 'Cigars', slug: 'cigars', icon: 'Flame', gradient: 'from-amber-700 to-orange-600', description: 'Slow and serious' },
  uncategorised: null,
};

const CATEGORY_ORDER = [
  'rolling-papers', 'blunts', 'filter-tips', 'water-pipes', 'vapes', 'munchies', 'accessories', 'cigars',
];

// Woo "types" / "features" attribute → our primary category (distinguishes bongs vs pipes vs grinders)
const TYPE_CATEGORY = {
  'water pipe': 'water-pipes',
  'bong': 'water-pipes',
  'smoking pipe': 'water-pipes',
  'pipe': 'water-pipes',
  'grinder': 'accessories',
  'tray': 'accessories',
  'lighter': 'accessories',
  'flavor drops': 'rolling-papers',
};

const STOP_WORDS = new Set(['and', 'the', 'of', 'for', 'with']);

function slugify(text) {
  return String(text).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

// Woo subcategory slug → top-level Woo slug (verified from /products/categories taxonomy)
const SUB_TO_TOP = {
  'accessories-rolling-paper': 'buy-rolling-paper-in-bangladesh-bd',
  'accessories-glass': 'waterpipes-bongs',
  'bongs': 'waterpipes-bongs',
  'smoking-pipe': 'waterpipes-bongs',
  'flavoured': 'buy-rolling-paper-in-bangladesh-bd',
  'non-flavoured': 'buy-rolling-paper-in-bangladesh-bd',
  'hemp-wraps': 'blunts',
  'tobacco-wraps': 'blunts',
};

function resolveTopSlug(slug) {
  if (slug === 'uncategorised') return null;
  if (CATEGORY_MAP[slug]) return slug;
  return SUB_TO_TOP[slug] ?? null;
}

function pickPrimaryCategory(product) {
  const cats = product.categories || [];
  for (const c of cats) {
    const topSlug = resolveTopSlug(c.slug);
    if (topSlug) return CATEGORY_MAP[topSlug];
  }
  const types = (product.attributes || []).find((a) => a.taxonomy === 'pa_types');
  const t = types?.terms?.[0]?.name?.toLowerCase();
  if (t && TYPE_CATEGORY[t]) {
    const topSlug = Object.keys(CATEGORY_MAP).find((k) => CATEGORY_MAP[k]?.slug === TYPE_CATEGORY[t]);
    if (topSlug) return CATEGORY_MAP[topSlug];
  }
  return CATEGORY_MAP['accessories'];
}

function normalize(raw) {
  const price = Number(raw.prices?.price ?? 0);
  const regular = Number(raw.prices?.regular_price ?? price);
  const onSale = Boolean(raw.on_sale) && regular > price;
  const inStock = Boolean(raw.is_in_stock);
  const brand = (raw.attributes || []).find((a) => a.taxonomy === 'pa_brand')?.terms?.[0]?.name;
  const brandSlug = brand ? slugify(brand) : undefined;

  const specs = {};
  for (const attr of raw.attributes || []) {
    if (attr.taxonomy === 'pa_brand' || !attr.terms?.length) continue;
    specs[attr.name] = attr.terms.map((t) => t.name).join(', ');
  }

  const desc = stripHtml(raw.description);
  const short = stripHtml(raw.short_description);
  const primary = pickPrimaryCategory(raw);
  const tags = (raw.categories || []).map((c) => slugify(c.name)).filter((t) => !STOP_WORDS.has(t) && t !== primary.slug);

  const image = raw.images?.[0]?.src || '';
  const id = String(raw.id);
  const slug = raw.slug || slugify(raw.name);

  return {
    id,
    name: raw.name,
    slug,
    description: desc || short || `${raw.name} from Rollers Republic — 100% authentic, imported from the UK.`,
    price,
    ...(onSale ? { originalPrice: regular } : {}),
    image,
    category: primary.name,
    categoryId: primary.slug,
    tags: [...new Set(tags)],
    stock: inStock ? 25 : 0,
    inStock,
    rating: Number(raw.average_rating) || 4.5,
    reviewCount: Number(raw.review_count) || 0,
    ...(brand ? { brand, brandSlug } : {}),
    ...(Object.keys(specs).length ? { specifications: specs } : {}),
    // script-managed metadata (stripped before writing seed.json)
    __meta: { image, inStock, featured: false, isNew: false },
  };
}

async function fetchAllProducts() {
  const all = [];
  let page = 1;
  while (page <= 40) {
    const url = `${API}/products?per_page=50&page=${page}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`WooCommerce API returned ${res.status} on page ${page}`);
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < 50) break;
    page++;
  }
  return all;
}

async function downloadImage(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Image ${res.status}: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
}

async function main() {
  console.log('→ Fetching catalog from Rollers Republic WooCommerce API…');
  const raw = await fetchAllProducts();
  console.log(`✓ ${raw.length} products fetched`);

  const products = raw.map(normalize);

  // Categories actually present + ordered per homepage card set
  const used = new Set(products.map((p) => p.categoryId));
  const categories = CATEGORY_ORDER.filter((s) => used.has(s)).map((s) =>
    Object.values(CATEGORY_MAP).find((c) => c?.slug === s)
  );

  // Brands by frequency
  const brandCount = new Map();
  for (const p of products) {
    if (!p.brand) continue;
    brandCount.set(p.brand, (brandCount.get(p.brand) ?? 0) + 1);
  }
  const brands = [...brandCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name], i) => ({ id: String(i + 1), name, slug: slugify(name) }));

  // Localize images for the first 40 in-stock products
  const localDir = join(ROOT, 'public', 'images', 'products');
  mkdirSync(localDir, { recursive: true });
  let localized = 0;
  const inStockWithImg = products.filter((p) => p.__meta.inStock && p.__meta.image);
  for (const p of inStockWithImg.slice(0, MAX_LOCAL_IMAGES)) {
    const url = new URL(p.__meta.image);
    const ext = (url.pathname.match(/\.(jpe?g|png|webp|gif)$/i) || [, 'jpg'])[1];
    const fname = `${p.slug}.${ext}`;
    const dest = join(localDir, fname);
    if (!existsSync(dest)) {
      try {
        await downloadImage(p.__meta.image, dest);
        localized++;
      } catch (e) {
        console.warn(`  ! image failed (${p.slug}): ${e.message}`);
        continue;
      }
    }
    p.image = `/images/products/${fname}`;
  }

  // Featured: 8 in-stock with sale or high rating; New: 6 most recent ids
  products
    .filter((p) => p.inStock)
    .sort((a, b) => b.rating - a.rating || Number(b.id) - Number(a.id))
    .slice(0, 8)
    .forEach((p) => (p.featured = true));
  products
    .filter((p) => p.inStock)
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 6)
    .forEach((p) => (p.isNew = true));

  // Strip script metadata
  const clean = products.map(({ __meta, ...rest }) => {
    if (__meta.featured) rest.featured = true;
    if (__meta.isNew) rest.new = true;
    return rest;
  });

  const testimonials = [
    { id: '1', name: 'Tanvir A.', rating: 5, quote: 'Best headshop in Dhaka. Original RAW papers, fair prices, and delivery the same day I ordered.' },
    { id: '2', name: 'Nafis R.', rating: 5, quote: 'The glass pieces are beautiful and packed really well. Bro Bear knows his stuff.' },
    { id: '3', name: 'Sami K.', rating: 4, quote: 'Ordered on WhatsApp, paid bKash, and my package arrived within hours. Highly recommended.' },
  ];

  // Category tile images: first in-stock product image per category
  for (const c of categories) {
    const first = clean.find((p) => p.categoryId === c.slug && p.inStock && p.image);
    if (first) c.image = first.image;
  }

  writeFileSync(join(__dirname, 'catalog-snapshot.json'), JSON.stringify({ fetchedAt: new Date().toISOString(), count: clean.length, products: clean }, null, 2));
  const seedPath = resolve(__dirname, '..', '..', 'server', 'seed.json');
  writeFileSync(seedPath, JSON.stringify({ categories, products: clean, testimonials, brands }, null, 2) + '\n');
  console.log(`✓ server/seed.json written (${clean.length} products, ${categories.length} categories, ${brands.length} brands, ${testimonials.length} testimonials)`);
  console.log(`✓ ${localized} product images localized to public/images/products/`);
  console.log('→ Now run: cd app && node scripts/generate-catalog.mjs (refreshes src/data/catalog.ts)');
}

main().catch((e) => {
  console.error('✗ fetch-catalog failed:', e.message);
  process.exit(1);
});
