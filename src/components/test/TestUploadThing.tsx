'use client';
import { UploadDropzone } from '@/lib/uploadthing';
import { useState } from 'react';
import { toast } from 'sonner';
import ImageSlider from '../comp/ImageSlider';
import { trpc } from '@/trpc/client';
import { Button } from '../ui/button';

const testArr = [
  process.env.NEXT_PUBLIC_SERVER_URL + '/nav/e-books/mixed.jpg',
  process.env.NEXT_PUBLIC_SERVER_URL + '/nav/e-books/blue.jpg',
  process.env.NEXT_PUBLIC_SERVER_URL + '/nav/e-book/purple.jpg',
];

export default function TestUploadThing() {
  const [urls, setUrls] = useState<string[]>(testArr);
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

  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-2'>
      <UploadDropzone
        endpoint='imageUploader'
        onClientUploadComplete={(res) => {
          setUrls((s) => [...s, res?.[0]?.url]);
          setFileKeys((s) => [...s, res?.[0]?.key]);
        }}
        onUploadError={(error) => {
          toast.error('Error uploading');
        }}
      />
      {urls && <ImageSlider urls={urls} />}
      {urls && <Button onClick={() => deleteAll(fileKeys)}>Delete all</Button>}
    </div>
  );
}
