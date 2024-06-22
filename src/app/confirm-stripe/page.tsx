'use client';

import MaxWidthWrapper from '@/components/comp/MaxWidthWrapper';
import { trpc } from '@/trpc/client';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

import prisma from '@/db/db';
import { useSession } from 'next-auth/react';

const Page = () => {
  const { data: session } = useSession();
  const user = session?.user;

  // acct_1PJdsWQuGMERmHeX
  const search = useSearchParams();
  const stripeaccountId = search.get('account');
  const { data, mutate } = trpc.stripe.confirmStripe.useMutation({
    onSuccess: async () => {
      // update user table with payout_status = 'enabled'
      await prisma.user.update({
        where: {
          id: user?.id,
        },
        data: {
          payout_status: 'enabled',
        },
      });

      toast.success('Stripe account confirmed');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (stripeaccountId) {
      mutate(stripeaccountId);
    }
  }, [stripeaccountId, mutate]);

  return (
    <article className='py-10'>
      <MaxWidthWrapper>
        <h2 className='text-3xl font-bold mb-4'>
          You have connected the stripe Id
        </h2>
        <section className='mb-8'>
          <h3 className='text-xl font-bold mb-2'>Introduction</h3>
          <p className='text-stone-700'>Account id : {data?.id}</p>
        </section>
      </MaxWidthWrapper>
    </article>
  );
};

export default Page;
