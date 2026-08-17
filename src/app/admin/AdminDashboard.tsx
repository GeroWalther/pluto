'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductStatus } from '@prisma/client';
import {
  AlertTriangle,
  BadgeEuro,
  ClipboardCheck,
  ImageIcon,
  Package,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/trpc/client';
import { StatCard } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState, Spinner } from '@/components/shared/states';
import { categoryLabel } from '@/config';
import { formatDate, formatPrice } from '@/lib/utils';

function ModerationQueue({ status }: { status: ProductStatus }) {
  const utils = trpc.useUtils();
  const { data: products, isLoading } = trpc.admin.products.useQuery({ status });
  const [reasons, setReasons] = useState<Record<string, string>>({});

  const moderate = trpc.admin.moderate.useMutation({
    onSuccess: (_, variables) => {
      toast.success(
        variables.status === ProductStatus.APPROVED
          ? 'Product approved and published'
          : 'Product rejected'
      );
      utils.admin.products.invalidate();
      utils.admin.stats.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  if (isLoading) {
    return (
      <div className='space-y-3'>
        {Array.from({ length: 2 }, (_, i) => (
          <Skeleton key={i} className='h-40 w-full rounded-xl' />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title={
          status === ProductStatus.PENDING
            ? 'Queue is clear'
            : `No ${status.toLowerCase()} products`
        }
        description={
          status === ProductStatus.PENDING
            ? 'Every submitted listing has been reviewed.'
            : undefined
        }
      />
    );
  }

  return (
    <div className='space-y-4'>
      {products.map((product) => (
        <div key={product.id} className='rounded-xl border border-stone-200 p-5'>
          <div className='flex flex-col gap-5 sm:flex-row'>
            <div className='relative h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-stone-100'>
              {product.imageUrls[0] ? (
                <Image
                  src={product.imageUrls[0]}
                  alt={product.name}
                  fill
                  sizes='112px'
                  className='object-cover'
                />
              ) : (
                <div className='flex h-full items-center justify-center'>
                  <ImageIcon className='h-6 w-6 text-stone-300' />
                </div>
              )}
            </div>

            <div className='min-w-0 flex-1'>
              <div className='flex flex-wrap items-baseline justify-between gap-2'>
                <Link
                  href={`/products/${product.slug}`}
                  target='_blank'
                  className='text-base font-semibold text-stone-900 hover:underline'>
                  {product.name}
                </Link>
                <span className='font-semibold'>{formatPrice(product.priceCents)}</span>
              </div>

              <p className='mt-1 text-xs text-muted-foreground'>
                {categoryLabel(product.category)} · by {product.seller.name} (
                {product.seller.email}) · submitted {formatDate(product.createdAt)}
              </p>

              <p className='mt-3 line-clamp-3 text-sm text-stone-600'>
                {product.description}
              </p>

              <p className='mt-3 text-xs text-muted-foreground'>
                Delivers: {product.fileNames.join(', ') || 'no files'}
              </p>

              {status === ProductStatus.PENDING ? (
                <div className='mt-5 flex flex-col gap-3 sm:flex-row sm:items-center'>
                  <Button
                    size='sm'
                    disabled={moderate.isPending}
                    onClick={() =>
                      moderate.mutate({
                        id: product.id,
                        status: ProductStatus.APPROVED,
                      })
                    }>
                    {moderate.isPending ? <Spinner className='mr-2' /> : null}
                    Approve
                  </Button>

                  <div className='flex flex-1 gap-2'>
                    <Input
                      placeholder='Reason for rejection (optional)'
                      className='h-9'
                      value={reasons[product.id] ?? ''}
                      onChange={(e) =>
                        setReasons((prev) => ({
                          ...prev,
                          [product.id]: e.target.value,
                        }))
                      }
                    />
                    <Button
                      size='sm'
                      variant='outline'
                      className='shrink-0 text-red-600 hover:bg-red-50'
                      disabled={moderate.isPending}
                      onClick={() =>
                        moderate.mutate({
                          id: product.id,
                          status: ProductStatus.REJECTED,
                          reason: reasons[product.id] || undefined,
                        })
                      }>
                      Reject
                    </Button>
                  </div>
                </div>
              ) : status === ProductStatus.REJECTED ? (
                <div className='mt-4 flex items-center gap-3'>
                  {product.rejectionReason ? (
                    <p className='flex-1 rounded-md bg-red-50 px-2.5 py-1.5 text-xs text-red-700'>
                      {product.rejectionReason}
                    </p>
                  ) : null}
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() =>
                      moderate.mutate({
                        id: product.id,
                        status: ProductStatus.APPROVED,
                      })
                    }>
                    Approve after all
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function OrdersTable() {
  const { data: orders, isLoading } = trpc.admin.orders.useQuery();

  if (isLoading) return <Skeleton className='h-64 w-full rounded-xl' />;

  if (!orders || orders.length === 0) {
    return <EmptyState icon={Package} title='No orders yet' />;
  }

  return (
    <div className='overflow-x-auto rounded-xl border border-stone-200'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Buyer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='text-right'>Total</TableHead>
            <TableHead className='text-right'>Commission</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className='font-mono text-xs'>{order.orderNumber}</TableCell>
              <TableCell className='max-w-[180px] truncate'>
                {order.buyer.name ?? order.buyer.email}
              </TableCell>
              <TableCell className='max-w-[220px] truncate text-muted-foreground'>
                {order.items.map((item) => item.productName).join(', ')}
              </TableCell>
              <TableCell>
                <span className='text-xs font-medium'>{order.status}</span>
                {order.items.some(
                  (item) => item.payoutStatus === 'FAILED' || item.payoutStatus === 'UNAVAILABLE'
                ) ? (
                  <span
                    className='ml-2 inline-flex items-center gap-1 text-xs text-amber-600'
                    title={
                      order.items.find((item) => item.payoutError)?.payoutError ??
                      'A seller payout is still pending'
                    }>
                    <AlertTriangle className='h-3 w-3' /> payout
                  </span>
                ) : null}
              </TableCell>
              <TableCell className='text-right'>
                {formatPrice(order.totalCents)}
              </TableCell>
              <TableCell className='text-right text-emerald-600'>
                {formatPrice(order.platformFeeCents)}
              </TableCell>
              <TableCell className='whitespace-nowrap text-muted-foreground'>
                {formatDate(order.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();

  return (
    <div className='space-y-8'>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          label='Awaiting review'
          value={stats?.pendingProducts ?? 0}
          Icon={ClipboardCheck}
          tone={stats && stats.pendingProducts > 0 ? 'warning' : 'default'}
          loading={isLoading}
        />
        <StatCard
          label='Live products'
          value={stats?.approvedProducts ?? 0}
          Icon={Package}
          loading={isLoading}
        />
        <StatCard
          label='Gross volume'
          value={formatPrice(stats?.grossRevenueCents ?? 0)}
          hint={`${stats?.paidOrders ?? 0} paid orders`}
          Icon={BadgeEuro}
          loading={isLoading}
        />
        <StatCard
          label='Commission earned'
          value={formatPrice(stats?.commissionCents ?? 0)}
          tone='positive'
          Icon={Users}
          hint={`${stats?.users ?? 0} registered users`}
          loading={isLoading}
        />
      </div>

      {stats && stats.stuckPayouts > 0 ? (
        <div className='flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4'>
          <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0 text-amber-600' />
          <p className='text-sm text-amber-900'>
            <strong className='font-semibold'>{stats.stuckPayouts}</strong> seller
            payout{stats.stuckPayouts === 1 ? '' : 's'} could not be sent — usually
            because the seller has not finished Stripe onboarding. They release
            automatically once the account is verified.
          </p>
        </div>
      ) : null}

      <Tabs defaultValue='pending'>
        <TabsList>
          <TabsTrigger value='pending'>
            Review queue{stats?.pendingProducts ? ` (${stats.pendingProducts})` : ''}
          </TabsTrigger>
          <TabsTrigger value='approved'>Approved</TabsTrigger>
          <TabsTrigger value='rejected'>Rejected</TabsTrigger>
          <TabsTrigger value='orders'>Orders</TabsTrigger>
        </TabsList>

        <TabsContent value='pending' className='mt-6'>
          <ModerationQueue status={ProductStatus.PENDING} />
        </TabsContent>
        <TabsContent value='approved' className='mt-6'>
          <ModerationQueue status={ProductStatus.APPROVED} />
        </TabsContent>
        <TabsContent value='rejected' className='mt-6'>
          <ModerationQueue status={ProductStatus.REJECTED} />
        </TabsContent>
        <TabsContent value='orders' className='mt-6'>
          <OrdersTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
