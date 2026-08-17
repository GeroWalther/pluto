/**
 * Exercises the order fulfilment path end-to-end against the real database,
 * without touching the Stripe API (the fake session carries no payment_intent,
 * so no network call is made).
 *
 *   npm run verify
 */
import { OrderStatus, PayoutStatus, PrismaClient } from '@prisma/client';
import { fulfillCheckoutSession } from '@/server/services/fulfillment';
import { splitFee } from '@/lib/stripe';
import { createDownloadToken, verifyDownloadToken } from '@/lib/download-token';
import { randomToken } from '@/lib/utils';

const prisma = new PrismaClient();
let failures = 0;

function check(label: string, condition: boolean, detail = '') {
  console.log(`${condition ? '  ✔' : '  ✘'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!condition) failures += 1;
}

async function main() {
  console.log('\n[1] fee split arithmetic');
  for (const price of [100, 999, 2400, 3401, 8900, 1]) {
    const { platformFeeCents, sellerEarningsCents } = splitFee(price);
    check(
      `${price}c splits without losing a cent`,
      platformFeeCents + sellerEarningsCents === price,
      `fee=${platformFeeCents} seller=${sellerEarningsCents}`
    );
  }

  console.log('\n[2] download tokens');
  const good = createDownloadToken('item_abc', 2);
  const claim = verifyDownloadToken(good);
  check('valid token round-trips', claim?.orderItemId === 'item_abc' && claim.fileIndex === 2);
  check('tampered payload is rejected', verifyDownloadToken(good.replace('item_abc', 'item_xyz')) === null);
  check('truncated token is rejected', verifyDownloadToken('a.b.c') === null);
  check(
    'expired token is rejected',
    verifyDownloadToken(`item_abc.0.${Date.now() - 1000}.sig`) === null
  );

  console.log('\n[3] fulfilment of a two-seller order');
  const buyer = await prisma.user.findUniqueOrThrow({ where: { email: 'buyer@pluto.test' } });
  const products = await prisma.product.findMany({
    where: { status: 'APPROVED' },
    distinct: ['sellerId'],
    take: 2,
  });
  check('two products from different sellers', products.length === 2);

  const subtotal = products.reduce((s, p) => s + p.priceCents, 0);
  const fees = products.reduce((s, p) => s + splitFee(p.priceCents).platformFeeCents, 0);
  const orderNumber = randomToken(12);
  const soldBefore = products.map((p) => p.soldCount);

  const order = await prisma.order.create({
    data: {
      orderNumber,
      buyerId: buyer.id,
      status: OrderStatus.PENDING,
      subtotalCents: subtotal,
      platformFeeCents: fees,
      totalCents: subtotal,
      items: {
        create: products.map((p) => {
          const split = splitFee(p.priceCents);
          return {
            productId: p.id,
            sellerId: p.sellerId,
            productName: p.name,
            priceCents: p.priceCents,
            fileUrls: p.fileUrls,
            fileKeys: p.fileKeys,
            fileNames: p.fileNames,
            platformFeeCents: split.platformFeeCents,
            sellerEarningsCents: split.sellerEarningsCents,
          };
        }),
      },
    },
  });

  const fakeSession = {
    id: `cs_test_${orderNumber}`,
    payment_status: 'paid',
    payment_intent: null,
    metadata: { orderId: order.id, orderNumber },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  await fulfillCheckoutSession(fakeSession);

  const paid = await prisma.order.findUniqueOrThrow({
    where: { id: order.id },
    include: { items: true },
  });

  check('order transitioned to PAID', paid.status === OrderStatus.PAID);
  check('paidAt was stamped', paid.paidAt !== null);
  check('receipt send was recorded', paid.receiptSentAt !== null);
  check(
    'earnings + fees equal the total charged',
    paid.items.reduce((s, i) => s + i.sellerEarningsCents + i.platformFeeCents, 0) ===
      paid.totalCents
  );
  check(
    'payouts parked as UNAVAILABLE (sellers have no Stripe account)',
    paid.items.every((i) => i.payoutStatus === PayoutStatus.UNAVAILABLE)
  );

  const afterFirst = await prisma.product.findMany({
    where: { id: { in: products.map((p) => p.id) } },
    orderBy: { id: 'asc' },
  });
  const expectedSold = products
    .map((p, i) => ({ id: p.id, expected: soldBefore[i] + 1 }))
    .sort((a, b) => a.id.localeCompare(b.id));
  check(
    'soldCount incremented once per product',
    afterFirst.every((p, i) => p.soldCount === expectedSold[i].expected)
  );

  console.log('\n[4] webhook replay is a no-op');
  await fulfillCheckoutSession(fakeSession);
  await fulfillCheckoutSession(fakeSession);

  const afterReplay = await prisma.product.findMany({
    where: { id: { in: products.map((p) => p.id) } },
    orderBy: { id: 'asc' },
  });
  check(
    'soldCount did NOT increment again after two replays',
    afterReplay.every((p, i) => p.soldCount === expectedSold[i].expected),
    afterReplay.map((p) => p.soldCount).join(',')
  );

  const replayed = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
  check('receiptSentAt unchanged by replay', replayed.receiptSentAt?.getTime() === paid.receiptSentAt?.getTime());

  console.log('\n[5] buyer library reflects the purchase');
  const owned = await prisma.orderItem.findMany({
    where: { order: { buyerId: buyer.id, status: OrderStatus.PAID }, orderId: order.id },
  });
  check('both items are in the library', owned.length === 2);
  check('file snapshots were captured', owned.every((i) => i.fileUrls.length > 0));

  // Leave the database as we found it.
  await prisma.order.delete({ where: { id: order.id } });
  await prisma.product.updateMany({
    where: { id: { in: products.map((p) => p.id) } },
    data: { soldCount: { decrement: 1 } },
  });
  console.log('\n  (cleaned up test order)');

  console.log(
    failures === 0 ? '\nAll checks passed.\n' : `\n${failures} CHECK(S) FAILED.\n`
  );
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
