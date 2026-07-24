"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type Range = "7d" | "30d" | "12mo";

const RANGE_LABEL: Record<Range, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "12mo": "Last 12 months",
};

interface CategoryRow {
  category: string;
  views: number;
}

// Keep category short-labels here for chart tick display only — the
// canonical names still come from the API (which itself derives them from
// lib/categories.ts), this is purely cosmetic truncation for narrow bars.
function shortLabel(name: string) {
  return name.length > 18 ? name.slice(0, 16) + "…" : name;
}

export default function AnalyticsPanel() {
  const [range, setRange] = useState<Range>("7d");
  const [data, setData] = useState<CategoryRow[] | null>(null);
  const [totalViews, setTotalViews] = useState<number | null>(null);
  const [changePct, setChangePct] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    Promise.all([
      fetch(`/api/admin/analytics/by-category?range=${range}`).then((r) => {
        if (!r.ok) throw new Error("by-category failed");
        return r.json();
      }),
      fetch(`/api/admin/analytics/overview?range=${range}`).then((r) => {
        if (!r.ok) throw new Error("overview failed");
        return r.json();
      }),
    ])
      .then(([byCategory, overview]) => {
        if (cancelled) return;
        setData(byCategory.categories);
        setTotalViews(overview.totalViews);
        setChangePct(overview.changePct);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [range]);

  return (
    <div className="col-span-2 rounded-xl border border-white/8 bg-[#111827] p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Reader Engagement</h2>
          <p className="mt-0.5 font-mono text-[0.68rem] text-[#4B5563]">
            Views by category
            {totalViews !== null && (
              <>
                {" "}
                &middot; {totalViews.toLocaleString()} total
                {changePct !== null && (
                  <span className={changePct >= 0 ? "text-green-400" : "text-red-400"}>
                    {" "}
                    ({changePct >= 0 ? "+" : ""}
                    {changePct}%)
                  </span>
                )}
              </>
            )}
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-white/8 p-1">
          {(["7d", "30d", "12mo"] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-md px-2.5 py-1 font-mono text-[0.65rem] transition ${
                range === r
                  ? "bg-[#E2231A] text-white"
                  : "text-[#6B7280] hover:text-white"
              }`}
            >
              {RANGE_LABEL[r]}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex h-64 items-center justify-center font-mono text-xs text-[#4B5563]">
          Loading…
        </div>
      )}

      {!loading && error && (
        <div className="flex h-64 items-center justify-center font-mono text-xs text-red-400">
          Couldn&apos;t load analytics. Try again shortly.
        </div>
      )}

      {!loading && !error && data && (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="category"
              tickFormatter={shortLabel}
              tick={{ fill: "#4B5563", fontSize: 10, fontFamily: "monospace" }}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              tickLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tick={{ fill: "#4B5563", fontSize: 10, fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{
                background: "#0B0E1A",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#fff", fontWeight: 600 }}
              itemStyle={{ color: "#E2231A" }}
              formatter={(value) => [typeof value === "number" ? value.toLocaleString() : value, "Views"]}
            />
            <Bar dataKey="views" fill="#E2231A" radius={[4, 4, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
