'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StarRating({
  value,
  size = 14,
  className,
  onChange,
}: {
  value: number;
  size?: number;
  className?: string;
  /** Pass to make the widget interactive. */
  onChange?: (rating: number) => void;
}) {
  const interactive = Boolean(onChange);

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(value);
        const Icon = (
          <Star
            width={size}
            height={size}
            className={cn(
              filled ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-200',
              interactive && 'transition-transform hover:scale-110'
            )}
          />
        );

        return interactive ? (
          <button
            key={star}
            type='button'
            onClick={() => onChange?.(star)}
            aria-label={`Rate ${star} out of 5`}
            className='rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
            {Icon}
          </button>
        ) : (
          <span key={star}>{Icon}</span>
        );
      })}
    </div>
  );
}
