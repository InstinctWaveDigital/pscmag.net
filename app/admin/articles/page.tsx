import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ArticlesClient from "./ArticlesClient";

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/admin/login");
  }

  // Fetch articles based on role permissions (Writers can only view their own articles)
  let res;
  if (session.role === "writer") {
    res = await query(
      "SELECT id, category, art, title, excerpt, author, role, date, read_time, dateline, featured, tags, status, updated_at FROM articles WHERE author = $1 ORDER BY updated_at DESC",
      [session.name]
    );
  } else {
    res = await query(
      "SELECT id, category, art, title, excerpt, author, role, date, read_time, dateline, featured, tags, status, updated_at FROM articles ORDER BY updated_at DESC"
    );
  }

  const articles = res.rows.map((row) => ({
    id: row.id,
    category: row.category,
    art: row.art,
    title: row.title,
    excerpt: row.excerpt,
    author: row.author,
    role: row.role,
    date: row.date,
    readTime: row.read_time,
    dateline: row.dateline,
    featured: row.featured === 1,
    tags: row.tags ? row.tags.split(",") : [],
    status: row.status,
    updatedAt: row.updated_at,
  }));

  return (
    <div className="p-6 xl:p-8">
      <ArticlesClient initialArticles={articles} userRole={session.role} />
    </div>
  );
}
