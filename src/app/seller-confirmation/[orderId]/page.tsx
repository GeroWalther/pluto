import AcceptPayment from "@/components/comp/AcceptPayment";
import { serverCaller } from "@/trpc";
import Link from "next/link";
import { FC } from "react";

interface pageProps {
  params: {
    orderId: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
  // http://localhost:3000/seller-confirmation/xeki113cr8
  const data = await serverCaller.payment.collectPayment(params.orderId);
  if (!data) {
    return <div>Something went wrong</div>;
  }

  return <div>{data.message || data.message}</div>;
};

export default page;
