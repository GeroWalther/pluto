"use client";

import MaxWidthWrapper from "@/components/comp/MaxWidthWrapper";
import { trpc } from "@/trpc/client";
import { ArrowBigDown } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const Page = () => {
  // acct_1PJXsoQw6Nw6P8Ht
  const search = useSearchParams();
  const accountId = search.get("account");
  const { data, mutate } = trpc.stripe.confirmStripe.useMutation({
    onSuccess: () => {
      toast.success("Stripe account confirmed");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (accountId) {
      mutate(accountId);
    }
  }, [accountId]);

  return (
    <article className="py-10">
      <MaxWidthWrapper>
        <h2 className="text-3xl font-bold mb-4">
          You have connected the stripe Id
        </h2>
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-2">Introduction</h3>
          <p className="text-stone-700">Account id : {data?.id}</p>
        </section>
      </MaxWidthWrapper>
    </article>
  );
};

export default Page;
