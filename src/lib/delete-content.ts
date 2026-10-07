// Delete admin content first, then remove its uploaded thumbnail and gallery images.
import type { SupabaseClient } from "@supabase/supabase-js";

const imageBuckets = {
  products: "product-images",
  posts: "post-images",
} as const;

function getImagePaths(publicUrl: string, imageUrls: (string | null)[]): string[] {
  const bucketUrl = new URL(publicUrl);
  const paths: string[] = [];
  for (const imageUrl of imageUrls) {
    if (!imageUrl?.startsWith(publicUrl)) continue;
    const url = new URL(imageUrl);
    if (!url.pathname.startsWith(bucketUrl.pathname)) continue;
    paths.push(decodeURIComponent(url.pathname.slice(bucketUrl.pathname.length)));
  }
  return [...new Set(paths.filter(Boolean))];
}

export async function deleteContentWithImages(
  client: SupabaseClient,
  table: keyof typeof imageBuckets,
  id: string,
): Promise<string | null> {
  if (!id) throw new Error("Thiếu ID nội dung cần xoá. Hãy tải lại danh sách.");

  // Returning the deleted row avoids stale form data and prevents cleanup when RLS blocks deletion.
  const { data, error } = await client
    .from(table)
    .delete()
    .eq("id", id)
    .select("image_url, gallery_images")
    .single();
  if (error) throw new Error(`Không thể xoá ${table} (${id}): ${error.message}`);

  const bucket = imageBuckets[table];
  let paths: string[] = [];
  try {
    const storage = client.storage.from(bucket);
    paths = getImagePaths(storage.getPublicUrl("").data.publicUrl, [
      data.image_url, ...(data.gallery_images ?? []),
    ]);
    if (!paths.length) return null;

    const { error: storageError } = await storage.remove(paths);
    if (storageError) throw storageError;
    return null;
  } catch (error) {
    console.error("Không thể dọn ảnh sau khi xoá nội dung", { table, id, bucket, paths, error });
    const reason = error instanceof Error ? error.message : String(error);
    return `Đã xoá nội dung nhưng chưa dọn xong ảnh trong bucket ${bucket}: ${reason}. Hãy kiểm tra và xoá các ảnh còn lại trong Supabase Storage.`;
  }
}
