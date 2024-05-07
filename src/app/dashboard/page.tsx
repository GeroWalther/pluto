import MainDashboardPage from "@/components/dashboard/MainDashboardPage";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/");
  }

  return <MainDashboardPage user={session.user} />;
}
