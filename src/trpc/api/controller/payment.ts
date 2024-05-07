import { ReceiptEmailHtml } from "@/components/emails/ReceiptEmail";
import prisma from "@/db/db";
import { sendEmail } from "@/lib/sendEmail";
import { generateRandomToken } from "@/lib/utils";

import { TRPCError } from "@trpc/server";
import { User } from "next-auth";
import Stripe from "stripe";

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
      code: "INTERNAL_SERVER_ERROR",
      message: `Could not find products with the given ids`,
    });
  }

  const lineItem = getPrices.map((product) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: product?.name || "Default Product Name",
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

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    typescript: true,
    apiVersion: "2024-04-10",
  });

  const orderId = `${generateRandomToken()}`;

  const successUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you/${orderId}`;

  // , 'paypal', 'wechat_pay', 'klarna'
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItem,
    mode: "payment",

    success_url: successUrl,
    cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart`,
    metadata: {
      userId: user.id,
      productIds: productId.join(","),
    },
  });

  if (!session) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
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
      code: "INTERNAL_SERVER_ERROR",
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
  if (!orderId || typeof orderId !== "string") {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Invalid orderId`,
    });
  }

  const orderInfo = await prisma.order.findFirst({
    where: {
      orderId,
    },
  });

  if (!orderInfo) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Could not find order with the given orderId`,
    });
  }

  const getProductIds = orderInfo.productIds;

  const getProductsofSeller = await prisma.product.findMany({
    where: {
      id: {
        in: getProductIds,
      },
    },
    include: {
      user: true,
    },
  });

  if (!getProductsofSeller || getProductsofSeller.length === 0) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Could not find products with the given ids`,
    });
  }

  const productInfo = getProductsofSeller.map((info) => {
    const { user, ...productData } = info;
    return productData;
  });

  if (orderInfo.sendEmailToSeller) {
    return {
      isPaid: true,
      name: user.name,
      email: user.email,
      orderId: orderId,
      total: orderInfo.totalAmount,
      getProducts: productInfo,
    };
  }

  const sendEmailToBuyer = await sendEmail({
    userEmail: user.email!,
    subject: "Thanks for your order! This is your receipt.",
    html: ReceiptEmailHtml({
      email: user.email!,
      date: new Date(),
      orderId,
      products: productInfo,
    }),
  });

  if (!sendEmailToBuyer) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Could not send email to seller`,
    });
  }

  const updateProduct = await prisma.order.update({
    where: {
      orderId,
    },
    data: {
      sendEmailToSeller: true,
    },
  });

  if (!updateProduct) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Could not update order`,
    });
  }

  return {
    isPaid: true,
    name: user.name,
    email: user.email,
    orderId: orderId,
    total: orderInfo.totalAmount,
    getProducts: productInfo,
  };
};

export const collectPaymentController = async (orderId: string, user: User) => {
  if (!orderId || typeof orderId !== "string" || !user) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Invalid orderId or user`,
    });
  }

  const sripeInfo = await prisma.sellerPayment.findFirst({
    where: {
      userId: user.id,
    },
  });

  if (!sripeInfo) {
    return {
      message: `Please add your stripe account details`,
    };
  }

  const getOrderDesc = await prisma.order.findFirst({
    where: {
      orderId,
    },
  });

  if (!getOrderDesc) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Could not find order with the given orderId`,
    });
  }

  const getProductIds = getOrderDesc.productIds;

  const getProductsofSeller = await prisma.product.findMany({
    where: {
      id: {
        in: getProductIds,
      },
      userId: user.id,
    },
  });

  if (!getProductsofSeller || getProductsofSeller.length === 0) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Could not find products with the given ids`,
    });
  }

  return {
    success: "Payment collected successfully!",
  };
};
