import type { MetadataRoute } from "next";
import { SITE, CATEGORIES } from "@/lib/data";
import { getAllArticles } from "@/lib/db-queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let articles: any[] = [];
  try {
    articles = await getAllArticles();
  } catch (err) {
    console.error("Sitemap: failed to fetch articles", err);
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE.url, changeFrequency: "hourly", priority: 1 },
    ...CATEGORIES.map((c) => ({
      url: `${SITE.url}/category/${c.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE.url}/article/${a.id}`,
    lastModified: a.updatedAt ? new Date(a.updatedAt) : new Date(a.date),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...articleRoutes];
}