import Link from "next/link";
import { Article } from "@/lib/data";

export default function Ticker({ items }: { items: Article[] }) {
  return (
    <div className="overflow-hidden bg-red-600 text-white" aria-label="Breaking headlines ticker">
      <div className="container-x flex h-11 items-center gap-4">
        <span className="flex-none rounded-[2px] bg-ink-900 px-2.5 py-1 font-mono text-[0.72rem] font-bold tracking-wider">
          Latest
        </span>
        <div className="group overflow-hidden whitespace-nowrap">
          <div className="flex w-max animate-ticker gap-12 group-hover:[animation-play-state:paused]">
            {items.map((a) => (
              <Link key={a.id} href={`/article/${a.id}`} className="text-sm font-medium hover:underline">
                {a.title}
              </Link>
            ))}
            {items.map((a) => (
              <Link
                key={a.id + "-dup"}
                href={`/article/${a.id}`}
                tabIndex={-1}
                aria-hidden="true"
                className="text-sm font-medium hover:underline"
              >
                {a.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}