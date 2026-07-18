import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import EditorClient from "./EditorClient";
import { normalizeBody } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function EditorPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const { id } = await searchParams;
  let article = null;

  if (id) {
    const res = await query("SELECT * FROM articles WHERE id = $1", [id]);
    if (res.rows.length > 0) {
      const dbArt = res.rows[0];

      if (session.role === "writer" && dbArt.author !== session.name) {
        redirect("/admin");
      }

      article = {
        id: dbArt.id,
        category: dbArt.category,
        art: dbArt.art,
        title: dbArt.title,
        excerpt: dbArt.excerpt,
        author: dbArt.author,
        role: dbArt.role,
        date: dbArt.date,
        readTime: dbArt.read_time,
        dateline: dbArt.dateline,
        featured: dbArt.featured === 1,
        tags: dbArt.tags ? dbArt.tags.split(",") : [],
        body: dbArt.body ? normalizeBody(JSON.parse(dbArt.body)) : [],
        status: dbArt.status,
      };
    }
  }

  const mediaRes = await query("SELECT filename, filepath FROM media ORDER BY created_at DESC");
  const mediaItems = mediaRes.rows.map((row) => ({
    filename: row.filename,
    url: row.filepath,
  }));

  return (
    <EditorClient
      initialArticle={article}
      mediaItems={mediaItems}
      userRole={session.role}
      userName={session.name}
    />
  );
}