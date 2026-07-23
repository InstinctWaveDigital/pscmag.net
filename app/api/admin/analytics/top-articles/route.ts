import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { parseRange, rangeToDates } from "@/lib/analytics-range";

export const revalidate = 300;

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const range = parseRange(req.nextUrl.searchParams.get("range"));
  const limitParam = parseInt(req.nextUrl.searchParams.get("limit") || "10", 10);
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 50) : 10;

  const { start, end, prevStart, prevEnd } = rangeToDates(range);

  const res = await query(
    `
    WITH current_period AS (
      SELECT article_id, COUNT(*)::int AS views
      FROM page_views
      WHERE viewed_at >= $1 AND viewed_at < $2
      GROUP BY article_id
    ),
    previous_period AS (
      SELECT article_id, COUNT(*)::int AS views
      FROM page_views
      WHERE viewed_at >= $3 AND viewed_at < $4
      GROUP BY article_id
    )
    SELECT
      a.id,
      a.title,
      a.category,
      a.status,
      a.updated_at,
      cp.views AS views,
      COALESCE(pp.views, 0) AS previous_views
    FROM current_period cp
    JOIN articles a ON a.id = cp.article_id
    LEFT JOIN previous_period pp ON pp.article_id = cp.article_id
    ORDER BY cp.views DESC
    LIMIT $5
    `,
    [start, end, prevStart, prevEnd, limit]
  );

  const articles = res.rows.map((r: any) => {
    const changePct =
      r.previous_views === 0
        ? null // no prior-period baseline — show as "new" in the UI rather than a misleading number
        : Math.round(((r.views - r.previous_views) / r.previous_views) * 1000) / 10;

    return {
      id: r.id,
      title: r.title,
      category: r.category,
      status: r.status,
      updatedAt: r.updated_at,
      views: r.views,
      previousViews: r.previous_views,
      changePct,
    };
  });

  return NextResponse.json({ range, limit, articles });
}
