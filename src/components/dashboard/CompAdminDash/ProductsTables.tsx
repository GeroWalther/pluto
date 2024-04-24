'use client';
import { trpc } from '@/trpc/client';

import AdminTable from '@/components/Table/AdminTable';

export default function ProductsTables() {
  const {
    data: pendingData,
    isError: pendingErr,
    isLoading: isLoadingPending,
  } = trpc.admin.getPendingProducts.useQuery();

  return (
    <AdminTable
      data={pendingData}
      isError={pendingErr}
      isLoading={isLoadingPending}
    />
  );
}
