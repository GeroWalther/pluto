import DeleteDialog from '@/components/Table/Dialogs/DeleteDialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

const data = [
  { name: 'Jan', sold: 300 },
  { name: 'Feb', sold: 400 },
  { name: 'Mar', sold: 200 },
  { name: 'Apr', sold: 600 },
  { name: 'May', sold: 1200 },
  { name: 'Jun', sold: 800 },
  { name: 'Jul', sold: 1000 },
  { name: 'Aug', sold: 900 },
  { name: 'Sep', sold: 700 },
  { name: 'Oct', sold: 1000 },
  { name: 'Nov', sold: 1500 },
  { name: 'Dec', sold: 1800 },
];
const RenderLineChart = () => (
  <LineChart
    width={800}
    height={300}
    data={data}
    margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
    <Line type='monotone' dataKey='sold' stroke='#8884d8' />
    <CartesianGrid stroke='#ccc' strokeDasharray='5 5' />
    <XAxis dataKey='name' />
    <YAxis />
    <Tooltip />
  </LineChart>
);

const HistoryComponent = ({ balance }: any) => {
  const transactions = [
    { date: '2022-01-01', type: 'Stripe transfer', amount: 100 },
    { date: '2022-01-02', type: 'Product Sold', amount: 50 },
    { date: '2022-01-03', type: 'Stripe transfer', amount: 200 },
    { date: '2022-01-04', type: 'Product Sold', amount: 75 },
    { date: '2022-01-05', type: 'Stripe transfer', amount: 150 },
    { date: '2022-01-06', type: 'Product Sold', amount: 100 },
  ];

  return (
    <Table>
      <TableHeader>
        <TableHead>Date</TableHead>
        <TableHead>Transaction</TableHead>
        <TableHead>Amount</TableHead>
        <TableHead>Balance</TableHead>
        <TableHead className='w-20'></TableHead>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction, index) => (
          <TableRow key={index}>
            <TableCell>{transaction.date}</TableCell>
            <TableCell>{transaction.type}</TableCell>
            <TableCell>{transaction.amount}</TableCell>
            <TableCell>100</TableCell>
            <TableCell className='w-20'></TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <span>Current Balance: {balance}</span>
      </TableFooter>
    </Table>
  );
};

export default function SellerSales() {
  const handleTransfer = () => {
    // Code to transfer money to Stripe
  };
  const connectStripeAccount = () => {
    // Code to transfer money to Stripe
  };

  const balance = 500; // Example balance amount

  return (
    <main className='flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6'>
      <h1 className='text-lg font-semibold md:text-2xl'>Sales</h1>
      <div
        className='bg-stone-100 p-4 py-8 rounded-lg shadow-md bg-cover'
        style={{
          backgroundImage:
            'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.8)), url(eis.jpg)',
        }}>
        <h3 className='mb-4 text-md font-semibold text-stone-200'>
          Ready for transfer
        </h3>
        <h4 className='text-2xl font-bold mb-8 text-stone-200'>
          Balance: ${balance}
        </h4>
        <div className='flex justify-between'>
          <Button
            className='bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded-md'
            onClick={handleTransfer}>
            Transfer Money
          </Button>
          <Button
            className=' text-white font-bold py-2 px-4 rounded-md'
            onClick={connectStripeAccount}>
            Add Stripe Account
          </Button>
        </div>
      </div>
      <HistoryComponent balance={balance} />
      <div className='mt-6'>
        <h3 className='mb-4 text-xl font-semibold'>Total Sales</h3>
        <RenderLineChart />
      </div>
    </main>
  );
}
