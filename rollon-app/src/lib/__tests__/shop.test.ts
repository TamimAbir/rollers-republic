import { describe, it, expect } from 'vitest';
import {
  INITIAL_VISIBLE_PRODUCTS,
  LOAD_MORE_STEP,
  resolveCategoryIdFromSlug,
  filterProducts,
  sortProducts,
  getVisibleProducts,
  getNextVisibleCount,
} from '../shop';
import type { Category, Product } from '@/types';

const categories: Category[] = [
  { id: 'c1', name: 'Vaporizers', slug: 'vaporizers', description: '', productCount: 2 },
  { id: 'c2', name: 'Grinders', slug: 'grinders', description: '', productCount: 2 },
];

const makeProduct = (overrides: Partial<Product> & Pick<Product, 'id' | 'name'>): Product => ({
  slug: overrides.id,
  description: 'A test product',
  price: 1000,
  image: '/images/products/grinder-classic.jpg',
  category: 'Grinders',
  categoryId: 'c2',
  rating: 4,
  reviewCount: 5,
  inStock: true,
  stock: 10,
  ...overrides,
});

const products: Product[] = [
  makeProduct({ id: 'p1', name: 'Classic Grinder', price: 1500, rating: 4.5, categoryId: 'c2', featured: true }),
  makeProduct({ id: 'p2', name: 'Premium Vaporizer', price: 5000, rating: 5, categoryId: 'c1', featured: false }),
  makeProduct({ id: 'p3', name: 'Budget Grinder', price: 800, rating: 3.5, categoryId: 'c2', featured: false }),
  makeProduct({ id: 'p4', name: 'Deluxe Bong', price: 2500, rating: 4.8, categoryId: 'c3', featured: true }),
];

describe('resolveCategoryIdFromSlug', () => {
  it('returns null for "all"', () => {
    expect(resolveCategoryIdFromSlug(categories, 'all')).toBeNull();
  });

  it('returns the category id for a matching slug', () => {
    expect(resolveCategoryIdFromSlug(categories, 'grinders')).toBe('c2');
  });

  it('returns null for an unknown slug', () => {
    expect(resolveCategoryIdFromSlug(categories, 'nope')).toBeNull();
  });
});

describe('filterProducts', () => {
  it('returns all products when no category and no search', () => {
    expect(filterProducts(products, null, '')).toHaveLength(4);
  });

  it('filters by category id', () => {
    const result = filterProducts(products, 'c2', '');
    expect(result.map((p) => p.id)).toEqual(['p1', 'p3']);
  });

  it('filters by search query (case-insensitive)', () => {
    const result = filterProducts(products, null, 'GRINDER');
    expect(result.map((p) => p.id)).toEqual(['p1', 'p3']);
  });

  it('filters by description match', () => {
    const result = filterProducts(products, null, 'test product');
    expect(result).toHaveLength(4);
  });

  it('combines category and search filters', () => {
    const result = filterProducts(products, 'c2', 'budget');
    expect(result.map((p) => p.id)).toEqual(['p3']);
  });

  it('returns empty array when nothing matches', () => {
    expect(filterProducts(products, null, 'zzz')).toHaveLength(0);
  });

  it('trims leading/trailing whitespace in the query', () => {
    const result = filterProducts(products, null, '  premium  ');
    expect(result.map((p) => p.id)).toEqual(['p2']);
  });
});

describe('sortProducts', () => {
  it('does not mutate the input array', () => {
    const before = [...products];
    sortProducts(products, 'price-low');
    expect(products).toEqual(before);
  });

  it('sorts by price low to high', () => {
    const result = sortProducts(products, 'price-low');
    expect(result.map((p) => p.price)).toEqual([800, 1500, 2500, 5000]);
  });

  it('sorts by price high to low', () => {
    const result = sortProducts(products, 'price-high');
    expect(result.map((p) => p.price)).toEqual([5000, 2500, 1500, 800]);
  });

  it('sorts by rating descending', () => {
    const result = sortProducts(products, 'rating');
    expect(result[0].rating).toBe(5);
    expect(result[result.length - 1].rating).toBe(3.5);
  });

  it('sorts by newest (id descending)', () => {
    const result = sortProducts(products, 'newest');
    expect(result[0].id).toBe('p4');
  });

  it('defaults to featured-first ordering', () => {
    const result = sortProducts(products, 'featured');
    expect(result[0].id).toBe('p1'); // featured
    expect(result[1].id).toBe('p4'); // featured
  });

  it('unknown sort key falls back to featured', () => {
    const result = sortProducts(products, 'bogus');
    expect(result[0].featured).toBe(true);
  });
});

describe('getVisibleProducts', () => {
  it('slices to the visible count', () => {
    expect(getVisibleProducts(products, 2)).toHaveLength(2);
  });

  it('returns all products when count exceeds length', () => {
    expect(getVisibleProducts(products, 100)).toHaveLength(4);
  });

  it('returns empty array for zero or negative count', () => {
    expect(getVisibleProducts(products, 0)).toHaveLength(0);
    expect(getVisibleProducts(products, -5)).toHaveLength(0);
  });
});

describe('pagination constants and helper', () => {
  it('has a sensible initial visible count and step', () => {
    expect(INITIAL_VISIBLE_PRODUCTS).toBe(12);
    expect(LOAD_MORE_STEP).toBe(12);
  });

  it('getNextVisibleCount adds the step', () => {
    expect(getNextVisibleCount(12)).toBe(24);
    expect(getNextVisibleCount(0)).toBe(12);
  });
});
