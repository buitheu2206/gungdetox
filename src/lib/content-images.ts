// Keep upload and deletion mapped to the same storage bucket.
import type { SupabaseClient } from "@supabase/supabase-js";

const uploadPaths = new WeakMap<File, string>();

export const CONTENT_IMAGE_BUCKETS = {
  products: "product-images",
  posts: "post-images",
} as const;

async function uploadImage(client: SupabaseClient, bucket: string, file: File, label: string) {
  try {
    const storage = client.storage.from(bucket);
    const path = uploadPaths.get(file) ?? `${crypto.randomUUID()}-${file.name}`;
    uploadPaths.set(file, path);
    const { error } = await storage.upload(path, file);
    if (error) {
      // A response can be lost after storage accepted the file. Reuse the same path on retry.
      const { data: existing, error: checkError } = await storage.info(path);
      if (checkError || !existing) throw error;
    }
    return storage.getPublicUrl(path).data.publicUrl;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`${label}: ${reason}`, { cause: error });
  }
}

export async function uploadContentImages(
  client: SupabaseClient,
  table: keyof typeof CONTENT_IMAGE_BUCKETS,
  images: { currentUrl: string | null; mainFile?: File; galleryFiles: File[]; galleryUrls: string[]; uploadedFiles: Map<File, string> },
) {
  const bucket = CONTENT_IMAGE_BUCKETS[table];
  async function uploadOnce(file: File, label: string) {
    const saved = images.uploadedFiles.get(file);
    if (saved) return saved;
    const url = await uploadImage(client, bucket, file, label);
    images.uploadedFiles.set(file, url);
    return url;
  }
  const imageUrl = images.mainFile
    ? await uploadOnce(images.mainFile, "Lỗi tải ảnh")
    : images.currentUrl;
  const newUrls: string[] = [];
  for (const file of images.galleryFiles) newUrls.push(await uploadOnce(file, "Lỗi tải ảnh phụ"));
  // Do not mutate editor state before the DB save: removed pending files must stay removed after a failed save.
  return { imageUrl, galleryUrls: [...new Set([...images.galleryUrls, ...newUrls])] };
}
