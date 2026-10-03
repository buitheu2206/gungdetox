import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
await page.goto("http://localhost:4321/admin/san-pham", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.evaluate(() => {
  document.getElementById("admin-login-form")?.setAttribute("hidden", "");
  document.getElementById("admin-content")?.removeAttribute("hidden");
});

const testImgPath = path.resolve(".verify/test-upload.png");
await page.setInputFiles("#f-image", testImgPath);
await page.waitForTimeout(200);
const box = await page.locator("#main-image-preview img").boundingBox();
console.log("main preview image box:", box);

await page.setInputFiles("#f-gallery", [testImgPath]);
await page.waitForTimeout(200);
const galleryBox = await page.locator(".gallery-thumb-wrap.pending").first().boundingBox();
console.log("gallery pending thumb box:", galleryBox);

await browser.close();
