'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { toast } from 'sonner';
import type { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/shared/states';
import { OAuthButtons } from '@/components/layout/OAuthButtons';
import { signInSchema } from '@/lib/validators';

type Values = z.infer<typeof signInSchema>;

export default function SignInForm({
  google,
  github,
}: {
  google: boolean;
  github: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';

  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(signInSchema) });

  const onSubmit = async (values: Values) => {
    setSubmitting(true);

    // redirect:false so a failed sign-in shows inline instead of bouncing to
    // NextAuth's own error page.
    const result = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    setSubmitting(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success('Signed in');
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <>
      <OAuthButtons google={google} github={github} callbackUrl={callbackUrl} />

      <form onSubmit={handleSubmit(onSubmit)} className='grid gap-4'>
        <div className='grid gap-1.5'>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            type='email'
            autoComplete='email'
            placeholder='you@example.com'
            {...register('email')}
          />
          {errors.email ? (
            <p className='text-xs text-red-600'>{errors.email.message}</p>
          ) : null}
        </div>

        <div className='grid gap-1.5'>
          <Label htmlFor='password'>Password</Label>
          <Input
            id='password'
            type='password'
            autoComplete='current-password'
            {...register('password')}
          />
          {errors.password ? (
            <p className='text-xs text-red-600'>{errors.password.message}</p>
          ) : null}
        </div>

        <Button type='submit' disabled={submitting} className='mt-2'>
          {submitting ? <Spinner className='mr-2' /> : null}
          Sign in
        </Button>
      </form>
    </>
  );
}
