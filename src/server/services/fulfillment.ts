import 'server-only';
import type Stripe from 'stripe';
import { OrderStatus, PayoutStatus } from '@prisma/client';
import prisma from '@/db/db';
import { CURRENCY, stripe } from '@/lib/stripe';
import { sendEmail } from '@/lib/sendEmail';
import { renderReceiptEmail, renderSaleEmail } from '@/server/services/emails';

/**
 * Marks an order paid and kicks off delivery. Called only from the Stripe
 * webhook.
 *
 * Stripe retries webhooks, so every step here is idempotent: the status
 * transition is guarded by a conditional update, and payouts and emails are
 * each gated on their own persisted flag.
 */
export async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    console.warn(`[stripe] checkout session ${session.id} has no orderId metadata`);
    return;
  }

  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id;

  // The charge backing this payment is what seller transfers are drawn from.
  let chargeId: string | null = null;
  if (paymentIntentId) {
    const intent = await stripe().paymentIntents.retrieve(paymentIntentId);
    chargeId =
      typeof intent.latest_charge === 'string'
        ? intent.latest_charge
        : (intent.latest_charge?.id ?? null);
  }

  // Only transition PENDING -> PAID. A replayed event updates 0 rows and we
  // fall through to the delivery steps, which are individually idempotent.
  const transitioned = await prisma.order.updateMany({
    where: { id: orderId, status: OrderStatus.PENDING },
    data: {
      status: OrderStatus.PAID,
      paidAt: new Date(),
      stripePaymentIntentId: paymentIntentId ?? null,
      stripeChargeId: chargeId,
    },
  });

  if (transitioned.count > 0) {
    // Sold counts move with the first successful transition only.
    const items = await prisma.orderItem.findMany({
      where: { orderId },
      select: { productId: true },
    });

    const productIds = items
      .map((i) => i.productId)
      .filter((id): id is string => Boolean(id));

    if (productIds.length > 0) {
      await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: { soldCount: { increment: 1 } },
      });
    }
  }

  await payOutSellers(orderId);
  await sendOrderEmails(orderId);
}

/**
 * Transfers each seller their share of an order.
 *
 * One transfer per order item, keyed on the item id, so a webhook replay can
 * never pay a seller twice — Stripe deduplicates on the idempotency key and
 * we also skip anything not still PENDING.
 */
export async function payOutSellers(orderId: string) {
  const items = await prisma.orderItem.findMany({
    where: { orderId, payoutStatus: PayoutStatus.PENDING },
    include: {
      seller: { select: { id: true, stripeAccountId: true, stripePayoutsEnabled: true } },
      order: { select: { stripeChargeId: true, orderNumber: true, status: true } },
    },
  });

  for (const item of items) {
    if (item.order.status !== OrderStatus.PAID) continue;

    // A seller who never finished Stripe onboarding still earns the money —
    // it sits as UNAVAILABLE and is released by `releasePendingPayouts` as
    // soon as they connect an account.
    if (!item.seller.stripeAccountId || !item.seller.stripePayoutsEnabled) {
      await prisma.orderItem.update({
        where: { id: item.id },
        data: {
          payoutStatus: PayoutStatus.UNAVAILABLE,
          payoutError: 'Seller has not completed Stripe onboarding yet.',
        },
      });
      continue;
    }

    try {
      const transfer = await stripe().transfers.create(
        {
          amount: item.sellerEarningsCents,
          currency: CURRENCY,
          destination: item.seller.stripeAccountId,
          transfer_group: orderId,
          // Draw from the buyer's charge rather than the platform balance, so
          // a payout never fails for lack of settled funds.
          ...(item.order.stripeChargeId
            ? { source_transaction: item.order.stripeChargeId }
            : {}),
          metadata: {
            orderItemId: item.id,
            orderId,
            orderNumber: item.order.orderNumber,
          },
        },
        { idempotencyKey: `payout:${item.id}` }
      );

      await prisma.orderItem.update({
        where: { id: item.id },
        data: {
          payoutStatus: PayoutStatus.PAID,
          stripeTransferId: transfer.id,
          paidOutAt: new Date(),
          payoutError: null,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown transfer error';
      console.error(`[stripe] transfer failed for order item ${item.id}:`, message);

      await prisma.orderItem.update({
        where: { id: item.id },
        data: { payoutStatus: PayoutStatus.FAILED, payoutError: message },
      });
    }
  }
}

/**
 * Retries payouts that were parked because the seller had no Stripe account.
 * Called after a seller finishes onboarding.
 */
export async function releasePendingPayouts(sellerId: string) {
  const stuck = await prisma.orderItem.findMany({
    where: {
      sellerId,
      payoutStatus: { in: [PayoutStatus.UNAVAILABLE, PayoutStatus.FAILED] },
      order: { status: OrderStatus.PAID },
    },
    select: { id: true, orderId: true },
  });

  if (stuck.length === 0) return { released: 0 };

  await prisma.orderItem.updateMany({
    where: { id: { in: stuck.map((i) => i.id) } },
    data: { payoutStatus: PayoutStatus.PENDING, payoutError: null },
  });

  for (const orderId of Array.from(new Set(stuck.map((i) => i.orderId)))) {
    await payOutSellers(orderId);
  }

  return { released: stuck.length };
}

/** Sends the buyer their receipt and each seller a sale notification. Once. */
async function sendOrderEmails(orderId: string) {
  // Claim the send before doing it, so two concurrent webhook deliveries
  // cannot both get past this point.
  const claimed = await prisma.order.updateMany({
    where: { id: orderId, status: OrderStatus.PAID, receiptSentAt: null },
    data: { receiptSentAt: new Date() },
  });

  if (claimed.count === 0) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      buyer: { select: { name: true, email: true } },
      items: { include: { seller: { select: { name: true, email: true } } } },
    },
  });

  if (!order) return;

  try {
    await sendEmail({
      to: order.buyer.email,
      subject: `Your Pluto order ${order.orderNumber}`,
      html: renderReceiptEmail({
        buyerName: order.buyer.name,
        orderNumber: order.orderNumber,
        date: order.paidAt ?? new Date(),
        totalCents: order.totalCents,
        items: order.items.map((i) => ({
          name: i.productName,
          priceCents: i.priceCents,
        })),
      }),
    });

    // Group items by seller so a seller who sold two things gets one email.
    const bySeller = new Map<string, typeof order.items>();
    for (const item of order.items) {
      bySeller.set(item.sellerId, [...(bySeller.get(item.sellerId) ?? []), item]);
    }

    for (const [, items] of bySeller) {
      const seller = items[0].seller;
      await sendEmail({
        to: seller.email,
        subject: 'You made a sale on Pluto',
        html: renderSaleEmail({
          sellerName: seller.name,
          orderNumber: order.orderNumber,
          items: items.map((i) => ({
            name: i.productName,
            earningsCents: i.sellerEarningsCents,
          })),
          payoutBlocked: items.some((i) => i.payoutStatus === PayoutStatus.UNAVAILABLE),
        }),
      });
    }
  } catch (error) {
    // Email failure must not fail the webhook — the order is paid and the
    // buyer can still download from their library.
    console.error(`[email] failed to send order emails for ${orderId}:`, error);
  }
}

/** Marks an order failed when Stripe tells us the payment did not go through. */
export async function markCheckoutFailed(orderId: string) {
  await prisma.order.updateMany({
    where: { id: orderId, status: OrderStatus.PENDING },
    data: { status: OrderStatus.FAILED },
  });
}
