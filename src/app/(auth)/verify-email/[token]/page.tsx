import { constructMetadata } from '@/lib/utils';
import { AuthShell } from '@/components/layout/AuthShell';
import VerifyEmail from './VerifyEmail';

export const metadata = constructMetadata({
  title: 'Verify your email — Pluto Market',
  noIndex: true,
});

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <AuthShell title='Verifying your email'>
      <VerifyEmail token={token} />
    </AuthShell>
  );
}
