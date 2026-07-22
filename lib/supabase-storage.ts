import { createClient } from "@supabase/supabase-js";

// Service role client — server-side only, never expose to the browser.
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || "https://dummy.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy",
  { auth: { persistSession: false } }
);

export const MEDIA_BUCKET = "media";

export async function uploadToStorage(file: File, filename: string) {
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from(MEDIA_BUCKET)
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabaseAdmin.storage.from(MEDIA_BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

export async function deleteFromStorage(filename: string) {
  const { error } = await supabaseAdmin.storage.from(MEDIA_BUCKET).remove([filename]);
  if (error) throw error;
}