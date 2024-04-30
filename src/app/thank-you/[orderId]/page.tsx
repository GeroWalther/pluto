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

  return (
    <div className='max-w-3xl mx-auto px-4 py-8'>
      <Thankyou orderId={params.orderId} />
    </div>
  );
};

export default Page;
