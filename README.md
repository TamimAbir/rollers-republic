# Rollers Republic — Smoking Headshop Storefront

[![CI](https://img.shields.io/badge/CI-typecheck%20·%20lint%20·%20test%20·%20build-2ECC71)]() [![a11y](https://img.shields.io/badge/WCAG-2.1%20AA-D4AF37)]() [![Tests](https://img.shields.io/badge/tests-148%20passing-2ECC71)]()

Production e-commerce storefront for **Rollers Republic** (rollerspub.com) — Bangladesh's
pioneering headshop since 2013. Rolling papers, blunts, filter tips, waterpipes & bongs,
vapes and munchies, imported from the UK with same-day Dhaka delivery.

> **For AI coders:** read [`docs/SSOT.md`](docs/SSOT.md) **first**. It is the single source
> of truth for business facts, design system, data pipeline, and the Definition of Done.

## What's inside

- **Complete storefront** — catalog (949 real SKUs), brand & category filtering, search,
  cart, checkout (bKash / Cash on Delivery), order confirmation
- **Real catalog pipeline** — `app/scripts/fetch-catalog.mjs` snapshots the client's live
  WooCommerce Store API into `app/src/data/products.ts` (the one data file) and `server/seed.json`
- **18+ AgeGate** — mandatory, persisted, WCAG-compliant (SSOT §9)
- **Config-driven branding** — every business value lives in `app/src/lib/config.ts`
- **Reference API** — zero-dependency Node server (`server/`) deployed as a Vercel
  serverless function (`api/rollon.js`); frontend degrades gracefully to bundled data
- **Dark-gold design system** — RollON heritage × RR amber pub ramp (SSOT §5)

## Stack

React 19 · TypeScript (strict) · Vite 7 · Tailwind CSS 4 · Zustand · React Router 7 ·
TanStack Query · Vitest + Playwright (+ axe-core) · Node 20+ reference API · Vercel

## Getting started

```bash
git clone <this-repo>
cd rollers-republic/app
npm ci
npm run dev            # http://localhost:5173
```

## Quality gates (Definition of Done — SSOT §10)

```bash
cd app
npm run lint            # zero errors
npm test -- --run       # unit tests
npm run test:coverage   # thresholds: 84/75/80/84 (stmts/branch/funcs/lines)
npm run build           # tsc + vite
npm run test:e2e        # Playwright storeflow + axe-core a11y
npm run test:e2e:degraded

cd ../server
npm test                # 28 API integration tests
cd .. && npm run check:seed   # seed.json ↔ products.ts sync gate
```

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
app/                 React storefront (formerly rollon-app in the template)
  src/data/          products.ts — THE catalog single source of truth
  src/lib/config.ts  ALL business configuration (SSOT §8)
  scripts/           fetch-catalog.mjs — Woo Store API snapshot
server/              Zero-dependency Node reference API
api/                 Vercel serverless wrapper
docs/                SSOT.md, API.md, ARCHITECTURE.md, PITCH.md
```

## Credits & license

Seeded from [`FahadIbrahim93/RollON-MVP-Final-V1`](https://github.com/FahadIbrahim93/RollON-MVP-Final-V1)
(MIT) by Fahad Ibrahim. Product data & imagery © Rollers Republic — used here as a
proposal demo only.
