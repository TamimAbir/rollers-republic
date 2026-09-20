# Changelog

All notable changes to this project are documented here. Format based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
