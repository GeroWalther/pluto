'use client';
import { trpc } from '@/trpc/client';

import AdminTable from '@/components/Table/AdminTable';

export default function ProductsTables() {
  const {
    data: pendingData,
    isError: pendingErr,
    isLoading: isLoadingPending,
  } = trpc.admin.getPendingProducts.useQuery();

  const {
    data: approvedData,
    isError: approvedErr,
    isLoading: isLoadingApproved,
  } = trpc.admin.getApprovedProducts.useQuery();

  const {
    data: rejectedData,
    isError: rejectedErr,
    isLoading: isLoadingRejected,
  } = trpc.admin.getRejectedProducts.useQuery();

  return (
    <section>
      <div className='mb-16'>
        <h3 className='font-medium text-stone-600 '>Pending Products</h3>
        <AdminTable
          data={pendingData}
          isError={pendingErr}
          isLoading={isLoadingPending}
          update={true}
        />
      </div>
      <div className='mb-16'>
        <h3 className='font-medium text-stone-600 '>Approved Products</h3>
        <AdminTable
          data={approvedData}
          isError={approvedErr}
          isLoading={isLoadingApproved}
        />
      </div>
      <div>
        <h3 className='font-medium text-stone-600 '>Rejected Products</h3>
        <AdminTable
          data={rejectedData}
          isError={rejectedErr}
          isLoading={isLoadingRejected}
        />
      </div>
    </section>
  );
}
