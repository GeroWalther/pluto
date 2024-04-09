import Admindashboard from '@/components/dashboard/Admindashboard';
import { serverCaller } from '@/trpc';
import React from 'react';
import { redirect } from 'next/navigation';

export default async function page() {
  const isAdmin = await serverCaller.auth.approvalDashboard();
  if (!isAdmin) {
    redirect('/');
  }
  return (
    <>
      <Admindashboard />
    </>
  );
}
