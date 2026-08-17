'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ImageIcon, Lock, ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/trpc/client';
import MaxWidthWrapper from '@/components/shared/MaxWidthWrapper';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, Spinner } from '@/components/shared/states';
import { useCart } from '@/hooks/use-cart';
import { categoryLabel } from '@/config';
import { formatPrice } from '@/lib/utils';

export default function CartView() {
  const { data: session, status: authStatus } = useSession();
  const searchParams = useSearchParams();
  const productIds = useCart((s) => s.productIds);
  const remove = useCart((s) => s.remove);

  useEffect(() => {
    if (searchParams.get('canceled')) {
      toast.info('Checkout canceled — your cart is still here.');
    }
  }, [searchParams]);

  // Prices always come from the server; localStorage only holds ids.
  const { data, isLoading } = trpc.order.preview.useQuery(
    { productIds },
    { enabled: productIds.length > 0 }
  );

  // Silently drop anything that was delisted while it sat in the cart.
  useEffect(() => {
    data?.unavailableIds?.forEach((id) => remove(id));
  }, [data?.unavailableIds, remove]);

  const checkout = trpc.order.createCheckoutSession.useMutation({
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: (error) => toast.error(error.message),
  });

  const items = data?.items ?? [];
  const subtotal = data?.subtotalCents ?? 0;

  if (productIds.length === 0) {
    return (
      <MaxWidthWrapper className='py-16'>
        <h1 className='mb-8 text-2xl font-bold tracking-tight sm:text-3xl'>
          Your cart
        </h1>
        <EmptyState
          icon={ShoppingCart}
          title='Your cart is empty'
          description='Browse the catalogue and add something you like.'
          action={{ label: 'Browse products', href: '/products' }}
        />
      </MaxWidthWrapper>
    );
  }

  return (
    <MaxWidthWrapper className='py-10'>
      <h1 className='mb-8 text-2xl font-bold tracking-tight sm:text-3xl'>Your cart</h1>

      <div className='lg:grid lg:grid-cols-[1fr_360px] lg:gap-12'>
        <div className='divide-y divide-stone-200 border-y border-stone-200'>
          {isLoading
            ? productIds.map((id) => (
                <div key={id} className='flex gap-4 py-5'>
                  <Skeleton className='h-20 w-20 rounded-lg' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-4 w-2/3' />
                    <Skeleton className='h-3 w-1/4' />
                  </div>
                </div>
              ))
            : items.map((item) => (
                <div key={item.id} className='flex gap-4 py-5'>
                  <Link
                    href={`/products/${item.slug}`}
                    className='relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100'>
                    {item.imageUrls[0] ? (
                      <Image
                        src={item.imageUrls[0]}
                        alt={item.name}
                        fill
                        sizes='80px'
                        className='object-cover'
                      />
                    ) : (
                      <div className='flex h-full items-center justify-center'>
                        <ImageIcon className='h-5 w-5 text-stone-300' />
                      </div>
                    )}
                  </Link>

                  <div className='flex min-w-0 flex-1 flex-col'>
                    <Link
                      href={`/products/${item.slug}`}
                      className='truncate text-sm font-semibold text-stone-900 hover:underline'>
                      {item.name}
                    </Link>
                    <p className='mt-0.5 text-xs text-muted-foreground'>
                      {categoryLabel(item.category)} · by {item.seller.name ?? 'Anonymous'}
                    </p>
                    <button
                      onClick={() => remove(item.id)}
                      className='mt-auto inline-flex w-fit items-center gap-1.5 text-xs text-muted-foreground hover:text-red-600'>
                      <Trash2 className='h-3 w-3' /> Remove
                    </button>
                  </div>

                  <span className='shrink-0 text-sm font-semibold text-stone-900'>
                    {formatPrice(item.priceCents)}
                  </span>
                </div>
              ))}
        </div>

        <div className='mt-10 lg:mt-0'>
          <div className='rounded-xl border border-stone-200 bg-stone-50/70 p-6'>
            <h2 className='text-sm font-semibold text-stone-900'>Order summary</h2>

            <dl className='mt-5 space-y-3 text-sm'>
              <div className='flex justify-between'>
                <dt className='text-muted-foreground'>
                  Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})
                </dt>
                <dd className='font-medium'>{formatPrice(subtotal)}</dd>
              </div>
              <div className='flex justify-between'>
                <dt className='text-muted-foreground'>Transaction fee</dt>
                <dd className='font-medium text-emerald-600'>Included</dd>
              </div>
              <div className='flex justify-between border-t border-stone-200 pt-3 text-base'>
                <dt className='font-semibold'>Total</dt>
                <dd className='font-bold'>{formatPrice(subtotal)}</dd>
              </div>
            </dl>

            {authStatus === 'unauthenticated' ? (
              <Button asChild className='mt-6 w-full' size='lg'>
                <Link href={`/sign-in?callbackUrl=${encodeURIComponent('/cart')}`}>
                  Sign in to check out
                </Link>
              </Button>
            ) : (
              <Button
                className='mt-6 w-full'
                size='lg'
                disabled={
                  checkout.isPending || items.length === 0 || authStatus === 'loading'
                }
                onClick={() =>
                  checkout.mutate({ productIds: items.map((item) => item.id) })
                }>
                {checkout.isPending ? (
                  <>
                    <Spinner className='mr-2' /> Redirecting to Stripe…
                  </>
                ) : (
                  <>
                    <Lock className='mr-2 h-4 w-4' /> Checkout securely
                  </>
                )}
              </Button>
            )}

            <p className='mt-4 text-center text-xs text-muted-foreground'>
              Payments are handled by Stripe. This demo runs in test mode — use card{' '}
              <code className='rounded bg-white px-1 py-0.5 font-mono'>
                4242 4242 4242 4242
              </code>
              .
            </p>
          </div>

          {session?.user ? (
            <p className='mt-4 text-center text-xs text-muted-foreground'>
              Purchases appear in{' '}
              <Link href='/library' className='underline hover:text-stone-900'>
                your library
              </Link>{' '}
              immediately after payment.
            </p>
          ) : null}
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
