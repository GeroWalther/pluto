'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn, formatPrice } from '@/lib/utils';
import { PRODUCT_CATEGORIES } from '@/config';
import ImageSlider from './ImageSlider';
import { Skeleton } from '../ui/skeleton';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageKeys: string[];
  imageUrls: string[];
  productFileUrls: string[];
  productFileKeys: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  category: string;
}

interface ProductListingProps {
  product: Product | null;
  index: number;
}

const ProductListing = ({ product, index }: ProductListingProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

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

  const validUrls = product.imageUrls
    .map(({ image }: any) =>
      typeof image === 'string' ? image : image && image.url ? image.url : null
    )
    .filter(Boolean) as string[];

  if (isVisible && product) {
    return (
      <Link
        className={cn('invisible h-full w-full cursor-pointer group/main', {
          'visible animate-in fade-in-5': isVisible,
        })}
        href={`/product/${product.id}`}>
        <div className='flex flex-col w-full'>
          <ImageSlider urls={validUrls} alt={`${product.name}'s image`} />

          <h3 className='mt-4 font-medium text-sm text-stone-700'>
            {product.name}
          </h3>
          <p className='mt-1 text-sm text-stone-500'>{label}</p>
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
