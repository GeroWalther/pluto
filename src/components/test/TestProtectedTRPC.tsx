'use client';

import { trpc } from '@/trpc/client';
import { useRouter } from 'next/navigation';

import { toast } from 'sonner';

export default function TestProtectedTRPC() {
  const r = useRouter();
  const { data, error } = trpc.auth.isAuthorized.useQuery();
  const { data: ad, error: err } = trpc.auth.approvalDashboard.useQuery();
  if (err || error) {
    toast.error(err?.message);
    r.back();
  }
  return (
    <div>
      <h2>TestProtectedTRPC</h2>
      {error && <div>Error: {error.message}</div>}

      {data && (
        <div>
          <p>User: {data.user.email}</p>
          <p>greeting: {data.greeting}</p>
        </div>
      )}
      {err && <div>Error: {err.message}</div>}
      {ad && (
        <div>
          <p>User Role: {ad.role}</p>
          <p>id: {ad.userId}</p>
        </div>
      )}
    </div>
  );
}
