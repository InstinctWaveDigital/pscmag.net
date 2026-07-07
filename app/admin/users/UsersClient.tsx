"use client";

import { useState } from "react";
import { createUserAction, deleteUserAction, resetPasswordAction } from "../actions";

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

export default function UsersClient({
  initialUsers,
  currentUserId,
}: {
  initialUsers: User[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", name: "", password: "", role: "writer" as any });

  // Password reset state
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  function displayMessage(type: "error" | "success", msg: string) {
    if (type === "error") {
      setError(msg);
      setSuccess(null);
    } else {
      setSuccess(msg);
      setError(null);
    }
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 4000);
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createUserAction(newUser);
      if (res.success) {
        // Optimistic update (simple reload simulation or local append)
        displayMessage("success", `User "${newUser.username}" created successfully.`);
        // For local state updates, we generate a mock ID and push
        setUsers([
          ...users,
          { id: Math.random().toString(), username: newUser.username, name: newUser.name, role: newUser.role },
        ]);
        setNewUser({ username: "", name: "", password: "", role: "writer" });
        setShowAddForm(false);
      } else {
        displayMessage("error", res.error || "Failed to create user.");
      }
    } catch {
      displayMessage("error", "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser(id: string, username: string) {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return;
    try {
      const res = await deleteUserAction(id);
      if (res.success) {
        displayMessage("success", `User "${username}" deleted.`);
        setUsers(users.filter((u) => u.id !== id));
      } else {
        displayMessage("error", res.error || "Failed to delete user.");
      }
    } catch {
      displayMessage("error", "An unexpected error occurred.");
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resettingUserId) return;
    setLoading(true);
    try {
      const res = await resetPasswordAction(resettingUserId, newPassword);
      if (res.success) {
        displayMessage("success", "Password reset successfully.");
        setNewPassword("");
        setResettingUserId(null);
      } else {
        displayMessage("error", res.error || "Failed to reset password.");
      }
    } catch {
      displayMessage("error", "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Users List Table */}
      <div className="flex-1 rounded-xl border border-white/8 bg-[#111827] overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <h2 className="text-sm font-semibold text-white">Active Accounts</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-[#E2231A] px-3 font-mono text-[0.7rem] font-semibold text-white transition hover:bg-[#B81B14] active:scale-95"
          >
            {showAddForm ? "Close Form" : "Add Account"}
          </button>
        </div>

        {error && (
          <div className="mx-5 my-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400 font-mono">
            {error}
          </div>
        )}
        {success && (
          <div className="mx-5 my-4 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-xs text-green-400 font-mono">
            {success}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-white/8">
                <th className="px-5 py-3 text-left font-mono text-[0.67rem] uppercase tracking-wider text-[#4B5563]">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-mono text-[0.67rem] uppercase tracking-wider text-[#4B5563]">
                  Username
                </th>
                <th className="px-4 py-3 text-left font-mono text-[0.67rem] uppercase tracking-wider text-[#4B5563]">
                  Role
                </th>
                <th className="px-4 py-3 text-right font-mono text-[0.67rem] uppercase tracking-wider text-[#4B5563]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u.id} className="transition hover:bg-white/3">
                  <td className="px-5 py-3.5 text-sm font-medium text-white">
                    {u.name}
                    {u.id === currentUserId && (
                      <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 font-mono text-[0.58rem] text-[#6B7280]">
                        You
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-sm text-[#6B7280]">
                    @{u.username}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 font-mono text-[0.58rem] font-semibold uppercase tracking-wider ${
                        u.role === "admin"
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : u.role === "editor"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-green-500/10 text-green-400 border-green-500/20"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setResettingUserId(u.id)}
                        className="rounded border border-white/8 px-2 py-1 font-mono text-[0.65rem] text-[#6B7280] transition hover:border-white/20 hover:text-white"
                      >
                        Reset PW
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id, u.username)}
                        disabled={u.id === currentUserId}
                        className="rounded border border-white/8 px-2 py-1 font-mono text-[0.65rem] text-[#6B7280] transition hover:border-red-500/30 hover:text-red-400 disabled:opacity-30"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Forms Block */}
      <div className="w-full lg:w-[350px] flex flex-col gap-6">
        {/* Create Form */}
        {showAddForm && (
          <div className="rounded-xl border border-white/8 bg-[#111827] p-5">
            <h2 className="mb-4 font-mono text-[0.68rem] uppercase tracking-wider text-[#4B5563]">
              Add New User
            </h2>
            <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <span className="mb-1 font-mono text-[0.6rem] uppercase tracking-wider text-[#6B7280]">
                  Full Name
                </span>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Ngozi Adeyemi"
                  className="h-9 rounded-lg border border-white/8 bg-[#0D1117] px-3 text-xs text-white focus:border-white/20 focus:outline-none"
                />
              </div>

              <div className="flex flex-col">
                <span className="mb-1 font-mono text-[0.6rem] uppercase tracking-wider text-[#6B7280]">
                  Username
                </span>
                <input
                  type="text"
                  required
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value.toLowerCase().replace(/\s+/g, "") })}
                  placeholder="adeyemi"
                  className="h-9 rounded-lg border border-white/8 bg-[#0D1117] px-3 text-xs text-white focus:border-white/20 focus:outline-none"
                />
              </div>

              <div className="flex flex-col">
                <span className="mb-1 font-mono text-[0.6rem] uppercase tracking-wider text-[#6B7280]">
                  Role
                </span>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                  className="h-9 rounded-lg border border-white/8 bg-[#0D1117] px-3 text-xs text-white focus:border-white/20 focus:outline-none"
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="writer">Writer</option>
                </select>
              </div>

              <div className="flex flex-col">
                <span className="mb-1 font-mono text-[0.6rem] uppercase tracking-wider text-[#6B7280]">
                  Initial Password
                </span>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="••••••••"
                  className="h-9 rounded-lg border border-white/8 bg-[#0D1117] px-3 text-xs text-white focus:border-white/20 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex h-9 items-center justify-center rounded-lg bg-[#E2231A] font-mono text-xs font-semibold text-white transition hover:bg-[#B81B14] disabled:opacity-50"
              >
                Create Account
              </button>
            </form>
          </div>
        )}

        {/* Reset Password Form */}
        {resettingUserId && (
          <div className="rounded-xl border border-white/8 bg-[#111827] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-mono text-[0.68rem] uppercase tracking-wider text-[#4B5563]">
                Reset Password
              </h2>
              <button
                onClick={() => setResettingUserId(null)}
                className="text-xs text-[#6B7280] hover:text-white"
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <span className="mb-1 font-mono text-[0.6rem] uppercase tracking-wider text-[#6B7280]">
                  New Password
                </span>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-9 rounded-lg border border-white/8 bg-[#0D1117] px-3 text-xs text-white focus:border-white/20 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-9 items-center justify-center rounded-lg bg-[#E2231A] font-mono text-xs font-semibold text-white transition hover:bg-[#B81B14] disabled:opacity-50"
              >
                Save Password
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
