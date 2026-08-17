import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';
import { auth } from '@/lib/auth';
import { constructMetadata } from '@/lib/utils';
import MaxWidthWrapper from '@/components/shared/MaxWidthWrapper';
import AdminDashboard from './AdminDashboard';

export const metadata = constructMetadata({
  title: 'Admin — Pluto Market',
  noIndex: true,
});

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) redirect('/sign-in?callbackUrl=/admin');
  // Server-side gate; the tRPC procedures enforce this again on every call.
  if (session.user.role !== Role.ADMIN) redirect('/');

  return (
    <MaxWidthWrapper className='py-10'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>Admin</h1>
        <p className='mt-1.5 text-sm text-muted-foreground'>
          Moderate listings and keep an eye on platform health.
        </p>
      </div>

      <AdminDashboard />
    </MaxWidthWrapper>
  );
}
