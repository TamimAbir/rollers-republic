# SEO & Performance Audit — Rollers Republic Storefront

**Date:** 2026-09-22 · **Method:** Lighthouse 13 (mobile, throttled), production build (`npm run build` → `vite preview`), plus manual inspection of meta/sitemap/robots/headers. Home and Shop audited.

---

## 1. Scorecard

| Page | Performance | SEO | Best Practices | Accessibility | Key metrics |
|------|------------|-----|----------------|---------------|-------------|
| `/` (Home) | **71** | **100** | **100** | **100** | FCP 2.4s · LCP **3.7s** · **CLS 0.303** · TBT 50ms · SI 2.4s |
| `/shop` | **85** | **100** | — | — | LCP 3.4s · CLS 0.007 |

**Already excellent:** accessibility (100), best-practices (100), security headers + CSP, TBT 50ms (no main-thread jank), route-level code splitting (82KB gz main, vendors isolated), lazy routes, image `onError` fallbacks.

---

## 2. What the audit found

### SEO — structure is right, but coverage is thin

| # | Finding | Severity | Detail |
|---|---------|----------|--------|
| S1 | **`useDocumentSEO` is only wired into ProductDetail** | High | Home/Shop/About/Contact/Success ship the same static `<title>` and no per-page canonical. Every page competes for one query. |
| S2 | **Sitemap has 4 URLs for a 949-product store** | High | No category, brand, or product URLs → Google can't discover PDPs except by crawling the SPA. |
| S3 | **`og:image` is an SVG** | High | Facebook/WhatsApp **do not render SVG** link previews. In Bangladesh, where WhatsApp ordering is a primary channel, every shared product link shows a blank card. |
| S4 | **SPA shell only — bots and social scrapers see an empty `#root`** | Medium | Google renders JS, but WhatsApp/FB/Telegram scrapers and many BD crawlers don't. Shared links show the generic index card, not the product. |
| S5 | **No Organization / LocalBusiness structured data** | Medium | Two physical outlets, two phone numbers, "est. 2013, pioneered the headshop concept" — prime local-SEO signals that are currently unstructured. Product JSON-LD on PDPs is done well (price, availability, rating ✅). |

### Performance — fonts and payload

| # | Finding | Severity | Detail |
|---|---------|----------|--------|
| P1 | **CLS 0.303 on Home — 9 layout shifts, dominated by web fonts** | High | Inter + Montserrat load late from Google Fonts and swap in (`display=swap`), reflowing the hero (~0.28 of the total shift). Render-blocking `fonts.googleapis.com` CSS also costs ~300ms. |
| P2 | **LCP 3.4–3.7s on both pages** | Medium | Font chain + 266KB main JS parse on mobile-throttled CPU. Hero is the LCP element. |
| P3 | **Unused JS: est. 49 KiB savings** | Low | Acceptable for now; zod/vendor-utils can be trimmed later. |
| P4 | **Unsized product images** | Low | `<img>` in product cards lack `width`/`height` → minor CLS risk as images stream in (currently masked by skeletons). |

---

## 3. Top 5 improvements for the client demo (ranked)

### 1. Zero-layout-shift fonts *(effort: ~1h · impact: Perf 71→~90, visibly smoother demo)*
Self-host Inter + Montserrat via `@fontsource` (bundled, preloaded, no render-blocking third-party CSS) with `size-adjust` fallback metrics so text doesn't reflow when the real font lands. Also add `width`/`height` to product-card `<img>`s. The homepage stops "jumping" on first load — the single most visible Lighthouse win in a live walkthrough.

### 2. WhatsApp-ready link previews *(effort: ~1h · impact: every shared link becomes a storefront)*
Render `og-image.png` at 1200×630 (gold-on-black RR brand card), swap all `og:image`/`twitter:image` references from `.svg` to `.png`, and guarantee the PDP's `useDocumentSEO` emits an absolute, non-SVG product image. Test with Meta's Sharing Debugger. For a business that takes orders over WhatsApp, this is the defect the client would notice first.

### 3. Per-page titles + a real 949-URL sitemap *(effort: ~2h · impact: "we replace your WordPress SEO" story)*
Call `useDocumentSEO` on Home/Shop/About/Contact with keyword-mapped titles ("Shop RAW Rolling Papers in Dhaka | Rollers Republic"). Generate `sitemap.xml` from `products.ts` + categories + brands inside the existing seed pipeline (one more script step), keep `robots.txt` pointing at it. Turns the site from "4 indexed pages" into "949+ indexed pages".

### 4. Pre-render the key routes *(effort: ~half day · impact: technical differentiator vs WordPress)*
Pre-render `/`, `/shop`, `/about`, `/contact` and all `/product/*` pages to static HTML at build (e.g. `vite-plugin-prerender` or a small puppeteer pass over the seed slugs). Bots and social scrapers get real content + meta in the first response. This is the "headless commerce, WordPress-grade SEO" headline for PITCH.md.

**✅ Shipped 2026-09-23** — `app/scripts/prerender.mjs` (zero new deps: Playwright + the reference API server) renders **484 routes** — every sitemap pathname (home, shop, about, contact, legal, all 477 in-stock PDPs) — into `dist/**/index.html` at build time. `npm run build` chains it; `SKIP_PRERENDER=1` opts out; on Vercel it soft-skips if chromium can't launch so deploys never break. Page weight fell **606 KB → 155 KB** (home) after killing duplicate CSS injection (`cssCodeSplit: false` + a prerender dedupe pass; dist 247 MB → 54 MB). Verified per page: real `<title>`, Product + Store JSON-LD, populated `#root`, no AgeGate in saved HTML.

### 5. LocalBusiness structured data *(effort: ~30min · impact: map-pack & rich results)*
Add `LocalBusiness`/`Store` JSON-LD (both outlets, `01330005300` / `01711626210`, opening hours, `sameAs` Facebook, `foundingDate: 2013`) sitewide via the existing `seo.tsx` injector. Cheap, and it powers "smoking headshop near Dhanmondi" rich results — a strong moment in the demo when you show Google's view.

---

## Appendix — raw metrics

- LCP element: hero `<section>` (Home) / product grid (Shop)
- CLS culprits (Home): Inter woff2 (0.161) · Montserrat woff2 (0.061+0.007) · hero section reflow (0.054)
- Render-blocking: `fonts.googleapis.com/css2?...` (~300ms est. savings)
- Bundle (gzip): main 82KB · vendor-motion 44KB · vendor-utils 34KB · react 18KB · ui 16KB · Home 10KB — splitting is healthy
- Duplicate-DBT note: TBT 50ms confirms the framer-motion load is fine; do **not** chase JS removal before fonts/prerender.
