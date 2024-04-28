// import TestUploadThing from '@/components/test/TestUploadThing';

// const Page = async () => {
//   return (
//     <>
//       <TestUploadThing />
//     </>
//   );
// };

// export default Page;

// // import { serverCaller } from '@/trpc';

// // const Page = async () => {
// //   const data = await serverCaller.getUserFromEmail('gero.walther@gmail.com');
// //   const changedName = await serverCaller.updateUserName({
// //     email: 'gero.walther@gmail.com',
// //     newUserName: 'gero used trpc! ',
// //   });
// //   if (data) {
// //     return (
// //       <section>
// //         <div>
// //           <p>Old name in DB: </p>
// //           <h2>{data.name}</h2>
// //         </div>
// //         <div>
// //           <p>updated name in DB: </p>
// //           <h2>{changedName.name}</h2>
// //         </div>
// //       </section>
// //     );
// //   }
// // };

// // export default Page;

// // import TestNextAuth from '@/components/Test/TestNextAuth';
// // import { authOptions } from '@/lib/auth';
// // import { getServerSession } from 'next-auth/next';
// // const Page = async () => {
// //   const session = await getServerSession(authOptions);
// //   if (!session) {
// //     return <div>Auth failed</div>;
// //   }
// //   const user = session.user;
// //   console.log(user);
// //   return (
// //     <section>
// //       <h1>Test</h1>
// //       <div className='border p-3 m-4'>
// //         <h2>Server session</h2>
// //         <p>{JSON.stringify(user)}</p>
// //       </div>
// //       <div className='border p-3 m-4'>
// //         <h2>Client session</h2>
// //         <TestNextAuth />
// //       </div>
// //     </section>
// //   );
// // };

// // export default Page;
// "use client";

// import { TQueryValidator } from "@/lib/validators/query-validator";
// import Link from "next/link";
// import { trpc } from "@/trpc/client";
// //import { Product } from '@/payload-types';
// import ProductListing from "./ProductListing";

// interface ProductReelProps {
//   title: string;
//   subtitle?: string;
//   href?: string;
//   query: TQueryValidator;
// }

// // limits how many products should be rendered out next to each other
// const FALLBACK_LIMIT = 4;

// const ProductReel = (props: ProductReelProps) => {
//   const { title, subtitle, href, query } = props;

//   // const { data: queryResults, isLoading } =
//   //   trpc.getInfiniteProducts.useInfiniteQuery(
//   //     {
//   //       limit: query.limit ?? FALLBACK_LIMIT,
//   //       query,
//   //     },
//   //     {
//   //       getNextPageParam: (lastPage: any) => lastPage.nextPage,
//   //     }
//   //   );

//   // const products = queryResults?.pages.flatMap((page) => page.items);

//   // let map: (Product | null)[] = [];
//   // if (products && products.length) {
//   //   map = products;
//   // } else if (isLoading) {
//   //   map = new Array<null>(query.limit ?? FALLBACK_LIMIT).fill(null);
//   // }

//   return (
//     <section className="py-12">
//       <div className="md:flex md:items-center md:justify-between mb-4">
//         <div className="max-w-2xl px-4 lg:max-w-4xl lg:px-0">
//           {title ? (
//             <h1 className="font-bold text-stone-900 sm:text-xl">{title}</h1>
//           ) : null}
//           {subtitle ? (
//             <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
//           ) : null}
//         </div>

//         {href ? (
//           <Link
//             href={href}
//             className="hidden text-sm font-medium text-blue-600 hover:text-blue-500 md:block"
//           >
//             Shop the collection <span aria-hidden="true">&rarr;</span>
//           </Link>
//         ) : null}
//       </div>

//       <div className="relative">
//         <div className="mt-6 flex items-center w-full">
//           <div className="w-full grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-10 lg:gap-x-8">
//             {/* {map.map((product, i) => (
//               //@ts-ignore
//               <ProductListing
//                 key={`product-${i}`}
//                 product={product}
//                 index={i}
//               />
//             ))} */}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default ProductReel;

{
  /* <main className="relative lg:min-h-full">
  {" "}
  <div className="hidden lg:block h-80 overflow-hidden lg:absolute lg:h-full lg:w-1/2 lg:pr-4 xl:pr-12">
    {" "}
    <Image
      fill
      src={"/eis.jpg"}
      className="h-full w-full object-cover object-center"
      alt="thank you for your order"
    />{" "}
  </div>{" "}
  <div>
    {" "}
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-32 xl:gap-x-24">
      {" "}
      <div className="lg:col-start-2">
        {" "}
        <p className="text-sm font-medium text-blue-600">
          Order successful
        </p>{" "}
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
          {" "}
          Thanks for ordering{" "}
        </h1>{" "}
        {order._isPaid ? (
          <p className="mt-2 text-base text-muted-foreground">
            {" "}
            Your order was processed and your assets are available to download
            below. We&apos;ve sent your receipt and order details to{" "}
            {typeof order.user !== "string" ? (
              <span className="font-medium text-stone-900">
                {" "}
                {order.user.email}{" "}
              </span>
            ) : null}{" "}
            .{" "}
          </p>
        ) : (
          <p className="mt-2 text-base text-muted-foreground">
            {" "}
            We appreciate your order, and we&apos;re currently processing it. So
            hang tight and we&apos;ll send you confirmation very soon!{" "}
          </p>
        )}{" "}
        <div className="mt-16 text-sm font-medium">
          {" "}
          <div className="text-muted-foreground">Order nr.</div>{" "}
          <div className="mt-2 text-stone-900">{order.id}</div>{" "}
          <ul className="mt-6 divide-y divide-stone-200 border-t border-stone-200 text-sm font-medium text-muted-foreground">
            {" "}
            {(order.products as Product[]).map((product) => {
              const label = PRODUCT_CATEGORIES.find(
                ({ value }) => value === product.category
              )?.label;
              const downloadUrl = (product.product_files as ProductFile)
                .url as string;
              const { image } = product.images[0];
              return (
                <li key={product.id} className="flex space-x-6 py-6">
                  {" "}
                  <div className="relative h-24 w-24">
                    {" "}
                    {typeof image !== "string" && image.url ? (
                      <Image
                        fill
                        src={image.url}
                        alt={`${product.name} image`}
                        className="flex-none rounded-md bg-stone-100 object-cover object-center"
                      />
                    ) : null}{" "}
                  </div>{" "}
                  <div className="flex-auto flex flex-col justify-between">
                    {" "}
                    <div className="space-y-1">
                      {" "}
                      <h3 className="text-stone-900">{product.name}</h3>{" "}
                      <p className="my-1">Category: {label}</p>{" "}
                    </div>{" "}
                    {order._isPaid ? (
                      <a
                        href={downloadUrl}
                        download={product.name}
                        className="text-blue-600 hover:underline underline-offset-2"
                      >
                        {" "}
                        Download asset{" "}
                      </a>
                    ) : null}{" "}
                  </div>{" "}
                  <p className="flex-none font-medium text-stone-900">
                    {" "}
                    {formatPrice(product.price)}{" "}
                  </p>{" "}
                </li>
              );
            })}{" "}
          </ul>{" "}
          <div className="space-y-6 border-t border-stone-200 pt-6 text-sm font-medium text-muted-foreground">
            {" "}
            <div className="flex justify-between">
              {" "}
              <p>Subtotal</p>{" "}
              <p className="text-stone-900">{formatPrice(orderTotal)}</p>{" "}
            </div>{" "}
            <div className="flex justify-between">
              {" "}
              <p>Transaction Fee</p>{" "}
              <p className="text-stone-900">
                {" "}
                {formatPrice(order.products.length)}{" "}
              </p>{" "}
            </div>{" "}
            <div className="flex items-center justify-between border-t border-stone-200 pt-6 text-stone-900">
              {" "}
              <p className="text-base">Total</p>{" "}
              <p className="text-base">
                {" "}
                {formatPrice(orderTotal + order.products.length)}{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <PaymentStatus
            isPaid={order._isPaid}
            orderEmail={(order.user as User).email}
            orderId={order.id}
          />{" "}
          <div className="mt-16 border-t border-stone-200 py-6 text-right">
            {" "}
            <Link
              href="/products"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              {" "}
              Continue shopping &rarr;{" "}
            </Link>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>{" "}
  </div>{" "}
</main>; */
}
