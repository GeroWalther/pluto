'use client';

import Image from 'next/image';
import { FileIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { UploadDropzone } from '@/lib/uploadthing';
import { Button } from '@/components/ui/button';

export type UploadedFile = { url: string; key: string; name: string };

export function FileUploadField({
  endpoint,
  files,
  onChange,
  max,
  label,
  hint,
  preview = false,
}: {
  endpoint: 'productImage' | 'productFile';
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  max: number;
  label: string;
  hint: string;
  /** Show image thumbnails instead of a file list. */
  preview?: boolean;
}) {
  const removeAt = (key: string) => onChange(files.filter((f) => f.key !== key));

  return (
    <div>
      <div className='mb-1.5 flex items-baseline justify-between'>
        <label className='text-sm font-medium text-stone-900'>{label}</label>
        <span className='text-xs text-muted-foreground'>
          {files.length} / {max}
        </span>
      </div>
      <p className='mb-3 text-xs text-muted-foreground'>{hint}</p>

      {files.length > 0 ? (
        preview ? (
          <div className='mb-4 flex flex-wrap gap-3'>
            {files.map((file) => (
              <div
                key={file.key}
                className='group relative h-24 w-24 overflow-hidden rounded-lg border border-stone-200'>
                <Image src={file.url} alt={file.name} fill sizes='96px' className='object-cover' />
                <button
                  type='button'
                  onClick={() => removeAt(file.key)}
                  aria-label={`Remove ${file.name}`}
                  className='absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow ring-1 ring-stone-200 transition-opacity hover:bg-white'>
                  <X className='h-3 w-3' />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <ul className='mb-4 space-y-2'>
            {files.map((file) => (
              <li
                key={file.key}
                className='flex items-center gap-2.5 rounded-lg border border-stone-200 px-3 py-2'>
                <FileIcon className='h-4 w-4 shrink-0 text-stone-400' />
                <span className='min-w-0 flex-1 truncate text-sm'>{file.name}</span>
                <Button
                  type='button'
                  size='sm'
                  variant='ghost'
                  onClick={() => removeAt(file.key)}
                  aria-label={`Remove ${file.name}`}>
                  <X className='h-4 w-4' />
                </Button>
              </li>
            ))}
          </ul>
        )
      ) : null}

      {files.length < max ? (
        <UploadDropzone
          endpoint={endpoint}
          config={{ mode: 'auto' }}
          onClientUploadComplete={(uploaded) => {
            const next = uploaded.map((file) => ({
              url: file.serverData.url,
              key: file.serverData.key,
              name: file.serverData.name,
            }));
            onChange([...files, ...next].slice(0, max));
            toast.success(`Uploaded ${next.length} file${next.length === 1 ? '' : 's'}`);
          }}
          onUploadError={(error) => {
            toast.error(error.message);
          }}
          appearance={{
            container:
              'border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/60 py-8 ut-uploading:opacity-70',
            label: 'text-sm text-stone-600 hover:text-indigo-600',
            allowedContent: 'text-xs text-stone-400',
            button:
              'bg-stone-900 text-white text-sm h-9 px-4 rounded-md after:bg-indigo-600',
          }}
        />
      ) : null}
    </div>
  );
}
