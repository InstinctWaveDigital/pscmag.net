"use client";

import { useEffect, useRef, useState } from "react";

export default function ExportMenu({ range }: { range: "7d" | "30d" | "12mo" }) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState<"pdf" | "csv" | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function download(format: "pdf" | "csv") {
    setDownloading(format);
    setOpen(false);
    try {
      const res = await fetch(`/api/admin/analytics/export?range=${range}&format=${format}`);
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] || `apsc-analytics-${range}.${format}`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Couldn't generate the export. Please try again.");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={downloading !== null}
        className="flex items-center gap-1.5 rounded-lg border border-white/8 px-3 py-1.5 font-mono text-[0.68rem] text-[#6B7280] transition hover:border-white/20 hover:text-white disabled:opacity-50"
      >
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {downloading ? `Generating ${downloading.toUpperCase()}…` : "Download Report"}
        <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-2 w-48 overflow-hidden rounded-lg border border-white/8 bg-[#111827] shadow-lg">
          <button
            type="button"
            onClick={() => download("pdf")}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-white transition hover:bg-white/5"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#E2231A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <div>
              <div className="font-medium">PDF Report</div>
              <div className="font-mono text-[0.62rem] text-[#4B5563]">Branded, print-ready</div>
            </div>
          </button>
          <div className="border-t border-white/8" />
          <button
            type="button"
            onClick={() => download("csv")}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-white transition hover:bg-white/5"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#0C1F8F" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            <div>
              <div className="font-medium">CSV Export</div>
              <div className="font-mono text-[0.62rem] text-[#4B5563]">Raw data for spreadsheets</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
