'use client';
import { SessionProvider } from 'next-auth/react';
import { TRPCProvider } from './TRPCProvider';

export default function AllProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TRPCProvider>
      <SessionProvider>{children}</SessionProvider>
    </TRPCProvider>
  );
}
