# Rollers Republic — Smoking Headshop Storefront

[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Stack](https://img.shields.io/badge/React%2019%20·%20TS%20strict%20·%20Vite%207-2b2b2b?logo=react)](docs/ARCHITECTURE.md)
[![Tests](https://img.shields.io/badge/tests-174%20passing-2ECC71)](#quality-gates)
[![A11y](https://img.shields.io/badge/WCAG%202.1%20AA%20·%20axe%20clean-D4AF37)](#quality-gates)
[![Live](https://img.shields.io/badge/live-rollers--republic.vercel.app-black?logo=vercel)](https://rollers-republic.vercel.app)

Production e-commerce storefront for **Rollers Republic** (rollerspub.com) — Bangladesh's
pioneering headshop since 2013. Rolling papers, blunts, filter tips, waterpipes & bongs,
vapes and munchies — imported from the UK with same-day Dhaka delivery.

**Live demo:** https://rollers-republic.vercel.app

> **For AI coders:** read [`docs/SSOT.md`](docs/SSOT.md) **first**. It is the single source
> of truth for business facts, design system, data pipeline, and the Definition of Done.

## Highlights

- **Real catalog, not lorem ipsum** — 949 products / 82 brands / 8 categories snapshotted
  from the client's live WooCommerce Store API into one typed data file
- **Static-prerendered at build** — all 484 indexable routes (477 in-stock PDPs + key
  pages) emit real HTML with per-page titles and JSON-LD, so social scrapers and no-JS
  clients get full content in the first response (SSOT §11 M6)
- **100 Lighthouse accessibility**, WCAG 2.1 AA enforced by axe-core in E2E
- **18+ AgeGate** — mandatory, persisted, compliant with adult-product rules
- **Config-driven branding** — every business value (name, outlets, phones, payment
  methods, socials) lives in [`app/src/lib/config.ts`](app/src/lib/config.ts)
- **Buyer flow end to end** — brand/category filtering, search, cart, checkout with
  bKash + Cash on Delivery, order confirmation
- **Degrades gracefully** — API unreachable? The storefront falls back to bundled data
  with visible status (tested in a dedicated degraded-mode E2E suite)

## Stack

React 19 · TypeScript (strict) · Vite 7 · Tailwind CSS 4 · Zustand · React Router 7 ·
TanStack Query · Framer Motion · Vitest + Playwright (+ axe-core) · zero-dependency Node
reference API · Vercel (serverless + prerendered static output)

## Quick start

```bash
git clone <this-repo>
cd rollers-republic/app
npm ci
npm run dev            # http://localhost:5173
```

No env files needed — the app serves the bundled seed catalog out of the box.

## Quality gates (Definition of Done — SSOT §10)

```bash
cd app
npm run lint            # zero errors
npm test -- --run       # 120 unit tests
npm run test:coverage   # thresholds: 84/75/80/84 (stmts/branch/funcs/lines)
npm run build           # tsc + vite + 484-route prerender (~3 min)
npm run test:e2e        # Playwright storeflow + axe-core a11y (24 specs)
npm run test:e2e:degraded

cd ../server
npm test                # 28 API integration tests
cd .. && npm run check:seed   # seed.json ↔ products.ts sync gate
```

## Deployment (Vercel)

```bash
npx vercel@latest pull --yes
npx vercel@latest build --prod        # runs the full prerender locally
npx vercel@latest deploy --prebuilt --prod
```

> Why prebuilt: Vercel's build image cannot launch modern chromium (glibc mismatch),
> so the 484-route prerender runs locally and ships as Build Output API artifacts.
> A plain `git push` still deploys — the prerender soft-skips and the SPA fallback
> handles all routes (`SKIP_PRERENDER=1` forces this).

## Catalog refresh

```bash
cd app
node scripts/fetch-catalog.mjs     # snapshot from rollerspub.com Woo Store API
cd ..
node server/scripts/generate-seed.mjs
npm run check:seed
```

## Project structure

```
app/                 React storefront (Vite)
  src/data/          products.ts — THE catalog single source of truth
  src/lib/config.ts  ALL business configuration (SSOT §8)
  scripts/           catalog fetch · sitemap · prerender · OG image · pitch captures
server/              Zero-dependency Node reference API (+ 28 integration tests)
api/store.js         Vercel serverless wrapper (same-origin /api/* in production)
docs/                SSOT · ARCHITECTURE · API · SEO-AUDIT · PITCH (+ sales one-pager)
.github/             CI (typecheck · lint · test · build) · CodeQL · issue templates
```

## Credits & license

Seeded from [`FahadIbrahim93/RollON-MVP-Final-V1`](https://github.com/FahadIbrahim93/RollON-MVP-Final-V1)
(MIT) by Fahad Ibrahim — see [LICENSE](LICENSE) for dual attribution. Product data &
imagery © Rollers Republic — used here as a proposal demo only.
