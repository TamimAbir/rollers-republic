# RollON-MVP-Final-V1 🛒

**Production e-commerce platform with cart, variants, checkout, and admin dashboard.**  
React 19 + TypeScript + Tailwind + Zustand. 117 tests, 87% coverage, CI green, WCAG 2.1 AA.

- **Live:** https://rollon-delta.vercel.app  
- **Repo:** [FahadIbrahim93/RollON-MVP-Final-V1](https://github.com/FahadIbrahim93/RollON-MVP-Final-V1)  
- **Stack:** React 19 · TypeScript · Tailwind · Zustand · Playwright  
- **Quality:** 117 tests (106 unit + 11 Playwright E2E), 87% coverage, CI green

<div align="center">

![RollON](https://img.shields.io/badge/RollON-MVP_Ready-blue?style=for-the-badge)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-%7E5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![CI](https://img.shields.io/github/actions/workflow/status/FahadIbrahim93/RollON-MVP-Final-V1/ci.yml?style=for-the-badge&label=CI&logo=github)](https://github.com/FahadIbrahim93/RollON-MVP-Final-V1/actions)
[![Tests: 117](https://img.shields.io/badge/Tests-117-2ECC71?style=for-the-badge)](https://github.com/FahadIbrahim93/RollON-MVP-Final-V1/actions)
[![Coverage: 87%](https://img.shields.io/badge/Coverage-87%25-2ECC71?style=for-the-badge)](https://github.com/FahadIbrahim93/RollON-MVP-Final-V1/actions)

</div>

---

## What it is

RollON is a configurable e-commerce platform designed for real transactions, not portfolio demos. It ships with a complete storefront, admin dashboard, and hardened security defaults—ready to clone, rebrand, and deploy.

- **Complete storefront** — Product catalog, cart, checkout, and order confirmation
- **Config-driven branding** — Customize business identity, colors, and content via a single config file
- **Fully responsive** — Mobile-first design that works on all devices
- **Blazing fast** — Vite build, code splitting, lazy loading
- **Dark theme** — Modern dark UI with Tailwind CSS v4
- **SEO optimized** — Meta tags, Open Graph, structured data, semantic HTML
- **Accessible** — WCAG 2.1 AA compliant, keyboard navigation, ARIA labels
- **Type-safe** — Full TypeScript coverage with strict mode
- **Modular architecture** — Reusable components, Zustand state management
- **Secure** — CSP headers, env validation, no hardcoded secrets

---

## Tech highlights

| Area | Implementation |
|---|---|
| **Frontend** | React 19, TypeScript strict mode, Tailwind CSS 4, Vite |
| **State** | Zustand for cart, auth, and UI state |
| **Routing** | React Router with protected admin routes |
| **Testing** | Vitest (106 unit) + Playwright (11 E2E), 87% coverage |
| **CI/CD** | GitHub Actions, Vercel deploy, quality gates |
| **Accessibility** | WCAG 2.1 AA, a11y testing in CI |
| **Config-driven** | Centralized config for branding, features, and deployment targets |

---

## Quality metrics

- **117 automated tests** — 106 unit + 11 Playwright E2E
- **87% coverage** — Enforced coverage thresholds in CI
- **CI green** — typecheck → lint → test → build → deploy
- **WCAG 2.1 AA** — Accessible by design, not afterthought
- **CSP-hardened** — Content Security Policy enforced

---

## Getting started

```bash
git clone https://github.com/FahadIbrahim93/RollON-MVP-Final-V1.git
cd RollON-MVP-Final-V1/rollon-app
npm install
npm run dev
```

```bash
npm run typecheck          # TypeScript check
npm run lint               # ESLint
npm test                   # Unit tests
npm run test:e2e           # Playwright E2E
npm run ci                 # Full pipeline
```

---

## Architecture

- **Components** — Reusable UI primitives with Tailwind
- **Pages** — Route-based pages for shop, cart, checkout, admin
- **Stores** — Zustand stores for cart, auth, products
- **Config** — Centralized config for branding, features, deployment targets
- **E2E** — Playwright tests for critical user flows

---

## Why this repo stands out

1. **Production-ready** — Not a tutorial project, built for real transactions
2. **Test coverage** — 87% with both unit and E2E tests
3. **Accessibility** — WCAG 2.1 AA in an e-commerce context
4. **Config-driven** — Easy to rebrand and deploy for different clients
5. **AI-assisted delivery** — Built with multi-agent workflow, quality gates maintained

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup and PR guidelines.  
See [AGENTS.md](./AGENTS.md) for AI coding standards and architecture rules.
