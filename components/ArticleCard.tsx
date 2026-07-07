import Link from "next/link";
import Image from "next/image";
import { Article, formatDate, getArtUrl } from "@/lib/data";

export default function ArticleCard({
  article,
  variant = "default",
  hideExcerpt = false,
}: {
  article: Article;
  variant?: "default" | "row" | "feature";
  hideExcerpt?: boolean;
}) {
  const rowClass = variant === "row" ? " card--row" : "";
  const featureClass = variant === "feature" ? " card--feature" : "";

  return (
    <article className={`card${rowClass}${featureClass}`}>
      <Link
        href={`/article/${article.id}`}
        className="card__art"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image
          src={getArtUrl(article.art)}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="manifest self-start">
          {article.dateline} &middot; {article.category}
        </span>
        <h3 className="font-display text-lg font-bold leading-snug">
          <Link href={`/article/${article.id}`} className="story-link">
            <span className="absolute inset-0" aria-hidden="true" />
            {article.title}
          </Link>
        </h3>
        {!hideExcerpt && (
          <p className="line-clamp-2 text-sm text-ink-500">
            {article.excerpt}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-3 font-mono text-[0.72rem] text-ink-300">
          <span>{article.author}</span>
          <span>&middot;</span>
          <span>{formatDate(article.date)}</span>
          <span>&middot;</span>
          <span>{article.readTime}</span>
        </div>
      </div>
    </article>
  );
}