
import "dotenv/config";
import { query } from "../lib/db";
import fs from "fs";
import path from "path";

interface ArticleInput {
  id: string;
  category: string;
  art: string;
  title: string;
  excerpt: string;
  author: string;
  role: string;
  date: string;
  readTime: string;
  dateline: string;
  featured?: number;
  tags: string;
  body: string;
  status: string;
  updatedAt: string;
}

const CATEGORY_ART_MAP: Record<string, string> = {
  "PROCUREMENT AND GOVERNANCE": "procurement",
  "LOGISTICS AND SUPPLY CHAIN": "logistics",
  "TRADE POLICY": "policy",
  "Events": "awards",
  "FEATURES AND INTERVIEW": "featured",
};



async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: npx tsx scripts/import-articles.ts data/articles-batch-1.json");
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), file);
  const articles: ArticleInput[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  let created = 0;
  let updated = 0;

  for (const a of articles) {
    const existing = await query("SELECT id FROM articles WHERE id = $1", [a.id]);

    await query(
      `INSERT INTO articles
        (id, category, art, title, excerpt, author, role, date, read_time, dateline, featured, tags, body, status, updated_at)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       ON CONFLICT (id) DO UPDATE SET
        category = EXCLUDED.category,
        art = EXCLUDED.art,
        title = EXCLUDED.title,
        excerpt = EXCLUDED.excerpt,
        author = EXCLUDED.author,
        role = EXCLUDED.role,
        date = EXCLUDED.date,
        read_time = EXCLUDED.read_time,
        dateline = EXCLUDED.dateline,
        featured = EXCLUDED.featured,
        tags = EXCLUDED.tags,
        body = EXCLUDED.body,
        status = EXCLUDED.status,
        updated_at = EXCLUDED.updated_at`,
      [
        a.id,
        CATEGORY_ART_MAP[a.category] || "",
        a.art ?? "",
        a.title,
        a.excerpt,
        a.author,
        a.role,
        a.date,
        a.readTime,
        a.dateline,
        a.featured ?? 0,
        a.tags,
        a.body,
        a.status,
        a.updatedAt,
      ]
    );

    existing.rows.length > 0 ? updated++ : created++;
  }

  console.log(`✅ Import complete — ${created} created, ${updated} updated, ${articles.length} total.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Import failed:", err);
  process.exit(1);
});