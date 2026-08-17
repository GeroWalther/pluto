import 'server-only';
import type Stripe from 'stripe';
import { TRPCError } from '@trpc/server';
import prisma from '@/db/db';
import { SERVER_URL } from '@/lib/env';
import { stripe } from '@/lib/stripe';
import { releasePendingPayouts } from './fulfillment';

/**
 * Creates the seller's Stripe Express account if they do not have one, then
 * returns a fresh onboarding link. Safe to call repeatedly — onboarding links
 * are single-use and expire, so "resume onboarding" is the same code path as
 * "start onboarding".
 */
export async function startOnboarding({
  userId,
  country,
}: {
  userId: string;
  country: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, stripeAccountId: true },
  });

  if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found.' });

  let accountId = user.stripeAccountId;

  if (!accountId) {
    const account = await stripe().accounts.create({
      type: 'express',
      country,
      email: user.email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: { userId: user.id },
    });

    accountId = account.id;

    await prisma.user.update({
      where: { id: user.id },
      data: { stripeAccountId: accountId },
    });
  }

  const link = await stripe().accountLinks.create({
    account: accountId,
    type: 'account_onboarding',
    refresh_url: `${SERVER_URL}/dashboard/payouts?refresh=1`,
    return_url: `${SERVER_URL}/dashboard/payouts?onboarded=1`,
  });

  return { url: link.url };
}

/**
 * Pulls the live account state from Stripe and mirrors it locally. Called
 * when the seller returns from onboarding and from the `account.updated`
 * webhook, so the dashboard is correct either way.
 */
export type ConnectStatus = {
  connected: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirements: string[];
};

const DISCONNECTED: ConnectStatus = {
  connected: false,
  chargesEnabled: false,
  payoutsEnabled: false,
  detailsSubmitted: false,
  requirements: [],
};

export async function refreshAccountStatus(userId: string): Promise<ConnectStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeAccountId: true },
  });

  if (!user?.stripeAccountId) return DISCONNECTED;

  const account = await stripe().accounts.retrieve(user.stripeAccountId);
  return syncConnectAccount(account);
}

export async function syncConnectAccount(
  account: Stripe.Account
): Promise<ConnectStatus> {
  const user = await prisma.user.findFirst({
    where: { stripeAccountId: account.id },
    select: { id: true, stripePayoutsEnabled: true },
  });

  if (!user) return DISCONNECTED;

  const payoutsEnabled = Boolean(account.payouts_enabled);
  const chargesEnabled = Boolean(account.charges_enabled);
  const detailsSubmitted = Boolean(account.details_submitted);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeChargesEnabled: chargesEnabled,
      stripePayoutsEnabled: payoutsEnabled,
      stripeOnboardedAt: detailsSubmitted ? new Date() : null,
    },
  });

  // The moment a seller becomes payable, flush anything we held back.
  if (payoutsEnabled && !user.stripePayoutsEnabled) {
    await releasePendingPayouts(user.id);
  }

  return {
    connected: true,
    chargesEnabled,
    payoutsEnabled,
    detailsSubmitted,
    requirements: account.requirements?.currently_due ?? [],
  };
}

/** A one-time link into the seller's Stripe Express dashboard. */
export async function createDashboardLink(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeAccountId: true, stripePayoutsEnabled: true },
  });

  if (!user?.stripeAccountId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Connect a Stripe account first.',
    });
  }

  const link = await stripe().accounts.createLoginLink(user.stripeAccountId);
  return { url: link.url };
}
