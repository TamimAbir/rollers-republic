import { describe, it, expect, beforeEach } from 'vitest';
import { useDatabaseStore } from '../databaseStore';
import type { Product, Order, Customer } from '@/types';

const mockProduct: Product = {
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

const mockOrder: Order = {
  id: 'o1',
  orderNumber: 'RON-TEST-001',
  customerId: 'u1',
  customerName: 'John Doe',
  total: 1500,
  status: 'pending',
  paymentStatus: 'pending',
  paymentMethod: 'cod',
  createdAt: new Date().toISOString(),
  items: [{ productId: 'p1', name: 'Test Grinder', quantity: 1, price: 1500, image: '/images/products/grinder-classic.jpg' }],
  shippingAddress: {
    name: 'John Doe',
    address: 'House 12, Road 5',
    city: 'Dhaka',
    phone: '+8801712345678',
  },
};

const mockCustomer: Customer = {
  id: 'u1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+8801712345678',
  totalSpent: 0,
  orders: 0,
  createdAt: new Date().toISOString(),
};

describe('databaseStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useDatabaseStore.setState({
      products: [],
      categories: [],
      orders: [],
      customers: [],
      users: [],
    });
  });

  describe('products', () => {
    it('adds a product', () => {
      useDatabaseStore.getState().addProduct(mockProduct);
      expect(useDatabaseStore.getState().products).toHaveLength(1);
    });

    it('updates a product', () => {
      useDatabaseStore.getState().addProduct(mockProduct);
      useDatabaseStore.getState().updateProduct('p1', { price: 2000 });
      expect(useDatabaseStore.getState().products[0].price).toBe(2000);
    });

    it('deletes a product', () => {
      useDatabaseStore.getState().addProduct(mockProduct);
      useDatabaseStore.getState().deleteProduct('p1');
      expect(useDatabaseStore.getState().products).toHaveLength(0);
    });

    it('updateProduct leaves unrelated products untouched', () => {
      useDatabaseStore.getState().addProduct(mockProduct);
      useDatabaseStore.getState().addProduct({ ...mockProduct, id: 'p2', name: 'Other' });
      useDatabaseStore.getState().updateProduct('p1', { price: 999 });
      const products = useDatabaseStore.getState().products;
      expect(products.find((p) => p.id === 'p2')?.price).toBe(1500);
    });
  });

  describe('orders', () => {
    it('adds an order', () => {
      useDatabaseStore.getState().addOrder(mockOrder);
      expect(useDatabaseStore.getState().orders).toHaveLength(1);
    });

    it('updates order status', () => {
      useDatabaseStore.getState().addOrder(mockOrder);
      useDatabaseStore.getState().updateOrder('o1', { status: 'delivered' });
      expect(useDatabaseStore.getState().orders[0].status).toBe('delivered');
    });
  });

  describe('customers', () => {
    it('adds a customer', () => {
      useDatabaseStore.getState().addCustomer(mockCustomer);
      expect(useDatabaseStore.getState().customers).toHaveLength(1);
    });

    it('updates customer totals', () => {
      useDatabaseStore.getState().addCustomer(mockCustomer);
      useDatabaseStore.getState().updateCustomer('u1', { totalSpent: 5000, orders: 2 });
      const customer = useDatabaseStore.getState().customers[0];
      expect(customer.totalSpent).toBe(5000);
      expect(customer.orders).toBe(2);
    });
  });

  describe('users (password hashing)', () => {
    it('stores a password hash, never the plaintext password', async () => {
      await useDatabaseStore.getState().addUser({
        id: 'u-new',
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'superSecret123',
        role: 'user',
      });
      const stored = useDatabaseStore.getState().users[0];
      expect(stored.passwordHash).toBeDefined();
      expect(stored.passwordHash).not.toContain('superSecret123');
      expect((stored as unknown as Record<string, unknown>).password).toBeUndefined();
    });

    it('verifies a correct password', async () => {
      await useDatabaseStore.getState().addUser({
        id: 'u-new',
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'superSecret123',
        role: 'user',
      });
      const user = await useDatabaseStore.getState().verifyPassword('jane@example.com', 'superSecret123');
      expect(user).toBeDefined();
      expect(user?.email).toBe('jane@example.com');
      expect((user as unknown as Record<string, unknown> | undefined)?.passwordHash).toBeUndefined();
    });

    it('rejects a wrong password', async () => {
      await useDatabaseStore.getState().addUser({
        id: 'u-new',
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'superSecret123',
        role: 'user',
      });
      const user = await useDatabaseStore.getState().verifyPassword('jane@example.com', 'wrongPassword');
      expect(user).toBeUndefined();
    });

    it('returns undefined for unknown email', async () => {
      const user = await useDatabaseStore.getState().verifyPassword('ghost@example.com', 'anything123');
      expect(user).toBeUndefined();
    });

    it('generates a unique salt per hash (no two hashes are equal)', async () => {
      await useDatabaseStore.getState().addUser({
        id: 'u1',
        name: 'A',
        email: 'a@example.com',
        password: 'samePassword123',
        role: 'user',
      });
      await useDatabaseStore.getState().addUser({
        id: 'u2',
        name: 'B',
        email: 'b@example.com',
        password: 'samePassword123',
        role: 'user',
      });
      const [userA, userB] = useDatabaseStore.getState().users;
      expect(userA.passwordHash).not.toBe(userB.passwordHash);
    });
  });
});
