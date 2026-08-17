import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-4 w-4 animate-spin', className)} />;
}

export function PageSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className='flex min-h-[40vh] flex-col items-center justify-center gap-3 text-muted-foreground'>
      <Spinner className='h-6 w-6' />
      <p className='text-sm'>{label}</p>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-200 bg-stone-50/60 px-6 py-16 text-center',
        className
      )}>
      {Icon ? (
        <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white ring-1 ring-stone-200'>
          <Icon className='h-5 w-5 text-stone-500' />
        </div>
      ) : null}
      <h3 className='text-base font-semibold text-stone-900'>{title}</h3>
      {description ? (
        <p className='mt-1.5 max-w-sm text-sm text-muted-foreground'>{description}</p>
      ) : null}
      {action ? (
        <Button asChild className='mt-6' size='sm'>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      ) : null}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className='rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center'>
      <h3 className='text-base font-semibold text-red-900'>{title}</h3>
      {description ? (
        <p className='mt-1.5 text-sm text-red-700'>{description}</p>
      ) : null}
      {onRetry ? (
        <Button onClick={onRetry} variant='outline' size='sm' className='mt-5'>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
