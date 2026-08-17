import 'server-only';
import { TRPCError } from '@trpc/server';
import { OrderStatus, ProductStatus } from '@prisma/client';
import prisma from '@/db/db';
import { CURRENCY, splitFee, stripe } from '@/lib/stripe';
import { SERVER_URL } from '@/lib/env';
import { randomToken } from '@/lib/utils';

/**
 * Creates a PENDING order and a Stripe Checkout session for it.
 *
 * Nothing is fulfilled here. The order only becomes PAID when Stripe calls
 * our webhook back — see `fulfillCheckoutSession`. That is the whole point:
 * the browser never gets to decide whether money changed hands.
 */
export async function createCheckoutSession({
  productIds,
  buyerId,
}: {
  productIds: string[];
  buyerId: string;
}) {
  const uniqueIds = Array.from(new Set(productIds));

  if (uniqueIds.length === 0) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Your cart is empty.' });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: uniqueIds }, status: ProductStatus.APPROVED },
    include: { seller: { select: { id: true, stripeAccountId: true } } },
  });

  if (products.length !== uniqueIds.length) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message:
        'Some items in your cart are no longer available. Please refresh your cart.',
    });
  }

  const ownItem = products.find((p) => p.sellerId === buyerId);
  if (ownItem) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `You cannot buy your own product ("${ownItem.name}").`,
    });
  }

  // Buying the same thing twice would just re-deliver the same files.
  const alreadyOwned = await prisma.orderItem.findFirst({
    where: {
      productId: { in: uniqueIds },
      order: { buyerId, status: OrderStatus.PAID },
    },
    select: { productName: true },
  });

  if (alreadyOwned) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `You already own "${alreadyOwned.productName}". It is in your library.`,
    });
  }

  const subtotalCents = products.reduce((sum, p) => sum + p.priceCents, 0);
  const platformFeeCents = products.reduce(
    (sum, p) => sum + splitFee(p.priceCents).platformFeeCents,
    0
  );

  const orderNumber = randomToken(12);

  // The buyer pays the listed price. The 5% commission is taken out of the
  // seller's share on payout — it is not added on top at checkout.
  const order = await prisma.order.create({
    data: {
      orderNumber,
      buyerId,
      status: OrderStatus.PENDING,
      currency: CURRENCY,
      subtotalCents,
      platformFeeCents,
      totalCents: subtotalCents,
      items: {
        create: products.map((product) => {
          const { platformFeeCents: fee, sellerEarningsCents } = splitFee(
            product.priceCents
          );
          return {
            productId: product.id,
            sellerId: product.sellerId,
            productName: product.name,
            priceCents: product.priceCents,
            fileUrls: product.fileUrls,
            fileKeys: product.fileKeys,
            fileNames: product.fileNames,
            platformFeeCents: fee,
            sellerEarningsCents,
          };
        }),
      },
    },
  });

  const session = await stripe().checkout.sessions.create(
    {
      mode: 'payment',
      // Restricting to card keeps the flow working with any Stripe test
      // account; other methods need per-account activation.
      payment_method_types: ['card'],
      customer_email: undefined,
      line_items: products.map((product) => ({
        quantity: 1,
        price_data: {
          currency: CURRENCY,
          unit_amount: product.priceCents,
          product_data: {
            name: product.name,
            images: product.imageUrls.slice(0, 1),
          },
        },
      })),
      // Charges land on the platform account first; each seller is paid by a
      // separate transfer once the payment succeeds (separate charges and
      // transfers), which is what lets one cart span multiple sellers.
      payment_intent_data: {
        metadata: { orderId: order.id, orderNumber },
      },
      metadata: { orderId: order.id, orderNumber },
      success_url: `${SERVER_URL}/thank-you/${orderNumber}`,
      cancel_url: `${SERVER_URL}/cart?canceled=1`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    },
    // Retrying this call with the same order never creates a second session.
    { idempotencyKey: `checkout:${order.id}` }
  );

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeCheckoutSessionId: session.id },
  });

  if (!session.url) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Stripe did not return a checkout URL. Please try again.',
    });
  }

  return { url: session.url, orderNumber };
}
