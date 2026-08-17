import { router } from './trpc';
import { accountRouter } from './routers/account';
import { adminRouter } from './routers/admin';
import { orderRouter } from './routers/order';
import { payoutsRouter } from './routers/payouts';
import { productRouter } from './routers/product';
import { reviewRouter } from './routers/review';
import { sellerRouter } from './routers/seller';

export const appRouter = router({
  account: accountRouter,
  product: productRouter,
  seller: sellerRouter,
  order: orderRouter,
  review: reviewRouter,
  payouts: payoutsRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
