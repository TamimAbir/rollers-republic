import { describe, it, expect } from 'vitest';
import { categories, products, brands, testimonials } from '../data/catalog';

/**
 * Guards the GENERATED catalog module (src/data/catalog.ts, emitted from
 * server/seed.json by scripts/generate-catalog.mjs). These invariants keep
 * every consumer safe: Shop filtering, sitemap generation, prerendered PDP
 * routes, and the degraded-mode fallback all assume a well-formed catalog.
 */
describe('generated catalog (from server/seed.json)', () => {
  it('has the expected entity counts', () => {
    expect(products.length).toBeGreaterThan(900);
    expect(categories).toHaveLength(8);
    expect(brands.length).toBeGreaterThan(50);
    expect(testimonials.length).toBeGreaterThan(0);
  });

  it('has unique product ids and slugs', () => {
    const ids = new Set(products.map((p) => p.id));
    const slugs = new Set(products.map((p) => p.slug));
    expect(ids.size).toBe(products.length);
    expect(slugs.size).toBe(products.length);
  });

  it('references only real category slugs (no dangling categoryId)', () => {
    const slugs = new Set(categories.map((c) => c.slug));
    const dangling = products.filter((p) => !slugs.has(p.categoryId));
    expect(dangling).toEqual([]);
  });

  it('carries category tile images from seed (no gradient-only tiles)', () => {
    for (const c of categories) {
      expect(c.image, `category ${c.slug} should have an image`).toMatch(/^\//);
    }
  });

  it('uses only proxied or local image paths (no hotlinked hosts)', () => {
    for (const p of products) {
      expect(p.image).toMatch(/^\/(img\/uploads|images\/products)\//);
    }
  });

  it('is entity-clean (no HTML entities leaked into names or brands)', () => {
    for (const p of products) {
      expect(p.name).not.toMatch(/&[a-zA-Z#0-9]+;/);
      expect(p.brand ?? '').not.toMatch(/&[a-zA-Z#0-9]+;/);
    }
  });
});
