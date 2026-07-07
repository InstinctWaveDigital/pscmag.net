import { MetadataRoute } from "next";
import { CATEGORIES, SITE } from "@/lib/data";
import { getAllArticles } from "@/lib/db-queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE.url}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/advertise`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${SITE.url}/category/${c.slug}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const articles = await getAllArticles();
  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE.url}/article/${a.id}`,
    lastModified: a.date,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}