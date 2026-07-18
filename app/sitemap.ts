import type { MetadataRoute } from "next";
import { SITE, CATEGORIES } from "@/lib/data";
import { getAllArticles } from "@/lib/db-queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Establish absolute safe baseline domain URL string
  const baseUrl = SITE.url || "https://pscmag.net";
  
  let articles: any[] = [];
  try {
    articles = await getAllArticles();
  } catch (err) {
    // If the database is busy or down during compilation, log it 
    // but don't break the build pipeline.
    console.error("Sitemap compilation: failed to fetch dynamic rows:", err);
  }

  // 2. Map static landing destinations safely
  const staticRoutes: MetadataRoute.Sitemap = [
    { 
      url: baseUrl, 
      changeFrequency: "hourly", 
      priority: 1 
    },
    ...CATEGORIES.map((c) => ({
      url: `${baseUrl}/category/${c.slug}`,
      changeFrequency: "daily" as const, // Locks literal token type assertion
      priority: 0.8,
    })),
  ];

  // 3. Map dynamic dynamic database entries cleanly
  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => {
    // Determine the most accurate fallback timestamp window
    const baseDate = a.updatedAt || a.date || new Date();
    const dateObj = baseDate instanceof Date ? baseDate : new Date(baseDate);

    return {
      url: `${baseUrl}/article/${a.id}`,
      // Next.js expects a clean ISO string profile format or a real Date object instance
      lastModified: isNaN(dateObj.getTime()) ? new Date().toISOString() : dateObj.toISOString(),
      changeFrequency: "weekly" as const, // Fixed: Added 'as const' literal assertion
      priority: 0.6,
    };
  });

  return [...staticRoutes, ...articleRoutes];
}