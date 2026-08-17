import 'server-only';
import Stripe from 'stripe';
import { env } from './env';

let client: Stripe | null = null;

export function stripe() {
  if (!client) {
    client = new Stripe(env().STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
      typescript: true,
      appInfo: { name: 'Pluto Market', version: '1.0.0' },
    });
  }
  return client;
}

/** Platform commission, in basis points. 500 = 5%. */
export const PLATFORM_FEE_BPS = 500;

export const CURRENCY = 'eur';

/**
 * Splits a line item price into the platform's cut and the seller's earnings.
 * Rounding always favours the seller by at most one cent, and the two parts
 * are guaranteed to sum back to the original price.
 */
export function splitFee(priceCents: number) {
  const platformFeeCents = Math.floor((priceCents * PLATFORM_FEE_BPS) / 10_000);
  return {
    platformFeeCents,
    sellerEarningsCents: priceCents - platformFeeCents,
  };
}
