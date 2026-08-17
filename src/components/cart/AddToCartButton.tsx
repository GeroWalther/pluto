'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Check, Library, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';

export function AddToCartButton({
  productId,
  productName,
  owned,
  isOwnProduct,
  className,
}: {
  productId: string;
  productName: string;
  owned?: boolean;
  isOwnProduct?: boolean;
  className?: string;
}) {
  const add = useCart((s) => s.add);
  // Subscribing to the array (rather than calling has()) is what makes this
  // button re-render when the item is removed elsewhere.
  const productIds = useCart((s) => s.productIds);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (owned) {
    return (
      <Button asChild size='lg' variant='outline' className={className}>
        <Link href='/library'>
          <Library className='mr-2 h-4 w-4' />
          You own this — open library
        </Link>
      </Button>
    );
  }

  if (isOwnProduct) {
    return (
      <Button size='lg' variant='outline' className={className} disabled>
        This is your listing
      </Button>
    );
  }

  // Render the neutral state until hydration so SSR and the client agree.
  const inCart = mounted && productIds.includes(productId);

  return (
    <Button
      size='lg'
      className={className}
      disabled={inCart}
      onClick={() => {
        add(productId);
        toast.success(`${productName} added to your cart`);
      }}>
      {inCart ? (
        <>
          <Check className='mr-2 h-4 w-4' /> In your cart
        </>
      ) : (
        <>
          <ShoppingCart className='mr-2 h-4 w-4' /> Add to cart
        </>
      )}
    </Button>
  );
}
