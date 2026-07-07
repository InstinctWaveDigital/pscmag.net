import { query } from "./db";
import { Article } from "./data";

function mapRowToArticle(row: any): any {
  if (!row) return null;
  return {
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
    tags: row.tags ? row.tags.split(",").filter(Boolean) : [],
    body: row.body ? JSON.parse(row.body) : [],
    status: row.status,
    updatedAt: row.updated_at,
  };
}

export async function getArticleById(id: string, includeDrafts = false): Promise<Article | undefined> {
  const sql = includeDrafts
    ? "SELECT * FROM articles WHERE id = $1"
    : "SELECT * FROM articles WHERE id = $1 AND status = 'published'";
  const res = await query(sql, [id]);
  if (res.rows.length === 0) return undefined;
  return mapRowToArticle(res.rows[0]);
}

export async function getArticlesByCategory(categoryName: string): Promise<Article[]> {
  const res = await query(
    "SELECT * FROM articles WHERE category = $1 AND status = 'published' ORDER BY date DESC",
    [categoryName]
  );
  return res.rows.map(mapRowToArticle);
}

export async function getFeatured(): Promise<Article[]> {
  const res = await query(
    "SELECT * FROM articles WHERE featured = 1 AND status = 'published' ORDER BY date DESC"
  );
  return res.rows.map(mapRowToArticle);
}

export async function getRelated(article: Article, n = 3): Promise<Article[]> {
  const sameCatRes = await query(
    "SELECT * FROM articles WHERE category = $1 AND id != $2 AND status = 'published' ORDER BY date DESC LIMIT $3",
    [article.category, article.id, n]
  );
  const sameCat = sameCatRes.rows.map(mapRowToArticle);

  const countNeeded = n - sameCat.length;
  let others: Article[] = [];
  if (countNeeded > 0) {
    const sameCatIds = [article.id, ...sameCat.map((a) => a.id)];
    // Build query with dynamic parameters based on sameCatIds length
    const placeholders = sameCatIds.map((_, i) => `$${i + 1}`).join(",");
    const res = await query(
      `SELECT * FROM articles WHERE id NOT IN (${placeholders}) AND status = 'published' ORDER BY date DESC LIMIT $${sameCatIds.length + 1}`,
      [...sameCatIds, countNeeded]
    );
    others = res.rows.map(mapRowToArticle);
  }

  return [...sameCat, ...others].slice(0, n);
}

export async function getAllArticles(includeDrafts = false): Promise<Article[]> {
  const sql = includeDrafts
    ? "SELECT * FROM articles ORDER BY updated_at DESC, date DESC"
    : "SELECT * FROM articles WHERE status = 'published' ORDER BY date DESC";
  const res = await query(sql);
  return res.rows.map(mapRowToArticle);
}
