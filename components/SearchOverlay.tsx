"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ARTICLES } from "@/lib/data";

export default function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => {
        clearTimeout(t);
      };
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!open) return null;

  const q = query.trim().toLowerCase();
  const matches =
    q.length >= 2
      ? ARTICLES.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.excerpt.toLowerCase().includes(q) ||
            a.category.toLowerCase().includes(q) ||
            a.author.toLowerCase().includes(q) ||
            a.tags.some((t) => t.toLowerCase().includes(q))
        ).slice(0, 8)
      : [];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center bg-ink-900/60 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Site search"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-[min(640px,92vw)] rounded-2xl bg-white p-6 shadow-lg2">
        <form
          className="flex items-center gap-3 border-b-2 border-ink-900 pb-3"
          onSubmit={(e) => e.preventDefault()}
          role="search"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0B0E1A"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, categories, authors…"
            aria-label="Search"
            className="flex-1 bg-transparent font-display text-xl outline-none"
          />
          <button
            type="button"
            className="icon-btn"
            aria-label="Close search"
            onClick={onClose}
          >
            <svg
              viewBox="0 0 24 24"
              stroke="#0B0E1A"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              width="20"
              height="20"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </form>

        {q.length < 2 && (
          <p className="mt-4 text-sm text-ink-500">
            Try &ldquo;AfCFTA&rdquo;, &ldquo;ports&rdquo;, or &ldquo;APSCA
            2026&rdquo;.
          </p>
        )}

        {q.length >= 2 && matches.length === 0 && (
          <div className="mt-4 p-4 text-center text-ink-500">
            <h3 className="mb-1 font-display text-base font-bold text-ink-900">
              No results for &ldquo;{query}&rdquo;
            </h3>
            <p className="text-sm">
              Try a different keyword, category, or author name.
            </p>
          </div>
        )}

        {matches.length > 0 && (
          <ul className="mt-4 max-h-[50vh] overflow-y-auto">
            {matches.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/article/${a.id}`}
                  onClick={onClose}
                  className="flex flex-col rounded px-2 py-3 hover:bg-paper-100"
                >
                  <span className="font-mono text-[0.7rem] uppercase tracking-wider text-red-600">
                    {a.category} &middot; {a.dateline}
                  </span>
                  <span className="font-display text-base font-bold">
                    {a.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}