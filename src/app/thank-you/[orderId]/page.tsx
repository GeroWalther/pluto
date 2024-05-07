"use client";
import ErrorPageComp from "@/components/comp/ErrorPageComp";
import Thankyou from "@/components/thankyou/Thankyou";
import React from "react";

interface PageProps {
  params: {
    orderId: string;
  };
}

const Page: React.FC<PageProps> = ({ params }) => {
  // http://localhost:3000/thank-you/o1pxt96k82
  if (!params.orderId) {
    return <ErrorPageComp />;
  }

  return <Thankyou orderId={params.orderId} />;
};

export default Page;
