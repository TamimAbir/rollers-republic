import { describe, it, expect } from 'vitest';
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { IMAGE_VARIANTS, optimizedImage } from '../../data/image-variants';

/**
 * The generated variant map is only useful if lookups actually hit. Two failure
 * modes this guards against:
 *
 *  1. seed.json stores image paths with a leading slash ("/images/products/x.png")
 *     while the manifest keys are relative ("images/products/x.png"). When the
 *     map was relative-only, optimizedImage() silently fell through and the
 *     browser fetched the original — a 2.4MB PNG still on the critical path
 *     even though a 279KB WebP sat next to it.
 *  2. A variant entry pointing at a file that does not exist ships a broken
 *     <img src> for every product using that asset.
 *
 * Paths resolve from the app/ root (vitest's cwd), not import.meta.url — Vite
 * rewrites import.meta.url under the jsdom environment and it does not point at
 * the filesystem.
 */

const PUBLIC_DIR = join(process.cwd(), 'public');
const entries = Object.entries(IMAGE_VARIANTS) as [string, string][];
const onDisk = (p: string) => join(PUBLIC_DIR, p.replace(/^\//, ''));

describe('image-variants (generated from image-manifest.json)', () => {
  it('has at least one converted asset', () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it('exposes relative keys and resolves both path shapes', () => {
    // IMAGE_VARIANTS holds the relative manifest keys only; the leading-slash
    // aliases live in the private LOOKUP so iteration over the exported map
    // stays clean. optimizedImage() is what accepts either shape.
    const [relativeKey, webp] = entries[0];
    expect(IMAGE_VARIANTS[relativeKey]).toBe(webp);
    expect(IMAGE_VARIANTS[`/${relativeKey}`]).toBeUndefined();
    expect(optimizedImage(`/${relativeKey}`)).toBe(`/${webp}`);
    expect(optimizedImage(relativeKey)).toBe(webp);
  });

  it('resolves the exact shape seed.json uses (leading slash)', () => {
    for (const [key, webp] of entries) {
      expect(optimizedImage(`/${key}`)).toBe(`/${webp}`);
    }
  });

  it('resolves relative paths too', () => {
    for (const [key, webp] of entries) {
      expect(optimizedImage(key)).toBe(webp);
    }
  });

  it('falls through to the original for unmapped and empty input', () => {
    expect(optimizedImage('/images/products/not-in-manifest.png')).toBe(
      '/images/products/not-in-manifest.png',
    );
    expect(optimizedImage(undefined)).toBeUndefined();
    expect(optimizedImage(null)).toBeUndefined();
    expect(optimizedImage('')).toBeUndefined();
  });

  it('points only at files that exist on disk', () => {
    const missing = entries.map(([, webp]) => webp).filter((webp) => !existsSync(onDisk(webp)));
    expect(missing).toEqual([]);
  });

  it('never maps to something larger than the original', () => {
    const regressions = entries
      .filter(([key, webp]) => existsSync(onDisk(key)) && existsSync(onDisk(webp)))
      .filter(([key, webp]) => statSync(onDisk(webp)).size >= statSync(onDisk(key)).size)
      .map(([, webp]) => webp);
    expect(regressions).toEqual([]);
  });
});
