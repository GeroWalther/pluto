"use client";
import { ShoppingCart } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

import { useCart } from "@/hooks/use-cart";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "../ui/button";

import { useEffect, useState } from "react";
import CartItem from "./CartItem";

import { FEEINPROCENT } from "@/config";
import { formatPrice } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

export default function Cart() {
  const { items } = useCart();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const itemCount = items.length;
  const totalTransFee = items.reduce(
    (acc, { product }) => acc + product.price * FEEINPROCENT,
    0
  );

  const cartItemTotal = items.reduce(
    (total: any, { product }: any) => total + product.price,
    0
  );

  return (
    <Sheet>
      <SheetTrigger className="group -m-2 flex items-center p-2">
        <ShoppingCart
          aria-hidden="true"
          className="h-6 w-6 flex-shrink-0 text-stone-500 group-hover:text-stone-900"
        />
        <span className="ml-2 text-sm font-medium text-stone-500 group-hover:text-stone-900">
          {isMounted ? itemCount : 0}
        </span>
      </SheetTrigger>

      <SheetContent
        setOpen={setOpen}
        className="flex w-full flex-col pr-0 sm:max-w-lg"
      >
        <SheetHeader className="space-y-2.5 pr-6">
          <SheetTitle>Cart ({itemCount})</SheetTitle>
        </SheetHeader>
        {itemCount > 0 ? (
          <>
            <ScrollArea>
              <div className="flex w-full flex-col pr-6">
                {items.map(({ product }: any) => (
                  <CartItem key={product.id} product={product} />
                ))}
              </div>
            </ScrollArea>
            <div className="space-y-4 pr-6">
              <Separator />
              <div className="space-y-1-5 text-sm">
                <div className="flex">
                  <span className="flex-1">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex">
                  <span className="flex-1">Transaction Fee</span>
                  <span>{formatPrice(totalTransFee)}</span>
                </div>
                <div className="flex">
                  <span className="flex-1">Total</span>
                  <span>{formatPrice(cartItemTotal + totalTransFee)}</span>
                </div>
              </div>
              <SheetFooter>
                <SheetTrigger asChild>
                  <Link
                    href="/cart"
                    className={buttonVariants({
                      className: "w-full",
                    })}
                  >
                    Continue to Checkout &rarr;
                  </Link>
                </SheetTrigger>
              </SheetFooter>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center space-y-1">
            <div
              aria-hidden="true"
              className="relative mb-4 h-60 w-60 text-muted-foreground"
            >
              <Image
                src={process.env.NEXT_PUBLIC_SERVER_URL + "/emptyCart.png"}
                fill
                alt="empty shopping cart image"
              />
            </div>
            <div className="text-xl font-semibold">Your cart is empty.</div>
            <SheetTrigger asChild>
              <Link
                href="/products"
                className={buttonVariants({
                  variant: "link",
                  size: "sm",
                  className: "text-sm text-muted-foreground text-stone-600",
                })}
              >
                Add items to your cart to checkout
              </Link>
            </SheetTrigger>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
