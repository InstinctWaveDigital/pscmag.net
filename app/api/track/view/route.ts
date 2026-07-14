import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { articleId } = await request.json();

    if (!articleId || typeof articleId !== "string") {
      return NextResponse.json({ error: "Missing articleId" }, { status: 400 });
    }

    await query(
      "INSERT INTO page_views (article_id, viewed_at) VALUES ($1, now())",
      [articleId]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("View tracking error:", err);
    // A tracking failure should never surface to the reader or break the page
    return NextResponse.json({ success: false }, { status: 200 });
  }
}