import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
await page.goto("http://localhost:4321/admin/san-pham", { waitUntil: "networkidle" });
await page.waitForTimeout(500);

// Bypass login gate purely to test the client-side preview UI (no Supabase auth needed for this part)
await page.evaluate(() => {
  document.getElementById("admin-login-form")?.setAttribute("hidden", "");
  document.getElementById("admin-content")?.removeAttribute("hidden");
});

// prepare a tiny test image file to upload
const testImgPath = path.resolve(".verify/test-upload.png");
if (!fs.existsSync(testImgPath)) {
  // 1x1 red png
  const base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
  fs.writeFileSync(testImgPath, Buffer.from(base64, "base64"));
}

await page.setInputFiles("#f-image", testImgPath);
await page.waitForTimeout(200);
const mainPreviewHtml = await page.locator("#main-image-preview").innerHTML();
console.log("main image preview html:", mainPreviewHtml.slice(0, 100));

await page.setInputFiles("#f-gallery", [testImgPath, testImgPath]);
await page.waitForTimeout(200);
const galleryThumbCount = await page.locator(".gallery-thumb-wrap.pending").count();
console.log("pending gallery thumb count:", galleryThumbCount);

// remove one pending thumb
await page.locator(".remove-pending-img").first().click();
await page.waitForTimeout(200);
const galleryThumbCountAfter = await page.locator(".gallery-thumb-wrap.pending").count();
console.log("pending gallery thumb count after removing 1:", galleryThumbCountAfter);

await page.screenshot({ path: ".verify/admin-image-preview.png" });
await browser.close();
