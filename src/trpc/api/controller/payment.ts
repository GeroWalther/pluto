import { ReceiptEmailHtml } from '@/components/emails/ReceiptEmail';
import prisma from '@/db/db';
import { getEmailbyUserId } from '@/db/prisma.user';
import { sendEmail } from '@/lib/sendEmail';
import { generateRandomToken } from '@/lib/utils';

import { TRPCError } from '@trpc/server';
import { User } from 'next-auth';
import Stripe from 'stripe';

export const createSessionController = async (
  productId: string[],
  user: User
) => {
  const getPrices = await prisma.product.findMany({
    where: {
      id: {
        in: productId,
      },
    },
  });

  if (!getPrices || getPrices.length === 0 || getPrices === null) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Could not find products with the given ids`,
    });
  }

  const lineItem = getPrices.map((product) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: product?.name || 'Default Product Name',
      },
      unit_amount: (product?.price || 0) * 100,
    },
    quantity: 1,
  }));

  const productIds = getPrices.map((product) => product.id);
  const totalAmount = getPrices.reduce(
    (acc, product) => acc + product.price,
    0
  );
  const productNames = getPrices.map((product) => product.name);
  const productFiles = getPrices.map((product) => product.imageUrls).flat();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
    typescript: true,
    apiVersion: '2024-04-10',
  });

  const orderId = `${generateRandomToken()}`;

  const successUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you/${orderId}`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItem,
    mode: 'payment',

    success_url: successUrl,
    cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart`,
    metadata: {
      userId: user.id,
      productIds: productId.join(','),
    },
  });

  if (!session) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Could not create a session for products`,
    });
  }

  const createOrder = await prisma.order.create({
    data: {
      userId: user.id,
      orderId: orderId,
      totalAmount,
      productIds,
      productNames,
      productFiles,
    },
  });

  if (!createOrder) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Could not create order for products`,
    });
  }

  return {
    successUrl: session.url,
  };
};

export const confirmPurchaseController = async (
  orderId: string,
  user: User
) => {
  if (!orderId || typeof orderId !== 'string') {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Invalid orderId`,
    });
  }

  const findProduct = await prisma.order.findFirst({
    where: {
      orderId,
    },
  });

  if (!findProduct) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Could not find order with the given orderId`,
    });
  }

  if (findProduct.userId !== user.id) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `User does not have permission to access this order`,
    });
  }

  const productIds = findProduct.productIds;

  const getProducts = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
  });

  if (!getProducts || getProducts.length === 0 || getProducts === null) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Could not find products with the given ids`,
    });
  }

  const sellerEmailList = getProducts.map(
    async (p) => await getEmailbyUserId(p.userId)
  );
  const sellerEmailsRes = await Promise.all(sellerEmailList);
  const sellerEmails = sellerEmailsRes.map((u) => u?.email);

  // TODO: check these emails are working
  try {
    if (sellerEmails.length > 0 && sellerEmails !== undefined) {
      sellerEmails.map(
        async (mail) =>
          await sendEmail({
            userEmail: mail!,
            subject: 'Your product has been sold! This is your receipt.',
            html: ReceiptEmailHtml({
              email: mail!,
              date: new Date(),
              orderId,
              products: getProducts,
            }),
          })
      );
    }
  } catch (error) {
    console.log('Email failed to sent! ERROR: ', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Email failed to sent!',
    });
  }
  try {
    await sendEmail({
      userEmail: user.email!,
      subject: 'Thanks for your order! This is your receipt.',
      html: ReceiptEmailHtml({
        email: user.email!,
        date: new Date(),
        orderId,
        products: getProducts,
      }),
    });
  } catch (error) {
    console.log('Email failed to sent! ERROR: ', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Email failed to sent!',
    });
  }

  return {
    isPaid: true,
    name: user.name,
    email: user.email,
    orderId: findProduct.orderId,
    total: findProduct.totalAmount,
    getProducts,
  };
};
