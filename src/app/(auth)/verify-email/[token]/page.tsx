import { buttonVariants } from '@/components/ui/button';
import prisma from '@/db/db';
import { generateRandomToken } from '@/lib/utils';
import { hash } from 'bcryptjs';
import { XCircle } from 'lucide-react';
import Image from 'next/image';

import Link from 'next/link';
import { updateUser } from '../../../../../prisma/prisma.user';

export default async function Page({ params }: { params: { token: string } }) {
  const token = params.token;

  const user = await prisma.user.findUnique({
    where: {
      token: token,
    },
  });

  if (!user) {
    return (
      <div className='flex flex-col items-center gap-2 pt-[8%]'>
        <XCircle className='h-6 w-8 text-red-700' />
        <h3 className=' font-semibold text-xl'>There was a problem</h3>
        <p className=' text-muted-foreground text-sm text-center'>
          This token is not valid or might be expired. <br /> Please try again
          to sign up or sign in if your account has already been verified.
        </p>
        <div className='space-x-4 mt-4'>
          <Link className={buttonVariants()} href='/sign-up'>
            Sign up
          </Link>
          <Link className={buttonVariants()} href='/sign-in'>
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const hashedPassword = await hash(user.password, 10);
  const updatedToken = generateRandomToken();

  const updatedUser = updateUser(user.id, {
    token: updatedToken,
    isEmailVerified: true,
    password: hashedPassword,
  });

  // const updateUser = await prisma.user.update({
  //   where: {
  //     id: user.id,
  //   },
  //   data: {
  //     token: updatedToken,
  //     isEmailVerified: true,
  //     password: hashedPassword,
  //   },
  // });

  if (!updatedUser) {
    return (
      <div className='flex flex-col items-center gap-2 pt-[8%]'>
        <XCircle className='h-6 w-8 text-red-700' />
        <h3 className=' font-semibold text-xl'>There was a problem</h3>
        <p className=' text-muted-foreground text-sm text-center'>
          There was a problem updating your account.
          <br /> Please try again to sign up or sign in if your account has
          already been verified.
        </p>
        <Link className={buttonVariants({ className: 'mt-4' })} href='/sign-up'>
          Sign up
        </Link>
        <Link className={buttonVariants({ className: 'mt-4' })} href='/sign-in'>
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className=' flex h-full flex-col items-center justify-center pt-5'>
      <div className='relative mb-6 h-60 w-60 text-muted-foreground'>
        <Image src='/emptyCart.png' fill alt='the email was veryfied' />
      </div>
      <h3 className=' font-semibold text-2xl'>You&apos;re all set!</h3>
      <p className=' text-muted-foreground text-center mt-1'>
        Thank you for verifying your email.
      </p>
      <Link className={buttonVariants({ className: 'mt-4' })} href='/sign-in'>
        Sign in
      </Link>
    </div>
  );
}
