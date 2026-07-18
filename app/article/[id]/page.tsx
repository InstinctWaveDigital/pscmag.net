import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ShareRow from "@/components/ShareRow";
import ArticleCard from "@/components/ArticleCard";
import NewsletterSection from "@/components/NewsletterSection";
import { getArticleById, getRelated, getAllArticles } from "@/lib/db-queries";
import { formatDate, initials, slugifyCategory, getArtUrl } from "@/lib/data";
import ViewTracker from "@/components/ViewTracker";

// Fallback configuration to dynamically render missing slugs at runtime if database was offline during build
export const dynamicParams = true;
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  try {
    const articles = await getAllArticles();
    return articles.map((a) => ({ id: a.id }));
  } catch (error) {
    console.warn("⚠️ Database unreachable during build stage. Skipping static parameter generation.");
    return []; // Returns an empty list so local compilation finishes without throwing ECONNREFUSED
  }
}

import { buildMetadata } from "@/lib/seo";
import { BodyBlockRenderer } from "@/components/RichText";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) return {};

  return buildMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/article/${article.id}`,
    keywords: [...article.tags, article.category, article.dateline],
    type: "article",
    publishedTime: article.date,
    authors: [article.author],
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let article;
  try {
    article = await getArticleById(id);
  } catch (error) {
    console.error("Database connection failed while fetching article data:", error);
    notFound(); // Triggers global 404 handler gracefully if database falls over
  }

  if (!article) notFound();

  // Fetch contextual dependencies safely
  let related: any[] = []; // Explicitly typed to resolve implicit type tracking error
  try {
    related = await getRelated(article, 3);
  } catch (e) {
    console.warn("Could not retrieve related stories context:", e);
  }

  const categorySlug = slugifyCategory(article.category);

  return (
    <>
      {/* Article Header & Hero area */}
      <article className="bg-white pb-16 pt-8">
        <div className="container-x max-w-[960px]">
          {/* Breadcrumbs */}
          <nav className="mb-6 flex flex-wrap gap-2 font-mono text-xs text-ink-300" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-blue-700 hover:underline">
              Home
            </Link>
            <span>/</span>
            <Link href={`/category/${categorySlug}`} className="hover:text-blue-700 hover:underline">
              {article.category}
            </Link>
            <span>/</span>
            <span aria-current="page" className="line-clamp-1 max-w-[30ch]">
              {article.title}
            </span>
          </nav>

          <ViewTracker articleId={article.id} />

          <header className="flex flex-col gap-4">
            <span className="manifest self-start">
              {article.dateline} &middot; {article.category}
            </span>
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl text-ink-900">
              {article.title}
            </h1>
            <p className="text-xl text-ink-500 leading-relaxed font-medium">
              {article.excerpt}
            </p>

            {/* Author meta row */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-y border-line-200 py-4 mt-2">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-700 font-display text-sm font-black text-white">
                  {initials(article.author)}
                </div>
                <div>
                  <div className="text-sm font-bold text-ink-900">{article.author}</div>
                  <div className="font-mono text-xs text-ink-300">{article.role}</div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 text-right font-mono text-xs text-ink-300">
                <div>Published {formatDate(article.date)}</div>
                <div>{article.readTime}</div>
              </div>
            </div>
          </header>
        </div>

        {/* Feature Image Illustration */}
        <div className="container-x max-w-[1024px] mt-8">
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl bg-blue-50 border border-line-200">
            <Image
              src={getArtUrl(article.art)}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover opacity-90 transition-transform duration-300 hover:scale-[1.01]"
            />
          </div>
        </div>

        {/* Article Body Content */}
        <div className="container-x max-w-[960px] mt-10">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_240px]">
            {/* Left Main column */}
            <div className="flex max-w-[68ch] flex-col gap-6">
              <BodyBlockRenderer blocks={article.body} variant="article" />

              {/* Sourced tags */}
              <div className="mt-4 flex flex-wrap gap-2 border-t-2 border-ink-900 pt-6">
                {article.tags.map((tag: string) => (
                  <span key={tag} className="tag-pill">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Right Sidebar */}
            <div className="flex flex-col gap-6 lg:border-l lg:border-line-200 lg:pl-6">
              <div>
                <h3 className="font-mono text-xs uppercase tracking-wider text-red-600 mb-3">
                  Share Article
                </h3>
                <ShareRow />
              </div>

              <div className="sidebar-box mt-4">
                <h4 className="font-display font-bold text-sm text-ink-900 mb-2">
                  APSC Mag Coverage
                </h4>
                <p className="text-xs text-ink-500 leading-normal">
                  Independent trade reporting from our bureaus in Lagos, Nairobi, Accra, and Abuja.
                </p>
              </div>

              <div className="sidebar-box">
                <h4 className="font-display font-bold text-sm text-ink-900 mb-2">
                  Submit a tip
                </h4>
                <p className="text-xs text-ink-500 leading-normal mb-3">
                  Got a lead or trade document to share? Contact our editors securely.
                </p>
                <Link href="/contact#tips" className="text-xs font-bold text-blue-700 hover:underline">
                  Submit story tip &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>


      </article>

      {/* Related Stories */}
      {related.length > 0 && (
        <section className="bg-paper-50 border-t border-line-200 py-16">
          <div className="container-x">
            <div className="section-head">
              <div>
                <span className="eyebrow">Read Next</span>
                <h2 className="text-2xl">Related Stories</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item: any) => (
                <ArticleCard key={item.id} article={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <NewsletterSection />
    </>
  );
}