'use client';
import {
  BadgeDollarSign,
  LineChart,
  Menu,
  Package,
  Package2,
  Search,
} from 'lucide-react';

import UploadDrawerDialog from '@/components/comp/UploadDrawerDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useReducer } from 'react';
import IsProAd from '../comp/IsProAd';
import { User } from 'next-auth';

const initialState = {
  content: 'products',
  products: null, // will be an array of product images
};
const reducer = (state: any, action: any) => {
  switch (action.type) {
    case 'SHOW_PRODUCTS':
      return { content: 'products' };
    case 'SHOW_SALES':
      return { content: 'sales' };
    case 'SHOW_ANALYTICS':
      return { content: 'analytics' };
    default:
      return state;
  }
};

export default function SellerDashboard({ user }: { user: User }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  console.log(state?.products?.length);

  return (
    <div className='grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]'>
      <div className='hidden border-r bg-muted/40 md:block'>
        <div className='flex h-full max-h-screen flex-col gap-2'>
          <div className='flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6'>
            <p className='flex items-center gap-5 font-semibold'>
              <Package2 className='h-6 w-6' />
              <span className=' font-bold text-lg uppercase'>{user.name}</span>
            </p>
          </div>

          {/* Side Nav Desktop */}
          <div className='flex-1'>
            <nav className='grid items-start px-2 text-sm font-medium lg:px-4'>
              <button
                onClick={() => dispatch({ type: 'SHOW_PRODUCTS' })}
                className='flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary'>
                <Package className='h-4 w-4' />
                Products{' '}
              </button>
              <button
                onClick={() => dispatch({ type: 'SHOW_SALES' })}
                className='flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary'>
                <BadgeDollarSign className='h-5 w-5' />
                Sales
              </button>
              <button
                onClick={() => dispatch({ type: 'SHOW_ANALYTICS' })}
                className='flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary'>
                <LineChart className='h-5 w-5' />
                Analytics
              </button>
            </nav>
          </div>
          <IsProAd />
        </div>
      </div>
      <div className='flex flex-col'>
        <header className='flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6'>
          {/* Mobile Nav */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant='outline'
                size='icon'
                className='shrink-0 md:hidden'>
                <Menu className='h-5 w-5' />
                <span className='sr-only'>Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side='left' className='flex flex-col'>
              <nav className='grid gap-2 text-lg font-medium'>
                <p className='flex items-center gap-5 text-lg font-semibold mb-4'>
                  <Package2 />
                  <span className=' font-bold text-lg uppercase'>
                    {user.name}
                  </span>
                </p>
                <button
                  onClick={() => dispatch({ type: 'SHOW_PRODUCTS' })}
                  className='mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground'>
                  <Package className='h-5 w-5' />
                  Products
                </button>
                <button
                  onClick={() => dispatch({ type: 'SHOW_SALES' })}
                  className='mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground'>
                  <BadgeDollarSign className='h-5 w-5' />
                  Sales
                  <Badge className='ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full'>
                    6
                  </Badge>
                </button>
                <button
                  onClick={() => dispatch({ type: 'SHOW_ANALYTICS' })}
                  className='mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground'>
                  <LineChart className='h-5 w-5' />
                  Analytics
                </button>
              </nav>
              <IsProAd />
            </SheetContent>
          </Sheet>

          {/* Right Side Main content */}
          <div className='w-full flex-1'>
            <form>
              <div className='relative'>
                <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  type='search'
                  placeholder='Search products...'
                  className='w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3'
                />
              </div>
            </form>
          </div>
        </header>
        {state.content === 'products' && (
          <main className='flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6'>
            <div className='flex items-center'>
              <h1 className='text-lg font-semibold md:text-2xl'>Inventory</h1>
            </div>
            <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm'>
              <div className='flex flex-col items-center gap-1 text-center'>
                {!state.products && (
                  <>
                    <h3 className='text-2xl font-bold tracking-tight'>
                      You have no products
                    </h3>
                    <p className='text-sm text-muted-foreground mb-5'>
                      You can start selling as soon as you add a product.
                    </p>
                    <UploadDrawerDialog />
                  </>
                )}
              </div>
            </div>
          </main>
        )}
        {state.content === 'sales' && (
          <main className='flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6'>
            <div className='flex items-center'>
              <h1 className='text-lg font-semibold md:text-2xl'>Sales</h1>
            </div>
          </main>
        )}
        {state.content === 'analytics' && (
          <main className='flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6'>
            <div className='flex items-center'>
              <h1 className='text-lg font-semibold md:text-2xl'>Analytics</h1>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
