import TestTRPC from '@/components/test/TestTRPC';

const Page = async () => {
  return <TestTRPC />;
};

export default Page;

// import { serverCaller } from '@/trpc';

// const Page = async () => {
//   const data = await serverCaller.getUserFromEmail('gero.walther@gmail.com');
//   const changedName = await serverCaller.updateUserName({
//     email: 'gero.walther@gmail.com',
//     newUserName: 'gero used trpc! ',
//   });
//   if (data) {
//     return (
//       <section>
//         <div>
//           <p>Old name in DB: </p>
//           <h2>{data.name}</h2>
//         </div>
//         <div>
//           <p>updated name in DB: </p>
//           <h2>{changedName.name}</h2>
//         </div>
//       </section>
//     );
//   }
// };

// export default Page;

// import TestNextAuth from '@/components/Test/TestNextAuth';
// import { authOptions } from '@/lib/auth';
// import { getServerSession } from 'next-auth/next';
// const Page = async () => {
//   const session = await getServerSession(authOptions);
//   if (!session) {
//     return <div>Auth failed</div>;
//   }
//   const user = session.user;
//   console.log(user);
//   return (
//     <section>
//       <h1>Test</h1>
//       <div className='border p-3 m-4'>
//         <h2>Server session</h2>
//         <p>{JSON.stringify(user)}</p>
//       </div>
//       <div className='border p-3 m-4'>
//         <h2>Client session</h2>
//         <TestNextAuth />
//       </div>
//     </section>
//   );
// };

// export default Page;
