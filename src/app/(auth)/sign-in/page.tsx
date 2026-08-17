import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { hasGithubAuth, hasGoogleAuth } from '@/lib/env';
import { constructMetadata } from '@/lib/utils';
import { AuthShell } from '@/components/layout/AuthShell';
import { PageSpinner } from '@/components/shared/states';
import SignInForm from './SignInForm';

export const metadata = constructMetadata({ title: 'Sign in — Pluto Market' });

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect('/');

  return (
    <AuthShell
      title='Welcome back'
      subtitle='Sign in to your Pluto Market account'
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href='/sign-up' className='font-medium text-indigo-600 hover:underline'>
            Sign up
          </Link>
        </>
      }>
      <Suspense fallback={<PageSpinner />}>
        <SignInForm google={hasGoogleAuth()} github={hasGithubAuth()} />
      </Suspense>
    </AuthShell>
  );
}
