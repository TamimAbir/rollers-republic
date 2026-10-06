# Rollers Republic — Your Shop, Rebuilt for Growth

**A modern, enterprise-grade online store for rollerspub.com — proposal & live demo**

---

## The pitch in one paragraph

You built the pioneering headshop in Bangladesh — but your website still runs on a
slow, WordPress-based template that fights you on every update. We rebuilt your entire
store as a modern, lightning-fast web app: your real catalog (949+ products), your real
prices, your real brands — with an 18+ age gate, same-day delivery messaging, and a
design that finally matches the quality of what you sell. It's ready to demo today.

## Live demo

> **https://rollers-republic.vercel.app** — live now, serving a snapshot of your real
> catalog: RAW, Elements, Juicy Jays, OCB, Phoenix, G-RollZ and 77 more brands.

> **Self-contained HTML version:** this proposal also exists as a single shareable file
> with the buyer-flow screenshots embedded — `docs/pitch.html` (rebuild after UI changes
> with `node docs/scripts/build-pitch.mjs`, which reads `docs/pitch.template.html`).

## What you get on day one

| Feature | Detail |
|---|---|
| **Your real catalog** | 949 products, 8 categories, 83 brands — snapshotted from your own store, prices in ৳ |
| **Static-prerendered** | 484 routes build to real HTML — content, prices and product data arrive in the first response, no JavaScript required |
| **18+ Age Gate** | Adult verification on entry, with a compliance-ready age policy page |
| **Built for your sales flow** | "Order online → call 01330005300" express-delivery banner, WhatsApp ordering, bKash + Cash on Delivery |
| **Both outlets on the map** | Dhanmondi flagship + Mirpur with Google Maps directions |
| **Shop by brand** | Dedicated brand pages — a thing your current site can't do |
| **Search & filters** | Instant search, category + brand + price filtering, sorting |
| **Google-review ready** | Testimonial section ready — drops in your real reviews, no fabricated ratings |
| **Mobile-first, WCAG AA accessible** | Works beautifully for every customer, on every device |
| **Secure by default** | Hardened security headers, no plugins to update, no WordPress to hack |

## Why upgrade from WordPress?

1. **Speed = sales.** Every second of load time costs conversions. 484 routes are
   prerendered to real HTML at build time, so your catalog is readable by search
   engines and link-preview scrapers that never run JavaScript — and no plugin
   payload loads on every page.
2. **Zero maintenance overhead.** No plugin updates, no theme conflicts, no database
   to harden. Deploy is a git push.
3. **Your catalog, automated.** A one-command snapshot pipeline keeps product data in
   sync with your WooCommerce backend — or we retire WooCommerce entirely.
4. **Own your stack.** Clean, documented, version-controlled code with an
   enterprise-grade test suite (205 automated tests: 144 unit, 37 API integration,
   24 end-to-end including accessibility; CI on every change).

## Engagement options

| Option | What it includes | Best for |
|---|---|---|
| **A. Launch & handover** | Deploy on your domain, train your team, hand over the repo | You have someone technical on staff |
| **B. Launch & care** | Everything in A + monthly updates, catalog refreshes, uptime monitoring | You want it fully managed |
| **C. Grow** | Everything in B + payment gateway (live bKash merchant), customer accounts, order dashboard for staff | You want to scale online sales |

## Roadmap upsells (built into the architecture, just not day one)

- Live payment gateway (bKash merchant API / cards)
- Real-time WooCommerce sync (two-way inventory)
- Customer accounts with order history
- Bengali-language storefront
- Staff admin dashboard (the template already ships the schema)

---

*Demo note: the proposal build uses Rollers Republic's public catalog data and product
imagery for demonstration purposes only; ownership and usage transfer with engagement.*

**Contact:** Tamim Abir · Fahad Ibrahim · Hope Theory — two brothers building for Dhaka.
