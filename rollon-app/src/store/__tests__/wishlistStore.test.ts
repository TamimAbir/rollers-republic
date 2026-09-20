import { describe, it, expect, beforeEach } from 'vitest';
import { useWishlistStore } from '../wishlistStore';
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

const mockProduct2: Product = { ...mockProduct, id: 'p2', name: 'Test Bong', slug: 'test-bong' };

describe('wishlistStore', () => {
  beforeEach(() => {
    useWishlistStore.getState().clearWishlist();
    localStorage.clear();
  });

  it('starts empty', () => {
    expect(useWishlistStore.getState().items).toHaveLength(0);
  });

  it('adds an item', () => {
    useWishlistStore.getState().addItem(mockProduct);
    const state = useWishlistStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].product.id).toBe('p1');
  });

  it('does not add duplicate items', () => {
    const { addItem } = useWishlistStore.getState();
    addItem(mockProduct);
    addItem(mockProduct);
    expect(useWishlistStore.getState().items).toHaveLength(1);
  });

  it('removes an item', () => {
    const { addItem, removeItem } = useWishlistStore.getState();
    addItem(mockProduct);
    removeItem('p1');
    expect(useWishlistStore.getState().items).toHaveLength(0);
  });

  it('toggles items in and out', () => {
    const { toggleItem } = useWishlistStore.getState();
    toggleItem(mockProduct);
    expect(useWishlistStore.getState().isInWishlist('p1')).toBe(true);
    toggleItem(mockProduct);
    expect(useWishlistStore.getState().isInWishlist('p1')).toBe(false);
  });

  it('checks membership', () => {
    const { addItem, isInWishlist } = useWishlistStore.getState();
    addItem(mockProduct);
    expect(isInWishlist('p1')).toBe(true);
    expect(isInWishlist('p2')).toBe(false);
  });

  it('clears all items', () => {
    const { addItem, clearWishlist } = useWishlistStore.getState();
    addItem(mockProduct);
    addItem(mockProduct2);
    clearWishlist();
    expect(useWishlistStore.getState().items).toHaveLength(0);
  });
});
