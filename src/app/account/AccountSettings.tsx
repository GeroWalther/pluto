'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { trpc } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/shared/states';
import { formatDate } from '@/lib/utils';

export default function AccountSettings() {
  const { update: updateSession } = useSession();
  const { data: me, isLoading } = trpc.account.me.useQuery();
  const utils = trpc.useUtils();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (!me) return;
    setName(me.name ?? '');
    setBio(me.bio ?? '');
  }, [me]);

  const save = trpc.account.updateProfile.useMutation({
    onSuccess: async () => {
      toast.success('Profile updated');
      utils.account.me.invalidate();
      // Refresh the JWT so the navbar shows the new name immediately.
      await updateSession();
    },
    onError: (error) => toast.error(error.message),
  });

  if (isLoading || !me) return <Skeleton className='h-72 w-full rounded-xl' />;

  return (
    <div className='space-y-8'>
      <div className='space-y-5 rounded-xl border border-stone-200 p-6'>
        <div className='grid gap-1.5'>
          <Label htmlFor='name'>Display name</Label>
          <Input
            id='name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
          />
        </div>

        <div className='grid gap-1.5'>
          <Label htmlFor='bio'>Seller bio</Label>
          <Textarea
            id='bio'
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={280}
            placeholder='Tell buyers what you make.'
            className='min-h-[90px]'
          />
          <p className='text-xs text-muted-foreground'>
            {bio.length} / 280 · shown on your public seller page
          </p>
        </div>

        <Button
          disabled={save.isPending || name.trim().length < 2}
          onClick={() => save.mutate({ name: name.trim(), bio: bio.trim() })}>
          {save.isPending ? <Spinner className='mr-2' /> : null}
          Save changes
        </Button>
      </div>

      <div className='space-y-3 rounded-xl border border-stone-200 p-6'>
        <h2 className='text-sm font-semibold text-stone-900'>Account</h2>
        <dl className='space-y-2 text-sm'>
          <div className='flex justify-between'>
            <dt className='text-muted-foreground'>Email</dt>
            <dd className='font-medium'>{me.email}</dd>
          </div>
          <div className='flex justify-between'>
            <dt className='text-muted-foreground'>Member since</dt>
            <dd className='font-medium'>{formatDate(me.createdAt)}</dd>
          </div>
          <div className='flex justify-between'>
            <dt className='text-muted-foreground'>Payouts</dt>
            <dd className='font-medium'>
              {me.stripePayoutsEnabled ? (
                <span className='text-emerald-600'>Active</span>
              ) : (
                <Link href='/dashboard/payouts' className='text-indigo-600 hover:underline'>
                  Set up
                </Link>
              )}
            </dd>
          </div>
        </dl>

        <div className='flex gap-2 pt-2'>
          <Button asChild variant='outline' size='sm'>
            <Link href='/library'>My library</Link>
          </Button>
          <Button asChild variant='outline' size='sm'>
            <Link href={`/sellers/${me.id}`}>View public profile</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
