import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ArticlesClient from "./ArticlesClient";
import {
  getFilteredArticles,
  getDistinctAuthors,
  SortColumn,
  SortDir,
} from "@/lib/admin-articles-query";

export const dynamic = "force-dynamic";

const VALID_SORT: SortColumn[] = ["date", "title", "status"];
const VALID_DIR: SortDir[] = ["asc", "desc"];
const VALID_STATUS = ["all", "published", "draft", "archived"];

interface SearchParams {
  q?: string;
  status?: string;
  category?: string;
  author?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
  dir?: string;
  page?: string;
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const sort = VALID_SORT.includes(searchParams.sort as SortColumn)
    ? (searchParams.sort as SortColumn)
    : "date";
  const dir = VALID_DIR.includes(searchParams.dir as SortDir)
    ? (searchParams.dir as SortDir)
    : "desc";
  const status = VALID_STATUS.includes(searchParams.status ?? "all")
    ? searchParams.status ?? "all"
    : "all";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const { articles, totalCount, totalPages, pageSize } = await getFilteredArticles({
    q: searchParams.q,
    status,
    category: searchParams.category || "all",
    author: searchParams.author || "all",
    dateFrom: searchParams.dateFrom,
    dateTo: searchParams.dateTo,
    sort,
    dir,
    page,
    role: session.role,
    sessionName: session.name,
  });

  // Author filter is only meaningful for admin/editor — writers are always
  // scoped to themselves, so skip the extra query for that role.
  const authors = session.role === "writer" ? [] : await getDistinctAuthors();

  return (
    <div className="p-6 xl:p-8">
      <ArticlesClient
        articles={articles}
        totalCount={totalCount}
        totalPages={totalPages}
        pageSize={pageSize}
        page={page}
        authors={authors}
        userRole={session.role}
        filters={{
          q: searchParams.q ?? "",
          status,
          category: searchParams.category || "all",
          author: searchParams.author || "all",
          dateFrom: searchParams.dateFrom ?? "",
          dateTo: searchParams.dateTo ?? "",
          sort,
          dir,
        }}
      />
    </div>
  );
}
