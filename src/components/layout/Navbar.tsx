'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  ShoppingCart,
  User as UserIcon,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import MaxWidthWrapper from '@/components/shared/MaxWidthWrapper';
import { PRODUCT_CATEGORIES } from '@/config';
import { useCart } from '@/hooks/use-cart';
import { cn } from '@/lib/utils';

function CartBadge() {
  const productIds = useCart((s) => s.productIds);
  const [mounted, setMounted] = useState(false);

  // The cart lives in localStorage, so the count can only be rendered after
  // hydration without causing a server/client mismatch.
  useEffect(() => setMounted(true), []);

  if (!mounted || productIds.length === 0) return null;

  return (
    <span className='absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white'>
      {productIds.length}
    </span>
  );
}

function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const [value, setValue] = useState('');

  return (
    <form
      className={cn('relative', className)}
      onSubmit={(e) => {
        e.preventDefault();
        const q = value.trim();
        router.push(q ? `/products?q=${encodeURIComponent(q)}` : '/products');
      }}>
      <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400' />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder='Search digital products…'
        aria-label='Search products'
        className='h-9 pl-9'
      />
    </form>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = session?.user;
  const initials = (user?.name ?? user?.email ?? '?').slice(0, 2).toUpperCase();

  return (
    <header className='sticky top-0 z-50 border-b border-stone-200 bg-white/85 backdrop-blur'>
      <MaxWidthWrapper>
        <div className='flex h-16 items-center gap-4'>
          <Link href='/' className='shrink-0 text-lg font-bold tracking-tight'>
            Pluto<span className='text-indigo-600'>Market</span>
          </Link>

          <nav className='hidden items-center gap-1 lg:flex'>
            <Link
              href='/products'
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900',
                pathname === '/products' && 'text-stone-900'
              )}>
              Browse all
            </Link>
            {PRODUCT_CATEGORIES.slice(0, 4).map((category) => (
              <Link
                key={category.value}
                href={`/products?category=${category.value}`}
                className='rounded-md px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900'>
                {category.label}
              </Link>
            ))}
          </nav>

          <SearchBar className='ml-auto hidden w-full max-w-xs md:block' />

          <div className='ml-auto flex items-center gap-1 md:ml-0'>
            <Button asChild variant='ghost' size='icon' className='relative'>
              <Link href='/cart' aria-label='Cart'>
                <ShoppingCart className='h-5 w-5' />
                <CartBadge />
              </Link>
            </Button>

            {status === 'loading' ? (
              <div className='h-9 w-9 animate-pulse rounded-full bg-stone-100' />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className='rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                    aria-label='Account menu'>
                    <Avatar className='h-9 w-9'>
                      {user.image ? <AvatarImage src={user.image} alt='' /> : null}
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align='end' className='w-56'>
                  <DropdownMenuLabel className='truncate font-normal'>
                    <span className='block text-sm font-medium'>{user.name}</span>
                    <span className='block truncate text-xs text-muted-foreground'>
                      {user.email}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href='/library'>
                      <Library className='mr-2 h-4 w-4' /> My library
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href='/dashboard'>
                      <LayoutDashboard className='mr-2 h-4 w-4' /> Seller dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href='/account'>
                      <UserIcon className='mr-2 h-4 w-4' /> Account settings
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'ADMIN' ? (
                    <DropdownMenuItem asChild>
                      <Link href='/admin'>
                        <ShieldCheck className='mr-2 h-4 w-4' /> Admin
                      </Link>
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                    <LogOut className='mr-2 h-4 w-4' /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className='hidden items-center gap-2 sm:flex'>
                <Button asChild variant='ghost' size='sm'>
                  <Link href='/sign-in'>Sign in</Link>
                </Button>
                <Button asChild size='sm'>
                  <Link href='/sign-up'>Start selling</Link>
                </Button>
              </div>
            )}

            <Button
              variant='ghost'
              size='icon'
              className='lg:hidden'
              aria-label='Toggle menu'
              onClick={() => setMobileOpen((open) => !open)}>
              {mobileOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
            </Button>
          </div>
        </div>

        {mobileOpen ? (
          <div className='border-t border-stone-200 py-4 lg:hidden'>
            <SearchBar className='mb-4 md:hidden' />
            <div className='grid gap-1'>
              <Link
                href='/products'
                onClick={() => setMobileOpen(false)}
                className='rounded-md px-3 py-2 text-sm font-medium hover:bg-stone-100'>
                Browse all
              </Link>
              {PRODUCT_CATEGORIES.map((category) => (
                <Link
                  key={category.value}
                  href={`/products?category=${category.value}`}
                  onClick={() => setMobileOpen(false)}
                  className='rounded-md px-3 py-2 text-sm text-stone-600 hover:bg-stone-100'>
                  {category.label}
                </Link>
              ))}
              {!user ? (
                <div className='mt-3 flex gap-2 px-3'>
                  <Button asChild variant='outline' size='sm' className='flex-1'>
                    <Link href='/sign-in'>Sign in</Link>
                  </Button>
                  <Button asChild size='sm' className='flex-1'>
                    <Link href='/sign-up'>Start selling</Link>
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </MaxWidthWrapper>
    </header>
  );
}
