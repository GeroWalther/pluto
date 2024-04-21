import { getAllPendingProducts } from "@/db/prisma.product";
import { TRPCError } from "@trpc/server";

export async function getPendingProductsController() {
  const pendingProds = await getAllPendingProducts();

  if (!pendingProds) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Problem getting pending products",
    });
  }

  if (pendingProds.length === 0) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No pending products found",
    });
  }

  return pendingProds;
}
