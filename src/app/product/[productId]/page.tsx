import AddToCartButton from '@/components/comp/AddToCartButton';
import ImageSlider from '@/components/comp/ImageSlider';
import MaxWidthWrapper from '@/components/comp/MaxWidthWrapper';
import ProductReel from '@/components/comp/ProductReel';
import { PRODUCT_CATEGORIES } from '@/config';

import { formatPrice } from '@/lib/utils';
import { Check, Shield } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import prisma from '@/db/db';
import { ShareLink } from '@/components/comp/ShareLink';

interface PageProps {
  params: {
    productId: string;
  };
}
const BREADCRUMPS = [
  { id: 1, name: 'Home', href: '/' },
  { id: 2, name: 'Products', href: '/products' },
];

export default async function page({ params }: PageProps) {
  const { productId } = params;

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      status: 'APPROVED',
    },
  });

  const seller = await prisma.user.findUnique({
    where: {
      id: product?.userId,
    },
  });

  if (!product) return notFound();

  const label = PRODUCT_CATEGORIES.find(
    ({ value }) => value === product.category
  )?.label;

  return (
    <MaxWidthWrapper>
      <div className='mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:grid-cols-2 lg:max-w-7xl lg:gap-x-8 lg:px-8'>
        {/* product details */}
        <div className='lg:max-w-lg lg:self-end'>
          <ol className='flex items-center space-x-2'>
            {BREADCRUMPS.map((b, i) => (
              <li key={b.id}>
                <div className='flex items-center text-sm'>
                  <Link
                    href={b.href}
                    className='font-medium text-sm text-muted-foreground hover:text-stone-900'>
                    {b.name}
                  </Link>
                  {i !== BREADCRUMPS.length - 1 && (
                    <svg
                      viewBox='0 0 20 20'
                      fill='currentColor'
                      aria-hidden='true'
                      className='ml-2 h-5 w-5 flex-shrink-0 text-stone-300'>
                      <path d='M5.555 17.776l8-16 .894.448-8 16-.894-.448z' />
                    </svg>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <div className='mt-4'>
            <h1 className='text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl'>
              {product.name}
            </h1>
            <div className='flex gap-3 mt-6 items-center'>
              <p className='text-sm text-muted-foreground'>Sold by: </p>
              <span className='text-lg text-muted-foreground font-semibold'>
                {seller?.name}
              </span>
            </div>
          </div>

          <section className='mt-4'>
            <div className='flex items-center'>
              <p className='font-medium text-stone-900'>
                {formatPrice(product.price)}
              </p>

              <div className='ml-4 border-l text-muted-foreground border-stone-300 pl-4'>
                {label}
              </div>
            </div>

            <div className='mt-4 space-y-6'>
              <p className='text-base text-muted-foreground'>
                {product.description}
              </p>
            </div>

            <div className='mt-6 flex items-center'>
              <Check
                aria-hidden='true'
                className='h-5 w-5 flex-shrink-0 text-green-500'
              />
              <p className='ml-2 text-sm text-muted-foreground'>
                Eligible for instant download
              </p>
            </div>
          </section>
        </div>

        {/* product images */}
        <div className='mt-10 lg:col-start-2 lg:row-span-2 lg:mt-0 lg:self-center'>
          <div className='aspect-square rounded-lg'>
            <ImageSlider
              urls={product.imageUrls}
              alt={`${product.name}'s product image`}
            />
          </div>
        </div>

        {/* add to cart part */}
        <div className='mt-10 lg:col-start-1 lg:row-start-2 lg:max-w-lg lg:self-start'>
          <div>
            <ShareLink
              link={`${process.env.NEXT_PUBLIC_SERVER_URL}/product/${productId}`}
            />
            <div className='mt-10'>
              <AddToCartButton product={product} />
            </div>
            <div className='mt-6 text-center'>
              <div className='group inline-flex text-sm text-medium'>
                <Shield
                  aria-hidden='true'
                  className='mr-2 h-5 w-5 flex-shrink-0 text-stone-400'
                />
                <span className='text-muted-foreground hover:text-stone-700'>
                  Customer Service available
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProductReel
        href='/products'
        query={{ category: product.category, limit: 4 }}
        title={`Similar ${label}`}
        subtitle={`Browse similar high-quality ${label} just like '${product.name}'`}
      />
    </MaxWidthWrapper>
  );
}
