import { describe, it, expect } from 'vitest';
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { responsiveImage, RESPONSIVE_IMAGES } from '../../data/image-variants';
import heroSource from '../../components/sections/Hero.tsx?raw';

/**
 * The hero is the LCP element on every page view. It was measured at 477KB
 * (full-resolution WebP) while rendering into roughly a third of the desktop
 * viewport. A responsive ladder (320-1024px, 11-77KB) is what fixes that.
 *
 * This exists because the ladder was generated, wired into the component, and
 * then silently NOT used: responsiveImage() was keyed on the optimized filename
 * but the component passed brandConfig.heroImage ('/assets/hero.svg'), so the
 * lookup missed, the ?? fallback fired, and the page shipped the 477KB file
 * again while every test stayed green. A test has to pin the two together.
 */

const PUBLIC_DIR = join(process.cwd(), 'public');

/** The filename Hero.tsx asks for, parsed from its source. */
function heroFilename(): string {
  const match = heroSource.match(/responsiveImage\(\s*'([^']+)'\s*\)/);
  expect(match, 'Hero.tsx must call responsiveImage() with a literal filename').not.toBeNull();
  return match![1];
}

describe('responsive hero ladder', () => {
  it('resolves a ladder for the file Hero.tsx asks for', () => {
    const ladder = responsiveImage(heroFilename());
    expect(ladder, `no ladder for ${heroFilename()} — regenerate with npm run optimize:images`).toBeDefined();
  });

  it('emits a srcset with several widths, smallest first', () => {
    const ladder = responsiveImage(heroFilename())!;
    const widths = [...ladder.srcset.matchAll(/(\d+)w/g)].map((m) => Number(m[1]));
    expect(widths.length).toBeGreaterThanOrEqual(3);
    expect([...widths].sort((a, b) => a - b)).toEqual(widths);
  });

  it('declares a sizes attribute (without it the browser picks the largest)', () => {
    const ladder = responsiveImage(heroFilename())!;
    expect(ladder.sizes.length).toBeGreaterThan(0);
    expect(ladder.sizes).toContain('vw');
  });

  it('points only at files that exist', () => {
    const ladder = responsiveImage(heroFilename())!;
    for (const [, url] of ladder.srcset.matchAll(/(\S+)\s+\d+w/g)) {
      expect(existsSync(join(PUBLIC_DIR, url.replace(/^\//, ''))), url).toBe(true);
    }
    expect(existsSync(join(PUBLIC_DIR, ladder.fallback.replace(/^\//, '')))).toBe(true);
  });

  it('ships every variant smaller than the flat full-resolution WebP', () => {
    const ladder = responsiveImage(heroFilename())!;
    const flat = ladder.name + '.webp';
    const flatPath = join(PUBLIC_DIR, 'images', flat);
    if (!existsSync(flatPath)) return; // flat file not generated in this checkout
    const flatBytes = statSync(flatPath).size;
    for (const [, url] of ladder.srcset.matchAll(/(\S+)\s+\d+w/g)) {
      const bytes = statSync(join(PUBLIC_DIR, url.replace(/^\//, ''))).size;
      expect(bytes, `${url} should beat the flat ${flatBytes}B file`).toBeLessThan(flatBytes);
    }
  });

  it('has a non-trivial saving on the smallest variant', () => {
    const ladder = responsiveImage(heroFilename())!;
    const smallest = ladder.srcset.split(',')[0].trim().split(' ')[0];
    const bytes = statSync(join(PUBLIC_DIR, smallest.replace(/^\//, ''))).size;
    // Under 60KB: a mobile visitor must not pay desktop weight.
    expect(bytes).toBeLessThan(60 * 1024);
  });

  it('Hero.tsx consumes the ladder rather than a hardcoded full-size file', () => {
    expect(heroSource).toContain('srcSet={hero?.srcset');
    expect(heroSource).toContain('sizes={hero?.sizes');
    // No bare reference to the flat webp outside the fallback branch.
    expect(heroSource).not.toMatch(/srcSet="\/images\/hero-product\.webp"/);
  });

  it('exposes every ladder through RESPONSIVE_IMAGES keyed by filename', () => {
    for (const [key, value] of Object.entries(RESPONSIVE_IMAGES)) {
      expect(responsiveImage(key)).toBe(value);
    }
  });
});
