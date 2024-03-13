"use client";

import { useSession } from "next-auth/react";

const Page = () => {
  const { data: session, update, status } = useSession();

  return (
    <section>
      <h2>Name: {session?.user.name}</h2>
      <h2>Id: {session?.user.id}</h2>
      <h2>Email: {session?.user.email}</h2>
      <h2>Role: {session?.user.role}</h2>
      <h2>Image: {session?.user.image}</h2>
    </section>
  );
};

export default Page;
