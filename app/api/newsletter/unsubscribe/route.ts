import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/newsletter/unsubscribe
 * Body: { email: string }
 *
 * Marks a subscriber as inactive (soft unsubscribe). The record is kept
 * so the subscriber can re-subscribe later and so the admin panel can
 * show a history of opt-outs.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const subscriber = await prisma.subscriber.findUnique({ where: { email } });

    if (!subscriber) {
      // Don't reveal whether the email exists — just acknowledge
      return NextResponse.json({
        ok: true,
        message: "If that email was subscribed, it has been removed.",
      });
    }

    await prisma.subscriber.update({
      where: { email },
      data: { active: false },
    });

    return NextResponse.json({
      ok: true,
      message: "You have been unsubscribed successfully.",
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
