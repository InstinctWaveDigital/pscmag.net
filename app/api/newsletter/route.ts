import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    await prisma.subscriber.upsert({
      where: { email },
      update: { active: true }, // re-subscribe if they had unsubscribed
      create: { email, active: true },
    });

    return NextResponse.json({ ok: true, message: "Subscribed successfully." });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}