'use client';
import React from 'react';

import { UploadButton, UploadDropzone } from '@/lib/uploadthing';
import { trpc } from '@/trpc/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button, buttonVariants } from '../ui/button';
import { Combobox } from './Combobox';

// state/reducer to set value and pass to combobox?
const values = [
  {
    value: 'imageUploader',
    label: 'Image (PGN, JPEG)',
  },
  {
    value: 'svnUploader',
    label: 'SVN',
  },
  {
    value: 'pdfUploader',
    label: 'PDF',
  },
  {
    value: 'ttfFontUploader',
    label: 'ttf',
  },
  {
    value: 'otfFontUploader',
    label: 'otf',
  },
  {
    value: 'epubUploader',
    label: 'epub',
  },
  {
    value: 'mobiUploader',
    label: 'mobi',
  },
  {
    value: 'txtUploader',
    label: 'txt (plain text)',
  },
  {
    value: 'markdownUploader',
    label: 'MD Markdown',
  },
  {
    value: 'jsonUploader',
    label: 'JSON',
  },
] as const;

const schema = z.object({
  name: z.string(),
  price: z.string(),
  description: z.string(),
});

type FormFields = z.infer<typeof schema>;

export default function UploadForm() {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imagefileKeys, setImageFileKeys] = useState<string[]>([]);
  const [prodFile, setProdFile] = useState<string[]>([]);
  const [prodFileKeys, setprodFileKeys] = useState<string[]>([]);

  const [value, setValue] = useState(values[0]);

  const { mutate: onDelete } = trpc.seller.deleteUploadedFile.useMutation({
    onSuccess: (data) => {
      setImageUrls([]);
      setImageFileKeys([]);
      setprodFileKeys([]);
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
    alert('something...');
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

  return (
    <form className='grid items-start gap-4' onSubmit={handleSubmit(onSubmit)}>
      <div className='grid gap-2'>
        <label htmlFor='productName'>Product name</label>
        <input type='text' id='productName' {...register('name')} />
        {errors.name && (
          <p className='text-sm text-red-500'>{errors.name.message}</p>
        )}
      </div>
      <div className='grid gap-2'>
        <label htmlFor='price'>Price</label>
        <input type='number' id='price' {...register('price')} />
        {errors.price && (
          <p className='text-sm text-red-500'>{errors.price.message}</p>
        )}
      </div>
      {/* Add other form fields here */}
      <div className='grid gap-2'>
        <label htmlFor='description'>Description</label>
        <textarea id='description' {...register('description')} />
        {errors.description && (
          <p className='text-sm text-red-500'>{errors.description.message}</p>
        )}
      </div>

      {prodFile.length > 0 ? (
        <>
          <p className=' text-sm'>
            Your File(s) have been uploaded and are stored securely.
          </p>
          <Button variant='destructive' onClick={deleteImage}>
            Delete
          </Button>
          <UploadButton endpoint='imageUploader' />
        </>
      ) : (
        <>
          <p className=' text-sm mt-8'>
            Please select a format and upload the file you wish to sale
          </p>
          <Combobox values={values} setValue={setValue} value={value} />
          {/*  */}
          <p>{value?.label}</p>
          <UploadDropzone
            endpoint={value?.value}
            onClientUploadComplete={(res) => {
              setProdFile(res.map((r) => r.url));
              setprodFileKeys(res.map((r) => r.key));
              toast.success('uploaded successfully');
            }}
            onUploadError={(error) => {
              toast.error(error.message);
            }}
          />
        </>
      )}

      <p className=' text-sm mt-8'>Finally select an image</p>
      {imageUrls.length > 0 ? (
        <>
          <img src={imageUrls[0]} alt='product' className='w-32 h-32' />
          <Button variant='destructive' onClick={deleteImage}>
            Delete
          </Button>
          <UploadButton endpoint='imageUploader' />
        </>
      ) : (
        <UploadDropzone
          endpoint='imageUploader'
          onClientUploadComplete={(res) => {
            setImageUrls(res.map((r) => r.url));
            setImageFileKeys(res.map((r) => r.key));
            toast.success('uploaded successfully');
          }}
          onUploadError={(error) => {
            toast.error(error.message);
          }}
        />
      )}

      <button
        type='submit'
        className={buttonVariants({
          variant: 'default',
          size: 'lg',
        })}>
        Submit
      </button>
    </form>
  );
}

// 'use client';
// import { UploadButton, UploadDropzone } from '@/lib/uploadthing';
// import { trpc } from '@/trpc/client';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { toast } from 'sonner';
// import { z } from 'zod';

// const schema = z.object({
//   name: z.string(),
//   price: z.string(),
//   description: z.string(),
// });

// type FormFields = z.infer<typeof schema>;

// export default function UploadForm() {
//   const [uploading, setUploading] = useState(false);
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<FormFields>({
//     resolver: zodResolver(schema),
//   });

//   const onSubmit = async (data: FormFields) => {
//     alert(JSON.stringify(data));
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)}>
//       <input type='text' placeholder='Name' {...register('name')} />
//       <input type='text' placeholder='Price' {...register('price')} />
//       <input
//         type='text'
//         placeholder='Description'
//         {...register('description')}
//       />
//       <button type='submit'>Submit</button>
//     </form>
//   );
// }
