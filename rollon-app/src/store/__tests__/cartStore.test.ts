import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../cartStore';
import type { Product } from '@/types';

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

describe('cartStore', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    localStorage.clear();
  });

  it('starts empty', () => {
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.totalItems).toBe(0);
    expect(state.totalPrice).toBe(0);
  });

  it('adds a new item', () => {
    useCartStore.getState().addItem(mockProduct);
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(1);
    expect(state.totalItems).toBe(1);
    expect(state.totalPrice).toBe(1500);
  });

  it('increments quantity for duplicate items', () => {
    const { addItem } = useCartStore.getState();
    addItem(mockProduct);
    addItem(mockProduct);
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
    expect(state.totalItems).toBe(2);
    expect(state.totalPrice).toBe(3000);
  });

  it('removes an item', () => {
    const { addItem, removeItem } = useCartStore.getState();
    addItem(mockProduct);
    removeItem(mockProduct.id);
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.totalItems).toBe(0);
    expect(state.totalPrice).toBe(0);
  });

  it('updates quantity', () => {
    const { addItem, updateQuantity } = useCartStore.getState();
    addItem(mockProduct);
    updateQuantity(mockProduct.id, 3);
    const state = useCartStore.getState();
    expect(state.items[0].quantity).toBe(3);
    expect(state.totalPrice).toBe(4500);
  });

  it('removes item when quantity is set to zero or below', () => {
    const { addItem, updateQuantity } = useCartStore.getState();
    addItem(mockProduct);
    updateQuantity(mockProduct.id, 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('clears the cart', () => {
    const { addItem, clearCart } = useCartStore.getState();
    addItem(mockProduct);
    clearCart();
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.totalItems).toBe(0);
    expect(state.totalPrice).toBe(0);
  });

  it('toggles cart open state', () => {
    const { toggleCart } = useCartStore.getState();
    expect(useCartStore.getState().isOpen).toBe(false);
    toggleCart();
    expect(useCartStore.getState().isOpen).toBe(true);
    toggleCart();
    expect(useCartStore.getState().isOpen).toBe(false);
  });
});
