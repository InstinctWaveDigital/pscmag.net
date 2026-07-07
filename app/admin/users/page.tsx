import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import UsersClient from "./UsersClient";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await getSession();
  
  // Guard route server-side as well
  if (!session || session.role !== "admin") {
    redirect("/admin");
  }

  // Fetch all users
  const res = await query("SELECT id, username, name, role FROM users ORDER BY username ASC");
  const users = res.rows;

  return (
    <div className="p-6 xl:p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">User Management</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Manage workspace access and assign roles (Admins, Editors, Writers).
        </p>
      </div>

      <UsersClient initialUsers={users} currentUserId={session.userId} />
    </div>
  );
}
