import { clsx, type ClassValue } from 'clsx';
import { Metadata } from 'next';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRandomToken(length: number = 10) {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters.charAt(randomIndex);
  }

  return token;
}
export function validateEmail(email: string): boolean {
  const regexPattern: RegExp =
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  return regexPattern.test(email);
}

export function constructMetadata({
  title = 'Pluto Market - the marketplace for digital assets',
  description = 'Pluto Market is an open-source marketplace for high-quality digital goods.',
  image = '/eis.jpg',
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
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@GeroWalther',
    },
    icons,
    metadataBase: new URL('https://pluto-market.up.railway.app'),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}

export function formatPrice(
  price: number | string,
  options: {
    currency?: 'USD' | 'EUR' | 'GBP' | 'JPY';
    notation?: Intl.NumberFormatOptions['notation'];
  } = {}
) {
  const { currency = 'USD', notation = 'standard' } = options;

  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation,
    maximumFractionDigits: 2,
  }).format(numericPrice);
}
