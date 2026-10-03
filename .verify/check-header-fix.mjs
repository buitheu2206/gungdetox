import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1165, height: 500 });
await page.goto("http://localhost:4321/dat-hang", { waitUntil: "networkidle" });
await page.screenshot({ path: ".verify/header-fix.png" });
await browser.close();
