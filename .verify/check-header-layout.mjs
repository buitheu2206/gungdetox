import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage();

await page.setViewportSize({ width: 1200, height: 500 });
await page.goto("http://localhost:4321/dat-hang", { waitUntil: "networkidle" });
await page.screenshot({ path: ".verify/header-desktop.png" });

await page.setViewportSize({ width: 390, height: 700 });
await page.screenshot({ path: ".verify/header-mobile.png" });

await browser.close();
