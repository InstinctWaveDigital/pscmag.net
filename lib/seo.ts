import type { Metadata } from "next";
import { SITE } from "./data";

const BASE_KEYWORDS = [
  "Africa procurement",
  "supply chain Africa",
  "AfCFTA",
  "African logistics",
  "African trade policy",
  "procurement awards Africa",
  "African ports",
  "supply chain magazine",
];

interface BuildMetadataOptions {
  title: string;
  description: string;
  path: string; // e.g. "/article/some-id" or "/category/procurement-and-governance"
  keywords?: string[]; // page-specific — merged with BASE_KEYWORDS, deduped
  image?: string; // defaults to the shared OG image
  type?: "website" | "article";
  publishedTime?: string;
  authors?: string[];
  noIndex?: boolean; // for draft previews, thin/empty category pages, etc.
}

function dedupeKeywords(keywords: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const kw of keywords) {
    const normalized = kw.trim();
    const key = normalized.toLowerCase();
    if (normalized && !seen.has(key)) {
      seen.add(key);
      result.push(normalized);
    }
  }
  return result;
}

export function buildMetadata(opts: BuildMetadataOptions): Metadata {
  const url = `${SITE.url}${opts.path}`;
  const keywords = dedupeKeywords([...(opts.keywords || []), ...BASE_KEYWORDS]);
  const image = opts.image || "/opengraph-image";

  return {
    title: opts.title,
    description: opts.description,
    keywords,
    alternates: { canonical: opts.path },
    robots: opts.noIndex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: opts.type || "website",
      locale: SITE.locale,
      url,
      siteName: SITE.name,
      title: opts.title,
      description: opts.description,
      images: [{ url: image, width: 1200, height: 630, alt: opts.title }],
      ...(opts.type === "article" && opts.publishedTime
        ? { publishedTime: opts.publishedTime, authors: opts.authors }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      site: SITE.twitter,
      creator: SITE.twitter,
      title: opts.title,
      description: opts.description,
      images: [image],
    },
  };
}