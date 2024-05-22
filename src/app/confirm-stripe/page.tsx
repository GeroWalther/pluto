"use client";

import { useSearchParams } from "next/navigation";

const Page = () => {
  const search = useSearchParams();
  const accountId = search.get("account");
  return <div>{accountId}</div>;
};

export default Page;
