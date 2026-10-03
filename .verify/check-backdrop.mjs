import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 900, height: 600 });
await page.goto("http://localhost:4321/dat-hang", { waitUntil: "networkidle" });
await page.click("#lookup-trigger");
await page.waitForTimeout(200);
await page.screenshot({ path: ".verify/backdrop-fix.png" });
await browser.close();
