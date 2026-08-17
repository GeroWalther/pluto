import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import MaxWidthWrapper from '@/components/shared/MaxWidthWrapper';
import { DashboardNav } from '@/components/dashboard/DashboardNav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect('/sign-in?callbackUrl=/dashboard');

  return (
    <MaxWidthWrapper className='py-10'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
          Seller dashboard
        </h1>
        <p className='mt-1.5 text-sm text-muted-foreground'>
          Manage your listings, track sales and get paid.
        </p>
      </div>

      <DashboardNav />

      <div className='mt-8'>{children}</div>
    </MaxWidthWrapper>
  );
}
