import { FC } from "react";

interface pageProps {
  params: {
    orderId: string;
  };
}

const page: FC<pageProps> = ({ params }) => {
  return <div>{params.orderId}</div>;
};

export default page;
