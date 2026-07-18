import { prisma } from "./db";
import { Article, normalizeBody } from "./data";

// ─── Mapping Helpers ─────────────────────────────────────────────────────────

function mapRowToArticle(row: {
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
  featured: number;
  tags: string;
  body: string;
  status: string;
  updatedAt: string;
}): Article & { status: string; updatedAt: string } {
  return {
    id: row.id,
    category: row.category,
    art: row.art as any,
    title: row.title,
    excerpt: row.excerpt,
    author: row.author,
    role: row.role,
    date: row.date,
    readTime: row.readTime,
    dateline: row.dateline,
    featured: row.featured === 1,
    tags: row.tags ? row.tags.split(",").filter(Boolean) : [],
    body: row.body ? normalizeBody(JSON.parse(row.body)) : [],
    status: row.status,
    updatedAt: row.updatedAt,
  };
}

// ─── Article Queries ──────────────────────────────────────────────────────────

export async function getArticleById(
  id: string,
  includeDrafts = false
): Promise<(Article & { status: string; updatedAt: string }) | undefined> {
  const row = await prisma.article.findFirst({
    where: includeDrafts
      ? { id }
      : { id, status: "published" },
  });
  if (!row) return undefined;
  return mapRowToArticle(row as any);
}

export async function getArticlesByCategory(
  categoryName: string
): Promise<(Article & { status: string; updatedAt: string })[]> {
  const rows = await prisma.article.findMany({
    where: { category: categoryName, status: "published" },
    orderBy: { date: "desc" },
  });
  return rows.map((r) => mapRowToArticle(r as any));
}

export async function getFeatured(): Promise<
  (Article & { status: string; updatedAt: string })[]
> {
  const rows = await prisma.article.findMany({
    where: { featured: 1, status: "published" },
    orderBy: { date: "desc" },
  });
  return rows.map((r) => mapRowToArticle(r as any));
}

export async function getRelated(
  article: Article,
  n = 3
): Promise<(Article & { status: string; updatedAt: string })[]> {
  const sameCat = await prisma.article.findMany({
    where: {
      category: article.category,
      id: { not: article.id },
      status: "published",
    },
    orderBy: { date: "desc" },
    take: n,
  });

  const countNeeded = n - sameCat.length;
  let others: typeof sameCat = [];

  if (countNeeded > 0) {
    const excludeIds = [article.id, ...sameCat.map((a) => a.id)];
    others = await prisma.article.findMany({
      where: {
        id: { notIn: excludeIds },
        status: "published",
      },
      orderBy: { date: "desc" },
      take: countNeeded,
    });
  }

  return [...sameCat, ...others]
    .slice(0, n)
    .map((r) => mapRowToArticle(r as any));
}

export async function getAllArticles(
  includeDrafts = false
): Promise<(Article & { status: string; updatedAt: string })[]> {
  const rows = await prisma.article.findMany({
    where: includeDrafts ? undefined : { status: "published" },
    orderBy: includeDrafts
      ? [{ updatedAt: "desc" }, { date: "desc" }]
      : { date: "desc" },
  });
  return rows.map((r) => mapRowToArticle(r as any));
}
