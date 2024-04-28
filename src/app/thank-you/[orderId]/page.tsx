"use client";
import MissingPerams from "@/components/comp/MissingPerams";
import PaymentStatus from "@/components/comp/PaymentStatus";
import Thankyou from "@/components/thankyou/Thankyou";
import { PRODUCT_CATEGORIES } from "@/config";

import { formatPrice } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { useSession } from "next-auth/react";

import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect, useSearchParams } from "next/navigation";
import React from "react";

interface PageProps {
  params: {
    orderId: string;
  };
}

const Page: React.FC<PageProps> = ({ params }) => {
  if (!params.orderId) {
    return <MissingPerams />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Thankyou orderId={params.orderId} />
    </div>
  );
};

export default Page;
