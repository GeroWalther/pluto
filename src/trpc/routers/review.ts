import { z } from 'zod';
import { OrderStatus } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { privateProcedure, publicProcedure, router } from '../trpc';
import { reviewInputSchema } from '@/lib/validators';

export const reviewRouter = router({
  forProduct: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.prisma.review.findMany({
        where: { productId: input.productId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          author: { select: { id: true, name: true, image: true } },
        },
      })
    ),

  /** Whether the signed-in user may review, and what they said last time. */
  mine: privateProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [purchased, existing] = await Promise.all([
        ctx.prisma.orderItem.findFirst({
          where: {
            productId: input.productId,
            order: { buyerId: ctx.user.id, status: OrderStatus.PAID },
          },
          select: { id: true },
        }),
        ctx.prisma.review.findUnique({
          where: {
            productId_authorId: { productId: input.productId, authorId: ctx.user.id },
          },
          select: { id: true, rating: true, comment: true },
        }),
      ]);

      return { canReview: Boolean(purchased), review: existing };
    }),

  /** Verified-purchase reviews only — you must own the product to rate it. */
  upsert: privateProcedure
    .input(reviewInputSchema)
    .mutation(async ({ ctx, input }) => {
      const purchased = await ctx.prisma.orderItem.findFirst({
        where: {
          productId: input.productId,
          order: { buyerId: ctx.user.id, status: OrderStatus.PAID },
        },
        select: { id: true },
      });

      if (!purchased) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only buyers can review a product.',
        });
      }

      return ctx.prisma.review.upsert({
        where: {
          productId_authorId: { productId: input.productId, authorId: ctx.user.id },
        },
        create: {
          productId: input.productId,
          authorId: ctx.user.id,
          rating: input.rating,
          comment: input.comment || null,
        },
        update: { rating: input.rating, comment: input.comment || null },
        select: { id: true, rating: true, comment: true },
      });
    }),

  delete: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const review = await ctx.prisma.review.findUnique({
        where: { id: input.id },
        select: { authorId: true },
      });

      if (!review || review.authorId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'That is not your review.' });
      }

      await ctx.prisma.review.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
