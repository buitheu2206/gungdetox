import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1100, height: 900 });
await page.goto("http://localhost:4321/blog/DETOX%20NG%C3%80Y%205%20CHAI", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.screenshot({ path: ".verify/blog-post-fixed.png", fullPage: true });
await browser.close();
