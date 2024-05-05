import { FormType } from "@/app/create-stripe/page";
import prisma from "@/db/db";
import { TRPCError } from "@trpc/server";
import { User } from "next-auth";
export const createStripeController = async (input: FormType, user: User) => {
  if (input.stripeId === "" || input.stripeSecret === "") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Please fill in all fields`,
    });
  }

  const checkStripe = await prisma.sellerPayment.findFirst({
    where: {
      userId: user.id,
    },
  });

  if (checkStripe) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `You already have a stripe account`,
    });
  }

  const createStripe = await prisma.sellerPayment.create({
    data: {
      stripeId: input.stripeId,
      paymentMethod: "stripe",
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  if (!createStripe) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Something went wrong while creating the stripe account`,
    });
  }

  return input;
};
