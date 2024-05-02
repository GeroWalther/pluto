'use client';

// import { PRODUCT_CATEGORIES } from '@/config';
// import { Menu, X } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useEffect, useState } from "react";

// const MobileNav = () => {
//   const [isOpen, setIsOpen] = useState<boolean>(false);

//   const pathname = usePathname();

//   const closeMenu = () => {
//     setIsOpen(false);
//   };
//   // whenever we click an item in the menu and navigate away, we want to close the menu
//   useEffect(() => {
//     closeMenu();
//   }, [pathname]);

//   // when we click the path we are currently on, we still want the mobile menu to close,
//   // however we cant rely on the pathname for it because that won't change (we're already there)
//   const closeOnCurrent = (href: string) => {
//     if (pathname === href) {
//       closeMenu();
//     }
//   };

//   // remove second scrollbar when mobile menu is open
//   useEffect(() => {
//     if (isOpen) {
//       document.body.classList.add("overflow-hidden");
//     } else {
//       document.body.classList.remove("overflow-hidden");
//     }
//   }, [isOpen]);

//   if (!isOpen)
//     return (
//       <button
//         type="button"
//         onClick={() => setIsOpen(true)}
//         className="lg:hidden relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-stone-400"
//       >
//         <Menu className="h-6 w-6" aria-hidden="true" />
//       </button>
//     );

//   return (
//     <div>
//       <div className="relative z-40 lg:hidden">
//         <div className="fixed inset-0 bg-black bg-opacity-25" />
//       </div>

//       <div className="fixed overflow-y-scroll overscroll-y-none inset-0 z-40 flex">
//         <div className="w-4/5">
//           <div className="relative flex w-full max-w-sm flex-col overflow-y-auto bg-white pb-12 shadow-xl">
//             <div className="flex px-4 pb-2 pt-5">
//               <button
//                 type="button"
//                 onClick={() => setIsOpen(false)}
//                 className="relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-stone-400"
//               >
//                 <X className="h-6 w-6" aria-hidden="true" />
//               </button>
//             </div>

//             <div className="mt-2">
//               <ul>
//                 {PRODUCT_CATEGORIES.map((category) => (
//                   <li
//                     key={category.label}
//                     className="space-y-10 px-4 pb-8 pt-10"
//                   >
//                     <div className="border-b border-stone-200">
//                       <div className="-mb-px flex">
//                         <p className="border-transparent text-stone-900 flex-1 whitespace-nowrap border-b-2 py-4 text-base font-medium">
//                           {category.label}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-2 gap-y-10 gap-x-4">
//                       {category.featured.map((item) => (
//                         <div key={item.name} className="group relative text-sm">
//                           <div className="relative aspect-square overflow-hidden rounded-lg bg-stone-100 group-hover:opacity-75">
//                             <Image
//                               fill
//                               src={item.ImageSrc}
//                               alt="product category image"
//                               className="object-cover object-center"
//                             />
//                           </div>
//                           <Link
//                             href={item.href}
//                             className="mt-6 block font-medium text-stone-900"
//                           >
//                             {item.name}
//                           </Link>
//                         </div>
//                       ))}
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             <div className="space-y-6 border-t border-stone-200 px-4 py-6">
//               <div className="flow-root">
//                 <Link
//                   onClick={() => closeOnCurrent("/sign-in")}
//                   href="/sign-in"
//                   className="-m-2 block p-2 font-medium text-stone-900"
//                 >
//                   Sign in
//                 </Link>
//               </div>
//               <div className="flow-root">
//                 <Link
//                   onClick={() => closeOnCurrent("/sign-up")}
//                   href="/sign-up"
//                   className="-m-2 block p-2 font-medium text-stone-900"
//                 >
//                   Sign up
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MobileNav;

import React, { useState } from 'react';
import { PRODUCT_CATEGORIES } from '@/config';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Button, buttonVariants } from '../ui/button';
import { Menu, Package2 } from 'lucide-react';
import Link from 'next/link';
import { ScrollArea } from '../ui/scroll-area';
import { useSession } from 'next-auth/react';
import { useSignOut } from '@/hooks/use-sign-out';
import { PlutoLogo } from '../svgs/Icons';
import IsProAd from './IsProAd';
import Cart from './Cart';

export default function MobilNav() {
  const { data: session } = useSession();
  const user = session?.user;
  const { plutoSignOut } = useSignOut();
  const [open, setOpen] = useState(false);

  return (
    <div className='mt-3'>
      <Sheet open={open}>
        <SheetTrigger asChild>
          <Button
            onClick={() => setOpen((p) => !p)}
            variant='outline'
            size='icon'
            className='shrink-0 lg:hidden'>
            <Menu className='h-5 w-5' />
            <span className='sr-only'>Toggle mobile navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent setOpen={setOpen} side='left' className='flex flex-col'>
          <ScrollArea>
            <nav className='grid gap-8 text-lg font-medium'>
              <div className='flex justify-between items-center'>
                <PlutoLogo />
                <div className='mr-10'>
                  <Cart />
                </div>
              </div>
              {user && (
                <Link
                  href='#'
                  className='flex items-center gap-5 text-lg font-semibold'>
                  <Package2 className='h-6 w-6' />
                  <p
                    //  className='sr-only'
                    className='text-lg font-bold uppercase'>
                    {user.name}
                  </p>
                </Link>
              )}
              <ul>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <li key={cat.label}>
                    {cat.featured.map((f) => (
                      <Link
                        onClick={() => setOpen(false)}
                        key={f.name}
                        href={`/products?category=${cat.value}`}
                        className='mx-[-0.65rem] mb-4 flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground'>
                        <span>{cat.label}</span>
                      </Link>
                    ))}
                  </li>
                ))}
              </ul>

              {/* Log out/ Log in */}
              {user && (
                <Button
                  onClick={plutoSignOut}
                  className={buttonVariants({
                    size: 'sm',
                    className: 'w-[40%] ',
                  })}>
                  Log out
                </Button>
              )}

              {!user && (
                //  todo: does not close when link clicked
                <div className='space-x-6 '>
                  <Link
                    href='/sign-in'
                    className={buttonVariants({
                      variant: 'default',
                    })}>
                    Sign in
                  </Link>

                  <Link
                    href='/sign-up'
                    className={buttonVariants({
                      variant: 'default',
                    })}>
                    Sign up
                  </Link>
                </div>
              )}

              <IsProAd />
            </nav>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
