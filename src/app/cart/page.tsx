"use client";

import { Button } from "@/components/ui/button";
import { FEEINPROCENT, PRODUCT_CATEGORIES } from "@/config";
import { useCart } from "@/hooks/use-cart";
import { cn, formatPrice } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { Check, Loader2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const { items, removeItem } = useCart();

  const router = useRouter();

  const { mutate: createCheckoutSession, isPending } =
    trpc.payment.createSession.useMutation({
      onSuccess: ({ successUrl }) => {
        router.push(successUrl!);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const productIds = items.map(({ product }) => product.id);

  const [isMounted, setIsMounted] = useState<boolean>(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const transactionFee = items.reduce(
    (acc, { product }) => acc + product.price * FEEINPROCENT,
    0
  );

  const cartTotal = items.reduce(
    (total, { product }) => total + product.price,
    0
  );

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          Shopping Cart
        </h1>

        <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          <div
            className={cn("lg:col-span-7", {
              "rounded-lg border-2 border-dashed border-stone-200 p-12":
                isMounted && items.length === 0,
            })}
          >
            <h2 className="sr-only">Items in your shopping cart</h2>

            {isMounted && items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center space-y-1">
                <div
                  aria-hidden="true"
                  className="relative mb-4 h-40 w-40 text-muted-foreground"
                >
                  <Image
                    src="/emptyCart.png"
                    fill
                    loading="eager"
                    alt="empty shopping cart"
                  />
                </div>
                <h3 className="font-semibold text-2xl">Your cart is empty</h3>
                <p className="text-muted-foreground text-center">
                  Whoops! Nothing to show here yet.
                </p>
              </div>
            ) : null}

            <ul
              className={cn({
                "divide-y divide-stone-200 border-b border-t border-stone-200":
                  isMounted && items.length > 0,
              })}
            >
              {isMounted &&
                items.map(({ product }) => {
                  const label = PRODUCT_CATEGORIES.find(
                    (c) => c.value === product.category
                  )?.label;

                  const image = product.imageUrls[0];

                  return (
                    <li
                      key={product.id}
                      className="flex py-6 sm:py-10 justify-between items-center"
                    >
                      <div className="flex-shrink-0">
                        <div className="relative h-32 w-32">
                          {image && (
                            <Image
                              fill
                              src={image}
                              alt="product image"
                              className="h-full w-full rounded-md object-cover object-center"
                            />
                          )}
                        </div>
                      </div>

                      <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                        <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                          <div>
                            <div className="flex justify-between">
                              <h3 className="text-sm">
                                <Link
                                  href={`/product/${product.id}`}
                                  className="font-medium text-stone-700 hover:text-stone-800"
                                >
                                  {product.name}
                                </Link>
                              </h3>
                            </div>

                            <div className="mt-1 flex text-sm">
                              <p className="text-muted-foreground">
                                Category: {label}
                              </p>
                            </div>

                            <p className="mt-1 text-sm font-medium text-stone-900">
                              {formatPrice(product.price)}
                            </p>
                          </div>

                          <div className="mt-4 sm:mt-0 sm:pr-9 w-20">
                            <div className="absolute right-0 top-0">
                              <Button
                                aria-label="remove product"
                                onClick={() => removeItem(product.id)}
                                variant="ghost"
                              >
                                <X className="h-5 w-5" aria-hidden="true" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <p className="mt-4 flex space-x-2 text-sm text-stone-700">
                          <Check className="h-5 w-5 flex-shrink-0 text-green-500" />

                          <span>Eligible for instant download</span>
                        </p>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>

          <section className="mt-16 rounded-lg bg-stone-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
            <h2 className="text-lg font-medium text-stone-900">
              Order summary
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-stone-600">Subtotal</p>
                <p className="text-sm font-medium text-stone-900">
                  {isMounted ? (
                    formatPrice(cartTotal)
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-stone-200 pt-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>Total Transaction Fee</span>
                </div>
                <div className="text-sm font-medium text-stone-900">
                  {isMounted ? (
                    formatPrice(transactionFee)
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-stone-200 pt-4">
                <div className="text-base font-medium text-stone-900">
                  Order Total
                </div>
                <div className="text-base font-medium text-stone-900">
                  {isMounted ? (
                    formatPrice(cartTotal + transactionFee)
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button
                disabled={items.length === 0 || isPending}
                onClick={() => createCheckoutSession({ productIds })}
                className="w-full"
                size="lg"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                ) : null}
                Checkout
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
