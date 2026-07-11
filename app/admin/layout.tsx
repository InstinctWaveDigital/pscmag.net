"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: "Articles",
    href: "/admin/articles",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    label: "New Story",
    href: "/admin/editor",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
    adminOnly: false,
  },
  {
    label: "Subscribers",
    href: "/admin/subscribers",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    adminOnly: true,
  },
  {
    label: "Media",
    href: "/admin/media",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    adminOnly: false,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    adminOnly: true,
  },
];

function Clock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          timeZoneName: "short",
        })
      );
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);
  return <span>{time}</span>;
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0D1117] text-white">
      {/* Sidebar */}
      <aside
        className={`flex flex-shrink-0 flex-col border-r border-white/8 bg-[#0B0E1A] transition-all duration-300 ${
          collapsed ? "w-[60px]" : "w-[220px]"
        }`}
      >
        {/* Logo strip */}
        <div className="flex h-14 items-center justify-between border-b border-white/8 px-3">
          {!collapsed && (
            <span className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#E2231A]">
              APSC&nbsp;CMS
            </span>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] hover:bg-white/8 hover:text-white transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              {collapsed ? (
                <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>
              ) : (
                <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>
              )}
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 p-2 pt-3" aria-label="Admin navigation">
          {NAV.map((item, idx) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            const prevItem = NAV[idx - 1];
            const showDivider = item.adminOnly && prevItem && !prevItem.adminOnly;
            return (
              <>
                {showDivider && <div key={`div-${item.href}`} className="my-2 border-t border-white/8" />}
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[#E2231A]/15 text-white"
                      : "text-[#6B7280] hover:bg-white/6 hover:text-white"
                  }`}
                >
                  <span className={`flex-none ${active ? "text-[#E2231A]" : ""}`}>{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#E2231A]" />
                  )}
                </Link>
              </>
            );
          })}

          <div className="my-2 border-t border-white/8" />

          <Link
            href="/"
            target="_blank"
            title={collapsed ? "View Site" : undefined}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#6B7280] transition-colors hover:bg-white/6 hover:text-white"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            {!collapsed && <span>View Site</span>}
          </Link>
        </nav>

        {/* User badge */}
        <div className={`border-t border-white/8 p-3 ${collapsed ? "flex justify-center" : ""}`}>
          {collapsed ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E2231A] font-mono text-xs font-bold text-white">
              ED
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#E2231A] font-mono text-xs font-bold text-white">
                ED
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold text-white">Editorial Desk</div>
                <div className="truncate font-mono text-[0.65rem] text-[#6B7280]">
                  <Clock />
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-14 flex-none items-center justify-between border-b border-white/8 bg-[#0B0E1A]/60 px-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[0.7rem] uppercase tracking-widest text-[#4B5563]">
              Africa Procurement & Supply Chain Mag
            </span>
            <span className="font-mono text-[0.65rem] text-[#374151]">/</span>
            <span className="font-mono text-[0.7rem] uppercase tracking-widest text-[#6B7280]">
              CMS Workspace
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-1 font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-green-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
              Live
            </span>
            <Link
              href="/admin/editor"
              className="flex h-8 items-center gap-2 rounded-lg bg-[#E2231A] px-3.5 text-xs font-semibold text-white transition-all hover:bg-[#B81B14] active:scale-95"
            >
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Story
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
