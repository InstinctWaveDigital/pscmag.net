import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { parseRange } from "@/lib/analytics-range";
import { getByCategoryData } from "@/lib/analytics-data";

export const revalidate = 300;

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const range = parseRange(req.nextUrl.searchParams.get("range"));
  const data = await getByCategoryData(range);
  return NextResponse.json(data);
}
