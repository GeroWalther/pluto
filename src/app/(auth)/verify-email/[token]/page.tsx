import prisma from "@/db/db";
export default async function Page({ params }: { params: { token: string } }) {
  // TODO: Add email verification logic
  const token = params.token;
  const user = await prisma.user.findUnique({
    where: {
      token: token,
    },
  });

  if (!user) {
    return <div>Invalid token</div>;
  }
  return <div>My Post: {token}</div>;
}
