import Image from "next/image";
import { BodyBlock } from "@/lib/data";
import type { ReactNode } from "react";

// Parses **bold**, *italic*, __underline__, [label](url) into React nodes.
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
            className="text-blue-700 underline decoration-1 underline-offset-2 hover:text-blue-900"
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

// True if the raw (unparsed) text begins with a formatting marker rather
// than a plain character — e.g. "**Kenya..." or "[link](url) rest...".
// A drop cap on a marker character (an asterisk, a bracket) looks broken,
// so those cases fall back to normal-size lead styling instead.
function startsWithMarker(text: string): boolean {
  return /^(\*\*|\*|__|\[)/.test(text);
}

function LeadParagraph({ text }: { text: string }) {
  if (!text || startsWithMarker(text)) {
    return (
      <p className="font-serif text-xl font-semibold leading-relaxed text-ink-900">
        {parseInline(text)}
      </p>
    );
  }

  const firstChar = text[0];
  const rest = text.slice(1);

  return (
    <p className="font-serif text-xl font-semibold leading-relaxed text-ink-900">
      <span
        aria-hidden="true"
        className="float-left mr-2.5 font-display text-[3.4rem] font-black leading-[0.8] text-red-600"
        style={{ marginTop: "0.1em" }}
      >
        {firstChar}
      </span>
      {parseInline(rest)}
    </p>
  );
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
            <figure key={idx} className="my-3">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-line-200 bg-blue-50 shadow-sm">
                <Image
                  src={block.url}
                  alt={block.caption || ""}
                  fill
                  sizes={variant === "article" ? "(max-width: 1024px) 100vw, 960px" : "100vw"}
                  className="object-cover"
                />
              </div>
              {block.caption && (
                <figcaption className="mt-2.5 border-l-2 border-red-600 pl-3 font-mono text-xs italic text-ink-300">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          );
        }

        if (block.type === "video") {
          return (
            <figure key={idx} className="my-3">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-line-200 bg-ink-900 shadow-sm">
                <iframe
                  src={`https://www.youtube.com/embed/${block.youtubeId}`}
                  title={block.caption || "Embedded video"}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              {block.caption && (
                <figcaption className="mt-2.5 border-l-2 border-red-600 pl-3 font-mono text-xs italic text-ink-300">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          );
        }

        const isFirstParagraph = paragraphCount === 0;
        paragraphCount++;

        if (variant === "article" && isFirstParagraph) {
          return <LeadParagraph key={idx} text={block.text} />;
        }

        return (
          <p
            key={idx}
            className={
              variant === "article"
                ? "font-serif text-lg leading-[1.8] text-ink-700"
                : "leading-relaxed"
            }
          >
            {parseInline(block.text)}
          </p>
        );
      })}
    </>
  );
}