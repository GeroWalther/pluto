import { trpc } from '@/trpc/client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadDropzone } from '@/lib/uploadthing';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Button, buttonVariants } from '../ui/button';
import { SubmitHandler, useForm } from 'react-hook-form';
import { ZodError, z } from 'zod';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FormFields,
  uploadSchema,
} from '@/lib/validators/account-credentials-validator';

export default function UploadForm({
  className,
}: React.ComponentProps<'form'>) {
  const [urls, setUrls] = useState<string[]>([]);
  const [fileKeys, setFileKeys] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(uploadSchema),
  });

  const router = useRouter();

  const { mutate: onDelete } = trpc.seller.deleteUploadedFile.useMutation({
    onSuccess: (data) => {
      setUrls([]);
      setFileKeys([]);
      toast.success(data);
    },
    onError: () => {
      toast.error('Error deleting file');
    },
  });
  const { mutate: uploadProduct } = trpc.seller.uploadProduct.useMutation({
    onError: (err) => {
      if (err.data) {
        toast.error(err.message);
        return;
      }
      if (err instanceof ZodError) {
        toast.error(err.issues[0].message);
        return;
      }
      toast.error('Something went wrong. Please try again.');
    },
    onSuccess: () => {
      router.push('/dashboard');
    },
  });

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    console.log(data);
    const { description, name, price, imageUrl } = data;
    await uploadProduct({
      description,
      name,
      price,
      imageUrl,
    });
  };

  return (
    <form
      className={cn('grid items-start gap-4', className)}
      onSubmit={handleSubmit(onSubmit)}>
      <div className='grid gap-2'>
        <Label htmlFor='name'>Product name</Label>
        <Input type='text' id='name' {...register('name')} />
        {errors.name && (
          <p className='text-sm text-red-500'>{errors.name.message}</p>
        )}
      </div>
      <div className='grid gap-2'>
        <Label htmlFor='price'>Price</Label>
        <Input id='price' type='number' {...register('price')} />
        {errors.price && (
          <p className='text-sm text-red-500'>{errors.price.message}</p>
        )}
      </div>
      <div className='grid gap-2'>
        <Label htmlFor='description'>Description</Label>
        <textarea id='description' {...register('description')} />
        {errors.description && (
          <p className='text-sm text-red-500'>{errors.description.message}</p>
        )}
      </div>

      {urls.length >= 0 && urls?.[0] ? (
        <div className='mb-10'>
          <Image
            src={urls?.[0]}
            alt='uploaded image'
            width={200}
            height={100}
          />
          <Button
            type='button'
            className={buttonVariants({
              variant: 'destructive',
            })}
            onClick={() => onDelete(fileKeys)}>
            Delete image
          </Button>
        </div>
      ) : (
        <>
          <p className='text-sm font-semi-bold'>Upload one product image</p>
          <UploadDropzone
            {...register('imageUrl')}
            endpoint='imageUploader'
            onClientUploadComplete={(res) => {
              setUrls(res.map((r) => r.url));
              setFileKeys(res.map((r) => r.key));
              console.log(res);
              console.log(
                'URL: ',
                res.map((r) => r.url)
              );
              console.log(
                'KEY: ',
                res.map((r) => r.key)
              );
              toast.success('uploaded successfully');
            }}
            onUploadError={(error) => {
              toast.error(error.message);
            }}
          />
        </>
      )}
      {/* <h4 className='text-sm font-semi-bold'>Upload one product file you wish to sale. </h4>
       <p className='text-sm font-semi-bold'>Select one type. (supported are: pdf, svg, ttf etc.) </p>
          <UploadDropzone
            endpoint='imageUploader'
            onClientUploadComplete={(res) => {
              setUrls(res.map((r) => r.url));
              setFileKeys(res.map((r) => r.key));
              toast.success('uploaded successfully');
            }}
            onUploadError={(error) => {
              toast.error(error.message);
            }}
          /> */}
      <Button disabled={isSubmitting} className='mt-5' type='submit'>
        {isSubmitting ? 'Loading...' : 'Upload for sale'}
      </Button>
    </form>
  );
}
