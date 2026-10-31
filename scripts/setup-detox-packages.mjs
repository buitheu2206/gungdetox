// Save only the four Detox packages; requires an authorized Supabase service key.
// Preview: node --experimental-strip-types scripts/setup-detox-packages.mjs --dry-run
// Save: node --env-file=.env --experimental-strip-types scripts/setup-detox-packages.mjs
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { getDetoxPackageProducts } from "../src/lib/detox-packages.ts";

const products = getDetoxPackageProducts();

try {
  assert.equal(new Set(products.map((product) => product.slug)).size, products.length);
  assert.ok(products.every((product) => Number.isInteger(product.price) && product.price > 0));
  if (process.argv.includes("--dry-run")) {
    console.log(JSON.stringify(products, null, 2));
  } else {
    const url = process.env.PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) throw new Error("Set PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before saving Detox packages.");
    const client = createClient(url, serviceKey);
    const { data, error } = await client.from("products").upsert(products, { onConflict: "slug" }).select("slug, price");
    if (error) throw error;
    assert.equal(data.length, products.length, "All Detox packages must be saved.");
    console.log("Saved Detox packages:", data);
  }
} catch (error) {
  console.error("Could not set up Detox packages:", error);
  process.exitCode = 1;
}
