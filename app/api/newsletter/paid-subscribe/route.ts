import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { reference, email } = await request.json();

    if (!reference || !email) {
      return NextResponse.json({ error: "Missing reference or email" }, { status: 400 });
    }

    // Verify the transaction directly with Paystack — never trust the client's success callback alone
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || verifyData.data?.status !== "success") {
      return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
    }

    const amountKobo = verifyData.data.amount;
    const paidEmail = verifyData.data.customer?.email || email;

    await query(
      `INSERT INTO newsletter_paid_subscribers (email, paystack_reference, amount_kobo, status)
       VALUES ($1, $2, $3, 'active')
       ON CONFLICT (paystack_reference) DO NOTHING`,
      [paidEmail, reference, amountKobo]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Newsletter paid-subscribe error:", err);
    return NextResponse.json({ error: "Subscription failed." }, { status: 500 });
  }
}