import MaxWidthWrapper from '@/components/comp/MaxWidthWrapper';
import ProdFilter from '@/components/comp/ProdFilter';
import ProductReel from '@/components/comp/ProductReel';
import Loader from '@/components/Loader/Loader';
import { PRODUCT_CATEGORIES } from '@/config';
import { Suspense } from 'react';

type Param = string | string[] | undefined;

interface ProductsPageProps {
  searchParams: { [key: string]: Param };
}

const parse = (param: Param) => {
  return typeof param === 'string' ? param : undefined;
};

const ProductsPage = ({ searchParams }: ProductsPageProps) => {
  const sort = parse(searchParams.sort);
  // const category = parse(searchParams.category);
  const category = searchParams?.category?.toString() ?? 'all';

  const label = PRODUCT_CATEGORIES.find(
    ({ value }) => value === category
  )?.label;

  return (
    <MaxWidthWrapper>
      <div className='flex justify-end mb-8'>
        <ProdFilter />
      </div>
      <Suspense fallback={<Loader />} key={label}>
        <ProductReel
          title={label ?? 'Browse all high-quality assets'}
          query={{
            category,
            limit: 50,
            sort: sort === 'desc' || sort === 'asc' ? sort : undefined,
          }}
        />
      </Suspense>
    </MaxWidthWrapper>
  );
};

export default ProductsPage;
