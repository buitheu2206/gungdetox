import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 500, height: 300 });
await page.goto("http://localhost:4321/dat-hang", { waitUntil: "networkidle" });
const el = await page.locator("#product-select");
await el.screenshot({ path: ".verify/select-arrow.png" });
await browser.close();
