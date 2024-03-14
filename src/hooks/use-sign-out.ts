import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { signOut } from 'next-auth/react';

export const useSignOut = () => {
  const router = useRouter();
  async function plutoSignOut() {
    try {
      await signOut();
      toast.success('Signed out successfully');
      router.push('/sign-in');
      router.refresh();
    } catch (err) {
      console.log(err);
      toast.success('Problem signing out.');
    }
  }
  return { plutoSignOut };
};
