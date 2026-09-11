import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const envText = readFileSync(new URL("../.env", import.meta.url), "utf-8");
const env = {};
for (const line of envText.split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}

const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY);

const { data: products, error } = await supabase.from("products").select("*").order("category");
if (error) { console.log("ERR", error); process.exit(1); }
console.log("=== PRODUCTS (" + products.length + ") ===");
for (const p of products) {
  const missing = [];
  if (!p.image_url) missing.push("image_url");
  if (!p.gallery_images || p.gallery_images.length === 0) missing.push("gallery_images");
  if (!p.description) missing.push("description");
  if (missing.length) console.log(p.slug, "(" + p.category + ")", "-> MISSING:", missing.join(", "));
}

const { data: posts } = await supabase.from("posts").select("*");
console.log("=== POSTS (" + (posts?.length || 0) + ") ===");
for (const b of posts || []) {
  const missing = [];
  if (!b.image_url) missing.push("image_url");
  if (!b.body) missing.push("body");
  if (missing.length) console.log(b.slug, "-> MISSING:", missing.join(", "));
}
