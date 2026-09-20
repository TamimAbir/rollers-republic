import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { request as httpRequest } from 'node:http';

/**
 * Verifies createAppServer({ seed }) — the injection path used by the Vercel
 * serverless wrapper (api/rollon.js). Bundled functions cannot rely on
 * __dirname, so seed data must be injectable directly.
 */

const PORT = 8898;
let server;

function request(method, path) {
  return new Promise((resolve, reject) => {
    const httpReq = httpRequest(
      `http://localhost:${PORT}${path}`,
      { method },
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
    httpReq.end();
  });
}

describe('createAppServer({ seed }) — serverless injection path', () => {
  before(async () => {
    const { createAppServer } = await import('../index.js');
    server = createAppServer({
      seed: {
        categories: [{ id: 'custom-cat', name: 'Custom', slug: 'custom' }],
        products: [
          {
            id: 'custom-prod',
            name: 'Custom Product',
            slug: 'custom-product',
            price: 999,
            categoryId: 'custom-cat',
            image: '/images/custom.png',
            description: 'Injected seed product',
            featured: true,
            rating: 4.5,
            reviews: 2,
            stock: 5,
          },
        ],
        testimonials: [{ id: 't1', name: 'T', text: 'X', rating: 5 }],
      },
    });
    await new Promise((resolve) => server.listen(PORT, resolve));
  });

  after(() => {
    server?.close();
  });

  test('serves injected seed data instead of seed.json', async () => {
    const { status, body } = await request('GET', '/products');
    assert.equal(status, 200);
    assert.equal(body.length, 1);
    assert.equal(body[0].name, 'Custom Product');
  });

  test('categories reflect injected seed', async () => {
    const { status, body } = await request('GET', '/categories');
    assert.equal(status, 200);
    assert.equal(body.length, 1);
    assert.equal(body[0].name, 'Custom');
  });

  test('slug lookup works on injected seed', async () => {
    const { status, body } = await request('GET', '/products?slug=custom-product');
    assert.equal(status, 200);
    assert.equal(body[0].id, 'custom-prod');
  });

  test('search works on injected seed', async () => {
    const { status, body } = await request('GET', '/products?search=Custom');
    assert.equal(status, 200);
    assert.equal(body.length, 1);
  });
});
