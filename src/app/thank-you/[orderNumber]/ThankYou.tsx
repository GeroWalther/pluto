'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { OrderStatus } from '@prisma/client';
import { CheckCircle2, Download, ImageIcon, XCircle } from 'lucide-react';
import { trpc } from '@/trpc/client';
import MaxWidthWrapper from '@/components/shared/MaxWidthWrapper';
import { Button } from '@/components/ui/button';
import { ErrorState, PageSpinner, Spinner } from '@/components/shared/states';
import { useCart } from '@/hooks/use-cart';
import { formatPrice } from '@/lib/utils';

export default function ThankYou({ orderNumber }: { orderNumber: string }) {
  const clearCart = useCart((s) => s.clear);

  const { data: order, isLoading, isError, error } = trpc.order.status.useQuery(
    { orderNumber },
    {
      // Stripe's webhook usually lands within a second or two of the redirect,
      // so poll until the order flips out of PENDING.
      refetchInterval: (query) =>
        query.state.data?.status === OrderStatus.PENDING ? 2000 : false,
    }
  );

  useEffect(() => {
    if (order?.status === OrderStatus.PAID) clearCart();
  }, [order?.status, clearCart]);

  if (isLoading) return <PageSpinner label='Loading your order…' />;

  if (isError || !order) {
    return (
      <MaxWidthWrapper className='py-16'>
        <ErrorState
          title='Order not found'
          description={error?.message ?? 'We could not find that order.'}
        />
      </MaxWidthWrapper>
    );
  }

  if (order.status === OrderStatus.FAILED) {
    return (
      <MaxWidthWrapper className='py-20'>
        <div className='mx-auto max-w-md text-center'>
          <XCircle className='mx-auto h-12 w-12 text-red-500' />
          <h1 className='mt-5 text-2xl font-bold tracking-tight'>Payment failed</h1>
          <p className='mt-3 text-sm text-muted-foreground'>
            Order {order.orderNumber} was not completed and you have not been charged.
          </p>
          <Button asChild className='mt-7'>
            <Link href='/cart'>Back to cart</Link>
          </Button>
        </div>
      </MaxWidthWrapper>
    );
  }

  const pending = order.status === OrderStatus.PENDING;

  return (
    <MaxWidthWrapper className='py-14'>
      <div className='mx-auto max-w-2xl'>
        <div className='text-center'>
          {pending ? (
            <>
              <Spinner className='mx-auto h-10 w-10 text-indigo-600' />
              <h1 className='mt-5 text-2xl font-bold tracking-tight sm:text-3xl'>
                Confirming your payment…
              </h1>
              <p className='mt-3 text-sm text-muted-foreground'>
                We are waiting for Stripe to confirm the charge. This usually takes a
                couple of seconds — you can safely leave this page, your files will be
                in your library either way.
              </p>
            </>
          ) : (
            <>
              <CheckCircle2 className='mx-auto h-12 w-12 text-emerald-500' />
              <h1 className='mt-5 text-2xl font-bold tracking-tight sm:text-3xl'>
                Thanks for your order
              </h1>
              <p className='mt-3 text-sm text-muted-foreground'>
                Order <span className='font-medium text-stone-900'>{order.orderNumber}</span> is
                confirmed. A receipt is on its way to your inbox.
              </p>
            </>
          )}
        </div>

        <div className='mt-10 divide-y divide-stone-200 rounded-xl border border-stone-200'>
          {order.items.map((item) => (
            <div key={item.id} className='flex gap-4 p-5'>
              <div className='relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-stone-100'>
                {item.product?.imageUrls[0] ? (
                  <Image
                    src={item.product.imageUrls[0]}
                    alt={item.productName}
                    fill
                    sizes='64px'
                    className='object-cover'
                  />
                ) : (
                  <div className='flex h-full items-center justify-center'>
                    <ImageIcon className='h-5 w-5 text-stone-300' />
                  </div>
                )}
              </div>

              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-semibold text-stone-900'>
                  {item.productName}
                </p>
                <p className='mt-0.5 text-xs text-muted-foreground'>
                  {formatPrice(item.priceCents)}
                </p>

                {item.downloads.length > 0 ? (
                  <div className='mt-3 flex flex-wrap gap-2'>
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
                ) : (
                  <p className='mt-3 text-xs text-muted-foreground'>
                    Downloads unlock once payment is confirmed.
                  </p>
                )}
              </div>
            </div>
          ))}

          <div className='flex items-center justify-between p-5'>
            <span className='text-sm font-semibold'>Total paid</span>
            <span className='text-base font-bold'>{formatPrice(order.totalCents)}</span>
          </div>
        </div>

        <div className='mt-8 flex flex-col justify-center gap-3 sm:flex-row'>
          <Button asChild>
            <Link href='/library'>Go to my library</Link>
          </Button>
          <Button asChild variant='outline'>
            <Link href='/products'>Keep browsing</Link>
          </Button>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
