import Image from 'next/image';

import React from 'react';

type Props = {
  params: {};
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function Page(props: Props) {
  const searchParams = props.searchParams;
  const email = searchParams.to;
  return (
    <div className='container relative flex pt-20 flex-col items-center justify-center lg:px-0 '>
      <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
        <div className='flex h-full items-center flex-col justify-center space-y-1 '>
          <div className='relative mb-4 h-60 w-60 text-muted-foreground'>
            <Image
              src={'/email.jpg'}
              fill
              alt='pluto market email sent image'
            />
          </div>
          <h3 className=' font-semibold text-2xl '>Check your Email</h3>
          <p className=' text-muted-foreground text-center'>
            We&apos;ve sent a verification link to your email, <b>{email}</b>.
          </p>
          <p className='p-2 text-muted-foreground text-center'>
            You can close this tab now.
          </p>
        </div>
      </div>
    </div>
  );
}
