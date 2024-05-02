'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn, formatPrice } from '@/lib/utils';
import { PRODUCT_CATEGORIES } from '@/config';
import ImageSlider from './ImageSlider';
import { Skeleton } from '../ui/skeleton';
import { ProductType } from '../Table/MasterTable';
import { trpc } from '@/trpc/client';

interface ProductListingProps {
  product: ProductType | null;
  index: number;
}

const ProductListing = ({ product, index }: ProductListingProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const { data: sellerInfo } = trpc.admin.getSellerInfo.useQuery({
    id: product?.userId!,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 75);

    return () => clearTimeout(timer);
  }, [index]);

  if (!product || !isVisible) return <ProductPlaceholder />;

  const label = PRODUCT_CATEGORIES.find(
    ({ value }) => value === product.category
  )?.label;

  if (isVisible && product) {
    return (
      <Link
        className={cn('invisible h-full w-full cursor-pointer group/main', {
          'visible animate-in fade-in-5': isVisible,
        })}
        href={`/product/${product.id}`}>
        <div className='flex flex-col w-full'>
          <ImageSlider
            urls={product.imageUrls}
            alt={`${product.name}'s image`}
          />
          <h3 className='mt-4 font-medium text-sm text-stone-700'>
            {product.name}
          </h3>
          {/* <p className='mt-1 text-sm text-stone-500'>{label}</p> */}
          {sellerInfo && (
            <p className='mt-1 text-sm text-stone-500'>
              By{' '}
              <span className=' text-muted-foreground font-semibold'>
                {' '}
                {sellerInfo?.name}
              </span>
            </p>
          )}
          <p className='mt-1 font-medium text-sm text-stone-900'>
            {formatPrice(product.price)}
          </p>
        </div>
      </Link>
    );
  }
};

const ProductPlaceholder = () => {
  return (
    <div className='flex flex-col w-full'>
      <div className='relative bg-stone-100 aspect-square w-full overflow-hidden rounded-xl'>
        <Skeleton className='h-full w-full' />
      </div>
      <Skeleton className='mt-4 w-2/3 h-4 rounded-lg' />
      <Skeleton className='mt-2 w-16 h-4 rounded-lg' />
      <Skeleton className='mt-2 w-12 h-4 rounded-lg' />
    </div>
  );
};

export default ProductListing;
