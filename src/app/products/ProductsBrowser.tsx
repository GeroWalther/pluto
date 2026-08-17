'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductCategory } from '@prisma/client';
import { SlidersHorizontal } from 'lucide-react';
import { trpc } from '@/trpc/client';
import { ProductGrid } from '@/components/product/ProductGrid';
import {
  ActiveFilterChips,
  DEFAULT_FILTERS,
  ProductFilters,
  type FilterState,
} from '@/components/product/ProductFilters';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ErrorState, Spinner } from '@/components/shared/states';
import { parsePriceToCents } from '@/lib/utils';
import { SORT_OPTIONS } from '@/config';

function isCategory(value: string | null): value is ProductCategory {
  return Boolean(value && value in ProductCategory);
}

export default function ProductsBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // The URL is the source of truth so filtered views are shareable and the
  // back button behaves.
  const [filters, setFilters] = useState<FilterState>(() => {
    const sort = searchParams.get('sort');
    return {
      q: searchParams.get('q') ?? '',
      category: isCategory(searchParams.get('category'))
        ? (searchParams.get('category') as ProductCategory)
        : 'all',
      sort: SORT_OPTIONS.some((o) => o.value === sort)
        ? (sort as FilterState['sort'])
        : 'newest',
      minEuros: searchParams.get('min') ?? '',
      maxEuros: searchParams.get('max') ?? '',
    };
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.category !== 'all') params.set('category', filters.category);
    if (filters.sort !== 'newest') params.set('sort', filters.sort);
    if (filters.minEuros) params.set('min', filters.minEuros);
    if (filters.maxEuros) params.set('max', filters.maxEuros);

    const query = params.toString();
    router.replace(query ? `/products?${query}` : '/products', { scroll: false });
  }, [filters, router]);

  const queryInput = useMemo(() => {
    const min = filters.minEuros ? parsePriceToCents(filters.minEuros) : null;
    const max = filters.maxEuros ? parsePriceToCents(filters.maxEuros) : null;

    return {
      q: filters.q || undefined,
      category: filters.category === 'all' ? undefined : filters.category,
      sort: filters.sort,
      limit: 12,
      minCents: min ?? undefined,
      maxCents: max ?? undefined,
    };
  }, [filters]);

  const { data, isLoading, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.product.list.useInfiniteQuery(queryInput, {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

  const products = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );

  const filterPanel = (
    <ProductFilters
      value={filters}
      onChange={setFilters}
      resultCount={isLoading ? undefined : products.length}
    />
  );

  return (
    <>
      <div className='mb-8 border-b border-stone-200 pb-6'>
        <h1 className='text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl'>
          {filters.q ? `Results for “${filters.q}”` : 'All digital products'}
        </h1>
        <p className='mt-1.5 text-sm text-muted-foreground'>
          Every listing is reviewed before it goes live.
        </p>
      </div>

      <div className='lg:grid lg:grid-cols-[220px_1fr] lg:gap-10'>
        <div className='hidden lg:block'>{filterPanel}</div>

        <div>
          <div className='mb-5 flex items-center justify-between lg:hidden'>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant='outline' size='sm'>
                  <SlidersHorizontal className='mr-2 h-4 w-4' />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side='left' className='w-[300px] overflow-y-auto'>
                <div className='pt-6'>{filterPanel}</div>
              </SheetContent>
            </Sheet>
          </div>

          <ActiveFilterChips value={filters} onChange={setFilters} />

          {isError ? (
            <ErrorState description={error.message} onRetry={() => refetch()} />
          ) : (
            <>
              <ProductGrid
                products={products}
                loading={isLoading}
                skeletonCount={12}
                emptyTitle='No products match those filters'
                emptyDescription='Try widening your price range or picking another category.'
              />

              {hasNextPage ? (
                <div className='mt-10 flex justify-center'>
                  <Button
                    variant='outline'
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}>
                    {isFetchingNextPage ? (
                      <>
                        <Spinner className='mr-2' /> Loading…
                      </>
                    ) : (
                      'Load more'
                    )}
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </>
  );
}
