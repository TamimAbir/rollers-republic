# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Config-driven template system (`rollon-app/src/lib/config.ts`)
- SEO meta tag management hook (`rollon-app/src/lib/seo.tsx`)
- Environment variable validation at startup
- Content Security Policy headers in Vercel deployment
- `sitemap.xml` for search engine discovery
- Service worker (`sw.js`) with offline caching
- Unit tests for utils, cart store, wishlist store, checkout schema, database store, auth store, shop helpers, and the API client (115 tests, ~88% coverage)
- Playwright E2E suite: 21 storeflow + accessibility tests, plus 2 degraded-mode tests (remote API down → visible banner + fallback data)
- **Reference API server** (`server/`) — zero-dependency Node implementation of `docs/API.md` (products, orders, auth with PBKDF2, customers, payment methods) with 27 integration tests
- **Reference API deployed to production** — `api/rollon.js` Vercel serverless function, `/api/*` rewrite, production builds default to `VITE_USE_REMOTE_API=true`; the live site now talks to a real backend same-origin
- **Visible degraded-mode banner** — when the remote API fails, the storefront shows an amber "showing cached catalog" status instead of failing silently; auto-recovers when the backend returns
- **Accessibility audit** — automated axe-core WCAG 2.1 AA scan across 10 pages (added checkout, login, register, 404); fixed color-only links in auth forms
- `docs/API.md` — backend API contract for products, orders, customers, and auth
- GitHub issue templates (bug report, feature request, question)
- E2E + reference-API jobs in CI workflow
- `VITE_USE_REMOTE_API` documented in `.env.example`; `dev:remote`/`test:e2e:remote`/`test:e2e:degraded` scripts
- README badges for CI status, test count, and coverage
- Dependency audit: Vite upgraded to patched 7.3.x, react-router-dom to 7.18.2, @axe-core/playwright added

### Changed
- Removed admin dashboard routes and components
- Fixed API client remote-path bug: `getBySlug`/`getById`/orders/customers now unwrap bare-array responses (previously returned arrays, crashing product detail in remote mode)
- API client refactored to an injectable factory (`createApiClient`) — tests no longer use module-reload hacks (`vi.stubEnv`/`resetModules`), and the client reports degradation via a subscribable `apiHealth` observable
- Hardened server entrypoint detection with `realpathSync` normalization (robust on Windows case/symlink differences)
- Dead-code policy codified in `AGENTS.md` (template surface stays, orphaned app code goes)
- Defensive guard on ProductDetail SEO description
- Removed mock data files (orders, customers)
- Cleaned up project structure for template reuse
- Fixed broken `Authorization` headers in API client and auth store
- Gated local fake-auth fallback to development only
- Removed non-functional social login and dummy UI elements
- Contact and newsletter forms now deliver via WhatsApp
- Made `SITE_URL` configurable via `VITE_SITE_URL` (defaults to live demo URL)
- Fixed ghost image references and missing `--primary-rgb` CSS variable
- Wired product wishlist/share buttons and order print/share to real handlers
- Documented known advisory status in `SECURITY.md`

### Removed
- `marjahans-app/` — unrelated project
- `api/` — serverless functions
- `scripts/` — dev utilities
- Dead `ProductCategory` and `Address` types
- Fabricated marketing stats from About/Account pages

## [1.0.0-beta.1] — 2026-03-16

### Added
- Complete e-commerce storefront with product catalog
- Shopping cart with persistent Zustand state
- Checkout flow with Zod validation
- Dark theme with Tailwind CSS v4
- Responsive design for all screen sizes
- Framer Motion animations and transitions
- React Query for data fetching
- Playwright E2E tests
- Vitest unit tests with coverage
- GitHub Actions CI/CD pipeline
- CodeQL security scanning
- PWA support with web manifest

### Features
- Product filtering and search
- Category-based navigation
- Order confirmation flow
- User authentication (demo mode)
- Newsletter signup
- Testimonials section
- Contact form

### Tech Stack
- React 19 + TypeScript
- Vite 7 build tool
- Tailwind CSS v4
- Zustand 5 state management
- React Router v7
- Radix UI primitives
- Framer Motion 12