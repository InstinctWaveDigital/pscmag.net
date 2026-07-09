"use client";

import { useState } from "react";
import Image from "next/image";
import { deleteMediaAction } from "../actions";

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export default function MediaClient({ initialMedia }: { initialMedia: MediaItem[] }) {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  function displayMessage(type: "error" | "success", msg: string) {
    if (type === "error") {
      setError(msg);
      setSuccess(null);
    } else {
      setSuccess(msg);
      setError(null);
    }
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 3000);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        displayMessage("success", "Media uploaded successfully.");
        setMedia([data.media, ...media]);
      } else {
        displayMessage("error", data.error || "Upload failed.");
      }
    } catch {
      displayMessage("error", "An unexpected error occurred during upload.");
    } finally {
      setUploading(false);
      e.target.value = ""; // Reset
    }
  }

  async function handleDelete(id: string, filename: string) {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;

    try {
      const res = await deleteMediaAction(id);
      if (res.success) {
        displayMessage("success", "Media item deleted.");
        setMedia(media.filter((item) => item.id !== id));
      } else {
        displayMessage("error", res.error || "Failed to delete item.");
      }
    } catch {
      displayMessage("error", "An unexpected error occurred.");
    }
  }

  function copyToClipboard(url: string) {
    navigator.clipboard.writeText(url);
    displayMessage("success", "Copied image URL to clipboard!");
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Upload Zone */}
      <div className="rounded-xl border border-dashed border-white/15 bg-[#111827] p-8 text-center transition hover:border-[#E2231A]/30">
        <input
          type="file"
          id="media-file-input"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
        <label
          htmlFor="media-file-input"
          className="flex flex-col items-center justify-center cursor-pointer gap-2"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-[#6B7280]">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white">
            {uploading ? "Uploading media file..." : "Select custom picture file"}
          </span>
          <span className="font-mono text-[0.62rem] text-[#4B5563] uppercase tracking-wider">
            Supports JPEG, PNG, WEBP, SVG (Max 5MB)
          </span>
        </label>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400 font-mono">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-xs text-green-400 font-mono">
          {success}
        </div>
      )}

      {/* Media Grid */}
      {media.length === 0 ? (
        <div className="rounded-xl border border-white/8 bg-[#111827] py-20 text-center font-mono text-sm text-[#374151]">
          No custom uploads in media library yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {media.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-white/8 bg-[#111827] transition hover:border-white/15"
            >
              <div className="relative aspect-square w-full bg-black/40">
                <Image
                  src={item.url}
                  alt={item.filename}
                  fill
                  sizes="15vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-col gap-1.5 p-3">
                <div className="truncate text-xs font-semibold text-white" title={item.filename}>
                  {item.filename}
                </div>
                <div className="font-mono text-[0.62rem] text-[#6B7280]">
                  {formatBytes(item.size)}
                </div>

                <div className="mt-2 flex gap-1.5">
                  <button
                    onClick={() => copyToClipboard(item.url)}
                    className="flex-1 rounded border border-white/8 bg-white/3 py-1 font-mono text-[0.58rem] text-white hover:bg-white/6"
                  >
                    Copy Link
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.filename)}
                    className="rounded border border-white/8 bg-white/3 p-1 text-[#6B7280] hover:border-red-500/20 hover:text-red-400 hover:bg-red-500/10"
                    title="Delete permanently"
                  >
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
