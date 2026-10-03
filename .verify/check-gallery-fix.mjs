import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto("http://localhost:4321/san-pham/ginger-shot", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
const thumbCount = await page.locator("#gallery-thumbs .thumb").count();
console.log("thumb count:", thumbCount);
await page.screenshot({ path: ".verify/gallery-fix-check.png" });
await browser.close();
