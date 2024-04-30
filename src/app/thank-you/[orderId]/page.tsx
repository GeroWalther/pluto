'use client';

import MissingParams from '@/components/comp/MissingParams';
import Thankyou from '@/components/comp/ThankYou';

interface PageProps {
  params: {
    orderId: string;
  };
}

const Page: React.FC<PageProps> = ({ params }) => {
  if (!params.orderId) {
    return <MissingParams />;
  }

  return <Thankyou orderId={params.orderId} />;
};

export default Page;
