'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { z } from 'zod';
import { trpc } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/shared/states';
import { OAuthButtons } from '@/components/layout/OAuthButtons';
import { signUpSchema } from '@/lib/validators';

type Values = z.infer<typeof signUpSchema>;

export default function SignUpForm({
  google,
  github,
}: {
  google: boolean;
  github: boolean;
}) {
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(signUpSchema) });

  const signUp = trpc.account.signUp.useMutation({
    onSuccess: ({ email }) => setSentTo(email),
    onError: (error) => toast.error(error.message),
  });

  const resend = trpc.account.resendVerification.useMutation({
    onSuccess: () => toast.success('Verification email sent again'),
  });

  if (sentTo) {
    return (
      <div className='rounded-xl border border-stone-200 bg-stone-50/70 p-6 text-center'>
        <MailCheck className='mx-auto h-9 w-9 text-indigo-600' />
        <h2 className='mt-4 text-base font-semibold text-stone-900'>Check your inbox</h2>
        <p className='mt-2 text-sm text-muted-foreground'>
          We sent a verification link to <strong className='text-stone-900'>{sentTo}</strong>.
          Confirm your address and you can sign in.
        </p>
        <div className='mt-6 flex flex-col gap-2'>
          <Button asChild size='sm'>
            <Link href='/sign-in'>Go to sign in</Link>
          </Button>
          <Button
            size='sm'
            variant='ghost'
            disabled={resend.isPending}
            onClick={() => resend.mutate({ email: sentTo })}>
            {resend.isPending ? <Spinner className='mr-2' /> : null}
            Resend email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <OAuthButtons google={google} github={github} />

      <form
        onSubmit={handleSubmit((values) => signUp.mutate(values))}
        className='grid gap-4'>
        <div className='grid gap-1.5'>
          <Label htmlFor='name'>Name</Label>
          <Input id='name' autoComplete='name' placeholder='Ada Lovelace' {...register('name')} />
          {errors.name ? (
            <p className='text-xs text-red-600'>{errors.name.message}</p>
          ) : null}
        </div>

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
            autoComplete='new-password'
            {...register('password')}
          />
          {errors.password ? (
            <p className='text-xs text-red-600'>{errors.password.message}</p>
          ) : null}
        </div>

        <div className='grid gap-1.5'>
          <Label htmlFor='confirmPassword'>Confirm password</Label>
          <Input
            id='confirmPassword'
            type='password'
            autoComplete='new-password'
            {...register('confirmPassword')}
          />
          {errors.confirmPassword ? (
            <p className='text-xs text-red-600'>{errors.confirmPassword.message}</p>
          ) : null}
        </div>

        <Button type='submit' disabled={signUp.isPending} className='mt-2'>
          {signUp.isPending ? <Spinner className='mr-2' /> : null}
          Create account
        </Button>
      </form>
    </>
  );
}
