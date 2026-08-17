'use client';

import { PayoutStatus } from '@prisma/client';
import { Receipt } from 'lucide-react';
import { trpc } from '@/trpc/client';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/shared/states';
import { cn, formatDate, formatPrice } from '@/lib/utils';

const payoutStyles: Record<PayoutStatus, string> = {
  PAID: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  PENDING: 'bg-stone-100 text-stone-600 ring-stone-200',
  UNAVAILABLE: 'bg-amber-50 text-amber-700 ring-amber-200',
  FAILED: 'bg-red-50 text-red-700 ring-red-200',
};

const payoutLabels: Record<PayoutStatus, string> = {
  PAID: 'Paid out',
  PENDING: 'Processing',
  UNAVAILABLE: 'Awaiting Stripe setup',
  FAILED: 'Failed',
};

export default function SalesPage() {
  const { data: sales, isLoading } = trpc.seller.sales.useQuery();

  if (isLoading) {
    return (
      <div className='space-y-3'>
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className='h-12 w-full' />
        ))}
      </div>
    );
  }

  if (!sales || sales.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title='No sales yet'
        description='When someone buys one of your products, the transaction shows up here with its payout status.'
        action={{ label: 'View my products', href: '/dashboard/products' }}
      />
    );
  }

  return (
    <div className='overflow-x-auto rounded-xl border border-stone-200'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className='text-right'>Price</TableHead>
            <TableHead className='text-right'>Fee</TableHead>
            <TableHead className='text-right'>You earned</TableHead>
            <TableHead>Payout</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell className='max-w-[220px] truncate font-medium'>
                {sale.productName}
              </TableCell>
              <TableCell className='font-mono text-xs text-muted-foreground'>
                {sale.order.orderNumber}
              </TableCell>
              <TableCell className='whitespace-nowrap text-muted-foreground'>
                {formatDate(sale.createdAt)}
              </TableCell>
              <TableCell className='text-right'>
                {formatPrice(sale.priceCents)}
              </TableCell>
              <TableCell className='text-right text-muted-foreground'>
                −{formatPrice(sale.platformFeeCents)}
              </TableCell>
              <TableCell className='text-right font-semibold'>
                {formatPrice(sale.sellerEarningsCents)}
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    'inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1',
                    payoutStyles[sale.payoutStatus]
                  )}
                  title={sale.payoutError ?? undefined}>
                  {payoutLabels[sale.payoutStatus]}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
