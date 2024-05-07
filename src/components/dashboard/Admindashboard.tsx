"use client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { BadgeDollarSign, Menu, Package } from "lucide-react";
import { useReducer } from "react";

import ProductsTables from "./CompAdminDash/ProductsTables";
import Statistics from "./CompAdminDash/Statistics";

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case "SHOW_PRODUCTS":
      return {
        ...state,
        showProducts: true,
        showSales: false,
      };
    case "SHOW_SALES":
      return {
        ...state,
        showProducts: false,
        showSales: true,
      };
    default:
      return state;
  }
};

export default function SellerDashboard() {
  const [state, dispatch] = useReducer(reducer, {
    showProducts: true,
    showSales: false,
  });

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <h2 className="font-medium text-stone-700">Admin Dashboard</h2>
          </div>
          {/* Side Nav Desktop */}
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <button
                onClick={() => dispatch({ type: "SHOW_PRODUCTS" })}
                className={cn(
                  "flex items-center gap-3 rounded-lg  px-3 py-2 text-primary transition-all hover:text-primary",
                  state.showProducts && "text-primary bg-muted"
                )}
              >
                <Package className="h-4 w-4" /> <span>Products</span>
              </button>
              <button
                onClick={() => dispatch({ type: "SHOW_SALES" })}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  state.showSales && "text-primary bg-muted"
                )}
              >
                <BadgeDollarSign className="h-4 w-4" />{" "}
                <span>Sales & Analytics</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="md:hidden flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          {/* Mobile Nav */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            {/* <SheetContent side='left' className='flex flex-col'>
              <nav className='grid gap-2 text-lg font-medium'>
                <button
                  onClick={() => dispatch({ type: 'SHOW_PRODUCTS' })}
                  className={cn(
                    'mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground',
                    state.showProducts && 'text-primary bg-muted'
                  )}>
                  <Package className='h-5 w-5' /> <span>Products</span>
                </button>
                <button
                  onClick={() => dispatch({ type: 'SHOW_SALES' })}
                  className={cn(
                    'mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground',
                    state.showSales && 'text-primary bg-muted'
                  )}>
                  <BadgeDollarSign className='h-5 w-5' />{' '}
                  <span>Sales & Analytics</span>
                </button>
              </nav>
            </SheetContent> */}
          </Sheet>
        </header>

        {/* Right Side Main content */}
        {state.showProducts && (
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {/*Right side in products tab */}
            <ProductsTables />
          </main>
        )}
        {state.showSales && (
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {/*Right side in sales tab */}
            <Statistics />
          </main>
        )}
      </div>
    </div>
  );
}
