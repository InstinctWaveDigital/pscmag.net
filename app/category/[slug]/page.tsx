import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ArticleCard from "@/components/ArticleCard";
import { CATEGORIES, ARTICLES, getCategoryBySlug } from "@/lib/data";

const PAGE_SIZE = 6;

export const unstable_instant = {
  prefetch: "runtime",
  samples: [
    {
      params: { slug: "procurement" },
      searchParams: { page: "1" },
    },
  ],
};

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.desc,
    alternates: { canonical: `/category/${category.slug}` },
  };
}

export default function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <Suspense fallback={
      <div className="container-x py-24 text-center text-ink-300 font-mono text-sm">
        Loading section...
      </div>
    }>
      <CategoryContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function CategoryContent({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const items = ARTICLES.filter((a) => a.category === category.name);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  let page = parseInt(resolvedSearchParams.page || "1", 10);
  if (isNaN(page) || page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function pageHref(p: number) {
    return p > 1 ? `/category/${category!.slug}?page=${p}` : `/category/${category!.slug}`;
  }

  return (
    <>
      <div className="border-b border-line-200 bg-white py-10">
        <div className="container-x">
          <nav className="mb-3 flex flex-wrap gap-2 font-mono text-xs text-ink-300" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-blue-700 hover:underline">
              Home
            </Link>
            <span>/</span>
            <span aria-current="page">{category.name}</span>
          </nav>
          <h1 className="text-4xl font-bold sm:text-5xl">{category.name}</h1>
          <p className="mt-3 max-w-[65ch] text-lg text-ink-500">{category.desc}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className="cat-pill">
              All Sections
            </Link>
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className={`cat-pill ${c.slug === category!.slug ? "active" : ""}`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="container-x py-10">
        <p className="mb-5 font-mono text-sm text-ink-500">
          {items.length} {items.length === 1 ? "story" : "stories"}
        </p>

        {pageItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-ink-500">
            <h3 className="mb-2 font-display text-xl font-bold text-ink-900">
              No stories in this section yet
            </h3>
            <p>Check back soon, or explore another section above.</p>
          </div>
        )}

        {totalPages > 1 && (
          <nav className="mt-10 flex flex-wrap justify-center gap-2" aria-label="Pagination">
            {page > 1 ? (
              <Link href={pageHref(page - 1)} className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border-[1.5px] border-line-300 px-3 font-semibold hover:border-blue-700 hover:text-blue-700">
                &larr; Prev
              </Link>
            ) : (
              <span className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border-[1.5px] border-line-300 px-3 font-semibold opacity-40">
                &larr; Prev
              </span>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) =>
              p === page ? (
                <span key={p} className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border-[1.5px] border-ink-900 bg-ink-900 px-3 font-semibold text-white" aria-current="page">
                  {p}
                </span>
              ) : (
                <Link key={p} href={pageHref(p)} className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border-[1.5px] border-line-300 px-3 font-semibold hover:border-blue-700 hover:text-blue-700">
                  {p}
                </Link>
              )
            )}
            {page < totalPages ? (
              <Link href={pageHref(page + 1)} className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border-[1.5px] border-line-300 px-3 font-semibold hover:border-blue-700 hover:text-blue-700">
                Next &rarr;
              </Link>
            ) : (
              <span className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border-[1.5px] border-line-300 px-3 font-semibold opacity-40">
                Next &rarr;
              </span>
            )}
          </nav>
        )}
      </div>
    </>
  );
}
