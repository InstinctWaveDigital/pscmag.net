"use client";

import { useState, FormEvent } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterForm({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Something went wrong.");
      setStatus("success");
      setMessage(`You're subscribed — check ${trimmed} for a confirmation email.`);
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  }

  return (
    <div className={compact ? "flex flex-col gap-3" : ""}>
      <form
        onSubmit={handleSubmit}
        className={compact ? "flex flex-col gap-3" : "flex flex-wrap gap-3"}
        noValidate
      >
        <label htmlFor={compact ? "side-email" : "newsletter-email"} className="sr-only">
          Email address
        </label>
        <input
          id={compact ? "side-email" : "newsletter-email"}
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          autoComplete="email"
          required
          className={`min-h-[44px] rounded-lg border-[1.5px] border-transparent px-4 py-3 text-base focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-white ${
            compact ? "w-full" : "min-w-[200px] flex-1"
          }`}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={`btn btn-primary ${compact ? "btn-block" : ""}`}
        >
          {status === "loading" ? "Subscribing…" : "Subscribe"}
        </button>
      </form>
      <p
        role="status"
        aria-live="polite"
        className={`mt-3 min-h-[1.4em] text-sm font-semibold ${
          status === "success"
            ? "text-[#B9F5C6]"
            : status === "error"
            ? "text-[#FFC7C0]"
            : ""
        }`}
      >
        {message}
      </p>
    </div>
  );
}