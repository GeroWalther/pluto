'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ProductCategory } from '@prisma/client';
import { ArrowLeft } from 'lucide-react';
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
import { Spinner } from '@/components/shared/states';
import {
  FileUploadField,
  type UploadedFile,
} from '@/components/dashboard/FileUploadField';
import { PLATFORM_FEE_LABEL, PRODUCT_CATEGORIES } from '@/config';
import { formatPrice, parsePriceToCents } from '@/lib/utils';
import { productInputSchema } from '@/lib/validators';

export default function NewProductPage() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<ProductCategory | ''>('');
  const [images, setImages] = useState<UploadedFile[]>([]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const create = trpc.seller.create.useMutation({
    onSuccess: () => {
      toast.success('Product submitted — a moderator will review it shortly.');
      utils.seller.myProducts.invalidate();
      utils.seller.stats.invalidate();
      router.push('/dashboard/products');
    },
    onError: (error) => toast.error(error.message),
  });

  const priceCents = parsePriceToCents(price || '0') ?? 0;
  const earnings = Math.ceil(priceCents * 0.95);

  const submit = () => {
    const parsed = productInputSchema.safeParse({
      name,
      description,
      priceCents: parsePriceToCents(price) ?? 0,
      category: category || undefined,
      images,
      files,
    });

    if (!parsed.success) {
      // Surface the first message per field rather than a wall of text.
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error('Please fix the highlighted fields');
      return;
    }

    setErrors({});
    create.mutate(parsed.data);
  };

  return (
    <div className='max-w-2xl'>
      <Link
        href='/dashboard/products'
        className='mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-stone-900'>
        <ArrowLeft className='h-4 w-4' /> Back to my products
      </Link>

      <h2 className='text-lg font-semibold text-stone-900'>List a new product</h2>
      <p className='mt-1 text-sm text-muted-foreground'>
        Everything goes through moderation before it appears in the catalogue.
      </p>

      <div className='mt-8 space-y-6'>
        <div className='grid gap-1.5'>
          <Label htmlFor='name'>Product name</Label>
          <Input
            id='name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='Nebula UI — dashboard kit for Figma'
            maxLength={80}
          />
          {errors.name ? <p className='text-xs text-red-600'>{errors.name}</p> : null}
        </div>

        <div className='grid gap-1.5'>
          <Label htmlFor='description'>Description</Label>
          <Textarea
            id='description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='What is included, who it is for, which formats you deliver…'
            maxLength={4000}
          />
          <p className='text-xs text-muted-foreground'>
            {description.length} / 4000 characters
          </p>
          {errors.description ? (
            <p className='text-xs text-red-600'>{errors.description}</p>
          ) : null}
        </div>

        <div className='grid gap-6 sm:grid-cols-2'>
          <div className='grid gap-1.5'>
            <Label htmlFor='category'>Category</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as ProductCategory)}>
              <SelectTrigger id='category'>
                <SelectValue placeholder='Choose a category' />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category ? (
              <p className='text-xs text-red-600'>{errors.category}</p>
            ) : null}
          </div>

          <div className='grid gap-1.5'>
            <Label htmlFor='price'>Price (€)</Label>
            <Input
              id='price'
              type='number'
              min='1'
              step='0.01'
              inputMode='decimal'
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder='19.00'
            />
            {priceCents > 0 ? (
              <p className='text-xs text-muted-foreground'>
                You receive {formatPrice(earnings)} after the {PLATFORM_FEE_LABEL}{' '}
                commission.
              </p>
            ) : null}
            {errors.priceCents ? (
              <p className='text-xs text-red-600'>{errors.priceCents}</p>
            ) : null}
          </div>
        </div>

        <div>
          <FileUploadField
            endpoint='productImage'
            files={images}
            onChange={setImages}
            max={5}
            preview
            label='Preview images'
            hint='Shown publicly on the listing. The first image is the cover.'
          />
          {errors.images ? (
            <p className='mt-1.5 text-xs text-red-600'>{errors.images}</p>
          ) : null}
        </div>

        <div>
          <FileUploadField
            endpoint='productFile'
            files={files}
            onChange={setFiles}
            max={10}
            label='Product files'
            hint='What the buyer downloads. These are never public — access requires a paid order.'
          />
          {errors.files ? (
            <p className='mt-1.5 text-xs text-red-600'>{errors.files}</p>
          ) : null}
        </div>

        <div className='flex gap-3 border-t border-stone-200 pt-6'>
          <Button onClick={submit} disabled={create.isPending}>
            {create.isPending ? <Spinner className='mr-2' /> : null}
            Submit for review
          </Button>
          <Button asChild variant='ghost'>
            <Link href='/dashboard/products'>Cancel</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
