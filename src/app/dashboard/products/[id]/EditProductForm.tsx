'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProductCategory } from '@prisma/client';
import { ArrowLeft, FileIcon } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ErrorState, PageSpinner, Spinner } from '@/components/shared/states';
import { PLATFORM_FEE_LABEL, PRODUCT_CATEGORIES } from '@/config';
import { formatPrice, parsePriceToCents } from '@/lib/utils';

export default function EditProductForm({ id }: { id: string }) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: product, isLoading, isError, error } = trpc.seller.product.useQuery({ id });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<ProductCategory | ''>('');

  // Populate once the product arrives.
  useEffect(() => {
    if (!product) return;
    setName(product.name);
    setDescription(product.description);
    setPrice((product.priceCents / 100).toFixed(2));
    setCategory(product.category);
  }, [product]);

  const update = trpc.seller.update.useMutation({
    onSuccess: () => {
      toast.success('Saved. Your product goes back into review.');
      utils.seller.myProducts.invalidate();
      utils.seller.product.invalidate({ id });
      router.push('/dashboard/products');
    },
    onError: (mutationError) => toast.error(mutationError.message),
  });

  if (isLoading) return <PageSpinner />;
  if (isError || !product) {
    return <ErrorState title='Product not found' description={error?.message} />;
  }

  const priceCents = parsePriceToCents(price || '0') ?? 0;

  return (
    <div className='max-w-2xl'>
      <Link
        href='/dashboard/products'
        className='mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-stone-900'>
        <ArrowLeft className='h-4 w-4' /> Back to my products
      </Link>

      <h2 className='text-lg font-semibold text-stone-900'>Edit product</h2>
      <p className='mt-1 text-sm text-muted-foreground'>
        Saving sends the listing back through moderation.
      </p>

      <div className='mt-8 space-y-6'>
        <div className='grid gap-1.5'>
          <Label htmlFor='name'>Product name</Label>
          <Input
            id='name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
          />
        </div>

        <div className='grid gap-1.5'>
          <Label htmlFor='description'>Description</Label>
          <Textarea
            id='description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={4000}
          />
        </div>

        <div className='grid gap-6 sm:grid-cols-2'>
          <div className='grid gap-1.5'>
            <Label htmlFor='category'>Category</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as ProductCategory)}>
              <SelectTrigger id='category'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='grid gap-1.5'>
            <Label htmlFor='price'>Price (€)</Label>
            <Input
              id='price'
              type='number'
              min='1'
              step='0.01'
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            {priceCents > 0 ? (
              <p className='text-xs text-muted-foreground'>
                You receive {formatPrice(Math.ceil(priceCents * 0.95))} after the{' '}
                {PLATFORM_FEE_LABEL} commission.
              </p>
            ) : null}
          </div>
        </div>

        <div className='rounded-xl border border-stone-200 bg-stone-50/60 p-5'>
          <h3 className='text-sm font-medium text-stone-900'>Attached files</h3>
          <p className='mt-1 text-xs text-muted-foreground'>
            Files cannot be swapped after publishing — buyers keep the exact copy they
            paid for. To ship different files, create a new listing.
          </p>
          <ul className='mt-3 space-y-2'>
            {product.fileNames.map((fileName) => (
              <li
                key={fileName}
                className='flex items-center gap-2.5 rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-stone-200'>
                <FileIcon className='h-4 w-4 shrink-0 text-stone-400' />
                <span className='truncate'>{fileName}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className='flex gap-3 border-t border-stone-200 pt-6'>
          <Button
            disabled={update.isPending || !category}
            onClick={() =>
              update.mutate({
                id,
                data: {
                  name,
                  description,
                  priceCents: parsePriceToCents(price) ?? 0,
                  category: category as ProductCategory,
                },
              })
            }>
            {update.isPending ? <Spinner className='mr-2' /> : null}
            Save changes
          </Button>
          <Button asChild variant='ghost'>
            <Link href='/dashboard/products'>Cancel</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
