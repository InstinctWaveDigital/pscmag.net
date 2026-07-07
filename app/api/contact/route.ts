import { NextRequest, NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!name || !EMAIL_RE.test(email) || !message) {
      return NextResponse.json(
        { error: "Please fill in your name, a valid email, and a message." },
        { status: 400 }
      );
    }

    // Replace with a real transactional email/CRM integration in production
    // (e.g. Resend, Postmark, HubSpot). Logged here for demo purposes only.
    console.log("New contact message:", { name, email, subject, message });

    return NextResponse.json({ ok: true, message: "Message received." });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}