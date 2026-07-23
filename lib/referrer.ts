const SEARCH_ENGINES = [
  "google.",
  "bing.",
  "duckduckgo.",
  "yahoo.",
  "baidu.",
  "yandex.",
  "ecosia.",
];

const SOCIAL_DOMAINS = [
  "facebook.com",
  "twitter.com",
  "x.com",
  "t.co",
  "linkedin.com",
  "instagram.com",
  "threads.net",
  "reddit.com",
  "tiktok.com",
  "wa.me",
  "whatsapp.com",
  "telegram.org",
  "t.me",
];

export type ReferrerSource = "direct" | "search" | "social" | "referral" | "other";

/**
 * Buckets an incoming `Referer` header into one of the fixed source types.
 * - No referrer at all -> "direct"
 * - Referrer host === current site host -> "direct" (in-site navigation)
 * - Known search engine domain -> "search"
 * - Known social domain -> "social"
 * - Any other external host -> "referral"
 * - Unparseable value -> "other"
 */
export function parseReferrerSource(
  referer: string | null | undefined,
  siteHost: string
): ReferrerSource {
  if (!referer) return "direct";

  let refHost: string;
  try {
    refHost = new URL(referer).hostname.replace(/^www\./, "");
  } catch {
    return "other";
  }

  const normalizedSiteHost = siteHost.replace(/^www\./, "");
  if (refHost === normalizedSiteHost) return "direct";

  if (SEARCH_ENGINES.some((s) => refHost.includes(s))) return "search";
  if (SOCIAL_DOMAINS.some((s) => refHost === s || refHost.endsWith(`.${s}`))) {
    return "social";
  }

  return "referral";
}
