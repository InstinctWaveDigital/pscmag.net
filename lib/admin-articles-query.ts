import { query } from "@/lib/db";

export const ARTICLES_PAGE_SIZE = 20;

export type SortColumn = "date" | "title" | "status";
export type SortDir = "asc" | "desc";

const SORT_COLUMN_SQL: Record<SortColumn, string> = {
  date: "updated_at",
  title: "title",
  status: "status",
};

export interface ArticlesFilters {
  q?: string;
  status?: string; // "all" | published | draft | archived
  category?: string; // "all" | exact category name
  author?: string; // "all" | exact author name — ignored for writers (forced to self)
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  sort?: SortColumn;
  dir?: SortDir;
  page?: number;
  // Access control — writers are always restricted to their own byline,
  // regardless of what (if anything) is in the `author` param.
  role: string;
  sessionName: string;
}

export interface ArticleRow {
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
  featured: boolean;
  tags: string[];
  status: "published" | "draft" | "archived";
  updatedAt: string;
}

function mapRow(row: any): ArticleRow {
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
    tags: row.tags ? row.tags.split(",") : [],
    status: row.status,
    updatedAt: row.updated_at,
  };
}

/**
 * Builds and runs the WHERE-clause-shared count + page queries for the
 * admin articles list. All filtering happens in Postgres — the client only
 * ever receives the current page's rows, so this scales past hundreds of
 * articles instead of shipping the whole table to the browser.
 */
export async function getFilteredArticles(filters: ArticlesFilters) {
  const conditions: string[] = [];
  const params: any[] = [];

  function addCondition(sql: string, value: any) {
    params.push(value);
    conditions.push(sql.replace("?", `$${params.length}`));
  }

  // Writers are hard-restricted to their own byline — this overrides any
  // `author` filter value rather than being combined with it.
  if (filters.role === "writer") {
    addCondition("author = ?", filters.sessionName);
  } else if (filters.author && filters.author !== "all") {
    addCondition("author = ?", filters.author);
  }

  if (filters.status && filters.status !== "all") {
    addCondition("status = ?", filters.status);
  }

  if (filters.category && filters.category !== "all") {
    addCondition("category = ?", filters.category);
  }

  if (filters.dateFrom) {
    addCondition("updated_at::timestamptz >= ?::date", filters.dateFrom);
  }
  if (filters.dateTo) {
    addCondition("updated_at::timestamptz < (?::date + interval '1 day')", filters.dateTo);
  }

  if (filters.q && filters.q.trim()) {
    const like = `%${filters.q.trim()}%`;
    params.push(like, like, like);
    conditions.push(
      `(title ILIKE $${params.length - 2} OR author ILIKE $${params.length - 1} OR tags ILIKE $${params.length})`
    );
  }

  const whereSql = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const sortCol = SORT_COLUMN_SQL[filters.sort ?? "date"] ?? "updated_at";
  const sortDir = filters.dir === "asc" ? "ASC" : "DESC";
  const page = Math.max(1, filters.page ?? 1);
  const offset = (page - 1) * ARTICLES_PAGE_SIZE;

  const countRes = await query(`SELECT COUNT(*)::int AS count FROM articles ${whereSql}`, params);
  const totalCount = countRes.rows[0]?.count ?? 0;

  const pageParams = [...params, ARTICLES_PAGE_SIZE, offset];
  const rowsRes = await query(
    `
    SELECT id, category, art, title, excerpt, author, role, date, read_time, dateline, featured, tags, status, updated_at
    FROM articles
    ${whereSql}
    ORDER BY ${sortCol} ${sortDir}, id ${sortDir}
    LIMIT $${pageParams.length - 1} OFFSET $${pageParams.length}
    `,
    pageParams
  );

  return {
    articles: rowsRes.rows.map(mapRow),
    totalCount,
    page,
    pageSize: ARTICLES_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(totalCount / ARTICLES_PAGE_SIZE)),
  };
}

export async function getDistinctAuthors(): Promise<string[]> {
  const res = await query("SELECT DISTINCT author FROM articles ORDER BY author");
  return res.rows.map((r: any) => r.author);
}
