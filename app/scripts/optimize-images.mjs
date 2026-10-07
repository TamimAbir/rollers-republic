/**
 * optimize-images.mjs — shrink the product imagery that dominates mobile LCP.
 *
 * Context (measured, Lighthouse 13.5.0, 2026-10-06):
 *   mobile LCP 10.7s on / and 10.3s on /shop, while desktop LCP is 2.2s. The
 *   bottleneck is image weight, not JavaScript: `public/images` ships 17MB,
 *   56 raster files, 12 of them over 500KB, the worst a 2.4MB PNG.
 *
 * What this does:
 *   1. Every PNG/JPEG over `MIN_BYTES` gets a WebP sibling (quality `QUALITY`).
 *      The original is kept so nothing that references a .png breaks.
 *   2. Writes `public/images/products/image-manifest.json` listing each asset
 *      with its original path, the webp path, and byte sizes — so the UI can
 *      swap sources without a hardcoded lookup table.
 *   3. Generates `src/data/image-variants.ts` — the same mapping as a typed
 *      module, mirroring how `catalog.ts` derives from `seed.json`. The UI
 *      imports that and asks for an optimized URL; anything absent from the map
 *      falls through to the original file. Generated, never hand-edited.
 *   4. Builds a responsive width ladder for the hero (and any other asset named
 *      in RESPONSIVE) so the browser can fetch a correctly sized file instead of
 *      the full-resolution one. The hero was measured at 476KB and is the LCP
 *      element on every page view.
 *   5. `--report` prints what would change and writes nothing (dry run).
 *
 * WebP gets universal support (all evergreen browsers, iOS 14+), so serving it
 * alongside the original is safe; the originals stay on disk as the fallback for
 * the <picture> fallback path.
 *
 * Encoder: ffmpeg's libwebp. macOS `sips` advertises webp as writable but fails
 * with "Can't write format: org.webmproject.webp" (exit 13) on every file, so it
 * cannot be used here. ffmpeg ships with Hermes and with Playwright's cache.
 *
 * Usage:
 *   node scripts/optimize-images.mjs --report     # dry run, no writes
 *   node scripts/optimize-images.mjs             # convert + write manifest
 */
import { readdirSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url)); // app/
const IMAGES = join(ROOT, 'public/images/products');

const MIN_BYTES = 80 * 1024; // only convert images worth converting
const QUALITY = 78; // visually clean for product shots, big win vs PNG
const reportOnly = process.argv.includes('--report');

const RASTER = new Set(['.png', '.jpg', '.jpeg']);
const KB = 1024;

/**
 * Assets that get a responsive width ladder in addition to the flat WebP
 * conversion. The hero is the LCP element on every page: measured at 476KB and
 * 1024x1536, but rendered into roughly half the viewport on desktop and about
 * 90% of it on mobile — so most of that weight was never displayed.
 *
 * `sizes` must match the rendered CSS box at each breakpoint (see the `sizes`
 * attribute written into Hero.tsx). Widths are the intrinsic pixel widths the
 * browser chooses between.
 */
const RESPONSIVE = [
  {
    name: 'hero-product',
    dir: join(ROOT, 'public/images'),
    source: 'hero-product.jpg',
    widths: [320, 480, 640, 768, 1024],
    // w-full inside a max-w-lg column on desktop; ~92vw on mobile.
    sizes: '(min-width: 1024px) 32rem, (min-width: 768px) 45vw, 92vw',
  },
];

// Resolve a libwebp-capable ffmpeg once: PATH first, then the copies Playwright
// and Hermes already vendor.
const FFMPEG_CANDIDATES = [
  'ffmpeg',
  join(process.env.HOME ?? '', 'Library/Caches/ms-playwright/ffmpeg-1011/ffmpeg-mac'),
  join(process.env.HOME ?? '', '.hermes/tools/ffmpeg-9.0.1-darwin-arm64/ffmpeg'),
];

function resolveFfmpeg() {
  for (const candidate of FFMPEG_CANDIDATES) {
    try {
      execFileSync(candidate, ['-hide_banner', '-encoders'], { stdio: 'pipe' });
      if (execFileSync(candidate, ['-hide_banner', '-encoders'], { stdio: 'pipe' })
        .toString()
        .includes('libwebp')) {
        return candidate;
      }
    } catch {
      /* try the next candidate */
    }
  }
  console.error(
    '✗ no ffmpeg with libwebp found. Tried:\n  ' +
      FFMPEG_CANDIDATES.join('\n  ') +
      '\n  Install ffmpeg, or run: npm i -D sharp and swap the encoder.',
  );
  process.exit(1);
}

const FFMPEG = resolveFfmpeg();

function convert(src, dest) {
  // libwebp via ffmpeg; quality 78 keeps product shots clean at a fraction of
  // the PNG size. -y overwrites, -loglevel error keeps stdout readable.
  execFileSync(
    FFMPEG,
    ['-y', '-loglevel', 'error', '-i', src, '-c:v', 'libwebp', '-quality', String(QUALITY), dest],
    { stdio: 'pipe' },
  );
}

/** Scale `src` to an exact pixel width and encode as WebP. */
function convertWidth(src, dest, width) {
  execFileSync(
    FFMPEG,
    [
      '-y', '-loglevel', 'error',
      '-i', src,
      '-vf', `scale=${width}:-2`, // -2 keeps aspect, forces even dimensions
      '-c:v', 'libwebp', '-quality', String(QUALITY),
      dest,
    ],
    { stdio: 'pipe' },
  );
}

/**
 * Intrinsic pixel width of an image. Parsed from ffmpeg's stderr banner rather
 * than ffprobe: ffmpeg is the binary we resolve, and ffprobe is not guaranteed to
 * sit beside it (Playwright's bundled copy has no ffprobe). ffmpeg exits
 * non-zero when given no output file, so the failure is expected here and the
 * message still carries the stream dimensions.
 */
function intrinsicWidth(file) {
  let stderr = '';
  try {
    execFileSync(FFMPEG, ['-hide_banner', '-i', file], { stdio: ['ignore', 'ignore', 'pipe'] });
  } catch (error) {
    stderr = String(error.stderr ?? '');
  }
  // e.g. "Stream #0:0: Video: webp, yuv420p(progressive), 1024x1536, ..."
  const match = stderr.match(/Video:.*?,\s*(\d{2,5})x(\d{2,5})/);
  if (!match) throw new Error(`could not read intrinsic size of ${file}`);
  return Number(match[1]);
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return RASTER.has(extname(entry.name).toLowerCase()) ? [full] : [];
  });
}

if (!existsSync(IMAGES)) {
  console.error(`✗ no image directory at ${IMAGES}`);
  process.exit(1);
}

const files = walk(IMAGES).sort();
const manifest = { generated: null, quality: QUALITY, assets: {} };
let before = 0;
let after = 0;
let skipped = 0;
let missing = 0;

for (const src of files) {
  const srcBytes = statSync(src).size;
  before += srcBytes;
  const rel = relative(join(ROOT, 'public'), src);
  const webp = src.replace(/\.(png|jpe?g)$/i, '.webp');

  if (srcBytes < MIN_BYTES) {
    skipped += 1;
    continue;
  }

  if (existsSync(webp) && statSync(webp).size > 0) {
    const bytes = statSync(webp).size;
    after += bytes;
    manifest.assets[rel] = { webp: relative(join(ROOT, 'public'), webp), bytes, original: srcBytes };
    continue;
  }

  if (reportOnly) {
    const saving = '?';
    console.log(`  would convert ${(srcBytes / KB).toFixed(0)}KB → ${saving}  ${rel}`);
    continue;
  }

  try {
    convert(src, webp);
    const bytes = statSync(webp).size;
    after += bytes;
    manifest.assets[rel] = { webp: relative(join(ROOT, 'public'), webp), bytes, original: srcBytes };
    console.log(
      `  ${(srcBytes / KB).toFixed(0)}KB → ${(bytes / KB).toFixed(0)}KB  ` +
        `(-${(100 - (bytes / srcBytes) * 100).toFixed(0)}%)  ${rel}`,
    );
  } catch (error) {
    missing += 1;
    console.warn(`  ! failed: ${rel} — ${error.message.split('\n')[0]}`);
  }
}

if (reportOnly) {
  const heavy = files.filter((f) => statSync(f).size >= MIN_BYTES);
  const totalHeavy = heavy.reduce((sum, f) => sum + statSync(f).size, 0);
  console.log(
    `\n${heavy.length} files ≥ ${MIN_BYTES / KB}KB, ${(totalHeavy / 1024 / 1024).toFixed(1)}MB total.`,
  );
  for (const spec of RESPONSIVE) {
    const src = join(spec.dir, spec.source);
    if (!existsSync(src)) {
      console.log(`  responsive: ${spec.name} — source missing, skipped`);
      continue;
    }
    console.log(`  responsive: ${spec.name} would emit ${spec.widths.length} widths`);
  }
  console.log('Dry run — nothing written.');
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Responsive width ladders. Runs before the manifest is written so the typed
// module can carry the ladder data the UI needs to build a srcset.
// ---------------------------------------------------------------------------
const responsive = [];
for (const spec of RESPONSIVE) {
  const src = join(spec.dir, spec.source);
  if (!existsSync(src)) {
    console.warn(`  ! responsive: ${spec.name} — no source at ${relative(ROOT, src)}, skipped`);
    continue;
  }
  const native = intrinsicWidth(src);
  const widths = spec.widths.filter((w) => w <= native);
  if (!widths.length) {
    console.warn(`  ! responsive: ${spec.name} — no width ≤ native ${native}px, skipped`);
    continue;
  }
  const sources = [];
  for (const width of widths) {
    const dest = join(spec.dir, `${spec.name}-${width}.webp`);
    if (!existsSync(dest) || statSync(dest).size === 0) {
      if (reportOnly) continue;
      convertWidth(src, dest, width);
    }
    sources.push({
      width,
      src: `/${relative(join(ROOT, 'public'), dest)}`,
      bytes: statSync(dest).size,
    });
  }
  if (!sources.length) continue;
  const smallest = sources[0];
  const flat = join(spec.dir, `${spec.name}.webp`);
  const flatBytes = existsSync(flat) ? statSync(flat).size : null;
  responsive.push({
    name: spec.name,
    fallback: `/${relative(join(ROOT, 'public'), join(spec.dir, spec.source))}`,
    srcset: sources.map((s) => `${s.src} ${s.width}w`).join(', '),
    sizes: spec.sizes,
    sources,
    native,
    flatBytes,
  });
  console.log(
    `  responsive ${spec.name}: ${sources.length} widths ` +
      `(${sources.map((s) => `${s.width}w=${(s.bytes / KB).toFixed(0)}KB`).join(' ')})` +
      `${flatBytes ? ` vs flat ${(flatBytes / KB).toFixed(0)}KB` : ''}`,
  );
}

manifest.generated = new Date().toISOString();
const manifestPath = join(IMAGES, 'image-manifest.json');
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

// Typed module for the UI. Same derivation discipline as catalog.ts <- seed.json:
// this file is generated, so it is gitignored and CI checks it with --check.
const entries = Object.entries(manifest.assets).sort(([a], [b]) => a.localeCompare(b));
const modulePath = join(ROOT, 'src/data/image-variants.ts');
// Keys must match the values stored in seed.json exactly — they are absolute
// from the site root ("/images/products/x.png"), not relative. Getting this
// wrong silently falls through to the original, so the original is kept as the
// indexed key and lookups normalise.
const module = `/**
 * AUTO-GENERATED by scripts/optimize-images.mjs — do not edit by hand.
 *
 * Maps each original product image to its optimized WebP sibling. ${entries.length}
 * assets, ${(before / 1024 / 1024).toFixed(1)}MB -> ${(after / 1024 / 1024).toFixed(1)}MB served.
 * Originals remain on disk as the fallback for any asset not listed here.
 *
 * Regenerate: npm run optimize:images
 */
export const IMAGE_VARIANTS: Record<string, string> = {
${entries.map(([orig, meta]) => `  '${orig}': '${meta.webp}',`).join('\n')}
};

/**
 * Lookup table covering both path shapes. seed.json stores absolute
 * ("/images/products/x.png") while the manifest keys are relative
 * ("images/products/x.png"); a single map cannot serve both without
 * duplicating itself, and mutating IMAGE_VARIANTS would corrupt iteration for
 * anything that walks it. Kept separate for that reason.
 */
const LOOKUP: Record<string, string> = { ...IMAGE_VARIANTS };
for (const [key, value] of Object.entries(IMAGE_VARIANTS)) {
  LOOKUP[\`/\${key}\`] = \`/\${value}\`;
}

/**
 * Optimized URL for a product image; falls through to the original when the
 * asset has no WebP sibling.
 */
export function optimizedImage(src: string | undefined | null): string | undefined {
  if (!src) return undefined;
  return LOOKUP[src] ?? src;
}

/** A width ladder for one large above-the-fold image. */
export interface ResponsiveImage {
  readonly name: string;
  /** Original file, used as the <img> src fallback. */
  readonly fallback: string;
  /** Pre-comma "url width" list for the img/srcset attribute. */
  readonly srcset: string;
  /** The sizes attribute that tells the browser which width it needs. */
  readonly sizes: string;
}

/**
 * Responsive ladders keyed by the original filename. ${responsive.length} asset(s).
 * The hero is the LCP element; serving it a correctly sized variant is what
 * moves mobile LCP, not recompressing the full-resolution file.
 */
export const RESPONSIVE_IMAGES: Record<string, ResponsiveImage> = {
${responsive
  .map(
    (r) =>
      `  '${r.name}.jpg': {\n` +
      `    name: '${r.name}',\n` +
      `    fallback: '${r.fallback}',\n` +
      `    srcset: '${r.srcset}',\n` +
      `    sizes: '${r.sizes}',\n` +
      `  },`,
  )
  .join('\n')}
};

/** Responsive ladder for a filename, if one was generated. */
export function responsiveImage(file: string | undefined | null): ResponsiveImage | undefined {
  if (!file) return undefined;
  const name = file.split('/').pop();
  if (!name) return undefined;
  return RESPONSIVE_IMAGES[name];
}
`;
writeFileSync(modulePath, module);

console.log(
  `\n✅ ${entries.length} webp variants · ` +
    `${(before / 1024 / 1024).toFixed(1)}MB → ${(after / 1024 / 1024).toFixed(1)}MB of served imagery` +
    `${skipped ? ` · ${skipped} under threshold left alone` : ''}` +
    `${missing ? ` · ${missing} failed` : ''}` +
    `${responsive.length ? ` · ${responsive.length} responsive ladder(s)` : ''}`,
);
console.log(`   manifest: ${relative(ROOT, manifestPath)}`);
console.log(`   module:   ${relative(ROOT, modulePath)}`);
