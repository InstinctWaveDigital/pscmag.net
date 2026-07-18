import Image from "next/image";
import { BodyBlock, getArtUrl } from "@/lib/data";
import type { ReactNode } from "react";

// Parses **bold**, *italic*, __underline__, [label](url) into React nodes.
// Deliberately not full markdown — just the 4 formats the toolbar produces.
export function parseInline(text: string): ReactNode[] {
  const tokens: ReactNode[] = [];
  const pattern = /(\*\*.+?\*\*|\*.+?\*|__.+?__|\[.+?\]\(.+?\))/g;
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];

    if (token.startsWith("**")) {
      tokens.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("__")) {
      tokens.push(<u key={key++}>{token.slice(2, -2)}</u>);
    } else if (token.startsWith("*")) {
      tokens.push(<em key={key++}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith("[")) {
      const linkMatch = token.match(/^\[(.+?)\]\((.+?)\)$/);
      if (linkMatch) {
        tokens.push(
          <a
            key={key++}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 underline hover:text-blue-900"
          >
            {linkMatch[1]}
          </a>
        );
      } else {
        tokens.push(token);
      }
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex));
  }

  return tokens;
}

export function BodyBlockRenderer({
  blocks,
  variant = "article",
}: {
  blocks: BodyBlock[];
  variant?: "article" | "preview";
}) {
  let paragraphCount = 0;

  return (
    <>
      {blocks.map((block, idx) => {
        if (block.type === "image") {
          return (
            <figure key={idx} className="my-2">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-blue-50 border border-line-200">
                <Image
                  src={block.url}
                  alt={block.caption || ""}
                  fill
                  sizes={variant === "article" ? "(max-width: 1024px) 100vw, 960px" : "100vw"}
                  className="object-cover"
                />
              </div>
              {block.caption && (
                <figcaption className="mt-2 text-center font-mono text-xs text-ink-300">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          );
        }

        if (block.type === "video") {
          return (
            <figure key={idx} className="my-2">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${block.youtubeId}`}
                  title={block.caption || "Embedded video"}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              {block.caption && (
                <figcaption className="mt-2 text-center font-mono text-xs text-ink-300">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          );
        }

        const isFirstParagraph = paragraphCount === 0;
        paragraphCount++;

        return (
          <p
            key={idx}
            className={
              variant === "article" && isFirstParagraph
                ? "font-serif text-xl leading-relaxed text-ink-900 font-semibold"
                : variant === "article"
                ? "font-serif text-lg leading-relaxed text-ink-700"
                : "leading-relaxed"
            }
          >
            {parseInline(block.text || "")}
          </p>
        );
      })}
    </>
  );
}