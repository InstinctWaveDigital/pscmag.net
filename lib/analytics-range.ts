export type AnalyticsRange = "7d" | "30d" | "12mo";

export function parseRange(value: string | null): AnalyticsRange {
  if (value === "30d" || value === "12mo") return value;
  return "7d"; // default
}

/** Returns [start, end) for the requested range, plus the equal-length
 * immediately-preceding period for % change comparisons. */
export function rangeToDates(range: AnalyticsRange) {
  const end = new Date();
  const start = new Date(end);

  if (range === "7d") start.setDate(start.getDate() - 7);
  else if (range === "30d") start.setDate(start.getDate() - 30);
  else start.setMonth(start.getMonth() - 12);

  const spanMs = end.getTime() - start.getTime();
  const prevEnd = new Date(start);
  const prevStart = new Date(start.getTime() - spanMs);

  return { start, end, prevStart, prevEnd };
}
