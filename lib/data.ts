// ─── Body Block Types (rich text, images, video) ──────────────────────────

export type BodyBlock =
  | { type: "paragraph"; text: string } // may contain **bold**, *italic*, __underline__, [label](url)
  | { type: "image"; url: string; caption?: string }
  | { type: "video"; youtubeId: string; caption?: string };

// Accepts either the legacy plain string[] format or the new block format,
// so old DB rows and old import scripts keep working without a forced migration.
export function normalizeBody(raw: unknown): BodyBlock[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item): BodyBlock => {
    if (typeof item === "string") {
      return { type: "paragraph", text: item };
    }
    if (item && typeof item === "object" && "type" in item) {
      return item as BodyBlock;
    }
    return { type: "paragraph", text: String(item) };
  });
}

// Extracts an 11-char YouTube video ID from any common URL shape,
// or returns the input unchanged if it's already a bare ID.
export function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const match = trimmed.match(p);
    if (match) return match[1];
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  return null;
}

// ─── Core Types ─────────────────────────────────────────────────────────────

export type ArticleArt =
    | "procurement"
    | "logistics"
    | "policy"
    | "awards"
    | "technology"
    | "leadership"
    | "featured";

export interface Article {
    id: string;
    category: string;
    art: ArticleArt;
    title: string;
    excerpt: string;
    author: string;
    role: string;
    date: string; // ISO
    readTime: string;
    dateline: string;
    featured?: boolean;
    editorsPick?: boolean;
    tags: string[];
    body: BodyBlock[];
}

export interface Category {
    name: string;
    slug: string;
    art: ArticleArt;
    desc: string;
}

export const CATEGORIES: Category[] = [
    {
        name: "Procurement & Governance",
        slug: "procurement-and-governance",
        art: "procurement",
        desc: "Sourcing strategy, supplier management and category best practice.",
    },
    {
        name: "Logistics & Supply Chain",
        slug: "logistics-and-supply-chain",
        art: "logistics",
        desc: "Ports, freight forwarding, warehousing and last-mile distribution.",
    },
    {
        name: "Trade Policy",
        slug: "trade-policy",
        art: "policy",
        desc: "AfCFTA, customs reform and the regulation shaping cross-border trade.",
    },
    {
        // Kept as-is from your file — not part of the original 5-category
        // list confirmed earlier in the project. Flagging again in case this
        // was meant to be merged into "Logistics & Supply Chain" rather than
        // exist as a separate category; both currently use the same art asset.
        name: "Transportation & Warehousing",
        slug: "transportation-and-warehousing",
        art: "logistics",
        desc: "Transportation solutions and warehouse management across the continent.",
    },
    {
        name: "Events",
        slug: "events",
        art: "awards",
        desc: "Conferences, awards and networking opportunities for procurement and supply chain professionals.",
    },
    {
        name: "Features & Interviews",
        slug: "features-and-interviews",
        art: "leadership",
        desc: "In-depth interviews and feature stories with procurement and supply chain leaders across Africa.",
    },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

export function formatDate(iso: string): string {
    const d = new Date(iso + "T00:00:00Z");
    return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    });
}

export function initials(name: string): string {
    return name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

export function getArtUrl(art: string): string {
    if (!art) return "/images/procurement.svg";
    if (art.startsWith("/") || art.startsWith("http://") || art.startsWith("https://")) {
        return art;
    }
    return `/images/${art}.svg`;
}

export function slugifyCategory(name: string): string {
    return name
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export function getCategoryBySlug(slug: string): Category | undefined {
    return CATEGORIES.find((c) => c.slug === slug);
}

// ─── Site Metadata ──────────────────────────────────────────────────────────

export const SITE = {
    name: "Africa Procurement and Supply Chain Mag",
    shortName: "APSC Mag",
    description:
        "The continent's trade press for procurement, logistics and supply chain leaders — covering policy, technology, awards and the people shaping how Africa moves goods and does business.",
    // Every real request logged this session — Vercel deploys, article/category
    // URLs, robots.txt, sitemap — used the bare domain, not "www.". If
    // www.pscmag.net doesn't actually have DNS/redirect configured, keeping
    // "www." here would silently break every canonical/OG/sitemap URL.
    // Confirm which is correct; defaulting to the verified-working form.
    url: "https://pscmag.net",
    baseKeywords: [
        "Africa procurement",
        "supply chain Africa",
        "AfCFTA",
        "African logistics",
        "African trade policy",
        "procurement awards Africa",
        "procurement and supply chain",
        "procurement and supply chain magazine",
        "APPON",
        "Africa Procurement and Supply Chain Magazine",
        "Africa trade policy update",
        "Procurement leaders",
        "procurement and supply chain magazine, Africa",
        "African ports",
        "supply chain magazine",

        "AfCFTA trade rules",
        "intra-African trade barriers",
        "AfCFTA rules of origin",
        "regional value chains Africa",
        "African Continental Free Trade Area updates",
        "Pan-African payment settlement system PAPSS",
        "cross-border trade Africa",
        "non-tariff barriers Africa",

        "East Africa logistics corridors",
        "West African port congestion",
        "SADC trade agreements",
        "ECOWAS procurement guidelines",
        "North Africa supply chain",
        "maritime shipping Africa",
        "African air cargo logistics",
        "special economic zones Africa SEZ",

        "public procurement reform Africa",
        "sustainable sourcing Africa",
        "green supply chain Africa",
        "African supplier diversity",
        "ESG in African procurement",
        "local content policy Africa",

        "e-procurement software Africa",
        "supply chain digitization Africa",
        "fintech in African logistics",
        "last mile delivery Africa",
        "freight tech startups Africa",
        "procure to pay Africa P2P",

        "CIPS Africa",
        "African supply chain association",
        "procurement summits Africa",
        "supply chain jobs Lagos Nairobi Johannesburg",
        "chief procurement officer Africa CPO",
        "African logistics professional certification",
        "procurement excellence awards Africa",
    ],
    // Not a valid handle — set your real Twitter/X handle (e.g. "@apscmag")
    // or omit twitter.site/twitter.creator in lib/seo.ts entirely until you
    // have one, since an invalid handle can cause card validation to fail.
    twitter: "@",
    locale: "en_US",
};