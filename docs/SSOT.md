# 🏛️ Rollers Republic — SSOT (Single Source of Truth)

> **READ THIS FILE FIRST.** Every human or AI coder working on this repository MUST read
> this document in full before writing any code. Sections are numbered — cite them as
> `SSOT §n` in commits, PRs, and plans. If code and this document disagree, this document
> wins: fix the code, then propose a doc amendment in the same commit.

**Status:** ACTIVE · **Owner:** client-engagement (you + your brother) · **Version:** 1.0
**Template origin:** [`FahadIbrahim93/RollON-MVP-Final-V1`](https://github.com/FahadIbrahim93/RollON-MVP-Final-V1) (MIT) — live at https://rollon-delta.vercel.app
**Client / target business:** Rollers Republic — "RollersPub.com by Rollers Republic" (https://rollerspub.com)

---

## §1 Mission & Success Criteria

Rebuild Rollers Republic's existing online store (currently a WordPress/WooCommerce site at
rollerspub.com) as an **enterprise-grade React storefront** based on the RollON template, with
their **real catalog**, then present it as a paid engagement.

**Definition of "done" for the engagement (v1):**
1. All RollON quality gates pass in THIS repo (§10) — tests, coverage, lint, build, E2E, a11y.
2. Site is config-driven: rebranding is edits to `app/src/lib/config.ts` + `app/src/data/`, nothing else.
3. Real product data from their live WooCommerce catalog is seeded (`§7`).
4. Deployable to Vercel with SPA rewrites + hardened headers (`vercel.json`).
5. `docs/PITCH.md` exists: a one-pager to sell this to the client, including upsells.
6. No RollON branding remains anywhere in the UI.

**Explicit non-goals for v1** (document as upsells in `docs/PITCH.md` §"Roadmap upsells"):
real payment gateway integration, live WooCommerce sync, customer accounts backend, blog CMS,
multi-language (BN) content, admin dashboard for client staff.

---

## §2 Business Profile (verified research — do not invent "facts")

Everything below was verified from rollerspub.com, their public WooCommerce Store API
(`wp-json/wc/store/v1`), their Facebook page, and local SEO sources on 2026-09-20. If a
future agent needs a NEW business fact, it must be verified the same way — never guess.

| Field | Value |
|---|---|
| Brand name | **Rollers Republic** |
| Site currently at | https://rollerspub.com ("Rollers Pub" is their storefront name) |
| Tagline in use | "Smoking Headshop — Imported from UK" |
| Founded | **2013** ("pioneered the headshop concept in the region") |
| Positioning | Bangladesh-based online smoke shop; 100% authentic, imported quality; community/"brotherhood" brand voice |
| Outlets | **Plaza A.R, Dhanmondi-28, Ground floor, Shop 108, Dhaka 1207** · **Mirpur** outlet (second location) |
| Pickup | Free pickup at Dhanmondi 2/A |
| Phones | **01330005300** (express delivery line, shown site-wide) · **01711626210** |
| Social | https://www.facebook.com/RollersRepublic (very active; bilingual EN/BN posts, product price posts) |
| Sales model | Order online → call for express delivery; same-day delivery in Dhaka; bKash + cash-on-delivery friendly |
| Mascot | **"Bro Bear"** — "Best Sellers and Bro Bear Recommended" |
| Reviews | Google reviews embedded via trustindex widget on their homepage |
| Categories (site nav) | Rolling Paper · Blunts · Filter Tips · Waterpipes & Bongs · Vapes · Munchies |
| Brands | RAW, Elements, Juicy Jays, OCB, Roor, Richer, Phoenix, Moksha, "you name it you get it" |
| Content sections they run | Shop by Brand · Blog ("Read our Blog") · New Arrivals · Best Sellers / Bro Bear picks |

**Voice & tone for all copy:** confident, community-oriented ("the republic of rollers"),
premium but street-smart; EN primary; keep Bengali-English mix out of UI chrome for v1.

---

## §3 Reference Map (read-only sources — never modify)

| Path / URL | Role |
|---|---|
| `/reference/rollon/` (sibling of this repo, NOT committed) | Original template. **Read-only reference.** Never commit from it; copy ideas, not diffs. |
| https://rollerspub.com | Client's live site — IA, copy inspiration, category names |
| `https://rollerspub.com/wp-json/wc/store/v1/products` | Public WooCommerce Store API — real catalog, BDT prices, attributes. Paginated (`per_page`, `page`). |
| https://www.facebook.com/RollersRepublic | Voice, pricing signals, outlet info |
| https://rollon-delta.vercel.app | What "good" looks like — the bar this project must match or beat |

The workspace also contains `reference/rollon/server/` (reference Node API) mirrored in this
repo's own `server/` — this repo's `server/` IS part of this project; the reference copy is not.

---

## §4 Tech Stack (inherited from template — DO NOT change without owner sign-off)

- React 19 + TypeScript (strict) + Vite 7 + Tailwind CSS 4 (via `@tailwindcss/vite`, CSS-first theme in `app/src/App.css`)
- State: **Zustand** (cart, auth, wishlist, database stores in `app/src/store/`) — `CartItem` canonical type lives in `app/src/types/index.ts`; do not fork it
- Routing: React Router 7, lazy pages, `PageTransition` wrapper, catch-all 404 (SSOT §9.4 rule)
- Forms: react-hook-form + zod (`app/src/lib/checkoutSchema.ts`)
- Data fetch: `@tanstack/react-query` + `app/src/hooks/useApi.ts` (template's data-access contract — keep exports even if a page doesn't use them yet)
- Testing: Vitest + `@testing-library/*` (unit), Playwright + axe-core (E2E storeflow/a11y/degraded)
- Backend: `server/` zero-dependency Node reference API implementing `docs/API.md`; deployed as Vercel serverless (`api/*.js`)
- CI: GitHub Actions (`.github/workflows/ci.yml`) → typecheck, lint, unit, coverage, build, E2E, deploy
- Node ≥ 20, npm ≥ 10. Package manager is **npm** (lockfile committed).

Directory map (post-rename): the React app is **`app/`** (formerly `rollon-app/`). Server is `server/`. Vercel functions in `api/`.

---

## §5 Design System — "RollON dark-gold × RR amber pub" (merged)

RollON's dark + gold identity is the **primary** system; Rollers Republic's warm pub/heritage
character is merged in as an **amber/copper secondary ramp**. All tokens are config-driven:
CSS variables in `app/src/App.css` (`@theme`) + `app/src/lib/config.ts` (`brandConfig`).
Changing the client's mind later = editing these two files only.

| Token | Value | Use |
|---|---|---|
| `--background` / base | `#0A0A0A` → surfaces `#1A1A1A` | App background (unchanged from template) |
| Primary (brand gold) | `#D4AF37` | CTAs, logo, key highlights, focus rings |
| Secondary (charcoal) | `#1A1A1A` | Cards, navbar, footer |
| Accent (ember) | `#FF6B35` | Sale badges, cart count, urgency moments |
| **New: pub-amber ramp** | `#F59E0B` (amber-500) glow, `#D97706` (amber-600) hover, `#B45309` (amber-700) deep | Category gradients, "Bro Bear picks" ribbon, heritage/story section, brand strip hover |
| Category gradients | amber→orange, amber→red, amber→emerald variants | `Category.gradients` in seed data |

**New components (must be config-flagged or gated where noted):**
- `AgeGate` — 18+ modal on first visit, persisted in localStorage, blocks scroll/interaction until confirmed. Copy: "Are you 18 or older?" + enter/leave. **Mandatory** (§9.1).
- `TrustBadges` — 100% Authentic · Imported from UK · Same-day Dhaka delivery · Google reviews strip
- `BrandStrip` — horizontal scroll of brand logos/names linking to `/shop?brand=X`
- `BroBearPicks` — "Recommended by Bro Bear" ribbon + curated row (reuses FeaturedProducts pattern, filters `tag: 'bro-bear'`)
- `ExpressDeliveryBanner` — top banner: "🚚 Express delivery — order online then call 📞 01330005300. Same day in Dhaka." (links `tel:`)
- `OutletCard` — used in `/contact`: name, address, phone, hours, "Get directions" Google Maps link

**Accessibility is non-negotiable** — template rules apply verbatim: icon buttons need
`aria-label`; contrast ≥ 4.5:1 (no `text-white/40` on dark); touch targets ≥ 24px; heading
order never skips; every animated section respects `prefers-reduced-motion`.

---

## §6 Information Architecture

| Route | Page | Content |
|---|---|---|
| `/` | Home | Hero (RR copy) → ExpressDeliveryBanner → Categories → BrandStrip → Featured ("Best Sellers & Bro Bear Picks") → New Arrivals → Testimonials (Google-review framing) → Newsletter |
| `/shop` | Shop | Grid + filters: category, **brand** (new), price, in-stock; search (`?search=`), sort |
| `/product/:slug` | PDP | Images, price, stock, **brand chip** (links to filtered shop), specs table (from Woo attributes), related products, add-to-cart |
| `/cart`, `/checkout`, `/success` | Commerce | Zones Dhaka Metro ৳60 / Suburb ৳100 / Outside ৳150; payment methods shown as **bKash / Cash on Delivery** (text-based, no gateway in v1); free shipping ≥ ৳3,000 |
| `/about` | Story | "Origins of Rollers Republic" — est. 2013, pioneered headshops in BD, community mission (rewrite source material, do NOT copy-paste SEO filler) |
| `/contact` | Contact | Both outlets as `OutletCard`s, phones, Facebook link, WhatsApp CTA, map links |
| `/blog` | Blog shell | 3 static teaser cards "coming soon" (v1) — flagged via `features.blog` |
| `/terms`, `/privacy`, `/age-policy` | Legal | Adult-only policy, tobacco-accessory framing |
| `*` | 404 | Styled, with links home/shop |

SEO: `index.html` meta + OG + Twitter cards, `robots.txt`, `sitemap.xml`, `site.webmanifest`,
structured data JSON-LD: `Organization`, `Store` with **two** `LocalBusiness` outlet addresses,
`Product` on PDPs (via `app/src/lib/seo.tsx`).

---

## §7 Data Model & Catalog Seed

### Types (extend, don't fork)
`app/src/types/index.ts` gains:
- `Product.brand?: string` and `Product.brandSlug?: string`
- `export interface Brand { id: string; name: string; slug: string; logo?: string }`

### Single source of data
`server/seed.json` is THE one catalog file (categories, products, testimonials, brands) — hand-edit
data there. The client's fallback dataset (`app/src/data/catalog.ts`) is **generated from it at build
time** by `app/scripts/generate-catalog.mjs` (wired via the `predev`/`prebuild` npm hooks and verified
in CI with `--check`). Duplicate data files are **banned** (template AGENTS.md rule); the generated
`catalog.ts` is committed so unit tests and CI work without a generation step, but it is never edited
by hand. Product images are served through the same-origin `/img/*` proxy or from
`app/public/images/products/`; reference only files that exist there (no ghost assets).

### Seeding real data (one-time snapshot)
`app/scripts/fetch-catalog.mjs` (Node ≥20, no new deps — use global `fetch`):
1. Paginate `https://rollerspub.com/wp-json/wc/store/v1/products?per_page=50&page=N` until exhausted.
2. Normalize: `id = woo id string`, `slug = woo slug`, `price = Number(prices.price)` (BDT, minor unit 0),
   `name`, strip HTML from descriptions, `category` from first `categories[]` entry mapped to our
   category slugs (Rolling Paper→`rolling-papers`, Waterpipes & Bongs→`water-pipes`, etc.),
   `brand`/`brandSlug` from `attributes[pa_brand]`, `specifications` from remaining attributes,
   `inStock = is_in_stock`, `stock = stock_quantity ?? (inStock ? 25 : 0)`.
3. Map categories to the 6-card set used on the homepage; keep every Woo subcategory as a tag.
4. Download product images for the **first 40 in-stock products** into `app/public/images/products/`
   (filename: `${slug}${ext}`), referenced locally. Others keep remote URLs in `image` (allowed v1).
5. Write results into `server/seed.json` (the SSOT), then run `node scripts/generate-catalog.mjs`
   to refresh the client's generated `src/data/catalog.ts`. Category tile images are preserved on
   refresh (first in-stock product image per category).

**Never hand-edit generated data into a second file.** Re-run the script to refresh.

### Commerce config
`commerceConfig` (already BDT-correct in template): currency `৳`/BDT, zones per §6, threshold ৳3,000.

---

## §8 Configuration Rules (the rebrand contract)

ALL client-specific values live in **`app/src/lib/config.ts`**:
`siteConfig` (name: **Rollers Republic**, tagline: "Smoking Headshop · Imported from UK",
email `hello@rollerspub.com` [placeholder — confirm with client], phones from §2,
social: facebook only for v1 + WhatsApp `https://wa.me/8801330005300`), `brandConfig`
(colors per §5, hero copy), `commerceConfig`, `features` (add `blog: boolean`, `ageGate: true`).

Components read config — **never hardcode** business strings in components. If you find
yourself typing "Rollers Republic" in a component, stop: it belongs in config.

Brand assets to produce: `app/public/favicon.svg`, `app/public/assets/hero.svg` (RR wordmark,
gold-on-dark, "RR" monogram + rolling-paper motif), `app/public/images/og-image.svg` (1200×630
dark+gold with tagline), `app/public/site.webmanifest` updated (name, colors `#0A0A0A`/`#D4AF37`).

---

## §9 Compliance & Ethics (hard rules)

1. **18+ gate mandatory** (`AgeGate`, §5) — persisted, all routes. Tobacco accessories are adult products.
2. Frame everything as **tobacco/smoking accessories**. Never reference or imply illegal
   substances, no drug paraphernalia-for-illegal-use language, no medical or health claims,
   no "safe smoking" claims — "responsible use" framing only.
3. Health notice in footer: "Products intended for adults 18+. Tobacco harms health." style line.
4. Keep the client's real business facts (§2) — do not fabricate outlets, certifications, or awards.
5. Client's product photos are demo-use only until the deal closes; the PITCH notes this.
6. Bangladesh legal context: present the store as a legitimate accessories retailer exactly as
   their own site does; no content that could read as promoting illegal activity.

---

## §10 Definition of Done (inherited from template — MANDATORY)

A task is NOT done unless ALL hold (CI enforces; never rely on CI alone):

1. `npm run lint` — zero errors
2. `npm test -- --run` — full unit suite green; new/changed logic has tests
3. `npm run test:coverage` — clears thresholds 84/75/80/84 (stmts/branch/funcs/lines)
4. `npm run build` — TypeScript + Vite clean
5. `npm run test:e2e` — storeflow + a11y green (when UI changed)
6. `cd server && npm test` — if `server/` changed; plus `node app/scripts/generate-catalog.mjs --check` if catalog changed
7. Docs updated in the same commit when behavior changes (README, CHANGELOG, this file)
8. Every claim in your summary is backed by a command you ran — no "done" from memory
9. Working tree committed; `git status --short` clean

**Anti-hallucination guardrails (from template, still binding):** no dummy UIs (every input
wired, every button clickable); no ghost assets; no mock-data crutches left in prod paths;
catch-all 404 route must stay; delete superseded app-level components, keep shadcn/ui
primitives + `useApi.ts` contract.

---

## §11 Roadmap (milestones → current status)

| Milestone | Scope | Status |
|---|---|---|
| **M0** | Repo seeded from template, renamed `app/`, SSOT authored | ✅ done |
| **M1** | Rebrand: config, design tokens (§5), AgeGate, assets (§8), navbar/footer/banner | ✅ done |
| **M2** | Catalog: fetch script + seed real data + brand type (§7) | ✅ done (949 products / 8 categories / 82 brands) |
| **M3** | Pages & sections per §6 (home, shop+brand filter, PDP, commerce, about, contact+outlets, legal, 404) | ✅ done |
| **M4** | Tests & CI green per §10; E2E adapted; coverage held (120 unit + 24 E2E + 2 degraded + 28 server) | ✅ done |
| **M5** | Deploy-ready: vercel.json rewrites+CSP, SEO files, PITCH.md — **remaining:** push to GitHub, connect Vercel, Lighthouse pass on live URL | 🔄 needs deploy |
| **M6** | SEO/perf hardening: self-hosted fonts, OG PNG, per-page SEO + 574-URL sitemap, LocalBusiness JSON-LD, build-time prerender of 484 routes (§ docs/SEO-AUDIT.md) | ✅ done |

**Agent working agreement:** one milestone per PR-series; update the status column and
CHANGELOG in the same commit as the work; never mark ⏳→✅ without the §10 gates passing.

---

## §12 Known Decisions & Open Questions

**Decided (do not re-litigate):**
- New repo (own history) seeded from RollON; template kept as read-only reference. ✅
- Real catalog seed from their public Woo Store API. ✅
- Design: RollON dark-gold primary, merged with amber pub ramp — one coherent enterprise system. ✅

**Open questions for the client (track in PITCH.md, don't block v1):**
- Official email address; Instagram handle; exact Mirpur outlet address; Google Maps links;
  Instagram/TikTok feeds; real Google reviews export vs. trustindex iframe; domain strategy
  (rollerspub.com stays? rollersrepublic.com?); delivery partner for outside-Dhaka.
