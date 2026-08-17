import { clsx, type ClassValue } from 'clsx';
import { Metadata } from 'next';
import { twMerge } from 'tailwind-merge';
import { SERVER_URL } from './env';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Cryptographically random, URL-safe id. Used for order numbers and tokens. */
export function randomToken(length: number = 24) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let token = '';
  for (let i = 0; i < length; i++) {
    token += alphabet.charAt(bytes[i] % alphabet.length);
  }
  return token;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/**
 * All money in the app is integer cents. This is the only place that turns it
 * back into something a human reads.
 */
export function formatPrice(
  cents: number,
  options: { currency?: string; notation?: Intl.NumberFormatOptions['notation'] } = {}
) {
  const { currency = 'EUR', notation = 'standard' } = options;

  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: currency.toUpperCase(),
    notation,
    maximumFractionDigits: 2,
  }).format((cents ?? 0) / 100);
}

/** Parses a user-entered price like "12.50" into 1250. Returns null if invalid. */
export function parsePriceToCents(input: string | number): number | null {
  const value = typeof input === 'number' ? input : parseFloat(input.replace(',', '.'));
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-IE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function constructMetadata({
  title = 'Pluto Market — a marketplace for digital assets',
  description = 'Buy and sell high-quality digital products: UI kits, icons, fonts, e-books, photos and more. Instant delivery, secure payments.',
  image = '/og.jpg',
  icons = '/favicon.ico',
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: image }] },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@GeroWalther',
    },
    icons,
    metadataBase: new URL(SERVER_URL),
    ...(noIndex && { robots: { index: false, follow: false } }),
  };
}
