import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/data";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  published: "bg-green-500/10 text-green-400 border-green-500/20",
  draft: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  archived: "bg-[#374151]/40 text-[#6B7280] border-white/8",
};

function StatCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/8 bg-[#111827] p-5 transition hover:border-white/15">
      <span className="font-mono text-[0.68rem] uppercase tracking-widest text-[#4B5563]">
        {label}
      </span>
      <span
        className={`font-display text-4xl font-black leading-none ${
          accent ? "text-[#E2231A]" : "text-white"
        }`}
      >
        {value}
      </span>
      {sub && <span className="text-xs text-[#4B5563]">{sub}</span>}
    </div>
  );
}

const WEEKLY_VIEWS = [38, 52, 47, 61, 55, 79, 84, 72, 91, 88, 105, 120];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEK_VALS = [4800, 6200, 5100, 7400, 8800, 3200, 2100];

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  // Fetch count stats from PostgreSQL
  const pubRes = await query("SELECT COUNT(*) FROM articles WHERE status = 'published'");
  const draftRes = await query("SELECT COUNT(*) FROM articles WHERE status = 'draft'");
  const archRes = await query("SELECT COUNT(*) FROM articles WHERE status = 'archived'");
  const totalRes = await query("SELECT COUNT(*) FROM articles");

  const stats = {
    published: parseInt(pubRes.rows[0].count, 10),
    draft: parseInt(draftRes.rows[0].count, 10),
    archived: parseInt(archRes.rows[0].count, 10),
    total: parseInt(totalRes.rows[0].count, 10),
  };

  // Fetch recent articles (optionally filter by author for Writers)
  let recentRes;
  if (session.role === "writer") {
    recentRes = await query(
      "SELECT id, title, author, category, status, updated_at FROM articles WHERE author = $1 ORDER BY updated_at DESC LIMIT 6",
      [session.name]
    );
  } else {
    recentRes = await query(
      "SELECT id, title, author, category, status, updated_at FROM articles ORDER BY updated_at DESC LIMIT 6"
    );
  }
  const recent = recentRes.rows;

  return (
    <div className="p-6 xl:p-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Editorial workspace for Africa Procurement and Supply Chain Mag &middot; Welcome back, {session.name} ({session.role}).
        </p>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Published" value={stats.published} sub="Live on site" accent />
        <StatCard label="Drafts" value={stats.draft} sub="In progress" />
        <StatCard label="Archived" value={stats.archived} sub="Hidden from readers" />
        <StatCard label="Total Stories" value={stats.total} sub="Across all categories" />
      </div>

      {/* Charts row */}
      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Reader engagement chart */}
        <div className="col-span-2 rounded-xl border border-white/8 bg-[#111827] p-5">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Reader Engagement</h2>
              <p className="mt-0.5 font-mono text-[0.68rem] text-[#4B5563]">
                Monthly page views · simulated
              </p>
            </div>
            <span className="rounded-full border border-white/8 px-2.5 py-1 font-mono text-[0.65rem] text-[#6B7280]">
              Last 12 months
            </span>
          </div>
          <div className="flex h-28 items-end gap-1.5">
            {WEEKLY_VIEWS.map((v, i) => {
              const max = Math.max(...WEEKLY_VIEWS);
              return (
                <div key={i} className="group relative flex flex-1 flex-col items-center gap-1">
                  <div
                    style={{ height: `${Math.round((v / max) * 100)}%` }}
                    className="w-full rounded-sm bg-gradient-to-t from-[#E2231A]/60 to-[#E2231A] transition-all group-hover:from-[#E2231A]/80 group-hover:to-[#ff4d4d]"
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between font-mono text-[0.6rem] text-[#374151]">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span>
            <span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span>
            <span>Nov</span><span>Dec</span>
          </div>
        </div>

        {/* Weekly breakdown */}
        <div className="rounded-xl border border-white/8 bg-[#111827] p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-white">This Week</h2>
            <p className="mt-0.5 font-mono text-[0.68rem] text-[#4B5563]">Day-by-day views</p>
          </div>
          <div className="flex flex-col gap-2">
            {DAYS.map((day, i) => {
              const max = Math.max(...WEEK_VALS);
              const pct = Math.round((WEEK_VALS[i] / max) * 100);
              return (
                <div key={day} className="flex items-center gap-3">
                  <span className="w-7 font-mono text-[0.65rem] text-[#4B5563]">{day}</span>
                  <div className="flex-1 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-[#B81B14] to-[#E2231A]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono text-[0.65rem] text-[#6B7280]">
                    {(WEEK_VALS[i] / 1000).toFixed(1)}k
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 border-t border-white/8 pt-4">
            <div className="font-display text-2xl font-black text-white">
              {(WEEK_VALS.reduce((a, b) => a + b, 0) / 1000).toFixed(0)}k
            </div>
            <div className="mt-0.5 font-mono text-[0.65rem] text-[#4B5563]">total this week</div>
          </div>
        </div>
      </div>

      {/* Recent articles */}
      <div className="rounded-xl border border-white/8 bg-[#111827]">
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <h2 className="text-sm font-semibold text-white">
            {session.role === "writer" ? "My Recent Stories" : "Recent Stories"}
          </h2>
          <Link
            href="/admin/articles"
            className="font-mono text-[0.7rem] text-[#E2231A] hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="divide-y divide-white/6">
          {recent.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-white/3"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-white">{a.title}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 font-mono text-[0.65rem] text-[#4B5563]">
                  <span>{a.author}</span>
                  <span>·</span>
                  <span>{a.category}</span>
                  <span>·</span>
                  <span>{formatDate(a.updated_at)}</span>
                </div>
              </div>
              <span
                className={`hidden flex-none rounded-full border px-2.5 py-0.5 font-mono text-[0.62rem] font-semibold uppercase tracking-wider sm:inline-flex ${
                  STATUS_STYLE[a.status] || "bg-[#374151] text-[#6B7280]"
                }`}
              >
                {a.status}
              </span>
              <Link
                href={`/admin/editor?id=${a.id}`}
                className="flex-none rounded-lg border border-white/8 px-2.5 py-1.5 font-mono text-[0.65rem] text-[#6B7280] transition hover:border-white/20 hover:text-white"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
