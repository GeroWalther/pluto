import MaxWidthWrapper from "@/components/comp/MaxWidthWrapper";
import ProductReel from "@/components/comp/ProductReel";
import { Button, buttonVariants } from "@/components/ui/button";

import { CheckCircle, TimerResetIcon, Waves } from "lucide-react";
import Link from "next/link";

// content for homepage features section
const perks = [
  {
    name: "Instant Delivery",
    Icon: TimerResetIcon,
    Description:
      "Get your assets delivered to your email in seconds and download them right away.",
  },
  {
    name: "Guaranteed Quality",
    Icon: CheckCircle,
    Description:
      "Every asset on our platform is verified by our team to ensure our highest quality standards.",
  },
  {
    name: "For the Planet",
    Icon: Waves,
    Description: "We've pledged 1% of sales to clean the oceans from plastics",
  },
];

// Static home page - root
export default function Home() {
  return (
    <>
      <MaxWidthWrapper className="py-8 sm:py-15 ">
        <div className="py-8 mx-auto text-center flex flex-col items-center max-w-3xl">
          <h1 className="sm:mb-8 text-4xl font-bold tracking-tight text-stone-700 sm:text-6xl ">
            Your marketplace for high-quality{" "}
            <span className="text-stone-400">digital assets</span>.
          </h1>
          <p className=" mt-6 text-lg max-w-prose text-muted-foreground">
            Welcome to Pluto Market. Every asset on our platform is verified by
            our team to ensure our highest quality standards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Link href="/products" className={buttonVariants()}>
              Brows Trending
            </Link>
            <Button variant="outline">Our quality promite &rarr;</Button>
          </div>
        </div>
        <ProductReel
          href="/products"
          title="New in!"
          query={{ sort: "desc", limit: 4 }}
        />
      </MaxWidthWrapper>
      <section className=" border-t border-stone-200 bg-stone-50">
        <MaxWidthWrapper className="py-8">
          <div className=" grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
            {perks.map((p) => (
              <div
                key={p.name}
                className=" text-center md:flex md:items-start md:text-left lg:block lg:text-center"
              >
                <div className=" md:flex-shrink-0 flex justify-center">
                  <div className="h-16 w-16 flex items-center justify-center rounded-full bg-stone-200 text-stone-900">
                    {<p.Icon className="w-1/3 h-1/3" />}
                  </div>
                </div>
                <div className="mt-6 md:ml-4 md:mt-0 lg:ml-0 lg:mt-6">
                  <h3 className="text-base font-medium text-stone-800">
                    {p.name}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {p.Description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>
    </>
  );
}
