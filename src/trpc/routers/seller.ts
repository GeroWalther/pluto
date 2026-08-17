import { z } from 'zod';
import { OrderStatus, PayoutStatus, ProductStatus } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { UTApi } from 'uploadthing/server';
import { privateProcedure, router } from '../trpc';
import { productInputSchema } from '@/lib/validators';
import { slugify, randomToken } from '@/lib/utils';

const utapi = new UTApi();

/** Best-effort storage cleanup — a stale blob must never fail a user action. */
async function deleteFiles(keys: string[]) {
  if (keys.length === 0) return;
  try {
    await utapi.deleteFiles(keys);
  } catch (error) {
    console.error('[uploadthing] failed to delete files', keys, error);
  }
}

export const sellerRouter = router({
  myProducts: privateProcedure.query(({ ctx }) =>
    ctx.prisma.product.findMany({
      where: { sellerId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        name: true,
        priceCents: true,
        category: true,
        status: true,
        rejectionReason: true,
        imageUrls: true,
        soldCount: true,
        createdAt: true,
      },
    })
  ),

  /** A single one of the caller's own products, for the edit form. */
  product: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          priceCents: true,
          category: true,
          status: true,
          rejectionReason: true,
          imageUrls: true,
          fileNames: true,
          soldCount: true,
          sellerId: true,
        },
      });

      if (!product || product.sellerId !== ctx.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found.' });
      }

      return product;
    }),

  create: privateProcedure
    .input(productInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Slugs are user-visible, so keep them readable but guarantee uniqueness.
      const slug = `${slugify(input.name)}-${randomToken(6)}`;

      return ctx.prisma.product.create({
        data: {
          slug,
          name: input.name,
          description: input.description,
          priceCents: input.priceCents,
          category: input.category,
          imageUrls: input.images.map((f) => f.url),
          imageKeys: input.images.map((f) => f.key),
          fileUrls: input.files.map((f) => f.url),
          fileKeys: input.files.map((f) => f.key),
          fileNames: input.files.map((f) => f.name),
          sellerId: ctx.user.id,
          status: ProductStatus.PENDING,
        },
        select: { id: true, slug: true, name: true, status: true },
      });
    }),

  update: privateProcedure
    .input(
      z.object({
        id: z.string(),
        // Files are immutable after creation — buyers hold a snapshot of them.
        data: productInputSchema.pick({
          name: true,
          description: true,
          priceCents: true,
          category: true,
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.product.findUnique({
        where: { id: input.id },
        select: { sellerId: true },
      });

      if (!existing || existing.sellerId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'That is not your product.' });
      }

      // Any edit goes back through moderation.
      return ctx.prisma.product.update({
        where: { id: input.id },
        data: {
          ...input.data,
          status: ProductStatus.PENDING,
          rejectionReason: null,
          reviewedAt: null,
        },
        select: { id: true, status: true },
      });
    }),

  delete: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.findUnique({
        where: { id: input.id },
        select: {
          sellerId: true,
          imageKeys: true,
          fileKeys: true,
          _count: { select: { orderItems: true } },
        },
      });

      if (!product || product.sellerId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'That is not your product.' });
      }

      // Buyers keep their own snapshot of the files, so a sold product can be
      // delisted — but its blobs must stay put.
      const hasSales = product._count.orderItems > 0;

      await ctx.prisma.product.delete({ where: { id: input.id } });

      if (!hasSales) {
        await deleteFiles([...product.imageKeys, ...product.fileKeys]);
      }

      return { success: true, filesRemoved: !hasSales };
    }),

  /** Discards blobs from an upload the seller abandoned before submitting. */
  discardUploads: privateProcedure
    .input(z.object({ keys: z.array(z.string()).max(20) }))
    .mutation(async ({ input }) => {
      await deleteFiles(input.keys);
      return { success: true };
    }),

  sales: privateProcedure.query(({ ctx }) =>
    ctx.prisma.orderItem.findMany({
      where: { sellerId: ctx.user.id, order: { status: OrderStatus.PAID } },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        productName: true,
        priceCents: true,
        platformFeeCents: true,
        sellerEarningsCents: true,
        payoutStatus: true,
        payoutError: true,
        paidOutAt: true,
        createdAt: true,
        order: { select: { orderNumber: true } },
      },
    })
  ),

  /** Headline numbers plus a 30-day revenue series for the dashboard chart. */
  stats: privateProcedure.query(async ({ ctx }) => {
    const items = await ctx.prisma.orderItem.findMany({
      where: { sellerId: ctx.user.id, order: { status: OrderStatus.PAID } },
      select: {
        sellerEarningsCents: true,
        payoutStatus: true,
        createdAt: true,
      },
    });

    const paidOutCents = items
      .filter((i) => i.payoutStatus === PayoutStatus.PAID)
      .reduce((sum, i) => sum + i.sellerEarningsCents, 0);

    const pendingCents = items
      .filter((i) => i.payoutStatus !== PayoutStatus.PAID)
      .reduce((sum, i) => sum + i.sellerEarningsCents, 0);

    const since = new Date();
    since.setDate(since.getDate() - 29);
    since.setHours(0, 0, 0, 0);

    const byDay = new Map<string, number>();
    for (let d = new Date(since); d <= new Date(); d.setDate(d.getDate() + 1)) {
      byDay.set(d.toISOString().slice(0, 10), 0);
    }
    for (const item of items) {
      const key = item.createdAt.toISOString().slice(0, 10);
      if (byDay.has(key)) {
        byDay.set(key, (byDay.get(key) ?? 0) + item.sellerEarningsCents);
      }
    }

    const [listed, approved] = await Promise.all([
      ctx.prisma.product.count({ where: { sellerId: ctx.user.id } }),
      ctx.prisma.product.count({
        where: { sellerId: ctx.user.id, status: ProductStatus.APPROVED },
      }),
    ]);

    return {
      salesCount: items.length,
      grossCents: items.reduce((s, i) => s + i.sellerEarningsCents, 0),
      paidOutCents,
      pendingCents,
      listedProducts: listed,
      approvedProducts: approved,
      revenueSeries: Array.from(byDay, ([date, cents]) => ({ date, cents })),
    };
  }),
});
