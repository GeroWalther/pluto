import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export function StatCard({
  label,
  value,
  hint,
  Icon,
  loading,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  hint?: string;
  Icon?: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  tone?: 'default' | 'positive' | 'warning';
}) {
  return (
    <div className='rounded-xl border border-stone-200 bg-white p-5'>
      <div className='flex items-center justify-between'>
        <p className='text-xs font-medium uppercase tracking-wide text-stone-500'>
          {label}
        </p>
        {Icon ? <Icon className='h-4 w-4 text-stone-400' /> : null}
      </div>

      {loading ? (
        <Skeleton className='mt-3 h-8 w-24' />
      ) : (
        <p
          className={cn(
            'mt-2 text-2xl font-bold tracking-tight',
            tone === 'positive' && 'text-emerald-600',
            tone === 'warning' && 'text-amber-600',
            tone === 'default' && 'text-stone-900'
          )}>
          {value}
        </p>
      )}

      {hint ? <p className='mt-1 text-xs text-muted-foreground'>{hint}</p> : null}
    </div>
  );
}
