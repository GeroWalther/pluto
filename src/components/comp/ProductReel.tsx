"use client";

import { TQueryValidator } from "@/lib/validators/query-validator";
import { trpc } from "@/trpc/client";
import Link from "next/link";
//import { Product } from '@/payload-types';
import Image from "next/image";
import Loader from "../Loader/Loader";
import ProductListing from "./ProductListing";

interface ProductReelProps {
  title: string;
  subtitle?: string;
  href?: string;
  query: TQueryValidator;
}

const FALLBACK_LIMIT = 4;

const ProductReel = (props: ProductReelProps) => {
  const { title, subtitle, href, query } = props;
  const { data, error, isLoading } = trpc.admin.getApprovedProducts.useQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader />
      </div>
    );
  }

  if (error?.data?.code === "NOT_FOUND") {
    return (
      <div className="text-center text-stone-500">
        <h2>No Product Found</h2>
        <p>You can add products to sell here</p>
      </div>
    );
  }

  if (data) {
    return (
      <section className="py-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-stone-700">{title}</h2>
          {href && <Link href={href}>View all</Link>}
        </div>
        {subtitle && <p className="text-stone-500 mb-4">{subtitle}</p>}
        {data.map((product) => (
          // grid of two
          <div key={product.id} className="grid grid-cols-2">
            <img
              src={product.imageUrls[0]}
              alt={product.name}
              width="100%"
              height="100%"
            />
          </div>
        ))}
      </section>
    );
  }

  return (
    <div className="text-center text-stone-500">
      <h2>Something went wrong</h2>
      <p>Try again later</p>
    </div>
  );
};

export default ProductReel;
