'use client';

import Link from 'next/link';
import { ProductStatus } from '@prisma/client';
import { Check, Download, FileIcon, ShieldCheck, Zap } from 'lucide-react';
import { trpc } from '@/trpc/client';
import MaxWidthWrapper from '@/components/shared/MaxWidthWrapper';
import { ImageGallery } from '@/components/product/ImageGallery';
import { ReviewSection } from '@/components/product/ReviewSection';
import { ProductGrid } from '@/components/product/ProductGrid';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { StarRating } from '@/components/shared/StarRating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ErrorState, PageSpinner } from '@/components/shared/states';
import { categoryAccent, categoryLabel } from '@/config';
import { cn, formatPrice } from '@/lib/utils';

const guarantees = [
  { Icon: Zap, text: 'Instant download after payment' },
  { Icon: ShieldCheck, text: 'Private, expiring download links' },
  { Icon: Check, text: 'Reviewed by a Pluto moderator' },
];

export default function ProductDetail({ slug }: { slug: string }) {
  const { data: product, isLoading, isError, error } = trpc.product.bySlug.useQuery({
    slug,
  });

  const { data: related } = trpc.product.related.useQuery(
    { productId: product?.id ?? '' },
    { enabled: Boolean(product?.id) }
  );

  if (isLoading) return <PageSpinner label='Loading product…' />;

  if (isError || !product) {
    return (
      <MaxWidthWrapper className='py-16'>
        <ErrorState
          title='Product unavailable'
          description={error?.message ?? 'This product could not be loaded.'}
        />
      </MaxWidthWrapper>
    );
  }

  return (
    <MaxWidthWrapper className='py-10'>
      {product.status !== ProductStatus.APPROVED ? (
        <div className='mb-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900'>
          <strong className='font-semibold'>Preview.</strong> This listing is{' '}
          {product.status.toLowerCase()} and is not visible to buyers yet.
        </div>
      ) : null}

      <div className='grid gap-10 lg:grid-cols-2 lg:gap-16'>
        <ImageGallery urls={product.imageUrls} alt={product.name} />

        <div>
          <span
            className={cn(
              'inline-block rounded-full px-3 py-1 text-xs font-semibold ring-1',
              categoryAccent(product.category)
            )}>
            {categoryLabel(product.category)}
          </span>

          <h1 className='mt-4 text-3xl font-bold tracking-tight text-stone-900'>
            {product.name}
          </h1>

          <div className='mt-3 flex flex-wrap items-center gap-x-4 gap-y-2'>
            {product.reviewCount > 0 ? (
              <div className='flex items-center gap-2'>
                <StarRating value={product.averageRating ?? 0} />
                <span className='text-sm text-muted-foreground'>
                  {product.averageRating?.toFixed(1)} ({product.reviewCount})
                </span>
              </div>
            ) : null}
            {product.soldCount > 0 ? (
              <span className='text-sm text-muted-foreground'>
                {product.soldCount} sold
              </span>
            ) : null}
          </div>

          <p className='mt-6 text-3xl font-bold text-stone-900'>
            {formatPrice(product.priceCents)}
          </p>

          <AddToCartButton
            className='mt-6 w-full sm:w-auto'
            productId={product.id}
            productName={product.name}
            owned={product.owned}
          />

          <ul className='mt-7 space-y-2.5'>
            {guarantees.map((item) => (
              <li
                key={item.text}
                className='flex items-center gap-2.5 text-sm text-stone-600'>
                <item.Icon className='h-4 w-4 shrink-0 text-indigo-600' />
                {item.text}
              </li>
            ))}
          </ul>

          <div className='mt-8 border-t border-stone-200 pt-6'>
            <h2 className='text-sm font-semibold text-stone-900'>Description</h2>
            <p className='mt-2 whitespace-pre-line text-sm leading-relaxed text-stone-600'>
              {product.description}
            </p>
          </div>

          {product.fileNames.length > 0 ? (
            <div className='mt-8 border-t border-stone-200 pt-6'>
              <h2 className='text-sm font-semibold text-stone-900'>
                What you get
              </h2>
              <ul className='mt-3 space-y-2'>
                {product.fileNames.map((name) => (
                  <li
                    key={name}
                    className='flex items-center gap-2.5 rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-700'>
                    <FileIcon className='h-4 w-4 shrink-0 text-stone-400' />
                    <span className='truncate'>{name}</span>
                  </li>
                ))}
              </ul>
              <p className='mt-3 flex items-center gap-1.5 text-xs text-muted-foreground'>
                <Download className='h-3 w-3' />
                Files unlock in your library the moment payment is confirmed.
              </p>
            </div>
          ) : null}

          <div className='mt-8 border-t border-stone-200 pt-6'>
            <Link
              href={`/sellers/${product.seller.id}`}
              className='group flex items-center gap-3'>
              <Avatar className='h-11 w-11'>
                {product.seller.image ? (
                  <AvatarImage src={product.seller.image} alt='' />
                ) : null}
                <AvatarFallback>
                  {(product.seller.name ?? '?').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className='text-sm font-semibold text-stone-900 group-hover:underline'>
                  {product.seller.name ?? 'Anonymous seller'}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {product.seller.bio || 'View all products from this seller'}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <ReviewSection productId={product.id} />

      {related && related.length > 0 ? (
        <section className='mt-16 border-t border-stone-200 pt-10'>
          <h2 className='mb-6 text-lg font-bold tracking-tight text-stone-900'>
            More in {categoryLabel(product.category)}
          </h2>
          <ProductGrid products={related} />
        </section>
      ) : null}
    </MaxWidthWrapper>
  );
}
