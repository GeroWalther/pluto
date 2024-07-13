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

type SingleTransaction = {
  date: string;
  type: string;
  amount: number;
};

type HistoryComponentProps = {
  transactions: SingleTransaction[];
  balance: number;
};

const HistoryComponent = ({ transactions, balance }: HistoryComponentProps) => {
  const tableHeaders = ['Date', 'Transaction', 'Amount'];
  return (
    <Table className='text-right'>
      <TableHeader>
        <TableRow>
          {tableHeaders.map((header, index) => (
            <TableCell key={index} className='text-right font-bold'>
              {header}
            </TableCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction, index) => (
          <TableRow key={index}>
            <TableCell>{transaction.date}</TableCell>
            <TableCell>{transaction.type}</TableCell>
            <TableCell>{transaction.amount}</TableCell>
          </TableRow>
        ))}
        <TableRow className='font-bold'>
          <TableCell></TableCell>
          <TableCell>Total</TableCell>
          <TableCell>{balance}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default function SellerSales() {
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
    isLoading: isbalanceLoading,
    isError: isBalanceError,
  } = trpc.stripe.sellerStripeAccountBalance.useQuery();


  if (isTransactionsLoading || isUserLoading) {
    return <div>Loading...</div>;
  }

  if (isTransactionsError || isUserError) {
    return <div>Error</div>;
  }

  const userStripeAccountId = userStripeInfo?.stripe_account_Id;
  const userStripePayoutStatus = userStripeInfo?.payout_status;

  const availableBalance = balances?.available?.[0]?.amount ?? 0;
  const currencyAvailable = balances?.available?.[0]?.currency ?? "EUR";
  const pendingBalance = balances?.pending?.[0]?.amount ?? 0;
  
  const currencyPending = balances?.pending?.[0]?.currency ?? "EUR";

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

            // <TransferMoneyButton balance={adjustedPendingBalance as number, currencyAvailable as string} />
          ) : "." } 
         
          {userStripeAccountId ? null : <AddStripeAccountButton />}
          {userStripePayoutStatus == 'pending' && userStripeAccountId ? (
            <UpdateStripeAccountButton />
          ) : null}
          {userStripeAccountId && userStripePayoutStatus == 'enabled' && (
            <span>Your Stripe account is connected.</span>
          )}
        </div>
      </div>
      {isTransactionsSuccess && (
        <HistoryComponent
          transactions={transActions.transactions}
          balance={transActions.balance}
        />
      )}
      <div className='mt-6'>
        <h3 className='mb-4 text-xl font-semibold'>Total Sales</h3>
      </div>
    </main>
  );
}
