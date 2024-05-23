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

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countryISOData } from "@/config/countrylist";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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

const AddStripeAccountButton = () => {
  const router = useRouter();
  const { data, mutate } = trpc.stripe.createStripe.useMutation({
    onSuccess: () => {
      toast.success("Redirecting to stripe account creation page");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (data) {
      router.push(data.url);
    }
  }, [data]);

  const FormSchema = z.object({
    stripeId: z.string({
      required_error: "Please enter a valid stripe ID",
    }),
    country: z.string({
      required_error: "Please select a country",
    }),
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    mutate({
      stripeId: data.stripeId,
      country: data.country,
    });
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Connect Stripe Account</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Stripe Account </DialogTitle>
          <DialogDescription>
            {user1?.stripeId !== undefined &&
            user1?.stripeId !== null &&
            user1?.stripeId.length > 0 ? (
              <div className="mt-6">
                <p className="flex gap-2 items-center mb-2">
                  <span>
                    <CheckCircle2 className=" text-emerald-400 h-6 w-6 " />
                  </span>
                  Your connected Stripe ID :{" "}
                </p>
                <span className="text-lg font-semibold px-4">
                  {user1?.stripeId}
                </span>
              </div>
            ) : (
              <div>
                <p>Please provide here your Stripe account ID. </p>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <>
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="US">USA</SelectItem>
                          <SelectItem value="CAN">Canada</SelectItem>
                          <SelectItem value="DEU">Germany</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  </>
                )}
              />
              <FormField
                control={form.control}
                name="stripeId"
                render={({ field }) => (
                  <>
                    <FormItem>
                      <FormLabel>Stripe ID</FormLabel>
                      <Input {...field} />
                      <FormMessage />
                    </FormItem>
                  </>
                )}
              />
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </div>
        <DialogFooter className="sm:justify-start"></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { AddStripeAccountButton, TransferMoneyButton };

