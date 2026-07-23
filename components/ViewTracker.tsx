"use client";

import { useEffect } from "react";

/**
 * Drop this into the article page (client-side, e.g. near the bottom of the
 * article body) to log a view. Uses `navigator.sendBeacon` where available
 * so it never delays or blocks navigation/render; falls back to a
 * fire-and-forget `fetch` with `keepalive`.
 *
 * Usage in your article page:
 *   <ViewTracker articleId={article.id} />
 *
 * This does NOT block rendering and does NOT throw — a failed beacon is
 * simply a missed view, never a broken page.
 *
 * If you'd rather track purely server-side with zero client JS, use
 * `after()` from "next/server" directly in the page's server component
 * instead of rendering this component:
 *
 *   import { after } from "next/server";
 *   import { headers } from "next/headers";
 *   import { prisma } from "@/lib/db";
 *   import { parseReferrerSource } from "@/lib/referrer";
 *
 *   // inside the async page component, after you have `article`:
 *   after(async () => {
 *     const h = headers();
 *     const referrerSource = parseReferrerSource(h.get("referer"), h.get("host") ?? "");
 *     await prisma.pageView.create({
 *       data: { articleId: article.id, sessionId: "server", referrerSource },
 *     });
 *     // NOTE: server-side tracking alone can't generate a per-browser
 *     // sessionId, so unique-session counts will be less meaningful unless
 *     // you also read/set a first-party cookie for this. The client
 *     // component below gives you real per-browser session dedup with
 *     // no PII (a random id kept in sessionStorage, nothing sent to a
 *     // third party, no cookies).
 *   });
 */
export default function ViewTracker({ articleId }: { articleId: string }) {
  useEffect(() => {
    if (!articleId) return;

    let sessionId: string;
    try {
      sessionId = sessionStorage.getItem("apsc_sid") ?? crypto.randomUUID();
      sessionStorage.setItem("apsc_sid", sessionId);
    } catch {
      // sessionStorage unavailable (privacy mode, etc.) — track without dedup.
      sessionId = crypto.randomUUID();
    }

    const payload = JSON.stringify({ articleId, sessionId });

    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/track-view", blob);
        return;
      }
    } catch {
      // fall through to fetch
    }

    fetch("/api/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Analytics miss — never surface this to the reader.
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  return null;
}
