import { z } from 'zod';
import { OrderStatus, PayoutStatus, ProductStatus } from '@prisma/client';
import { adminProcedure, router } from '../trpc';

export const adminRouter = router({
  products: adminProcedure
    .input(
      z.object({
        status: z.nativeEnum(ProductStatus).default(ProductStatus.PENDING),
      })
    )
    .query(({ ctx, input }) =>
      ctx.prisma.product.findMany({
        where: { status: input.status },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          priceCents: true,
          category: true,
          imageUrls: true,
          fileNames: true,
          status: true,
          rejectionReason: true,
          createdAt: true,
          seller: { select: { id: true, name: true, email: true } },
        },
      })
    ),

  moderate: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum([ProductStatus.APPROVED, ProductStatus.REJECTED]),
        reason: z.string().max(500).optional(),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.product.update({
        where: { id: input.id },
        data: {
          status: input.status,
          rejectionReason:
            input.status === ProductStatus.REJECTED ? (input.reason ?? null) : null,
          reviewedAt: new Date(),
        },
        select: { id: true, status: true },
      })
    ),

  /** Platform-wide numbers for the admin overview. */
  stats: adminProcedure.query(async ({ ctx }) => {
    const [users, pending, approved, orders, revenue, fees, stuckPayouts] =
      await Promise.all([
        ctx.prisma.user.count(),
        ctx.prisma.product.count({ where: { status: ProductStatus.PENDING } }),
        ctx.prisma.product.count({ where: { status: ProductStatus.APPROVED } }),
        ctx.prisma.order.count({ where: { status: OrderStatus.PAID } }),
        ctx.prisma.order.aggregate({
          where: { status: OrderStatus.PAID },
          _sum: { totalCents: true },
        }),
        ctx.prisma.order.aggregate({
          where: { status: OrderStatus.PAID },
          _sum: { platformFeeCents: true },
        }),
        ctx.prisma.orderItem.count({
          where: {
            payoutStatus: { in: [PayoutStatus.FAILED, PayoutStatus.UNAVAILABLE] },
            order: { status: OrderStatus.PAID },
          },
        }),
      ]);

    return {
      users,
      pendingProducts: pending,
      approvedProducts: approved,
      paidOrders: orders,
      grossRevenueCents: revenue._sum.totalCents ?? 0,
      commissionCents: fees._sum.platformFeeCents ?? 0,
      stuckPayouts,
    };
  }),

  orders: adminProcedure.query(({ ctx }) =>
    ctx.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalCents: true,
        platformFeeCents: true,
        createdAt: true,
        paidAt: true,
        buyer: { select: { name: true, email: true } },
        items: {
          select: {
            productName: true,
            sellerEarningsCents: true,
            payoutStatus: true,
            payoutError: true,
            seller: { select: { name: true, email: true } },
          },
        },
      },
    })
  ),
});
