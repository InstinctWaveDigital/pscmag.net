import { query } from "@/lib/db";
import { AnalyticsRange, rangeToDates } from "@/lib/analytics-range";
import { CATEGORY_VALUES } from "@/lib/categories";

export interface SeriesPoint {
  label: string;
  count: number;
}

export interface OverviewData {
  range: AnalyticsRange;
  totalViews: number;
  uniqueSessions: number;
  previousPeriodViews: number;
  changePct: number | null;
  series: SeriesPoint[];
}

export async function getOverviewData(range: AnalyticsRange): Promise<OverviewData> {
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

  return {
    range,
    totalViews: total,
    uniqueSessions: uniqueRes.rows[0]?.count ?? 0,
    previousPeriodViews: prevTotal,
    changePct,
    series: seriesRes.rows as SeriesPoint[],
  };
}

export interface CategoryRow {
  category: string;
  views: number;
}

export interface ByCategoryData {
  range: AnalyticsRange;
  categories: CategoryRow[];
  unrecognizedCategories: CategoryRow[];
}

export async function getByCategoryData(range: AnalyticsRange): Promise<ByCategoryData> {
  const { start, end } = rangeToDates(range);

  const res = await query(
    `
    SELECT a.category AS category, COUNT(pv.id)::int AS views
    FROM page_views pv
    JOIN articles a ON a.id = pv.article_id
    WHERE pv.viewed_at >= $1 AND pv.viewed_at < $2
    GROUP BY a.category
    ORDER BY views DESC
    `,
    [start, end]
  );

  const byName = new Map<string, number>(res.rows.map((r: any) => [r.category, r.views]));

  const known = CATEGORY_VALUES.map((name) => ({
    category: name,
    views: byName.get(name) ?? 0,
  }));

  const unrecognized = res.rows
    .filter((r: any) => !CATEGORY_VALUES.includes(r.category))
    .map((r: any) => ({ category: r.category, views: r.views }));

  return { range, categories: known, unrecognizedCategories: unrecognized };
}

export interface TopArticleRow {
  id: string;
  title: string;
  category: string;
  status: string;
  updatedAt: string;
  views: number;
  previousViews: number;
  changePct: number | null;
}

export async function getTopArticlesData(
  range: AnalyticsRange,
  limit = 10
): Promise<TopArticleRow[]> {
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

  return res.rows.map((r: any) => {
    const changePct =
      r.previous_views === 0
        ? null
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
}
