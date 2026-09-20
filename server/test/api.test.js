import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { request as httpRequest } from 'node:http';

/**
 * Integration tests for the RollON Reference API.
 * Boots the real server on an ephemeral port and exercises the contract.
 */

const PORT = 8899;
let server;

const base = `http://localhost:${PORT}`;

function request(method, path, { body, token } = {}) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;

    const httpReq = httpRequest(
      base + path,
      { method, headers },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          let parsed;
          try {
            parsed = data ? JSON.parse(data) : null;
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      },
    );
    httpReq.on('error', reject);
    if (body !== undefined) httpReq.write(JSON.stringify(body));
    httpReq.end();
  });
}

// Simple helpers for readability
const get = (path, token) => request('GET', path, { token });
const post = (path, body, token) => request('POST', path, { body, token });

describe('RollON Reference API', () => {
  before(async () => {
    const { createAppServer } = await import('../index.js');
    server = createAppServer();
    await new Promise((resolve) => server.listen(PORT, resolve));
  });

  after(() => {
    server?.close();
  });

  let token;

  describe('public read endpoints', () => {
    test('GET /products returns the seeded catalog', async () => {
      const { status, body } = await get('/products');
      assert.equal(status, 200);
      assert.ok(Array.isArray(body));
      assert.ok(body.length >= 6);
      assert.ok(body[0].name);
      assert.ok(body[0].price !== undefined);
    });

    test('GET /products?search= filters results', async () => {
      const { body } = await get('/products?search=grinder');
      assert.ok(body.length >= 1);
      assert.ok(body.every((p) => p.name.toLowerCase().includes('grinder')));
    });

    test('GET /products?slug= resolves a single product', async () => {
      const { body } = await get('/products?slug=wooden-grinder-3rd-gen');
      assert.equal(body.length, 1);
      assert.equal(body[0].name, '3rd Gen Wooden Grinder');
    });

    test('GET /products?featured=true returns only featured', async () => {
      const { body } = await get('/products?featured=true');
      assert.ok(body.length > 0);
      assert.ok(body.every((p) => p.featured === true));
    });

    test('GET /categories returns seeded categories', async () => {
      const { body } = await get('/categories');
      assert.ok(Array.isArray(body));
      assert.ok(body.some((c) => c.slug === 'grinders'));
    });

    test('GET /payment/methods returns cod/bkash/nagad', async () => {
      const { body } = await get('/payment/methods');
      const ids = body.map((m) => m.id);
      assert.deepEqual(ids, ['cod', 'bkash', 'nagad']);
    });

    test('GET /testimonials returns seeded testimonials', async () => {
      const { status, body } = await get('/testimonials');
      assert.equal(status, 200);
      assert.ok(Array.isArray(body));
    });
  });

  describe('auth flow', () => {
    test('register creates a user and returns a token', async () => {
      const { status, body } = await post('/auth/register', {
        name: 'Alice',
        email: 'alice@example.com',
        password: 'password123',
      });
      assert.equal(status, 201);
      assert.ok(body.token);
      assert.equal(body.user.email, 'alice@example.com');
      assert.equal(body.user.role, 'user');
    });

    test('register rejects duplicate email', async () => {
      const { status } = await post('/auth/register', {
        name: 'Alice Clone',
        email: 'alice@example.com',
        password: 'password123',
      });
      assert.equal(status, 409);
    });

    test('register rejects short passwords', async () => {
      const { status } = await post('/auth/register', {
        name: 'Bob',
        email: 'bob@example.com',
        password: 'short',
      });
      assert.equal(status, 400);
    });

    test('login succeeds with correct credentials', async () => {
      const { status, body } = await post('/auth/login', {
        email: 'alice@example.com',
        password: 'password123',
      });
      assert.equal(status, 200);
      assert.ok(body.token);
      token = body.token;
    });

    test('login fails with wrong password', async () => {
      const { status } = await post('/auth/login', {
        email: 'alice@example.com',
        password: 'wrongpass123',
      });
      assert.equal(status, 401);
    });

    test('GET /auth/me returns the authenticated user', async () => {
      const { status, body } = await get('/auth/me', token);
      assert.equal(status, 200);
      assert.equal(body.email, 'alice@example.com');
      // password hash must never leak
      assert.equal(body.passwordHash, undefined);
    });

    test('GET /auth/me rejects a bad token', async () => {
      const { status } = await get('/auth/me', 'not-a-real-token');
      assert.equal(status, 401);
    });
  });

  describe('order flow (authenticated)', () => {
    beforeEach(async () => {
      if (!token) {
        const { body } = await post('/auth/login', {
          email: 'alice@example.com',
          password: 'password123',
        });
        token = body.token;
      }
    });

    test('POST /orders creates an order with generated metadata', async () => {
      const { status, body } = await post(
        '/orders',
        {
          items: [{ productId: 'p1', name: 'Test Grinder', quantity: 1, price: 1500, image: '/images/x.jpg' }],
          total: 1500,
          shippingAddress: { name: 'Alice', address: 'House 1', city: 'Dhaka', phone: '+8801712345678' },
          paymentMethod: 'cod',
        },
        token,
      );
      assert.equal(status, 201);
      assert.ok(body.id);
      assert.match(body.orderNumber, /^ORD-/);
      assert.equal(body.status, 'pending');
      assert.equal(body.paymentStatus, 'pending');
      assert.equal(body.customerId, (await get('/auth/me', token)).body.id);
    });

    test('GET /orders lists the user\'s orders', async () => {
      const { status, body } = await get('/orders', token);
      assert.equal(status, 200);
      assert.ok(Array.isArray(body));
      assert.ok(body.length >= 1);
    });

    test('POST /orders requires auth', async () => {
      const { status } = await post('/orders', {
        items: [],
        shippingAddress: { name: 'X', address: 'Y', city: 'Z', phone: '1' },
      });
      assert.equal(status, 401);
    });

    test('POST /orders validates required fields', async () => {
      const { status } = await post('/orders', { total: 100 }, token);
      assert.equal(status, 400);
    });
  });

  describe('admin endpoints', () => {
    test('GET /customers requires admin (403 for regular user)', async () => {
      const { status } = await get('/customers', token);
      assert.equal(status, 403);
    });

    test('POST /products requires admin (403 for regular user)', async () => {
      const { status } = await post('/products', { name: 'X', price: 100 }, token);
      assert.equal(status, 403);
    });
  });

  describe('error handling', () => {
    test('unknown route returns 404 JSON', async () => {
      const { status, body } = await get('/nope');
      assert.equal(status, 404);
      assert.ok(body.error?.message);
    });

    test('invalid JSON body returns 400', async () => {
      const res = await new Promise((resolve, reject) => {
        const httpReq = httpRequest(
          base + '/auth/login',
          { method: 'POST', headers: { 'Content-Type': 'application/json' } },
          (r) => {
            let data = '';
            r.on('data', (c) => (data += c));
            r.on('end', () => resolve({ status: r.statusCode, body: data }));
          },
        );
        httpReq.on('error', reject);
        httpReq.write('{not json');
        httpReq.end();
      });
      assert.equal(res.status, 400);
    });

    test('CORS preflight returns 204 with headers', async () => {
      const res = await new Promise((resolve, reject) => {
        const httpReq = httpRequest(base + '/products', { method: 'OPTIONS' }, (r) => {
          r.resume();
          r.on('end', () => resolve(r));
        });
        httpReq.on('error', reject);
        httpReq.end();
      });
      assert.equal(res.statusCode, 204);
      assert.equal(res.headers['access-control-allow-origin'], '*');
    });
  });
});
