import Admindashboard from "@/components/dashboard/Admindashboard";
import { authOptions } from "@/lib/auth";
import { serverCaller } from "@/trpc";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function page() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.role) {
    return redirect("/");
  }
  return <Admindashboard />;
}
