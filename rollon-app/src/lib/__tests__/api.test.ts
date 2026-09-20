import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createApiClient, apiHealth } from '../api';
import { useDatabaseStore } from '../../store/databaseStore';

/**
 * Tests for the API client using the injectable factory (createApiClient).
 *
 * No vi.stubEnv / vi.resetModules hacks: each test constructs a client with
 * explicit useRemote / fetchImpl options, which is the whole point of the
 * factory design.
 */

const mockProduct = {
  id: 'p1',
  name: 'Test Grinder',
  slug: 'test-grinder',
  price: 1500,
  image: '/images/products/grinder-classic.jpg',
  category: 'Grinders',
  categoryId: 'c2',
  description: 'A test product',
  rating: 4.5,
  reviewCount: 10,
  featured: true,
  inStock: true,
  stock: 20,
  tags: ['grinder'],
};

const mockOrder = {
  id: 'o1',
  orderNumber: 'ORD-123',
  customerId: 'u1',
  customerName: 'Test User',
  items: [{ productId: 'p1', name: 'Test Grinder', quantity: 1, price: 1500, image: '/images/products/grinder-classic.jpg' }],
  subtotal: 1500,
  deliveryFee: 0,
  total: 1500,
  paymentMethod: 'cod',
  status: 'pending',
  paymentStatus: 'pending',
  shippingAddress: { name: 'Test User', phone: '01700000000', address: 'Dhaka', city: 'Dhaka' },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function jsonResponse(payload: unknown) {
  return { ok: true, status: 200, json: async () => payload } as Response;
}

describe('api client — remote path (injectable factory)', () => {
  beforeEach(() => {
    localStorage.clear();
    useDatabaseStore.setState({ products: [], categories: [], orders: [], customers: [], users: [] });
    apiHealth.degraded = false;
    apiHealth.lastError = null;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getBySlug unwraps a bare-array response into a single product', async () => {
    const api = createApiClient({ useRemote: true, baseUrl: 'http://api.test', fetchImpl: vi.fn(async () => jsonResponse([mockProduct])) as unknown as typeof fetch });

    const product = await api.products.getBySlug('test-grinder');
    expect(product).toEqual(mockProduct);
  });

  it('getById unwraps a bare-array response into a single product', async () => {
    const api = createApiClient({ useRemote: true, baseUrl: 'http://api.test', fetchImpl: vi.fn(async () => jsonResponse([mockProduct])) as unknown as typeof fetch });

    const product = await api.products.getById('p1');
    expect(product).toEqual(mockProduct);
  });

  it('getAll unwraps a bare-array response', async () => {
    const api = createApiClient({ useRemote: true, baseUrl: 'http://api.test', fetchImpl: vi.fn(async () => jsonResponse([mockProduct])) as unknown as typeof fetch });

    const products = await api.products.getAll();
    expect(products).toEqual([mockProduct]);
  });

  it('handles paginated envelope list responses', async () => {
    const api = createApiClient({
      useRemote: true,
      baseUrl: 'http://api.test',
      fetchImpl: vi.fn(async () => jsonResponse({ items: [mockProduct], total: 1, page: 1, limit: 20 })) as unknown as typeof fetch,
    });

    const products = await api.products.getByCategory('c2');
    expect(products).toEqual([mockProduct]);
  });

  it('products.getByCategory unwraps envelope and filters correctly', async () => {
    const api = createApiClient({ useRemote: true, baseUrl: 'http://api.test', fetchImpl: vi.fn(async () => jsonResponse([mockProduct])) as unknown as typeof fetch });

    const products = await api.products.getByCategory('c2');
    expect(products).toHaveLength(1);
  });

  it('products.getFeatured passes the featured flag', async () => {
    const fetchMock = vi.fn(async () => jsonResponse([mockProduct]));
    const api = createApiClient({ useRemote: true, baseUrl: 'http://api.test', fetchImpl: fetchMock as unknown as typeof fetch });

    await api.products.getFeatured();
    expect(fetchMock).toHaveBeenCalledWith('http://api.test/products?featured=true', expect.any(Object));
  });

  it('products.search sends the search query and unwraps', async () => {
    const fetchMock = vi.fn(async () => jsonResponse([mockProduct]));
    const api = createApiClient({ useRemote: true, baseUrl: 'http://api.test', fetchImpl: fetchMock as unknown as typeof fetch });

    const results = await api.products.search('grinder');
    expect(results).toEqual([mockProduct]);
    expect(fetchMock).toHaveBeenCalledWith('http://api.test/products?search=grinder', expect.any(Object));
  });

  it('categories.getAll returns the remote list', async () => {
    const mockCategory = { id: 'c1', name: 'Pipes', slug: 'pipes', image: '/images/categories/pipes.svg' };
    const api = createApiClient({ useRemote: true, baseUrl: 'http://api.test', fetchImpl: vi.fn(async () => jsonResponse([mockCategory])) as unknown as typeof fetch });

    const categories = await api.categories.getAll();
    expect(categories).toEqual([mockCategory]);
  });

  it('orders.getById unwraps a bare-array response', async () => {
    const api = createApiClient({ useRemote: true, baseUrl: 'http://api.test', fetchImpl: vi.fn(async () => jsonResponse([mockOrder])) as unknown as typeof fetch });

    const order = await api.orders.getById('o1');
    expect(order).toEqual(mockOrder);
  });

  it('customers.getById unwraps a bare-array response', async () => {
    const mockCustomer = { id: 'c1', name: 'Test User', email: 'test@example.com', phone: '01700000000', role: 'customer' as const };
    const api = createApiClient({ useRemote: true, baseUrl: 'http://api.test', fetchImpl: vi.fn(async () => jsonResponse([mockCustomer])) as unknown as typeof fetch });

    const customer = await api.customers.getById('c1');
    expect(customer).toEqual(mockCustomer);
  });

  it('falls back to the local store and flags degraded when the remote call fails', async () => {
    useDatabaseStore.setState({ products: [mockProduct] });
    const onFallback = vi.fn();
    const api = createApiClient({
      useRemote: true,
      baseUrl: 'http://api.test',
      fetchImpl: (() => {
        throw new Error('Network error');
      }) as unknown as typeof fetch,
      onFallback,
    });

    const products = await api.products.getAll();
    expect(products).toEqual([mockProduct]); // local fallback
    expect(apiHealth.degraded).toBe(true); // visible degraded flag
    expect(apiHealth.lastError?.message).toBe('Network error');
    expect(onFallback).toHaveBeenCalledWith(expect.any(Error), '/products');
  });

  it('does not flag degraded when useRemote is false (local mode)', async () => {
    const api = createApiClient({ useRemote: false });
    await api.products.getAll();
    expect(apiHealth.degraded).toBe(false);
  });

  it('does not call fetch in local mode', async () => {
    const fetchMock = vi.fn();
    const api = createApiClient({ useRemote: false, fetchImpl: fetchMock as unknown as typeof fetch });
    await api.products.getAll();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('products.create adds to the local store and returns the product', async () => {
    const api = createApiClient({ useRemote: false });
    useDatabaseStore.setState({ products: [] });

    const created = await api.products.create(mockProduct);
    expect(created.id).toBe('p1');
    expect(useDatabaseStore.getState().products).toHaveLength(1);
  });

  it('products.update patches the local store', async () => {
    const api = createApiClient({ useRemote: false });
    useDatabaseStore.setState({ products: [{ ...mockProduct }] });

    const updated = await api.products.update('p1', { price: 2000 });
    expect(updated.price).toBe(2000);
    expect(useDatabaseStore.getState().products[0].price).toBe(2000);
  });

  it('products.delete removes from the local store', async () => {
    const api = createApiClient({ useRemote: false });
    useDatabaseStore.setState({ products: [{ ...mockProduct }] });

    const result = await api.products.delete('p1');
    expect(result.success).toBe(true);
    expect(useDatabaseStore.getState().products).toHaveLength(0);
  });

  it('apiHealth notifies subscribers when degrading and unsubscribe works', async () => {
    useDatabaseStore.setState({ products: [mockProduct] });
    const listener = vi.fn();
    const unsubscribe = apiHealth.subscribe(listener);
    apiHealth.degraded = false;

    const api = createApiClient({
      useRemote: true,
      baseUrl: 'http://api.test',
      fetchImpl: (() => {
        throw new Error('down');
      }) as unknown as typeof fetch,
    });

    await api.products.getAll(); // triggers degrade → notify
    expect(listener).toHaveBeenCalledTimes(1);
    expect(apiHealth.degraded).toBe(true);

    unsubscribe();
    apiHealth.degraded = false;
    apiHealth._notify();
    expect(listener).toHaveBeenCalledTimes(1); // no further calls after unsubscribe
  });

  it('does not notify when a remote call succeeds', async () => {
    const listener = vi.fn();
    const unsubscribe = apiHealth.subscribe(listener);
    apiHealth.degraded = false;

    const api = createApiClient({ useRemote: true, baseUrl: 'http://api.test', fetchImpl: vi.fn(async () => jsonResponse([mockProduct])) as unknown as typeof fetch });
    await api.products.getAll();

    expect(apiHealth.degraded).toBe(false);
    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });

  it('customers.getAll returns the remote list', async () => {
    const mockCustomer = { id: 'c1', name: 'Test User', email: 'test@example.com', phone: '01700000000', role: 'customer' as const };
    const api = createApiClient({ useRemote: true, baseUrl: 'http://api.test', fetchImpl: vi.fn(async () => jsonResponse([mockCustomer])) as unknown as typeof fetch });

    const customers = await api.customers.getAll();
    expect(customers).toEqual([mockCustomer]);
  });

  it('categories.getBySlug finds by slug from the remote list', async () => {
    const mockCategory = { id: 'c1', name: 'Pipes', slug: 'pipes', image: '/images/categories/pipes.svg' };
    const api = createApiClient({ useRemote: true, baseUrl: 'http://api.test', fetchImpl: vi.fn(async () => jsonResponse([mockCategory])) as unknown as typeof fetch });

    const category = await api.categories.getBySlug('pipes');
    expect(category).toEqual(mockCategory);
  });

  it('categories.getById finds by id from the remote list', async () => {
    const mockCategory = { id: 'c1', name: 'Pipes', slug: 'pipes', image: '/images/categories/pipes.svg' };
    const api = createApiClient({ useRemote: true, baseUrl: 'http://api.test', fetchImpl: vi.fn(async () => jsonResponse([mockCategory])) as unknown as typeof fetch });

    const category = await api.categories.getById('c1');
    expect(category).toEqual(mockCategory);
  });

  it('orders.getAll returns the remote list', async () => {
    const api = createApiClient({ useRemote: true, baseUrl: 'http://api.test', fetchImpl: vi.fn(async () => jsonResponse([mockOrder])) as unknown as typeof fetch });

    const orders = await api.orders.getAll();
    expect(orders).toEqual([mockOrder]);
  });

  it('handles non-Error fallback payloads (string rejection)', async () => {
    useDatabaseStore.setState({ products: [mockProduct] });
    const api = createApiClient({
      useRemote: true,
      baseUrl: 'http://api.test',
      fetchImpl: (() => {
        throw 'plain string failure';
      }) as unknown as typeof fetch,
    });

    const products = await api.products.getAll();
    expect(products).toEqual([mockProduct]);
    expect(apiHealth.lastError).toBeInstanceOf(Error); // wrapped
  });

  it('auto-recovers: successful remote call clears the degraded flag', async () => {
    useDatabaseStore.setState({ products: [mockProduct] });
    apiHealth.degraded = false;

    // First call fails → degraded
    let shouldFail = true;
    const fetchImpl = vi.fn(async () => {
      if (shouldFail) {
        throw new Error('down');
      }
      return jsonResponse([mockProduct]);
    });
    const api = createApiClient({ useRemote: true, baseUrl: 'http://api.test', fetchImpl: fetchImpl as unknown as typeof fetch });

    await api.products.getAll();
    expect(apiHealth.degraded).toBe(true);

    // Next call succeeds → recovers
    shouldFail = false;
    await api.products.getAll();
    expect(apiHealth.degraded).toBe(false);
    expect(apiHealth.lastError).toBeNull();
  });

  it('orders.create generates metadata and stores locally in local mode', async () => {
    const api = createApiClient({ useRemote: false });
    useDatabaseStore.setState({ orders: [] });

    const order = await api.orders.create({
      customerId: 'u1',
      customerName: 'Test User',
      items: [{ productId: 'p1', name: 'Test Grinder', quantity: 1, price: 1500, image: '/images/products/grinder-classic.jpg' }],
      total: 1500,
      paymentMethod: 'cod',
      status: 'pending',
      paymentStatus: 'pending',
      shippingAddress: { name: 'Test User', phone: '01700000000', address: 'Dhaka', city: 'Dhaka' },
    });

    expect(order.id).toBeTruthy();
    expect(order.orderNumber).toMatch(/^ORD-/);
    expect(useDatabaseStore.getState().orders).toHaveLength(1);
  });

  it('orders.create POSTs to the remote API in remote mode', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ ...mockOrder, id: 'server-id' }));
    const api = createApiClient({ useRemote: true, baseUrl: 'http://api.test', fetchImpl: fetchMock as unknown as typeof fetch });

    const order = await api.orders.create({
      customerId: 'u1',
      customerName: 'Test User',
      items: [{ productId: 'p1', name: 'Test Grinder', quantity: 1, price: 1500, image: '/images/products/grinder-classic.jpg' }],
      total: 1500,
      paymentMethod: 'cod',
      status: 'pending',
      paymentStatus: 'pending',
      shippingAddress: { name: 'Test User', phone: '01700000000', address: 'Dhaka', city: 'Dhaka' },
    });

    expect(order.id).toBe('server-id');
    expect(fetchMock).toHaveBeenCalledWith('http://api.test/orders', expect.objectContaining({ method: 'POST' }));
  });

  it('payment.getMethods returns the static list', async () => {
    const api = createApiClient({ useRemote: false });
    const methods = await api.payment.getMethods();
    expect(methods.length).toBeGreaterThanOrEqual(3);
    expect(methods[0].id).toBe('cod');
  });

  it('testimonials.getAll returns seeded testimonials', async () => {
    const api = createApiClient({ useRemote: false });
    const testimonials = await api.testimonials.getAll();
    expect(testimonials.length).toBeGreaterThan(0);
  });
});
