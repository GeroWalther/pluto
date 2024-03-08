import VerifyEmail from '@/components/comp/VerifyEmail';
import prisma from '@/db/db';

export default async function Page({ params }: { params: { token: string } }) {
  const token = params.token;

  const user = await prisma.user.findUnique({
    where: {
      token: token,
    },
  });

  return <VerifyEmail user={user} />;
}
