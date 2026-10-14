// List abandoned root-level editor uploads; deletion requires --delete and a maintenance window.
import { createClient } from "@supabase/supabase-js";
import { CONTENT_IMAGE_BUCKETS } from "../src/lib/content-images.ts";
import { loadAllRows } from "../src/lib/load-rows.ts";

const MIN_AGE_MS = 24 * 60 * 60 * 1000;
const deleteFiles = process.argv.includes("--delete");

async function referencedUrls(client, table) {
  const rows = await loadAllRows((from, to) => client.from(table)
    .select("image_url, gallery_images").order("id").range(from, to));
  return new Set(rows.flatMap((row) => [row.image_url, ...(row.gallery_images ?? [])]).filter(Boolean));
}

async function auditBucket(client, table, bucket) {
  const storage = client.storage.from(bucket);
  const files = await loadAllRows((from, to) => storage.list("", {
    limit: to - from + 1, offset: from, sortBy: { column: "name", order: "asc" },
  }));
  let references = await referencedUrls(client, table);
  for (const file of files) {
    if (!file.id || !Number.isFinite(Date.parse(file.created_at)) || Date.now() - Date.parse(file.created_at) < MIN_AGE_MS) continue;
    const url = storage.getPublicUrl(file.name).data.publicUrl;
    if (references.has(url)) continue;
    if (deleteFiles) {
      // Recheck DB references immediately before removal; do not run while editors are saving.
      references = await referencedUrls(client, table);
      if (references.has(url)) continue;
      const { error } = await storage.remove([file.name]);
      if (error) throw new Error(`Cannot remove ${bucket}/${file.name}: ${error.message}`);
    }
    console.info(JSON.stringify({ bucket, path: file.name, action: deleteFiles ? "deleted" : "candidate" }));
  }
}

try {
  const url = process.env.PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Set PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for the intended project.");
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  for (const [table, bucket] of Object.entries(CONTENT_IMAGE_BUCKETS)) await auditBucket(client, table, bucket);
} catch (error) {
  console.error("Image cleanup failed. No further files will be processed.", error);
  process.exitCode = 1;
}
