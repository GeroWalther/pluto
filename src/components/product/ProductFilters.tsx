'use client';

import { ProductCategory } from '@prisma/client';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PRODUCT_CATEGORIES, SORT_OPTIONS } from '@/config';
import { cn } from '@/lib/utils';

export type FilterState = {
  q: string;
  category: ProductCategory | 'all';
  sort: (typeof SORT_OPTIONS)[number]['value'];
  minEuros: string;
  maxEuros: string;
};

export const DEFAULT_FILTERS: FilterState = {
  q: '',
  category: 'all',
  sort: 'newest',
  minEuros: '',
  maxEuros: '',
};

export function ProductFilters({
  value,
  onChange,
  resultCount,
}: {
  value: FilterState;
  onChange: (next: FilterState) => void;
  resultCount?: number;
}) {
  const set = <K extends keyof FilterState>(key: K, next: FilterState[K]) =>
    onChange({ ...value, [key]: next });

  const isFiltered =
    value.category !== 'all' ||
    value.q !== '' ||
    value.minEuros !== '' ||
    value.maxEuros !== '';

  return (
    <aside className='space-y-7'>
      <div>
        <div className='mb-3 flex items-center justify-between'>
          <h2 className='text-sm font-semibold text-stone-900'>Filters</h2>
          {isFiltered ? (
            <button
              onClick={() => onChange({ ...DEFAULT_FILTERS, sort: value.sort })}
              className='inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-stone-900'>
              <X className='h-3 w-3' /> Clear
            </button>
          ) : null}
        </div>
        {resultCount !== undefined ? (
          <p className='text-xs text-muted-foreground'>
            {resultCount} {resultCount === 1 ? 'product' : 'products'}
          </p>
        ) : null}
      </div>

      <div>
        <Label className='text-xs font-semibold uppercase tracking-wide text-stone-500'>
          Sort by
        </Label>
        <div className='mt-2 grid gap-1'>
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => set('sort', option.value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-left text-sm transition-colors',
                value.sort === option.value
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-100'
              )}>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className='text-xs font-semibold uppercase tracking-wide text-stone-500'>
          Category
        </Label>
        <div className='mt-2 grid gap-1'>
          <button
            onClick={() => set('category', 'all')}
            className={cn(
              'rounded-md px-3 py-1.5 text-left text-sm transition-colors',
              value.category === 'all'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            )}>
            All categories
          </button>
          {PRODUCT_CATEGORIES.map((category) => (
            <button
              key={category.value}
              onClick={() => set('category', category.value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-left text-sm transition-colors',
                value.category === category.value
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-100'
              )}>
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className='text-xs font-semibold uppercase tracking-wide text-stone-500'>
          Price (€)
        </Label>
        <div className='mt-2 flex items-center gap-2'>
          <Input
            type='number'
            min={0}
            inputMode='decimal'
            placeholder='Min'
            aria-label='Minimum price in euros'
            value={value.minEuros}
            onChange={(e) => set('minEuros', e.target.value)}
            className='h-9'
          />
          <span className='text-muted-foreground'>–</span>
          <Input
            type='number'
            min={0}
            inputMode='decimal'
            placeholder='Max'
            aria-label='Maximum price in euros'
            value={value.maxEuros}
            onChange={(e) => set('maxEuros', e.target.value)}
            className='h-9'
          />
        </div>
      </div>
    </aside>
  );
}

export function ActiveFilterChips({
  value,
  onChange,
}: {
  value: FilterState;
  onChange: (next: FilterState) => void;
}) {
  const chips: { label: string; clear: () => void }[] = [];

  if (value.q) {
    chips.push({
      label: `“${value.q}”`,
      clear: () => onChange({ ...value, q: '' }),
    });
  }

  if (value.category !== 'all') {
    const category = PRODUCT_CATEGORIES.find((c) => c.value === value.category);
    chips.push({
      label: category?.label ?? value.category,
      clear: () => onChange({ ...value, category: 'all' }),
    });
  }

  if (value.minEuros || value.maxEuros) {
    chips.push({
      label: `€${value.minEuros || '0'}–${value.maxEuros || '∞'}`,
      clear: () => onChange({ ...value, minEuros: '', maxEuros: '' }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className='mb-5 flex flex-wrap gap-2'>
      {chips.map((chip) => (
        <Button
          key={chip.label}
          variant='outline'
          size='sm'
          className='h-7 gap-1.5 rounded-full text-xs'
          onClick={chip.clear}>
          {chip.label}
          <X className='h-3 w-3' />
        </Button>
      ))}
    </div>
  );
}
