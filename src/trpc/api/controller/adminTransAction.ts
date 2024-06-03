import { TRPCError } from "@trpc/server";

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  typescript: true,
  apiVersion: "2024-04-10",
});

export const getAllStripeAccountData = async () => {
  const allAccounts = await stripe.accounts.list();
  return {
    account: allAccounts.data,
  };
};

export const getAdminStripeData = async () => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    typescript: true,
    apiVersion: "2024-04-10",
  });

  const adminData = await stripe.accounts.retrieve();

  if (!adminData) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No stripe account found",
    });
  }

  const totalBalance = await stripe.balance.retrieve({
    stripeAccount: adminData.id,
  });

  return {
    adminData,
    totalBalance,
  };
};

export const updateBalance = async (amount: number) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    typescript: true,
    apiVersion: "2024-04-10",
  });

  const adminData = await stripe.accounts.retrieve();

  if (!adminData) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No stripe account found",
    });
  }
  const currency = adminData.default_currency;

  const charge = await stripe.charges.create({
    amount: 200000,
    currency: "eur",
    source: "tok_bypassPending",
    description: "My First Test Charge (created for API docs at ",
  });

  return charge;
};
