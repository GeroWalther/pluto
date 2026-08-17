'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { trpc } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/shared/states';

export default function VerifyEmail({ token }: { token: string }) {
  const verify = trpc.account.verifyEmail.useMutation();
  const fired = useRef(false);

  // Strict mode mounts effects twice in development; the ref keeps this to a
  // single mutation.
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    verify.mutate({ token });
  }, [token, verify]);

  if (verify.isPending || verify.isIdle) {
    return (
      <div className='flex flex-col items-center gap-3 py-6 text-sm text-muted-foreground'>
        <Spinner className='h-6 w-6' />
        Checking your link…
      </div>
    );
  }

  if (verify.isError) {
    return (
      <div className='rounded-xl border border-red-200 bg-red-50 p-6 text-center'>
        <XCircle className='mx-auto h-9 w-9 text-red-500' />
        <p className='mt-4 text-sm text-red-800'>{verify.error.message}</p>
        <Button asChild variant='outline' size='sm' className='mt-6'>
          <Link href='/sign-up'>Back to sign up</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center'>
      <CheckCircle2 className='mx-auto h-9 w-9 text-emerald-500' />
      <p className='mt-4 text-sm text-emerald-900'>
        {verify.data?.alreadyVerified
          ? 'This address was already verified.'
          : 'Your email is verified. You can sign in now.'}
      </p>
      <Button asChild size='sm' className='mt-6'>
        <Link href='/sign-in'>Sign in</Link>
      </Button>
    </div>
  );
}
