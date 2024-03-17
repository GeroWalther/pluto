import Test from '@/components/Test';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
const Page = async () => {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <div>Auth failed</div>;
  }
  const user = session.user;
  console.log(user);
  return (
    <section>
      <h1>Test</h1>
      <div className='border p-3 m-4'>
        <h2>Server session</h2>
        <p>{JSON.stringify(user)}</p>
      </div>
      <div className='border p-3 m-4'>
        <h2>Client session</h2>
        <Test />
      </div>
    </section>
  );
};

export default Page;
