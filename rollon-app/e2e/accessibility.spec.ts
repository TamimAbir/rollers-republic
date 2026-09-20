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
  { path: '/product/richer-kingslim-papers', name: 'product detail' },
  { path: '/cart', name: 'cart' },
  { path: '/checkout', name: 'checkout' },
  { path: '/about', name: 'about' },
  { path: '/contact', name: 'contact' },
  { path: '/login', name: 'login' },
  { path: '/register', name: 'register' },
  { path: '/nonexistent-route-xyz', name: '404' },
];

async function scanPage(page, path) {
  await page.goto(path, { waitUntil: 'networkidle' });
  // Give lazy-loaded sections a beat to render.
  await page.waitForTimeout(500);

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  return results;
}

test.describe('Accessibility (axe-core, WCAG 2.1 AA)', () => {
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
