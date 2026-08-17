import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CreditCard, FileUp, ShieldCheck, TrendingUp } from 'lucide-react';
import { auth } from '@/lib/auth';
import { constructMetadata } from '@/lib/utils';
import MaxWidthWrapper from '@/components/shared/MaxWidthWrapper';
import { Button } from '@/components/ui/button';
import { PLATFORM_FEE_LABEL } from '@/config';

export const metadata = constructMetadata({
  title: 'Sell on Pluto Market',
  description:
    'List your digital products, reach buyers, and get paid automatically through Stripe. Pluto keeps a flat 5% commission.',
});

const steps = [
  {
    Icon: CreditCard,
    title: 'Connect Stripe',
    body: 'A one-time Stripe Connect onboarding tells us where to send your money. Takes about two minutes.',
  },
  {
    Icon: FileUp,
    title: 'Upload your product',
    body: 'Add preview images, the files buyers receive, a description and a price.',
  },
  {
    Icon: ShieldCheck,
    title: 'Get approved',
    body: 'A moderator reviews the listing so buyers can trust what is in the catalogue.',
  },
  {
    Icon: TrendingUp,
    title: 'Get paid',
    body: `Every sale transfers your share to Stripe automatically. Pluto keeps ${PLATFORM_FEE_LABEL} — you keep the rest.`,
  },
];

export default async function SellPage() {
  const session = await auth();

  // Signed-in sellers do not need the pitch — send them straight to the form.
  if (session?.user) redirect('/dashboard/products/new');

  return (
    <>
      <section className='border-b border-stone-200 bg-gradient-to-b from-indigo-50/70 to-white'>
        <MaxWidthWrapper className='py-20 text-center'>
          <h1 className='mx-auto max-w-2xl text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl'>
            Sell your digital work, keep{' '}
            <span className='text-indigo-600'>95% of every sale</span>
          </h1>
          <p className='mx-auto mt-6 max-w-xl text-lg text-muted-foreground'>
            No monthly fee, no listing fee. Upload once and Pluto handles checkout,
            delivery and payouts.
          </p>
          <div className='mt-9 flex flex-col justify-center gap-3 sm:flex-row'>
            <Button asChild size='lg'>
              <Link href='/sign-up'>Create a seller account</Link>
            </Button>
            <Button asChild size='lg' variant='outline'>
              <Link href='/products'>See what sells</Link>
            </Button>
          </div>
        </MaxWidthWrapper>
      </section>

      <MaxWidthWrapper className='py-20'>
        <div className='grid gap-10 sm:grid-cols-2 lg:grid-cols-4'>
          {steps.map((step, index) => (
            <div key={step.title}>
              <div className='flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50'>
                <step.Icon className='h-5 w-5 text-indigo-600' />
              </div>
              <p className='mt-4 text-xs font-semibold uppercase tracking-wide text-indigo-600'>
                Step {index + 1}
              </p>
              <h2 className='mt-1 text-sm font-semibold text-stone-900'>
                {step.title}
              </h2>
              <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </MaxWidthWrapper>
    </>
  );
}
