'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ExternalLink, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/shared/states';
import { SUPPORTED_COUNTRIES } from '@/config/countries';
import { PLATFORM_FEE_LABEL } from '@/config';
import { formatPrice } from '@/lib/utils';

export default function PayoutsView() {
  const searchParams = useSearchParams();
  const utils = trpc.useUtils();

  const { data: status, isLoading } = trpc.payouts.status.useQuery();
  const { data: stats } = trpc.seller.stats.useQuery();
  const [country, setCountry] = useState('DE');

  // Coming back from Stripe's hosted onboarding — re-read the live state.
  useEffect(() => {
    if (searchParams.get('onboarded')) {
      utils.payouts.status.invalidate();
      utils.seller.stats.invalidate();
      toast.success('Stripe details submitted — checking your account status.');
    }
  }, [searchParams, utils]);

  const onboard = trpc.payouts.startOnboarding.useMutation({
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: (error) => toast.error(error.message),
  });

  const dashboard = trpc.payouts.dashboardLink.useMutation({
    onSuccess: ({ url }) => window.open(url, '_blank', 'noopener'),
    onError: (error) => toast.error(error.message),
  });

  if (isLoading) return <Skeleton className='h-64 w-full rounded-xl' />;

  const ready = status?.payoutsEnabled;

  return (
    <div className='max-w-2xl space-y-6'>
      <div className='rounded-xl border border-stone-200 p-6'>
        <div className='flex items-start gap-4'>
          <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-stone-100'>
            {ready ? (
              <CheckCircle2 className='h-5 w-5 text-emerald-600' />
            ) : (
              <Wallet className='h-5 w-5 text-stone-500' />
            )}
          </div>

          <div className='min-w-0 flex-1'>
            <h2 className='text-sm font-semibold text-stone-900'>
              {ready
                ? 'Your payout account is active'
                : status?.connected
                  ? 'Finish your Stripe onboarding'
                  : 'Connect a Stripe account'}
            </h2>

            <p className='mt-1.5 text-sm text-muted-foreground'>
              {ready
                ? `Earnings are transferred to your Stripe account automatically after each sale. Pluto keeps ${PLATFORM_FEE_LABEL}.`
                : 'Pluto pays sellers through Stripe Connect. Until your account is verified, earnings are held and released automatically once you are set up.'}
            </p>

            {status?.connected && !ready && status.requirements?.length ? (
              <div className='mt-4 rounded-lg bg-amber-50 px-3 py-2.5'>
                <p className='text-xs font-medium text-amber-900'>
                  Stripe still needs:
                </p>
                <ul className='mt-1 list-inside list-disc text-xs text-amber-800'>
                  {status.requirements.slice(0, 5).map((requirement) => (
                    <li key={requirement}>{requirement.replace(/[._]/g, ' ')}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className='mt-5 flex flex-wrap items-end gap-3'>
              {!status?.connected ? (
                <div className='grid gap-1.5'>
                  <Label htmlFor='country' className='text-xs'>
                    Country of your bank account
                  </Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger id='country' className='w-56'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_COUNTRIES.map((option) => (
                        <SelectItem key={option.code} value={option.code}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              {!ready ? (
                <Button
                  disabled={onboard.isPending}
                  onClick={() => onboard.mutate({ country })}>
                  {onboard.isPending ? <Spinner className='mr-2' /> : null}
                  {status?.connected ? 'Continue onboarding' : 'Connect with Stripe'}
                </Button>
              ) : (
                <Button
                  variant='outline'
                  disabled={dashboard.isPending}
                  onClick={() => dashboard.mutate()}>
                  {dashboard.isPending ? (
                    <Spinner className='mr-2' />
                  ) : (
                    <ExternalLink className='mr-2 h-4 w-4' />
                  )}
                  Open Stripe dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
        <div className='rounded-xl border border-stone-200 p-5'>
          <p className='text-xs font-medium uppercase tracking-wide text-stone-500'>
            Paid out
          </p>
          <p className='mt-2 text-2xl font-bold text-emerald-600'>
            {formatPrice(stats?.paidOutCents ?? 0)}
          </p>
        </div>
        <div className='rounded-xl border border-stone-200 p-5'>
          <p className='text-xs font-medium uppercase tracking-wide text-stone-500'>
            Awaiting payout
          </p>
          <p className='mt-2 text-2xl font-bold text-stone-900'>
            {formatPrice(stats?.pendingCents ?? 0)}
          </p>
          {!ready && (stats?.pendingCents ?? 0) > 0 ? (
            <p className='mt-1 text-xs text-amber-700'>
              Released as soon as your Stripe account is verified.
            </p>
          ) : null}
        </div>
      </div>

      <p className='text-xs text-muted-foreground'>
        This demo runs against Stripe test mode. During onboarding you can use Stripe&apos;s
        test values — any test phone number, and{' '}
        <code className='rounded bg-stone-100 px-1 py-0.5 font-mono'>000000</code> as the
        SMS code.
      </p>
    </div>
  );
}
