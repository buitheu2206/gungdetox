import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1400 } });
await page.goto("http://localhost:4321/san-pham/ginger-shot", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.screenshot({ path: ".verify/product-detail-check.png", fullPage: true });
await browser.close();
