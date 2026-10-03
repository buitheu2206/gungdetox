import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
await page.goto("http://localhost:4321/nhuong-quyen", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const img = page.locator(".package-overview-img");
await img.scrollIntoViewIfNeeded();
await page.screenshot({ path: ".verify/nhuong-quyen-img.png" });
await browser.close();
