"use client";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/customCommand";
import {
  Dialog,
  DialogContent,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { countryISOData } from "@/config/countrylist";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const FormSchema = z.object({
  country: z.string({ required_error: "Please select a country." }),
});

const UpdateStripeAccountButton = () => {
  const { isSuccess } = trpc.stripe.checkStripe.useQuery();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Finish Onboarding</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center mb-7">
            {isSuccess ? "Finish Onboarding Connected" : "Connect Stripe Account Finalize"}
          </DialogTitle>
        </DialogHeader>
        {isSuccess ? <LoginStripeAccountButton /> : <AddStripeForm />}
      </DialogContent>
    </Dialog>
  );
};

const AddStripeForm = () => {
  const router = useRouter();
  const { data, mutate } = trpc.stripe.createStripe.useMutation({
    onSuccess: () => {
      toast.success("Redirecting to Stripe...");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    mutate(data.country);
  }

  useEffect(() => {
    if (data) {
      router.push(data.url);
    }
  }, [data]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Finalize connect account to finish payout</FormLabel>
              <FormDescription>
               You already have connected account but not enabled for payout. Please click bellow to finish onboarding and continue!
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

const LoginStripeAccountButton = () => {
  const router = useRouter();
  const [link, setLink] = useState();
  const { data, refetch, isSuccess } = trpc.stripe.loginStripe.useQuery(
    undefined,
    {
      enabled: false,
    }
  );

  const createLogin = () => {
    refetch();
  };

  return (
    <>
      {isSuccess ? (
        <Link href={data} target="_blank" passHref>
          <Button onClick={createLogin} variant="default" className="w-full">
            Click here to login to Stripe
          </Button>
        </Link>
      ) : (
        <Button onClick={createLogin} variant="outline">
          Generate login link
        </Button>
      )}
    </>
  );
};

export default UpdateStripeAccountButton;
