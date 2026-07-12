import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { uploadToStorage, deleteFromStorage } from "@/lib/supabase-storage";
import crypto from "crypto";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use JPEG, PNG, or WEBP." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File exceeds 5MB limit." }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const cleanBase = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .slice(0, 60);
    const storageFilename = `${Date.now()}-${cleanBase}.${ext}`;

    let publicUrl: string;
    try {
      publicUrl = await uploadToStorage(file, storageFilename);
    } catch (uploadErr) {
      console.error("Storage upload error:", uploadErr);
      return NextResponse.json({ error: "Failed to store file." }, { status: 500 });
    }

    const mediaId = crypto.randomUUID();

    try {
      await query(
        "INSERT INTO media (id, filename, filepath, size, mime_type, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
        [mediaId, file.name, publicUrl, file.size, file.type, new Date().toISOString()]
      );
    } catch (dbErr) {
      // Roll back the uploaded file so we don't orphan it
      await deleteFromStorage(storageFilename).catch((cleanupErr) =>
        console.error("Cleanup after failed insert also failed:", cleanupErr)
      );
      console.error("Media DB insert error:", dbErr);
      return NextResponse.json({ error: "Failed to save media record." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      media: {
        id: mediaId,
        filename: file.name,
        url: publicUrl,
        size: file.size,
        mimeType: file.type,
      },
    });
  } catch (err) {
    console.error("Media upload handler error:", err);
    return NextResponse.json({ error: "Media upload failed." }, { status: 500 });
  }
}