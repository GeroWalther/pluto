'use client';
import React, { use, useEffect } from 'react';

import { UploadButton, UploadDropzone } from '@/lib/uploadthing';
import { trpc } from '@/trpc/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button, buttonVariants } from '../ui/button';
import { Combobox } from './Combobox';
import Link from 'next/link';
import { File } from 'lucide-react';

import ImageSlider from './ImageSlider';
import { Separator } from '../ui/separator';

const schema = z.object({
  name: z.string(),
  price: z.string(),
  description: z.string(),
});

type FormFields = z.infer<typeof schema>;

export default function UploadForm() {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  console.log(imageUrls);
  const [imagefileKeys, setImageFileKeys] = useState<string[]>([]);
  const [prodFile, setProdFile] = useState<string[]>([]);
  const [prodFileKeys, setprodFileKeys] = useState<string[]>([]);

  const [value, setValue] = useState<
    | 'imageUploader'
    | 'pdfUploader'
    | 'ttfFontUploader'
    | 'otfFontUploader'
    | 'markdownUploader'
    | 'jsonUploader'
    | 'javascriptUploader'
    | 'svgUploader'
    | 'epubUploader'
    | 'mobiUploader'
    | 'txtUploader'
  >('imageUploader');

  const { mutate: onDelete } = trpc.seller.deleteUploadedFile.useMutation({
    onSuccess: (data) => {
      setImageUrls([]);
      setImageFileKeys([]);
      setprodFileKeys([]);
      setProdFile([]);
      toast.success(data);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const { mutate: uploadProduct } = trpc.seller.uploadProduct.useMutation({
    onError: (err) => {
      toast.error(err.message);
      console.log('ERROR: ', err.message);
    },
    onSuccess: (success) => {
      toast.success(success);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormFields) => {
    alert('onSubmit pressed devMode...');
    if (imageUrls.length <= 0) {
      toast.error('Image required. Please upload an image.');
      return;
    }
    if (prodFile.length <= 0) {
      toast.error('File required. Please upload a file.');
      return;
    }
    uploadProduct({
      name: data.name,
      price: parseFloat(data.price),
      description: data.description,
      imageKeys: imagefileKeys,
      imageUrls,
      productFiles: prodFile,
      productFileKeys: prodFileKeys,
    });
  };

  const deleteImage = () => {
    onDelete(imagefileKeys);
  };
  const deleteFile = () => {
    onDelete(prodFileKeys);
  };

  return (
    <form
      className='grid items-start gap-4 mt-8'
      onSubmit={handleSubmit(onSubmit)}>
      <div className='grid gap-2 '>
        <label htmlFor='productName' className=' text-sm text-stone-700'>
          Product name
        </label>
        <input
          type='text'
          className='border border-stone-300 rounded-sm'
          id='productName'
          {...register('name')}
        />
        {errors.name && (
          <p className='text-sm text-red-500'>{errors.name.message}</p>
        )}
      </div>
      <div className='grid gap-2'>
        <label htmlFor='price' className=' text-sm text-stone-700'>
          Price
        </label>
        <input
          type='number'
          id='price'
          className='border border-stone-300 rounded-sm'
          {...register('price')}
        />
        {errors.price && (
          <p className='text-sm text-red-500'>{errors.price.message}</p>
        )}
      </div>
      {/* Add other form fields here */}
      <div className='grid gap-2'>
        <label htmlFor='description' className=' text-sm text-stone-700'>
          Description
        </label>
        <textarea
          id='description'
          className='border border-stone-300 rounded-sm'
          {...register('description')}
        />
        {errors.description && (
          <p className='text-sm text-red-500'>{errors.description.message}</p>
        )}
        <Separator className='mt-6' />
      </div>

      {prodFile.length > 0 ? (
        <>
          <p className=' text-sm text-green-600 font-semibold mb-4'>
            Your File has been uploaded successfully and stored securely.
            <br />
            <span className='text-muted-foreground font-semibold'>
              ( You can upload more files or continue with the next step. )
            </span>
          </p>
          {prodFile.map((file) => (
            <div key={file} className='flex gap-2 my-2'>
              <File />
              <Link href={file.toString()} target='_blank'>
                uploaded file
              </Link>
            </div>
          ))}
          <div className='mt-2 mb-4'>
            <Button type='button' variant='destructive' onClick={deleteFile}>
              Delete
            </Button>
          </div>
          <UploadButton
            endpoint={value}
            onClientUploadComplete={(res) => {
              setProdFile((prevProdFile) => [
                ...prevProdFile,
                ...res.map((r) => r.url),
              ]);
              setprodFileKeys((prevProdFileKeys) => [
                ...prevProdFileKeys,
                ...res.map((r) => r.key),
              ]);

              toast.success('uploaded successfully');
            }}
            onUploadError={(error) => {
              toast.error(error.message);
            }}
          />
        </>
      ) : (
        <>
          <p className='text-sm mt-8 font-semibold'>
            Next, please select a format and upload the file you wish to sale.
            <span className='text-muted-foreground font-semibold'>
              (Press upload after choosing a file.)
            </span>
          </p>
          <Combobox selectedValue={value} setSelectedValue={setValue} />
          <UploadDropzone
            endpoint={value}
            onClientUploadComplete={(res) => {
              setProdFile((prevProdFile) => [
                ...prevProdFile,
                ...res.map((r) => r.url),
              ]);
              setprodFileKeys((prevProdFileKeys) => [
                ...prevProdFileKeys,
                ...res.map((r) => r.key),
              ]);

              toast.success('uploaded successfully');
            }}
            onUploadError={(error) => {
              toast.error(error.message);
            }}
          />
        </>
      )}
      <Separator className='mt-6' />
      {imageUrls.length > 0 ? (
        <>
          <p className=' text-sm mt-8 text-green-600 font-semibold'>
            Your shop image has been successfully uploaded.
          </p>
          <ImageSlider urls={imageUrls} />

          {/* <img className='h-34 w-34' src={imageUrls[0]} alt='product image' /> */}

          <div>
            <Button type='button' variant='destructive' onClick={deleteImage}>
              Delete
            </Button>
          </div>
          <UploadButton
            endpoint='imageUploader'
            onClientUploadComplete={(res) => {
              setImageUrls((prevImageUrls) => [
                ...prevImageUrls,
                ...res.map((r) => r.url),
              ]);
              setImageFileKeys((prevImageFileKeys) => [
                ...prevImageFileKeys,
                ...res.map((r) => r.key),
              ]);
              toast.success('uploaded successfully');
            }}
            onUploadError={(error) => {
              toast.error(error.message);
            }}
          />
        </>
      ) : (
        <>
          <p className=' text-sm mt-8 font-semibold'>
            Finally select an image to display in the shop. <br />
            <span className='text-muted-foreground font-semibold'>
              (Press upload after choosing a file.)
            </span>
          </p>
          <UploadDropzone
            endpoint='imageUploader'
            onClientUploadComplete={(res) => {
              setImageUrls((prevImageUrls) => [
                ...prevImageUrls,
                ...res.map((r) => r.url),
              ]);
              setImageFileKeys((prevImageFileKeys) => [
                ...prevImageFileKeys,
                ...res.map((r) => r.key),
              ]);
              toast.success('uploaded successfully');
            }}
            onUploadError={(error) => {
              toast.error(error.message);
            }}
          />
        </>
      )}
      <Separator className='my-6' />
      <p className='text-xs text-stone-500'>
        * By clicking this submit button below you agree to our privacy policy
        and terms of conditions. <br />
        Check if everything is filled out correctly and submit your digital
        product for review. We will send you an Email once the product is either
        approved or rejected for sale.
      </p>
      <button
        type='submit'
        className={buttonVariants({
          variant: 'default',
          size: 'lg',
          className: '',
        })}>
        Submit
      </button>
    </form>
  );
}
