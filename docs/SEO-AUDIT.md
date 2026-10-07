# SEO & Performance Audit — Rollers Republic Storefront

**Date:** 2026-10-06 (re-run, post-SEO-fixes) · **Previous run:** 2026-09-22
**Method:** Lighthouse 13.5.0 (mobile, throttled: 150ms RTT / 1.6Mbps / 4x CPU
slowdown, plus desktop), production build (`npm run build` -> `vite preview` on
:4173), Chromium 149. Home and Shop audited.

## 1. Scorecard — 2026-10-06 (current)

Lighthouse 13.5.0, Chromium 149, mobile throttled (150ms RTT / 1.6Mbps / 4x CPU
slowdown) and desktop, against the production build (`npm run build` ->
`vite preview`).

| Page | Form factor | Perf | SEO | Best Practices | A11y | LCP | CLS | TBT |
|------|-------------|------|-----|----------------|------|-----|-----|-----|
| `/` | mobile | **68** | **100** | **100** | **100** | 7.7s | 0.026 | 10ms |
| `/shop` | mobile | **67** | **100** | **100** | 99 | 7.6s | 0.078 | 10ms |
| `/` | desktop | 86 | **100** | **100** | **100** | 2.2s | 0.026 | 0ms |
| `/shop` | desktop | 79 | **100** | **100** | 99 | 2.2s | 0.202 | 0ms |

### What changed across this session

**SEO work (commit `122c9af`).** `useDocumentSEO` is wired into Home, Shop,
About, Contact and Success, each with its own title, description and canonical.
Sitemap went from 4 URLs to 574. LocalBusiness + BreadcrumbList JSON-LD added
(BreadcrumbList suppressed on the final crumb per Google). `aggregateRating` is
omitted when `reviewCount` is 0, so the synthetic 4.5 default can no longer reach
structured data. SEO and best-practices have been 100 ever since.

**Image weight (commit `8940af5`).** The storefront shipped 17MB of imagery:
56 raster files, 12 over 500KB, worst a 2.4MB PNG. That weight — not
JavaScript — was the mobile bottleneck (desktop was already 2.2s with 0ms TBT).

| | home LCP | home CLS | home perf | shop LCP | shop CLS | shop perf |
|---|---|---|---|---|---|---|
| before | 10.7s | 0.075 | 66 | 10.3s | 0.412 | 49 |
| after | **7.7s** | **0.026** | **68** | **7.6s** | **0.078** | **67** |

`scripts/optimize-images.mjs` converts anything over 80KB to WebP via
ffmpeg/libwebp at q78 (23 assets, 14.2MB -> 1.5MB of served imagery; the 2.4MB
PNG is now 279KB). `optimizedImage()` is wired into all five components that
render product imagery, each with `width`/`height`, `loading` and `decoding`
hints; the hero also got its intrinsic 1024x1536.

### Remaining performance work

Mobile LCP is 7.7s, still above the 2.5s "good" threshold. What is left:

1. `hero-product.webp` is 476KB and is the largest remaining transfer. Resize to
   the actual rendered size and ship a `srcset`.
2. The remaining un-optimized rasters (19 under the 80KB threshold) and
   `features-lifestyle.jpg` (67KB) would still benefit from WebP.
3. Category tiles are `loading="lazy"` but sit in the first viewport — verify
   they are not delaying the hero.

### Consequence for sales claims

The storefront must not be marketed as "sub-second on mobile" — that is not
true at any point in this measurement history. Its defensible advantages are:
484 routes prerendered to real HTML at build time (crawlers and WhatsApp/Facebook
link previews get content without running JS), no WordPress plugin payload,
SEO/best-practices 100, WCAG 2.1 AA enforced in CI, and a 15MB lighter image
payload than it shipped this morning.

## 3. Findings from the 2026-09-22 run (historical — S1/S2/S3/S5 now fixed)



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
Add `LocalBusiness`/`Store` JSON-LD (both outlets, `01330005300` / `01711626205`, opening hours, `sameAs` Facebook, `foundingDate: 2013`) sitewide via the existing `seo.tsx` injector. Cheap, and it powers "smoking headshop near Dhanmondi" rich results — a strong moment in the demo when you show Google's view.

---

## Appendix — raw metrics

- LCP element: hero `<section>` (Home) / product grid (Shop)
- CLS culprits (Home): Inter woff2 (0.161) · Montserrat woff2 (0.061+0.007) · hero section reflow (0.054)
- Render-blocking: `fonts.googleapis.com/css2?...` (~300ms est. savings)
- Bundle (gzip): main 82KB · vendor-motion 44KB · vendor-utils 34KB · react 18KB · ui 16KB · Home 10KB — splitting is healthy
- Duplicate-DBT note: TBT 50ms confirms the framer-motion load is fine; do **not** chase JS removal before fonts/prerender.
