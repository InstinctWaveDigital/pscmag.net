import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";

  if (q.length < 2) {
    return NextResponse.json({ matches: [] });
  }

  try {
    const searchPattern = `%${q}%`;
    
    // Search in PostgreSQL using pattern matching
    const res = await query(
      `SELECT id, category, art, title, excerpt, author, date, read_time, dateline 
       FROM articles 
       WHERE status = 'published' AND (
         LOWER(title) LIKE LOWER($1) OR 
         LOWER(excerpt) LIKE LOWER($1) OR 
         LOWER(category) LIKE LOWER($1) OR 
         LOWER(author) LIKE LOWER($1) OR 
         LOWER(tags) LIKE LOWER($1)
       ) 
       ORDER BY date DESC LIMIT 8`,
      [searchPattern]
    );

    const matches = res.rows.map((row) => ({
      id: row.id,
      category: row.category,
      art: row.art,
      title: row.title,
      excerpt: row.excerpt,
      author: row.author,
      date: row.date,
      readTime: row.read_time,
      dateline: row.dateline,
    }));

    return NextResponse.json({ matches });
  } catch (err: any) {
    console.error("Search API query failure:", err);
    return NextResponse.json({ error: "Search failed." }, { status: 500 });
  }
}
