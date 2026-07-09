import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import SubscribersClient from "./SubscribersClient";

export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  // Only admins can access this page
  if (session.role !== "admin") {
    redirect("/admin");
  }

  const rows = await prisma.subscriber.findMany({
    orderBy: { subscribedAt: "desc" },
  });

  const subscribers = rows.map((s: { id: string; email: string; subscribedAt: Date; active: boolean }) => ({
    id: s.id,
    email: s.email,
    subscribedAt: s.subscribedAt.toISOString(),
    active: s.active,
  }));

  return <SubscribersClient initialSubscribers={subscribers} />;
}
