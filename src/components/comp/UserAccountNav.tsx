'use client';

import { useSignOut } from '@/hooks/use-sign-out';

import Link from 'next/link';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { User } from 'next-auth';

export default function UserAccountNav({ user }: { user: User }) {
  const { plutoSignOut } = useSignOut();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className='overflow-visible'>
        <Button className='relative' size='sm' variant='ghost'>
          My account
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className='bg-white w-60 align-end'>
        <div className='flex items-center justify-start gap-2 p-2'>
          <p className='font-medium text-sm text-stone-900'>{user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href='/dashboard'>Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={plutoSignOut} className=' cursor-pointer'>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
