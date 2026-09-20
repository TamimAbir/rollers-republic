import { useEffect } from 'react';
import type { Product } from '@/types';

interface SEOConfig {
  title: string;
  description: string;
  canonicalPath: string;
  image?: string;
  keywords?: string;
  type?: 'website' | 'product';
  jsonLd?: Record<string, unknown>;
}

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://rollon-delta.vercel.app';

const upsertMetaTag = (selector: string, attributes: Record<string, string>) => {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement('meta');
    document.head.appendChild(tag);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    tag.setAttribute(key, value);
  });
};

const upsertLinkTag = (selector: string, href: string) => {
  let link = document.head.querySelector<HTMLLinkElement>(selector);
  if (!link) {
    link = document.createElement('link');
    document.head.appendChild(link);
  }

  link.rel = 'canonical';
  link.href = href;
};

const toAbsoluteUrl = (pathOrUrl: string) => {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }

  return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
};

export const buildProductJsonLd = (product: Product, canonicalPath: string): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  image: [product.image, ...(product.images ?? [])].map(toAbsoluteUrl),
  sku: product.id,
  category: product.category,
  offers: {
    '@type': 'Offer',
    priceCurrency: 'BDT',
    price: product.price,
    availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    url: `${SITE_URL}${canonicalPath}`,
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: product.rating,
    reviewCount: product.reviewCount,
  },
});

export function useDocumentSEO({
  title,
  description,
  canonicalPath,
  image = import.meta.env.VITE_SITE_URL + '/images/og-image.jpg',
  keywords = 'smoking accessories, grinders, vaporizers, rolling papers, lighters, Bangladesh, online shop',
  type = 'website',
  jsonLd,
}: SEOConfig) {
  useEffect(() => {
    const canonicalUrl = `${SITE_URL}${canonicalPath}`;
    const schemaId = 'rollon-jsonld';

    document.title = `${title} | RollON Bangladesh`;

    upsertMetaTag('meta[name="description"]', { name: 'description', content: description });
    upsertMetaTag('meta[name="keywords"]', { name: 'keywords', content: keywords });
    upsertMetaTag('meta[property="og:title"]', { property: 'og:title', content: `${title} | RollON Bangladesh` });
    upsertMetaTag('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMetaTag('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertMetaTag('meta[property="og:image"]', { property: 'og:image', content: toAbsoluteUrl(image) });
    upsertMetaTag('meta[property="og:type"]', { property: 'og:type', content: type });
    upsertMetaTag('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMetaTag('meta[name="twitter:title"]', { name: 'twitter:title', content: `${title} | RollON Bangladesh` });
    upsertMetaTag('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    upsertMetaTag('meta[name="twitter:image"]', { name: 'twitter:image', content: toAbsoluteUrl(image) });
    upsertLinkTag('link[rel="canonical"]', canonicalUrl);

    const currentSchema = document.getElementById(schemaId);
    if (jsonLd) {
      const script = currentSchema || document.createElement('script');
      script.id = schemaId;
      script.setAttribute('type', 'application/ld+json');
      script.textContent = JSON.stringify(jsonLd);
      if (!currentSchema) {
        document.head.appendChild(script);
      }
    } else if (currentSchema) {
      currentSchema.remove();
    }

    return () => {
      document.getElementById(schemaId)?.remove();
    };
  }, [canonicalPath, description, image, jsonLd, keywords, title, type]);
}
