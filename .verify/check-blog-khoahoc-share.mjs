import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1100, height: 900 });

// blog listing
await page.goto("http://localhost:4321/blog", { waitUntil: "networkidle" });
await page.waitForSelector(".blog-card .share-fb-btn");
await page.screenshot({ path: ".verify/blog-list-with-share.png" });

const btn = page.locator(".blog-card .share-fb-btn").first();
await btn.click();
await page.waitForTimeout(200);
await page.screenshot({ path: ".verify/blog-list-share-open.png" });
const url = await page.locator("#share-url-input").inputValue();
console.log("blog card share url:", url);
await page.click(".share-modal-close");

// khoa-hoc page
await page.goto("http://localhost:4321/khoa-hoc", { waitUntil: "networkidle" });
await page.waitForSelector(".share-trigger");
await page.screenshot({ path: ".verify/khoahoc-hero-share.png" });
await page.click(".share-trigger");
await page.waitForTimeout(200);
const khUrl = await page.locator("#share-url-input").inputValue();
console.log("khoa-hoc share url:", khUrl);

await browser.close();
