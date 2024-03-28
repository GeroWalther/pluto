'use client';
import { UploadDropzone } from '@/lib/uploadthing';
import { useState } from 'react';
import { toast } from 'sonner';
import ImageSlider from '../comp/ImageSlider';
import { trpc } from '@/trpc/client';
import { Button } from '../ui/button';

export default function TestUploadThing() {
  const [urls, setUrls] = useState<string[]>([]);
  const [fileKeys, setFileKeys] = useState<string[]>([]);

  const { mutate: deleteAll } = trpc.seller.deleteAllUploadedFiles.useMutation({
    onSuccess: (data) => {
      setUrls([]);
      setFileKeys([]);
      toast.success(data);
    },
    onError: () => {
      toast.error('Error deleting file');
    },
  });

  function onSubmit(e: any) {
    e.preventDefault();
  }

  return (
    <form
      onSubmit={onSubmit}
      className='flex min-h-screen flex-col items-center justify-center p-2'>
      <h3>Upload Products</h3>
      <p>Upload one image</p>
      {/*a form for Product name and description and price */}

      <UploadDropzone
        endpoint='imageUploader'
        onClientUploadComplete={(res) => {
          setUrls(res.map((r) => r.url));
          setFileKeys(res.map((r) => r.key));
        }}
        onUploadError={(error) => {
          toast.error(error.message);
        }}
      />

      {urls.length >= 0 && (
        <div>
          <ImageSlider urls={urls} />
          <Button onClick={() => deleteAll(fileKeys)}>Delete all</Button>
        </div>
      )}
    </form>
  );
}
