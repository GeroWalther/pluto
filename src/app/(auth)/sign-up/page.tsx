import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { hasGithubAuth, hasGoogleAuth } from '@/lib/env';
import { constructMetadata } from '@/lib/utils';
import { AuthShell } from '@/components/layout/AuthShell';
import SignUpForm from './SignUpForm';

export const metadata = constructMetadata({ title: 'Create an account — Pluto Market' });

export default async function SignUpPage() {
  const session = await auth();
  if (session?.user) redirect('/');

  return (
    <AuthShell
      title='Create your account'
      subtitle='Buy digital products, or start selling your own'
      footer={
        <>
          Already have an account?{' '}
          <Link href='/sign-in' className='font-medium text-indigo-600 hover:underline'>
            Sign in
          </Link>
        </>
      }>
      <SignUpForm google={hasGoogleAuth()} github={hasGithubAuth()} />
    </AuthShell>
  );
}
