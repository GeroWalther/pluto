import prisma from '@/db/db';
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

export const confirmPurchaseController = async (oderId: string, user: User) => {
  if (!oderId || typeof oderId !== 'string') {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Invalid orderId`,
    });
  }

  const findProduct = await prisma.order.findFirst({
    where: {
      orderId: oderId,
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

  // TODO: Send email to the user add producs details with download link
  // const sendEmailToUser = await sendEmail({
  //   userEmail: user.email!,
  //   subject: "Order Confirmation",
  //   html: `<h1>Order Confirmation</h1>
  //   <p>Thank you for purchasing the following products</p>
  //   `,
  // });

  // if (!sendEmailToUser) {
  //   throw new TRPCError({
  //     code: "INTERNAL_SERVER_ERROR",
  //     message: `Could not send email to the user`,
  //   });
  // }

  return {
    isPaid: true,
    name: user.name,
    email: user.email,
    orderId: findProduct.orderId,
    total: findProduct.totalAmount,
    getProducts,
  };
};
