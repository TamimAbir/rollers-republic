/**
 * Rollers Republic — Site Configuration
 *
 * THE rebrand contract (SSOT §8): every client-specific value lives here.
 * Components read from this file — never hardcode business strings in components.
 */

export interface SiteConfig {
  /** Business name displayed in navbar, title, etc. */
  name: string;
  /** Business tagline */
  tagline: string;
  /** Business description for SEO */
  description: string;
  /** Keywords for SEO */
  keywords: string[];
  /** Primary contact email */
  email: string;
  /** Primary contact phone (express delivery line) */
  phone: string;
  /** Secondary phone */
  phoneAlt?: string;
  /** Business address */
  address: string;
  /** Physical outlets (SSOT §2) */
  outlets: { name: string; address: string; mapsUrl: string }[];
  /** Social media URLs */
  social: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
  };
  /** Footer text */
  footerText: string;
}

export interface BrandConfig {
  /** Primary brand color (hex) */
  primary: string;
  /** Secondary brand color (hex) */
  secondary: string;
  /** Accent color (hex) */
  accent: string;
  /** Pub-amber ramp (SSOT §5) */
  amber: { glow: string; hover: string; deep: string };
  /** Logo URL (relative to public/) */
  logo: string;
  /** Favicon URL (relative to public/) */
  favicon: string;
  /** Hero section background image */
  heroImage: string;
  /** Hero section title */
  heroTitle: string;
  /** Hero section subtitle */
  heroSubtitle: string;
  /** Hero section CTA text */
  heroCTA: string;
  /** Hero section CTA link */
  heroCTALink: string;
}

export interface CommerceConfig {
  /** Currency symbol */
  currencySymbol: string;
  /** Currency code (ISO 4217) */
  currencyCode: string;
  /** Currency locale */
  currencyLocale: string;
  /** Free shipping threshold */
  freeShippingThreshold: number;
  /** Default shipping cost */
  defaultShippingCost: number;
  /** Shipping zones */
  shippingZones: { name: string; cost: number }[];
  /** Default products per page */
  productsPerPage: number;
  /** Payment methods offered at checkout (v1: text-based, no gateway) */
  paymentMethods: { id: string; label: string; hint: string }[];
}

export interface FeatureFlags {
  /** Enable newsletter signup */
  newsletter: boolean;
  /** Enable testimonials */
  testimonials: boolean;
  /** Enable "Why Choose Us" section */
  whyChooseUs: boolean;
  /** Enable account pages */
  accounts: boolean;
  /** Enable contact form */
  contactForm: boolean;
  /** Enable blog teaser section (v1: static shell) */
  blog: boolean;
  /** 18+ age gate (SSOT §9.1 — MUST stay true in production) */
  ageGate: boolean;
}

export const siteConfig: SiteConfig = {
  name: 'Rollers Republic',
  tagline: 'Smoking Headshop · Imported from UK',
  description:
    'Rollers Republic is Bangladesh’s pioneering headshop since 2013. Shop 100% authentic rolling papers, blunts, filter tips, waterpipes, bongs and vapes — imported from the UK, delivered to your doorstep. Same-day delivery in Dhaka.',
  keywords: [
    'rolling paper bangladesh',
    'rolling paper dhaka',
    'bong bangladesh',
    'waterpipe dhaka',
    'vape bangladesh',
    'blunt bd',
    'filter tips',
    'RAW bangladesh',
    'Elements papers bd',
    'Juicy Jays bd',
    'smoking headshop bd',
    'rollers republic',
    'rollers pub',
  ],
  email: 'hello@rollerspub.com',
  phone: '01330005300',
  phoneAlt: '01711626205',
  address: 'Plaza A.R, Dhanmondi-28, Ground floor, Shop 108, Dhaka 1207',
  outlets: [
    {
      name: 'Dhanmondi Flagship',
      address: 'Plaza A.R, Dhanmondi-28, Ground floor, Shop 108, Dhaka 1207',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Plaza+AR+Dhanmondi+28+Dhaka',
    },
    {
      name: 'Mirpur Outlet',
      address: 'Mirpur, Dhaka (call for directions)',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rollers+Republic+Mirpur+Dhaka',
    },
  ],
  social: {
    facebook: 'https://www.facebook.com/RollersRepublic',
    whatsapp: 'https://wa.me/8801330005300',
  },
  footerText: `© ${new Date().getFullYear()} Rollers Republic. All rights reserved.`,
};

export const brandConfig: BrandConfig = {
  primary: '#D4AF37',
  secondary: '#1A1A1A',
  accent: '#FF6B35',
  amber: { glow: '#F59E0B', hover: '#D97706', deep: '#B45309' },
  logo: '/assets/hero.svg',
  favicon: '/favicon.svg',
  heroImage: '/assets/hero.svg',
  heroTitle: 'The Republic of Rollers',
  heroSubtitle:
    'Bangladesh’s pioneering headshop since 2013. 100% authentic rolling papers, waterpipes, bongs and vapes — imported from the UK, at your doorstep the same day.',
  heroCTA: 'Shop Now',
  heroCTALink: '/shop',
};

export const commerceConfig: CommerceConfig = {
  currencySymbol: '৳',
  currencyCode: 'BDT',
  currencyLocale: 'bn-BD',
  freeShippingThreshold: 3000,
  defaultShippingCost: 100,
  shippingZones: [
    { name: 'Dhaka Metro', cost: 60 },
    { name: 'Dhaka Suburb', cost: 100 },
    { name: 'Outside Dhaka', cost: 150 },
  ],
  productsPerPage: 12,
  paymentMethods: [
    { id: 'bkash', label: 'bKash', hint: 'Send Money to the number shown after checkout, then call to confirm.' },
    { id: 'cod', label: 'Cash on Delivery', hint: 'Pay in cash when your order arrives.' },
  ],
};

export const features: FeatureFlags = {
  newsletter: true,
  testimonials: true,
  whyChooseUs: true,
  accounts: true,
  contactForm: true,
  blog: true,
  ageGate: true,
};

/** Adult-content compliance notice (SSOT §9.3) */
export const ageNotice =
  'Products are intended for adults 18+ only. Tobacco products are harmful to health. Please enjoy responsibly.';
