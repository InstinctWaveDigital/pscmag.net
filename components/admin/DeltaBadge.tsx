export default function DeltaBadge({
  pct,
  label = "vs previous period",
}: {
  pct: number | null; // null = no baseline to compare against (e.g. brand new)
  label?: string;
}) {
  if (pct === null) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-white/8 px-2 py-0.5 font-mono text-[0.62rem] text-[#4B5563]">
        New
      </span>
    );
  }

  const isUp = pct > 0;
  const isFlat = pct === 0;
  const color = isFlat
    ? "text-[#6B7280] border-white/8 bg-white/5"
    : isUp
    ? "text-green-400 border-green-500/20 bg-green-500/10"
    : "text-red-400 border-red-500/20 bg-red-500/10";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[0.62rem] font-semibold ${color}`}
      title={label}
    >
      {!isFlat && (
        <svg
          viewBox="0 0 24 24"
          width="10"
          height="10"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isUp ? "" : "rotate-180"}
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      )}
      {isFlat ? "0%" : `${Math.abs(pct)}%`}
    </span>
  );
}
