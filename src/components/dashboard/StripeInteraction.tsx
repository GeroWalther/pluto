import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { trpc } from '@/trpc/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import Loader from '../Loader/Loader';
import Link from 'next/link';
import { User } from 'next-auth';
import { CheckCircle2 } from 'lucide-react';
import { Separator } from '../ui/separator';
import { useQueryClient } from '@tanstack/react-query';

const schemaStripe = z.object({
  stripeId: z.string(),
});

type FormTypeStripe = z.infer<typeof schemaStripe>;

const TransferMoneyButton = ({ balance }: { balance: number }) => {
  const [amount, setAmount] = useState(() => Number(balance));
  const [open, setOpen] = useState(false);
  const { data, mutate, isPending } = trpc.stripe.transferMoney.useMutation({
    onSuccess: () => {
      toast.success(data);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleTransfer = () => {
    mutate(amount);
    setTimeout(() => {
      setOpen(false);
    }, 1000);
  };

  return (
    <Dialog open={open}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          className='bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded-md'>
          Transfer money
        </Button>
      </DialogTrigger>
      <DialogContent setOpen={setOpen} className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold'>
            Transfer Money to Stripe
          </DialogTitle>
          <DialogDescription>
            If you would like to transfer money to your Stripe account, select
            an amount and then click transfer.
          </DialogDescription>
        </DialogHeader>
        <div className='flex items-center space-x-2'>
          <div className='grid flex-1 gap-2'>
            <div>
              <p className='font-semibold'>
                Total currently available balance:{' '}
                <span className='font-bold text-lg p-4'>${balance}</span>
              </p>
            </div>
            <form className='mb-2 grid grid-cols-5'>
              <p className='text-sm py-3 col-span-3'>
                Select how much of your balance you would like to transfer:
              </p>
              <div className='text-sm py-3 col-span-2'>
                <Input
                  type='number'
                  placeholder='Amount'
                  max={Number(balance)}
                  min={1}
                  value={Number(amount)}
                  defaultValue={Number(balance)}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className={cn(
                    'w-full px-4 py-2 border rounded-md focus:outline-none focus:border-stone-500'
                  )}
                />
                {amount > balance && (
                  <p className='text-red-500 text-sm py-2'>
                    This amount cannot exceed your balance.
                  </p>
                )}
              </div>
            </form>
            <Button
              onClick={handleTransfer}
              variant='default'
              className='font-bold w-full'
              disabled={isPending || amount > balance}>
              {!isPending ? <span>Transfer ${amount} </span> : <Loader />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AddStripeAccountButton = ({ user }: { user: User }) => {
  const queryClient = useQueryClient();
  const { mutate } = trpc.stripe.createStripe.useMutation({
    onSuccess: () => {
      toast.success('Stripe account connected successfully!');
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const { mutate: updateStripeId } = trpc.stripe.updateStripeId.useMutation({
    onSuccess: () => {
      toast.success('Changed Stripe Id successfully!');
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { data: user1 } = trpc.auth.getUserFromEmail.useQuery(user.email!);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormTypeStripe>({
    resolver: zodResolver(schemaStripe),
  });

  const onSubmit = (data: FormTypeStripe) => {
    if (
      user1?.stripeId !== undefined &&
      user1?.stripeId !== null &&
      user1?.stripeId.length > 0
    ) {
      updateStripeId(data.stripeId);
    } else {
      mutate(data.stripeId);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>Connect Stripe Account</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Connect Stripe Account </DialogTitle>
          <DialogDescription>
            {user1?.stripeId !== undefined &&
            user1?.stripeId !== null &&
            user1?.stripeId.length > 0 ? (
              <div className='mt-6'>
                <p className='flex gap-2 items-center mb-2'>
                  <span>
                    <CheckCircle2 className=' text-emerald-400 h-6 w-6 ' />
                  </span>
                  Your connected Stripe ID :{' '}
                </p>
                <span className='text-lg font-semibold px-4'>
                  {user1?.stripeId}
                </span>
              </div>
            ) : (
              <div>
                <p>Please provide here your Stripe account ID. </p>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className='flex items-center space-x-2'>
          <div className='grid flex-1 gap-2'>
            <form onSubmit={handleSubmit(onSubmit)} className='grid gap-6'>
              {user1?.stripeId !== undefined &&
                user1?.stripeId !== null &&
                user1?.stripeId.length > 0 && (
                  <>
                    <Separator />
                    <p className='-mb-2 text-sm text-stone-700'>
                      To change your Stripe ID, enter a new one below and click
                      submit.
                    </p>
                    <Link
                      href='/stripe-id-description'
                      className='text-blue-500 text-xs'>
                      Where can I find this ID
                    </Link>
                  </>
                )}
              <input
                type='text'
                placeholder='New Stripe ID'
                {...register('stripeId')}
                className='w-full px-4 py-2 border rounded-md focus:outline-none focus:border-stone-500'
              />
              <Button type='submit' variant='default' className='font-bold'>
                Submit
              </Button>
            </form>
          </div>
        </div>
        <DialogFooter className='sm:justify-start'></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { AddStripeAccountButton, TransferMoneyButton };
