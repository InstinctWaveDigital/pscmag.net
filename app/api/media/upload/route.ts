import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

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

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Sanitize and guarantee a unique filename
    const cleanFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFilename = `${Date.now()}-${cleanFilename}`;
    const filepath = path.join(uploadsDir, uniqueFilename);

    // Save to disk
    await fs.writeFile(filepath, buffer);

    const relativeUrl = `/uploads/${uniqueFilename}`;
    const mediaId = crypto.randomUUID();

    // Register in PostgreSQL
    await query(
      "INSERT INTO media (id, filename, filepath, size, mime_type, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        mediaId,
        file.name,
        relativeUrl,
        file.size,
        file.type,
        new Date().toISOString(),
      ]
    );

    return NextResponse.json({
      success: true,
      media: {
        id: mediaId,
        filename: file.name,
        url: relativeUrl,
        size: file.size,
        mimeType: file.type,
      },
    });
  } catch (err: any) {
    console.error("Media upload handler error:", err);
    return NextResponse.json({ error: "Media upload failed." }, { status: 500 });
  }
}
