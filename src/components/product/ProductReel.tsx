'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ProductCategory } from '@prisma/client';
import { trpc } from '@/trpc/client';
import { ProductGrid } from './ProductGrid';
import type { ProductSort } from '@/lib/validators';

export function ProductReel({
  title,
  subtitle,
  href,
  sort = 'newest',
  category,
  limit = 4,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  sort?: ProductSort;
  category?: ProductCategory;
  limit?: number;
}) {
  const { data, isLoading } = trpc.product.list.useQuery({ sort, limit, category });

  return (
    <section>
      <div className='mb-6 flex items-end justify-between gap-4'>
        <div>
          <h2 className='text-xl font-bold tracking-tight text-stone-900 sm:text-2xl'>
            {title}
          </h2>
          {subtitle ? (
            <p className='mt-1 text-sm text-muted-foreground'>{subtitle}</p>
          ) : null}
        </div>

        {href ? (
          <Link
            href={href}
            className='group hidden shrink-0 items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 sm:flex'>
            View all
            <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
          </Link>
        ) : null}
      </div>

      <ProductGrid
        products={data?.items}
        loading={isLoading}
        skeletonCount={limit}
        emptyTitle='Nothing here yet'
        emptyDescription='Once sellers publish products they will show up here.'
      />
    </section>
  );
}
