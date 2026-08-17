'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * A small gallery with thumbnails. Deliberately dependency-free — the old
 * version pulled in a full carousel library for four images.
 */
export function ImageGallery({ urls, alt }: { urls: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  if (urls.length === 0) {
    return (
      <div className='flex aspect-square w-full items-center justify-center rounded-xl bg-stone-100'>
        <ImageIcon className='h-10 w-10 text-stone-300' />
      </div>
    );
  }

  const step = (delta: number) =>
    setActive((current) => (current + delta + urls.length) % urls.length);

  return (
    <div className='space-y-3'>
      <div className='group relative aspect-square w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-50'>
        <Image
          src={urls[active]}
          alt={`${alt} — image ${active + 1} of ${urls.length}`}
          fill
          priority
          sizes='(max-width: 1024px) 100vw, 50vw'
          className='object-contain'
        />

        {urls.length > 1 ? (
          <>
            <button
              onClick={() => step(-1)}
              aria-label='Previous image'
              className='absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 opacity-0 shadow ring-1 ring-stone-200 transition-opacity hover:bg-white group-hover:opacity-100 focus-visible:opacity-100'>
              <ChevronLeft className='h-4 w-4' />
            </button>
            <button
              onClick={() => step(1)}
              aria-label='Next image'
              className='absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 opacity-0 shadow ring-1 ring-stone-200 transition-opacity hover:bg-white group-hover:opacity-100 focus-visible:opacity-100'>
              <ChevronRight className='h-4 w-4' />
            </button>
          </>
        ) : null}
      </div>

      {urls.length > 1 ? (
        <div className='flex gap-2.5'>
          {urls.map((url, index) => (
            <button
              key={url}
              onClick={() => setActive(index)}
              aria-label={`Show image ${index + 1}`}
              className={cn(
                'relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-stone-50 transition-colors',
                index === active
                  ? 'border-indigo-600'
                  : 'border-transparent hover:border-stone-300'
              )}>
              <Image src={url} alt='' fill sizes='64px' className='object-cover' />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
