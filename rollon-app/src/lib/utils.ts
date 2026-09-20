import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const CURRENCY = import.meta.env.VITE_CURRENCY || 'BDT';
const LOCALE = import.meta.env.VITE_LOCALE || 'bn-BD';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: 0,
  }).format(price);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}