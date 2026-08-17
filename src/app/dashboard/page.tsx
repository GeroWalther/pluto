'use client';

import Link from 'next/link';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Package, Plus, Receipt, Wallet } from 'lucide-react';
import { trpc } from '@/trpc/client';
import { StatCard } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/utils';

export default function DashboardOverview() {
  const { data: stats, isLoading } = trpc.seller.stats.useQuery();
  const { data: payouts } = trpc.payouts.status.useQuery();

  const chartData =
    stats?.revenueSeries.map((point) => ({
      date: point.date.slice(5),
      euros: point.cents / 100,
    })) ?? [];

  const hasRevenue = chartData.some((point) => point.euros > 0);

  return (
    <div className='space-y-8'>
      {payouts && !payouts.payoutsEnabled ? (
        <div className='flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='text-sm font-semibold text-amber-900'>
              {payouts.connected
                ? 'Finish connecting your Stripe account'
                : 'Connect Stripe to get paid'}
            </p>
            <p className='mt-1 text-sm text-amber-800'>
              You can list products right now — earnings are held safely until your
              payout account is ready.
            </p>
          </div>
          <Button asChild size='sm' className='shrink-0'>
            <Link href='/dashboard/payouts'>Set up payouts</Link>
          </Button>
        </div>
      ) : null}

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          label='Total earnings'
          value={formatPrice(stats?.grossCents ?? 0)}
          hint='After the 5% commission'
          Icon={Wallet}
          loading={isLoading}
        />
        <StatCard
          label='Paid out'
          value={formatPrice(stats?.paidOutCents ?? 0)}
          hint='Transferred to Stripe'
          tone='positive'
          Icon={Wallet}
          loading={isLoading}
        />
        <StatCard
          label='Awaiting payout'
          value={formatPrice(stats?.pendingCents ?? 0)}
          tone={stats && stats.pendingCents > 0 ? 'warning' : 'default'}
          Icon={Receipt}
          loading={isLoading}
        />
        <StatCard
          label='Products live'
          value={`${stats?.approvedProducts ?? 0} / ${stats?.listedProducts ?? 0}`}
          hint='Approved / total listed'
          Icon={Package}
          loading={isLoading}
        />
      </div>

      <div className='rounded-xl border border-stone-200 bg-white p-6'>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h2 className='text-sm font-semibold text-stone-900'>
              Earnings, last 30 days
            </h2>
            <p className='text-xs text-muted-foreground'>
              {stats?.salesCount ?? 0} sales all time
            </p>
          </div>
          <Button asChild size='sm'>
            <Link href='/dashboard/products/new'>
              <Plus className='mr-1.5 h-4 w-4' /> New product
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <Skeleton className='h-64 w-full' />
        ) : hasRevenue ? (
          <div className='h-64'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={chartData} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id='earnings' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='0%' stopColor='#4f46e5' stopOpacity={0.35} />
                    <stop offset='100%' stopColor='#4f46e5' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' stroke='#e7e5e4' vertical={false} />
                <XAxis
                  dataKey='date'
                  tick={{ fontSize: 11, fill: '#78716c' }}
                  tickLine={false}
                  axisLine={false}
                  interval='preserveStartEnd'
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#78716c' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `€${value}`}
                />
                <Tooltip
                  formatter={(value: number) => [`€${value.toFixed(2)}`, 'Earnings']}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #e7e5e4',
                    fontSize: 12,
                  }}
                />
                <Area
                  type='monotone'
                  dataKey='euros'
                  stroke='#4f46e5'
                  strokeWidth={2}
                  fill='url(#earnings)'
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className='flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-stone-200 text-center'>
            <p className='text-sm font-medium text-stone-900'>No sales yet</p>
            <p className='mt-1 max-w-xs text-sm text-muted-foreground'>
              Once you make your first sale, your earnings will show up here.
            </p>
            <Button asChild size='sm' variant='outline' className='mt-5'>
              <Link href='/dashboard/products/new'>List your first product</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
