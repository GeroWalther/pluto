'use client';

import { trpc } from '@/trpc/client';
import MaxWidthWrapper from '@/components/shared/MaxWidthWrapper';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ErrorState, PageSpinner } from '@/components/shared/states';
import { formatDate } from '@/lib/utils';

export default function SellerProfile({ id }: { id: string }) {
  const { data: seller, isLoading, isError, error } = trpc.product.seller.useQuery({ id });
  const { data: products, isLoading: productsLoading } = trpc.product.list.useQuery({
    sellerId: id,
    sort: 'newest',
    limit: 24,
  });

  if (isLoading) return <PageSpinner />;

  if (isError || !seller) {
    return (
      <MaxWidthWrapper className='py-16'>
        <ErrorState title='Seller not found' description={error?.message} />
      </MaxWidthWrapper>
    );
  }

  return (
    <MaxWidthWrapper className='py-10'>
      <div className='flex flex-col items-start gap-5 border-b border-stone-200 pb-8 sm:flex-row sm:items-center'>
        <Avatar className='h-20 w-20'>
          {seller.image ? <AvatarImage src={seller.image} alt='' /> : null}
          <AvatarFallback className='text-xl'>
            {(seller.name ?? '?').slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div>
          <h1 className='text-2xl font-bold tracking-tight text-stone-900'>
            {seller.name ?? 'Anonymous seller'}
          </h1>
          {seller.bio ? (
            <p className='mt-2 max-w-xl text-sm text-stone-600'>{seller.bio}</p>
          ) : null}
          <p className='mt-2 text-xs text-muted-foreground'>
            {seller.productCount} {seller.productCount === 1 ? 'product' : 'products'} ·{' '}
            {seller.totalSales} sold · joined {formatDate(seller.createdAt)}
          </p>
        </div>
      </div>

      <div className='mt-8'>
        <ProductGrid
          products={products?.items}
          loading={productsLoading}
          emptyTitle='No live products'
          emptyDescription='This seller has not published anything yet.'
        />
      </div>
    </MaxWidthWrapper>
  );
}
