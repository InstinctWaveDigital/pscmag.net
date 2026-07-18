import type { MetadataRoute } from "next";
import { SITE } from "@/lib/data";

export default function robots(): MetadataRoute.Robots {
  // Gracefully fallback to a production domain if SITE.url is missing or empty
  const baseUrl = SITE.url;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Blocks crawlers from administrative views and private backend operations
        disallow: ["/admin", "/api/", "/_next/"],
      },
    ],
    // Provided as an array string to guarantee compatibility with Next.js edge-runtime requirements
    sitemap: [`${baseUrl}/sitemap.xml`],
  };
}