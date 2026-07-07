"use client";

import { useState } from "react";
import { loginAction } from "../actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await loginAction(null, formData);
      if (res && !res.success) {
        setError(res.error || "Login failed");
        setLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0D1117] text-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/8 bg-[#0B0E1A] p-8 shadow-xl">
        <div className="mb-8 text-center">
          <span className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#E2231A]">
            APSC Mag &middot; Sourcing Desk
          </span>
          <h1 className="mt-2 text-2xl font-bold font-display text-white">
            Workspace Access
          </h1>
          <p className="mt-1 text-sm text-[#4B5563]">
            Login to publish stories, edit sections, or manage media.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-400 font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label
              htmlFor="username"
              className="mb-1.5 font-mono text-[0.68rem] uppercase tracking-wider text-[#6B7280]"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              required
              className="h-10 rounded-lg border border-white/8 bg-[#0D1117] px-3 text-sm text-white placeholder-[#374151] focus:border-white/20 focus:outline-none transition"
              placeholder="e.g. adeyemi"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="password"
              className="mb-1.5 font-mono text-[0.68rem] uppercase tracking-wider text-[#6B7280]"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="h-10 rounded-lg border border-white/8 bg-[#0D1117] px-3 text-sm text-white placeholder-[#374151] focus:border-white/20 focus:outline-none transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-10 items-center justify-center rounded-lg bg-[#E2231A] font-mono text-sm font-semibold text-white transition hover:bg-[#B81B14] active:scale-95 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Enter Workspace →"}
          </button>
        </form>

        <div className="mt-6 border-t border-white/8 pt-6 text-center">
          <p className="text-[0.68rem] font-mono text-[#374151] leading-relaxed">
            Default credentials for development:<br />
            <span className="text-[#4B5563]">admin / admin123</span> &middot;{" "}
            <span className="text-[#4B5563]">editor / editor123</span> &middot;{" "}
            <span className="text-[#4B5563]">writer / writer123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
