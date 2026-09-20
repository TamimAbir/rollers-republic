# RollON API Contract

This document defines the HTTP API that the RollON storefront expects. It is the
single source of truth for backend implementers — any backend (Supabase, Node,
serverless functions, etc.) that conforms to this contract will work with the
frontend with zero code changes.

> **Reference implementation:** A working, zero-dependency Node server that
> implements this contract lives in [`server/`](../server/). Run it with
> `cd server && npm start`, then point the frontend at it (see below).

## Configuration

| Env var | Description | Default |
|---------|-------------|---------|
| `VITE_API_BASE_URL` | Base URL for all API calls (relative `/api` on Vercel) | `/api` |
| `VITE_USE_REMOTE_API` | Set `true` to use the remote API; `false` uses bundled local data | `false` |

When `VITE_USE_REMOTE_API=true`, the frontend calls the endpoints below.
When it is `false` (default), the frontend serves bundled demo data so the
storefront runs standalone with no backend.

## Conventions

- **Base URL**: `${VITE_API_BASE_URL}` — all paths below are relative to it.
- **Content-Type**: `application/json` on all requests and responses.
- **Auth**: `Authorization: Bearer <token>` header on authenticated endpoints.
- **Errors**: `4xx/5xx` status with a JSON body: `{ "error": { "message": string, "code"?: string } }`.
- **List responses**: either a bare array `[...]` or a paginated envelope
  `{ "items": [...], "total": number, "page": number, "limit": number }`.
  The frontend handles both shapes.

## Types

All payload shapes mirror `src/types/index.ts` (the canonical TypeScript types).

### Product

```ts
{
  id: string; name: string; slug: string; description: string;
  price: number; originalPrice?: number; salePrice?: number;
  image: string; images?: string[];
  category: string; categoryId: string;
  rating: number; reviewCount: number;
  featured?: boolean; inStock: boolean; stock: number;
  badge?: string; tags?: string[];
  specifications?: Record<string, string>; new?: boolean;
}
```

### Category

```ts
{
  id: string; name: string; slug: string; description: string;
  image?: string; icon?: string; productCount: number; gradient?: string;
}
```

### Order

```ts
{
  id: string; orderNumber: string; customerId: string; customerName: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string; createdAt: string; updatedAt?: string;
  items: { productId?: string; name: string; quantity: number; price: number; image: string }[];
  shippingAddress: { name: string; address: string; city: string; phone: string; zone?: string };
}
```

### Customer

```ts
{
  id: string; name: string; email: string; phone: string;
  totalSpent: number; orders: number; createdAt: string;
  address?: string; city?: string; zone?: string;
}
```

### User (auth)

```ts
{ id: string; name: string; email: string; role: 'user' | 'admin'; avatar?: string }
```

## Endpoints

### Products

| Method | Path | Query | Description |
|--------|------|-------|-------------|
| GET | `/products` | `?id=`, `?slug=`, `?categoryId=`, `?featured=true`, `?search=` | List/filter products |
| POST | `/products` | — | Create product (admin) |
| PATCH | `/products/:id` | — | Update product (admin) |
| DELETE | `/products/:id` | — | Delete product (admin) |

Filters are combinable. `search` matches against `name`, `description`, and `tags` (case-insensitive).

### Categories

| Method | Path | Query | Description |
|--------|------|-------|-------------|
| GET | `/categories` | — | List categories |
| GET | `/categories/:id` | — | Get category by id (frontend also accepts `?id=` and `?slug=`) |

### Orders

| Method | Path | Description |
|--------|------|-------------|
| GET | `/orders` | List orders (auth: user sees own, admin sees all) |
| GET | `/orders/:id` | Get order (frontend also accepts `?id=`) |
| POST | `/orders` | Create order. Body: `Omit<Order, 'id' \| 'orderNumber' \| 'createdAt' \| 'updatedAt'>` |

The server should generate `id`, `orderNumber` (e.g. `ORD-<timestamp>`), and `createdAt`.

### Customers

| Method | Path | Description |
|--------|------|-------------|
| GET | `/customers` | List customers (admin) |
| GET | `/customers/:id` | Get customer (frontend also accepts `?id=`) |

### Auth

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | `{ name, email, password }` | Create account → `{ user, token }` |
| POST | `/auth/login` | `{ email, password }` | Login → `{ user, token }` |
| GET | `/auth/me` | — (Bearer token) | Get current user |

### Payment Methods

The frontend ships a static list (`cod`, `bkash`, `nagad`) for the checkout UI.
If a backend wants to drive this dynamically, expose:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/payment/methods` | `[{ id, name, icon?, color? }]` |

The checkout form validates `paymentMethod` against `['cod', 'bkash', 'nagad']` (see `src/lib/checkoutSchema.ts`).

## Frontend Behavior on Failure

The API layer (`src/lib/api.ts`) wraps every call:

1. If `VITE_USE_REMOTE_API !== 'true'`, the local store is used directly — no network.
2. If a remote call throws, the frontend logs a warning and falls back to the local store
   (products, categories, orders, customers) so the UI never white-screens.

## Implementing with Supabase (recommended)

- Products/categories/customers/orders map 1:1 to Postgres tables.
- Use Supabase Auth for `/auth/*` (or keep the dev-only local fallback while prototyping).
- Enable Row Level Security: customers can read/update only their own rows; admins via a `role` claim.
- Serve the API at the same origin via a rewrite (`/api/*` → Supabase Edge Function or PostgREST proxy)
  so `VITE_API_BASE_URL=/api` works in production without CORS setup.

## Implementing as Vercel Serverless Functions

**Shipped and live.** The repo includes [`api/rollon.js`](../api/rollon.js): a
single catch-all function that wraps the zero-dependency reference server and
serves the full contract at `/api/*`. `vercel.json` rewrites `/api/(.*)` →
`/api/rollon`, and `rollon-app/.env.production` sets `VITE_USE_REMOTE_API=true`
so production builds hit it same-origin (CSP's `connect-src 'self'` allows it).

The live demo (`rollon-delta.vercel.app`) uses this exact path.

Alternative granular layout: create `api/products.ts`, `api/orders.ts`,
`api/auth.ts`, etc. under the repo root. Each file exports a default handler;
Vercel maps `/api/*` automatically. The frontend expects `VITE_API_BASE_URL=/api`
(the default), so no frontend changes are needed.

> Serverless functions are in-memory — catalog reads are durable-accurate,
> writes reset on cold start. Durable storage: Supabase (recommended, above).
