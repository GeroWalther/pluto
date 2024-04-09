import DataTable from '@/components/Table/DataTable';
import UploadDrawerDialog from '@/components/comp/UploadDrawerDialog';
import { trpc } from '@/trpc/client';
import React from 'react';

export default function SellerProd() {
  const { data: products } = trpc.seller.getAllProducts.useQuery();
  return (
    <main className='flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6'>
      <div className='flex justify-between'>
        <h1 className='text-lg font-semibold md:text-2xl'>Inventory</h1>
        {products && products.length > 0 && <UploadDrawerDialog />}
      </div>
      {products?.length === 0 || null ? (
        <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm'>
          <div className='flex flex-col items-center gap-1 text-center'>
            <>
              <h3 className='text-2xl font-bold tracking-tight'>
                You have no products
              </h3>
              <p className='text-sm text-muted-foreground mb-5'>
                You can start selling as soon as you add a product.
              </p>
              <UploadDrawerDialog />
            </>
          </div>
        </div>
      ) : (
        <DataTable products={products}></DataTable>
      )}
    </main>
  );
}
