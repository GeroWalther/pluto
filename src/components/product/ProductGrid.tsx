'use client';

import { PackageOpen } from 'lucide-react';
import { ProductCard, ProductCardSkeleton, type ProductCardData } from './ProductCard';
import { EmptyState } from '@/components/shared/states';

export function ProductGrid({
  products,
  loading,
  skeletonCount = 8,
  emptyTitle = 'No products found',
  emptyDescription = 'Try a different category or search term.',
}: {
  products?: ProductCardData[];
  loading?: boolean;
  skeletonCount?: number;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (loading) {
    return (
      <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {Array.from({ length: skeletonCount }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={PackageOpen}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
