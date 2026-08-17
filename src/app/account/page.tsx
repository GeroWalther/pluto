import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { constructMetadata } from '@/lib/utils';
import MaxWidthWrapper from '@/components/shared/MaxWidthWrapper';
import AccountSettings from './AccountSettings';

export const metadata = constructMetadata({
  title: 'Account settings — Pluto Market',
  noIndex: true,
});

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect('/sign-in?callbackUrl=/account');

  return (
    <MaxWidthWrapper className='py-10'>
      <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
        Account settings
      </h1>
      <div className='mt-8 max-w-lg'>
        <AccountSettings />
      </div>
    </MaxWidthWrapper>
  );
}
