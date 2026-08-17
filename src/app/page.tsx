import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Download,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import MaxWidthWrapper from '@/components/shared/MaxWidthWrapper';
import { ProductReel } from '@/components/product/ProductReel';
import { Button } from '@/components/ui/button';
import { PLATFORM_FEE_LABEL, PRODUCT_CATEGORIES } from '@/config';
import { cn } from '@/lib/utils';

const perks = [
  {
    name: 'Instant delivery',
    Icon: Download,
    description:
      'Files unlock the moment Stripe confirms the payment. No waiting, no manual sending.',
  },
  {
    name: 'Reviewed listings',
    Icon: BadgeCheck,
    description:
      'Every product is checked by a moderator before it can appear in the catalogue.',
  },
  {
    name: 'Protected downloads',
    Icon: ShieldCheck,
    description:
      'Download links are signed, expiring, and tied to your account — files are never public.',
  },
  {
    name: `Sellers keep 95%`,
    Icon: Wallet,
    description: `Pluto takes a flat ${PLATFORM_FEE_LABEL} commission. Earnings are transferred to your Stripe account automatically.`,
  },
];

export default function Home() {
  return (
    <>
      <section className='relative overflow-hidden border-b border-stone-200 bg-gradient-to-b from-indigo-50/70 via-white to-white'>
        <MaxWidthWrapper className='py-20 sm:py-28'>
          <div className='mx-auto max-w-2xl text-center'>
            <span className='inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200'>
              <span className='h-1.5 w-1.5 rounded-full bg-indigo-500' />
              Open-source marketplace built with Next.js and Stripe Connect
            </span>

            <h1 className='mt-6 text-4xl font-bold tracking-tight text-stone-900 sm:text-6xl'>
              Digital products,{' '}
              <span className='text-indigo-600'>delivered instantly</span>
            </h1>

            <p className='mt-6 text-lg leading-relaxed text-muted-foreground'>
              Buy UI kits, icons, fonts and templates from independent creators — or
              list your own and get paid out automatically.
            </p>

            <div className='mt-9 flex flex-col justify-center gap-3 sm:flex-row'>
              <Button asChild size='lg'>
                <Link href='/products'>
                  Browse the catalogue
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Link>
              </Button>
              <Button asChild size='lg' variant='outline'>
                <Link href='/sell'>Start selling</Link>
              </Button>
            </div>
          </div>
        </MaxWidthWrapper>
      </section>

      <MaxWidthWrapper className='py-14'>
        <div className='flex flex-wrap gap-2.5'>
          {PRODUCT_CATEGORIES.map((category) => (
            <Link
              key={category.value}
              href={`/products?category=${category.value}`}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium ring-1 transition-transform hover:-translate-y-0.5',
                category.accent
              )}>
              {category.label}
            </Link>
          ))}
        </div>
      </MaxWidthWrapper>

      <MaxWidthWrapper className='space-y-16 pb-16'>
        <ProductReel
          title='New arrivals'
          subtitle='The latest products approved by our moderators'
          href='/products'
          sort='newest'
          limit={4}
        />
        <ProductReel
          title='Best sellers'
          subtitle='What buyers are picking up most'
          href='/products?sort=popular'
          sort='popular'
          limit={4}
        />
      </MaxWidthWrapper>

      <section className='border-t border-stone-200 bg-stone-50'>
        <MaxWidthWrapper className='py-16'>
          <div className='grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4'>
            {perks.map((perk) => (
              <div key={perk.name}>
                <div className='flex h-11 w-11 items-center justify-center rounded-lg bg-white ring-1 ring-stone-200'>
                  <perk.Icon className='h-5 w-5 text-indigo-600' />
                </div>
                <h3 className='mt-4 text-sm font-semibold text-stone-900'>
                  {perk.name}
                </h3>
                <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
                  {perk.description}
                </p>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>
    </>
  );
}
