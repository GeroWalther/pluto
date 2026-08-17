import { Suspense } from 'react';
import { PageSpinner } from '@/components/shared/states';
import PayoutsView from './PayoutsView';

export default function PayoutsPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <PayoutsView />
    </Suspense>
  );
}
