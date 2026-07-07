"use client";

import { Suspense } from "react";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useCMS, type CMSStatus } from "@/lib/cms-store";
import { CATEGORIES, initials, formatDate, type ArticleArt } from "@/lib/data";

const ART_OPTIONS: { value: ArticleArt; label: string }[] = [
  { value: "procurement", label: "Procurement" },
  { value: "logistics", label: "Logistics" },
  { value: "policy", label: "Policy" },
  { value: "awards", label: "Awards" },
  { value: "technology", label: "Technology" },
  { value: "leadership", label: "Leadership" },
  { value: "featured", label: "Featured" },
];

interface FormState {
  title: string;
  excerpt: string;
  author: string;
  role: string;
  dateline: string;
  category: string;
  art: ArticleArt;
  readTime: string;
  tags: string;
  body: string[];
  status: CMSStatus;
  featured: boolean;
}

const DEFAULT_FORM: FormState = {
  title: "",
  excerpt: "",
  author: "",
  role: "",
  dateline: "",
  category: CATEGORIES[0]?.name ?? "Procurement",
  art: "procurement",
  readTime: "5 min read",
  tags: "",
  body: [""],
  status: "draft",
  featured: false,
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block font-mono text-[0.68rem] uppercase tracking-wider text-[#6B7280]">
      {children}
    </span>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col">{children}</div>;
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="rounded-lg border border-white/8 bg-[#0D1117] px-3 py-2 text-sm text-white placeholder-[#374151] focus:border-white/25 focus:outline-none transition"
    />
  );
}

function Textarea({
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="resize-y rounded-lg border border-white/8 bg-[#0D1117] px-3 py-2 text-sm leading-relaxed text-white placeholder-[#374151] focus:border-white/25 focus:outline-none transition"
    />
  );
}

/* ─── Live Article Preview ─── */
function ArticlePreview({ form }: { form: FormState }) {
  const today = new Date().toISOString().slice(0, 10);
  const tags = form.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div className="font-body text-ink-900" style={{ fontFamily: "Georgia, serif" }}>
      {/* Category label */}
      <div className="mb-4 flex items-center gap-2">
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            borderRadius: 2,
            border: "1px solid #E2231A",
            background: "#FDEBEA",
            color: "#E2231A",
            fontFamily: "monospace",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "3px 8px",
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#E2231A", display: "inline-block" }} />
          {form.dateline || "ACCRA"} · {form.category}
        </span>
      </div>

      {/* Title */}
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, lineHeight: 1.2, color: "#0B0E1A", marginBottom: 12 }}>
        {form.title || "Your article title will appear here"}
      </h1>

      {/* Excerpt */}
      <p style={{ fontSize: 16, color: "#5B5F72", lineHeight: 1.6, marginBottom: 16 }}>
        {form.excerpt || "Your article excerpt will appear here."}
      </p>

      {/* Author row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid #E2E5EE", borderBottom: "1px solid #E2E5EE", padding: "12px 0", marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#0C1F8F", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 13, fontFamily: "monospace", flexShrink: 0 }}>
          {form.author ? initials(form.author) : "AU"}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0B0E1A" }}>{form.author || "Author Name"}</div>
          <div style={{ fontSize: 11, color: "#9296A6", fontFamily: "monospace" }}>{form.role || "Correspondent"}</div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right", fontFamily: "monospace", fontSize: 11, color: "#9296A6" }}>
          <div>{formatDate(today)}</div>
          <div>{form.readTime}</div>
        </div>
      </div>

      {/* Hero illustration */}
      <div style={{ position: "relative", aspectRatio: "21/9", background: "#0C1F8F", borderRadius: 8, overflow: "hidden", marginBottom: 24 }}>
        <Image
          src={`/images/${form.art}.svg`}
          alt=""
          fill
          style={{ objectFit: "cover" }}
        />
      </div>

      {/* Body */}
      {form.body.filter(Boolean).length === 0 ? (
        <p style={{ color: "#9296A6", fontStyle: "italic", fontSize: 14 }}>
          Your story paragraphs will appear here…
        </p>
      ) : (
        form.body
          .filter(Boolean)
          .map((para, i) => (
            <p
              key={i}
              style={{
                fontFamily: "Georgia, serif",
                fontSize: i === 0 ? 17 : 15,
                lineHeight: 1.75,
                color: i === 0 ? "#0B0E1A" : "#333749",
                marginBottom: 16,
                fontWeight: i === 0 ? 600 : 400,
              }}
            >
              {i === 0 && (
                <span
                  style={{
                    float: "left",
                    fontSize: 52,
                    fontWeight: 900,
                    lineHeight: 0.85,
                    marginRight: 8,
                    color: "#E2231A",
                  }}
                >
                  {para[0]}
                </span>
              )}
              {i === 0 ? para.slice(1) : para}
            </p>
          ))
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 20, paddingTop: 16, borderTop: "1px solid #E2E5EE" }}>
          {tags.map((t) => (
            <span key={t} style={{ background: "#EEF0F7", borderRadius: 999, padding: "4px 10px", fontFamily: "monospace", fontSize: 10, color: "#333749" }}>
              #{t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main Editor Component ─── */
function EditorInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("id");
  const { articles, hydrated, create, update } = useCMS();

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [preview, setPreview] = useState(false);

  // Load existing article when editing
  useEffect(() => {
    if (!hydrated) return;
    if (editId) {
      const existing = articles.find((a) => a.id === editId);
      if (existing) {
        setForm({
          title: existing.title,
          excerpt: existing.excerpt,
          author: existing.author,
          role: existing.role,
          dateline: existing.dateline,
          category: existing.category,
          art: existing.art,
          readTime: existing.readTime,
          tags: existing.tags.join(", "),
          body: existing.body.length ? existing.body : [""],
          status: existing.status,
          featured: existing.featured ?? false,
        });
      }
    }
  }, [hydrated, editId, articles]);

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  function addParagraph() {
    setForm((f) => ({ ...f, body: [...f.body, ""] }));
  }

  function updateParagraph(idx: number, value: string) {
    setForm((f) => {
      const body = [...f.body];
      body[idx] = value;
      return { ...f, body };
    });
  }

  function removeParagraph(idx: number) {
    setForm((f) => ({ ...f, body: f.body.filter((_, i) => i !== idx) }));
  }

  function moveParagraph(idx: number, dir: -1 | 1) {
    setForm((f) => {
      const body = [...f.body];
      const swap = idx + dir;
      if (swap < 0 || swap >= body.length) return f;
      [body[idx], body[swap]] = [body[swap], body[idx]];
      return { ...f, body };
    });
  }

  async function handleSave(status: CMSStatus) {
    setSaveState("saving");
    try {
      const payload = {
        title: form.title || "Untitled",
        excerpt: form.excerpt,
        author: form.author || "Editorial Desk",
        role: form.role || "APSC Mag",
        dateline: form.dateline || "LAGOS",
        category: form.category,
        art: form.art,
        readTime: form.readTime,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        body: form.body.filter(Boolean),
        status,
        featured: form.featured,
        date: new Date().toISOString().slice(0, 10),
      };

      if (editId) {
        update(editId, payload);
      } else {
        const newId = create(payload);
        router.replace(`/admin/editor?id=${newId}`);
      }

      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  }

  if (!hydrated) {
    return (
      <div className="flex h-full items-center justify-center text-[#4B5563] font-mono text-sm">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Editor toolbar */}
      <div className="flex flex-none flex-wrap items-center justify-between gap-3 border-b border-white/8 bg-[#0B0E1A]/80 px-5 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[0.68rem] uppercase tracking-wider text-[#4B5563]">
            {editId ? "Editing story" : "New story"}
          </span>
          {editId && (
            <span className="font-mono text-[0.65rem] text-[#374151] truncate max-w-[200px]">{editId}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Preview toggle (mobile) */}
          <button
            type="button"
            onClick={() => setPreview((v) => !v)}
            className="flex h-8 items-center gap-2 rounded-lg border border-white/8 px-3 font-mono text-[0.7rem] text-[#6B7280] transition hover:border-white/20 hover:text-white lg:hidden"
          >
            {preview ? "← Edit" : "Preview →"}
          </button>

          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value as CMSStatus)}
            className="h-8 rounded-lg border border-white/8 bg-[#111827] px-2 font-mono text-[0.7rem] text-[#6B7280] focus:outline-none"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>

          <button
            type="button"
            onClick={() => handleSave("draft")}
            disabled={saveState === "saving"}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-white/8 px-3 font-mono text-[0.7rem] text-[#6B7280] transition hover:border-white/20 hover:text-white disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave("published")}
            disabled={saveState === "saving"}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-[#E2231A] px-3.5 font-mono text-[0.7rem] font-semibold text-white transition hover:bg-[#B81B14] active:scale-95 disabled:opacity-50"
          >
            {saveState === "saving" ? "Saving…" : saveState === "saved" ? "✓ Saved" : "Publish"}
          </button>
        </div>
      </div>

      {/* Two-panel body */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left: form editor */}
        <div
          className={`flex flex-col overflow-y-auto border-r border-white/8 ${
            preview ? "hidden lg:flex" : "flex"
          } w-full lg:w-1/2`}
        >
          <div className="flex flex-col gap-5 p-5 lg:p-6">
            {/* Metadata section */}
            <div className="rounded-xl border border-white/8 bg-[#111827] p-4">
              <h2 className="mb-4 font-mono text-[0.68rem] uppercase tracking-wider text-[#4B5563]">
                Metadata
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <Label>Title</Label>
                  <Textarea value={form.title} onChange={(v) => set("title", v)} rows={2} placeholder="Article headline…" />
                </Field>
                <Field>
                  <Label>Excerpt</Label>
                  <Textarea value={form.excerpt} onChange={(v) => set("excerpt", v)} rows={2} placeholder="Short summary shown in cards…" />
                </Field>
                <Field>
                  <Label>Author</Label>
                  <Input value={form.author} onChange={(v) => set("author", v)} placeholder="Ngozi Adeyemi" />
                </Field>
                <Field>
                  <Label>Role</Label>
                  <Input value={form.role} onChange={(v) => set("role", v)} placeholder="Trade Policy Editor" />
                </Field>
                <Field>
                  <Label>Dateline</Label>
                  <Input value={form.dateline} onChange={(v) => set("dateline", v)} placeholder="ABUJA" />
                </Field>
                <Field>
                  <Label>Read Time</Label>
                  <Input value={form.readTime} onChange={(v) => set("readTime", v)} placeholder="7 min read" />
                </Field>
                <Field>
                  <Label>Category</Label>
                  <select
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                    className="rounded-lg border border-white/8 bg-[#0D1117] px-3 py-2 text-sm text-white focus:border-white/25 focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </Field>
                <Field>
                  <Label>Illustration</Label>
                  <select
                    value={form.art}
                    onChange={(e) => set("art", e.target.value as ArticleArt)}
                    className="rounded-lg border border-white/8 bg-[#0D1117] px-3 py-2 text-sm text-white focus:border-white/25 focus:outline-none"
                  >
                    {ART_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </Field>
                <Field>
                  <Label>Tags (comma-separated)</Label>
                  <Input value={form.tags} onChange={(v) => set("tags", v)} placeholder="AfCFTA, Customs, Digitisation" />
                </Field>
                <Field>
                  <Label>Options</Label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-[#6B7280]">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => set("featured", e.target.checked)}
                      className="accent-[#E2231A]"
                    />
                    Mark as featured story
                  </label>
                </Field>
              </div>
            </div>

            {/* Body paragraphs */}
            <div className="rounded-xl border border-white/8 bg-[#111827] p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-mono text-[0.68rem] uppercase tracking-wider text-[#4B5563]">
                  Story Body ({form.body.filter(Boolean).length} paragraph{form.body.filter(Boolean).length !== 1 ? "s" : ""})
                </h2>
                <button
                  type="button"
                  onClick={addParagraph}
                  className="flex items-center gap-1.5 rounded-lg border border-white/8 px-3 py-1.5 font-mono text-[0.68rem] text-[#6B7280] transition hover:border-white/20 hover:text-white"
                >
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Paragraph
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {form.body.map((para, idx) => (
                  <div key={idx} className="group flex gap-2">
                    <div className="flex flex-col gap-1 pt-2">
                      <button
                        type="button"
                        onClick={() => moveParagraph(idx, -1)}
                        disabled={idx === 0}
                        className="flex h-5 w-5 items-center justify-center rounded text-[#374151] hover:text-white disabled:opacity-20 transition"
                        title="Move up"
                      >
                        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><polyline points="18 15 12 9 6 15" /></svg>
                      </button>
                      <span className="flex h-5 w-5 items-center justify-center font-mono text-[0.58rem] text-[#374151]">
                        {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => moveParagraph(idx, 1)}
                        disabled={idx === form.body.length - 1}
                        className="flex h-5 w-5 items-center justify-center rounded text-[#374151] hover:text-white disabled:opacity-20 transition"
                        title="Move down"
                      >
                        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
                      </button>
                    </div>
                    <div className="min-w-0 flex-1">
                      <textarea
                        value={para}
                        onChange={(e) => updateParagraph(idx, e.target.value)}
                        rows={3}
                        placeholder={idx === 0 ? "Lead paragraph (will have drop cap in preview)…" : `Paragraph ${idx + 1}…`}
                        className="w-full resize-y rounded-lg border border-white/8 bg-[#0D1117] px-3 py-2 text-sm leading-relaxed text-white placeholder-[#374151] focus:border-white/25 focus:outline-none transition"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeParagraph(idx)}
                      disabled={form.body.length <= 1}
                      className="mt-2 flex h-6 w-6 flex-none items-center justify-center rounded text-[#374151] transition hover:text-red-400 disabled:opacity-20"
                      title="Remove paragraph"
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: live preview */}
        <div
          className={`${
            preview ? "flex" : "hidden lg:flex"
          } w-full flex-col overflow-y-auto bg-[#F6F7FB] lg:w-1/2`}
        >
          {/* Preview header */}
          <div className="flex flex-none items-center justify-between border-b border-[#E2E5EE] bg-white px-6 py-3">
            <span className="font-mono text-[0.68rem] uppercase tracking-wider text-[#9296A6]">
              Live Preview
            </span>
            <div className="flex gap-2">
              <span className="h-3 w-3 rounded-full bg-[#E2E5EE]" />
              <span className="h-3 w-3 rounded-full bg-[#E2E5EE]" />
              <span className="h-3 w-3 rounded-full bg-[#E2E5EE]" />
            </div>
          </div>
          <div className="flex-1 p-6 xl:p-8">
            <div className="mx-auto max-w-[640px] rounded-xl bg-white p-6 shadow-sm">
              <ArticlePreview form={form} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center text-[#4B5563] font-mono text-sm">
          Loading editor…
        </div>
      }
    >
      <EditorInner />
    </Suspense>
  );
}
