# Rollers Republic Architecture

## Overview
Rollers Republic is a production-grade, configuration-driven e-commerce storefront built with React 19, TypeScript (strict), Vite 7, Tailwind CSS 4, Framer Motion, and React Router 7. It's deployed to Vercel with static prerendering (484 routes) and a zero-dependency Node reference API.

## Core Architecture

### Configuration Layer
- `app/src/lib/config.ts` — Centralized site configuration (brand, outlets, phones, payment methods, socials, SEO)
- `app/src/lib/brandConfig.ts` — Design tokens (colors, typography, spacing, shadows) as typed objects
- Environment variables only for deployment secrets (Vercel project settings)

### Data Layer
- `server/seed.json` — **Single source of truth** for catalog (949 products, 83 brands, 8 categories)
- `app/src/data/catalog.ts` — Generated typed fallback dataset (derived from seed.json at build time via `predev`/`prebuild` hooks; **never hand-edit**)
- `app/src/store/` — Zustand stores (cart, auth, wishlist, database)
- `app/src/lib/api.ts` — TanStack Query integration layer with typed hooks (`useProducts`, `useCategories`, `useBrands`, etc.)

### Component System
- `app/src/components/ui/` — Reusable shadcn/ui primitives (Button, Card, Dialog, etc.) — **keep even if unused** (template contract)
- `app/src/components/layout/` — Navbar, Footer, ProtectedRoute, AgeGate
- `app/src/components/sections/` — Homepage sections (Hero, FeaturedProducts, NewArrivals, BrandStrip, WhyChooseUs, Testimonials, Newsletter)
- `app/src/components/shop/` — ProductCard, ShopProductCard, ProductGallery, ProductVariants, CartDrawer, CheckoutForm

### Routing
- `app/src/App.tsx` — Main routing with lazy-loaded pages, `PageTransition` wrapper, catch-all 404
- Routes: `/`, `/shop`, `/product/:slug`, `/cart`, `/checkout`, `/login`, `/register`, `/account`, `/about`, `/contact`, `/terms`, `/privacy`, `/age-policy`

### Styling
- `app/src/App.css` — CSS-first Tailwind v4 theme (`@theme` directive) with CSS custom properties
- Design system: Dark base + gold primary (`#D4AF37`) + amber pub secondary ramp
- Framer Motion for animations (page transitions, micro-interactions)

### Testing
- **Unit**: Vitest + `@testing-library/*` + jsdom (159 tests) — `npm test -- --run`
- **Coverage**: `@vitest/coverage-v8` — thresholds 84/75/80/84 (stmts/branch/funcs/lines)
- **E2E**: Playwright + axe-core (storeflow + accessibility + degraded mode) — 24 + 2 specs
- **Server**: node:test (zero deps) — 37 integration tests for reference API

### CI/CD (GitHub Actions)
- `.github/workflows/ci.yml` — 5 jobs: frontend-quality, e2e, dependency-audit, reference-api
- Concurrent run cancellation, Node pinned via `.nvmrc`
- Vercel deployment via Build Output API (prerendered static assets)

### Deployment (Vercel)
- `vercel.json` — SPA rewrites, API proxy, security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy)
- Prerender runs locally (`npm run build` → 484 routes) and ships as Build Output API artifacts
- `SKIP_PRERENDER=1` fallback for environments without chromium

## Data Pipeline
```
rollerspub.com Woo Store API
        ↓ fetch-catalog.mjs
server/seed.json (SSOT — hand-edit here)
        ↓ generate-catalog.mjs (predev/prebuild)
app/src/data/catalog.ts (generated fallback)
        ↓ generate-sitemap.mjs + prerender.mjs
484 static HTML routes + sitemap.xml + JSON-LD
```

## Key Differentiators
- **Real data, not lorem** — 949 real products from client's live API
- **Static-first SEO** — every indexable route is real HTML at build time
- **Accessibility by default** — axe-core in CI, WCAG 2.1 AA clean
- **Degraded mode** — works when API is down (bundled catalog + status banner)
- **Config-driven** — rebrand = edit `config.ts` + `brandConfig.ts` only
- **Zero-dep reference API** — `server/` runs with `node server.js`, no `npm install`