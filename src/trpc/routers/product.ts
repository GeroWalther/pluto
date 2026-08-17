import { z } from 'zod';
import { Prisma, ProductStatus } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { publicProcedure, router } from '../trpc';
import { productQuerySchema } from '@/lib/validators';

/**
 * Everything the catalogue exposes. Note that `fileUrls`/`fileKeys` are never
 * selected here — the deliverable is only ever reachable through
 * /api/download after a purchase.
 */
const productCard = {
  id: true,
  slug: true,
  name: true,
  priceCents: true,
  category: true,
  imageUrls: true,
  soldCount: true,
  createdAt: true,
  seller: { select: { id: true, name: true, image: true } },
} satisfies Prisma.ProductSelect;

function orderBy(sort: string): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case 'price-asc':
      return [{ priceCents: 'asc' }, { id: 'asc' }];
    case 'price-desc':
      return [{ priceCents: 'desc' }, { id: 'asc' }];
    case 'popular':
      return [{ soldCount: 'desc' }, { id: 'asc' }];
    default:
      return [{ createdAt: 'desc' }, { id: 'asc' }];
  }
}

export const productRouter = router({
  /** Cursor-paginated, filterable catalogue feed. */
  list: publicProcedure.input(productQuerySchema).query(async ({ ctx, input }) => {
    const { q, category, sellerId, minCents, maxCents, sort, limit, cursor } = input;

    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.APPROVED,
      ...(category ? { category } : {}),
      ...(sellerId ? { sellerId } : {}),
      ...(minCents !== undefined || maxCents !== undefined
        ? {
            priceCents: {
              ...(minCents !== undefined ? { gte: minCents } : {}),
              ...(maxCents !== undefined ? { lte: maxCents } : {}),
            },
          }
        : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    // Fetch one extra row to find out whether another page exists.
    const rows = await ctx.prisma.product.findMany({
      where,
      select: productCard,
      orderBy: orderBy(sort),
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;

    return {
      items,
      nextCursor: hasMore ? items[items.length - 1].id : null,
    };
  }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.findUnique({
        where: { slug: input.slug },
        select: {
          ...productCard,
          description: true,
          fileNames: true,
          status: true,
          sellerId: true,
          seller: { select: { id: true, name: true, image: true, bio: true } },
          _count: { select: { reviews: true } },
        },
      });

      // A pending or rejected listing stays visible to its owner and to
      // admins so they can preview or moderate it.
      const viewerMaySee =
        product?.status === ProductStatus.APPROVED ||
        (product && ctx.user?.id === product.sellerId) ||
        (product && ctx.user?.role === 'ADMIN');

      if (!product || !viewerMaySee) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found.' });
      }

      const ratings = await ctx.prisma.review.aggregate({
        where: { productId: product.id },
        _avg: { rating: true },
        _count: true,
      });

      // Used by the UI to show "You own this" instead of an add-to-cart button.
      const owned = ctx.user
        ? Boolean(
            await ctx.prisma.orderItem.findFirst({
              where: {
                productId: product.id,
                order: { buyerId: ctx.user.id, status: 'PAID' },
              },
              select: { id: true },
            })
          )
        : false;

      return {
        ...product,
        owned,
        averageRating: ratings._avg.rating,
        reviewCount: ratings._count,
      };
    }),

  /** More from the same category, for the product page. */
  related: publicProcedure
    .input(z.object({ productId: z.string(), limit: z.number().min(1).max(8).default(4) }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.findUnique({
        where: { id: input.productId },
        select: { category: true },
      });

      if (!product) return [];

      return ctx.prisma.product.findMany({
        where: {
          status: ProductStatus.APPROVED,
          category: product.category,
          id: { not: input.productId },
        },
        select: productCard,
        orderBy: { soldCount: 'desc' },
        take: input.limit,
      });
    }),

  /** Public seller profile — the storefront for one person. */
  seller: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const seller = await ctx.prisma.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          image: true,
          bio: true,
          createdAt: true,
          _count: { select: { products: { where: { status: ProductStatus.APPROVED } } } },
        },
      });

      if (!seller) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Seller not found.' });
      }

      const sales = await ctx.prisma.product.aggregate({
        where: { sellerId: seller.id, status: ProductStatus.APPROVED },
        _sum: { soldCount: true },
      });

      return {
        ...seller,
        productCount: seller._count.products,
        totalSales: sales._sum.soldCount ?? 0,
      };
    }),

  /** Homepage counters. Cheap enough to compute per request. */
  stats: publicProcedure.query(async ({ ctx }) => {
    const [products, sellers, sales] = await Promise.all([
      ctx.prisma.product.count({ where: { status: ProductStatus.APPROVED } }),
      ctx.prisma.user.count({ where: { products: { some: { status: ProductStatus.APPROVED } } } }),
      ctx.prisma.product.aggregate({ _sum: { soldCount: true } }),
    ]);

    return { products, sellers, sales: sales._sum.soldCount ?? 0 };
  }),
});
