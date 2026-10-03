import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto("http://localhost:4321/nhuong-quyen", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
console.log(await page.evaluate(() => document.body.innerText));
await browser.close();
