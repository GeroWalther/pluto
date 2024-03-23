'use client';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { trpc } from '@/trpc/client';

export default function TestTRPC() {
  const [email, setEmail] = useState('');
  const [newUserName, setNewUsername] = useState('');

  const {
    data: fetchedUser,
    refetch: getUserfromEmailagain,
    isSuccess: gotUserfromEmail,
  } = trpc.auth.getUserFromEmail.useQuery(email, {});
  // configurs the query; we don't parameters

  const {
    data: updatedUser,
    isSuccess: gotUpdatedUser,
    mutate,
  } = trpc.auth.updateUserName.useMutation({
    onSuccess: () => {
      getUserfromEmailagain(); // Refetch user data after mutation success
    },
  });

  async function getUsernameByEmail(event: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    getUserfromEmailagain();
  }
  async function changeUserName(event: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    mutate({ email, newUserName });
  }

  return (
    <section className='p-10 mt-5 grid gap-5'>
      <form onSubmit={getUsernameByEmail} className='pb-20'>
        <h3>Get your current username by your email</h3>
        <div className='flex items-center'>
          <label htmlFor='email'>Email</label>
          <input
            className='border border-blue-500 m-4 w-full'
            type='email'
            name='email'
            id='email'
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className='flex items-center'>
          <Button type='submit'>get username</Button>

          {gotUserfromEmail && email !== '' && (
            <div className='flex items-center justify-center'>
              <p className='m-2 ml-10'>current username: </p>
              <p className=' text-blue-600 text-2xl '>{fetchedUser?.name}</p>
            </div>
          )}
        </div>
      </form>

      <form onSubmit={changeUserName}>
        <h3>change your user name</h3>
        <div className='flex items-center'>
          <label htmlFor='username'>new username</label>
          <input
            className='border border-blue-500 m-4 w-full'
            type='text'
            name='username'
            id='user'
            onChange={(e) => setNewUsername(e.target.value)}
          />
        </div>
        <div className='flex items-center'>
          <Button type='submit'>change username</Button>
          {gotUpdatedUser && (
            <div className='flex items-center justify-center'>
              <p className='m-2 ml-10'>new username: </p>
              <p className=' text-blue-600 text-2xl '>{updatedUser?.name}</p>
            </div>
          )}
        </div>
      </form>
    </section>
  );
}
