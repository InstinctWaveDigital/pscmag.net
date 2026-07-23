"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DeltaBadge from "./DeltaBadge";

interface TopArticle {
  id: string;
  title: string;
  category: string;
  status: string;
  updatedAt: string;
  views: number;
  changePct: number | null;
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function TopArticlesTable({ range = "7d" }: { range?: "7d" | "30d" | "12mo" }) {
  const [articles, setArticles] = useState<TopArticle[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetch(`/api/admin/analytics/top-articles?range=${range}&limit=10`)
      .then((r) => {
        if (!r.ok) throw new Error("failed");
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setArticles(data.articles);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [range]);

  return (
    <div className="rounded-xl border border-white/8 bg-[#111827]">
      <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Top Articles</h2>
          <p className="mt-0.5 font-mono text-[0.65rem] text-[#4B5563]">Ranked by views</p>
        </div>
      </div>

      {loading && (
        <div className="p-8 text-center font-mono text-xs text-[#4B5563]">Loading…</div>
      )}

      {!loading && error && (
        <div className="p-8 text-center font-mono text-xs text-red-400">
          Couldn&apos;t load top articles.
        </div>
      )}

      {!loading && !error && articles && articles.length === 0 && (
        <div className="p-8 text-center font-mono text-xs text-[#4B5563]">
          No views recorded for this range yet.
        </div>
      )}

      {!loading && !error && articles && articles.length > 0 && (
        <div className="divide-y divide-white/6">
          {articles.map((a, i) => (
            <div key={a.id} className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-white/3">
              <span className="w-5 flex-none font-mono text-xs text-[#374151]">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/editor?id=${a.id}`}
                  className="truncate text-sm font-medium text-white hover:underline"
                >
                  {a.title}
                </Link>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 font-mono text-[0.65rem] text-[#4B5563]">
                  <span>{a.category}</span>
                  <span>&middot;</span>
                  <span>{formatDate(a.updatedAt)}</span>
                </div>
              </div>
              <span className="flex-none font-mono text-sm font-semibold text-white">
                {a.views.toLocaleString()}
              </span>
              <div className="w-16 flex-none text-right">
                <DeltaBadge pct={a.changePct} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
