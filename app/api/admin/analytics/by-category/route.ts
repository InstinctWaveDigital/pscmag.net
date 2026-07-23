import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { parseRange, rangeToDates } from "@/lib/analytics-range";
import { CATEGORY_VALUES } from "@/lib/categories";

export const revalidate = 300;

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const range = parseRange(req.nextUrl.searchParams.get("range"));
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

  // Zero-fill every known category, and separate out anything in the DB
  // that doesn't match the taxonomy in lib/categories.ts — surfacing that
  // here (rather than silently grouping it under its raw string) is what
  // catches the category-string-mismatch class of bug at the analytics
  // layer instead of letting it fail silently.
  const byName = new Map<string, number>(res.rows.map((r: any) => [r.category, r.views]));

  const known = CATEGORY_VALUES.map((name) => ({
    category: name,
    views: byName.get(name) ?? 0,
  }));

  const unrecognized = res.rows
    .filter((r: any) => !CATEGORY_VALUES.includes(r.category))
    .map((r: any) => ({ category: r.category, views: r.views }));

  return NextResponse.json({
    range,
    categories: known,
    unrecognizedCategories: unrecognized, // should be [] in a healthy dataset
  });
}
