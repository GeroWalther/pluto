import { constructMetadata } from '@/lib/utils';
import ThankYou from './ThankYou';

export const metadata = constructMetadata({
  title: 'Order confirmed — Pluto Market',
  noIndex: true,
});

export default async function ThankYouPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  return <ThankYou orderNumber={orderNumber} />;
}
