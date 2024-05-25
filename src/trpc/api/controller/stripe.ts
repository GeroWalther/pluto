import prisma from "@/db/db";
import { sendEmail } from "@/lib/sendEmail";
import { TRPCError } from "@trpc/server";
import { User } from "next-auth";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  typescript: true,
  apiVersion: "2024-04-10",
});

export const createStripeController = async (user: User, country: string) => {
  if (!user) {
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

  const account = await stripe.accounts.create({
    type: "express",
    email: user.email!,
    country: country,
    capabilities: {
      transfers: { requested: true },
    },
  });

  if (!account.id) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Something went wrong while creating stripe account`,
    });
  }

  const link = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.NEXTAUTH_URL}/dashboard?board=sellerdash&tabs=sales`,
    return_url: `${process.env.NEXTAUTH_URL}/confirm-stripe?account=${account.id}`,
    type: "account_onboarding",
  });

  if (!link.url) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Something went wrong while creating stripe account`,
    });
  }

  const sendEmailToBuyer = await sendEmail({
    userEmail: user.email!,
    subject: "Stripe Account Link",
    html: `
      <h1>Click on the link below to create your stripe account</h1>
      <a href="${link.url}">Create Stripe Account</a>
      <P>
      or copy and paste the link below in your browser
      </P>
      <p>${link.url}</p>
    `,
  });

  if (!sendEmailToBuyer) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Could not send email to seller`,
    });
  }

  return { url: link.url, stripeId: account.id };
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

  const retriveAccount = await stripe.accounts.retrieve(checkStripe.stripeId);

  if (!retriveAccount.id) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Invalid stripe account`,
    });
  }

  const charge = await stripe.charges.create({
    amount: input * 100, // amount in cents
    currency: "usd",
    source: "tok_visa",
    on_behalf_of: checkStripe.stripeId,
    transfer_data: {
      destination: checkStripe.stripeId,
    },
  });

  if (!charge.id) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Could not transfer money to stripe account`,
    });
  }

  return `Transferred $${input} to your stripe account`;
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

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    typescript: true,
    apiVersion: "2024-04-10",
  });

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

export const confirmStripeController = async (input: string, user: User) => {
  const account = await stripe.accounts.retrieve(input);
  if (!account.id) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Invalid stripe account`,
    });
  }

  const check = await prisma.sellerPayment.findFirst({
    where: {
      stripeId: account.id,
    },
  });

  if (check) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `You already have a stripe account`,
    });
  }

  const createdAccount = await stripe.accounts.retrieve(account.id);

  if (!createdAccount.id) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Invalid stripe account`,
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

  return createdAccount;
};

export const checkStripeController = async (user: User) => {
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

  return checkStripe;
};

export const loginStripeController = async (user: User) => {
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

  const account = await stripe.accounts.createLoginLink(checkStripe.stripeId);

  if (!account.created) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `You do not have a stripe account`,
    });
  }

  return account.url;
};
