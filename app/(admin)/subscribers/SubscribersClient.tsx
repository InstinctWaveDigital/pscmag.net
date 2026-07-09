"use client";

import { useState, useTransition } from "react";
import {
  removeSubscriberAction,
  toggleSubscriberActiveAction,
} from "../actions";

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  active: boolean;
}

interface Props {
  initialSubscribers: Subscriber[];
}

const EMAIL_DOMAINS = (emails: Subscriber[]) => {
  const map: Record<string, number> = {};
  emails.forEach((s) => {
    const d = s.email.split("@")[1] || "unknown";
    map[d] = (map[d] || 0) + 1;
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
};

export default function SubscribersClient({ initialSubscribers }: Props) {
  const [subscribers, setSubscribers] =
    useState<Subscriber[]>(initialSubscribers);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [removing, setRemoving] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(
    null
  );

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  const filtered = subscribers.filter((s) => {
    const matchSearch = s.email
      .toLowerCase()
      .includes(search.toLowerCase().trim());
    const matchFilter =
      filter === "all"
        ? true
        : filter === "active"
        ? s.active
        : !s.active;
    return matchSearch && matchFilter;
  });

  const activeCount = subscribers.filter((s) => s.active).length;
  const inactiveCount = subscribers.length - activeCount;
  const topDomains = EMAIL_DOMAINS(subscribers);

  function handleToggle(sub: Subscriber) {
    setToggling(sub.id);
    startTransition(async () => {
      const res = await toggleSubscriberActiveAction(sub.id, !sub.active);
      if (res.success) {
        setSubscribers((prev) =>
          prev.map((s) => (s.id === sub.id ? { ...s, active: !s.active } : s))
        );
        showToast(
          sub.active
            ? `${sub.email} marked as unsubscribed.`
            : `${sub.email} reactivated.`
        );
      } else {
        showToast(res.error || "Failed to update subscriber.", false);
      }
      setToggling(null);
    });
  }

  function handleRemove(sub: Subscriber) {
    if (
      !confirm(
        `Permanently delete ${sub.email}? This cannot be undone.`
      )
    )
      return;
    setRemoving(sub.id);
    startTransition(async () => {
      const res = await removeSubscriberAction(sub.id);
      if (res.success) {
        setSubscribers((prev) => prev.filter((s) => s.id !== sub.id));
        showToast(`${sub.email} permanently removed.`);
      } else {
        showToast(res.error || "Failed to remove subscriber.", false);
      }
      setRemoving(null);
    });
  }

  function exportCSV() {
    const header = "email,status,subscribed_at";
    const rows = filtered
      .map(
        (s) =>
          `${s.email},${s.active ? "active" : "unsubscribed"},${s.subscribedAt}`
      )
      .join("\n");
    const blob = new Blob([header + "\n" + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 xl:p-8">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-2xl backdrop-blur transition-all ${
            toast.ok
              ? "border-green-500/30 bg-green-500/10 text-green-400"
              : "border-red-500/30 bg-[#E2231A]/10 text-red-400"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              toast.ok ? "bg-green-400" : "bg-red-400"
            }`}
          />
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Newsletter Subscribers
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Manage who receives the APSC Mag newsletter.
          </p>
        </div>
        <button
          id="btn-export-csv"
          onClick={exportCSV}
          className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 text-xs font-semibold text-[#9CA3AF] transition hover:bg-white/10 hover:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Total",
            value: subscribers.length,
            sub: "All time subscribers",
            accent: false,
          },
          {
            label: "Active",
            value: activeCount,
            sub: "Receiving newsletter",
            accent: true,
          },
          {
            label: "Unsubscribed",
            value: inactiveCount,
            sub: "Opted out",
            accent: false,
          },
          {
            label: "Open Rate",
            value: "—",
            sub: "Connect email provider",
            accent: false,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="flex flex-col gap-2 rounded-xl border border-white/8 bg-[#111827] p-5 transition hover:border-white/15"
          >
            <span className="font-mono text-[0.68rem] uppercase tracking-widest text-[#4B5563]">
              {card.label}
            </span>
            <span
              className={`font-display text-4xl font-black leading-none ${
                card.accent ? "text-[#E2231A]" : "text-white"
              }`}
            >
              {card.value}
            </span>
            {card.sub && (
              <span className="text-xs text-[#4B5563]">{card.sub}</span>
            )}
          </div>
        ))}
      </div>

      {/* Top domains chart */}
      {topDomains.length > 0 && (
        <div className="mb-8 rounded-xl border border-white/8 bg-[#111827] p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">
            Top Subscriber Domains
          </h2>
          <div className="flex flex-col gap-2.5">
            {topDomains.map(([domain, count]) => {
              const pct = Math.round((count / subscribers.length) * 100);
              return (
                <div key={domain} className="flex items-center gap-3">
                  <span className="w-36 truncate font-mono text-[0.68rem] text-[#9CA3AF]">
                    @{domain}
                  </span>
                  <div className="flex-1 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-[#B81B14] to-[#E2231A] transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-[0.65rem] text-[#6B7280]">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters & search */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="subscribers-search"
            type="search"
            placeholder="Search by email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-white/8 bg-[#111827] pl-9 pr-4 font-mono text-sm text-white placeholder-[#374151] outline-none focus:border-[#E2231A]/50 focus:ring-1 focus:ring-[#E2231A]/20"
          />
        </div>
        {(["all", "active", "inactive"] as const).map((f) => (
          <button
            key={f}
            id={`filter-${f}`}
            onClick={() => setFilter(f)}
            className={`h-9 rounded-lg px-4 font-mono text-xs font-semibold capitalize transition ${
              filter === f
                ? "bg-[#E2231A]/15 text-white"
                : "border border-white/8 text-[#6B7280] hover:border-white/20 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto font-mono text-[0.68rem] text-[#4B5563]">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/8 bg-[#111827] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <svg
              viewBox="0 0 24 24"
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="text-[#374151]"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p className="text-sm text-[#6B7280]">No subscribers found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="px-5 py-3 text-left font-mono text-[0.65rem] uppercase tracking-widest text-[#4B5563]">
                  Email
                </th>
                <th className="hidden px-5 py-3 text-left font-mono text-[0.65rem] uppercase tracking-widest text-[#4B5563] sm:table-cell">
                  Subscribed
                </th>
                <th className="px-5 py-3 text-left font-mono text-[0.65rem] uppercase tracking-widest text-[#4B5563]">
                  Status
                </th>
                <th className="px-5 py-3 text-right font-mono text-[0.65rem] uppercase tracking-widest text-[#4B5563]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {filtered.map((sub) => (
                <tr
                  key={sub.id}
                  className={`transition hover:bg-white/3 ${
                    !sub.active ? "opacity-50" : ""
                  }`}
                >
                  <td className="px-5 py-3.5 font-mono text-xs text-white">
                    {sub.email}
                  </td>
                  <td className="hidden px-5 py-3.5 font-mono text-[0.65rem] text-[#6B7280] sm:table-cell">
                    {new Date(sub.subscribedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[0.62rem] font-semibold uppercase tracking-wider ${
                        sub.active
                          ? "border-green-500/20 bg-green-500/10 text-green-400"
                          : "border-white/8 bg-[#374151]/40 text-[#6B7280]"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          sub.active ? "bg-green-400" : "bg-[#6B7280]"
                        }`}
                      />
                      {sub.active ? "Active" : "Unsubscribed"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {/* Toggle active/inactive */}
                      <button
                        id={`btn-toggle-${sub.id}`}
                        onClick={() => handleToggle(sub)}
                        disabled={toggling === sub.id || isPending}
                        title={sub.active ? "Mark as unsubscribed" : "Reactivate"}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-white/8 text-[#6B7280] transition hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-400 disabled:opacity-40"
                      >
                        {toggling === sub.id ? (
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : sub.active ? (
                          // Unsubscribe icon
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        ) : (
                          // Reactivate icon
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>

                      {/* Permanent delete */}
                      <button
                        id={`btn-delete-${sub.id}`}
                        onClick={() => handleRemove(sub)}
                        disabled={removing === sub.id || isPending}
                        title="Permanently delete"
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-white/8 text-[#6B7280] transition hover:border-red-500/30 hover:bg-[#E2231A]/10 hover:text-red-400 disabled:opacity-40"
                      >
                        {removing === sub.id ? (
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4h6v2" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
