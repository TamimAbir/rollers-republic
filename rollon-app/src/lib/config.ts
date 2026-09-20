/**
 * RollON Template Configuration
 *
 * This file contains all customizable site configuration.
 * To customize for a new business, update these values and rebuild.
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
  /** Primary contact phone (WhatsApp) */
  phone: string;
  /** Business address */
  address: string;
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
}

export const siteConfig: SiteConfig = {
  name: 'RollON',
  tagline: 'Premium Smoking Accessories',
  description: 'Your one-stop shop for premium smoking accessories in Bangladesh. Quality products, fast delivery.',
  keywords: ['smoking accessories', 'vaporizers', 'grinders', 'water pipes', 'rolling papers', 'Bangladesh'],
  email: 'support@rollon.com.bd',
  phone: '+880 1870-489448',
  address: 'Dhaka, Bangladesh',
  social: {
    facebook: 'https://facebook.com/rollon',
    instagram: 'https://instagram.com/rollon',
    whatsapp: 'https://wa.me/8801870489448',
  },
  footerText: `© ${new Date().getFullYear()} RollON. All rights reserved.`,
};

export const brandConfig: BrandConfig = {
  primary: '#D4AF37',
  secondary: '#1A1A1A',
  accent: '#FF6B35',
  logo: '/assets/hero.svg',
  favicon: '/favicon.svg',
  heroImage: '/assets/hero.svg',
  heroTitle: 'Premium Smoking Accessories',
  heroSubtitle: 'Discover our curated collection of vaporizers, grinders, water pipes, and more.',
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
};

export const features: FeatureFlags = {
  newsletter: true,
  testimonials: true,
  whyChooseUs: true,
  accounts: true,
  contactForm: true,
};