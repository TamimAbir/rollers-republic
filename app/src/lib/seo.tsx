import { useEffect } from 'react';
import type { Product } from '@/types';
import { siteConfig, brandConfig } from '@/lib/config';

interface SEOConfig {
  title: string;
  description: string;
  canonicalPath: string;
  image?: string;
  keywords?: string;
  type?: 'website' | 'product';
  jsonLd?: Record<string, unknown>;
  /** Exclude the page from search indexes (cart, checkout, account, etc.). */
  noindex?: boolean;
}

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://rollerspub.com';

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

/**
 * LocalBusiness JSON-LD (SEO-AUDIT fix #5): both physical outlets, both phone
 * numbers, Facebook profile, founding year. Built from siteConfig so the
 * rebrand contract (SSOT §8) stays intact — update config.ts, not this file.
 */
export const buildLocalBusinessJsonLd = (): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'Store',
  '@id': `${SITE_URL}/#business`,
  name: siteConfig.name,
  description: siteConfig.description,
  url: SITE_URL,
  logo: toAbsoluteUrl(brandConfig.favicon),
  image: toAbsoluteUrl('/images/og-image.png'),
  telephone: `+88${siteConfig.phone}`,
  email: siteConfig.email,
  foundingDate: '2013',
  slogan: siteConfig.tagline,
  sameAs: [siteConfig.social.facebook, siteConfig.social.whatsapp].filter(Boolean),
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Plaza A.R, Dhanmondi-28, Ground floor, Shop 108',
    addressLocality: 'Dhaka',
    postalCode: '1207',
    addressCountry: 'BD',
  },
  location: siteConfig.outlets.map((outlet) => ({
    '@type': 'Place',
    name: `${siteConfig.name} — ${outlet.name}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: outlet.address,
      addressLocality: 'Dhaka',
      addressCountry: 'BD',
    },
    hasMap: outlet.mapsUrl,
  })),
  contactPoint: [
    siteConfig.phone ? {
      '@type': 'ContactPoint',
      telephone: `+88${siteConfig.phone}`,
      contactType: 'customer service',
      areaServed: 'BD',
      availableLanguage: ['en', 'bn'],
    } : null,
    siteConfig.phoneAlt ? {
      '@type': 'ContactPoint',
      telephone: `+88${siteConfig.phoneAlt}`,
      contactType: 'sales',
      areaServed: 'BD',
      availableLanguage: ['en', 'bn'],
    } : null,
  ].filter(Boolean),
});

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
  image,
  keywords = 'smoking accessories, grinders, vaporizers, rolling papers, lighters, Bangladesh, online shop',
  type = 'website',
  jsonLd,
  noindex = false,
}: SEOConfig) {
  // SEO-AUDIT fix #2: default to the raster brand card (SVG is not renderable
  // by Facebook/WhatsApp link previews) and sanitize SVG product images for
  // the same reason.
  const DEFAULT_OG_IMAGE = '/images/og-image.png';
  const ogImage =
    image && !/\.svg(\?|$)/i.test(image) ? image : DEFAULT_OG_IMAGE;

  useEffect(() => {
    const canonicalUrl = `${SITE_URL}${canonicalPath}`;
    const schemaId = 'rr-jsonld';

    document.title = `${title} | ${siteConfig.name}`;

    upsertMetaTag('meta[name="description"]', { name: 'description', content: description });
    upsertMetaTag('meta[name="keywords"]', { name: 'keywords', content: keywords });
    upsertMetaTag(
      'meta[name="robots"]',
      noindex
        ? { name: 'robots', content: 'noindex, nofollow' }
        : { name: 'robots', content: 'index, follow' },
    );
    upsertMetaTag('meta[property="og:title"]', { property: 'og:title', content: `${title} | ${siteConfig.name}` });
    upsertMetaTag('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMetaTag('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertMetaTag('meta[property="og:image"]', { property: 'og:image', content: toAbsoluteUrl(ogImage) });
    upsertMetaTag('meta[property="og:type"]', { property: 'og:type', content: type });
    upsertMetaTag('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMetaTag('meta[name="twitter:title"]', { name: 'twitter:title', content: `${title} | ${siteConfig.name}` });
    upsertMetaTag('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    upsertMetaTag('meta[name="twitter:image"]', { name: 'twitter:image', content: toAbsoluteUrl(ogImage) });
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

    // Sitewide LocalBusiness schema (SEO-AUDIT fix #5) — lives on every page,
    // in its own script tag so it never clobbers a page's Product schema.
    const businessId = 'rr-jsonld-business';
    const currentBusiness = document.getElementById(businessId);
    const businessScript = currentBusiness || document.createElement('script');
    businessScript.id = businessId;
    businessScript.setAttribute('type', 'application/ld+json');
    businessScript.textContent = JSON.stringify(buildLocalBusinessJsonLd());
    if (!currentBusiness) {
      document.head.appendChild(businessScript);
    }

    return () => {
      document.getElementById(schemaId)?.remove();
      // Business schema is recreated on the next page's SEO effect — remove
      // it here only on unmount, where React clears the whole tree.
      document.getElementById(businessId)?.remove();
    };
  }, [canonicalPath, description, ogImage, jsonLd, keywords, title, type, noindex]);
}
