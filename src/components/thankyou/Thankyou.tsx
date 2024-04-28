"use client";
import { trpc } from "@/trpc/client";
import { FC } from "react";

interface ThankyouProps {
  orderId: string;
}

const Thankyou: FC<ThankyouProps> = ({ orderId }) => {
  const {
    data: response,
    isLoading,
    isError,
  } = trpc.payment.confirmPurchase.useQuery({ orderId });
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error</div>;
  }
  return (
    response &&
    response.productFiles.map((file) => (
      <div key={file}>
        <img src={file} alt="name" />
        <a href={file} download target="_blank">
          Download
        </a>
      </div>
    ))
  );
};

export default Thankyou;
