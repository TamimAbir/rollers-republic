# RollON — Premium Smoking Accessories Storefront

<div align="center">

**A modern, configuration-driven e-commerce storefront built with React 19, TypeScript, and Tailwind CSS.**

[![Live Demo](https://img.shields.io/badge/LIVE_DEMO-rollon--delta.vercel.app-2ECC71?style=for-the-badge)](https://rollon-delta.vercel.app)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite 7](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-4.2-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-%7E5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

</div>

## 🌟 Features

- **Product Catalog** — Browse, filter, and search products by category
- **Shopping Cart** — Persistent cart with Zustand state management
- **Checkout Flow** — Multi-step checkout with Zod form validation
- **Responsive Design** — Mobile-first layout that works on all devices
- **Dark Theme** — Modern dark UI with Tailwind CSS v4
- **Animations** — Smooth transitions and micro-interactions via Framer Motion
- **SEO Optimized** — Meta tags, Open Graph, structured data
- **Accessible** — WCAG 2.1 AA compliant

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
```

The defaults are sufficient for local development.

### 3. Run Development Server

```bash
npm run dev
```

Navigate to [http://localhost:5173](http://localhost:5173).

## 🧪 Testing

```bash
# Run unit tests (106 tests: stores, API client, schemas, shop logic)
npm test -- --run

# Run tests with coverage (~87% statements)
npm run test:coverage

# Run E2E tests (storeflow + accessibility, mock data mode)
npm run test:e2e

# Run E2E against the real reference API (server/)
npm run test:e2e:remote

# Run accessibility audit only (axe-core, WCAG 2.1 AA)
npx playwright test e2e/accessibility.spec.ts
```

The E2E suite includes an automated **accessibility audit** (`axe-core`)
that fails on serious/critical WCAG violations across the six key pages.

## 📁 Structure

```
src/
├── components/       # Reusable UI components
│   ├── layout/       # Navbar, Footer, ErrorBoundary
│   ├── sections/     # Hero, Features, Testimonials
│   ├── shop/         # ProductCard, ProductGrid
│   └── ui/           # Base UI primitives
├── pages/            # Route components
├── store/            # Zustand stores
├── lib/              # Config, utilities, API
├── data/             # Product catalog
└── types/            # TypeScript definitions
```

## 🛠️ Tech Stack

- **React 19** — Component UI
- **TypeScript ~5.9** — Type safety
- **Vite 7** — Build tool
- **Tailwind CSS 4** — Styling
- **React Router 7** — Routing
- **Zustand 5** — State management
- **React Query 5** — Data fetching
- **Framer Motion 12** — Animations
- **Radix UI** — Accessible primitives
- **Vitest 4** — Unit testing
- **Playwright** — E2E testing

## 📄 License

MIT — See [LICENSE](../../LICENSE) for details.