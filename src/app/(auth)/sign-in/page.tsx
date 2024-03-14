'use client';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { PlutoLogo } from '@/components/svgs/Icons';
import { Button, buttonVariants } from '@/components/ui/button';
import GithubButton from '@/components/Btn/GithubButton';
import GoogleButton from '@/components/Btn/GoogleButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AuthCredentialsValidatorSignIn,
  TAuthCredentialsValidatorSignIn,
} from '@/lib/validators/account-credentials-validator';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';

const Page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isSeller = searchParams.get('as') === 'seller';
  const origin = searchParams.get('origin');
  const continueAsSeller = () => {
    router.push('?as=seller');
  };
  const continueAsBuyer = () => {
    router.replace('/sign-in', undefined);
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TAuthCredentialsValidatorSignIn>({
    resolver: zodResolver(AuthCredentialsValidatorSignIn),
  });

  const onSubmit = (data: TAuthCredentialsValidatorSignIn) => {
    signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: true,
      callbackUrl: '/test',
    }).then((res) => {
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success('Signed in successfully!');
      }
    });
  };

  async function githubLogin() {
    await signIn('github', { callbackUrl: '/test' }); //todo change callbackUrl
  }
  async function googleLogin() {
    await signIn('google', { callbackUrl: '/test' }); //todo change callbackUrl
  }

  return (
    <>
      <div className='container relative flex pt-20 flex-col items-center justify-center lg:px-0'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
          <div className='flex flex-col items-center space-y-2 text-center'>
            <PlutoLogo className='h-32 w-32' />
            <h1 className='text-2xl font-bold'>
              Sign in to your {isSeller ? 'seller' : ''} account
            </h1>

            <Link
              className={buttonVariants({
                variant: 'link',
                className: 'text-blue-600',
              })}
              href='/sign-up'>
              Don&apos;t have an account? &rarr;
            </Link>
          </div>

          <div className='grid gap-6 pb-16'>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className='grid gap-2'>
                <div className='grid gap-2 py-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    {...register('email')}
                    className={cn({
                      'focus-visible:ring-red-500': errors.email,
                    })}
                    placeholder='you@example.com'
                  />
                  {errors?.email && (
                    <p className='text-sm text-red-500'>
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className='grid gap-2 py-2'>
                  <Label htmlFor='password'>Password</Label>
                  <Input
                    {...register('password')}
                    type='password'
                    className={cn({
                      'focus-visible:ring-red-500': errors.password,
                    })}
                    placeholder='Password'
                  />
                  {errors?.password && (
                    <p className='text-sm text-red-500'>
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <Button>Sign in</Button>

                <div className=' flex items-center m-2'>
                  <span className='w-full border-t' />
                </div>

                <GoogleButton onClick={googleLogin} />
                <GithubButton onClick={githubLogin} />
              </div>
            </form>

            <div className='relative'>
              <div
                aria-hidden='true'
                className='absolute inset-0 flex items-center'>
                <span className='w-full border-t' />
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                <span className='bg-background px-2 text-muted-foreground  text-bold'>
                  or
                </span>
              </div>
            </div>

            {isSeller ? (
              <Button
                onClick={continueAsBuyer}
                variant='secondary'
                disabled={false}>
                Continue as customer
              </Button>
            ) : (
              <Button
                onClick={continueAsSeller}
                variant='secondary'
                //TODO this is isLoading from trpc tanstack query
                disabled={false}>
                Continue as seller
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
