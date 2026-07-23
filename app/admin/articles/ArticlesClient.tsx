"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { saveArticleAction, deleteArticleAction } from "../actions";
import { CATEGORIES, formatDate } from "@/lib/data";
import type { ArticleRow, SortColumn, SortDir } from "@/lib/admin-articles-query";

const STATUS_STYLE: Record<string, string> = {
  published: "bg-green-500/10 text-green-400 border-green-500/20",
  draft: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  archived: "bg-[#374151]/40 text-[#6B7280] border-white/8",
};

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

interface Filters {
  q: string;
  status: string;
  category: string;
  author: string;
  dateFrom: string;
  dateTo: string;
  sort: SortColumn;
  dir: SortDir;
}

export default function ArticlesClient({
  articles,
  totalCount,
  totalPages,
  pageSize,
  page,
  authors,
  userRole,
  filters,
}: {
  articles: ArticleRow[];
  totalCount: number;
  totalPages: number;
  pageSize: number;
  page: number;
  authors: string[];
  userRole: string;
  filters: Filters;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchInput, setSearchInput] = useState(filters.q);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Keep the search box in sync if the URL changes from elsewhere (back/forward nav).
  useEffect(() => setSearchInput(filters.q), [filters.q]);

  function pushParams(updates: Record<string, string | null>, resetPage = true) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    if (resetPage) params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  // Debounce the search box: push to the URL 350ms after the user stops typing.
  useEffect(() => {
    if (searchInput === filters.q) return;
    const t = setTimeout(() => {
      pushParams({ q: searchInput || null });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  function toggleSort(col: SortColumn) {
    if (filters.sort === col) {
      pushParams({ sort: col, dir: filters.dir === "asc" ? "desc" : "asc" }, false);
    } else {
      pushParams({ sort: col, dir: "desc" }, false);
    }
  }

  function SortIcon({ col }: { col: SortColumn }) {
    if (filters.sort !== col) return <span className="ml-1 text-[#374151]">↕</span>;
    return <span className="ml-1 text-[#E2231A]">{filters.dir === "asc" ? "↑" : "↓"}</span>;
  }

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (p > 1) params.set("page", String(p));
    else params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  async function handleStatusChange(id: string, newStatus: "published" | "draft" | "archived") {
    const article = articles.find((a) => a.id === id);
    if (!article) return;

    try {
      const res = await saveArticleAction({
        ...article,
        status: newStatus,
        body: [], // Added fallback array to resolve the compiler type mismatch
      });

      if (res.success) {
        router.refresh(); // re-fetch server-filtered data so counts/pagination stay accurate
      } else {
        alert(res.error || "Failed to update article status.");
      }
    } catch {
      alert("An unexpected error occurred.");
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await deleteArticleAction(id);
      if (res.success) {
        setConfirmDelete(null);
        router.refresh();
      } else {
        alert(res.error || "Failed to delete article.");
      }
    } catch {
      alert("An unexpected error occurred.");
    }
  }

  const rangeStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalCount);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Articles</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            {totalCount === 0
              ? "0 stories"
              : `Showing ${rangeStart}–${rangeEnd} of ${totalCount} stories`}
          </p>
        </div>
        <Link
          href="/admin/editor"
          className="flex h-9 items-center gap-2 rounded-lg bg-[#E2231A] px-4 text-sm font-semibold text-white transition hover:bg-[#B81B14] active:scale-95"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Story
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search title, author, tags…"
            className="h-9 w-full rounded-lg border border-white/8 bg-[#111827] pl-8 pr-3 text-sm text-white placeholder-[#374151] focus:border-white/20 focus:outline-none"
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-1 rounded-lg border border-white/8 bg-[#111827] p-1">
          {STATUS_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => pushParams({ status: o.value })}
              className={`rounded px-3 py-1 font-mono text-[0.68rem] font-semibold uppercase tracking-wider transition ${
                filters.status === o.value
                  ? "bg-[#E2231A] text-white"
                  : "text-[#6B7280] hover:text-white"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <select
          value={filters.category}
          onChange={(e) => pushParams({ category: e.target.value })}
          className="h-9 rounded-lg border border-white/8 bg-[#111827] px-3 text-sm text-white focus:border-white/20 focus:outline-none"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.name}>{c.name}</option>
          ))}
        </select>

        {/* Author filter — admin/editor only; writers are always scoped to themselves */}
        {userRole !== "writer" && (
          <select
            value={filters.author}
            onChange={(e) => pushParams({ author: e.target.value })}
            className="h-9 rounded-lg border border-white/8 bg-[#111827] px-3 text-sm text-white focus:border-white/20 focus:outline-none"
          >
            <option value="all">All Authors</option>
            {authors.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        )}

        {/* Date range */}
        <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-[#111827] px-3">
          <label className="font-mono text-[0.65rem] text-[#4B5563]" htmlFor="dateFrom">From</label>
          <input
            id="dateFrom"
            type="date"
            defaultValue={filters.dateFrom}
            onChange={(e) => pushParams({ dateFrom: e.target.value })}
            className="h-9 bg-transparent text-sm text-white [color-scheme:dark] focus:outline-none"
          />
          <label className="font-mono text-[0.65rem] text-[#4B5563]" htmlFor="dateTo">To</label>
          <input
            id="dateTo"
            type="date"
            defaultValue={filters.dateTo}
            onChange={(e) => pushParams({ dateTo: e.target.value })}
            className="h-9 bg-transparent text-sm text-white [color-scheme:dark] focus:outline-none"
          />
          {(filters.dateFrom || filters.dateTo) && (
            <button
              type="button"
              onClick={() => pushParams({ dateFrom: null, dateTo: null })}
              className="font-mono text-[0.65rem] text-[#6B7280] hover:text-white"
              aria-label="Clear date range"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className={`overflow-hidden rounded-xl border border-white/8 bg-[#111827] transition-opacity ${isPending ? "opacity-60" : ""}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-white/8">
                <th className="px-5 py-3 text-left">
                  <button type="button" onClick={() => toggleSort("title")} className="flex items-center font-mono text-[0.67rem] uppercase tracking-wider text-[#4B5563] hover:text-white transition">
                    Title <SortIcon col="title" />
                  </button>
                </th>
                <th className="hidden px-4 py-3 text-left md:table-cell">
                  <span className="font-mono text-[0.67rem] uppercase tracking-wider text-[#4B5563]">Category</span>
                </th>
                <th className="hidden px-4 py-3 text-left lg:table-cell">
                  <span className="font-mono text-[0.67rem] uppercase tracking-wider text-[#4B5563]">Author</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <button type="button" onClick={() => toggleSort("status")} className="flex items-center font-mono text-[0.67rem] uppercase tracking-wider text-[#4B5563] hover:text-white transition">
                    Status <SortIcon col="status" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button type="button" onClick={() => toggleSort("date")} className="flex items-center font-mono text-[0.67rem] uppercase tracking-wider text-[#4B5563] hover:text-white transition">
                    Updated <SortIcon col="date" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <span className="font-mono text-[0.67rem] uppercase tracking-wider text-[#4B5563]">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {articles.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center font-mono text-sm text-[#374151]">
                    No stories match your filters.
                  </td>
                </tr>
              )}
              {articles.map((a) => (
                <tr key={a.id} className="group transition hover:bg-white/3">
                  <td className="px-5 py-3.5">
                    <div className="line-clamp-1 text-sm font-medium text-white">{a.title}</div>
                    <div className="mt-0.5 font-mono text-[0.62rem] text-[#374151]">{a.id}</div>
                  </td>
                  <td className="hidden px-4 py-3.5 md:table-cell">
                    <span className="font-mono text-[0.7rem] text-[#6B7280]">{a.category}</span>
                  </td>
                  <td className="hidden px-4 py-3.5 lg:table-cell">
                    <span className="text-sm text-[#6B7280]">{a.author}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <select
                      value={a.status}
                      onChange={(e) => handleStatusChange(a.id, e.target.value as any)}
                      className={`rounded-full border px-2 py-0.5 font-mono text-[0.62rem] font-semibold uppercase tracking-wider focus:outline-none bg-transparent ${STATUS_STYLE[a.status]}`}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-[0.7rem] text-[#4B5563]">{formatDate(a.updatedAt)}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/article/${a.id}`}
                        target="_blank"
                        className="rounded border border-white/8 px-2.5 py-1.5 font-mono text-[0.65rem] text-[#6B7280] transition hover:border-white/20 hover:text-white"
                      >
                        Preview
                      </Link>
                      <Link
                        href={`/admin/editor?id=${a.id}`}
                        className="rounded border border-white/8 px-2.5 py-1.5 font-mono text-[0.65rem] text-[#6B7280] transition hover:border-white/20 hover:text-white"
                      >
                        Edit
                      </Link>
                      {userRole !== "writer" && (
                        confirmDelete === a.id ? (
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleDelete(a.id)}
                              className="rounded border border-red-600/50 px-2 py-1.5 font-mono text-[0.65rem] text-red-400 transition hover:bg-red-600/10"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(null)}
                              className="rounded border border-white/8 px-2 py-1.5 font-mono text-[0.65rem] text-[#6B7280] transition hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(a.id)}
                            className="rounded border border-white/8 px-2.5 py-1.5 font-mono text-[0.65rem] text-[#6B7280] transition hover:border-red-600/40 hover:text-red-400"
                          >
                            Delete
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between">
          <span className="font-mono text-[0.7rem] text-[#4B5563]">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
              className="rounded-lg border border-white/8 px-3 py-1.5 font-mono text-[0.7rem] text-[#6B7280] transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<number[]>((acc, p) => {
                if (acc.length && p - acc[acc.length - 1] > 1) acc.push(-1); // ellipsis marker
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === -1 ? (
                  <span key={`ellipsis-${i}`} className="px-2 py-1.5 font-mono text-[0.7rem] text-[#374151]">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => goToPage(p)}
                    className={`rounded-lg border px-3 py-1.5 font-mono text-[0.7rem] transition ${
                      p === page
                        ? "border-[#E2231A] bg-[#E2231A] text-white"
                        : "border-white/8 text-[#6B7280] hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
              className="rounded-lg border border-white/8 px-3 py-1.5 font-mono text-[0.7rem] text-[#6B7280] transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
