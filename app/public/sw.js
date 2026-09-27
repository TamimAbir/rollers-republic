/**
 * Rollers Republic Service Worker
 * Offline-first caching for the storefront.
 * Cache name is versioned — bump CACHE_VERSION when assets change.
 */
const CACHE_VERSION = 'rr-v2';
const CACHE_NAME = `${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/favicon.svg',
  '/images/og-image.png',
];

// Install: pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

// Fetch: network-first for navigation, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip non-http(s) requests (chrome-extension, etc.)
  if (!request.url.startsWith('http')) return;

  // Navigation requests: network-first, fall back to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match('/index.html')),
    );
    return;
  }

  // API requests: network-first with cache fallback (degraded mode). Never
  // serve cached API data while the network is reachable — the old cache-first
  // branch froze repeat visitors on their first-visit catalog/prices.
  const url = new URL(request.url);
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  // Static assets: cache-first, then network. Respect no-store responses.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          // Only cache successful, same-origin, cacheable responses
          const noStore = (response.headers.get('cache-control') ?? '').includes('no-store');
          if (response.ok && !noStore && new URL(request.url).origin === self.location.origin) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => new Response('Offline', { status: 503, statusText: 'Service Unavailable' }));
    }),
  );
});