'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Download, ImageIcon, Library } from 'lucide-react';
import { trpc } from '@/trpc/client';
import MaxWidthWrapper from '@/components/shared/MaxWidthWrapper';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/states';
import { categoryLabel } from '@/config';
import { formatDate, formatPrice } from '@/lib/utils';

export default function LibraryView() {
  const { data: items, isLoading } = trpc.order.library.useQuery();

  return (
    <MaxWidthWrapper className='py-10'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>My library</h1>
        <p className='mt-1.5 text-sm text-muted-foreground'>
          Everything you have bought. Download links are generated fresh each time you
          open this page.
        </p>
      </div>

      {isLoading ? (
        <div className='space-y-4'>
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className='h-32 w-full rounded-xl' />
          ))}
        </div>
      ) : !items || items.length === 0 ? (
        <EmptyState
          icon={Library}
          title='Nothing here yet'
          description='Products you buy will appear here, ready to download at any time.'
          action={{ label: 'Browse products', href: '/products' }}
        />
      ) : (
        <div className='space-y-4'>
          {items.map((item) => (
            <div
              key={item.id}
              className='flex flex-col gap-5 rounded-xl border border-stone-200 p-5 sm:flex-row'>
              <div className='relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-stone-100'>
                {item.product?.imageUrls[0] ? (
                  <Image
                    src={item.product.imageUrls[0]}
                    alt={item.productName}
                    fill
                    sizes='96px'
                    className='object-cover'
                  />
                ) : (
                  <div className='flex h-full items-center justify-center'>
                    <ImageIcon className='h-6 w-6 text-stone-300' />
                  </div>
                )}
              </div>

              <div className='min-w-0 flex-1'>
                <div className='flex flex-wrap items-baseline justify-between gap-2'>
                  {item.product?.slug ? (
                    <Link
                      href={`/products/${item.product.slug}`}
                      className='text-base font-semibold text-stone-900 hover:underline'>
                      {item.productName}
                    </Link>
                  ) : (
                    <span className='text-base font-semibold text-stone-900'>
                      {item.productName}
                    </span>
                  )}
                  <span className='text-sm text-muted-foreground'>
                    {formatPrice(item.priceCents)}
                  </span>
                </div>

                <p className='mt-1 text-xs text-muted-foreground'>
                  {item.product ? `${categoryLabel(item.product.category)} · ` : ''}
                  by {item.seller.name ?? 'Anonymous'} · bought{' '}
                  {formatDate(item.order.paidAt ?? item.createdAt)} · order{' '}
                  {item.order.orderNumber}
                </p>

                <div className='mt-4 flex flex-wrap gap-2'>
                  {item.downloads.map((file) => (
                    <Button
                      key={file.url}
                      asChild
                      size='sm'
                      variant='outline'
                      className='h-8 text-xs'>
                      <a href={file.url}>
                        <Download className='mr-1.5 h-3 w-3' />
                        {file.name}
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </MaxWidthWrapper>
  );
}
