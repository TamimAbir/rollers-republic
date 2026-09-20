import { testimonials as mockTestimonials } from '../data/products';
import { useDatabaseStore } from '../store/databaseStore';
import type { Category, Customer, Order, Product, Testimonial } from '@/types';

const API_DELAY = 300;

/** Tiny observable that surfaces remote-API health to the UI. */
export interface ApiHealth {
  degraded: boolean;
  lastError: Error | null;
  subscribe(listener: () => void): () => void;
  _notify(): void;
}

function createApiHealth(): ApiHealth {
  const listeners = new Set<() => void>();
  return {
    degraded: false,
    lastError: null,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    _notify() {
      listeners.forEach((listener) => listener());
    },
  };
}

export const apiHealth: ApiHealth = createApiHealth();

function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const persisted = window.localStorage.getItem('rollon-auth');
    if (!persisted) {
      return null;
    }

    const parsed = JSON.parse(persisted) as { state?: { token?: string | null } };
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

const simulateApiCall = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), API_DELAY);
  });
};

type ListResponse<T> = T[] | { items: T[]; total?: number; page?: number; limit?: number };

const unwrapList = <T>(payload: ListResponse<T>): T[] => {
  return Array.isArray(payload) ? payload : payload.items;
};

const getStoreProducts = () => useDatabaseStore.getState().products;
const getStoreCategories = () => useDatabaseStore.getState().categories;
const getStoreOrders = () => useDatabaseStore.getState().orders;
const getStoreCustomers = () => useDatabaseStore.getState().customers;

export interface ApiClientOptions {
  /** Use the remote API instead of the local dataset. Defaults to VITE_USE_REMOTE_API === 'true'. */
  useRemote?: boolean;
  /** Base URL for remote calls. Defaults to VITE_API_BASE_URL || '/api'. */
  baseUrl?: string;
  /** Injectable fetch (tests). Defaults to global fetch. */
  fetchImpl?: typeof fetch;
  /** Called when a remote call fails and we degrade to the local dataset. */
  onFallback?: (error: unknown, path: string) => void;
}

export interface ApiClient {
  products: {
    getAll: () => Promise<Product[]>;
    getById: (id: string) => Promise<Product | undefined>;
    getBySlug: (slug: string) => Promise<Product | undefined>;
    getByCategory: (categoryId: string) => Promise<Product[]>;
    getFeatured: () => Promise<Product[]>;
    search: (query: string) => Promise<Product[]>;
    create: (product: Product) => Promise<Product>;
    update: (id: string, updates: Partial<Product>) => Promise<Partial<Product> & { id: string }>;
    delete: (id: string) => Promise<{ success: boolean }>;
  };
  categories: {
    getAll: () => Promise<Category[]>;
    getById: (id: string) => Promise<Category | undefined>;
    getBySlug: (slug: string) => Promise<Category | undefined>;
  };
  testimonials: {
    getAll: () => Promise<Testimonial[]>;
  };
  orders: {
    getAll: () => Promise<Order[]>;
    getById: (id: string) => Promise<Order | undefined>;
    create: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => Promise<Order>;
  };
  customers: {
    getAll: () => Promise<Customer[]>;
    getById: (id: string) => Promise<Customer | undefined>;
  };
  payment: {
    getMethods: () => Promise<{ id: string; name: string; icon: string; color: string }[]>;
  };
}

/** Factory — injectable config replaces env-at-module-load + module-reload test hacks. */
export function createApiClient(options: ApiClientOptions = {}): ApiClient {
  const useRemote = options.useRemote ?? import.meta.env.VITE_USE_REMOTE_API === 'true';
  const baseUrl = options.baseUrl ?? import.meta.env.VITE_API_BASE_URL ?? '/api';
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const onFallback = options.onFallback;

  const fetchJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
    const token = getAuthToken();

    const response = await fetchImpl(`${baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers || {}),
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed (${response.status})`);
    }

    return response.json();
  };

  const withFallback = async <T>(remoteFn: () => Promise<T>, mockFn: () => Promise<T>, path = ''): Promise<T> => {
    if (!useRemote) {
      return mockFn();
    }

    try {
      const result = await remoteFn();
      // Auto-recover: a successful remote call clears the degraded flag so the
      // banner dismisses when the backend comes back.
      if (apiHealth.degraded) {
        apiHealth.degraded = false;
        apiHealth.lastError = null;
        apiHealth._notify();
      }
      return result;
    } catch (error) {
      apiHealth.degraded = true;
      apiHealth.lastError = error instanceof Error ? error : new Error(String(error));
      apiHealth._notify();
      onFallback?.(error, path);
      console.warn('Remote API unavailable, falling back to local dataset.', error);
      return mockFn();
    }
  };

  return {
    products: {
      getAll: () => withFallback<Product[]>(async () => unwrapList(await fetchJson<ListResponse<Product>>('/products')), async () => simulateApiCall(getStoreProducts()), '/products'),

      getById: (id: string) =>
        withFallback<Product | undefined>(
          async () => {
            const items = unwrapList(await fetchJson<ListResponse<Product>>(`/products?id=${encodeURIComponent(id)}`));
            return items[0];
          },
          async () => getStoreProducts().find((p) => p.id === id),
          `/products?id=${id}`,
        ),

      getBySlug: (slug: string) =>
        withFallback<Product | undefined>(
          async () => {
            const items = unwrapList(await fetchJson<ListResponse<Product>>(`/products?slug=${encodeURIComponent(slug)}`));
            return items[0];
          },
          async () => getStoreProducts().find((p) => p.slug === slug),
          `/products?slug=${slug}`,
        ),

      getByCategory: (categoryId: string) =>
        withFallback<Product[]>(
          async () => unwrapList(await fetchJson<ListResponse<Product>>(`/products?categoryId=${encodeURIComponent(categoryId)}`)),
          async () => getStoreProducts().filter((p) => p.categoryId === categoryId),
          `/products?categoryId=${categoryId}`,
        ),

      getFeatured: () =>
        withFallback<Product[]>(async () => unwrapList(await fetchJson<ListResponse<Product>>('/products?featured=true')), async () => getStoreProducts().filter((p) => p.featured), '/products?featured=true'),

      search: (query: string) =>
        withFallback<Product[]>(
          async () => unwrapList(await fetchJson<ListResponse<Product>>(`/products?search=${encodeURIComponent(query)}`)),
          async () => {
            const lowerQuery = query.toLowerCase();
            return getStoreProducts().filter(
              (p) =>
                p.name.toLowerCase().includes(lowerQuery) ||
                p.description.toLowerCase().includes(lowerQuery) ||
                p.tags?.some((t) => t.toLowerCase().includes(lowerQuery)),
            );
          },
          `/products?search=${query}`,
        ),

      create: async (product: Product) => {
        useDatabaseStore.getState().addProduct(product);
        return product;
      },

      update: async (id: string, updates: Partial<Product>) => {
        useDatabaseStore.getState().updateProduct(id, updates);
        return { id, ...updates };
      },

      delete: async (id: string) => {
        useDatabaseStore.getState().deleteProduct(id);
        return { success: true };
      },
    },

    categories: {
      getAll: () => withFallback<Category[]>(() => fetchJson('/categories'), () => simulateApiCall(getStoreCategories()), '/categories'),

      getById: (id: string) =>
        withFallback<Category | undefined>(
          async () => {
            const categories = await fetchJson<Category[]>('/categories');
            return categories.find((c) => c.id === id);
          },
          async () => getStoreCategories().find((c) => c.id === id),
          `/categories?id=${id}`,
        ),

      getBySlug: (slug: string) =>
        withFallback<Category | undefined>(
          async () => {
            const categories = await fetchJson<Category[]>('/categories');
            return categories.find((c) => c.slug === slug);
          },
          async () => getStoreCategories().find((c) => c.slug === slug),
          `/categories?slug=${slug}`,
        ),
    },

    testimonials: {
      getAll: async () => simulateApiCall<Testimonial[]>(mockTestimonials),
    },

    orders: {
      getAll: () => withFallback<Order[]>(() => fetchJson('/orders'), async () => simulateApiCall(getStoreOrders()), '/orders'),

      getById: (id: string) =>
        withFallback<Order | undefined>(
          async () => {
            const items = unwrapList(await fetchJson<ListResponse<Order>>(`/orders?id=${encodeURIComponent(id)}`));
            return items[0];
          },
          async () => getStoreOrders().find((o) => o.id === id),
          `/orders?id=${id}`,
        ),

      create: async (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => {
        const newOrder: Order = {
          ...order,
          id: Math.random().toString(36).slice(2, 11),
          orderNumber: `ORD-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (!useRemote) {
          useDatabaseStore.getState().addOrder(newOrder);
        }

        return withFallback<Order>(
          () =>
            fetchJson('/orders', {
              method: 'POST',
              body: JSON.stringify(order),
            }),
          async () => newOrder,
          '/orders',
        );
      },
    },

    customers: {
      getAll: () => withFallback<Customer[]>(() => fetchJson('/customers'), async () => simulateApiCall(getStoreCustomers()), '/customers'),

      getById: (id: string) =>
        withFallback<Customer | undefined>(
          async () => {
            const items = unwrapList(await fetchJson<ListResponse<Customer>>(`/customers?id=${encodeURIComponent(id)}`));
            return items[0];
          },
          async () => getStoreCustomers().find((c) => c.id === id),
          `/customers?id=${id}`,
        ),
    },

    payment: {
      getMethods: async () => simulateApiCall([
        { id: 'cod', name: 'Cash on Delivery', icon: 'Banknote', color: '#10B981' },
        { id: 'bkash', name: 'bKash', icon: 'Smartphone', color: '#E2136E' },
        { id: 'nagad', name: 'Nagad', icon: 'Wallet', color: '#F7931E' },
      ]),
    },
  };
}

/** Default client configured from env vars (kept for existing consumers). */
export const api: ApiClient = createApiClient();
