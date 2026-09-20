/**
 * RollON Reference API Server
 *
 * Zero-dependency Node HTTP server implementing the API contract in docs/API.md.
 * This is the reference backend for the template — swap it for Supabase,
 * Express, or any other backend that conforms to the contract.
 *
 * Run:  node server/index.js          (port 8787 by default, or PORT=xxxx)
 * Test: node --test server/test/
 */

import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { realpathSync } from 'node:fs';
import path from 'node:path';
import { randomUUID, scryptSync, timingSafeEqual, randomBytes } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8787);
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/* ----------------------------- Seed / store ----------------------------- */

function loadSeed() {
  try {
    const raw = readFileSync(path.join(__dirname, 'seed.json'), 'utf8');
    return JSON.parse(raw);
  } catch {
    return { categories: [], products: [], testimonials: [] };
  }
}

const seed = loadSeed();

// In-memory store, seeded from the canonical data snapshot.
const db = {
  categories: [...seed.categories],
  products: [...seed.products],
  testimonials: [...seed.testimonials],
  orders: [],
  customers: [],
  users: [], // { id, name, email, passwordHash, role, avatar }
  tokens: new Map(), // token -> { userId, expiresAt }
};

const listResponse = (items) => items; // bare array (frontend handles both shapes)

/* -------------------------------- Auth ---------------------------------- */

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, expectedHash] = String(stored || '').split(':');
  if (!salt || !expectedHash) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHash, 'hex');
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

function issueToken(userId) {
  const token = randomUUID();
  db.tokens.set(token, { userId, expiresAt: Date.now() + TOKEN_TTL_MS });
  return token;
}

function getUserFromToken(token) {
  const entry = db.tokens.get(token);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    db.tokens.delete(token);
    return null;
  }
  return db.users.find((u) => u.id === entry.userId) || null;
}

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, avatar: u.avatar });

/* ------------------------------- Helpers -------------------------------- */

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Cache-Control': 'no-store',
  });
  res.end(payload);
}

function sendError(res, status, message, code) {
  sendJson(res, status, { error: { message, ...(code ? { code } : {}) } });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function parseQuery(url) {
  const q = {};
  const idx = url.indexOf('?');
  if (idx === -1) return q;
  for (const pair of url.slice(idx + 1).split('&')) {
    if (!pair) continue;
    const [k, ...rest] = pair.split('=');
    q[decodeURIComponent(k)] = decodeURIComponent(rest.join('='));
  }
  return q;
}

/* ------------------------------- Filters -------------------------------- */

function filterProducts(query) {
  let items = [...db.products];

  if (query.id) items = items.filter((p) => p.id === query.id);
  if (query.slug) items = items.filter((p) => p.slug === query.slug);
  if (query.categoryId) items = items.filter((p) => p.categoryId === query.categoryId);
  if (query.featured === 'true') items = items.filter((p) => p.featured);
  if (query.search) {
    const q = query.search.toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q)),
    );
  }
  return items;
}

/* -------------------------------- Router -------------------------------- */

function requireAuth(req, res) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    sendError(res, 401, 'Missing Authorization header', 'UNAUTHORIZED');
    return null;
  }
  const user = getUserFromToken(token);
  if (!user) {
    sendError(res, 401, 'Invalid or expired token', 'UNAUTHORIZED');
    return null;
  }
  return user;
}

function requireAdmin(user, res) {
  if (!user || user.role !== 'admin') {
    sendError(res, 403, 'Admin access required', 'FORBIDDEN');
    return false;
  }
  return true;
}

async function handleRequest(req, res) {
  const method = req.method || 'GET';
  const url = req.url || '/';
  const pathname = url.split('?')[0].replace(/\/+$/, '') || '/';
  const query = parseQuery(url);

  // CORS (needed when the dev server and API run on different ports)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  /* -------- Auth -------- */
  if (pathname === '/auth/register' && method === 'POST') {
    const body = await readBody(req).catch((e) => sendError(res, 400, e.message));
    if (!body) return;
    const { name, email, password } = body;
    if (!name || !email || !password) return sendError(res, 400, 'name, email, and password are required');
    if (String(password).length < 8) return sendError(res, 400, 'Password must be at least 8 characters');
    if (db.users.some((u) => u.email === email)) return sendError(res, 409, 'Email already registered', 'EMAIL_EXISTS');

    const user = {
      id: 'user-' + randomUUID(),
      name,
      email,
      passwordHash: hashPassword(password),
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.replace(' ', ''))}`,
    };
    db.users.push(user);
    db.customers.push({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: '',
      totalSpent: 0,
      orders: 0,
      createdAt: new Date().toISOString(),
    });
    const token = issueToken(user.id);
    return sendJson(res, 201, { user: publicUser(user), token });
  }

  if (pathname === '/auth/login' && method === 'POST') {
    const body = await readBody(req).catch((e) => sendError(res, 400, e.message));
    if (!body) return;
    const { email, password } = body;
    const user = db.users.find((u) => u.email === email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return sendError(res, 401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }
    const token = issueToken(user.id);
    return sendJson(res, 200, { user: publicUser(user), token });
  }

  if (pathname === '/auth/me' && method === 'GET') {
    const user = requireAuth(req, res);
    if (!user) return;
    return sendJson(res, 200, publicUser(user));
  }

  /* -------- Products -------- */
  if (pathname === '/products' && method === 'GET') {
    return sendJson(res, 200, listResponse(filterProducts(query)));
  }
  if (pathname === '/products' && method === 'POST') {
    const user = requireAuth(req, res);
    if (!user) return;
    if (!requireAdmin(user, res)) return;
    const body = await readBody(req).catch((e) => sendError(res, 400, e.message));
    if (!body) return;
    if (!body.name || body.price === undefined) return sendError(res, 400, 'name and price are required');
    const product = { ...body, id: body.id || 'p-' + randomUUID() };
    db.products.push(product);
    return sendJson(res, 201, product);
  }
  if (pathname.startsWith('/products/') && method === 'PATCH') {
    const user = requireAuth(req, res);
    if (!user) return;
    if (!requireAdmin(user, res)) return;
    const id = decodeURIComponent(pathname.split('/')[2]);
    const body = await readBody(req).catch((e) => sendError(res, 400, e.message));
    if (!body) return;
    const product = db.products.find((p) => p.id === id);
    if (!product) return sendError(res, 404, 'Product not found');
    Object.assign(product, body);
    return sendJson(res, 200, product);
  }
  if (pathname.startsWith('/products/') && method === 'DELETE') {
    const user = requireAuth(req, res);
    if (!user) return;
    if (!requireAdmin(user, res)) return;
    const id = decodeURIComponent(pathname.split('/')[2]);
    const before = db.products.length;
    db.products = db.products.filter((p) => p.id !== id);
    if (db.products.length === before) return sendError(res, 404, 'Product not found');
    return sendJson(res, 200, { success: true });
  }

  /* -------- Categories -------- */
  if (pathname === '/categories' && method === 'GET') {
    let items = [...db.categories];
    if (query.id) items = items.filter((c) => c.id === query.id);
    if (query.slug) items = items.filter((c) => c.slug === query.slug);
    return sendJson(res, 200, listResponse(items));
  }
  if (pathname.startsWith('/categories/') && method === 'GET') {
    const id = decodeURIComponent(pathname.split('/')[2]);
    const category = db.categories.find((c) => c.id === id);
    if (!category) return sendError(res, 404, 'Category not found');
    return sendJson(res, 200, category);
  }

  /* -------- Orders -------- */
  if (pathname === '/orders' && method === 'GET') {
    const user = requireAuth(req, res);
    if (!user) return;
    let items = db.orders;
    if (user.role !== 'admin') items = items.filter((o) => o.customerId === user.id);
    if (query.id) items = items.filter((o) => o.id === query.id);
    return sendJson(res, 200, listResponse(items));
  }
  if (pathname === '/orders' && method === 'POST') {
    const user = requireAuth(req, res);
    if (!user) return;
    const body = await readBody(req).catch((e) => sendError(res, 400, e.message));
    if (!body) return;
    if (!body.items || !body.shippingAddress) return sendError(res, 400, 'items and shippingAddress are required');
    const order = {
      ...body,
      id: randomUUID(),
      orderNumber: `ORD-${Date.now()}`,
      customerId: user.id,
      customerName: user.name,
      status: body.status || 'pending',
      paymentStatus: body.paymentStatus || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.orders.push(order);
    // Keep customer totals in sync
    const customer = db.customers.find((c) => c.id === user.id);
    if (customer) {
      customer.orders += 1;
      customer.totalSpent += order.total || 0;
    }
    return sendJson(res, 201, order);
  }
  if (pathname.startsWith('/orders/') && method === 'GET') {
    const user = requireAuth(req, res);
    if (!user) return;
    const id = decodeURIComponent(pathname.split('/')[2]);
    const order = db.orders.find((o) => o.id === id);
    if (!order) return sendError(res, 404, 'Order not found');
    if (user.role !== 'admin' && order.customerId !== user.id) return sendError(res, 403, 'Forbidden');
    return sendJson(res, 200, order);
  }

  /* -------- Customers -------- */
  if (pathname === '/customers' && method === 'GET') {
    const user = requireAuth(req, res);
    if (!user) return;
    if (!requireAdmin(user, res)) return;
    let items = [...db.customers];
    if (query.id) items = items.filter((c) => c.id === query.id);
    return sendJson(res, 200, listResponse(items));
  }
  if (pathname.startsWith('/customers/') && method === 'GET') {
    const user = requireAuth(req, res);
    if (!user) return;
    if (!requireAdmin(user, res)) return;
    const id = decodeURIComponent(pathname.split('/')[2]);
    const customer = db.customers.find((c) => c.id === id);
    if (!customer) return sendError(res, 404, 'Customer not found');
    return sendJson(res, 200, customer);
  }

  /* -------- Payment methods -------- */
  if (pathname === '/payment/methods' && method === 'GET') {
    return sendJson(res, 200, listResponse([
      { id: 'cod', name: 'Cash on Delivery', icon: 'Banknote', color: '#10B981' },
      { id: 'bkash', name: 'bKash', icon: 'Smartphone', color: '#E2136E' },
      { id: 'nagad', name: 'Nagad', icon: 'Wallet', color: '#F7931E' },
    ]));
  }

  /* -------- Testimonials -------- */
  if (pathname === '/testimonials' && method === 'GET') {
    return sendJson(res, 200, listResponse(db.testimonials));
  }

  /* -------- 404 -------- */
  sendError(res, 404, `Not found: ${method} ${pathname}`, 'NOT_FOUND');
}

function createAppServer({ seed: seedOverride } = {}) {
  // seedOverride lets serverless wrappers inject the catalog data directly
  // (bundler-safe: __dirname is unreliable inside a bundled function).
  if (seedOverride) {
    db.categories = [...seedOverride.categories];
    db.products = [...seedOverride.products];
    db.testimonials = [...seedOverride.testimonials];
  }
  return createServer((req, res) => {
    handleRequest(req, res).catch((err) => {
      console.error('[RollON API] Unhandled error:', err);
      if (!res.headersSent) sendError(res, 500, 'Internal server error', 'INTERNAL');
    });
  });
}

// Auto-start only when run directly (not when imported by tests).
// realpathSync normalizes case (Windows) and resolves symlinks, so the
// comparison is robust against C:\ vs c:\ and MSYS path translation.
const isMain = (() => {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(path.resolve(process.argv[1]));
  } catch {
    return false;
  }
})();

if (isMain) {
  const server = createAppServer();
  server.listen(PORT, () => {
    console.log(`RollON Reference API listening on http://localhost:${PORT}`);
    console.log(`  ${db.products.length} products, ${db.categories.length} categories, ${db.orders.length} orders`);
  });
}

export { db, hashPassword, verifyPassword, filterProducts, createAppServer };
