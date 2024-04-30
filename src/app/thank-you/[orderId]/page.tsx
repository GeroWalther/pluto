'use client';
import MissingPerams from '@/components/comp/MissingPerams';
import Thankyou from '@/components/thankyou/Thankyou';
import React from 'react';

interface PageProps {
  params: {
    orderId: string;
  };
}

const Page: React.FC<PageProps> = ({ params }) => {
  if (!params.orderId) {
    return <MissingPerams />;
  }

  return <Thankyou orderId={params.orderId} />;
};

export default Page;
