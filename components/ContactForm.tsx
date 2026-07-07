"use client";

import { useState, FormEvent } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function update(field: string, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, boolean> = {
      name: values.name.trim().length === 0,
      email: !EMAIL_RE.test(values.email.trim()),
      message: values.message.trim().length === 0,
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Something went wrong.");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        tabIndex={-1}
        className="flex items-start gap-3 rounded-lg border border-blue-600 bg-blue-50 p-5 text-blue-700"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-none">
          <circle cx="12" cy="12" r="10" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
        <div>
          <p className="font-semibold">Message sent — thank you.</p>
          <p className="text-sm">Our editorial desk typically responds within two business days.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-5">
      <div className={`field flex flex-col gap-1.5 ${errors.name ? "has-error" : ""}`}>
        <label htmlFor="name" className="font-semibold">Full name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          required
        />
        <span className="field-error">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Please tell us your name.
        </span>
      </div>

      <div className={`field flex flex-col gap-1.5 ${errors.email ? "has-error" : ""}`}>
        <label htmlFor="email" className="font-semibold">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          required
        />
        <span className="field-error">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Please enter a valid email address.
        </span>
      </div>

      <div className="field flex flex-col gap-1.5">
        <label htmlFor="subject" className="font-semibold">What&apos;s this about?</label>
        <select
          id="subject"
          name="subject"
          value={values.subject}
          onChange={(e) => update("subject", e.target.value)}
        >
          <option value="General enquiry">General enquiry</option>
          <option value="Story tip">Story tip</option>
          <option value="Write for us">Write for us</option>
          <option value="Advertising">Advertising</option>
          <option value="Careers">Careers</option>
        </select>
      </div>

      <div className={`field flex flex-col gap-1.5 ${errors.message ? "has-error" : ""}`}>
        <label htmlFor="message" className="font-semibold">Message</label>
        <textarea
          id="message"
          name="message"
          rows={6}
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          required
        />
        <span className="field-error">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Please add a message.
        </span>
      </div>

      {status === "error" && (
        <p className="text-sm font-semibold text-red-600" role="alert">{errorMsg}</p>
      )}

      <button type="submit" disabled={status === "loading"} className="btn btn-primary w-fit">
        {status === "loading" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}