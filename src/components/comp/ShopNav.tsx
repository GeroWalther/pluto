import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { ChevronDown } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '@/config';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const ShopNav = () => {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className='overflow-visible'>
        <Button
          className='mt-3'
          onClick={() => setOpen((p) => !p)}
          variant={
            'ghost'
            // open ?
            // 'secondary' : 'ghost'
          }>
          Shop Products
          <ChevronDown
            className={cn('h-4 w-4 transition-all text-muted-foreground', {
              // '-rotate-180': open,
            })}
          />
        </Button>
      </DropdownMenuTrigger>
      {open && (
        <DropdownMenuContent>
          <DropdownMenuLabel className='p-2'>
            <p className=' text-sm'>Select a Category</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {PRODUCT_CATEGORIES.map((cat) => {
            return (
              <DropdownMenuItem key={cat.value}>
                <Link href={`/products?category=${cat.value}`}>
                  <span>{cat.label}</span>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};
