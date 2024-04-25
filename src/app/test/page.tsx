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
