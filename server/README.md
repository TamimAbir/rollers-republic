# RollON Reference API

A zero-dependency Node HTTP server that implements the API contract in
[`docs/API.md`](../docs/API.md). It is the reference backend for the RollON
template — swap it for Supabase, Express, or any backend that conforms to the
contract.

- **Zero dependencies** — uses only Node.js built-ins (`http`, `crypto`).
- **PBKDF2 password hashing** via `crypto.scryptSync` (constant-time verify).
- **Bearer-token auth** with 7-day expiry, stored in memory.
- **In-memory store** seeded from `seed.json` (generated from the frontend's
  canonical `src/data/products.ts` — no duplicated data).
- **CORS enabled** so the Vite dev server (port 5173) can call it directly.

## Quick Start

```bash
# 1. (Re)generate seed.json from the frontend data (only when products change)
npm run generate:seed

# 2. Start the server
npm start            # → http://localhost:8787

# 3. Run the integration tests (node:test, no extra deps)
npm test
```

## Wiring the Frontend

Point the storefront at this server instead of bundled mock data:

```bash
cd ../rollon-app
VITE_USE_REMOTE_API=true VITE_API_BASE_URL=http://localhost:8787 npm run dev
```

Or on Windows (cmd):

```cmd
set VITE_USE_REMOTE_API=true
set VITE_API_BASE_URL=http://localhost:8787
npm run dev
```

You can also run the full E2E suite against the real API:

```bash
cd ../rollon-app
npx playwright test --config=playwright.remote.config.ts
```

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/products` | — | List/filter (`?id=`, `?slug=`, `?categoryId=`, `?featured=true`, `?search=`) |
| POST | `/products` | admin | Create product |
| PATCH | `/products/:id` | admin | Update product |
| DELETE | `/products/:id` | admin | Delete product |
| GET | `/categories` | — | List categories (`?id=`, `?slug=`) |
| GET | `/categories/:id` | — | Category by id |
| GET | `/orders` | user/admin | List orders (users see own; admins see all) |
| GET | `/orders/:id` | user/admin | Order by id (`?id=` also supported) |
| POST | `/orders` | user | Create order |
| GET | `/customers` | admin | List customers (`?id=`) |
| GET | `/customers/:id` | admin | Customer by id |
| POST | `/auth/register` | — | `{ name, email, password }` → `{ user, token }` |
| POST | `/auth/login` | — | `{ email, password }` → `{ user, token }` |
| GET | `/auth/me` | Bearer | Current user |
| GET | `/payment/methods` | — | Static list (`cod`, `bkash`, `nagad`) |
| GET | `/testimonials` | — | Seeded testimonials |

## Deploying

### Option 1 — Vercel serverless (already deployed for the live demo)

The repo ships a ready-made Vercel function at [`api/rollon.js`](../api/rollon.js).
`vercel.json` rewrites `/api/*` → the function, and production builds of the
storefront default to `VITE_USE_REMOTE_API=true` (see `rollon-app/.env.production`),
so **the live site talks to this real API at the same origin** — no CORS, no
separate host.

```bash
# Deploy (repo root)
vercel --prod
```

The live reference: `https://rollon-delta.vercel.app/api/products` (200 + JSON).

> **Honest limitation:** serverless = in-memory. Catalog reads (products,
> categories, testimonials, search) are fully functional. Writes (register,
> orders, customers) live in the warm instance's memory and reset on cold
> start / scale-out. For durable writes, use Option 2 or swap in Supabase.

### Option 2 — self-host the Node server

The server is a plain Node app — deploy it to Railway, Render, Fly.io, or any
Node host. Set `PORT` to the platform's expected port, then point the frontend
at it with `VITE_API_BASE_URL=https://your-host`.

## Layout

```
server/
├── index.js                  # Server + router + auth (single file, ~400 lines)
├── seed.json                 # Generated snapshot of the frontend catalog
├── scripts/
│   └── generate-seed.mjs     # Regenerates seed.json from src/data/products.ts
└── test/
    └── api.test.js           # 23 integration tests (node:test)
```
