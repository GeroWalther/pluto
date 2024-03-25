'use client';
import { UploadDropzone } from '@/lib/uploadthing';
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState<string>('');
  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-2'>
      <UploadDropzone
        endpoint='imageUploader'
        onClientUploadComplete={(res) => {
          // Do something with the response
          setUrl(res?.[0]?.url);
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          alert(`ERROR! ${error.message}`);
        }}
      />
      {url && <img src={url} width={200} height={200} alt='uploaded image' />}
    </div>
  );
}
