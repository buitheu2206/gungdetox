import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
await page.goto("http://localhost:4321/nhuong-quyen", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
const cta = page.locator(".franchise-cta");
await cta.scrollIntoViewIfNeeded();
await page.screenshot({ path: ".verify/nq-cta.png" });
await browser.close();
