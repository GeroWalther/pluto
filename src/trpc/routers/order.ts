import { z } from 'zod';
import { OrderStatus, ProductStatus } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { privateProcedure, publicProcedure, router } from '../trpc';
import { createCheckoutSession } from '@/server/services/checkout';
import { createDownloadToken } from '@/lib/download-token';
import { SERVER_URL } from '@/lib/env';

const downloadLink = (orderItemId: string, index: number) =>
  `${SERVER_URL}/api/download?token=${createDownloadToken(orderItemId, index)}`;

export const orderRouter = router({
  /** Prices the cart server-side. The client's idea of the total is ignored. */
  preview: publicProcedure
    .input(z.object({ productIds: z.array(z.string()).max(50) }))
    .query(async ({ ctx, input }) => {
      const ids = Array.from(new Set(input.productIds));
      if (ids.length === 0) return { items: [], subtotalCents: 0 };

      const items = await ctx.prisma.product.findMany({
        where: { id: { in: ids }, status: ProductStatus.APPROVED },
        select: {
          id: true,
          slug: true,
          name: true,
          priceCents: true,
          imageUrls: true,
          category: true,
          sellerId: true,
          seller: { select: { name: true } },
        },
      });

      return {
        items,
        subtotalCents: items.reduce((sum, i) => sum + i.priceCents, 0),
        // Anything the client had in its cart that no longer exists.
        unavailableIds: ids.filter((id) => !items.some((i) => i.id === id)),
      };
    }),

  createCheckoutSession: privateProcedure
    .input(z.object({ productIds: z.array(z.string()).min(1).max(50) }))
    .mutation(({ ctx, input }) =>
      createCheckoutSession({ productIds: input.productIds, buyerId: ctx.user.id })
    ),

  /**
   * Order status for the thank-you page. Returns PENDING while the webhook is
   * still in flight; the page polls until it flips to PAID.
   */
  status: privateProcedure
    .input(z.object({ orderNumber: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findFirst({
        where: { orderNumber: input.orderNumber, buyerId: ctx.user.id },
        select: {
          orderNumber: true,
          status: true,
          totalCents: true,
          currency: true,
          paidAt: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              productName: true,
              priceCents: true,
              fileNames: true,
              product: { select: { slug: true, imageUrls: true } },
            },
          },
        },
      });

      if (!order) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found.' });
      }

      const paid = order.status === OrderStatus.PAID;

      return {
        ...order,
        items: order.items.map((item) => ({
          ...item,
          // Download links only exist once the money has actually arrived.
          downloads: paid
            ? item.fileNames.map((name, index) => ({
                name,
                url: downloadLink(item.id, index),
              }))
            : [],
        })),
      };
    }),

  /** Everything this user has ever bought, with fresh download links. */
  library: privateProcedure.query(async ({ ctx }) => {
    const items = await ctx.prisma.orderItem.findMany({
      where: { order: { buyerId: ctx.user.id, status: OrderStatus.PAID } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        productId: true,
        productName: true,
        priceCents: true,
        fileNames: true,
        createdAt: true,
        product: { select: { slug: true, imageUrls: true, category: true } },
        order: { select: { orderNumber: true, paidAt: true } },
        seller: { select: { id: true, name: true } },
      },
    });

    return items.map((item) => ({
      ...item,
      downloads: item.fileNames.map((name, index) => ({
        name,
        url: downloadLink(item.id, index),
      })),
    }));
  }),

  history: privateProcedure.query(({ ctx }) =>
    ctx.prisma.order.findMany({
      where: { buyerId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalCents: true,
        createdAt: true,
        paidAt: true,
        _count: { select: { items: true } },
      },
    })
  ),
});
