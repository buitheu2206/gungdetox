// Keep upload and deletion mapped to the same storage bucket.
import type { SupabaseClient } from "@supabase/supabase-js";

export const CONTENT_IMAGE_BUCKETS = {
  products: "product-images",
  posts: "post-images",
} as const;

async function uploadImage(client: SupabaseClient, bucket: string, file: File, label: string) {
  try {
    const storage = client.storage.from(bucket);
    const path = `${Date.now()}-${file.name}`;
    const { error } = await storage.upload(path, file);
    if (error) throw error;
    return storage.getPublicUrl(path).data.publicUrl;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`${label}: ${reason}`);
  }
}

export async function uploadContentImages(
  client: SupabaseClient,
  table: keyof typeof CONTENT_IMAGE_BUCKETS,
  images: { currentUrl: string | null; mainFile?: File; galleryFiles: File[]; galleryUrls: string[] },
) {
  const bucket = CONTENT_IMAGE_BUCKETS[table];
  const imageUrl = images.mainFile
    ? await uploadImage(client, bucket, images.mainFile, "Lỗi tải ảnh")
    : images.currentUrl;
  // Preserve successful uploads in the form state if a later upload fails.
  for (const file of images.galleryFiles) {
    images.galleryUrls.push(await uploadImage(client, bucket, file, "Lỗi tải ảnh phụ"));
  }
  return imageUrl;
}
