import MaxWidthWrapper from '@/components/comp/MaxWidthWrapper';
import {
  ArrowBigDown,
  ArrowBigDownDash,
  ArrowBigDownDashIcon,
  ArrowDownAZ,
  ArrowDownFromLineIcon,
} from 'lucide-react';
import Image from 'next/image';
import React from 'react';

export default function page() {
  return (
    <article className='py-10'>
      <MaxWidthWrapper>
        <h2 className='text-3xl font-bold mb-4'>How to Find Your Stripe ID</h2>
        <section className='mb-8'>
          <h3 className='text-xl font-bold mb-2'>Introduction</h3>
          <p className='text-stone-700'>
            Your Stripe ID is a unique identifier that is used to connect your
            Stripe account to your website. This ID is crucial for processing
            payments and managing your account. In this article, we will guide
            you through the process of finding your Stripe ID within your Stripe
            Dashboard.
          </p>
        </section>

        <section className='mb-8'>
          <h3 className='text-xl font-bold mb-2'>
            Step 1: Logging into Your Stripe Account
          </h3>
          <p className='text-stone-700'>
            To begin, log into your Stripe account using your credentials.
          </p>
          <p className='text-stone-700'>
            Once logged in, you will be directed to your Stripe Dashboard.
          </p>
          <ArrowBigDown className='h-10 w-10 mt-5' />
        </section>

        <section className='mb-8'>
          <h3 className='text-xl font-bold mb-2'>
            Step 2: Navigating to the Developers Tab
          </h3>
          <p className='text-stone-700'>
            On the top-right-hand side of the screen, you will find a navigation
            menu.
          </p>
          <p className='text-stone-700'>
            Click on the gear icon and you will see the profile section. Click
            on it.
          </p>

          <Image
            src='/stripe-menu-for-id.png'
            width={800}
            height={800}
            alt='stripe menu'
            className='mt-6'
          />
          <ArrowBigDown className='h-10 w-10 mt-5' />
        </section>

        <section className='mb-8'>
          <h3 className='text-xl font-bold mb-2'>
            Step 3: Locating Your Stripe ID
          </h3>
          <p className='text-stone-700'>
            After accessing the Profile tab, your Stripe ID will be displayed at
            the bottom right of the screen under the Accounts section. Scroll
            all the way down. It is a unique alphanumeric code that identifies
            your Stripe account.
          </p>
          <Image
            src='/stripe-id.png'
            width={1000}
            height={1000}
            alt='Stripe ID'
          />
        </section>

        <section className='mb-8'>
          <h3 className='text-xl font-bold mb-2'>Congratulations!</h3>
          <p className='text-stone-700'>
            You have successfully found your Stripe ID within your Stripe
            Dashboard.
          </p>
          <p className='text-stone-700 font-bold'>
            Copy it and provide it to us in the seller dashboard in order to
            connect your stripe account.
          </p>
          <p className='text-stone-700'>
            This ID is essential for connecting your Stripe account to your
            website and processing payments. Make sure to keep your Stripe ID
            secure and use it responsibly.
          </p>
        </section>
      </MaxWidthWrapper>
    </article>
  );
}
