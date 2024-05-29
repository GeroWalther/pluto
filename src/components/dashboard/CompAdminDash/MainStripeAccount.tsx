import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

const MainStripeAccount = () => {
  const { data, isLoading, isSuccess, isError } =
    trpc.stripe.adminStripe.useQuery();

  const { data: NewTopup, mutate: mutateTopup } =
    trpc.stripe.updateBalance.useMutation({
      onSuccess: () => {
        toast.success("Topup Success");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error</div>;
  }

  const handleTopup = () => {
    mutateTopup(100);
  };
  if (isSuccess) {
    return (
      <div>
        <h1>Stripe Account Handling</h1>
        <div>
          <h2>Account</h2>
          <div>{JSON.stringify(data.adminData, null, 2)}</div>
        </div>
        <div>
          <h2>Total Balance</h2>
          <div>{JSON.stringify(data.totalBalance, null, 2)}</div>
        </div>
        <h2>Topup</h2>
        <Button onClick={handleTopup}>Topup 100 for testing</Button>
      </div>
    );
  }
};

export default MainStripeAccount;
