"use client";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const schemaStripe = z.object({
  stripeId: z.string(),
  stripeSecret: z.string(),
});

export type FormType = z.infer<typeof schemaStripe>;

const Page = () => {
  const { mutate } = trpc.stripe.createStripe.useMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormType>({
    resolver: zodResolver(schemaStripe),
  });

  const onSubmit = (data: FormType) => {
    mutate({
      stripeId: data.stripeId,
      stripeSecret: data.stripeSecret,
    });
  };

  return (
    <div className="container mx-auto px-4 pt-20 flex flex-col items-center justify-center lg:px-0">
      <div className="flex flex-col items-center space-y-4 text-center">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
          <input
            type="text"
            placeholder="Stripe ID"
            {...register("stripeId")}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            placeholder="Stripe Secret"
            {...register("stripeSecret")}
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
  );
};

export default Page;
