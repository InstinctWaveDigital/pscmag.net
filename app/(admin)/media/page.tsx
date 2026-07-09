import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import MediaClient from "./MediaClient";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/admin/login");
  }

  // Fetch uploaded media
  const res = await query("SELECT id, filename, filepath, size, mime_type, created_at FROM media ORDER BY created_at DESC");
  const media = res.rows.map((row) => ({
    id: row.id,
    filename: row.filename,
    url: row.filepath,
    size: row.size,
    mimeType: row.mime_type,
    createdAt: row.created_at,
  }));

  return (
    <div className="p-6 xl:p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Media Library</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Upload custom pictures and illustrations to use across stories.
        </p>
      </div>

      <MediaClient initialMedia={media} />
    </div>
  );
}
