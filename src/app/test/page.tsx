"use client";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { useSearchParams } from "next/navigation";
const Page = () => {
  const search = useSearchParams();
  const accountId = search.get("account");
  // x541jg2nuq
  const { data, mutate } = trpc.test.test.useMutation();
  const click = () => {
    mutate(accountId!);
  };
  return (
    <div>
      <h1>Test{accountId}</h1>
      <Button onClick={click}>Click me</Button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default Page;
