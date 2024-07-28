'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { trpc } from '@/trpc/client';
import { TransferMoneyButton } from '../StripeInteraction';
import AddStripeAccountButton from '../AddStripeToAccount';
import { UpdateStripeAccountButton } from '../UpdateStripeAccount';
import Transacation from "./Transacation";

const SellerSales = () => {
  const {
    data: transActions,
    isLoading: isTransactionsLoading,
    isError: isTransactionsError,
    isSuccess: isTransactionsSuccess,
  } = trpc.seller.soldProducts.useQuery();

  const {
    data: userStripeInfo,
    isLoading: isUserLoading,
    isError: isUserError,
  } = trpc.stripe.sellerStripeAccount.useQuery();

  const {
    data: balances,
    isLoading: isBalanceLoading,
    isError: isBalanceError,
  } = trpc.stripe.sellerStripeAccountBalance.useQuery();

  if (isTransactionsLoading || isUserLoading || isBalanceLoading) {
    return <div>Loading...</div>;
  }

  if (isTransactionsError || isUserError || isBalanceError) {
    return <div>Error</div>;
  }

  const userStripeAccountId = userStripeInfo?.stripe_account_Id;
  const userStripePayoutStatus = userStripeInfo?.payout_status;

  const availableBalance = (balances && 'available' in balances) ? balances.available[0]?.amount ?? balances.available[0]?.amount : 0;
  const currencyAvailable = (balances && 'available' in balances) ? balances.available[0]?.currency ?? balances.available[0]?.currency : "EUR";
  const pendingBalance = (balances && 'pending' in balances) ? balances.pending[0]?.amount ?? balances.pending[0]?.amount : 0;
  const currencyPending = (balances && 'pending' in balances) ? balances.pending[0]?.currency ?? balances.pending[0]?.currency : "EUR";

  // Check if availableBalance is greater than 100 and divide by 100 if true
  const adjustedAvailableBalance = availableBalance > 100 ? availableBalance / 100 : availableBalance;
  
  // Check if pendingBalance is greater than 100 and divide by 100 if true
  const adjustedPendingBalance = pendingBalance > 100 ? pendingBalance / 100 : pendingBalance;

  return (
    <main className='flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6'>
      <h2 className='text-lg font-semibold md:text-2xl'>Sales</h2>
      <div
        className='bg-stone-100 p-4 py-8 rounded-lg shadow-md bg-cover'
        style={{
          backgroundImage:
            'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.8)), url(eis.jpg)',
        }}>
        <h3 className='mb-4 text-md font-semibold text-stone-200'>
          Pending Balance : {currencyPending} { adjustedPendingBalance }
        </h3>

        <h3 className='mb-4 text-md font-semibold text-stone-200'>
          Available Balance : {currencyAvailable} { adjustedAvailableBalance }
        </h3>

        <div className='flex justify-between'>
          { adjustedPendingBalance > 0 ? (
            <TransferMoneyButton balance={adjustedPendingBalance} currency={currencyAvailable} />
          ) : "." } 
         
          {userStripeAccountId ? null : <AddStripeAccountButton />}
          {userStripePayoutStatus === 'pending' && userStripeAccountId ? (
            <UpdateStripeAccountButton />
          ) : null}
          {userStripeAccountId && userStripePayoutStatus === 'enabled' && (
            <span>Your Stripe account is connected.</span>
          )}
        </div>
      </div>
      {isTransactionsSuccess && (
        <Transacation conncetId={userStripeAccountId} />
      )}
      <div className='mt-6'>
        <h3 className='mb-4 text-xl font-semibold'>Total Sales</h3>
      </div>
    </main>
  );
};

export default SellerSales;
