import type { Category, Product } from '@/types';

export const INITIAL_VISIBLE_PRODUCTS = 12;
export const LOAD_MORE_STEP = 12;

export function resolveCategoryIdFromSlug(categories: Category[], selectedCategorySlug: string): string | null {
  if (selectedCategorySlug === 'all') {
    return null;
  }

  return categories.find((category) => category.slug === selectedCategorySlug)?.id ?? null;
}

export function filterProducts(products: Product[], selectedCategoryId: string | null, searchQuery: string): Product[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return products.filter((product) => {
    const matchesCategory = selectedCategoryId === null || product.categoryId === selectedCategoryId;
    if (!normalizedQuery) {
      return matchesCategory;
    }

    const matchesSearch = product.name.toLowerCase().includes(normalizedQuery)
      || product.description.toLowerCase().includes(normalizedQuery);

    return matchesCategory && matchesSearch;
  });
}

export function sortProducts(products: Product[], sortBy: string): Product[] {
  return [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return String(b.id || '').localeCompare(String(a.id || ''));
      default:
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    }
  });
}

export function getVisibleProducts(products: Product[], visibleCount: number): Product[] {
  return products.slice(0, Math.max(0, visibleCount));
}

export function getNextVisibleCount(visibleCount: number): number {
  return visibleCount + LOAD_MORE_STEP;
}
