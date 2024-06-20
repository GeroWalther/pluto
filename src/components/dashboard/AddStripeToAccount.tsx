"use client";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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

const AddStripeAccountButton = () => {
  const { isSuccess } = trpc.stripe.checkStripe.useQuery();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Connect Stripe Account</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center mb-7">
            {isSuccess ? "Stripe Account Connected" : "Connect Stripe Account"}
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
              <FormLabel>Country</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? countryISOData.find(
                            (country) => country.code === field.value
                          )?.name
                        : "Select country"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search country..."
                      className="h-9"
                    />
                    <CommandEmpty>No Country selected.</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {countryISOData.map((country) => (
                          <CommandItem
                            value={country.code}
                            key={`${country.number}-${country.code}`}
                            onSelect={() => {
                              form.setValue("country", country.code);
                              field.onChange(country.code);
                            }}
                            data-disabled="false"
                            aria-disabled="false"
                          >
                            {country.name}
                            <span
                              className={cn(
                                "ml-auto h-4 w-4",
                                country.code === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            >
                              ✔
                            </span>
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                This is the country that will be used in the dashboard.
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

export default AddStripeAccountButton;
