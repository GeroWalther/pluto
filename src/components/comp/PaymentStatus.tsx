'use client';

//import { trpc } from '@/trpc/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface PaymentStatusProps {
  orderEmail: string;
  orderId: string;
  isPaid: boolean;
}
export default function PaymentStatus({
  orderEmail,
  orderId,
  isPaid,
}: PaymentStatusProps) {
  const router = useRouter();

  //const { data } = trpc.paymentRouter.pollOrderStatus.useQuery(
  //   { orderId },
  //   {
  //     enabled: isPaid === false, // only query as long as order is not paid yet
  //     refetchInterval: (data) => (data?.isPaid ? false : 1000),
  //   }
  // );

  // useEffect(() => {
  //   if (data?.isPaid) router.refresh();
  // }, [data?.isPaid, router]);

  const ptagstyles = isPaid ? 'text-green-500' : 'text-stone-400';
  return (
    <div className='mt-16 grid grid-cols-2 gap-x-4 text-sm text-stone-600'>
      <div>
        <p className='font-medium text-stone-900'>Shipping To</p>
        <p>{orderEmail}</p>
      </div>

      <div>
        <p className='font-medium text-stone-900'>Order Status</p>
        <p className={ptagstyles}>
          {isPaid ? 'Payment successful' : 'Payment pending...'}
        </p>
      </div>
    </div>
  );
}
