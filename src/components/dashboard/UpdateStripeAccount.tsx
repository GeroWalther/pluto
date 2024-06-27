'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { trpc } from '@/trpc/client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

export const UpdateStripeAccountButton = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>Finish Onboarding</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-center m-2'>
            Finish your Stripe account creation
          </DialogTitle>
        </DialogHeader>
        <FinishButton />
      </DialogContent>
    </Dialog>
  );
};

const FinishButton = () => {
  const router = useRouter();
  const { data, mutate } = trpc.stripe.finishOnboarding.useMutation({
    onSuccess: () => {
      toast.success('Redirecting to Stripe...');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  useEffect(() => {
    if (data) {
      router.push(data.url);
    }
  }, [data, router]);

  function onSubmit() {
    mutate();
  }
  return (
    <div className='space-y-6'>
      <div className='flex flex-col'>
        <p>
          You already have started to create a Stripe account. Finish your
          Stripe account creation and connect it to Pluto in order to get payed
          out.
        </p>
        <p>Please click below to finish onboarding and continue!</p>
      </div>
      <Button onClick={onSubmit}>Finish</Button>
    </div>
  );
};
