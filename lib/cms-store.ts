"use client";

import { useState, useEffect, useCallback } from "react";
import { ARTICLES, CATEGORIES, type Article, type ArticleArt } from "./data";

export type CMSStatus = "published" | "draft" | "archived";

export interface CMSArticle extends Article {
  status: CMSStatus;
  updatedAt: string;
}

const STORAGE_KEY = "apsc_cms_articles_v1";

function seed(): CMSArticle[] {
  return ARTICLES.map((a) => ({
    ...a,
    status: "published" as CMSStatus,
    updatedAt: a.date,
  }));
}

function load(): CMSArticle[] {
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed();
    return JSON.parse(raw) as CMSArticle[];
  } catch {
    return seed();
  }
}

function save(articles: CMSArticle[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
}

export function useCMS() {
  const [articles, setArticles] = useState<CMSArticle[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setArticles(load());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: CMSArticle[]) => {
    setArticles(next);
    save(next);
  }, []);

  const create = useCallback(
    (draft: Omit<CMSArticle, "id" | "updatedAt">) => {
      const id = `article-${Date.now()}`;
      const now = new Date().toISOString().slice(0, 10);
      const next = [{ ...draft, id, updatedAt: now }, ...articles];
      persist(next);
      return id;
    },
    [articles, persist]
  );

  const update = useCallback(
    (id: string, changes: Partial<CMSArticle>) => {
      const now = new Date().toISOString().slice(0, 10);
      const next = articles.map((a) =>
        a.id === id ? { ...a, ...changes, updatedAt: now } : a
      );
      persist(next);
    },
    [articles, persist]
  );

  const remove = useCallback(
    (id: string) => {
      persist(articles.filter((a) => a.id !== id));
    },
    [articles, persist]
  );

  const reset = useCallback(() => {
    const fresh = seed();
    persist(fresh);
  }, [persist]);

  return { articles, hydrated, create, update, remove, reset };
}

export { CATEGORIES };
export type { ArticleArt };
