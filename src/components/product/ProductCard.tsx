'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ProductCategory } from '@prisma/client';
import { ImageIcon } from 'lucide-react';
import { categoryAccent, categoryLabel } from '@/config';
import { cn, formatPrice } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  category: ProductCategory;
  imageUrls: string[];
  soldCount: number;
  seller: { id: string; name: string | null; image?: string | null };
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const cover = product.imageUrls[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className='group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white transition-all hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'>
      <div className='relative aspect-[4/3] w-full overflow-hidden bg-stone-100'>
        {cover ? (
          <Image
            src={cover}
            alt={product.name}
            fill
            sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
            className='object-cover transition-transform duration-300 group-hover:scale-105'
          />
        ) : (
          <div className='flex h-full items-center justify-center'>
            <ImageIcon className='h-8 w-8 text-stone-300' />
          </div>
        )}

        <span
          className={cn(
            'absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1',
            categoryAccent(product.category)
          )}>
          {categoryLabel(product.category)}
        </span>
      </div>

      <div className='flex flex-1 flex-col gap-1 p-4'>
        <h3 className='line-clamp-1 text-sm font-semibold text-stone-900'>
          {product.name}
        </h3>
        <p className='line-clamp-1 text-xs text-muted-foreground'>
          by {product.seller.name ?? 'Anonymous'}
        </p>

        <div className='mt-3 flex items-baseline justify-between'>
          <span className='text-base font-bold text-stone-900'>
            {formatPrice(product.priceCents)}
          </span>
          {product.soldCount > 0 ? (
            <span className='text-xs text-muted-foreground'>
              {product.soldCount} sold
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className='overflow-hidden rounded-xl border border-stone-200 bg-white'>
      <Skeleton className='aspect-[4/3] w-full rounded-none' />
      <div className='space-y-2 p-4'>
        <Skeleton className='h-4 w-3/4' />
        <Skeleton className='h-3 w-1/3' />
        <Skeleton className='mt-3 h-5 w-16' />
      </div>
    </div>
  );
}
