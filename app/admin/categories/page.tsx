import Link from "next/link";
import Image from "next/image";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CATEGORIES } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/admin/login");
  }

  // Fetch count stats per category
  const res = await query(
    "SELECT category, status, COUNT(*) as count FROM articles GROUP BY category, status"
  );
  
  // Aggregate stats
  const categoryCounts: Record<string, { total: number; published: number }> = {};
  
  // Initialize with 0 for all existing categories
  CATEGORIES.forEach((c) => {
    categoryCounts[c.name] = { total: 0, published: 0 };
  });

  res.rows.forEach((row) => {
    const cat = row.category;
    const status = row.status;
    const count = parseInt(row.count, 10);
    
    if (!categoryCounts[cat]) {
      categoryCounts[cat] = { total: 0, published: 0 };
    }
    
    categoryCounts[cat].total += count;
    if (status === "published") {
      categoryCounts[cat].published += count;
    }
  });

  return (
    <div className="p-6 xl:p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Categories</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          {CATEGORIES.length} editorial sections — managed in{" "}
          <code className="rounded bg-white/8 px-1.5 py-0.5 font-mono text-[0.7rem] text-[#9296A6]">lib/data.ts</code>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c) => {
          const stats = categoryCounts[c.name] || { total: 0, published: 0 };
          return (
            <div
              key={c.slug}
              className="flex flex-col overflow-hidden rounded-xl border border-white/8 bg-[#111827] transition hover:border-white/15"
            >
              <div className="relative aspect-[16/6] bg-[#0C1F8F]">
                <Image
                  src={`/images/${c.art}.svg`}
                  alt=""
                  fill
                  className="object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/80 to-transparent" />
              </div>
              <div className="flex flex-col gap-2 p-4">
                <h2 className="font-display text-base font-bold text-white">{c.name}</h2>
                <p className="text-xs text-[#6B7280]">{c.desc}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-3 font-mono text-[0.65rem] text-[#4B5563]">
                    <span>{stats.total} total</span>
                    <span className="text-green-400">{stats.published} live</span>
                  </div>
                  <Link
                    href={`/admin/articles?category=${encodeURIComponent(c.name)}`}
                    className="rounded border border-white/8 px-2.5 py-1 font-mono text-[0.65rem] text-[#6B7280] transition hover:border-white/20 hover:text-white"
                  >
                    View articles →
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
