import { Suspense } from 'react';
import { constructMetadata } from '@/lib/utils';
import { PageSpinner } from '@/components/shared/states';
import CartView from './CartView';

export const metadata = constructMetadata({
  title: 'Your cart — Pluto Market',
  noIndex: true,
});

export default function CartPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <CartView />
    </Suspense>
  );
}
