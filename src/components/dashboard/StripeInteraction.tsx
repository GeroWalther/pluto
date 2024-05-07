import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { on } from "events";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export const schemaStripe = z.object({
  stripeId: z.string(),
});
//

export type FormType = z.infer<typeof schemaStripe>;

const TransferMoneyButton = () => {
  const {
    data,
    mutate,
    isError,
    error: errorMessage,
  } = trpc.stripe.transferMoney.useMutation({
    onSuccess: () => {
      toast.success(data);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleTransfer = () => {
    mutate(100);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded-md">
          Transfer money
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to view this.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <div>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis
                soluta dolorum enim quasi excepturi consequuntur accusantium
                odio exercitationem pariatur voluptas? Eligendi impedit cum,
                sunt ipsa quidem dolores omnis quos. Dolorum.
              </p>
            </div>
            <Button variant="default" onClick={handleTransfer}>
              Transfer Money
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AddStripeAccountButton = () => {
  const {
    data,
    mutate,
    isSuccess,
    isError,
    error: errorMessage,
  } = trpc.stripe.createStripe.useMutation({
    onSuccess: () => {
      toast.success("Stripe account added");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormType>({
    resolver: zodResolver(schemaStripe),
  });

  const onSubmit = (data: FormType) => {
    mutate(data.stripeId);
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add stripe Account</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to view this.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
              <input
                type="text"
                placeholder="Stripe ID"
                {...register("stripeId")}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          Add Stripe Account
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { AddStripeAccountButton, TransferMoneyButton };
