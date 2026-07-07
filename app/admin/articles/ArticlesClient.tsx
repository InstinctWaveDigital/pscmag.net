"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { saveArticleAction, deleteArticleAction } from "../actions";
import { CATEGORIES, formatDate } from "@/lib/data";

interface Article {
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

export default function ArticlesClient({
  initialArticles,
  userRole,
}: {
  initialArticles: Article[];
  userRole: string;
}) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "title" | "status">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...articles];
    if (statusFilter !== "all") {
      result = result.filter((a) => a.status === statusFilter);
    }
    if (categoryFilter !== "all") {
      result = result.filter((a) => a.category === categoryFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.author.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "date") cmp = a.updatedAt.localeCompare(b.updatedAt);
      if (sortBy === "title") cmp = a.title.localeCompare(b.title);
      if (sortBy === "status") cmp = a.status.localeCompare(b.status);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [articles, statusFilter, categoryFilter, search, sortBy, sortDir]);

  function toggleSort(col: "date" | "title" | "status") {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("desc");
    }
  }

  function SortIcon({ col }: { col: string }) {
    if (sortBy !== col) return <span className="ml-1 text-[#374151]">↕</span>;
    return <span className="ml-1 text-[#E2231A]">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  async function handleStatusChange(id: string, newStatus: "published" | "draft" | "archived") {
    const article = articles.find((a) => a.id === id);
    if (!article) return;

    try {
      const res = await saveArticleAction({
        ...article,
        status: newStatus,
      });

      if (res.success) {
        setArticles(
          articles.map((a) =>
            a.id === id ? { ...a, status: newStatus, updatedAt: new Date().toISOString().slice(0, 10) } : a
          )
        );
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
        setArticles(articles.filter((a) => a.id !== id));
        setConfirmDelete(null);
      } else {
        alert(res.error || "Failed to delete article.");
      }
    } catch {
      alert("An unexpected error occurred.");
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Articles</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            {filtered.length} of {articles.length} stories
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
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
              onClick={() => setStatusFilter(o.value)}
              className={`rounded px-3 py-1 font-mono text-[0.68rem] font-semibold uppercase tracking-wider transition ${
                statusFilter === o.value
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
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 rounded-lg border border-white/8 bg-[#111827] px-3 text-sm text-white focus:border-white/20 focus:outline-none"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/8 bg-[#111827]">
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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center font-mono text-sm text-[#374151]">
                    No stories match your filters.
                  </td>
                </tr>
              )}
              {filtered.map((a) => (
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
    </div>
  );
}
