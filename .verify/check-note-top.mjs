import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
await page.goto("http://localhost:4321/dat-hang", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await page.screenshot({ path: ".verify/note-top.png" });
await browser.close();
