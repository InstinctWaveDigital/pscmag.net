import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { parseRange } from "@/lib/analytics-range";
import { getTopArticlesData } from "@/lib/analytics-data";

export const revalidate = 300;

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const range = parseRange(req.nextUrl.searchParams.get("range"));
  const limitParam = parseInt(req.nextUrl.searchParams.get("limit") || "10", 10);
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 50) : 10;

  const articles = await getTopArticlesData(range, limit);
  return NextResponse.json({ range, limit, articles });
}
