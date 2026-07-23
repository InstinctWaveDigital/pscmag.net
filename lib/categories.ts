// Single source of truth for the category taxonomy.
// Import this everywhere a category needs to be displayed, filtered, or
// grouped by — do not hardcode category strings elsewhere. This mirrors
// the taxonomy already live on the public site; if that list ever changes,
// update it here only.
//
// NOTE: `Article.category` in the DB is still a free-text column (no FK/enum
// at the DB level). CATEGORY_VALUES below is exported so validation code
// (e.g. the editor form, or the analytics `by-category` route) can check a
// given article's category string against this list rather than trusting it
// blindly — this is what prevents the import-script/renderer string-mismatch
// class of bug from recurring for the analytics feature specifically.

export interface Category {
  name: string; // exact string stored in articles.category
  slug: string;
}

export const CATEGORIES: Category[] = [
  { name: "Procurement", slug: "procurement" },
  { name: "Logistics & Freight", slug: "logistics-and-freight" },
  { name: "Trade Policy", slug: "trade-policy" },
  { name: "Awards & Events", slug: "awards-and-events" },
  { name: "Technology & Digital Supply Chain", slug: "technology-and-digital-supply-chain" },
  { name: "Leadership & People", slug: "leadership-and-people" },
];

export const CATEGORY_VALUES: string[] = CATEGORIES.map((c) => c.name);

export function isKnownCategory(value: string): boolean {
  return CATEGORY_VALUES.includes(value);
}

export function categoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
