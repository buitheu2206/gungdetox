import { chromium } from "playwright";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
page.on("console", (m) => { if (m.type() === "error") console.log("CONSOLE ERROR:", m.text()); });
page.on("dialog", async (d) => { if (d.type() === "confirm") await d.accept(); else await d.dismiss(); });

await page.goto("http://localhost:4322/admin/san-pham", { waitUntil: "domcontentloaded" });
const alreadyIn = await page.waitForSelector("#admin-content:not([hidden])", { timeout: 3000 }).then(() => true).catch(() => false);
if (!alreadyIn) {
  await page.fill('#admin-login-form input[name="email"]', "buitheu698@gmail.com");
  await page.fill('#admin-login-form input[name="password"]', "Buitheu698@");
  await page.click('#admin-login-form button[type="submit"]');
  await page.waitForSelector("#admin-content:not([hidden])", { timeout: 10000 });
}
await page.waitForSelector("#products-body tr");

await page.fill("#f-slug", "test-gallery-product2");
await page.fill("#f-name", "Test Gallery Product 2");
await page.selectOption("#f-type", "single");
await page.fill("#f-price-retail", "10000");
await page.setInputFiles("#f-gallery", [
  path.resolve("public/images/products/bia-gung.webp"),
  path.resolve("public/images/products/kombucha.webp"),
]);
await page.click("button.save-btn");
await page.waitForFunction(() => document.querySelector("#products-body")?.textContent?.includes("Test Gallery Product 2"), { timeout: 15000 });

let { data } = await supabase.from("products").select("*").eq("slug", "test-gallery-product2").single();
console.log("After first save, gallery_images:", data.gallery_images);

const row = page.locator("tr", { hasText: "Test Gallery Product 2" });
await row.locator(".edit-btn").click();
await page.waitForTimeout(300);
console.log("edit-id value after clicking edit:", await page.$eval("#edit-id", (el) => el.value));
console.log("previews shown:", await page.$$eval(".gallery-thumb-wrap", (els) => els.length));

await page.click(".remove-gallery-img");
console.log("previews after clicking remove (client-side only, before save):", await page.$$eval(".gallery-thumb-wrap", (els) => els.length));

// check file input state right before save
const fileCountBeforeSave = await page.$eval("#f-gallery", (el) => el.files.length);
console.log("f-gallery file input .files.length right before 2nd save:", fileCountBeforeSave);

await page.click("button.save-btn");
await page.waitForTimeout(1000);

const { data: data2 } = await supabase.from("products").select("*").eq("slug", "test-gallery-product2").single();
console.log("After second save (post-removal), gallery_images in DB:", data2.gallery_images);

// cleanup
await supabase.from("products").delete().eq("slug", "test-gallery-product2");
console.log("cleaned up");
await browser.close();
