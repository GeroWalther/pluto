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
import UpdateStripeAccountButton from '../UpdateStripeAccount';

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

  if (isTransactionsLoading || isUserLoading) {
    return <div>Loading...</div>;
  }

  if (isTransactionsError || isUserError) {
    return <div>Error</div>;
  }

  const userStripeAccountId = userStripeInfo?.stripe_account_Id;
  const userStripePayoutStatut = userStripeInfo?.payout_status;

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
          Ready for transfer
        </h3>
        <h4 className='text-2xl font-bold mb-8 text-stone-200'>$1000</h4>
        <div className='flex justify-between'>
          <TransferMoneyButton balance={transActions?.balance as number} />
          {userStripePayoutStatut && userStripeAccountId ? null : (
            <AddStripeAccountButton />
          )}
          {!userStripePayoutStatut && userStripeAccountId ? (
            <UpdateStripeAccountButton />
          ) : null}
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
