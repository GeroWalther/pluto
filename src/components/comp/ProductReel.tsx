"use client";

import { TQueryValidator } from "@/lib/validators/query-validator";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { ProductType } from "../Table/MasterTable";
import ProductListing from "./ProductListing";

interface ProductReelProps {
  title: string;
  subtitle?: string;
  href?: string;
  query: TQueryValidator;
}

// limits how many products should be rendered out next to each other
const FALLBACK_LIMIT = 4;

const ProductReel = (props: ProductReelProps) => {
  const { title, subtitle, href, query } = props;

  //TODO: make this work
  // const { data: queryResults, isLoading } =
  //   trpc.admin.getApprovedProducts.useInfiniteQuery(
  //     {
  //       limit: query.limit ?? FALLBACK_LIMIT,
  //       query,
  //     },
  //     {
  //       getNextPageParam: (lastPage: any) => lastPage.nextPage,
  //     }
  //   );

  const { data: queryResults, isLoading } =
    trpc.admin.getApprovedProducts.useQuery();

  // const products = queryResults?.pages.flatMap((page) => page.items);

  let map: (ProductType | null)[] = [];
  // if (products && products.length) {
  //   map = products;
  // } else if (isLoading) {
  //   map = new Array<null>(query.limit ?? FALLBACK_LIMIT).fill(null);
  // }

  if (queryResults && queryResults.length) {
    map = queryResults;
  }
  if (isLoading) {
    map = new Array<null>(query.limit ?? FALLBACK_LIMIT).fill(null);
  }

  return (
    <section className="py-12">
      <div className="md:flex md:items-center md:justify-between mb-4">
        <div className="max-w-2xl px-4 lg:max-w-4xl lg:px-0">
          {title ? (
            <h1 className="font-bold text-stone-900 sm:text-xl">{title}</h1>
          ) : null}
          {subtitle ? (
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>

        {href ? (
          <Link
            href={href}
            className="hidden text-sm font-medium text-blue-600 hover:text-blue-500 md:block"
          >
            Shop all products<span aria-hidden="true">&rarr;</span>
          </Link>
        ) : null}
      </div>

      <div className="relative">
        <div className="mt-6 flex items-center w-full">
          <div className="w-full grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-10 lg:gap-x-8">
            {map.map((product: ProductType | null, i: number) => (
              <ProductListing
                key={`product-${i}`}
                product={product}
                index={i}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductReel;
