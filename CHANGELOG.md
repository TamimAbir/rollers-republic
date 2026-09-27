# Changelog

All notable changes to this project are documented here. Format based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- **Single source of truth for catalog data** — `server/seed.json` now feeds the
  client directly: `app/scripts/generate-catalog.mjs` derives the typed fallback
  dataset (`app/src/data/catalog.ts`) from it at build time (`predev`/`prebuild`
  hooks) and CI gates drift (`--check`). The hand-maintained duplicate
  `app/src/data/products.ts` (17k lines) and the reverse seed-generation pipeline
  (`server/scripts/generate-seed.mjs` + `check:seed`) are gone; the sitemap
  generator reads seed.json directly and the reference API needs zero installs.

### Fixed
- Brand 67 "D&K" no longer renders as "D&amp;K" — the last HTML entity escaped
  into seed.json but not the client copy (the exact drift class this task removes).
- **Build-time prerendering** — `npm run build` now renders all 484 sitemap
  routes (every in-stock PDP + key pages) to static HTML, so bots, social
  scrapers, and no-JS clients receive fully-populated pages with per-page
  titles and JSON-LD (`app/scripts/prerender.mjs`; `SKIP_PRERENDER=1` opts
  out; soft-skips on Vercel when chromium is unavailable so deploys never
  break).

### Changed
- **`cssCodeSplit: false`** — one shared CSS bundle instead of per-chunk
  inline styles. Eliminates ~450 KB of duplicated toast/vendor CSS that the
  prerender captured on every page (home 606 KB → 155 KB; dist 247 MB → 54 MB).

## [1.0.0] — 2026-09-20

First release of the **Rollers Republic** storefront, built on the RollON template
(see credits below).

### Added
- **Real catalog seed** — 949 products, 8 categories, 82 brands snapshotted from the
  client's live WooCommerce Store API (`app/scripts/fetch-catalog.mjs`), with a
  seed-consistency gate (`npm run check:seed`)
- **18+ AgeGate** — mandatory, persisted, WCAG-compliant age verification (SSOT §9.1)
  with 5 unit tests
- **BrandStrip & NewArrivals** home sections; Shop brand filtering (`/shop?brand=`) and
  URL-driven sort (`/shop?sort=`)
- **Brand dimension** across the stack: `Brand` type, `brands` in the data file,
  `/brands` API route (server + serverless), `useBrands()` hook, brand chip on PDP
- **Legal pages** — `/terms`, `/privacy`, `/age-policy` with adult-use compliance copy
- **Outlet cards** on Contact (Dhanmondi flagship + Mirpur, maps links)
- **Sales one-pager** — `docs/PITCH.md`

### Changed
- Full rebrand: RollON → Rollers Republic across UI, SEO, PWA manifest, storage keys
  (`rr-*`), design tokens (primary `#D4AF37` gold, ember accent, amber pub ramp)
- Category cards render config-driven amber gradients (no per-category stock photos)
- Payment methods aligned to client reality: bKash + Cash on Delivery
- CSP allows product imagery from `rollerspub.com`

### Inherited from the template (unchanged)
React 19 + TypeScript strict, Vite 7, Tailwind CSS 4, Zustand, React Router 7,
Vitest + Playwright + axe-core quality gates, zero-dependency reference API, Vercel
serverless deployment, CI with coverage thresholds.

### Credits
Template: [`FahadIbrahim93/RollON-MVP-Final-V1`](https://github.com/FahadIbrahim93/RollON-MVP-Final-V1)
(MIT) by Fahad Ibrahim. Product data & imagery © Rollers Republic — proposal demo use.
