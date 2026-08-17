import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { constructMetadata } from '@/lib/utils';
import LibraryView from './LibraryView';

export const metadata = constructMetadata({
  title: 'My library — Pluto Market',
  noIndex: true,
});

export default async function LibraryPage() {
  const session = await auth();
  if (!session?.user) redirect('/sign-in?callbackUrl=/library');

  return <LibraryView />;
}
