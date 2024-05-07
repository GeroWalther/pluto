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

// export const confirmPurchaseController = async (
//   orderId: string,
//   user: User
// ) => {
//   if (!orderId || typeof orderId !== "string") {
//     throw new TRPCError({
//       code: "INTERNAL_SERVER_ERROR",
//       message: `Invalid orderId`,
//     });
//   }
//   const findProduct = await prisma.order.findFirst({ where: { orderId } });
//   if (!findProduct) {
//     throw new TRPCError({
//       code: "INTERNAL_SERVER_ERROR",
//       message: `Could not find order with the given orderId`,
//     });
//   }
//   if (findProduct.userId !== user.id) {
//     throw new TRPCError({
//       code: "INTERNAL_SERVER_ERROR",
//       message: `User does not have permission to access this order`,
//     });
//   }
//   const productIds = findProduct.productIds;
//   const getProducts = await prisma.product.findMany({
//     where: { id: { in: productIds } },
//   });
//   if (!getProducts || getProducts.length === 0 || getProducts === null) {
//     throw new TRPCError({
//       code: "INTERNAL_SERVER_ERROR",
//       message: `Could not find products with the given ids`,
//     });
//   }
//   if (findProduct.sendEmailToSeller) {
//     return {
//       isPaid: true,
//       name: user.name,
//       email: user.email,
//       orderId: findProduct.orderId,
//       total: findProduct.totalAmount,
//       getProducts,
//     };
//   }
//   const sellers = await prisma.user.findMany({
//     where: { id: { in: getProducts.map((product) => product.userId) } },
//   });
//   if (!sellers || sellers.length === 0 || sellers === null) {
//     throw new TRPCError({
//       code: "INTERNAL_SERVER_ERROR",
//       message: `Could not find sellers with the given ids`,
//     });
//   }
//   const checkStripeInfo = await prisma.sellerPayment.findMany({
//     where: { userId: user.id },
//   });
//   const se = sellers.map((seller, index) => {
//     const sellerProducts = getProducts.filter(
//       (product) => product.userId === seller.id
//     );
//     if (sellerProducts.length === 0) {
//       return {
//         sellerName: "Nosellername",
//         email: seller.email,
//         sellerLink: `${process.env.NEXT_PUBLIC_SERVER_URL}/seller-confirmation/${orderId}`,
//         sellerProducts: null,
//         stripeAccount: false,
//       };
//     }
//     return {
//       sellerName: seller.name || "No seller name",
//       email: seller.email,
//       sellerLink: `${process.env.NEXT_PUBLIC_SERVER_URL}/seller-confirmation/${orderId}`,
//       sellerProducts,
//       stripeAccount: checkStripeInfo[index].stripeId ? true : false,
//     };
//   });
//   const sellerDetails = se.filter((seller) => seller.sellerProducts);
//   if (!sellerDetails || sellerDetails.length === 0) {
//     throw new TRPCError({
//       code: "INTERNAL_SERVER_ERROR",
//       message: `Could not find seller details`,
//     });
//   }
//   const sendEmails = sellerDetails.map(
//     async (seller, index) =>
//       await sendEmail({
//         userEmail: seller.email,
//         subject: "You just sold products! Collect your payment.",
//         html: ReceiptEmailHtml({
//           email: seller.email,
//           date: new Date(),
//           orderId,
//           products: seller.sellerProducts!,
//           collectPaymentLink: seller.sellerLink,
//           stripeAccount: seller.stripeAccount,
//         }),
//       })
//   );
//   if (!sendEmails) {
//     throw new TRPCError({
//       code: "INTERNAL_SERVER_ERROR",
//       message: `Could not send email to sellers`,
//     });
//   }
//   const sendEmailToBuyer = await sendEmail({
//     userEmail: user.email!,
//     subject: "Thanks for your order! This is your receipt.",
//     html: ReceiptEmailHtml({
//       email: user.email!,
//       date: new Date(),
//       orderId,
//       products: getProducts,
//     }),
//   });
//   if (!sendEmailToBuyer) {
//     throw new TRPCError({
//       code: "INTERNAL_SERVER_ERROR",
//       message: `Could not send email to buyer`,
//     });
//   }
//   const updateProduct = await prisma.order.update({
//     where: { orderId },
//     data: { sendEmailToSeller: true },
//   });
//   if (!updateProduct) {
//     throw new TRPCError({
//       code: "INTERNAL_SERVER_ERROR",
//       message: `Could not update order`,
//     });
//   }
//   return {
//     isPaid: true,
//     name: user.name,
//     email: user.email,
//     orderId: findProduct.orderId,
//     total: findProduct.totalAmount,
//     getProducts,
//   };
// };
