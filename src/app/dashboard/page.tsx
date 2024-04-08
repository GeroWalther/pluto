import Admindashboard from '@/components/dashboard/Admindashboard';
import SellerDashboard from '@/components/dashboard/SellerDashboard';
import UserDashboard from '@/components/dashboard/UserDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authOptions } from '@/lib/auth';
import { serverCaller } from '@/trpc';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/');
  }
  const isAdmin = await serverCaller.auth.approvalDashboard();

  return (
    <Tabs defaultValue='sellerdash' className='w-full'>
      <TabsList className='grid w-full grid-cols-3'>
        <TabsTrigger value='userdash'>Main Dashboard</TabsTrigger>
        <TabsTrigger value='sellerdash'>Seller Dashboard</TabsTrigger>
        <TabsTrigger value='admindash'>Admin Dashboard</TabsTrigger>
      </TabsList>
      <TabsContent value='userdash'>
        <UserDashboard user={session.user} />
      </TabsContent>
      <TabsContent value='sellerdash'>
        <SellerDashboard user={session.user} />
      </TabsContent>
      {isAdmin.role === 'Admin' && (
        <TabsContent value='admindash'>
          <Admindashboard />
        </TabsContent>
      )}
    </Tabs>
  );
}
