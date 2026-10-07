# Owner Pitch Page — Design Spec

**Date:** 2026-10-06
**Owner:** Tamim Abir (Fahad Ibrahim · Hope Theory)
**Artifact:** `docs/pitch.html` — one self-contained HTML file
**Audience:** the owner of Rollers Republic (business decision-maker, not an engineer)

---

## 1. Goal

Turn a technical rebuild into a one-page business proposal the owner can open,
understand in three minutes, and forward over WhatsApp. Success = the owner says
"yes, show me more" — not "this is nice engineering."

## 2. Non-negotiable constraint: every claim is provable

This project sells *trust*. The client's real catalog, prices and photos are in
the rebuild. Any invented or stale number is a credibility loss we cannot
recover, especially in front of the person whose business it is.

Verified-this-session facts that MAY be claimed:

| Claim | Evidence |
|---|---|
| 949 products / 8 categories / 83 brands | `server/seed.json` |
| 484 routes prerendered at build | `find dist -name '*.html'` → 484 |
| 239 KB gzipped JS total | measured over `dist/assets/*.js` via gzip -9 |
| 144 unit + 37 server + 24 E2E (incl. axe-core a11y) = 205 | real command output |
| 0 known dependency vulnerabilities | `npm audit` → 0 |
| Their live WordPress site errors for crawlers | `web_extract` on rollerspub.com → 500 |

Facts that MUST NOT appear (research found conflicts):

- **`phoneAlt`** — RESOLVED 2026-10-06: official site is `01711626205`; config had
  `01711626210`. Corrected in config.ts, SSOT.md and SEO-AUDIT.md. Client has
  confirmed permission to use their catalog and imagery.
- **Second outlet name** — STILL UNCONFIRMED. Instagram says Basundhara, a Facebook
  post says Mirpur; their contact page lists only the Dhanmondi showroom. The
  client has not confirmed it. Keep "your Dhanmondi flagship" and omit the second
  branch until they say which it is.
- **Test totals** — verified split is 205 (144 unit + 37 API integration + 24 E2E).
  An earlier note here claimed 183 (132+37+14); that was wrong — `vitest --run`
  reports 144 and the server suite 37. Use the verified split.
- **"100 Lighthouse accessibility"** — Lighthouse WAS re-run on 2026-10-06 (13.5.0):
  a11y 100 on home / 99 on shop, SEO 100, best-practices 100. The caveat is
  performance: mobile LCP is 10.7s because of image weight (15MB across 70
  product images). Never claim a sub-second mobile load.
- **Market-size statistics** — do not quote figures from secondary sources
  (ECDB/Scribd/Statista) to a business owner. Not needed; cuts credibility.

Permission to use the client's real catalog and imagery in this proposal was
granted by the client (2026-10-06), so the demo ships with their live data.

## 3. Structure — six sections in the owner's order of caring

1. **The hook** — their real catalog, live now. One line + homepage screenshot.
2. **What's hard today** — provable friction, framed as opportunity not criticism.
3. **Look at it working** — 6 screenshots in a buyer-flow strip. This sells.
4. **What this does for your business** — benefit table, jargon → plain language.
5. **Your catalog, your prices** — the trust section. Fully provable.
6. **Three ways to work together** — tiers + a concrete first step.

## 4. Language rules

- No `prerender`, `JSON-LD`, `WCAG`, `axe-core`, `SSOT`, `bundle`, `SEO`.
- Approved plain-language substitutions:
  - prerender → "pages that reach Google without needing to load anything extra"
  - gzip size → "smaller than most single photos on your phone"
  - tests → "checked automatically before anything goes live"
  - a11y → "works for people with screen readers, and older phones"
- Never disparage the current site. The owner built it and still runs a
  business on it. Frame gaps as headroom.

## 5. Technical shape

- Single file, no external requests except the embedded base64 screenshots.
- System font stack — no webfont request, nothing to load, opens instantly
  on a Dhanmondi connection.
- Mobile-first: the owner will open this on a phone over WhatsApp.
- Print stylesheet, because owners print things.
- Built by `docs/scripts/build-pitch.mjs` from `docs/pitch.template.html`,
  reading the latest screenshots from `docs/screenshots/`. Rebuild is one command.

## 6. Screenshot refresh — required, not optional

Existing shots are dated Sep 22, before the breadcrumb, honest-rating and
sitemap changes. Shipping them would misrepresent the current build. Re-capture
6 frames from a locally served `dist/` + reference API:

| File | Frame |
|---|---|
| `01-home-hero.png` | homepage hero |
| `02-shop-raw-filter.png` | shop with a category filter active |
| `03-product-detail.png` | a product detail page |
| `04-added-to-cart.png` | add-to-cart confirmation |
| `05-cart-page.png` | cart |
| `06-checkout.png` | checkout |

Capture at 2x DPR, mobile + desktop widths. Age gate must be pre-cleared
(`localStorage['rr-age-verified'] = 'yes'`), as prerender does.

## 7. Out of scope

- No payment gateway, cart backend, or account work — those are the "Grow" tier,
  described in the pitch but not built now.
- No Bengali translation.
- No changes to the storefront's business logic or config. This task touches only
  `docs/` and, at most, one confirmed-fact correction in `app/src/lib/config.ts`.

## 8. Definition of Done

- [ ] `docs/pitch.html` opens standalone, no console errors, no external requests
- [ ] Mobile (390px) and desktop render correctly; print stylesheet works
- [ ] All 6 screenshots refreshed post-change
- [ ] Zero unprovable claims; all numbers traceable to the table in §2
- [ ] `docs/PITCH.md` and `README.md` corrected so the repo matches the pitch
- [ ] `npm run lint`, `npm test -- --run`, `npm run build` still green
- [ ] Work committed on a branch, with the two `TODO-OWNER-CONFIRM` markers noted