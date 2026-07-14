"use client";

import { useEffect, useState, useCallback } from "react";

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: Record<string, any>) => { openIframe: () => void };
    };
  }
}

const SHOW_DELAY_MS = 6000;
const DISMISS_KEY = "newsletter_popup_dismissed";
const SUBSCRIBED_KEY = "newsletter_popup_subscribed";
const AMOUNT_NGN = 3 * 1650; // adjust conversion or hardcode kobo directly — see note below

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Never show again in this browser once subscribed (persists across sessions)
    if (localStorage.getItem(SUBSCRIBED_KEY)) return;

    // Dismissed this session only — reappears next session, per sessionStorage's natural lifetime
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
  }, []);

  function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !email.includes("@")) {
      setErrorMessage("Enter a valid email address.");
      return;
    }

    if (!window.PaystackPop) {
      setErrorMessage("Payment system is still loading — try again in a moment.");
      return;
    }

    setState("processing");

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email,
      amount: AMOUNT_NGN * 100, // Paystack expects kobo (amount x 100)
      currency: "NGN",
      ref: `apscmag_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
      callback: (response: { reference: string }) => {
        fetch("/api/newsletter/paid-subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: response.reference, email }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setState("success");
              localStorage.setItem(SUBSCRIBED_KEY, "1");
              setTimeout(() => setVisible(false), 2500);
            } else {
              setState("error");
              setErrorMessage(data.error || "Could not confirm payment.");
            }
          })
          .catch(() => {
            setState("error");
            setErrorMessage("Could not confirm payment.");
          });
      },
      onClose: () => {
        if (state === "processing") setState("idle");
      },
    });

    handler.openIframe();
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-ink-900/60 p-4 sm:items-center">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-lg2 sm:p-8">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-ink-300 hover:bg-paper-100 hover:text-ink-900"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {state === "success" ? (
          <div className="py-6 text-center">
            <h3 className="font-display text-xl font-bold text-ink-900">You're in.</h3>
            <p className="mt-2 text-sm text-ink-500">
              The Monday Manifest lands in your inbox starting next week.
            </p>
          </div>
        ) : (
          <>
            <span className="manifest w-fit">Limited Offer</span>
            <h3 className="mt-3 font-display text-2xl font-bold text-ink-900">
              The Monday Manifest — for $3
            </h3>
            <p className="mt-2 text-sm text-ink-500">
              One-time token subscription. Every Monday: the week's must-read
              procurement, logistics and trade policy stories, plus early
              access to awards shortlists.
            </p>

            <form onSubmit={handlePay} className="mt-5 flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="rounded-lg border border-line-300 px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none"
              />

              {errorMessage && (
                <p className="text-xs text-red-600">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={state === "processing"}
                className="btn btn-primary w-full disabled:opacity-60"
              >
                {state === "processing" ? "Processing..." : "Subscribe for $3"}
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="text-xs text-ink-300 hover:text-ink-500 hover:underline"
              >
                Maybe later
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}