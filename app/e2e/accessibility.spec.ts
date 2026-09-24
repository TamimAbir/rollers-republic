import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility audit — enforces the AGENTS.md WCAG 2.1 AA requirement.
 *
 * Scans the key storefront pages with axe-core and fails on serious/critical
 * violations. Color-contrast rules are included (WCAG AA), but we allow
 * "best practice" severity by default via the tags filter below.
 *
 * Run: npx playwright test e2e/accessibility.spec.ts
 */

// Every storefront route must be accessible. Checkout renders its empty
// state without cart items (still scannable); /account redirects to /login
// when unauthenticated, so it's covered via the login scan.
const PAGES = [
  { path: '/', name: 'homepage' },
  { path: '/shop', name: 'shop' },
  { path: '/product/raw-classic-paper-tin-box', name: 'product detail' },
  { path: '/cart', name: 'cart' },
  { path: '/checkout', name: 'checkout' },
  { path: '/about', name: 'about' },
  { path: '/contact', name: 'contact' },
  { path: '/terms', name: 'terms' },
  { path: '/privacy', name: 'privacy' },
  { path: '/age-policy', name: 'age policy' },
  { path: '/login', name: 'login' },
  { path: '/register', name: 'register' },
  { path: '/nonexistent-route-xyz', name: '404' },
];

async function scanPage(page, path) {
  await page.goto(path, { waitUntil: 'networkidle' });
  // /shop: seed-grid hydration races the scan — the 5 async-injected product
  // skeletons (text-white/40) are what axe samples otherwise. Real pages render
  // 12 cards; >8 product links means hydrated content, not skeletons.
  if (path === '/shop') {
    await page
      .waitForFunction(
        () => document.querySelectorAll('main a[href^="/product/"]').length > 8,
        { timeout: 15_000 },
      )
      .catch(() => {
        throw new Error('shop grid never hydrated before the axe scan');
      });
  }
  // Framer-motion entrance fades + lazy section mounts race the axe sample:
  // text captured mid-fade reports phantom contrast failures (white composited
  // at partial opacity ≈ 1.5–4:1). Wait for quiescence: main's HTML stable and
  // every inline-opacity element (framer-motion's signature) fully settled
  // across THREE consecutive samples, so late mounts can't slip through.
  // Elements resting at opacity 0 (below-fold whileInView) are skipped by axe
  // itself, so they don't block the wait; CSS keyframe pulses (animate-pulse)
  // don't touch inline styles, so they don't either.
  const deadline = Date.now() + 20_000;
  let stableSamples = 0;
  let lastHtml = -1;
  while (Date.now() < deadline && stableSamples < 3) {
    const { html, settled } = await page.evaluate(() => ({
      html: document.querySelector('main')?.innerHTML.length ?? 0,
      settled: [...document.querySelectorAll('main [style*="opacity"]')].every(
        (el) => {
          const op = parseFloat((el as HTMLElement).style.opacity);
          return op === 0 || op >= 0.99;
        },
      ),
    }));
    stableSamples = settled && html === lastHtml && html > 0 ? stableSamples + 1 : 0;
    lastHtml = html;
    await page.waitForTimeout(400);
  }

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  return results;
}

test.describe('Accessibility (axe-core, WCAG 2.1 AA)', () => {
  // 13 pages scanned against the dev server (which compiles routes on demand)
  // under full parallelism — the 30s default per-test timeout buckles under
  // that load even though each scan takes a few seconds in isolation.
  test.setTimeout(120_000);

  for (const { path, name } of PAGES) {
    test(`${name} (${path}) has no serious/critical violations`, async ({ page }) => {
      const results = await scanPage(page, path);

      const violations = results.violations.filter((v) =>
        ['serious', 'critical'].includes(v.impact ?? ''),
      );

      // For CI robustness: log everything, fail on serious/critical.
      if (violations.length > 0) {
        const summary = violations.map((v) =>
          `[${v.impact}] ${v.id} (${v.nodes.length} nodes) — ${v.help}`,
        );
        console.log(`\nAccessibility issues on ${name}:\n${summary.join('\n')}\n`);
      }

      expect(violations, `Serious/critical a11y violations on ${name}`).toEqual([]);
    });
  }
});
