"use client";
import SellerDashboard from "@/components/dashboard/SellerDashboard";
import UserDashboard from "@/components/dashboard/UserDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "next-auth";
import { useSearchParams } from "next/navigation";
import { FC, useState } from "react";
interface MainDashboardPageProps {
  user: User;
}

const MainDashboardPage: FC<MainDashboardPageProps> = ({ user }) => {
  const searchParams = useSearchParams();
  const board = searchParams.get("board");
  const [activeBoard, setActiveBoard] = useState(board || "sellerdash");
  return (
    <>
      <Tabs defaultValue={activeBoard} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="userdash">Main Dashboard</TabsTrigger>
          <TabsTrigger value="sellerdash">Seller Dashboard</TabsTrigger>
        </TabsList>
        <TabsContent value="userdash">
          <UserDashboard user={user} />
        </TabsContent>
        <TabsContent value="sellerdash">
          <SellerDashboard user={user} />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default MainDashboardPage;
