import Link from 'next/link';
import MaxWidthWrapper from '@/components/shared/MaxWidthWrapper';
import { PRODUCT_CATEGORIES } from '@/config';

export default function Footer() {
  return (
    <footer className='mt-20 border-t border-stone-200 bg-stone-50'>
      <MaxWidthWrapper className='py-12'>
        <div className='grid gap-10 sm:grid-cols-2 lg:grid-cols-4'>
          <div>
            <Link href='/' className='text-lg font-bold tracking-tight'>
              Pluto<span className='text-indigo-600'>Market</span>
            </Link>
            <p className='mt-3 max-w-xs text-sm text-muted-foreground'>
              A marketplace for digital products. Instant delivery, secure payments,
              and payouts straight to sellers.
            </p>
          </div>

          <div>
            <h3 className='text-sm font-semibold text-stone-900'>Categories</h3>
            <ul className='mt-3 space-y-2'>
              {PRODUCT_CATEGORIES.slice(0, 5).map((category) => (
                <li key={category.value}>
                  <Link
                    href={`/products?category=${category.value}`}
                    className='text-sm text-muted-foreground hover:text-stone-900'>
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className='text-sm font-semibold text-stone-900'>Account</h3>
            <ul className='mt-3 space-y-2'>
              <li>
                <Link
                  href='/library'
                  className='text-sm text-muted-foreground hover:text-stone-900'>
                  My library
                </Link>
              </li>
              <li>
                <Link
                  href='/dashboard'
                  className='text-sm text-muted-foreground hover:text-stone-900'>
                  Seller dashboard
                </Link>
              </li>
              <li>
                <Link
                  href='/sell'
                  className='text-sm text-muted-foreground hover:text-stone-900'>
                  Start selling
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='text-sm font-semibold text-stone-900'>Project</h3>
            <ul className='mt-3 space-y-2'>
              <li>
                <a
                  href='https://github.com/GeroWalther/pluto'
                  target='_blank'
                  rel='noreferrer'
                  className='text-sm text-muted-foreground hover:text-stone-900'>
                  Source on GitHub
                </a>
              </li>
              <li>
                <Link
                  href='/products'
                  className='text-sm text-muted-foreground hover:text-stone-900'>
                  Browse products
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className='mt-10 flex flex-col gap-2 border-t border-stone-200 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between'>
          <p>&copy; {new Date().getFullYear()} Pluto Market. Built by Gero Walther.</p>
          <p>
            Demo project — payments run in Stripe test mode. No real money changes
            hands.
          </p>
        </div>
      </MaxWidthWrapper>
    </footer>
  );
}
