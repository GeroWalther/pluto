"uae client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { useState } from "react";

import { toast } from "sonner";
import { z } from "zod";
import Loader from "../Loader/Loader";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
export const schemaStripe = z.object({
  stripeId: z.string(),
});

export type FormType = z.infer<typeof schemaStripe>;

const TransferMoneyButton = ({ balance }: { balance: number }) => {
  const [amount, setAmount] = useState(() => Number(balance));
  const [open, setOpen] = useState(false);
  const { data, mutate, isPending } = trpc.stripe.transferMoney.useMutation({
    onSuccess: () => {
      toast.success(data);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleTransfer = () => {
    mutate(amount);
    setTimeout(() => {
      setOpen(false);
    }, 1000);
  };

  return (
    <Dialog open={open}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded-md"
        >
          Transfer money
        </Button>
      </DialogTrigger>
      <DialogContent setOpen={setOpen} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Transfer Money to Stripe
          </DialogTitle>
          <DialogDescription>
            If you would like to transfer money to your Stripe account, select
            an amount and then click transfer.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <div>
              <p className="font-semibold">
                Total currently available balance:{" "}
                <span className="font-bold text-lg p-4">${balance}</span>
              </p>
            </div>
            <form className="mb-2 grid grid-cols-5">
              <p className="text-sm py-3 col-span-3">
                Select how much of your balance you would like to transfer:
              </p>
              <div className="text-sm py-3 col-span-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  max={Number(balance)}
                  min={1}
                  value={Number(amount)}
                  defaultValue={Number(balance)}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className={cn(
                    "w-full px-4 py-2 border rounded-md focus:outline-none focus:border-stone-500"
                  )}
                />
                {amount > balance && (
                  <p className="text-red-500 text-sm py-2">
                    This amount cannot exceed your balance.
                  </p>
                )}
              </div>
            </form>
            <Button
              onClick={handleTransfer}
              variant="default"
              className="font-bold w-full"
              disabled={isPending || amount > balance}
            >
              {!isPending ? <span>Transfer ${amount} </span> : <Loader />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { TransferMoneyButton };
