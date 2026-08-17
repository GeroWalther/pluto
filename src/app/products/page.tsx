import { Suspense } from 'react';
import { constructMetadata } from '@/lib/utils';
import MaxWidthWrapper from '@/components/shared/MaxWidthWrapper';
import { PageSpinner } from '@/components/shared/states';
import ProductsBrowser from './ProductsBrowser';

export const metadata = constructMetadata({
  title: 'Browse digital products — Pluto Market',
  description:
    'Search UI kits, icons, fonts, templates, photos, e-books and audio from independent creators.',
});

export default function ProductsPage() {
  return (
    <MaxWidthWrapper className='py-10'>
      {/* useSearchParams needs a Suspense boundary to keep the page static. */}
      <Suspense fallback={<PageSpinner />}>
        <ProductsBrowser />
      </Suspense>
    </MaxWidthWrapper>
  );
}
