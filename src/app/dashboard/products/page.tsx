'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ProductStatus } from '@prisma/client';
import { ImageIcon, Package, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState, Spinner } from '@/components/shared/states';
import { categoryLabel } from '@/config';
import { cn, formatDate, formatPrice } from '@/lib/utils';

const statusStyles: Record<ProductStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 ring-red-200',
};

const statusLabels: Record<ProductStatus, string> = {
  PENDING: 'In review',
  APPROVED: 'Live',
  REJECTED: 'Rejected',
};

export default function MyProductsPage() {
  const utils = trpc.useUtils();
  const { data: products, isLoading } = trpc.seller.myProducts.useQuery();
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(
    null
  );

  const remove = trpc.seller.delete.useMutation({
    onSuccess: () => {
      toast.success('Product deleted');
      setPendingDelete(null);
      utils.seller.myProducts.invalidate();
      utils.seller.stats.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-lg font-semibold text-stone-900'>Your listings</h2>
        <Button asChild size='sm'>
          <Link href='/dashboard/products/new'>
            <Plus className='mr-1.5 h-4 w-4' /> New product
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className='space-y-3'>
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className='h-24 w-full rounded-xl' />
          ))}
        </div>
      ) : !products || products.length === 0 ? (
        <EmptyState
          icon={Package}
          title='No products yet'
          description='List your first digital product. It goes live once a moderator approves it.'
          action={{ label: 'Create a product', href: '/dashboard/products/new' }}
        />
      ) : (
        <div className='space-y-3'>
          {products.map((product) => (
            <div
              key={product.id}
              className='flex flex-col gap-4 rounded-xl border border-stone-200 p-4 sm:flex-row sm:items-center'>
              <div className='relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-stone-100'>
                {product.imageUrls[0] ? (
                  <Image
                    src={product.imageUrls[0]}
                    alt={product.name}
                    fill
                    sizes='64px'
                    className='object-cover'
                  />
                ) : (
                  <div className='flex h-full items-center justify-center'>
                    <ImageIcon className='h-5 w-5 text-stone-300' />
                  </div>
                )}
              </div>

              <div className='min-w-0 flex-1'>
                <div className='flex flex-wrap items-center gap-2'>
                  <Link
                    href={`/products/${product.slug}`}
                    className='truncate text-sm font-semibold text-stone-900 hover:underline'>
                    {product.name}
                  </Link>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1',
                      statusStyles[product.status]
                    )}>
                    {statusLabels[product.status]}
                  </span>
                </div>

                <p className='mt-1 text-xs text-muted-foreground'>
                  {categoryLabel(product.category)} · {formatPrice(product.priceCents)} ·{' '}
                  {product.soldCount} sold · added {formatDate(product.createdAt)}
                </p>

                {product.status === ProductStatus.REJECTED && product.rejectionReason ? (
                  <p className='mt-2 rounded-md bg-red-50 px-2.5 py-1.5 text-xs text-red-700'>
                    Moderator note: {product.rejectionReason}
                  </p>
                ) : null}
              </div>

              <div className='flex shrink-0 gap-2'>
                <Button asChild size='sm' variant='outline'>
                  <Link href={`/dashboard/products/${product.id}`}>Edit</Link>
                </Button>
                <Button
                  size='sm'
                  variant='ghost'
                  className='text-red-600 hover:bg-red-50 hover:text-red-700'
                  onClick={() =>
                    setPendingDelete({ id: product.id, name: product.name })
                  }>
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this product?</DialogTitle>
            <DialogDescription>
              “{pendingDelete?.name}” will be removed from the catalogue. Anyone who
              already bought it keeps their download — their copy of the files is
              unaffected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              disabled={remove.isPending}
              onClick={() =>
                pendingDelete && remove.mutate({ id: pendingDelete.id })
              }>
              {remove.isPending ? <Spinner className='mr-2' /> : null}
              Delete product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
