import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import prisma from '@/db/db';
import { env } from '@/lib/env';
import { stripe } from '@/lib/stripe';
import {
  fulfillCheckoutSession,
  markCheckoutFailed,
} from '@/server/services/fulfillment';
import { syncConnectAccount } from '@/server/services/connect';

// Signature verification needs the raw body, so this must never be static
// and must never run on the edge runtime.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
  }

  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(
      payload,
      signature,
      env().STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid signature';
    console.warn('[stripe] webhook signature verification failed:', message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  // Stripe guarantees at-least-once delivery. Skip anything already done.
  const seen = await prisma.processedWebhookEvent.findUnique({
    where: { id: event.id },
  });
  if (seen) return NextResponse.json({ received: true, duplicate: true });

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        // `completed` can fire before an async payment method settles.
        if (session.payment_status === 'paid') {
          await fulfillCheckoutSession(session);
        }
        break;
      }

      case 'checkout.session.async_payment_succeeded':
        await fulfillCheckoutSession(event.data.object);
        break;

      case 'checkout.session.async_payment_failed':
      case 'checkout.session.expired': {
        const orderId = event.data.object.metadata?.orderId;
        if (orderId) await markCheckoutFailed(orderId);
        break;
      }

      // Keeps our copy of each seller's onboarding state honest, and releases
      // any earnings that were parked while they were not yet payable.
      case 'account.updated':
        await syncConnectAccount(event.data.object);
        break;

      default:
        break;
    }

    await prisma.processedWebhookEvent.create({
      data: { id: event.id, type: event.type },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    // Returning 500 makes Stripe retry, which is what we want for a transient
    // database or network failure.
    console.error(`[stripe] failed handling ${event.type} (${event.id}):`, error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
