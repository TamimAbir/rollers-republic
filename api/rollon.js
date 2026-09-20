/**
 * RollON Reference API — Vercel serverless function.
 *
 * Vercel routes every /api/* request here via the vercel.json rewrite
 * { source: "/api/(.*)", destination: "/api/rollon" }. The rewrite preserves
 * the ORIGINAL request URL, so this wrapper strips the /api prefix before
 * re-emitting the request onto the zero-dependency http.Server from
 * server/index.js.
 *
 * Seed data is loaded via createRequire (not read from disk) because
 * __dirname is unreliable inside Vercel's bundled function output, and
 * require() of JSON is compatible with every Node runtime Vercel offers
 * (import attributes need Node 20.10+/18.20+ — avoid them here).
 *
 * Statelessness note (honest limitation): this is an in-memory reference
 * backend. Catalog reads (products, categories, testimonials, search) are
 * fully functional. Writes (register, orders, customers) live in the warm
 * instance's memory and reset on cold start / scale-out — durable storage
 * requires swapping in Supabase (see docs/API.md).
 */
import { createRequire } from 'node:module';
import { createAppServer } from '../server/index.js';

const require = createRequire(import.meta.url);
// Bundled as JSON by Vercel's nft/esbuild — no filesystem read.
const seed = require('../server/seed.json');

// One server per warm function instance — keeps in-memory state warm
// between invocations on the same instance.
const server = createAppServer({ seed });

export default function handler(req, res) {
  // Vercel rewrite preserves the original path (/api/products); the server
  // routes on /products, /categories, etc. — strip the /api prefix.
  if (req.url) {
    const [pathname, query] = req.url.split('?');
    if (pathname.startsWith('/api/')) {
      req.url = pathname.slice(4) + (query ? `?${query}` : '');
    }
  }
  server.emit('request', req, res);
}
