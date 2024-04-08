'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '../ui/command';

// state/reducer to set value and pass to combobox?
const values = [
  {
    value: 'imageUploader',
    label: 'Image (PGN, JPEG)',
  },
  {
    value: 'svnUploader',
    label: 'SVN',
  },
  {
    value: 'pdfUploader',
    label: 'PDF',
  },
  {
    value: 'ttfFontUploader',
    label: 'ttf',
  },
  {
    value: 'otfFontUploader',
    label: 'otf',
  },
  {
    value: 'epubUploader',
    label: 'epub',
  },
  {
    value: 'mobiUploader',
    label: 'mobi',
  },
  {
    value: 'txtUploader',
    label: 'txt (plain text)',
  },
  {
    value: 'markdownUploader',
    label: 'MD Markdown',
  },
  {
    value: 'jsonUploader',
    label: 'JSON',
  },
];

export function Combobox({ value, setValue }: any) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-[200px] justify-between'>
          {value
            ? values.find((v: any) => v.value === value)?.label
            : 'Select a format...'}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[200px] p-0'>
        <Command>
          <CommandInput placeholder='Search framework...' />
          <CommandEmpty>No format found.</CommandEmpty>
          <CommandGroup>
            {values.map((v: any) => (
              <CommandItem
                key={v.value}
                value={v.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? '' : currentValue);
                  setOpen(false);
                }}>
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === v.value ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {v.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
