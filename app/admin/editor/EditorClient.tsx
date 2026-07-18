"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { saveArticleAction } from "../actions";
import { CATEGORIES, initials, formatDate, getArtUrl, extractYouTubeId, BodyBlock } from "@/lib/data";
import { BodyBlockRenderer } from "@/components/RichText";

const ART_OPTIONS = [
  { value: "procurement", label: "Procurement" },
  { value: "logistics", label: "Logistics" },
  { value: "policy", label: "Policy" },
  { value: "awards", label: "Awards" },
  { value: "technology", label: "Technology" },
  { value: "leadership", label: "Leadership" },
  { value: "featured", label: "Featured" },
];

interface Article {
  id?: string;
  category: string;
  art: string;
  title: string;
  excerpt: string;
  author: string;
  role: string;
  date?: string;
  readTime: string;
  dateline: string;
  featured: boolean;
  tags: string[];
  body: BodyBlock[];
  status: "published" | "draft" | "archived";
}

interface FormState {
  title: string;
  excerpt: string;
  author: string;
  role: string;
  dateline: string;
  category: string;
  art: string;
  readTime: string;
  tags: string;
  body: BodyBlock[];
  status: "published" | "draft" | "archived";
  featured: boolean;
}

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
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
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

// Wraps the current selection in a textarea with the given markers.
// If nothing is selected, inserts placeholder text between the markers instead.
function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  placeholder: string
): string {
  const { selectionStart, selectionEnd, value } = textarea;
  const selected = value.slice(selectionStart, selectionEnd) || placeholder;
  return value.slice(0, selectionStart) + before + selected + after + value.slice(selectionEnd);
}

function ParagraphToolbar({
  textareaRef,
  onApply,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onApply: (newText: string) => void;
}) {
  function format(before: string, after: string, placeholder: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    onApply(wrapSelection(ta, before, after, placeholder));
    ta.focus();
  }

  function formatLink() {
    const ta = textareaRef.current;
    if (!ta) return;
    const url = window.prompt("Link URL:");
    if (!url) return;
    const { selectionStart, selectionEnd, value } = ta;
    const label = value.slice(selectionStart, selectionEnd) || "link text";
    const next = value.slice(0, selectionStart) + `[${label}](${url})` + value.slice(selectionEnd);
    onApply(next);
    ta.focus();
  }

  const btnClass =
    "flex h-6 w-6 items-center justify-center rounded text-[0.68rem] font-bold text-[#6B7280] hover:bg-white/5 hover:text-white transition";

  return (
    <div className="mb-1 flex gap-1">
      <button type="button" onClick={() => format("**", "**", "bold text")} className={btnClass} title="Bold">
        B
      </button>
      <button type="button" onClick={() => format("*", "*", "italic text")} className={`${btnClass} italic`} title="Italic">
        I
      </button>
      <button type="button" onClick={() => format("__", "__", "underlined text")} className={`${btnClass} underline`} title="Underline">
        U
      </button>
      <button type="button" onClick={formatLink} className={btnClass} title="Link">
        🔗
      </button>
    </div>
  );
}

export default function EditorClient({
  initialArticle,
  mediaItems,
  userRole,
  userName,
}: {
  initialArticle: Article | null;
  mediaItems: { filename: string; url: string }[];
  userRole: string;
  userName: string;
}) {
  const router = useRouter();

  const DEFAULT_FORM: FormState = {
    title: initialArticle?.title || "",
    excerpt: initialArticle?.excerpt || "",
    author: initialArticle?.author || (userRole === "writer" ? userName : ""),
    role: initialArticle?.role || "",
    dateline: initialArticle?.dateline || "",
    category: initialArticle?.category || CATEGORIES[0]?.name || "Procurement",
    art: initialArticle?.art || "procurement",
    readTime: initialArticle?.readTime || "5 min read",
    tags: initialArticle?.tags ? initialArticle.tags.join(", ") : "",
    body: initialArticle?.body && initialArticle.body.length
      ? initialArticle.body
      : [{ type: "paragraph", text: "" }],
    status: initialArticle?.status || "draft",
    featured: initialArticle?.featured || false,
  };

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  const isCustomImage = form.art.startsWith("/") || form.art.startsWith("http");
  const [imageTab, setImageTab] = useState<"standard" | "custom">(isCustomImage ? "custom" : "standard");
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Separate picker/upload state for inline body images (vs the cover image above)
  const [showBodyImagePicker, setShowBodyImagePicker] = useState(false);
  const [bodyImageUploading, setBodyImageUploading] = useState(false);
  const [showVideoPrompt, setShowVideoPrompt] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState("");

  const textareaRefs = useRef<Record<number, HTMLTextAreaElement | null>>({});

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  function addParagraph() {
    setForm((f) => ({ ...f, body: [...f.body, { type: "paragraph", text: "" }] }));
  }

  function addImageBlock(url: string) {
    setForm((f) => ({ ...f, body: [...f.body, { type: "image", url, caption: "" }] }));
  }

  function addVideoBlock(youtubeId: string) {
    setForm((f) => ({ ...f, body: [...f.body, { type: "video", youtubeId, caption: "" }] }));
  }

  function updateBlock(idx: number, updates: Partial<BodyBlock>) {
    setForm((f) => {
      const body = [...f.body];
      body[idx] = { ...body[idx], ...updates } as BodyBlock;
      return { ...f, body };
    });
  }

  function removeBlock(idx: number) {
    setForm((f) => ({ ...f, body: f.body.filter((_, i) => i !== idx) }));
  }

  function moveBlock(idx: number, dir: -1 | 1) {
    setForm((f) => {
      const body = [...f.body];
      const swap = idx + dir;
      if (swap < 0 || swap >= body.length) return f;
      [body[idx], body[swap]] = [body[swap], body[idx]];
      return { ...f, body };
    });
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/media/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.success) {
        set("art", data.media.url);
      } else {
        alert(data.error || "File upload failed.");
      }
    } catch {
      alert("Error uploading file.");
    } finally {
      setUploading(false);
    }
  }

  async function handleBodyImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBodyImageUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/media/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.success) {
        addImageBlock(data.media.url);
      } else {
        alert(data.error || "File upload failed.");
      }
    } catch {
      alert("Error uploading file.");
    } finally {
      setBodyImageUploading(false);
    }
  }

  function handleAddVideo() {
    const id = extractYouTubeId(videoUrlInput);
    if (!id) {
      alert("Couldn't recognize that as a YouTube URL or video ID.");
      return;
    }
    addVideoBlock(id);
    setVideoUrlInput("");
    setShowVideoPrompt(false);
  }

  async function handleSave(status: "published" | "draft" | "archived") {
    setSaveState("saving");
    setErrorMessage(null);
    try {
      const cleanedBody = form.body.filter(
        (b) => b.type !== "paragraph" || b.text.trim().length > 0
      );

      const res = await saveArticleAction({
        id: initialArticle?.id,
        category: form.category,
        art: form.art,
        title: form.title || "Untitled",
        excerpt: form.excerpt,
        author: form.author || userName,
        role: form.role,
        dateline: form.dateline,
        readTime: form.readTime,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        body: cleanedBody,
        status,
        featured: form.featured,
      });

      if (res.success && res.id) {
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2000);
        if (!initialArticle?.id) {
          router.replace(`/admin/editor?id=${res.id}`);
        }
      } else {
        setErrorMessage(res.error || "Failed to save article.");
        setSaveState("error");
      }
    } catch {
      setErrorMessage("An unexpected server error occurred.");
      setSaveState("error");
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const tagsList = form.tags.split(",").map((t) => t.trim()).filter(Boolean);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Editor toolbar */}
      <div className="flex flex-none flex-wrap items-center justify-between gap-3 border-b border-white/8 bg-[#0B0E1A]/85 px-5 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[0.68rem] uppercase tracking-wider text-[#4B5563]">
            {initialArticle?.id ? "Editing story" : "New story"}
          </span>
          {initialArticle?.id && (
            <span className="font-mono text-[0.65rem] text-[#374151] truncate max-w-[200px]">{initialArticle.id}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreview((v) => !v)}
            className="flex h-8 items-center gap-2 rounded-lg border border-white/8 px-3 font-mono text-[0.7rem] text-[#6B7280] transition hover:border-white/20 hover:text-white lg:hidden"
          >
            {preview ? "← Edit" : "Preview →"}
          </button>

          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value as any)}
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
            {saveState === "saving" ? "Saving..." : saveState === "saved" ? "✓ Saved" : "Publish"}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mx-6 mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400 font-mono">
          {errorMessage}
        </div>
      )}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left: form editor */}
        <div className={`flex flex-col overflow-y-auto border-r border-white/8 ${preview ? "hidden lg:flex" : "flex"} w-full lg:w-1/2`}>
          <div className="flex flex-col gap-5 p-5 lg:p-6">
            {/* Metadata section */}
            <div className="rounded-xl border border-white/8 bg-[#111827] p-4">
              <h2 className="mb-4 font-mono text-[0.68rem] uppercase tracking-wider text-[#4B5563]">
                Metadata
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <Label>Title</Label>
                  <Textarea value={form.title} onChange={(v) => set("title", v)} rows={2} placeholder="Article headline..." />
                </Field>
                <Field>
                  <Label>Excerpt</Label>
                  <Textarea value={form.excerpt} onChange={(v) => set("excerpt", v)} rows={2} placeholder="Short summary shown in cards..." />
                </Field>
                {userRole !== "writer" && (
                  <Field>
                    <Label>Author</Label>
                    <Input value={form.author} onChange={(v) => set("author", v)} placeholder="Ngozi Adeyemi" />
                  </Field>
                )}
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

                <div className="col-span-1 sm:col-span-2 rounded-lg border border-white/5 bg-[#0D1117] p-3 flex flex-col gap-3">
                  <div className="flex gap-2 border-b border-white/5 pb-2">
                    <button
                      type="button"
                      onClick={() => setImageTab("standard")}
                      className={`px-3 py-1 font-mono text-[0.62rem] uppercase tracking-wider rounded ${
                        imageTab === "standard" ? "bg-white/10 text-white" : "text-[#4B5563] hover:text-white"
                      }`}
                    >
                      Default Illustration
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageTab("custom")}
                      className={`px-3 py-1 font-mono text-[0.62rem] uppercase tracking-wider rounded ${
                        imageTab === "custom" ? "bg-white/10 text-white" : "text-[#4B5563] hover:text-white"
                      }`}
                    >
                      Custom Picture
                    </button>
                  </div>

                  {imageTab === "standard" ? (
                    <Field>
                      <Label>Standard Vector</Label>
                      <select
                        value={isCustomImage ? "procurement" : form.art}
                        onChange={(e) => set("art", e.target.value)}
                        className="rounded-lg border border-white/8 bg-[#111827] px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        {ART_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </Field>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={form.art}
                          onChange={(e) => set("art", e.target.value)}
                          placeholder="Paste image URL (e.g. /uploads/image.jpg)"
                          className="flex-1 rounded-lg border border-white/8 bg-[#111827] px-3 py-2 text-xs text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowMediaPicker(true)}
                          className="px-3 rounded-lg border border-white/10 bg-white/5 font-mono text-[0.65rem] text-white hover:bg-white/10"
                        >
                          Pick Asset
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          id="editor-file-upload"
                          className="hidden"
                          onChange={handleUpload}
                          disabled={uploading}
                        />
                        <label
                          htmlFor="editor-file-upload"
                          className="cursor-pointer rounded-lg border border-dashed border-white/10 bg-white/3 px-3 py-2 font-mono text-[0.62rem] text-[#6B7280] hover:text-white"
                        >
                          {uploading ? "Uploading..." : "Upload New File"}
                        </label>
                        {isCustomImage && (
                          <span className="text-[0.62rem] text-green-400 font-mono">
                            Selected: {form.art.split("/").pop()}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Field>
                  <Label>Tags (comma-separated)</Label>
                  <Input value={form.tags} onChange={(v) => set("tags", v)} placeholder="AfCFTA, Customs, Digitisation" />
                </Field>
                {userRole !== "writer" && (
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
                )}
              </div>
            </div>

            {/* Body blocks */}
            <div className="rounded-xl border border-white/8 bg-[#111827] p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-mono text-[0.68rem] uppercase tracking-wider text-[#4B5563]">
                  Story Body ({form.body.length} block{form.body.length !== 1 ? "s" : ""})
                </h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addParagraph}
                    className="flex items-center gap-1.5 rounded-lg border border-white/8 px-3 py-1.5 font-mono text-[0.68rem] text-[#6B7280] transition hover:border-white/20 hover:text-white"
                  >
                    + Paragraph
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBodyImagePicker(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-white/8 px-3 py-1.5 font-mono text-[0.68rem] text-[#6B7280] transition hover:border-white/20 hover:text-white"
                  >
                    + Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVideoPrompt(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-white/8 px-3 py-1.5 font-mono text-[0.68rem] text-[#6B7280] transition hover:border-white/20 hover:text-white"
                  >
                    + Video
                  </button>
                </div>
              </div>

              {showVideoPrompt && (
                <div className="mb-3 flex gap-2 rounded-lg border border-white/8 bg-[#0D1117] p-3">
                  <input
                    type="text"
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    placeholder="Paste YouTube URL..."
                    className="flex-1 rounded border border-white/8 bg-[#111827] px-2.5 py-1.5 text-xs text-white placeholder-[#374151] focus:outline-none"
                  />
                  <button type="button" onClick={handleAddVideo} className="rounded bg-[#E2231A] px-3 py-1.5 font-mono text-[0.65rem] font-semibold text-white">
                    Add
                  </button>
                  <button type="button" onClick={() => setShowVideoPrompt(false)} className="rounded border border-white/8 px-3 py-1.5 font-mono text-[0.65rem] text-[#6B7280]">
                    Cancel
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {form.body.map((block, idx) => (
                  <div key={idx} className="group flex gap-2">
                    <div className="flex flex-col gap-1 pt-2">
                      <button type="button" onClick={() => moveBlock(idx, -1)} disabled={idx === 0} className="flex h-5 w-5 items-center justify-center rounded text-[#374151] hover:text-white disabled:opacity-20 transition" title="Move up">
                        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><polyline points="18 15 12 9 6 15" /></svg>
                      </button>
                      <span className="flex h-5 w-5 items-center justify-center font-mono text-[0.58rem] text-[#374151]">{idx + 1}</span>
                      <button type="button" onClick={() => moveBlock(idx, 1)} disabled={idx === form.body.length - 1} className="flex h-5 w-5 items-center justify-center rounded text-[#374151] hover:text-white disabled:opacity-20 transition" title="Move down">
                        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
                      </button>
                    </div>

                    <div className="min-w-0 flex-1">
                      {block.type === "paragraph" ? (
                        <>
                          <ParagraphToolbar
                            textareaRef={{ current: textareaRefs.current[idx] || null }}
                            onApply={(newText) => updateBlock(idx, { text: newText })}
                          />
                          <textarea
                            ref={(el) => { textareaRefs.current[idx] = el; }}
                            value={block.text}
                            onChange={(e) => updateBlock(idx, { text: e.target.value })}
                            rows={3}
                            placeholder={idx === 0 ? "Lead paragraph..." : "Paragraph..."}
                            className="w-full resize-y rounded-lg border border-white/8 bg-[#0D1117] px-3 py-2 text-sm leading-relaxed text-white placeholder-[#374151] focus:border-white/25 focus:outline-none transition"
                          />
                        </>
                      ) : block.type === "image" ? (
                        <div className="flex flex-col gap-2 rounded-lg border border-white/8 bg-[#0D1117] p-3">
                          <div className="relative aspect-video w-full overflow-hidden rounded bg-black/40">
                            <Image src={block.url} alt="" fill className="object-cover" />
                          </div>
                          <input
                            type="text"
                            value={block.caption || ""}
                            onChange={(e) => updateBlock(idx, { caption: e.target.value })}
                            placeholder="Optional caption..."
                            className="rounded border border-white/8 bg-[#111827] px-2.5 py-1.5 text-xs text-white placeholder-[#374151] focus:outline-none"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 rounded-lg border border-white/8 bg-[#0D1117] p-3">
                          <div className="relative aspect-video w-full overflow-hidden rounded bg-black">
                            <iframe
                              src={`https://www.youtube.com/embed/${block.youtubeId}`}
                              title="Video preview"
                              className="absolute inset-0 h-full w-full"
                              allowFullScreen
                            />
                          </div>
                          <input
                            type="text"
                            value={block.caption || ""}
                            onChange={(e) => updateBlock(idx, { caption: e.target.value })}
                            placeholder="Optional caption..."
                            className="rounded border border-white/8 bg-[#111827] px-2.5 py-1.5 text-xs text-white placeholder-[#374151] focus:outline-none"
                          />
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeBlock(idx)}
                      disabled={form.body.length <= 1}
                      className="mt-2 flex h-6 w-6 flex-none items-center justify-center rounded text-[#374151] transition hover:text-red-400 disabled:opacity-20"
                      title="Remove block"
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
        <div className={`${preview ? "flex" : "hidden lg:flex"} w-full flex-col overflow-y-auto bg-[#F6F7FB] lg:w-1/2`}>
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
              <div className="font-body text-ink-900" style={{ fontFamily: "Georgia, serif" }}>
                <div className="mb-4 flex items-center gap-2">
                  <span
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 2,
                      border: "1px solid #E2231A", background: "#FDEBEA", color: "#E2231A",
                      fontFamily: "monospace", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                      textTransform: "uppercase", padding: "3px 8px",
                    }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#E2231A", display: "inline-block" }} />
                    {form.dateline || "ACCRA"} &middot; {form.category}
                  </span>
                </div>

                <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, lineHeight: 1.2, color: "#0B0E1A", marginBottom: 12 }}>
                  {form.title || "Your article title will appear here"}
                </h1>

                <p style={{ fontSize: 16, color: "#5B5F72", lineHeight: 1.6, marginBottom: 16 }}>
                  {form.excerpt || "Your article excerpt will appear here."}
                </p>

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

                <div style={{ position: "relative", aspectRatio: "21/9", background: "#0C1F8F", borderRadius: 8, overflow: "hidden", marginBottom: 24 }}>
                  <Image src={getArtUrl(form.art)} alt="" fill style={{ objectFit: "cover" }} />
                </div>

                {form.body.length === 0 ? (
                  <p style={{ color: "#9296A6", fontStyle: "italic", fontSize: 14 }}>
                    Your story content will appear here...
                  </p>
                ) : (
                  <BodyBlockRenderer blocks={form.body} variant="preview" />
                )}

                {tagsList.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 20, paddingTop: 16, borderTop: "1px solid #E2E5EE" }}>
                    {tagsList.map((t) => (
                      <span key={t} style={{ background: "#EEF0F7", borderRadius: 999, padding: "4px 10px", fontFamily: "monospace", fontSize: 10, color: "#333749" }}>
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cover Image Picker Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/8 bg-[#0B0E1A] overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center border-b border-white/8 p-4">
              <h3 className="font-mono text-sm font-semibold text-white">Select Custom Image</h3>
              <button type="button" onClick={() => setShowMediaPicker(false)} className="text-[#6B7280] hover:text-white">Close</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {mediaItems.length === 0 ? (
                <div className="py-20 text-center font-mono text-[#4B5563] text-xs">No images in Media Library yet. Upload one from the Media tab.</div>
              ) : (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {mediaItems.map((item) => (
                    <button key={item.url} type="button" onClick={() => { set("art", item.url); setShowMediaPicker(false); }} className="group relative aspect-square w-full rounded-xl overflow-hidden bg-black/40 border border-white/5 transition hover:border-[#E2231A]/50">
                      <Image src={item.url} alt={item.filename} fill sizes="10vw" className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <span className="font-mono text-[0.58rem] text-white bg-black/60 px-2 py-1 rounded">Select</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inline Body Image Picker Modal */}
      {showBodyImagePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/8 bg-[#0B0E1A] overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center border-b border-white/8 p-4">
              <h3 className="font-mono text-sm font-semibold text-white">Insert Image Into Story</h3>
              <button type="button" onClick={() => setShowBodyImagePicker(false)} className="text-[#6B7280] hover:text-white">Close</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-4 flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  id="body-image-upload"
                  className="hidden"
                  onChange={(e) => { handleBodyImageUpload(e); setShowBodyImagePicker(false); }}
                  disabled={bodyImageUploading}
                />
                <label htmlFor="body-image-upload" className="cursor-pointer rounded-lg border border-dashed border-white/10 bg-white/3 px-3 py-2 font-mono text-[0.62rem] text-[#6B7280] hover:text-white">
                  {bodyImageUploading ? "Uploading..." : "Upload New File"}
                </label>
              </div>
              {mediaItems.length === 0 ? (
                <div className="py-20 text-center font-mono text-[#4B5563] text-xs">No images in Media Library yet.</div>
              ) : (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {mediaItems.map((item) => (
                    <button key={item.url} type="button" onClick={() => { addImageBlock(item.url); setShowBodyImagePicker(false); }} className="group relative aspect-square w-full rounded-xl overflow-hidden bg-black/40 border border-white/5 transition hover:border-[#E2231A]/50">
                      <Image src={item.url} alt={item.filename} fill sizes="10vw" className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <span className="font-mono text-[0.58rem] text-white bg-black/60 px-2 py-1 rounded">Insert</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}