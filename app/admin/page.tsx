import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/data";
import AnalyticsPanel from "@/components/admin/AnalyticsPanel";
import TopArticlesTable from "@/components/admin/TopArticlesTable";
import DeltaBadge from "@/components/admin/DeltaBadge";

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
  changePct,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
  changePct?: number | null;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/8 bg-[#111827] p-5 transition hover:border-white/15">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[0.68rem] uppercase tracking-widest text-[#4B5563]">
          {label}
        </span>
        {changePct !== undefined && <DeltaBadge pct={changePct} />}
      </div>
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

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  // Article status counts
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

  // --- Period-comparison deltas for the stat cards --------------------------
  // `articles.updated_at` is the only timestamp we have (no created_at /
  // status-history table), so "vs previous period" here means: how many
  // articles in this status were touched (created or edited) in the last 7
  // days vs the 7 days before that. It's a proxy, not a true point-in-time
  // snapshot diff — flagged here since that's a real limitation, not an
  // oversight. A `status_history` table would give an exact answer if this
  // needs to be precise later.
  const deltaRes = await query(`
    WITH bounds AS (
      SELECT
        now() - interval '7 days' AS cur_start,
        now() AS cur_end,
        now() - interval '14 days' AS prev_start,
        now() - interval '7 days' AS prev_end
    )
    SELECT
      status,
      COUNT(*) FILTER (WHERE updated_at::timestamptz >= bounds.cur_start AND updated_at::timestamptz < bounds.cur_end) AS current_count,
      COUNT(*) FILTER (WHERE updated_at::timestamptz >= bounds.prev_start AND updated_at::timestamptz < bounds.prev_end) AS previous_count
    FROM articles, bounds
    GROUP BY status
  `);

  function pctChange(current: number, previous: number): number | null {
    if (previous === 0) return current > 0 ? 100 : null;
    return Math.round(((current - previous) / previous) * 1000) / 10;
  }

  const deltaByStatus = new Map(
    deltaRes.rows.map((r: any) => [
      r.status,
      pctChange(parseInt(r.current_count, 10), parseInt(r.previous_count, 10)),
    ])
  );

  const totalDeltaRow = deltaRes.rows.reduce(
    (acc: { cur: number; prev: number }, r: any) => ({
      cur: acc.cur + parseInt(r.current_count, 10),
      prev: acc.prev + parseInt(r.previous_count, 10),
    }),
    { cur: 0, prev: 0 }
  );
  const totalDelta = pctChange(totalDeltaRow.cur, totalDeltaRow.prev);

  // Real daily views for the current week (Mon–Sun), zero-filled
  const weekRes = await query(`
    SELECT to_char(day, 'Dy') AS label, COALESCE(v.count, 0)::int AS count
    FROM generate_series(
      date_trunc('week', now()),
      date_trunc('week', now()) + interval '6 days',
      interval '1 day'
    ) AS day
    LEFT JOIN (
      SELECT date_trunc('day', viewed_at) AS day, COUNT(*) AS count
      FROM page_views
      GROUP BY 1
    ) v USING (day)
    ORDER BY day
  `);
  const weekViews = weekRes.rows as { label: string; count: number }[];
  const weekTotal = weekViews.reduce((sum, d) => sum + d.count, 0);

  const prevWeekRes = await query(`
    SELECT COUNT(*)::int AS count
    FROM page_views
    WHERE viewed_at >= date_trunc('week', now()) - interval '7 days'
      AND viewed_at < date_trunc('week', now())
  `);
  const prevWeekTotal = prevWeekRes.rows[0]?.count ?? 0;
  const weekDelta = pctChange(weekTotal, prevWeekTotal);

  // Recent articles (Writers see only their own)
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

  const maxWeekly = Math.max(...weekViews.map((d) => d.count), 1);

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
        <StatCard
          label="Published"
          value={stats.published}
          sub="Live on site"
          accent
          changePct={deltaByStatus.get("published") ?? null}
        />
        <StatCard
          label="Drafts"
          value={stats.draft}
          sub="In progress"
          changePct={deltaByStatus.get("draft") ?? null}
        />
        <StatCard
          label="Archived"
          value={stats.archived}
          sub="Hidden from readers"
          changePct={deltaByStatus.get("archived") ?? null}
        />
        <StatCard
          label="Total Stories"
          value={stats.total}
          sub="Across all categories"
          changePct={totalDelta}
        />
      </div>

      {/* Charts row */}
      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Reader engagement — views by category, Recharts, range-selectable */}
        <AnalyticsPanel />

        {/* Weekly breakdown */}
        <div className="rounded-xl border border-white/8 bg-[#111827] p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-white">This Week</h2>
            <p className="mt-0.5 font-mono text-[0.68rem] text-[#4B5563]">Day-by-day views</p>
          </div>
          <div className="flex flex-col gap-2">
            {weekViews.map((d, i) => {
              const pct = Math.round((d.count / maxWeekly) * 100);
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-7 font-mono text-[0.65rem] text-[#4B5563]">{d.label}</span>
                  <div className="flex-1 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-[#B81B14] to-[#E2231A]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono text-[0.65rem] text-[#6B7280]">
                    {d.count >= 1000 ? `${(d.count / 1000).toFixed(1)}k` : d.count}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-end justify-between border-t border-white/8 pt-4">
            <div>
              <div className="font-display text-2xl font-black text-white">
                {weekTotal >= 1000 ? `${(weekTotal / 1000).toFixed(1)}k` : weekTotal}
              </div>
              <div className="mt-0.5 font-mono text-[0.65rem] text-[#4B5563]">total this week</div>
            </div>
            <DeltaBadge pct={weekDelta} label="vs previous week" />
          </div>
        </div>
      </div>

      {/* Top articles */}
      <div className="mb-8">
        <TopArticlesTable range="7d" />
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
