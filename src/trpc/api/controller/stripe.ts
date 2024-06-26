import prisma from '@/db/db';
import { sendEmail } from '@/lib/sendEmail';
import { TRPCError } from '@trpc/server';
import { User } from 'next-auth';
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  typescript: true,
  apiVersion: '2024-04-10',
});


export const createUserController = async (user: User) => {
  if (!user) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Please fill in all fields`,
    });
  }

  const checkUser = await prisma.user.findFirst({
    where: {
      id: user.id,
    },
  });
  

  return checkUser;
};


export const createStripeController = async (user: User, country: string) => {
  if (!user) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
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
      code: 'BAD_REQUEST',
      message: `You already have a stripe account`,
    });
  }

  const stripe_account = await stripe.accounts.create({
    controller: {
      losses: {
        payments: 'application',
      },
      fees: {
        payer: 'application',
      },
      stripe_dashboard: {
        type: 'express',
      },
    },
    capabilities: {
      card_payments: {
        requested: true,
      },
      transfers: {
        requested: true,
      },
    },
    metadata: {
      userId: user.id,
    },
    business_type: 'individual',
    country: country,
  });

  if (!stripe_account.id) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Something went wrong while creating stripe account`,
    });
  }

  // query to update the database with column stripe_account_Id in user table
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      stripe_account_Id: stripe_account.id,
    },
  });

  const link = await stripe.accountLinks.create({
    account: stripe_account.id,
    refresh_url: `${process.env.NEXTAUTH_URL}/dashboard?board=sellerdash&tabs=sales`,
    return_url: `${process.env.NEXTAUTH_URL}/confirm-stripe?account=${stripe_account.id}`,
    type: 'account_onboarding',
  });

  if (!link.url) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Something went wrong while creating stripe account`,
    });
  }

  const sendEmailToBuyer = await sendEmail({
    userEmail: user.email!,
    subject: 'Stripe Account Link',
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
      code: 'INTERNAL_SERVER_ERROR',
      message: `Could not send email to seller`,
    });
  }

  return { url: link.url, stripeId: stripe_account.id };
};

export const transferMoneyController = async (input: number, user: User) => {
  if (!input) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
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
      code: 'BAD_REQUEST',
      message: `You do not have a stripe account`,
    });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
    typescript: true,
    apiVersion: '2024-04-10',
  });

  const retriveAccount = await stripe.accounts.retrieve(checkStripe.stripeId);

  if (!retriveAccount.id) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Invalid stripe account`,
    });
  }

  const charge = await stripe.transfers.create({
    amount: 100,
    currency: 'eur',
    destination: checkStripe.stripeId,
  });

  if (!charge.id) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Could not transfer money to stripe account`,
    });
  }

  return `Transferred $${input} to your stripe account`;
};

export const updateStripeController = async (input: string, user: User) => {
  if (!input) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
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
      code: 'BAD_REQUEST',
      message: `You don't have a stripe account`,
    });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
    typescript: true,
    apiVersion: '2024-04-10',
  });

  // check if stripe account exists
  const account = await stripe.accounts.retrieve({
    stripeAccount: input,
  });

  if (!account.id) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Invalid stripe account`,
    });
  }

  if (account.email !== user.email) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: `Please enter a valid email.`,
    });
  }

  const createStripe = await prisma.sellerPayment.update({
    where: {
      id: checkStripe.id,
    },
    data: {
      stripeId: account.id,
      paymentMethod: 'stripe',
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  if (!createStripe) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Something went wrong while creating the stripe account`,
    });
  }

  return input;
};

export const confirmStripeController = async (input: string, user: User) => {
  const account = await stripe.accounts.retrieve(input);
  if (!account.id) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
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
      code: 'BAD_REQUEST',
      message: `You already have a stripe account`,
    });
  }

  const createdAccount = await stripe.accounts.retrieve(account.id);

  if (!createdAccount.id) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Invalid stripe account`,
    });
  }

  const createStripe = await prisma.sellerPayment.create({
    data: {
      stripeId: account.id,
      paymentMethod: 'stripe',
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  if (!createStripe) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Something went wrong while creating the stripe account`,
    });
  }

  const updateAccount = await stripe.accounts.update(account.id, {
    metadata: {
      userId: user.id,
    },
    capabilities: {
      card_payments: {
        requested: true,
      },
      transfers: {
        requested: true,
      },
    },
  });

  if (!updateAccount.id) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
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
      code: 'BAD_REQUEST',
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
      code: 'BAD_REQUEST',
      message: `You do not have a stripe account`,
    });
  }

  const account = await stripe.accounts.createLoginLink(checkStripe.stripeId);

  if (!account.created) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `You do not have a stripe account`,
    });
  }

  return account.url;
};
