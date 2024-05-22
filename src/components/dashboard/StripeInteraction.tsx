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
import { Button } from "../ui/button";
import { Input } from "../ui/input";
export const schemaStripe = z.object({
  stripeId: z.string(),
});

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
        <DialogFooter className="sm:justify-start">
          Add Stripe Account
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { AddStripeAccountButton, TransferMoneyButton };
