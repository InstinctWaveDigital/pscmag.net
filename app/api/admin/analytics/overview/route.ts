import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { parseRange, rangeToDates } from "@/lib/analytics-range";

// Explicit time-based revalidation rather than force-dynamic: analytics
// reads are allowed to be up to 5 minutes stale (per spec). Reading the
// session cookie in getSession() already makes this route dynamic
// per-request, so there's no risk of the Full Route Cache serving another
// admin's stale response — revalidate just caps how often the underlying
// DB queries actually re-run.
export const revalidate = 300;

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const range = parseRange(req.nextUrl.searchParams.get("range"));
  const { start, end, prevStart, prevEnd } = rangeToDates(range);
  const bucket = range === "12mo" ? "month" : "day";

  const totalRes = await query(
    `SELECT COUNT(*)::int AS count FROM page_views WHERE viewed_at >= $1 AND viewed_at < $2`,
    [start, end]
  );
  const prevTotalRes = await query(
    `SELECT COUNT(*)::int AS count FROM page_views WHERE viewed_at >= $1 AND viewed_at < $2`,
    [prevStart, prevEnd]
  );
  const uniqueRes = await query(
    `SELECT COUNT(DISTINCT session_id)::int AS count FROM page_views WHERE viewed_at >= $1 AND viewed_at < $2`,
    [start, end]
  );

  const seriesRes = await query(
    `
    SELECT
      to_char(bucket, ${bucket === "month" ? `'Mon YYYY'` : `'Mon DD'`}) AS label,
      COALESCE(v.count, 0)::int AS count
    FROM generate_series(
      date_trunc('${bucket}', $1::timestamptz),
      date_trunc('${bucket}', $2::timestamptz),
      interval '1 ${bucket}'
    ) AS bucket
    LEFT JOIN (
      SELECT date_trunc('${bucket}', viewed_at) AS bucket, COUNT(*) AS count
      FROM page_views
      WHERE viewed_at >= $1 AND viewed_at < $2
      GROUP BY 1
    ) v USING (bucket)
    ORDER BY bucket
    `,
    [start, end]
  );

  const total = totalRes.rows[0]?.count ?? 0;
  const prevTotal = prevTotalRes.rows[0]?.count ?? 0;
  const changePct = prevTotal === 0 ? null : Math.round(((total - prevTotal) / prevTotal) * 1000) / 10;

  return NextResponse.json({
    range,
    totalViews: total,
    uniqueSessions: uniqueRes.rows[0]?.count ?? 0,
    previousPeriodViews: prevTotal,
    changePct,
    series: seriesRes.rows as { label: string; count: number }[],
  });
}
