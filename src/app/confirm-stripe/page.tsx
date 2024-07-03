'use client';

import MaxWidthWrapper from '@/components/comp/MaxWidthWrapper';
import { trpc } from '@/trpc/client';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

import prisma from '@/db/db';
import { useSession } from 'next-auth/react';

const Page = () => {
  //const { data: session } = useSession();
  // const user = session?.user;

  const search = useSearchParams();
  const stripeaccountId = search.get('account');
  const { data, mutate, isSuccess } = trpc.stripe.confirmStripe.useMutation({
    onSuccess: async (data) => {
      console.log(data);
      toast.success('Stripe account confirmed');
    },
    onError: async (error) => {
      console.log(error);
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
          <p className='text-stone-700'>Account id : {stripeaccountId}</p>
          {!data && isSuccess && <p>Your account is not finished</p>}
        </section>
      </MaxWidthWrapper>
    </article>
  );
};

export default Page;
