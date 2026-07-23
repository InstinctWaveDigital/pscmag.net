import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseReferrerSource } from "@/lib/referrer";

// This route is intentionally forgiving: it must never throw in a way that
// could surface an error to a reader, and it must never block the article
// page it's called from. Call it fire-and-forget (see ViewTracker.tsx) or
// via `after()` from the article page's server component.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const articleId = typeof body?.articleId === "string" ? body.articleId : null;
    const sessionId = typeof body?.sessionId === "string" ? body.sessionId : null;

    if (!articleId || !sessionId) {
      // Malformed beacon — fail silently with 204, no need to alarm the client.
      return new NextResponse(null, { status: 204 });
    }

    const host = req.headers.get("host") || "";
    const referer = req.headers.get("referer");
    const referrerSource = parseReferrerSource(referer, host);

    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    // Rough (not exact) dedup: has this session already been logged against
    // this article today? Cheap indexed lookup, fine for a rollup that's
    // explicitly documented as approximate.
    const alreadyViewedToday = await prisma.pageView.findFirst({
      where: { articleId, sessionId, viewedAt: { gte: today, lt: tomorrow } },
      select: { id: true },
    });

    await prisma.$transaction([
      prisma.pageView.create({
        data: { articleId, sessionId, referrerSource },
      }),
      prisma.articleDailyStat.upsert({
        where: { articleId_date: { articleId, date: today } },
        create: { articleId, date: today, viewCount: 1, uniqueSessions: 1 },
        update: {
          viewCount: { increment: 1 },
          ...(alreadyViewedToday ? {} : { uniqueSessions: { increment: 1 } }),
        },
      }),
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    // Swallow errors — analytics must never break the reading experience.
    console.error("track-view error:", err);
    return new NextResponse(null, { status: 204 });
  }
}
