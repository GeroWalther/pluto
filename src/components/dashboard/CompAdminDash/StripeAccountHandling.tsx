"use client";

import { trpc } from "@/trpc/client";

const StripeAccountHandling = () => {
  const { data, isLoading, isSuccess, isError } =
    trpc.stripe.allStripeInfo.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error</div>;
  }

  if (isSuccess) {
    return (
      <div>
        <h1>Stripe Account Handling</h1>
        <div>
          <h2>Account</h2>
          <div>
            {data.account.map((account) => (
              <div className="border p-2 my-2" key={account.id}>
                {JSON.stringify(account, null, 2)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
};

export default StripeAccountHandling;
