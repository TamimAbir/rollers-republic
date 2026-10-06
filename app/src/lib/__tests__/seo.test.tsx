import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import {
  buildProductJsonLd,
  buildBreadcrumbJsonLd,
  buildLocalBusinessJsonLd,
  useDocumentSEO,
} from '../seo';
import type { Product } from '@/types';

/**
 * Guards the structured-data builders: rich-result eligibility depends on
 * honest ratings (no synthetic 4.5/0-review aggregates) and valid trails.
 */

const baseProduct: Product = {
  id: '11680',
  name: 'Raw Classic Paper Tin Box',
  slug: 'raw-classic-paper-tin-box',
  description: 'Compact metal storage case for rolling supplies.',
  price: 700,
  image: '/images/products/raw-classic-paper-tin-box.jpg',
  category: 'Accessories',
  categoryId: 'accessories',
  rating: 4.5,
  reviewCount: 0,
  inStock: true,
  stock: 25,
};

describe('buildProductJsonLd', () => {
  it('omits aggregateRating when reviewCount is 0 (no synthetic ratings)', () => {
    const ld = buildProductJsonLd(baseProduct, '/product/x');
    expect(ld.aggregateRating).toBeUndefined();
    expect(ld.offers).toMatchObject({ priceCurrency: 'BDT', price: 700 });
  });

  it('includes aggregateRating when real reviews exist', () => {
    const ld = buildProductJsonLd({ ...baseProduct, reviewCount: 7, rating: 4.8 }, '/product/x');
    expect(ld.aggregateRating).toEqual({
      '@type': 'AggregateRating',
      ratingValue: 4.8,
      reviewCount: 7,
    });
  });

  it('marks out-of-stock availability', () => {
    const ld = buildProductJsonLd({ ...baseProduct, inStock: false }, '/product/x');
    expect(ld.offers).toMatchObject({ availability: 'https://schema.org/OutOfStock' });
  });

  it('ships every product image, absolute, and keeps the canonical offer URL', () => {
    const ld = buildProductJsonLd(
      { ...baseProduct, images: ['/img/a.jpg', 'https://cdn.example/b.jpg'] },
      '/product/raw-classic-paper-tin-box',
    );
    expect(ld.image).toEqual([
      expect.stringContaining('/images/products/raw-classic-paper-tin-box.jpg'),
      expect.stringContaining('/img/a.jpg'),
      'https://cdn.example/b.jpg',
    ]);
    expect(ld.offers).toMatchObject({ url: expect.stringContaining('/product/raw-classic-paper-tin-box') });
  });
});

describe('buildBreadcrumbJsonLd', () => {
  it('builds a positioned trail with absolute URLs', () => {
    const ld = buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Shop', path: '/shop' },
      { name: 'Vapes', path: '/shop?category=vapes' },
    ]);
    const items = ld.itemListElement as Record<string, unknown>[];
    expect(items).toHaveLength(3);
    expect(items[0]).toMatchObject({ position: 1, name: 'Home', item: expect.stringMatching(/\/$/) });
    expect(items[2].name).toBe('Vapes');
    expect(items[2].item).toBeUndefined(); // last crumb omits item (Google style)
  });

  it('numbers every crumb positionally', () => {
    const ld = buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Shop', path: '/shop' },
    ]);
    expect(ld['@type']).toBe('BreadcrumbList');
    expect((ld.itemListElement as Record<string, unknown>[]).map((i) => i.position)).toEqual([1, 2]);
  });
});

describe('buildLocalBusinessJsonLd', () => {
  it('describes the head outlet and lists every branch under location', () => {
    const ld = buildLocalBusinessJsonLd();
    expect(ld['@type']).toBe('Store');
    expect(ld).toHaveProperty('telephone');
    expect(ld.address).toMatchObject({
      '@type': 'PostalAddress',
      addressLocality: 'Dhaka',
      addressCountry: 'BD',
    });
    // Both physical outlets are advertised as separate Places.
    expect(Array.isArray(ld.location)).toBe(true);
    expect((ld.location as unknown[]).length).toBeGreaterThanOrEqual(2);
  });

  it('advertises both phone numbers via contactPoint', () => {
    const points = buildLocalBusinessJsonLd().contactPoint as Record<string, string>[];
    expect(points.length).toBeGreaterThanOrEqual(2);
    expect(points.every((p) => p.telephone?.startsWith('+88'))).toBe(true);
  });
});

// --- useDocumentSEO: the DOM side-effects that make pages indexable ---------

const SeoHarness = (props: Parameters<typeof useDocumentSEO>[0]) => {
  useDocumentSEO(props);
  return null;
};

const metaContent = (selector: string) =>
  document.head.querySelector<HTMLMetaElement>(selector)?.content;

describe('useDocumentSEO', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.title = '';
  });

  afterEach(() => {
    document.head.innerHTML = '';
  });

  it('sets title, description, canonical and robots tags', () => {
    render(
      <SeoHarness
        title="Shop Vapes"
        description="Vapes in Dhaka."
        canonicalPath="/shop"
      />,
    );

    expect(document.title).toContain('Shop Vapes');
    expect(metaContent('meta[name="description"]')).toBe('Vapes in Dhaka.');
    expect(document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toContain(
      '/shop',
    );
    expect(metaContent('meta[name="robots"]')).toBe('index, follow');
  });

  it('noindex pages get noindex,nofollow', () => {
    render(
      <SeoHarness
        title="Checkout"
        description="Pay now."
        canonicalPath="/checkout"
        noindex
      />,
    );

    expect(metaContent('meta[name="robots"]')).toBe('noindex, nofollow');
  });

  it('emits Open Graph + Twitter tags with an absolute image', () => {
    render(
      <SeoHarness
        title="Product"
        description="A tin box."
        canonicalPath="/product/x"
        image="/images/products/x.jpg"
        type="product"
      />,
    );

    expect(metaContent('meta[property="og:type"]')).toBe('product');
    expect(metaContent('meta[property="og:image"]')).toMatch(/^https?:\/\//);
    expect(metaContent('meta[name="twitter:card"]')).toBe('summary_large_image');
  });

  it('falls back to the raster brand card when the image is an SVG', () => {
    render(
      <SeoHarness
        title="Logo"
        description="Vector asset."
        canonicalPath="/"
        image="/images/logo.svg"
      />,
    );

    // Facebook/WhatsApp cannot render SVG previews, so the SVG must be swapped.
    expect(metaContent('meta[property="og:image"]')).toContain('/images/og-image.png');
  });

  it('injects page JSON-LD and the sitewide LocalBusiness block separately', () => {
    render(
      <SeoHarness
        title="Product"
        description="A tin box."
        canonicalPath="/product/x"
        jsonLd={{ '@type': 'Product', name: 'Tin Box' }}
      />,
    );

    const page = document.getElementById('rr-jsonld');
    const business = document.getElementById('rr-jsonld-business');
    expect(page).not.toBeNull();
    expect(business).not.toBeNull();
    expect(JSON.parse(page!.textContent!)).toMatchObject({ '@type': 'Product' });
    expect(JSON.parse(business!.textContent!)).toMatchObject({ '@type': 'Store' });
  });

  it('removes a stale page JSON-LD when a page stops supplying one', () => {
    const { rerender } = render(
      <SeoHarness
        title="Shop"
        description="All products."
        canonicalPath="/shop"
        jsonLd={{ '@type': 'Product', name: 'Stale' }}
      />,
    );
    expect(document.getElementById('rr-jsonld')).not.toBeNull();

    rerender(
      <SeoHarness title="Shop" description="All products." canonicalPath="/shop" />,
    );
    expect(document.getElementById('rr-jsonld')).toBeNull();
  });

  it('updates tags in place across route changes instead of duplicating them', () => {
    const { rerender } = render(
      <SeoHarness title="Home" description="Welcome." canonicalPath="/" />,
    );
    rerender(
      <SeoHarness title="About" description="Our story." canonicalPath="/about" />,
    );

    expect(document.title).toContain('About');
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(metaContent('meta[name="description"]')).toBe('Our story.');
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
  });

  it('cleans up its schema tags on unmount', () => {
    const { unmount } = render(
      <SeoHarness
        title="About"
        description="Our story."
        canonicalPath="/about"
        jsonLd={{ '@type': 'AboutPage' }}
      />,
    );
    expect(document.getElementById('rr-jsonld')).not.toBeNull();

    unmount();
    expect(document.getElementById('rr-jsonld')).toBeNull();
    expect(document.getElementById('rr-jsonld-business')).toBeNull();
  });
});