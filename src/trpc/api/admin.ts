import { z } from 'zod';
import { adminProcedure, router } from '../trpc';
import {
  getPendingProductsController,
  updatePendingProductController,
} from './controller/admin';

export const adminRouter = router({
  getPendingProducts: adminProcedure.query(async () => {
    return await getPendingProductsController();
  }),
  updatePendingProducts: adminProcedure
    .input(z.object({ id: z.string(), updateString: z.string() }))
    .mutation(async ({ input }) => {
      const updatedProduct = await updatePendingProductController(
        input.id,
        input.updateString
      );
      return updatedProduct;
    }),

  // getAllProdsOnSale:  adminProcedure.query(async () => {
  //   return await getAllProdsController();
  // },

  // getSalesdata: adminProcedure.query(async () => {
  //   return await getSalesDataController()
  // }),

  // getNumOfUsers
});
