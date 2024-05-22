"use client";

import SellerDashboard from "@/components/dashboard/SellerDashboard";
import UserDashboard from "@/components/dashboard/UserDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "next-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { FC, useEffect, useState } from "react";

interface MainDashboardPageProps {
  user: User;
}

const MainDashboardPage: FC<MainDashboardPageProps> = ({ user }) => {
  const searchParams = useSearchParams();
  const board = searchParams.get("board") || "sellerdash";
  const tabs = searchParams.get("tabs") || "products";
  const [activeBoard, setActiveBoard] = useState(board);
  const [activeTab, setActiveTab] = useState(tabs);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dashboard?board=${activeBoard}&tabs=${activeTab}`);
  }, [activeBoard, activeTab]);

  return (
    <>
      <Tabs
        defaultValue={board}
        className="w-full"
        onValueChange={(value) => {
          setActiveBoard(value);
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="userdash">Main Dashboard</TabsTrigger>
          <TabsTrigger value="sellerdash">Seller Dashboard</TabsTrigger>
        </TabsList>
        <TabsContent value="userdash">
          <UserDashboard user={user} />
        </TabsContent>
        <TabsContent value="sellerdash">
          <SellerDashboard
            user={user}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default MainDashboardPage;
