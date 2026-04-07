import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "product-images";

export async function uploadProductImage(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<{ url: string } | { error: string }> {
  if (!file.type.startsWith("image/")) return { error: "Archivo invalido." };
  if (file.size > 2 * 1024 * 1024) return { error: "La imagen supera 2MB." };

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (upErr) return { error: upErr.message };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}
