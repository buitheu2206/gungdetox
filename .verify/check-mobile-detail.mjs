import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

await page.goto("http://localhost:4322/blog/kombucha-loi-khuan-tu-dau", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const hOverflowBlog = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
await page.screenshot({ path: ".verify/mobile-blog-detail.png", fullPage: true });
console.log("blog detail horizontal overflow:", hOverflowBlog);

await page.goto("http://localhost:4322/san-pham/ginger-shot", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const hOverflowProduct = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
await page.screenshot({ path: ".verify/mobile-product-detail.png", fullPage: true });
console.log("product detail horizontal overflow:", hOverflowProduct);

await browser.close();
