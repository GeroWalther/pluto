import prisma from "@/db/db";
import { TRPCError } from "@trpc/server";
import { User } from "next-auth";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  typescript: true,
  apiVersion: "2024-04-10",
});

export const createStripeController = async (input: string, user: User) => {
  if (!input) {
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

  try {
    // Check if stripe account exists
    const account = await stripe.accounts.retrieve(input);

    if (!account.id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Invalid stripe account`,
      });
    }

    if (!account.email) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: `Please enter a valid email.`,
      });
    }

    const createStripe = await prisma.sellerPayment.create({
      data: {
        stripeId: account.id,
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
  } catch (error) {
    // Handle any errors that occur during account retrieval
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: JSON.stringify(error), // Provide detailed error message
    });
  }
};

export const updateStripeController = async (input: string, user: User) => {
  if (!input) {
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

  if (!checkStripe) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `You don't have a stripe account`,
    });
  }

  // check if stripe account exists
  const account = await stripe.accounts.retrieve({
    stripeAccount: input,
  });

  if (!account.id) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Invalid stripe account`,
    });
  }

  if (account.email !== user.email) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: `Please enter a valid email.`,
    });
  }

  const createStripe = await prisma.sellerPayment.update({
    where: {
      id: checkStripe.id,
    },
    data: {
      stripeId: account.id,
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

export const transferMoneyController = async (input: number, user: User) => {
  if (!input) {
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

  if (!checkStripe) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `You do not have a stripe account`,
    });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    typescript: true,
    apiVersion: "2024-04-10",
  });

  const transfer = await stripe.transfers.create({
    amount: input,
    currency: "usd",
    destination: checkStripe.stripeId,
  });

  if (!transfer) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Something went wrong while transferring money`,
    });
  }

  return `Transferred $${input} to your stripe account`;
};
