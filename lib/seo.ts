import type { Metadata } from "next";
import { SITE } from "./data";

const BASE_KEYWORDS = [
  // --- BASE KEYWORDS (Originals) ---
  "Africa procurement",
  "supply chain Africa",
  "AfCFTA",
  "African logistics",
  "African trade policy",
  "procurement awards Africa",
  "procurement and supply chain",
  "procurement and supply chain magazine",
  "Africa Procurement and Supply Chain Magazine",
  "Africa trade policy update",
  "Procurement leaders",
  "procurement and supply chain magazine, Africa",
  "African ports",
  "supply chain magazine",

  // --- AfCFTA & INTRA-AFRICAN TRADE ---
  "AfCFTA trade rules",
  "intra-African trade barriers",
  "AfCFTA rules of origin",
  "regional value chains Africa",
  "African Continental Free Trade Area updates",
  "Pan-African payment settlement system PAPSS",
  "cross-border trade Africa",
  "non-tariff barriers Africa",

  // --- REGIONAL LOGISTICS & INFRASTRUCTURE ---
  "East Africa logistics corridors",
  "West African port congestion",
  "SADC trade agreements",
  "ECOWAS procurement guidelines",
  "North Africa supply chain",
  "maritime shipping Africa",
  "African air cargo logistics",
  "special economic zones Africa SEZ",

  // --- PUBLIC & SUSTAINABLE PROCUREMENT ---
  "public procurement reform Africa",
  "sustainable sourcing Africa",
  "green supply chain Africa",
  "African supplier diversity",
  "ESG in African procurement",
  "local content policy Africa",

  // --- DIGITAL TRANSFORMATION & TECH ---
  "e-procurement software Africa",
  "supply chain digitization Africa",
  "fintech in African logistics",
  "last mile delivery Africa",
  "freight tech startups Africa",
  "procure to pay Africa P2P",

  // --- EXECUTIVE, CAREERS & EVENTS ---
  "CIPS Africa",
  "African supply chain association",
  "procurement summits Africa",
  "supply chain jobs Lagos Nairobi Johannesburg",
  "chief procurement officer Africa CPO",
  "African logistics professional certification",
  "procurement excellence awards Africa"
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